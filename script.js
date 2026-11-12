
// Renders the whole page from portfolio-content.json.
// To change what the site says, edit that file — no code changes needed.
(() => {
  const CONTENT_URL = "portfolio-content.json";
  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => document.querySelectorAll(selector);

  const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const startYear = (period) => {
    const match = String(period || "").match(/\d{4}/);
    return match ? Number(match[0]) : 0;
  };

  const isCurrent = (period) => /now|present/i.test(String(period || ""));

  // "/iimb-logo.svg" -> "iimb-logo.svg"
  // This also works on project sites (username.github.io/repo/).
  const localPath = (path) => String(path || "").replace(/^\/+/, "");

  // "https://www.linkedin.com/in/shrinidhi-h" -> "linkedin.com/in/shrinidhi-h"
  const linkedinId = (url) =>
    String(url || "")
      .replace(/^https?:\/\/(www\.)?/i, "")
      .replace(/\/+$/, "");

  // Every element marked data-email / data-linkedin gets the right link (or is hidden).
  function renderLinks(p) {
    $$("[data-email]").forEach((el) => {
      if (p.email) el.href = `mailto:${p.email}`;
      else el.hidden = true;
    });

    $$("[data-linkedin]").forEach((el) => {
      if (p.linkedin) el.href = p.linkedin;
      else el.hidden = true;
    });
  }

  function renderHeader(p) {
    $("brand-name").textContent = p.name || "";

    $("brand-meta").innerHTML = [p.role, p.location]
      .filter(Boolean)
      .map(
        (part) =>
          `<span class="sep" aria-hidden="true">|</span><span>${esc(part)}</span>`
      )
      .join("");
  }

  function renderHero(p) {
    // headlineRich is trusted HTML from your own JSON (it carries the <em> styling).
    $("hero-title").innerHTML = (p.headlineRich || [])
      .map((line) => `<span class="line">${line}</span>`)
      .join("");

    $("hero-sub").textContent = p.subheadline || "";
  }

  // Circular word cloud beside the headline.
  // Each inner list in "wordCloud" is one line.
  // Lines are sized so together they fill a circle:
  // put short lines first and last, long ones in the middle.
  const TONES = ["ink", "red", "wine"];

  // Capitals, but keep plurals of acronyms as written: "LLMs", "PRDs".
  const shout = (term) =>
    String(term)
      .split(" ")
      .map((w) => (/^[A-Z]{2,}s$/.test(w) ? w : w.toUpperCase()))
      .join(" ");

  function renderCloud(rows) {
    const lines = (rows || [])
      .map((row) => (Array.isArray(row) ? row : [row]).filter(Boolean))
      .filter((row) => row.length);

    if (!lines.length) return;

    const cloud = $("cloud");

    cloud.innerHTML = lines
      .map(
        (terms, r) =>
          `<div class="cloud-row">${terms
            .map(
              (term, i) =>
                `<span role="listitem" aria-label="${esc(term)}" class="tone-${TONES[(r + i) % TONES.length]}">${esc(shout(term))}</span>`
            )
            .join("")}</div>`
      )
      .join("");

    cloud.hidden = false;
    document.querySelector(".hero").classList.add("has-cloud");

    fitCloud();

    if (document.fonts) {
      document.fonts.ready.then(() => fitCloud(true));
    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(() => fitCloud()).observe(cloud);
    }
  }

  let fittedWidth = 0;

  function fitCloud(force) {
    const cloud = $("cloud");
    const diameter = cloud.clientWidth;

    if (!diameter || (diameter === fittedWidth && !force)) return;

    fittedWidth = diameter;

    const rows = [...cloud.querySelectorAll(".cloud-row")];
    const radius = (diameter / 2) * 0.92;
    const gap = diameter * 0.012;
    const lineHeight = 0.84;

    cloud.style.gap = `${gap}px`;

    // Width of each line per 1px of font size.
    const perPx = rows.map((row) => {
      row.style.fontSize = "100px";
      return row.getBoundingClientRect().width / 100;
    });

    // Each line is as wide as the circle allows at its outer edge.
    // Line sizes depend on each other, so settle them over a few rounds.
    let sizes = perPx.map(() => diameter / 20);

    for (let round = 0; round < 80; round++) {
      const heights = sizes.map((s) => s * lineHeight);

      const total =
        heights.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);

      let y = -total / 2;

      const target = heights.map((h, i) => {
        const top = y;
        const bottom = y + h;

        y = bottom + gap;

        const outer = Math.max(Math.abs(top), Math.abs(bottom));
        const chord =
          outer < radius
            ? 2 * Math.sqrt(radius * radius - outer * outer)
            : 0;

        return Math.max(chord / perPx[i], 6);
      });

      sizes = sizes.map((s, i) => s * 0.6 + target[i] * 0.4);
    }

    rows.forEach((row, i) => {
      row.style.fontSize = `${sizes[i].toFixed(2)}px`;
    });
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

  // Work column and Education column of cards, newest first.
  // Each card gets a grid column and row, so cards in the same row line up on wide screens.
  function renderPath(experience) {
    const newestFirst = (list) =>
      [...list].sort(
        (a, b) => startYear(b.period) - startYear(a.period)
      );

    const columns = [
      {
        title: "Work",
        items: newestFirst(experience.roles || []).map((r) => ({
          period: r.period,
          title: r.title,
          org: r.company,
          note: r.note,
          logo: r.logo,
        })),
      },
      {
        title: "Education",
        items: newestFirst(experience.education || []).map((e) => ({
          period: e.period,
          title: e.degree,
          org: e.school,
          note: e.note,
          logo: e.logo,
        })),
      },
    ].filter((column) => column.items.length);

    const grid = $("exp-grid");

    grid.style.setProperty("--cols", columns.length || 1);

    grid.innerHTML = columns
      .map((column, c) => {
        const place = (row) =>
          `style="--col:${c + 1};--row:${row}"`;

        const heading = `<h3 class="col-title" ${place(1)}>${esc(column.title)}</h3>`;

        const cards = column.items
          .map((s, i) => {
            const classes = [
              "exp-card",
              isCurrent(s.period) && "is-current",
              s.logo && "has-logo",
            ]
              .filter(Boolean)
              .join(" ");

            return `
              <article class="${classes}" ${place(i + 2)}>
                ${
                  s.logo
                    ? `<span class="exp-logo"><img src="${esc(localPath(s.logo))}" alt="" width="72" height="72"></span>`
                    : ""
                }
                <div class="exp-body">
                  <p class="exp-period">${esc(s.period)}</p>
                  <h4 class="exp-title">${esc(s.title)}</h4>
                  <p class="exp-org">${esc(s.org)}</p>
                  ${s.note ? `<p class="exp-note">${esc(s.note)}</p>` : ""}
                </div>
              </article>`;
          })
          .join("");

        return heading + cards;
      })
      .join("");

    // If a logo file isn't in the repo, just leave it out.
    $$(".exp-logo img").forEach((img) => {
      const drop = () => {
        img.closest(".exp-card")?.classList.remove("has-logo");
        img.parentElement.remove();
      };

      img.addEventListener("error", drop);

      if (img.complete && img.naturalWidth === 0) {
        drop();
      }
    });
  }

  // Portfolio: one card per project.
  // Supports multiple links through "links" and the older single "link" property.
  function renderPortfolio(projects) {
    const list = (projects || []).filter((p) => p && p.name);

    if (!list.length) {
      $("portfolio").hidden = true;
      return;
    }

    $("portfolio").hidden = false;

    $("project-grid").innerHTML = list
      .map((p) => {
        // Prefer the new links array.
        // Fall back to the older single link property if needed.
        const links = Array.isArray(p.links)
          ? p.links.filter((link) => link && link.url)
          : p.link
            ? [{ label: "View project", url: p.link }]
            : [];

        const linksHTML = links.length
          ? `
            <div class="project-links">
              ${links
                .map(
                  (link) => `
                    <a
                      class="project-link"
                      href="${esc(link.url)}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >${esc(link.label || "View project")}</a>
                  `
                )
                .join("")}
            </div>
          `
          : "";

        return `
          <article class="project-card">
            <h3 class="project-name">${esc(p.name)}</h3>
            ${
              p.description
                ? `<p class="project-desc">${esc(p.description)}</p>`
                : ""
            }
            ${linksHTML}
          </article>`;
      })
      .join("");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const area = document.createElement("textarea");

        area.value = text;
        area.setAttribute("readonly", "");
        area.style.cssText = "position:fixed;opacity:0";

        document.body.appendChild(area);
        area.select();

        const ok = document.execCommand("copy");
        area.remove();

        return ok;
      } catch {
        return false;
      }
    }
  }

  function renderContact(p, contact) {
    $("contact-intro").textContent = contact.intro || "";

    if (p.email) {
      $("email-value").textContent = p.email;
    } else {
      $("email-row").hidden = true;
    }

    if (p.linkedin) {
      $("linkedin-value").textContent = linkedinId(p.linkedin);
    } else {
      $("linkedin-row").hidden = true;
    }

    const button = $("copy-email");
    const label = $("copy-label");

    let timer;

    button.addEventListener("click", async () => {
      const ok = await copyText(p.email);

      button.classList.toggle("is-copied", ok);

      label.textContent = ok ? "Copied" : "Copy failed";

      $("copy-status").textContent = ok
        ? "Email address copied"
        : "Couldn't copy. The address is shown on the button.";

      clearTimeout(timer);

      timer = setTimeout(() => {
        button.classList.remove("is-copied");
        label.textContent = "Copy email";
      }, 2000);
    });
  }

  function render(data) {
    const p = data.persona || {};

    if (p.name && p.role) {
      document.title = `${p.name} | ${p.role}`;
    }

    const description = document.querySelector(
      'meta[name="description"]'
    );

    if (description && p.subheadline) {
      description.content = p.subheadline;
    }

    $("footer-name").textContent = p.name || "";
    $("year").textContent = new Date().getFullYear();

    renderLinks(p);
    renderHeader(p);
    renderHero(p);
    renderCloud(data.wordCloud);
    renderAbout(data.aboutCopy || {}, p);
    renderPath(data.experience || {});
    renderPortfolio(data.portfolio);
    renderContact(p, data.contactCopy || {});

    document.body.classList.add("is-ready");
  }

  fetch(CONTENT_URL, { cache: "no-cache" })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return res.json();
    })
    .then(render)
    .catch((err) => {
      console.error("Could not load content:", err);

      document.body.classList.add("has-error");
      $("load-error").hidden = false;
    });
})();
