import style from './bnum-card-title.less';
import BnumElement from '../../bnum-element';
import { HTMLBnumIcon } from '../../atoms/icon/bnum-icon';
import { EMPTY_STRING } from '@rotomeca/utils';
import { TAG_CARD_TITLE } from '../../../core/utils/constants/tags';
import { Nullable } from '../../../core/utils/types';
import { Scheduler } from '../../../core/utils/scheduler';

const SHEET = BnumElement.ConstructCSSStyleSheet(style);

/**
 * Composant représentant le titre d'une carte, pouvant inclure une icône et un lien.
 * Permet d'afficher un titre enrichi avec une icône et éventuellement un lien cliquable.
 *
 * @structure Cas url et icône
 * <bnum-card-title data-icon="labs" url="https://example.com">Titre de la carte</bnum-card-title>
 *
 * @structure Cas icône uniquement
 * <bnum-card-title data-icon="labs">Titre de la carte</bnum-card-title>
 *
 * @structure Cas lien uniquement
 * <bnum-card-title url="https://example.com">Titre de la carte</bnum-card-title>
 *
 * @structure Cas texte seul
 * <bnum-card-title>Titre de la carte</bnum-card-title>
 *
 * @structure Cas icône via slot
 * <bnum-card-title>
 *  <bnum-icon slot="icon">drive_folder_upload</bnum-icon>
 *  Titre de la carte
 * </bnum-card-title>
 *
 * @state url - Actif lorsque le titre contient un lien.
 * @state without-url - Actif lorsque le titre ne contient pas de lien.
 *
 * @slot (default) - Titre de la carte (texte ou HTML)
 * @slot icon - Icône personnalisée à afficher avant le titre. Note: si une icône est définie via l'attribut `data-icon` ou via la propriété `icon`, ce slot sera ignoré.
 *
 * @cssvar {flex} --bnum-card-title-display - Définit le mode d'affichage du titre de la carte.
 * @cssvar {center} --bnum-card-title-align-items - Définit l'alignement vertical des éléments dans le titre de la carte.
 * @cssvar {var(--bnum-space-s, 10px)} --bnum-card-title-gap - Définit l'espacement entre l'icône et le texte du titre.
 */
export class HTMLBnumCardTitle extends BnumElement {
  //#region Constants
  /**
   * Nom de l'attribut pour définir l'URL du lien du titre de la carte.
   * @attr {string | null} (optional) url - URL du lien du titre de la carte
   */
  static readonly ATTRIBUTE_URL: string = 'url';
  /**
   * Nom de la data pour définir l'icône du titre de la carte.
   * @attr {string | null} (optional) data-icon - Nom de l'icône (Material Symbols) à afficher avant le titre
   */
  static readonly ATTRIBUTE_DATA_ICON: string = 'icon';
  /**
   * Nom du slot pour l'icône du titre de la carte.
   */
  static readonly SLOT_NAME_ICON: string = 'icon';
  /**
   * Nom de la classe au titre de la carte lorsqu'un url est défini
   */
  static readonly CLASS_LINK: string = 'card-title-link';
  /**
   * Nom de l'état lorsque le titre contient un lien.
   */
  static readonly STATE_URL: string = 'url';
  /**
   * Nom de l'état lorsque le titre ne contient pas de lien.
   */
  static readonly STATE_WITHOUT_URL: string = 'without-url';
  /**
   * Nom de la classe pour l'icône du titre de la carte.
   */
  static readonly CLASS_ICON_TITLE: string = 'card-icon-title';
  /**
   * ID du slot pour l'icône du titre de la carte.
   */
  static readonly ID_SLOT_ICON: string = 'sloticon';
  /**
   * ID du slot pour le texte du titre de la carte.
   */
  static readonly ID_SLOT_TEXT: string = 'mainslot';
  /**
   * ID de l'élément personnalisé pour le corps du titre de la carte.
   */
  static readonly ID_CUSTOM_BODY: string = 'custombody';
  //#endregion Constants

  //#region Private fields
  /**
   * Élément représentant l'icône du titre de la carte.
   * Peut être un composant icône ou un slot HTML.
   * @private
   */
  #_iconElement: HTMLBnumIcon | null = null;
  #_iconSlotElement: Nullable<HTMLSlotElement> = null;

  /**
   * Slot pour le texte du titre de la carte.
   * @private
   */
  #_textSlotElement: HTMLSlotElement | null = null;
  #_customBodyElement: HTMLSpanElement | null = null;

  /**
   * Élément lien (<a>) englobant le titre si une URL est définie.
   * @private
   */
  #_linkElement: HTMLAnchorElement | null = null;
  #_internals: ElementInternals = this.attachInternals();
  #_domScheduler: Nullable<Scheduler<void>> = null;
  #_bodyScheduler: Nullable<Scheduler<HTMLElement | string | Text>> = null;
  #_initBody: Nullable<HTMLElement | string | Text> = null;
  //#endregion Private fields

  //#region Getter/Setters
  /**
   * Obtient le nom de l'icône associée au titre de la carte.
   * @returns {string | null} Nom de l'icône ou null si aucune icône n'est définie
   */
  public get icon(): string | null {
    return this.data(HTMLBnumCardTitle.ATTRIBUTE_DATA_ICON);
  }

  /**
   * Définit le nom de l'icône associée au titre de la carte.
   * Met à jour le DOM pour refléter le changement.
   * @param {string | null} v Nom de l'icône ou null
   */
  public set icon(v: string | null) {
    if (this.alreadyLoaded) {
      this._p_setData(HTMLBnumCardTitle.ATTRIBUTE_DATA_ICON, v);
      this.#_requestUpdateDom();
    } else {
      const fromAttribute = true;
      this.data(HTMLBnumCardTitle.ATTRIBUTE_DATA_ICON, v, fromAttribute);
    }
  }

  /**
   * Obtient l'URL du lien du titre de la carte.
   * @returns {string | null} URL ou null si aucun lien n'est défini
   */
  public get url(): string | null {
    return this.getAttribute(HTMLBnumCardTitle.ATTRIBUTE_URL);
  }

  /**
   * Définit l'URL du lien du titre de la carte.
   * Ajoute ou retire l'attribut selon la valeur.
   * @param {string | null} v URL ou null
   */
  public set url(v: string | null) {
    if (v) this.setAttribute(HTMLBnumCardTitle.ATTRIBUTE_URL, v);
    else this.removeAttribute(HTMLBnumCardTitle.ATTRIBUTE_URL);
  }
  //#endregion Getter/Setters

  //#region Lifecycle
  /**
   * Constructeur du composant HTMLBnumCardTitle.
   * Initialise le composant sans ajouter d'éléments DOM.
   */
  constructor() {
    super();
  }

  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [SHEET];
  }

  protected _p_fromTemplate(): HTMLTemplateElement | null {
    return TEMPLATE;
  }

  /**
   * Construit le DOM du composant dans le conteneur donné.
   * Ajoute l'icône, le texte et le lien selon les propriétés définies.
   * @param {ShadowRoot | HTMLElement} container Conteneur dans lequel construire le DOM
   */
  protected _p_buildDOM(container: ShadowRoot | HTMLElement): void {
    this.#_iconSlotElement = container.querySelector(
      `#${HTMLBnumCardTitle.ID_SLOT_ICON}`,
    );
    this.#_textSlotElement = container.querySelector(
      `#${HTMLBnumCardTitle.ID_SLOT_TEXT}`,
    );
    this.#_customBodyElement = container.querySelector(
      `#${HTMLBnumCardTitle.ID_CUSTOM_BODY}`,
    );
    this.#_linkElement = container.querySelector(
      `.${HTMLBnumCardTitle.CLASS_LINK}`,
    );
    this.#_iconElement = container.querySelector(
      `.${HTMLBnumCardTitle.CLASS_ICON_TITLE}`,
    );

    this.#_updateDOM();

    if (this.#_initBody) {
      this.#_updateBody(this.#_initBody);
      this.#_initBody = null;
    }
  }

  protected _p_isUpdateForAllAttributes(): boolean {
    return true;
  }

  /**
   * Méthode appelée lors de la mise à jour d'un attribut observé.
   * Met à jour le DOM du composant.
   * @param {string} name Nom de l'attribut modifié
   * @param {string | null} oldVal Ancienne valeur
   * @param {string | null} newVal Nouvelle valeur
   */
  protected _p_update(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    if (this.alreadyLoaded) this.#_updateDOM();
  }
  //#endregion Lifecycle

  //#region Private methods
  /**
   * Demande une mise à jour du DOM du composant.
   * Utilise un ordonnanceur pour éviter les mises à jour redondantes.
   * @private
   */
  #_requestUpdateDom(): void {
    this.#_domScheduler ??= new Scheduler<void>(() => {
      this.#_updateDOM();
    });
    this.#_domScheduler.schedule();
  }

  /**
   * Met à jour le DOM du composant selon les propriétés actuelles.
   * Affiche ou masque l'icône et met à jour le lien si nécessaire.
   * @private
   */
  #_updateDOM(): void {
    const url = this.url;
    const icon = this.icon;

    this.#_internals.states.clear();

    if (icon) {
      this.#_iconElement!.icon = icon;
      this.#_iconElement!.hidden = false;
      this.#_iconSlotElement!.hidden = true;
    } else this.#_iconElement!.hidden = true;

    if (url) {
      this.#_linkElement!.href = url;
      this.#_internals.states.add(HTMLBnumCardTitle.STATE_URL);

      this.#_linkElement!.removeAttribute('role');
      this.#_linkElement!.removeAttribute('aria-disabled');
    } else {
      this.#_linkElement!.removeAttribute('href');
      this.#_internals.states.add(HTMLBnumCardTitle.STATE_WITHOUT_URL);
    }
  }

  /**
   * Met à jour le corps du titre de la carte.
   * @param element Elément HTML, texte ou nœud Text à insérer dans le titre
   * @private
   */
  #_updateBody(element: HTMLElement | string | Text): void {
    this.#_customBodyElement!.hidden = false;
    this.#_textSlotElement!.hidden = true;

    if (typeof element === 'string')
      this.#_customBodyElement!.textContent = element;
    else this.#_customBodyElement!.appendChild(element);
  }
  //#endregion Private methods

  //#region Public methods

  /**
   * Met à jour le contenu du titre de la carte.
   * Remplace le texte ou ajoute un élément HTML comme corps du titre.
   * @param {HTMLElement | string | Text} element Le contenu à insérer (texte, élément ou nœud Text)
   * @returns {HTMLBnumCardTitle} Retourne l'instance pour chaînage
   */
  public updateBody(
    element: HTMLElement | string | Text,
    { force = false } = {},
  ): HTMLBnumCardTitle {
    this.#_bodyScheduler ??= new Scheduler<HTMLElement | string | Text>(
      (el: Nullable<HTMLElement | string | Text>) => {
        this.#_updateBody(el!);
      },
    );

    if (!this.alreadyLoaded) this.#_initBody = element;
    else if (force) this.#_bodyScheduler.call(element);
    else this.#_bodyScheduler.schedule(element);

    return this;
  }
  //#endregion Public methods

  //#region Static methods
  /**
   * Retourne la liste des attributs observés par le composant.
   * Permet de réagir aux changements de ces attributs.
   * @returns {string[]} Liste des attributs observés
   */
  static _p_observedAttributes(): string[] {
    return [HTMLBnumCardTitle.ATTRIBUTE_URL];
  }

  /**
   * Crée dynamiquement une instance du composant HTMLBnumCardTitle.
   * Permet d'initialiser le titre avec un texte, une icône et/ou un lien.
   * @param {HTMLElement | string | Text} text Le contenu du titre (élément, texte ou chaîne)
   * @param {{ icon?: string | null; link?: string | null }} options Options pour l'icône et le lien
   * @returns {HTMLBnumCardTitle} Instance du composant configurée
   */
  public static Create(
    text: HTMLElement | string | Text,
    {
      icon = null,
      link = null,
    }: { icon?: string | null; link?: string | null },
  ): HTMLBnumCardTitle {
    let node: HTMLBnumCardTitle = document.createElement(
      HTMLBnumCardTitle.TAG,
    ) as HTMLBnumCardTitle;
    if (icon) node.icon = icon;
    if (link) node.url = link;

    return node.updateBody(text, { force: true });
  }

  /**
   * Génère le HTML d'un titre de carte avec icône et lien optionnels.
   * Utile pour créer dynamiquement le composant dans une chaîne HTML.
   * @param {string | null} icon Icône à afficher
   * @param {string} text Texte du titre
   * @param {string | null} link URL du lien
   * @returns {string} HTML généré
   */
  public static Generate(
    icon: string | null,
    text: string,
    link: string | null,
  ): string {
    let data = [];

    if (icon) data.push(`data-icon="${icon}"`);
    if (link) data.push(`url="${link}"`);

    return `<${HTMLBnumCardTitle.TAG} ${data.join(' ')}>${text}</${HTMLBnumCardTitle.TAG}>`;
  }

  /**
   * Retourne le tag HTML du composant.
   * Permet d'obtenir le nom du composant pour l'utiliser dans le DOM.
   * @readonly
   * @returns {string} Tag HTML
   */
  public static get TAG(): string {
    return TAG_CARD_TITLE;
  }
  //#endregion Static methods
}

const TEMPLATE = BnumElement.CreateTemplate(`
      <a class="${HTMLBnumCardTitle.CLASS_LINK}">
        <span class="container">
          <slot id="${HTMLBnumCardTitle.ID_SLOT_ICON}" name="${HTMLBnumCardTitle.SLOT_NAME_ICON}"></slot>
          <${HTMLBnumIcon.TAG} class="${HTMLBnumCardTitle.CLASS_ICON_TITLE}" hidden></${HTMLBnumIcon.TAG}>
        </span>
        <span class="container">
          <slot id="${HTMLBnumCardTitle.ID_SLOT_TEXT}"></slot>
          <span id="${HTMLBnumCardTitle.ID_CUSTOM_BODY}" hidden></span>
        </span>
      </a>
    `);

//#region TryDefine
HTMLBnumCardTitle.TryDefine();
//#endregion TryDefine
