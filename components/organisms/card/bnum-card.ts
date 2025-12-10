import { EMPTY_STRING } from '@rotomeca/utils';
import { HTMLBnumCardTitle } from '../../molecules/card-title/bnum-card-title';
import BnumElementInternal from '../../bnum-element-states';
import { TAG_CARD } from '../../../core/utils/constants/tags';
import { removeButtonRole, setButtonRole } from '../../../core/utils/utils';
import style from './bnum-card.less';
import { HTMLBnumIcon } from '../../atoms/icon/bnum-icon';
import { Nullable } from '../../../core/utils/types';
import { Scheduler } from '../../../core/utils/scheduler';

export { HTMLBnumCardElement };

const SHEET = BnumElementInternal.ConstructCSSStyleSheet(style);

/**
 * Données du titre de la carte défini dans les attributs `data` du composant
 */
type TitleData = {
  /**
   * Icône du titre
   */
  icon?: string;
  /**
   * Texte du titre
   */
  text?: string;
  /**
   * Lien du titre
   */
  link?: string;
  /**
   * Indique si toutes les données du titre sont présentes
   */
  has: () => boolean;
};

/**
 * Élément à ajouter dans un slot avec un nom de slot optionnel.
 */
class ScheduleElementAppend {
  #_element: Element;
  #_slot: Nullable<string>;

  /**
   * Constructeur de la classe ScheduleElementAppend.
   * @param element Element à ajouter
   * @param slot Dans quel slot (null pour le slot principal)
   */
  constructor(element: Element, slot: Nullable<string> = null) {
    this.#_element = element;
    this.#_slot = slot;
  }

  /**
   * Retourne l'élément à ajouter.
   */
  get element(): Element {
    return this.#_element;
  }

  /**
   * Retourne le nom du slot où ajouter l'élément.
   */
  get slot(): Nullable<string> {
    return this.#_slot;
  }
}

/**
 * Élément HTML représentant une carte personnalisée Bnum.
 *
 * Liste des slots :
 * - title : Contenu du titre de la carte. Si aucun contenu n'est fourni, un titre par défaut sera généré à partir des attributs de données.
 * - (slot par défaut) : Contenu du corps de la carte.
 *
 * Liste des data :
 * - title-icon : Icône du titre de la carte.
 * - title-text : Texte du titre de la carte.
 * - title-link : Lien du titre de la carte.
 *
 * /!\ Les data servent à définir un titre par défaut, si le slot "title" est vide ou pas défini.
 *
 * Liste des attributs :
 * - clickable : Rend la carte cliquable.
 * - loading : Indique si la carte est en état de chargement.
 *
 * Évènements personnalisés :
 * - bnum-card:loading : Déclenché lorsque l'état de chargement de la carte change.
 * - bnum-card:click : Déclenché lorsqu'un clic est effectué sur une carte cliquable.
 *
 * @structure Cas standard
 * <bnum-card>
 * <span slot="title">Titre de la carte</span>
 * <p>Contenu principal.</p>
 * </bnum-card>
 *
 * @structure Carte cliquable
 * <bnum-card clickable>
 * <span slot="title">Carte cliquable</span>
 * <p>Cliquez n'importe où.</p>
 * </bnum-card>
 *
 * @structure Carte avec titre par défaut (via data-attrs)
 * <bnum-card
 * data-title-text="Titre généré"
 * data-title-icon="info"
 * >
 * <p>Le slot "title" est vide.</p>
 * </bnum-card>
 *
 * @structure Carte avec un chargement
 * <bnum-card loading>
 * <bnum-card-title slot="title" data-icon="info">Titre en cours de chargement...</bnum-card-title>
 * <p>Chargement</p>
 * </bnum-card>
 *
 * @state clickable - Est actif lorsque la carte est cliquable.
 * @state loading - Est actif lorsque la carte est en état de chargement.
 *
 * @slot title - Contenu du titre de la carte. Si aucun contenu n'est fourni, un titre par défaut sera généré.
 * @slot (default) - Contenu du corps de la carte. Masqué si l'état `loading` est actif.
 *
 * @cssvar {block} --bnum-card-display - Définit le type d'affichage du composant.
 * @cssvar {var(--bnum-space-m, 15px)} --bnum-card-padding - Définit le padding interne de la carte.
 * @cssvar {auto} --bnum-card-width - Définit la largeur de la carte.
 * @cssvar {auto} --bnum-card-height - Définit la hauteur de la carte.
 * @cssvar {var(--bnum-color-surface, #f6f6f7)} --bnum-card-background-color - Couleur de fond de la carte.
 * @cssvar {var(--bnum-color-surface-hover, #eaeaea)} --bnum-card-background-color-hover - Couleur de fond au survol.
 * @cssvar {var(--bnum-color-surface-active, #dfdfdf)} --bnum-card-background-color-active - Couleur de fond à l'état actif.
 * @cssvar {pointer} --bnum-card-clickable-cursor - Curseur utilisé lorsque la carte est cliquable.
 * @cssvar {var(--bnum-card-loader-animation-rotate360, var(--bnum-animation-rotate360, rotate360 1s linear infinite))} --bnum-card-loader-animation-rotate360 - Animation appliquée au loader (spinner).
 *
 */
class HTMLBnumCardElement extends BnumElementInternal {
  //#region Constants
  /**
   * Indique si la carte est cliquable.
   * @prop {boolean | undefined} clickable - Si vrai, rend la carte interactive et accessible (rôle bouton).
   * @attr {boolean | string | undefined} (optional) clickable
   * @type {string}
   */
  static readonly STATE_CLICKABLE = 'clickable';
  /**
   * Indique si la carte est en cours de chargement.
   * @prop {boolean | undefined} loading - Si vrai, affiche un spinner et masque le corps.
   * @attr {boolean | string | undefined} (optional) loading
   * @type {string}
   */
  static readonly STATE_LOADING = 'loading';

  /**
   * Classe CSS pour le titre de la carte.
   * @type {string}
   */
  static readonly CSS_CLASS_TITLE = 'card-title';
  /**
   * Classe CSS pour le corps de la carte.
   * @type {string}
   */
  static readonly CSS_CLASS_BODY = 'card-body';
  /**
   * Classe CSS pour l'affichage du loading.
   * @type {string}
   */
  static readonly CSS_CLASS_LOADING = 'card-loading';

  /**
   * Nom de la data pour l'icône du titre.
   * @attr {string | undefined} (optional) data-title-icon - Nom de l'icône (Material Symbols) pour le titre par défaut.
   * @type {string}
   */
  static readonly DATA_TITLE_ICON = 'title-icon';
  /**
   * Nom de la data pour le texte du titre.
   * @attr {string | undefined} (optional) data-title-text - Texte à afficher dans le titre par défaut.
   * @type {string}
   */
  static readonly DATA_TITLE_TEXT = 'title-text';
  /**
   * Nom de la data pour le lien du titre.
   * @attr {string | undefined} (optional) data-title-link - URL à utiliser si le titre par défaut doit être un lien.
   * @type {string}
   */
  static readonly DATA_TITLE_LINK = 'title-link';

  /**
   * Nom de l'évènement déclenché lors du loading.
   * @event bnum-card:loading
   * @detail { oldValue: string|null, newValue: string|null, caller: HTMLBnumCardElement }
   * @type {string}
   */
  static readonly EVENT_LOADING = 'bnum-card:loading';
  /**
   * Nom de l'évènement déclenché lors d'un clic sur la carte.
   * @event bnum-card:click
   * @detail { originalEvent: MouseEvent }
   * @type {string}
   */
  static readonly EVENT_CLICK = 'bnum-card:click';

  /**
   * Nom du slot pour le titre.
   * @type {string}
   */
  static readonly SLOT_TITLE = 'title';
  /**
   * Nom de l'icône utilisée pour le spinner de chargement.
   * @type {string}
   */
  static readonly ICON_SPINNER = 'progress_activity';
  /**
   * Symbole utilisé pour réinitialiser le contenu du slot.
   */
  static readonly SYMBOL_RESET = Symbol('reset');
  //#endregion

  //#region Private fields
  /**
   * Élément HTML utilisé pour afficher le loading.
   * @type {HTMLElement | null}
   */
  #_loadingElement: HTMLElement | null = null;
  /**
   * Élément HTML du corps de la carte.
   * @type {HTMLElement | null}
   */
  #_bodyElement: HTMLElement | null = null;
  #_scheduleBody: Nullable<Scheduler<Element | Symbol>> = null;
  #_scheduleTitle: Nullable<Scheduler<Element | Symbol>> = null;
  #_scheduleAppend: Nullable<Scheduler<ScheduleElementAppend>> = null;
  //#endregion Private fields

  //#region Getters/Setters
  /**
   * Retourne l'icône du titre depuis les données du composant.
   * @returns {string} Icône du titre.
   */
  private get _titleIcon(): string {
    return this.data(HTMLBnumCardElement.DATA_TITLE_ICON);
  }

  /**
   * Retourne le texte du titre depuis les données du composant.
   * @returns {string} Texte du titre.
   */
  private get _titleText(): string {
    return this.data(HTMLBnumCardElement.DATA_TITLE_TEXT);
  }

  /**
   * Retourne le lien du titre depuis les données du composant.
   * @returns {string} Lien du titre.
   */
  private get _titleLink(): string {
    return this.data(HTMLBnumCardElement.DATA_TITLE_LINK);
  }

  /**
   * Retourne les données du titre sous forme d'objet TitleData.
   * @returns {TitleData} Objet contenant les données du titre.
   */
  private get _titleData(): TitleData {
    return {
      icon: this._titleIcon,
      text: this._titleText,
      link: this._titleLink,
      has: () => {
        return this._titleText !== null && this._titleText !== undefined;
      },
    };
  }

  /**
   * Si vrai, affiche la carte en état de chargement. Elle montre un spinner et masque le corps, de plus, tout les `pointer-events` sont désactivés.
   * @returns {boolean}
   */
  get loading(): boolean {
    return this.hasAttribute(HTMLBnumCardElement.STATE_LOADING);
  }

  /**
   * Définit l'état de chargement de la carte.
   * @param {boolean} value
   * @returns {void}
   */
  set loading(value: boolean) {
    if (value) {
      this.setAttribute(
        HTMLBnumCardElement.STATE_LOADING,
        HTMLBnumCardElement.STATE_LOADING,
      );
    } else {
      this.removeAttribute(HTMLBnumCardElement.STATE_LOADING);
    }
  }

  /**
   * Si vrai, la carte est cliquable et interactive.
   * @returns {boolean}
   */
  public get clickable(): boolean {
    return this.hasAttribute(HTMLBnumCardElement.STATE_CLICKABLE);
  }

  /**
   * Définit si la carte est cliquable ou non.
   * @param {boolean} value
   * @returns {void}
   */
  public set clickable(value: boolean) {
    // Ajoute le rôle et la tabulation pour l'accessibilité
    if (value) {
      this.setAttribute(
        HTMLBnumCardElement.STATE_CLICKABLE,
        HTMLBnumCardElement.STATE_CLICKABLE,
      );

      setButtonRole(this);
    } else {
      this.removeAttribute(HTMLBnumCardElement.STATE_CLICKABLE);

      removeButtonRole(this);
    }
  }
  //#endregion Getters/Setters
  /**
   * Retourne la liste des attributs observés par le composant.
   * @returns {string[]} Liste des attributs observés.
   */
  static _p_observedAttributes(): string[] {
    return [
      HTMLBnumCardElement.STATE_CLICKABLE,
      HTMLBnumCardElement.STATE_LOADING,
    ];
  }

  //#region Lifecycle
  /**
   * Constructeur de la classe HTMLBnumCardElement.
   * Initialise les écouteurs d'évènements.
   * @constructor
   */
  constructor() {
    super();
    this.addEventListener('click', this.#_handleClick.bind(this));
  }

  protected _p_fromTemplate(): HTMLTemplateElement | null {
    return TEMPLATE;
  }

  /**
   * Construit le DOM interne du composant.
   * @param {ShadowRoot | HTMLElement} container ShadowRoot ou HTMLElement cible.
   * @returns {void}
   */
  protected _p_buildDOM(container: ShadowRoot | HTMLElement): void {
    this.#_bodyElement = container.querySelector('#mainslot');

    const titleData = this._titleData;
    if (titleData.has()) {
      HTMLBnumCardTitle.Create(titleData.text || EMPTY_STRING, {
        icon: titleData.icon || null,
        link: titleData.link || null,
      }).appendTo(
        container.querySelector(
          `slot[name="${HTMLBnumCardElement.SLOT_TITLE}"]`,
        )!,
      );
    }

    this.#_updateDOM();
  }

  /**
   * Met à jour le composant lors d'un changement d'attribut.
   * @param {string} name Nom de l'attribut modifié.
   * @param {string | null} oldVal Ancienne valeur.
   * @param {string | null} newVal Nouvelle valeur.
   * @returns {void}
   */
  protected _p_update(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    if (name === HTMLBnumCardElement.STATE_LOADING) {
      this.trigger(HTMLBnumCardElement.EVENT_LOADING, {
        oldValue: oldVal,
        newValue: newVal,
        caller: this,
      });
    }

    this.#_updateDOM();
  }

  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [SHEET];
  }
  //#endregion Lifecycle

  //#region Private methods
  /**
   * Met à jour l'affichage du DOM selon l'état du composant.
   * @returns {void}
   */
  #_updateDOM(): void {
    this._p_clearStates();

    if (this.clickable) this._p_addState(HTMLBnumCardElement.STATE_CLICKABLE);

    if (this.loading) {
      this._p_addState(HTMLBnumCardElement.STATE_LOADING);

      // Initialise le loading si nécessaire
      if (!this.#_loadingElement) {
        this.#_bodyElement?.appendChild(this.#_getLoading());
      }
    }
  }

  /**
   * Retourne l'élément HTML du loading (spinner).
   * @returns {HTMLElement} Élément HTML du loading.
   */
  #_getLoading(): HTMLElement {
    if (!this.#_loadingElement) {
      const loadingDiv = document.createElement('div');
      loadingDiv.classList.add(HTMLBnumCardElement.CSS_CLASS_LOADING);

      const spinner = HTMLBnumIcon.Create(
        HTMLBnumCardElement.ICON_SPINNER,
      ).addClass('loader');
      loadingDiv.appendChild(spinner);

      this.#_loadingElement = loadingDiv;
    }

    return this.#_loadingElement;
  }

  /**
   * Gère le clic sur la carte.
   * @param {MouseEvent} event Événement de clic sur la carte.
   * @returns {void}
   */
  #_handleClick(event: MouseEvent): void {
    if (this.clickable) {
      // Déclenche un événement "click" natif
      // ou un événement personnalisé si vous préférez
      this.trigger(HTMLBnumCardElement.EVENT_CLICK, { originalEvent: event });
    }
  }

  #_requestUpdateTitle(element: Element | Symbol): void {
    this.#_scheduleTitle ??= new Scheduler<Element | Symbol>((el) =>
      this.#_updateOrResetTitle(el!),
    );
    this.#_scheduleTitle.schedule(element);
  }

  #_updateOrResetTitle(element: Element | Symbol): void {
    if (element === HTMLBnumCardElement.SYMBOL_RESET) this.#_resetTitle();
    else this.#_updateTitle(element as Element);
  }

  #_updateTitle(element: Element): void {
    element.setAttribute('slot', HTMLBnumCardElement.SLOT_TITLE);
    const oldTitles = this.querySelectorAll(
      `[slot="${HTMLBnumCardElement.SLOT_TITLE}"]`,
    );
    oldTitles.forEach((node) => node.remove());
    this.appendChild(element);
  }

  #_resetTitle(): void {
    // On trouve tous les éléments du Light DOM assignés au slot "title"
    const nodes = this.querySelectorAll(
      `[slot="${HTMLBnumCardElement.SLOT_TITLE}"]`,
    );
    nodes.forEach((node) => node.remove());
  }

  #_requestUpdateBody(element: Element | Symbol): void {
    this.#_scheduleBody ??= new Scheduler<Element | Symbol>((el) =>
      this.#_updateOrResetBody(el!),
    );
    this.#_scheduleBody.schedule(element);
  }

  #_updateOrResetBody(element: Element | Symbol): void {
    if (element === HTMLBnumCardElement.SYMBOL_RESET) this.#_resetBody();
    else this.#_updateBody(element as Element);
  }

  #_updateBody(element: Element): void {
    element.removeAttribute('slot');

    const oldBodyNodes = Array.from(this.childNodes).filter(
      (node) =>
        (node.nodeType === Node.ELEMENT_NODE &&
          (node as Element).getAttribute('slot') !==
            HTMLBnumCardElement.SLOT_TITLE) ||
        (node.nodeType === Node.TEXT_NODE &&
          node.textContent?.trim() !== EMPTY_STRING),
    );

    oldBodyNodes.forEach((node) => node.remove());

    this.appendChild(element);
  }

  #_resetBody(): void {
    // On trouve tous les éléments qui n'ont PAS de slot="title"
    const nodes = Array.from(this.childNodes).filter(
      (node) =>
        (node.nodeType === Node.ELEMENT_NODE &&
          (node as Element).getAttribute('slot') !==
            HTMLBnumCardElement.SLOT_TITLE) ||
        (node.nodeType === Node.TEXT_NODE &&
          node.textContent?.trim() !== EMPTY_STRING),
    );

    nodes.forEach((node) => node.remove());
  }

  #_requestAppendElement(appended: ScheduleElementAppend): void {
    this.#_scheduleAppend ??= new Scheduler<ScheduleElementAppend>((el) =>
      this.#_appendElement(el!),
    );
    this.#_scheduleAppend.schedule(appended);
  }

  #_appendElement(appended: ScheduleElementAppend): void {
    if (appended.slot) appended.element.setAttribute('slot', appended.slot);
    else appended.element.removeAttribute('slot');

    this.appendChild(appended.element);
  }
  //#endregion Private methods

  //#region Public methods
  /**
   * Remplace tout le contenu du slot "title" par un nouvel élément.
   * @param {Element} element Élément à insérer dans le slot "title".
   * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
   */
  updateTitle(element: Element): HTMLBnumCardElement {
    this.#_requestUpdateTitle(element);
    return this;
  }

  /**
   * Remplace tout le contenu du slot par défaut (body) par un nouvel élément.
   * @param {Element} element Élément à insérer dans le corps de la carte.
   * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
   */
  updateBody(element: Element): HTMLBnumCardElement {
    this.#_requestUpdateBody(element);
    return this;
  }

  /**
   * Supprime tous les éléments du slot "title".
   * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
   */
  public clearTitle(): HTMLBnumCardElement {
    this.#_requestUpdateTitle(HTMLBnumCardElement.SYMBOL_RESET);
    return this;
  }

  /**
   * Supprime tous les éléments du corps de la carte (hors slot "title").
   * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
   */
  public clearBody(): HTMLBnumCardElement {
    this.#_requestUpdateBody(HTMLBnumCardElement.SYMBOL_RESET);
    return this;
  }
  /**
   * Ajoute un élément au slot "title" sans supprimer les éléments existants.
   * @param {Element} element Élément à ajouter au slot "title".
   * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
   */
  public appendToTitle(element: Element): HTMLBnumCardElement {
    this.#_requestAppendElement(
      new ScheduleElementAppend(element, HTMLBnumCardElement.SLOT_TITLE),
    );
    return this;
  }

  /**
   * Ajoute un élément au corps de la carte (slot par défaut) sans supprimer les éléments existants.
   * @param {Element} element Élément à ajouter au corps de la carte.
   * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
   */
  public appendToBody(element: Element): HTMLBnumCardElement {
    this.#_requestAppendElement(new ScheduleElementAppend(element));
    return this;
  }
  //#endregion Public methods

  //#region Static properties

  /**
   * Crée une nouvelle instance de HTMLBnumCardElement avec les options spécifiées.
   * @param param0 Options de création de la carte
   * @param param0.title Titre de la carte (optionnel)
   * @param param0.body Corps de la carte (optionnel)
   * @param param0.clickable Si vrai, rend la carte cliquable (optionnel, défaut false)
   * @param param0.loading Si vrai, affiche la carte en état de chargement (optionnel, défaut false)
   * @returns Element HTMLBnumCardElement créé
   */
  public static override Create({
    title = null,
    body = null,
    clickable = false,
    loading = false,
  }: {
    title?: Nullable<HTMLBnumCardTitle>;
    body?: Nullable<Element>;
    clickable?: boolean;
    loading?: boolean;
  } = {}): HTMLBnumCardElement {
    const card = document.createElement(
      HTMLBnumCardElement.TAG,
    ) as HTMLBnumCardElement;

    if (title) card.updateTitle(title);
    if (body) card.updateBody(body);

    if (clickable)
      card.setAttribute(
        HTMLBnumCardElement.STATE_CLICKABLE,
        HTMLBnumCardElement.STATE_CLICKABLE,
      );

    if (loading)
      card.setAttribute(
        HTMLBnumCardElement.STATE_LOADING,
        HTMLBnumCardElement.STATE_LOADING,
      );

    return card;
  }

  /**
   * Retourne le nom de la balise personnalisée pour cet élément.
   * @returns Nom de la balise personnalisée.
   */
  public static get TAG(): string {
    return TAG_CARD;
  }
  //#endregion Static properties
}

const TEMPLATE = BnumElementInternal.CreateTemplate(
  `
      <div class="${HTMLBnumCardElement.CSS_CLASS_TITLE}">
        <slot name="${HTMLBnumCardElement.SLOT_TITLE}"></slot>
      </div>
      <div class="${HTMLBnumCardElement.CSS_CLASS_BODY}">
        <slot id="mainslot"></slot>
      </div>
    `,
);

HTMLBnumCardElement.TryDefine();
