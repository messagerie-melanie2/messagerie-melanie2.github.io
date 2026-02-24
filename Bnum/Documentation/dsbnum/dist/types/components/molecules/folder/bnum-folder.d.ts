import { Nullable } from '../../../core/utils/types';
import BnumElementInternal from '../../bnum-element-states';
import { CustomDom } from '../../bnum-element';
/**
 * Composant Web Component représentant un dossier dans une structure arborescente.
 * Gère l'affichage hiérarchique, les badges de notification (non-lus), la sélection et l'état d'expansion.
 *
 * @structure Base
 * <bnum-folder
 * folder-id="identifiant-unique-du-dossier"
 * id="rcmliINBOX"
 * label="Dossier Racine"
 * unread="5"
 * icon="folder"
 * level="0"
 * is-virtual="false"
 * is-collapsed="true"
 * is-selected="false"
 * >
 * </bnum-folder>
 *
 * @structure Avec de sous-dossiers
 * <bnum-tree id="rcmliTREE">
 * <bnum-folder
 * folder-id="identifiant-unique-du-dossier"
 * id="rcmliINBOX"
 * label="Dossier Racine"
 * unread="17"
 * icon="folder"
 * level="0"
 * is-virtual="true"
 * is-collapsed="true"
 * is-selected="false"
 * >
 *  <bnum-folder
 *  slot="folders"
 *  folder-id="identifiant-unique-du-dossier-sub"
 *  id="rcmliSUBFOLDER"
 *  label="Dossier enfant"
 *  unread="17"
 *  icon="folder"
 *  level="1"
 *  is-virtual="false"
 *  is-collapsed="true"
 *  is-selected="false"
 *  >
 *  </bnum-folder>
 *  <bnum-folder
 *  slot="folders"
 *  folder-id="identifiant-unique-du-dossier-sub2"
 *  id="rcmliSUBFOLDER"
 *  label="Dossier enfant 2"
 *  unread="0"
 *  icon="folder"
 *  level="1"
 *  is-virtual="false"
 *  is-collapsed="true"
 *  is-selected="false"
 *  >
 *   <bnum-folder
 *   slot="folders"
 *   folder-id="identifiant-unique-du-dossier--sub-sub2"
 *   id="rcmliSUBFOLDERSUB"
 *   label="Dossier enfant enfant"
 *   unread="0"
 *   icon="folder"
 *   level="2"
 *   is-virtual="false"
 *   is-collapsed="true"
 *   is-selected="false"
 *   >
 *   </bnum-folder>
 *  </bnum-folder>
 * </bnum-folder>
 * </bnum-tree>
 *
 *
 * @slot folders - Slot pour insérer des sous-dossiers (`bnum-folder`).
 *
 * @state no-subfolders - Indique que le dossier n'a pas de sous-dossiers.
 * @state triple-digit-unread - Indique que le compteur de non-lu est à 3 chiffres (99+).
 * @state double-digit-unread - Indique que le compteur de non-lu est à 2 chiffres (10-99).
 * @state single-digit-unread - Indique que le compteur de non-lu est à 1 chiffre (1-9).
 *
 * @extends BnumElementInternal
 * @fires bnum-folder:unread-changed - Lorsqu'un compteur de non-lu est mis à jour.
 * @fires bnum-folder:select - Lorsque le dossier est sélectionné.
 * @fires bnum-folder:toggle - Lorsque le dossier est plié ou déplié.
 *
 * @cssvar {0.5em} --bnum-folder-indentation-base - Unité de base pour le calcul du décalage (padding-left) par niveau de profondeur.
 * @cssvar {0} --internal-bnum-folder-level - Variable interne (pilotée par JS) indiquant le niveau de profondeur actuel.
 * @cssvar {Calculated} --bnum-folder-indentation - Valeur finale du padding-left (base * level).
 * @cssvar {block} --bnum-folder-display - Type d'affichage du composant host.
 * @cssvar {100%} --bnum-folder-width - Largeur du composant host.
 * @cssvar {10px 15px} --bnum-folder-title-padding - Espacement interne du conteneur flex (Standard : 10px vertical, 15px horizontal).
 * @cssvar {10px} --bnum-folder-gap - Espace entre l'icône, le titre et les badges.
 * @cssvar {125px} --bnum-folder-text-ellipisis-max-width - Largeur maximale du libellé avant troncation.
 * @cssvar {inherit} --bnum-folder-icon-color - Couleur de l'icône du dossier.
 * @cssvar {5px} --bnum-badge-padding - Padding interne pour réduire la taille du badge (calcul de la taille).
 * @cssvar {#2e2eff} --bnum-color-primary-active - Couleur de fond du badge en mode cumulatif (Blue Thunder Active).
 * @cssvar {solid 1px #ddd} --bnum-border-in-column - Bordure inférieure appliquée aux dossiers de niveau 0.
 * @cssvar {15px 15px} --bnum-folder-bal-title-padding - Padding spécifique pour les dossiers racines (15px vertical, 15px horizontal).
 * @cssvar {#c1c1fb} --bnum-color-list-hover - Couleur de fond au survol d'un dossier interactif (Blue List Hover).
 * @cssvar {#e3e3fd} --bnum-color-list - Couleur de fond d'un dossier sélectionné (Blue List).
 * @cssvar {#adadf9} --bnum-color-list-drag - Couleur de fond lors du dragover (Blue List Active).
 */
export declare class HTMLBnumFolder extends BnumElementInternal {
    #private;
    /**
     * Attribut indiquant si le dossier est replié.
     * @attr {boolean} is-collapsed (default: true) - Indique si le dossier est visuellement replié.
     */
    static readonly ATTR_IS_COLLAPSED = "is-collapsed";
    /**  Attribut indiquant si le dossier est virtuel (non cliquable/sélectionnable).
     * @attr {boolean} is-virtual (default: true) - Indique si le dossier est virtuel.
     */
    static readonly ATTR_IS_VIRTUAL = "is-virtual";
    /**  Attribut indiquant si le dossier est actuellement sélectionné.
     * @attr {boolean} is-selected (default: false) - Indique si le dossier est sélectionné.
     */
    static readonly ATTR_IS_SELECTED = "is-selected";
    /**  Attribut définissant le nombre d'éléments non lus.
     * @attr {number} unread (default: 0) - Nombre d'éléments non lus dans le dossier.
     */
    static readonly ATTR_UNREAD = "unread";
    /**  Attribut définissant la profondeur du dossier dans l'arbre.
     * @attr {number} level (default: 0) - Niveau de profondeur du dossier dans l'arborescence.
     */
    static readonly ATTR_LEVEL = "level";
    /**  Attribut pour le libellé du dossier.
     * @attr {string} label (default: /) - Libellé (nom) du dossier.
     */
    static readonly ATTR_LABEL = "label";
    /**  Attribut définissant l'icône associée.
     * @attr {string} icon (default: /) - Nom de l'icône à afficher pour le dossier.
     */
    static readonly ATTR_ICON = "icon";
    /**  Attribut ARIA role.
     * @attr {string} role - Rôle ARIA pour l'accessibilité. Défini par l'élément.
     */
    static readonly ATTR_ROLE = "role";
    /**  Attribut title natif. */
    static readonly ATTR_TITLE = "title";
    /**  Événement natif de clic.
     * @event click
     * @detail MouseEvent
     */
    static readonly EVENT_CLICK = "click";
    /**  Événement custom pour le changement de non-lu.
     * @event bnum-folder:unread-changed
     * @detail UnreadChangedEventDetail
     */
    static readonly EVENT_UNREAD_CHANGED = "bnum-folder:unread-changed";
    /**  Événement custom de sélection.
     * @event bnum-folder:select
     * @detail { caller: HTMLBnumFolder; innerEvent?: Event }
     */
    static readonly EVENT_SELECT = "bnum-folder:select";
    /**  Événement custom de bascule (plié/déplié).
     * @event bnum-folder:toggle
     * @detail { caller: HTMLBnumFolder; innerEvent?: Event; collapsed: boolean }
     */
    static readonly EVENT_TOGGLE = "bnum-folder:toggle";
    /**  Classe du conteneur principal (flex row). */
    static readonly CLASS_CONTAINER = "bal-container";
    /**  Conteneur gauche regroupant l'icône et le nom. */
    static readonly CLASS_TITLE = "bal-container__title";
    /**  Icône principale du dossier (ex: dossier, fichier). */
    static readonly CLASS_TITLE_ICON = "bal-container__title__icon";
    /**  Libellé (nom) du dossier. */
    static readonly CLASS_TITLE_NAME = "bal-container__title__name";
    /**  Conteneur droit (zone d'actions et métadonnées). */
    static readonly CLASS_LEFT = "bal-container__left";
    /**  Badge de notification (compteur non-lu). */
    static readonly CLASS_LEFT_BADGE = "bal-container__left__badge";
    /**  Bouton de bascule (toggle) pour plier/déplier. */
    static readonly CLASS_TOGGLE = "bal-container__toggle";
    /**  Conteneur des enfants (slot). */
    static readonly CLASS_SUB_FOLDERS = "bal-sub-folders";
    /**  Utilitaire pour l'affichage flexbox. */
    static readonly CLASS_FLEX = "flex";
    /**  Modificateur CSS du badge pour le mode cumulatif (dossier plié). */
    static readonly CLASS_IS_CUMULATIVE = "is-cumulative";
    /**  ID interne pour l'ancre du nom (a11y/focus). */
    static readonly ID_NAME = "bal-name";
    /**  État : Dossier feuille (sans enfants). */
    static readonly STATE_NO_SUBFOLDERS = "no-subfolders";
    /**  État : Compteur à 3 chiffres (ou 99+). */
    static readonly STATE_TRIPLE_DIGIT = "triple-digit-unread";
    /**  État : Compteur à 2 chiffres (10-99). */
    static readonly STATE_DOUBLE_DIGIT = "double-digit-unread";
    /**  État : Compteur à 1 chiffre (1-9). */
    static readonly STATE_SINGLE_DIGIT = "single-digit-unread";
    /**  État : Aucun non-lu. */
    static readonly STATE_NO_UNREAD = "no-unread";
    /** Valeur min affichage compteur (0). */
    static readonly VAL_MIN_UNREAD = 0;
    /** Valeur max avant troncation (99). */
    static readonly VAL_MAX_UNREAD = 99;
    /**  Chaîne 'true'. */
    static readonly VAL_TRUE = "true";
    /**  Chaîne 'false'. */
    static readonly VAL_FALSE = "false";
    /**  Texte affiché au-delà du max ("99+"). */
    static readonly VAL_99_PLUS: string;
    /**  Chaîne "0". */
    static readonly VAL_ZERO = "0";
    /**  Rôle ARIA 'treeitem'. */
    static readonly VAL_ROLE_TREEITEM = "treeitem";
    /**  Attribut ARIA 'aria-expanded'. */
    static readonly ARIA_EXPANDED = "aria-expanded";
    /**  Attribut ARIA 'aria-selected'. */
    static readonly ARIA_SELECTED = "aria-selected";
    /**  Var CSS pour l'indentation (padding-left). */
    static readonly CSS_VAR_LEVEL = "--internal-bnum-folder-level";
    /**  Icône défaut (carré/dossier). */
    static readonly ICON_SQUARE = "square";
    /**  Icône déplié (flèche bas). */
    static readonly ICON_ARROW_DOWN = "keyboard_arrow_down";
    /**  Icône plié (flèche haut). */
    static readonly ICON_ARROW_UP = "keyboard_arrow_up";
    /** Référence à la classe HTMLBnumFolder */
    _: typeof HTMLBnumFolder;
    /**
     * Indique si le dossier est visuellement replié.
     * @returns {boolean} `true` si l'attribut `is-collapsed` est à 'true'.
     */
    get collapsed(): boolean;
    /**
     * Récupère la liste des classes CSS appliquées à l'élément hôte.
     * @returns {string[]} Un tableau des classes.
     */
    get classes(): string[];
    /**
     * Constructeur du composant.
     */
    constructor();
    /**
     * Récupère les feuilles de style à appliquer au Shadow DOM.
     * @protected
     * @returns {CSSStyleSheet[]} Tableau des feuilles de styles.
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Fournit le template HTML du composant.
     * @protected
     * @returns {HTMLTemplateElement | null} Le template.
     */
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * Construit le DOM et initialise les références UI et les écouteurs d'événements internes.
     * @protected
     * @param container - Le conteneur racine.
     */
    protected _p_buildDOM(container: CustomDom): void;
    /**
     * Appelé lorsque le composant est attaché au DOM.
     * Initialise les états par défaut et les écouteurs globaux.
     * @protected
     */
    protected _p_attach(): void;
    /**
     * Gère la mise à jour des attributs observés.
     * @protected
     * @param {string} name - Nom de l'attribut modifié.
     * @param {string | null} oldVal - Ancienne valeur.
     * @param {string | null} newVal - Nouvelle valeur.
     * @returns {void | Nullable<'break'>} Peut retourner 'break' pour arrêter la propagation.
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void | Nullable<'break'>;
    /**
     * Bascule l'état plié/déplié du dossier.
     * Met à jour l'attribut DOM et déclenche l'événement `EVENT_TOGGLE`.
     * @public
     * @param {Event} [innerEvent] - L'événement déclencheur originel (optionnel).
     * @returns {this} L'instance courante pour chaînage.
     */
    toggle(innerEvent?: Event): this;
    /**
     * Sélectionne le dossier.
     * Déclenche l'événement `EVENT_SELECT`.
     * @public
     * @param {Event} [innerEvent] - L'événement déclencheur originel (optionnel).
     * @returns {this} L'instance courante pour chaînage.
     */
    select(innerEvent?: Event): this;
    /**
     * Définit la liste des attributs à observer pour les changements.
     * @protected
     * @returns {string[]} Liste des noms d'attributs.
     */
    protected static _p_observedAttributes(): string[];
    /**
     * Génère la chaîne HTML statique pour ce composant (SSR / Helper).
     * @static
     * @param {Object} props - Propriétés de construction.
     * @param {Record<string, string>} [props.attributes={}] - Attributs HTML.
     * @param {string[]} [props.children=[]] - Contenu enfant.
     * @returns {string} Le HTML sous forme de chaîne.
     */
    static Write({ attributes, children, }?: {
        attributes?: Record<string, string>;
        children?: string[];
    }): string;
    /**
     * Retourne le nom de la balise HTML associée à ce composant.
     * @static
     * @returns {string} 'bnum-folder'
     */
    static get TAG(): string;
}
