# Developer Guide

Complete guide for developers working with Arcanum Scribe.

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or pnpm package manager
- OpenRouter API key

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd arcanum-scribe-blueprint
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb arcanum_scribe
   
   # Run migrations
   npm run migrate
   
   # Seed development data
   npm run seed
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database URL
   ```

4. **Start Development**
   ```bash
   # Start full dev environment
   npm run dev:full
   
   # Or start components separately
   npm run server    # Backend only
   npm run dev       # Frontend only
   ```

## Architecture Overview

### Directory Structure

```
arcanum-scribe-blueprint/
├── .kiro/                    # Kiro specifications and hooks
├── src/                      # React frontend
├── server/                   # Express backend services
├── docs/                     # Documentation
├── tests/                    # Test suites
├── migrations/               # Database migrations
├── scripts/                  # Utility scripts
└── validation/               # Quality validation artifacts
```

### Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with migrations
- **AI Integration**: OpenRouter API (multi-provider)
- **Image Generation**: Fal.ai
- **PDF Generation**: Puppeteer
- **Testing**: Vitest, React Testing Library

## Backend Services

### Service Architecture

Each feature domain has its own service module:

```typescript
// Example service structure
export class AdventureService {
  constructor(private llmService: LLMService) {}
  
  async generateAdventure(params: GenerationParams): Promise<Adventure> {
    // Implementation
  }
}
```

### Core Services

#### LLMService (`server/llm-service.ts`)
Manages multiple AI providers with fallback support.

```typescript
// Initialize with automatic provider discovery
const llmService = new LLMService();
await llmService.initialize();

// Generate text with fallback
const result = await llmService.generateText(
  prompt, 
  systemPrompt, 
  { temperature: 0.8, max_tokens: 4096 }
);
```

#### ImageService (`server/image-service.ts`)
Handles AI image generation with consistency.

```typescript
const imageService = new ImageService();
const images = await imageService.generateAdventureImages(adventure, userId);
```

#### PDFService (`server/pdf-service.ts`)
Creates professional PDF exports.

```typescript
const pdfService = new PDFService();
const pdfBuffer = await pdfService.generateAdventurePDF(adventure);
```

### API Endpoint Pattern

```typescript
app.post('/api/resource', authenticateToken, async (req, res) => {
  try {
    // 1. Validate input
    const { param } = req.body;
    if (!param) {
      return res.status(400).json({ error: 'Parameter required' });
    }
    
    // 2. Check permissions
    const userId = (req as any).user.id;
    const canAccess = await checkUserPermissions(userId, 'action');
    if (!canAccess) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // 3. Execute business logic
    const result = await performAction(param, userId);
    
    // 4. Return response
    res.json(result);
    
  } catch (error) {
    console.error('[ENDPOINT] Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal error' 
    });
  }
});
```

## Frontend Development

### Component Structure

```tsx
// Standard component pattern
interface ComponentProps {
  data: DataType;
  onAction: (action: string) => void;
  loading?: boolean;
}

export function Component({ data, onAction, loading = false }: ComponentProps) {
  const [state, setState] = useState<StateType>(initialState);
  
  const handleAction = useCallback((action: string) => {
    onAction(action);
  }, [onAction]);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="component-container">
      {/* Component JSX */}
    </div>
  );
}
```

### State Management

Using React Query for server state:

```tsx
// Data fetching
const { data: adventure, error, isLoading } = useQuery({
  queryKey: ['adventure', adventureId],
  queryFn: () => api.getAdventure(adventureId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations
const { mutate: generateAdventure } = useMutation({
  mutationFn: api.generateAdventure,
  onSuccess: (data) => {
    navigate(`/adventure/${data.id}`);
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

### Styling Guidelines

Using Tailwind CSS with consistent patterns:

```tsx
// Layout components
<div className="container mx-auto px-4 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Content */}
  </div>
</div>

// Interactive elements
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors">
  Action
</button>

// Form inputs
<input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
```

## Database Development

### Migration Pattern

```sql
-- migrations/001_create_adventures.sql
CREATE TABLE IF NOT EXISTS adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_adventures_user_id ON adventures(user_id);
CREATE INDEX idx_adventures_created_at ON adventures(created_at DESC);
```

### Running Migrations

```bash
# Apply all pending migrations
npm run migrate

# Create new migration
npm run migrate:create add_adventure_tags

# Rollback last migration
npm run migrate:rollback
```

## Testing

### Unit Tests

```typescript
// tests/services/adventure-service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { AdventureService } from '../server/adventure-service';

describe('AdventureService', () => {
  it('should generate adventure with valid input', async () => {
    const mockLLMService = vi.fn();
    const service = new AdventureService(mockLLMService);
    
    const result = await service.generateAdventure({
      prompt: 'Test adventure',
      gameSystem: 'dnd5e'
    });
    
    expect(result).toBeDefined();
    expect(result.title).toBeTruthy();
  });
});
```

### Integration Tests

```typescript
// tests/integration/adventure-flow.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server/index';

describe('Adventure Generation Flow', () => {
  it('should complete full generation workflow', async () => {
    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'test-password' });
    
    const token = loginRes.body.token;
    
    // Generate adventure
    const adventureRes = await request(app)
      .post('/api/generate-adventure')
      .set('Authorization', `Bearer ${token}`)
      .send({
        prompt: 'Test adventure',
        gameSystem: 'dnd5e'
      });
    
    expect(adventureRes.status).toBe(200);
    expect(adventureRes.body.title).toBeTruthy();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test adventure-service

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## Kiro Integration

### Using Kiro Hooks

```bash
# Generate adventure from specification
node .kiro/hooks/gen_adventure_from_spec.js professional-mode-integration

# Export to PDF
node .kiro/hooks/export_pdf_for_adventure.js <adventure-id>

# Run quality validation
node .kiro/hooks/run_smoke_tests.js
```

### Creating New Specifications

1. Create specification directory:
   ```bash
   mkdir -p .kiro/specs/new-feature
   ```

2. Add requirements document:
   ```markdown
   # New Feature Requirements
   
   ## Overview
   Description of the feature
   
   ## Acceptance Criteria
   - [ ] Criterion 1
   - [ ] Criterion 2
   ```

3. Update hooks to handle the new specification.

## Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://prod-user:pass@host:5432/db
   # Add production API keys
   ```

2. **Database Migration**
   ```bash
   npm run migrate:prod
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Use provided Dockerfile
docker build -t arcanum-scribe .
docker run -p 3000:3000 --env-file .env.prod arcanum-scribe
```

## Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check connection
npm run db:check

# Reset database
npm run db:reset
```

**API Key Issues**
```bash
# Test OpenRouter connection
npm run test:openrouter
```

**Build Issues**
```bash
# Clean dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run build:clean
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=arcanum:* npm run server

# Run with more verbose output
LOG_LEVEL=debug npm run dev:full
```

## Contributing

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation

### Pull Request Process

1. Create feature branch from `main`
2. Write tests and documentation
3. Ensure all tests pass
4. Submit PR with clear description

### Git Hooks

Pre-commit hooks automatically:
- Run ESLint
- Check TypeScript compilation
- Run relevant tests
- Format code with Prettier

---

For API reference, see [API Documentation](./API_DOCUMENTATION.md).  
For user-facing features, see [User Guide](./USER_GUIDE.md).