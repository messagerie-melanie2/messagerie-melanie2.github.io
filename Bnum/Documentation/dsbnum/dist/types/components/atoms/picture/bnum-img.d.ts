import BnumElement from '../../bnum-element.js';
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
    #private;
    /**
     * Nom de l'attribut 'src'.
     * @attr {string} src - Utilisé pour définir l'URL de l'image.
     */
    static readonly ATTRIBUTE_SRC = "src";
    /**
     * Nom de l'attribut 'alt'.
     * @attr {string} (optional) alt - Utilisé pour définir le texte alternatif de l'image. Optionnel, mais recommandé pour l'accessibilité.
     */
    static readonly ATTRIBUTE_ALT = "alt";
    /**
     * Chaîne de caractères représentant le suffixe pour les images en mode clair.
     */
    static readonly STRING_SRC_LIGHT = "-light";
    /**
     * Chaîne de caractères représentant le suffixe pour les images en mode sombre.
     */
    static readonly STRING_SRC_DARK = "-dark";
    /**
     * Nom de l'événement déclenché lorsque l'image est chargée avec succès.
     * @event load
     * @detail Event
     */
    static readonly EVENT_LOAD = "load";
    /**
     * Nom de l'événement déclenché lorsqu'une erreur survient lors du chargement de l'image.
     * @event error
     * @detail Event
     */
    static readonly EVENT_ERROR = "error";
    /**
     * Nom de la variable CSS pour l'URL de l'image en mode clair.
     */
    static readonly CSS_VARIABLE_IMAGE_LIGHT = "--_image-light";
    /**
     * Nom de la variable CSS pour l'URL de l'image en mode sombre.
     */
    static readonly CSS_VARIABLE_IMAGE_DARK = "--_image-dark";
    /**
     * Retourne l'URL de l'image.
     * Permet d'obtenir la valeur de l'attribut 'src'.
     * @type {string}
     * @readonly
     */
    get src(): string | null;
    /**
     * Retourne l'URL de l'image en mode sombre.
     * Génère dynamiquement l'URL pour le mode sombre à partir de l'attribut 'src'.
     * @type {string}
     * @readonly
     */
    get darkUrl(): string | null;
    /**
     * Retourne l'élément image HTML associé.
     * Permet d'accéder directement à l'élément <img> du composant.
     * @type {HTMLImageElement}
     * @readonly
     */
    get picture(): HTMLImageElement;
    /**
     * Constructeur de l'élément BnumHTMLPicture.
     * Initialise l'observateur de mutations et les gestionnaires d'attributs.
     */
    constructor();
    /**
     * @inheritdoc
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Construit le DOM du composant.
     * Crée l'élément <img> et initialise ses attributs.
     * @param {ShadowRoot | HTMLElement} container - Le conteneur dans lequel insérer l'image.
     * @protected
     */
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    /**
     * Met à jour le composant lors d'un changement d'attribut.
     * Actualise l'image et ses propriétés selon les nouveaux attributs.
     * @param {string} name - Nom de l'attribut modifié.
     * @param {string | null} oldVal - Ancienne valeur de l'attribut.
     * @param {string | null} newVal - Nouvelle valeur de l'attribut.
     * @protected
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void;
    /**
     * Attache les gestionnaires d'événements à l'image.
     * Permet de réagir aux événements 'load' et 'error' de l'image.
     * @protected
     */
    protected _p_attach(): void;
    /**
     * @inheritdoc
     */
    protected _p_isUpdateForAllAttributes(): boolean;
    /**
     * Retourne la liste des attributs observés par le composant.
     * Permet au composant de réagir aux changements de ces attributs.
     * @returns {string[]}
     * @protected
     */
    protected static _p_observedAttributes(): string[];
    /**
     * Crée un nouvel élément BnumHTMLPicture avec la source spécifiée.
     * Permet d'instancier facilement le composant avec une image donnée.
     * @param {string} src - L'URL de l'image à afficher.
     * @returns {HTMLBnumPicture}
     * @static
     */
    static Create(src: string): HTMLBnumPicture;
    /**
     * Retourne le nom de la balise personnalisée associée à ce composant.
     * Utilisé pour définir et référencer le composant dans le DOM.
     * @type {string}
     * @static
     * @readonly
     */
    static get TAG(): string;
}
