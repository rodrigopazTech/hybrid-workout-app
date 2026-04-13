'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { parseWorkoutDescription } from '@/lib/google-calendar'
import { Timer, Dumbbell, Calendar, ChevronRight, LogOut, Info, CheckCircle, Trophy, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import WorkoutView from '@/components/WorkoutView'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [workout, setWorkout] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [streak, setStreak] = useState(0)
  const [dynamosProgress, setDynamosProgress] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchWorkout(session.provider_token)
        fetchStats(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchWorkout(session?.provider_token)
        fetchStats(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchStats = async (userId: string) => {
    try {
      const { data: workouts, error: wError } = await supabase
        .from('workouts')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (workouts) {
        const workoutDates = new Set(workouts.map(w => w.date))
        let currentStreak = 0
        let checkDate = new Date()
        checkDate.setHours(0, 0, 0, 0)

        // Si hoy no hay workout y no es domingo, verificamos desde ayer
        const todayStr = checkDate.toISOString().split('T')[0]
        if (!workoutDates.has(todayStr)) {
          // Si hoy es domingo (0), la racha sigue viva esperando el resultado del sábado
          // Si no es domingo, verificamos si ayer hubo entrenamiento
          if (checkDate.getDay() !== 0) {
            checkDate.setDate(checkDate.getDate() - 1)
          }
        }

        // Empezamos a contar hacia atrás
        for (let i = 0; i < 60; i++) { // Máximo 60 días atrás
          const dateStr = checkDate.toISOString().split('T')[0]
          const isSunday = checkDate.getDay() === 0

          if (workoutDates.has(dateStr)) {
            currentStreak++
          } else if (isSunday) {
            // Es domingo y no hay registro: El descanso está permitido, no suma pero no rompe
            // Seguimos verificando el día anterior
          } else {
            // Es un día de entrenamiento y faltó: Se rompe la racha
            break
          }
          checkDate.setDate(checkDate.getDate() - 1)
        }
        setStreak(currentStreak)

        // Progreso Dínamos
        const dynamoWorkouts = workouts.filter(w => w.calendar_event_summary?.includes('Dínamo'))
        let maxDynamo = 0
        dynamoWorkouts.forEach(w => {
          const match = w.calendar_event_summary?.match(/(\d)/)
          if (match) {
            const level = parseInt(match[1])
            if (level > maxDynamo) maxDynamo = level
          }
        })
        setDynamosProgress(maxDynamo)
      }
    } catch (err) {
      console.error('Error stats:', err)
    }
  }

  const fetchWorkout = async (token?: string | null) => {
    if (!token) return
    try {
      const res = await fetch(`/api/calendar?token=${token}`)
      const events = await res.json()
      const workoutEvent = events.find?.((e: any) => 
        e.summary?.includes('GYM') || e.summary?.includes('BICI') || e.summary?.includes('RETO')
      )
      if (workoutEvent) {
        setWorkout({
          id: workoutEvent.id,
          title: workoutEvent.summary,
          exercises: parseWorkoutDescription(workoutEvent.description || '')
        })
      }
    } catch (err) {
      setError('Error Calendar')
    }
  }

  const handleSaveWorkout = async (data: any) => {
    try {
      const { data: workoutRecord, error: wError } = await supabase
        .from('workouts')
        .insert({
          user_id: session.user.id,
          date: new Date().toISOString().split('T')[0],
          calendar_event_summary: workout.title,
          feeling_notes: data.feeling
        })
        .select().single()

      if (wError) throw wError

      const logsToInsert = data.exercises.flatMap((ex: any) => 
        ex.sets.map((set: any, idx: number) => ({
          workout_id: workoutRecord.id,
          exercise_name: ex.name,
          set_number: idx + 1,
          reps_completed: parseInt(set.reps) || 0,
          weight_kg: parseFloat(set.weight) || 0,
        }))
      )

      await supabase.from('exercise_logs').insert(logsToInsert)
      setIsWorkoutActive(false)
      setIsSaved(true)
      fetchStats(session.user.id)
      setTimeout(() => setIsSaved(false), 5000)
    } catch (err) {
      alert('Error al guardar')
    }
  }

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { access_type: 'offline', prompt: 'consent' },
        scopes: 'https://www.googleapis.com/auth/calendar.readonly'
      }
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background text-primary">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )

  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground p-6 max-w-md mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">HÍBRIDO <span className="text-primary">CDMX</span></h1>
          <p className="text-muted-foreground text-sm font-medium">Objetivo: Los Dínamos</p>
        </div>
        {session && (
          <button onClick={() => supabase.auth.signOut()} className="p-2 bg-card rounded-2xl text-muted-foreground border border-muted hover:text-white transition-all">
            <LogOut size={20} />
          </button>
        )}
      </header>

      {!session ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card p-10 rounded-[40px] border border-muted shadow-2xl relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary p-4 rounded-2xl shadow-xl shadow-primary/40">
              <Dumbbell className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight mt-4">Rompe tus<br />límites</h2>
            <p className="text-muted-foreground mb-10 text-balance">Conéctate para ver tu rutina híbrida y registrar tu progreso hacia la cima.</p>
            <button onClick={handleLogin} className="w-full bg-white text-black font-extrabold py-5 rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Entrar con Google
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-6">
          {isSaved && (
             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary/20 border border-secondary/50 p-4 rounded-2xl flex items-center gap-3 text-secondary font-bold">
              <CheckCircle size={20} /> ¡Entrenamiento guardado!
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            {workout ? (
              <motion.div key="workout-active" whileTap={{ scale: 0.98 }} onClick={() => setIsWorkoutActive(true)} className="bg-card p-8 rounded-[40px] border border-primary/20 shadow-xl relative overflow-hidden group cursor-pointer">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity"><Calendar size={120} /></div>
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Rutina de Hoy</h3>
                <h2 className="text-3xl font-black mb-6 leading-tight">{workout.title}</h2>
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
                  <div className="flex items-center gap-2"><Dumbbell size={16} className="text-primary" /><span className="font-bold text-foreground">{workout.exercises.length} ejercicios</span></div>
                  <div className="flex items-center gap-2"><Timer size={16} className="text-primary" /><span className="font-bold text-foreground">~60 min</span></div>
                </div>
                <div className="w-full bg-primary text-white font-black py-5 rounded-3xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20">INICIAR SESIÓN <ChevronRight size={20} /></div>
              </motion.div>
            ) : (
              <motion.div key="workout-empty" className="bg-muted/10 p-10 rounded-[40px] border border-dashed border-muted text-center">
                <Info className="mx-auto mb-4 text-muted-foreground/40" size={48} /><h3 className="text-xl font-bold mb-2">Día de recuperación</h3><p className="text-sm text-muted-foreground/60">No hay rutinas programadas para hoy.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-[35px] border border-muted flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <Trophy className="absolute -right-2 -bottom-2 text-primary/10 w-20 h-20" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Dínamos</p>
                <p className="text-3xl font-black">{dynamosProgress}/4</p>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(dynamosProgress / 4) * 100}%` }} className="bg-primary h-full" />
              </div>
            </div>
            <div className="bg-card p-6 rounded-[35px] border border-muted flex flex-col justify-between min-h-[140px] relative overflow-hidden">
              <Zap className="absolute -right-2 -bottom-2 text-secondary/10 w-20 h-20" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Racha</p>
                <p className="text-3xl font-black">{streak} <span className="text-sm text-muted-foreground font-medium">Días</span></p>
              </div>
              <div className="flex gap-1 mt-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i < streak ? 'bg-secondary' : 'bg-muted'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {isWorkoutActive && <WorkoutView workout={workout} onClose={() => setIsWorkoutActive(false)} onSave={handleSaveWorkout} />}
      </AnimatePresence>
    </main>
  )
}
