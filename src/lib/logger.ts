/**
 * Wrapper (envoltorio) genérico para sistema de Logs.
 * 
 * ¿Por qué usar un wrapper?
 * Si en el futuro decides cambiar los console.logs por un servicio en la nube
 * como Sentry, Datadog o Firebase Crashlytics, solo necesitas modificar este 
 * archivo en vez de buscar todos los console.log de la aplicación entera.
 */
export const logger = {
  info: (message: string, context?: any) => {
    // Si estás en producción podrías suprimir los info logs
    console.log(`[INFO]: ${message}`, context || '');
  },
  
  error: (message: string, error?: any) => {
    // Aquí puedes implementar el envío de errores a un servidor remoto
    console.error(`[ERROR]: ${message}`, error || '');
  },
  
  warn: (message: string, context?: any) => {
    console.warn(`[WARN]: ${message}`, context || '');
  }
};
