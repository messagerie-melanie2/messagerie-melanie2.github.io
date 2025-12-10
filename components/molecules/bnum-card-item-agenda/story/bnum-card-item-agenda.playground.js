(() => {
  const logOutput = document.getElementById('bnum-card-item-agenda-log-output');
  const cardItemAgenda = document.getElementById('bnum-card-item-agenda-demo');
  const dateInput = document.getElementById('ctrl-bnum-card-item-agenda-date');
  const startDateInput = document.getElementById(
    'ctrl-bnum-card-item-agenda-sdate',
  );
  const endDateInput = document.getElementById(
    'ctrl-bnum-card-item-agenda-enddate',
  );
  // Ajout des constantes pour tous les inputs du HTML
  const titleInput = document.getElementById(
    'ctrl-bnum-card-item-agenda-title',
  );
  const locationInput = document.getElementById(
    'ctrl-bnum-card-item-agenda-location',
  );
  const allDayInput = document.getElementById(
    'ctrl-bnum-card-item-agenda-all-day',
  );
  const actionInput = document.getElementById(
    'ctrl-bnum-card-item-agenda-action',
  );
  const privateInput = document.getElementById(
    'ctrl-bnum-card-item-agenda-private',
  );
  const modeInput = document.getElementById('ctrl-bnum-card-item-agenda-mode');

  dateInput.addEventListener('change', (event) => {
    const newValue = event.target.value;
    cardItemAgenda.baseDate = newValue;
    logOutput.textContent += `Changement de la date : ${newValue}\n`;
  });

  startDateInput.addEventListener('change', (event) => {
    const newValue = event.target.value;
    cardItemAgenda.startDate = newValue.replace('T', ' ');
    logOutput.textContent += `Changement de la date de début : ${newValue}\n`;
  });

  endDateInput.addEventListener('change', (event) => {
    const newValue = event.target.value;
    cardItemAgenda.endDate = newValue.replace('T', ' ');
    logOutput.textContent += `Changement de la date de fin : ${newValue}\n`;
  });

  titleInput.addEventListener('input', (event) => {
    const newValue = event.target.value;

    if (newValue.trim() === '') cardItemAgenda.resetTitle();
    else cardItemAgenda.updateTitle(newValue);
    logOutput.textContent += `Changement du titre : ${newValue || 'Réunion de projet'}\n`;
  });

  locationInput.addEventListener('input', (event) => {
    const newValue = event.target.value;
    if (newValue.trim() === '') cardItemAgenda.resetLocation();
    else cardItemAgenda.updateLocation(newValue);
    logOutput.textContent += `Changement du lieu : ${newValue}\n`;
  });

  allDayInput.addEventListener('change', (event) => {
    const newValue = event.target.checked;

    if (newValue) cardItemAgenda.setAttribute('all-day', 'all-day');
    else cardItemAgenda.removeAttribute('all-day');

    logOutput.textContent += `Changement de "Toute la journée" : ${newValue}\n`;
  });

  actionInput.addEventListener('input', (event) => {
    const newValue = event.target.checked;

    if (newValue) {
      cardItemAgenda.updateAction(
        document
          .querySelector('#story-bnum-card-item-agenda-action')
          .content.cloneNode(true),
      );
    } else cardItemAgenda.resetAction();

    logOutput.textContent += `Changement de l'action : ${newValue}\n`;
  });

  privateInput.addEventListener('change', (event) => {
    const newValue = event.target.checked;
    if (newValue) cardItemAgenda.setAttribute('private', 'private');
    else cardItemAgenda.removeAttribute('private');
    logOutput.textContent += `Changement de la confidentialité : ${newValue}\n`;
  });

  modeInput.addEventListener('change', (event) => {
    const newValue = event.target.checked;
    if (newValue) cardItemAgenda.setAttribute('mode', 'telework');
    else cardItemAgenda.removeAttribute('mode');
    logOutput.textContent += `Changement du mode : ${newValue}\n`;
  });
})();
