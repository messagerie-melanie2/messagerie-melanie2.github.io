import { HTMLBnumInput } from '../input/bnum-input';
/**
 * Composant d'input de recherche.
 *
 * Utilise le composant de base `bnum-input` avec des configurations spécifiques pour la recherche.
 *
 * @structure Basique
 * <bnum-input-search>Label de recherche</bnum-input-search>
 *
 * @structure Avec une légende et un indice
 * <bnum-input-search>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input-search>
 *
 * @structure Désactivé
 * <bnum-input-search disabled placeholder="Recherche désactivée">
 *   Label du champ
 * </bnum-input-search>
 *
 * @structure Avec des boutons custom
 * <bnum-input-search placeholder="Recherche avec des boutons">
 *   Label du champ
 *   <bnum-icon-button slot="actions">filter_list</bnum-icon-button>
 *
 * </bnum-input-search>
 *
 * @slot button - Contenu du bouton de recherche (texte ou icône). (Inutilisé)
 * @slot actions - Contenu des actions personnalisées à droite du champ de recherche.
 *
 */
export declare class HTMLBnumInputSearch extends HTMLBnumInput {
    #private;
    /**
     * @attr {string} (default: 'text') type - Type de l'input (text, password, email, etc.) Ne pas modifier, toujours 'text' pour ce composant.
     */
    static readonly ATTRIBUTE_TYPE = "type";
    /**
     * @attr {undefined} (default: undefined) button - Attribut pour afficher le bouton interne. Ne pas modifier, toujours présent pour ce composant.
     */
    static readonly ATTRIBUTE_BUTTON = "button";
    /**
     * @attr {string} (default: 'search') button-icon - Icône du bouton interne. Ne pas modifier, toujours 'search' pour ce composant.
     */
    static readonly ATTRIBUTE_BUTTON_ICON = "button-icon";
    /**
     * Texte affiché dans le champ de recherche.
     */
    static readonly TEXT_SEARCH_FIELD: string;
    /**
     * Événement déclenché au clic sur le bouton interne.
     * @event bnum-input:button.click
     * @detail MouseEvent
     */
    static readonly EVENT_BUTTON_CLICK = "bnum-input:button.click";
    /**
     * Événement déclenché au clic par le bouton interne ou à la validation par la touche "Entrée".
     * Envoie la valeur actuelle de l'input de recherche.
     * @event bnum-input-search:search
     * @detail { value: string; name: string; caller: HTMLBnumInputSearch }
     */
    static readonly EVENT_SEARCH = "bnum-input-search:search";
    /**
     * Événement déclenché lors du clic sur le bouton de vidage du champ de recherche.
     * @event bnum-input-search:clear
     * @detail { caller: HTMLBnumInputSearch }
     */
    static readonly EVENT_CLEAR = "bnum-input-search:clear";
    /**
     * Icône du bouton de recherche.
     */
    static readonly BUTTON_ICON = "search";
    /**
     * ID du conteneur des actions de recherche.
     */
    static readonly ID_ACTIONS_CONTAINER = "input-search-actions-container";
    /**
     * ID du bouton pour vider le champ de recherche.
     */
    static readonly ID_CLEAR_BUTTON = "input-clear-button";
    /**
     * Nom du slot pour les actions personnalisées.
     */
    static readonly SLOT_ACTIONS = "actions";
    /**
     * Constructeur du composant de recherche.
     */
    constructor();
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Précharge les attributs spécifiques à l'input de recherche.
     * Définit le placeholder et l'icône du bouton si non présents.
     */
    protected _p_preload(): void;
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    /**
     * Attache les événements nécessaires au composant.
     * Supprime les attributs inutiles et gère les événements de recherche.
     */
    protected _p_attach(): void;
    protected _p_inputValueChangedCallback(e: Event): void;
    /**
     * Nettoie les attributs après le rendu du composant.
     */
    protected _p_postFlush(): void;
    /**
     * Désactive le bouton de recherche.
     */
    disableSearchButton(): this;
    /**
     * Active le bouton de recherche.
     */
    enableSearchButton(): this;
    /**
     * Retourne la liste des attributs observés, en excluant ceux spécifiques à la recherche.
     * @inheritdoc
     */
    static _p_observedAttributes(): string[];
    /**
     * Crée une instance du composant avec les options fournies.
     * @param label Texte du label principal.
     * @param options Options d'initialisation (attributs et slots).
     * @returns {HTMLBnumInput} Instance du composant.
     */
    static Create(label: string, { 'data-value': dataValue, placeholder, name, disabled, state, required, readonly, pattern, minlength, maxlength, autocomplete, inputmode, spellcheck, hint, success, error, btnText, }?: {
        'data-value'?: string;
        placeholder?: string;
        name?: string;
        disabled?: string;
        state?: string;
        required?: string;
        readonly?: string;
        pattern?: string;
        minlength?: string;
        maxlength?: string;
        autocomplete?: string;
        inputmode?: string;
        spellcheck?: string;
        hint?: string;
        success?: string;
        error?: string;
        btnText?: string;
    }): HTMLBnumInputSearch;
    /**
     * Crée un composant de recherche à partir d'un input existant.
     * @param input Instance de HTMLBnumInput à convertir.
     * @returns {HTMLBnumInputSearch} Nouvelle instance de recherche.
     */
    static FromInput(input: HTMLBnumInput): HTMLBnumInputSearch;
    /**
     * Retourne le tag HTML du composant.
     */
    static get TAG(): string;
}
