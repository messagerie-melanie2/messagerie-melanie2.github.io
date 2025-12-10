/* Le script est maintenant encapsulé.
      Il utilise 'DOMContentLoaded' pour s'assurer que le DOM principal
      (injecté par build-stories.js) est prêt.
    */
document.addEventListener('DOMContentLoaded', () => {
  /* Nous ciblons les éléments par leur ID. 
        Étant donné que build-stories.js masque les stories non actives,
        document.getElementById trouvera les éléments de la story *actuellement*
        visible (ou du moins la première chargée), ce qui est suffisant
        pour que les écouteurs d'événements soient attachés.
      */
  const playgroundCard = document.getElementById(
    'bnum-card-story-card-playground',
  );
  const logOutput = document.getElementById('bnum-card-story-log-output-card');
  let titleCounter = 1;
  let bodyCounter = 1;

  /** Fonction helper pour logger dans la page */
  function log(message) {
    console.log(message); // Log en console
    if (logOutput) {
      logOutput.textContent += `[${new Date().toLocaleTimeString()}] ${message}\n`;
      logOutput.scrollTop = logOutput.scrollHeight;
    }
  }

  /* Nous vérifions si les éléments existent avant d'attacher les listeners,
        au cas où la story ne serait pas la première à s'afficher.
      */
  const cardClickable = document.getElementById(
    'bnum-card-story-card-clickable',
  );
  if (cardClickable) {
    cardClickable.addEventListener('bnum-card:click', (e) => {
      log('✅ Événement "bnum-card:click" reçu (sur la carte cliquable)');
    });
  }

  // --- Contrôles du Playground ---
  if (playgroundCard) {
    log(
      'Page chargée. Attachement des écouteurs pour #bnum-card-story-card-playground...',
    );

    // 1. Contrôles des états
    const ctrlClickable = document.getElementById(
      'bnum-card-story-ctrl-clickable',
    );
    if (ctrlClickable) {
      ctrlClickable.addEventListener('change', (e) => {
        playgroundCard.clickable = e.target.checked;
        log(`Action: .clickable = ${e.target.checked}`);
      });
    }

    const ctrlLoading = document.getElementById('bnum-card-story-ctrl-loading');
    console.log(ctrlLoading);
    if (ctrlLoading) {
      console.log(ctrlLoading, 2);
      ctrlLoading.addEventListener('change', (e) => {
        playgroundCard.loading = e.target.checked;
        log(`Action: .loading = ${e.target.checked}`);
      });
    }

    // 2. Écouteurs d'événements sur le Playground
    playgroundCard.addEventListener('bnum-card:loading', (e) => {
      log(
        `✅ Événement "bnum-card:loading" reçu. Nouvel état: ${
          e.detail.newValue !== null
        }`,
      );
    });

    playgroundCard.addEventListener('bnum-card:click', (e) => {
      log('✅ Événement "bnum-card:click" reçu (sur le playground)');
    });

    // 3. Contrôles des Méthodes JS
    document
      .getElementById('bnum-card-story-btn-update-title')
      ?.addEventListener('click', () => {
        log('Action: Appel de .updateTitle()');
        const newTitle = document.createElement('h3');
        newTitle.setAttribute('slot', 'title');
        newTitle.textContent = `Nouveau Titre ${titleCounter++}`;
        newTitle.style.color = 'blue';
        playgroundCard.updateTitle(newTitle);
      });

    document
      .getElementById('bnum-card-story-btn-clear-title')
      ?.addEventListener('click', () => {
        log('Action: Appel de .clearTitle()');
        playgroundCard.clearTitle();
      });

    document
      .getElementById('bnum-card-story-btn-append-title')
      ?.addEventListener('click', () => {
        log('Action: Appel de .appendToTitle()');
        const extraTitle = document.createElement('span');
        extraTitle.setAttribute('slot', 'title');
        extraTitle.textContent = ` (ajout ${titleCounter++}) `;
        extraTitle.style.fontWeight = 'normal';
        playgroundCard.appendToTitle(extraTitle);
      });

    document
      .getElementById('bnum-card-story-btn-update-body')
      ?.addEventListener('click', () => {
        log('Action: Appel de .updateBody()');
        const newBody = document.createElement('p');
        newBody.innerHTML =
          'Nouveau corps de carte (<code>updateBody</code>). Le contenu précédent a été écrasé.';
        newBody.style.border = '1px solid green';
        newBody.style.padding = '5px';
        playgroundCard.updateBody(newBody);
        bodyCounter = 1;
      });

    document
      .getElementById('bnum-card-story-btn-clear-body')
      ?.addEventListener('click', () => {
        log('Action: Appel de .clearBody()');
        playgroundCard.clearBody();
        bodyCounter = 1;
      });

    document
      .getElementById('bnum-card-story-btn-append-body')
      ?.addEventListener('click', () => {
        log('Action: Appel de .appendToBody()');
        const extraP = document.createElement('p');
        extraP.textContent = `Paragraphe ajouté n°${bodyCounter++} (.appendToBody).`;
        playgroundCard.appendToBody(extraP);
      });
  } else {
    /* Ce log apparaîtra si cette story n'est pas la première active,
          mais les listeners du script de build-stories.js (navigation)
          fonctionneront toujours.
        */
    console.log(
      'Script bnum-card: #bnum-card-story-card-playground non trouvé au DOMContentLoaded (probablement pas la story active).',
    );
  }
});
