(() => {
  const element = document.getElementById('bnum-card-list-demo-element');
  const btnAddMailItem = document.getElementById(
    'bnum-card-list-btn-add-mail-item',
  );
  const btnClearItem = document.getElementById('bnum-card-list-btn-clear-item');

  const subjects = [
    'Réunion de projet',
    'Invitation à un événement',
    'Offre spéciale pour vous',
    'Mise à jour de votre compte',
    'Newsletter hebdomadaire',
    'Confirmation de commande',
    'Rappel de rendez-vous',
    'Nouveau message de support',
    'Annonce importante',
    'Feedback demandé',
  ];

  const sender = [
    'Jean Dupont',
    'Marie Curie',
    'Albert Einstein',
    'Isaac Newton',
    'Galilée',
    'Nikola Tesla',
    'Ada Lovelace',
    'Charles Darwin',
    'Rosalind Franklin',
    'Stephen Hawking',
  ];

  const dates = [
    '2023-10-01',
    '2023-10-02',
    '2023-10-03',
    '2023-10-04',
    '2023-10-05',
    '2023-10-06',
    '2023-10-07',
    '2023-10-08',
    '2023-10-09',
    '2023-10-10',
  ];

  btnAddMailItem.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * subjects.length);
    const mailItem = Bnum.HTMLBnumCardItemMail.Create(
      subjects[randomIndex],
      sender[randomIndex],
      dates[randomIndex],
    );

    element.add(mailItem);
  });

  btnClearItem.addEventListener('click', () => {
    element.clear();
  });
})();
