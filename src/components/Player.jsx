import React, { useEffect, useRef, useState } from 'react'
import * as tone from 'tone'
import { fetchAPOD, fetchDONKI, fetchEPIC, fetchNEO, fetchExoplanets, fetchMars } from '../api/nasa'

export default function Player({ mode, duration = 10, onEnd }) {
  const [data, setData] = useState(null)
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [secondsLeft, setSecondsLeft] = useState(duration * 60)
  const timerRef = useRef(null)
  const synthRef = useRef(null)
  const effectsRef = useRef(null)

  useEffect(() => {
    // fetch mode-specific data
    let cancelled = false
    async function load() {
      try {
        let selectedMode = mode
        if (mode === 'cosmic') {
          const modes = ['apod', 'sun', 'earth', 'neo', 'exoplanet', 'mars']
          selectedMode = modes[Math.floor(Math.random() * modes.length)]
        }

        if (selectedMode === 'apod') {
          const apod = await fetchAPOD()
          if (!cancelled) setData({ ...apod, cosmicMode: selectedMode })
        } else if (selectedMode === 'sun') {
          const donki = await fetchDONKI()
          if (!cancelled) setData({ data: donki, cosmicMode: selectedMode })
        } else if (selectedMode === 'earth') {
          const epic = await fetchEPIC()
          if (!cancelled) setData({ data: epic, cosmicMode: selectedMode })
        } else if (selectedMode === 'neo') {
          const neo = await fetchNEO()
          if (!cancelled) setData({ data: neo, cosmicMode: selectedMode })
        } else if (selectedMode === 'exoplanet') {
          const exo = await fetchExoplanets()
          if (!cancelled) setData({ data: exo, cosmicMode: selectedMode })
        } else if (selectedMode === 'mars') {
          const mars = await fetchMars()
          if (!cancelled) setData({ data: mars, cosmicMode: selectedMode })
        }
      } catch (err) {
        console.error(err)
      }
    }
    load()
    return () => { cancelled = true }
  }, [mode])

  useEffect(() => {
    let raf = null
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    let t = 0
    function draw() {
      if (!ctx) return
      const w = canvas.width = canvas.clientWidth
      const h = canvas.height = canvas.clientHeight
      ctx.fillStyle = 'rgba(4,8,23,0.3)'
      ctx.fillRect(0, 0, w, h)

      // simple animated stars influenced by data
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(t * 0.01 + i) + 1) * w * 0.5
        const y = (Math.cos(t * 0.013 + i * 0.7) + 1) * h * 0.5
        const size = 0.5 + (Math.sin(t * 0.02 + i) + 1) * 1.5
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.abs(Math.sin(t * 0.01 + i))*0.8})`
        ctx.beginPath()
        ctx.arc(x % w, y % h, size, 0, Math.PI * 2)
        ctx.fill()
      }

      t += 1
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [data])

  async function startSound() {
    await tone.start()
    setIsPlaying(true)
    setIsPaused(false)

    // Enhanced sonification with effects
    const synth = new tone.PolySynth(tone.Synth)
    const reverb = new tone.Reverb({ decay: 4, wet: 0.3 }).toDestination()
    const delay = new tone.Delay({ delayTime: 0.5, feedback: 0.2, wet: 0.2 }).connect(reverb)
    const volumeNode = new tone.Volume().connect(delay)

    synth.connect(volumeNode)
    tone.Destination.volume.value = tone.gainToDb(volume)

    synthRef.current = synth
    effectsRef.current = { reverb, delay, volumeNode }

    const now = tone.now()

    // derive pitch sequence from data (fallback demo)
    const actualData = data?.cosmicMode ? data.data || data : data
    const actualMode = data?.cosmicMode || mode
    const seq = extractSequenceFromData(actualData, actualMode)

    seq.forEach((v, i) => {
      const time = now + i * 0.8
      const note = valueToNote(v)
      const duration = mode === 'earth' ? '1n' : mode === 'sun' ? '0.5n' : '0.25n'
      synth.triggerAttackRelease(note, duration, time)
    })

    // session timer
    clearInterval(timerRef.current)
    setSecondsLeft(duration * 60)
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          stopSound()
          if (onEnd) onEnd()
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  function stopSound() {
    tone.Transport.stop()
    setIsPlaying(false)
    setIsPaused(false)
    tone.Destination.cancelScheduledValues()
    clearInterval(timerRef.current)
    if (synthRef.current) {
      synthRef.current.dispose()
      synthRef.current = null
    }
    if (effectsRef.current) {
      Object.values(effectsRef.current).forEach(effect => effect.dispose())
      effectsRef.current = null
    }
  }

  function pauseSound() {
    if (isPlaying && !isPaused) {
      tone.Transport.pause()
      setIsPaused(true)
    }
  }

  function resumeSound() {
    if (isPlaying && isPaused) {
      tone.Transport.start()
      setIsPaused(false)
    }
  }

  function handleVolumeChange(e) {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    tone.Destination.volume.value = tone.gainToDb(newVolume)
  }

  return (
    <div className="player">
      <div className="controls">
        <div className="playback-controls">
          <button onClick={() => (isPlaying ? stopSound() : startSound())}>
            {isPlaying ? 'Stop' : 'Play'}
          </button>
          {isPlaying && (
            <button onClick={() => (isPaused ? resumeSound() : pauseSound())}>
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>
        <div className="volume-control">
          <label>Volume: </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
        <div className="dataset-info">
          <pre style={{whiteSpace:'pre-wrap', maxHeight:140, overflow:'auto'}}>{JSON.stringify(data?.slice ? data.slice(0,5) : data, null, 2)}</pre>
        </div>
        <div className="timer">{Math.floor(secondsLeft/60)}:{String(secondsLeft%60).padStart(2,'0')}</div>
      </div>

      <div className="visual">
        <canvas ref={canvasRef} className="canvas" />
        {data?.url && <img src={data.url} alt={data.title} className="bg-image" />}
      </div>
    </div>
  )
}

function extractSequenceFromData(data, mode) {
  if (!data) return [60,62,64,67,71]

  if (mode === 'exoplanet' && Array.isArray(data)) {
    // Use planet mass and radius for notes
    return data.slice(0, 8).map(planet => {
      const mass = Number(planet.pl_massj) || 1
      const radius = Number(planet.pl_radj) || 1
      return 48 + Math.round((mass * radius) * 12) % 24
    })
  }

  if (mode === 'neo' && Array.isArray(data)) {
    // Use asteroid size and miss distance
    return data.slice(0, 8).map(obj => {
      const size = Number(obj.estimated_diameter?.kilometers?.estimated_diameter_max) || 0.1
      const dist = Number(obj.close_approach_data?.[0]?.miss_distance?.kilometers) || 1000000
      return 60 + Math.round(Math.log10(size) * 6) + Math.round(Math.log10(dist) * 2) % 12
    })
  }

  if (mode === 'mars' && Array.isArray(data)) {
    // Use sol (Martian day) and camera data
    return data.slice(0, 8).map(photo => {
      const sol = Number(photo.sol) || 0
      const id = Number(photo.id) || 0
      return 55 + (sol % 12) + (id % 7)
    })
  }

  if (mode === 'sun' && Array.isArray(data)) {
    // Use activity level from message length
    return data.slice(0, 8).map(event => {
      const len = event.messageBody?.length || 100
      return 60 + Math.round(Math.log10(len) * 5) % 12
    })
  }

  if (mode === 'earth' && Array.isArray(data)) {
    // Use image dates
    return data.slice(0, 8).map(img => {
      const date = new Date(img.date)
      return 60 + (date.getHours() % 12)
    })
  }

  if (mode === 'apod' && data) {
    // Use date and title length
    const date = new Date(data.date)
    const titleLen = data.title?.length || 10
    return [60 + (date.getDate() % 12), 62 + (titleLen % 7), 64 + (date.getMonth() % 5), 67]
  }

  // Fallback
  if (Array.isArray(data)) {
    const nums = []
    for (const item of data) {
      if (typeof item === 'number') nums.push(item)
      else if (item && typeof item === 'object') {
        for (const k of Object.keys(item)) {
          const v = Number(item[k])
          if (!Number.isNaN(v)) { nums.push(v); break }
        }
      }
      if (nums.length >= 8) break
    }
    if (nums.length) return nums.map(n => 48 + Math.round(Math.log10(Math.abs(n) + 1) * 12) % 24)
  }

  return [60,62,64,67,71]
}

function valueToNote(v) {
  // convert numeric value 0-127 to midi note then to frequency or string
  const midi = Math.max(24, Math.min(108, Math.round(v)))
  const note = tone.Frequency(midi, 'midi').toNote()
  return note
}
