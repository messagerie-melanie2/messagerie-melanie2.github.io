import { EMPTY_STRING } from '@rotomeca/utils';
import { REG_LIGHT_PICTURE_NAME } from '../../../core/utils/constants/regexp.js';
import { TAG_PICTURE } from '../../../core/utils/constants/tags.js';
import BnumElement from '../../bnum-element.js';
import style from './bnum-img.less';

/**
 * Feuille de style CSS pour le composant BnumHTMLPicture.
 */
const SHEET = BnumElement.ConstructCSSStyleSheet(style);

/**
 * Élément web personnalisé permettant d'afficher une image qui s'adapte automatiquement au mode sombre ou clair de l'interface.
 *
 * Le composant utilise des variables CSS pour gérer les différentes versions de l'image en fonction du thème.
 *
 * ## Attributs
 * - `src` : L'URL de l'image à afficher.
 * - `alt` : Texte alternatif pour l'image.
 *
 * ## Evènements
 * - `load` : Déclenché lorsque l'image est chargée avec succès.
 * - `error` : Déclenché si une erreur survient lors du chargement de l'image.
 *
 * @structure Image avec -light dans le nom de fichier
 * <bnum-img src="assets/icon-light.png" alt="Description"></bnum-img>
 *
 * @structure Image sans -light dans le nom de fichier
 * <bnum-img src="assets/logo.png" alt="Description"></bnum-img>
 *
 * @cssvar {var(--_image-light)} --_image-url - Url de l'image de la balise `img`. Ne pas modifier, sauf lors de la surcharge dans votre système de mode sombre.
 * @cssvar {} --_image-dark - Variable à assigner à `--_image-url` en mode sombre. Ne pas modifier.
 * @cssvar {} --_image-light - Ne pas modifier.
 *
 *
 * @class
 * @extends BnumElement
 * @example
 * <bnum-img src="image-light.png" alt="Description"></bnum-img>
 */
export default class HTMLBnumPicture extends BnumElement {
  //#region Constants
  /**
   * Nom de l'attribut 'src'.
   * @attr {string} src - Utilisé pour définir l'URL de l'image.
   */
  static readonly ATTRIBUTE_SRC = 'src';
  /**
   * Nom de l'attribut 'alt'.
   * @attr {string} (optional) alt - Utilisé pour définir le texte alternatif de l'image. Optionnel, mais recommandé pour l'accessibilité.
   */
  static readonly ATTRIBUTE_ALT = 'alt';
  /**
   * Chaîne de caractères représentant le suffixe pour les images en mode clair.
   */
  static readonly STRING_SRC_LIGHT = '-light';
  /**
   * Chaîne de caractères représentant le suffixe pour les images en mode sombre.
   */
  static readonly STRING_SRC_DARK = '-dark';
  /**
   * Nom de l'événement déclenché lorsque l'image est chargée avec succès.
   * @event load
   * @detail Event
   */
  static readonly EVENT_LOAD = 'load';
  /**
   * Nom de l'événement déclenché lorsqu'une erreur survient lors du chargement de l'image.
   * @event error
   * @detail Event
   */
  static readonly EVENT_ERROR = 'error';
  /**
   * Nom de la variable CSS pour l'URL de l'image en mode clair.
   */
  static readonly CSS_VARIABLE_IMAGE_LIGHT = '--_image-light';
  /**
   * Nom de la variable CSS pour l'URL de l'image en mode sombre.
   */
  static readonly CSS_VARIABLE_IMAGE_DARK = '--_image-dark';
  //#endregion Constants

  //#region Private fields
  #_img: HTMLImageElement | null = null;
  //#endregion Private fields

  //#region Setters/Getters
  /**
   * Retourne l'URL de l'image.
   * Permet d'obtenir la valeur de l'attribut 'src'.
   * @type {string}
   * @readonly
   */
  get src(): string | null {
    return this.getAttribute(HTMLBnumPicture.ATTRIBUTE_SRC);
  }

  /**
   * Retourne l'URL de l'image en mode sombre.
   * Génère dynamiquement l'URL pour le mode sombre à partir de l'attribut 'src'.
   * @type {string}
   * @readonly
   */
  get darkUrl(): string | null {
    if (this.hasAttribute(HTMLBnumPicture.ATTRIBUTE_SRC)) {
      //On récupère l'attribut src de l'élément
      const attr = this.getAttribute(HTMLBnumPicture.ATTRIBUTE_SRC) as string;

      //On vérifie si l'attibut src contient le mot clé "light".
      if (attr.match(REG_LIGHT_PICTURE_NAME)?.length)
        //Si c'est le cas, on remplace "light" par "dark" dans l'URL de l'image.
        return attr.replace(
          REG_LIGHT_PICTURE_NAME,
          `${HTMLBnumPicture.STRING_SRC_DARK}.$2`,
        );
      else
        // Si l'attribut src ne contient pas le mot clé "light", on remplace la dernière partie de l'URL par "-dark".
        return (
          attr.split('.').slice(0, -1).join('.') +
          `${HTMLBnumPicture.STRING_SRC_DARK}.` +
          attr.split('.').slice(-1)
        );
    }

    return null;
  }

  /**
   * Retourne l'élément image HTML associé.
   * Permet d'accéder directement à l'élément <img> du composant.
   * @type {HTMLImageElement}
   * @readonly
   */
  get picture(): HTMLImageElement {
    return this.shadowRoot!.querySelector('img') as HTMLImageElement;
  }
  //#endregion Setters/Getters
  //#region Lifecycle
  /**
   * Constructeur de l'élément BnumHTMLPicture.
   * Initialise l'observateur de mutations et les gestionnaires d'attributs.
   */
  constructor() {
    super();
  }

  /**
   * @inheritdoc
   */
  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [SHEET];
  }

  /**
   * Construit le DOM du composant.
   * Crée l'élément <img> et initialise ses attributs.
   * @param {ShadowRoot | HTMLElement} container - Le conteneur dans lequel insérer l'image.
   * @protected
   */
  protected _p_buildDOM(container: ShadowRoot | HTMLElement): void {
    this.#_img = document.createElement('img');

    // On met à jour les attributs (logique de _p_update)
    this.#_updatePicture(
      this.src,
      this.getAttribute(HTMLBnumPicture.ATTRIBUTE_ALT),
    );

    container.appendChild(this.#_img);

    this.setAttribute('role', 'img');
  }

  /**
   * Met à jour le composant lors d'un changement d'attribut.
   * Actualise l'image et ses propriétés selon les nouveaux attributs.
   * @param {string} name - Nom de l'attribut modifié.
   * @param {string | null} oldVal - Ancienne valeur de l'attribut.
   * @param {string | null} newVal - Nouvelle valeur de l'attribut.
   * @protected
   */
  protected _p_update(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    if (
      name === HTMLBnumPicture.ATTRIBUTE_SRC ||
      name === HTMLBnumPicture.ATTRIBUTE_ALT
    ) {
      this.#_updatePicture(
        this.src,
        this.getAttribute(HTMLBnumPicture.ATTRIBUTE_ALT),
      );
    }
  }

  /**
   * Attache les gestionnaires d'événements à l'image.
   * Permet de réagir aux événements 'load' et 'error' de l'image.
   * @protected
   */
  protected _p_attach(): void {
    super._p_attach();

    if (this.#_img) {
      this.#_img.addEventListener(
        HTMLBnumPicture.EVENT_LOAD,
        this.trigger.bind(this, HTMLBnumPicture.EVENT_LOAD),
      );
      this.#_img.addEventListener(
        HTMLBnumPicture.EVENT_ERROR,
        this.trigger.bind(this, HTMLBnumPicture.EVENT_ERROR),
      );
    }
  }

  /**
   * @inheritdoc
   */
  protected _p_isUpdateForAllAttributes(): boolean {
    return true;
  }
  //#endregion Lifecycle

  //#region Private methods
  /**
   * Met à jour l'image affichée et ses propriétés.
   * Centralise la logique de mise à jour de l'élément <img>.
   * @param {string | null} src - URL de l'image.
   * @param {string | null} alt - Texte alternatif.
   * @private
   */
  #_updatePicture(src: string | null, alt: string | null): void {
    if (!this.#_img) return;

    const darkSrc = this.darkUrl;

    // 1. On passe les URLs au CSS via des variables sur :host
    this.style.setProperty(
      HTMLBnumPicture.CSS_VARIABLE_IMAGE_LIGHT,
      `url(${src ?? EMPTY_STRING})`,
    );
    this.style.setProperty(
      HTMLBnumPicture.CSS_VARIABLE_IMAGE_DARK,
      `url(${darkSrc ?? EMPTY_STRING})`,
    );

    this.#_img.alt = alt ?? EMPTY_STRING;

    if (alt) this.setAttribute('aria-label', alt ?? EMPTY_STRING);
  }
  //#endregion Private methods

  //#region Static methods

  /**
   * Retourne la liste des attributs observés par le composant.
   * Permet au composant de réagir aux changements de ces attributs.
   * @returns {string[]}
   * @protected
   */
  protected static _p_observedAttributes(): string[] {
    const array = super._p_observedAttributes();
    array.push(HTMLBnumPicture.ATTRIBUTE_SRC, HTMLBnumPicture.ATTRIBUTE_ALT);
    return array;
  }

  /**
   * Crée un nouvel élément BnumHTMLPicture avec la source spécifiée.
   * Permet d'instancier facilement le composant avec une image donnée.
   * @param {string} src - L'URL de l'image à afficher.
   * @returns {HTMLBnumPicture}
   * @static
   */
  static Create(src: string): HTMLBnumPicture {
    const element = document.createElement(this.TAG) as HTMLBnumPicture;
    element.setAttribute(HTMLBnumPicture.ATTRIBUTE_SRC, src);
    return element;
  }

  /**
   * Retourne le nom de la balise personnalisée associée à ce composant.
   * Utilisé pour définir et référencer le composant dans le DOM.
   * @type {string}
   * @static
   * @readonly
   */
  static get TAG(): string {
    return TAG_PICTURE;
  }
  //#endregion Static methods
}

//#region TryDefine
HTMLBnumPicture.TryDefine();
//#endregion
