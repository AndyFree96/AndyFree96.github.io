(() => {
  // ns-hugo-params:<stdin>
  var stdin_default = { defaultTheme: "auto" };

  // <stdin>
  (function() {
    const localStorage = window.localStorage;
    const storedMode = localStorage?.getItem("theme-mode");
    const themeMode = storedMode || (stdin_default.defaultTheme === "light" || stdin_default.defaultTheme === "dark" ? stdin_default.defaultTheme : "auto");
    document.documentElement.dataset.themeMode = themeMode;
  })();
})();
//# sourceMappingURL=color-scheme.js.map
