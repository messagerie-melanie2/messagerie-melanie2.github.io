import BnumElement from '../../bnum-element';
/**
 * Composant représentant le titre d'une carte, pouvant inclure une icône et un lien.
 * Permet d'afficher un titre enrichi avec une icône et éventuellement un lien cliquable.
 *
 * @structure Cas url et icône
 * <bnum-card-title data-icon="labs" url="https://example.com">Titre de la carte</bnum-card-title>
 *
 * @structure Cas icône uniquement
 * <bnum-card-title data-icon="labs">Titre de la carte</bnum-card-title>
 *
 * @structure Cas lien uniquement
 * <bnum-card-title url="https://example.com">Titre de la carte</bnum-card-title>
 *
 * @structure Cas texte seul
 * <bnum-card-title>Titre de la carte</bnum-card-title>
 *
 * @structure Cas icône via slot
 * <bnum-card-title>
 *  <bnum-icon slot="icon">drive_folder_upload</bnum-icon>
 *  Titre de la carte
 * </bnum-card-title>
 *
 * @state url - Actif lorsque le titre contient un lien.
 * @state without-url - Actif lorsque le titre ne contient pas de lien.
 *
 * @slot (default) - Titre de la carte (texte ou HTML)
 * @slot icon - Icône personnalisée à afficher avant le titre. Note: si une icône est définie via l'attribut `data-icon` ou via la propriété `icon`, ce slot sera ignoré.
 *
 * @cssvar {flex} --bnum-card-title-display - Définit le mode d'affichage du titre de la carte.
 * @cssvar {center} --bnum-card-title-align-items - Définit l'alignement vertical des éléments dans le titre de la carte.
 * @cssvar {var(--bnum-space-s, 10px)} --bnum-card-title-gap - Définit l'espacement entre l'icône et le texte du titre.
 */
export declare class HTMLBnumCardTitle extends BnumElement {
    #private;
    /**
     * Nom de l'attribut pour définir l'URL du lien du titre de la carte.
     * @attr {string | null} (optional) url - URL du lien du titre de la carte
     */
    static readonly ATTRIBUTE_URL: string;
    /**
     * Nom de la data pour définir l'icône du titre de la carte.
     * @attr {string | null} (optional) data-icon - Nom de l'icône (Material Symbols) à afficher avant le titre
     */
    static readonly ATTRIBUTE_DATA_ICON: string;
    /**
     * Nom du slot pour l'icône du titre de la carte.
     */
    static readonly SLOT_NAME_ICON: string;
    /**
     * Nom de la classe au titre de la carte lorsqu'un url est défini
     */
    static readonly CLASS_LINK: string;
    /**
     * Nom de l'état lorsque le titre contient un lien.
     */
    static readonly STATE_URL: string;
    /**
     * Nom de l'état lorsque le titre ne contient pas de lien.
     */
    static readonly STATE_WITHOUT_URL: string;
    /**
     * Nom de la classe pour l'icône du titre de la carte.
     */
    static readonly CLASS_ICON_TITLE: string;
    /**
     * ID du slot pour l'icône du titre de la carte.
     */
    static readonly ID_SLOT_ICON: string;
    /**
     * ID du slot pour le texte du titre de la carte.
     */
    static readonly ID_SLOT_TEXT: string;
    /**
     * ID de l'élément personnalisé pour le corps du titre de la carte.
     */
    static readonly ID_CUSTOM_BODY: string;
    /**
     * Obtient le nom de l'icône associée au titre de la carte.
     * @returns {string | null} Nom de l'icône ou null si aucune icône n'est définie
     */
    get icon(): string | null;
    /**
     * Définit le nom de l'icône associée au titre de la carte.
     * Met à jour le DOM pour refléter le changement.
     * @param {string | null} v Nom de l'icône ou null
     */
    set icon(v: string | null);
    /**
     * Obtient l'URL du lien du titre de la carte.
     * @returns {string | null} URL ou null si aucun lien n'est défini
     */
    get url(): string | null;
    /**
     * Définit l'URL du lien du titre de la carte.
     * Ajoute ou retire l'attribut selon la valeur.
     * @param {string | null} v URL ou null
     */
    set url(v: string | null);
    /**
     * Constructeur du composant HTMLBnumCardTitle.
     * Initialise le composant sans ajouter d'éléments DOM.
     */
    constructor();
    protected _p_getStylesheets(): CSSStyleSheet[];
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * Construit le DOM du composant dans le conteneur donné.
     * Ajoute l'icône, le texte et le lien selon les propriétés définies.
     * @param {ShadowRoot | HTMLElement} container Conteneur dans lequel construire le DOM
     */
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    protected _p_isUpdateForAllAttributes(): boolean;
    /**
     * Méthode appelée lors de la mise à jour d'un attribut observé.
     * Met à jour le DOM du composant.
     * @param {string} name Nom de l'attribut modifié
     * @param {string | null} oldVal Ancienne valeur
     * @param {string | null} newVal Nouvelle valeur
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void;
    /**
     * Met à jour le contenu du titre de la carte.
     * Remplace le texte ou ajoute un élément HTML comme corps du titre.
     * @param {HTMLElement | string | Text} element Le contenu à insérer (texte, élément ou nœud Text)
     * @returns {HTMLBnumCardTitle} Retourne l'instance pour chaînage
     */
    updateBody(element: HTMLElement | string | Text, { force }?: {
        force?: boolean | undefined;
    }): HTMLBnumCardTitle;
    /**
     * Retourne la liste des attributs observés par le composant.
     * Permet de réagir aux changements de ces attributs.
     * @returns {string[]} Liste des attributs observés
     */
    static _p_observedAttributes(): string[];
    /**
     * Crée dynamiquement une instance du composant HTMLBnumCardTitle.
     * Permet d'initialiser le titre avec un texte, une icône et/ou un lien.
     * @param {HTMLElement | string | Text} text Le contenu du titre (élément, texte ou chaîne)
     * @param {{ icon?: string | null; link?: string | null }} options Options pour l'icône et le lien
     * @returns {HTMLBnumCardTitle} Instance du composant configurée
     */
    static Create(text: HTMLElement | string | Text, { icon, link, }: {
        icon?: string | null;
        link?: string | null;
    }): HTMLBnumCardTitle;
    /**
     * Génère le HTML d'un titre de carte avec icône et lien optionnels.
     * Utile pour créer dynamiquement le composant dans une chaîne HTML.
     * @param {string | null} icon Icône à afficher
     * @param {string} text Texte du titre
     * @param {string | null} link URL du lien
     * @returns {string} HTML généré
     */
    static Generate(icon: string | null, text: string, link: string | null): string;
    /**
     * Retourne le tag HTML du composant.
     * Permet d'obtenir le nom du composant pour l'utiliser dans le DOM.
     * @readonly
     * @returns {string} Tag HTML
     */
    static get TAG(): string;
}
