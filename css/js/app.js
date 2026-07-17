/* ===========================================================
   Parcelo — shared office finder logic
   Included by index.html, leopard.html, nadra.html and
   self-collection.html. Each page sets window.PAGE_CATEGORY
   before this file runs, so all three stay driven by the same
   dataset (data.js) and the same rendering code.
   =========================================================== */

(function () {
  const state = {
    category: window.PAGE_CATEGORY || "all",
    query: "",
    province: "All",
    openNow: false,
    hrs24: false
  };

  function officesForCategory(category) {
    if (category === "all") return OFFICES;
    return OFFICES.filter((o) => o.category === category);
  }

  function badgeClass(category) {
    switch (category) {
      case "nadra": return "badge nadra";
      case "leopard": return "badge leopard";
      case "self-collection": return "badge self";
      case "regional-hub": return "badge hub";
      case "express-center": return "badge express";
      default: return "badge";
    }
  }

  function iconPin() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
  }
  function iconPhone() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>';
  }
  function iconClock() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
  }
  function iconMaps() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>';
  }
  function iconDirections() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>';
  }
  function iconCopy() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  }

  /* Small deterministic "QR-style" mosaic per office, purely
     decorative — same idea as the pattern on each card in the
     reference design. */
  function qrSvg(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const cells = 5;
    let rects = "";
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        h = (h * 1103515245 + 12345) >>> 0;
        if ((h >> 16) % 2 === 0) {
          rects += `<rect x="${x * 20}" y="${y * 20}" width="18" height="18" fill="#1A1A1A"/>`;
        }
      }
    }
    return `<svg class="qr" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#fff"/>${rects}</svg>`;
  }

  function renderCard(o) {
    const openTag = o.openNow
      ? '<span class="status-open">Open now</span>'
      : '<span class="tag-pill">Closed now</span>';
    const extraTags = o.tags
      .filter((t) => t !== "Open now")
      .map((t) => `<span class="tag-pill">${t}</span>`)
      .join("");

    return `
      <article class="office-card" data-id="${o.id}">
        <div class="card-top">
          <span class="${badgeClass(o.category)}">${o.badgeLabel}</span>
          ${qrSvg(o.id)}
        </div>
        <h3 class="office-name">${o.name}</h3>
        <div class="office-city">${iconPin()}<span>${o.city}</span></div>
        <p class="office-address">${o.address}</p>
        <div class="office-meta">
          <div class="row">${iconPhone()}<span>${o.phone}</span></div>
          <div class="row">${iconClock()}<span>${o.hours}</span></div>
        </div>
        <div class="status-row">${openTag}${extraTags}</div>
        <div class="card-actions">
          <button class="btn-maps" data-action="maps" data-address="${encodeURIComponent(o.address)}">${iconMaps()} Maps</button>
          <button class="btn-directions" data-action="directions" data-address="${encodeURIComponent(o.address)}">${iconDirections()} Directions</button>
          <button class="btn-copy" data-action="copy" data-phone="${o.phone}" title="Copy phone number">${iconCopy()}</button>
        </div>
      </article>`;
  }

  function applyFilters() {
    let list = officesForCategory(state.category);

    if (state.province !== "All") {
      list = list.filter((o) => o.province === state.province);
    }
    if (state.openNow) {
      list = list.filter((o) => o.openNow);
    }
    if (state.hrs24) {
      list = list.filter((o) => o.is24);
    }
    if (state.query.trim()) {
      const q = state.query.trim().toLowerCase();
      list = list.filter((o) =>
        [o.name, o.city, o.address, o.badgeLabel].join(" ").toLowerCase().includes(q)
      );
    }
    return list;
  }

  function render() {
    const list = applyFilters();
    const grid = document.getElementById("officesGrid");
    const countEl = document.getElementById("resultsCount");

    if (countEl) countEl.textContent = `${list.length} office${list.length === 1 ? "" : "s"} found`;

    if (!grid) return;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3>No offices match your filters</h3>
          <p>Try clearing a filter or searching a different city or area.</p>
        </div>`;
      return;
    }
    grid.innerHTML = list.map(renderCard).join("");
  }

  function wireSearch() {
    const input = document.getElementById("searchInput");
    const btn = document.getElementById("searchBtn");
    if (!input) return;
    const run = () => { state.query = input.value; render(); };
    btn && btn.addEventListener("click", run);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
    input.addEventListener("input", () => { state.query = input.value; render(); });

    document.querySelectorAll(".try-chip[data-query]").forEach((chip) => {
      chip.addEventListener("click", () => {
        input.value = chip.dataset.query;
        state.query = chip.dataset.query;
        render();
      });
    });
  }

  function wireSidebar() {
    document.querySelectorAll(".chip-btn[data-province]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".chip-btn[data-province]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.province = btn.dataset.province;
        render();
      });
    });

    const openSwitch = document.getElementById("openNowSwitch");
    if (openSwitch) {
      openSwitch.addEventListener("click", () => {
        state.openNow = !state.openNow;
        openSwitch.classList.toggle("on", state.openNow);
        render();
      });
    }
    const hrsSwitch = document.getElementById("hrs24Switch");
    if (hrsSwitch) {
      hrsSwitch.addEventListener("click", () => {
        state.hrs24 = !state.hrs24;
        hrsSwitch.classList.toggle("on", state.hrs24);
        render();
      });
    }
  }

  function wireCardActions() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "maps" || action === "directions") {
        const addr = decodeURIComponent(btn.dataset.address);
        const url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(addr);
        window.open(url, "_blank", "noopener");
      } else if (action === "copy") {
        navigator.clipboard && navigator.clipboard.writeText(btn.dataset.phone);
        const original = btn.innerHTML;
        btn.innerHTML = "✓";
        setTimeout(() => (btn.innerHTML = original), 1200);
      }
    });
  }

  function applyHashCategory() {
    if (state.category !== "all") return;
    const hash = (window.location.hash || "").replace("#", "");
    if (hash && CATEGORY_PAGES[hash]) {
      state.category = hash;
      document.querySelectorAll(".cat-tab").forEach((tab) => tab.classList.remove("active"));
      const match = document.querySelector(`.cat-tab[href$="#${hash}"]`);
      if (match) match.classList.add("active");
      else {
        const allTab = document.querySelector('.cat-tab[href="index.html"]');
        allTab && allTab.classList.remove("active");
      }
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyHashCategory();
    wireSearch();
    wireSidebar();
    wireCardActions();
    render();
  });
})();
