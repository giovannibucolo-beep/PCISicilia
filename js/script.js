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
      /* NOTA: per ricevere davvero le richieste, collega il form a un
         servizio email (es. Formspree): imposta form action/method o
         una fetch() verso l'endpoint. Per ora mostra conferma a schermo. */
      msg.textContent = "Grazie " + nome + "! La tua richiesta è stata registrata: ti ricontatteremo presto.";
      msg.className = "form-msg ok";
      form.reset();
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
