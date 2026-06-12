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

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\dom.ts
  function getStagingDOM() {
    const stagingElement = document.createElement("div");
    stagingElement.style.display = "none";
    stagingElement.dataset.stagingId = Math.random().toString(36).slice(2);
    document.body.appendChild(stagingElement);
    return {
      $el: stagingElement,
      stage(dom) {
        stagingElement.innerHTML = "";
        stagingElement.appendChild(dom);
      },
      contentAsHtml() {
        return stagingElement.innerHTML;
      },
      contentAsText() {
        return stagingElement.textContent ?? "";
      },
      contentAsJson() {
        return JSON.parse(stagingElement.innerHTML);
      },
      destroy() {
        document.body.removeChild(stagingElement);
      }
    };
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\theme.ts
  function getThemeMode() {
    return document.documentElement.dataset.themeMode || "auto";
  }
  function isDarkMode() {
    const themeMode = getThemeMode();
    return themeMode === "auto" ? window.matchMedia("(prefers-color-scheme: dark)").matches : themeMode === "dark";
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\validate.ts
  function isObjectLiteral(str) {
    if (typeof str !== "string") {
      return false;
    }
    const trimmed = str.replace(/\s+/g, " ").trim().replace(/;$/, "");
    return trimmed.startsWith("{") && trimmed.endsWith("}");
  }

  // <stdin>
  var echartsArr = [];
  function initEchartsInTarget(target = document) {
    const echarts = window.echarts;
    const config = window.config.echarts;
    if (!echarts || !config)
      return;
    const isDark = isDarkMode();
    const stagingDOM = getStagingDOM();
    target.querySelectorAll(".echarts").forEach(($echarts) => {
      const $dataEl = $echarts.nextElementSibling;
      if ($dataEl.tagName !== "TEMPLATE")
        return;
      const chart = echarts.init($echarts, isDark ? "dark" : "light", { renderer: "svg" });
      chart.showLoading();
      stagingDOM.stage($dataEl.content.cloneNode(true));
      const _setOption = (option) => {
        if (!option) {
          chart.hideLoading();
          console.warn("ECharts option is missing or invalid. Chart disposed.", {
            element: $echarts,
            option: $dataEl
          });
          chart.dispose();
          $echarts.removeAttribute("style");
          return;
        }
        chart.hideLoading();
        chart.setOption(option);
        echartsArr.push(chart);
      };
      if ($dataEl.dataset.fmt === "js") {
        try {
          const jsCodes = stagingDOM.contentAsText();
          const _getOption = new Function("fixit", "chart", isObjectLiteral(jsCodes) ? `return ${jsCodes}` : jsCodes);
          if ($dataEl.dataset.async === "true") {
            return Promise.resolve(_getOption(window.fixit, chart)).then((option) => {
              _setOption(option);
            });
          }
          return _setOption(_getOption(window.fixit, chart));
        } catch (err) {
          return console.error(err);
        }
      }
      _setOption(stagingDOM.contentAsJson());
    });
    stagingDOM.destroy();
  }
  function applyEchartsTheme() {
    const echarts = window.echarts;
    const config = window.config.echarts;
    if (!echarts || !config)
      return;
    echarts.registerTheme("light", config.lightTheme);
    echarts.registerTheme("dark", config.darkTheme);
    echartsArr.forEach((chart) => chart.dispose());
    echartsArr = [];
    initEchartsInTarget();
  }
  document.addEventListener("DOMContentLoaded", () => {
    applyEchartsTheme();
    eventBus.on("fixit:switch-theme", ({ detail }) => {
      if (!detail.isChanged)
        return;
      applyEchartsTheme();
    });
    eventBus.on("fixit:resize", () => {
      echartsArr.forEach((chart) => chart.resize());
    });
    eventBus.on("fixit:decrypted", applyEchartsTheme);
    eventBus.on("fixit:partial-decrypted", ({ detail }) => initEchartsInTarget(detail.target));
  }, false);
})();
//# sourceMappingURL=echarts.js.map
