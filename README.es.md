<div align="right">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/Lang-English-blue?style=for-the-badge&logo=google-translate&logoColor=white" alt="Switch to English">
  </a>
</div>

<div align="center">

  # dezzLock 🔒
  ### SISTEMA DE ENFOQUE POLÍMATA

  ![Version](https://img.shields.io/badge/version-1.1.0-00ff9b?style=for-the-badge&logo=appveyor&logoColor=black&labelColor=141414)
  ![Status](https://img.shields.io/badge/status-ESTABLE-00ff9b?style=for-the-badge&labelColor=141414&logoColor=black)
  ![License](https://img.shields.io/badge/license-MIT-white?style=for-the-badge&labelColor=141414)

  <p align="center">
    Un "Gestor de Estado Mental" nativo para el cerebro creativo. Deja de decidir, empieza a ejecutar.
    <br />
    <br />
    <a href="https://lock.dezz.cloud"><strong>Lanzar Web App »</strong></a>
    ·
    <a href="https://github.com/josef/dezzLock/releases"><strong>Descargar App de Escritorio »</strong></a>
  </p>
</div>

---

## ⚡ Resumen del Sistema

**dezzLock** no es solo un cronómetro; es un **ancla psicológica**. Diseñado para polímatas, desarrolladores y creativos que hacen malabares con múltiples proyectos de alto impacto simultáneamente.

Las listas "To-Do" tradicionales generan ansiedad. **dezzLock** fuerza un estado de flujo (Flow) simulando un mecanismo de "Clock-In", bloqueando la interfaz en una sola misión y manteniendo una base de conocimiento persistente de tus tareas activas.

### "Externaliza tu memoria de trabajo."

---

## 📸 Datos de Interfaz

<div align="center">
  <img src="./public/preview_v1.1.png" alt="dezzLock v1.1 HUD" width="800" style="border-radius: 10px; margin-bottom: 20px;">
  <br>
  <em>El HUD de Lock-In: Un entorno de enfoque libre de distracciones.</em>
</div>

---

## 🧩 Módulos Principales (v1.1.0)

### 📅 Protocolos de Enfoque (Automatización)
Programa tus turnos de trabajo por adelantado.
- **Alertas Inminentes:** El sistema dispara una secuencia 5 minutos antes de tu turno, permitiéndote entrar en cola de **Auto-Inicio**.
- **Poder Recurrente:** Configura protocolos por días y horas para automatizar tu rutina.

### 📊 Analítica Profunda y Stand-ups
- **Daily Stand-up:** Genera reportes listos para copiar y pegar de tu trabajo del día desde el header.
- **Mapas de Intensidad:** Visualiza patrones de productividad por proyecto y categoría.
- **Exportación CSV:** Lleva tus datos crudos a cualquier lugar.

### 💓 Pulse Checks (Anti-Idle)
- **Monitor de Presencia:** Configura frecuencia (15-60m) para confirmar que sigues enfocado.
- **Auto-Pausa:** El sistema pausa automáticamente si se descuida por 5 minutos, protegiendo la integridad de tus logs.

### 🧠 Cerebro de Conocimiento
- **Archivo Categorizado:** Guarda proyectos bajo CODE, DESIGN, MUSIC, etc.
- **Preservación de Contexto:** Cada tarea guarda instrucciones que se inyectan directamente en la vista de enfoque.

### 👤 Identidad y Sincronización
- **Avatars Personalizados:** Fotos de perfil sincronizadas vía Supabase Storage.
- **Unidades Globales:** Cambia entre **Minutos** u **Horas** instantáneamente.
- **Rachas (Streaks):** Sistema de 7 niveles (desde Sprout hasta dezzGod) basado en tu consistencia.

---

## 🛠️ Tech Stack

Construido para resiliencia y un rendimiento ultra-rápido.

| Componente | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Renderizado de UI de alto rendimiento. |
| **Estilos** | Vanilla CSS + Tailwind | Sistema HUD/Cyberpunk personalizado. |
| **Backend** | Supabase | DB Postgres, Auth y Storage. |
| **Escritorio**| Electron | Ejecución nativa en Windows. |
| **PWA** | Service Workers | Experiencia móvil completa offline-first. |

---

## 🚀 Instalación y Configuración

### Versión Web
Acceso instantáneo vía navegador: [**lock.dezz.cloud**](https://lock.dezz.cloud)

### Build de Desarrollador
Para clonar y correr este sistema localmente:

```bash
# 1. Clonar el repositorio
git clone https://github.com/josef/dezzLock.git

# 2. Entrar en la matrix
cd dezzLock

# 3. Instalar dependencias
npm install

# 4. Configurar Entorno
# Crea un .env basado en .env.example con tus llaves de Supabase

# 5. Configurar Base de Datos
# Aplica las migraciones:
# - supabase_migration_v1.1.sql
# - supabase_migration_v1.1_phase4.sql
# - supabase_fix_deletion.sql

# 6. Correr en modo desarrollo (Web)
npm run dev

# 7. Construir App de Escritorio (Salida en /release)
npm run electron:build
```

<div align="center">
<br/>
<p>DISEÑADO E INGENIADO POR</p>
<h2>dezzHub</h2>
<p><em>Las mentes son para tener ideas, no para retenerlas.</em></p>
</div>