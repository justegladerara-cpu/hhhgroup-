// =====================================================================
// HHHGroup — Réglages du site
// Valeurs de TEST : à valider avant mise en ligne réelle.
// =====================================================================
window.HHH_CONFIG = {
  marque: "HHHGroup",
  pays: "Congo-Brazzaville",
  zone: "l'Afrique",

  // Numéro WhatsApp Business (format international, sans + ni espaces). À REMPLACER.
  whatsapp: "242000000000",

  // Le client paie en FCFA
  devise: "FCFA",
  // Devises dans lesquelles le client peut saisir le prix vu sur le site marchand
  devisesProduit: {
    EUR: { label: "€ Euro", taux: 655.957 },   // parité fixe
    USD: { label: "$ Dollar", taux: 600 }      // taux de test, à mettre à jour
  },

  // Frais de service : 30 à 40 % cible (business plan). Valeur de test.
  fraisServicePct: 0.35,

  // Transport international + douane provisionnés, en FCFA par kg (test)
  transportParKg: 7000,
  poidsMinKg: 0.5,

  // Livraison locale en FCFA (test)
  livraison: {
    domicile: { label: "À domicile", detail: "Livré chez toi", prix: 2000 },
    relais: { label: "Point relais", detail: "Moins cher", prix: 1000 }
  },

  delaiStandard: "15 à 25 jours",

  moyensPaiement: ["MTN Mobile Money", "Airtel Money"],

  fournisseurs: ["SHEIN", "AliExpress", "Amazon", "Temu", "Zara", "Autre"]
};
