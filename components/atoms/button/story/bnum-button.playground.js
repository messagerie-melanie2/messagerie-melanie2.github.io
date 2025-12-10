document.addEventListener('DOMContentLoaded', () => {
  const logOutput = document.getElementById('log-output-1');
  const btn = document.getElementById('main-btn');

  /** Fonction helper pour logger dans la page */
  function log(message) {
    console.log(message); // Log en console
    if (logOutput)
      logOutput.textContent += `[${new Date().toLocaleTimeString()}] ${message}\n`;
  }

  log('Page chargée. Attachement des écouteurs...');

  // --- Contrôles du Playground ---

  // 1. Texte (Slot)
  document.getElementById('ctrl-text').addEventListener('input', (e) => {
    btn.textContent = e.target.value;
  });

  // 2. Icône (Propriété)
  document.getElementById('ctrl-icon').addEventListener('input', (e) => {
    // Utilise la propriété .icon
    btn.icon = e.target.value.trim() || null;
  });

  // 3. Variation (Propriété)
  document.querySelectorAll('input[name="variation"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      if (e.target.checked) {
        // Utilise la propriété .variation
        btn.variation = e.target.value;
      }
    });
  });

  // 4. Position Icône (Propriété)
  document.querySelectorAll('input[name="icon-pos"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      if (e.target.checked) {
        // Utilise la propriété .iconPos
        btn.iconPos = e.target.value;
      }
    });
  });

  // 5. États (Attributs)
  document.getElementById('ctrl-rounded').addEventListener('change', (e) => {
    btn.toggleAttribute('rounded', e.target.checked);

    if (btn.hasAttribute('rounded')) {
      btn.setAttribute('rounded', true);
    }
  });

  document.getElementById('ctrl-loading').addEventListener('change', (e) => {
    // Teste aussi les méthodes publiques
    if (e.target.checked) {
      btn.setLoading();
    } else {
      btn.stopLoading();
    }
  });

  document.getElementById('ctrl-disabled').addEventListener('change', (e) => {
    btn.toggleAttribute('disabled', e.target.checked);

    if (btn.hasAttribute('disabled')) {
      btn.setAttribute('disabled', true);
    }
  });

  // --- Écouteurs d'événements sur le bouton ---

  btn.addEventListener('elementchanged', (e) => {
    if (e.detail && e.detail.property) {
      log('✅ Événement "elementchanged" reçu:');
      log(`   Propriété: ${e.detail.property}`);
      log(`   Ancienne valeur: ${e.detail.oldValue}`);
      log(`   Nouvelle valeur: ${e.detail.newValue}`);
    }
  });

  btn.addEventListener('custom:loading', (e) => {
    log('✅ Événement "custom:loading" reçu:');
    log(`   État: ${e.detail.state}`);
  });

  btn.addEventListener('click', (e) => {
    log('🖱️ Événement "click" reçu !');
  });

  // --- Test de création statique ---
  try {
    const BnumButtonClass = customElements.get('bnum-button');
    if (BnumButtonClass) {
      const staticIconBtn = BnumButtonClass.CreateOnlyIcon('mail', {
        variation: 'secondary',
        rounded: true,
      });
      staticIconBtn.title = 'Créé via CreateOnlyIcon';
      document.getElementById('static-icon-only').appendChild(staticIconBtn);
      log('Action: Bouton statique (CreateOnlyIcon) ajouté.');
    }
  } catch (e) {
    log(`❌ ERREUR création statique: ${e.message}`);
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth <= 720) {
    document.querySelector('html').classList.add('layout-small');
  } else {
    document.querySelector('html').classList.remove('layout-small');
  }
});
window.dispatchEvent(new Event('resize'));
