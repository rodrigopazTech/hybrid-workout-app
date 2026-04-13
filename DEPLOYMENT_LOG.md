# 🛠 Informe de Despliegue e Infraestructura Cloud

Este documento detalla el proceso técnico de configuración, limpieza y despliegue automatizado realizado para la aplicación **Hybrid Workout**. El objetivo de este informe es demostrar el dominio de herramientas de Google Cloud, Firebase, Supabase y flujos de trabajo DevOps (CI/CD).

---

## 1. Gestión y Optimización de Google Cloud (GCP)
Se realizó una auditoría de proyectos en la consola de Google Cloud para optimizar los recursos y la facturación de la cuenta.
- **Auditoría:** Identificación de 21 proyectos activos.
- **Limpieza:** Eliminación masiva de **12 proyectos obsoletos** (instancias de APIs de IA y proyectos de prueba) mediante `gcloud CLI`, asegurando un entorno de trabajo limpio y enfocado.
- **Configuración de APIs:** Habilitación y verificación de servicios críticos:
    - Google Calendar API (Integración de eventos).
    - Secret Manager (Gestión de llaves).
    - Cloud Build (Motor de compilación).

## 2. Implementación de CI/CD con Firebase App Hosting
Se migró la aplicación de un entorno local a un esquema de **Infraestructura como Código (IaC)**.
- **Upgrade de Plan:** Migración al plan **Blaze** de Firebase para habilitar capacidades de cómputo y hosting de última generación.
- **Configuración de Entorno:**
    - Creación de `firebase.json` para definir los parámetros del backend.
    - Creación de `apphosting.yaml` para gestionar variables de entorno y recursos de hardware (CPU/RAM).
- **Pipeline Automatizado:** Vinculación directa entre Firebase y GitHub mediante el servicio **Developer Connect**. Ahora, cada `git push` desencadena un build automático en la nube.

## 3. Integración de Base de Datos y Seguridad (Supabase)
La persistencia de datos se gestiona mediante Supabase (PostgreSQL), integrando políticas de seguridad avanzadas.
- **Vínculo de Proyecto:** Conexión local del CLI de Supabase con el proyecto remoto.
- **Variables de Producción:** Configuración de `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` dentro del pipeline de App Hosting para garantizar la conectividad en el entorno de producción.

## 4. Resolución de Problemas de Producción (Troubleshooting)
Durante el despliegue, se detectó y resolvió un error crítico en el flujo de autenticación:
- **Problema:** El sistema de OAuth redireccionaba al usuario a `localhost:3000` en lugar de la URL de producción.
- **Solución:** 
    - Refactorización del método de inicio de sesión en Next.js para detectar dinámicamente el `window.location.origin`.
    - Configuración de **Site URL** y **Redirect URIs** en el dashboard de Supabase y en las credenciales de Google Cloud para permitir el dominio de Firebase.

## 5. Automatización con GitHub CLI
Todo el control de versiones y la creación del repositorio se realizó mediante comandos de consola, demostrando agilidad técnica:
- Inicialización de Git.
- Configuración de `.gitignore` profesional para proteger secretos.
- Creación del repositorio público mediante `gh repo create`.
- Despliegue inicial de la rama `main`.

---

## Conclusión
El proyecto ahora cuenta con un flujo de **despliegue continuo (CD)** totalmente automatizado. Cualquier mejora en el código es compilada, testeada y publicada en segundos por la infraestructura de Google, garantizando una aplicación robusta, segura y escalable.

**Tecnologías Clave:** `gcloud`, `firebase-tools`, `supabase-cli`, `gh-cli`, `next.js`, `typescript`.
