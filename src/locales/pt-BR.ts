import type { Translations } from "./en";

/** Português (Brasil) — Brazilian Portuguese. */
export const ptBR: Translations = {
  "settings.dialogLabel": "Configurações do YFAS",
  "settings.title": "Configurações do resumo do YouTube",
  "settings.provider.label": "Serviço de IA",
  "settings.provider.hint": "Escolha para qual IA o resumo é enviado (você precisa estar conectado a ela primeiro)",
  "settings.provider.recommended": " (recomendado)",
  "settings.language.label": "Idioma da interface",
  "settings.language.hint": "Idioma em que a interface deste script é exibida",
  "settings.language.auto": "Seguir o navegador",
  "settings.prompt.label": "Modelo de prompt",
  "settings.prompt.hint": "Variáveis: <code>{{title}}</code> título, <code>{{url}}</code> link, <code>{{transcript}}</code> legendas",
  "settings.langs.label": "Idiomas de legenda preferidos",
  "settings.langs.hint": "Códigos de idioma separados por vírgula, ex.: <code>zh-TW, ja, en</code>. Vazio = seguir o idioma do navegador",
  "settings.langs.placeholder": "Vazio = automático",
  "settings.timestamps": "Incluir marcações de tempo nas legendas (<code>[h:mm:ss]</code>)",
  "settings.autoSubmit": "Enviar automaticamente após inserir",
  "settings.reset": "Restaurar padrões",
  "settings.cancel": "Cancelar",
  "settings.save": "Salvar",

  "button.label": "Resumir",
  "button.summarizeWith": "Resumir com %1",
  "button.settings": "Configurações",
  "button.noCaptions": "Este vídeo não tem legendas disponíveis, então não é possível resumi-lo",

  "feedback.title": "Falha no resumo",
  "feedback.defaultMessage": "O resumo falhou. Atualize a página e tente novamente.",
  "feedback.debug.lead": "Esse problema parece estar se repetindo. Se continuar, ajude a relatá-lo para que possa ser corrigido mais rápido:",
  "feedback.debug.step1": "Clique em “Copiar diagnóstico” abaixo.",
  "feedback.debug.step2": "Vá ao rastreador de problemas e abra uma nova issue.",
  "feedback.debug.step3": "Cole o que você copiou e descreva brevemente o que fez.",
  "feedback.debug.copy": "Copiar diagnóstico",
  "feedback.debug.copied": "Copiado ✓",
  "feedback.debug.copyFailed": "Falha ao copiar, selecione manualmente",
  "feedback.debug.issue": "Ir ao rastreador de problemas ↗",
  "feedback.close": "Fechar",

  "notice.title": "Nenhuma legenda encontrada",

  "error.noCaptions": "Não foram encontradas legendas/traduções para este vídeo, então não é possível resumi-lo. Verifique se o vídeo tem legendas, atualize a página e tente novamente.",
  "error.noInput": "Não foi possível encontrar o campo de entrada em %1 — a página pode não ter terminado de carregar, ou seu layout mudou. Atualize a página e tente novamente.",

  "provider.aistudio.note": "Melhor qualidade: sem limite de tamanho e acesso gratuito a modelos Pro; tempo de raciocínio maior, mas resultados muito precisos. Ótimo para legendas longas.",
  "provider.gemini.note": "Bons resultados, mas o campo de entrada tem limite de tamanho; legendas longas podem não ser coladas por completo.",
  "provider.chatgpt.note": "Modelo gratuito mais fraco; pode não responder quando as legendas são muito longas. Melhor para vídeos curtos.",
  "provider.claude.note": "Tempo de raciocínio maior; os resultados ocasionalmente têm pequenas falhas.",
  "provider.grok.note": "Qualidade abaixo do AI Studio; os resultados ocasionalmente têm pequenas falhas.",

  "dev.clearFailures": "[dev] Limpar contagem de falhas",

  "prompt.default": [
    "Resuma os pontos principais das seguintes legendas de um vídeo do YouTube (com marcações de tempo) e indique a marcação de tempo correspondente a cada ponto.",
    "",
    "Título: {{title}}",
    "URL: {{url}}",
    "",
    "{{transcript}}",
  ].join("\n"),
};
