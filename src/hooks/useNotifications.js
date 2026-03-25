export function useNotifications() {
  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  const send = (title, body, icon = '/icon.png') => {
    // Try native desktop notification first (Electron)
    if (typeof window !== 'undefined' && window.process && window.process.versions && window.process.versions.electron) {
      try {
        new Notification(title, { body, icon });
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
