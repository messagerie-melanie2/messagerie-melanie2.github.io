document.addEventListener('DOMContentLoaded', () => {
  const logOutput = document.getElementById('log-output-3');
  const toggleBtn = document.getElementById('toggle-dark');

  /** Fonction helper pour logger dans la page */
  function log(message) {
    console.log(message); // Log en console
    logOutput.textContent += `[${new Date().toLocaleTimeString()}] ${message}\n`;
  }

  log('Page chargée. Attachement des écouteurs...');

  // 1. Contrôle du thème de la page
  toggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    log(
      `Action: Thème de la page basculé. Classe ".dark" ${
        document.documentElement.classList.contains('dark')
          ? 'ajoutée'
          : 'retirée'
      }.`,
    );
  });

  // 2. Écouteurs d'événements sur les composants bnum-img
  const img1 = document.getElementById('img1');
  const img2 = document.getElementById('img2');
  const imgError = document.getElementById('imgError');

  if (img1) {
    img1.on('load', (e) => log('✅ SUCCESS (img1): Événement "load" reçu.'));
    img1.on('error', (e) =>
      log(
        '❌ ERROR (img1): Événement "error" reçu. Vérifiez le chemin "./assets/icon-light.png" (et dark).',
      ),
    );
  }

  if (img2) {
    img2.on('load', (e) => log('✅ SUCCESS (img2): Événement "load" reçu.'));
    img2.on('error', (e) =>
      log(
        '❌ ERROR (img2): Événement "error" reçu. Vérifiez le chemin "./assets/logo.svg" (et dark).',
      ),
    );
  }

  if (imgError) {
    imgError.on('load', (e) =>
      log(
        '⚠️ WARN (imgError): Événement "load" reçu. (Ne devrait pas arriver si le fichier n\'existe pas)',
      ),
    );
    imgError.on('error', (e) =>
      log(
        '✅ SUCCESS (imgError): Événement "error" reçu. (Comportement attendu)',
      ),
    );
  }
});
