import { Nullable } from './types';

/**
 * Classe de gestion de planification d'exécution de callback.
 * Permet de regrouper plusieurs appels en une seule exécution lors du prochain frame.
 */
export class Scheduler<T> {
  /**
   * Indique si une exécution est déjà planifiée.
   * @private
   */
  #_started: boolean = false;

  /**
   * Dernière valeur planifiée pour l'exécution.
   * @private
   */
  #_lastValue: Nullable<T> = null;

  /**
   * Callback à exécuter lors de la planification.
   * @private
   */
  #_callback: (value: Nullable<T>) => void;

  /**
   * Constructeur de la classe Scheduler.
   * @param callback Sera appelée avec la dernière valeur planifiée lors du prochain frame.
   */
  constructor(callback: (value: Nullable<T>) => void) {
    this.#_callback = callback;
  }

  /**
   * Demande la planification de l'exécution de la callback avec la valeur donnée.
   * Si une exécution est déjà planifiée, seule la dernière valeur sera utilisée.
   * @param value Valeur la plus récente planifiée pour l'exécution.
   */
  public schedule(value: T): void {
    this.#_lastValue = value;

    if (!this.#_started) {
      this.#_started = true;
      requestAnimationFrame(() => {
        this.#_callback(this.#_lastValue);
        this.#_started = false;
        this.#_lastValue = null;
      });
    }
  }

  /**
   * Accesseur protégé pour obtenir la dernière valeur planifiée.
   */
  protected get _p_value(): Nullable<T> {
    return this.#_lastValue;
  }

  /**
   * Accesseur protégé pour définir la dernière valeur planifiée.
   */
  protected set _p_value(value: Nullable<T>) {
    this.#_lastValue = value;
  }

  /**
   * Appelle immédiatement la callback avec la valeur donnée, sans planification.
   * @param value Valeur à transmettre au callback
   */
  public call(value: T): void {
    this.#_callback(value);
  }
}

/**
 * Variante de Scheduler pour gérer des tableaux ou des symboles de réinitialisation.
 */
export class SchedulerArray<T> extends Scheduler<T[] | Symbol> {
  /**
   * Symbole utilisé pour réinitialiser le tableau.
   * @private
   */
  #_resetSymbol: Symbol;

  /**
   * Constructeur de la classe SchedulerArray.
   * @param callback Fonction appelée lors de la planification.
   * @param resetSymbol Symbole utilisé pour réinitialiser le tableau.
   */
  constructor(
    callback: (value: Nullable<T[] | Symbol>) => void,
    resetSymbol: Symbol,
  ) {
    super(callback);
    this.#_resetSymbol = resetSymbol;
  }

  /**
   * Demande la planification de l'exécution de la callback avec la valeur donnée.
   * Peut recevoir un tableau, un élément ou un symbole de réinitialisation.
   * @param value Valeur la plus récente planifiée pour l'exécution.
   */
  public schedule(value: T[]): void;
  public schedule(value: T): void;
  public schedule(value: Symbol): void;
  public schedule(value: T[] | Symbol): void;
  public schedule(value: Symbol | T | T[]): void {
    if (Array.isArray(value))
      ((this._p_value ??= []) as T[]).push(...(value as T[]));
    else if (value !== this.#_resetSymbol)
      ((this._p_value ??= []) as T[]).push(value as T);

    if (value !== this.#_resetSymbol) value = this._p_value!;

    super.schedule(value as T[] | Symbol);
  }
}
