import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {

  const navigate = useNavigate()

  const [agencyName, setAgencyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)

  async function handleSignup(e) {

    e.preventDefault()

    if (!agencyName || !email || !password) {
      return alert('Fill all fields')
    }

    setLoading(true)

    // CREATE AUTH USER
    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    // CREATE AGENCY
    const {
      data: agencyData,
      error: agencyError
    } = await supabase
      .from('agencies')
      .insert([
        {
          name: agencyName,
        },
      ])
      .select()
      .single()

    if (agencyError) {

      console.log(agencyError)

      alert('Agency creation failed')

      setLoading(false)

      return
    }

    // CREATE PROFILE
    const {
      error: profileError
    } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          agency_id: agencyData.id,
          email,
          role: 'owner',
        },
      ])

    if (profileError) {

      console.log(profileError)

      alert('Profile creation failed')

      setLoading(false)

      return
    }

    setLoading(false)

    navigate('/')
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#0c0c0f]">

      <div className="bg-[#141417] p-8 rounded-2xl w-full max-w-md border border-[#23232a]">

        <h1 className="text-3xl font-bold mb-2 text-white">

          Create Agency

        </h1>

        <p className="text-gray-400 mb-6">

          Setup your workspace

        </p>

        <form onSubmit={handleSignup}>

          <input
            type="text"
            placeholder="Agency Name"
            value={agencyName}
            onChange={(e) =>
              setAgencyName(e.target.value)
            }
            className="w-full mb-4"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full mb-4"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full mb-6"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-all"
          >
            {
              loading
                ? 'Creating...'
                : 'Create Agency'
            }
          </button>

        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">

          Already have an account?

          <Link
            to="/login"
            className="text-purple-400 ml-1"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  )
}