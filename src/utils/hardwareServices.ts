import { Haptics, NotificationType } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { CapacitorNfc } from '@capgo/capacitor-nfc';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
export const hardwareServices = {
  /**
   * Vibra el dispositivo para indicar éxito
   */
  vibrateSuccess: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.warn("Haptics no disponible o error:", error);
    }
  },

  /**
   * Vibra el dispositivo para indicar error
   */
  vibrateError: async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.warn("Haptics no disponible o error:", error);
    }
  },

  /**
   * Guarda un log de sistema usando Capacitor Preferences
   * @param action String describiendo la acción
   */
  saveLocalLog: async (action: string) => {
    try {
      // Obtenemos los logs anteriores
      const { value } = await Preferences.get({ key: 'system_logs' });
      const logs = value ? JSON.parse(value) : [];

      // Añadimos el nuevo registro
      logs.push({
        action,
        timestamp: new Date().toISOString()
      });

      // Guardamos (limitando a los últimos 50 para no ocupar infinita memoria)
      if (logs.length > 50) logs.shift();

      await Preferences.set({
        key: 'system_logs',
        value: JSON.stringify(logs)
      });
      console.log(`Log saved: ${action}`);
    } catch (error) {
      console.error("Error guardando preferencias/log:", error);
    }
  },

  /**
   * Inicializa el listener base de NFC.
   * - Sin callbacks: resuelve una vez con el tagData (modo one-shot).
   * - Con callbacks: modo continuo; llama onSuccess/onError por cada escaneo.
   */
  initNfcListener: async (
    onSuccess?: (tagData: any) => Promise<void>,
    onError?: (error: any) => Promise<void>
  ): Promise<any> => {
    if (onSuccess) {
      // Modo continuo: escuchar indefinidamente, sin detener tras cada scan
      try {
        await CapacitorNfc.startScanning();
        await CapacitorNfc.addListener('nfcEvent', async (event: any) => {
          const tagData = event.tag || event;
          try {
            await onSuccess(tagData);
          } catch (err) {
            if (onError) await onError(err);
          }
        });
      } catch (error) {
        if (onError) await onError(error);
        else throw error;
      }
      return; // No resuelve promise, escucha indefinidamente
    }

    // Modo one-shot (comportamiento original)
    return new Promise(async (resolve, reject) => {
      try {
        await CapacitorNfc.startScanning();
        const listener = await CapacitorNfc.addListener('nfcEvent', (event: any) => {
          const tagData = event.tag || event;
          // Detener tras leer
          CapacitorNfc.stopScanning();
          listener.remove();
          resolve(tagData);
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Guarda un archivo codificado en Base64 de forma local y lanza el menú Nativo "Compartir" de Android.
   * Si no está en un dispositivo nativo, lanza una advertencia.
   * @param base64Data Cadena en Base64 SIN LA CABECERA (ej. no debe decir 'data:application/pdf;base64,')
   * @param fileName Nombre del archivo con extensión, ej. 'Reporte911.pdf'
   */
  shareBase64File: async (base64Data: string, fileName: string) => {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.warn('Native share is only available on Android/iOS natively. Should fallback to web logic.');
        return false; // Return false to indicate web fallback should be used
      }

      // Guardamos el archivo en el directorio de Caché para no dejar basura permanente en el teléfono
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache
      });

      // Se solicita compartir el URI recién creado
      await Share.share({
        title: 'Compartir Documento',
        text: 'Documento generado desde Acompáñame - NEM',
        url: savedFile.uri,
        dialogTitle: 'Compartir con...' // Título de la ventana nativa (Android)
      });
      
      return true; // Éxito en compartir
    } catch (error) {
      console.error('Error al guardar y compartir desde Capacitor:', error);
      hardwareServices.vibrateError();
      return false;
    }
  }
};
