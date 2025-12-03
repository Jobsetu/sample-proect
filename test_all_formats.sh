#!/bin/bash

echo "========================================="
echo "  Testing Resume Parsing - All Formats"
echo "========================================="
echo ""

# Restart backend to apply changes
echo "1. Restarting backend server..."
pkill -f "python3 server/app.py" 2>/dev/null
sleep 1
python3 server/app.py > /dev/null 2>&1 &
BACKEND_PID=$!
echo "   Backend started (PID: $BACKEND_PID)"
sleep 3

# Test each resume format
RESUMES=("test_resume_traditional.txt" "test_resume_functional.docx" "test_resume_minimal.txt" "test_resume_dense.txt")

for resume in "${RESUMES[@]}"; do
    echo ""
    echo "2. Testing: $resume"
    echo "   ----------------------------------------"
    
    if [ ! -f "$resume" ]; then
        echo "   ❌ File not found: $resume"
        continue
    fi
    
    RESPONSE=$(curl -s -X POST http://localhost:5000/api/upload-resume \
        -F "file=@$resume")
    
    # Check if response is valid
    if [ -z "$RESPONSE" ]; then
        echo "   ❌ No response from server"
        continue
    fi
    
    # Extract parsed data
    NAME=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); parsed=json.loads(data.get('output', '{}')); print(parsed.get('personalInfo', {}).get('name', 'NOT FOUND'))" 2>/dev/null)
    EMAIL=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); parsed=json.loads(data.get('output', '{}')); print(parsed.get('personalInfo', {}).get('email', 'NOT FOUND'))" 2>/dev/null)
    SKILLS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); parsed=json.loads(data.get('output', '{}')); skills=next((s['items'] for s in parsed.get('sections', []) if s.get('id')=='skills'), []); print(len(skills) if isinstance(skills, list) else 0)" 2>/dev/null)
    EXPERIENCE=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); parsed=json.loads(data.get('output', '{}')); exp=next((s['items'] for s in parsed.get('sections', []) if s.get('id')=='experience'), []); print(len(exp) if isinstance(exp, list) else 0)" 2>/dev/null)
    
    # Display results
    echo "   📋 Name: $NAME"
    echo "   📧 Email: $EMAIL"
    echo "   🛠️  Skills: $SKILLS found"
    echo "   💼 Experience: $EXPERIENCE positions"
    
    # Determine pass/fail
    if [ "$NAME" != "NOT FOUND" ] && [ "$EMAIL" != "NOT FOUND" ] && [ "$SKILLS" -gt 0 ]; then
        echo "   ✅ PASSED - Data extracted successfully"
    else
        echo "   ⚠️  WARNING - Some data may be missing"
    fi
done

echo ""
echo "========================================="
echo "  Test Complete!"
echo "========================================="
echo ""
echo "Next: Upload a resume at http://localhost:3000/dashboard"
echo "      and verify the green success toast appears!"
