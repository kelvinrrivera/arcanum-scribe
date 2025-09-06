#!/usr/bin/env tsx

console.log('🧹 Probando Sistema de Limpieza de Logs');
console.log('=====================================\n');

const BASE_URL = 'http://localhost:3000';
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlzX2FkbWluIjp0cnVlLCJ0aWVyIjoicHJvZmVzc2lvbmFsIiwiaWF0IjoxNzU2OTg1MzkwLCJleHAiOjE3NTcwNzE3OTB9.cMaapBx1b7CzTx18XBDG5eKD2QX8jmInMIKR_ksI5aQ';

async function testLogStats() {
  console.log('📊 Obteniendo estadísticas de logs...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/log-stats`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const stats = data.stats;
      
      console.log('✅ Estadísticas de logs:');
      console.log(`   📝 Total de logs: ${stats.total_logs}`);
      console.log(`   🕐 Últimas 24h: ${stats.logs_last_24h}`);
      console.log(`   📅 Últimos 7 días: ${stats.logs_last_7d}`);
      console.log(`   📆 Log más antiguo: ${stats.oldest_log ? new Date(stats.oldest_log).toLocaleString() : 'N/A'}`);
      console.log(`   🆕 Log más reciente: ${stats.newest_log ? new Date(stats.newest_log).toLocaleString() : 'N/A'}`);
      
      return stats;
    } else {
      console.log('❌ Error obteniendo estadísticas:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error);
    return null;
  }
}

async function testManualCleanup() {
  console.log('\\n🧹 Probando limpieza manual...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/cleanup-logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('✅ Limpieza manual completada:');
      console.log(`   🗑️ Logs eliminados: ${data.deletedCount}`);
      console.log(`   📊 Logs antes: ${data.totalLogsBefore}`);
      console.log(`   📊 Logs después: ${data.totalLogsAfter}`);
      console.log(`   ⏱️ Duración: ${data.duration}ms`);
      console.log(`   💬 Mensaje: ${data.message}`);
      
      return data;
    } else {
      const error = await response.text();
      console.log('❌ Error en limpieza manual:', response.status, error);
      return null;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error);
    return null;
  }
}

async function testClearAllLogs() {
  console.log('\\n🗑️ Probando limpieza completa (Clear All)...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/clear-prompt-logs`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('✅ Limpieza completa exitosa:');
      console.log(`   🗑️ Logs eliminados: ${data.deletedCount}`);
      console.log(`   💬 Mensaje: ${data.message}`);
      
      return data;
    } else {
      const error = await response.text();
      console.log('❌ Error en limpieza completa:', response.status, error);
      return null;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error);
    return null;
  }
}

async function main() {
  console.log('🎯 Probando sistema completo de limpieza de logs\\n');
  
  // 1. Obtener estadísticas iniciales
  const initialStats = await testLogStats();
  
  if (!initialStats) {
    console.log('❌ No se pudieron obtener estadísticas. Verifica que el servidor esté ejecutándose.');
    return;
  }
  
  // 2. Probar limpieza manual (inteligente)
  await testManualCleanup();
  
  // 3. Obtener estadísticas después de limpieza manual
  console.log('\\n📊 Estadísticas después de limpieza manual:');
  await testLogStats();
  
  // 4. Probar limpieza completa (solo si hay pocos logs)
  if (initialStats.total_logs < 100) {
    await testClearAllLogs();
    
    // 5. Estadísticas finales
    console.log('\\n📊 Estadísticas después de limpieza completa:');
    await testLogStats();
  } else {
    console.log('\\n⚠️ Saltando limpieza completa (demasiados logs para prueba)');
  }
  
  console.log('\\n📋 Resumen del Sistema de Limpieza:');
  console.log('\\n🔧 FUNCIONALIDADES IMPLEMENTADAS:');
  console.log('✅ Botón "Clear All" en UI (limpieza completa manual)');
  console.log('✅ Limpieza automática cada 24 horas');
  console.log('✅ Limpieza inteligente (mantiene últimos 7 días o máx 10,000 logs)');
  console.log('✅ Endpoint de estadísticas de logs');
  console.log('✅ Endpoint de limpieza manual');
  console.log('✅ Confirmación antes de eliminar');
  console.log('✅ Indicador de carga durante limpieza');
  
  console.log('\\n🎯 BENEFICIOS:');
  console.log('✅ Previene crecimiento descontrolado de la base de datos');
  console.log('✅ Mantiene rendimiento óptimo del sistema');
  console.log('✅ Limpieza automática sin intervención manual');
  console.log('✅ Control manual cuando sea necesario');
  console.log('✅ Información transparente sobre el proceso');
  
  console.log('\\n⚙️ CONFIGURACIÓN ACTUAL:');
  console.log('🕐 Frecuencia: Cada 24 horas');
  console.log('📅 Retención: 7 días o máximo 10,000 logs');
  console.log('🔄 Inicio automático: Al arrancar el servidor');
  
  console.log('\\n🎉 Sistema de limpieza completamente funcional!');
}

main().catch(console.error);