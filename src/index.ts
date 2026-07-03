import { initConfig } from "./config";
import { buildNumber, mode, scriptInfo } from "./constants";
import { clearFailureCount } from "./feedback";
import { installTimedtextInterceptor } from "./intercept";
import { initObservers } from "./observers";
import { addStyle, domLoaded, error, log } from "./utils";
import { initYoutube } from "./youtube";
import { initAiStudio } from "./aistudio";

/** Runs when the userscript is loaded initially */
async function init() {
  // Must run at document-start, before the YouTube player issues its timedtext requests.
  if(location.hostname.endsWith("youtube.com"))
    installTimedtextInterceptor();

  await initConfig();

  if(domLoaded)
    run();
  else
    document.addEventListener("DOMContentLoaded", run);
}

/** Runs after the DOM is available */
async function run() {
  try {
    log(`Initializing ${scriptInfo.name} v${scriptInfo.version} (#${buildNumber})...`);

    // post-build these double quotes are replaced by backticks (because if backticks are used here, the bundler converts them to double quotes)
    addStyle("#{{GLOBAL_STYLE}}", "global");

    registerDevCommands();
    initObservers();

    // The script matches both YouTube and Google AI Studio - run only the relevant side.
    if(location.hostname.endsWith("youtube.com"))
      initYoutube();
    else if(location.hostname.endsWith("aistudio.google.com"))
      void initAiStudio();
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
  GM.registerMenuCommand("[dev] 清除失敗計數", async () => {
    await clearFailureCount();
    log("Failure counter cleared.");
  });
}

init();
