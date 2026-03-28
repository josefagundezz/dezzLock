export function useNotifications() {
  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  const send = (title, body, icon = '/icon.png') => {
    // Prepare an absolute URL/path for the icon, useful for local electron files (file://)
    let iconUrl = icon;
    if (icon.startsWith('/')) {
      // make it relative instead, so if we run file:///path/to/dist/index.html, it becomes file:///path/to/dist/icon.png
      try {
        iconUrl = new URL(icon.slice(1), window.location.href).href;
      } catch (e) {}
    }

    // Try native desktop notification first (Electron)
    if (typeof window !== 'undefined' && window.process && window.process.versions && window.process.versions.electron) {
      try {
        let nativeIconPath = iconUrl;
        const path = window.require('path');
        if (icon.startsWith('/')) {
           // extract absolute file path for windows from the executing __dirname or process.cwd()
           // For a packaged app, window.location.pathname works well to find the right root.
           // However process.cwd() + '/dist/' is easiest for dev/build consistency here.
           nativeIconPath = path.join(process.cwd(), 'dist', process.platform === 'win32' ? 'favicon.ico' : 'icon.png');
        }
        
        new Notification(title, { body, icon: nativeIconPath });
        return;
      } catch (e) {
        // fall through to web notification
      }
    }

    // Web Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon,
          badge: icon,
          vibrate: [200, 100, 200],
          tag: 'dezzlock-notification',
        });
      } catch (e) {
        console.warn('Notification failed:', e);
      }
    }
  };

  const hasPermission = () => {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
  };

  const isSupported = () => 'Notification' in window;

  return { requestPermission, send, hasPermission, isSupported };
}
