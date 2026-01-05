import BnumElement from '../../bnum-element';
/**
 * Élément web personnalisé représentant une aide contextuelle avec une icône.
 *
 * @structure Cas standard
 * <bnum-helper>Ceci est une aide contextuelle.</bnum-helper>
 */
export default class HTMLBnumHelper extends BnumElement {
    /**
     * Constructeur de l'élément HTMLBnumHelper.
     * Initialise l'élément.
     */
    constructor();
    /**
     * Précharge les données de l'élément.
     * Si l'élément possède des enfants, le texte est déplacé dans l'attribut title et le contenu est vidé.
     */
    protected _p_preload(): void;
    /**
     * Construit le DOM interne de l'élément.
     * Ajoute l'icône d'aide dans le conteneur.
     * @param container Racine du shadow DOM ou élément HTML.
     */
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    /**
     * @inheritdoc
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Crée une nouvelle instance de HTMLBnumHelper avec le texte d'aide spécifié.
     * @param title Texte d'aide à afficher dans l'attribut title.
     * @returns {HTMLBnumHelper} Instance du composant.
     */
    static Create(title: string): HTMLBnumHelper;
    /**
     * Tag HTML du composant.
     * @readonly
     * @returns {string} Tag HTML utilisé pour ce composant.
     */
    static get TAG(): string;
}
