// Initialize Gemini API
let GoogleGenerativeAI = null
let genAI = null

// Dynamic import to handle missing API key gracefully
const initializeGemini = async () => {
  if (!GoogleGenerativeAI) {
    try {
      const module = await import('@google/generative-ai')
      GoogleGenerativeAI = module.GoogleGenerativeAI
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (apiKey) {
        genAI = new GoogleGenerativeAI(apiKey)
      }
    } catch (error) {
      console.warn('Gemini AI package not available:', error)
    }
  }
  return genAI
}

// Gemini Service using Python Backend via Bytez
export class GeminiService {
  static async callBackend(endpoint, payload) {
    try {
      console.log(`[GeminiService] Calling backend: /api/${endpoint}`);
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GeminiService] Backend error (${response.status}):`, errorText);
        throw new Error(`Backend error: ${response.statusText}. ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Handle response - could be string or object
      if (data.output) {
        console.log(`[GeminiService] Received response from ${data.source || 'unknown'} source, length: ${typeof data.output === 'string' ? data.output.length : 'object'}`);
        return data.output;
      } else {
        console.warn(`[GeminiService] Response missing 'output' field:`, data);
        throw new Error('Invalid response format from backend');
      }
    } catch (error) {
      console.error(`[GeminiService] Error calling ${endpoint}:`, error);
      // Provide more helpful error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please make sure the server is running on port 5000.');
      }
      throw error;
    }
  }

  static parseAIResponse(text) {
    try {
      // 1. Try standard parsing first
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON structure found');
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn("Standard JSON parse failed, attempting to fix Python-style dict...", e);
      try {
        // 2. Handle Python-style stringified dicts (single quotes)
        let fixedText = text
          .replace(/'/g, '"') // Replace all single quotes with double quotes
          .replace(/True/g, 'true')
          .replace(/False/g, 'false')
          .replace(/None/g, 'null');

        const jsonMatch = fixedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON structure found after fixing');
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        console.error("Failed to parse AI response:", text);
        throw e2;
      }
    }
  }

  static async generateResumeAnalysis(jobDescription, userResume) {
    const prompt = `
      You are an expert resume analyst. Analyze this resume against the job description.
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      CANDIDATE RESUME:
      ${JSON.stringify(userResume)}
      
      Return JSON with matchScore (0-100), strengths (array), weaknesses (array), and analysis (string).
    `;

    try {
      const response = await this.callBackend('generate-resume', { input: prompt });
      let text = typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      return {
        matchScore: 0,
        strengths: ["Error analyzing"],
        weaknesses: ["Error analyzing"],
        analysis: "Could not analyze at this time."
      };
    }
  }

  static async generateCustomResume(jobDescription, userResume, selectedSections = [], selectedSkills = []) {
    // STRATEGY: Surgical Update (Fragment-Based)
    // We ask the AI ONLY for the content that needs to change.
    // We then merge this into the existing resume structure.

    const hasExperience = userResume.sections.find(s => s.id === 'experience')?.items?.length > 0;

    const prompt = `
      You are an expert resume writer. I need you to update specific sections of a candidate's resume to better match a job description.

      JOB DESCRIPTION:
      ${jobDescription}

      CANDIDATE'S EXPERIENCE & SKILLS:
      ${JSON.stringify(userResume.sections)}

      INSTRUCTIONS:
      1. **Summary**: Write a new, powerful 3-4 sentence Professional Summary tailored to this job.
      2. **Skills**: specific list of technical and soft skills relevant to the job.
      3. **Experience**: ${hasExperience
        ? 'For each job in the resume, provide 2-3 improved bullet points that highlight impact and relevance to the new job. Match the "company" name exactly.'
        : 'Create 2 relevant professional experience entries that would make this candidate a strong fit for the job. Use realistic but generic company names (e.g., "Tech Solutions Inc", "Global Corp") and dates.'}
      4. **Projects**: Generate 2-3 relevant side projects or academic projects that demonstrate skills required for this job.

      OUTPUT FORMAT:
      Return ONLY a valid JSON object with this structure:
      {
        "summary": "New summary text...",
        "skills": ["Skill 1", "Skill 2", ...],
        "experience": [
          { "company": "Company Name", "role": "Job Title", "location": "City, State", "startDate": "YYYY", "endDate": "YYYY", "bullets": ["Bullet 1", "Bullet 2"] }
        ],
        "projects": [
          { "title": "Project Title", "subtitle": "Technologies Used", "description": "Brief description of what was built and its impact.", "technologies": ["Tech 1", "Tech 2"] }
        ]
      }
    `;

    try {
      console.log('Sending surgical update prompt to backend...');
      const response = await this.callBackend('generate-resume', { input: prompt });

      let text = typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
      console.log('Processed text for parsing:', text);

      let updates;
      try {
        updates = this.parseAIResponse(text);
        console.log('Parsed updates:', updates);
      } catch (parseError) {
        console.warn("AI response parsing failed, using text fallback:", parseError);
        // Fallback: If JSON fails, treat the whole text as a summary
        updates = { summary: text.substring(0, 500) + "..." };
      }

      // MERGE LOGIC
      const newResume = JSON.parse(JSON.stringify(userResume)); // Deep copy

      // 1. Update Summary
      if (updates.summary) {
        const summarySection = newResume.sections.find(s => s.id === 'summary');
        if (summarySection) {
          summarySection.content = updates.summary;
        } else {
          // Add if missing
          newResume.sections.unshift({ id: 'summary', title: 'Professional Summary', content: updates.summary });
        }
      }

      // 2. Update Skills
      if (updates.skills && Array.isArray(updates.skills)) {
        const skillsSection = newResume.sections.find(s => s.id === 'skills');
        if (skillsSection) {
          skillsSection.items = updates.skills;
        }
      }

      // 3. Update Experience
      if (updates.experience && Array.isArray(updates.experience)) {
        const expSection = newResume.sections.find(s => s.id === 'experience');
        if (expSection) {
          if (expSection.items.length === 0) {
            // If original was empty, add the generated ones
            expSection.items = updates.experience.map(item => ({
              id: 'exp-' + Math.random().toString(36).substr(2, 9),
              role: item.role || 'Professional',
              company: item.company || 'Company',
              location: item.location || 'Remote',
              startDate: item.startDate || '2020',
              endDate: item.endDate || 'Present',
              bullets: item.bullets || []
            }));
          } else {
            // Update existing
            updates.experience.forEach(updateItem => {
              // Fuzzy match company name or exact match
              const originalItem = expSection.items.find(item =>
                item.company.toLowerCase().includes(updateItem.company.toLowerCase()) ||
                updateItem.company.toLowerCase().includes(item.company.toLowerCase())
              );

              if (originalItem && updateItem.bullets && Array.isArray(updateItem.bullets)) {
                originalItem.bullets = updateItem.bullets;
              }
            });
          }
        }
      }

      // 4. Update Projects
      if (updates.projects && Array.isArray(updates.projects)) {
        const projSection = newResume.sections.find(s => s.id === 'projects');
        if (projSection) {
          // Always replace/add projects as they are specific to the JD
          projSection.items = updates.projects.map(item => ({
            id: 'proj-' + Math.random().toString(36).substr(2, 9),
            title: item.title || 'Project',
            subtitle: item.subtitle || 'Technologies',
            description: item.description || '',
            technologies: item.technologies || []
          }));
        } else {
          // Add projects section if missing
          newResume.sections.push({
            id: 'projects',
            title: 'Projects',
            items: updates.projects.map(item => ({
              id: 'proj-' + Math.random().toString(36).substr(2, 9),
              title: item.title || 'Project',
              subtitle: item.subtitle || 'Technologies',
              description: item.description || '',
              technologies: item.technologies || []
            }))
          });
        }
      }

      return newResume;

    } catch (error) {
      console.error('Error generating custom resume:', error);
      return userResume; // Return original on fatal error
    }
  }

  static async generateCoverLetter(jobDescription, userResume) {
    // ENHANCED PROMPT for better quality
    const prompt = `
      Write a highly personalized and professional cover letter for the following job.
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      MY RESUME:
      ${JSON.stringify(userResume)}
      
      INSTRUCTIONS:
      1. **Tone**: Professional, enthusiastic, and confident.
      2. **Structure**:
         - **Opening**: State the role applied for and why I am a great fit.
         - **Body Paragraph 1**: Highlight specific achievements from my resume that match the job requirements.
         - **Body Paragraph 2**: Explain why I am interested in this specific company/role.
         - **Closing**: Call to action (request interview) and professional sign-off.
      3. **Specifics**: Use actual numbers and metrics from my resume. Do NOT use placeholders like "[Company Name]" - extract the company name from the job description.
      4. **Length**: 300-400 words.
      
      Return ONLY the cover letter text.
    `;

    try {
      const response = await this.callBackend('generate-cover-letter', { input: prompt });
      return typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
    } catch (error) {
      console.error("Error generating cover letter:", error);
      return "Dear Hiring Manager,\n\nI am writing to express my interest in the position. Please find my resume attached.\n\nSincerely,\n[Your Name]";
    }
  }

  static async generateMockInterviewQuestions(jobDescription, userResume) {
    const prompt = `Generate 5 interview questions for this job and resume. Return JSON array of strings. Job: ${jobDescription} Resume: ${JSON.stringify(userResume)}`;
    try {
      const response = await this.callBackend('mock-interview', { messages: [{ role: "user", content: prompt }] });
      let text = typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
      return this.parseAIResponse(text);
    } catch (error) {
      return ["Tell me about yourself."];
    }
  }

  static async analyzeInterviewAnswer(question, answer) {
    const prompt = `Analyze answer: "${answer}" for question: "${question}". Return JSON: { rating, feedback, improvedAnswer }`;
    try {
      const response = await this.callBackend('mock-interview', { messages: [{ role: "user", content: prompt }] });
      let text = typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
      return this.parseAIResponse(text);
    } catch (error) {
      return { rating: 0, feedback: "Error analyzing" };
    }
  }

  static async generateNextInterviewQuestion(role, lastQuestion, lastAnswer) {
    const prompt = `Role: ${role}. Last Q: ${lastQuestion}. Last A: ${lastAnswer}. Next Question?`;
    try {
      const response = await this.callBackend('mock-interview', { messages: [{ role: "user", content: prompt }] });
      let text = typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
      return text.trim();
    } catch (error) {
      return "Could you elaborate?";
    }
  }

  static async generateInterviewInsights(jobDescription, userResume, questions) {
    const prompt = `Insights for Job: ${jobDescription}, Resume: ${JSON.stringify(userResume)}. Return JSON: { overallScore, strengths, areasForImprovement, recommendations }`;
    try {
      const response = await this.callBackend('mock-interview', { messages: [{ role: "user", content: prompt }] });
      let text = typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
      return this.parseAIResponse(text);
    } catch (error) {
      return { overallScore: 0, strengths: [], recommendations: [] };
    }
  }
  static async generateTailoredResumeMarkdown(jobDescription, userResume) {
    // Extract candidate info for the prompt
    const personalInfo = userResume?.personalInfo || {}
    const name = personalInfo.name || 'Professional'
    const email = personalInfo.email || 'email@example.com'
    const phone = personalInfo.phone || ''
    const location = personalInfo.location || ''
    const linkedin = personalInfo.linkedin || ''
    const github = personalInfo.github || ''

    const sections = userResume?.sections || []
    const experienceSection = sections.find(s => s.id === 'experience')
    const educationSection = sections.find(s => s.id === 'education')
    const skillsSection = sections.find(s => s.id === 'skills')
    const summarySection = sections.find(s => s.id === 'summary')

    const prompt = `You are a professional resume writer. Create a complete, tailored resume in Markdown format.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE DETAILS:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Location: ${location || 'Not provided'}
LinkedIn: ${linkedin || 'Not provided'}
GitHub: ${github || 'Not provided'}

${summarySection ? `Summary: ${summarySection.content}` : ''}

${skillsSection ? `Skills: ${JSON.stringify(skillsSection.items || [])}` : ''}

${experienceSection ? `Experience: ${JSON.stringify(experienceSection.items || [])}` : ''}

${educationSection ? `Education: ${JSON.stringify(educationSection.items || [])}` : ''}

CRITICAL INSTRUCTIONS:
1. Generate a COMPLETE, ACTUAL resume - NOT a template, guide, or example
2. Start immediately with: # ${name}
3. Use the candidate's actual information provided above
4. If information is missing, create realistic professional content that matches the job description
5. Structure exactly as shown below - replace placeholders with actual content
6. Include at least 500 words of detailed, professional content
7. Tailor ALL content to match keywords and requirements from the job description
8. Use strong action verbs and include metrics/quantifiable achievements
9. NO introductory text, NO explanations, NO "here is a resume" - just the resume content

OUTPUT FORMAT (use actual data, not placeholders):

# ${name}

**Email:** ${email}${phone ? ` | **Phone:** ${phone}` : ''}${location ? ` | **Location:** ${location}` : ''}
${linkedin ? `**LinkedIn:** ${linkedin}` : ''}${github ? ` | **GitHub:** ${github}` : ''}

---

## PROFESSIONAL SUMMARY

[Write 4-5 detailed sentences (80-100 words) highlighting the candidate's experience, achievements, and expertise relevant to this specific job. Use information from the candidate details above. If missing, create professional content based on the job requirements.]

---

## CORE COMPETENCIES & TECHNICAL SKILLS

[Extract and list 15-20 relevant technical skills from the candidate's skills and job description. Group by category: Programming Languages, Frameworks & Libraries, Cloud & DevOps, Databases, Tools & Platforms]

---

## PROFESSIONAL EXPERIENCE

[For each position in the candidate's experience, or create 2-3 realistic positions if missing, format as:]

**Position Title** | **Company Name** | Location | Start Date - End Date

- [Bullet 1: Detailed achievement with metrics and impact, 15-25 words]
- [Bullet 2: Detailed achievement with metrics and impact, 15-25 words]
- [Bullet 3: Detailed achievement with metrics and impact, 15-25 words]
- [Bullet 4: Detailed achievement with metrics and impact, 15-25 words]

[Repeat for each position. Include 4-6 bullets per position.]

---

## EDUCATION

**Degree Name** | **University Name** | Graduation Year
[Relevant coursework, honors, or GPA if applicable]

---

## PROJECTS

**Project Name** | Technologies Used
- [Detailed project description with impact and technologies]

---

## CERTIFICATIONS

- [Relevant certification 1]
- [Relevant certification 2]

REMEMBER: Output ONLY the resume content starting with "# ${name}". No other text before or after.`;

    try {
      // Extract job title and company from description if possible
      const jobTitleMatch = jobDescription.match(/(?:Title|Position|Role):\s*([^\n]+)/i);
      const companyMatch = jobDescription.match(/(?:Company|Organization):\s*([^\n]+)/i);

      const response = await this.callBackend('generate-resume', {
        input: prompt,
        resume: userResume,
        jobDescription: jobDescription,
        jobTitle: jobTitleMatch ? jobTitleMatch[1].trim() : 'Position',
        companyName: companyMatch ? companyMatch[1].trim() : 'Company',
        mode: 'markdown'
      });

      // Handle different response types
      let markdownText = response;
      if (typeof response === 'object') {
        markdownText = response.content || response.text || JSON.stringify(response);
      }

      // Ensure we have valid markdown
      if (!markdownText || typeof markdownText !== 'string' || markdownText.trim().length < 100) {
        throw new Error('Generated resume is too short or invalid. Please try again.');
      }

      return markdownText;
    } catch (error) {
      console.error("Error generating markdown resume:", error);
      throw error;
    }
  }

  static parseResumeMarkdown(markdown, originalResume) {
    // Helper to extract section content
    const extractSection = (header) => {
      const regex = new RegExp(`#{1,3}\\s*${header}[\\s\\S]*?(?=#{1,3}|$)`, 'i');
      const match = markdown.match(regex);
      return match ? match[0].replace(new RegExp(`#{1,3}\\s*${header}`, 'i'), '').trim() : '';
    };

    // Helper to parse bullets
    const parseBullets = (text) => {
      return text.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-*•]\s*/, '').trim());
    };

    const resume = JSON.parse(JSON.stringify(originalResume)); // Start with original to keep personal info safe if parsing fails

    // 1. Summary
    const summaryText = extractSection('Summary') || extractSection('Professional Summary') || extractSection('Profile');
    if (summaryText) {
      const summarySection = resume.sections.find(s => s.id === 'summary');
      if (summarySection) summarySection.content = summaryText;
    }

    // 2. Skills
    const skillsText = extractSection('Skills') || extractSection('Technical Skills');
    if (skillsText) {
      const skillsSection = resume.sections.find(s => s.id === 'skills');
      if (skillsSection) {
        // Try to split by comma or newline
        const skills = skillsText.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('-'));
        if (skills.length > 0) skillsSection.items = skills;
      }
    }

    // 3. Experience (Complex parsing)
    const experienceText = extractSection('Experience') || extractSection('Work Experience');
    if (experienceText) {
      const expSection = resume.sections.find(s => s.id === 'experience');
      if (expSection) {
        // Simple strategy: Look for lines with dates or bold text as headers
        // This is tricky. Let's try to map back to original items if possible, or create new ones.
        // For robustness, let's try to find the original companies in the text and update their bullets.

        expSection.items.forEach(item => {
          // Find the block of text for this company
          const companyRegex = new RegExp(`(.*?${item.company}.*?)(?=\n.*?\\||\n.*?\\d{4}|$)`, 'is');
          // This is too hard to regex perfectly.
          // Alternative: Just ask AI for JSON? No, we want robust text.
          // Let's just use the markdown text for the "Copy" feature, and for the PDF...
          // For the PDF, we might just have to do our best or leave the original experience if parsing fails.

          // Let's try a simpler approach: Split by double newlines and look for keywords.
          // Actually, for the PDF, if we can't parse perfectly, we might just want to put the whole text block in? No, structure is needed.

          // Let's try to find the company name in the markdown
          const companyIndex = experienceText.indexOf(item.company);
          if (companyIndex !== -1) {
            // Look ahead for bullets until the next double newline or header
            const slice = experienceText.substring(companyIndex);
            const endOfBlock = slice.search(/\n\n|#{1,3}/);
            const block = slice.substring(0, endOfBlock === -1 ? slice.length : endOfBlock);
            const bullets = parseBullets(block);
            if (bullets.length > 0) item.bullets = bullets;
          }
        });
      }
    }

    return { parsedResume: resume, markdown: markdown };
  }
}
