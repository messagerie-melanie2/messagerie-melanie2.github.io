/**
 * Délègue un événement à un sélecteur spécifique à partir d'une cible.
 * @param  target Élément sur lequel écouter l'événement
 * @param  event Nom de l'événement (ex: 'click')
 * @param  selector Sélecteur CSS pour filtrer la cible
 * @param  callback Fonction appelée lors de l'événement
 */
export declare function delegate<T extends HTMLElement>(target: T, event: string, selector: string, callback: (e: CustomEvent) => void): void;
