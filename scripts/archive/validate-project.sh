#!/bin/bash

# Arcanum Scribe Project Validation Script
# This script validates that the project is properly set up for GitHub publication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Function to print colored output
print_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if required files exist
check_required_files() {
    print_check "Checking required files..."
    
    required_files=(
        "README.md"
        "LICENSE"
        "CONTRIBUTING.md"
        "SECURITY.md"
        "CHANGELOG.md"
        "ROADMAP.md"
        "package.json"
        ".gitignore"
        ".env.example"
        ".env.test.example"
        "Dockerfile"
        ".dockerignore"
        "docker-compose.yml"
        "docker-compose.dev.yml"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_pass "Found $file"
        else
            print_fail "Missing $file"
        fi
    done
}

# Check GitHub templates
check_github_templates() {
    print_check "Checking GitHub templates..."
    
    github_files=(
        ".github/ISSUE_TEMPLATE/bug_report.md"
        ".github/ISSUE_TEMPLATE/feature_request.md"
        ".github/ISSUE_TEMPLATE/documentation.md"
        ".github/pull_request_template.md"
        ".github/workflows/ci.yml"
    )
    
    for file in "${github_files[@]}"; do
        if [ -f "$file" ]; then
            print_pass "Found $file"
        else
            print_fail "Missing $file"
        fi
    done
}

# Check for sensitive data
check_sensitive_data() {
    print_check "Checking for sensitive data..."
    
    # Check if .env file exists (it shouldn't)
    if [ -f ".env" ]; then
        print_fail ".env file exists - this should not be committed"
    else
        print_pass ".env file not found (good)"
    fi
    
    # Check for common sensitive patterns
    sensitive_patterns=(
        "password.*=.*[^example]"
        "secret.*=.*[^example]"
        "key.*=.*sk-"
        "token.*=.*[a-zA-Z0-9]{20,}"
    )
    
    for pattern in "${sensitive_patterns[@]}"; do
        if grep -r -E "$pattern" --exclude-dir=node_modules --exclude-dir=.git . >/dev/null 2>&1; then
            print_warning "Found potential sensitive data matching pattern: $pattern"
        fi
    done
}

# Check package.json configuration
check_package_json() {
    print_check "Checking package.json configuration..."
    
    if [ -f "package.json" ]; then
        # Check if name is updated
        if grep -q '"name": "arcanum-scribe"' package.json; then
            print_pass "Package name is properly set"
        else
            print_fail "Package name needs to be updated"
        fi
        
        # Check if description exists
        if grep -q '"description":' package.json; then
            print_pass "Package description exists"
        else
            print_fail "Package description is missing"
        fi
        
        # Check if license is set
        if grep -q '"license": "Apache-2.0"' package.json; then
            print_pass "License is properly set to Apache-2.0"
        else
            print_fail "License should be set to Apache-2.0"
        fi
        
        # Check if repository is set
        if grep -q '"repository":' package.json; then
            print_pass "Repository information exists"
        else
            print_fail "Repository information is missing"
        fi
    else
        print_fail "package.json not found"
    fi
}

# Check documentation
check_documentation() {
    print_check "Checking documentation..."
    
    # Check README.md content
    if [ -f "README.md" ]; then
        if grep -q "Arcanum Scribe" README.md; then
            print_pass "README.md has project title"
        else
            print_fail "README.md missing project title"
        fi
        
        if grep -q "Quick Start" README.md; then
            print_pass "README.md has Quick Start section"
        else
            print_fail "README.md missing Quick Start section"
        fi
        
        if grep -q "Contributing" README.md; then
            print_pass "README.md has Contributing section"
        else
            print_fail "README.md missing Contributing section"
        fi
    fi
    
    # Check if docs directory exists
    if [ -d "docs" ]; then
        print_pass "Documentation directory exists"
        
        if [ -f "docs/README.md" ]; then
            print_pass "Documentation index exists"
        else
            print_warning "Documentation index missing"
        fi
    else
        print_warning "Documentation directory missing"
    fi
}

# Check license
check_license() {
    print_check "Checking license..."
    
    if [ -f "LICENSE" ]; then
        if grep -q "Apache License" LICENSE; then
            print_pass "Apache License 2.0 is properly set"
        else
            print_fail "License file doesn't contain Apache License"
        fi
    else
        print_fail "LICENSE file is missing"
    fi
}

# Check scripts
check_scripts() {
    print_check "Checking setup scripts..."
    
    if [ -f "scripts/setup-project.sh" ]; then
        if [ -x "scripts/setup-project.sh" ]; then
            print_pass "Setup script exists and is executable"
        else
            print_warning "Setup script exists but is not executable"
        fi
    else
        print_fail "Setup script is missing"
    fi
}

# Check Docker configuration
check_docker() {
    print_check "Checking Docker configuration..."
    
    if [ -f "Dockerfile" ]; then
        print_pass "Dockerfile exists"
        
        # Check for security best practices
        if grep -q "USER" Dockerfile; then
            print_pass "Dockerfile uses non-root user"
        else
            print_warning "Dockerfile should use non-root user"
        fi
        
        if grep -q "HEALTHCHECK" Dockerfile; then
            print_pass "Dockerfile includes health check"
        else
            print_warning "Dockerfile should include health check"
        fi
    else
        print_fail "Dockerfile is missing"
    fi
    
    if [ -f ".dockerignore" ]; then
        print_pass ".dockerignore exists"
    else
        print_fail ".dockerignore is missing"
    fi
}

# Check CI/CD configuration
check_cicd() {
    print_check "Checking CI/CD configuration..."
    
    if [ -f ".github/workflows/ci.yml" ]; then
        print_pass "GitHub Actions CI workflow exists"
        
        # Check for essential steps
        if grep -q "npm test" .github/workflows/ci.yml; then
            print_pass "CI includes testing"
        else
            print_fail "CI should include testing"
        fi
        
        if grep -q "npm run build" .github/workflows/ci.yml; then
            print_pass "CI includes build step"
        else
            print_fail "CI should include build step"
        fi
    else
        print_fail "GitHub Actions CI workflow is missing"
    fi
}

# Check environment configuration
check_environment() {
    print_check "Checking environment configuration..."
    
    if [ -f ".env.example" ]; then
        print_pass ".env.example exists"
        
        # Check for required variables
        required_vars=(
            "DATABASE_URL"
            "OPENROUTER_API_KEY"
            "FAL_API_KEY"
            "JWT_SECRET"
        )
        
        for var in "${required_vars[@]}"; do
            if grep -q "$var" .env.example; then
                print_pass ".env.example includes $var"
            else
                print_fail ".env.example missing $var"
            fi
        done
    else
        print_fail ".env.example is missing"
    fi
}

# Main validation function
main() {
    echo "🎲 Arcanum Scribe Project Validation"
    echo "===================================="
    echo
    
    # Run all checks
    check_required_files
    echo
    check_github_templates
    echo
    check_sensitive_data
    echo
    check_package_json
    echo
    check_documentation
    echo
    check_license
    echo
    check_scripts
    echo
    check_docker
    echo
    check_cicd
    echo
    check_environment
    echo
    
    # Summary
    echo "📊 Validation Summary"
    echo "===================="
    echo -e "${GREEN}Checks Passed: $CHECKS_PASSED${NC}"
    echo -e "${RED}Checks Failed: $CHECKS_FAILED${NC}"
    echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
    echo
    
    if [ $CHECKS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 Project is ready for GitHub publication!${NC}"
        echo
        echo "Next steps:"
        echo "1. Review and update .env.example with your specific requirements"
        echo "2. Test the setup script: ./scripts/setup-project.sh"
        echo "3. Run tests: npm test"
        echo "4. Create your GitHub repository"
        echo "5. Push your code: git push origin main"
        echo
        exit 0
    else
        echo -e "${RED}❌ Project has issues that need to be addressed before publication.${NC}"
        echo
        echo "Please fix the failed checks above and run this script again."
        echo
        exit 1
    fi
}

# Run main function
main "$@"