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

  // <stdin>
  function initFileTree(target = document) {
    target.querySelectorAll(".file-tree-toggle:not([data-init])").forEach((label) => {
      label.addEventListener("click", (e) => {
        e.stopPropagation();
        const item = label.closest(".file-tree-folder");
        const isCollapsed = item.classList.contains("is-collapsed");
        item && item.classList.toggle("is-collapsed", !isCollapsed);
        const wrapper = label.closest(".file-tree-wrapper");
        updateLineHeight(wrapper);
      });
      label.dataset.init = "true";
    });
    updateLineHeight(target);
  }
  function updateLineHeight(target = document) {
    const uls = target.querySelectorAll(".file-tree .file-tree");
    uls.forEach((ul) => {
      const parentItem = ul.closest(".file-tree-item.is-collapsed");
      if (parentItem) {
        ul.style.removeProperty("--fi-file-tree-line-height");
        return;
      }
      const items = Array.from(ul.children).filter((el) => el.classList?.contains("file-tree-item"));
      if (!items.length) {
        ul.style.removeProperty("--fi-file-tree-line-height");
        return;
      }
      const firstLabel = items[0].querySelector(".file-tree-label");
      const lastLabel = items[items.length - 1].querySelector(".file-tree-label");
      if (!firstLabel || !lastLabel)
        return;
      const firstRect = firstLabel.getBoundingClientRect();
      const lastRect = lastLabel.getBoundingClientRect();
      const firstCenterY = firstRect.top + firstRect.height / 2;
      const lastCenterY = lastRect.top + lastRect.height / 2;
      const offsetY = firstRect.height / 2 + 1 / 2 + 4;
      const height = Math.max(0, lastCenterY - firstCenterY + offsetY);
      ul.style.setProperty("--fi-file-tree-line-height", `${height}px`);
    });
  }
  function expandAll(target = document) {
    target.querySelectorAll(".file-tree-folder").forEach((folder) => folder.classList.remove("is-collapsed"));
    updateLineHeight(target);
  }
  function bindEvents() {
    document.addEventListener("tab-container-changed", (e) => {
      const panel = e.panel || e.detail?.relatedTarget;
      if (panel)
        updateLineHeight(panel);
    }, false);
    window.addEventListener("beforeprint", () => {
      if (window.config.print?.expandFileTree) {
        expandAll(document.getElementById("content"));
      }
    }, false);
    eventBus.on("fixit:decrypted", () => {
      initFileTree();
    });
    eventBus.on("fixit:partial-decrypted", ({ detail }) => {
      initFileTree(detail.target);
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    initFileTree();
    bindEvents();
  }, false);
})();
//# sourceMappingURL=file-tree.js.map
