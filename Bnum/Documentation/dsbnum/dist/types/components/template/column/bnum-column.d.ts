import { Nullable } from '../../../core/utils/types';
import BnumElement from '../../bnum-element';
/**
 * Type représentant les slots possibles d'une colonne.
 * - 'header' : pour l'en-tête
 * - 'body' : pour le corps
 * - 'footer' : pour le pied de page
 */
export type ColumnSlot = 'header' | 'body' | 'footer';
/**
 * Tag HTML personnalisé interne utilisé pour ce composant.
 *
 * Source de vérité pour la lisibilités des autres constantes liées à la classe et au tag de celle-ci.
 */
declare const COMPONENT_TAG: "bnum-column";
/**
 *  Permet de structurer une colonne avec un en-tête, un corps et un pied de page.
 *
 * @structure Colonne
 * <bnum-column>
 *  <div slot="header">En-tête de la colonne</div>
 *   <div>Contenu principal de la colonne</div>
 *  <div slot="footer">Pied de page de la colonne</div>
 * </bnum-column>
 */
export declare class HTMLBnumColumn extends BnumElement {
    #private;
    /**
     * Tag HTML personnalisé utilisé pour ce composant.
     */
    static get TAG(): typeof COMPONENT_TAG;
    /**
     * Nom de l'attribut pour le type de colonne.
     * @attr {string} type - Le type de colonne (ex: "sidebar", "main", "tools")
     */
    static readonly ATTR_TYPE = "type";
    /**
     * Valeur par défaut pour le type de colonne.
     */
    static readonly DEFAULT_COLUMN_TYPE = "default";
    /**
     * Préfixe commun pour les classes CSS de la colonne.
     */
    static readonly CLASS_PREFIX: "bnum-column";
    /**
     * Classe CSS pour l'en-tête de la colonne.
     */
    static readonly CLASS_HEADER: "bnum-column__header";
    /**
     * Classe CSS "legacy" pour l'en-tête (compatibilité).
     */
    static readonly CLASS_RC_HEADER = "header";
    /**
     * Ancienne classe CSS pour l'en-tête (pour rétrocompatibilité).
     */
    static readonly CLASS_RC_HEADER_OLD: "old-header";
    /**
     * Classe CSS pour le corps de la colonne.
     */
    static readonly CLASS_BODY: "bnum-column__body";
    /**
     * Classe CSS pour le pied de page de la colonne.
     */
    static readonly CLASS_FOOTER: "bnum-column__footer";
    /**
     * Classe CSS "legacy" pour le pied de page (compatibilité).
     */
    static readonly CLASS_RC_FOOTER = "footer";
    /**
     * Classe CSS indiquant qu'un élément provient d'un slot.
     */
    static readonly CLASS_FROM_SLOT = "from-slot";
    /**
     * Préfixe pour les classes CSS de contenu.
     */
    static readonly CLASS_CONTENT_PREFIX: "bnum-column";
    /**
     * Suffixe pour les classes CSS de contenu.
     */
    static readonly CLASS_CONTENT_POSTFIX = "content";
    /**
     * Classe CSS pour le contenu de l'en-tête.
     */
    static readonly CLASS_CONTENT_HEADER: "bnum-column__header__content";
    /**
     * Classe CSS pour le contenu du corps.
     */
    static readonly CLASS_CONTENT_BODY: "bnum-column__body__content";
    /**
     * Classe CSS pour le contenu du pied de page.
     */
    static readonly CLASS_CONTENT_FOOTER: "bnum-column__footer__content";
    /**
     * Nom du slot pour l'en-tête.
     */
    static readonly SLOT_HEADER = "header";
    /**
     * Nom du slot pour le pied de page.
     */
    static readonly SLOT_FOOTER = "footer";
    /**
     * Nom de l'attribut de données pour conserver le corps.
     * @attr {boolean} (optional) (default: true) data-keep-body - Indique si le corps doit être conservé
     */
    static readonly DATA_KEEP_BODY = "keep-body";
    /**
     * Permet de définir le type de colonne (ex: "sidebar", "main", "tools")
     * Utile pour le CSS qui va définir la largeur
     */
    get type(): string;
    /**
     * Constructeur de la colonne Bnum.
     */
    constructor();
    /**
     * On désactive le shadow-dom pour cette élément.
     * @protected
     */
    protected _p_isShadowElement(): boolean;
    /**
     * Logique de rendu Light DOM
     * On récupère les enfants existants et on les réorganise.
     * @param {HTMLElement} container Le conteneur dans lequel injecter le DOM reconstruit
     * @protected
     */
    protected _p_buildDOM(container: HTMLElement): void;
    /**
     * Reactivity for Type attribute change
     */
    protected _p_update(name: string, oldVal: Nullable<string>, newVal: Nullable<string>): void;
    /**
     * Méthode interne pour définir les attributs observés.
     * @returns Attributs à observer
     */
    protected static _p_observedAttributes(): string[];
}
export {};
