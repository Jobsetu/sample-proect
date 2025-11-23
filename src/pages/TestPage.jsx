import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TestPage = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Test jobs table
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .limit(5)

      if (error) {
        setError(`Database Error: ${error.message}`)
        console.error('Database error:', error)
      } else {
        setJobs(data || [])
        console.log('Jobs data:', data)
      }
    } catch (err) {
      setError(`Connection Error: ${err.message}`)
      console.error('Connection error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Supabase Connection Test</h1>
        
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Connection Status</h2>
          {loading && <p className="text-yellow-400">Testing connection...</p>}
          {error && <p className="text-red-400">Error: {error}</p>}
          {!loading && !error && <p className="text-green-400">✅ Connection successful!</p>}
        </div>

        <div className="glass-effect rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Sample Jobs Data</h2>
          {loading ? (
            <p className="text-gray-400">Loading jobs...</p>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border border-white/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                  <p className="text-gray-300">{job.company} • {job.location}</p>
                  <p className="text-gray-400">{job.salary_range} • {job.job_type}</p>
                  {job.tags && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No jobs found</p>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={testConnection}
            className="btn-primary"
          >
            Test Connection Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestPage
