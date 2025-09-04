# 🧙‍♂️ Arcanum Scribe

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

> **AI-Powered TTRPG Adventure Generator for Game Masters**

Arcanum Scribe helps Game Masters create professional-quality TTRPG adventures using advanced AI. Generate complete adventures with storylines, encounters, NPCs, and locations in minutes instead of hours.

## 🚀 **Repository Status**

This repository has been cleaned and organized for production use. All obsolete documentation, debug scripts, and temporary files have been removed to provide a clean, professional codebase.

## 🎯 **Why Arcanum Scribe?**

- **Save Time**: Generate complete adventures in minutes, not hours
- **Professional Quality**: Clean, readable content ready for your table
- **D&D 5e Focus**: Optimized for D&D 5th Edition adventures
- **Customizable**: Tailor content to fit your campaign perfectly

## ✨ **Features**

### **🎨 Adventure Generation**
- **Complete Adventures** - Full storylines with encounters, NPCs, and locations
- **D&D 5e Support** - Optimized for D&D 5th Edition
- **Professional Interface** - Clean, intuitive generation interface
- **Export Ready** - Content formatted for easy use at your table

### **🔧 User Management**
- **User Authentication** - Registration and login system
- **Credit System** - Magic credits for generation tracking
- **User Profiles** - Personal libraries and preferences
- **Admin Interface** - Administrative panel interface

### **🎯 AI Integration**
- **OpenRouter API** - Access to multiple AI models
- **Cost Optimization** - Efficient token usage
- **Quality Control** - Content validation and enhancement
- **Flexible Prompting** - Customizable generation parameters

## 🤖 **How Kiro was Used**

This project demonstrates advanced specification-driven development using Kiro, an AI development workflow system. The complete development process follows a **Specification → Implementation → Validation** pattern:

### **📋 Kiro Specifications Drive Features**
| Specification | Implementation | API Endpoints | Result |
|--------------|----------------|---------------|---------|
| `/.kiro/specs/advanced-prompt-system/` | `server/enhanced-adventure-prompt.js`<br>`server/llm-service.ts` | `/api/generate-adventure` | Multi-layered narrative generation with quality validation |
| `/.kiro/specs/professional-mode-integration/` | `server/professional-layout-engine.ts`<br>`server/pdf-service.ts` | `/api/generate-adventure`<br>`/api/export/pdf` | Publication-ready adventures with professional formatting |
| `/.kiro/specs/unified-tier-system/` | `server/tier-service.ts`<br>`server/magic-credits-service.ts` | `/api/user/tier-info`<br>`/api/user/magic-credits-info` | User management with credit system |
| `/.kiro/specs/visual-tiers-system/` | `server/image-service.ts` | `/api/generate-adventure` (with images) | Automated image generation with Fal.ai |

### **🔧 Executable Kiro Hooks**
The `/.kiro/hooks/` directory contains working automation that demonstrates the spec-to-code workflow:

- **`gen_adventure_from_spec.js`** - Reads Kiro specs and generates adventures via actual API calls
- **`export_pdf_for_adventure.js`** - Creates professional PDFs using the Puppeteer service  
- **`run_smoke_tests.js`** - Validates system health and generates quality reports

### **📐 Steering Guidelines Ensure Quality**
Implementation follows consistent patterns defined in `/.kiro/steering/`:
- **Prompt Guidelines** - How specifications translate to effective AI prompts
- **Code Generation Rules** - Architectural standards and naming conventions

### **🎯 Kiro Demo Workflow**
```bash
# 1. Generate adventure from spec
node .kiro/hooks/gen_adventure_from_spec.js professional-mode-integration

# 2. Export to professional PDF
node .kiro/hooks/export_pdf_for_adventure.js <adventure-id>

# 3. Validate system quality  
node .kiro/hooks/run_smoke_tests.js

# 4. View generated artifacts
open .kiro/artifacts/  # Adventures + PDFs
open .kiro/reports/    # Quality reports
```

This demonstrates complete **traceability** from high-level specifications to working code to generated artifacts, with automated quality validation throughout the process.

## 🛠️ **Technology Stack**

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/UI
- **Backend**: Node.js + Express (in development)
- **Database**: PostgreSQL (schema designed)
- **AI Integration**: OpenRouter API (configured)
- **Image Generation**: Fal.ai (configured)
- **Authentication**: JWT tokens (frontend ready)

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+
- PostgreSQL database
- OpenRouter API key

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/kelvinrrivera/arcanum-scribe.git
   cd arcanum-scribe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database URL
   ```

4. **Database setup**
   ```bash
   npm run db:init
   ```

5. **Start development**
   ```bash
   npm run dev:full
   ```

Visit `http://localhost:8080` to access the application.

## ⚙️ **Configuration**

### **Environment Variables**

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/arcanum_scribe"

# API Keys
OPENROUTER_API_KEY="your-openrouter-api-key"
FAL_API_KEY="your-fal-ai-api-key"

# Application
NODE_ENV="development"
PORT=3000
JWT_SECRET="your-jwt-secret-key"
```

### **API Setup**

1. **OpenRouter**: Sign up at [openrouter.ai](https://openrouter.ai) for AI text generation
2. **Fal.ai**: Get an API key at [fal.ai](https://fal.ai) for image generation
3. Add both keys to your `.env` file

## 📚 **Documentation**

- [📖 Documentation](docs/README.md) - Complete documentation
- [🛠️ API Reference](docs/API_DOCUMENTATION.md) - API endpoints
- [👨‍💻 Developer Guide](docs/DEVELOPER_GUIDE.md) - Development setup
- [👤 User Guide](docs/USER_GUIDE.md) - How to use the app

## 🧪 **Testing**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Test specific components
npm run test:unit
npm run test:integration
```

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Quick Contribution Steps**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### **Development Guidelines**

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass before submitting



## 📊 **Project Status**

### ✅ **Implemented**
- Frontend application with React + TypeScript
- User interface for adventure generation
- Authentication system (frontend)
- Credit system interface
- Professional mode interface
- Gallery interface for browsing
- Admin panel interface

### 🚧 **In Development**
- Backend API implementation
- Database integration
- Production deployment
- Additional game systems (Pathfinder, etc.)

## 🤝 **Contributing**

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 **License**

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

- 🐛 **Issues**: [GitHub Issues](https://github.com/kelvinrrivera/arcanum-scribe/issues)
- 📖 **Documentation**: [docs/README.md](docs/README.md)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/kelvinrrivera/arcanum-scribe/discussions)

## 🙏 **Acknowledgments**

- OpenRouter for AI model access
- Fal.ai for image generation
- The TTRPG community for inspiration and feedback
