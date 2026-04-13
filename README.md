# 🏋️‍♂️ Hybrid Workout App

Una aplicación web full-stack diseñada para la gestión inteligente de entrenamientos híbridos, integrando biometría, calendarios y persistencia de datos en tiempo real. Este proyecto demuestra una arquitectura moderna basada en la nube y un flujo de trabajo profesional de **DevOps**.

[![Firebase App Hosting](https://img.shields.io/badge/Deploy-Firebase_App_Hosting-ffca28?style=flat&logo=firebase)](https://firebase.google.com)
[![Next.js](https://img.shields.io/badge/Framework-Next.js_15-000000?style=flat&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=flat&logo=supabase)](https://supabase.com)

---

## 🚀 Stack Tecnológico y Arquitectura

Este proyecto fue construido con un enfoque en la **escalabilidad** y la **automatización**, utilizando las mejores herramientas del ecosistema actual:

### 🔹 Frontend & Backend (Full-Stack)
- **Next.js 15 (App Router):** Utilizado para el renderizado híbrido (SSR/ISR) y la optimización de rutas.
- **TypeScript:** Garantizando la robustez del código y la seguridad de tipos en todo el proyecto.
- **Tailwind CSS:** Para una interfaz moderna, responsiva y de alto rendimiento visual.

### 🔹 Integraciones de Google (Ecosistema Cloud)
- **Firebase App Hosting:** Configuración avanzada de **CI/CD**. La aplicación se despliega automáticamente desde GitHub, gestionando el ciclo de vida del software de forma profesional.
- **Google Calendar API:** Sincronización bidireccional de sesiones de entrenamiento directamente en el calendario del usuario.
- **Google Cloud Platform (GCP):** Gestión de identidades, cuotas y APIs a través de una consola centralizada.

### 🔹 Persistencia y Datos
- **Supabase (PostgreSQL):** Motor de base de datos relacional para la gestión de usuarios, rutinas y progreso histórico.
- **Row Level Security (RLS):** Implementación de políticas de seguridad granulares para proteger la privacidad de los datos de cada atleta.

---

## 🛠️ Automatización y DevOps (CI/CD)

Uno de los pilares de este proyecto es la demostración de capacidades en **Ingeniería de Software**:

1.  **Infraestructura como Código:** Configuración de `apphosting.yaml` y `firebase.json` para definir el entorno de ejecución en la nube.
2.  **Pipeline Automatizado:** Vinculación directa con **GitHub**. Cada `git push` a la rama `main` dispara un build automático, tests y despliegue global en Firebase, eliminando el error humano en el despliegue.
3.  **Gestión de Secretos:** Uso de Google Secret Manager para manejar de forma segura las credenciales de APIs de terceros.

---

## 📦 Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/rodrigopazTech/hybrid-workout-app.git

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (.env.local)
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key

# 4. Ejecutar en desarrollo
npm run dev
```

---

## 👤 Sobre el Desarrollador

Este proyecto es una muestra de mi capacidad para:
- Diseñar e implementar aplicaciones full-stack complejas.
- Integrar múltiples servicios de nube (Google Cloud, Firebase, Supabase).
- Implementar flujos de trabajo de **CI/CD** profesionales.
- Resolver problemas de sincronización de datos mediante APIs REST.

---

*Desarrollado con ❤️ por **Rodrigo Paz** - Enfocado en soluciones escalables y automatizadas.*
