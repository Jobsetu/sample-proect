#!/bin/bash

echo "=== Testing Complete Workflow ==="
echo ""

# Step 1: Health Check
echo "1. Checking server health..."
curl -s http://localhost:5000/ | head -c 200
echo ""
echo ""

# Step 2: Upload Resume
echo "2. Uploading test_resume.docx..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:5000/api/upload-resume \
  -F "file=@test_resume.docx")

echo "Upload Response:"
echo "$UPLOAD_RESPONSE" | python3 -m json.tool

# Extract the output (parsed resume JSON)
PARSED_RESUME=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('output', '{}'))")

echo ""
echo "Parsed Resume (first 500 chars):"
echo "$PARSED_RESUME" | head -c 500
echo ""
echo "..."
echo ""

# Step 3: Generate Resume for a Job
echo "3. Generating tailored resume for a sample job..."

# Create a JSON file with proper escaping
cat > /tmp/generate_request.json << 'EOF'
{
  "input": "Generate a professional resume tailored to this job",
  "jobDescription": "Title: Senior Software Engineer. Company: TechCorp Inc. Location: San Francisco, CA. Type: Full-time. We are looking for a Senior Software Engineer with experience in Python, React, and cloud technologies. The ideal candidate will have 3+ years of experience building scalable web applications.",
  "jobTitle": "Senior Software Engineer",
  "companyName": "TechCorp Inc",
  "mode": "markdown"
}
EOF

# Read the parsed resume and inject it into the JSON
python3 << PYEOF
import json
import sys

# Read the parsed resume
parsed_resume_str = '''$PARSED_RESUME'''
try:
    parsed_resume = json.loads(parsed_resume_str)
except:
    print("Error parsing resume, using empty structure")
    parsed_resume = {}

# Read the template
with open('/tmp/generate_request.json', 'r') as f:
    request_data = json.load(f)

# Inject the resume
request_data['resume'] = parsed_resume

# Write back
with open('/tmp/generate_request.json', 'w') as f:
    json.dump(request_data, f)
PYEOF

GENERATE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/generate-resume \
  -H "Content-Type: application/json" \
  -d @/tmp/generate_request.json)

echo "Generate Response:"
echo "$GENERATE_RESPONSE" | python3 -m json.tool
echo ""

# Save the generated resume markdown
echo "$GENERATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('output', ''))" > generated_resume.md

if [ -f generated_resume.md ]; then
    echo "✓ Resume saved to generated_resume.md"
    echo ""
    echo "Full Generated Resume:"
    cat generated_resume.md
fi

echo ""
echo "=== Test Complete ==="
