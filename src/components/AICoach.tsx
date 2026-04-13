'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, X, Zap, Loader2, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICoachProps {
  userId: string;
  token: string;
}

export default function AICoach({ userId, token }: AICoachProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userId,
          token
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, Rodrigo. Mi conexión está fallando, pero no te detengas. ¡Dale con todo!' }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Botón Flotante */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-2xl shadow-primary/40 border-2 border-white/20"
      >
        <Zap size={28} fill="currentColor" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-96 bg-card border border-muted z-[60] flex flex-col shadow-2xl overflow-hidden sm:rounded-[32px]"
          >
            {/* Header del Chat */}
            <div className="bg-primary p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-widest uppercase">Dínamo Coach</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold opacity-80 uppercase">En línea (Groq Llama 3)</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Mensajes */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] max-h-[500px]">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <Zap className="mx-auto mb-4 text-primary opacity-20" size={48} />
                  <p className="text-muted-foreground text-sm font-medium">¿Cómo va el entrenamiento hoy, Rodrigo? Pregúntame lo que necesites sobre tu ruta o tu rutina.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                    msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' 
                    : 'bg-muted/50 text-foreground rounded-tl-none border border-muted'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted/50 p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-muted bg-background/50">
              <div className="flex gap-2 bg-card border border-muted p-2 rounded-2xl focus-within:ring-2 focus-within:ring-primary transition-all">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Habla con tu Coach..."
                  className="flex-1 bg-transparent border-none outline-none px-2 text-sm font-medium"
                />
                <button 
                  onClick={sendMessage}
                  disabled={isTyping}
                  className="bg-primary text-white p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
