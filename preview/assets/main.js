(() => {
  "use strict";
  const html = document.documentElement;
  const toggle = document.querySelector("[data-theme-toggle]");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const year = document.querySelector("[data-year]");

  function updateThemeButton() {
    if (!toggle) return;
    toggle.setAttribute("aria-label", html.dataset.theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre");
  }
  try {
    const saved = localStorage.getItem("portfolio-theme");
    if (saved === "dark" || saved === "light") html.dataset.theme = saved;
    else if (matchMedia("(prefers-color-scheme: light)").matches) html.dataset.theme = "light";
  } catch {
    // Navigation and theme switching work even if storage is blocked.
  }
  updateThemeButton();
  if (toggle) toggle.addEventListener("click", () => {
    html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("portfolio-theme", html.dataset.theme); } catch {}
    updateThemeButton();
  });
  function closeMenu() {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Ouvrir le menu");
    nav.dataset.open = "false";
  }
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      menuButton.setAttribute("aria-label", expanded ? "Ouvrir le menu" : "Fermer le menu");
      nav.dataset.open = String(!expanded);
    });
    nav.addEventListener("click", event => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 780) closeMenu();
    });
  }
  if (year) year.textContent = String(new Date().getFullYear());

  // Accessible, purely local editorial showcase: no network or analytics.
  const tabs = [...document.querySelectorAll("[data-stage-tab]")];
  const panels = [...document.querySelectorAll("[data-stage-panel]")];
  function selectStage(key, shouldFocus=false) {
    tabs.forEach(tab => {
      const active=tab.dataset.stageTab===key;
      tab.setAttribute("aria-selected",String(active));
      tab.tabIndex=active ? 0 : -1;
      if(active && shouldFocus) tab.focus();
    });
    panels.forEach(panel => {
      panel.hidden=panel.dataset.stagePanel!==key;
    });
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener("click",()=>selectStage(tab.dataset.stageTab));
    tab.addEventListener("keydown",event=>{
      let next;
      if(event.key==="ArrowRight") next=(index+1)%tabs.length;
      if(event.key==="ArrowLeft") next=(index-1+tabs.length)%tabs.length;
      if(event.key==="Home") next=0;
      if(event.key==="End") next=tabs.length-1;
      if(next!==undefined){
        event.preventDefault();
        selectStage(tabs[next].dataset.stageTab,true);
      }
    });
  });
})();