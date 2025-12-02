const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    backgroundColor: '#0a0a0a', // Mantiene el branding mientras carga
    icon: __dirname + '/public/favicon.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true, // Estilo app nativa limpia
    frame: true // O false si quieres dibujar tu propio header bar luego
  });

  // EN DESARROLLO (Vite local):
  // win.loadURL('http://localhost:5173'); 
  
  // EN PRODUCCIÓN (Build):
  // Cuando corras `npm run build`, apunta a esto:
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});