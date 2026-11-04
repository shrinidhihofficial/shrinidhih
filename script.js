// Renders the whole page from portfolio-content.json.
// To change what the site says, edit that file — no code changes needed.
(() => {
  const CONTENT_URL = "portfolio-content.json";
  const $ = (id) => document.getElementById(id);

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));

  const startYear = (period) => {
    const match = String(period || "").match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  };
  const isCurrent = (period) => /now|present/i.test(String(period || ""));
  // "/iimb-logo.svg" -> "iimb-logo.svg" so it also works on project sites (username.github.io/repo/)
  const localPath = (path) => String(path || "").replace(/^\/+/, "");

  function renderHero(p) {
    const meta = [p.role, p.location && `based in ${p.location}`].filter(Boolean).join(" ");
    $("hero-meta").textContent = meta;

    // headlineRich is trusted HTML from your own JSON (it carries the <em> styling)
    $("hero-title").innerHTML = (p.headlineRich || [])
      .map((line) => `<span class="line">${line}</span>`)
      .join("");

    $("hero-sub").textContent = p.subheadline || "";

    if (p.email) $("hero-email").href = `mailto:${p.email}`;
    if (p.linkedin) $("hero-linkedin").href = p.linkedin;
    else $("hero-linkedin").hidden = true;

    if (p.heroArt) {
      $("hero-art-img").src = localPath(p.heroArt);
      $("hero-art").hidden = false;
      document.querySelector(".hero").classList.add("has-art");
    }
  }

  function renderRibbon(items) {
    const ribbon = $("ribbon");
    if (!items || !items.length) { ribbon.hidden = true; return; }

    const group = (hidden) =>
      `<ul class="ribbon-group"${hidden ? ' aria-hidden="true"' : ' aria-label="Focus areas"'}>` +
      items.map((item) => `<li class="ribbon-item">${esc(item)}</li>`).join("") +
      "</ul>";

    // Four copies so the loop never shows a gap on wide screens
    $("ribbon-track").innerHTML = group(false) + group(true) + group(true) + group(true);
  }

  function renderAbout(about, p) {
    $("about-title").textContent = about.intro || "About";

    if (p.photo) {
      const photo = $("about-photo");
      photo.src = localPath(p.photo);
      photo.alt = p.name ? `Portrait of ${p.name}` : "Portrait";
      photo.hidden = false;
    }

    $("about-story").innerHTML = (about.story || [])
      .map((para) => `<p>${esc(para)}</p>`)
      .join("");
  }

  function renderPath(experience) {
    const stops = [
      ...(experience.education || []).map((e) => ({
        kind: "Education", period: e.period, title: e.degree, org: e.school, logo: e.logo,
      })),
      ...(experience.roles || []).map((r) => ({
        kind: "Work", period: r.period, title: r.title, org: r.company, note: r.note,
      })),
    ].sort((a, b) => startYear(a.period) - startYear(b.period));

    const list = $("path-list");
    list.style.setProperty("--n", stops.length || 1);
    list.innerHTML = stops
      .map((s) => `
        <li class="stop${isCurrent(s.period) ? " is-current" : ""}">
          <span class="node" aria-hidden="true"></span>
          <p class="stop-meta">
            <span class="stop-period">${esc(s.period)}</span>
            <span>${esc(s.kind)}</span>
          </p>
          <h3 class="stop-title">${esc(s.title)}</h3>
          <p class="stop-org">${s.logo ? `<span class="stop-logo"><img src="${esc(localPath(s.logo))}" alt="" width="44" height="44"></span>` : ""}<span>${esc(s.org)}</span></p>
          ${s.note ? `<p class="stop-note">${esc(s.note)}</p>` : ""}
        </li>`)
      .join("");

    // If a logo file isn't in the repo yet, just leave it out
    list.querySelectorAll(".stop-logo img").forEach((img) => {
      const drop = () => img.parentElement.remove();
      img.addEventListener("error", drop);
      if (img.complete && img.naturalWidth === 0) drop();
    });
  }

  function renderContact(p, contact) {
    $("contact-intro").textContent = contact.intro || "";

    const email = $("contact-email");
    if (p.email) {
      email.textContent = p.email;
      email.href = `mailto:${p.email}`;
    } else {
      email.hidden = true;
      $("copy-email").hidden = true;
    }

    if (p.linkedin) $("contact-linkedin").href = p.linkedin;
    else $("contact-linkedin").hidden = true;

    const copyBtn = $("copy-email");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(p.email);
        copyBtn.textContent = "Copied";
        $("copy-status").textContent = "Email address copied";
        setTimeout(() => { copyBtn.textContent = "Copy email"; }, 2000);
      } catch {
        copyBtn.textContent = "Select the address above to copy";
      }
    });
  }

  function render(data) {
    const p = data.persona || {};

    if (p.name && p.role) document.title = `${p.name} | ${p.role}`;
    const description = document.querySelector('meta[name="description"]');
    if (description && p.subheadline) description.content = p.subheadline;

    $("brand").textContent = p.name || "";
    $("footer-name").textContent = p.name || "";
    $("year").textContent = new Date().getFullYear();

    renderHero(p);
    renderRibbon(data.marqueeItems);
    renderAbout(data.aboutCopy || {}, p);
    renderPath(data.experience || {});
    renderContact(p, data.contactCopy || {});

    document.body.classList.add("is-ready");
  }

  fetch(CONTENT_URL, { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(render)
    .catch((err) => {
      console.error("Could not load content:", err);
      document.body.classList.add("has-error");
      $("load-error").hidden = false;
    });
})();
