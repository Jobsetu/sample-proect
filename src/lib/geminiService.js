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

export class GeminiService {
  static async generateResumeAnalysis(jobDescription, userResume) {
    try {
      const geminiClient = await initializeGemini()
      if (!geminiClient) {
        throw new Error('Gemini API key not configured')
      }
      const { selectedModel } = require('../stores/useModelStore').useModelStore.getState();
      const model = geminiClient.getGenerativeModel({ model: selectedModel })


      const prompt = `
        You are an expert resume analyst and ATS specialist. Perform a COMPREHENSIVE, DETAILED analysis comparing this resume against the job description.
        
        JOB DESCRIPTION:
        ${jobDescription || 'General Software Engineering Role'}
        
        CANDIDATE RESUME:
        ${JSON.stringify(userResume)}
        
        CRITICAL REQUIREMENTS - DO NOT GIVE GENERIC RESPONSES:
        
        1. **Missing Keywords Analysis** (MINIMUM 8-15 keywords): 
           - Extract SPECIFIC keywords/technologies from the job description
           - Only include keywords that are ACTUALLY MISSING from the resume
           - Categorize by priority: High (critical for role), Medium (important), Low (nice to have)
           - For EACH keyword provide: exact keyword, priority, category, and specific section to add it to
           - NO GENERIC responses like "Relevant keywords" - use ACTUAL keywords from the job
        
        2. **Recommended Changes** (MINIMUM 5-8 changes):
           - Identify SPECIFIC sections that need improvement
           - Provide CONCRETE edits with actual before/after examples from the resume
           - Rate impact: High, Medium, Low
           - Include examples like: "Change 'Worked on backend' to 'Architected scalable backend serving 1M+ users'"
           - NO GENERIC advice like "Enhance your resume"
        
        3. **Project Suggestions** (EXACTLY 3-5 projects):
           - Suggest SPECIFIC project titles and descriptions
           - Each must target 2-3 missing skills from the job description
           - Include difficulty level and what skills it demonstrates
           - Make them REALISTIC and RELEVANT to the job
           - Example: "Build a CI/CD Pipeline with Jenkins and Docker" NOT "Some project"
        
        4. **ATS Improvement Steps** (MINIMUM 8-12 steps):
           - Provide DETAILED, ACTIONABLE steps with priority 1-5
           - Include specific formatting issues found in the resume
           - Mention exact keywords to add and where
           - Provide expected impact for each step
           - Examples: "Add 'React, TypeScript' to skills section", "Use standard header 'PROFESSIONAL EXPERIENCE'"
           - NO GENERIC steps like "Improve formatting"
        
        5. **Standard Analysis**:
           - Match score: Realistic 0-10 based on actual skill overlap
           - ATS Score: Realistic 0-10 based on formatting and keyword presence
           - Strengths: MINIMUM 4-6 specific strengths from the resume
           - Weaknesses: MINIMUM 4-6 specific weaknesses
           - Missing Skills: MINIMUM 5-10 actual required skills from job description
           - Suggestions: MINIMUM 6-10 specific actionable suggestions
           - Keywords to Add: MINIMUM 8-12 actual keywords from job description
           - ATS Feedback: MINIMUM 8-12 detailed feedback items
           - Experience estimation: Calculate based on resume content, provide reasoning
        
        ABSOLUTELY FORBIDDEN RESPONSES:
        - "Good foundation"
        - "Needs improvement"
        - "Enhance your resume"
        - "Relevant keywords"
        - "Some required skills"
        - "Could not estimate"
        - Any generic, vague, or placeholder text
        
        REQUIRED DETAIL LEVEL:
        - Every strength must reference SPECIFIC achievements or skills from the resume
        - Every weakness must identify SPECIFIC gaps compared to job requirements
        - Every suggestion must be ACTIONABLE with clear steps
        - Every keyword must be EXACT text from the job description
        - Experience estimation must be BASED ON ACTUAL resume content
        
        FORMAT RESPONSE AS JSON:
        {
          "matchScore": number (realistic 0-10),
          "atsScore": number (realistic 0-10),
          "strengths": [string] (min 4-6, specific to resume),
          "weaknesses": [string] (min 4-6, specific gaps),
          "missingSkills": [string] (min 5-10, actual skills from job),
          "suggestions": [string] (min 6-10, actionable steps),
          "keywordsToAdd": [string] (min 8-12, exact keywords from job),
          "atsFeedback": [string] (min 8-12, detailed formatting/keyword advice),
          "estimatedExperience": {
            "level": string (Junior/Mid/Senior/Lead based on resume),
            "years": number (calculated from resume),
            "reasoning": string (explain calculation)
          },
          "missingKeywords": [
            {
              "keyword": string (exact from job description),
              "priority": "High" | "Medium" | "Low",
              "category": "Technical" | "Soft Skill" | "Tool" | "Concept",
              "whereToAdd": string (specific section name)
            }
          ] (min 8-15 items),
          "recommendedChanges": [
            {
              "section": string (exact section name),
              "change": string (specific edit to make),
              "impact": "High" | "Medium" | "Low",
              "example": string (before/after example)
            }
          ] (min 5-8 items),
          "projectSuggestions": [
            {
              "title": string (specific project name),
              "description": string (what to build, 2-3 sentences),
              "targetSkills": [string] (specific skills it demonstrates),
              "difficulty": "Beginner" | "Intermediate" | "Advanced"
            }
          ] (exactly 3-5 items),
          "atsImprovements": [
            {
              "step": string (specific action to take),
              "priority": number (1-5, 1 being highest),
              "expectedImpact": string (what this will improve)
            }
          ] (min 8-12 items),
          "analysis": string (overall summary)
        }
        
        ANALYZE NOW WITH MAXIMUM DETAIL AND SPECIFICITY. Base everything on ACTUAL content from the resume and job description.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Robust JSON extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(jsonString)

        // Ensure all new fields exist with defaults if missing
        return {
          ...parsed,
          missingKeywords: parsed.missingKeywords || [],
          recommendedChanges: parsed.recommendedChanges || [],
          projectSuggestions: parsed.projectSuggestions || [],
          atsImprovements: parsed.atsImprovements || []
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        // Return structured fallback with all fields
        return {
          matchScore: 6.0,
          atsScore: 7.0,
          strengths: ["Strong technical background", "Relevant experience"],
          weaknesses: ["Missing some required skills"],
          missingSkills: ["Docker", "GraphQL"],
          suggestions: ["Add more specific technical skills", "Quantify your achievements"],
          keywordsToAdd: ["React", "Node.js", "AWS"],
          atsFeedback: ["Avoid using complex tables or columns", "Use standard section headers"],
          estimatedExperience: {
            level: "Mid-Level",
            years: 3,
            reasoning: "Based on listed roles and project complexity."
          },
          missingKeywords: [],
          recommendedChanges: [],
          projectSuggestions: [],
          atsImprovements: [],
          analysis: text
        }
      }
    } catch (error) {
      console.error('Error generating resume analysis:', error)
      return {
        matchScore: 5.0,
        atsScore: 5.0,
        strengths: ["Good foundation"],
        weaknesses: ["Needs improvement"],
        missingSkills: ["Some required skills"],
        suggestions: ["Enhance your resume"],
        keywordsToAdd: ["Relevant keywords"],
        atsFeedback: ["Simplify formatting"],
        estimatedExperience: {
          level: "Unknown",
          years: 0,
          reasoning: "Could not estimate."
        },
        analysis: "Analysis could not be generated at this time."
      }
    }
  }

  static async estimateExperience(userResume) {
    try {
      const geminiClient = await initializeGemini()
      if (!geminiClient) {
        throw new Error('Gemini API key not configured')
      }
      const { selectedModel } = require('../stores/useModelStore').useModelStore.getState();
      const model = geminiClient.getGenerativeModel({ model: selectedModel })

      const prompt = `
        Estimate the total years of professional experience and seniority level based on this resume:
        
        User Resume: ${JSON.stringify(userResume)}
        
        Return as JSON:
        {
          "level": string (e.g., Junior, Mid-Level, Senior, Lead, Principal),
          "years": number,
          "reasoning": string
        }
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        return JSON.parse(text)
      } catch (e) {
        return {
          level: "Mid-Level",
          years: 3,
          reasoning: "Estimation based on typical progression."
        }
      }
    } catch (error) {
      console.error('Error estimating experience:', error)
      return {
        level: "Unknown",
        years: 0,
        reasoning: "Could not estimate."
      }
    }
  }

  static async generateCustomResume(jobDescription, userResume, selectedSections = [], selectedSkills = []) {
    try {
      const geminiClient = await initializeGemini()
      if (!geminiClient) {
        throw new Error('Gemini API key not configured')
      }
      const { selectedModel } = require('../stores/useModelStore').useModelStore.getState();
      const model = geminiClient.getGenerativeModel({ model: selectedModel })

      const prompt = `
        Generate a customized resume based on the job requirements and user's existing resume.
        The output MUST align with the application's data structure using 'sections'.
        
        Job Description: ${jobDescription}
        
        User Resume: ${JSON.stringify(userResume)}
        
        Sections to enhance: ${selectedSections.join(', ')}
        Skills to add: ${selectedSkills.join(', ')}
        
        Please generate a professional resume that:
        1. Matches the job requirements
        2. Highlights relevant experience
        3. Uses industry-standard keywords
        4. Maintains professional formatting
        5. Includes standard sections: Summary, Skills, Experience, Education, Projects
        
        Format the response as JSON with the following structure:
        {
          "personalInfo": {
            "name": string,
            "title": string,
            "email": string,
            "phone": string,
            "location": string,
            "linkedin": string,
            "github": string
          },
          "sections": [
            { 
              "id": "summary", 
              "title": "Summary", 
              "content": string 
            },
            {
              "id": "skills",
              "title": "Skills",
              "items": [string]
            },
            {
              "id": "experience",
              "title": "Professional Experience",
              "items": [
                {
                  "role": string,
                  "company": string,
                  "location": string,
                  "startDate": string,
                  "endDate": string,
                  "bullets": [string]
                }
              ]
            },
            {
              "id": "education",
              "title": "Education",
              "items": [
                {
                  "degree": string,
                  "school": string,
                  "location": string,
                  "year": string,
                  "gpa": string
                }
              ]
            },
            {
              "id": "projects",
              "title": "Projects",
              "items": [
                {
                  "title": string,
                  "subtitle": string,
                  "description": string,
                  "technologies": [string]
                }
              ]
            }
          ]
        }
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      let text = response.text()

      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
      if (jsonMatch) {
        text = jsonMatch[1]
      }

      try {
        const parsed = JSON.parse(text)
        // Validate structure
        if (!parsed.personalInfo || !parsed.sections) {
          throw new Error('Invalid resume structure received')
        }
        return parsed
      } catch (parseError) {
        console.error('JSON parsing error:', parseError, 'Raw text:', text.substring(0, 200))
        // Try to merge with existing resume structure
        const fallback = {
          personalInfo: userResume.personalInfo || {
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: ''
          },
          sections: userResume.sections || [
            { id: 'summary', title: 'Summary', content: '' },
            { id: 'skills', title: 'Skills', items: [] },
            { id: 'experience', title: 'Professional Experience', items: [] },
            { id: 'education', title: 'Education', items: [] },
            { id: 'projects', title: 'Projects', items: [] }
          ]
        }
        throw new Error('Failed to parse AI response. Please check your API key and try again.')
      }
    } catch (error) {
      console.error('Error generating custom resume:', error)
      throw error // Re-throw so caller can handle it
    }
  }

  // ... (rest of methods kept as is: generateResumeSuggestions, generateCoverLetter, generateMockInterviewQuestions, analyzeInterviewAnswer)
  static async generateResumeSuggestions(jobDescription, currentResume) {
    try {
      const geminiClient = await initializeGemini()
      if (!geminiClient) {
        throw new Error('Gemini API key not configured')
      }
      const { selectedModel } = require('../stores/useModelStore').useModelStore.getState();
      const model = geminiClient.getGenerativeModel({ model: selectedModel })

      const prompt = `
        Provide specific suggestions to improve this resume for the given job:
        
        Job Description: ${jobDescription}
        
        Current Resume: ${JSON.stringify(currentResume)}
        
        Provide actionable suggestions for:
        1. Summary improvements
        2. Skills to add or emphasize
        3. Experience descriptions to enhance
        4. Keywords to include
        5. Formatting improvements
        
        Return as JSON:
        {
          "summarySuggestions": [string],
          "skillsSuggestions": [string],
          "experienceSuggestions": [string],
          "keywordSuggestions": [string],
          "formattingSuggestions": [string]
        }
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        return JSON.parse(text)
      } catch (parseError) {
        return {
          summarySuggestions: ["Add quantifiable achievements", "Include relevant keywords"],
          skillsSuggestions: ["Add more technical skills", "Include soft skills"],
          experienceSuggestions: ["Quantify your achievements", "Use action verbs"],
          keywordSuggestions: ["Add industry-specific terms"],
          formattingSuggestions: ["Improve readability", "Use consistent formatting"]
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      return {
        summarySuggestions: ["Improve your summary"],
        skillsSuggestions: ["Add relevant skills"],
        experienceSuggestions: ["Enhance experience descriptions"],
        keywordSuggestions: ["Add keywords"],
        formattingSuggestions: ["Improve formatting"]
      }
    }
  }

  static async generateCoverLetter(jobDescription, userResume) {
    try {
      const geminiClient = await initializeGemini()
      if (!geminiClient) {
        throw new Error('Gemini API key not configured')
      }
      const { selectedModel } = require('../stores/useModelStore').useModelStore.getState();
      const model = geminiClient.getGenerativeModel({ model: selectedModel })

      // Extract key resume details for better integration
      const name = userResume?.personalInfo?.name || 'Applicant'
      const skills = userResume?.skills?.join(', ') || userResume?.sections?.find(s => s.id === 'skills')?.items?.join(', ') || ''
      const experiences = userResume?.experience || userResume?.sections?.find(s => s.id === 'experience')?.items || []
      const summary = userResume?.summary || userResume?.sections?.find(s => s.id === 'summary')?.content || ''

      const prompt = `
        Generate a professional, compelling cover letter that is EXACTLY 200-400 words (aim for 300 words).
        
        CRITICAL REQUIREMENTS:
        - Word count: 200-400 words (count carefully!)
        - Use SPECIFIC details from the resume below
        - Match the candidate's experience to the job requirements
        - Be concise yet impactful
        - Sound natural and professional, not generic
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        CANDIDATE RESUME DETAILS:
        Name: ${name}
        
        Professional Summary: ${summary}
        
        Key Skills: ${skills}
        
        Work Experience: ${JSON.stringify(experiences, null, 2)}
        
        COVER LETTER STRUCTURE:
        1. Opening (1 paragraph): Mention the specific position and express genuine interest
        2. Body (2 paragraphs): 
           - Paragraph 1: Highlight 1-2 most relevant experiences with SPECIFIC achievements/metrics from resume
           - Paragraph 2: Connect skills to job requirements, show understanding of the role
        3. Closing (1 paragraph): Strong call to action, express enthusiasm
        
        FORMAT:
        - Start with: "Dear Hiring Manager,"
        - End with: "Sincerely,\n${name}"
        - Use proper paragraph breaks (double line breaks)
        
        IMPORTANT: The cover letter must be detailed and specific, but stay within 200-400 words. Do NOT use filler content.
        
        Return ONLY the cover letter text, no additional commentary.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      let coverLetter = response.text().trim()

      // Basic validation
      const wordCount = coverLetter.split(/\s+/).length
      console.log(`Generated cover letter word count: ${wordCount}`)

      // If too short, regenerate with emphasis on length
      if (wordCount < 180) {
        const expandPrompt = `The following cover letter is too short (${wordCount} words). Expand it to 250-300 words by adding more specific details from the resume and job requirements, while keeping it professional and impactful:

${coverLetter}

Job Requirements: ${jobDescription}

Resume Skills: ${skills}
Resume Experience: ${JSON.stringify(experiences.slice(0, 2))}

Add concrete examples and achievements. Target 250-300 words total.`

        const expandResult = await model.generateContent(expandPrompt)
        const expandResponse = await expandResult.response
        coverLetter = expandResponse.text().trim()
      }

      // If too long, ask to condense
      if (wordCount > 450) {
        const condensePrompt = `The following cover letter is too long (${wordCount} words). Condense it to exactly 300-350 words while keeping the most impactful content:

${coverLetter}

Keep only the strongest examples and most relevant skills. Target 300-350 words.`

        const condenseResult = await model.generateContent(condensePrompt)
        const condenseResponse = await condenseResult.response
        coverLetter = condenseResponse.text().trim()
      }

      if (!coverLetter || coverLetter.length < 200) {
        throw new Error('Generated cover letter is too short. Please try again.')
      }

      return coverLetter
    } catch (error) {
      console.error('Error generating cover letter:', error)
      throw error // Re-throw so caller can handle it
    }
  }

  static async generateMockInterviewQuestions(jobDescription, userResume) {
    try {
      const geminiClient = await initializeGemini()
      if (!geminiClient) {
        throw new Error('Gemini API key not configured')
      }
      const { selectedModel } = require('../stores/useModelStore').useModelStore.getState();
      const model = geminiClient.getGenerativeModel({ model: selectedModel })

      const prompt = `
        Generate 5 behavioral and technical interview questions based on the job description and resume:
        
        Job Description: ${jobDescription}
        
        User Resume: ${JSON.stringify(userResume)}
        
        Return as JSON array of strings:
        [
          "Question 1",
          "Question 2",
          ...
        ]
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Robust JSON extraction
      const jsonMatch = text.match(/\[[\s\S]*\]/) // Expecting an array here
      const jsonString = jsonMatch ? jsonMatch[0] : text

      try {
        return JSON.parse(jsonString)
      } catch (e) {
        return [
          "Tell me about yourself.",
          "Why do you want to work here?",
          "Describe a challenging project you worked on.",
          "What are your greatest strengths?",
          "Where do you see yourself in 5 years?"
        ]
      }
    } catch (error) {
      console.error('Error generating interview questions:', error)
      return [
        "Tell me about yourself.",
        "Why do you want to work here?",
        "Describe a challenging project you worked on.",
        "What are your greatest strengths?",
        "Where do you see yourself in 5 years?"
      ]
    }
  }

  static async analyzeInterviewAnswer(question, answer) {
    try {
      const geminiClient = await initializeGemini()
      if (!geminiClient) {
        throw new Error('Gemini API key not configured')
      }
      const { selectedModel } = require('../stores/useModelStore').useModelStore.getState();
      const model = geminiClient.getGenerativeModel({ model: selectedModel })

      const prompt = `
        Analyze this interview answer:
        
        Question: ${question}
        Answer: ${answer}
        
        Provide:
        1. Rating (1-10)
        2. Feedback (strengths/weaknesses)
        3. Improved version of the answer
        
        Return as JSON:
        {
          "rating": number,
          "feedback": string,
          "improvedAnswer": string
        }
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Robust JSON extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : text

      try {
        return JSON.parse(jsonString)
      } catch (e) {
        return {
          rating: 5,
          feedback: "Good attempt. Try to be more specific with examples.",
          improvedAnswer: "I would recommend using the STAR method to structure your answer."
        }
      }
    } catch (error) {
      console.error('Error analyzing interview answer:', error)
      return {
        rating: 0,
        feedback: "Could not analyze answer.",
        improvedAnswer: ""
      }
    }
  }

  static async generateInterviewInsights(jobDescription, userResume, questions) {
    try {
      const geminiClient = await initializeGemini()
      if (!geminiClient) {
        throw new Error('Gemini API key not configured')
      }
      const { selectedModel } = require('../stores/useModelStore').useModelStore.getState();
      const model = geminiClient.getGenerativeModel({ model: selectedModel })

      const prompt = `
        Based on the job description, user's resume, and interview questions, provide comprehensive interview insights:
        
        Job Description: ${jobDescription}
        
        User Resume: ${JSON.stringify(userResume)}
        
        Interview Questions: ${JSON.stringify(questions)}
        
        Provide a comprehensive analysis with:
        1. Overall performance score (1-10)
        2. Key strengths demonstrated
        3. Areas for improvement
        4. Specific recommendations for better interview performance
        
        Return as JSON:
        {
          "overallScore": number,
          "strengths": [string],
          "areasForImprovement": [string],
          "recommendations": [string]
        }
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        return JSON.parse(text)
      } catch (e) {
        return {
          overallScore: 7,
          strengths: ["Good communication", "Relevant experience", "Clear articulation"],
          areasForImprovement: ["Be more specific with examples", "Quantify achievements", "Use STAR method"],
          recommendations: [
            "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions",
            "Prepare specific examples that demonstrate your skills",
            "Quantify your achievements with numbers and metrics",
            "Research the company and role more thoroughly",
            "Practice answering common interview questions"
          ]
        }
      }
    } catch (error) {
      console.error('Error generating interview insights:', error)
      return {
        overallScore: 7,
        strengths: ["Good communication", "Relevant experience"],
        areasForImprovement: ["Be more specific with examples", "Quantify achievements"],
        recommendations: ["Practice STAR method", "Prepare more examples"]
      }
    }
  }
}
