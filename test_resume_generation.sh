#!/bin/bash

echo "Testing Resume Generation with Job Description"
echo "=============================================="
echo ""

# Step 1: Upload resume and save output
echo "1. Uploading resume..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:5000/api/upload-resume \
  -F "file=@test_resume_traditional.txt")

echo "   ✓ Resume uploaded"

# Extract parsed resume
PARSED_RESUME=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('output', '{}'))")

# Step 2: Generate resume with job description
echo ""
echo "2. Generating tailored resume..."
echo ""

JOB_DESC="Title: Senior Software Engineer
Company: TechCorp Inc
Location: San Francisco, CA

We are seeking a Senior Software Engineer with strong experience in Python, React, and cloud technologies. The ideal candidate will have 5+ years of experience building scalable web applications."

# Create request payload
python3 << PYEOF
import json

parsed_resume_str = '''$PARSED_RESUME'''
try:
    parsed_resume = json.loads(parsed_resume_str)
except:
    parsed_resume = {}

request_data = {
    "input": "Generate a professional, tailored resume for this position",
    "resume": parsed_resume,
    "jobDescription": "$JOB_DESC",
    "jobTitle": "Senior Software Engineer",
    "companyName": "TechCorp Inc",
    "mode": "markdown"
}

with open('/tmp/generate_request.json', 'w') as f:
    json.dump(request_data, f, indent=2)
    
print("   Request payload created")
PYEOF

# Make the request
GENERATE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/generate-resume \
  -H "Content-Type: application/json" \
  -d @/tmp/generate_request.json)

# Check for errors
ERROR=$(echo "$GENERATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('error', ''))" 2>/dev/null)

if [ -n "$ERROR" ] && [ "$ERROR" != "" ]; then
    echo "   ❌ ERROR: $ERROR"
    echo ""
    echo "Full Response:"
    echo "$GENERATE_RESPONSE" | python3 -m json.tool
else
    # Success - save and preview
    OUTPUT=$(echo "$GENERATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('output', ''))")
    
    if [ -n "$OUTPUT" ] && [ "$OUTPUT" != "" ]; then
        echo "   ✓ Resume generated successfully!"
        echo ""
        echo "Preview (first 800 characters):"
        echo "----------------------------------------"
        echo "$OUTPUT" | head -c 800
        echo ""
        echo "..."
        echo "----------------------------------------"
        echo ""
        echo "Full resume saved to: resume_generated.md"
        echo "$OUTPUT" > resume_generated.md
    else
        echo "   ⚠️  No output in response"
        echo "Full Response:"
        echo "$GENERATE_RESPONSE" | python3 -m json.tool
    fi
fi

echo ""
echo "Check server logs for any errors or warnings"
