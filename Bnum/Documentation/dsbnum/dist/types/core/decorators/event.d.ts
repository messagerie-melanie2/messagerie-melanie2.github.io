/**
 * @Fire : Déclenche un événement personnalisé.
 * Utilise la méthode trigger() de BnumElement si elle existe (Fluent API),
 * sinon utilise le dispatchEvent standard.
 */
export declare function Fire(eventName: string, options?: CustomEventInit): (originalMethod: any, context: ClassMethodDecoratorContext) => ((this: any, ...args: any[]) => any) | undefined;
/**
 * Interface pour les constructeurs d'événements.
 * Gère deux cas :
 * 1. La classe connaît son nom (new EventClass(options))
 * 2. Le nom est passé au décorateur (new EventClass(name, options))
 */
type EventConstructor<T extends CustomEvent> = new (...args: any[]) => T;
/**
 * @CustomFire : Décorateur de méthode (Stage 3).
 * Déclenche un événement d'une classe spécifique lors de l'appel de la méthode.
 * * @param EventClass La classe de l'événement à instancier (doit étendre CustomEvent).
 * @param eventName Optionnel : Force un nom d'événement spécifique.
 * @param options Options d'initialisation (bubbles, composed, etc.).
 */
export declare function CustomFire<T extends CustomEvent>(EventClass: EventConstructor<T>, eventName?: string, options?: CustomEventInit): (originalMethod: any, context: ClassMethodDecoratorContext) => ((this: any, ...args: any[]) => any) | undefined;
export {};
