import { supabase } from './supabase'

export class UserService {
  /**
   * Get user profile with all related data
   */
  static async getUserProfile(userId) {
    try {
      // Get user basic info from Auth (source of truth for metadata)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      // Get user info from DB (if exists)
      const { data: dbUser, error: userError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError && userError.code !== 'PGRST116') throw userError

      // Merge DB data with Auth metadata
      // Auth metadata takes precedence for fields that might be missing in DB schema
      const user = {
        ...dbUser,
        email: authUser.email,
        full_name: dbUser?.full_name || authUser.user_metadata?.full_name,
        phone: dbUser?.phone || authUser.user_metadata?.phone,
        current_city: dbUser?.current_city || authUser.user_metadata?.current_city,
        education_level: dbUser?.education_level || authUser.user_metadata?.education_level,
        experience_level: dbUser?.experience_level || authUser.user_metadata?.experience_level,
        linkedin_url: dbUser?.linkedin_url || authUser.user_metadata?.linkedin_url,
        github_url: dbUser?.github_url || authUser.user_metadata?.github_url,
      }

      // Get user skills
      const { data: skills, error: skillsError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId)

      if (skillsError) console.warn('Error fetching skills:', skillsError)

      // Get user preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (preferencesError && preferencesError.code !== 'PGRST116') console.warn('Error fetching preferences:', preferencesError)

      // Get user resumes
      const { data: resumes, error: resumesError } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (resumesError) console.warn('Error fetching resumes:', resumesError)

      return {
        user: user || {},
        skills: skills || [],
        preferences: preferences || {},
        resumes: resumes || []
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, profileData) {
    try {
      // 1. Update Auth Metadata (Reliable storage for all fields)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          phone: profileData.phone,
          current_city: profileData.current_city,
          education_level: profileData.education_level,
          experience_level: profileData.experience_level,
          linkedin_url: profileData.linkedin_url,
          github_url: profileData.github_url
        }
      })
      if (authError) throw authError

      // 2. Update Users Table (Only fields that definitely exist or we want to sync)
      // Excluding education_level and experience_level as they are missing from schema
      const dbData = {
        id: userId,
        full_name: profileData.full_name,
        phone: profileData.phone,
        current_city: profileData.current_city,
        linkedin_url: profileData.linkedin_url,
        github_url: profileData.github_url
        // education_level: profileData.education_level, // Removed to prevent error
        // experience_level: profileData.experience_level // Removed to prevent error
      }

      const { data, error } = await supabase
        .from('Users')
        .upsert(dbData)
        .select()
        .single()

      if (error) {
        console.warn("Error updating Users table (falling back to metadata):", error)
        // Do not throw here, as metadata update was successful
      }
      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  /**
   * Update user skills
   */
  static async updateUserSkills(userId, skills) {
    try {
      // First, delete existing skills
      const { error: deleteError } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Then insert new skills
      if (skills && skills.length > 0) {
        const skillsData = skills.map(skill => ({
          user_id: userId,
          skill_name: skill,
          skill_level: 'intermediate'
        }))

        const { error: insertError } = await supabase
          .from('user_skills')
          .insert(skillsData)

        if (insertError) throw insertError
      }

      return true
    } catch (error) {
      console.error('Error updating user skills:', error)
      throw error
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  /**
   * Get user applications
   */
  static async getUserApplications(userId) {
    try {
      const { data, error } = await supabase
        .from('user_applications')
        .select(`
          *,
          user_resumes(file_name, file_url),
          user_cover_letters(title, content),
          jobs(title, company, location, salary_range)
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting user applications:', error)
      throw error
    }
  }

  /**
   * Create a new job application
   */
  static async createApplication(userId, applicationData) {
    try {
      const { data, error } = await supabase
        .from('user_applications')
        .insert({
          user_id: userId,
          ...applicationData
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating application:', error)
      throw error
    }
  }

  /**
   * Update application status
   */
  static async updateApplicationStatus(applicationId, status, notes = '') {
    try {
      const { data, error } = await supabase
        .from('user_applications')
        .update({
          application_status: status,
          notes: notes
        })
        .eq('id', applicationId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating application status:', error)
      throw error
    }
  }

  /**
   * Get user usage statistics
   */
  static async getUserUsageStats(userId) {
    try {
      const { data, error } = await supabase
        .from('usage_tracker')
        .select('action_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by action type and count
      const stats = data.reduce((acc, record) => {
        const action = record.action_type
        acc[action] = (acc[action] || 0) + 1
        return acc
      }, {})

      return {
        total_actions: data.length,
        action_breakdown: stats,
        recent_actions: data.slice(0, 10)
      }
    } catch (error) {
      console.error('Error getting usage stats:', error)
      throw error
    }
  }

  /**
   * Track user action
   */
  static async trackAction(userId, actionType, details = {}) {
    try {
      const { error } = await supabase
        .from('usage_tracker')
        .insert({
          user_id: userId,
          action_type: actionType,
          details: details
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error tracking action:', error)
      throw error
    }
  }

  /**
   * Search users by skills or preferences (for admin purposes)
   */
  static async searchUsers(searchCriteria) {
    try {
      let query = supabase
        .from('Users')
        .select(`
          *,
          user_skills(skill_name, skill_level),
          user_preferences(job_function, job_type, location_preference)
        `)

      if (searchCriteria.skills && searchCriteria.skills.length > 0) {
        query = query.in('user_skills.skill_name', searchCriteria.skills)
      }

      if (searchCriteria.job_function) {
        query = query.eq('user_preferences.job_function', searchCriteria.job_function)
      }

      if (searchCriteria.location) {
        query = query.ilike('user_preferences.location_preference', `%${searchCriteria.location}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  }
}
