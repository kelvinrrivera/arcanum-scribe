# 🛠️ Scripts Directory

This directory contains essential scripts for **Arcanum Scribe** project management, database operations, and development workflows.

## 📋 Available Scripts

### 🗄️ **Database Management**
```bash
# Create database tables
npm run create-tables

# Apply migrations
npm run apply-migrations

# Run migrations
npm run run-migrations

# Seed database with test data
npm run seed              # Full seeding
npm run seed:demo         # Simple demo seeding
```

### 👤 **Admin Management**
```bash
# Create admin user
npm run make-admin
```

### 🤖 **OpenRouter Configuration**
```bash
# Setup OpenRouter integration
npm run setup:openrouter

# Test OpenRouter functionality
npm run test:openrouter
npm run test:openrouter-simple
npm run test:openrouter-postgres
```

### 🚀 **Development**
```bash
# Start full development environment
npm run dev:full
```

## 📁 **Script Categories**

### 🗄️ **Database Scripts**
- `apply-migrations.ts` - Apply database migrations
- `create-tables.ts` - Create necessary database tables
- `run-migrations.ts` - Run database migrations
- `add-image-columns.ts` - Add image columns to tables
- `create-admin-profile.sql` - SQL for admin profile creation

### 🌱 **Seeding Scripts**
- `seed.ts` - Full database seeding with realistic data
- `seed-simple.ts` - Simple demo seeding
- `seed-env.ts` - Environment-based seeding configuration

### 👤 **Admin Scripts**
- `create-admin-user.ts` - Create admin user
- `create-or-check-admin.ts` - Create or verify admin user
- `test-admin-curl.sh` - Test admin endpoints with curl

### 🤖 **OpenRouter Scripts**
- `setup-openrouter-postgres.ts` - Setup OpenRouter with PostgreSQL
- `test-openrouter.ts` - Test OpenRouter functionality
- `test-openrouter-simple.ts` - Simple OpenRouter test
- `test-openrouter-postgres.ts` - Test OpenRouter with PostgreSQL

### 🚀 **Development Scripts**
- `start-dev.ts` - Start development environment

## 🔧 **Environment Setup**

Ensure your `.env` file contains:
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter
OPENROUTER_API_KEY=sk-or-your-key-here

# Optional: Seeding configuration
USERS_COUNT=50
ADVENTURES_COUNT=150
INVITE_CODES_COUNT=20
```

## 🚀 **Quick Start**

1. **Setup database**:
   ```bash
   npm run create-tables
   npm run apply-migrations
   ```

2. **Seed with demo data**:
   ```bash
   npm run seed:demo
   ```

3. **Create admin user**:
   ```bash
   npm run make-admin
   ```

4. **Setup OpenRouter**:
   ```bash
   npm run setup:openrouter
   npm run test:openrouter
   ```

5. **Start development**:
   ```bash
   npm run dev:full
   ```

## 📊 **Script Status**

✅ **Essential Scripts Only** - All temporary test files removed  
✅ **Clean Architecture** - Organized by functionality  
✅ **Professional Structure** - Ready for production use  

**Total Scripts: 18** (down from 69+ temporary files) 