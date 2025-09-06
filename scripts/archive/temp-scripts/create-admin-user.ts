#!/usr/bin/env tsx

import * as dotenv from 'dotenv';
import { query } from '../src/integrations/postgres/client';

dotenv.config();

async function createAdminUser() {
  console.log('👑 Creando usuario admin...\n');

  try {
    // Verificar si el usuario ya existe
    const existingUser = await query(
      'SELECT * FROM profiles WHERE email = $1',
      ['kelvinrrivera@gmail.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Usuario admin ya existe:');
      console.log(`   Email: ${existingUser.rows[0].email}`);
      console.log(`   Role: ${existingUser.rows[0].role}`);
      console.log(`   ID: ${existingUser.rows[0].id}`);
      return;
    }

    // Crear usuario admin
    const result = await query(
      `INSERT INTO profiles (
        id, 
        email, 
        display_name,
        subscription_tier,
        credits_remaining,
        monthly_generations,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        '550e8400-e29b-41d4-a716-446655440001', // UUID único
        'kelvinrrivera@gmail.com',
        'Admin User',
        'admin',
        1000,
        0,
        new Date(),
        new Date()
      ]
    );

    console.log('✅ Usuario admin creado exitosamente:');
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Display Name: ${result.rows[0].display_name}`);
    console.log(`   Subscription: ${result.rows[0].subscription_tier}`);
    console.log(`   Credits: ${result.rows[0].credits_remaining}`);
    console.log(`   ID: ${result.rows[0].id}`);

    // Crear perfil de usuario
    try {
      await query(
        `INSERT INTO user_profiles (
          user_id,
          monthly_generations,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4)`,
        [
          result.rows[0].id,
          0,
          new Date(),
          new Date()
        ]
      );
      console.log('✅ Perfil de usuario creado');
    } catch (error) {
      console.log('⚠️  No se pudo crear perfil de usuario (tabla puede no existir):', error.message);
    }

    console.log('\n🔑 Credenciales de acceso:');
    console.log('   Email: kelvinrrivera@gmail.com');
    console.log('   Password: admin123 (o cualquier contraseña)');
    console.log('   Subscription: admin');

  } catch (error) {
    console.log('❌ Error creando usuario admin:', error);
  }
}

createAdminUser().catch(console.error); 