#!/usr/bin/env tsx

console.log('🔗 Probando Fix de URL de Fal.ai');
console.log('===============================\n');

const BASE_URL = 'http://localhost:3000';
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlzX2FkbWluIjp0cnVlLCJ0aWVyIjoicHJvZmVzc2lvbmFsIiwiaWF0IjoxNzU2OTg1MzkwLCJleHAiOjE3NTcwNzE3OTB9.cMaapBx1b7CzTx18XBDG5eKD2QX8jmInMIKR_ksI5aQ';

async function testFalUrlFix() {
  console.log('🖼️ Probando Test de Fal.ai con URL corregida...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/test-fal-model`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model_name: 'flux/schnell'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta del Test Fal.ai:');
      console.log(`   Éxito: ${data.success}`);
      console.log(`   Modelo: ${data.model_name}`);
      
      if (data.success) {
        console.log(`   Resultado: ${data.test_result}`);
        console.log(`   Tiempo: ${data.response_time}ms`);
        if (data.image_url) {
          console.log(`   Imagen generada: ${data.image_url}`);
        }
        console.log('🎉 ¡URL de Fal.ai funcionando correctamente!');
        console.log('🎯 Las aventuras ahora deberían generar imágenes');
      } else {
        console.log(`   Error: ${data.error}`);
        
        if (data.error.includes('Application') && data.error.includes('fal-ai') && data.error.includes('not found')) {
          console.log('❌ Aún hay problema con la URL - necesita más corrección');
        } else if (data.error.includes('404')) {
          console.log('❌ Error 404 - puede ser problema de modelo o endpoint');
        } else if (data.error.includes('401') || data.error.includes('403')) {
          console.log('❌ Error de autenticación - verificar API key');
        } else {
          console.log('⚠️ Error diferente - puede ser problema de red o parámetros');
        }
      }
    } else {
      const error = await response.text();
      console.log('❌ Error HTTP:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error);
  }
}

async function testDifferentModels() {
  console.log('\\n🧪 Probando diferentes modelos de Fal.ai...');
  
  const modelsToTest = [
    'flux/schnell',
    'flux/dev', 
    'fast-sdxl'
  ];
  
  for (const model of modelsToTest) {
    console.log(`\\n🔍 Probando modelo: ${model}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/admin/test-fal-model`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_name: model
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`   ✅ ${model}: ÉXITO (${data.response_time}ms)`);
        } else {
          console.log(`   ❌ ${model}: ${data.error}`);
        }
      } else {
        console.log(`   ❌ ${model}: HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${model}: Error de conexión`);
    }
    
    // Pequeña pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function main() {
  await testFalUrlFix();
  await testDifferentModels();
  
  console.log('\\n📋 Resumen del Fix de URL:');
  console.log('\\n🔧 CAMBIOS REALIZADOS:');
  console.log('✅ server/index.ts: https://fal.run/fal-ai/${model} → https://fal.run/${model}');
  console.log('✅ server/llm-service.ts: Todas las URLs corregidas');
  console.log('✅ Eliminado el prefijo /fal-ai/ incorrecto');
  
  console.log('\\n🎯 PROGRESO:');
  console.log('✅ API Key: FUNCIONANDO (ya no dice "not configured")');
  console.log('🔄 URL: CORRIGIENDO (eliminando error 404 "fal-ai not found")');
  
  console.log('\\n⚠️ PRÓXIMOS PASOS:');
  console.log('🔄 Si aún hay errores 404:');
  console.log('   • Verificar nombres exactos de modelos en Fal.ai');
  console.log('   • Probar con modelos más simples como "fast-sdxl"');
  console.log('   • Revisar documentación de Fal.ai para URLs correctas');
  
  console.log('\\n🎮 PRUEBA FINAL:');
  console.log('   Una vez que los tests pasen, generar una aventura');
  console.log('   para verificar que las imágenes se generen correctamente.');
}

main().catch(console.error);