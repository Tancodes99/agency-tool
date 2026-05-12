import { useState } from 'react'

export default function Planner() {

  const now = new Date()

  const [month, setMonth]
    = useState(now.getMonth() + 1)

  const [year, setYear]
    = useState(now.getFullYear())

  const daysInMonth =
    new Date(year, month, 0).getDate()

  return (

    <div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >

        <div>

          <h1
            style={{
              color: '#fff',
              fontSize: '24px',
              marginBottom: '6px'
            }}
          >
            Content Planner
          </h1>

          <p
            style={{
              color: '#777'
            }}
          >
            Monthly content calendar
          </p>

        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px'
          }}
        >

          <select
            value={month}

            onChange={(e) =>
              setMonth(Number(e.target.value))
            }
          >

            {
              [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
              ].map((m, i) => (

                <option
                  key={m}
                  value={i + 1}
                >
                  {m}
                </option>

              ))
            }

          </select>

          <input
            type="number"

            value={year}

            onChange={(e) =>
              setYear(Number(e.target.value))
            }

            style={{
              width: '100px'
            }}
          />

        </div>

      </div>

      {/* Calendar */}

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(7, 1fr)',

          gap: '12px'
        }}
      >

        {
          Array.from({
            length: daysInMonth
          }).map((_, i) => (

            <div
              key={i}

              style={{
                background: '#141417',
                border: '1px solid #1f1f24',
                borderRadius: '12px',
                minHeight: '120px',
                padding: '12px'
              }}
            >

              <div
                style={{
                  color: '#fff',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}
              >
                {i + 1}
              </div>

            </div>

          ))
        }

      </div>

    </div>

  )
}