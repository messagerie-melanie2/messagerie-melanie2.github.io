document.addEventListener('DOMContentLoaded', () => {
  const namespace = '-secondary';
  const logOutput = document.getElementById('log-output-1');
  const btn = document.getElementById('main-btn' + namespace);

  function log(message) {
    console.log(message);
    if (logOutput)
      logOutput.textContent += `[${new Date().toLocaleTimeString()}] ${message}\n`;
  }

  log('Page chargée. Attachement des écouteurs...');

  document
    .getElementById('ctrl-text-secondary')
    .addEventListener('input', (e) => {
      btn.textContent = e.target.value;
    });

  document
    .getElementById('ctrl-icon-secondary')
    .addEventListener('input', (e) => {
      btn.icon = e.target.value.trim() || null;
    });

  document.querySelectorAll('input[name="variation"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      if (e.target.checked) {
        btn.variation = e.target.value;
      }
    });
  });

  document.querySelectorAll('input[name="icon-pos"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      if (e.target.checked) {
        btn.iconPos = e.target.value;
      }
    });
  });

  document
    .getElementById('ctrl-rounded-secondary')
    .addEventListener('change', (e) => {
      btn.toggleAttribute('rounded', e.target.checked);
      if (btn.hasAttribute('rounded')) {
        btn.setAttribute('rounded', true);
      }
    });

  document
    .getElementById('ctrl-loading-secondary')
    .addEventListener('change', (e) => {
      if (e.target.checked) {
        btn.setLoading();
      } else {
        btn.stopLoading();
      }
    });

  document
    .getElementById('ctrl-disabled-secondary')
    .addEventListener('change', (e) => {
      btn.toggleAttribute('disabled', e.target.checked);
      if (btn.hasAttribute('disabled')) {
        btn.setAttribute('disabled', true);
      }
    });

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
