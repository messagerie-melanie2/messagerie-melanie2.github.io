import { EMPTY_STRING } from '@rotomeca/utils';
import { HTMLBnumCardItem } from '../bnum-card-item/bnum-card-item';
import { JsCircularEvent } from '@rotomeca/event';
import { HTMLBnumDate } from '../../atoms/date/bnum-date';
import { addDays, format, isSameDay, parse } from 'date-fns';
import { EVENT_DEFAULT } from '../../../core/utils/constants/constants';
import { Nullable } from '../../../core/utils/types';
import { CapitalizeLine } from '@rotomeca/utils';
import { TAG_CARD_ITEM_AGENDA } from '../../../core/utils/constants/tags';
import style from './bnum-card-item-agenda.less';
import { HTMLBnumIcon } from '../../atoms/icon/bnum-icon';
import { BnumConfig } from '../../../core/utils/configclass';
import { Scheduler } from '../../../core/utils/scheduler';

const SHEET = HTMLBnumCardItem.ConstructCSSStyleSheet(style);

/**
 * Type de callback pour la définition de l'action au démarrage.
 * Permet de personnaliser l'action affichée dans la carte agenda.
 */
export declare type OnStartDefineActionCallback = (param: {
  location: string;
  action: HTMLElement | null | undefined;
}) => {
  location: string;
  action: HTMLElement | null | undefined;
};

/**
 * Type pour la création d'une action d'événement.
 */
export declare type EventCreationAction =
  | Nullable<{ element: HTMLElement; callback: () => void }>
  | Nullable<OnStartDefineActionCallback>;

/**
 * Options pour la création d'une instance HTMLBnumCardItemAgenda.
 */
export declare type CreateConstructorOptions = {
  allDay?: boolean;
  title?: Nullable<string>;
  location?: Nullable<string>;
  action?: Nullable<EventCreationAction>;
  isPrivate?: Nullable<boolean>;
  mode?: Nullable<string>;
};

/**
 * Options pour la création d'une instance HTMLBnumCardItemAgenda à partir d'un événement.
 */
export declare type FromEventConstructorOptions = {
  startDateSelector?: Nullable<(agendaEvent: any) => Date>;
  endDateSelector?: Nullable<(agendaEvent: any) => Date>;
  allDaySelector?: Nullable<(agendaEvent: any) => boolean>;
  titleSelector?: Nullable<(agendaEvent: any) => string>;
  locationSelector?: Nullable<(agendaEvent: any) => string>;
  action?: Nullable<EventCreationAction>;
};
/**
 * Item de carte agenda
 *
 * @structure Initalisation basique
 * <bnum-card-item-agenda
 *    data-date="2024-01-01"
 *    data-start-date="2024-01-01 08:00:00"
 *    data-end-date="2024-01-01 10:00:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 *
 * @structure Exemple avec des dates de départs et fin différentes du jour de base
 * <bnum-card-item-agenda
 *    data-date="2025-11-20"
 *    data-start-date="2025-10-20 09:40:00"
 *    data-end-date="2025-12-20 10:10:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 *
 * @structure Exemple de journée entière
 * <bnum-card-item-agenda all-day
 *    data-date="2025-11-21"
 *    data-title="Télétravail"
 *    data-location="A la maison">
 * </bnum-card-item-agenda>
 *
 *
 * @structure Exemple avec des slots
 * <bnum-card-item-agenda
 *    data-date="2025-11-20"
 *    data-start-date="2025-11-20 09:40:00"
 *    data-end-date="2025-11-20 10:10:00">
 *   <span slot="title">Réunion de projet avec l'équipe marketing</span>
 *   <span slot="location">Salle de conférence, Bâtiment A</span>
 *   <bnum-primary-button slot="action" rounded data-icon='video_camera_front' data-icon-margin="0" onclick="alert('Action déclenchée !')"></bnum-primary-button>
 * </bnum-card-item-agenda>
 *
 * @structure Exemple de journée privée
 * <bnum-card-item-agenda all-day private
 *    data-date="2025-11-21"
 *    data-title="Télétravail"
 *    data-location="A la maison">
 * </bnum-card-item-agenda>
 *
 * @structure Exemple de journée avec un mode
 * <bnum-card-item-agenda all-day mode="telework"
 *    data-date="2025-11-21"
 *    data-title="Télétravail"
 *    data-location="A la maison">
 * </bnum-card-item-agenda>
 *
 * @slot title - Contenu du titre de l'événement
 * @slot location - Contenu du lieu de l'événement
 * @slot action - Contenu de l'action de l'événement (bouton etc...)
 *
 * @state no-location - Actif quand le lieu n'est pas défini
 * @state all-day - Actif quand l'événement dure toute la journée
 * @state private - Actif quand l'événement est privé
 * @state mode-X - Actif quand le mode de l'événement est défini à "X" (remplacer X par le mode)
 * @state action - Actif quand une action est définie pour l'événement
 *
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-gap - Contrôle l'espacement général entre les éléments du composant.
 * @cssvar {var(--bnum-font-weight-bold, 700)} --bnum-card-item-agenda-date-bold - Poids de police pour les textes en gras (date).
 * @cssvar {var(--bnum-font-weight-medium, 500)} --bnum-card-item-agenda-date-bold-medium - Poids de police medium pour certains textes.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-padding-right-hour - Padding à droite de l'heure.
 * @cssvar {0} --bnum-card-item-agenda-padding-left-hour - Padding à gauche de l'heure.
 * @cssvar {0} --bnum-card-item-agenda-padding-top-hour - Padding en haut de l'heure.
 * @cssvar {0} --bnum-card-item-agenda-padding-bottom-hour - Padding en bas de l'heure.
 * @cssvar {var(--bnum-border-surface, 1px solid #E0E0E0)} --bnum-card-item-agenda-date-border-right - Bordure à droite de l'heure.
 * @cssvar {none} --bnum-card-item-agenda-date-border-left - Bordure à gauche de l'heure.
 * @cssvar {none} --bnum-card-item-agenda-date-border-top - Bordure en haut de l'heure.
 * @cssvar {none} --bnum-card-item-agenda-date-border-bottom - Bordure en bas de l'heure.
 * @cssvar {var(--bnum-font-size-xs, 12px)} --bnum-card-item-agenda-location-font-size - Taille de police pour le lieu.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-private-icon-top - Position top de l'icône privée.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-private-icon-right - Position right de l'icône privée.
 * @cssvar {italic} --bnum-card-item-agenda-telework-font-style - Style de police en mode télétravail.
 * @cssvar {'\e88a'} --bnum-card-item-agenda-telework-icon-content - Contenu de l'icône télétravail.
 * @cssvar {var(--bnum-icon-font-family, 'Material Symbols Outlined')} --bnum-card-item-agenda-telework-icon-font-family - Famille de police de l'icône télétravail.
 * @cssvar {var(--bnum-font-size-xxl, 32px)} --bnum-card-item-agenda-telework-icon-font-size - Taille de l'icône télétravail.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-telework-icon-bottom - Position bottom de l'icône télétravail.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-telework-icon-right - Position right de l'icône télétravail.
 * @cssvar {20px} --bnum-card-item-agenda-telework-action-margin-right - Marge à droite de l'action en mode télétravail.
 */
export class HTMLBnumCardItemAgenda extends HTMLBnumCardItem {
  //#region Constants
  /** Attribut HTML pour indiquer un événement sur toute la journée
   * @attr {boolean | string | undefined} (optional) (default: undefined) all-day - Indique si l'événement dure toute la journée
   */
  static readonly ATTRIBUTE_ALL_DAY: string = 'all-day';
  /** Attribut HTML pour indiquer un événement privé
   * @attr {boolean | string | undefined} (optional) (default: undefined) private - Indique si l'événement est privé
   */
  static readonly ATTRIBUTE_PRIVATE: string = 'private';
  /** Attribut HTML pour indiquer le mode de l'événement
   * @attr {string | undefined} (optional) (default: undefined) mode - Indique le mode de l'événement et permet des affichages visuels (custom ou non) en fonction de celui-ci. Créer l'état CSS `mode-X`.
   */
  static readonly ATTRIBUTE_MODE: string = 'mode';
  /** Attribut HTML pour le titre (data-title)
   * @attr {string | undefined} (optional) (default: undefined) data-title - Titre de l'événement
   */
  static readonly ATTRIBUTE_DATA_TITLE: string = 'data-title';
  /** Attribut HTML pour le lieu (data-location)
   * @attr {string | undefined} (optional) (default: undefined) data-location - Lieu de l'événement
   */
  static readonly ATTRIBUTE_DATA_LOCATION: string = 'data-location';
  /** Clé de donnée pour la date de base
   * @attr {string | undefined} data-date - Date de base de l'événement
   */
  static readonly DATA_DATE: string = 'date';
  /** Clé de donnée pour le format de la date de base
   * @attr {string | undefined} (optional) (default: yyyy-MM-dd) data-date-format - Format de la date de base de l'événement
   */
  static readonly DATA_DATE_FORMAT: string = 'date-format';
  /** Clé de donnée pour la date de début
   * @attr {string | undefined} data-start-date - Date de début de l'événement
   */
  static readonly DATA_START_DATE: string = 'start-date';
  /** Clé de donnée pour le format de la date de début
   * @attr {string | undefined} (optional) (default: yyyy-MM-dd HH:mm:ss) data-start-date-format - Format de la date de début de l'événement
   */
  static readonly DATA_START_DATE_FORMAT: string = 'start-date-format';
  /** Clé de donnée pour la date de fin
   * @attr {string | undefined} data-end-date - Date de fin de l'événement
   */
  static readonly DATA_END_DATE: string = 'end-date';
  /** Clé de donnée pour le format de la date de fin
   * @attr {string | undefined} (optional) (default: yyyy-MM-dd HH:mm:ss) data-end-date-format - Format de la date de fin de l'événement
   */
  static readonly DATA_END_DATE_FORMAT: string = 'end-date-format';
  /** Clé de donnée pour le titre */
  static readonly DATA_TITLE: string = 'title';
  /** Clé de donnée pour le lieu */
  static readonly DATA_LOCATION: string = 'location';
  /** Format par défaut pour la date (ex: 2024-01-01) */
  static readonly FORMAT_DATE_DEFAULT: string = 'yyyy-MM-dd';
  /** Format par défaut pour la date et l'heure (ex: 2024-01-01 08:00:00) */
  static readonly FORMAT_DATE_TIME_DEFAULT: string = 'yyyy-MM-dd HH:mm:ss';
  /** Format par défaut pour l'heure (ex: 08:00) */
  static readonly FORMAT_HOUR_DEFAULT: string = 'HH:mm';
  /** Format pour l'heure si le jour est différent (ex: 20/11) */
  static readonly FORMAT_HOUR_DIFF_DAY: string = 'dd/MM';
  /** Texte pour "Aujourd'hui" (localisé) */
  static readonly FORMAT_TODAY: string = BnumConfig.Get('local_keys')!.today!;
  /** Texte pour "Demain" (localisé) */
  static readonly FORMAT_TOMORROW: string =
    BnumConfig.Get('local_keys')!.tomorrow!;
  /** Format pour la date d'événement (ex: lundi 20 novembre) */
  static readonly FORMAT_EVENT_DATE: string = 'EEEE dd MMMM';
  /** Classe CSS pour le jour de l'agenda */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_DAY = 'bnum-card-item-agenda-day';
  /** Classe CSS pour l'heure de l'agenda */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_HOUR =
    'bnum-card-item-agenda-hour';
  /** Classe CSS pour le titre de l'agenda */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_TITLE =
    'bnum-card-item-agenda-title';
  /** Classe CSS pour le lieu de l'agenda */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION =
    'bnum-card-item-agenda-location';
  /** Classe CSS pour l'action de l'agenda */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_ACTION =
    'bnum-card-item-agenda-action';
  /** Classe CSS pour le titre en override */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_TITLE_OVERRIDE =
    'bnum-card-item-agenda-title-override';
  /** Classe CSS pour le lieu en override */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION_OVERRIDE =
    'bnum-card-item-agenda-location-override';
  /** Classe CSS pour l'action en override */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_ACTION_OVERRIDE =
    'bnum-card-item-agenda-action-override';
  /** Classe CSS pour la disposition horizontale */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_HORIZONTAL =
    'bnum-card-item-agenda-horizontal';
  /** Classe CSS pour la disposition verticale */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_VERTICAL =
    'bnum-card-item-agenda-vertical';
  /** Classe CSS pour l'affichage "toute la journée" */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_ALL_DAY =
    'bnum-card-item-agenda-all-day';
  /** Classe CSS pour l'icône privée */
  static readonly CLASS_BNUM_CARD_ITEM_AGENDA_PRIVATE_ICON =
    'bnum-card-item-agenda-private-icon';
  /** Nom du slot pour le titre */
  static readonly SLOT_NAME_TITLE: string = 'title';
  /** Nom du slot pour le lieu */
  static readonly SLOT_NAME_LOCATION: string = 'location';
  /** Nom du slot pour l'action */
  static readonly SLOT_NAME_ACTION: string = 'action';
  /** État CSS pour absence de lieu */
  static readonly STATE_NO_LOCATION: string = 'no-location';
  /** État CSS pour "toute la journée" */
  static readonly STATE_ALL_DAY: string = 'all-day';
  /** État CSS pour événement privé */
  static readonly STATE_PRIVATE: string = 'private';
  /** Préfixe d'état CSS pour le mode */
  static readonly STATE_MODE_PREFIX: string = 'mode-';
  /**
   * État CSS lorsque l'action est définie
   */
  static readonly STATE_ACTION_DEFINED: string = 'action';
  /** Texte affiché pour "toute la journée" (localisé) */
  static readonly TEXT_ALL_DAY: string = BnumConfig.Get('local_keys')!.day!;
  /** Attribut d'état interne pour la gestion du rendu différé */
  static readonly ATTRIBUTE_PENDING: string = 'agenda_all';
  /** Mode par défaut */
  static readonly MODE_DEFAULT: string = 'default';
  /** Nom de l'icône pour les événements privés */
  static readonly ICON_PRIVATE: string = 'lock';
  /** Symbole pour la réinitialisation interne */
  static readonly SYMBOL_RESET: Symbol = Symbol('reset');

  //#endregion
  //#region Private Fields
  #_sd: Nullable<Date> = null;
  #_ed: Nullable<Date> = null;
  #_bd: Nullable<Date> = null;
  #_pr: Nullable<boolean> = null;
  #_spanDate: HTMLSpanElement | null = null;
  #_spanHour: HTMLSpanElement | null = null;
  #_slotLocation: HTMLSlotElement | null = null;
  #_slotTitle: HTMLSlotElement | null = null;
  #_slotAction: HTMLSlotElement | null = null;
  #_overrideAction: HTMLDivElement | null = null;
  #_overrideLocation: HTMLDivElement | null = null;
  #_overrideTitle: HTMLDivElement | null = null;
  #_privateIcon: Nullable<HTMLBnumIcon> = null;
  #_spanAllday: Nullable<HTMLSpanElement> = null;
  #_bnumDateStart: Nullable<HTMLBnumDate> = null;
  #_bnumDateEnd: Nullable<HTMLBnumDate> = null;
  #_shedulerTitle: Nullable<Scheduler<HTMLElement | string | Symbol>> = null;
  #_shedulerLocation: Nullable<Scheduler<HTMLElement | string | Symbol>> = null;
  #_shedulerAction: Nullable<Scheduler<HTMLElement | Symbol>> = null;
  /**
   * Événement circulaire déclenché lors de la définition de l'action.
   * Permet de personnaliser l'action affichée dans la carte agenda.
   */
  #_onstartdefineaction: Nullable<
    JsCircularEvent<OnStartDefineActionCallback>
  > = null;
  //#endregion
  //#region Public Fields
  //#endregion
  //#region Getters/Setters
  /**
   * Événement circulaire déclenché lors de la définition de l'action.
   *
   * Permet de personnaliser l'action affichée dans la carte agenda.
   */
  get onstartdefineaction(): JsCircularEvent<OnStartDefineActionCallback> {
    this.#_onstartdefineaction ??=
      new JsCircularEvent<OnStartDefineActionCallback>();

    return this.#_onstartdefineaction;
  }
  /**
   * Indique si l'événement dure toute la journée.
   */
  get isAllDay(): boolean {
    return this.hasAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_ALL_DAY);
  }
  /**
   * Date de base de l'événement (jour affiché).
   */
  get baseDate(): Date {
    return (
      this.#_bd ?? parse(this.#_baseDate, this.#_baseDateFormat, new Date())
    );
  }
  set baseDate(value: Date) {
    const oldValue = this.#_bd;
    this.#_bd = value;
    this.#_bnumDateStart?.askRender?.();
    this.#_bnumDateEnd?.askRender?.();
    this._p_addPendingAttribute(
      HTMLBnumCardItemAgenda.ATTRIBUTE_PENDING,
      oldValue === null ? null : format(oldValue, this.#_baseDateFormat),
      format(value, this.#_baseDateFormat),
    )._p_requestAttributeUpdate();
  }
  /**
   * Date de début de l'événement.
   */
  get startDate(): Date {
    return (
      this.#_sd ?? parse(this.#_startDate, this.#_startDateFormat, new Date())
    );
  }
  set startDate(value: Date) {
    const oldValue = this.#_sd;
    this.#_sd = value;
    this.#_bnumDateEnd?.askRender?.();
    this._p_addPendingAttribute(
      HTMLBnumCardItemAgenda.ATTRIBUTE_PENDING,
      oldValue === null ? null : format(oldValue, this.#_startDateFormat),
      format(value, this.#_startDateFormat),
    )._p_requestAttributeUpdate();
  }
  /**
   * Date de fin de l'événement.
   */
  get endDate(): Date {
    return this.#_ed ?? parse(this.#_endDate, this.#_endDateFormat, new Date());
  }
  set endDate(value: Date) {
    const oldValue = this.#_ed;
    this.#_ed = value;
    this.#_bnumDateStart?.askRender?.();
    this._p_addPendingAttribute(
      HTMLBnumCardItemAgenda.ATTRIBUTE_PENDING,
      oldValue === null ? null : format(oldValue, this.#_endDateFormat),
      format(value, this.#_endDateFormat),
    )._p_requestAttributeUpdate();
  }
  get private(): boolean {
    return this.#_pr ?? this.#_private;
  }
  set private(value: boolean) {
    const oldValue = this.#_pr;
    this.#_pr = value;

    this._p_addPendingAttribute(
      HTMLBnumCardItemAgenda.ATTRIBUTE_PENDING,
      JSON.stringify(oldValue),
      JSON.stringify(value),
    )._p_requestAttributeUpdate();
  }
  get #_private(): boolean {
    return this.hasAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_PRIVATE);
  }
  get #_getMode(): string {
    return (
      this.getAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_MODE) ||
      HTMLBnumCardItemAgenda.MODE_DEFAULT
    );
  }
  get #_baseDate(): string {
    return this.data(HTMLBnumCardItemAgenda.DATA_DATE) || EMPTY_STRING;
  }
  get #_baseDateFormat(): string {
    return (
      this.data(HTMLBnumCardItemAgenda.DATA_DATE_FORMAT) ||
      HTMLBnumCardItemAgenda.FORMAT_DATE_DEFAULT
    );
  }
  get #_startDate(): string {
    return this.data(HTMLBnumCardItemAgenda.DATA_START_DATE) || EMPTY_STRING;
  }
  get #_startDateFormat(): string {
    return (
      this.data(HTMLBnumCardItemAgenda.DATA_START_DATE_FORMAT) ||
      HTMLBnumCardItemAgenda.FORMAT_DATE_TIME_DEFAULT
    );
  }
  get #_endDate(): string {
    return this.data(HTMLBnumCardItemAgenda.DATA_END_DATE) || EMPTY_STRING;
  }
  get #_endDateFormat(): string {
    return (
      this.data(HTMLBnumCardItemAgenda.DATA_END_DATE_FORMAT) ||
      HTMLBnumCardItemAgenda.FORMAT_DATE_TIME_DEFAULT
    );
  }
  get #_title(): Nullable<string> {
    return this.data(HTMLBnumCardItemAgenda.DATA_TITLE);
  }
  get #_location(): Nullable<string> {
    return this.data(HTMLBnumCardItemAgenda.DATA_LOCATION);
  }
  //#endregion

  constructor() {
    super();
  }

  //#region Lifecycle Hooks
  /**
   * Récupère le style CSS à appliquer au composant.
   * @returns Chaîne de style CSS à appliquer au composant.
   */
  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [...super._p_getStylesheets(), SHEET];
  }

  /**
   * Précharge les données nécessaires à l'initialisation du composant.
   */
  protected _p_preload(): void {
    super._p_preload();

    this.#_sd = this.startDate;
    this.#_ed = this.endDate;
  }

  protected _p_buildDOM(container: ShadowRoot | HTMLElement): void {
    // Note: BnumElement a déjà cloné le template dans 'container' grâce à _p_fromTemplate
    super._p_buildDOM(container);

    // Récupération des références du Template
    // On utilise '!' car on sait que le template contient ces classes
    this.#_spanDate = container.querySelector(
      `.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_DAY}`,
    );
    this.#_spanHour = container.querySelector(
      `.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_HOUR}`,
    );

    // Slots et Overrides
    const slots = container.querySelectorAll('slot');
    this.#_slotTitle = slots[0];
    this.#_slotLocation = slots[1];
    this.#_slotAction = slots[2];

    this.#_overrideTitle = container.querySelector(
      `.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_TITLE_OVERRIDE}`,
    );
    this.#_overrideLocation = container.querySelector(
      `.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION_OVERRIDE}`,
    );
    this.#_overrideAction = container.querySelector(
      `.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ACTION_OVERRIDE}`,
    );

    // Initialisation UNIQUE des sous-composants (Date & Heure)
    // On crée les composants maintenant, on les mettra à jour dans renderDOM
    const dateHtml = this.#_generateDateHtml(new Date());
    this.#_spanDate!.appendChild(dateHtml);

    // Création des heures (Start / End)
    this.#_bnumDateStart = this.setHourLogic(HTMLBnumDate.Create(new Date()));
    this.#_bnumDateEnd = this.setHourLogic(HTMLBnumDate.Create(new Date()));

    // Création du label "Toute la journée" (caché par défaut)
    this.#_spanAllday = this._p_createSpan({
      classes: [HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ALL_DAY],
      child: HTMLBnumCardItemAgenda.TEXT_ALL_DAY,
    });
    this.#_spanAllday.hidden = true;

    // On attache tout au DOM maintenant (pour ne plus y toucher)
    this.#_spanHour!.append(
      this.#_bnumDateStart,
      this.#_bnumDateEnd,
      this.#_spanAllday,
    );

    // Initialisation de l'icône privée
    this.#_privateIcon = container.querySelector(
      `.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_PRIVATE_ICON}`,
    );
  }

  /**
   * Attache le composant au DOM et initialise les valeurs par défaut.
   */
  protected _p_attach(): void {
    super._p_attach();

    if (this._p_slot) this._p_slot.hidden = true;

    if (this.#_title) {
      const defaultTitle: Text = document.createTextNode(this.#_title);
      this.#_slotTitle!.appendChild(defaultTitle);
    }

    if (this.#_location) {
      const defaultLocation: Text = document.createTextNode(this.#_location);
      this.#_slotLocation!.appendChild(defaultLocation);
    }

    this.#_renderDOM();
    this.#_release();
  }

  /**
   * Libère les attributs data- utilisés pour l'initialisation.
   */
  #_release(): void {
    this.#_startDate;
    this.#_endDate;
    this.#_startDateFormat;
    this.#_endDateFormat;
    this.#_baseDate;
    this.#_baseDateFormat;
  }

  /**
   * Met à jour le rendu du composant.
   */
  protected _p_render() {
    super._p_render();

    this.#_renderDOM();
  }

  /**
   * Met à jour l'affichage du composant selon les données courantes.
   */
  #_renderDOM(): void {
    var createDate = true;

    this._p_addState(
      `${HTMLBnumCardItemAgenda.STATE_MODE_PREFIX}${this.#_getMode}`,
    );

    // Gestion des slots
    if (this.#_isSlotLocationEmpty())
      this._p_addState(HTMLBnumCardItemAgenda.STATE_NO_LOCATION);

    // Gestion de l'action
    const eventResult = this.onstartdefineaction.call({
      location: this.#_isSlotLocationEmpty()
        ? this.#_location || EMPTY_STRING
        : this.#_slotLocation!.textContent || EMPTY_STRING,
      action: undefined,
    });

    if (eventResult.action) {
      this.updateAction(eventResult.action, { forceCall: true });
    }

    if (
      eventResult.action ||
      this.#_overrideAction!.hidden === false ||
      (this.#_slotAction && this.#_slotAction!.children.length > 0)
    ) {
      this._p_addState(HTMLBnumCardItemAgenda.STATE_ACTION_DEFINED);
    }

    if (this.#_spanDate && this.#_spanDate.children.length > 0) {
      const dateHtml: Nullable<HTMLBnumDate> = this.shadowRoot!.querySelector(
        HTMLBnumDate.TAG,
      );

      if (dateHtml != null) {
        createDate = false;
        dateHtml.date = this.baseDate;
      }
    }

    if (createDate) {
      const dateHtml: HTMLBnumDate = this.#_generateDateHtml(this.baseDate);
      this.#_spanDate!.appendChild(dateHtml);
    }

    // Gestion de la date
    if (this.isAllDay) {
      if (this.#_bnumDateStart !== null) this.#_bnumDateStart.hidden = true;
      if (this.#_bnumDateEnd !== null) this.#_bnumDateEnd.hidden = true;

      if (this.#_spanAllday === null) {
        this._p_addState(HTMLBnumCardItemAgenda.STATE_ALL_DAY);
        const spanAllDay: HTMLSpanElement = this._p_createSpan({
          classes: [HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ALL_DAY],
          child: HTMLBnumCardItemAgenda.TEXT_ALL_DAY,
        });
        this.#_spanAllday = spanAllDay;
        this.#_spanHour!.appendChild(spanAllDay);
      } else this.#_spanAllday.hidden = false;
    } else {
      if (this.#_spanAllday !== null) this.#_spanAllday.hidden = true;

      if (this.#_bnumDateStart == null && this.#_bnumDateEnd == null) {
        const htmlStartDate: HTMLBnumDate = this.setHourLogic(
          HTMLBnumDate.Create(this.startDate),
        );
        const htmlEndDate: HTMLBnumDate = this.setHourLogic(
          HTMLBnumDate.Create(this.endDate),
        );

        this.#_bnumDateStart = htmlStartDate;
        this.#_bnumDateEnd = htmlEndDate;

        this.#_spanHour!.append(htmlStartDate, htmlEndDate);
      } else {
        this.#_bnumDateStart!.hidden = false;
        this.#_bnumDateEnd!.hidden = false;
        this.#_bnumDateStart!.date = this.startDate;
        this.#_bnumDateEnd!.date = this.endDate;
      }
    }

    if (this.#_private) {
      this._p_addState(HTMLBnumCardItemAgenda.STATE_PRIVATE);
      if (this.#_privateIcon === null) {
        this.#_privateIcon = HTMLBnumIcon.Create(
          HTMLBnumCardItemAgenda.ICON_PRIVATE,
        ).addClass(
          HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_PRIVATE_ICON,
        );
        this.shadowRoot!.appendChild(this.#_privateIcon);
      } else this.#_privateIcon.hidden = false;
    } else if (this.#_privateIcon) this.#_privateIcon.hidden = true;
  }

  protected _p_fromTemplate(): HTMLTemplateElement | null {
    return TEMPLATE;
  }

  //#endregion

  //#region Public Methods
  /**
   * Met à jour l'action affichée dans la carte agenda.
   * @param element Élément HTML à afficher comme action
   * @returns L'instance du composant
   */
  public updateAction(
    element: HTMLElement,
    { forceCall = false }: { forceCall?: boolean } = {},
  ): HTMLBnumCardItemAgenda {
    return this.#_requestShedulerAction(element, { forceCall });
  }

  /**
   * Réinitialise l'action à sa valeur par défaut.
   * @returns L'instance du composant
   */
  public resetAction(): HTMLBnumCardItemAgenda {
    return this.#_requestShedulerAction(HTMLBnumCardItemAgenda.SYMBOL_RESET);
  }

  /**
   * Met à jour le titre affiché dans la carte agenda.
   * @param element Élément HTML ou texte à afficher comme titre
   * @returns L'instance du composant
   */
  public updateTitle(element: HTMLElement): HTMLBnumCardItemAgenda;
  public updateTitle(element: string): HTMLBnumCardItemAgenda;
  public updateTitle(element: HTMLElement | string): HTMLBnumCardItemAgenda {
    return this.#_requestShedulerTitle(element);
  }

  /**
   * Réinitialise le titre à sa valeur par défaut.
   * @returns L'instance du composant
   */
  public resetTitle(): HTMLBnumCardItemAgenda {
    return this.#_requestShedulerTitle(HTMLBnumCardItemAgenda.SYMBOL_RESET);
  }

  /**
   * Met à jour le lieu affiché dans la carte agenda.
   * @param element Élément HTML ou texte à afficher comme lieu
   * @returns L'instance du composant
   */
  public updateLocation(element: HTMLElement): HTMLBnumCardItemAgenda;
  public updateLocation(element: string): HTMLBnumCardItemAgenda;
  public updateLocation(element: HTMLElement | string): HTMLBnumCardItemAgenda {
    return this.#_requestShedulerLocation(element);
  }

  /**
   * Réinitialise le lieu à sa valeur par défaut.
   * @returns L'instance du composant
   */
  public resetLocation(): HTMLBnumCardItemAgenda {
    return this.#_requestShedulerLocation(HTMLBnumCardItemAgenda.SYMBOL_RESET);
  }

  /**
   * Applique la logique d'affichage pour la date (aujourd'hui, demain, etc.).
   * @param element Instance HTMLBnumDate à formater
   * @returns Instance HTMLBnumDate modifiée
   */
  public setDateLogic(element: HTMLBnumDate): HTMLBnumDate {
    element.formatEvent.add(EVENT_DEFAULT, (param) => {
      const now: Date = new Date();
      const date: Date | string = param.date;

      if (isSameDay(date, now))
        param.date = HTMLBnumCardItemAgenda.FORMAT_TODAY;
      else if (isSameDay(date, addDays(now, 1)))
        param.date = HTMLBnumCardItemAgenda.FORMAT_TOMORROW;
      else
        param.date = CapitalizeLine(
          format(date, HTMLBnumCardItemAgenda.FORMAT_EVENT_DATE, {
            locale: element.localeElement,
          }),
        );

      return param;
    });

    return element;
  }

  /**
   * Applique la logique d'affichage pour l'heure (heure ou date selon le jour).
   * @param element Instance HTMLBnumDate à formater
   * @returns Instance HTMLBnumDate modifiée
   */
  public setHourLogic(element: HTMLBnumDate): HTMLBnumDate {
    element.formatEvent.add(EVENT_DEFAULT, (param: { date: Date | string }) => {
      const date: Date | string = param.date;

      if (isSameDay(date, this.baseDate))
        param.date = format(date, HTMLBnumCardItemAgenda.FORMAT_HOUR_DEFAULT, {
          locale: element.localeElement,
        });
      else
        param.date = format(date, HTMLBnumCardItemAgenda.FORMAT_HOUR_DIFF_DAY, {
          locale: element.localeElement,
        });

      return param;
    });

    return element;
  }
  //#endregion

  //#region Private Methods
  #_requestShedulerAction(
    element: HTMLElement | Symbol,
    { forceCall = false }: { forceCall?: boolean } = {},
  ): this {
    this.#_shedulerAction ??= new Scheduler<HTMLElement | Symbol>((element) =>
      this.#_updateAction(element!),
    );

    if (forceCall) this.#_shedulerAction.call(element);
    else this.#_shedulerAction.schedule(element);
    return this;
  }

  #_updateAction(element: HTMLElement | Symbol): void {
    if (element === HTMLBnumCardItemAgenda.SYMBOL_RESET) {
      this._p_removeState(HTMLBnumCardItemAgenda.STATE_ACTION_DEFINED);
      this.#_resetItem(this.#_overrideAction!, this.#_slotAction!);
      return;
    }

    this._p_addState(HTMLBnumCardItemAgenda.STATE_ACTION_DEFINED);
    this.#_overrideAction!.innerHTML = EMPTY_STRING;
    this.#_overrideAction!.appendChild(element as HTMLElement);

    this.#_slotAction!.hidden = true;
    this.#_overrideAction!.hidden = false;
  }

  #_requestShedulerTitle(element: HTMLElement | string | Symbol): this {
    this.#_shedulerTitle ??= new Scheduler<HTMLElement | string | Symbol>(
      (element) => this.#_updateTitle(element!),
    );

    this.#_shedulerTitle.schedule(element);
    return this;
  }

  #_updateTitle(element: HTMLElement | string | Symbol): void {
    if (element === HTMLBnumCardItemAgenda.SYMBOL_RESET) {
      this.#_resetItem(this.#_overrideTitle!, this.#_slotTitle!);
      return;
    }

    this.#_overrideTitle!.innerHTML = EMPTY_STRING;

    if (typeof element === 'string') {
      const textNode: Text = document.createTextNode(element);
      this.#_overrideTitle!.appendChild(textNode);
    } else {
      this.#_overrideTitle!.appendChild(element as HTMLElement);
    }

    this.#_slotTitle!.hidden = true;
    this.#_overrideTitle!.hidden = false;
  }

  #_requestShedulerLocation(element: HTMLElement | string | Symbol): this {
    this.#_shedulerLocation ??= new Scheduler<HTMLElement | string | Symbol>(
      (element) => this.#_updateLocation(element!),
    );

    this.#_shedulerLocation.schedule(element);
    return this;
  }

  #_updateLocation(element: HTMLElement | string | Symbol): void {
    if (element === HTMLBnumCardItemAgenda.SYMBOL_RESET) {
      this.#_resetItem(this.#_overrideLocation!, this.#_slotLocation!);
      return;
    }

    this.#_overrideLocation!.innerHTML = EMPTY_STRING;

    if (typeof element === 'string') {
      const textNode: Text = document.createTextNode(element);
      this.#_overrideLocation!.appendChild(textNode);
    } else {
      this.#_overrideLocation!.appendChild(element as HTMLElement);
    }

    this.#_slotLocation!.hidden = true;
    this.#_overrideLocation!.hidden = false;
  }

  #_resetItem(
    action: HTMLElement,
    slot: HTMLSlotElement,
  ): HTMLBnumCardItemAgenda {
    action.innerHTML = EMPTY_STRING;
    slot.hidden = false;
    action.hidden = true;

    return this;
  }
  #_slotEmpty(slot: HTMLSlotElement): boolean {
    return slot.assignedNodes().length === 0;
  }
  #_isSlotLocationEmpty(): boolean {
    return this.#_slotLocation ? this.#_slotEmpty(this.#_slotLocation) : true;
  }
  #_generateDateHtml(startDate: Date): HTMLBnumDate {
    return this.setDateLogic(HTMLBnumDate.Create(startDate));
  }
  //#endregion

  //#region Static Methods
  /**
   * Crée une nouvelle instance du composant agenda avec les paramètres donnés.
   * @param baseDate Date de base
   * @param startDate Date de début
   * @param endDate Date de fin
   * @param options Options supplémentaires (allDay, title, location, action)
   * @returns Instance HTMLBnumCardItemAgenda
   */
  public static Create(
    baseDate: Date,
    startDate: Date,
    endDate: Date,
    {
      allDay = false,
      title = null,
      location = null,
      action = null,
      isPrivate = false,
      mode = null,
    }: CreateConstructorOptions = {},
  ): HTMLBnumCardItemAgenda {
    let node = document.createElement(
      HTMLBnumCardItemAgenda.TAG,
    ) as HTMLBnumCardItemAgenda;

    node.baseDate = baseDate;
    node.startDate = startDate;
    node.endDate = endDate;

    if (allDay)
      node.setAttribute(
        HTMLBnumCardItemAgenda.ATTRIBUTE_ALL_DAY,
        HTMLBnumCardItemAgenda.ATTRIBUTE_ALL_DAY,
      );
    if (title)
      node.setAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_DATA_TITLE, title);
    if (location)
      node.setAttribute(
        HTMLBnumCardItemAgenda.ATTRIBUTE_DATA_LOCATION,
        location,
      );

    if (isPrivate)
      node.setAttribute(
        HTMLBnumCardItemAgenda.ATTRIBUTE_PRIVATE,
        HTMLBnumCardItemAgenda.ATTRIBUTE_PRIVATE,
      );
    if (mode) node.setAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_MODE, mode);

    if (action) {
      if (typeof action === 'function') node.onstartdefineaction.push(action);
      else
        node.onstartdefineaction.push((param) => {
          param.action = action!.element;
          param.action!.onclick = action!.callback;
          return param;
        });
    }

    return node;
  }

  /**
   * @inheritdoc
   */
  static _p_observedAttributes(): string[] {
    return [
      ...super._p_observedAttributes(),
      HTMLBnumCardItemAgenda.ATTRIBUTE_ALL_DAY,
      HTMLBnumCardItemAgenda.ATTRIBUTE_PRIVATE,
      HTMLBnumCardItemAgenda.ATTRIBUTE_MODE,
    ];
  }

  /**
   * Crée une nouvelle instance du composant agenda à partir d'un objet événement.
   * @param baseDate Date de base
   * @param agendaEvent Objet événement source
   * @param options Fonctions de sélection et action personnalisée
   * @returns Instance HTMLBnumCardItemAgenda
   */
  public static FromEvent(
    baseDate: Date,
    agendaEvent: any,
    {
      startDateSelector = null,
      endDateSelector = null,
      allDaySelector = null,
      titleSelector = null,
      locationSelector = null,
      action = null,
    }: FromEventConstructorOptions = {},
  ): HTMLBnumCardItemAgenda {
    const [startDate, endDate] = this.#_tryGetAgendaDates(
      {
        val: agendaEvent.start,
        selector: startDateSelector,
      },
      {
        val: agendaEvent.end,
        selector: endDateSelector,
      },
    );

    const allDay: boolean =
      agendaEvent?.allDay ?? allDaySelector?.(agendaEvent) ?? false;

    const title: string =
      agendaEvent?.title ?? titleSelector?.(agendaEvent) ?? EMPTY_STRING;

    const location: string =
      agendaEvent?.location ?? locationSelector?.(agendaEvent) ?? EMPTY_STRING;

    return this.Create(baseDate, startDate, endDate, {
      allDay: allDay,
      title: title,
      location: location,
      action: action,
    });
  }

  /**
   * Retourne le tag HTML du composant.
   */
  public static get TAG(): string {
    return TAG_CARD_ITEM_AGENDA;
  }

  /**
   * Tente d'obtenir une date d'agenda à partir d'une valeur donnée.
   * @param val La valeur à analyser.
   * @param selector Une fonction de sélection pour extraire la date.
   * @returns La date d'agenda ou une date invalide.
   */
  static #_TryGetAgendaDate(
    val: any,
    selector: Nullable<(obj: any) => Date>,
  ): Date {
    return typeof val === 'string'
      ? new Date(val)
      : val?.toDate
        ? val.toDate()
        : (selector?.(val) ?? new Date('Date invalide'));
  }

  /**
   * Tente d'obtenir une liste de dates d'agenda à partir des valeurs données.
   * @param options Options contenant les valeurs et sélecteurs.
   * @returns La liste des dates d'agenda.
   */
  static #_tryGetAgendaDates(
    ...options: {
      val: any;
      selector: Nullable<(obj: any) => Date>;
    }[]
  ): Date[] {
    return options.map((option) =>
      this.#_TryGetAgendaDate(option.val, option.selector),
    );
  }
  //#endregion
}

const AGENDA = `
  <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_DAY} bold"></span>
  <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_HORIZONTAL}">
     <div class="bnum-card-item-agenda-block">
        <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_HOUR} bold"></span>
        <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_VERTICAL}">
            <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_TITLE} bold-500">
                <slot name="${HTMLBnumCardItemAgenda.SLOT_NAME_TITLE}"></slot>
                <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_TITLE_OVERRIDE}" hidden></div>
            </span>
            <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION}">
                <slot name="${HTMLBnumCardItemAgenda.SLOT_NAME_LOCATION}"></slot>
                <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION_OVERRIDE}" hidden></div>
            </span>
        </div>
     </div>
     <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ACTION}">
        <slot name="${HTMLBnumCardItemAgenda.SLOT_NAME_ACTION}"></slot>
        <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ACTION_OVERRIDE}" hidden></div>
     </span>
  </div>
  <${HTMLBnumIcon.TAG} class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_PRIVATE_ICON}" hidden>${HTMLBnumCardItemAgenda.ICON_PRIVATE}</${HTMLBnumIcon.TAG}>
`;
// Optimisation : Le HTML est parsé une seule fois ici.
const TEMPLATE = HTMLBnumCardItem.CreateChildTemplate(AGENDA, {
  defaultSlot: false,
});

HTMLBnumCardItemAgenda.TryDefine();
