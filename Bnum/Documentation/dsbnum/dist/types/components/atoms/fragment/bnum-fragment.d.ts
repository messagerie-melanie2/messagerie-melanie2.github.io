import BnumElement from 'components/bnum-element';
/**
 * Composant Web Component utilitaire "Fragment".
 * * Ce composant agit comme un conteneur logique pour regrouper des éléments du DOM
 * sans introduire de boîte de rendu visuelle supplémentaire (via `display: contents` généralement défini dans le style).
 *
 * @remarks
 * Il permet de contourner la règle "un seul élément racine" ou de grouper des éléments
 * pour des traitements logiques (boucles, conditions) sans briser le contexte de formatage
 * CSS du parent (ex: `display: grid` ou `display: flex`).
 *
 * @example
 * ```html
 * <div class="grid-container">
 * <bnum-fragment>
 * <div class="cell-1">Item A</div>
 * <div class="cell-2">Item B</div>
 * </bnum-fragment>
 * </div>
 * ```
 */
export declare class HTMLBnumFragment extends BnumElement {
    constructor();
    connectedCallback(): void;
}
