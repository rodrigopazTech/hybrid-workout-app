'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Save, User, Activity, Target, Loader2, Ruler } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProfileViewProps {
  userId: string;
}

export default function ProfileView({ userId }: ProfileViewProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    weight_kg: '65',
    height_cm: '170',
    fitness_goal: 'Completar el 4to Dínamo en Bici de Ruta',
    fitness_level: 'Intermedio'
  })
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile({
          weight_kg: data.weight_kg?.toString() || '65',
          height_cm: data.height_cm?.toString() || '170',
          fitness_goal: data.fitness_goal || '',
          fitness_level: data.fitness_level || 'Intermedio'
        })
      }
    } catch (err) {
      console.log('Iniciando perfil nuevo...')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          weight_kg: profile.weight_kg ? parseFloat(profile.weight_kg) : null,
          height_cm: profile.height_cm ? parseInt(profile.height_cm) : null,
          fitness_goal: profile.fitness_goal,
          fitness_level: profile.fitness_level,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      alert('Perfil de Atleta actualizado. La IA ahora conoce tus métricas.')
    } catch (err) {
      console.error(err)
      alert('Error al guardar. ¿Ya creaste la tabla en el SQL Editor de Supabase?')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black italic tracking-tighter text-primary">PERFIL ATLETA</h2>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase border border-primary/20 tracking-widest">Database Sync</div>
      </div>

      <div className="bg-card p-8 rounded-[40px] border border-muted shadow-2xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <User size={18} className="text-primary" />
            <label className="text-xs font-black uppercase tracking-widest">Peso Corporal (kg)</label>
          </div>
          <input 
            type="number" 
            inputMode="decimal"
            value={profile.weight_kg}
            onChange={(e) => setProfile({...profile, weight_kg: e.target.value})}
            className="w-full bg-background border border-muted rounded-2xl p-5 text-xl font-black focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner"
            placeholder="65"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Ruler size={18} className="text-primary" />
            <label className="text-xs font-black uppercase tracking-widest">Estatura (cm)</label>
          </div>
          <input 
            type="number" 
            inputMode="numeric"
            value={profile.height_cm}
            onChange={(e) => setProfile({...profile, height_cm: e.target.value})}
            className="w-full bg-background border border-muted rounded-2xl p-5 text-xl font-black focus:ring-2 focus:ring-primary outline-none transition-all shadow-inner"
            placeholder="170"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Target size={18} className="text-primary" />
            <label className="text-xs font-black uppercase tracking-widest">Objetivo Maestro</label>
          </div>
          <textarea 
            value={profile.fitness_goal}
            onChange={(e) => setProfile({...profile, fitness_goal: e.target.value})}
            className="w-full bg-background border border-muted rounded-2xl p-5 text-lg font-bold focus:ring-2 focus:ring-primary outline-none transition-all min-h-[120px] shadow-inner"
            placeholder="Ej. Dominar el 4to Dínamo"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Activity size={18} className="text-primary" />
            <label className="text-xs font-black uppercase tracking-widest">Nivel de Experiencia</label>
          </div>
          <select 
            value={profile.fitness_level}
            onChange={(e) => setProfile({...profile, fitness_level: e.target.value})}
            className="w-full bg-background border border-muted rounded-2xl p-5 text-lg font-bold focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer shadow-inner"
          >
            <option value="Principiante">Principiante (Base Aeróbica)</option>
            <option value="Intermedio">Intermedio (Fuerza + Resistencia)</option>
            <option value="Avanzado">Avanzado (Élite / Competencia)</option>
          </select>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
          ACTUALIZAR DATOS BIOMÉTRICOS
        </button>
      </div>
    </motion.div>
  )
}
