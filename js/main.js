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

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\animation.ts
  function animateCSS(element, animation, reserved, callback) {
    const animations = Array.isArray(animation) ? animation : [animation];
    element.classList.add("animate__animated", ...animations);
    element.addEventListener("animationend", () => {
      !reserved && element.classList.remove("animate__animated", ...animations);
      typeof callback === "function" && callback();
    }, { once: true });
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\clipboard.ts
  function createCopyText() {
    if (navigator.clipboard) {
      return (text) => navigator.clipboard.writeText(text);
    }
    return (text) => new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      if (document.execCommand("copy")) {
        document.body.removeChild(input);
        resolve();
      } else {
        reject(new Error("Copy failed"));
      }
    });
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\dom.ts
  function getScrollTop() {
    return (document.documentElement ?? document.body).scrollTop;
  }
  function scrollIntoView(selector) {
    const element = selector.startsWith("#") ? document.getElementById(selector.slice(1)) : document.querySelector(selector);
    element?.scrollIntoView({
      behavior: "smooth"
    });
  }
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

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\file.ts
  function downloadAsFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/[\\/:*?"<>|\r\n]+/g, "-");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\media.ts
  function isMobile() {
    return window.matchMedia("only screen and (max-width: 680px)").matches;
  }
  function isTocStatic() {
    return document.getElementById("toc-static")?.dataset?.kept === "true" || window.matchMedia("only screen and (max-width: 960px)").matches;
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\string.ts
  function HTMLEscape(str) {
    return str.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }
  function applyHighlightToText(text, indices, highlightTag) {
    let offset = 0;
    for (let i = 0; i < indices.length; i++) {
      const substr = text.substring(indices[i][0] + offset, indices[i][1] + 1 + offset);
      const tag = `<${highlightTag}>${substr}</${highlightTag}>`;
      text = text.substring(0, indices[i][0] + offset) + tag + text.substring(indices[i][1] + 1 + offset, text.length);
      offset += highlightTag.length * 2 + 5;
    }
    return text;
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\theme.ts
  function getThemeMode() {
    return document.documentElement.dataset.themeMode || "auto";
  }
  function isDarkMode() {
    const themeMode = getThemeMode();
    return themeMode === "auto" ? window.matchMedia("(prefers-color-scheme: dark)").matches : themeMode === "dark";
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\tooltip.ts
  function flashTooltip(el, message, duration = 3e3) {
    const CellTooltip3 = window.CellTooltip;
    const originalTitle = el.dataset.ctTitle;
    el.dataset.ctTitle = message;
    const instance = CellTooltip3.getOrCreateInstance(el);
    instance.refresh();
    instance.show();
    setTimeout(() => {
      el.dataset.ctTitle = originalTitle ?? "";
      instance.hide();
    }, duration);
  }
  function flashCopiedTooltip(btn, duration = 2e3) {
    btn.toggleAttribute("data-copied", true);
    flashTooltip(btn, btn.dataset.copiedText ?? "", duration);
    setTimeout(() => btn.toggleAttribute("data-copied", false), duration);
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\utils\validate.ts
  function isValidDate(date) {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\code.ts
  var CellTooltip = window.CellTooltip;
  var copyText = createCopyText();
  var CodeModule = class {
    #fullscreenAbort;
    constructor() {
    }
    /**
     * Attach copy-to-clipboard behaviour to a code block.
     * @param codeBlock - The `.code-block` container element.
     * @param codePreEl - The `<pre>` element containing the code text.
     */
    initCopyCode(codeBlock, codePreEl) {
      const copyBtn = codeBlock.dataset.mode === "classic" ? codeBlock.querySelector(".code-header .copy-btn") : codeBlock.querySelector(".copy-icon-btn");
      if (codeBlock.dataset.copyable !== "true" || !copyBtn)
        return;
      copyBtn.addEventListener("click", () => {
        const iswWrap = codeBlock.classList.contains("line-wrapping");
        const highlightLines = codeBlock.querySelectorAll(".hl");
        iswWrap && codeBlock.classList.toggle("line-wrapping");
        highlightLines.forEach(($hl) => {
          $hl.classList.toggle("hl");
        });
        copyText(codePreEl.textContent.trim()).then(() => {
          animateCSS(codePreEl, "animate__flash");
          iswWrap && codeBlock.classList.toggle("line-wrapping");
          highlightLines.forEach(($hl) => {
            $hl.classList.toggle("hl");
          });
          flashCopiedTooltip(copyBtn);
        }, () => {
          console.error("Clipboard write failed!", "Your browser does not support clipboard API!");
        });
      }, false);
    }
    /**
     * Attach toggle behaviour to the code expand/collapse button.
     * @param codeBlock - The `.code-block` container element.
     */
    initCodeExpandBtn(codeBlock) {
      codeBlock.querySelector(".code-expand-btn")?.addEventListener("click", () => {
        codeBlock.classList.toggle("is-expanded");
      }, false);
    }
    /**
     * Attach download behaviour to a code block's download button.
     * @param codeBlock - The `.code-block` container element.
     * @param codePreEl - The `<pre>` element containing the code text.
     */
    initDownloadCode(codeBlock, codePreEl) {
      const downloadBtn = codeBlock.querySelector(".code-header .download-btn");
      if (!downloadBtn)
        return;
      downloadBtn.addEventListener("click", () => {
        const $codeHeader = codeBlock.querySelector(".code-header");
        const name = codeBlock.dataset.name?.trim();
        const language = Array.from($codeHeader?.classList || []).find((className) => className.startsWith("language-"))?.replace("language-", "");
        const ext = language && language !== "fallback" ? language : "txt";
        const fallbackName = name ? name.includes(".") ? name : `${name}.${ext}` : `code.${ext}`;
        const fileName = codeBlock.getAttribute("filename")?.trim();
        downloadAsFile(codePreEl.textContent, fileName || fallbackName);
        downloadBtn.toggleAttribute("data-downloaded", true);
        downloadBtn.classList.toggle("fa-spin", true);
        setTimeout(() => {
          downloadBtn.toggleAttribute("data-downloaded", false);
          downloadBtn.classList.toggle("fa-spin", false);
        }, 300);
      }, false);
    }
    /**
     * Get the fullscreen target element (parent `.code-tabs` or the block itself).
     * @param codeBlock - The `.code-block` element.
     * @returns The element to apply fullscreen to.
     */
    #getCodeFullscreenTarget(codeBlock) {
      return codeBlock.closest(".code-tabs") || codeBlock;
    }
    /**
     * Toggle fullscreen state and update button tooltips.
     * @param codeBlock - The `.code-block` element.
     * @param show - `true` to enter fullscreen, `false` to exit.
     */
    #setCodeFullscreenState(codeBlock, show) {
      const target = this.#getCodeFullscreenTarget(codeBlock);
      const expandBtn = codeBlock.querySelector(".code-expand-btn");
      if (show && expandBtn) {
        codeBlock.dataset.fullscreenExpanded = codeBlock.classList.contains("is-expanded") ? "true" : "false";
        codeBlock.classList.add("is-expanded");
      }
      if (!show && target.classList.contains("is-fullscreen")) {
        target.classList.add("instant-height");
        window.requestAnimationFrame(() => target.classList.remove("instant-height"));
        if (expandBtn && codeBlock.dataset.fullscreenExpanded === "false") {
          codeBlock.classList.remove("is-expanded");
        }
        delete codeBlock.dataset.fullscreenExpanded;
      }
      target.classList.toggle("is-fullscreen", show);
      const btn = target.querySelector(".tabs-actions .fullscreen-btn") || codeBlock.querySelector(".code-header .fullscreen-btn");
      if (!btn)
        return;
      const exitTitle = btn.dataset.exitTitle || btn.getAttribute("data-exit-title") || btn.title;
      const originalTitle = btn.dataset.ctOriginalTitle || btn.dataset.ctTitle || btn.title;
      btn.dataset.ctOriginalTitle = originalTitle;
      btn.dataset.ctTitle = show ? exitTitle : originalTitle;
      const instance = CellTooltip.getOrCreateInstance(btn);
      instance.hide();
    }
    /** Exit fullscreen on the currently active code block. */
    closeCodeFullscreen() {
      const $activeTabs = document.querySelector(".code-tabs.is-fullscreen");
      if ($activeTabs) {
        const $activeBlock2 = $activeTabs.querySelector(".code-block.active") || $activeTabs.querySelector(".code-block");
        if ($activeBlock2)
          this.#setCodeFullscreenState($activeBlock2, false);
        return;
      }
      const $activeBlock = document.querySelector(".code-block.highlight.is-fullscreen");
      if ($activeBlock)
        this.#setCodeFullscreenState($activeBlock, false);
    }
    /**
     * Attach fullscreen toggle and Escape-key handler to a code block.
     * @param codeBlock - The `.code-block` container element.
     */
    initFullscreenCode(codeBlock) {
      const fullscreenBtn = codeBlock.querySelector(".code-header .fullscreen-btn");
      if (!fullscreenBtn)
        return;
      fullscreenBtn.addEventListener("click", () => {
        const target = this.#getCodeFullscreenTarget(codeBlock);
        const show = !target.classList.contains("is-fullscreen");
        if (show) {
          this.closeCodeFullscreen();
          codeBlock.classList.remove("is-collapsed");
        }
        this.#setCodeFullscreenState(codeBlock, show);
      }, false);
      if (!this.#fullscreenAbort) {
        this.#fullscreenAbort = new AbortController();
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape")
            this.closeCodeFullscreen();
        }, { signal: this.#fullscreenAbort.signal });
      }
    }
    /** Initialize all un-initialized code blocks on the page. */
    initCodeWrapper() {
      const $codeBlocks = document.querySelectorAll(".code-block.highlight:not([data-init])");
      $codeBlocks.forEach(($codeBlock) => {
        const $preElements = $codeBlock.querySelectorAll("pre.chroma");
        if (!$preElements.length)
          return;
        const $codePreEl = $preElements[$preElements.length - 1];
        $codeBlock.dataset.init = "true";
        this.initCopyCode($codeBlock, $codePreEl);
        this.initCodeExpandBtn($codeBlock);
        if ($codeBlock.dataset.mode === "classic") {
          const $codeHeader = $codeBlock.querySelector(".code-header");
          if (!$codeHeader)
            return;
          this.initDownloadCode($codeBlock, $codePreEl);
          this.initFullscreenCode($codeBlock);
          $codeHeader.querySelector(".code-title").addEventListener("click", () => {
            if ($codeBlock.classList.contains("is-fullscreen"))
              return;
            $codeBlock.classList.toggle("is-collapsed");
          }, false);
          $codeHeader.querySelector(".ellipses-btn").addEventListener("click", () => {
            $codeBlock.classList.remove("is-collapsed");
          }, false);
          $codeHeader.querySelector(".line-nos-btn")?.addEventListener("click", () => {
            $codeBlock.classList.toggle("line-nos-hidden");
          }, false);
          $codeHeader.querySelector(".line-wrap-btn")?.addEventListener("click", () => {
            if ($codeBlock.querySelector('[contenteditable="true"]'))
              return;
            $codeBlock.classList.toggle("line-wrapping");
          }, false);
          if ($codeBlock.dataset.editable === "true") {
            $codeHeader.querySelector(".edit-btn")?.addEventListener("click", () => {
              const isEditable = $codePreEl.getAttribute("contenteditable") === "true";
              if (isEditable) {
                $codePreEl.setAttribute("contenteditable", "false");
                $codePreEl.blur();
              } else {
                $codeBlock.querySelectorAll(".hl").forEach(($hl) => {
                  $hl.classList.remove("hl");
                });
                $codeBlock.classList.add("is-expanded");
                $codeBlock.classList.remove("line-wrapping");
                $codePreEl.setAttribute("contenteditable", "true");
                $codePreEl.focus();
              }
            }, false);
          }
        }
      });
    }
    /** Group consecutive code blocks into tabbed containers with language sync. */
    initCodeTabs() {
      const $codeBlocks = document.querySelectorAll(".code-block[group]:not([data-tab-init])");
      const processed = /* @__PURE__ */ new Set();
      const normalizeTabTitle = (title = "") => title.toLowerCase();
      $codeBlocks.forEach(($block) => {
        if (processed.has($block))
          return;
        const groupName = $block.getAttribute("group");
        const $tabs = [];
        let $curr = $block;
        while ($curr && $curr.classList?.contains("code-block") && $curr.getAttribute("group") === groupName) {
          $tabs.push($curr);
          processed.add($curr);
          $curr = $curr.nextElementSibling;
        }
        if ($tabs.length < 2)
          return;
        const $container = document.createElement("div");
        $container.className = "code-tabs";
        const $header = document.createElement("div");
        $header.className = "tabs-header";
        const $items = document.createElement("div");
        $items.className = "tabs-items";
        const $actions = document.createElement("div");
        $actions.className = "tabs-actions";
        $header.appendChild($items);
        $header.appendChild($actions);
        const $content = document.createElement("div");
        $content.className = "tabs-content";
        const $firstBlock = $tabs[0];
        $firstBlock.parentNode.insertBefore($container, $firstBlock);
        const activeTabIndex = $tabs.findIndex((tab) => tab.classList.contains("active"));
        const langPref = window.localStorage.getItem("config_lang_perf");
        const hasCodeToggle = $tabs.some((tab) => tab.dataset.codeToggle === "true");
        const langPrefIndex = langPref && hasCodeToggle ? $tabs.findIndex((tab) => tab.dataset.tabTitle.toLowerCase() === langPref) : -1;
        const resolvedIndex = langPrefIndex !== -1 ? langPrefIndex : activeTabIndex;
        const beforeTabs = $tabs[0]?.getAttribute("before_tabs");
        if (beforeTabs) {
          const $before = document.createElement("span");
          $before.className = "before-tabs";
          $before.textContent = beforeTabs;
          $items.appendChild($before);
        }
        const tabButtons = [];
        const toggleLangToIndex = /* @__PURE__ */ new Map();
        const switchToTab = (index) => {
          const $nextTab = $tabs[index];
          const $nextBtn = tabButtons[index];
          if (!$nextTab || !$nextBtn)
            return;
          const $activeTab = $tabs.find((t) => t.classList.contains("active"));
          if ($activeTab) {
            const $activeHeader = $activeTab.querySelector(".code-header");
            if ($activeHeader) {
              Array.from($actions.children).forEach((btn) => $activeHeader.appendChild(btn));
            }
          }
          tabButtons.forEach((b) => b.classList.remove("active"));
          $nextBtn.classList.add("active");
          $tabs.forEach((b) => b.classList.remove("active"));
          $nextTab.classList.add("active");
          const shadowMode = $nextTab?.dataset.shadow;
          if (shadowMode) {
            $container.dataset.shadow = shadowMode;
          } else {
            delete $container.dataset.shadow;
          }
          const $codeHeader = $nextTab.querySelector(".code-header");
          if ($codeHeader) {
            $codeHeader.querySelectorAll(".action-btn").forEach((btn) => $actions.appendChild(btn));
          }
        };
        eventBus.on("fixit:code-tab-sync", ({ detail }) => {
          if (!detail.lang || detail.source === $container)
            return;
          const index = toggleLangToIndex.get(detail.lang);
          index !== void 0 && switchToTab(index);
        });
        $tabs.forEach(($tab, index) => {
          const title = $tab.dataset.tabTitle || "Code";
          const defaultActiveTab = resolvedIndex === -1 && index === 0;
          const $btn = document.createElement("span");
          $btn.className = "tab-item";
          if (defaultActiveTab)
            $btn.classList.add("active");
          $btn.textContent = title;
          $btn.dataset.index = String(index);
          $btn.title = title;
          tabButtons.push($btn);
          const normalizedTitle = normalizeTabTitle(title);
          if (!toggleLangToIndex.has(normalizedTitle)) {
            toggleLangToIndex.set(normalizedTitle, index);
          }
          $btn.addEventListener("click", () => {
            if ($tab.dataset.codeToggle === "true") {
              window.localStorage.setItem("config_lang_perf", normalizedTitle);
              eventBus.emit("fixit:code-tab-sync", { lang: normalizedTitle, source: $container });
            }
            switchToTab(index);
          });
          $items.appendChild($btn);
          $tab.classList.toggle("active", resolvedIndex === index || defaultActiveTab);
          $tab.classList.remove("is-collapsed");
          $tab.classList.remove("d-none");
          $tab.dataset.tabInit = "true";
          $content.appendChild($tab);
        });
        $container.appendChild($header);
        $container.appendChild($content);
        if (resolvedIndex !== -1) {
          switchToTab(resolvedIndex);
        } else {
          switchToTab(0);
        }
      });
    }
    /** Attach copy behaviour to diagram container copy buttons. */
    initDiagramCopyBtn() {
      const stagingDOM = getStagingDOM();
      document.querySelectorAll(".diagram-container > .copy-icon-btn").forEach(($btn) => {
        $btn.addEventListener("click", () => {
          stagingDOM.stage($btn.parentElement.querySelector("template").content.cloneNode(true));
          let code = stagingDOM.contentAsText();
          try {
            code = JSON.stringify(JSON.parse(code), null, 2);
          } catch {
          }
          copyText(code).then(() => {
            flashCopiedTooltip($btn);
          }, () => {
            console.error("Clipboard write failed!", "Your browser does not support clipboard API!");
          });
        }, false);
      });
      stagingDOM.destroy();
    }
  };

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\content.ts
  var CellTooltip2 = window.CellTooltip;
  var copyText2 = createCopyText();
  var ContentModule = class {
    constructor(core, code) {
      this.core = core;
      this.code = code;
    }
    core;
    code;
    /** Fetch and inline SVG icons referenced by `data-svg-src` attributes. */
    initSVGIcon() {
      document.querySelectorAll("[data-svg-src]").forEach(($icon) => {
        fetch($icon.dataset.svgSrc).then((response) => response.text()).then((svg) => {
          const $temp = document.createElement("div");
          $temp.insertAdjacentHTML("afterbegin", svg);
          const $svg = $temp.firstChild;
          $svg.dataset.svgSrc = $icon.dataset.svgSrc;
          $svg.classList.add("icon");
          const $titleElements = $svg.getElementsByTagName("title");
          $titleElements.length && $svg.removeChild($titleElements[0]);
          $icon.parentElement.replaceChild($svg, $icon);
        }).catch((err) => {
          console.error(err);
        });
      });
    }
    /**
     * Initialize the link-guard dialog and bind click handlers on guarded links.
     * @param target - The root element to search for guarded links.
     */
    initLinkGuardDialog(target = document) {
      const dialog = document.getElementById("link-guard-dialog");
      if (!dialog)
        return;
      const $target = dialog.querySelector(".target");
      const $copy = dialog.querySelector(".copy-icon-btn");
      const $confirm = dialog.querySelector(".confirm-btn");
      const $cancel = dialog.querySelector(".cancel-btn");
      const _closeDialog = () => {
        if (dialog.open)
          dialog.close();
        dialog._target = null;
        if ($target) {
          $target.textContent = "-";
        }
      };
      if (!dialog.dataset.init) {
        dialog.dataset.init = "true";
        $confirm.addEventListener("click", () => {
          if (dialog._target) {
            window.open(dialog._target, "_blank", "noopener,noreferrer");
          }
          _closeDialog();
        });
        $cancel.addEventListener("click", _closeDialog);
        $copy.addEventListener("click", () => {
          const textToCopy = dialog._target || "";
          if (!textToCopy)
            return;
          copyText2(textToCopy).then(() => {
            flashCopiedTooltip($copy);
          });
        });
      }
      target.querySelectorAll('a[target="_blank"][data-guard="modal"]:not([data-init])').forEach(($link) => {
        $link.dataset.init = "true";
        $link.addEventListener("click", (e) => {
          e.preventDefault();
          let targetUrl = $link.href;
          try {
            const guardUrl = new URL($link.href);
            targetUrl = guardUrl.searchParams.get("target") || targetUrl;
          } catch {
          }
          ;
          dialog._target = targetUrl;
          if ($target) {
            $target.textContent = targetUrl;
          }
          dialog.showModal();
          document.activeElement?.blur();
        }, false);
      });
    }
    /**
     * Attach toggle behaviour to `<details>` elements.
     * @param target - The root element to search within.
     */
    initDetails(target = document) {
      target.querySelectorAll(".details:not(.disabled)").forEach(($details) => {
        const $summary = $details.querySelector(".details-summary");
        $summary.addEventListener("click", () => {
          $details.classList.toggle("open");
        }, false);
      });
    }
    /** Convert footnote refs into tooltip-enabled elements. */
    #initFootnotes() {
      const $footnoteRefs = document.querySelectorAll('#content sup[id^="fnref:"]');
      const $footnotes = document.querySelector('.footnotes[role="doc-endnotes"]');
      if (!$footnoteRefs.length || !$footnotes)
        return;
      const footnoteMap = /* @__PURE__ */ new Map();
      $footnoteRefs.forEach(($ref) => {
        if (this.core.config.tooltip) {
          const $link = $ref.querySelector("a.footnote-ref");
          if ($link) {
            $link.addEventListener("click", (e) => {
              e.preventDefault();
            }, false);
          }
        }
        const id = $ref.id.replace("fnref:", "");
        const $footnoteContent = $footnotes.querySelector(`[id="fn:${id}"]`);
        if ($footnoteContent) {
          const $clonedContent = $footnoteContent.cloneNode(true);
          const $backref = $clonedContent.querySelector(".footnote-backref");
          if ($backref)
            $backref.remove();
          footnoteMap.set($ref, $clonedContent);
        }
      });
      footnoteMap.forEach(($content, $ref) => {
        if ($ref.hasAttribute("title"))
          return;
        $ref.setAttribute("title", $content.textContent.trim());
        if (this.core.config.tooltip) {
          CellTooltip2.getOrCreateInstance($ref);
        }
      });
    }
    /** Initialize CellTooltip on action buttons, copy buttons, and footnotes. */
    initTooltip() {
      if (!this.core.config.tooltip)
        return;
      CellTooltip2.initAll("li[data-task] > span[title]", { placement: "right" });
      CellTooltip2.initAll(".action-btn[title]", { placement: "bottom" });
      CellTooltip2.initAll(".copy-icon-btn[title]", { placement: "top" });
      this.#initFootnotes();
    }
    /**
     * Re-initialize content components within a target element.
     * Useful after AJAX/pjax loads or dynamic content injection.
     * @param target - The root element to initialize components within.
     */
    initContent(target = document) {
      this.initDetails(target);
      this.code.initCodeWrapper();
      this.code.initCodeTabs();
      this.code.initDiagramCopyBtn();
      this.initTooltip();
      this.initLinkGuardDialog(target);
    }
    setup() {
      this.initContent();
      eventBus.on("fixit:decrypted", () => {
        this.initContent();
      });
      eventBus.on("fixit:partial-decrypted", ({ detail }) => {
        this.initContent(detail.target);
      });
    }
  };

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\core.ts
  var CoreModule = class {
    config;
    themeMode;
    isDark;
    newScrollTop;
    oldScrollTop;
    disableScrollEvent;
    activeMaskOverlay = null;
    maskOverlays = /* @__PURE__ */ new Map();
    constructor() {
      this.config = window.config;
      this.themeMode = getThemeMode();
      this.isDark = isDarkMode();
      this.newScrollTop = getScrollTop();
      this.oldScrollTop = this.newScrollTop;
      this.disableScrollEvent = false;
      window.objectFitImages?.();
    }
    /** Register a named mask overlay with open/close/isActive handlers. */
    registerMaskOverlay(name, handlers) {
      this.maskOverlays.set(name, handlers);
    }
    /** Toggle the mask element's blur class based on active overlay state. */
    syncMaskState() {
      document.getElementById("mask")?.classList.toggle("blur", Boolean(this.activeMaskOverlay));
    }
    /** Open a named mask overlay, closing any previously active one. */
    openMaskOverlay(name) {
      this.disableScrollEvent = true;
      const overlay = this.maskOverlays.get(name);
      if (!overlay)
        return;
      if (this.activeMaskOverlay && this.activeMaskOverlay !== name) {
        this.closeMaskOverlay(this.activeMaskOverlay, true);
      }
      overlay.onOpen?.();
      this.activeMaskOverlay = name;
      this.syncMaskState();
    }
    /** Close a named mask overlay and optionally skip mask state sync. */
    closeMaskOverlay(name, skipSync = false) {
      this.disableScrollEvent = false;
      const overlay = this.maskOverlays.get(name);
      if (!overlay)
        return;
      overlay.onClose?.();
      if (this.activeMaskOverlay === name) {
        this.activeMaskOverlay = null;
      }
      !skipSync && this.syncMaskState();
    }
    /** Toggle a named mask overlay open/closed. */
    toggleMaskOverlay(name) {
      const overlay = this.maskOverlays.get(name);
      if (!overlay)
        return;
      const isActive = overlay.isActive?.() ?? this.activeMaskOverlay === name;
      if (this.activeMaskOverlay === name && isActive) {
        this.closeMaskOverlay(name);
        return;
      }
      this.openMaskOverlay(name);
    }
    /** Close whichever mask overlay is currently active. */
    closeActiveMaskOverlay() {
      if (!this.activeMaskOverlay) {
        this.syncMaskState();
        return;
      }
      this.closeMaskOverlay(this.activeMaskOverlay);
    }
  };

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\encryption.ts
  var EncryptionModule = class {
    constructor(core) {
      this.core = core;
    }
    core;
    /**
     * Toggle between encrypted-hidden and decrypted-shown classes.
     * @param container - The root element containing encrypted elements.
     * @param show - `true` to show decrypted content, `false` to hide.
     */
    #toggleEncryptedClass(container, show) {
      const fromClass = show ? "encrypted-hidden" : "decrypted-shown";
      const toClass = show ? "decrypted-shown" : "encrypted-hidden";
      container.querySelectorAll(`.${fromClass}`).forEach(($element) => {
        $element.classList.replace(fromClass, toClass);
      });
    }
    /** Initialize the FixItDecryptor and wire up decryption/re-encryption events. */
    initFixItDecryptor() {
      if (!this.core.config.encryption)
        return;
      const decryptor = new window.FixItDecryptor();
      eventBus.on("fixit:decrypted", () => {
        this.#toggleEncryptedClass(document, true);
      });
      eventBus.on("fixit:partial-decrypted", ({ detail }) => {
        this.#toggleEncryptedClass(detail.target, true);
      });
      eventBus.on("fixit:re-encrypt", () => {
        this.#toggleEncryptedClass(document, false);
      });
      decryptor.init(this.core.config.encryption);
    }
  };

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\events.ts
  var EventsModule = class {
    constructor(core, toc, search, code) {
      this.core = core;
      this.toc = toc;
      this.search = search;
      this.code = code;
    }
    core;
    toc;
    search;
    code;
    #resizeTimeout = null;
    /** Bind scroll listener: auto-hide headers, reading progress, back-to-top, and TOC sync. */
    onScroll() {
      const ACCURACY = 20;
      const $autoHeaders = [];
      const $backToTop = document.querySelector(".back-to-top");
      const $readingProgressBar = document.querySelector(".reading-progress-bar");
      if (document.body.dataset.headerDesktop === "auto") {
        $autoHeaders.push(document.getElementById("header-desktop"));
      }
      if (document.body.dataset.headerMobile === "auto") {
        $autoHeaders.push(document.getElementById("header-mobile"));
      }
      $backToTop?.addEventListener("click", () => {
        scrollIntoView("body");
      });
      window.addEventListener("scroll", (event) => {
        if (this.core.disableScrollEvent) {
          event.preventDefault();
          return;
        }
        this.core.newScrollTop = getScrollTop();
        const scroll = this.core.newScrollTop - this.core.oldScrollTop;
        if (Math.abs(scroll) > ACCURACY) {
          this.core.closeActiveMaskOverlay();
          const isScrollingDown = scroll > 0;
          $autoHeaders.forEach(($header) => {
            if (isScrollingDown) {
              $header.classList.remove("header__fadeInDown");
              animateCSS($header, ["header__fadeOutUp"], true);
            } else {
              $header.classList.remove("header__fadeOutUp");
              animateCSS($header, ["header__fadeInDown"], true);
            }
          });
        } else if (this.core.newScrollTop <= 0) {
          $autoHeaders.forEach(($header) => {
            $header.classList.remove("header__fadeOutUp");
            animateCSS($header, ["header__fadeInDown"], true);
          });
        }
        const contentHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = Math.max(Math.min(100 * Math.max(this.core.newScrollTop, 0) / contentHeight, 100), 0);
        if ($readingProgressBar) {
          $readingProgressBar.style.setProperty("--fi-progress", `${scrollPercent.toFixed(2)}%`);
        }
        if ($backToTop) {
          if (scrollPercent > 1) {
            $backToTop.classList.remove("d-none", "animate__fadeOut");
            animateCSS($backToTop, ["animate__fadeIn"], true);
          } else {
            $backToTop.classList.remove("animate__fadeIn");
            animateCSS($backToTop, ["animate__fadeOut"], true, () => {
              $backToTop.classList.contains("animate__fadeOut") && $backToTop.classList.add("d-none");
            });
          }
          $backToTop.style.setProperty("--fi-b2t-progress", scrollPercent.toFixed(2));
          if (navigator.userAgent.toLowerCase().includes("firefox")) {
            const dashoffset = 2 * Math.PI * 50 * (1 - scrollPercent / 100);
            $backToTop.querySelector("circle.progress").style.strokeDashoffset = String(dashoffset.toFixed(2));
          }
        }
        eventBus.emit("fixit:scroll");
        this.toc.syncTocHeight();
        this.toc.syncTocActiveState();
        this.core.oldScrollTop = this.core.newScrollTop;
      }, false);
    }
    /** Bind resize listener with debounce: re-init TOC, search, and sync state. */
    onResize() {
      let resizeBefore = isMobile();
      window.addEventListener("resize", () => {
        if (!this.#resizeTimeout) {
          this.#resizeTimeout = window.setTimeout(() => {
            this.#resizeTimeout = null;
            eventBus.emit("fixit:resize");
            this.toc.initToc();
            this.search.initSearch();
            this.toc.syncTocHeight();
            this.toc.syncTocActiveState();
            const _isMobile = isMobile();
            if (_isMobile !== resizeBefore) {
              this.core.closeActiveMaskOverlay();
              resizeBefore = _isMobile;
            }
          }, 100);
        }
      }, false);
    }
    /** Bind mask click to close the active overlay. */
    onClickMask() {
      document.getElementById("mask").addEventListener("click", (e) => {
        if (!e.target.classList.contains("blur"))
          return;
        this.core.closeActiveMaskOverlay();
      }, false);
    }
    /** Bind beforeprint/afterprint to expand admonitions, code blocks, details, and file trees. */
    initPrint() {
      window.addEventListener("beforeprint", () => {
        const $content = document.getElementById("content");
        const printConfig = this.core.config.print || {};
        if (printConfig.expandAdmonition) {
          $content.querySelectorAll(".admonition").forEach(($el) => $el.classList.add("open"));
        }
        if (printConfig.expandCode) {
          $content.querySelectorAll(".code-tabs").forEach(($codeTabs) => {
            if ($codeTabs.dataset.diagram)
              return;
            const $actions = $codeTabs.querySelector(".tabs-actions");
            const $activeBlock = $codeTabs.querySelector(".code-block.active");
            if ($actions && $activeBlock) {
              const $codeHeader = $activeBlock.querySelector(".code-header");
              if ($codeHeader) {
                Array.from($actions.children).forEach((btn) => $codeHeader.appendChild(btn));
              }
            }
            const $codeBlocks = $codeTabs.querySelectorAll(".code-block");
            $codeBlocks.forEach(($codeBlock) => {
              delete $codeBlock.dataset.tabInit;
              $codeTabs.parentElement.insertBefore($codeBlock, $codeTabs);
            });
            $codeTabs.parentElement.removeChild($codeTabs);
          });
          $content.querySelectorAll(".code-block").forEach(($el) => {
            $el.classList.add("line-wrapping");
            $el.classList.remove("is-collapsed");
            if ($el.querySelector(".code-expand-btn")) {
              $el.classList.add("is-expanded");
            }
          });
        }
        if (printConfig.expandDetails) {
          $content.querySelectorAll("details").forEach(($el) => $el.setAttribute("open", ""));
        }
      }, false);
      window.addEventListener("afterprint", () => {
        this.code.initCodeTabs();
      }, false);
    }
  };

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\menu.ts
  var MenuModule = class {
    constructor(core) {
      this.core = core;
    }
    core;
    /** Initialize both desktop and mobile menus. */
    initMenu() {
      this.initMenuDesktop();
      this.initMenuMobile();
    }
    /** Set min-width on desktop sub-menus to match parent item width. */
    initMenuDesktop() {
      document.querySelectorAll(".has-children").forEach(($item) => {
        $item.querySelector(".sub-menu").style.minWidth = `${$item.offsetWidth - 8}px`;
      });
    }
    /** Initialize mobile drawer menu with mask overlay and nested toggles. */
    initMenuMobile() {
      const $menuToggleMobile = document.getElementById("menu-toggle-mobile");
      const $menuMobile = document.getElementById("menu-mobile");
      if (!$menuToggleMobile || !$menuMobile)
        return;
      this.core.registerMaskOverlay("menu-mobile", {
        isActive: () => $menuMobile.classList.contains("active"),
        onOpen: () => {
          $menuToggleMobile.classList.add("active");
          $menuMobile.classList.add("active");
          $menuToggleMobile.setAttribute("aria-expanded", "true");
        },
        onClose: () => {
          $menuToggleMobile.classList.remove("active");
          $menuMobile.classList.remove("active");
          $menuToggleMobile.setAttribute("aria-expanded", "false");
        }
      });
      $menuToggleMobile.addEventListener("click", () => {
        this.core.toggleMaskOverlay("menu-mobile");
      }, false);
      document.querySelectorAll(".menu-item>.nested-item").forEach(($nestedItem) => {
        $nestedItem.addEventListener("click", function() {
          this.parentNode.querySelector(".sub-menu").classList.toggle("open");
          this.querySelector(".dropdown-icon").classList.toggle("open");
        });
      });
    }
  };

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\misc.ts
  var MiscModule = class {
    constructor(core) {
      this.core = core;
    }
    core;
    siteTime;
    /** Calculate and display the elapsed time since site launch. */
    getSiteTime() {
      const now = /* @__PURE__ */ new Date();
      const run = new Date(this.core.config.siteTime);
      const $runTimes = document.querySelector(".run-times");
      if (!isValidDate(run) || !$runTimes) {
        clearInterval(this.siteTime);
        $runTimes && $runTimes.parentNode.removeChild($runTimes);
        return;
      }
      const totalSeconds = Math.floor((now.getTime() - run.getTime()) / 1e3);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor(totalSeconds % 86400 / 3600);
      const minutes = Math.floor(totalSeconds % 3600 / 60);
      const seconds = totalSeconds % 60;
      $runTimes.innerHTML = `${days}, ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      document.querySelector(".site-time .d-none")?.classList.remove("d-none");
    }
    /** Start the site-time counter with visibility-change pausing. */
    initSiteTime() {
      if (this.core.config.siteTime) {
        this.siteTime = setInterval(() => this.getSiteTime(), 500);
        document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
            return clearInterval(this.siteTime);
          }
          this.siteTime = setInterval(() => this.getSiteTime(), 500);
        }, false);
      }
    }
    /** Register the service worker for PWA support. */
    initServiceWorker() {
      if (this.core.config.PWA?.enable && "serviceWorker" in navigator) {
        navigator.serviceWorker.register(this.core.config.PWA.serviceWorkerURL).then((_registration) => {
        }).catch((error) => {
          console.error("error: ", error);
        });
        navigator.serviceWorker.ready.then((_registration) => {
        });
      }
    }
    /** Save and restore scroll position as an automatic bookmark. */
    initAutoMark() {
      if (!this.core.config.autoBookmark)
        return;
      window.addEventListener("beforeunload", () => {
        window.sessionStorage?.setItem(`fixit-bookmark/#${location.pathname}`, String(getScrollTop()));
      });
      const scrollTop = Number(window.sessionStorage?.getItem(`fixit-bookmark/#${location.pathname}`));
      if (scrollTop && location.hash === "") {
        window.scrollTo({ top: scrollTop, behavior: "smooth" });
      }
    }
    /** Initialize reward/donation button exclusive-toggle behaviour. */
    initReward() {
      const $rewards = document.querySelectorAll('.post-reward [data-mode="fixed"]');
      if (!$rewards.length)
        return;
      if (isMobile()) {
        $rewards.forEach(($reward) => $reward.removeAttribute("data-mode"));
        return;
      }
      const _closeRewardExclude = (id) => {
        $rewards.forEach(($reward) => {
          const $rewardInput = $reward.parentElement.querySelector(".reward-input");
          if ($rewardInput && $rewardInput.id !== id) {
            $rewardInput.checked = false;
          }
        });
      };
      $rewards.forEach(($reward) => {
        $reward.previousElementSibling.addEventListener("click", function() {
          _closeRewardExclude(this.getAttribute("for"));
        }, false);
      });
      eventBus.on("fixit:scroll", () => _closeRewardExclude());
    }
    /** Initialize the comment section UI. */
    initComment() {
      if (!this.core.config.comment?.enable)
        return;
      if (document.querySelector("#comments")) {
        const $viewCommentsBtn = document.querySelector(".view-comments");
        $viewCommentsBtn.classList.remove("d-none");
        $viewCommentsBtn.addEventListener("click", () => {
          scrollIntoView("#comments");
        }, false);
      }
      if (this.core.config.comment.expired)
        document.querySelector("#comments").remove();
    }
    /** Initialize PostChat theme sync if configured. */
    initPostChatUser() {
      if (!window.postChatUser || !window.postChatConfig || window.postChatConfig.userMode === "magic")
        return;
      window.postChat_theme = this.core.isDark ? "dark" : "light";
      eventBus.on("fixit:switch-theme", ({ detail }) => {
        if (!detail.isChanged)
          return;
        const targetFrame = document.getElementById("postChat_iframeContainer");
        if (targetFrame) {
          window.postChatUser.setPostChatTheme(detail.isDark ? "dark" : "light");
        } else {
          window.postChat_theme = detail.isDark ? "dark" : "light";
        }
      });
    }
  };

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\pagefind.ts
  var ABSOLUTE_URL_RE = /^(?:[a-z]+:)?\/\//i;
  function normalizeBundlePath(path, baseURL) {
    let bundlePath = typeof path === "string" && path.length > 0 ? path : "pagefind/";
    if (!bundlePath.endsWith("/")) {
      bundlePath = `${bundlePath}/`;
    }
    if (ABSOLUTE_URL_RE.test(bundlePath)) {
      return bundlePath;
    }
    return new URL(bundlePath, baseURL || document.baseURI).toString();
  }
  var toObject = (value) => value && typeof value === "object" ? value : {};
  function normalizeSortOrder(value) {
    return String(value).toLowerCase() === "asc" ? "asc" : "desc";
  }
  function replaceExcerptHighlightTag(excerpt, highlightTag) {
    if (!excerpt || !highlightTag || highlightTag === "mark") {
      return excerpt || "";
    }
    return excerpt.replaceAll("<mark>", `<${highlightTag}>`).replaceAll("</mark>", `</${highlightTag}>`);
  }
  function createPagefindSearch(searchConfig) {
    const pagefindConfig = toObject(searchConfig.pagefind);
    const bundlePath = normalizeBundlePath(pagefindConfig.bundlePath, pagefindConfig.baseURL);
    const rawDebounceTimeout = Number(pagefindConfig.debounceTimeoutMs ?? 300);
    const debounceTimeout = Number.isFinite(rawDebounceTimeout) ? Math.max(0, rawDebounceTimeout) : 300;
    const builtInFiltersEnabled = pagefindConfig.useBuiltInFilters !== false;
    const sortBy = typeof pagefindConfig.sortBy === "string" ? pagefindConfig.sortBy.trim() : "";
    const sortOrder = normalizeSortOrder(pagefindConfig.sortOrder);
    const highlightTag = searchConfig.highlightTag ?? "em";
    const excerptLength = Number(searchConfig.snippetLength ?? 30);
    const state = {
      loading: null,
      initialized: false,
      availableFilters: null
    };
    const ensurePagefind = async () => {
      if (!state.loading) {
        state.loading = import(
          /* @vite-ignore */
          `${bundlePath}pagefind.js`
        ).then(async (mod) => {
          if (!state.initialized) {
            const options = {};
            if (Number.isFinite(excerptLength) && excerptLength >= 0) {
              options.excerptLength = excerptLength;
            }
            if (Object.keys(options).length && typeof mod.options === "function") {
              await mod.options(options);
            }
            await mod.init();
            state.initialized = true;
          }
          return mod;
        }).catch((error) => {
          state.loading = null;
          throw error;
        });
      }
      return state.loading;
    };
    const getAvailableFilters = async () => {
      if (state.availableFilters)
        return state.availableFilters;
      const pagefind = await ensurePagefind();
      if (typeof pagefind.filters !== "function") {
        state.availableFilters = {};
        return state.availableFilters;
      }
      try {
        state.availableFilters = toObject(await pagefind.filters());
      } catch (error) {
        console.warn("[FixIt] failed to read Pagefind filters:", error);
        state.availableFilters = {};
      }
      return state.availableFilters;
    };
    return {
      /** Preload the Pagefind library so the first search is faster. */
      preload() {
        return ensurePagefind();
      },
      /**
       * Search for a query string using Pagefind.
       *
       * @param query - The search query.
       * @param maxResultLength - Maximum number of results to return (default: 10).
       * @returns A list of search results with `uri`, `title`, `date`, and `context` fields,
       *   or `null` if the search was aborted by Pagefind (e.g. superseded by a newer query).
       */
      async search(query, maxResultLength) {
        if (!query || !query.trim())
          return [];
        const pagefind = await ensurePagefind();
        const searchOptions = {};
        if (builtInFiltersEnabled) {
          const availableFilters = await getAvailableFilters();
          const filters = {};
          if (Object.hasOwn(availableFilters, "hidden")) {
            filters.hidden = "false";
          }
          if (Object.hasOwn(availableFilters, "encrypted")) {
            filters.encrypted = "false";
          }
          if (Object.keys(filters).length) {
            searchOptions.filters = filters;
          }
        }
        if (sortBy) {
          searchOptions.sort = { [sortBy]: sortOrder };
        }
        const resultLimit = Number.isFinite(maxResultLength) ? Math.max(0, Math.floor(maxResultLength)) : 10;
        const searched = debounceTimeout > 0 && typeof pagefind.debouncedSearch === "function" ? await pagefind.debouncedSearch(query, searchOptions, debounceTimeout) : await pagefind.search(query, searchOptions);
        if (searched === null)
          return null;
        const records = await Promise.all(
          (searched.results || []).slice(0, resultLimit).map((entry) => entry.data())
        );
        return records.map((item) => ({
          uri: item.url || "#",
          title: item.meta?.title || item.url || "",
          date: item.meta?.date || "",
          context: replaceExcerptHighlightTag(item.excerpt || "", highlightTag)
        }));
      }
    };
  }

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\search.ts
  var SEARCH_META = {
    algolia: { label: "algolia", icon: '<i class="fa-brands fa-algolia" aria-hidden="true"></i>', href: "https://www.algolia.com/" },
    fuse: { label: "Fuse.js", icon: "", href: "https://fusejs.io/" },
    cse: { label: "Google CSE", icon: '<i class="fa-brands fa-google" aria-hidden="true"></i>', href: "https://programmablesearchengine.google.com/" },
    pagefind: { label: "Pagefind", icon: "", href: "https://pagefind.app/" }
  };
  var SearchModule = class {
    constructor(core) {
      this.core = core;
    }
    core;
    #searchMobileOnce;
    #searchDesktopOnce;
    #searchMobile;
    #searchDesktop;
    #algoliaIndex;
    #pagefindSearch;
    /**
     * Reset search UI: close header, hide loading/clear, clear input value.
     * @param $header - The header element containing the search.
     * @param $searchLoading - The loading indicator element.
     * @param $searchClear - The clear button element.
     * @param searchInstance - The autocomplete instance to clear.
     */
    #resetSearchUI($header, $searchLoading, $searchClear, searchInstance) {
      $header.classList.remove("open");
      $searchLoading.style.display = "none";
      $searchClear.style.display = "none";
      searchInstance && searchInstance.autocomplete.setVal("");
      document.getElementById(`search-toggle-${$header.id.replace("header-", "")}`)?.setAttribute("aria-expanded", "false");
    }
    /** Initialize the search overlay, autocomplete, and engine-specific logic. */
    initSearch() {
      const searchConfig = this.core.config.search;
      const _isMobile = isMobile();
      if (!searchConfig || _isMobile && this.#searchMobileOnce || !_isMobile && this.#searchDesktopOnce) {
        return;
      }
      const {
        maxResultLength = 10,
        snippetLength = 50,
        highlightTag = "em",
        fuseIndexURL
      } = searchConfig;
      const suffix = _isMobile ? "mobile" : "desktop";
      const $header = document.getElementById(`header-${suffix}`);
      const $searchInput = document.getElementById(`search-input-${suffix}`);
      const $searchToggle = document.getElementById(`search-toggle-${suffix}`);
      const $searchLoading = document.getElementById(`search-loading-${suffix}`);
      const $searchClear = document.getElementById(`search-clear-${suffix}`);
      const $searchCancel = document.getElementById("search-cancel-mobile");
      const $menuToggleMobile = document.getElementById("menu-toggle-mobile");
      const $menuMobile = document.getElementById("menu-mobile");
      if (!$header || !$searchInput || !$searchToggle || !$searchLoading || !$searchClear)
        return;
      const setSearchExpanded = (expanded) => {
        $searchToggle?.setAttribute("aria-expanded", expanded ? "true" : "false");
      };
      const overlayName = `search-${suffix}`;
      const openSearch = () => {
        if (_isMobile && $menuToggleMobile && $menuMobile) {
          this.core.disableScrollEvent = true;
          $menuToggleMobile.classList.add("active");
          $menuMobile.classList.add("active");
          $menuToggleMobile.setAttribute("aria-expanded", "true");
        }
        $header.classList.add("open");
        setSearchExpanded(true);
        !_isMobile && $searchInput.focus();
      };
      const closeSearch = () => {
        if (_isMobile && $menuToggleMobile && $menuMobile) {
          this.core.disableScrollEvent = false;
          $menuToggleMobile.classList.remove("active");
          $menuMobile.classList.remove("active");
          $menuToggleMobile.setAttribute("aria-expanded", "false");
        }
        this.#resetSearchUI($header, $searchLoading, $searchClear, _isMobile ? this.#searchMobile : this.#searchDesktop);
      };
      if (searchConfig.type === "post-chat" && window.postChatUser) {
        if (_isMobile) {
          $searchInput.addEventListener("focus", () => {
            window.postChatUser.setSearchInput("");
          }, false);
        } else {
          $searchToggle.addEventListener("click", () => {
            window.postChatUser.setSearchInput("");
          }, false);
        }
        return;
      }
      if (_isMobile) {
        this.#searchMobileOnce = true;
        this.core.registerMaskOverlay(overlayName, {
          isActive: () => $header.classList.contains("open"),
          onOpen: openSearch,
          onClose: closeSearch
        });
        $searchInput.addEventListener("focus", () => {
          this.core.openMaskOverlay(overlayName);
        }, false);
        $searchCancel?.addEventListener("click", () => {
          this.core.closeMaskOverlay(overlayName);
        }, false);
        $searchClear.addEventListener("click", () => {
          this.core.disableScrollEvent = false;
          $searchClear.style.display = "none";
          this.#searchMobile && this.#searchMobile.autocomplete.setVal("");
        }, false);
      } else {
        this.#searchDesktopOnce = true;
        this.core.registerMaskOverlay(overlayName, {
          isActive: () => $header.classList.contains("open"),
          onOpen: openSearch,
          onClose: closeSearch
        });
        $searchToggle.addEventListener("click", () => {
          this.core.toggleMaskOverlay(overlayName);
        }, false);
        $searchClear.addEventListener("click", () => {
          $searchClear.style.display = "none";
          this.#searchDesktop && this.#searchDesktop.autocomplete.setVal("");
        }, false);
      }
      $searchInput.addEventListener("input", () => {
        if ($searchInput.value === "")
          $searchClear.style.display = "none";
        else $searchClear.style.display = "inline";
      }, false);
      if (searchConfig.type === "pagefind") {
        this.#pagefindSearch = this.#pagefindSearch || createPagefindSearch(searchConfig);
        $searchInput.addEventListener("focus", () => {
          this.#pagefindSearch.preload().catch((error) => {
            console.error(error);
          });
        }, { once: true });
      }
      const initAutosearch = () => {
        const autosearch = window.autocomplete(`#search-input-${suffix}`, {
          hint: false,
          autoselect: true,
          dropdownMenuContainer: `#search-dropdown-${suffix}`,
          clearOnSelected: true,
          cssClasses: { noPrefix: true },
          debug: false
        }, {
          name: "search",
          source: (query, callback) => {
            $searchLoading.style.display = "inline";
            $searchClear.style.display = "none";
            const finish = (results) => {
              $searchLoading.style.display = "none";
              $searchClear.style.display = "inline";
              callback(results);
            };
            if (searchConfig.type === "algolia") {
              if (!this.#algoliaIndex) {
                const liteClient = window["algoliasearch/lite"]?.liteClient;
                if (!liteClient) {
                  console.error("Algolia client is not available on window");
                  finish([]);
                  return;
                }
                const client = liteClient(searchConfig.algoliaAppID, searchConfig.algoliaSearchKey);
                this.#algoliaIndex = {
                  search: (queryText, params = {}) => {
                    const {
                      offset,
                      length,
                      ...rest
                    } = params;
                    const request = {
                      indexName: searchConfig.algoliaIndex,
                      query: queryText,
                      ...rest
                    };
                    if (typeof length === "number")
                      request.hitsPerPage = length;
                    if (typeof offset === "number" && typeof length === "number" && length > 0)
                      request.page = Math.floor(offset / length);
                    return client.search({ requests: [request] }).then((response) => ({ hits: response.results?.[0]?.hits ?? [] }));
                  }
                };
              }
              this.#algoliaIndex.search(query, {
                offset: 0,
                length: maxResultLength * 8,
                attributesToHighlight: ["title"],
                attributesToRetrieve: ["*"],
                attributesToSnippet: [`content:${snippetLength}`],
                highlightPreTag: `<${highlightTag}>`,
                highlightPostTag: `</${highlightTag}>`
              }).then(({ hits }) => {
                const results = {};
                hits.forEach(({ uri, date, _highlightResult: { title }, _snippetResult: { content } }) => {
                  if (results[uri] && results[uri].context.length > content.value)
                    return;
                  results[uri] = {
                    uri,
                    title: title.value,
                    date,
                    context: content.value
                  };
                });
                finish(Object.values(results).slice(0, maxResultLength));
              }).catch((err) => {
                console.error(err);
                finish([]);
              });
            } else if (searchConfig.type === "fuse") {
              const search = () => {
                const results = {};
                window._fuseIndex.search(query).forEach(({ item, matches }) => {
                  let title = item.title;
                  let content = item.content;
                  matches.forEach(({ indices, key }) => {
                    if (key === "content") {
                      content = applyHighlightToText(content, indices, highlightTag);
                    } else if (key === "title") {
                      title = applyHighlightToText(title, indices, highlightTag);
                    }
                  });
                  results[item.uri] = {
                    uri: item.uri,
                    title,
                    date: item.date,
                    context: content
                  };
                });
                return Object.values(results).slice(0, maxResultLength);
              };
              if (!window._fuseIndex) {
                fetch(fuseIndexURL).then((response) => response.json()).then((data) => {
                  window._fuseIndex = new window.Fuse(data, {
                    isCaseSensitive: searchConfig.isCaseSensitive ?? false,
                    findAllMatches: searchConfig.findAllMatches ?? false,
                    minMatchCharLength: searchConfig.minMatchCharLength ?? 1,
                    location: searchConfig.location ?? 0,
                    threshold: searchConfig.threshold ?? 0.3,
                    distance: searchConfig.distance ?? 100,
                    ignoreLocation: searchConfig.ignoreLocation ?? false,
                    useExtendedSearch: searchConfig.useExtendedSearch ?? false,
                    ignoreFieldNorm: searchConfig.ignoreFieldNorm ?? false,
                    includeScore: false,
                    shouldSort: true,
                    includeMatches: true,
                    keys: ["content", "title"]
                  });
                  finish(search());
                }).catch((err) => {
                  console.error(err);
                  finish([]);
                });
              } else {
                finish(search());
              }
            } else if (searchConfig.type === "cse") {
              const cseConfig = this.core.config.cse;
              if (cseConfig?.engine === "google" && cseConfig.cx) {
                finish([{
                  uri: `${cseConfig.resultsPage}#gsc.tab=0&gsc.q=${encodeURIComponent(query)}`,
                  title: cseConfig.searchIn,
                  date: '<i class="fa-brands fa-searchengin fa-xl" aria-hidden="true"></i>',
                  context: cseConfig.gotoResultsPage
                }]);
              }
            } else if (searchConfig.type === "pagefind") {
              this.#pagefindSearch.search(query, maxResultLength).then((results) => {
                finish(results || []);
              }).catch((err) => {
                console.error(err);
                finish([]);
              });
            } else {
              finish([]);
            }
          },
          templates: {
            suggestion: ({ title, uri, date, context }) => `<div><a href="${uri}"><span class="suggestion-title">${title}</span></a><span class="suggestion-date">${date}</span></div><div class="suggestion-context">${context}</div>`,
            empty: ({ query }) => `<div class="search-empty">${searchConfig.noResultsFound}: <span class="search-query">"${HTMLEscape(query)}"</span></div>`,
            footer: () => {
              const meta = SEARCH_META[searchConfig.type];
              if (!meta)
                return "";
              return `<div class="search-footer">Search by <a href="${meta.href}" rel="noopener noreferrer" target="_blank">${meta.icon} ${meta.label}</a></div>`;
            }
          }
        });
        autosearch.on("autocomplete:selected", (_event, suggestion, _dataset, _context) => {
          this.core.closeMaskOverlay(overlayName);
          window.location.assign(suggestion.uri);
        });
        if (_isMobile) {
          this.#searchMobile = autosearch;
        } else {
          this.#searchDesktop = autosearch;
        }
      };
      initAutosearch();
    }
  };

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\theme.ts
  var ThemeModule = class {
    constructor(core) {
      this.core = core;
    }
    core;
    mql = window.matchMedia("(prefers-color-scheme: dark)");
    /**
     * Apply a theme mode and emit the `fixit:switch-theme` event.
     * @param mode - `'auto'`, `'light'`, or `'dark'`.
     * @param persist - Whether to save the choice to localStorage (default: `true`).
     */
    setThemeMode(mode, persist = true) {
      const prevIsDark = this.core.isDark;
      this.core.themeMode = mode;
      document.documentElement.dataset.themeMode = mode;
      this.core.isDark = mode === "auto" ? this.mql.matches : mode === "dark";
      if (persist) {
        window.localStorage?.setItem("theme-mode", mode);
      }
      eventBus.emit("fixit:switch-theme", {
        isDark: this.core.isDark,
        mode,
        isChanged: prevIsDark !== this.core.isDark
      });
    }
    /** Sync the `<meta name="theme-color">` tag with the current color scheme. */
    initThemeColor() {
      const $meta = document.querySelector('[name="theme-color"]');
      if (!$meta)
        return;
      const applyThemeColor = (isDark) => {
        $meta.content = isDark ? $meta.dataset.dark : $meta.dataset.light;
      };
      eventBus.on("fixit:switch-theme", ({ detail }) => {
        if (!detail.isChanged)
          return;
        applyThemeColor(detail.isDark);
      });
      applyThemeColor(this.core.isDark);
    }
    /** Initialize the theme switch button cycle and system preference listener. */
    initSwitchTheme() {
      const modes = ["auto", "light", "dark"];
      document.querySelectorAll(".theme-switch").forEach(($themeSwitch) => {
        $themeSwitch.addEventListener("click", () => {
          const currentIndex = modes.indexOf(this.core.themeMode);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          this.setThemeMode(nextMode);
        }, false);
      });
      this.mql.addEventListener("change", (e) => {
        if (this.core.themeMode !== "auto")
          return;
        const prevIsDark = this.core.isDark;
        this.core.isDark = e.matches;
        eventBus.emit("fixit:switch-theme", {
          isDark: this.core.isDark,
          mode: "auto",
          isChanged: prevIsDark !== this.core.isDark
        });
      });
    }
  };

  // ns-hugo-imp:D:\hugo-blog\andyfree96\themes\FixIt\assets\js\modules\toc.ts
  var TocModule = class {
    activeTocId = null;
    /** Get the pixel height of the currently visible sticky header. */
    getVisibleHeaderOffset() {
      const $desktopHeader = document.getElementById("header-desktop");
      const $mobileHeader = document.getElementById("header-mobile");
      const $header = [$desktopHeader, $mobileHeader].find(($el) => $el && window.getComputedStyle($el).display !== "none");
      if (!$header)
        return 0;
      const isDesktop = $header.id === "header-desktop";
      const headerMode = isDesktop ? document.body.dataset.headerDesktop : document.body.dataset.headerMobile;
      if (!["sticky", "auto"].includes(headerMode))
        return 0;
      if (headerMode === "auto" && $header.classList.contains("header__fadeOutUp"))
        return 0;
      return $header.offsetHeight;
    }
    /** Get the pixel height of the breadcrumb container. */
    getBreadcrumbHeight() {
      return document.querySelector(".breadcrumb-container")?.offsetHeight || 0;
    }
    /** Get the combined vertical offset used to determine the active TOC heading. */
    getTocIndexOffset() {
      return 20 + this.getVisibleHeaderOffset() + this.getBreadcrumbHeight();
    }
    /** Get all heading elements that have an `id` attribute. */
    getTocHeadingElements() {
      return Array.from(document.querySelectorAll(".heading-element[id]"));
    }
    /**
     * Determine which heading is currently active based on scroll position.
     * @param $headingElements - Array of heading elements with `id` attributes.
     * @param indexOffset - Vertical offset from the top for the active threshold.
     * @returns The active heading element, or `null` if none found.
     */
    getActiveTocHeading($headingElements, indexOffset = this.getTocIndexOffset()) {
      if (!$headingElements.length)
        return null;
      const threshold = window.scrollY + indexOffset + 1;
      let $activeHeading = $headingElements[0];
      for (const $heading of $headingElements) {
        const headingTop = window.scrollY + $heading.getBoundingClientRect().top;
        if (headingTop <= threshold) {
          $activeHeading = $heading;
        } else {
          break;
        }
      }
      return $activeHeading;
    }
    /** Get all TOC root containers (static, auto, and drawer). */
    getTocRoots() {
      return [
        document.getElementById("TableOfContents"),
        document.querySelector("#toc-content-static > nav"),
        document.querySelector("#toc-content-drawer > nav")
      ].filter(Boolean);
    }
    /**
     * Find the TOC link that points to the given heading id.
     * @param $tocRoot - The TOC root container element.
     * @param id - The heading id (without `#`).
     * @returns The matching anchor element, or `null`.
     */
    getTocLinkById($tocRoot, id) {
      if (!$tocRoot || !id)
        return null;
      const targetHash = `#${id}`;
      return Array.from($tocRoot.querySelectorAll('a[href^="#"]')).find(($link) => $link.getAttribute("href") === targetHash) || null;
    }
    /**
     * Highlight the active TOC item and its parent chain.
     * @param $tocRoot - The TOC root container element.
     * @param activeId - The id of the currently active heading.
     */
    applyTocActiveState($tocRoot, activeId) {
      if (!$tocRoot)
        return;
      $tocRoot.querySelectorAll('a[href^="#"]').forEach(($tocLink) => {
        $tocLink.classList.remove("active");
      });
      $tocRoot.querySelectorAll("li").forEach(($tocLi) => {
        $tocLi.classList.remove("has-active");
      });
      const $activeLink = this.getTocLinkById($tocRoot, activeId);
      if (!$activeLink)
        return;
      $activeLink.classList.add("active");
      let $parent = $activeLink.closest("li");
      while ($parent) {
        $parent.classList.add("has-active");
        $parent = $parent.parentElement?.closest("li") || null;
      }
    }
    /**
     * Scroll the active TOC link into the visible area of its container.
     * @param $tocRoot - The TOC root container element.
     * @param activeId - The id of the currently active heading.
     * @param $scrollContainer - The scrollable container (defaults to `$tocRoot`).
     */
    scrollActiveTocLinkIntoView($tocRoot, activeId, $scrollContainer = $tocRoot) {
      const $activeLink = this.getTocLinkById($tocRoot, activeId);
      if (!$activeLink || !$scrollContainer)
        return;
      const containerRect = $scrollContainer.getBoundingClientRect();
      const linkRect = $activeLink.getBoundingClientRect();
      const offsetTop = linkRect.top - containerRect.top;
      const offsetBottom = linkRect.bottom - containerRect.bottom;
      if (offsetTop < 0) {
        $scrollContainer.scrollTop += offsetTop;
      } else if (offsetBottom > 0) {
        $scrollContainer.scrollTop += offsetBottom;
      }
    }
    /** Update the TOC container's max-height CSS variable to fit the viewport. */
    syncTocHeight() {
      const $toc = document.getElementById("toc-auto");
      const $tocContentAuto = document.getElementById("toc-content-auto");
      if ($toc && $tocContentAuto) {
        const maxHeight = Math.max(window.innerHeight - $tocContentAuto.getBoundingClientRect().top - 16);
        $tocContentAuto.style.setProperty("--fi-toc-content-max-height", `${Math.floor(maxHeight)}px`);
      }
    }
    /** Sync the active heading highlight across all TOC containers. */
    syncTocActiveState() {
      const $headingElements = this.getTocHeadingElements();
      const $activeHeading = this.getActiveTocHeading($headingElements);
      if (!$activeHeading?.id)
        return;
      const activeId = $activeHeading.id;
      const $tocRoots = this.getTocRoots();
      $tocRoots.forEach(($tocRoot) => {
        this.applyTocActiveState($tocRoot, activeId);
      });
      if (this.activeTocId !== activeId) {
        this.activeTocId = activeId;
        if (!isTocStatic()) {
          const $autoTocRoot = document.getElementById("TableOfContents");
          const $autoTocContainer = document.getElementById("toc-content-auto");
          if ($autoTocRoot && $autoTocContainer) {
            this.scrollActiveTocLinkIntoView($autoTocRoot, activeId, $autoTocContainer);
          }
        }
        if (document.getElementById("toc-dialog")?.open) {
          const $dialogTocRoot = document.querySelector("#toc-content-drawer > nav");
          this.scrollActiveTocLinkIntoView($dialogTocRoot, activeId, $dialogTocRoot);
        }
      }
    }
    /** Initialize TOC layout: move the TOC node to the correct container and sync state. */
    initToc() {
      const $tocCore = document.getElementById("TableOfContents");
      if ($tocCore === null)
        return;
      const openButton = document.querySelector("#toc-drawer-button");
      if (openButton) {
        openButton.classList.toggle("d-none", !isTocStatic());
      }
      this.activeTocId = null;
      if (isTocStatic()) {
        const $tocContentStatic = document.getElementById("toc-content-static");
        if ($tocCore.parentElement !== $tocContentStatic) {
          $tocCore.parentElement.removeChild($tocCore);
          $tocContentStatic.appendChild($tocCore);
        }
        this.syncTocHeight();
        this.syncTocActiveState();
        return;
      }
      const $tocContentAuto = document.getElementById("toc-content-auto");
      if ($tocCore.parentElement !== $tocContentAuto) {
        $tocCore.parentElement.removeChild($tocCore);
        $tocContentAuto.appendChild($tocCore);
      }
      const $toc = document.getElementById("toc-auto");
      $toc.style.visibility = "visible";
      animateCSS($toc, ["animate__fadeIn", "animate__faster"], true);
      this.syncTocHeight();
      this.syncTocActiveState();
    }
    /** Bind the TOC title click handler for show/hide toggle. */
    initTocListener() {
      const $toc = document.getElementById("toc-auto");
      const $tocContentAuto = document.getElementById("toc-content-auto");
      document.querySelector("#toc-auto>.toc-title")?.addEventListener("click", () => {
        const animation = ["animate__faster"];
        const tocHidden = $toc.classList.contains("toc-hidden");
        animation.push(tocHidden ? "animate__fadeIn" : "animate__fadeOut");
        if (tocHidden) {
          $tocContentAuto.classList.remove("d-none", "animate__fadeOut");
        } else {
          $tocContentAuto.classList.remove("animate__fadeIn");
        }
        animateCSS($tocContentAuto, animation, true, () => {
          $tocContentAuto.classList.contains("animate__fadeOut") && $tocContentAuto.classList.add("d-none");
        });
        $toc.classList.toggle("toc-hidden");
      }, false);
    }
    /** Initialize the mobile TOC drawer dialog and its open/close handlers. */
    initTocDialog() {
      const dialog = document.querySelector("#toc-dialog");
      const openButton = document.querySelector("#toc-drawer-button");
      if (!dialog || !openButton)
        return;
      const closeButton = dialog.querySelector(".toc-close-btn");
      closeButton?.addEventListener("click", () => dialog.close());
      openButton.addEventListener("click", () => {
        dialog.showModal();
        openButton.setAttribute("aria-expanded", "true");
        this.syncTocHeight();
        this.syncTocActiveState();
        const $dialogTocRoot = document.querySelector("#toc-content-drawer > nav");
        this.scrollActiveTocLinkIntoView($dialogTocRoot, this.activeTocId, $dialogTocRoot);
        document.activeElement?.blur();
      });
      document.querySelectorAll('#toc-content-drawer a[href^="#"]').forEach(($link) => {
        $link.addEventListener("click", () => dialog.close());
      });
      dialog.addEventListener("close", () => {
        openButton.setAttribute("aria-expanded", "false");
      });
    }
    /** Clone TOC and heading-mark nodes to detach APlayer event listeners. */
    fixTocScroll() {
      if (typeof window.APlayer === "function") {
        let $tocCore = document.getElementById("TableOfContents");
        if ($tocCore) {
          const $newTocCore = $tocCore.cloneNode(true);
          $tocCore.parentElement.replaceChild($newTocCore, $tocCore);
          $tocCore = $newTocCore;
        }
        document.querySelectorAll(".heading-mark").forEach(($headingMark) => {
          const $newHeadingMark = $headingMark.cloneNode(true);
          $headingMark.parentElement.replaceChild($newHeadingMark, $headingMark);
        });
      }
    }
    /** Initialize all TOC components and register event listeners. */
    setup() {
      this.fixTocScroll();
      this.initToc();
      this.initTocListener();
      this.initTocDialog();
    }
  };

  // <stdin>
  function bootstrap() {
    const core = new CoreModule();
    const theme = new ThemeModule(core);
    const code = new CodeModule();
    const toc = new TocModule();
    const menu = new MenuModule(core);
    const search = new SearchModule(core);
    const enc = new EncryptionModule(core);
    const misc = new MiscModule(core);
    const content = new ContentModule(core, code);
    const events = new EventsModule(core, toc, search, code);
    window.fixit = {
      get config() {
        return core.config;
      },
      get themeMode() {
        return core.themeMode;
      },
      get isDark() {
        return core.isDark;
      },
      get newScrollTop() {
        return core.newScrollTop;
      },
      get oldScrollTop() {
        return core.oldScrollTop;
      },
      setThemeMode: (mode, persist) => theme.setThemeMode(mode, persist),
      registerMaskOverlay: (name, handlers) => core.registerMaskOverlay(name, handlers),
      toggleMaskOverlay: (name) => core.toggleMaskOverlay(name),
      closeMaskOverlay: (name, skipSync) => core.closeMaskOverlay(name, skipSync),
      initContent: (target) => content.initContent(target),
      eventBus
    };
    function init() {
      try {
        toc.setup();
        content.setup();
        enc.initFixItDecryptor();
        theme.initThemeColor();
        content.initSVGIcon();
        menu.initMenu();
        theme.initSwitchTheme();
        search.initSearch();
        misc.initSiteTime();
        misc.initServiceWorker();
        misc.initAutoMark();
        misc.initReward();
        misc.initPostChatUser();
        misc.initComment();
        events.onScroll();
        events.onResize();
        events.onClickMask();
        events.initPrint();
      } catch (err) {
        console.error(err);
      }
      const fixitColor = "#FF735A";
      console.log(
        `%c FixIt ${core.config.version} %c https://github.com/hugo-fixit %c`,
        `background: ${fixitColor};border:1px solid ${fixitColor}; padding: 1px; border-radius: 2px 0 0 2px; color: #fff;`,
        `border:1px solid ${fixitColor}; padding: 1px; border-radius: 0 2px 2px 0; color: ${fixitColor};`,
        "background:transparent;"
      );
    }
    document.addEventListener("DOMContentLoaded", init, false);
  }
  bootstrap();
})();
//# sourceMappingURL=main.js.map
