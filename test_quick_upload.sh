#!/bin/bash

echo "Testing upload with detailed logging..."
echo ""

# Test with existing test file
echo "1. Uploading test_resume.docx..."
curl -s -X POST http://localhost:5000/api/upload-resume \
  -F "file=@test_resume.docx" | python3 -m json.tool

echo ""
echo ""
echo "2. Check server logs above for detailed error information"
echo ""
echo "If you're uploading a different file and seeing the error,"
echo "please check:"
echo "  - Is it an image-based/scanned PDF?"
echo "  - Is the file empty or corrupted?"
echo "  - Is it a supported format (PDF/DOCX/TXT)?"
