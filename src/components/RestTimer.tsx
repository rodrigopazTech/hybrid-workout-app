'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RestTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval: any = null
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1)
      }, 1000)
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive, seconds])

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const reset = () => {
    setSeconds(0)
    setIsActive(false)
  }

  return (
    <motion.div 
      drag
      dragConstraints={{ left: 0, right: 0, top: -400, bottom: 0 }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-6 left-6 right-6 z-50 pointer-events-none flex justify-center"
    >
      <div className="bg-card/90 backdrop-blur-xl border border-primary/50 shadow-2xl p-4 rounded-3xl flex items-center gap-6 pointer-events-auto shadow-primary/20">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            <TimerIcon size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Descanso</span>
            <span className="text-xl font-mono font-bold tabular-nums leading-none">
              {formatTime(seconds)}
            </span>
          </div>
        </div>
        
        <div className="h-8 w-[1px] bg-muted mx-1"></div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-muted text-foreground' : 'bg-primary text-white shadow-lg shadow-primary/30'}`}
          >
            {isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button 
            onClick={reset}
            className="p-3 bg-muted/50 rounded-2xl text-muted-foreground hover:text-white transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
