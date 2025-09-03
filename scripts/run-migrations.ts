#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import { query } from '../src/integrations/postgres/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🗄️  Ejecutando migraciones de la base de datos...\n');

  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`📁 Encontradas ${migrationFiles.length} migraciones:`);
  migrationFiles.forEach(file => console.log(`   - ${file}`));

  for (const file of migrationFiles) {
    try {
      console.log(`\n🔄 Ejecutando: ${file}`);
      
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      await query(sql);
      
      console.log(`✅ ${file} - Completada`);
      
    } catch (error) {
      console.log(`❌ ${file} - Error: ${error.message}`);
      
      // Si es un error de tabla ya existe, continuar
      if (error.message.includes('already exists')) {
        console.log(`   ⚠️  Tabla ya existe, continuando...`);
        continue;
      }
      
      // Para otros errores, preguntar si continuar
      console.log(`   ¿Continuar con las siguientes migraciones? (s/n)`);
      // Por ahora, continuar automáticamente
    }
  }

  console.log('\n✅ Migraciones completadas');
  console.log('\n📊 Verificando tablas creadas...');
  
  try {
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tablas disponibles:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
  } catch (error) {
    console.log('❌ Error verificando tablas:', error.message);
  }
}

runMigrations().catch(console.error); 