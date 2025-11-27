from docx import Document
import io

try:
    doc = Document()
    doc.add_paragraph("Hello World")
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    print(f"Success! DOCX size: {len(buffer.getvalue())} bytes")
except Exception as e:
    print(f"Error: {e}")
