import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({
  children
}) {

  const [loading, setLoading]
    = useState(true)

  const [authenticated,
    setAuthenticated]
    = useState(false)

  useEffect(() => {

    checkUser()

  }, [])

  async function checkUser() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    setAuthenticated(!!user)

    setLoading(false)
  }

  if (loading) {
    return null
  }

  if (!authenticated) {
    return <Navigate to="/login" />
  }

  return children
}