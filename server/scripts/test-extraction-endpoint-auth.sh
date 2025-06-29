#!/bin/bash

# Test script for the metadata extraction endpoint with authentication
# This script should be run while the server is running

API_BASE="http://localhost:3001/api"
LOGIN_URL="$API_BASE/auth/login"
EXTRACTION_URL="$API_BASE/library/extract-metadata"
TEST_URL="https://www.example.com/article"

# Test credentials - update these with your actual credentials
USERNAME="your_username"
PASSWORD="your_password"

echo "Testing metadata extraction endpoint with authentication..."
echo "API Base: $API_BASE"
echo "Test URL: $TEST_URL"
echo ""

# First, login to get JWT token
echo "Logging in to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

# Extract token from response
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "Failed to get authentication token"
  echo "Login response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Successfully authenticated!"
echo ""

# Test 1: Valid request with authentication
echo "Test 1: Valid URL extraction (authenticated)"
curl -X POST "$EXTRACTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"url\": \"$TEST_URL\"}" \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response parsing failed"

echo -e "\n---\n"

# Test 2: Request without authentication (should fail)
echo "Test 2: Request without authentication (should return 401)"
curl -X POST "$EXTRACTION_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$TEST_URL\"}" \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response parsing failed"

echo -e "\n---\n"

# Test 3: Invalid URL with authentication
echo "Test 3: Invalid URL (authenticated)"
curl -X POST "$EXTRACTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"url": "not-a-valid-url"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response parsing failed"

echo -e "\n---\n"

# Test 4: Force refresh with authentication
echo "Test 4: Force refresh (authenticated)"
curl -X POST "$EXTRACTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"url\": \"$TEST_URL\", \"forceRefresh\": true}" \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response parsing failed"