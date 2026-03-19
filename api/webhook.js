// ============================================
// ARCHIBRIX WEBHOOK - Formspree → Trello + Google Drive
// Deploy this file to Vercel as /api/webhook.js
// ============================================

const TRELLO_KEY = '84bdaa540e5a927b0203e24cd3e2c82b';
const TRELLO_TOKEN = 'ATTA642e291e76adf59897cce4ac971066d7e36d15cb350d8d2066eb81b8281cadadBCE48B56';
const TRELLO_LIST_ID = '69bbc841dd92c54ac2c42ada';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8N_-qf5b25z7DLY7vu5sEiSjuN2aFdFcWHkJiC1Lfap7Z6SvbpeIs6O4CWEsgOgi4/exec';

const LABEL_IDS = {
  cadeaux: '69bbb1f435b02576e41923ad',
  maquettes: '69bbb1f435b02576e41923b0',
  experience: '69bbb1f435b02576e41923ae',
};

const CHECKLISTS = [
  { name: '🛒 Vente', items: ['Propal'] },
  { name: '🏗️ Produits', items: ['Modèle IO', 'Partlist', 'Render', 'Spec', 'Instructions PDF + QR code'] },
  { name: '📦 Packaging', items: ['Faces de la Boîte', 'Cartes QR'] },
  { name: '🚚 Livraison', items: ["Bordereaux d'envoi"] },
];

function getLabelId(produit) {
  if (!produit) return null;
  const p = produit.toLowerCase();
  if (p.includes('cadeau')) return LABEL_IDS.cadeaux;
  if (p.includes('maquette')) return LABEL_IDS.maquettes;
  if (p.includes('exp') || p.includes('team')) return LABEL_IDS.experience;
  return null;
}

async function createTrelloCard(data) {
  const { entreprise, email, produit, quantite, deadline, sujet, details, styleBoite, styleMaquette, occasion } = data;
  const style = styleBoite || styleMaquette || '';
  const labelId = getLabelId(produit);

  const description = `**🏢 Entreprise :** ${entreprise || 'N/A'}
**📧 Email :** ${email || 'N/A'}
**📦 Produit :** ${produit || 'N/A'}
**🎨 Style :** ${style || 'N/A'}
**🎯 Occasion :** ${occasion || 'N/A'}
**🔢 Quantité :** ${quantite || 'N/A'}
**📅 Deadline :** ${deadline || 'N/A'}

**📝 Sujet :**
${sujet || 'N/A'}

**💬 Détails :**
${details || 'N/A'}`;

  const cardRes = await fetch(
    `https://api.trello.com/1/cards?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${(entreprise || 'Nouveau Lead').toUpperCase()} — Nouveau Lead`,
        desc: description,
        idList: TRELLO_LIST_ID,
        ...(labelId && { idLabels: [labelId] }),
      })
    }
  );
  if (!cardRes.ok) throw new Error(`Trello: ${await cardRes.text()}`);
  return (await cardRes.json()).id;
}

async function addChecklists(cardId) {
  for (const checklist of CHECKLISTS) {
    const clRes = await fetch(
      `https://api.trello.com/1/checklists?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idCard: cardId, name: checklist.name }) }
    );
    if (!clRes.ok) continue;
    const cl = await clRes.json();
    for (const item of checklist.items) {
      await fetch(
        `https://api.trello.com/1/checklists/${cl.id}/checkItems?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: item, checked: false }) }
      );
    }
  }
}

async function createDriveStructure(entreprise) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entreprise })
  });
  if (!res.ok) throw new Error(`Apps Script: ${await res.text()}`);
  return await res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body;
    const data = {
      entreprise: body['Entreprise'] || body['entreprise'] || '',
      email: body['Email'] || body['email'] || '',
      produit: body['Produit'] || body['produit'] || '',
      quantite: body['Quantité'] || body['quantite'] || '',
      deadline: body['Deadline'] || body['deadline'] || '',
      sujet: body['Sujet'] || body['sujet'] || '',
      details: body['Détails'] || body['details'] || '',
      styleBoite: body['Style boîte'] || body['Style boite'] || '',
      styleMaquette: body['Style maquette'] || '',
      occasion: body['Occasion'] || body['occasion'] || '',
    };

    const [cardId] = await Promise.all([
      createTrelloCard(data),
      createDriveStructure(data.entreprise),
    ]);

    await addChecklists(cardId);

    return res.status(200).json({ success: true, message: `Carte Trello + dossier Drive créés pour ${data.entreprise}`, cardId });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
