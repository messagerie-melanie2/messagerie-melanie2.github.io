import { HTMLBnumInput } from '../input/bnum-input';
/**
 * Input de temps.
 *
 * @structure Sans rien
 * <bnum-input-time></bnum-input-time>
 *
 * @structure Avec une légende
 * <bnum-input-time>Label du champ</bnum-input-time>
 *
 * @structure Avec une légende et un indice
 * <bnum-input-time>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input-time>
 *
 * @structure Avec un bouton
 * <bnum-input-time button="true" button-icon="add">Label du champ
 *   <span slot="button">Ajouter</span>
 * </bnum-input-time>
 *
 * @structure En erreur
 * <bnum-input-time min="05:00" data-value="04:00">Label du champ
 * </bnum-input-time>
 *
 * @structure Avec un état de succès
 * <bnum-input-time state="success">Label du champ
 *   <span slot="success">Le champ est valide !</span>
 * </bnum-input-time>
 *
 * @structure Avec une icône
 * <bnum-input-time icon="search">Label du champ</bnum-input-time>
 *
 * @structure Avec un bouton avec icône seulement
 * <bnum-input-time placeholder="LA LA !" button-icon="add">Label du champ
 * </bnum-input-time>
 *
 * @structure Désactivé
 * <bnum-input-time disabled>
 *   Label du champ
 * </bnum-input-time>
 *
 * @structure Complet
 * <bnum-input-time
 *   data-value="5"
 *   placeholder="Texte indicatif"
 *   type="text"
 *   state="error"
 *   icon="search"
 *   button="primary"
 *   button-icon="send"
 *   step="10"
 * >
 *   Label du champ
 *   <span slot="hint">Indice d'utilisation</span>
 *   <span slot="success">Le champ est valide !</span>
 *   <span slot="error">Le champ est invalide !</span>
 *   <span slot="button">Envoyer</span>
 * </bnum-input-time>
 *
 */
export declare class HTMLBnumInputTime extends HTMLBnumInput {
    /**
     * @attr {string} (optional) (default: 'number') type - Type de l'input (text, password, email, etc.) Ne pas modifier, toujours 'number' pour ce composant.
     */
    static readonly ATTRIBUTE_TYPE = "type";
    /**
     * Valeur pour l'attribut type.
     */
    static readonly TYPE = "time";
    /** Référence à la classe HTMLBnumInputTime */
    __: typeof HTMLBnumInputTime;
    constructor();
    protected _p_getStylesheets(): CSSStyleSheet[];
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
     * @returns {HTMLBnumInputTime} Instance du composant.
     */
    static Create(label: string, { 'data-value': dataValue, placeholder, name, disabled, state, button, 'button-icon': buttonIcon, icon, required, readonly, pattern, minlength, maxlength, autocomplete, inputmode, spellcheck, min, max, hint, success, error, btnText, step, }?: {
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
        min?: number;
        max?: number;
        step?: number;
    }): HTMLBnumInputTime;
    /**
     *@inheritdoc
     */
    static get TAG(): string;
}
