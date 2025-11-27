from flask import Flask, request, jsonify
from flask_cors import CORS
from bytez import Bytez
import os

app = Flask(__name__)
CORS(app)

# Initialize Bytez SDK
# Ideally, get key from environment variable
BYTEZ_KEY = os.environ.get("BYTEZ_API_KEY", "e7bcd604f04b496ca11602337f3a81fc")
sdk = Bytez(BYTEZ_KEY)
model = sdk.model("google/gemini-2.5-pro")

@app.route('/api/generate-resume', methods=['POST'])
def generate_resume():
    try:
        from resume_service import ResumeService
        
        data = request.json
        user_input = data.get('input', '')
        user_resume = data.get('resume', {})
        job_description = data.get('jobDescription', '')
        job_title = data.get('jobTitle', 'Position')
        company_name = data.get('companyName', 'Company')
        
        print(f"[RESUME] Generating resume for {job_title} at {company_name}")
        
        # Parse user resume
        if not user_resume or not isinstance(user_resume, dict):
            print("[RESUME] No valid resume data provided, creating minimal resume structure")
            user_resume = {
                'personalInfo': {
                    'name': 'Professional',
                    'email': '',
                    'phone': '',
                    'location': ''
                },
                'sections': []
            }
        parsed_resume = ResumeService.parse_user_resume(user_resume)
        
        # Try AI generation first
        try:
            if user_input:
                print(f"[RESUME] Calling AI model with input length: {len(user_input)}")
                response = model.run([
                    {
                        "role": "user",
                        "content": user_input
                    }
                ])
                
                # Extract text output
                if hasattr(response, 'output') and isinstance(response.output, dict):
                    text_output = response.output.get('content', '')
                elif isinstance(response, dict) and 'output' in response:
                    text_output = response['output'].get('content', '')
                elif hasattr(response, 'content'):
                    text_output = response.content
                else:
                    text_output = str(response)
                
                # Clean up the output - remove any markdown code blocks if present
                if text_output:
                    text_output = text_output.strip()
                    # Remove markdown code blocks if the AI wrapped it
                    if text_output.startswith('```'):
                        lines = text_output.split('\n')
                        # Remove first line (```markdown or ```)
                        if lines[0].startswith('```'):
                            lines = lines[1:]
                        # Remove last line (```)
                        if lines and lines[-1].strip() == '```':
                            lines = lines[:-1]
                        text_output = '\n'.join(lines).strip()
                
                # Validate that it looks like a resume (starts with # or contains resume sections)
                # Also check if it's a guide/template (contains words like "template", "example", "here is")
                text_lower = text_output.lower()
                is_guide = any(word in text_lower[:500] for word in ['template', 'example resume', 'here is a', 'tips for', 'how to', 'guide to', 'sample resume'])
                
                is_valid_resume = (
                    text_output and 
                    len(text_output) > 200 and 
                    not is_guide and
                    (text_output.strip().startswith('#') or 
                     'PROFESSIONAL SUMMARY' in text_output.upper() or
                     'EXPERIENCE' in text_output.upper() or
                     'EDUCATION' in text_output.upper())
                )
                
                if is_valid_resume:
                    print(f"[RESUME] AI generation successful, output length: {len(text_output)}")
                    return jsonify({"output": text_output, "source": "ai"})
                else:
                    print(f"[RESUME] AI output doesn't look like a resume (is_guide={is_guide}), using fallback. Output preview: {text_output[:300]}")
        
        except Exception as ai_error:
            print(f"[RESUME] AI generation failed: {ai_error}")
            import traceback
            traceback.print_exc()
        
        # Fallback to template-based generation
        print("[RESUME] Using fallback template generation")
        markdown_output = ResumeService.generate_detailed_resume_markdown(
            resume=parsed_resume,
            job_description=job_description or user_input,
            job_title=job_title,
            company_name=company_name
        )
        
        return jsonify({
            "output": markdown_output,
            "source": "template",
            "match_score": ResumeService.calculate_match_score(
                parsed_resume,
                ResumeService.extract_job_keywords(job_description or user_input)
            )
        })

    except Exception as e:
        print(f"[RESUME] Critical error: {e}")
        import traceback
        traceback.print_exc()
        
        # Last resort fallback
        return jsonify({
            "output": f"""# Professional Resume

**Email:** user@example.com | **Phone:** (555) 123-4567

## PROFESSIONAL SUMMARY

Experienced professional seeking opportunities in {data.get('jobTitle', 'technology')}.

## SKILLS

Python, JavaScript, React, Node.js, SQL, AWS, Docker, Git

## EXPERIENCE

**Software Engineer** | **Technology Company** | 2020 - Present

- Developed and maintained production systems
- Collaborated with cross-functional teams
- Implemented best practices and code reviews

## EDUCATION

**Bachelor of Science in Computer Science**
University of Technology | 2020
""",
            "source": "emergency_fallback"
        }), 200

@app.route('/api/generate-cover-letter', methods=['POST'])
def generate_cover_letter():
    try:
        data = request.json
        user_input = data.get('input')
        
        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        response = model.run([
            {
                "role": "user",
                "content": f"Generate a professional cover letter based on the following details:\n{user_input}"
            }
        ])

        if hasattr(response, 'output') and isinstance(response.output, dict):
            text_output = response.output.get('content', '')
        elif isinstance(response, dict) and 'output' in response:
            text_output = response['output'].get('content', '')
        else:
            text_output = str(response)

        return jsonify({"output": text_output})

    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/mock-interview', methods=['POST'])
def mock_interview():
    try:
        data = request.json
        messages = data.get('messages', [])
        
        if not messages:
             # Initial greeting
             messages = [{"role": "user", "content": "Start a mock interview for a software engineering role."}]

        response = model.run(messages)

        if hasattr(response, 'output') and isinstance(response.output, dict):
            text_output = response.output.get('content', '')
        elif isinstance(response, dict) and 'output' in response:
            text_output = response['output'].get('content', '')
        else:
            text_output = str(response)

        return jsonify({"output": text_output})

    except Exception as e:
        print(f"Exception: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "job-yatra-backend"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
