import React from 'react'

export default function Menu({ mode, setMode, duration, setDuration, onStart }) {
  return (
    <div className="menu">
      <aside className="menu-panel">
        <h2>How would you like to relax?</h2>
        <div className="modes">
          <label className={`mode ${mode==='sun' ? 'active':''}`}>
            <input type="radio" name="mode" checked={mode==='sun'} onChange={() => setMode('sun')} />
            <div className="mode-title">🌞 Solar Calm</div>
            <div className="mode-desc">Warm ambient tones from solar activity (DONKI)</div>
          </label>

          <label className={`mode ${mode==='earth' ? 'active':''}`}>
            <input type="radio" name="mode" checked={mode==='earth'} onChange={() => setMode('earth')} />
            <div className="mode-title">🌍 Earth Breathing</div>
            <div className="mode-desc">Rhythmic breathing synced with Earth's motion (EPIC)</div>
          </label>

          <label className={`mode ${mode==='apod' ? 'active':''}`}>
            <input type="radio" name="mode" checked={mode==='apod'} onChange={() => setMode('apod')} />
            <div className="mode-title">🌌 Deep Space Flow</div>
            <div className="mode-desc">Ethereal textures inspired by APOD imagery</div>
          </label>

          <label className={`mode ${mode==='exoplanet' ? 'active':''}`}>
            <input type="radio" name="mode" checked={mode==='exoplanet'} onChange={() => setMode('exoplanet')} />
            <div className="mode-title">🔭 Exoplanet Journey</div>
            <div className="mode-desc">Unique chords from exoplanet characteristics</div>
          </label>

          <label className={`mode ${mode==='neo' ? 'active':''}`}>
            <input type="radio" name="mode" checked={mode==='neo'} onChange={() => setMode('neo')} />
            <div className="mode-title">☄️ Near Earth Objects</div>
            <div className="mode-desc">Rhythmic pulses based on asteroid proximity</div>
          </label>

          <label className={`mode ${mode==='mars' ? 'active':''}`}>
            <input type="radio" name="mode" checked={mode==='mars'} onChange={() => setMode('mars')} />
            <div className="mode-title">🪐 Mars Exploration</div>
            <div className="mode-desc">Textured ambient sounds from Mars rover imagery</div>
          </label>

          <label className={`mode ${mode==='cosmic' ? 'active':''}`}>
            <input type="radio" name="mode" checked={mode==='cosmic'} onChange={() => setMode('cosmic')} />
            <div className="mode-title">🌌 Cosmic Flow</div>
            <div className="mode-desc">Random journey through all cosmic data sources</div>
          </label>
        </div>

        <div className="duration">
          <label>Session length</label>
          <div className="dur-buttons">
            {[5,10,15].map(d => (
              <button key={d} className={duration===d? 'active':''} onClick={() => setDuration(d)}>{d} min</button>
            ))}
          </div>
        </div>

        <div className="actions">
          <button className="start" onClick={onStart}>Start session</button>
        </div>
      </aside>

      <section className="menu-visual">
        <div className="visual-hero">
          <h3>Close your eyes, breathe, and listen.</h3>
          <p>We transform NASA data into soundscapes and moving visuals to guide your meditation.</p>
        </div>
      </section>
    </div>
  )
}
