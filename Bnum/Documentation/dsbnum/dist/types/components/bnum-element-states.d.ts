import BnumElement from './bnum-element';
/**
 * Classe interne étendant BnumElement pour gérer les états personnalisés via ElementInternals.
 */
export default abstract class BnumElementInternal extends BnumElement {
    #private;
    constructor();
    /**
     * Retourne l'objet ElementInternals associé à l'élément.
     * @protected
     */
    protected get _p_internal(): ElementInternals;
    /**
     * Retourne l'ensemble des états personnalisés de l'élément.
     * @protected
     */
    protected get _p_states(): CustomStateSet;
    /**
     * Efface tous les états personnalisés de l'élément.
     * @returns {this}
     * @protected
     */
    protected _p_clearStates(): this;
    /**
     * Ajoute un état personnalisé à l'élément.
     * @param {string} state - Nom de l'état à ajouter.
     * @returns {this}
     * @protected
     */
    protected _p_addState(state: string): this;
    /**
     * Ajoute plusieurs états personnalisés à l'élément.
     * @param {string[]} states - Liste des états à ajouter.
     * @returns {this}
     * @protected
     */
    protected _p_addStates(...states: string[]): this;
    /**
     * Supprime un état personnalisé de l'élément.
     * @param {string} state - Nom de l'état à supprimer.
     * @returns {this}
     * @protected
     */
    protected _p_removeState(state: string): this;
    /**
     * Supprime plusieurs états personnalisés de l'élément.
     * @param {string[]} states - Liste des états à supprimer.
     * @returns {this}
     * @protected
     */
    protected _p_removeStates(states: string[]): this;
    /**
     * Vérifie si l'élément possède un état personnalisé donné.
     * @param {string} state - Nom de l'état à vérifier.
     * @returns {boolean}
     * @protected
     */
    protected _p_hasState(state: string): boolean;
}
