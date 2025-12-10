// --- Importe tes dépendances (date-fns, BnumCardItem, etc.) ---
import { EMPTY_STRING } from '@rotomeca/utils';
import { HTMLBnumCardItem } from '../bnum-card-item/bnum-card-item';
import { HTMLBnumDate } from '../../atoms/date/bnum-date';
import {
  endOfDay,
  format,
  isToday,
  isWithinInterval,
  startOfDay,
  subDays,
} from 'date-fns';
import style from './bnum-card-item-mail.less';
import JsEvent from '@rotomeca/event';
import { CallbackChangedSimple, Nullable } from '../../../core/utils/types';
import { EVENT_DEFAULT } from '../../../core/utils/constants/constants';
import { TAG_CARD_ITEM_MAIL } from '../../../core/utils/constants/tags';
import { Scheduler } from '../../../core/utils/scheduler';

const SHEET = HTMLBnumCardItem.ConstructCSSStyleSheet(style);

/**
 * Composant HTML personnalisé représentant un élément de carte mail.
 *
 * Permet d'afficher un sujet, un expéditeur et une date, avec possibilité d'override du contenu par défaut.
 *
 * Utilise des slots pour l'intégration dans le Shadow DOM et propose des méthodes pour forcer ou réinitialiser le contenu.
 *
 * Note: En passant par `data-date` ou `.updateDate()`, le format d'affichage de la date est ajusté selon la logique métier :
 * - Si la date est aujourd'hui, seule l'heure est affichée (HH:mm).
 * - Si la date est comprise entre hier et il y a 7 jours, le jour de la semaine et l'heure sont affichés (E - HH:mm).
 * - Sinon, le format par défaut de HTMLBnumDate est utilisé.
 *
 * @structure Item de carte mail
 * <bnum-card-item-mail data-date="now">
 * <span slot="subject">Sujet par défaut</span>
 * <span slot="sender">Expéditeur par défaut</span>
 * </bnum-card-item-mail>
 *
 * @structure Item de carte data
 * <bnum-card-item-mail data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
 * </bnum-card-item-mail>
 *
 * @structure Item de carte lue
 * <bnum-card-item-mail read data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
 * </bnum-card-item-mail>
 *
 * @state read - Actif quand le mail est marqué comme lu.
 *
 * @slot (default) - N'existe pas, si vous mettez du contenu en dehors des slots, ils ne seront pas affichés.
 * @slot sender - Contenu de l'expéditeur (texte ou HTML).
 * @slot subject - Contenu du sujet (texte ou HTML).
 * @slot date - Contenu de la date. /!\ Si vous passez par ce slot, la mécanique de formatage automatique de la date ne s'appliquera pas.
 */
export class HTMLBnumCardItemMail extends HTMLBnumCardItem {
  //#region Constants
  /**
   * Attribut data pour le sujet du mail.
   * @attr {string} (optional) data-subject - Sujet du mail.
   */
  static readonly DATA_SUBJECT = 'subject';
  static readonly ATTRIBUTE_DATA_SUBJECT = `data-${HTMLBnumCardItemMail.DATA_SUBJECT}`;
  /**
   * Attribut data pour la date du mail.
   * @attr {string} (optional) data-sender - Expéditeur du mail.
   */
  static readonly DATA_SENDER = 'sender';
  static readonly ATTRIBUTE_DATA_SENDER = `data-${HTMLBnumCardItemMail.DATA_SENDER}`;
  /**
   * Attribut data pour la date du mail.
   * @attr {string} (optional) data-date - Date du mail, optionnel, mais conseillé si vous voulez la logique de formatage automatique.
   */
  static readonly DATA_DATE = 'date';
  static readonly ATTRIBUTE_DATA_DATE = `data-${HTMLBnumCardItemMail.DATA_DATE}`;
  /**
   * Attribut pour marquer le mail comme lu.
   * @attr {boolean} (optional) read - Indique si le mail est lu.
   */
  static readonly ATTRIBUTE_READ = 'read';
  /**
   * Événement déclenché lors du changement de l'expéditeur du mail.
   * @event bnum-card-item-mail:sender-changed
   * @detail { caller: HTMLBnumCardItemMail }
   */
  static readonly EVENT_SENDER_CHANGED = 'bnum-card-item-mail:sender-changed';
  /**
   * Événement déclenché lors du changement du sujet du mail.
   * @event bnum-card-item-mail:subject-changed
   * @detail { caller: HTMLBnumCardItemMail }
   */
  static readonly EVENT_SUBJECT_CHANGED = 'bnum-card-item-mail:subject-changed';
  /**
   * Événement déclenché lors du changement de la date du mail.
   * @event bnum-card-item-mail:date-changed
   * @detail { caller: HTMLBnumCardItemMail }
   */
  static readonly EVENT_DATE_CHANGED = 'bnum-card-item-mail:date-changed';
  /**
   * Nom du slot pour l'expéditeur.
   */
  static readonly SLOT_SENDER_NAME = 'sender';
  /**
   * Nom du slot pour le sujet.
   */
  static readonly SLOT_SUBJECT_NAME = 'subject';
  /**
   * Nom du slot pour la date.
   */
  static readonly SLOT_DATE_NAME = 'date';
  /**
   * Nom de la part pour override de l'expéditeur.
   */
  static readonly PART_SENDER_OVERRIDE = 'sender-override';
  /**
   * Nom de la part pour override du sujet.
   */
  static readonly PART_SUBJECT_OVERRIDE = 'subject-override';
  /**
   * Nom de la part pour override de la date.
   */
  static readonly PART_DATE_OVERRIDE = 'date-override';
  /**
   * Classe CSS pour l'expéditeur.
   */
  static readonly CLASS_SENDER = 'sender';
  /**
   * Classe CSS pour le sujet.
   */
  static readonly CLASS_SUBJECT = 'subject';
  /**
   * Classe CSS pour la date.
   */
  static readonly CLASS_DATE = 'date';
  /**
   * Classe CSS pour le contenu principal.
   */
  static readonly CLASS_MAIN_CONTENT = 'main-content';
  static readonly ID_DATE_ELEMENT_OVERRIDE = 'date-element-override';
  static readonly ID_SENDER_SLOT = 'senderslot';
  static readonly ID_SUBJECT_SLOT = 'subjectslot';
  static readonly ID_DATE_SLOT = 'dateslot';
  /**
   * Nom de l'état "lu".
   */
  static readonly STATE_READ = 'read';
  /**
   * Format d'affichage de la date pour aujourd'hui.
   */
  static readonly TODAY_FORMAT = 'HH:mm';
  /**
   * Format d'affichage de la date pour les autres jours.
   */
  static readonly OTHER_DAY_FORMAT = 'dd/MM/yyyy';
  /**
   * Format d'affichage de la date pour la semaine.
   */
  static readonly WEEK_FORMAT = 'E - HH:mm';
  static readonly SYMBOL_RESET = Symbol('reset');
  //#endregion

  //#region Private fields
  // --- Slots du Shadow DOM ---
  /**
   * Slot pour la date dans le Shadow DOM.
   */
  #_slot_date: HTMLSlotElement | null = null;
  /**
   * Slot pour l'expéditeur dans le Shadow DOM.
   */
  #_slot_sender: HTMLSlotElement | null = null;

  // --- Conteneurs d'OVERRIDE (cachés par défaut) ---
  /**
   * Élément pour override de l'expéditeur.
   */
  #_override_sender: HTMLSpanElement | null = null;
  /**
   * Élément pour override du sujet.
   */
  #_override_subject: HTMLSpanElement | null = null;
  /**
   * Élément pour override de la date.
   */
  #_override_date: HTMLSpanElement | null = null;
  /**
   * Élément HTMLBnumDate utilisé pour override la date.
   */
  #_dateOverrideElement: HTMLBnumDate | null = null;
  /**
   * Scheduler pour la mise à jour du sujet.
   */
  #_subjectScheduler: Nullable<Scheduler<string | HTMLElement | Symbol>> = null;
  /**
   * Scheduler pour la mise à jour de la date.
   */
  #_dateScheduler: Nullable<Scheduler<string | Date | HTMLBnumDate | Symbol>> =
    null;
  /**
   * Scheduler pour la mise à jour de l'expéditeur.
   */
  #_senderScheduler: Nullable<Scheduler<string | HTMLElement | Symbol>> = null;
  //#endregion Private fields
  //#region Public fields
  /**
   * Événement déclenché lors du changement du sujet du mail.
   * Permet d'attacher des gestionnaires personnalisés au changement de sujet.
   */
  public onsubjectchanged: JsEvent<
    CallbackChangedSimple<HTMLBnumCardItemMail>
  > = new JsEvent<CallbackChangedSimple<HTMLBnumCardItemMail>>();

  /**
   * Événement déclenché lors du changement de l'expéditeur du mail.
   * Permet d'attacher des gestionnaires personnalisés au changement d'expéditeur.
   */
  public onsenderchanged: JsEvent<CallbackChangedSimple<HTMLBnumCardItemMail>> =
    new JsEvent<CallbackChangedSimple<HTMLBnumCardItemMail>>();

  /**
   * Événement déclenché lors du changement de la date du mail.
   * Permet d'attacher des gestionnaires personnalisés au changement de date.
   */
  public ondatechanged: JsEvent<CallbackChangedSimple<HTMLBnumCardItemMail>> =
    new JsEvent<CallbackChangedSimple<HTMLBnumCardItemMail>>();
  //#endregion Public fields

  //#region Getters
  /**
   * Retourne l'élément HTMLBnumDate pour l'override de la date.
   *
   * Initialise la variable si elle n'a pas encore été initialisée.
   */
  get #_lazyDateOverrideElement(): HTMLBnumDate {
    return (this.#_dateOverrideElement ??= (() => {
      const tmp = this.#_queryById<HTMLBnumDate>(
        this.#_override_date!,
        HTMLBnumCardItemMail.ID_DATE_ELEMENT_OVERRIDE,
      );

      this.#_configureDateElement(tmp);
      return tmp;
    })());
  }

  // --- Getters pour lire les data-attributs ---
  /**
   * Retourne le sujet du mail depuis l'attribut data.
   */
  get #_mailSubject(): string {
    return this.data(HTMLBnumCardItemMail.DATA_SUBJECT) || EMPTY_STRING;
  }
  /**
   * Retourne la date du mail depuis l'attribut data.
   */
  get #_mailDate(): string {
    return this.data(HTMLBnumCardItemMail.DATA_DATE) || EMPTY_STRING;
  }
  /**
   * Retourne l'expéditeur du mail depuis l'attribut data.
   */
  get #_mailSender(): string {
    return this.data(HTMLBnumCardItemMail.DATA_SENDER) || EMPTY_STRING;
  }
  //#endregion Getters

  //#region Lifecycle
  /**
   * Constructeur du composant.
   */
  constructor() {
    super();

    this.onsenderchanged.add(EVENT_DEFAULT, (sender) => {
      this.trigger(HTMLBnumCardItemMail.EVENT_SENDER_CHANGED, {
        caller: sender,
      });
    });

    this.onsubjectchanged.add(EVENT_DEFAULT, (sender) => {
      this.trigger(HTMLBnumCardItemMail.EVENT_SUBJECT_CHANGED, {
        caller: sender,
      });
    });

    this.ondatechanged.add(EVENT_DEFAULT, (sender) => {
      this.trigger(HTMLBnumCardItemMail.EVENT_DATE_CHANGED, { caller: sender });
    });
  }

  /**
   * Crée le layout du Shadow DOM (avec slots ET overrides).
   * @param container Le conteneur du Shadow DOM ou un élément HTML.
   */
  protected _p_buildDOM(container: ShadowRoot | HTMLElement): void {
    super._p_buildDOM(container);
    // Hydratation

    this.#_slot_sender = this.#_queryById<HTMLSlotElement>(
      container,
      HTMLBnumCardItemMail.ID_SENDER_SLOT,
    );
    this.#_override_sender = this.#_queryByClass<HTMLSpanElement>(
      container,
      HTMLBnumCardItemMail.PART_SENDER_OVERRIDE,
    );

    // On écrase _p_slot car dans notre template, il n'y a pas de slot par défaut
    this._p_slot = this.#_queryById<HTMLSlotElement>(
      container,
      HTMLBnumCardItemMail.ID_SUBJECT_SLOT,
    );
    this.#_override_subject = this.#_queryByClass<HTMLSpanElement>(
      container,
      HTMLBnumCardItemMail.PART_SUBJECT_OVERRIDE,
    );

    this.#_slot_date = this.#_queryById<HTMLSlotElement>(
      container,
      HTMLBnumCardItemMail.ID_DATE_SLOT,
    );
    this.#_override_date = this.#_queryByClass<HTMLSpanElement>(
      container,
      HTMLBnumCardItemMail.PART_DATE_OVERRIDE,
    );
  }

  /**
   * Crée le contenu par défaut et l'attache aux slots.
   * Initialise les nœuds pour le sujedate-element-overridet, l'expéditeur et la date.
   */
  protected _p_attach(): void {
    super._p_attach();

    if (this.#_mailSubject !== EMPTY_STRING)
      this._p_slot!.appendChild(this._p_createTextNode(this.#_mailSubject));

    // Crée le nœud texte pour l'EXPÉDITEUR par défaut
    if (this.#_mailSender !== EMPTY_STRING)
      this.#_slot_sender!.appendChild(
        this._p_createTextNode(this.#_mailSender),
      );

    if (this.#_mailDate !== EMPTY_STRING) {
      // Crée l'élément DATE par défaut
      const defaultDate = HTMLBnumDate.Create(this.#_mailDate);
      this.#_configureDateElement(defaultDate); // Applique la logique
      this.#_slot_date!.appendChild(defaultDate);
    }
  }

  /**
   * Retourne les stylesheets à appliquer au composant.
   * @returns Liste des CSSStyleSheet à appliquer.
   */
  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [...super._p_getStylesheets(), SHEET];
  }

  /**
   * Méthode appelée lors de la mise à jour d'un attribut observé.
   * @param name Nom de l'attribut.
   * @param oldVal Ancienne valeur.
   * @param newVal Nouvelle valeur.
   */
  protected _p_update(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    super._p_update(name, oldVal, newVal);

    if (this.hasAttribute(HTMLBnumCardItemMail.ATTRIBUTE_READ))
      this._p_addState(HTMLBnumCardItemMail.STATE_READ);
  }

  /**
   * Retourne le template HTML utilisé pour le composant.
   * @returns Le template HTML.
   */
  protected _p_fromTemplate(): HTMLTemplateElement | null {
    return TEMPLATE;
  }
  //#endregion Lifecycle

  //#region Public methods
  /**
   * Force le contenu de l'expéditeur, en ignorant le slot.
   * @param content Contenu texte ou HTML à afficher comme expéditeur.
   * @returns L'instance courante pour chaînage.
   */
  updateSender(content: string | HTMLElement): this {
    return this.#_requestUpdateSender(content);
  }

  /**
   * Réaffiche le contenu du slot "sender" (annule l'override).
   * @returns L'instance courante pour chaînage.
   */
  resetSender(): this {
    return this.#_requestUpdateSender(HTMLBnumCardItemMail.SYMBOL_RESET);
  }

  /**
   * Force le contenu du sujet, en ignorant le slot.
   * @param content Contenu texte ou HTML à afficher comme sujet.
   * @returns L'instance courante pour chaînage.
   */
  updateSubject(content: string | HTMLElement): this {
    return this.#_requestUpdateSubject(content);
  }

  /**
   * Réaffiche le contenu du slot "subject" (annule l'override).
   * @returns L'instance courante pour chaînage.
   */
  resetSubject(): this {
    return this.#_requestUpdateSubject(HTMLBnumCardItemMail.SYMBOL_RESET);
  }

  /**
   * Force le contenu de la date, en ignorant le slot.
   * @param content Chaîne, Date ou élément HTML à afficher comme date.
   * @returns L'instance courante pour chaînage.
   */
  updateDate(content: string | Date | HTMLBnumDate): this {
    return this.#_requestUpdateDate(content);
  }

  /**
   * Réaffiche le contenu du slot "date" (annule l'override).
   * @returns L'instance courante pour chaînage.
   */
  resetDate(): this {
    return this.#_requestUpdateDate(HTMLBnumCardItemMail.SYMBOL_RESET);
  }
  //#endregion Public methods
  //#region Private methods
  /**
   * Met à jour l'affichage de l'expéditeur (slot ou override).
   * @param content Contenu à afficher ou symbole de reset.
   */
  #_updateSender(content: string | HTMLElement | Symbol): void {
    if (!this.#_override_sender || !this.#_slot_sender) return;

    if (content === HTMLBnumCardItemMail.SYMBOL_RESET) {
      this.#_slot_sender.hidden = false;
      this.#_override_sender.hidden = true;
    } else {
      if (typeof content === 'string')
        this.#_override_sender.innerHTML = content;
      else this.#_override_sender.replaceChildren(content as HTMLElement);

      // On cache le slot, on montre l'override
      this.#_slot_sender.hidden = true;
      this.#_override_sender.hidden = false;
    }

    this.onsenderchanged.call(this);
  }

  /**
   * Planifie la mise à jour de l'expéditeur.
   * @param content Contenu à afficher ou symbole de reset.
   * @returns L'instance courante pour chaînage.
   */
  #_requestUpdateSender(content: string | HTMLElement | Symbol): this {
    (this.#_senderScheduler ??= new Scheduler<string | HTMLElement | Symbol>(
      (value) => this.#_updateSender(value!),
    )).schedule(content);

    return this;
  }

  /**
   * Met à jour l'affichage du sujet (slot ou override).
   * @param content Contenu à afficher ou symbole de reset.
   */
  #_updateSubject(content: string | HTMLElement | Symbol): void {
    if (!this.#_override_subject || !this._p_slot) return;

    if (content === HTMLBnumCardItemMail.SYMBOL_RESET) {
      this._p_slot.hidden = false;
      this.#_override_subject.hidden = true;
    } else if (typeof content === 'string')
      this.#_override_subject.innerHTML = content;
    else this.#_override_subject.replaceChildren(content as HTMLElement);

    // On cache le slot, on montre l'override
    this._p_slot.hidden = true;
    this.#_override_subject.hidden = false;

    this.onsubjectchanged.call(this);
  }

  /**
   * Planifie la mise à jour du sujet.
   * @param content Contenu à afficher ou symbole de reset.
   * @returns L'instance courante pour chaînage.
   */
  #_requestUpdateSubject(content: string | HTMLElement | Symbol): this {
    (this.#_subjectScheduler ??= new Scheduler<string | HTMLElement | Symbol>(
      (value) => this.#_updateSubject(value!),
    )).schedule(content);

    return this;
  }

  /**
   * Met à jour l'affichage de la date (slot ou override).
   * @param content Contenu à afficher ou symbole de reset.
   */
  #_updateDate(content: string | Date | HTMLBnumDate | Symbol): void {
    if (!this.#_override_date || !this.#_slot_date) return;

    if (content === HTMLBnumCardItemMail.SYMBOL_RESET) {
      this.#_slot_date.hidden = false;
      this.#_override_date.hidden = true;
    } else {
      if (typeof content === 'string' || content instanceof Date)
        this.#_lazyDateOverrideElement.setDate(content);
      else
        this.#_lazyDateOverrideElement.setDate(
          (content as HTMLBnumDate).getDate()!,
        );

      this.#_slot_date.hidden = true;
      this.#_override_date.hidden = false;
    }

    this.ondatechanged.call(this);
  }

  /**
   * Planifie la mise à jour de la date.
   * @param content Contenu à afficher ou symbole de reset.
   * @returns L'instance courante pour chaînage.
   */
  #_requestUpdateDate(content: string | Date | HTMLBnumDate | Symbol): this {
    (this.#_dateScheduler ??= new Scheduler<
      string | Date | HTMLBnumDate | Symbol
    >((value) => this.#_updateDate(value!))).schedule(content);

    return this;
  }

  /**
   * Recherche un élément par son id dans le container donné.
   * @param container Container dans lequel chercher.
   * @param id Id de l'élément.
   * @returns L'élément trouvé.
   */
  #_queryById<T extends HTMLElement>(
    container: ShadowRoot | HTMLElement,
    id: string,
  ): T {
    return container instanceof ShadowRoot
      ? (container.getElementById(id) as T)
      : (container.querySelector(`#${id}`) as T);
  }

  /**
   * Recherche un élément par sa classe dans le container donné.
   * @param container Container dans lequel chercher.
   * @param className Classe de l'élément.
   * @returns L'élément trouvé.
   */
  #_queryByClass<T extends HTMLElement>(
    container: ShadowRoot | HTMLElement,
    className: string,
  ): T {
    return container instanceof ShadowRoot
      ? (container.querySelector(`.${className}`) as T)
      : (container.getElementsByClassName(className)?.[0] as T);
  }

  /**
   * Configure le format d'affichage de la date selon la logique métier :
   * - Affiche l'heure si la date est aujourd'hui.
   * - Affiche le jour et l'heure si la date est comprise entre hier et il y a 7 jours.
   * - Sinon, conserve le format par défaut.
   * @param element Instance de HTMLBnumDate à configurer.
   */
  #_configureDateElement(element: HTMLBnumDate): void {
    HTMLBnumCardItemMail.SetDateLogique(element);
  }

  //#endregion Private methods

  //#region Static methods
  /**
   * Applique la logique de formatage de date à un élément HTMLBnumDate.
   * @param element Élément HTMLBnumDate à configurer.
   */
  static SetDateLogique(element: HTMLBnumDate): void {
    element.formatEvent.add(EVENT_DEFAULT, (param) => {
      const originalDate = element.getDate();
      if (!originalDate) return param;
      if (isToday(originalDate)) {
        return {
          date: format(originalDate, HTMLBnumCardItemMail.TODAY_FORMAT),
        };
      }
      const now = new Date();
      const startOfInterval = startOfDay(subDays(now, 7));
      const endOfInterval = endOfDay(subDays(now, 1));
      if (
        isWithinInterval(originalDate, {
          start: startOfInterval,
          end: endOfInterval,
        })
      ) {
        return {
          date: format(originalDate, HTMLBnumCardItemMail.WEEK_FORMAT, {
            locale: element.localeElement,
          }),
        };
      }
      return {
        date: format(originalDate, HTMLBnumCardItemMail.OTHER_DAY_FORMAT, {
          locale: element.localeElement,
        }), // Format par défaut si aucune condition n'est remplie
      };
    });
  }

  static _p_observedAttributes(): string[] {
    return [
      ...super._p_observedAttributes(),
      HTMLBnumCardItemMail.ATTRIBUTE_READ,
    ];
  }

  /**
   * Crée une nouvelle instance du composant avec les valeurs fournies.
   * @param subject Sujet du mail.
   * @param sender Expéditeur du mail.
   * @param date Date du mail
   * @returns Instance HTMLBnumCardItemMail.
   */
  static Create(
    subject: string,
    sender: string,
    date: string | Date,
  ): HTMLBnumCardItemMail {
    let node = document.createElement(
      HTMLBnumCardItemMail.TAG,
    ) as HTMLBnumCardItemMail;

    node.attr(HTMLBnumCardItemMail.ATTRIBUTE_DATA_SUBJECT, subject);
    node.attr(HTMLBnumCardItemMail.ATTRIBUTE_DATA_SENDER, sender);

    if (typeof date === 'string')
      node.attr(HTMLBnumCardItemMail.ATTRIBUTE_DATA_DATE, date);
    else
      node.attr(HTMLBnumCardItemMail.ATTRIBUTE_DATA_DATE, date.toISOString());

    return node;
  }

  /**
   * Retourne le tag HTML du composant.
   */
  static get TAG(): string {
    return TAG_CARD_ITEM_MAIL;
  }
  //#endregion Static methods
}

const TEMPLATE = HTMLBnumCardItem.CreateChildTemplate(
  `
  <div class="${HTMLBnumCardItemMail.CLASS_MAIN_CONTENT}">
    <div class="${HTMLBnumCardItemMail.CLASS_SENDER}">
      <slot id="${HTMLBnumCardItemMail.ID_SENDER_SLOT}" name="${HTMLBnumCardItemMail.SLOT_SENDER_NAME}"></slot>
      <span class="${HTMLBnumCardItemMail.PART_SENDER_OVERRIDE}" part="${HTMLBnumCardItemMail.PART_SENDER_OVERRIDE}" hidden></span>
    </div>
    <div class="${HTMLBnumCardItemMail.CLASS_SUBJECT}">
      <slot id="${HTMLBnumCardItemMail.ID_SUBJECT_SLOT}" name="${HTMLBnumCardItemMail.SLOT_SUBJECT_NAME}"></slot>
      <span class="${HTMLBnumCardItemMail.PART_SUBJECT_OVERRIDE}" part="${HTMLBnumCardItemMail.PART_SUBJECT_OVERRIDE}" hidden></span>
    </div>
  </div>
  <div class="${HTMLBnumCardItemMail.CLASS_DATE}">
    <slot id="${HTMLBnumCardItemMail.ID_DATE_SLOT}" name="${HTMLBnumCardItemMail.SLOT_DATE_NAME}"></slot>
    <span class="${HTMLBnumCardItemMail.PART_DATE_OVERRIDE}" part="${HTMLBnumCardItemMail.PART_DATE_OVERRIDE}" hidden>
      <${HTMLBnumDate.TAG} id="${HTMLBnumCardItemMail.ID_DATE_ELEMENT_OVERRIDE}"></${HTMLBnumDate.TAG}>
    </span>
  </div>
  `,
  { defaultSlot: false },
);

//#region TryDefine
HTMLBnumCardItemMail.TryDefine();
//#endregion
