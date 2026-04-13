'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, ArrowRightLeft, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface PlannerViewProps {
  events: any[];
  token: string;
  onUpdate: () => void;
}

export default function PlannerView({ events, token, onUpdate }: PlannerViewProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const moveEvent = async (event: any, days: number) => {
    setUpdating(event.id)
    try {
      const currentStart = new Date(event.start.dateTime || event.start.date)
      const currentEnd = new Date(event.end.dateTime || event.end.date)
      
      currentStart.setDate(currentStart.getDate() + days)
      currentEnd.setDate(currentEnd.getDate() + days)

      await fetch(`/api/calendar?token=${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          start: currentStart.toISOString(),
          end: currentEnd.toISOString()
        })
      })
      onUpdate()
    } catch (err) {
      alert('Error al mover evento')
    } finally {
      setUpdating(null)
    }
  }

  // Agrupar eventos por fecha
  const groupedEvents = events.reduce((acc: any, event: any) => {
    const date = (event.start.dateTime || event.start.date).split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(event)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedEvents).sort()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black">Tu Plan</h2>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">Próximos 14 días</div>
      </div>

      <div className="space-y-6">
        {sortedDates.map((date) => {
          const dateObj = new Date(date + 'T12:00:00') // Evitar problemas de zona horaria
          const dayName = dateObj.toLocaleDateString('es-MX', { weekday: 'long' })
          const dayNum = dateObj.getDate()
          const monthName = dateObj.toLocaleDateString('es-MX', { month: 'short' })

          return (
            <div key={date} className="relative pl-12">
              {/* Línea de tiempo lateral */}
              <div className="absolute left-[1.35rem] top-0 bottom-0 w-[2px] bg-muted/30"></div>
              <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-11 h-11 bg-card border border-muted rounded-2xl flex flex-col items-center justify-center shadow-lg z-10">
                  <span className="text-[10px] uppercase font-bold text-primary leading-none">{monthName}</span>
                  <span className="text-lg font-black leading-none mt-1">{dayNum}</span>
                </div>
              </div>

              <div className="pt-1">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">{dayName}</h3>
                <div className="space-y-3">
                  {groupedEvents[date].map((event: any) => {
                    const isWorkout = event.summary?.match(/GYM|BICI|RETO/)
                    return (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-card p-4 rounded-2xl border ${isWorkout ? 'border-primary/20' : 'border-muted'} shadow-sm relative overflow-hidden`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold truncate ${isWorkout ? 'text-foreground' : 'text-muted-foreground'}`}>{event.summary}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1 font-medium">
                              <Clock size={12} className="text-primary" />
                              {new Date(event.start.dateTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          
                          {isWorkout && (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => moveEvent(event, -1)}
                                disabled={updating === event.id}
                                className="p-2 bg-muted/50 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <button 
                                onClick={() => moveEvent(event, 1)}
                                disabled={updating === event.id}
                                className="p-2 bg-muted/50 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {updating === event.id && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                            <Loader2 size={20} className="animate-spin text-primary" />
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
