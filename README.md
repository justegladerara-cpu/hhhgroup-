# HHHGroup — Site web v1

> « Tu choisis, tu paies, nous nous occupons du reste. »

Site de commande internationale au Congo-Brazzaville, ouvert ensuite à toute l'Afrique.
Le client colle le lien d'un produit (SHEIN, AliExpress, Amazon…), voit **un seul prix tout compris**, puis envoie sa commande sur **WhatsApp Business**. Le paiement se fait en **Mobile Money**.

Ce site suit la roadmap du business plan (jours 30-60 : « plateforme web v1 »). Il est volontairement simple : pas de serveur, pas d'application mobile. La technologie suit la validation.

## Pages

| Page | Rôle |
|---|---|
| `index.html` | Accueil animé, catégories, comment ça marche, comparatif, commande en 3 étapes avec prix en FCFA en direct, FAQ |
| `suivi.html` | Suivi d'une commande par numéro (7 étapes) |

## Réglages — `assets/config.js`

Tout se règle dans ce fichier : pays, numéro WhatsApp, frais de service, transport par kg, livraison, taux EUR/USD → FCFA, moyens de paiement (MTN Mobile Money, Airtel Money).

⚠️ **Valeurs de test.** Le business plan dit : ne pas fixer le prix final avant 20-30 commandes. À valider avant la mise en ligne :

- [ ] Vrai numéro WhatsApp Business (`whatsapp`)
- [ ] Frais de service (`fraisServicePct`, cible 30-40 %)
- [ ] Coût transport + douane par kg (selon le transitaire signé)
- [ ] Prix de livraison locale
- [ ] Taux USD → FCFA (l'euro est à parité fixe)

## Mettre en ligne (GitHub Pages)

1. Sur GitHub : **Settings → Pages**
2. Source : **Deploy from a branch** → `main` / `/ (root)`
3. Le site sera sur `https://justegladerara-cpu.github.io/hhhgroup-/`

## Limites de la v1

- Le suivi lit les commandes **enregistrées sur le téléphone du client** (localStorage). Le vrai suivi passe par WhatsApp. Une v2 avec base de données (ex. Supabase) permettra à l'équipe de mettre à jour les étapes.
- Le paiement Mobile Money n'est pas encore intégré : le numéro de paiement est envoyé sur WhatsApp après confirmation.

## Prochaines étapes (v2)

- Base de données des commandes + mini back-office équipe (changer l'étape d'une commande)
- Notifications WhatsApp/SMS automatiques
- Intégration paiement Mobile Money (agrégateur local)
