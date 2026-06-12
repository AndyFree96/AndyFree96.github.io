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

  // <stdin>
  function initTypeit(target = document) {
    const TypeIt = window.TypeIt;
    const config = window.config.typeit;
    if (!TypeIt || !config)
      return;
    const speed = config.speed || 100;
    const cursorSpeed = config.cursorSpeed || 1e3;
    const cursorChar = config.cursorChar || "|";
    const loop = config.loop ?? false;
    const typeitElements = target.querySelectorAll(".typeit");
    const groupMap = Array.from(typeitElements).reduce((acc, ele) => {
      const group = ele.dataset.group || ele.id || Math.random().toString(36).substring(2);
      acc[group] = acc[group] || [];
      acc[group].push(ele);
      return acc;
    }, {});
    const stagingDOM = getStagingDOM();
    Object.values(groupMap).forEach((group) => {
      const typeone = (i) => {
        const typeitElement = group[i];
        const singleData = typeitElement.dataset;
        stagingDOM.stage(typeitElement.querySelector("template").content.cloneNode(true));
        let targetEle = typeitElement.firstElementChild;
        if (typeitElement.firstElementChild.tagName === "TEMPLATE") {
          typeitElement.innerHTML = "";
          targetEle = typeitElement;
        }
        const instance = new TypeIt(targetEle, {
          strings: stagingDOM.$el.querySelector("pre")?.innerHTML || stagingDOM.contentAsHtml(),
          speed: Number(singleData.speed) >= 0 ? Number(singleData.speed) : speed,
          lifeLike: true,
          cursorSpeed: Number(singleData.cursorSpeed) >= 0 ? Number(singleData.cursorSpeed) : cursorSpeed,
          cursorChar: singleData.cursorChar || cursorChar,
          waitUntilVisible: true,
          loop: singleData.loop ? singleData.loop === "true" : loop,
          afterComplete: () => {
            const duration = Number(singleData.duration ?? config.duration);
            if (i === group.length - 1) {
              if (duration >= 0) {
                window.setTimeout(() => {
                  instance.destroy();
                }, duration);
              }
              return;
            }
            instance.destroy();
            typeone(i + 1);
          }
        }).go();
      };
      typeone(0);
    });
    stagingDOM.destroy();
  }
  document.addEventListener("DOMContentLoaded", () => {
    initTypeit();
    eventBus.on("fixit:decrypted", () => initTypeit());
    eventBus.on("fixit:partial-decrypted", ({ detail }) => initTypeit(detail.target));
  }, false);
})();
//# sourceMappingURL=typeit.js.map
