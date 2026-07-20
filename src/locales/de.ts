import type { Translations } from "./en";

/** Deutsch (German). */
export const de: Translations = {
  "settings.dialogLabel": "YFAS-Einstellungen",
  "settings.title": "Einstellungen der YouTube-Zusammenfassung",
  "settings.provider.label": "KI-Dienst",
  "settings.provider.hint": "Wähle, an welche KI die Zusammenfassung gesendet wird (du musst dort zuerst angemeldet sein)",
  "settings.provider.recommended": " (empfohlen)",
  "settings.language.label": "Oberflächensprache",
  "settings.language.hint": "Sprache, in der die Oberfläche dieses Skripts angezeigt wird",
  "settings.language.auto": "Browser folgen",
  "settings.prompt.label": "Prompt-Vorlage",
  "settings.prompt.hint": "Variablen: <code>{{title}}</code> Titel, <code>{{url}}</code> Link, <code>{{transcript}}</code> Untertitel",
  "settings.langs.label": "Bevorzugte Untertitelsprachen",
  "settings.langs.hint": "Kommagetrennte Sprachcodes, z. B. <code>zh-TW, ja, en</code>. Leer = der Browsersprache folgen",
  "settings.langs.placeholder": "Leer = automatisch",
  "settings.timestamps": "Zeitstempel in Untertiteln einschließen (<code>[h:mm:ss]</code>)",
  "settings.autoSubmit": "Nach dem Einfügen automatisch absenden",
  "settings.reset": "Auf Standard zurücksetzen",
  "settings.cancel": "Abbrechen",
  "settings.save": "Speichern",

  "button.label": "Zusammenfassen",
  "button.summarizeWith": "Mit %1 zusammenfassen",
  "button.settings": "Einstellungen",
  "button.noCaptions": "Dieses Video hat keine verfügbaren Untertitel und kann daher nicht zusammengefasst werden",

  "feedback.title": "Zusammenfassung fehlgeschlagen",
  "feedback.defaultMessage": "Die Zusammenfassung ist fehlgeschlagen. Bitte lade die Seite neu und versuche es erneut.",
  "feedback.debug.lead": "Dieses Problem scheint wiederholt aufzutreten. Falls es weiterhin besteht, hilf bitte mit, es zu melden, damit es schneller behoben werden kann:",
  "feedback.debug.step1": "Klicke unten auf „Diagnose kopieren“.",
  "feedback.debug.step2": "Gehe zum Issue-Tracker und öffne ein neues Issue.",
  "feedback.debug.step3": "Füge das Kopierte ein und beschreibe kurz, was du getan hast.",
  "feedback.debug.copy": "Diagnose kopieren",
  "feedback.debug.copied": "Kopiert ✓",
  "feedback.debug.copyFailed": "Kopieren fehlgeschlagen, bitte manuell auswählen",
  "feedback.debug.issue": "Zum Issue-Tracker ↗",
  "feedback.close": "Schließen",

  "notice.title": "Keine Untertitel gefunden",

  "error.noCaptions": "Für dieses Video wurden keine Untertitel/Übersetzungen gefunden, daher kann es nicht zusammengefasst werden. Stelle sicher, dass das Video Untertitel hat, lade die Seite neu und versuche es erneut.",
  "error.noInput": "Das Eingabefeld auf %1 wurde nicht gefunden – die Seite ist möglicherweise noch nicht fertig geladen oder ihr Layout hat sich geändert. Bitte lade die Seite neu und versuche es erneut.",

  "provider.aistudio.note": "Beste Qualität: keine Längenbegrenzung und kostenloser Zugriff auf Pro-Modelle; längere Denkzeit, aber sehr genaue Ergebnisse. Ideal für lange Untertitel.",
  "provider.gemini.note": "Gute Ergebnisse, aber das Eingabefeld hat eine Längenbegrenzung; längere Untertitel lassen sich womöglich nicht vollständig einfügen.",
  "provider.chatgpt.note": "Schwächeres kostenloses Modell; antwortet bei zu langen Untertiteln möglicherweise gar nicht. Am besten für kürzere Videos.",
  "provider.claude.note": "Längere Denkzeit; die Ergebnisse haben gelegentlich kleine Mängel.",
  "provider.grok.note": "Qualität unter AI Studio; die Ergebnisse haben gelegentlich kleine Mängel.",

  "dev.clearFailures": "[dev] Fehlerzähler zurücksetzen",

  "prompt.default": [
    "Fasse die wichtigsten Punkte der folgenden Untertitel eines YouTube-Videos (mit Zeitstempeln) zusammen und gib zu jedem Punkt den entsprechenden Zeitstempel an.",
    "",
    "Titel: {{title}}",
    "URL: {{url}}",
    "",
    "{{transcript}}",
  ].join("\n"),
};
