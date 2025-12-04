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
    // STRATEGY: Surgical Update (Fragment-Based)
    // We ask the AI ONLY for the content that needs to change.
    // We then merge this into the existing resume structure.

    const hasExperience = userResume.sections.find(s => s.id === 'experience')?.items?.length > 0;

    const instructions = [];
    const outputStructure = {};

    // 1. Summary
    if (selectedSections.includes('summary')) {
      instructions.push(`1. **Summary**: Write a new, powerful 3-4 sentence Professional Summary tailored to this job.`);
      outputStructure.summary = "New summary text...";
    }

    // 2. Skills
    if (selectedSections.includes('skills')) {
      instructions.push(`2. **Skills**: specific list of technical and soft skills relevant to the job.`);
      outputStructure.skills = ["Skill 1", "Skill 2"];
    }

    // 3. Experience
    if (selectedSections.includes('experience')) {
      instructions.push(`3. **Experience**: ${hasExperience
        ? 'For each job in the resume, provide 2-3 improved bullet points that highlight impact and relevance to the new job. Match the "company" name exactly.'
        : 'Create 2 relevant professional experience entries that would make this candidate a strong fit for the job. Use realistic but generic company names and dates.'}`);
      outputStructure.experience = [{ "company": "Company Name", "role": "Job Title", "location": "City, State", "startDate": "YYYY", "endDate": "YYYY", "bullets": ["Bullet 1", "Bullet 2"] }];
    }

    // 4. Projects
    if (selectedSections.includes('projects')) {
      instructions.push(`4. **Projects**: Generate 2-3 relevant side projects or academic projects that demonstrate skills required for this job.`);
      outputStructure.projects = [{ "title": "Project Title", "subtitle": "Technologies Used", "description": "Brief description", "technologies": ["Tech 1"] }];
    }

    // 5. Education
    if (selectedSections.includes('education')) {
      instructions.push(`5. **Education**: Optimize the education section. Keep the degree and university, but you may add relevant coursework or honors if implied by the job description.`);
      outputStructure.education = { "degree": "Degree", "university": "University", "year": "Year", "gpa": "GPA" };
    }

    // 6. Activities/Certifications
    if (selectedSections.includes('activities')) {
      instructions.push(`6. **Activities**: List relevant activities or certifications.`);
      outputStructure.activities = ["Activity 1", "Certification 1"];
    }

    const prompt = `
      You are an expert resume writer. I need you to update specific sections of a candidate's resume to better match a job description.

      JOB DESCRIPTION:
      ${jobDescription}

      CANDIDATE'S EXPERIENCE & SKILLS:
      ${JSON.stringify(userResume.sections)}

      INSTRUCTIONS:
      ${instructions.join('\n')}

      OUTPUT FORMAT:
      Return ONLY a valid JSON object with the requested keys.
      DO NOT include any conversational text, markdown formatting (like \`\`\`json), or explanations.
      START your response with { and END with }.
        ${JSON.stringify(outputStructure, null, 2)}
    `;

    try {
      console.log('Sending surgical update prompt to backend...');
      const response = await this.callBackend('generate-resume', {
        input: prompt,
        mode: 'custom',
        resume: userResume // Also pass resume for logging/fallback purposes
      });

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

6. **Language Transformation**:
   - Start EVERY bullet with power verbs: Led, Architected, Drove, Spearheaded, Delivered, Optimized, etc.
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

[List 15-25 skills organized by relevant categories. PRIORITIZE skills from the job description first, then add complementary skills. Format as:
**Programming Languages:** Skill1, Skill2, Skill3, Skill4
**Frameworks & Libraries:** Skill5, Skill6, Skill7
**Cloud & DevOps:** Skill8, Skill9, Skill10
**Databases:** Skill11, Skill12
**Tools & Platforms:** Skill13, Skill14, Skill15]

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

[If the candidate's job experience is limited OR if projects would strengthen their candidacy, add 2-3 relevant projects:]

**{Project Name}** | {Technologies matching job description}
- [Concise description highlighting impact and technologies, demonstrating skills from job requirements]

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
    // Helper to extract section content
    const extractSection = (header) => {
      const regex = new RegExp(`#{ 1, 3 } \\s * ${header} [\\s\\S] *? (?=#{ 1, 3 }| $)`, 'i');
      const match = markdown.match(regex);
      return match ? match[0].replace(new RegExp(`#{ 1, 3 } \\s * ${header} `, 'i'), '').trim() : '';
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
    const skillsText = extractSection('Skills') || extractSection('Technical Skills') || extractSection('Core Competencies');
    if (skillsText) {
      const skillsSection = resume.sections.find(s => s.id === 'skills');
      if (skillsSection) {
        // Parse skills - handle both categorized format and simple lists
        const skills = [];

        // Split by newlines first
        const lines = skillsText.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;

          // Check if line has category (e.g., "**Programming Languages:** React, Node.js")
          if (trimmed.includes(':')) {
            // Extract skills after the colon
            const afterColon = trimmed.split(':').slice(1).join(':').trim();
            // Split by comma and clean up
            const lineSkills = afterColon.split(',').map(s =>
              s.trim()
                .replace(/\*\*/g, '') // Remove markdown bold
                .replace(/`/g, '')    // Remove code ticks
                .trim()
            ).filter(s => s.length > 0 && s.length < 50); // Reasonable skill name length
            skills.push(...lineSkills);
          } else {
            // Simple comma-separated line
            const lineSkills = trimmed.split(',').map(s =>
              s.trim()
                .replace(/\*\*/g, '')
                .replace(/`/g, '')
                .replace(/^[-•*]\s*/, '') // Remove bullet points
                .trim()
            ).filter(s => s.length > 0 && s.length < 50);
            skills.push(...lineSkills);
          }
        }

        // Remove duplicates and ensure all are strings
        const uniqueSkills = [...new Set(skills)].filter(s => typeof s === 'string' && s.length > 0);
        if (uniqueSkills.length > 0) {
          skillsSection.items = uniqueSkills;
        }
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
          const companyRegex = new RegExp(`(.*? ${item.company}.*?)(?=\n.*?\\||\n.*?\\d{ 4} | $)`, 'is');
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
