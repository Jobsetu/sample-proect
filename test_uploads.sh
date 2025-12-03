#!/bin/bash
echo "Checking server health..."
curl -s http://localhost:5000/health
echo ""
echo "--------------------------------"

echo "Testing DOCX upload..."
curl -X POST -F "file=@test_resume.docx" http://localhost:5000/api/upload-resume
echo ""
echo "--------------------------------"

echo "Testing TXT upload..."
curl -X POST -F "file=@test_resume.txt" http://localhost:5000/api/upload-resume
echo ""
echo "--------------------------------"
