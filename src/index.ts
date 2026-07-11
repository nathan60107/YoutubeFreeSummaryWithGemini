import { isAutoSummaryRequest, runAutoSummary } from "./auto-summarize";
import { config, initConfig } from "./config";
import { buildNumber, mode, scriptInfo } from "./constants";
import { clearFailureCount } from "./feedback";
import { initI18n, t } from "./i18n";
import { installTimedtextInterceptor } from "./intercept";
import { initObservers } from "./observers";
import { error, log } from "./log";
import { addStyle, domLoaded } from "./utils";
import { initYoutube } from "./youtube";
import { getProviderByHost, initProviderTarget } from "./providers";

/** Runs when the userscript is loaded initially */
async function init() {
  // Must run at document-start, before the YouTube player issues its timedtext requests.
  if(location.hostname.endsWith("youtube.com"))
    installTimedtextInterceptor();

  await initConfig();
  // Resolve the interface language now that the saved config (and its `language` field) is loaded.
  initI18n(config.getData().language);

  if(domLoaded)
    run();
  else
    document.addEventListener("DOMContentLoaded", run);
}

/** Runs after the DOM is available */
async function run() {
  try {
    log(`Initializing ${scriptInfo.name} v${scriptInfo.version} (#${buildNumber})...`);

    // A watch tab we opened to summarize a gated video (see auto-summarize.ts): capture + close, no UI.
    if(location.hostname.endsWith("youtube.com") && isAutoSummaryRequest()) {
      void runAutoSummary();
      return;
    }

    // post-build these double quotes are replaced by backticks (because if backticks are used here, the bundler converts them to double quotes)
    addStyle("#{{GLOBAL_STYLE}}", "global");

    registerDevCommands();
    initObservers();

    // The script matches YouTube and every supported AI provider - run only the relevant side.
    if(location.hostname.endsWith("youtube.com")) {
      initYoutube();
    }
    else {
      const provider = getProviderByHost(location.hostname);
      if(provider)
        void initProviderTarget(provider);
    }
  }
  catch(err) {
    error("Fatal error:", err);
    return;
  }
}

/** Registers development-only menu commands. `GM.registerMenuCommand` is only granted in dev builds. */
function registerDevCommands() {
  if(mode !== "development")
    return;
  GM.registerMenuCommand(t("dev.clearFailures"), async () => {
    await clearFailureCount();
    log("Failure counter cleared.");
  });
}

init();
