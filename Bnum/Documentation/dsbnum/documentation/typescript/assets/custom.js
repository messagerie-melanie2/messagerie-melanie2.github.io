function AAAAAAAAAAAAAAAAAAAAAAAAAAAAH() {
	const navContainer = document.querySelector('.tsd-navigation');
	if (!navContainer) return;

	// // 1. Nettoyage des indésirables (core, components)
	// const spans = document.querySelectorAll("#tsd-nav-container li span");
	// spans.forEach((span) => {
	//   const text = span.textContent.trim();
	//   if (text === "core" || text === "components") {
	//     span.closest("li")?.style.setProperty("display", "none", "important");
	//   }
	// });

	// 2. Transformation des liens "A/B/C"
	const navLinks = document.querySelectorAll('.tsd-navigation a');

	navLinks.forEach(nav => {
		const originalText = nav.textContent.trim();

		if (originalText.includes('/')) {
			const parts = originalText.split('/');
			const fileName = parts.pop(); // Le nom final (ex: Badge)
			let currentParent = nav.closest('li')?.parentElement; // Le <ul> racine

			if (!currentParent) return;

			let targetContainer = currentParent;

			// Création/Récupération des dossiers parents
			parts.forEach(part => {
				// On cherche si le dossier existe déjà à ce niveau
				let existingFolder = targetContainer.querySelector(
					`details[data-folder="${part}"]`,
				);

				if (!existingFolder) {
					const li = document.createElement('li');
					li.innerHTML = `
            <details class="tsd-accordion" data-folder="${part}">
              <summary class="tsd-accordion-summary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="tsd-accordion-arrow"><path d="M9.352 4L15.352 12L9.352 20" stroke="currentColor" stroke-width="2"></path></svg>
                <svg style="margin-right:0" width="20" height="20" viewBox="0 0 24 24" fill="none" class="tsd-kind-icon" aria-label="Module"><use href="#icon-2"></use></svg>
                <span>${part}</span>
              </summary>
              <div class="tsd-accordion-details">
                <ul class="tsd-nested-navigation"></ul>
              </div>
            </details>
          `;
					targetContainer.appendChild(li);
					existingFolder = li.querySelector('details');
				}
				targetContainer = existingFolder.querySelector('ul');
			});

			// On déplace le lien original dans le dernier dossier créé
			const originalLi = nav.closest('li');
			if (originalLi) {
				nav.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="tsd-kind-icon" aria-label="Module"><use href="#icon-2"></use></svg>
          <span>${fileName}</span>
        `;
				targetContainer.appendChild(originalLi);

				if (nav.classList.contains('current')) {
					let details = originalLi.closest('details');
					// On remonte tous les parents pour ajouter l'attribut 'open'
					while (details) {
						details.setAttribute('open', '');
						// On cherche le details parent suivant s'il y en a un
						details = details.parentElement.closest('details');
					}
				} else if (nav.closest('li').querySelectorAll('.current').length > 0) {
					let details = originalLi.closest('details');
					// On remonte tous les parents pour ajouter l'attribut 'open'
					while (details) {
						details.setAttribute('open', '');
						// On cherche le details parent suivant s'il y en a un
						details = details.parentElement.closest('details');
					}
				}
			}
		}
	});
}

function removeComponentDocsData() {
	const tags = ['structure', 'state', 'slot', 'attr', 'cssvar'];

	for (const tag of tags) {
		const elements = document.querySelectorAll(`.tsd-tag-${tag}`);

		for (const element of elements) {
			element.remove();
		}
	}
}

const interval = setInterval(() => {
	if (
		document.querySelectorAll('#tsd-nav-container li span').length > 0 &&
		document.querySelectorAll('.tsd-navigation a').length > 0
	) {
		clearInterval(interval);
		// eslint-disable-next-line no-restricted-syntax
		AAAAAAAAAAAAAAAAAAAAAAAAAAAAH();
		removeComponentDocsData();
	}
}, 10);
