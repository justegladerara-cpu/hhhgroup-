// HHHGroup — logique du site (sans serveur)
(function () {
  "use strict";
  var C = window.HHH_CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var POIDS = [
    { label: "Vêtement", kg: 0.3 }, { label: "Chaussures", kg: 1 }, { label: "Sac", kg: 0.6 },
    { label: "Beauté", kg: 0.3 }, { label: "Tech", kg: 0.5 }, { label: "Maison", kg: 1.5 }
  ];
  var ETAPES = [
    ["Commande reçue", "On vérifie le produit et le prix."],
    ["Paiement confirmé", "Paiement Mobile Money reçu."],
    ["Achat chez le fournisseur", "Notre équipe passe la commande."],
    ["En transit international", "Ton colis voyage vers toi."],
    ["Dédouanement", "Formalités en cours, on gère tout."],
    ["En livraison", "Le livreur arrive ou le colis est au point relais."],
    ["Livré", "Bonne utilisation !"]
  ];
  window.HHH_ETAPES = ETAPES;

  // ---------- Textes communs ----------
  var waBase = "https://wa.me/" + C.whatsapp;
  $$("[data-pays]").forEach(function (el) { el.textContent = C.pays; });
  $$("[data-delai]").forEach(function (el) { el.textContent = C.delaiStandard; });
  $$("[data-paiements]").forEach(function (el) { el.textContent = C.moyensPaiement.join(" ou "); });
  $$("[data-sites]").forEach(function (el) { el.textContent = C.fournisseurs.filter(function (f) { return f !== "Autre"; }).join(", "); });
  $$("[data-wa]").forEach(function (el) { el.href = waBase; });
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  function fcfa(n) { return Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ") + " FCFA"; }

  // ---------- Header ----------
  var header = $("#top");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var burger = $("#burger"), menu = $("#menu");
  if (burger) {
    burger.addEventListener("click", function () { menu.classList.toggle("open"); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { menu.classList.remove("open"); }); });
  }

  // ---------- Apparition au scroll ----------
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else { $$(".reveal").forEach(function (el) { el.classList.add("in"); }); }

  // ---------- Mot qui tourne ----------
  var rot = $("#rotator");
  if (rot) {
    var mots = C.fournisseurs.filter(function (f) { return f !== "Autre"; }), mi = 0;
    setInterval(function () { mi = (mi + 1) % mots.length; rot.innerHTML = '<span class="grad-text">' + mots[mi] + "</span>"; }, 2200);
  }

  // ---------- Bandeau défilant ----------
  var mq = $("#marquee");
  if (mq) {
    var items = C.fournisseurs.filter(function (f) { return f !== "Autre"; }).concat(["Mobile Money", "Livraison à domicile", "Point relais", "Prix tout compris"]);
    var html = items.map(function (t) { return "<span>" + t + "</span><span>✦</span>"; }).join("");
    mq.innerHTML = html + html;
  }

  // ---------- Téléphone animé (exemple) ----------
  var track = $("#mockTrack");
  if (track) {
    var st = $$(".st", track), toast = $("#mockToast"), toastTxt = $("#mockToastText"), k = 0;
    $("#mockPrice").textContent = fcfa(calculer({ prix: 15, devise: "EUR", quantite: 1, poids: 0.3, livraison: "domicile" }).total);
    setInterval(function () {
      if (k >= st.length) { st.forEach(function (s) { s.classList.remove("on"); }); k = 0; toast.classList.add("hide"); return; }
      st[k].classList.add("on");
      toastTxt.textContent = st[k].textContent.trim() + " ✅";
      toast.classList.remove("hide");
      k++;
    }, 1400);
  }

  // ---------- Calcul du prix (en FCFA) ----------
  function calculer(o) {
    var taux = (C.devisesProduit[o.devise] || C.devisesProduit.EUR).taux;
    var q = Math.max(1, o.quantite || 1);
    var produit = Math.max(0, o.prix || 0) * q * taux;
    var service = produit * C.fraisServicePct;
    var poids = Math.max(C.poidsMinKg, (o.poids || 0) * q);
    var transport = poids * C.transportParKg;
    var livraison = (C.livraison[o.livraison] || C.livraison.domicile).prix;
    return { produit: produit, service: service, transport: transport, livraison: livraison, poids: poids,
             total: produit + service + transport + livraison };
  }
  window.HHH_calculer = calculer;

  function numeroCommande() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, "0"); };
    return "HHH-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  // ---------- Formulaire en 3 étapes ----------
  var form = $("#orderForm");
  if (form) {
    var etat = { site: C.fournisseurs[0], poids: 0.3, typeArticle: "Vêtement", livraison: "domicile", paiement: C.moyensPaiement[0] };

    function chips(box, list, key, getVal, getLabel) {
      box.innerHTML = "";
      list.forEach(function (it) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "chip"; b.textContent = getLabel(it);
        if (getVal(it) === etat[key]) b.classList.add("on");
        b.addEventListener("click", function () {
          etat[key] = getVal(it);
          $$(".chip", box).forEach(function (c) { c.classList.remove("on"); });
          b.classList.add("on"); maj();
        });
        box.appendChild(b);
      });
    }
    var id = function (x) { return x; };
    chips($("#sites"), C.fournisseurs, "site", id, id);
    chips($("#poidsChips"), POIDS, "typeArticle", function (p) { return p.label; }, function (p) { return p.label; });
    chips($("#paiements"), C.moyensPaiement, "paiement", id, id);

    var dSel = $("#deviseProduit");
    Object.keys(C.devisesProduit).forEach(function (k) { dSel.add(new Option(C.devisesProduit[k].label, k)); });

    var lv = $("#livraisons");
    Object.keys(C.livraison).forEach(function (k) {
      var l = C.livraison[k];
      var lab = document.createElement("label");
      lab.innerHTML = '<input type="radio" name="livraison" value="' + k + '"><b>' + l.label + "</b><small>" + l.detail + " · +" + fcfa(l.prix) + "</small>";
      if (k === etat.livraison) { lab.classList.add("on"); lab.firstChild.checked = true; }
      lab.addEventListener("click", function () {
        etat.livraison = k; $$("label", lv).forEach(function (x) { x.classList.remove("on"); }); lab.classList.add("on"); maj();
      });
      lv.appendChild(lab);
    });

    // Quantité +/-
    $$("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () {
        var q = $("#quantite"); q.value = Math.max(1, (parseInt(q.value, 10) || 1) + parseInt(b.dataset.q, 10)); maj();
      });
    });

    // Reconnaît le site depuis le lien
    function deviner(lien) {
      var v = (lien || "").toLowerCase();
      var m = C.fournisseurs.filter(function (f) { return f !== "Autre" && v.indexOf(f.toLowerCase()) !== -1; })[0];
      if (!m && /^https?:\/\//.test(v)) m = "Autre";
      if (m && m !== etat.site) {
        etat.site = m;
        $$("#sites .chip").forEach(function (c) { c.classList.toggle("on", c.textContent === m); });
      }
    }
    $("#lien").addEventListener("input", function () { deviner(this.value); });

    function lire() {
      return {
        lien: $("#lien").value.trim(), fournisseur: etat.site,
        prix: parseFloat($("#prix").value) || 0, devise: dSel.value,
        quantite: parseInt($("#quantite").value, 10) || 1, poids: (POIDS.filter(function (p) { return p.label === etat.typeArticle; })[0] || POIDS[0]).kg,
        details: $("#details").value.trim(), livraison: etat.livraison,
        ville: $("#ville").value.trim(), adresse: $("#adresse").value.trim(),
        nom: $("#nom").value.trim(), tel: $("#tel").value.trim(), paiement: etat.paiement
      };
    }

    // Compteur animé
    var totalEl = $("#total"), affiche = 0, anim;
    function animer(cible) {
      cancelAnimationFrame(anim);
      var depart = affiche, t0 = performance.now();
      (function pas(t) {
        var p = Math.min(1, (t - t0) / 450); p = 1 - Math.pow(1 - p, 3);
        affiche = depart + (cible - depart) * p; totalEl.textContent = fcfa(affiche);
        if (p < 1) anim = requestAnimationFrame(pas);
      })(t0);
    }

    function maj() {
      var o = lire(), c = calculer(o);
      var rel = o.livraison === "relais";
      $("#adresseField2").style.display = rel ? "none" : "";
      $("#adresse").placeholder = rel ? "" : "ex : quartier, rue …";
      if (!o.prix) {
        animer(0);
        $("#breakdown").innerHTML = '<li><span>Entre le prix de ton article pour voir le détail.</span></li>';
        return;
      }
      animer(c.total);
      $("#breakdown").innerHTML =
        "<li><span>Produit × " + o.quantite + "</span><span>" + fcfa(c.produit) + "</span></li>" +
        "<li><span>Service HHHGroup</span><span>" + fcfa(c.service) + "</span></li>" +
        "<li><span>Transport & douane (" + c.poids.toFixed(1).replace(".", ",") + " kg)</span><span>" + fcfa(c.transport) + "</span></li>" +
        "<li><span>Livraison " + C.livraison[o.livraison].label.toLowerCase() + "</span><span>" + fcfa(c.livraison) + "</span></li>";
    }
    form.addEventListener("input", maj);
    form.addEventListener("change", maj);
    maj();

    // Navigation entre étapes
    var etape = 0, steps = $$(".stepper", form), bars = $$("#progress > div");
    function aller(n) {
      etape = n;
      steps.forEach(function (s, i) { s.classList.toggle("active", i === n); });
      bars.forEach(function (b, i) { b.className = i < n ? "done" : i === n ? "cur" : ""; });
      if (n === 3) bars.forEach(function (b) { b.className = "done"; });
    }
    function verifier(n) {
      var o = lire(), m = [];
      if (n === 0) {
        if (!/^https?:\/\/\S+\.\S+/i.test(o.lien)) m.push("le lien du produit");
        if (!o.prix) m.push("le prix");
      }
      if (n === 1 && !o.ville) m.push("ta ville");
      if (n === 1 && o.livraison === "domicile" && !o.adresse) m.push("ton adresse");
      if (n === 2) {
        if (!o.nom) m.push("ton nom");
        if (o.tel.replace(/\D/g, "").length < 9) m.push("ton numéro WhatsApp");
      }
      $('[data-err="' + n + '"]').textContent = m.length ? "Il manque : " + m.join(", ") + "." : "";
      return !m.length;
    }
    $$("[data-next]", form).forEach(function (b) { b.addEventListener("click", function () { if (verifier(etape)) aller(etape + 1); }); });
    $$("[data-prev]", form).forEach(function (b) { b.addEventListener("click", function () { aller(etape - 1); }); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!verifier(2)) return;
      var o = lire(), c = calculer(o), num = numeroCommande();
      try {
        var all = JSON.parse(localStorage.getItem("hhh_commandes") || "{}");
        all[num] = { date: new Date().toISOString(), etape: 0, total: c.total, fournisseur: o.fournisseur };
        localStorage.setItem("hhh_commandes", JSON.stringify(all));
      } catch (err) { /* stockage indisponible */ }

      var texte =
        "Bonjour HHHGroup, nouvelle commande\n" +
        "N° : " + num + "\n" +
        "Produit : " + o.lien + "\n" +
        "Site : " + o.fournisseur + " · Qté : " + o.quantite + "\n" +
        "Prix sur le site : " + o.prix + " " + o.devise + "\n" +
        (o.details ? "Détails : " + o.details + "\n" : "") +
        "Prix total annoncé : " + fcfa(c.total) + "\n" +
        "Livraison : " + C.livraison[o.livraison].label + " — " + o.ville + (o.adresse ? ", " + o.adresse : "") + "\n" +
        "Paiement : " + o.paiement + "\n" +
        "Nom : " + o.nom + " · Tél : " + o.tel;
      var url = waBase + "?text=" + encodeURIComponent(texte);
      $("#numOut").textContent = num;
      $("#waAgain").href = url;
      $("#trackLink").href = "suivi.html?n=" + encodeURIComponent(num);
      aller(3);
      window.open(url, "_blank");
    });

    // Lien collé dans le hero
    var hp = $("#heroPaste");
    if (hp) hp.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = $("#heroLink").value.trim();
      if (v) { $("#lien").value = v; deviner(v); }
      $("#commander").scrollIntoView({ behavior: "smooth" });
      setTimeout(function () { (v ? $("#prix") : $("#lien")).focus({ preventScroll: true }); }, 600);
    });

    // Catégories
    $$("[data-cat]").forEach(function (b) {
      b.addEventListener("click", function () {
        var cat = b.dataset.cat;
        if (POIDS.some(function (p) { return p.label === cat; })) {
          etat.typeArticle = cat;
          $$("#poidsChips .chip").forEach(function (c) { c.classList.toggle("on", c.textContent === cat); });
        }
        $("#details").value = cat + " — ";
        maj();
        $("#commander").scrollIntoView({ behavior: "smooth" });
        setTimeout(function () { $("#lien").focus({ preventScroll: true }); }, 600);
      });
    });
  }

  // ---------- Page suivi ----------
  var trackForm = $("#trackForm");
  if (trackForm) {
    var params = new URLSearchParams(location.search);
    function afficherSuivi(num) {
      var out = $("#trackOut"), all = {};
      try { all = JSON.parse(localStorage.getItem("hhh_commandes") || "{}"); } catch (err) {}
      var cmd = all[num];
      if (!cmd) {
        out.innerHTML = '<div class="alert">Commande introuvable sur ce téléphone. Écris-nous sur <a target="_blank" rel="noopener" href="' +
          waBase + "?text=" + encodeURIComponent("Bonjour, où en est ma commande " + num + " ?") + '">WhatsApp</a> avec ton numéro.</div>';
        return;
      }
      var h = '<div class="card" style="margin-top:20px"><p style="margin:0 0 4px"><strong>' + num + "</strong></p><p>" + fcfa(cmd.total) +
        " · passée le " + new Date(cmd.date).toLocaleDateString("fr-FR") + '</p><ul class="timeline">';
      ETAPES.forEach(function (s, i) {
        var cls = i < cmd.etape ? "done" : i === cmd.etape ? "now" : "";
        h += '<li class="' + cls + '"><span class="dot"></span><strong>' + s[0] + "</strong><span>" + s[1] + "</span></li>";
      });
      out.innerHTML = h + "</ul></div>";
    }
    trackForm.addEventListener("submit", function (e) { e.preventDefault(); afficherSuivi($("#num").value.trim().toUpperCase()); });
    if (params.get("n")) { $("#num").value = params.get("n"); afficherSuivi(params.get("n").toUpperCase()); }
  }
})();
