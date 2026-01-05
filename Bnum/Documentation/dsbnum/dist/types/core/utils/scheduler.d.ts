import { Nullable } from './types';
/**
 * Classe de gestion de planification d'exécution de callback.
 * Permet de regrouper plusieurs appels en une seule exécution lors du prochain frame.
 */
export declare class Scheduler<T> {
    #private;
    /**
     * Constructeur de la classe Scheduler.
     * @param callback Sera appelée avec la dernière valeur planifiée lors du prochain frame.
     */
    constructor(callback: (value: Nullable<T>) => void);
    /**
     * Demande la planification de l'exécution de la callback avec la valeur donnée.
     * Si une exécution est déjà planifiée, seule la dernière valeur sera utilisée.
     * @param value Valeur la plus récente planifiée pour l'exécution.
     */
    schedule(value: T): void;
    /**
     * Accesseur protégé pour obtenir la dernière valeur planifiée.
     */
    protected get _p_value(): Nullable<T>;
    /**
     * Accesseur protégé pour définir la dernière valeur planifiée.
     */
    protected set _p_value(value: Nullable<T>);
    /**
     * Appelle immédiatement la callback avec la valeur donnée, sans planification.
     * @param value Valeur à transmettre au callback
     */
    call(value: T): void;
}
/**
 * Variante de Scheduler pour gérer des tableaux ou des symboles de réinitialisation.
 *
 * Permet de regrouper plusieurs appels en une seule exécution lors du prochain frame.
 *
 * Si jamais une réinitialisation est demandée, le tableau sera vidé avant d'ajouter de nouveaux éléments.
 */
export declare class SchedulerArray<T> {
    #private;
    /**
     * Constructeur de la classe SchedulerArray.
     * @param callback Fonction appelée lors de la planification.
     * @param resetSymbol Symbole utilisé pour réinitialiser le tableau.
     */
    constructor(callback: (value: Nullable<T[] | Symbol>) => void, resetSymbol: Symbol);
    /**
     * Demande la planification de l'exécution de la callback avec la valeur donnée.
     * Peut recevoir un tableau, un élément ou un symbole de réinitialisation.
     * @param value Valeur la plus récente planifiée pour l'exécution.
     */
    schedule(value: T[]): void;
    schedule(value: T): void;
    schedule(value: Symbol): void;
    schedule(value: T | Symbol): void;
    schedule(value: T[] | Symbol): void;
    /**
     * Appelle immédiatement la callback avec la valeur donnée, sans planification.
     *
     * La stack en mémoire est utilisé si aucune valeur n'est fournie. Sinon, elle sera vidée avant d'ajouter la nouvelle valeur.
     * @param value Valeur à transmettre au callback
     */
    call(value: Nullable<T | T[] | Symbol>): void;
}
