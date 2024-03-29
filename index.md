---
layout: default
title: Messagerie Mél
carousels:
  - images: 
    - image: /uploads/slider/accueil.png
    - image: /uploads/slider/mail.png
    - image: /uploads/slider/agenda.png
    - image: /uploads/slider/discussions.png
    - image: /uploads/slider/espaces-de-travail.png
    - image: /uploads/slider/documents.png
    - image: /uploads/slider/annuaire.png
---

La messagerie Mél est une intégration de plusieurs logiciels open-source, permettant d'avoir un ensemble de messagerie et d'outils collaboratifs performants et maitrisés.

- [Le Bnum basé sur Roundcube](#le-bnum-basé-sur-roundcube)
- [Le Courrielleur basé sur Thunderbird](#le-courrielleur-basé-sur-thunderbird)
- [La synchronisation des mobiles basée sur Z-Push](#la-synchronisation-des-mobiles-basée-sur-z-push)
- [La synchronisation CalDAV/CardDAV basée sur Sabre/DAV](#la-synchronisation-caldavcarddav-basée-sur-sabredav)
- [Planifier des réunions avec Pégase](#planifier-des-réunions-avec-pégase)
- [Le backend de messagerie](#le-backend-de-messagerie)

## Le Bnum basé sur Roundcube

Le bureau numérique des agents du MTECT. Il permet d'afficher dans une seule page web la messagerie Mél, les agendas individuels, partagés et d'équipes, des espaces de travail, la discussion instantanée (Rocket.Chat et bientôt Tchap), les documents via Nextcloud, l'annuaire et les contacts.

{% include carousel.html height="50" unit="%" duration="7" number="1" %}

Plus d'informations disponibles sur [la page officielle du Bnum](https://messagerie-melanie2.github.io/Bnum)

## Le Courrielleur basé sur Thunderbird

Le Courrielleur, un client lourd de messagerie, est basé sur Thunderbird et permet d'afficher la messagerie Mél, les agendas individuels, partagés et d'équipes, l'annuaire et les contacts.

![image](https://github.com/messagerie-melanie2/messagerie-melanie2.github.io/assets/3693239/5a76f13f-f30b-476d-9549-8e49b0503ecd)

Plus d'informations disponibles sur [la page officielle de Thunderbird](https://www.thunderbird.net/fr/)

## La synchronisation des mobiles basée sur Z-Push

Synchronisation des courriels, agendas et contacts sur les smartphones en se basant sur le protocole ActiveSync (synchronisation Exchange).

Plus d'informations disponibles sur [la page officielle de Z-Push](https://z-push.org/index.html)

## La synchronisation CalDAV/CardDAV basée sur Sabre/DAV

La synchronisation des agendas et contacts dans le Courrielleur est soutenue par un serveur Sabre/DAV. Elle permet également de synchroniser l'agenda et les contacts sur mobile, avec une application compatible CalDAV/CardDAV.

Plus d'informations disponibles sur [la page officielle de Sabre/DAV](https://sabre.io/)

## Planifier des réunions avec Pégase

Outil de planification de réunions et de prise de rendez-vous directement intégré à l'agenda de la messagerie Mél.

![image](https://github.com/messagerie-melanie2/messagerie-melanie2.github.io/assets/3693239/d1f61a61-cfdb-435b-8956-b1cd86c4d345)

Plus d'informations disponibles sur [la page officielle de Pégase](https://messagerie-melanie2.github.io/Pegase)

## Le backend de messagerie

Le backend est propulsé par des serveurs [Cyrus IMAP](https://www.cyrusimap.org/), [Postfix](https://www.postfix.org/), [OpenLDAP](https://www.openldap.org/) et [PostgreSQL](https://www.postgresql.org/).
