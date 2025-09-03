# 🧪 Arcanum Scribe - Test Suite

Este directorio contiene el sistema completo de pruebas unitarias, de integración y de rendimiento para Arcanum Scribe.

## 📋 Estructura de Pruebas

```
tests/
├── server/                 # Pruebas unitarias del backend
│   ├── auth-service.test.ts
│   ├── tier-service.test.ts
│   ├── llm-service.test.ts
│   ├── adventure-service.test.ts
│   └── billing-service.test.ts
├── frontend/               # Pruebas unitarias del frontend
│   ├── auth-components.test.tsx
│   ├── adventure-generation.test.tsx
│   └── gallery-components.test.tsx
├── hooks/                  # Pruebas de React hooks
│   └── useAuth.test.ts
├── utils/                  # Pruebas de utilidades
│   └── validation.test.ts
├── integration/            # Pruebas de integración
│   ├── auth-flow.test.ts
│   └── adventure-generation-flow.test.ts
├── performance/            # Pruebas de rendimiento
│   └── load-testing.test.ts
├── setup.ts               # Configuración base de pruebas
├── setup-react.ts         # Configuración para pruebas de React
└── test-runner.ts         # Runner personalizado de pruebas
```

## 🚀 Comandos de Pruebas

### Pruebas Básicas
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con interfaz visual
npm run test:ui

# Ejecutar pruebas una vez
npm run test:run

# Ejecutar con cobertura de código
npm run test:coverage
```

### Pruebas Específicas
```bash
# Solo pruebas unitarias
npm run test:unit

# Solo pruebas de integración
npm run test:integration

# Solo pruebas de rendimiento
npm run test:performance
```

### Pruebas Completas
```bash
# Suite completa de pruebas y auditoría
npm run test:comprehensive

# Auditoría rápida del sistema
npm run test:audit
```

## 📊 Cobertura de Pruebas

El sistema de pruebas cubre:

### Backend (Server)
- ✅ Autenticación y autorización
- ✅ Gestión de tiers y límites
- ✅ Integración con LLM (OpenRouter)
- ✅ Generación de aventuras
- ✅ Sistema de facturación (Stripe)
- ✅ Base de datos y migraciones

### Frontend (Client)
- ✅ Componentes de autenticación
- ✅ Formularios de generación
- ✅ Galería de aventuras
- ✅ Hooks personalizados
- ✅ Validaciones de entrada

### Integración
- ✅ Flujos completos de autenticación
- ✅ Proceso de generación end-to-end
- ✅ APIs y endpoints
- ✅ Manejo de errores

### Rendimiento
- ✅ Tiempos de respuesta
- ✅ Carga concurrente
- ✅ Límites de rate limiting
- ✅ Uso de memoria

## 🔧 Configuración

### Variables de Entorno para Pruebas
```bash
# Copia el archivo de ejemplo
cp .env.test.example .env.test

# Configura las variables necesarias
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/arcanum_test
TEST_SERVER_URL=http://localhost:3001
OPENROUTER_API_KEY=your_test_key
JWT_SECRET=your_test_secret
```

### Base de Datos de Pruebas
Las pruebas utilizan una base de datos separada para evitar conflictos con datos de desarrollo:

```bash
# Crear base de datos de pruebas
createdb arcanum_test

# Las tablas se crean automáticamente durante las pruebas
```

## 📈 Métricas de Calidad

### Objetivos de Cobertura
- **Mínimo aceptable**: 70%
- **Objetivo**: 80%
- **Excelente**: 90%+

### Criterios de Éxito
- ✅ Todas las pruebas unitarias pasan
- ✅ Cobertura de código > 80%
- ✅ Pruebas de integración pasan
- ✅ Tiempos de respuesta < 1s para APIs básicas
- ✅ Generación de aventuras < 30s
- ✅ Sin vulnerabilidades críticas

## 🐛 Debugging de Pruebas

### Ejecutar Pruebas Individuales
```bash
# Ejecutar un archivo específico
npx vitest run tests/server/auth-service.test.ts

# Ejecutar con modo watch
npx vitest tests/server/auth-service.test.ts

# Ejecutar con debug
npx vitest run tests/server/auth-service.test.ts --reporter=verbose
```

### Logs y Debugging
```bash
# Ver logs detallados
DEBUG=* npm test

# Solo logs de base de datos
DEBUG=db:* npm test
```

## 📋 Reportes

### Reportes Automáticos
Los reportes se generan automáticamente en:
- `test-report.html` - Reporte visual completo
- `test-report.json` - Datos en formato JSON
- `coverage/` - Reporte de cobertura de código

### Interpretación de Reportes
- **Verde**: Todas las pruebas pasan
- **Amarillo**: Algunas pruebas fallan o cobertura baja
- **Rojo**: Fallos críticos o sistema no funcional

## 🔄 Integración Continua

### GitHub Actions
Las pruebas se ejecutan automáticamente en:
- Pull requests
- Push a main/develop
- Releases

### Pre-commit Hooks
```bash
# Instalar hooks
npm run prepare

# Las pruebas se ejecutan antes de cada commit
```

## 🛠️ Mantenimiento

### Actualizar Pruebas
1. Agregar nuevas pruebas para nuevas funcionalidades
2. Actualizar pruebas existentes cuando cambien las APIs
3. Mantener cobertura de código alta
4. Revisar y optimizar pruebas lentas

### Mejores Prácticas
- Usar nombres descriptivos para las pruebas
- Mantener pruebas independientes
- Limpiar datos de prueba después de cada test
- Usar mocks para dependencias externas
- Probar casos edge y errores

## 📞 Soporte

Si tienes problemas con las pruebas:
1. Revisa los logs de error
2. Verifica la configuración de entorno
3. Consulta la documentación de Vitest
4. Revisa los issues en GitHub

## 🎯 Roadmap de Pruebas

### Próximas Mejoras
- [ ] Pruebas E2E con Playwright
- [ ] Pruebas de accesibilidad
- [ ] Pruebas de seguridad automatizadas
- [ ] Pruebas de carga distribuida
- [ ] Monitoreo continuo de rendimiento

---

**¡Las pruebas son la base de un sistema confiable y auditable!** 🧙‍♂️✨