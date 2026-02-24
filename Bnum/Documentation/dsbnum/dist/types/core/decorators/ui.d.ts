export declare function UI(selectorMap: Record<string, string>, options?: {
    shadowRoot?: boolean;
}): <T extends HTMLElement, V extends object>(target: ClassAccessorDecoratorTarget<T, V>, context: ClassAccessorDecoratorContext<T, V>) => {
    get(this: T): V;
};
