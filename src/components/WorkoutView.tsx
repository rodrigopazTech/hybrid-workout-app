'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronLeft, Save, TrendingUp, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import RestTimer from './RestTimer'

interface WorkoutViewProps {
  workout: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function WorkoutView({ workout, onClose, onSave }: WorkoutViewProps) {
  // Corregimos la inicialización para que cada objeto de "set" sea una instancia única en memoria
  const [exerciseLogs, setExerciseLogs] = useState<any>(
    workout.exercises.map((ex: any) => ({
      ...ex,
      sets: Array.from({ length: ex.sets }, () => ({ 
        reps: ex.reps.toString().replace(/[^0-9]/g, ''), 
        weight: ex.initialWeight.toString().replace(/[^0-9]/g, ''), 
        completed: false 
      }))
    }))
  )
  const [feeling, setFeeling] = useState('')

  const updateSet = (exIndex: number, setIndex: number, field: string, value: any) => {
    const newLogs = [...exerciseLogs]
    const newSets = [...newLogs[exIndex].sets]
    newSets[setIndex] = { ...newSets[setIndex], [field]: value }
    newLogs[exIndex] = { ...newLogs[exIndex], sets: newSets }
    setExerciseLogs(newLogs)
  }

  const toggleSet = (exIndex: number, setIndex: number) => {
    const newLogs = [...exerciseLogs]
    const newSets = [...newLogs[exIndex].sets]
    newSets[setIndex] = { ...newSets[setIndex], completed: !newSets[setIndex].completed }
    newLogs[exIndex] = { ...newLogs[exIndex], sets: newSets }
    setExerciseLogs(newLogs)
  }

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto pb-32"
    >
      <header className="sticky top-0 bg-background/80 backdrop-blur-md p-6 border-b border-muted flex items-center gap-4 z-10">
        <button onClick={onClose} className="p-2 bg-card rounded-xl text-muted-foreground"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold truncate">{workout.title}</h2>
      </header>

      <div className="p-6 space-y-8">
        {exerciseLogs.map((ex: any, exIdx: number) => (
          <div key={ex.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="bg-primary/20 text-primary w-6 h-6 flex items-center justify-center rounded-lg text-xs">{exIdx + 1}</span>
                {ex.name}
              </h3>
              <TrendingUp size={16} className="text-muted-foreground" />
            </div>

            <div className="grid grid-cols-5 gap-3 text-xs font-bold text-muted-foreground px-2 uppercase tracking-widest">
              <div className="col-span-1 text-center">Set</div>
              <div className="col-span-1 text-center">Peso</div>
              <div className="col-span-2 text-center">Reps</div>
              <div className="col-span-1"></div>
            </div>

            {ex.sets.map((set: any, setIdx: number) => (
              <motion.div 
                key={setIdx}
                className={`grid grid-cols-5 gap-3 p-2 rounded-2xl items-center transition-colors ${set.completed ? 'bg-secondary/10 border-secondary/20 border' : 'bg-card border border-muted'}`}
              >
                <div className="text-center font-bold text-lg">{setIdx + 1}</div>
                <input 
                  type="number" 
                  inputMode="decimal"
                  value={set.weight} 
                  onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                  className="bg-muted/50 border-none rounded-xl p-2 text-center text-lg font-bold w-full focus:ring-2 focus:ring-primary"
                />
                <div className="col-span-2 flex items-center gap-2">
                   <input 
                    type="number" 
                    inputMode="numeric"
                    value={set.reps} 
                    onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                    className="bg-muted/50 border-none rounded-xl p-2 text-center text-lg font-bold w-full focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button 
                  onClick={() => toggleSet(exIdx, setIdx)}
                  className={`p-3 rounded-xl flex items-center justify-center ${set.completed ? 'bg-secondary text-black' : 'bg-muted text-muted-foreground'}`}
                >
                  <CheckCircle2 size={24} />
                </button>
              </motion.div>
            ))}
          </div>
        ))}

        <div className="pt-8 space-y-4">
          <label className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
            <Info size={16} /> ¿Cómo te sentiste?
          </label>
          <textarea 
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="Ej: Mucha energía, poco sueño, me dolió la rodilla..."
            className="w-full bg-card border border-muted rounded-3xl p-5 min-h-[120px] focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          <button 
            onClick={() => onSave({ exercises: exerciseLogs, feeling })}
            className="w-full bg-primary text-white font-black py-5 rounded-3xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            <Save size={24} /> FINALIZAR ENTRENAMIENTO
          </button>
        </div>
      </div>

      <RestTimer />
    </motion.div>
  )
}
