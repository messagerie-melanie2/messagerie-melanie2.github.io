import BnumElement from '../../bnum-element';
import JsEvent from '@rotomeca/event';
import { Nullable } from '../../../core/utils/types';
/**
 * Enumération des types de boutons.
 */
export declare enum EButtonType {
    PRIMARY = "primary",
    SECONDARY = "secondary",
    TERTIARY = "tertiary",
    DANGER = "danger"
}
/**
 * Enumération des positions possibles de l'icône dans le bouton.
 */
export declare enum EIconPosition {
    LEFT = "left",
    RIGHT = "right"
}
/**
 * Enumération des tailles de layout pour cacher le texte.
 */
export declare enum EHideOn {
    SMALL = "small",
    TOUCH = "touch"
}
/**
 * Type représentant les variations possibles du bouton.
 */
export type ButtonVariation = 'primary' | 'secondary' | 'tertiary' | 'danger';
/**
 * Position possible de l'icône dans le bouton.
 */
export type IconPosition = 'left' | 'right';
/**
 * Taille de layout sur laquelle le texte doit être caché.
 */
export type HideTextOnLayoutSize = 'small' | 'touch' | null;
/**
 * Composant bouton principal de la bibliothèque Bnum.
 * Gère les variations, l'icône, l'état de chargement, etc.
 *
 * @structure Bouton primaire
 * <bnum-button data-variation="primary">Texte du bouton</bnum-button>
 *
 * @structure Bouton secondaire
 * <bnum-button data-variation="secondary">Texte du bouton</bnum-button>
 *
 * @structure Bouton danger
 * <bnum-button data-variation="danger">Texte du bouton</bnum-button>
 *
 * @structure Bouton avec icône
 * <bnum-button data-icon="home">Texte du bouton</bnum-button>
 *
 * @structure Bouton avec une icône à gauche
 * <bnum-button data-icon="home" data-icon-pos="left">Texte du bouton</bnum-button>
 *
 * @structure Bouton en état de chargement
 * <bnum-button loading>Texte du bouton</bnum-button>
 *
 * @structure Bouton arrondi
 * <bnum-button rounded>Texte du bouton</bnum-button>
 *
 * @structure Bouton cachant le texte sur les petits layouts
 * <bnum-button data-hide="small" data-icon="menu">Menu</bnum-button>
 *
 * @slot (default) - Contenu du bouton (texte, HTML, etc.)
 *
 * @state loading - Actif si le bouton est en état de chargement
 * @state rounded - Actif si le bouton est arrondi
 * @state disabled - Actif si le bouton est désactivé
 * @state icon - Actif si le bouton contient une icône
 * @state without-icon - Actif si le bouton ne contient pas d'icône
 * @state icon-pos-left - Actif si l'icône est positionnée à gauche
 * @state icon-pos-right - Actif si l'icône est positionnée à droite
 * @state hide-text-on-small - Actif si le texte est caché sur les petits layouts
 * @state hide-text-on-touch - Actif si le texte est caché sur les layouts tactiles
 * @state primary - Actif si le bouton est de type primaire
 * @state secondary - Actif si le bouton est de type secondaire
 * @state tertiary - Actif si le bouton est de type tertiaire
 * @state danger - Actif si le bouton est de type danger
 *
 * @cssvar {inline-block} --bnum-button-display - Définit le type d'affichage du bouton
 * @cssvar {6px 10px} --bnum-button-padding - Définit le padding interne du bouton
 * @cssvar {0} --bnum-button-border-radius - Définit l'arrondi des coins du bouton
 * @cssvar {pointer} --bnum-button-cursor - Définit le curseur de la souris au survol du bouton
 * @cssvar {5px} --bnum-button-rounded-border-radius - Arrondi des coins pour le bouton arrondi
 * @cssvar {7.5px} --bnum-button-without-icon-padding-top - Padding top si le bouton n'a pas d'icône
 * @cssvar {7.5px} --bnum-button-without-icon-padding-bottom - Padding bottom si le bouton n'a pas d'icône
 * @cssvar {var(--bnum-color-primary)} --bnum-button-primary-background-color - Couleur de fond du bouton (état primaire)
 * @cssvar {var(--bnum-text-on-primary)} --bnum-button-primary-text-color - Couleur du texte du bouton (état primaire)
 * @cssvar {solid thin var(--bnum-button-primary-border-color)} --bnum-button-primary-border - Bordure du bouton (état primaire)
 * @cssvar {var(--bnum-color-primary)} --bnum-button-primary-border-color - Couleur de la bordure (état primaire)
 * @cssvar {var(--bnum-color-primary-hover)} --bnum-button-primary-hover-background-color - Couleur de fond au survol (état primaire)
 * @cssvar {var(--bnum-text-on-primary-hover)} --bnum-button-primary-hover-text-color - Couleur du texte au survol (état primaire)
 * @cssvar {solid thin var(--bnum-button-primary-hover-border-color)} --bnum-button-primary-hover-border - Bordure au survol (état primaire)
 * @cssvar {var(--bnum-color-primary-hover)} --bnum-button-primary-hover-border-color - Couleur de la bordure au survol (état primaire)
 * @cssvar {var(--bnum-color-primary-active)} --bnum-button-primary-active-background-color - Couleur de fond lors du clic (état primaire)
 * @cssvar {var(--bnum-text-on-primary-active)} --bnum-button-primary-active-text-color - Couleur du texte lors du clic (état primaire)
 * @cssvar {solid thin var(--bnum-button-primary-active-border-color)} --bnum-button-primary-active-border - Bordure lors du clic (état primaire)
 * @cssvar {var(--bnum-color-primary-active)} --bnum-button-primary-active-border-color - Couleur de la bordure lors du clic (état primaire)
 * @cssvar {var(--bnum-color-secondary)} --bnum-button-secondary-background-color - Couleur de fond (état secondaire)
 * @cssvar {var(--bnum-text-on-secondary)} --bnum-button-secondary-text-color - Couleur du texte (état secondaire)
 * @cssvar {solid thin var(--bnum-button-secondary-border-color)} --bnum-button-secondary-border - Bordure (état secondaire)
 * @cssvar {var(--bnum-color-primary)} --bnum-button-secondary-border-color - Couleur de la bordure (état secondaire)
 * @cssvar {var(--bnum-color-secondary-hover)} --bnum-button-secondary-hover-background-color - Couleur de fond au survol (état secondaire)
 * @cssvar {var(--bnum-text-on-secondary-hover)} --bnum-button-secondary-hover-text-color - Couleur du texte au survol (état secondaire)
 * @cssvar {solid thin var(--bnum-button-secondary-hover-border-color)} --bnum-button-secondary-hover-border - Bordure au survol (état secondaire)
 * @cssvar {var(--bnum-color-primary)} --bnum-button-secondary-hover-border-color - Couleur de la bordure au survol (état secondaire)
 * @cssvar {var(--bnum-color-secondary-active)} --bnum-button-secondary-active-background-color - Couleur de fond lors du clic (état secondaire)
 * @cssvar {var(--bnum-text-on-secondary-active)} --bnum-button-secondary-active-text-color - Couleur du texte lors du clic (état secondaire)
 * @cssvar {solid thin var(--bnum-button-secondary-active-border-color)} --bnum-button-secondary-active-border - Bordure lors du clic (état secondaire)
 * @cssvar {var(--bnum-color-primary)} --bnum-button-secondary-active-border-color - Couleur de la bordure lors du clic (état secondaire)
 * @cssvar {var(--bnum-color-danger)} --bnum-button-danger-background-color - Couleur de fond (état danger)
 * @cssvar {var(--bnum-text-on-danger)} --bnum-button-danger-text-color - Couleur du texte (état danger)
 * @cssvar {solid thin var(--bnum-button-danger-border-color)} --bnum-button-danger-border - Bordure (état danger)
 * @cssvar {var(--bnum-color-danger)} --bnum-button-danger-border-color - Couleur de la bordure (état danger)
 * @cssvar {var(--bnum-color-danger-hover)} --bnum-button-danger-hover-background-color - Couleur de fond au survol (état danger)
 * @cssvar {var(--bnum-text-on-danger-hover)} --bnum-button-danger-hover-text-color - Couleur du texte au survol (état danger)
 * @cssvar {solid thin var(--bnum-button-danger-hover-border-color)} --bnum-button-danger-hover-border - Bordure au survol (état danger)
 * @cssvar {var(--bnum-color-danger-hover)} --bnum-button-danger-hover-border-color - Couleur de la bordure au survol (état danger)
 * @cssvar {var(--bnum-color-danger-active)} --bnum-button-danger-active-background-color - Couleur de fond lors du clic (état danger)
 * @cssvar {var(--bnum-text-on-danger-active)} --bnum-button-danger-active-text-color - Couleur du texte lors du clic (état danger)
 * @cssvar {solid thin var(--bnum-button-danger-active-border-color)} --bnum-button-danger-active-border - Bordure lors du clic (état danger)
 * @cssvar {var(--bnum-color-danger-active)} --bnum-button-danger-active-border-color - Couleur de la bordure lors du clic (état danger)
 * @cssvar {0.6} --bnum-button-disabled-opacity - Opacité du bouton désactivé
 * @cssvar {none} --bnum-button-disabled-pointer-events - Gestion des événements souris pour le bouton désactivé
 * @cssvar {flex} --bnum-button-wrapper-display - Type d'affichage du wrapper interne
 * @cssvar {center} --bnum-button-wrapper-align-items - Alignement vertical du contenu du wrapper
 * @cssvar {flex} --bnum-button-icon-display - Type d'affichage de l'icône
 * @cssvar {flex} --bnum-button-loader-display - Type d'affichage du loader
 * @cssvar {0.75s} --bnum-button-spin-duration - Durée de l'animation de spin
 * @cssvar {linear} --bnum-button-spin-timing - Fonction de timing de l'animation de spin
 * @cssvar {infinite} --bnum-button-spin-iteration - Nombre d'itérations de l'animation de spin
 * @cssvar {-3px} --bnum-button-margin-bottom-text-correction - Correction basse du texte
 */
export declare class HTMLBnumButton extends BnumElement {
    #private;
    /**
     * Attribut pour rendre le bouton arrondi.
     * @attr {boolean | undefined} (optional) rounded - Rend le bouton arrondi
     */
    static readonly ATTR_ROUNDED = "rounded";
    /**
     * Attribut de chargement du bouton.
     * @attr {boolean | undefined} (optional) loading - Met le bouton en état de chargement et le désactive
     */
    static readonly ATTR_LOADING = "loading";
    /**
     * Attribut de désactivation du bouton.
     * @attr {boolean | undefined} (optional) disabled - Désactive le bouton
     */
    static readonly ATTR_DISABLED = "disabled";
    /**
     * Attribut de variation du bouton.
     * @attr {EButtonType | undefined} (optional) (default: EButtonType.PRIMARY) data-variation - Variation du bouton (primary, secondary, etc.)
     */
    static readonly ATTR_VARIATION = "variation";
    /**
     * Attribut d'icône du bouton.
     * @attr {string | undefined} (optional) data-icon - Icône affichée dans le bouton
     */
    static readonly ATTR_ICON = "icon";
    /**
     * Attribut de position de l'icône dans le bouton.
     * @attr {EIconPosition | undefined} (optional) (default: EIconPosition.RIGHT) data-icon-pos - Position de l'icône (gauche ou droite)
     */
    static readonly ATTR_ICON_POS = "icon-pos";
    /**
     * Attribut de marge de l'icône dans le bouton.
     * @attr {string | undefined} (optional) (default: var（--custom-bnum-button-icon-margin, 10px）) data-icon-margin - Marge de l'icône (gauche, droite)
     */
    static readonly ATTR_ICON_MARGIN = "icon-margin";
    /**
     * Attribut de taille de layout pour cacher le texte.
     * @attr {EHideOn | undefined} (optional) data-hide - Taille de layout pour cacher le texte
     */
    static readonly ATTR_HIDE = "hide";
    /**
     * État du bouton lorsqu'il contient une icône.
     */
    static readonly STATE_ICON = "icon";
    /**
     * État du bouton lorsqu'il ne contient pas d'icône.
     */
    static readonly STATE_WITHOUT_ICON = "without-icon";
    /**
     * État du bouton lorsqu'il est arrondi.
     */
    static readonly STATE_ROUNDED = "rounded";
    /**
     * État du bouton lorsqu'il est en chargement.
     */
    static readonly STATE_LOADING = "loading";
    /**
     * État du bouton lorsqu'il est désactivé.
     */
    static readonly STATE_DISABLED = "disabled";
    /**
     * Événement déclenché lors du changement d'icône.
     * @event custom:element-changed.icon
     * @detail ElementChangedEvent
     */
    static readonly EVENT_ICON = "icon";
    /**
     * Événement déclenché lors du changement de variation du bouton.
     * @event custom:element-changed.variation
     * @detail ElementChangedEvent
     */
    static readonly EVENT_VARIATION = "variation";
    /**
     * Événement déclenché lors du changement de propriété de l'icône.
     * @event custom:element-changed.icon.prop
     * @detail { type: string, newValue: boolean | string }
     */
    static readonly EVENT_ICON_PROP_CHANGED = "custom:icon.prop.changed";
    /**
     * Événement déclenché lors du changement d'état de chargement.
     * @event custom:loading
     * @detail { state: boolean }
     */
    static readonly EVENT_LOADING_STATE_CHANGED = "custom:loading";
    /**
     * Valeur par défaut de la marge de l'icône dans le bouton.
     */
    static readonly DEFAULT_CSS_VAR_ICON_MARGIN = "var(--custom-bnum-button-icon-margin, 10px)";
    /**
     * Nom de la propriété de l'icône pour la position.
     */
    static readonly ICON_PROP_POS = "pos";
    /**
     * Classe CSS du wrapper du bouton.
     */
    static readonly CLASS_WRAPPER = "wrapper";
    /**
     * Classe CSS de l'icône du bouton.
     */
    static readonly CLASS_ICON = "icon";
    /**
     * Classe CSS du slot du bouton.
     */
    static readonly CLASS_SLOT = "slot";
    /**
     * Propriété CSS pour la marge de l'icône.
     */
    static readonly CSS_PROPERTY_ICON_MARGIN = "--bnum-button-icon-gap";
    /**
     * Événement déclenché lors du changement d'état de chargement.
     */
    onloadingstatechange: JsEvent<(state: boolean) => void>;
    /**
     * Événement déclenché lors du changement d'icône.
     */
    oniconchange: JsEvent<(newIcon: string, oldIcon: string) => void>;
    /**
     * Événement déclenché lors du changement de propriété de l'icône.
     */
    oniconpropchange: JsEvent<(type: 'margin' | 'pos', newValue: string) => void>;
    /**
     * Événement déclenché lors du changement de variation du bouton.
     */
    onvariationchange: JsEvent<(newVariation: ButtonVariation, oldVariation: ButtonVariation) => void>;
    get linkedClickEvent(): JsEvent<(click: string) => void>;
    /**
     * Variation du bouton (primary, secondary, etc.).
     */
    get variation(): EButtonType;
    set variation(value: EButtonType);
    /**
     * Icône affichée dans le bouton.
     */
    get icon(): string | null;
    set icon(value: string | null);
    /**
     * Position de l'icône (gauche ou droite).
     */
    get iconPos(): EIconPosition;
    set iconPos(value: EIconPosition);
    /**
     * Marge appliquée à l'icône.
     */
    get iconMargin(): string;
    set iconMargin(value: string | null);
    /**
     * Taille de layout sur laquelle le texte doit être caché.
     */
    get hideTextOnLayoutSize(): EHideOn | null;
    /**
     * Constructeur du bouton Bnum.
     */
    constructor();
    /**
     * Template HTML du composant bouton.
     * @returns Template utiliser pour le composant
     */
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * Construit le DOM du composant bouton.
     * @param container - Le conteneur du Shadow DOM.
     */
    protected _p_buildDOM(container: ShadowRoot): void;
    protected _p_update(name?: string, oldVal?: string | null, newVal?: string | null): void;
    /**
     * @inheritdoc
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Met le bouton en état de chargement.
     * @returns L'instance du bouton
     */
    setLoading(): this;
    /**
     * Arrête l'état de chargement du bouton.
     * @returns L'instance du bouton
     */
    stopLoading(): this;
    /**
     * Bascule l'état de chargement du bouton.
     * @returns L'instance du bouton
     */
    toggleLoading(): this;
    /**
     * Retourne la liste des attributs observés par le composant.
     */
    static _p_observedAttributes(): string[];
    /**
     * Transforme un élément en bouton accessible (role, tabindex, etc.).
     * @static
     * @param element Élément HTML à transformer
     * @returns L'élément modifié
     */
    static ToButton<T extends HTMLElement>(element: T): T;
    /**
     * Crée un bouton Bnum avec les options spécifiées.
     * @static
     * @param buttonClass Classe du bouton à instancier
     * @param options Options de configuration du bouton
     * @returns Instance du bouton créé
     */
    static _p_Create<T extends HTMLBnumButton>(buttonClass: {
        TAG: string;
    }, { text, icon, iconPos, iconMargin, variation, rounded, loading, hideOn, }?: {
        text?: string;
        icon?: string | null;
        iconPos?: EIconPosition;
        iconMargin?: string | null | 0;
        variation?: EButtonType | null;
        rounded?: boolean;
        loading?: boolean;
        hideOn?: Nullable<EHideOn>;
    }): T;
    /**
     * Crée un bouton Bnum standard.
     * @static
     * @param options Options de configuration du bouton
     * @returns Instance du bouton créé
     */
    static Create(options?: {
        text?: string;
        icon?: string | null;
        iconPos?: EIconPosition;
        iconMargin?: string | null;
        variation?: EButtonType | null;
        rounded?: boolean;
        loading?: boolean;
        hideOn?: EHideOn;
    }): HTMLBnumButton;
    /**
     * Crée un bouton Bnum ne contenant qu'une icône.
     * @static
     * @param icon Nom de l'icône à afficher
     * @param options Options de configuration du bouton
     * @returns Instance du bouton créé
     */
    static CreateOnlyIcon(icon: string, { variation, rounded, loading, }?: {
        variation?: EButtonType | null;
        rounded?: boolean;
        loading?: boolean;
    }): HTMLBnumButton;
    /**
     * Tag HTML du composant bouton.
     * @static
     * @returns Nom du tag HTML
     */
    static get TAG(): string;
}
