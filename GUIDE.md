# 🚀 ARCHIBRIX WEBHOOK — Guide de déploiement

## Ce que fait ce script
Dès qu'un lead arrive via Formspree :
1. ✅ Crée une carte Trello dans "Prospects" avec description complète + label auto + checklists
2. ✅ Crée un dossier ENTREPRISE dans Google Drive/OPERATIONS avec toute la structure

---

## ÉTAPE 1 — Créer les labels Trello

Va sur ton Board 1 dans Trello → clic sur un label → crée ces 3 labels et note leurs IDs :

Pour récupérer les IDs des labels, colle cette URL dans ton navigateur :
```
https://api.trello.com/1/boards/GTsyDaE5/labels?key=84bdaa540e5a927b0203e24cd3e2c82b&token=ATTA642e291e76adf59897cce4ac971066d7e36d15cb350d8d2066eb81b8281cadadBCE48B56
```

Crée 3 labels :
- 🟡 Cadeaux Client (jaune)
- 🔵 Maquettes de Projets (bleu)
- 🟢 Expérience d'Entreprises (vert)

---

## ÉTAPE 2 — Créer un Service Account Google

1. Va sur https://console.cloud.google.com
2. Crée un nouveau projet "Archibrix"
3. Active l'API Google Drive
4. Crée un Service Account → télécharge le fichier JSON
5. Dans Google Drive, partage le dossier OPERATIONS avec l'email du service account (ex: archibrix@archibrix.iam.gserviceaccount.com) en mode "Éditeur"

---

## ÉTAPE 3 — Déployer sur Vercel

### Option A — Via GitHub (recommandé)
1. Crée un repo GitHub "archibrix-webhook"
2. Push les fichiers (api/webhook.js, package.json, vercel.json)
3. Connecte le repo sur vercel.com → Deploy

### Option B — Via Vercel CLI
```bash
npm i -g vercel
cd archibrix-webhook
vercel --prod
```

---

## ÉTAPE 4 — Configurer les variables d'environnement sur Vercel

Dans Vercel → Settings → Environment Variables, tu n'as qu'**une seule variable** à ajouter :

| Variable | Valeur |
|----------|--------|
| GOOGLE_SERVICE_ACCOUNT | (contenu JSON du service account, sur une seule ligne) |

Tout le reste (Trello, Drive) est déjà codé en dur dans le script ✅

---

## ÉTAPE 5 — Connecter Formspree au webhook

1. Va sur formspree.io → ton formulaire (endpoint meerelnw)
2. Settings → Integrations → Webhooks
3. Ajoute l'URL : https://ton-projet.vercel.app/api/webhook
4. Teste avec un faux lead

---

## ÉTAPE 6 — Tester

Envoie un lead test depuis archibrix.net et vérifie :
- ✅ Carte créée dans Trello avec description + checklists + label
- ✅ Dossier ENTREPRISE créé dans Drive avec toute la structure

---

## Structure Drive créée automatiquement

```
OPERATIONS/
└── NOMCLIENT/
    ├── 1_VENTE/
    ├── 2_PRODUITS/
    │   ├── Modèle_IO/
    │   ├── Partlist/
    │   ├── Render/
    │   └── Instructions/
    ├── 3_PACKAGING/
    │   ├── Boite/
    │   └── Carte_QR/
    └── 4_LIVRAISON/
```
