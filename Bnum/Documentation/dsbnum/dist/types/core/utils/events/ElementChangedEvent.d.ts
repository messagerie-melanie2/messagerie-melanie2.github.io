/**
 * Événement personnalisé signalant le changement d'un élément.
 *
 * @template T Type du nouvel élément.
 * @template Y Type de l'ancien élément.
 * @template TCaller Type de l'élément ayant déclenché l'événement (doit hériter de HTMLElement).
 */
export default class ElementChangedEvent<T, Y, TCaller extends HTMLElement> extends CustomEvent<null> {
    #private;
    /**
     * Crée une nouvelle instance d'ElementChangedEvent.
     *
     * @param type Le type de changement.
     * @param newElement Le nouvel élément.
     * @param oldElement L'ancien élément.
     * @param caller L'élément ayant déclenché l'événement.
     * @param initDict Options d'initialisation de l'événement.
     */
    constructor(type: string, newElement: T, oldElement: Y, caller: TCaller, initDict?: CustomEventInit<null>);
    /** Retourne le nouvel élément. */
    get newElement(): T;
    /** Retourne l'ancien élément. */
    get oldElement(): Y;
    /** Retourne l'élément qui a déclenché l'événement. */
    get caller(): TCaller;
}
