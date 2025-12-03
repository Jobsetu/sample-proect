#!/bin/bash
echo "Testing Resume Generation Fix..."

# Upload resume
echo "1. Uploading resume..."
curl -s -X POST http://localhost:5000/api/upload-resume \
  -F "file=@test_resume_traditional.txt" \
  -o /tmp/resume_data.json

echo "Done"

# Extract resume JSON
RESUME_JSON=$(cat /tmp/resume_data.json | python3 -c "import sys, json; print(json.load(sys.stdin)['output'])")

# Test generate with simple payload
echo "2. Testing resume generation..."
curl -s -X POST http://localhost:5000/api/generate-resume \
  -H "Content-Type: application/json" \
  -d "{
    \"input\": \"Generate a resume\",
    \"resume\": $RESUME_JSON,
    \"jobDescription\": \"Senior Software Engineer with Python experience\",
    \"jobTitle\": \"Senior Software Engineer\",
    \"companyName\": \"TechCorp\",
    \"mode\": \"markdown\"
  }" | python3 -c "import sys, json; data=json.load(sys.stdin); print('SUCCESS' if 'output' in data and len(data['output']) > 100 else 'FAILED'); print('Length:', len(data.get('output', '')))"

echo ""
echo "Done! Check if it says SUCCESS above."
