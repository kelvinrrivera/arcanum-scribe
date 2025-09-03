# 📚 Arcanum Scribe Documentation

Welcome to Arcanum Scribe - an AI-powered TTRPG adventure generator designed for Game Masters who want to create professional-quality adventures quickly and efficiently.

## 🎯 What is Arcanum Scribe?

Arcanum Scribe is a web application that uses advanced AI to help Game Masters generate complete TTRPG adventures, including:

- **Complete Adventures** - Full storylines with encounters, NPCs, and locations
- **Professional Formatting** - Clean, readable layouts ready for table use
- **Multiple Game Systems** - Support for D&D 5e, Pathfinder, and more
- **Customizable Content** - Tailor adventures to your campaign needs

## 🚀 Current Features

### ✅ Implemented
- **Adventure Generation** - Create complete adventures with AI assistance
- **User Authentication** - Secure login and user management
- **Credit System** - Magic credits for generation tracking
- **Professional Mode** - Enhanced content quality and formatting
- **Gallery System** - Browse and discover adventures
- **PDF Export** - Download adventures as formatted PDFs
- **Admin Panel** - Administrative tools and user management

### 🚧 In Development
- **Advanced Filtering** - Enhanced search and discovery
- **Community Features** - User ratings and reviews
- **Mobile Optimization** - Improved mobile experience

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/UI
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **AI Integration**: Vercel AI SDK (Anthropic, OpenAI, Google)
- **Image Generation**: Fal.ai
- **Authentication**: JWT tokens

## 📖 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Developer Guide](DEVELOPER_GUIDE.md) - Setup and development
- [User Guide](USER_GUIDE.md) - How to use the application

## 🔧 Development Setup

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
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   npm run db:init
   ```

5. **Start development**
   ```bash
   npm run dev:full
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](../LICENSE) file for details.

---

*Built with ❤️ for the TTRPG community*