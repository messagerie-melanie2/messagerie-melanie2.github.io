/**
 * @Attr : Synchronise une propriété (auto-accessor) avec un attribut HTML.
 * Gère dynamiquement les types string, boolean et number.
 */
export declare function Attr(attributeName?: string): <This extends HTMLElement, Value>(_target: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>) => ClassAccessorDecoratorResult<This, Value>;
type DataAccessortCallback = <This extends HTMLElement, Value>(_target: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>) => ClassAccessorDecoratorResult<This, Value>;
export declare function Data(name: string, options: {
    setter?: boolean;
}): DataAccessortCallback;
export declare function Data(options: {
    setter?: boolean;
}): DataAccessortCallback;
export declare function Data(): DataAccessortCallback;
/**
 * Option pour Data pour indiquer qu'un accessor ne devrait pas avoir de setter.
 *
 * @example
 * ```typescript
 * ///
 * @Data(NO_SETTER)
 * accessor #_label!: string;
 * ```
 */
export declare const NO_SETTER: {
    setter: boolean;
};
export {};
