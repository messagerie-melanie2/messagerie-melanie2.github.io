import BnumElement from '../../bnum-element';
import { Nullable } from '../../../core/utils/types';
/**
 * Button contenant une icône.
 *
 * @structure Button Icon
 * <bnum-icon-button>home</bnum-icon-button>
 *
 * @structure Button Disabled
 * <bnum-icon-button disabled>home</bnum-icon-button>
 *
 * @cssvar {0.6} --bnum-button-disabled-opacity - Opacité du bouton désactivé
 * @cssvar {none} --bnum-button-disabled-pointer-events - Gestion des événements souris pour le bouton désactivé
 *
 * @slot (default) - Contenu de l'icône (nom de l'icône à afficher)
 */
export declare class HTMLBnumButtonIcon extends BnumElement {
    #private;
    /**
     * Id de l'icône à l'intérieur du bouton
     */
    static readonly ID_ICON = "icon";
    /**
     * Attribut pour définir le gestionnaire de clic
     * @event click
     */
    static readonly ATTRIBUTE_ON_CLICK: string;
    /** Référence à la classe HTMLBnumButtonIcon */
    _: typeof HTMLBnumButtonIcon;
    /**
     * Icône affichée dans le bouton
     */
    get icon(): string;
    set icon(value: string);
    constructor();
    /**
     * @inheritdoc
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * @inheritdoc
     */
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * @inheritdoc
     */
    protected _p_buildDOM(_: ShadowRoot | HTMLElement): void;
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void | Nullable<'break'>;
    /**
     * Retourne la liste des attributs observés par le composant.
     */
    static _p_observedAttributes(): string[];
    /**
     * Génère un bouton icône avec l'icône spécifiée.
     * @param icon Icône à afficher dans le bouton.
     * @returns Node créée.
     */
    static Create(icon: string): HTMLBnumButtonIcon;
    /**
     * Génère le code HTML d'un bouton icône avec l'icône spécifiée.
     * @param icon Icône à afficher dans le bouton.
     * @returns Code HTML créée.
     */
    static Write(icon: string, attrs?: Record<string, string>): string;
    /**
     * Tag de l'élément.
     */
    static get TAG(): "bnum-icon-button";
}
