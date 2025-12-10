const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');
let marked;

// --- Configuration des chemins ---
const PROJECT_ROOT = path.resolve(__dirname, '../');
const DIST_DIR = path.resolve(PROJECT_ROOT, 'dist');
const LAYOUT_FILE = path.resolve(PROJECT_ROOT, 'src/layout.html'); // Doit exister
const FOOTER_FILE = path.resolve(PROJECT_ROOT, 'src/footer.html'); // Doit exister
const OUTPUT_FILE = path.resolve(DIST_DIR, 'stories.html');

// --- Fonctions de génération de HTML ---

/**
 * Helper pour échapper le HTML avant de le mettre dans un <pre><code>
 */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Générateur de tableau générique
 * @param {string[]} headers
 * @param {string[][]} rows
 */
function generateTable(headers, rows) {
  if (!rows || rows.length === 0) return '<p>N/A</p>';

  const ths = headers.map((h) => `<th>${h}</th>`).join('');
  const trs = rows
    .map((row) => {
      const tds = row.map((td) => `<td>${td}</td>`).join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');

  return `
    <table>
      <thead><tr>${ths}</tr></thead>
      <tbody>${trs}</tbody>
    </table>
  `;
}

/** Génère la table des Propriétés (@prop) */
function generatePropTable(props) {
  const headers = [
    'Nom (Attribut / .propriété)',
    'Type',
    'Description',
    'Défaut',
  ];
  const rows = props.map((prop) => [
    `<code>${prop.name}</code>`,
    `<code>${prop.type}</code>`,
    prop.description,
    `<code>${prop.default || 'N/A'}</code>`,
  ]);
  return generateTable(headers, rows);
}

function generateStatesTable(states) {
  const headers = ['Nom de l\'État', 'Description'];
  const rows = states.map((state) => [
    `<code>${state.name}</code>`,
    state.description,
  ]);
  return generateTable(headers, rows);
}

/** Génère la table des Attributs (@attr data-*) */
function generateAttrTable(attrs) {
  const headers = ['Attribut', 'Type', 'Défaut', 'Optionnel ?', 'Description'];
  const rows = attrs.map((attr) => [
    `<code>${attr.name}</code>`,
    `<code>${attr.type}</code>`,
    `<code>${attr.default || 'undefined'}</code>`,
    attr.optional ? '✅' : '❌',
    attr.description,
  ]);
  return generateTable(headers, rows);
}

/** Génère la table des Événements (@event) */
function generateEventTable(events) {
  const headers = ['Nom', 'Détail (event.detail)', 'Description'];
  const rows = events.map((event) => [
    `<code>${event.name}</code>`,
    `<code>${escapeHtml(event.detail)}</code>`,
    event.description,
  ]);
  return generateTable(headers, rows);
}

/** Génère la table des Slots (@slot) */
function generateSlotTable(slots) {
  const headers = ['Nom', 'Description'];
  const rows = slots.map((slot) => [
    `<code>${slot.name}</code>`,
    slot.description,
  ]);
  return generateTable(headers, rows);
}

/** Génère la table des Variables CSS (@cssvar) */
function generateCssVarTable(vars) {
  const headers = ['Variable', 'Défaut', 'Description (Défaut)'];
  const rows = vars.map((v) => [
    `<code>${v.name}</code>`,
    `<code>${v.default || 'N/A'}</code> ${v.name.includes('color') && v.default ? `<span class="color-swatch" style="background-color: ${v.default};"></span>` : ''}`,
    v.description, // Le défaut est inclus dans la description par notre parser
  ]);
  return generateTable(headers, rows);
}

/** Génère la documentation de l'API publique (Méthodes) */
function generateMethodDocs(methods) {
  if (!methods || methods.length === 0) return '<p>N/A</p>';

  return methods
    .map((method) => {
      const params = method.parameters
        .map((p) => `${p.name}: ${p.type}`)
        .join(', ');
      const signature = `<strong>${method.isStatic ? '<em>(static)</em> ' : ''}${method.name}</strong>(${params}) : <code>${method.return.type}</code>`;

      const paramDescriptions = method.parameters
        .map(
          (p) => `
      <li><code>${p.name}</code>: ${p.description || 'N/A'}</li>
    `,
        )
        .join('');

      return `
      <div class="api-method">
        <h4><code>${signature}</code></h4>
        <p>${method.description}</p>
        ${paramDescriptions.length > 0 ? `<strong>Paramètres :</strong><ul>${paramDescriptions}</ul>` : ''}
        ${method.return.description ? `<p><strong>Retourne :</strong> ${method.return.description}</p>` : ''}
      </div>
    `;
    })
    .join('<hr class="api-separator">');
}

/** Génère la table des Propriétés Publiques (get/set) */
function generatePublicPropTable(props, staticMode) {
  const headers = ['Propriété', 'Type', 'Lecture seule', 'Description'];
  const rows = props
    .filter((p) => p.isStatic === staticMode)
    .map((prop) => [
      `<code>${prop.name}</code>`,
      `<code>${prop.type}</code>`,
      prop.isReadonly ? 'Oui' : 'Non',
      marked.parse(prop.description),
    ]);
  return generateTable(headers, rows);
}

/**
 * Trouve tous les fichiers .doc.json
 */
function findDocJsonFiles(dir) {
  return globSync('**/*.doc.json', {
    cwd: dir,
    absolute: true,
  });
}

/**
 * NOUVELLE FONCTION: Génère les blocs de structure
 * @param {{title: string, code: string}[]} structures
 */
function generateStructureBlocks(structures) {
  if (!structures || structures.length === 0) return '<p>N/A</p>';

  return structures
    .map(
      (s) => `
      <div class="structure-block">
    ${s.title ? `<h4>${s.title}</h4>` : ''}
    <div>${s.code}</div><pre><code>${escapeHtml(s.code)}</code></pre>
  </div>
  `,
    )
    .join(''); // Ajoute un séparateur entre les exemples
}

// --- Logique principale ---
function main() {
  try {
    console.log('Building dynamic stories page from .doc.json files...');

    // 1. Trouver tous les fichiers .doc.json
    const docFiles = findDocJsonFiles(path.resolve(PROJECT_ROOT, 'components'));

    if (docFiles.length === 0) {
      console.warn('No *.doc.json files found. Building an empty page.');
    } else {
      console.log(`Found ${docFiles.length} doc files.`);
    }

    // 2. Lire le layout et le footer
    if (!fs.existsSync(LAYOUT_FILE) || !fs.existsSync(FOOTER_FILE)) {
      console.error(`Erreur: ${LAYOUT_FILE} ou ${FOOTER_FILE} manquant.`);
      process.exit(1);
    }
    const layoutContent = fs.readFileSync(LAYOUT_FILE, 'utf8');
    const footerContent = fs.readFileSync(FOOTER_FILE, 'utf8');

    // 3. Générer les liens de la sidebar et le contenu des stories
    const sidebarLinks = [];
    const storyContents = [];

    for (const docPath of docFiles) {
      const doc = JSON.parse(fs.readFileSync(docPath, 'utf8'));
      const componentName = doc.name;
      const storyId = `story-${componentName}`;
      const componentDir = path.dirname(docPath);

      // --- Génération du contenu de la story ---

      // A. Lire les fichiers Playground
      let playgroundHtml = '';
      let playgroundJs = '// Fichier .playground.js non trouvé';
      let playgroundCss = null;

      const pgHtmlPath = `${componentDir}/story/${componentName}.playground.html`;

      const pgJsPath = `${componentDir}/story/${componentName}.playground.js`;

      const pgCssPath = `${componentDir}/story/${componentName}.playground.css`;

      if (fs.existsSync(pgHtmlPath)) {
        playgroundHtml = fs.readFileSync(pgHtmlPath, 'utf8');
      }
      if (fs.existsSync(pgJsPath)) {
        playgroundJs = fs.readFileSync(pgJsPath, 'utf8');
      }
      if (fs.existsSync(pgCssPath)) {
        playgroundCss = fs.readFileSync(pgCssPath, 'utf8');
      }

      const hasPlayground = playgroundHtml !== '';
      const playgroundHidden = !hasPlayground ? 'style="display:none;"' : '';

      console.log('hasPlayground', hasPlayground, playgroundHidden);

      // B. Assembler le HTML de cette story
      const fileContent = `
      ${playgroundCss ? `<style>\n${playgroundCss}\n</style>` : ''}
      <h1><code>&lt;${componentName}&gt;</code></h1>
      
      <h2>Description</h2>
      <p>${marked.parse(doc.description)}</p>
      
      <h2>Structure</h2>
      <div class="structures">${generateStructureBlocks(doc.structure)}</div>
      
      <h2 ${playgroundHidden}>Utilisation (Playground)</h2>
      <div ${playgroundHidden} class="playground-demo-box">
        ${hasPlayground ? playgroundHtml : '<p>Playground non disponible.</p>'}
      </div>
      
      <h3 ${playgroundHidden}>Code HTML</h3>
      <pre ${playgroundHidden}><code class="demo-code">${escapeHtml(playgroundHtml)}</code></pre>
      <h3 ${playgroundHidden}>Code JS</h3>
      <pre ${playgroundHidden}><code class="demo-code">${escapeHtml(playgroundJs)}</code></pre>
      <script ${playgroundHidden}>${playgroundJs}</script>
      
      <!--<h2>Propriétés (API Principale)</h2>
      ${generatePropTable(doc.properties)}-->
      
      <h2>Événements</h2>
      ${generateEventTable(doc.events)}
      
      <h2>Slots</h2>
      ${generateSlotTable(doc.slots)}

      <h2>Attributs de Données</h2>
      ${generateAttrTable(doc.dataAttributes)}

      <h2>Variables CSS</h2>
      ${generateCssVarTable(doc.cssVars)}

      <h2>État internes <bnum-helper>Ces états peuvent être utilisés pour appliquer des styles conditionnels via des sélecteurs d'attributs.\r\nIls s'utilisent via <code>:state(nom-de-l-etat)</code> en CSS ou via <code>element.hasState('nom-de-l-etat')</code> en JS.</h2>
      ${generateStatesTable(doc.states)}

      <h2>API Publique</h2>
      <h3>Méthodes</h3>
      ${generateMethodDocs(doc.publicMethods)}

      <h3>Variables d'instance</h3>
      ${generatePublicPropTable(doc.publicProperties, false)}

      <h3>Variables statiques</h3>
      ${generatePublicPropTable(doc.publicProperties, true)}

      <h2>Code source</h2>
      <p>
        <a href="https://github.com/votre-projet/..." target="_blank">
          Voir le code source sur GitHub (components/${componentName})
        </a>
      </p>
    `;

      // Ajoute un lien pour la sidebar
      sidebarLinks.push(
        `<li><a href="#${componentName}" data-target="${storyId}">${componentName}</a></li>`,
      );

      // Ajoute le contenu de la story, masqué par défaut (sauf le premier)
      storyContents.push(
        `<div id="${storyId}" class="story-content" ${storyContents.length > 0 ? 'hidden' : ''}>
        <div class="story-wrapper">
          ${fileContent}
        </div>
      </div>`,
      );
    }

    // 4. Styles CSS (tiré de ton script original)
    const layoutStyles = `
<style>
  body {
    margin: 0;
    padding: 0;
    display: flex;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .story-container {
    display: flex;
    flex-grow: 1;
    width: 100%;
  }
  .story-sidebar {
    width: 250px;
    flex-shrink: 0;
    /*background: #f7f7f7;*/
    border-right: 1px solid #eaeaea;
    height: 100vh;
    overflow-y: auto;
    padding: 1rem;
    box-sizing: border-box;
  }
  .story-sidebar h3 {
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
    color: white;
  }
  .story-sidebar ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .story-sidebar li a {
    display: block;
    padding: 8px 12px;
    text-decoration: none;
/*    color: #333;*/
    border-radius: 4px;
    font-weight: 500;
  }
  /*.story-sidebar li a:hover {
    background: #eee;
  }
  .story-sidebar li a.active {
    background: #007bff;
    color: white;
  }*/
  .story-main {
    flex-grow: 1;
    padding: 2rem;
    height: 100vh;
    overflow-y: auto;
    box-sizing: border-box;
  }
  .story-wrapper {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 1rem;
    max-width: 1200px;
  }
  /* Styles pour les tables de doc */
  .story-wrapper table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
    font-size: 0.95em;
  }
  .story-wrapper th, .story-wrapper td {
    border: 1px solid #ddd;
    padding: 10px 12px;
    text-align: left;
    vertical-align: top;
  }
  .story-wrapper th {
    background-color: #f9f9f9;
    font-weight: bold;
  }
  .story-wrapper code {
    background-color: #eee;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }
  .story-wrapper pre > code {
    display: block;
    padding: 1rem;
    background-color: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 4px;
    white-space: pre-wrap;
    font-size: 0.9em;
  }
  .story-wrapper .playground-demo-box {
    border: 1px dashed #ccc;
    padding: 1.5rem;
    border-radius: 4px;
  }
  .story-wrapper .api-method {
    margin-bottom: 1rem;
  }
  .story-wrapper .api-method h4 {
    margin-bottom: 0.5rem;
    font-family: monospace;
    font-size: 1.1em;
    border-bottom: none;
  }
  .story-wrapper .api-method h4 em {
    font-style: normal;
    font-weight: normal;
    color: #888;
  }
  .story-wrapper .api-separator {
    border: none;
    border-top: 1px dashed #eee;
    margin: 1.5rem 0;
  }
</style>
  `;

    // 5. Script JS (tiré de ton script original)
    const layoutScript = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.story-sidebar');
    const links = sidebar.querySelectorAll('a[data-target]');
    const contents = document.querySelectorAll('.story-content');

    function showStory(targetId) {
      if (!targetId) return;
      
      contents.forEach(content => { content.hidden = true; });
      links.forEach(link => { link.classList.remove('active'); });

      const targetContent = document.getElementById(targetId);
      if (targetContent) { targetContent.hidden = false; }

      const targetLink = sidebar.querySelector(\`a[data-target="\${targetId}"]\`);
      if (targetLink) {
        targetLink.classList.add('active');
        history.pushState(null, null, targetLink.hash);
      }
    }

    sidebar.addEventListener('click', (e) => {
      const targetLink = e.target.closest('a[data-target]');
      if (targetLink) {
        e.preventDefault();
        const targetId = targetLink.dataset.target;
        showStory(targetId);
      }
    });

    function showStoryFromHash() {
      const initialHash = window.location.hash.substring(1);
      const initialTargetId = \`story-\${initialHash}\`;
      
      if (initialHash && document.getElementById(initialTargetId)) {
        showStory(initialTargetId);
      } else if (links.length > 0) {
        showStory(links[0].dataset.target);
      }
    }

    showStoryFromHash();
    window.addEventListener('popstate', showStoryFromHash);
  });
</script>
  `;

    // 6. Assembler le HTML final
    const finalHtml =
      layoutContent.replace('</head>', `${layoutStyles}</head>`) +
      '<div class="story-container">' +
      `<nav class="story-sidebar"><h3>Composants</h3><ul>${sidebarLinks.join('')}</ul></nav>` +
      `<main class="story-main">${storyContents.join('')}</main>` +
      '</div>' +
      layoutScript +
      footerContent;

    // 7. Écrire le fichier final
    fs.mkdirSync(DIST_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, finalHtml, 'utf8');
    console.log(`✅ Dynamic stories page built successfully: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ Error building stories page:');
    console.error(error);
    process.exit(1);
  }
}

(async () => {
  const { marked: m } = await import('marked');
  marked = m;
  main();
})();
