import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!apiKey || apiKey === 'dummy_key_for_build') {
    return NextResponse.json({ error: 'IA no configurada' }, { status: 500 });
  }

  const { messages, userId, token } = await request.json();

  try {
    // 1. OBTENER CONTEXTO REAL DEL ATLETA DESDE SUPABASE
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const athleteContext = profile 
      ? `DATOS ACTUALES DEL ATLETA:
         - Peso: ${profile.weight_kg}kg
         - Estatura: ${profile.height_cm}cm
         - Meta: ${profile.fitness_goal}
         - Nivel: ${profile.fitness_level}`
      : "Contexto: El atleta aún no ha completado su perfil detallado.";

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Eres "Dínamo Coach", un experto en ciclismo de ruta y entrenamiento de fuerza en la CDMX.
          
          ${athleteContext}
          
          REGLAS CRÍTICAS:
          1. YA CONOCES los datos del atleta mencionados arriba. No vuelvas a preguntarle su peso o sus metas a menos que sea para sugerir un cambio.
          2. Tus respuestas deben ser altamente técnicas pero con lenguaje de gimnasio/ciclismo de México.
          3. Dado que su meta es subir al 4to Dínamo con 65kg de peso, enfócate en la relación potencia-peso y en la resistencia en pendientes >10%.
          4. Si pregunta por equipo (ej. bici estática vs ruta), recuérdale que para los Dínamos la técnica de manejo y el equilibrio en ruta son vitales, por lo que la bici real es superior.`
        },
        ...messages
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "get_weekly_plan",
            description: "Ver entrenamientos programados. Solo usar si el usuario pide ver su plan.",
            parameters: { type: "object", properties: {} }
          }
        },
        {
          type: "function",
          function: {
            name: "reschedule_workout",
            description: "Mover un entrenamiento. Solo usar si el usuario ORDENA reprogramar.",
            parameters: {
              type: "object",
              properties: {
                eventId: { type: "string", description: "ID del evento" },
                newDate: { type: "string", description: "Nueva fecha ISO" }
              },
              required: ["eventId", "newDate"]
            }
          }
        }
      ],
      tool_choice: "auto",
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.tool_calls) {
      return NextResponse.json({ 
        message: "Entendido. Estoy ajustando tu plan en el sistema...",
        tool_calls: responseMessage.tool_calls 
      });
    }

    return NextResponse.json({ message: responseMessage.content });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: 'Coach offline' }, { status: 500 });
  }
}
