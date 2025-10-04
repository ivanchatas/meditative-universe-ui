import React, { useEffect, useRef, useState } from 'react'
import * as tone from 'tone'
import { fetchAPOD, fetchDONKI, fetchEPIC, fetchNEO, fetchExoplanets, fetchMars } from '../api/nasa'

export default function Player({ mode, duration = 10, onEnd }) {
  const [data, setData] = useState(null)
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(duration * 60)
  const timerRef = useRef(null)

  useEffect(() => {
    // fetch mode-specific data
    let cancelled = false
    async function load() {
      try {
        if (mode === 'apod') {
          const apod = await fetchAPOD()
          if (!cancelled) setData(apod)
        } else if (mode === 'sun') {
          const donki = await fetchDONKI()
          if (!cancelled) setData(donki)
        } else if (mode === 'earth') {
          const epic = await fetchEPIC()
          if (!cancelled) setData(epic)
        } else if (mode === 'neo') {
          const neo = await fetchNEO()
          if (!cancelled) setData(neo)
        } else if (mode === 'exoplanet') {
          const exo = await fetchExoplanets()
          if (!cancelled) setData(exo)
        } else if (mode === 'mars') {
          const mars = await fetchMars()
          if (!cancelled) setData(mars)
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
    // simple sonification: map numbers to notes
    const synth = new tone.PolySynth(tone.Synth).toDestination()
    const now = tone.now()

    // derive pitch sequence from data (fallback demo)
    const seq = extractSequenceFromData(data)

    seq.forEach((v, i) => {
      const time = now + i * 0.6
      const note = valueToNote(v)
      synth.triggerAttackRelease(note, '0.5', time)
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
    tone.Destination.cancelScheduledValues()
    clearInterval(timerRef.current)
  }

  return (
    <div className="player">
      <div className="controls">
        <button onClick={() => (isPlaying ? stopSound() : startSound())}>
          {isPlaying ? 'Stop' : 'Play'}
        </button>
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

function extractSequenceFromData(data) {
  if (!data) return [60,62,64,67,71]
  // If data is an array of objects with numeric fields, collect some numbers
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
    if (nums.length) return nums.map(n => Math.round(n % 72) + 24)
  }
  // If it's an object (APOD), use image metadata
  if (data && data.date) {
    const d = new Date(data.date).getTime()
    return [60 + (d % 12), 62 + (d % 7), 64]
  }
  return [60,62,64,67,71]
}

function valueToNote(v) {
  // convert numeric value 0-127 to midi note then to frequency or string
  const midi = Math.max(24, Math.min(108, Math.round(v)))
  const note = tone.Frequency(midi, 'midi').toNote()
  return note
}
