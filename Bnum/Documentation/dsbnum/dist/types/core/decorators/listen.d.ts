import { Nullable } from '../utils/types';
/**
 * Décorateur pour attacher automatiquement un écouteur d'événement.
 * La méthode décorée doit retourner la fonction de callback.
 *  @param eventName Nom de l'événement à écouter (ex: 'click')
 *  @param option Sélecteur CSS pour le délégateur (optionnel)
 */
export declare function Listen(eventName: string, { selector }?: {
    selector?: Nullable<string>;
}): (originalMethod: any, context: ClassMethodDecoratorContext) => void;
