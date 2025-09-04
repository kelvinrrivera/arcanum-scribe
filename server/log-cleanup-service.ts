import { query } from '../src/integrations/postgres/client';

export class LogCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas
  private readonly MAX_LOGS_TO_KEEP = 10000; // Mantener máximo 10,000 logs
  private readonly DAYS_TO_KEEP = 7; // Mantener logs de los últimos 7 días

  constructor() {
    this.startCleanupScheduler();
  }

  /**
   * Inicia el programador de limpieza automática
   */
  startCleanupScheduler() {
    console.log('🧹 Iniciando servicio de limpieza automática de logs...');
    
    // Ejecutar limpieza inmediatamente al iniciar
    this.performCleanup();
    
    // Programar limpieza cada 24 horas
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL_MS);
    
    console.log(`✅ Limpieza automática programada cada ${this.CLEANUP_INTERVAL_MS / 1000 / 60 / 60} horas`);
  }

  /**
   * Detiene el programador de limpieza
   */
  stopCleanupScheduler() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Servicio de limpieza automática detenido');
    }
  }

  /**
   * Ejecuta la limpieza de logs
   */
  async performCleanup() {
    try {
      console.log('🧹 Iniciando limpieza automática de logs...');
      
      const startTime = Date.now();
      
      // Obtener estadísticas antes de la limpieza
      const { rows: beforeStats } = await query('SELECT COUNT(*) as count FROM prompt_logs');
      const totalLogsBefore = parseInt(beforeStats[0].count);
      
      console.log(`📊 Logs actuales: ${totalLogsBefore}`);
      
      if (totalLogsBefore === 0) {
        console.log('✅ No hay logs para limpiar');
        return { deletedCount: 0, totalLogsBefore, totalLogsAfter: 0 };
      }

      let deletedCount = 0;

      // Estrategia 1: Eliminar logs antiguos (más de X días)
      const { rows: oldLogsResult } = await query(`
        DELETE FROM prompt_logs 
        WHERE created_at < NOW() - INTERVAL '${this.DAYS_TO_KEEP} days'
        RETURNING id
      `);
      
      const oldLogsDeleted = oldLogsResult.length;
      deletedCount += oldLogsDeleted;
      
      if (oldLogsDeleted > 0) {
        console.log(`🗑️ Eliminados ${oldLogsDeleted} logs antiguos (>${this.DAYS_TO_KEEP} días)`);
      }

      // Estrategia 2: Si aún hay demasiados logs, eliminar los más antiguos
      const { rows: currentStats } = await query('SELECT COUNT(*) as count FROM prompt_logs');
      const currentLogCount = parseInt(currentStats[0].count);
      
      if (currentLogCount > this.MAX_LOGS_TO_KEEP) {
        const excessLogs = currentLogCount - this.MAX_LOGS_TO_KEEP;
        
        const { rows: excessResult } = await query(`
          DELETE FROM prompt_logs 
          WHERE id IN (
            SELECT id FROM prompt_logs 
            ORDER BY created_at ASC 
            LIMIT $1
          )
          RETURNING id
        `, [excessLogs]);
        
        const excessDeleted = excessResult.length;
        deletedCount += excessDeleted;
        
        if (excessDeleted > 0) {
          console.log(`🗑️ Eliminados ${excessDeleted} logs adicionales (límite de ${this.MAX_LOGS_TO_KEEP})`);
        }
      }

      // Obtener estadísticas después de la limpieza
      const { rows: afterStats } = await query('SELECT COUNT(*) as count FROM prompt_logs');
      const totalLogsAfter = parseInt(afterStats[0].count);
      
      const duration = Date.now() - startTime;
      
      if (deletedCount > 0) {
        console.log(`✅ Limpieza completada en ${duration}ms:`);
        console.log(`   • Logs eliminados: ${deletedCount}`);
        console.log(`   • Logs antes: ${totalLogsBefore}`);
        console.log(`   • Logs después: ${totalLogsAfter}`);
        console.log(`   • Espacio liberado: ${((deletedCount / totalLogsBefore) * 100).toFixed(1)}%`);
      } else {
        console.log(`✅ Limpieza completada - no se eliminaron logs (${totalLogsAfter} logs actuales)`);
      }

      return {
        deletedCount,
        totalLogsBefore,
        totalLogsAfter,
        duration
      };

    } catch (error) {
      console.error('❌ Error durante la limpieza automática:', error);
      throw error;
    }
  }

  /**
   * Ejecuta limpieza manual (para uso desde endpoints)
   */
  async manualCleanup() {
    console.log('🧹 Ejecutando limpieza manual de logs...');
    return await this.performCleanup();
  }

  /**
   * Obtiene estadísticas de logs
   */
  async getLogStats() {
    try {
      const { rows: stats } = await query(`
        SELECT 
          COUNT(*) as total_logs,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as logs_last_24h,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as logs_last_7d,
          MIN(created_at) as oldest_log,
          MAX(created_at) as newest_log
        FROM prompt_logs
      `);
      
      return stats[0];
    } catch (error) {
      console.error('Error getting log stats:', error);
      throw error;
    }
  }
}

// Instancia singleton del servicio
export const logCleanupService = new LogCleanupService();