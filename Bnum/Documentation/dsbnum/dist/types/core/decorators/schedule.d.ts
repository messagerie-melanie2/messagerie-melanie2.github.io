/**
 * Décorateur permettant de planifier l'exécution d'une méthode via un {@link Scheduler}.
 *
 * Ce décorateur modifie le comportement de la méthode cible pour qu'elle agisse comme un initialiseur de `Scheduler`.
 * La méthode originale ne sera appelée qu'une seule fois par instance de classe pour configurer le callback du `Scheduler`.
 * Les appels subséquents à la méthode décorée déclencheront la planification (`schedule`) sur l'instance de `Scheduler` mise en cache,
 * en passant le premier argument de l'appel comme valeur à planifier.
 *
 * Le `Scheduler` utilise généralement `requestAnimationFrame` pour différer et regrouper l'exécution,
 * ce qui est utile pour des mises à jour d'interface ou des opérations coûteuses qui peuvent être regroupées.
 *
 * @returns Une fonction décoratrice de méthode.
 *
 * @example
 * ```typescript
 * class Composant {
 *   @Schedule()
 *   protected onUpdate(initValue: number) {
 *     // Cette méthode retourne le callback exécuté par le Scheduler.
 *     // Elle est appelée une seule fois à la première exécution.
 *     return (val: number | null) => {
 *       console.log('Valeur traitée :', val);
 *     };
 *   }
 *
 *   trigger() {
 *     this.onUpdate(1); // Initialise le scheduler et planifie 1
 *     this.onUpdate(2); // Planifie 2 (l'exécution réelle se fera plus tard avec la dernière valeur)
 *   }
 * }
 * ```
 */
export declare function Schedule(): (target: Function, context: ClassMethodDecoratorContext) => (this: any, ...args: any[]) => void;
