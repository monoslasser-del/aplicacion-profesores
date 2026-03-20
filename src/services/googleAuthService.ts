import { authService } from './authService';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

/**
 * Carga el script de Google Identity Services (GSI) dinámicamente.
 * No requiere ningún paquete npm — usa la API oficial de Google.
 */
function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No browser environment'));

    // Si ya está cargado, resolver inmediatamente
    if ((window as any).google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el script de Google.'));
    document.head.appendChild(script);
  });
}

/**
 * Abre el popup de selección de cuenta de Google usando Google Identity Services,
 * obtiene el ID token del usuario y lo intercambia por un Sanctum token en el backend.
 *
 * - No requiere ningún paquete npm.
 * - Funciona en web (navegador) y en Capacitor WebView.
 */
export const googleAuthService = {
  signIn: async () => {
    // 1. Asegurarse de que el script de GSI está cargado
    await loadGsiScript();

    const google = (window as any).google;

    if (!google?.accounts?.oauth2) {
      throw new Error('Google Identity Services no está disponible.');
    }

    // 2. Abrir el popup de Google y obtener el ID token
    const idToken = await new Promise<string>((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid profile email',
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description ?? 'Error al autenticar con Google.'));
            return;
          }

          // Con el access_token de GSI obtenemos el ID token via tokeninfo
          // Este flujo es "implicit flow": response.access_token existe
          // Usamos el access_token directamente — el backend lo acepta también
          // como alternativa enviamos el access_token en lugar del id_token
          resolve(response.access_token);
        },
        error_callback: (err: any) => {
          if (err.type === 'popup_closed') {
            reject(new Error('Se cerró el selector de cuentas de Google.'));
          } else {
            reject(new Error('Error al abrir Google: ' + err.type));
          }
        },
      });

      client.requestAccessToken({ prompt: 'select_account' });
    });

    // 3. Enviar el access_token al backend para verificación
    return authService.loginWithGoogle(idToken);
  },

  signOut: async () => {
    const google = (window as any).google;
    if (google?.accounts?.oauth2) {
      google.accounts.oauth2.revoke(GOOGLE_CLIENT_ID, () => {});
    }
    return authService.logout();
  },
};

/**
 * Inicializa GSI pre-cargando el script en segundo plano.
 * Se llama en main.tsx al arrancar la app.
 */
export function initGoogleAuth(): void {
  // Carga el script en modo "lazy" sin bloquear el arranque
  loadGsiScript().catch(() => {
    // Silencioso — si falla la carga, el botón de Google dará error al presionarlo
  });
}
