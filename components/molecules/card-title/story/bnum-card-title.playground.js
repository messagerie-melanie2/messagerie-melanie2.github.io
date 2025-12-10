// Ce script est "scopé" au conteneur grâce aux IDs uniques
(async function () {
  await new Promise((ok) => {
    const interval = setInterval(() => {
      if (window.Bnum) {
        clearInterval(interval);
        ok();
      }
    }, 50);
  });

  const container = document.querySelector('.story-bnum-card-title-container');
  if (!container) return; // Ne rien faire si le conteneur n'est pas là

  // Utiliser .querySelector depuis le conteneur pour "scoper" la recherche
  const logOutput = container.querySelector('#bnum-card-title-log-output');
  const mainTitle = container.querySelector('#bnum-card-title-main-title');
  const ctrlText = container.querySelector('#bnum-card-title-ctrl-text');
  const ctrlIcon = container.querySelector('#bnum-card-title-ctrl-icon');
  const ctrlUrl = container.querySelector('#bnum-card-title-ctrl-url');

  /** Fonction helper pour logger dans la page */
  function log(message) {
    if (!logOutput) return;
    console.log(message); // Log en console
    logOutput.textContent += `[${new Date().toLocaleTimeString()}] ${message}\n`;
    logOutput.scrollTop = logOutput.scrollHeight; // Auto-scroll
  }

  // Vérifier que tous les éléments existent avant d'attacher les écouteurs
  if (!logOutput || !mainTitle || !ctrlText || !ctrlIcon || !ctrlUrl) {
    log('Erreur: Un ou plusieurs éléments du playground sont manquants.');
    return;
  }

  log('Page chargée. Attachement des écouteurs...');

  // --- 1. Contrôles du Playground ---

  // Texte (Slot par défaut)
  ctrlText.addEventListener('input', (e) => {
    mainTitle.textContent = e.target.value;
    log(`Action: Texte (slot) mis à jour : "${e.target.value}"`);
  });

  // Icône (Propriété .icon)
  ctrlIcon.addEventListener('input', (e) => {
    const newIcon = e.target.value.trim() || null;
    mainTitle.icon = newIcon;
    log(`Action: Propriété .icon mise à jour : "${newIcon}"`);
  });

  // URL (Attribut url)
  ctrlUrl.addEventListener('input', (e) => {
    const newUrl = e.target.value.trim();
    if (newUrl) {
      mainTitle.setAttribute('url', newUrl);
      log(`Action: Attribut [url] mis à jour : "${newUrl}"`);
    } else {
      mainTitle.removeAttribute('url');
      log('Action: Attribut [url] retiré.');
    }
  });

  // --- 2. Écouteur sur le composant ---
  mainTitle.addEventListener('click', (e) => {
    log('🖱️ Événement "click" reçu !');
    // Si c'est un lien, on empêche la navigation pour la démo
    if (mainTitle.hasAttribute('url')) {
      e.preventDefault();
      log(
        `   (Navigation vers "${mainTitle.getAttribute('url')}" empêchée pour la démo)`,
      );
    }
  });
})();
