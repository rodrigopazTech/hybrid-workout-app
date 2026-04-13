import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';

// DOCUMENTACIÓN OFICIAL: Forzamos que la ruta sea dinámica para evitar que Next.js 
// intente evaluarla durante el 'next build' sin tener las variables de entorno.
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === 'dummy_key_for_build') {
    return NextResponse.json({ error: 'IA no configurada' }, { status: 500 });
  }

  const { messages, userId, token } = await request.json();

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      // MODELO ACTUALIZADO: llama-3.3-70b-versatile
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Eres un Coach de Rendimiento Híbrido de Élite llamado "Dínamo Coach". 
          Tu objetivo es ayudar al atleta a subir el 4to Dínamo en la CDMX y ganar masa muscular.
          Contexto del atleta: Pesa 65kg, mide 170cm. Su plan es de 4 semanas.
          Eres directo, motivador, técnico y enfocado en la ciencia del deporte. 
          Puedes consultar su perfil, su plan semanal y mover entrenamientos si te lo pide.
          Si el usuario dice que está cansado o le duele algo, recomiéndale descanso activo o reprogramar.
          Habla en español de México, de forma natural pero profesional.`
        },
        ...messages
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "get_user_profile",
            description: "Obtener peso, altura y metas actuales del usuario desde la base de datos.",
            parameters: { type: "object", properties: {} }
          }
        },
        {
          type: "function",
          function: {
            name: "get_weekly_plan",
            description: "Obtener los entrenamientos programados para los próximos 7 días en Google Calendar.",
            parameters: { type: "object", properties: {} }
          }
        },
        {
          type: "function",
          function: {
            name: "reschedule_workout",
            description: "Mover un entrenamiento a una nueva fecha.",
            parameters: {
              type: "object",
              properties: {
                eventId: { type: "string", description: "El ID del evento de Google Calendar" },
                newDate: { type: "string", description: "La nueva fecha en formato ISO (YYYY-MM-DD)" }
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
        message: "Entendido, Rodrigo. Estoy procesando tu solicitud...",
        tool_calls: responseMessage.tool_calls 
      });
    }

    return NextResponse.json({ message: responseMessage.content });
  } catch (error) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: 'Coach offline' }, { status: 500 });
  }
}
