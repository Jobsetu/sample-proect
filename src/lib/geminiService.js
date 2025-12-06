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
      const response = await this.callBackend('generate-resume', {
        input: prompt,
        mode: 'custom'
      });
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
    // STRATEGY: FULL AI REWRITE
    // Generate completely new, ATS-optimized content for ALL sections
    // based on the job description and user's background

    const hasExperience = userResume.sections?.find(s => s.id === 'experience')?.items?.length > 0;
    const userName = userResume.personalInfo?.name || 'Professional';

    // Always regenerate ALL key sections
    const sectionsToGenerate = ['summary', 'skills', 'experience', 'projects', 'education'];

    const prompt = `You are an EXPERT ATS (Applicant Tracking System) resume writer. Your job is to COMPLETELY REWRITE this resume to maximize the candidate's chances of getting an interview.

=== JOB DESCRIPTION ===
${jobDescription}

=== CANDIDATE'S BACKGROUND ===
${JSON.stringify(userResume.sections, null, 2)}

=== YOUR TASK ===
Create a COMPLETELY NEW, ATS-OPTIMIZED resume. DO NOT just copy or rephrase the existing content. REWRITE everything to perfectly match this job.

=== SKILLS EXTRACTION (CRITICAL) ===
**YOU MUST GENERATE SKILLS.** Analyze the job description and extract:
1. ALL technical skills mentioned (programming languages, frameworks, tools)
2. ALL soft skills mentioned (leadership, communication, problem-solving)
3. Industry-specific keywords and technologies
4. Combine with relevant skills from candidate's background

Skills MUST be a flat array of 10-15 strings. Example: ["Python", "JavaScript", "React", "AWS", "Docker", "SQL", "Leadership", "Agile", "CI/CD", "REST APIs"]

=== PROJECTS (CRITICAL - 3-5 BULLETS EACH) ===
Generate 2-3 projects. EACH project MUST have EXACTLY 3-5 bullet points:
- Bullet 1: What you built and the problem it solved (with metrics if possible)
- Bullet 2: Technical implementation details and technologies used
- Bullet 3: Key challenges overcome and solutions implemented
- Bullet 4: Measurable results and impact (users, performance, cost savings)
- Bullet 5: Skills/technologies demonstrated matching job requirements

=== ATS OPTIMIZATION RULES ===
1. **KEYWORDS**: Extract 10-15 key skills/technologies from the job description and weave them naturally into every section
2. **STAR METHOD**: For each experience bullet, use: Situation → Task → Action → Result (with NUMBERS)
3. **POWER VERBS**: Start each bullet with strong action verbs (Led, Developed, Increased, Reduced, Implemented, etc.)
4. **QUANTIFY EVERYTHING**: Add specific metrics (%, $, time saved, users impacted, team size, etc.)

=== REQUIRED OUTPUT FORMAT (JSON) ===
Return ONLY valid JSON. No markdown, no explanations. Start with { and end with }

{
  "summary": "A powerful 3-4 sentence professional summary that highlights the candidate's fit for THIS SPECIFIC role. Mention key technologies and achievements.",
  
  "skills": ["Python", "JavaScript", "React", "Node.js", "AWS", "Docker", "SQL", "Git", "CI/CD", "REST APIs", "Agile", "Leadership"],
  
  "experience": [
    {
      "company": "Exact company name from resume",
      "role": "Optimized job title (can enhance slightly to match target role)",
      "location": "City, State",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY or Present",
      "bullets": [
        "STAR-method bullet point with specific metrics and job-relevant keywords",
        "Another STAR bullet highlighting achievements relevant to target job",
        "Third bullet demonstrating skills matching job requirements",
        "Fourth bullet with measurable business impact"
      ]
    }
  ],
  
  "projects": [
    {
      "title": "Project Name",
      "subtitle": "Technologies Used (e.g., React, Node.js, AWS)",
      "description": "Brief 1-line project overview",
      "bullets": [
        "Built [specific feature/system] that solved [problem], resulting in [metric] improvement",
        "Implemented [technology stack] with [specific technical details] for [purpose]",
        "Overcame [challenge] by developing [solution] using [technologies]",
        "Achieved [measurable result] impacting [number] users/reducing costs by [amount]",
        "Demonstrated proficiency in [skills from job description] through [specific implementation]"
      ]
    },
    {
      "title": "Second Project Name",
      "subtitle": "Technologies Used",
      "description": "Brief project overview",
      "bullets": [
        "Developed [feature] addressing [business need] with [technology]",
        "Architected [system/component] using [frameworks/tools]",
        "Resolved [technical challenge] improving [metric] by [percentage]",
        "Delivered [outcome] for [stakeholders/users]",
        "Applied [job-relevant skills] in [practical context]"
      ]
    }
  ],
  
  "education": [
    {
      "degree": "Degree Name",
      "school": "Institution Name",
      "location": "City, State",
      "year": "Year",
      "gpa": "GPA if good (3.5+), otherwise omit"
    }
  ]
}

=== CRITICAL RULES ===
- Skills array MUST have 10-15 items - extract from job description + candidate background
- Skills MUST be simple strings, NOT objects
- Each project MUST have EXACTLY 3-5 bullet points - this is REQUIRED
- Each experience entry MUST have 3-4 bullet points with NUMBERS
- DO NOT copy existing bullets - REWRITE with metrics and keywords
- Summary should mention the target role/company context
- If job description lacks specific skills, infer common skills for that role type

GENERATE THE JSON NOW:`;

    try {
      console.log('[AI Resume] Sending full rewrite prompt to backend...');
      const response = await this.callBackend('generate-resume', {
        input: prompt,
        mode: 'custom',
        resume: userResume
      });
      // Backend returns {output: jsonString, source: "ai"}
      // callBackend already extracts .output, so response should be the JSON string
      console.log('[AI Resume] Raw response type:', typeof response);
      console.log('[AI Resume] Raw response preview:', typeof response === 'string' ? response.substring(0, 200) : JSON.stringify(response).substring(0, 200));

      let text = response;
      if (typeof response === 'object' && response !== null) {
        // Handle various possible formats
        text = response.output || response.content || response.text || JSON.stringify(response);
      }
      console.log('[AI Resume] Extracted text preview:', text.substring(0, 300));

      let updates;
      try {
        updates = this.parseAIResponse(text);
        console.log('[AI Resume] Parsed updates keys:', Object.keys(updates));

        // KEY NORMALIZATION: Handle AI variations
        if (!updates.skills) {
          const skillKey = Object.keys(updates).find(k =>
            k.toLowerCase() === 'skills' ||
            k.toLowerCase().includes('technical') ||
            k.toLowerCase().includes('competencies') ||
            k.toLowerCase().includes('technologies')
          );
          if (skillKey && Array.isArray(updates[skillKey])) {
            console.log(`[AI Resume] Found skills in alternate key: ${skillKey}`);
            updates.skills = updates[skillKey];
          }
        }
      } catch (parseError) {
        console.warn("AI response parsing failed, using text fallback:", parseError);
        updates = { summary: text.substring(0, 500) + "..." };
      }

      // MERGE LOGIC
      const newResume = JSON.parse(JSON.stringify(userResume)); // Deep copy

      // DEFENSIVE: Ensure sections array exists
      if (!newResume.sections || !Array.isArray(newResume.sections)) {
        console.log('[AI Resume] Initializing empty sections array');
        newResume.sections = [];
      }

      console.log('[AI Resume] Starting merge. Current sections:', newResume.sections.map(s => s.id));

      // Helper to extract string content from potentially nested object
      const extractContent = (value) => {
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null) {
          return value.content || value.text || value.summary || JSON.stringify(value);
        }
        return String(value || '');
      };

      // 1. Update Summary - SANITIZE nested object!
      if (updates.summary) {
        let summaryContent = extractContent(updates.summary);
        // Handle double-nested case: {title, content: {title, content}}
        if (typeof updates.summary === 'object' && updates.summary.content) {
          summaryContent = extractContent(updates.summary.content);
        }

        const summarySection = newResume.sections.find(s => s.id === 'summary');
        if (summarySection) {
          summarySection.content = summaryContent;
        } else {
          // Add if missing
          newResume.sections.unshift({ id: 'summary', title: 'Professional Summary', content: summaryContent });
        }
      }

      // 2. Update Skills - Handle multiple AI response formats
      console.log('[AI Resume] === SKILLS DEBUG START ===');
      console.log('[AI Resume] updates object keys:', Object.keys(updates));
      console.log('[AI Resume] updates.skills:', updates.skills);
      console.log('[AI Resume] updates.skills type:', typeof updates.skills);
      console.log('[AI Resume] updates.skills isArray:', Array.isArray(updates.skills));

      // Extract skills array from various possible formats
      let skillsArray = [];
      if (Array.isArray(updates.skills)) {
        skillsArray = updates.skills;
        console.log('[AI Resume] Got skills from updates.skills array:', skillsArray.length, 'items');
      } else if (updates.skills && typeof updates.skills === 'object') {
        // Handle {items: [...]} or {skills: [...]} format
        skillsArray = updates.skills.items || updates.skills.skills || Object.values(updates.skills).flat();
        console.log('[AI Resume] Got skills from nested object:', skillsArray.length, 'items');
      }

      console.log('[AI Resume] Final skillsArray:', skillsArray.slice(0, 5), '... total:', skillsArray.length);

      // FALLBACK: If no skills from AI, extract from job description
      if (skillsArray.length === 0) {
        console.log('[AI Resume] No skills from AI, extracting from job description...');
        const commonTechSkills = [
          'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
          'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Next.js',
          'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform',
          'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'GraphQL',
          'Machine Learning', 'AI', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP',
          'Agile', 'Scrum', 'DevOps', 'Microservices', 'REST', 'API', 'Git', 'Linux'
        ];

        const jobDescLower = jobDescription.toLowerCase();
        const extractedSkills = commonTechSkills.filter(skill =>
          jobDescLower.includes(skill.toLowerCase())
        );

        // Add some default skills if still empty
        if (extractedSkills.length < 5) {
          const defaultSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git', 'REST APIs', 'Agile'];
          extractedSkills.push(...defaultSkills.filter(s => !extractedSkills.includes(s)).slice(0, 10 - extractedSkills.length));
        }

        skillsArray = extractedSkills;
        console.log('[AI Resume] Extracted skills from job description:', skillsArray);
      }

      if (skillsArray.length > 0) {
        // Process skills first
        const processedSkills = skillsArray.map(skill => {
          if (typeof skill === 'string') return skill;
          if (typeof skill === 'object' && skill !== null) {
            return skill.name || skill.label || skill.skill || skill.value || skill.title || String(skill);
          }
          return String(skill);
        }).filter(s => s && s.length > 0);

        console.log('[AI Resume] Processed skills:', processedSkills);

        // Find or create skills section
        let skillsSectionIndex = newResume.sections.findIndex(s => s.id === 'skills');

        if (skillsSectionIndex === -1) {
          // Create and insert skills section after summary
          const summaryIndex = newResume.sections.findIndex(s => s.id === 'summary');
          const newSkillsSection = { id: 'skills', title: 'Skills', items: processedSkills };

          if (summaryIndex >= 0) {
            newResume.sections.splice(summaryIndex + 1, 0, newSkillsSection);
          } else {
            newResume.sections.unshift(newSkillsSection);
          }
          console.log('[AI Resume] Created new Skills section with', processedSkills.length, 'skills');
        } else {
          // Update existing section
          newResume.sections[skillsSectionIndex].items = processedSkills;
          console.log('[AI Resume] Updated existing Skills section with', processedSkills.length, 'skills');
        }
      } else {
        console.warn('[AI Resume] No skills found in AI response');
      }

      // 3. Update Experience - ALWAYS replace with AI-generated content
      if (updates.experience && Array.isArray(updates.experience)) {
        let expSection = newResume.sections.find(s => s.id === 'experience');
        if (!expSection) {
          expSection = { id: 'experience', title: 'Professional Experience', items: [] };
          newResume.sections.push(expSection);
        }

        // COMPLETELY REPLACE with AI-generated experience
        expSection.items = updates.experience.map((item, index) => ({
          id: 'exp-' + Math.random().toString(36).substr(2, 9),
          role: item.role || item.title || 'Professional',
          company: item.company || 'Company',
          location: item.location || '',
          startDate: item.startDate || '',
          endDate: item.endDate || 'Present',
          bullets: Array.isArray(item.bullets) ? item.bullets : []
        }));

        console.log('[AI Resume] Replaced experience with', expSection.items.length, 'AI-generated entries');
      }

      // 4. Update Projects - Ensure 3-5 bullets per project
      if (updates.projects && Array.isArray(updates.projects)) {
        let projSection = newResume.sections.find(s => s.id === 'projects');
        if (!projSection) {
          projSection = { id: 'projects', title: 'Projects', items: [] };
          newResume.sections.push(projSection);
        }

        // Always replace/add projects as they are specific to the JD
        projSection.items = updates.projects.map(item => {
          let bullets = Array.isArray(item.bullets) ? item.bullets : [];
          const title = item.title || 'Project';
          const tech = item.subtitle || item.technologies?.join(', ') || 'Various Technologies';

          // Ensure at least 3 bullets per project
          if (bullets.length < 3) {
            const defaultBullets = [
              `Built ${title} to address key business needs, resulting in improved efficiency and user satisfaction`,
              `Implemented using ${tech} with focus on scalability, clean architecture, and best practices`,
              `Overcame technical challenges through innovative problem-solving and iterative development`,
              `Achieved measurable improvements in performance metrics and overall system reliability`,
              `Demonstrated proficiency in full-stack development, testing, and agile methodologies`
            ];
            // Add missing bullets
            while (bullets.length < 3) {
              bullets.push(defaultBullets[bullets.length]);
            }
            console.log(`[AI Resume] Added fallback bullets to project "${title}", now has ${bullets.length} bullets`);
          }

          return {
            id: 'proj-' + Math.random().toString(36).substr(2, 9),
            title: title,
            subtitle: item.subtitle || 'Technologies',
            description: item.description || '',
            bullets: bullets.slice(0, 5), // Cap at 5 bullets
            technologies: item.technologies || []
          };
        });

        console.log('[AI Resume] Generated', projSection.items.length, 'projects with proper bullets');
      }

      // 5. Update Education
      if (updates.education) {
        const eduSection = newResume.sections.find(s => s.id === 'education');
        if (eduSection) {
          // If array, take first item or map. If object, use directly.
          if (Array.isArray(updates.education)) {
            // If the update returns an array, replace items
            eduSection.items = updates.education;
          } else if (typeof updates.education === 'object') {
            // If it returns a single object, assume it's the first item
            if (eduSection.items.length > 0) {
              Object.assign(eduSection.items[0], updates.education);
            } else {
              eduSection.items = [updates.education];
            }
          }
        }
      }

      // 6. Update Activities
      if (updates.activities && Array.isArray(updates.activities)) {
        const actSection = newResume.sections.find(s => s.id === 'activities');
        if (actSection) {
          actSection.items = updates.activities;
        } else {
          newResume.sections.push({
            id: 'activities',
            title: 'Activities',
            items: updates.activities
          });
        }
      }

      // Final verification
      const finalSkills = newResume.sections.find(s => s.id === 'skills');
      console.log('[AI Resume] FINAL: Skills section:', finalSkills ? `${finalSkills.items?.length} items` : 'NOT FOUND');
      console.log('[AI Resume] FINAL: All sections:', newResume.sections.map(s => ({ id: s.id, itemCount: s.items?.length })));

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
    1. ** Tone **: Professional, enthusiastic, and confident.
      2. ** Structure **:
         - ** Opening **: State the role applied for and why I am a great fit.
         - ** Body Paragraph 1 **: Highlight specific achievements from my resume that match the job requirements.
         - ** Body Paragraph 2 **: Explain why I am interested in this specific company / role.
         - ** Closing **: Call to action(request interview) and professional sign - off.
      3. ** Specifics **: Use actual numbers and metrics from my resume.Do NOT use placeholders like "[Company Name]" - extract the company name from the job description.
      4. ** Length **: 300 - 400 words.
      
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
    const prompt = `Generate 5 interview questions for this job and resume.Return JSON array of strings.Job: ${jobDescription} Resume: ${JSON.stringify(userResume)} `;
    try {
      const response = await this.callBackend('mock-interview', { messages: [{ role: "user", content: prompt }] });
      let text = typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
      return this.parseAIResponse(text);
    } catch (error) {
      return ["Tell me about yourself."];
    }
  }

  static async analyzeInterviewAnswer(question, answer) {
    const prompt = `Analyze answer: "${answer}" for question: "${question}".Return JSON: { rating, feedback, improvedAnswer } `;
    try {
      const response = await this.callBackend('mock-interview', { messages: [{ role: "user", content: prompt }] });
      let text = typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
      return this.parseAIResponse(text);
    } catch (error) {
      return { rating: 0, feedback: "Error analyzing" };
    }
  }

  static async generateNextInterviewQuestion(role, lastQuestion, lastAnswer) {
    const prompt = `Role: ${role}. Last Q: ${lastQuestion}. Last A: ${lastAnswer}. Next Question ? `;
    try {
      const response = await this.callBackend('mock-interview', { messages: [{ role: "user", content: prompt }] });
      let text = typeof response === 'object' ? (response.content || JSON.stringify(response)) : response;
      return text.trim();
    } catch (error) {
      return "Could you elaborate?";
    }
  }

  static async generateInterviewInsights(jobDescription, userResume, questions) {
    const prompt = `Insights for Job: ${jobDescription}, Resume: ${JSON.stringify(userResume)}. Return JSON: { overallScore, strengths, areasForImprovement, recommendations } `;
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

    const prompt = `You are an expert resume writer and ATS optimization specialist. Your mission is to transform the candidate's background into a highly targeted resume that positions them as the PERFECT match for this specific job.

=== PHASE 1: ANALYZE THE JOB ===

JOB DESCRIPTION:
${jobDescription}

First, carefully analyze this job description and identify:
1. Top 10 MUST-HAVE technical skills, tools, and technologies
2. Top 5 key responsibilities and required competencies
3. Required experience level (entry/mid/senior) and years
4. Industry-specific keywords, buzzwords, and terminology
5. Soft skills mentioned or implied (leadership, communication, etc.)

=== PHASE 2: CANDIDATE'S BACKGROUND ===

Personal Information:
- Name: ${name}
- Email: ${email}
- Phone: ${phone || '(555) 123-4567'}
- Location: ${location || 'City, State'}
- LinkedIn: ${linkedin || 'linkedin.com/in/profile'}
- GitHub: ${github || 'github.com/profile'}

${summarySection ? `Current Summary: ${summarySection.content}` : 'No summary provided'}

${skillsSection ? `Current Skills: ${JSON.stringify(skillsSection.items || [])}` : 'No skills listed'}

${experienceSection ? `Work Experience: ${JSON.stringify(experienceSection.items || [])}` : 'No experience provided'}

${educationSection ? `Education: ${JSON.stringify(educationSection.items || [])}` : 'No education provided'}

=== PHASE 3: GENERATE OPTIMIZED, JOB-TARGETED RESUME ===

CRITICAL TRANSFORMATION RULES - READ CAREFULLY:

1. **Preserve ONLY These Facts**: Company names, job titles, dates from candidate's history, university names, degree names
2. **DO NOT COPY/REUSE**: NEVER copy the candidate's original bullet points, descriptions, or summary text
3. **Generate Fresh Content**: Write COMPLETELY NEW achievement descriptions that:
   - Use different wording than the candidate provided
   - Add specific metrics and numbers (%, $, user counts, time saved)
   - Emphasize outcomes relevant to the TARGET JOB (not just what candidate did)
   - Include technologies and keywords from the job description

4. **Keyword Integration Strategy**:
   - Identify top 10-15 keywords from job description
   - Naturally weave these throughout summary, experience bullets, and skills
   - Don't force-fit keywords - make it read naturally

5. **Quantification Requirements**:
   - EVERY bullet must include at least one specific metric
   - Examples: "40% reduction", "500K+ users", "$2M cost savings", "15-person team"
   - If candidate didn't provide metrics, create reasonable professional estimates

8. **Language Transformation (ATS Friendly)**:
   - Start EVERY bullet with strong power verbs: Led, Architected, Drove, Spearheaded, Delivered, Optimized
   - Use the **STAR Method** (Situation, Task, Action, Result) structure implicitly
   - Write in past tense for previous roles, present tense for current role
   - Be specific and concrete - avoid vague terms like "worked on" or "helped with"

7. **Job-Relevance Focus**:
   - For EACH bullet, ask: "Does this showcase a skill/achievement the job requires?"
   - If a candidate's experience doesn't directly match, reframe it to highlight transferable skills
   - Example: If they built internal tools but job needs customer-facing features, emphasize UI/UX, performance, scalability

8. **Skills Enhancement**:
   - Prioritize skills from job description FIRST
   - Group into logical categories
   - Add related/complementary technologies that strengthen candidacy
   - Remove skills irrelevant to target role

EXAMPLES OF GOOD TRANSFORMATION:

❌ BAD (Just reformatted original):
"Worked on website builder platform and improved user experience"

✅ GOOD (New, targeted content):
"Architected drag-and-drop website builder serving 50K+ users monthly, reducing average site creation time from 4 hours to 45 minutes through intuitive component library and real-time preview functionality"

❌ BAD (Copied from candidate):
"Automated platform features and reduced manual effort"

✅ GOOD (Specific, quantified, job-targeted):
"Engineered automation framework using Node.js and AWS Lambda to eliminate 80% of manual deployment tasks, accelerating release cycles from bi-weekly to daily while reducing production incidents by 65%"

CONTENT REQUIREMENTS:
- Minimum 600 words of rich, detailed content
- Summary: 4-5 compelling sentences (80-100 words) laser-focused on THIS role
- Each job: 4-6 achievement-oriented bullets with specific metrics
- Each bullet: 18-30 words with measurable impact
- Skills: 15-25 skills organized by category, prioritizing job description keywords
- Professional, confident tone that demonstrates expertise

WARNING: If you simply reformat or slightly reword the candidate's original text, you have FAILED this task. Generate FRESH, JOB-SPECIFIC content.

OUTPUT FORMAT - Write ONLY the resume markdown starting immediately with:

# ${name}

**Email:** ${email} | **Phone:** ${phone || '(555) 123-4567'} | **Location:** ${location || 'City, State'}
${linkedin ? `**LinkedIn:** ${linkedin} | ` : ''}${github ? `**GitHub:** ${github}` : ''}

---

## PROFESSIONAL SUMMARY

[Write a powerful, job-specific summary that positions the candidate as the ideal fit. Naturally incorporate 3-5 top keywords from the job description. Focus on their unique value proposition for THIS specific role and how their background makes them perfect for this opportunity.]

---

## CORE COMPETENCIES & TECHNICAL SKILLS

**THIS SECTION IS REQUIRED - DO NOT SKIP**
[You MUST list 15-25 skills organized by relevant categories. Extract ALL skills mentioned in the job description. Format as:]
**Programming Languages:** [List 4-6 languages from job description or relevant to the role]
**Frameworks & Libraries:** [List 4-6 frameworks/libraries mentioned or implied in job]
**Cloud & DevOps:** [List 3-5 cloud/devops tools if mentioned]
**Databases:** [List 2-4 database technologies if applicable]
**Tools & Platforms:** [List 3-5 tools/platforms]
**Soft Skills:** [List 3-5 soft skills like Leadership, Communication, Problem-solving if mentioned]

---

## PROFESSIONAL EXPERIENCE

[For EACH position in the candidate's work history, preserve the company, title, location and dates but COMPLETELY REWRITE the achievements. Format as:]

**{exact position title from candidate}** | **{exact company name from candidate}** | {location} | {exact dates from candidate}

- [Achievement bullet emphasizing IMPACT with specific metrics - rewritten to highlight relevance to target role keywords, 20-30 words, start with action verb]
- [Achievement bullet demonstrating LEADERSHIP or SCALE - mention team size, project scope, or systems complexity, 20-30 words]
- [Achievement bullet showcasing TECHNICAL DEPTH - reference specific technologies from job description if they could have been used, 20-30 words]
- [Achievement bullet highlighting BUSINESS VALUE - connect to revenue growth, cost savings, efficiency gains, or user satisfaction, 20-30 words]
- [Additional achievement bullet for senior roles - emphasize strategic thinking, architecture decisions, or mentorship, 20-30 words]
- [Optional 6th bullet for exceptional achievements or critical accomplishments, 20-30 words]

[Repeat this exact format for each position in candidate's history. If candidate has no experience, create 2-3 realistic professional experiences that would make them competitive for this role.]

---

## EDUCATION

**{exact degree from candidate}** | **{exact school from candidate}** | {exact year from candidate}
[If relevant to the job, add: "Relevant Coursework: {courses that match job requirements}"]

---

## PROJECTS & CERTIFICATIONS

**THIS SECTION IS REQUIRED - Generate 2-3 projects with 3-5 bullets EACH**

**{Project Name 1}** | {Technologies matching job description}
- [Bullet 1: What you built and the problem it solved, with specific metrics or user impact]
- [Bullet 2: Technical implementation details - specific technologies, architecture, frameworks used]
- [Bullet 3: Key challenges overcome and solutions implemented]
- [Bullet 4: Measurable results - users served, performance improvements, cost savings achieved]
- [Bullet 5: Skills demonstrated that directly match the job requirements]

**{Project Name 2}** | {Different technologies matching job description}
- [Bullet 1: What you built and the problem it solved, with specific metrics or user impact]
- [Bullet 2: Technical implementation details and architecture decisions]
- [Bullet 3: How you overcame specific technical challenges]
- [Bullet 4: Quantifiable outcomes and results]
- [Bullet 5: Relevant skills and technologies demonstrated]

[Add relevant certifications if they match job requirements or if commonly desired in this role]

---

CRITICAL: Output ONLY the resume markdown. Start immediately with "# ${name}". No preamble, no "Here is", no explanations, no code blocks - just the pure markdown resume content.`;

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
    console.log('[parseResumeMarkdown] Starting parse, markdown length:', markdown?.length);

    // Helper to extract section content - FIXED REGEX
    const extractSection = (header) => {
      const escapedHeader = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`#{1,3}\\s*${escapedHeader}[\\s\\S]*?(?=#{1,3}\\s|$)`, 'i');
      const match = markdown.match(regex);
      if (match) {
        const content = match[0].replace(/^#{1,3}\s*[^\n]+\n?/, '').trim();
        console.log(`[parseResumeMarkdown] Extracted "${header}" section, length: ${content.length}`);
        return content;
      }
      return '';
    };

    // Helper to parse bullets
    const parseBullets = (text) => {
      return text.split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(b => b.length > 0);
    };

    const resume = JSON.parse(JSON.stringify(originalResume));

    if (!resume.sections) {
      resume.sections = [];
    }

    // 1. Summary
    const summaryText = extractSection('PROFESSIONAL SUMMARY') || extractSection('Summary') || extractSection('Profile');
    if (summaryText) {
      let summarySection = resume.sections.find(s => s.id === 'summary');
      if (!summarySection) {
        summarySection = { id: 'summary', title: 'Professional Summary', content: '' };
        resume.sections.push(summarySection);
      }
      const firstPara = summaryText.split(/\n\n|\n-|\n\*\*/)[0].trim();
      summarySection.content = firstPara;
    }

    // 2. Skills - CRITICAL: Extract skills properly
    const skillsText = extractSection('CORE COMPETENCIES') || extractSection('Technical Skills') || extractSection('Skills');
    console.log('[parseResumeMarkdown] Skills text found:', skillsText?.substring(0, 200));

    if (skillsText) {
      let skillsSection = resume.sections.find(s => s.id === 'skills');
      if (!skillsSection) {
        skillsSection = { id: 'skills', title: 'Skills', items: [] };
        resume.sections.push(skillsSection);
      }

      const skills = [];
      const lines = skillsText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        if (trimmed.includes('THIS SECTION IS REQUIRED') || trimmed.includes('DO NOT SKIP')) continue;

        if (trimmed.includes(':')) {
          const afterColon = trimmed.split(':').slice(1).join(':').trim();
          const lineSkills = afterColon.split(',').map(s =>
            s.trim()
              .replace(/\*\*/g, '')
              .replace(/`/g, '')
              .replace(/\[.*?\]/g, '')
              .trim()
          ).filter(s => s.length > 0 && s.length < 50 && !s.includes('['));
          skills.push(...lineSkills);
        } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
          const skill = trimmed.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '').trim();
          if (skill.length > 0 && skill.length < 50) {
            skills.push(skill);
          }
        } else {
          const lineSkills = trimmed.split(',').map(s =>
            s.trim()
              .replace(/\*\*/g, '')
              .replace(/`/g, '')
              .replace(/^[-•*]\s*/, '')
              .trim()
          ).filter(s => s.length > 0 && s.length < 50);
          skills.push(...lineSkills);
        }
      }

      const uniqueSkills = [...new Set(skills)].filter(s => typeof s === 'string' && s.length > 0);
      console.log('[parseResumeMarkdown] Parsed skills:', uniqueSkills.length, 'items:', uniqueSkills.slice(0, 5));

      if (uniqueSkills.length > 0) {
        skillsSection.items = uniqueSkills;
      }
    }

    // 3. Experience
    const experienceText = extractSection('PROFESSIONAL EXPERIENCE') || extractSection('Experience') || extractSection('Work Experience');
    if (experienceText) {
      const expSection = resume.sections.find(s => s.id === 'experience');
      if (expSection && expSection.items) {
        expSection.items.forEach(item => {
          const companyIndex = experienceText.indexOf(item.company);
          if (companyIndex !== -1) {
            const slice = experienceText.substring(companyIndex);
            const endOfBlock = slice.search(/\n\n|#{1,3}/);
            const block = slice.substring(0, endOfBlock === -1 ? slice.length : endOfBlock);
            const bullets = parseBullets(block);
            if (bullets.length > 0) item.bullets = bullets;
          }
        });
      }
    }

    // 4. Projects
    const projectsText = extractSection('PROJECTS') || extractSection('Projects & Certifications');
    if (projectsText) {
      let projectsSection = resume.sections.find(s => s.id === 'projects');
      if (!projectsSection) {
        projectsSection = { id: 'projects', title: 'Projects', items: [] };
        resume.sections.push(projectsSection);
      }

      const projects = [];
      const lines = projectsText.split('\n');
      let currentProject = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('---')) continue;
        if (trimmed.includes('THIS SECTION IS REQUIRED')) continue;

        if (trimmed.startsWith('**')) {
          if (currentProject && currentProject.bullets.length > 0) projects.push(currentProject);
          const parts = trimmed.split('|');
          const title = parts[0].replace(/\*\*/g, '').trim();
          const techString = parts[1] ? parts[1].trim() : '';
          const technologies = techString ? techString.split(',').map(t => t.trim()) : [];

          currentProject = {
            title,
            subtitle: techString,
            technologies,
            description: '',
            bullets: []
          };
        } else if ((trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) && currentProject) {
          const bullet = trimmed.replace(/^[-•*]\s*/, '').trim();
          if (bullet.length > 0 && !bullet.includes('Bullet')) {
            currentProject.bullets.push(bullet);
            if (!currentProject.description) currentProject.description = bullet;
          }
        }
      }
      if (currentProject && currentProject.bullets.length > 0) projects.push(currentProject);

      console.log('[parseResumeMarkdown] Parsed projects:', projects.length, 'with bullets:', projects.map(p => p.bullets.length));

      if (projects.length > 0) {
        projectsSection.items = projects;
      }
    }

    // 5. Education
    const educationText = extractSection('Education');
    if (educationText) {
      const eduSection = resume.sections.find(s => s.id === 'education');
      if (eduSection) {
        const educations = [];
        const lines = educationText.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('**') && trimmed.includes('|')) {
            const parts = trimmed.split('|');
            if (parts.length >= 2) {
              educations.push({
                degree: parts[0].replace(/\*\*/g, '').trim(),
                school: parts[1].replace(/\*\*/g, '').trim(),
                year: parts[2] ? parts[2].trim() : '',
                id: `edu-${Date.now()}-${Math.random()}`
              });
            }
          }
        }

        if (educations.length > 0) {
          eduSection.items = educations;
        }
      }
    }

    return { parsedResume: resume, markdown: markdown };
  }
}

