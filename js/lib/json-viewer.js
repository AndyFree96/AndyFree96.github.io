(() => {
  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\core\event-bus.ts
  var TypedEventBus = class {
    target = document;
    on(event, handler) {
      this.target.addEventListener(event, handler);
    }
    off(event, handler) {
      this.target.removeEventListener(event, handler);
    }
    emit(event, ...args) {
      const detail = args[0];
      this.target.dispatchEvent(
        detail !== void 0 ? new CustomEvent(event, { detail }) : new CustomEvent(event)
      );
    }
  };
  var eventBus = new TypedEventBus();

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\theme.ts
  function getThemeMode() {
    return document.documentElement.dataset.themeMode || "auto";
  }
  function isDarkMode() {
    const themeMode = getThemeMode();
    return themeMode === "auto" ? window.matchMedia("(prefers-color-scheme: dark)").matches : themeMode === "dark";
  }

  // <stdin>
  function applyJsonViewerTheme(isDark) {
    document.querySelectorAll("json-viewer").forEach(($el) => {
      $el.setAttribute("theme", isDark ? "dark" : "light");
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.JsonViewerElement)
      return;
    applyJsonViewerTheme(isDarkMode());
    eventBus.on("fixit:switch-theme", ({ detail }) => {
      if (!detail.isChanged)
        return;
      applyJsonViewerTheme(detail.isDark);
    });
  }, false);
})();
//# sourceMappingURL=json-viewer.js.map
