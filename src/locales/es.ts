import type { Translations } from "./en";

/** Español (Spanish). */
export const es: Translations = {
  "settings.dialogLabel": "Ajustes de YFAS",
  "settings.title": "Ajustes del resumen de YouTube",
  "settings.provider.label": "Servicio de IA",
  "settings.provider.hint": "Elige a qué IA se envía el resumen (primero debes haber iniciado sesión en ella)",
  "settings.provider.recommended": " (recomendado)",
  "settings.language.label": "Idioma de la interfaz",
  "settings.language.hint": "Idioma en el que se muestra la interfaz de este script",
  "settings.language.auto": "Seguir el navegador",
  "settings.prompt.label": "Plantilla del prompt",
  "settings.prompt.hint": "Variables: <code>{{title}}</code> título, <code>{{url}}</code> enlace, <code>{{transcript}}</code> subtítulos",
  "settings.langs.label": "Idiomas de subtítulos preferidos",
  "settings.langs.hint": "Códigos de idioma separados por comas, p. ej. <code>zh-TW, ja, en</code>. Vacío = seguir el idioma del navegador",
  "settings.langs.placeholder": "Vacío = automático",
  "settings.timestamps": "Incluir marcas de tiempo en los subtítulos (<code>[h:mm:ss]</code>)",
  "settings.autoSubmit": "Enviar automáticamente tras insertar",
  "settings.reset": "Restablecer valores predeterminados",
  "settings.cancel": "Cancelar",
  "settings.save": "Guardar",

  "button.label": "Resumir",
  "button.summarizeWith": "Resumir con %1",
  "button.settings": "Ajustes",
  "button.noCaptions": "Este vídeo no tiene subtítulos disponibles, así que no se puede resumir",

  "feedback.title": "El resumen falló",
  "feedback.defaultMessage": "El resumen falló. Actualiza la página e inténtalo de nuevo.",
  "feedback.debug.lead": "Este problema parece repetirse. Si continúa, ayúdanos a informarlo para que se pueda solucionar más rápido:",
  "feedback.debug.step1": "Haz clic en «Copiar diagnóstico» abajo.",
  "feedback.debug.step2": "Ve al gestor de incidencias y abre una nueva.",
  "feedback.debug.step3": "Pega lo que copiaste y describe brevemente lo que hiciste.",
  "feedback.debug.copy": "Copiar diagnóstico",
  "feedback.debug.copied": "Copiado ✓",
  "feedback.debug.copyFailed": "Error al copiar, selecciónalo manualmente",
  "feedback.debug.issue": "Ir al gestor de incidencias ↗",
  "feedback.close": "Cerrar",

  "notice.title": "No se encontraron subtítulos",

  "error.noCaptions": "No se encontraron subtítulos ni traducciones para este vídeo, así que no se puede resumir. Asegúrate de que el vídeo tenga subtítulos, actualiza la página e inténtalo de nuevo.",
  "error.noInput": "No se encontró el cuadro de texto en %1. Puede que la página no haya terminado de cargar o que su diseño haya cambiado. Actualiza la página e inténtalo de nuevo.",

  "provider.aistudio.note": "La mejor calidad: sin límite de longitud y acceso gratuito a modelos Pro; el tiempo de razonamiento es más largo, pero los resultados son muy precisos. Ideal para subtítulos largos.",
  "provider.gemini.note": "Buenos resultados, pero el cuadro de texto tiene un límite de longitud; los subtítulos largos podrían no pegarse por completo.",
  "provider.chatgpt.note": "El modelo gratuito es más débil; puede no responder cuando los subtítulos son demasiado largos. Mejor para vídeos cortos.",
  "provider.claude.note": "Tiempo de razonamiento más largo; los resultados a veces tienen pequeños defectos.",
  "provider.grok.note": "Calidad inferior a AI Studio; los resultados a veces tienen pequeños defectos.",

  "dev.clearFailures": "[dev] Borrar el contador de fallos",

  "prompt.default": [
    "Resume los puntos clave de los siguientes subtítulos de un vídeo de YouTube (con marcas de tiempo), e indica la marca de tiempo correspondiente a cada punto.",
    "",
    "Título: {{title}}",
    "URL: {{url}}",
    "",
    "{{transcript}}",
  ].join("\n"),
};
