#!/usr/bin/env tsx

console.log('🔑 Probando Fix de API Key de Fal.ai');
console.log('===================================\n');

const BASE_URL = 'http://localhost:3000';
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlzX2FkbWluIjp0cnVlLCJ0aWVyIjoicHJvZmVzc2lvbmFsIiwiaWF0IjoxNzU2OTg1MzkwLCJleHAiOjE3NTcwNzE3OTB9.cMaapBx1b7CzTx18XBDG5eKD2QX8jmInMIKR_ksI5aQ';

async function testFalApiKeyFix() {
  console.log('🖼️ Probando Test de Fal.ai con API Key corregida...');
  
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
        console.log('🎉 ¡API Key de Fal.ai funcionando correctamente!');
        console.log('🎯 Esto significa que las aventuras ahora deberían generar imágenes');
      } else {
        console.log(`   Error: ${data.error}`);
        if (data.error.includes('API key not configured')) {
          console.log('❌ Aún hay problema con la API key');
          console.log('🔍 Verificando variables de entorno...');
          
          // Verificar qué variables están disponibles
          console.log('📋 Variables de entorno relacionadas con Fal.ai:');
          console.log(`   FAL_API_KEY: ${process.env.FAL_API_KEY ? 'CONFIGURADA' : 'NO ENCONTRADA'}`);
          console.log(`   FAL_KEY: ${process.env.FAL_KEY ? 'CONFIGURADA' : 'NO ENCONTRADA'}`);
          console.log(`   FAL_AI_KEY: ${process.env.FAL_AI_KEY ? 'CONFIGURADA' : 'NO ENCONTRADA'}`);
        } else {
          console.log('⚠️ Error diferente - puede ser problema de red o API');
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

async function checkEnvironmentVariables() {
  console.log('\\n🔍 Verificando Variables de Entorno...');
  
  const envVars = {
    'FAL_API_KEY': process.env.FAL_API_KEY,
    'FAL_KEY': process.env.FAL_KEY,
    'FAL_AI_KEY': process.env.FAL_AI_KEY
  };
  
  for (const [name, value] of Object.entries(envVars)) {
    if (value) {
      console.log(`✅ ${name}: ${value.substring(0, 10)}...${value.substring(value.length - 4)}`);
    } else {
      console.log(`❌ ${name}: NO CONFIGURADA`);
    }
  }
}

async function main() {
  await checkEnvironmentVariables();
  await testFalApiKeyFix();
  
  console.log('\\n📋 Resumen del Fix:');
  console.log('\\n🔧 CAMBIOS REALIZADOS:');
  console.log('✅ Inputs: Arreglados colores para tema oscuro');
  console.log('✅ Labels: text-gray-700 → text-foreground');
  console.log('✅ Inputs: border-gray-300 → border-input bg-background');
  console.log('✅ API Key: process.env.FAL_KEY → process.env.FAL_API_KEY');
  console.log('✅ Scripts: Estandarizados a FAL_API_KEY');
  
  console.log('\\n🎯 IMPACTO ESPERADO:');
  console.log('✅ Tests de Fal.ai deberían funcionar sin "API key not configured"');
  console.log('✅ Generación de aventuras debería incluir imágenes');
  console.log('✅ Inputs se ven correctamente en tema oscuro');
  
  console.log('\\n⚠️ SI AÚN HAY PROBLEMAS:');
  console.log('🔄 Reinicia el servidor: pnpm run dev:full');
  console.log('🔍 Verifica que FAL_API_KEY esté en el .env del servidor');
  console.log('🧪 Prueba generar una aventura completa para verificar imágenes');
}

main().catch(console.error);