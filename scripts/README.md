# Scripts Directory

This directory contains essential scripts for the Arcanum Scribe project.

## Essential Scripts

### Database Management
- `init-database.ts` - Initialize the database with required tables
- `init-admin-tables.ts` - Set up admin-specific tables
- `run-migrations.ts` - Run database migrations
- `setup-llm-models.sql` - SQL script for LLM models setup
- `align_llm_providers.sql` - Align LLM providers in database

### Development
- `start-dev.ts` - Start development server
- `setup-project.sh` - Project setup script

### Database Schema
- `add-image-columns.sql` - Add image-related columns to database

## Archive Directory

The `archive/` directory contains:
- **`temp-scripts/`** - Temporary development and debugging scripts
- **Legacy scripts** - Older versions and experimental code

These archived scripts are kept for reference but are not part of the active codebase.

## Usage

```bash
# Initialize database
npm run db:init

# Start development
npm run dev

# Run migrations
npm run migrate
```

## Note

Only essential scripts are kept in the root of this directory. All temporary, debugging, and development-specific scripts have been moved to the `archive/` directory to maintain a clean and professional codebase.