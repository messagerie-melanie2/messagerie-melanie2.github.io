(() => {
	function getComponentData() {
		return document.getElementById('component-data');
	}
	function sidebar_select() {
		const component = getComponentData();

		if (component) {
			const name = component.getAttribute('data-component');

			if (name) {
				const links = document.querySelectorAll('.story-sidebar a');
				links.forEach(link => {
					if (link.getAttribute('data-component') === name) {
						link.classList.add('active');
						link.scrollIntoView({
							behavior: 'auto', // 'auto' pour un saut immédiat, 'smooth' pour une animation fluide
							block: 'center', // Centre l'élément verticalement s'il y a un scroll vertical
							inline: 'center', // Centre l'élément horizontalement (utile pour ta barre de navigation)
						});
					} else {
						link.classList.remove('active');
					}
				});
			}
		}
	}

	function initTab() {
		const tab = document.getElementById('playground-tabs');
		const js = document.getElementById('playground-js');
		const html = document.getElementById('playground-html');

		js.style.display = 'none';
		html.style.display = 'none';

		if (tab.currentValue === 'js') {
			if (js) {
				js.style.display = 'block';
			}
		}

		if (tab.currentValue === 'html') {
			if (html) {
				html.style.display = 'block';
			}
		}
	}

	function setListeners() {
		listenerSearch();
		listenerTab();
	}

	function onSearch() {
		const search = document.getElementById('search-components');
		const value = search.value;

		document.querySelectorAll('.story-sidebar a').forEach(link => {
			const text = link.textContent;
			if (text.toLowerCase().includes(value.toLowerCase())) {
				link.style.display = 'block';
			} else {
				link.style.display = 'none';
			}
		});
	}

	function listenerSearch() {
		const search = document.getElementById('search-components');
		search.addEventListener('input', onSearch);
		search.addEventListener('bnum-input-search:search', onSearch);
	}

	function onplaygroundTabChanged(event) {
		const { value } = event.detail;

		const js = document.getElementById('playground-js');
		const html = document.getElementById('playground-html');

		js.style.display = 'none';
		html.style.display = 'none';

		switch (value) {
			case 'js':
				{
					if (js) {
						js.style.display = 'block';
					}
				}
				break;

			case 'html':
				{
					if (html) {
						html.style.display = 'block';
					}
				}
				break;

			default:
				break;
		}
	}

	function listenerTab() {
		const tab = document.getElementById('playground-tabs');
		tab.addEventListener(
			'bnum-segmented-control:change',
			onplaygroundTabChanged,
		);
	}

	sidebar_select();
	setListeners();
	initTab();
})();
