#!/bin/bash
# Test script for resume generation

echo "Testing Resume Generation Backend..."
echo "===================================="
echo ""

# Test 1: Basic health check
echo "Test 1: Health Check"
curl -s http://localhost:5000/health | python3 -m json.tool
echo ""
echo ""

# Test 2: Generate resume with minimal data
echo "Test 2: Generate Resume"
curl -s -X POST http://localhost:5000/api/generate-resume \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Generate resume for Software Engineer",
    "jobTitle": "Software Engineer",
    "companyName": "Tech Corp",
    "jobDescription": "Looking for experienced Software Engineer with Python and React skills"
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print('Source:', data.get('source', 'unknown')); print('Output length:', len(str(data.get('output', ''))))"

echo ""
echo "===================================="
echo "Test Complete"
