import { HTMLBnumCardTitle } from '../../molecules/card-title/bnum-card-title';
import BnumElementInternal from '../../bnum-element-states';
import { Nullable } from '../../../core/utils/types';
import { CustomDom } from '../../bnum-element';
export { HTMLBnumCardElement };
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
 * <span>Contenu principal.</span>
 * </bnum-card>
 *
 * @structure Carte cliquable
 * <bnum-card clickable>
 * <span slot="title">Carte cliquable</span>
 * <span>Cliquez n'importe où.</span>
 * </bnum-card>
 *
 * @structure Carte avec titre par défaut (via data-attrs)
 * <bnum-card
 * data-title-text="Titre généré"
 * data-title-icon="info"
 * >
 * <span>Le slot "title" est vide.</span>
 * </bnum-card>
 *
 * @structure Carte avec un chargement
 * <bnum-card loading>
 * <bnum-card-title slot="title" data-icon="info">Titre en cours de chargement...</bnum-card-title>
 * <span>Chargement</span>
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
declare class HTMLBnumCardElement extends BnumElementInternal {
    #private;
    /**
     * Indique si la carte est cliquable.
     * @prop {boolean | undefined} clickable - Si vrai, rend la carte interactive et accessible (rôle bouton).
     * @attr {boolean | string | undefined} (optional) clickable
     * @type {string}
     */
    static readonly STATE_CLICKABLE = "clickable";
    /**
     * Indique si la carte est en cours de chargement.
     * @prop {boolean | undefined} loading - Si vrai, affiche un spinner et masque le corps.
     * @attr {boolean | string | undefined} (optional) loading
     * @type {string}
     */
    static readonly STATE_LOADING = "loading";
    /**
     * Classe CSS pour le titre de la carte.
     * @type {string}
     */
    static readonly CSS_CLASS_TITLE = "card-title";
    /**
     * Classe CSS pour le corps de la carte.
     * @type {string}
     */
    static readonly CSS_CLASS_BODY = "card-body";
    /**
     * Classe CSS pour l'affichage du loading.
     * @type {string}
     */
    static readonly CSS_CLASS_LOADING = "card-loading";
    /**
     * Nom de la data pour l'icône du titre.
     * @attr {string | undefined} (optional) data-title-icon - Nom de l'icône (Material Symbols) pour le titre par défaut.
     * @type {string}
     */
    static readonly DATA_TITLE_ICON = "title-icon";
    /**
     * Nom de la data pour le texte du titre.
     * @attr {string | undefined} (optional) data-title-text - Texte à afficher dans le titre par défaut.
     * @type {string}
     */
    static readonly DATA_TITLE_TEXT = "title-text";
    /**
     * Nom de la data pour le lien du titre.
     * @attr {string | undefined} (optional) data-title-link - URL à utiliser si le titre par défaut doit être un lien.
     * @type {string}
     */
    static readonly DATA_TITLE_LINK = "title-link";
    /**
     * Nom de l'évènement déclenché lors du loading.
     * @event bnum-card:loading
     * @detail { oldValue: string|null, newValue: string|null, caller: HTMLBnumCardElement }
     * @type {string}
     */
    static readonly EVENT_LOADING = "bnum-card:loading";
    /**
     * Nom de l'évènement déclenché lors d'un clic sur la carte.
     * @event bnum-card:click
     * @detail { originalEvent: MouseEvent }
     * @type {string}
     */
    static readonly EVENT_CLICK = "bnum-card:click";
    /**
     * Nom du slot pour le titre.
     * @type {string}
     */
    static readonly SLOT_TITLE = "title";
    /**
     * Nom de l'icône utilisée pour le spinner de chargement.
     * @type {string}
     */
    static readonly ICON_SPINNER = "progress_activity";
    /**
     * Symbole utilisé pour réinitialiser le contenu du slot.
     */
    static readonly SYMBOL_RESET: unique symbol;
    /** Référence à la classe HTMLBnumCardElement */
    _: typeof HTMLBnumCardElement;
    /**
     * Retourne l'icône du titre depuis les données du composant.
     * @returns {string} Icône du titre.
     */
    private get _titleIcon();
    /**
     * Retourne le texte du titre depuis les données du composant.
     * @returns {string} Texte du titre.
     */
    private get _titleText();
    /**
     * Retourne le lien du titre depuis les données du composant.
     * @returns {string} Lien du titre.
     */
    private get _titleLink();
    /**
     * Retourne les données du titre sous forme d'objet TitleData.
     * @returns {TitleData} Objet contenant les données du titre.
     */
    private get _titleData();
    /**
     * Si vrai, affiche la carte en état de chargement. Elle montre un spinner et masque le corps, de plus, tout les `pointer-events` sont désactivés.
     * @returns {boolean}
     */
    get loading(): boolean;
    /**
     * Définit l'état de chargement de la carte.
     * @param {boolean} value
     * @returns {void}
     */
    set loading(value: boolean);
    /**
     * Si vrai, la carte est cliquable et interactive.
     * @returns {boolean}
     */
    get clickable(): boolean;
    /**
     * Définit si la carte est cliquable ou non.
     * @param {boolean} value
     * @returns {void}
     */
    set clickable(value: boolean);
    /**
     * Retourne la liste des attributs observés par le composant.
     * @returns {string[]} Liste des attributs observés.
     */
    static _p_observedAttributes(): string[];
    /**
     * Constructeur de la classe HTMLBnumCardElement.
     * Initialise les écouteurs d'évènements.
     * @constructor
     */
    constructor();
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * Construit le DOM interne du composant.
     * @param {ShadowRoot | HTMLElement} container ShadowRoot ou HTMLElement cible.
     * @returns {void}
     */
    protected _p_buildDOM(container: CustomDom): void;
    /**
     * Met à jour le composant lors d'un changement d'attribut.
     * @param {string} name Nom de l'attribut modifié.
     * @param {string | null} oldVal Ancienne valeur.
     * @param {string | null} newVal Nouvelle valeur.
     * @returns {void}
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void;
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Remplace tout le contenu du slot "title" par un nouvel élément.
     * @param {Element} element Élément à insérer dans le slot "title".
     * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
     */
    updateTitle(element: Element): HTMLBnumCardElement;
    /**
     * Remplace tout le contenu du slot par défaut (body) par un nouvel élément.
     * @param {Element} element Élément à insérer dans le corps de la carte.
     * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
     */
    updateBody(element: Element): HTMLBnumCardElement;
    /**
     * Supprime tous les éléments du slot "title".
     * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
     */
    clearTitle(): HTMLBnumCardElement;
    /**
     * Supprime tous les éléments du corps de la carte (hors slot "title").
     * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
     */
    clearBody(): HTMLBnumCardElement;
    /**
     * Ajoute un élément au slot "title" sans supprimer les éléments existants.
     * @param {Element} element Élément à ajouter au slot "title".
     * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
     */
    appendToTitle(element: Element): HTMLBnumCardElement;
    /**
     * Ajoute un élément au corps de la carte (slot par défaut) sans supprimer les éléments existants.
     * @param {Element} element Élément à ajouter au corps de la carte.
     * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
     */
    appendToBody(element: Element): HTMLBnumCardElement;
    /**
     * Crée une nouvelle instance de HTMLBnumCardElement avec les options spécifiées.
     * @param param0 Options de création de la carte
     * @param param0.title Titre de la carte (optionnel)
     * @param param0.body Corps de la carte (optionnel)
     * @param param0.clickable Si vrai, rend la carte cliquable (optionnel, défaut false)
     * @param param0.loading Si vrai, affiche la carte en état de chargement (optionnel, défaut false)
     * @returns Element HTMLBnumCardElement créé
     */
    static Create({ title, body, clickable, loading, }?: {
        title?: Nullable<HTMLBnumCardTitle>;
        body?: Nullable<Element>;
        clickable?: boolean;
        loading?: boolean;
    }): HTMLBnumCardElement;
    /**
     * Retourne le nom de la balise personnalisée pour cet élément.
     * @returns Nom de la balise personnalisée.
     */
    static get TAG(): string;
}
