#!/bin/bash

# Arcanum Scribe Project Setup Script
# This script sets up the development environment for new contributors

set -e

echo "🎲 Setting up Arcanum Scribe development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if PostgreSQL is available
check_postgres() {
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL is available"
    elif command -v docker &> /dev/null; then
        print_warning "PostgreSQL not found locally, but Docker is available for containerized setup"
    else
        print_error "PostgreSQL is not available and Docker is not installed"
        print_error "Please install PostgreSQL or Docker to continue"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your configuration"
    else
        print_warning ".env file already exists"
    fi
    
    if [ ! -f .env.test ]; then
        cp .env.test.example .env.test
        print_success "Created .env.test file from template"
    else
        print_warning ".env.test file already exists"
    fi
}

# Setup database with Docker
setup_database_docker() {
    print_status "Setting up database with Docker..."
    
    if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        return 1
    fi
    
    # Start development services
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.dev.yml up -d
    else
        docker compose -f docker-compose.dev.yml up -d
    fi
    
    print_success "Database services started with Docker"
    print_status "Waiting for database to be ready..."
    sleep 10
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for database to be ready
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if npm run migrate 2>/dev/null; then
            print_success "Database migrations completed"
            break
        else
            print_status "Waiting for database... (attempt $attempt/$max_attempts)"
            sleep 2
            attempt=$((attempt + 1))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        print_error "Database migrations failed after $max_attempts attempts"
        return 1
    fi
}

# Seed database with demo data
seed_database() {
    print_status "Seeding database with demo data..."
    
    if npm run seed:demo; then
        print_success "Demo data seeded successfully"
    else
        print_warning "Failed to seed demo data (this is optional)"
    fi
}

# Run tests to verify setup
run_tests() {
    print_status "Running tests to verify setup..."
    
    if npm test; then
        print_success "All tests passed!"
    else
        print_warning "Some tests failed, but setup can continue"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs uploads temp
    print_success "Directories created"
}

# Main setup function
main() {
    echo "🎲 Arcanum Scribe Development Setup"
    echo "=================================="
    echo
    
    # Check prerequisites
    check_node
    check_postgres
    
    # Setup project
    install_dependencies
    setup_environment
    create_directories
    
    # Database setup
    print_status "Choose database setup method:"
    echo "1) Use Docker (recommended for development)"
    echo "2) Use local PostgreSQL"
    echo "3) Skip database setup"
    
    read -p "Enter your choice (1-3): " db_choice
    
    case $db_choice in
        1)
            setup_database_docker
            run_migrations
            seed_database
            ;;
        2)
            print_status "Using local PostgreSQL"
            print_warning "Make sure PostgreSQL is running and configured in .env"
            run_migrations
            seed_database
            ;;
        3)
            print_warning "Skipping database setup"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Verify setup
    run_tests
    
    echo
    print_success "🎉 Setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Edit .env file with your API keys and configuration"
    echo "2. Start the development server: npm run dev:full"
    echo "3. Open http://localhost:8080 in your browser"
    echo
    echo "For more information, see:"
    echo "- README.md for general information"
    echo "- CONTRIBUTING.md for contribution guidelines"
    echo "- docs/ directory for detailed documentation"
    echo
    print_success "Happy coding! 🚀"
}

# Run main function
main "$@"