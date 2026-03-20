
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { initGoogleAuth } from "./services/googleAuthService";

// Inicializar el plugin de Google Auth al arrancar la app.
// Se envuelve en try/catch porque en navegador web puede no estar disponible.
try {
  initGoogleAuth();
} catch (e) {
  console.warn("Google Auth plugin no disponible en este entorno:", e);
}

createRoot(document.getElementById("root")!).render(<App />);