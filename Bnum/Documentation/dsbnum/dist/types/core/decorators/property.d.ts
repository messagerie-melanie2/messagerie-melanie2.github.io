import { ValueOf } from 'core/utils/types';
export declare const PropertyMode: {
    readonly default: "rw";
    readonly readonly: "readonly";
    readonly init: "init";
};
export type PropertyMode = ValueOf<typeof PropertyMode>;
export interface PropertyOptions {
    /**
     * Mode d'accès au setter :
     * - 'rw' (Read/Write) : Comportement par défaut { get; set; }
     * - 'readonly' : Setter désactivé après initialisation { get; }
     * - 'init' : Assignable une seule fois (ou null -> value) { get; init; }
     * @default 'rw'
     */
    mode?: PropertyMode;
    /**
     * Déclenche _p_update() lors du changement de valeur ?
     * @default false
     */
    reactive?: boolean;
}
/**
 * @Property Gère la réactivité et les droits d'accès des Auto-Accessors.
 * Simule les comportements C# { get; set; }, { get; init; } et { get; }.
 */
export declare function Property(options?: PropertyOptions): <This extends any, Value>(target: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>) => ClassAccessorDecoratorResult<This, Value>;
