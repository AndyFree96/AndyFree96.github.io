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
var mermaid = null;
var config = {};
var hasBoundGlobalEvents = false;
var mermaidContainerObserver = null;
var mermaidRenderLock = Promise.resolve();
var mermaidConfigKey = "";
var mermaidIdSeq = 0;
var panzoomInstances = null;
var panzoomWheelHosts = null;
var mermaidPanzoomGroups = null;
function getMermaidPanzoomGroup(svg) {
  if (!svg.closest(".diagram-view"))
    return null;
  const container = svg.closest(".diagram-container");
  if (!container)
    return null;
  if (!mermaidPanzoomGroups)
    mermaidPanzoomGroups = /* @__PURE__ */ new WeakMap();
  let group = mermaidPanzoomGroups.get(container);
  if (!group) {
    group = { container, transform: null, svgs: /* @__PURE__ */ new Set(), lastSvg: null };
    mermaidPanzoomGroups.set(container, group);
  }
  const svgs = container.querySelectorAll(".mermaid svg, .mermaid-dark svg");
  svgs.forEach((item) => {
    group?.svgs.add(item);
  });
  return group;
}
function isSamePanzoomTransform(a, b) {
  if (!a || !b)
    return false;
  const eps = 1e-3;
  return Math.abs(a.x - b.x) <= eps && Math.abs(a.y - b.y) <= eps && Math.abs(a.scale - b.scale) <= eps;
}
function applyPanzoomTransform(instance, transform) {
  if (!instance || !transform)
    return;
  const currentTransform = {
    scale: instance.getScale(),
    ...instance.getPan()
  };
  if (isSamePanzoomTransform(currentTransform, transform))
    return;
  instance.zoom(transform.scale, { animate: false, force: true });
  setTimeout(() => instance.pan(transform.x, transform.y, { animate: false, force: true }));
}
function runWhenIdle(task, timeout = 0) {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(task, { timeout });
    return;
  }
  window.setTimeout(task, 80);
}
function isNodeVisuallyActive(node) {
  if (!isRenderContextActive(node))
    return false;
  const nodeStyle = getComputedStyle(node);
  if (nodeStyle.display === "none" || nodeStyle.visibility === "hidden")
    return false;
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
function isRenderContextActive(el) {
  if (!el.isConnected)
    return false;
  if (el.closest('[hidden], .d-none, [aria-hidden="true"]'))
    return false;
  const diagramView = el.closest(".diagram-view");
  if (diagramView?.closest(".diagram-tabs") && !diagramView.classList.contains("active"))
    return false;
  const panel = el.closest(".tab-panel");
  if (panel instanceof HTMLElement && panel.hidden)
    return false;
  return true;
}
function getTheme() {
  const themes = config.themes ?? ["default", "dark"];
  const lightTheme = themes[0] ?? "default";
  const darkTheme = themes[1] ?? lightTheme;
  return isDarkMode() ? darkTheme : lightTheme;
}
function withMermaidLock(task) {
  const run = mermaidRenderLock.then(task, task);
  mermaidRenderLock = run.then(
    () => void 0,
    () => void 0
  );
  return run;
}
function ensureMermaidInitialized(theme, darkMode) {
  if (!mermaid)
    return;
  const key = `${String(theme)}|${darkMode ? "1" : "0"}`;
  if (key === mermaidConfigKey)
    return;
  mermaidConfigKey = key;
  mermaid.initialize({
    startOnLoad: false,
    darkMode,
    theme,
    securityLevel: config.securitylevel,
    look: config.look,
    layout: config.layout,
    fontFamily: config.fontfamily,
    altFontFamily: config.fontfamily
  });
}
async function renderMermaidElement(el, options) {
  if (!el || !mermaid || el.hasAttribute("data-processed") || el.hasAttribute("data-processing"))
    return;
  if (!isRenderContextActive(el))
    return;
  const source = el.textContent?.trim() ?? "";
  if (!source) {
    el.setAttribute("data-processed", "");
    return;
  }
  await withMermaidLock(async () => {
    if (!el || !mermaid || el.hasAttribute("data-processed") || !isRenderContextActive(el))
      return;
    if (!el.hasAttribute("data-processing"))
      el.setAttribute("data-processing", "");
    ensureMermaidInitialized(options.theme, options.darkMode);
    const id = `fixit-mermaid-${++mermaidIdSeq}`;
    try {
      const result = await mermaid.render(id, source);
      const svg = result?.svg ?? "";
      el.innerHTML = svg;
      if (typeof result?.bindFunctions === "function") {
        try {
          result.bindFunctions(el);
        } catch {
        }
      }
      const svgEl = el.querySelector("svg");
      if (svgEl && !svgEl.id)
        svgEl.id = id;
      el.removeAttribute("data-processing");
      el.setAttribute("data-processed", "");
      const svgId = svgEl?.id ?? id;
      if (svgId) {
        const renderedSvg = document.getElementById(svgId);
        if (renderedSvg instanceof SVGElement)
          bindMermaidPanzoom(renderedSvg);
      }
    } catch (error) {
      const errDiv = document.getElementById(`d${id}`);
      if (errDiv) {
        el.innerHTML = errDiv.innerHTML;
        errDiv.remove();
      }
      el.removeAttribute("data-processing");
      el.setAttribute("data-processed", "");
      console.warn("FixIt Mermaid render failed:", error);
    }
  });
}
function collectMermaidContainers(root = document) {
  return Array.from(root.querySelectorAll(".diagram-container")).filter((container) => container.querySelector(".mermaid, .mermaid-dark, .mermaid-neutral"));
}
async function renderActiveLayerInContainer(container) {
  if (!container)
    return;
  const darkMode = isDarkMode();
  const el = container.querySelector(darkMode ? ".mermaid-dark" : ".mermaid");
  if (!el)
    return;
  if (el.hasAttribute("data-processed") || el.querySelector("svg"))
    return;
  if (!isNodeVisuallyActive(el))
    return;
  await renderMermaidElement(el, { theme: getTheme(), darkMode });
}
function scheduleNeutralRender() {
  if (window.matchMedia("only screen and (max-width: 960px)").matches)
    return;
  runWhenIdle(() => {
    const neutralNodes = Array.from(document.querySelectorAll(".mermaid-neutral")).filter((el) => !el.hasAttribute("data-processed")).filter(isRenderContextActive);
    neutralNodes.forEach((el) => {
      void renderMermaidElement(el, { theme: "neutral", darkMode: false });
    });
  });
}
function bindMermaidIntersectionObserver() {
  if (mermaidContainerObserver)
    return;
  mermaidContainerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting)
        return;
      const container = entry.target;
      if (!container || !isRenderContextActive(container))
        return;
      void renderActiveLayerInContainer(container);
    });
  }, {
    root: null,
    // 200px preloading margin lets diagrams render slightly before entering viewport.
    rootMargin: "200px 0px",
    threshold: 0.01
  });
}
function observeMermaidContainers(root = document, refresh = false) {
  bindMermaidIntersectionObserver();
  if (!mermaidContainerObserver)
    return;
  const containers = collectMermaidContainers(root);
  containers.forEach((container) => {
    if (container.hasAttribute("data-mermaid-observed"))
      return;
    container.setAttribute("data-mermaid-observed", "");
    mermaidContainerObserver?.observe(container);
  });
  if (!refresh)
    return;
  containers.forEach((container) => {
    mermaidContainerObserver?.unobserve(container);
    mermaidContainerObserver?.observe(container);
  });
}
function getActiveMermaidSvg(root) {
  const nodes = root?.querySelectorAll(".mermaid, .mermaid-dark, .mermaid-neutral");
  if (!nodes?.length)
    return null;
  const visible = Array.from(nodes).find((el) => {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden")
      return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
  return visible?.querySelector("svg") ?? null;
}
function bindMermaidPanzoom(svg) {
  if (!svg.closest(".diagram-view"))
    return;
  if (!svg.closest(".mermaid, .mermaid-dark"))
    return;
  if (!panzoomInstances)
    panzoomInstances = /* @__PURE__ */ new WeakMap();
  if (!panzoomWheelHosts)
    panzoomWheelHosts = /* @__PURE__ */ new WeakSet();
  if (panzoomInstances.has(svg))
    return;
  if (typeof window.Panzoom !== "function")
    return;
  const group = getMermaidPanzoomGroup(svg);
  const panzoom = window.Panzoom(svg, {
    maxScale: 6,
    minScale: 0.2,
    step: 0.1
  });
  panzoomInstances.set(svg, panzoom);
  if (group?.transform)
    applyPanzoomTransform(panzoom, group.transform);
  const host = svg.closest(".mermaid, .mermaid-dark");
  if (!host)
    return;
  if (panzoomWheelHosts.has(host))
    return;
  panzoomWheelHosts.add(host);
  host.addEventListener("pointerdown", () => {
    const currentSvg = host.querySelector("svg");
    if (group && currentSvg)
      group.lastSvg = currentSvg;
  }, false);
  host.addEventListener("wheel", (event) => {
    if (!event.ctrlKey)
      return;
    const currentSvg = host.querySelector("svg");
    const instance = currentSvg ? panzoomInstances?.get(currentSvg) : null;
    if (!instance)
      return;
    if (group && currentSvg)
      group.lastSvg = currentSvg;
    event.preventDefault();
    instance.zoomWithWheel(event);
  }, { passive: false });
}
async function initSingleDiagramTabs(tabs) {
  const actions = tabs.querySelector(".tabs-actions");
  const diagramTabBtn = tabs.querySelector('.tab-item[data-tab="diagram"]');
  const codeTabBtn = tabs.querySelector('.tab-item[data-tab="code"]');
  const diagramBlock = tabs.querySelector(".diagram-view");
  const codeBlock = Array.from(tabs.querySelectorAll(".tabs-content > .code-block")).find((block) => !block.classList.contains("diagram-view"));
  if (!actions || !diagramTabBtn || !codeTabBtn || !diagramBlock || !codeBlock)
    return;
  const zoomInBtn = tabs.querySelector(".diagram-zoom-in-btn");
  const zoomOutBtn = tabs.querySelector(".diagram-zoom-out-btn");
  const resetBtn = tabs.querySelector(".diagram-reset-btn");
  const downloadBtn = tabs.querySelector(".diagram-download-btn");
  tabs.dataset.diagramInit = "true";
  const diagramActionButtons = [zoomOutBtn, zoomInBtn, resetBtn, downloadBtn].filter(Boolean);
  const movedActionRestore = /* @__PURE__ */ new WeakMap();
  let codeActionCache = [];
  const pinnedFullscreenBtn = codeBlock.querySelector(".code-header .fullscreen-btn");
  if (pinnedFullscreenBtn && pinnedFullscreenBtn.parentElement !== actions) {
    actions.appendChild(pinnedFullscreenBtn);
  }
  const collectCodeActions = () => {
    const codeHeader = codeBlock.querySelector(".code-header");
    if (codeHeader) {
      return Array.from(codeHeader.querySelectorAll(".action-btn")).filter((btn) => btn !== pinnedFullscreenBtn);
    }
    return Array.from(codeBlock.querySelectorAll(".copy-icon-btn"));
  };
  const getCodeActions = () => {
    if (codeActionCache.length && codeActionCache.some((el) => el.isConnected))
      return codeActionCache;
    codeActionCache = collectCodeActions();
    return codeActionCache;
  };
  const setDiagramActionsVisible = (visible) => {
    diagramActionButtons.forEach((btn) => {
      btn.style.display = visible ? "" : "none";
    });
  };
  const moveToActions = (elements) => {
    elements.forEach((el) => {
      if (!el || el.parentElement === actions)
        return;
      movedActionRestore.set(el, { parent: el.parentElement, next: el.nextSibling });
      if (pinnedFullscreenBtn && pinnedFullscreenBtn.parentElement === actions) {
        actions.insertBefore(el, pinnedFullscreenBtn);
      } else {
        actions.appendChild(el);
      }
    });
  };
  const restoreMoved = (elements) => {
    elements.forEach((el) => {
      const restore = movedActionRestore.get(el);
      if (!restore?.parent)
        return;
      if (restore.next && restore.next.parentNode === restore.parent) {
        restore.parent.insertBefore(el, restore.next);
      } else {
        restore.parent.appendChild(el);
      }
      movedActionRestore.delete(el);
    });
  };
  const switchTo = (target) => {
    const showDiagram = target === "diagram";
    diagramTabBtn.classList.toggle("active", showDiagram);
    codeTabBtn.classList.toggle("active", !showDiagram);
    diagramBlock.classList.toggle("active", showDiagram);
    codeBlock.classList.toggle("active", !showDiagram);
    const codeActions = getCodeActions();
    if (showDiagram) {
      setDiagramActionsVisible(true);
      restoreMoved(codeActions);
    } else {
      setDiagramActionsVisible(false);
      moveToActions(codeActions);
    }
  };
  const resolvePanzoom = () => {
    const svg = getActiveMermaidSvg(diagramBlock);
    return svg && panzoomInstances ? panzoomInstances.get(svg) ?? null : null;
  };
  diagramTabBtn.addEventListener("click", () => switchTo("diagram"), false);
  codeTabBtn.addEventListener("click", () => switchTo("code"), false);
  zoomInBtn?.addEventListener("click", () => {
    const panzoom = resolvePanzoom();
    if (!panzoom?.zoomIn)
      return;
    try {
      panzoom.zoomIn({ animate: true });
    } catch {
      panzoom.zoomIn();
    }
  }, false);
  zoomOutBtn?.addEventListener("click", () => {
    const panzoom = resolvePanzoom();
    if (!panzoom?.zoomOut)
      return;
    try {
      panzoom.zoomOut({ animate: true });
    } catch {
      panzoom.zoomOut();
    }
  }, false);
  resetBtn?.addEventListener("click", () => {
    const panzoom = resolvePanzoom();
    if (!panzoom?.reset)
      return;
    try {
      panzoom.reset({ animate: true });
    } catch {
      panzoom.reset();
    }
  }, false);
  downloadBtn?.addEventListener("click", () => {
    const svg = getActiveMermaidSvg(diagramBlock);
    if (!svg)
      return;
    const clonedSvg = svg.cloneNode(true);
    if (!(clonedSvg instanceof SVGElement))
      return;
    clonedSvg.removeAttribute("style");
    const xml = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = diagramBlock.dataset.filename ?? "mermaid.mmd";
    link.href = url;
    link.download = `${filename.split(".")[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, false);
}
function initDiagramControls() {
  const tabsList = document.querySelectorAll('.diagram-tabs[data-diagram="mermaid"]:not([data-diagram-init])');
  tabsList.forEach((tabs) => {
    void initSingleDiagramTabs(tabs);
  });
}
function bindTabContainerChanged() {
  document.addEventListener("tab-container-changed", (event) => {
    const panel = event.panel ?? event.detail?.relatedTarget;
    if (!panel)
      return;
    observeMermaidContainers(panel, true);
  }, false);
}
function bindThemeSync() {
  const getActivePanzoomSvg = (container) => {
    const nodes = container.querySelectorAll(".mermaid, .mermaid-dark");
    if (!nodes.length)
      return null;
    const visible = Array.from(nodes).find((el) => {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden")
        return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    return visible?.querySelector("svg") ?? null;
  };
  const safeGetTransformFromSvg = (svg) => {
    const instance = svg ? panzoomInstances?.get(svg) : null;
    if (!instance?.getPan || !instance?.getScale)
      return null;
    try {
      const pan = instance.getPan();
      const scale = instance.getScale();
      if (pan && typeof scale === "number")
        return { x: pan.x, y: pan.y, scale };
    } catch {
      return null;
    }
    return null;
  };
  const sync = (nowDark) => {
    if (!mermaidPanzoomGroups)
      return;
    document.querySelectorAll(".diagram-view .diagram-container").forEach((container) => {
      const currentActive = getActivePanzoomSvg(container);
      const fallbackSource = nowDark ? container.querySelector(".mermaid svg") : container.querySelector(".mermaid-dark svg");
      const groupSeed = currentActive ?? fallbackSource;
      if (!groupSeed)
        return;
      const group = getMermaidPanzoomGroup(groupSeed);
      if (!group)
        return;
      const last = group.lastSvg;
      const sourceSvg = last?.isConnected ? last : fallbackSource ?? currentActive;
      const sourceTransform = safeGetTransformFromSvg(sourceSvg);
      if (sourceTransform)
        group.transform = sourceTransform;
      if (!group.transform)
        return;
      if (currentActive) {
        const instance = panzoomInstances?.get(currentActive);
        applyPanzoomTransform(instance, group.transform);
      }
    });
  };
  eventBus.on("fixit:switch-theme", ({ detail }) => {
    if (!detail?.isChanged)
      return;
    sync(detail.isDark);
    observeMermaidContainers(document, true);
  });
}
function initMermaid() {
  const mermaidElements = document.querySelectorAll(".mermaid, .mermaid-dark, .mermaid-neutral");
  if (!mermaidElements.length)
    return;
  initDiagramControls();
  observeMermaidContainers();
  scheduleNeutralRender();
}
function bindGlobalEventsOnce() {
  if (hasBoundGlobalEvents)
    return;
  hasBoundGlobalEvents = true;
  console.log(
    "%c\u{1F4AB} FixIt Mermaid",
    "color: #FF3670; font-weight: bold; font-size: 16px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);"
  );
  bindThemeSync();
  bindTabContainerChanged();
  initMermaid();
  eventBus.on("fixit:decrypted", initMermaid);
  eventBus.on("fixit:partial-decrypted", initMermaid);
}
async function initMermaidRuntime(runtime) {
  mermaid = runtime.mermaid;
  config = runtime.config;
  const externalDiagrams = [];
  if (runtime.zenuml)
    externalDiagrams.push(runtime.zenuml);
  if (externalDiagrams.length && typeof mermaid.registerExternalDiagrams === "function") {
    try {
      await mermaid.registerExternalDiagrams(externalDiagrams);
    } catch (error) {
      console.warn("FixIt Mermaid registerExternalDiagrams failed:", error);
    }
  }
  const loaders = [];
  runtime.loaders.forEach((item) => {
    if (Array.isArray(item))
      loaders.push(...item);
    else
      loaders.push(item);
  });
  if (loaders.length && typeof mermaid.registerLayoutLoaders === "function") {
    try {
      mermaid.registerLayoutLoaders(loaders);
    } catch (error) {
      console.warn("FixIt Mermaid registerLayoutLoaders failed:", error);
    }
  }
  mermaid.startOnLoad = false;
  window.mermaid = mermaid;
  document.addEventListener("DOMContentLoaded", bindGlobalEventsOnce, { once: true });
  if (document.readyState !== "loading")
    bindGlobalEventsOnce();
}
function unwrapModule(mod) {
  if (mod && typeof mod === "object" && "default" in mod) {
    return mod.default;
  }
  return mod;
}
async function bootstrapMermaid(options) {
  const { mermaidSource, zenumlSource = "", layoutLoaderSources = [], config: config2 } = options;
  try {
    const mermaidMod = await import(mermaidSource);
    const mermaid2 = unwrapModule(mermaidMod);
    let zenuml;
    if (zenumlSource) {
      try {
        const zenumlMod = await import(zenumlSource);
        zenuml = unwrapModule(zenumlMod);
      } catch (error) {
        console.warn("FixIt Mermaid zenuml load failed:", error);
      }
    }
    const loaded = await Promise.all(layoutLoaderSources.map(async (source) => {
      try {
        const loaderMod = await import(source);
        return unwrapModule(loaderMod);
      } catch (error) {
        console.warn("FixIt Mermaid layout loader load failed:", source, error);
        return null;
      }
    }));
    const runtime = {
      mermaid: mermaid2,
      config: config2,
      zenuml,
      // Keep only successfully loaded optional loaders.
      loaders: loaded.filter((item) => item !== null)
    };
    await initMermaidRuntime(runtime);
  } catch (error) {
    console.warn("FixIt Mermaid bootstrap failed:", error);
  }
}
export {
  bootstrapMermaid,
  initMermaidRuntime
};
//# sourceMappingURL=mermaid.js.map
