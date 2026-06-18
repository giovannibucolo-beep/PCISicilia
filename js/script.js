/* ============================================================
   PCI Sicilia — script
   ============================================================ */

/* --- Configurazione ---------------------------------------
   URL "pulito" della pagina Facebook ufficiale.
   Aggiornare anche il data-href del blocco .fb-page in index.html
----------------------------------------------------------- */
window.FB_PAGE_URL = "https://www.facebook.com/profile.php?id=61576921137339";

document.addEventListener("DOMContentLoaded", function () {

  /* Anno corrente nel footer */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
  document.querySelectorAll(".js-year").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* Menu mobile */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Tab eventi (prossimi / passati) */
  var tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-tab");
      tabBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
      document.querySelectorAll("[data-panel]").forEach(function (p) {
        p.hidden = (p.getAttribute("data-panel") !== target);
      });
    });
  });

  /* Form iscrizione (demo lato client) */
  var form = document.getElementById("joinForm");
  var msg = document.getElementById("formMsg");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = form.nome.value.trim();
      var email = form.email.value.trim();
      var privacy = form.privacy.checked;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!nome || !emailOk || !privacy) {
        msg.textContent = "Compila nome, email valida e accetta il consenso.";
        msg.className = "form-msg err";
        return;
      }
      /* Invio tramite Netlify Forms: le richieste arrivano nel pannello
         Netlify (Forms) e possono essere inoltrate via email. */
      msg.textContent = "Invio in corso…";
      msg.className = "form-msg";
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          msg.textContent = "Grazie " + nome + "! La tua richiesta è stata inviata: ti ricontatteremo presto.";
          msg.className = "form-msg ok";
          form.reset();
        })
        .catch(function () {
          msg.textContent = "Grazie " + nome + "! Richiesta registrata. (In anteprima locale l'invio non parte: funzionerà una volta online.)";
          msg.className = "form-msg ok";
          form.reset();
        });
    });
  }

  loadContent();
  loadFacebookSDK();
});

/* ============================================================
   Contenuti gestiti dal pannello (/admin) — file in /data/*.json
   Se il fetch fallisce (es. apertura locale via file://), restano
   i contenuti già presenti nell'HTML come fallback.
   ============================================================ */
function loadContent() {
  fetchJSON("data/news.json", renderNews);
  fetchJSON("data/eventi.json", renderEventi);
  fetchJSON("data/galleria.json", renderGalleria);
  fetchJSON("data/home.json", renderHome);
  fetchJSON("data/storia.json", renderStoria);
  fetchJSON("data/organismi.json", renderOrganismi);
  fetchJSON("data/contatti.json", renderContatti);
}

function renderContatti(d) {
  if (!d) return;
  var el = document.getElementById("footer-contatti");
  if (!el) return;
  var items = "";
  if (d.email) items += '<li>✉️ <a href="mailto:' + esc(d.email) + '">' + esc(d.email) + "</a></li>";
  if (d.facebook) items += '<li>📘 <a href="' + esc(d.facebook) + '" target="_blank" rel="noopener">Pagina Facebook</a></li>';
  if (d.citta) items += "<li>📍 " + esc(d.citta) + "</li>";
  if (items) el.innerHTML = items;
}

/* accetta sia stringhe semplici sia oggetti {testo:"..."} dal pannello */
function asText(x) {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") return x.testo || x.valore || x.text || "";
  return "";
}

/* evidenzia in oro le parole racchiuse tra asterischi: *parola* */
function hl(s) {
  return esc(s).replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');
}

function setText(id, value) {
  var el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}

function renderHome(d) {
  if (!d) return;
  if (d.hero) {
    var h = document.getElementById("hero-text");
    if (h) h.innerHTML =
      '<span class="eyebrow">' + esc(d.hero.eyebrow) + "</span>" +
      "<h1>" + hl(d.hero.titolo) + "</h1>" +
      '<p class="lead">' + esc(d.hero.lead) + "</p>" +
      '<div class="hero-actions">' +
        '<a href="#iscriviti" class="btn btn-gold">' + esc(d.hero.btn_primario) + "</a>" +
        '<a href="#news" class="btn btn-ghost-light">' + esc(d.hero.btn_secondario) + "</a>" +
      "</div>";
  }
  if (d.banner) {
    var b = document.getElementById("banner-tesseramento");
    if (b) b.innerHTML =
      "<strong>" + esc(d.banner.titolo) + "</strong>" +
      "<span>" + esc(d.banner.testo) + "</span>" +
      '<a href="#iscriviti" class="btn btn-sm btn-gold">' + esc(d.banner.bottone) + "</a>";
  }
  if (d.valori) {
    var v = document.getElementById("valori-grid");
    if (v) v.innerHTML = d.valori.map(function (x) {
      return '<article class="value reveal in"><div class="value-num">' + esc(x.numero) +
        "</div><h3>" + esc(x.titolo) + "</h3><p>" + esc(x.testo) + "</p></article>";
    }).join("");
  }
  if (d.chisiamo) {
    var c = document.getElementById("chisiamo-text");
    if (c) {
      var par = (d.chisiamo.paragrafi || []).map(function (p) { return "<p>" + esc(asText(p)) + "</p>"; }).join("");
      var punti = (d.chisiamo.punti || []).map(function (p) { return "<li>" + esc(asText(p)) + "</li>"; }).join("");
      c.innerHTML =
        '<span class="kicker">' + esc(d.chisiamo.kicker) + "</span>" +
        "<h2>" + esc(d.chisiamo.titolo) + "</h2>" + par +
        '<ul class="check-list">' + punti + "</ul>" +
        '<a href="storia.html" class="btn btn-solid">La nostra storia</a> ' +
        '<a href="organismi.html" class="btn btn-ghost">Organismi dirigenti</a>';
    }
  }
  if (d.statistiche) {
    var s = document.getElementById("chisiamo-stats");
    if (s) {
      var stats = d.statistiche.map(function (x) {
        return '<div class="stat"><strong>' + esc(x.numero) + "</strong><span>" + esc(x.etichetta) + "</span></div>";
      }).join("");
      var q = d.citazione ? "<blockquote>" + esc(d.citazione.testo) + " <cite>" + esc(d.citazione.fonte) + "</cite></blockquote>" : "";
      s.innerHTML = stats + q;
    }
  }
}

function renderStoria(d) {
  if (!d) return;
  if (d.intro) {
    setText("storia-titolo", d.intro.titolo);
    setText("storia-sottotitolo", d.intro.sottotitolo);
  }
  var t = document.getElementById("storia-timeline");
  if (t && d.tappe && d.tappe.length) {
    t.innerHTML = d.tappe.map(function (x) {
      return '<div class="tl-item reveal in"><div class="tl-year">' + esc(x.anno) +
        "</div><h3>" + esc(x.titolo) + "</h3><p>" + esc(x.testo) + "</p></div>";
    }).join("");
  }
}

function renderOrganismi(d) {
  if (!d) return;
  if (d.intro) {
    setText("org-titolo", d.intro.titolo);
    setText("org-sottotitolo", d.intro.sottotitolo);
  }
  if (d.segretario) {
    var sg = document.getElementById("org-segretario");
    if (sg) {
      var foto = d.segretario.foto
        ? '<div class="org-photo"><img src="' + esc(d.segretario.foto) + '" alt="' + esc(d.segretario.nome) + '" /></div>'
        : '<div class="org-photo"><span>Foto</span></div>';
      var mail = d.segretario.email ? '<p class="footer-small">✉️ <a href="mailto:' + esc(d.segretario.email) + '">' + esc(d.segretario.email) + "</a></p>" : "";
      sg.innerHTML = foto +
        "<div>" +
          '<div class="org-role">' + esc(d.segretario.ruolo) + "</div>" +
          '<div class="org-name">' + esc(d.segretario.nome) + "</div>" +
          "<p>" + esc(d.segretario.profilo) + "</p>" + mail +
        "</div>";
    }
  }
  var dir = document.getElementById("org-direzione");
  if (dir && d.direzione) {
    dir.innerHTML = d.direzione.map(function (x) {
      var av = x.foto ? '<div class="av" style="background-image:url(' + esc(x.foto) + ');background-size:cover"></div>' : '<div class="av">★</div>';
      return '<div class="org-card reveal in">' + av + "<h4>" + esc(x.nome) + "</h4><span>" + esc(x.delega) + "</span></div>";
    }).join("");
  }
  var com = document.getElementById("org-comitato");
  if (com && d.comitato) {
    com.innerHTML = d.comitato.map(function (x) {
      return '<div class="org-card reveal in"><div class="av">' + esc(x.sigla) + "</div><h4>" + esc(x.nome) + "</h4><span>" + esc(x.citta) + "</span></div>";
    }).join("");
  }
}

function fetchJSON(url, cb) {
  try {
    fetch(url, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { try { cb(data); } catch (e) {} })
      .catch(function () { /* fallback: lascia l'HTML esistente */ });
  } catch (e) {}
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c];
  });
}

function renderNews(data) {
  var box = document.getElementById("news-cards");
  if (!box || !data || !data.items || !data.items.length) return;
  box.innerHTML = data.items.map(function (n) {
    var link = n.link ? '<a href="' + esc(n.link) + '" target="_blank" rel="noopener" class="news-link">' + esc(n.etichetta_link || "Leggi →") + "</a>" : "";
    return '<article class="news-card reveal in">' +
      '<div class="news-meta"><span class="news-tag">' + esc(n.tag) + '</span><span class="news-date">' + esc(n.data) + "</span></div>" +
      "<h3>" + esc(n.titolo) + "</h3><p>" + esc(n.testo) + "</p>" + link + "</article>";
  }).join("");
}

function eventCard(ev, past) {
  var link = ev.link ? '<a href="' + esc(ev.link) + '" target="_blank" rel="noopener" class="btn btn-sm btn-ghost">' + esc(ev.etichetta_link || "Info") + "</a>"
                     : '<a href="#contatti" class="btn btn-sm btn-ghost">Info</a>';
  return '<article class="event reveal in">' +
    '<div class="event-date' + (past ? " past" : "") + '"><span class="d">' + esc(ev.giorno) + '</span><span class="m">' + esc(ev.mese) + "</span></div>" +
    '<div class="event-body"><h3>' + esc(ev.titolo) + '</h3><p class="event-meta">' + esc(ev.luogo) + "</p><p>" + esc(ev.descrizione) + "</p></div>" +
    link + "</article>";
}

function renderEventi(data) {
  if (!data) return;
  var p = document.getElementById("eventi-prossimi");
  var q = document.getElementById("eventi-passati");
  if (p && data.prossimi && data.prossimi.length) p.innerHTML = data.prossimi.map(function (e) { return eventCard(e, false); }).join("");
  if (q && data.passati && data.passati.length) q.innerHTML = data.passati.map(function (e) { return eventCard(e, true); }).join("");
}

function renderGalleria(data) {
  var grid = document.getElementById("galleria-grid");
  if (!grid || !data || !data.foto || !data.foto.length) return;
  var shapes = ["wide", "tall", "", "", "", "wide"];
  grid.innerHTML = data.foto.map(function (f, i) {
    var shape = shapes[i % shapes.length];
    var inner = f.immagine
      ? '<img src="' + esc(f.immagine) + '" alt="' + esc(f.titolo) + '" /><div class="cap">' + esc(f.titolo) + "</div>"
      : '<div class="gallery-empty"><span>' + esc(f.titolo || "Foto") + "</span></div>";
    return '<div class="gallery-item ' + shape + '">' + inner + "</div>";
  }).join("");
}

function loadFacebookSDK() {
  if (!document.querySelector(".fb-page")) return;
  if (document.getElementById("facebook-jssdk")) return;
  var js = document.createElement("script");
  js.id = "facebook-jssdk";
  js.async = true; js.defer = true; js.crossOrigin = "anonymous";
  js.src = "https://connect.facebook.net/it_IT/sdk.js#xfbml=1&version=v19.0";
  js.onerror = showFbFallback;
  document.body.appendChild(js);
  setTimeout(function () {
    var wrap = document.querySelector(".fb-embed-wrap");
    if (wrap && !wrap.querySelector("iframe")) showFbFallback();
  }, 4500);
}

function showFbFallback() {
  var wrap = document.querySelector(".fb-embed-wrap");
  if (!wrap || wrap.dataset.fallback === "1") return;
  wrap.dataset.fallback = "1";
  var url = window.FB_PAGE_URL || "https://www.facebook.com";
  wrap.innerHTML =
    '<p class="fb-fallback">Gli ultimi post non si caricano qui (controlla l\'URL della pagina o le impostazioni del browser). ' +
    '<a href="' + url + '" target="_blank" rel="noopener">Apri la pagina Facebook →</a></p>';
}
