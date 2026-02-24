import JsEvent from '@rotomeca/event';
import { Nullable } from '../../../core/utils/types';
import BnumElementInternal from '../../bnum-element-states';
import { EButtonType } from '../button/bnum-button';
import { Result } from '@rotomeca/rop';
export declare const INPUT_BASE_STYLE: CSSStyleSheet;
export declare const INPUT_STYLE_STATES: CSSStyleSheet;
/**
 * Composant Input du design system Bnum.
 * Permet de gérer un champ de saisie enrichi avec gestion d'états, d'icônes, de bouton et d'accessibilité.
 *
 * @structure Sans rien
 * <bnum-input></bnum-input>
 *
 * @structure Avec une légende
 * <bnum-input>Label du champ</bnum-input>
 *
 * @structure Avec une légende et un indice
 * <bnum-input>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input>
 *
 * @structure Avec un bouton
 * <bnum-input button="true" button-icon="add">Label du champ
 *   <span slot="button">Ajouter</span>
 * </bnum-input>
 *
 * @structure En erreur
 * <bnum-input pattern="^[a-zA-Z0-9]+$" data-value="@@@@@">Label du champ
 * </bnum-input>
 *
 * @structure Avec un état de succès
 * <bnum-input state="success">Label du champ
 *   <span slot="success">Le champ est valide !</span>
 * </bnum-input>
 *
 * @structure Avec une icône
 * <bnum-input icon="search">Label du champ</bnum-input>
 *
 * @structure Avec un bouton avec icône seulement
 * <bnum-input placeholder="LA LA !" button-icon="add">Label du champ
 * </bnum-input>
 *
 * @structure Nombre
 * <bnum-input type="number" data-value="42">Label du champ</bnum-input>
 *
 * @structure Désactivé
 * <bnum-input disabled>
 *   Label du champ
 * </bnum-input>
 *
 * @structure Complet
 * <bnum-input
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
 * </bnum-input>
 *
 * @slot (defaut) - Contenu du label principal du champ.
 * @slot hint - Contenu de l'indice d'utilisation (hint) du champ.
 * @slot success - Contenu du message de succès du champ.
 * @slot error - Contenu du message d'erreur du champ.
 * @slot button - Contenu du bouton interne (si présent).
 *
 * @state success - État de succès.
 * @state error - État d'erreur.
 * @state disabled - État désactivé.
 * @state icon - Présence d'une icône.
 * @state button - Présence d'un bouton.
 * @state obi - Bouton avec icône seulement (sans texte).
 * @state state - Présence d'un état (success / error).
 *
 * @cssvar {#666} --bnum-input-hint-text-color - Couleur du texte du hint.
 * @cssvar {#eee} --bnum-input-background-color - Couleur de fond de l'input.
 * @cssvar {#666} --bnum-input-color - Couleur du texte de l'input.
 * @cssvar {#3a3a3a} --bnum-input-line-color - Couleur de la ligne/bordure de l'input.
 * @cssvar {#36b37e} --bnum-input-state-success-color - Couleur de l'état de succès.
 * @cssvar {#de350b} --bnum-input-state-error-color - Couleur de l'état d'erreur.
 * @cssvar {inset 0 -2px 0 0 #3a3a3a} --bnum-input-box-shadow - Ombre portée de l'input.
 *
 */
export declare class HTMLBnumInput extends BnumElementInternal {
    #private;
    /**
     * Template de l'élément input.
     * Dans la classe cette fois si pour éviter les problèmes de scope.
     */
    static readonly TEMPLATE: HTMLTemplateElement;
    /**
     * Événement déclenché au clic sur le bouton interne.
     *
     * Attention ! Vous devez écouter l'événement via la propriété `onButtonClicked` pour que le gestionnaire soit bien attaché.
     * @event bnum-input:button.click
     * @detail MouseEvent
     */
    static readonly EVENT_BUTTON_CLICK = "bnum-input:button.click";
    /**
     * Événement déclenché à la saisie dans le champ.
     * @event input
     * @detail InputEvent
     */
    static readonly EVENT_INPUT = "input";
    /**
     * Événement déclenché au changement de valeur du champ.
     * @event change
     * @detail Event
     */
    static readonly EVENT_CHANGE = "change";
    /**
     * Attribut data-value du composant.
     * @attr {string} (optional) (default: undefined) data-value - Valeur initiale du champ.
     */
    static readonly ATTRIBUTE_DATA_VALUE = "data-value";
    /**
     * @attr {string} (optional) (default: undefined) placeholder - Texte indicatif du champ.
     */
    static readonly ATTRIBUTE_PLACEHOLDER = "placeholder";
    /**
     * @attr {string} (optional) (default: 'text') type - Type de l'input (text, password, email, etc.)
     */
    static readonly ATTRIBUTE_TYPE = "type";
    /**
     * @attr {string} (optional) (default: undefined) disabled - Désactive le champ.
     */
    static readonly ATTRIBUTE_DISABLED = "disabled";
    /**
     * @attr {string} (optional) (default: undefined) state - État du champ (success, error, etc.).
     */
    static readonly ATTRIBUTE_STATE = "state";
    /**
     * @attr {string} (optional) (default: undefined) button - Présence d'un bouton interne (primary, secondary, danger, ...).
     */
    static readonly ATTRIBUTE_BUTTON = "button";
    /**
     * @attr {string} (optional) (default: undefined) button-icon - Icône du bouton interne.
     */
    static readonly ATTRIBUTE_BUTTON_ICON = "button-icon";
    /**
     * @attr {string} (optional) (default: undefined) icon - Icône à afficher dans le champ.
     */
    static readonly ATTRIBUTE_ICON = "icon";
    /**
     * @attr {string} (optional) (default: undefined) required - Champ requis.
     */
    static readonly ATTRIBUTE_REQUIRED = "required";
    /**
     * @attr {string} (optional) (default: undefined) readonly - Champ en lecture seule.
     */
    static readonly ATTRIBUTE_READONLY = "readonly";
    /**
     * @attr {string} (optional) (default: undefined) pattern - Expression régulière de validation.
     */
    static readonly ATTRIBUTE_PATTERN = "pattern";
    /**
     * @attr {string} (optional) (default: undefined) minlength - Longueur minimale du champ.
     */
    static readonly ATTRIBUTE_MINLENGTH = "minlength";
    /**
     * @attr {string} (optional) (default: undefined) maxlength - Longueur maximale du champ.
     */
    static readonly ATTRIBUTE_MAXLENGTH = "maxlength";
    /**
     * @attr {string} (optional) (default: undefined) autocomplete - Attribut autocomplete HTML.
     */
    static readonly ATTRIBUTE_AUTOCOMPLETE = "autocomplete";
    /**
     * @attr {string} (optional) (default: undefined) inputmode - Mode de saisie (mobile).
     */
    static readonly ATTRIBUTE_INPUTMODE = "inputmode";
    /**
     * @attr {string} (optional) (default: undefined) spellcheck - Correction orthographique.
     */
    static readonly ATTRIBUTE_SPELLCHECK = "spellcheck";
    /**
     * @attr {string} (optional) (default: undefined) ignorevalue - Attribut interne pour ignorer la synchronisation de valeur. Ne pas utiliser.
     */
    static readonly ATTRIBUTE_IGNOREVALUE = "ignorevalue";
    /**
     * @attr {string} (optional) (default: undefined) name - Nom du champ (attribut HTML name).
     */
    static readonly ATTRIBUTE_NAME = "name";
    /** ID du label principal */
    static readonly ID_HINT_TEXT = "hint-text";
    /** ID du label du champ */
    static readonly ID_HINT_TEXT_LABEL = "hint-text__label";
    /** ID du hint */
    static readonly ID_HINT_TEXT_HINT = "hint-text__hint";
    /** ID de l'input */
    static readonly ID_INPUT = "bnum-input";
    /** ID du bouton */
    static readonly ID_INPUT_BUTTON = "input__button";
    /** ID de l'icône d'état */
    static readonly ID_STATE_ICON = "state__icon";
    /** ID de l'icône d'input */
    static readonly ID_INPUT_ICON = "input__icon";
    /** ID du texte de succès */
    static readonly ID_SUCCESS_TEXT = "success-text";
    /** ID du texte d'erreur */
    static readonly ID_ERROR_TEXT = "error-text";
    /** ID du conteneur d'état */
    static readonly ID_STATE = "state";
    /** Classe CSS pour le texte de succès */
    static readonly CLASS_STATE_TEXT_SUCCESS = "state__text success";
    /** Classe CSS pour le texte d'erreur */
    static readonly CLASS_STATE_TEXT_ERROR = "state__text error";
    /**
     * État de succès.
     */
    static readonly STATE_SUCCESS = "success";
    /**
     * État d'erreur.
     */
    static readonly STATE_ERROR = "error";
    /**
     * État désactivé.
     */
    static readonly STATE_DISABLED = "disabled";
    /**
     * État avec icône.
     */
    static readonly STATE_ICON = "icon";
    /**
     * État avec bouton.
     */
    static readonly STATE_BUTTON = "button";
    /**
     * État bouton avec icône seulement (sans texte).
     *
     * (obi = Only Button Icon)
     */
    static readonly STATE_OBI = "obi";
    /**
     * État avec état (success / error).
     */
    static readonly STATE_STATE = "state";
    /**
     * Icône affichée en cas de succès de validation.
     */
    static readonly ICON_SUCCESS = "check_circle";
    /**
     * Icône affichée en cas d'erreur de validation.
     */
    static readonly ICON_ERROR = "cancel";
    /**
     * Nom du slot pour le bouton interne.
     */
    static readonly SLOT_BUTTON = "button";
    /**
     * Nom du slot pour l'indice d'utilisation (hint).
     */
    static readonly SLOT_HINT = "hint";
    /**
     * Nom du slot pour le message de succès.
     */
    static readonly SLOT_SUCCESS = "success";
    /**
     * Nom du slot pour le message d'erreur.
     */
    static readonly SLOT_ERROR = "error";
    /**
     * Type d'input par défaut.
     */
    static readonly DEFAULT_INPUT_TYPE = "text";
    /**
     * Variation du bouton par défaut.
     */
    static readonly DEFAULT_BUTTON_VARIATION = EButtonType.PRIMARY;
    /**
     * Texte affiché en cas de succès de validation.
     */
    static readonly TEXT_VALID_INPUT: string;
    /**
     * Texte affiché en cas d'erreur de validation.
     */
    static readonly TEXT_INVALID_INPUT: string;
    /**
     * Texte affiché en cas d'erreur de champ.
     */
    static readonly TEXT_ERROR_FIELD: string;
    static readonly formAssociated = true;
    /** Référence à la classe HTMLBnumInput */
    _: typeof HTMLBnumInput;
    /**
     * Permet d'écouter le clic sur le bouton interne.
     * @returns {JsEvent} Instance d'événement personnalisée.
     */
    get onButtonClicked(): JsEvent<(clickEvent: MouseEvent) => void>;
    /**
     * Valeur courante du champ de saisie.
     */
    get value(): string;
    set value(val: string);
    /**
     * Nom du champ (attribut HTML name).
     */
    get name(): string;
    set name(val: string);
    /**
     * Constructeur du composant.
     * Initialise la valeur initiale à partir de l'attribut data-value.
     */
    constructor();
    /**
     * Attache un Shadow DOM personnalisé.
     */
    protected _p_attachCustomShadow(): Nullable<ShadowRoot>;
    /**
     * Récupère des stylesheet déjà construites pour le composant.
     * @returns Liste de stylesheet
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Retourne le template HTML utilisé pour le composant.
     */
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * Construit le DOM interne et attache les écouteurs d'événements.
     */
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    /**
     * Met à jour le composant lors d'un changement d'attribut.
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void | Nullable<'break'>;
    /**
     * Appelé après le flush du DOM pour synchroniser l'état.
     */
    protected _p_postFlush(): void;
    /**
     * Réinitialise la valeur du champ lors d'une remise à zéro du formulaire parent.
     */
    formResetCallback(): void;
    /**
     * Active ou désactive le champ selon l'état du fieldset parent.
     */
    formDisabledCallback(disabled: boolean): void;
    /**
     * Active le bouton interne avec texte, icône et variation éventuels.
     * @param options Objet contenant le texte, l'icône et la variation du bouton.
     * @returns {this} L'instance courante pour chaînage.
     */
    enableButton({ text, icon, variation, }?: {
        text?: string;
        icon?: string;
        variation?: EButtonType;
    }): this;
    /**
     * Active uniquement l'icône du bouton interne (sans texte).
     * @param icon Nom de l'icône à afficher sur le bouton.
     * @returns {this} L'instance courante pour chaînage.
     */
    enableButtonIconOnly(icon: string): this;
    /**
     * Masque le bouton interne.
     * @returns {this} L'instance courante pour chaînage.
     */
    hideButton(): this;
    /**
     * Définit l'état de succès avec un message optionnel.
     * @param message Message de succès à afficher.
     * @returns {this} L'instance courante pour chaînage.
     */
    setSuccessState(message?: string): this;
    /**
     * Définit l'état d'erreur avec un message optionnel.
     * @param message Message d'erreur à afficher.
     * @returns {this} L'instance courante pour chaînage.
     */
    setErrorState(message?: string): this;
    /**
     * Définit une icône à afficher dans le champ.
     * @param icon Nom de l'icône à afficher.
     * @returns {this} L'instance courante pour chaînage.
     */
    setIcon(icon: string): this;
    /**
     * Supprime l'icône affichée dans le champ.
     * @returns {this} L'instance courante pour chaînage.
     */
    removeIcon(): this;
    /**
     * Définit un indice d'utilisation (hint) pour le champ.
     * @param hint Texte de l'indice à afficher.
     * @returns {this} L'instance courante pour chaînage.
     */
    setHint(hint: string): this;
    /**
     * Supprime l'indice d'utilisation (hint) du champ.
     * @returns {this} L'instance courante pour chaînage.
     */
    removeHint(): this;
    /**
     * Définit le label principal du champ.
     * @param label Texte ou élément HTML à utiliser comme label.
     * @returns {this} L'instance courante pour chaînage.
     */
    setLabel(label: string | HTMLElement): this;
    /**
     * Callback protégé appelé lors d'un changement de valeur de l'input.
     * @protected
     * @param e Evénement de changement de valeur.
     * @returns Résultat de l'opération.
     */
    protected _p_inputValueChangedCallback(e: Event): Result<void>;
    /**
     * @inheritdoc
     */
    static _p_observedAttributes(): string[];
    /**
     * Crée une instance du composant avec les options fournies.
     * @param label Texte du label principal.
     * @param options Options d'initialisation (attributs et slots).
     * @returns {HTMLBnumInput} Instance du composant.
     */
    static Create(label: string, { 'data-value': dataValue, placeholder, name, type, disabled, state, button, 'button-icon': buttonIcon, icon, required, readonly, pattern, minlength, maxlength, autocomplete, inputmode, spellcheck, hint, success, error, btnText, }?: {
        'data-value'?: string;
        placeholder?: string;
        name?: string;
        type?: string;
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
    }): HTMLBnumInput;
    static CreateTemplate(html?: string): HTMLTemplateElement;
    /**
     * Tag HTML du composant.
     */
    static get TAG(): string;
}
