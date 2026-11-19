// =====================================================================
// HHHGroup — Réglages du site
// Toutes les valeurs ci-dessous sont des valeurs de TEST.
// Le business plan dit : ne pas fixer le prix final avant 20-30 commandes.
// => À valider par le porteur de projet avant mise en ligne réelle.
// =====================================================================
window.HHH_CONFIG = {
  marque: "HHHGroup",
  ville: "Kinshasa",

  // Numéro WhatsApp Business (format international, sans + ni espaces).
  // À REMPLACER par le vrai numéro.
  whatsapp: "243000000000",

  devise: "USD",
  // Taux indicatif pour afficher aussi le prix en francs congolais. À mettre à jour.
  tauxCDF: 2800,

  // Frais de service : 30 à 40 % cible (business plan, section 10). Valeur de test.
  fraisServicePct: 0.35,

  // Transport international + douane provisionnés, par kg (valeur de test).
  transportParKg: 12,
  poidsMinKg: 0.5,

  // Livraison locale (valeurs de test)
  livraison: {
    domicile: { label: "Livraison à domicile", prix: 3 },
    relais: { label: "Point relais (moins cher)", prix: 1 }
  },

  delaiStandard: "15 à 25 jours",

  moyensPaiement: ["M-Pesa", "Orange Money", "Airtel Money"],

  fournisseurs: ["SHEIN", "AliExpress", "Amazon", "Autre"]
};
