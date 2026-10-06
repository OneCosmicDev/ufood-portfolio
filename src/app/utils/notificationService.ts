import { Store } from 'react-notifications-component';

export const notificationService = {
  success(message: string, title?: string, duration: number = 3000) {
    Store.addNotification({
      title: title || 'Succès',
      message,
      type: 'success',
      insert: 'top',
      container: 'top-right',
      animationIn: ['animate__animated', 'animate__fadeIn'],
      animationOut: ['animate__animated', 'animate__fadeOut'],
      dismiss: {
        duration,
        onScreen: true,
        pauseOnHover: true,
        showIcon: true
      }
    });
  },


  error(message: string, title?: string, duration: number = 5000) {
    Store.addNotification({
      title: title || 'Erreur',
      message,
      type: 'danger',
      insert: 'top',
      container: 'top-right',
      animationIn: ['animate__animated', 'animate__fadeIn'],
      animationOut: ['animate__animated', 'animate__fadeOut'],
      dismiss: {
        duration,
        onScreen: true,
        pauseOnHover: true,
        showIcon: true
      }
    });
  },

 
  info(message: string, title?: string, duration: number = 4000) {
    Store.addNotification({
      title: title || 'Information',
      message,
      type: 'info',
      insert: 'top',
      container: 'top-right',
      animationIn: ['animate__animated', 'animate__fadeIn'],
      animationOut: ['animate__animated', 'animate__fadeOut'],
      dismiss: {
        duration,
        onScreen: true,
        pauseOnHover: true,
        showIcon: true
      }
    });
  },

  warning(message: string, title?: string, duration: number = 4000) {
    Store.addNotification({
      title: title || 'Avertissement',
      message,
      type: 'warning',
      insert: 'top',
      container: 'top-right',
      animationIn: ['animate__animated', 'animate__fadeIn'],
      animationOut: ['animate__animated', 'animate__fadeOut'],
      dismiss: {
        duration,
        onScreen: true,
        pauseOnHover: true,
        showIcon: true
      }
    });
  },

 
  logError(context: string, error: unknown, additionalInfo?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}]`, error, additionalInfo);
    }
  },

  logInfo(context: string, message: string, additionalInfo?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${context}]`, message, additionalInfo);
    }
  }
};

