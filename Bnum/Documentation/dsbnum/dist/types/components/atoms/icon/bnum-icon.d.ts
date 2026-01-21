import JsEvent from '@rotomeca/event';
import BnumElementInternal from '../../bnum-element-states.js';
/**
 * Composant personnalisé "bnum-icon" pour afficher une icône Material Symbol.
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
export declare class HTMLBnumIcon extends BnumElementInternal {
    #private;
    /**
     * Nom de l'événement déclenché lors du changement d'icône.
     * @type {string}
     */
    static readonly EVENT_ICON_CHANGED: string;
    /**
     * Nom de la donnée pour l'icône.
     * @type {string}
     */
    static readonly DATA_ICON: string;
    /**
     * Attribut HTML pour définir l'icône.
     * @type {string}
     */
    static readonly ATTRIBUTE_DATA_ICON: string;
    /**
     * Nom de l'attribut class.
     * @type {string}
     */
    static readonly ATTRIBUTE_CLASS: string;
    /**
     * Événement déclenché lors du changement d'icône. (via la propriété icon)
     */
    get oniconchanged(): JsEvent<(newIcon: string, oldIcon: string) => void>;
    /**
     * Obtient le nom de l'icône actuellement affichée.
     * @returns {string} Le nom de l'icône.
     */
    get icon(): string;
    /**
     * Définit le nom de l'icône à afficher.
     * Déclenche l'événement oniconchanged si la valeur change.
     * @param {string | null} value - Le nouveau nom de l'icône.
     * @throws {Error} Si la valeur n'est pas une chaîne valide.
     */
    set icon(value: string | null);
    /**
     * Constructeur du composant HTMLBnumIcon.
     * Initialise les écouteurs d'attributs et l'événement oniconchanged.
     */
    constructor();
    /**
     * Retourne les feuilles de style à appliquer dans le Shadow DOM.
     * @returns {CSSStyleSheet[]} Les feuilles de style.
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Construit le DOM interne du composant.
     * @param {ShadowRoot} container - Le conteneur du Shadow DOM.
     */
    protected _p_buildDOM(container: ShadowRoot): void;
    /**
     * Crée une nouvelle instance de HTMLBnumIcon avec l'icône spécifiée.
     * @param {string} icon - Le nom de l'icône à utiliser.
     * @returns {HTMLBnumIcon} L'élément créé.
     */
    static Create(icon: string): HTMLBnumIcon;
    static Write(icon: string, attribs?: Record<string, string>): string;
    /**
     * Retourne le tag HTML utilisé pour ce composant.
     * @returns {string}
     * @readonly
     */
    static get TAG(): string;
    /**
     * Retourne un élément HTMLBnumIcon vide.
     * @returns {HTMLBnumIcon}
     */
    static get EMPTY(): HTMLBnumIcon;
    /**
     * Retourne la classe CSS utilisée pour les icônes Material Symbols.
     * @returns {string}
     */
    static get HTML_CLASS(): string;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'home'.
     * @returns {HTMLBnumIcon}
     */
    static get HOME(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'search'.
     * @returns {HTMLBnumIcon}
     */
    static get SEARCH(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'settings'.
     * @returns {HTMLBnumIcon}
     */
    static get SETTINGS(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'person'.
     * @returns {HTMLBnumIcon}
     */
    static get USER(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'mail'.
     * @returns {HTMLBnumIcon}
     */
    static get MAIL(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'close'.
     * @returns {HTMLBnumIcon}
     */
    static get CLOSE(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'check'.
     * @returns {HTMLBnumIcon}
     */
    static get CHECK(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'warning'.
     * @returns {HTMLBnumIcon}
     */
    static get WARNING(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'info'.
     * @returns {HTMLBnumIcon}
     */
    static get INFO(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'delete'.
     * @returns {HTMLBnumIcon}
     */
    static get DELETE(): HTMLBnumIcon;
    /**
     * Retourne une instance de HTMLBnumIcon avec l'icône 'add'.
     * @returns {HTMLBnumIcon}
     */
    static get ADD(): HTMLBnumIcon;
}
