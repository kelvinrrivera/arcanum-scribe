#!/usr/bin/env tsx

console.log('🧪 Probando importación del servicio de limpieza...');

try {
  // Probar importación del servicio
  const { logCleanupService } = await import('../server/log-cleanup-service.ts');
  
  console.log('✅ Importación exitosa del LogCleanupService');
  console.log('✅ Servicio disponible:', typeof logCleanupService);
  
  // Probar que tiene los métodos esperados
  const methods = ['startCleanupScheduler', 'stopCleanupScheduler', 'performCleanup', 'manualCleanup', 'getLogStats'];
  
  for (const method of methods) {
    if (typeof logCleanupService[method] === 'function') {
      console.log(`✅ Método ${method}: disponible`);
    } else {
      console.log(`❌ Método ${method}: NO disponible`);
    }
  }
  
  console.log('\n🎉 Servicio de limpieza importado correctamente');
  console.log('🔄 El servidor debería arrancar sin problemas ahora');
  
} catch (error) {
  console.error('❌ Error importando servicio:', error);
  console.log('\n🔍 Verificando imports...');
  
  try {
    // Probar importación de query
    const { query } = await import('../src/integrations/postgres/client');
    console.log('✅ Import de query: OK');
  } catch (queryError) {
    console.error('❌ Error importando query:', queryError);
  }
}

export {};