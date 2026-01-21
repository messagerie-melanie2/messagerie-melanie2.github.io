import BnumElementInternal from '../../bnum-element-states';
export declare class HTMLBnumTree extends BnumElementInternal {
    #private;
    constructor();
    protected _p_isShadowElement(): boolean;
    protected _p_attach(): void;
    /**
     * Méthode publique pour sélectionner un item programmatiquement
     * @param item L'élément à sélectionner
     */
    SelectItem(item: HTMLElement): void;
    /**
     * Ajoute des nodes à l'arbre.
     *
     * Les nodes de type texte sont enveloppés dans un span avec le rôle treeitem.
     *
     * Les éléments HTML qui n'ont pas le rôle treeitem se voient attribuer ce rôle.
     * @param nodes Nodes à ajouter.
     * @returns L'instance courante.
     */
    append(...nodes: (Node | string)[]): this;
    /**
     * Ajoute une node brute à l'arbre.
     * @param node Node à ajouter.
     * @returns Node ajoutée.
     */
    appendChild<T extends Node>(node: T): T;
    static get TAG(): string;
}
