<div align="right">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/Lang-English-blue?style=for-the-badge&logo=google-translate&logoColor=white" alt="Switch to English">
  </a>
</div>

<div align="center">

  # dezzLock 🔒
  ### SISTEMA DE ENFOQUE POLÍMATA

  ![Version](https://img.shields.io/badge/version-1.0.0-00ff9b?style=for-the-badge&logo=appveyor&logoColor=black&labelColor=141414)
  ![Status](https://img.shields.io/badge/status-PRODUCTION-00ff9b?style=for-the-badge&labelColor=141414&logoColor=black)
  ![License](https://img.shields.io/badge/license-MIT-white?style=for-the-badge&labelColor=141414)

  <p align="center">
    Un "Gestor de Estado Mental" nativo para el cerebro creativo. Deja de decidir, empieza a ejecutar.
    <br />
    <br />
    <a href="https://lock.dezz.cloud"><strong>Lanzar Web App »</strong></a>
    ·
    <a href="https://github.com/josefagundezz/dezzLock/releases"><strong>Descargar App de Escritorio »</strong></a>
  </p>
</div>

---

## ⚡ Resumen del Sistema

**dezzLock** no es solo un cronómetro; es un **ancla psicológica**. Diseñado para polímatas, desarrolladores y creativos que hacen malabares con múltiples proyectos simultáneamente.

Las listas "To-Do" tradicionales generan ansiedad. **dezzLock** fuerza un estado de flujo (Flow) simulando un mecanismo de "Clock-In" (fichar entrada), bloqueando la interfaz en una sola tarea y manteniendo una base de conocimiento persistente de tus misiones activas.

### "Externaliza tu memoria de trabajo."

---

## 📸 Datos de Interfaz

<div align="center">
  <img src="./screenshots/lock.png" alt="Modo Lock In" width="800" style="border-radius: 10px; margin-bottom: 20px;">
  <br>
  <em>El HUD de Lock-In: Un entorno de enfoque libre de distracciones.</em>
</div>

<br>

<div align="center">
  <div style="display: flex; justify-content: center; gap: 20px;">
    <img src="./screenshots/dashboard.png" alt="Panel de Estadísticas" width="45%" style="border-radius: 8px;">
    <img src="./screenshots/sessions.png" alt="Lista de Sesiones" width="45%" style="border-radius: 8px;">
  </div>
  <em>Analítica de Rendimiento & Archivo de Conocimiento.</em>
</div>

---

## 🧩 Módulos Principales

### 🧠 The Knowledge Brain (Base de Datos)
En lugar de escribir tareas repetidamente, guárdalas en tu **Cerebro en la Nube** personal.
- **Protocolo de Recuerdo:** Carga instantáneamente proyectos desde el menú desplegable o el Archivo Cerebral.
- **Persistencia:** Los proyectos nuevos se auto-guardan en Supabase.
- **Rastreo de Estado:** Marca proyectos como `PENDIENTE` o `FINALIZADO`.

### 🔒 Mecanismo de Lock-In
- **HUD Sin Distracciones:** Una vez bloqueado, la interfaz se simplifica para mostrar solo Tiempo, Proyecto e Instrucciones.
- **Doble Confirmación:** Para salir, debes interactuar deliberadamente (Doble Clic), evitando descansos accidentales.
- **Feedback Visual:** Usa una estética Dark Mode distinta con acentos Neón (`#00ff9b`) para activar la mentalidad de "Modo Trabajo".

### 📊 Analítica de Rendimiento
- **Archivo de Sesiones:** Rastrea cada segundo de enfoque.
- **Logs Inteligentes:** Antes de salir, el sistema solicita un resumen de lo logrado (ej: "Commits subidos", "Bug arreglado").
- **Dashboard:** Visualiza tus últimas 20 sesiones y el tiempo total de flujo directamente en la app.

### 🛡️ Autenticación y Seguridad
- **Acceso Seguro:** Potenciado por **Supabase Auth**.
- **Magic Links & Recuperación:** Restablecimiento de contraseña y manejo de email integrado.
- **Privacidad de Datos:** Tus tareas están aseguradas vía Row Level Security (RLS).

---

## 🛠️ Tech Stack (El Motor)

Construido pensando en la resiliencia y el rendimiento.

| Componente | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Renderizado de UI ultra rápido. |
| **Estilos** | TailwindCSS | Sistema estético Cyberpunk. |
| **Backend** | Supabase | Base de Datos Postgres & Manejo de Auth. |
| **Wrapper Escritorio** | Electron | Ejecución nativa en Linux y Windows. |
| **Builder** | Electron-Builder | Compilado a `.AppImage` y `.exe`. |

---

## 🚀 Instalación y Uso

### Versión Web
Acceso instantáneo vía navegador: [**lock.dezz.cloud**](https://lock.dezz.cloud)

### Escritorio Nativo (Recomendado)
Obtén la experiencia libre de distracciones.

**Windows (.exe)**
1. Ve a [Releases](https://github.com/josefagundezz/dezzLock/releases).
2. Descarga `dezzLock Setup 1.0.0.exe`.
3. Instala y haz Lock In.

**Linux (.AppImage)**
1. Descarga `dezzLock-1.0.0.AppImage`.
2. Clic derecho -> Propiedades -> Permitir ejecutar archivo como programa.
3. Ejecutar.

---

## 👨‍💻 Build de Desarrollador

Para clonar y correr este sistema localmente:

```bash
# 1. Clonar el repositorio
git clone https://github.com/josefagundezz/dezzLock.git

# 2. Entrar en la matrix
cd dezzLock

# 3. Instalar dependencias
npm install

# 4. Correr modo desarrollo (Web)
npm run dev

# 5. Construir App de Escritorio (Salida en carpeta /release)
npm run electron:build
```
<div align="center">
<br/>
<p>DISEÑADO E INGENIADO POR</p>
<h2>dezzHub</h2>
<p><em>Las mentes son para tener ideas, no para retenerlas.</em></p>
</div>