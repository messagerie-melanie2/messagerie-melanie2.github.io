import BnumElement from '../bnum-element';
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
    get type(): string;
    constructor();
    protected _p_isShadowElement(): boolean;
    /**
     * Logique de rendu Light DOM
     * On récupère les enfants existants et on les réorganise.
     */
    protected _p_buildDOM(container: HTMLElement): void;
    static get TAG(): string;
}
