// HHHGroup — logique du site (sans serveur)
(function () {
  "use strict";
  var C = window.HHH_CONFIG;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  // ---------- Textes communs ----------
  $$("[data-ville]").forEach(function (el) { el.textContent = C.ville; });
  $$("[data-delai]").forEach(function (el) { el.textContent = C.delaiStandard; });
  $$("[data-devise]").forEach(function (el) { el.textContent = C.devise; });
  $$("[data-paiements]").forEach(function (el) { el.textContent = C.moyensPaiement.join(", "); });
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  var waF = $("#waFooter"); if (waF) waF.href = "https://wa.me/" + C.whatsapp;

  function money(n) {
    return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + C.devise;
  }
  function cdf(n) {
    return "≈ " + Math.round(n * C.tauxCDF).toLocaleString("fr-FR") + " FC";
  }

  // ---------- Calcul du prix (une seule fonction, testable) ----------
  function calculer(o) {
    var produit = Math.max(0, o.prix) * Math.max(1, o.quantite);
    var service = produit * C.fraisServicePct;
    var poids = Math.max(C.poidsMinKg, (o.poids || 0) * Math.max(1, o.quantite));
    var transport = poids * C.transportParKg;
    var livraison = (C.livraison[o.livraison] || C.livraison.domicile).prix;
    var total = produit + service + transport + livraison;
    return { produit: produit, service: service, transport: transport, livraison: livraison, total: total, poids: poids };
  }
  window.HHH_calculer = calculer;

  // ---------- Numéro de commande ----------
  function numeroCommande() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    var r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "HHH-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + r;
  }

  // ---------- Formulaire de commande ----------
  var form = $("#orderForm");
  if (form) {
    var fSel = $("#fournisseur");
    C.fournisseurs.forEach(function (f) { fSel.add(new Option(f, f)); });
    var pSel = $("#paiement");
    C.moyensPaiement.forEach(function (m) { pSel.add(new Option(m, m)); });
    var lg = $("#livraisonGroup");
    Object.keys(C.livraison).forEach(function (k, i) {
      var l = C.livraison[k];
      var lab = document.createElement("label");
      lab.innerHTML = '<input type="radio" name="livraison" value="' + k + '"' + (i === 0 ? " checked" : "") + "> " +
        l.label + " (+" + money(l.prix) + ")";
      lg.appendChild(lab);
    });

    // Devine le site à partir du lien
    $("#lien").addEventListener("input", function () {
      var v = this.value.toLowerCase();
      var m = C.fournisseurs.filter(function (f) { return v.indexOf(f.toLowerCase()) !== -1; })[0];
      if (m) fSel.value = m;
    });

    function lire() {
      return {
        lien: $("#lien").value.trim(),
        fournisseur: fSel.value,
        quantite: parseInt($("#quantite").value, 10) || 1,
        prix: parseFloat($("#prix").value) || 0,
        poids: parseFloat($("#poids").value) || 0,
        details: $("#details").value.trim(),
        livraison: (form.querySelector('input[name="livraison"]:checked') || {}).value || "domicile",
        nom: $("#nom").value.trim(),
        tel: $("#tel").value.trim(),
        paiement: pSel.value,
        adresse: $("#adresse").value.trim()
      };
    }

    function afficher() {
      var o = lire();
      var c = calculer(o);
      $("#adresseField").style.display = o.livraison === "relais" ? "none" : "";
      if (!o.prix) {
        $("#totalUsd").textContent = "—";
        $("#totalCdf").textContent = "Entre le prix du produit";
        $("#breakdown").innerHTML = "";
        return;
      }
      $("#totalUsd").textContent = money(c.total);
      $("#totalCdf").textContent = cdf(c.total);
      $("#breakdown").innerHTML =
        "<li><span>Produit</span><span>" + money(c.produit) + "</span></li>" +
        "<li><span>Service HHHGroup</span><span>" + money(c.service) + "</span></li>" +
        "<li><span>Transport & douane (" + c.poids.toFixed(1) + " kg)</span><span>" + money(c.transport) + "</span></li>" +
        "<li><span>Livraison locale</span><span>" + money(c.livraison) + "</span></li>";
    }
    form.addEventListener("input", afficher);
    form.addEventListener("change", afficher);
    afficher();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var o = lire();
      var msg = $("#formMsg");
      var manque = [];
      if (!/^https?:\/\//i.test(o.lien)) manque.push("le lien du produit");
      if (!o.prix) manque.push("le prix");
      if (!o.nom) manque.push("ton nom");
      if (o.tel.replace(/\D/g, "").length < 9) manque.push("ton numéro WhatsApp");
      if (o.livraison === "domicile" && !o.adresse) manque.push("ton adresse");
      if (manque.length) {
        msg.className = "msg err"; msg.style.display = "block";
        msg.textContent = "Il manque : " + manque.join(", ") + ".";
        return;
      }
      var c = calculer(o);
      var num = numeroCommande();

      // Sauvegarde locale pour la page de suivi
      try {
        var all = JSON.parse(localStorage.getItem("hhh_commandes") || "{}");
        all[num] = { date: new Date().toISOString(), etape: 0, total: c.total, fournisseur: o.fournisseur };
        localStorage.setItem("hhh_commandes", JSON.stringify(all));
      } catch (err) { /* stockage indisponible : pas grave */ }

      var texte =
        "Bonjour HHHGroup, nouvelle commande\n" +
        "N° : " + num + "\n" +
        "Produit : " + o.lien + "\n" +
        "Site : " + o.fournisseur + " · Qté : " + o.quantite + "\n" +
        (o.details ? "Détails : " + o.details + "\n" : "") +
        "Prix total annoncé : " + money(c.total) + " (" + cdf(c.total) + ")\n" +
        "Livraison : " + C.livraison[o.livraison].label + (o.adresse && o.livraison === "domicile" ? " — " + o.adresse : "") + "\n" +
        "Paiement : " + o.paiement + "\n" +
        "Nom : " + o.nom + " · Tél : " + o.tel;

      msg.className = "msg"; msg.style.display = "block";
      msg.innerHTML = "Ta commande <strong>" + num + "</strong> est prête. WhatsApp s'ouvre pour l'envoyer. Garde ce numéro pour le suivi.";
      window.open("https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(texte), "_blank");
    });
  }

  // ---------- Suivi ----------
  var ETAPES = [
    ["Commande reçue", "On vérifie le produit et le prix."],
    ["Paiement confirmé", "Paiement Mobile Money reçu."],
    ["Achat chez le fournisseur", "Notre équipe passe la commande."],
    ["En transit international", "Le colis voyage vers le Congo."],
    ["Dédouanement", "Formalités en cours, on gère tout."],
    ["En livraison", "Le livreur arrive ou le colis est au point relais."],
    ["Livré", "Bonne utilisation !"]
  ];
  window.HHH_ETAPES = ETAPES;

  var trackForm = $("#trackForm");
  if (trackForm) {
    trackForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var num = $("#num").value.trim().toUpperCase();
      var out = $("#trackOut");
      var all = {};
      try { all = JSON.parse(localStorage.getItem("hhh_commandes") || "{}"); } catch (err) {}
      var cmd = all[num];
      if (!cmd) {
        out.innerHTML = '<div class="msg err" style="display:block">Commande introuvable sur cet appareil. ' +
          'Écris-nous sur <a href="https://wa.me/' + C.whatsapp + "?text=" + encodeURIComponent("Bonjour, où en est ma commande " + num + " ?") +
          '" target="_blank">WhatsApp</a> avec ton numéro.</div>';
        return;
      }
      var html = '<p><strong>' + num + "</strong> · " + money(cmd.total) + " · passée le " +
        new Date(cmd.date).toLocaleDateString("fr-FR") + '</p><ul class="timeline">';
      ETAPES.forEach(function (s, i) {
        var cls = i < cmd.etape ? "done" : i === cmd.etape ? "now" : "";
        html += '<li class="' + cls + '"><span class="dot"></span><strong>' + s[0] + "</strong><span>" + s[1] + "</span></li>";
      });
      out.innerHTML = html + "</ul>";
    });
  }
})();
