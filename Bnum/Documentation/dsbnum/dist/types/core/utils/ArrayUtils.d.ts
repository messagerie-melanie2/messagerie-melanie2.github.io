/**
 * Utilitaires pour les tableaux.
 */
export declare abstract class ArrayUtils {
    #private;
    /**
     * Transforme un objet d'attributs en une chaîne de caractères pour utilisation dans une balise HTML.
     * @param attribs Objet contenant les attributs et leurs valeurs.
     * @returns Chaîne de caractères représentant les attributs pour une balise HTML.
     */
    static toStringAttribs(attribs: Record<string, any>): string;
    /**
     * Trie un tableau d'objets sur deux niveaux de dates (Descendant).
     * @param arr Le tableau d'objets à trier.
     * @param primarySelector Callback pour la date principale.
     * @param secondarySelector Callback pour la date secondaire (fallback).
     */
    static sortByDatesDescending<T>(arr: T[], primarySelector: (item: T) => Date | number, secondarySelector: (item: T) => Date | number): T[];
}
