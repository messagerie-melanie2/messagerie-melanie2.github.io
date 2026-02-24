export declare function Query(selector: string, options?: {
    cache?: boolean;
    shadowRoot?: boolean;
}): <E extends HTMLElement, V extends Element | null>(target: undefined, context: ClassAccessorDecoratorContext<E, V>) => {
    get(this: E): V;
};
