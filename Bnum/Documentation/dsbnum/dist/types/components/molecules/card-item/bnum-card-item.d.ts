import JsEvent from '@rotomeca/event';
import BnumElementInternal from '../../bnum-element-states';
import { CustomDom } from '../../bnum-element';
/**
 * Représente un item d'une carte `<bnum-card>` qui peut être mis dans un `bnum-card-list`.
 *
 * L'élément est considéré comme un `li` d'une liste pour des raisons d'accessibilité.
 *
 * @structure Item de carte
 * <bnum-card-item><p>Contenu de l'item</p></bnum-card-item>
 *
 * @structure Désactivé
 * <bnum-card-item disabled><p>Contenu de l'item</p></bnum-card-item>
 *
 * @state disabled - Actif quand l'item est désactivé
 *
 * @slot (default) - Contenu de l'item
 *
 * @cssvar {100%} --bnum-card-item-width-percent - Largeur en pourcentage du composant
 * @cssvar {30px} --bnum-card-item-width-modifier - Valeur soustraite à la largeur
 * @cssvar {var(--bnum-color-surface, #f6f6f7)} --bnum-card-item-background-color - Couleur de fond normale
 * @cssvar {var(--bnum-color-surface-hover, #eaeaea)} --bnum-card-item-background-color-hover - Couleur de fond au survol
 * @cssvar {var(--bnum-color-surface-active, #dfdfdf)} --bnum-card-item-background-color-active - Couleur de fond à l'état actif
 * @cssvar {pointer} --bnum-card-item-cursor - Type de curseur
 * @cssvar {15px} --bnum-card-item-padding - Espacement interne
 * @cssvar {block} --bnum-card-item-display - Type d'affichage
 */
export declare class HTMLBnumCardItem extends BnumElementInternal {
    #private;
    /**
     * Template de base pour les enfants du composant.
     *
     * En `static readonly` cette fois pour éviter les problèmes de scope.
     */
    static readonly BASE_TEMPLATE: HTMLTemplateElement;
    /**
     * Attribut désactivé
     * @attr {boolean | 'disabled' | undefined} (optional) disabled - Indique si l'item est désactivé
     */
    static readonly ATTRIBUTE_DISABLED = "disabled";
    /**
     * État désactivé
     */
    static readonly STATE_DISABLED = "disabled";
    /**
     * Rôle du composant
     */
    static readonly ROLE = "listitem";
    /**
     * Événement click
     * @event click
     * @detail MouseEvent
     */
    static readonly CLICK = "click";
    protected _p_slot: HTMLSlotElement | null;
    /**
     * Retourne la liste des attributs observés par le composant.
     * Utile pour détecter les changements d'attributs et mettre à jour l'état du composant.
     * @returns {string[]} Liste des attributs observés.
     */
    static _p_observedAttributes(): string[];
    /** Référence à la classe HTMLBnumCardItem */
    _: typeof HTMLBnumCardItem;
    /**
     * Événement déclenché lors du clic sur l'item.
     * Permet d'attacher des gestionnaires personnalisés au clic.
     */
    get onitemclicked(): JsEvent<(e: MouseEvent) => void>;
    /**
     * Constructeur du composant.
     * Initialise l'événement personnalisé et attache le gestionnaire de clic.
     */
    constructor();
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * Construit le DOM interne du composant.
     * Ajoute le slot pour le contenu et configure les attributs nécessaires.
     * @param container ShadowRoot ou HTMLElement qui contient le DOM du composant.
     */
    protected _p_buildDOM(container: CustomDom): void;
    protected _p_attach(): void;
    /**
     * Met à jour l'état du composant en fonction des changements d'attributs.
     * Gère l'état désactivé et l'attribut aria-disabled.
     * @param name Nom de l'attribut modifié.
     * @param oldVal Ancienne valeur de l'attribut.
     * @param newVal Nouvelle valeur de l'attribut.
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void;
    protected _p_render(): void;
    protected _p_isUpdateForAllAttributes(): boolean;
    protected _p_getStylesheets(): CSSStyleSheet[];
    static CreateChildTemplate(childTemplate: string, { defaultSlot, slotName, }?: {
        defaultSlot?: boolean;
        slotName?: string;
    }): HTMLTemplateElement;
    /**
     * Retourne le tag du composant.
     * @returns {string} Tag du composant.
     */
    static get TAG(): string;
}
