import JsEvent from '@rotomeca/event';
import symbols from '../../../core/styles/material-symbols.css';
import { EMPTY_STRING } from '@rotomeca/utils';
import BnumElement from '../../bnum-element.js';
import ElementChangedEvent from '../../../core/utils/events/ElementChangedEvent.js';
import { TAG_ICON } from '../../../core/utils/constants/tags.js';
import { Scheduler } from '../../../core/utils/scheduler';
import { Nullable } from '../../../core/utils/types';

/**
 * Classe CSS utilisée pour les icônes Material Symbols.
 */
const ICON_CLASS = 'material-symbols-outlined';

/**
 * Feuille de style CSS pour les icônes Material Symbols.
 */
const SYMBOLS = BnumElement.ConstructCSSStyleSheet(
  symbols.replaceAll(`.${ICON_CLASS}`, ':host'),
);

/**
 * Composant personnalisé <bnum-icon> pour afficher une icône Material Symbol.
 *
 * Ce composant permet d'afficher une icône en utilisant le nom de l'icône Material Symbol.
 * Le nom peut être défini via le contenu du slot ou via l'attribut `data-icon`.
 *
 * @example
 * <bnum-icon>home</bnum-icon>
 * <bnum-icon data-icon="search"></bnum-icon>
 *
 * @slot (default) - Nom de l'icône material symbol.
 *
 * @event custom:element-changed:icon - Déclenché lors du changement d'icône.
 */
export class HTMLBnumIcon extends BnumElement {
  //#region Constantes
  /**
   * Nom de l'événement déclenché lors du changement d'icône.
   * @type {string}
   */
  static readonly EVENT_ICON_CHANGED: string = 'icon';
  /**
   * Nom de la donnée pour l'icône.
   * @type {string}
   */
  static readonly DATA_ICON: string = 'icon';
  /**
   * Attribut HTML pour définir l'icône.
   * @type {string}
   */
  static readonly ATTRIBUTE_DATA_ICON: string = `data-${HTMLBnumIcon.DATA_ICON}`;
  /**
   * Nom de l'attribut class.
   * @type {string}
   */
  static readonly ATTRIBUTE_CLASS: string = 'class';
  //#endregion Constantes

  //#region Private fields
  #_updateScheduler: Nullable<Scheduler<string>> = null;
  /**
   * Événement déclenché lors du changement d'icône.
   */
  #_oniconchanged: Nullable<
    JsEvent<(newIcon: string, oldIcon: string) => void>
  > = null;
  //#endregion Private fields

  //#region Getter/setter
  /**
   * Événement déclenché lors du changement d'icône. (via la propriété icon)
   */
  get oniconchanged(): JsEvent<(newIcon: string, oldIcon: string) => void> {
    this.#_oniconchanged ??= new JsEvent<
      (newIcon: string, oldIcon: string) => void
    >();
    return this.#_oniconchanged;
  }

  /**
   * Obtient le nom de l'icône actuellement affichée.
   * @returns {string} Le nom de l'icône.
   */
  get icon(): string {
    const icon =
      this.textContent?.trim?.() ||
      (this.data(HTMLBnumIcon.DATA_ICON) as string) ||
      EMPTY_STRING;

    return icon;
  }

  /**
   * Définit le nom de l'icône à afficher.
   * Déclenche l'événement oniconchanged si la valeur change.
   * @param {string | null} value - Le nouveau nom de l'icône.
   * @throws {Error} Si la valeur n'est pas une chaîne valide.
   */
  set icon(value: string | null) {
    if (value !== null) {
      if (typeof value === 'string' && /^[\w-]+$/.test(value)) {
        const oldValue = this.icon;
        this.data(HTMLBnumIcon.DATA_ICON, value);

        this.#_requestUpdateDOM(value);

        this.oniconchanged.call(value, oldValue);
      } else {
        throw new Error('Icon must be a valid string.');
      }
    }
  }
  //#endregion Getter/setter

  //#region Lifecycle
  /**
   * Constructeur du composant HTMLBnumIcon.
   * Initialise les écouteurs d'attributs et l'événement oniconchanged.
   */
  constructor() {
    super();

    this.oniconchanged.add('default', (newIcon: string, oldIcon: string) => {
      this.dispatchEvent(
        new ElementChangedEvent(
          HTMLBnumIcon.EVENT_ICON_CHANGED,
          newIcon,
          oldIcon,
          this,
        ),
      );
    });
  }

  /**
   * Retourne les feuilles de style à appliquer dans le Shadow DOM.
   * @returns {CSSStyleSheet[]} Les feuilles de style.
   */
  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [SYMBOLS];
  }

  /**
   * Construit le DOM interne du composant.
   * @param {ShadowRoot} container - Le conteneur du Shadow DOM.
   */
  protected _p_buildDOM(container: ShadowRoot): void {
    container.appendChild(this._p_createSlot());

    const icon = this.data<string>(HTMLBnumIcon.DATA_ICON);
    if (icon) this.#_updateIcon(icon);

    if (!this.hasAttribute('aria-hidden') && !this.hasAttribute('aria-label')) {
      this.setAttribute('aria-hidden', 'true');
    }
  }
  //#endregion Lifecycle

  //#region Private methods
  /**
   * Demande une mise à jour du DOM pour l'icône.
   * @param {string} icon - Nom de l'icône.
   * @returns {this}
   * @private
   */
  #_requestUpdateDOM(icon: string): this {
    this.#_updateScheduler ??= new Scheduler<string>(
      (icon: Nullable<string>) => {
        this.#_updateIcon(icon!);
      },
    );
    this.#_updateScheduler.schedule(icon);
    return this;
  }

  /**
   * Met à jour l'affichage de l'icône.
   * @param {string} icon - Nom de l'icône.
   * @private
   */
  #_updateIcon(icon: string): void {
    this.textContent = icon;
  }
  //#endregion Private methods

  //#region Static methods
  /**
   * Crée une nouvelle instance de HTMLBnumIcon avec l'icône spécifiée.
   * @param {string} icon - Le nom de l'icône à utiliser.
   * @returns {HTMLBnumIcon} L'élément créé.
   */
  static Create(icon: string): HTMLBnumIcon {
    const element = this.EMPTY;
    element.icon = icon;
    return element;
  }

  /**
   * Retourne le tag HTML utilisé pour ce composant.
   * @returns {string}
   * @readonly
   */
  static get TAG(): string {
    return TAG_ICON;
  }

  /**
   * Retourne un élément HTMLBnumIcon vide.
   * @returns {HTMLBnumIcon}
   */
  static get EMPTY(): HTMLBnumIcon {
    return document.createElement(HTMLBnumIcon.TAG) as HTMLBnumIcon;
  }

  /**
   * Retourne la classe CSS utilisée pour les icônes Material Symbols.
   * @returns {string}
   */
  static get HTML_CLASS(): string {
    return ICON_CLASS;
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'home'.
   * @returns {HTMLBnumIcon}
   */
  static get HOME(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('home');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'search'.
   * @returns {HTMLBnumIcon}
   */
  static get SEARCH(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('search');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'settings'.
   * @returns {HTMLBnumIcon}
   */
  static get SETTINGS(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('settings');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'person'.
   * @returns {HTMLBnumIcon}
   */
  static get USER(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('person');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'mail'.
   * @returns {HTMLBnumIcon}
   */
  static get MAIL(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('mail');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'close'.
   * @returns {HTMLBnumIcon}
   */
  static get CLOSE(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('close');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'check'.
   * @returns {HTMLBnumIcon}
   */
  static get CHECK(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('check');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'warning'.
   * @returns {HTMLBnumIcon}
   */
  static get WARNING(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('warning');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'info'.
   * @returns {HTMLBnumIcon}
   */
  static get INFO(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('info');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'delete'.
   * @returns {HTMLBnumIcon}
   */
  static get DELETE(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('delete');
  }

  /**
   * Retourne une instance de HTMLBnumIcon avec l'icône 'add'.
   * @returns {HTMLBnumIcon}
   */
  static get ADD(): HTMLBnumIcon {
    return HTMLBnumIcon.Create('add');
  }
  //#endregion Static methods
}

//#region TryDefine
HTMLBnumIcon.TryDefine();
//#endregion TryDefine
