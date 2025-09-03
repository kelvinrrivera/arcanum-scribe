# Contributing to Arcanum Scribe

Thank you for your interest in contributing to Arcanum Scribe! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Git
- Basic knowledge of TypeScript/React

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/arcanum-scribe.git
   cd arcanum-scribe
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   npm run migrate
   npm run seed:demo
   ```

5. **Start Development**
   ```bash
   npm run dev:full
   ```

## 📋 How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Use the feature request template
3. Explain:
   - The problem you're trying to solve
   - Your proposed solution
   - Why this would benefit users
   - Any implementation ideas

### Code Contributions

#### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

#### Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow the coding standards below
   - Write/update tests
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub.

#### Commit Message Convention

We use conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add multi-language support for adventures
fix: resolve AI provider timeout issues
docs: update installation instructions
```

## 🎯 Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible
- Use meaningful variable and function names

### React Guidelines

- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement error boundaries where appropriate

### Code Style

- Use Prettier for formatting (configured in project)
- Follow ESLint rules (configured in project)
- Use meaningful comments for complex logic
- Keep functions small and focused

### File Organization

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── lib/                # Utility functions and services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── styles/             # CSS and styling
└── tests/              # Test files
```

### Testing Guidelines

- Write unit tests for utilities and services
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for good test coverage (>80%)
- Use descriptive test names

Example test structure:
```typescript
describe('AdventureGenerator', () => {
  describe('generateAdventure', () => {
    it('should generate adventure with valid prompt', async () => {
      // Test implementation
    });

    it('should handle invalid prompts gracefully', async () => {
      // Test implementation
    });
  });
});
```

## 🏗️ Architecture Guidelines

### Professional Mode Features

When adding professional mode features:

1. Implement graceful degradation
2. Add proper error handling
3. Include performance monitoring
4. Write comprehensive tests
5. Update documentation

### API Design

- Follow RESTful conventions
- Use consistent response formats
- Implement proper error handling
- Add request validation
- Include rate limiting

### Database Changes

- Create migration scripts
- Update seed data if needed
- Consider backward compatibility
- Test migrations thoroughly

## 📚 Documentation

### Code Documentation

- Document complex functions with JSDoc
- Include usage examples
- Explain non-obvious logic
- Keep documentation up to date

### API Documentation

- Update OpenAPI specs for API changes
- Include request/response examples
- Document error codes
- Explain authentication requirements

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- adventure-generator.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Categories

1. **Unit Tests** - Individual functions/components
2. **Integration Tests** - API endpoints and services
3. **E2E Tests** - Full user workflows
4. **Performance Tests** - Load and stress testing

## 🚀 Deployment

### Environment Considerations

- Test in development environment first
- Consider environment-specific configurations
- Ensure all environment variables are documented
- Test database migrations

### Performance

- Monitor bundle size
- Optimize images and assets
- Consider caching strategies
- Test with realistic data volumes

## 🔍 Review Process

### What We Look For

- Code quality and readability
- Test coverage
- Documentation updates
- Performance considerations
- Security implications
- Backward compatibility

### Review Timeline

- Initial review within 2-3 business days
- Follow-up reviews within 1-2 business days
- Merge after approval and CI passes

## 🎉 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Invited to join our Discord community
- Eligible for contributor badges

## 📞 Getting Help

- **Discord**: Join our [community server](https://discord.gg/arcanumscribe)
- **Issues**: Create a GitHub issue for bugs or questions
- **Discussions**: Use GitHub Discussions for general questions
- **Email**: Contact maintainers at dev@arcanumscribe.com

## 📋 Checklist for Contributors

Before submitting a PR, ensure:

- [ ] Code follows project standards
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main
- [ ] No sensitive data is included
- [ ] Performance impact is considered

## 🏷️ Issue Labels

We use these labels to organize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - Critical issues
- `priority: low` - Nice to have

## 🎯 Areas for Contribution

We especially welcome contributions in:

- **AI Integration** - New model providers, prompt optimization
- **UI/UX** - Interface improvements, accessibility
- **Performance** - Optimization, caching, monitoring
- **Testing** - Test coverage, E2E tests
- **Documentation** - Guides, tutorials, API docs
- **Internationalization** - Multi-language support
- **Mobile** - Responsive design improvements

Thank you for contributing to Arcanum Scribe! 🎲✨