import { HTMLBnumInput } from '../input/bnum-input';
/**
 * Input texte.
 *
 * @structure Sans rien
 * <bnum-input-text></bnum-input-text>
 *
 * @structure Avec une légende
 * <bnum-input-text>Label du champ</bnum-input-text>
 *
 * @structure Avec une légende et un indice
 * <bnum-input-text>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input-text>
 *
 * @structure Avec un bouton
 * <bnum-input-text button="true" button-icon="add">Label du champ
 *   <span slot="button">Ajouter</span>
 * </bnum-input-text>
 *
 * @structure En erreur
 * <bnum-input-text pattern="^[a-zA-Z0-9]+$" data-value="@@@@@">Label du champ
 * </bnum-input-text>
 *
 * @structure Avec un état de succès
 * <bnum-input-text state="success">Label du champ
 *   <span slot="success">Le champ est valide !</span>
 * </bnum-input-text>
 *
 * @structure Avec une icône
 * <bnum-input-text icon="search">Label du champ</bnum-input-text>
 *
 * @structure Avec un bouton avec icône seulement
 * <bnum-input-text placeholder="LA LA !" button-icon="add">Label du champ
 * </bnum-input-text>
 *
 * @structure Désactivé
 * <bnum-input-text disabled>
 *   Label du champ
 * </bnum-input-text>
 *
 * @structure Complet
 * <bnum-input-text
 *   data-value="Valeur initiale"
 *   placeholder="Texte indicatif"
 *   type="text"
 *   state="error"
 *   icon="search"
 *   button="primary"
 *   button-icon="send"
 * >
 *   Label du champ
 *   <span slot="hint">Indice d'utilisation</span>
 *   <span slot="success">Le champ est valide !</span>
 *   <span slot="error">Le champ est invalide !</span>
 *   <span slot="button">Envoyer</span>
 * </bnum-input-text>
 *
 */
export declare class HTMLBnumInputText extends HTMLBnumInput {
    /**
     * @attr {string} (optional) (default: 'text') type - Type de l'input (text, password, email, etc.) Ne pas modifier, toujours 'text' pour ce composant.
     */
    static readonly ATTRIBUTE_TYPE = "type";
    /**
     * Valeur 'text' pour l'attribut type.
     */
    static readonly TYPE_TEXT = "text";
    /** Référence à la classe HTMLBnumInputText */
    __: typeof HTMLBnumInputText;
    constructor();
    protected _p_preload(): void;
    /**
     *@inheritdoc
     */
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    /**
     *@inheritdoc
     */
    static _p_observedAttributes(): string[];
    /**
     * Crée une instance du composant avec les options fournies.
     * @param label Texte du label principal.
     * @param options Options d'initialisation (attributs et slots).
     * @returns {HTMLBnumInputText} Instance du composant.
     */
    static Create(label: string, { 'data-value': dataValue, placeholder, name, disabled, state, button, 'button-icon': buttonIcon, icon, required, readonly, pattern, minlength, maxlength, autocomplete, inputmode, spellcheck, hint, success, error, btnText, }?: {
        'data-value'?: string;
        placeholder?: string;
        name?: string;
        disabled?: string;
        state?: string;
        button?: string;
        'button-icon'?: string;
        icon?: string;
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
    }): HTMLBnumInputText;
    /**
     *@inheritdoc
     */
    static get TAG(): string;
}
