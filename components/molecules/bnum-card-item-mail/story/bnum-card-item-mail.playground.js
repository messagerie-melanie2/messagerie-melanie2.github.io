(() => {
  /**
   * Réinitialise un champ à sa valeur de départ
   * @param {'Sender' | 'Subject' | 'Date'} what Champs à réinitialiser
   * @param {HTMLInputElement} input Input à réinitialiser
   * @param {string} value Valeur de départ à rétablir
   */
  function reset(what, input, value) {
    player[`reset${what}`]();
    input.value = value;
  }

  const START_SENDER = 'John Doe';
  const START_SUBJECT = 'Hello World';
  const START_DATE = '2025-10-31T11:11';

  const playerSelector = '.bnum-card-item-mail-playground .player';
  const idSender = 'ctrl-sender';
  const idSubject = 'ctrl-subject';
  const idDate = 'ctrl-date';
  const idUnread = 'ctrl-unread';
  const idResetSender = 'btn-reset-sender';
  const idResetSubject = 'btn-reset-subject';
  const idResetDate = 'btn-reset-date';

  const player = document.querySelector(playerSelector);
  const senderInput = document.getElementById(idSender);
  const subjectInput = document.getElementById(idSubject);
  const dateInput = document.getElementById(idDate);
  const unreadInput = document.getElementById(idUnread);
  const resetSenderBtn = document.getElementById(idResetSender);
  const resetSubjectBtn = document.getElementById(idResetSubject);
  const resetDateBtn = document.getElementById(idResetDate);

  unreadInput.addEventListener('change', () => {
    player.toggleAttribute('read');
  });

  senderInput.addEventListener('input', (event) => {
    const value = event.target.value;
    player.updateSender(value);
  });

  subjectInput.addEventListener('input', (event) => {
    const value = event.target.value;
    player.updateSubject(value);
  });

  dateInput.addEventListener('input', (event) => {
    const value = event.target.value;
    player.updateDate(value);
  });

  resetSenderBtn.addEventListener(
    'click',
    reset.bind(null, 'Sender', senderInput, START_SENDER),
  );
  resetSubjectBtn.addEventListener(
    'click',
    reset.bind(null, 'Subject', subjectInput, START_SUBJECT),
  );
  resetDateBtn.addEventListener(
    'click',
    reset.bind(null, 'Date', dateInput, START_DATE),
  );
})();
