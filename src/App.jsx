import React, { useState } from 'react'
import Player from './components/Player'
import Menu from './components/Menu'

export default function App() {
  const [mode, setMode] = useState('sun')
  const [duration, setDuration] = useState(10) // minutes
  const [sessionActive, setSessionActive] = useState(false)

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <h1>Meditative Universe</h1>
          <p className="tag">Listen to the cosmos • Calm your mind</p>
        </div>
        <div className="header-right">
          <small className="credits">Data from NASA Open APIs</small>
        </div>
      </header>

      <main>
        {!sessionActive ? (
          <Menu
            mode={mode}
            setMode={setMode}
            duration={duration}
            setDuration={setDuration}
            onStart={() => setSessionActive(true)}
          />
        ) : (
          <Player mode={mode} duration={duration} onEnd={() => setSessionActive(false)} />
        )}
      </main>

      <footer className="footer">
        <small>© Meditative Universe — prototype</small>
      </footer>
    </div>
  )
}
