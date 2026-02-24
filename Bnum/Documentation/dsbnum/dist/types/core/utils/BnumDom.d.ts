export type Container = HTMLElement | ShadowRoot;
/**
 * Type d'intersection ajoutant la méthode query au container original
 */
export type EnhancedContainer<T extends Container> = T & {
    queryId<E extends HTMLElement>(id: string): E | null;
    queryClass<E extends HTMLElement>(className: string): E | null;
};
export declare class BnumDOM {
    /**
     * "Caste" un container pour lui injecter les extensions Bnum via un Proxy.
     * C'est l'équivalent d'une méthode d'extension C# résolue à l'exécution.
     */
    static from<T extends Container>(container: T): EnhancedContainer<T>;
}
