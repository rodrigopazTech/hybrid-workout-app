'use client'

import { useState } from 'react'
import { Clock, Loader2, ChevronRight, ChevronLeft, Dumbbell, Bike, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

interface PlannerViewProps {
  events: any[];
  token: string;
  onUpdate: () => void;
}

export default function PlannerView({ events, token, onUpdate }: PlannerViewProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  // 1. FILTRO: Solo eventos relacionados con el ejercicio
  const workoutEvents = events.filter(e => e.summary?.match(/GYM|BICI|RETO/i))

  const moveEvent = async (event: any, days: number) => {
    setUpdating(event.id)
    try {
      const currentStart = new Date(event.start.dateTime || event.start.date)
      const currentEnd = new Date(event.end.dateTime || event.end.date)
      
      currentStart.setDate(currentStart.getDate() + days)
      currentEnd.setDate(currentEnd.getDate() + days)

      const response = await fetch(`/api/calendar?token=${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          summary: event.summary, // Enviamos el título para asegurar la consistencia
          start: currentStart.toISOString(),
          end: currentEnd.toISOString()
        })
      })

      if (!response.ok) throw new Error('API Error')
      
      // Llamamos a onUpdate para refrescar la lista desde Google Calendar
      onUpdate()
    } catch (err) {
      console.error(err)
      alert('No se pudo mover el evento. Asegúrate de haber re-iniciado sesión para dar permisos de escritura.')
    } finally {
      setUpdating(null)
    }
  }

  const getIcon = (summary: string) => {
    if (summary.includes('BICI')) return <Bike size={16} className="text-secondary" />
    if (summary.includes('RETO')) return <Trophy size={16} className="text-yellow-500" />
    return <Dumbbell size={16} className="text-primary" />
  }

  // Agrupar solo los eventos filtrados
  const groupedEvents = workoutEvents.reduce((acc: any, event: any) => {
    const date = (event.start.dateTime || event.start.date).split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedEvents).sort()

  if (workoutEvents.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/10 rounded-[40px] border border-dashed border-muted">
        <p className="text-muted-foreground">No hay entrenamientos planificados en los próximos 14 días.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black italic tracking-tighter text-primary">TU RUTA</h2>
        <span className="text-[10px] bg-muted px-2 py-1 rounded-md font-bold text-muted-foreground uppercase">Sync On</span>
      </div>

      <div className="space-y-8">
        {sortedDates.map((date) => {
          const dateObj = new Date(date + 'T12:00:00')
          const dayName = dateObj.toLocaleDateString('es-MX', { weekday: 'long' })
          const dayNum = dateObj.getDate()
          const monthName = dateObj.toLocaleDateString('es-MX', { month: 'short' })

          return (
            <div key={date} className="relative pl-14">
              <div className="absolute left-[1.6rem] top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/50 to-transparent"></div>
              <div className="absolute left-0 top-0">
                <div className="w-12 h-12 bg-card border border-muted rounded-[18px] flex flex-col items-center justify-center shadow-xl z-10 overflow-hidden">
                  <div className="bg-primary/10 w-full text-center py-0.5">
                    <span className="text-[8px] uppercase font-black text-primary">{monthName}</span>
                  </div>
                  <span className="text-lg font-black mt-0.5">{dayNum}</span>
                </div>
              </div>

              <div className="pt-1">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 opacity-60">{dayName}</h3>
                <div className="space-y-4">
                  {groupedEvents[date].map((event: any) => (
                    <motion.div 
                      key={event.id}
                      layoutId={event.id}
                      className="bg-card p-5 rounded-3xl border border-muted shadow-sm relative group overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getIcon(event.summary)}
                            <p className="font-black text-sm truncate uppercase tracking-tight">{event.summary}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                            <Clock size={10} />
                            {new Date(event.start.dateTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-background/50 p-1.5 rounded-2xl border border-muted">
                          <button 
                            onClick={() => moveEvent(event, -1)}
                            disabled={updating === event.id}
                            className="p-2 hover:bg-muted rounded-xl text-muted-foreground active:text-primary transition-all"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <div className="w-[1px] h-4 bg-muted"></div>
                          <button 
                            onClick={() => moveEvent(event, 1)}
                            disabled={updating === event.id}
                            className="p-2 hover:bg-muted rounded-xl text-muted-foreground active:text-primary transition-all"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                      
                      {updating === event.id && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center z-20">
                          <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
