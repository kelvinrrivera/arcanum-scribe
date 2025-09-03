#!/bin/bash

echo "🧪 Testing Admin Endpoints with curl..."
echo

# First, let's try to sign in as admin
echo "🔐 Attempting admin login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"kelvinrrivera@gmail.com","password":"any_password"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token from response (assuming JSON format)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token from login response"
  exit 1
fi

echo "✅ Login successful, token obtained"
echo

# Test prompt templates endpoint
echo "📋 Testing prompt templates endpoint..."
TEMPLATES_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/admin/prompt-templates)

echo "Templates response: $TEMPLATES_RESPONSE"
echo

# Test API logs endpoint
echo "📊 Testing API logs endpoint..."
LOGS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "http://localhost:3000/api/admin/api-logs?limit=5")

echo "Logs response: $LOGS_RESPONSE"
echo

# Test analysis endpoint
echo "📈 Testing analysis endpoint..."
ANALYSIS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/admin/prompt-analysis)

echo "Analysis response: $ANALYSIS_RESPONSE"
echo

echo "🎯 Admin Endpoints Test Complete!"