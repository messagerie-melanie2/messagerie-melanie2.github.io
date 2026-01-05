import { HTMLBnumInput } from '../input/bnum-input';
/**
 * Input de date.
 *
 * @structure Sans rien
 * <bnum-input-date></bnum-input-date>
 *
 * @structure Avec une légende
 * <bnum-input-date>Label du champ</bnum-input-date>
 *
 * @structure Avec une légende et un indice
 * <bnum-input-date>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input-date>
 *
 * @structure Avec un bouton
 * <bnum-input-date button="true" button-icon="add">Label du champ
 *   <span slot="button">Ajouter</span>
 * </bnum-input-date>
 *
 * @structure En erreur
 * <bnum-input-date min="2025-01-01" data-value="2024-01-01">Label du champ
 * </bnum-input-date>
 *
 * @structure Avec un état de succès
 * <bnum-input-date state="success">Label du champ
 *   <span slot="success">Le champ est valide !</span>
 * </bnum-input-date>
 *
 * @structure Avec une icône
 * <bnum-input-date icon="search">Label du champ</bnum-input-date>
 *
 * @structure Avec un bouton avec icône seulement
 * <bnum-input-date placeholder="LA LA !" button-icon="add">Label du champ
 * </bnum-input-date>
 *
 * @structure Désactivé
 * <bnum-input-date disabled>
 *   Label du champ
 * </bnum-input-date>
 *
 * @structure Complet
 * <bnum-input-date
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
 * </bnum-input-date>
 *
 */
export declare class HTMLBnumInputDate extends HTMLBnumInput {
    /**
     * @attr {string} (optional) (default: 'number') type - Type de l'input (text, password, email, etc.) Ne pas modifier, toujours 'number' pour ce composant.
     */
    static readonly ATTRIBUTE_TYPE = "type";
    /**
     * Valeur pour l'attribut type.
     */
    static readonly TYPE = "date";
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
     * @returns {HTMLBnumInputDate} Instance du composant.
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
    }): HTMLBnumInputDate;
    /**
     *@inheritdoc
     */
    static get TAG(): string;
}
