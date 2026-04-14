'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { parseWorkoutDescription } from '@/lib/google-calendar'
import { Timer, Dumbbell, Calendar, ChevronRight, LogOut, Info, CheckCircle, Trophy, Zap, LayoutGrid, User as UserIcon, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import WorkoutView from '@/components/WorkoutView'
import PlannerView from '@/components/PlannerView'
import ProfileView from '@/components/ProfileView'
import AICoach from '@/components/AICoach'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [workout, setWorkout] = useState<any>(null)
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'home' | 'planner' | 'profile'>('home')
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [streak, setStreak] = useState(0)
  const [dynamosProgress, setDynamosProgress] = useState(0)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        setSession(session)
        if (session) {
          await fetchAllData(session.provider_token, session.user.id)
        }
      } catch (err: any) {
        console.error('Initialization error:', err)
        setInitError('No se pudo conectar con el servidor. Verifica las variables de entorno en Firebase.')
      } finally {
        setLoading(false)
      }
    }

    init()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchAllData(session?.provider_token, session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchAllData = async (token: string | null | undefined, userId: string) => {
    if (!token) return
    try {
      await Promise.all([fetchCalendar(token), fetchStats(userId)])
    } catch (e) {
      console.error('Data fetch error:', e)
    }
  }

  const fetchCalendar = async (token: string) => {
    try {
      const res = await fetch(`/api/calendar?token=${token}&days=14`)
      const events = await res.json()
      if (events.error) throw new Error(events.error)
      setAllEvents(events)
      const today = new Date().toISOString().split('T')[0]
      const workoutEvent = events.find((e: any) => {
        const eventDate = (e.start.dateTime || e.start.date).split('T')[0]
        return eventDate === today && (e.summary?.includes('GYM') || e.summary?.includes('BICI') || e.summary?.includes('RETO'))
      })
      if (workoutEvent) {
        setWorkout({
          id: workoutEvent.id,
          title: workoutEvent.summary,
          exercises: parseWorkoutDescription(workoutEvent.description || '')
        })
      }
    } catch (err) {
      console.error('Calendar error:', err)
    }
  }

  const fetchStats = async (userId: string) => {
    const supabase = createClient()
    const { data: workouts } = await supabase.from('workouts').select('date, calendar_event_summary').eq('user_id', userId).order('date', { ascending: false })
    if (workouts) {
      const workoutDates = new Set(workouts.map(w => w.date))
      let currentStreak = 0
      let checkDate = new Date()
      checkDate.setHours(0,0,0,0)
      if (!workoutDates.has(checkDate.toISOString().split('T')[0]) && checkDate.getDay() !== 0) checkDate.setDate(checkDate.getDate() - 1)
      for (let i = 0; i < 30; i++) {
        const dStr = checkDate.toISOString().split('T')[0]
        if (workoutDates.has(dStr)) currentStreak++
        else if (checkDate.getDay() !== 0) break
        checkDate.setDate(checkDate.getDate() - 1)
      }
      setStreak(currentStreak)
      const maxD = Math.max(0, ...workouts.map(w => {
        const m = w.calendar_event_summary?.match(/(\d)/);
        return m ? parseInt(m[1]) : 0;
      }))
      setDynamosProgress(maxD)
    }
  }

  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: { access_type: 'offline', prompt: 'consent' },
        scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly'
      }
    })
  }

  const handleSaveWorkout = async (data: any) => {
    try {
      const supabase = createClient()
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Sincronizando Sistema...</p>
    </div>
  )

  if (initError) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-10 text-center">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <h2 className="text-xl font-black mb-2">Error de Conexión</h2>
      <p className="text-sm text-muted-foreground mb-6">{initError}</p>
      <button onClick={() => window.location.reload()} className="bg-muted px-6 py-3 rounded-2xl font-bold">Reintentar</button>
    </div>
  )

  return (
    <main className="flex flex-col min-h-screen bg-background text-foreground max-w-md mx-auto relative pb-24">
      <header className="p-6 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-primary italic">HÍBRIDO CDMX</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {view === 'home' ? 'Dashboard' : view === 'planner' ? 'Planner Semanal' : 'Perfil Atleta'}
          </p>
        </div>
        {session && <button onClick={() => createClient().auth.signOut()} className="p-2 bg-card rounded-xl border border-muted text-muted-foreground hover:text-white transition-all"><LogOut size={18} /></button>}
      </header>

      <div className="p-6 flex-1 overflow-y-auto">
        {!session ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-20">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card p-10 rounded-[40px] border border-muted shadow-2xl relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary p-4 rounded-2xl shadow-xl shadow-primary/40"><Dumbbell className="text-white w-8 h-8" /></div>
              <h2 className="text-3xl font-black mb-4 leading-tight mt-4 italic">ACTIVA TU<br />POTENCIAL</h2>
              <p className="text-muted-foreground mb-10 text-sm">Conecta tu cuenta para sincronizar tus metas y entrenamientos híbridos.</p>
              <button onClick={handleLogin} className="w-full bg-white text-black font-extrabold py-5 rounded-3xl flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all">
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Conectar con Google
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            {view === 'home' ? (
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {workout ? (
                    <motion.div key="w-active" whileTap={{ scale: 0.98 }} onClick={() => setIsWorkoutActive(true)} className="bg-card p-8 rounded-[40px] border border-primary/20 shadow-xl relative overflow-hidden group cursor-pointer bg-gradient-to-br from-card to-background">
                      <div className="absolute top-0 right-0 p-3 opacity-10"><Calendar size={120} /></div>
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 italic">Rutina de Hoy</h3>
                      <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">{workout.title}</h2>
                      <div className="w-full bg-primary text-white font-black py-4 rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20">ENTRENAR AHORA <ChevronRight size={20} /></div>
                    </motion.div>
                  ) : (
                    <div className="bg-muted/10 p-10 rounded-[40px] border border-dashed border-muted text-center italic font-bold text-muted-foreground uppercase tracking-widest">Recuperación Activa</div>
                  )}
                </AnimatePresence>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-6 rounded-[35px] border border-muted flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                    <Trophy className="absolute -right-2 -bottom-2 text-primary/10 w-20 h-20" />
                    <div><p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Dínamos</p><p className="text-3xl font-black">{dynamosProgress}/4</p></div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(dynamosProgress/4)*100}%` }} className="bg-primary h-full" /></div>
                  </div>
                  <div className="bg-card p-6 rounded-[35px] border border-muted flex flex-col justify-between min-h-[140px] relative overflow-hidden">
                    <Zap className="absolute -right-2 -bottom-2 text-secondary/10 w-20 h-20" />
                    <div><p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Racha</p><p className="text-3xl font-black">{streak} <span className="text-sm font-medium">Días</span></p></div>
                    <div className="flex gap-1 mt-2">{[...Array(7)].map((_, i) => (<div key={i} className={`h-1.5 flex-1 rounded-full ${i < streak ? 'bg-secondary' : 'bg-muted'}`} />))}</div>
                  </div>
                </div>
              </div>
            ) : view === 'planner' ? (
              <PlannerView events={allEvents} token={session.provider_token} onUpdate={() => fetchCalendar(session.provider_token)} />
            ) : (
              <ProfileView userId={session.user.id} />
            )}
          </>
        )}
      </div>

      {session && (
        <>
          <nav className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-muted flex justify-around items-center z-40">
            <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? 'text-primary scale-110' : 'text-muted-foreground opacity-50'}`}>
              <LayoutGrid size={24} />
              <span className="text-[10px] font-bold uppercase">Inicio</span>
            </button>
            <button onClick={() => setView('planner')} className={`flex flex-col items-center gap-1 transition-all ${view === 'planner' ? 'text-primary scale-110' : 'text-muted-foreground opacity-50'}`}>
              <Calendar size={24} />
              <span className="text-[10px] font-bold uppercase">Planner</span>
            </button>
            <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 transition-all ${view === 'profile' ? 'text-primary scale-110' : 'text-muted-foreground opacity-50'}`}>
              <UserIcon size={24} />
              <span className="text-[10px] font-bold uppercase">Perfil</span>
            </button>
          </nav>
          <AICoach userId={session.user.id} token={session.provider_token} />
        </>
      )}

      <AnimatePresence>
        {isWorkoutActive && <WorkoutView workout={workout} onClose={() => setIsWorkoutActive(false)} onSave={handleSaveWorkout} />}
      </AnimatePresence>
    </main>
  )
}
