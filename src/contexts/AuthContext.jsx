import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        console.error('Signup error:', error)
        return { data: null, error }
      }

      // If auth signup successful, create user profile in database
      if (data?.user?.id) {
        try {
          // Wait a moment for the auth to be fully processed
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Create user profile
          const { error: userError } = await supabase
            .from('Users')
            .insert({
              id: data.user.id,
              full_name: userData.full_name || '',
              email: email,
              phone: userData.phone || '',
              current_city: userData.current_city || '',
              education_level: userData.education_level || '',
              experience_level: userData.experience_level || ''
            })

          if (userError) {
            console.error('User profile creation error:', userError)
            // Don't fail the signup for profile creation error
          }

          // Insert user skills if provided
          if (userData.skills && userData.skills.length > 0) {
            const skillsData = userData.skills.map(skill => ({
              user_id: data.user.id,
              skill_name: skill,
              skill_level: 'intermediate'
            }))

            const { error: skillsError } = await supabase
              .from('user_skills')
              .insert(skillsData)

            if (skillsError) {
              console.error('Skills insertion error:', skillsError)
            }
          }

          // Insert user preferences if provided
          if (userData.job_function || userData.job_type) {
            const { error: preferencesError } = await supabase
              .from('user_preferences')
              .insert({
                user_id: data.user.id,
                job_function: userData.job_function || '',
                job_type: userData.job_type || 'Full-time',
                location_preference: userData.location_preference || '',
                open_to_remote: userData.open_to_remote || true,
                work_authorization_required: userData.work_authorization_required || false,
                job_search_status: 'active'
              })

            if (preferencesError) {
              console.error('Preferences insertion error:', preferencesError)
            }
          }

        } catch (dbError) {
          console.error('Database error during signup:', dbError)
          // Don't fail the signup for database errors
        }
      }
      
      return { data, error }
    } catch (error) {
      console.error('Signup catch error:', error)
      return { data: null, error: { message: 'An unexpected error occurred during signup' } }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
