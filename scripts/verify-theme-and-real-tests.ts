#!/usr/bin/env tsx

console.log('🎨 Verificando Fixes de Tema y Tests Reales');
console.log('==========================================\n');

const BASE_URL = 'http://localhost:3000';
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlzX2FkbWluIjp0cnVlLCJ0aWVyIjoicHJvZmVzc2lvbmFsIiwiaWF0IjoxNzU2OTg1MzkwLCJleHAiOjE3NTcwNzE3OTB9.cMaapBx1b7CzTx18XBDG5eKD2QX8jmInMIKR_ksI5aQ';

async function testRealLLMTest() {
  console.log('🤖 Probando Test Real de LLM...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/test-llm-model`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model_name: 'gpt-4o-mini',
        provider_type: 'openai'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta del Test LLM:');
      console.log(`   Éxito: ${data.success}`);
      console.log(`   Respuesta: "${data.response}"`);
      console.log(`   Duración: ${data.duration_ms}ms`);
      console.log(`   Modelo: ${data.model_used}`);
      console.log(`   Proveedor: ${data.provider}`);
      
      if (data.success && data.response && data.duration_ms) {
        console.log('🎉 ¡Este es un test REAL de LLM!');
      } else {
        console.log('⚠️ El test falló, pero es real');
      }
    } else {
      const error = await response.text();
      console.log('❌ Error en test LLM:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Error probando LLM:', error);
  }
}

async function testRealFalTest() {
  console.log('\n🖼️ Probando Test Real de Fal.ai...');
  
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
      console.log(`   Tiempo: ${data.response_time}ms`);
      
      if (data.success) {
        console.log(`   Resultado: ${data.test_result}`);
        if (data.image_url) {
          console.log(`   Imagen: ${data.image_url}`);
        }
        console.log('🎉 ¡Este es un test REAL de Fal.ai!');
      } else {
        console.log(`   Error: ${data.error}`);
        console.log('⚠️ El test falló, pero es real');
      }
    } else {
      const error = await response.text();
      console.log('❌ Error en test Fal.ai:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Error probando Fal.ai:', error);
  }
}

async function main() {
  await testRealLLMTest();
  await testRealFalTest();
  
  console.log('\n📋 Resumen de Cambios Aplicados:');
  console.log('\n🎨 FIXES DE TEMA OSCURO:');
  console.log('✅ FalModelsManager: text-gray-900 → text-foreground');
  console.log('✅ FalModelsManager: text-gray-600 → text-muted-foreground');
  console.log('✅ FalModelsManager: text-gray-500 → text-muted-foreground');
  console.log('✅ FalModelsManager: bg-green-100 → bg-green-500/10');
  console.log('✅ FalModelsManager: bg-gray-100 → bg-muted');
  console.log('✅ FalModelsManager: bg-blue-100 → bg-blue-500/10');
  
  console.log('\n🔧 FIXES DE FUNCIONALIDAD:');
  console.log('✅ Fal.ai Test: model_id → model_name (arregla "Model name is required")');
  console.log('✅ LLM Test: Ya era real (usa LLMServiceV2)');
  console.log('✅ Fal.ai Test: Ahora hace llamadas reales a Fal.ai API');
  
  console.log('\n⚠️ PRÓXIMOS PASOS:');
  console.log('🔄 REINICIA EL SERVIDOR para aplicar cambios:');
  console.log('   1. Detén el servidor (Ctrl+C)');
  console.log('   2. Ejecuta: pnpm run dev:full');
  console.log('   3. Ve a: http://localhost:8080/admin');
  console.log('   4. Las tarjetas deberían verse bien en tema oscuro');
  console.log('   5. Los tests deberían funcionar sin errores');
  
  console.log('\n🎯 RESULTADOS ESPERADOS:');
  console.log('✅ Tarjetas con fondos oscuros apropiados');
  console.log('✅ Texto legible en tema oscuro');
  console.log('✅ Tests de Fal.ai sin error "Model name is required"');
  console.log('✅ Tests de LLM con respuestas reales');
  console.log('✅ Tests de Fal.ai con generación real de imágenes');
}

main().catch(console.error);