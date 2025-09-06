import jwt from 'jsonwebtoken';

// Datos del usuario admin correcto
const adminUser = {
  id: '21cf65f3-e413-4aa0-bf94-0705e3191f5e',
  email: 'admin@arcanum-scribe.com',
  subscription_tier: 'admin'
};

// Generar token usando la misma lógica que el servidor
const token = jwt.sign(
  { 
    id: adminUser.id, 
    email: adminUser.email,
    subscription_tier: adminUser.subscription_tier
  },
  '82a7ec16e335f3e02dfa231d0e0625cc645ec7515eac873cd9f19f6747a99db3',
  { expiresIn: '7d' }
);

console.log('Token JWT válido:');
console.log(token);