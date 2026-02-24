/**
 * Décorateur de classe.
 * Indique que ce composant doit déclencher une mise à jour complète (`_p_update`)
 * à chaque modification d'un attribut observé.
 *  Cela évite d'avoir à surcharger manuellement `_p_isUpdateForAllAttributes`.
 * @example
 * ```tsx
 * // imports ...
 *
 * @Define({ ... })
 * @UpdateAll()
 * export class MyComponent extends BnumElementInternal { ... }
 * ```
 */
export declare function UpdateAll(): (target: Function, context: ClassDecoratorContext) => void;
