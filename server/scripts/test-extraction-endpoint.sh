#!/bin/bash

# Test script for the metadata extraction endpoint
# This script should be run while the server is running

API_URL="http://localhost:3001/api/library/extract-metadata"
TEST_URL="https://www.example.com/article"

echo "Testing metadata extraction endpoint..."
echo "API URL: $API_URL"
echo "Test URL: $TEST_URL"
echo ""

# Test 1: Valid request
echo "Test 1: Valid URL extraction"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$TEST_URL\"}" \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response parsing failed"

echo -e "\n---\n"

# Test 2: Invalid URL
echo "Test 2: Invalid URL"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"url": "not-a-valid-url"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response parsing failed"

echo -e "\n---\n"

# Test 3: Missing URL
echo "Test 3: Missing URL parameter"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response parsing failed"

echo -e "\n---\n"

# Test 4: Force refresh
echo "Test 4: Force refresh"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$TEST_URL\", \"forceRefresh\": true}" \
  -w "\nHTTP Status: %{http_code}\n" \
  2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Response parsing failed"