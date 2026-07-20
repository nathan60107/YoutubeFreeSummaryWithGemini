import type { Translations } from "./en";

/** Français (French). */
export const fr: Translations = {
  "settings.dialogLabel": "Paramètres YFAS",
  "settings.title": "Paramètres du résumé YouTube",
  "settings.provider.label": "Service d’IA",
  "settings.provider.hint": "Choisissez à quelle IA le résumé est envoyé (vous devez d’abord y être connecté)",
  "settings.provider.recommended": " (recommandé)",
  "settings.language.label": "Langue de l’interface",
  "settings.language.hint": "Langue d’affichage de l’interface de ce script",
  "settings.language.auto": "Suivre le navigateur",
  "settings.prompt.label": "Modèle de prompt",
  "settings.prompt.hint": "Variables : <code>{{title}}</code> titre, <code>{{url}}</code> lien, <code>{{transcript}}</code> sous-titres",
  "settings.langs.label": "Langues de sous-titres préférées",
  "settings.langs.hint": "Codes de langue séparés par des virgules, p. ex. <code>zh-TW, ja, en</code>. Vide = suivre la langue du navigateur",
  "settings.langs.placeholder": "Vide = automatique",
  "settings.timestamps": "Inclure les horodatages dans les sous-titres (<code>[h:mm:ss]</code>)",
  "settings.autoSubmit": "Envoyer automatiquement après insertion",
  "settings.reset": "Réinitialiser aux valeurs par défaut",
  "settings.cancel": "Annuler",
  "settings.save": "Enregistrer",

  "button.label": "Résumer",
  "button.summarizeWith": "Résumer avec %1",
  "button.settings": "Paramètres",
  "button.noCaptions": "Cette vidéo n’a aucun sous-titre disponible, elle ne peut donc pas être résumée",

  "feedback.title": "Échec du résumé",
  "feedback.defaultMessage": "Le résumé a échoué. Veuillez actualiser la page et réessayer.",
  "feedback.debug.lead": "Ce problème semble se répéter. S’il persiste, aidez-nous à le signaler pour qu’il soit corrigé plus vite :",
  "feedback.debug.step1": "Cliquez sur « Copier le diagnostic » ci-dessous.",
  "feedback.debug.step2": "Rendez-vous sur le suivi des problèmes et ouvrez un nouveau ticket.",
  "feedback.debug.step3": "Collez ce que vous avez copié et décrivez brièvement ce que vous avez fait.",
  "feedback.debug.copy": "Copier le diagnostic",
  "feedback.debug.copied": "Copié ✓",
  "feedback.debug.copyFailed": "Échec de la copie, sélectionnez manuellement",
  "feedback.debug.issue": "Aller au suivi des problèmes ↗",
  "feedback.close": "Fermer",

  "notice.title": "Aucun sous-titre trouvé",

  "error.noCaptions": "Aucun sous-titre ni traduction n’a été trouvé pour cette vidéo, elle ne peut donc pas être résumée. Assurez-vous que la vidéo a des sous-titres, puis actualisez et réessayez.",
  "error.noInput": "Impossible de trouver le champ de saisie sur %1 — la page n’a peut-être pas fini de charger, ou sa mise en page a changé. Veuillez actualiser et réessayer.",

  "provider.aistudio.note": "Meilleure qualité : aucune limite de longueur et accès gratuit aux modèles Pro ; temps de réflexion plus long, mais résultats très précis. Idéal pour les longs sous-titres.",
  "provider.gemini.note": "Bons résultats, mais le champ de saisie a une limite de longueur ; les longs sous-titres risquent de ne pas être collés en entier.",
  "provider.chatgpt.note": "Modèle gratuit plus faible ; il peut ne pas répondre du tout quand les sous-titres sont trop longs. Idéal pour les vidéos courtes.",
  "provider.claude.note": "Temps de réflexion plus long ; les résultats présentent parfois de petits défauts.",
  "provider.grok.note": "Qualité inférieure à AI Studio ; les résultats présentent parfois de petits défauts.",

  "dev.clearFailures": "[dev] Réinitialiser le compteur d’échecs",

  "prompt.default": [
    "Résume les points clés des sous-titres suivants d’une vidéo YouTube (avec horodatage), et indique l’horodatage correspondant à chaque point.",
    "",
    "Titre : {{title}}",
    "URL : {{url}}",
    "",
    "{{transcript}}",
  ].join("\n"),
};
