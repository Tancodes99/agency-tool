import { useEffect, useState }
from 'react'

import { supabase }
from '../lib/supabase'

export default function Settings() {

  const [profile, setProfile]
    = useState(null)

  const [agencyName, setAgencyName]
    = useState('')
    const [logoUrl, setLogoUrl]
  = useState('')

const [brandColor, setBrandColor]
  = useState('var(--brand-color)')

  const [loading, setLoading]
    = useState(false)

  useEffect(() => {

    fetchProfile()

  }, [])

  async function fetchProfile() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase

      .from('profiles')

      .select('*')

      .eq('id', user.id)

      .single()

    setProfile(data)

    setAgencyName(
      data?.agency_name || ''
    )
    setLogoUrl(
  data?.logo_url || ''
)

setBrandColor(
  data?.brand_color || 'var(--brand-color)'
)
  document.documentElement.style
  .setProperty(
    '--brand-color',
    data?.brand_color || 'var(--brand-color)'
  )
  }


  async function saveSettings() {

    if (!profile) return

    setLoading(true)

  const { data, error } = await supabase

  .from('profiles')

  .update({
    agency_name: agencyName,
    logo_url: logoUrl,
    brand_color: brandColor
  })

  .eq('id', profile.id)

console.log(data)
console.log(error)
document.documentElement.style
  .setProperty(
    '--brand-color',
    brandColor
  )

    setLoading(false)

    alert('Settings saved')
  }

  return (

    <div>
        <div
  style={{
    marginBottom: '16px'
  }}
>

  <label
    style={{
      display: 'block',
      color: '#aaa',
      marginBottom: '8px',
      fontSize: '13px'
    }}
  >
    Logo URL
  </label>

  <input
    value={logoUrl}

    onChange={(e) =>
      setLogoUrl(e.target.value)
    }

    placeholder="https://..."
  />

</div>

      <div
        style={{
          marginBottom: '24px'
        }}
      >

        <h1
          style={{
            color: '#fff',
            fontSize: '24px',
            marginBottom: '6px'
          }}
        >
          Settings
        </h1>

        <p
          style={{
            color: '#777'
          }}
        >
          Manage your workspace
        </p>

      </div>

      <div
        style={{
          background: '#141417',
          border: '1px solid #1f1f24',
          borderRadius: '14px',
          padding: '20px',
          maxWidth: '500px'
        }}
      >

        <div
          style={{
            marginBottom: '16px'
          }}
        >

          <label
            style={{
              display: 'block',
              color: '#aaa',
              marginBottom: '8px',
              fontSize: '13px'
            }}
          >
            Agency Name
          </label>

          <input
            value={agencyName}

            onChange={(e) =>
              setAgencyName(
                e.target.value
              )
            }

            placeholder="Agency Name"
          />

        </div>

        <div
          style={{
            marginBottom: '16px'
          }}
        >

          <label
            style={{
              display: 'block',
              color: '#aaa',
              marginBottom: '8px',
              fontSize: '13px'
            }}
          >
            Logo URL
          </label>

          <input
            value={logoUrl}

            onChange={(e) =>
              setLogoUrl(
                e.target.value
              )
            }

            placeholder="Logo URL"
          />

        </div>

        <div
          style={{
            marginBottom: '16px'
          }}
        >

          <label
            style={{
              display: 'block',
              color: '#aaa',
              marginBottom: '8px',
              fontSize: '13px'
            }}
          >
            Brand Color
          </label>

          <input
            type="color"
            value={brandColor}

            onChange={(e) =>
              setBrandColor(
                e.target.value
              )
            }
          />

        </div>
        <div
  style={{
    marginBottom: '20px'
  }}
>

  <label
    style={{
      display: 'block',
      color: '#aaa',
      marginBottom: '8px',
      fontSize: '13px'
    }}
  >
    Brand Color
  </label>

  <input
    type="color"

    value={brandColor}

    onChange={(e) =>
      setBrandColor(e.target.value)
    }

    style={{
      width: '60px',
      height: '40px',
      border: 'none',
      background: 'transparent'
    }}
  />

</div>

        <button
          onClick={saveSettings}

          disabled={loading}

          style={{
           background: brandColor,
            border: 'none',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '10px'
          }}
        >

          {
            loading
              ? 'Saving...'
              : 'Save Settings'
          }

        </button>

      </div>

    </div>

  )
}