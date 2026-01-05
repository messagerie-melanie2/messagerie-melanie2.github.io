import JsEvent from '@rotomeca/event';
import { Nullable } from '../../../core/utils/types';
import BnumElementInternal from '../../bnum-element-states';
/**
 * Composant Header du Bnum
 *
 * @structure Par défaut
 * <bnum-header>
 *  <img slot="logo" src="assets/bnumloader.svg" alt="Logo du bnum"/>
 *  <h1 slot="title">Accueil</h1>
 *
 *   <bnum-secondary-button slot="actions" data-icon="add">Créer</bnum-secondary-button>
 *   <bnum-icon-button slot="actions">article</bnum-icon-button>
 *   <bnum-icon-button slot="actions">help</bnum-icon-button>
 *   <bnum-icon-button slot="actions">settings</bnum-icon-button>
 *   <bnum-icon-button slot="actions">notifications</bnum-icon-button>
 *
 *  <img slot="avatar" style="border-radius: 100%" src="assets/avatar.png" alt="Avatar de remplacement"></img>
 * </bnum-header>
 *
 * @structure Avec image de fond
 * <bnum-header data-background="assets/headerbackground.gif">
 *  <img slot="logo" src="assets/bnumloader.svg" alt="Logo du bnum"/>
 *  <h1 slot="title">Accueil</h1>
 *
 *   <bnum-secondary-button slot="actions" data-icon="add">Créer</bnum-secondary-button>
 *   <bnum-icon-button slot="actions">article</bnum-icon-button>
 *   <bnum-icon-button slot="actions">help</bnum-icon-button>
 *   <bnum-icon-button slot="actions">settings</bnum-icon-button>
 *   <bnum-icon-button slot="actions">notifications</bnum-icon-button>
 *
 *  <img slot="avatar" style="border-radius: 100%" src="assets/avatar.png" alt="Avatar de remplacement"></img>
 * </bnum-header>
 *
 * @slot logo - Slot pour le logo
 * @slot title - Slot pour le titre
 * @slot actions - Slot pour les actions
 * @slot avatar - Slot pour l'avatar
 *
 * @state with-background - Actif si une image de fond est définie
 *
 * @cssvar {block} --bnum-header-display - Définit le type d'affichage du header
 * @cssvar {60px} --bnum-header-height - Hauteur du header
 * @cssvar {#f5f6fa} --bnum-header-background-color - Couleur de fond du header
 * @cssvar {1px solid #e5e7eb} --bnum-header-border-bottom - Bordure basse du header
 * @cssvar {8px} --bnum-header-left-gap - Espace à gauche entre les éléments du header
 * @cssvar {24px} --bnum-header-right-gap - Espace à droite entre les éléments du header
 * @cssvar {45px} --bnum-header-logo-height - Hauteur du logo dans le header
 * @cssvar {none} --bnum-header-background-image - Image de fond du header (par défaut aucune)
 * @cssvar {#ffffff} --bnum-header-with-background-color - Couleur du texte sur fond personnalisé
 * @cssvar {#ffffff} --bnum-header-main-action-border-color - Couleur de la bordure du bouton principal sur fond personnalisé
 * @cssvar {#ffffff} --bnum-header-main-action-color - Couleur du texte du bouton principal sur fond personnalisé
 * @cssvar {5px 3px} --bnum-header-background-button-padding - Padding de l'action principale
 */
export declare class HTMLBnumHeader extends BnumElementInternal {
    #private;
    /**
     * Data pour avoir un background par défaut
     * @attr {string | undefined} (optional) data-background - Met une image de fond par défaut
     */
    static readonly DATA_BACKGROUND = "background";
    /**
     * Classe CSS du container principal
     */
    static readonly CLASS_HEADER_CONTAINER = "bnum-header-container";
    /**
     * Classe CSS de la partie gauche du header
     */
    static readonly CLASS_HEADER_LEFT = "header-left";
    /**
     * Classe CSS de la partie droite du header
     */
    static readonly CLASS_HEADER_RIGHT = "header-right";
    /**
     * Classe CSS du titre textuel
     */
    static readonly CLASS_HEADER_TITLE = "header-title";
    /**
     * Classe CSS du conteneur du titre custom
     */
    static readonly CLASS_HEADER_CUSTOM = "header-custom";
    /**
     * Classe CSS de la zone qui peut obtenir des "effets"
     */
    static readonly CLASS_HEADER_MODIFIER = "header-modifier";
    /**
     * Partie du container principal
     */
    static readonly PART_HEADER_CONTAINER = "header-container";
    /**
     * Partie du header gauche
     */
    static readonly PART_HEADER_LEFT = "header-left";
    /**
     * Partie du header droit
     */
    static readonly PART_HEADER_RIGHT = "header-right";
    /**
     * Partie du titre
     */
    static readonly PART_HEADER_TITLE = "header-title";
    /**
     * Partie de l'élément custom
     */
    static readonly PART_HEADER_CUSTOM = "header-custom";
    /**
     * ID du H1 pour le titre textuel
     */
    static readonly ID_TITLE_TEXT = "title-text";
    /**
     * ID du conteneur pour le titre custom
     */
    static readonly ID_TITLE_CUSTOM = "title-custom";
    /**
     * Nom du slot pour le logo
     */
    static readonly SLOT_NAME_LOGO = "logo";
    /**
     * Nom du slot pour le titre
     */
    static readonly SLOT_NAME_TITLE = "title";
    /**
     * Nom du slot pour les actions
     */
    static readonly SLOT_NAME_ACTIONS = "actions";
    /**
     * Nom du slot pour l'avatar
     */
    static readonly SLOT_NAME_AVATAR = "avatar";
    /**
     * Evènement du changement de d'image
     * @event bnum-header:background.changed
     * @detail {newBackground:Nullable<string>}
     */
    static readonly EVENT_BACKGROUND_CHANGED = "bnum-header:background.changed";
    /**
     * Evènement du changement d'image de fond
     */
    get onBackgroundChanged(): JsEvent<(newBackground: Nullable<string>) => void>;
    /**
     * URL de l'image de fond du header
     */
    get ImgBackground(): Nullable<string>;
    set ImgBackground(value: Nullable<string>);
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
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    /**
     * @inheritdoc
     */
    protected _p_attach(): void;
    /**
     * Change le titre dynamiquement.
     * @param content Affiche l'élément dans le conteneur dédié.
     */
    setPageTitle(content: HTMLElement): this;
    /**
     * Change le titre dynamiquement.
     * @param text Met à jour le H1.
     */
    setPageTitle(text: string): this;
    /**
     * Change le titre dynamiquement.
     * @param element Reset le titre pour afficher le slot par défaut.
     */
    setPageTitle(element: null): this;
    /**
     * Met à jour l'image de fond du header.
     * @param urlOrData Interpréte la valeur comme une URL ou une Data URL.
     * @returns L'instance courante pour le chaînage.
     */
    updateBackground(urlOrData: string): this;
    /**
     * Supprime l'image de fond du header.
     * @returns L'instance courante pour le chaînage.
     */
    clearBackground(): this;
    /**
     * Génère un nouvel élément HTMLBnumHeader
     * @returns Element créé
     */
    static Create({ background, }?: {
        background?: string | null;
    }): HTMLBnumHeader;
    /**
     * Tag HTML de l'élément
     */
    static get TAG(): string;
}
