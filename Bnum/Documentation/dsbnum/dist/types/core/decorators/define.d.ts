type Style = string[] | string | CSSStyleSheet | CSSStyleSheet[];
/**
 * Options de configuration pour le décorateur `@Define`.
 */
export interface DefineOptions {
    /**
     * Le nom du tag HTML du Web Component (ex: 'bnum-button').
     * Si défini, il créera ou écrasera automatiquement la propriété statique `TAG` de la classe.
     */
    tag?: string;
    /**
     * La vue JSX ou la chaîne HTML du composant.
     * Sera compilée en `HTMLTemplateElement` une seule fois à l'initialisation de la classe.
     */
    template?: string | Node;
    /**
     * Les styles CSS du composant (chaîne brute importée).
     * Seront compilés en `CSSStyleSheet` une seule fois à l'initialisation de la classe.
     */
    styles?: Style;
}
/**
 * Décorateur de classe pour définir un Web Component.
 * * Il gère automatiquement :
 * 1. L'enregistrement du Custom Element via `customElements.define`.
 * 2. La création et la mise en cache du Template (Performance).
 * 3. La création et la mise en cache des Styles (Performance).
 * 4. La définition de la propriété statique `TAG` sur la classe.
 *
 * @param options Les options de configuration (tag, template, style)
 * @example
 * ```tsx
 * const VIEW = <div class="box"><slot /></div>;
 * @Define({
 * tag: 'my-component',
 * template: VIEW,
 * styles: '.box { color: red; }'
 * })
 * export class MyComponent extends BnumElementInternal {
 * // Pas besoin de déclarer static get TAG(), c'est automatique !
 * }
 * ```
 */
export declare function Define(options?: DefineOptions): (target: Function, context: ClassDecoratorContext) => void;
export {};
