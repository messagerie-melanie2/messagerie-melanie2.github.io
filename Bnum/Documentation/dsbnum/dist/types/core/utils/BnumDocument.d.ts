import { Nullable } from './types';
import JsEvent from '@rotomeca/event';
/**
 * Gère un ensemble de feuilles de style CSS dynamiques pour l'application.
 * Permet d'ajouter, supprimer et mettre à jour des règles CSS à la volée.
 */
declare class BnumStyleSheets {
    #private;
    /**
     * Ajoute une règle CSS avec un identifiant spécifique.
     * @param id Identifiant unique de la règle.
     * @param rule Règle CSS à ajouter.
     */
    add(id: string, rule: BnumCssRule): this;
    /**
     * Ajoute une règle CSS et génère automatiquement un identifiant.
     * @param rule Règle CSS à ajouter.
     * @returns L'identifiant généré.
     */
    push(rule: BnumCssRule): string;
    /**
     * Ajoute plusieurs règles CSS à la feuille de style.
     * @param rules Liste des règles à ajouter.
     */
    addMultiples(...rules: BnumCssRule[]): this;
    /**
     * Supprime une règle CSS par son identifiant.
     * @param id Identifiant de la règle à supprimer.
     */
    remove(id: string): this;
    /**
     * Supprime toutes les règles CSS de la feuille de style.
     */
    clear(): this;
}
/**
 * Représente une propriété CSS (nom, valeur, important).
 * Permet de notifier les changements de valeur.
 */
export declare class BnumCssProperty {
    #private;
    /**
     * Événement déclenché lors d'une modification de la propriété.
     */
    get event(): JsEvent<() => void>;
    /**
     * @param name Nom de la propriété CSS.
     * @param value Valeur de la propriété CSS.
     * @param important Indique si la propriété est !important.
     */
    constructor(name: string, value: string, important?: boolean);
    /**
     * Modifie la valeur de la propriété CSS.
     */
    set value(value: string);
    /**
     * Modifie l'état important de la propriété CSS.
     */
    set important(important: boolean);
    /**
     * Modifie le nom de la propriété CSS.
     */
    set name(name: string);
    /**
     * Retourne la valeur de la propriété CSS.
     */
    get value(): string;
    /**
     * Retourne le nom de la propriété CSS.
     */
    get name(): string;
    /**
     * Retourne si la propriété est !important.
     */
    get important(): boolean;
    /**
     * Retourne la propriété CSS sous forme de chaîne.
     */
    toString(): string;
}
/**
 * Représente une règle CSS composée d'un sélecteur et de propriétés.
 * Permet d'ajouter ou de retirer dynamiquement des propriétés.
 */
export declare class BnumCssRule {
    #private;
    /**
     * Événement déclenché lors d'une modification de la règle.
     */
    get onUpdate(): JsEvent<() => void>;
    /**
     * @param selectorText Sélecteur CSS de la règle.
     * @param args Propriétés CSS de la règle.
     */
    constructor(selectorText: string, ...args: BnumCssProperty[]);
    /**
     * Retourne le sélecteur CSS de la règle.
     */
    get selectorText(): string;
    /**
     * Ajoute une propriété à la règle CSS.
     * @param prop Propriété à ajouter.
     */
    addProperty(prop: BnumCssProperty): this;
    /**
     * Retourne une propriété de la règle CSS par son index.
     * @param index Index de la propriété à récupérer.
     */
    get(index: number): BnumCssProperty | undefined;
    /**
     * Supprime une propriété de la règle CSS par son nom.
     * @param propName Nom de la propriété à supprimer.
     * @param options all: supprime toutes les occurrences si true.
     */
    removeProperty(propName: string, { all }?: {
        all?: boolean;
    }): this;
    /**
     * Retourne la règle CSS sous forme de chaîne.
     */
    toString(): string;
}
declare class BnumMeta {
    #private;
    /**
     * Change le titre du document
     */
    set title(value: string);
    /**
     * Retourne le titre actuel du document
     */
    get title(): string;
    /**
     * Définit une balise meta standard (name="description")
     * @param content Contenu de la balise meta description
     */
    setDescription(content: string): this;
    /**
     * Définit une balise OpenGraph (property="og:image")
     * @param property Nom de la propriété OpenGraph (ex: "image")
     * @param content Valeur de la propriété
     */
    setOgTag(property: string, content: string): this;
}
declare class BnumScripts {
    #private;
    /**
     * Charge un script externe et attend qu'il soit prêt
     * @param url URL du script à charger
     * @param options async et defer (par défaut true)
     * @returns Promise résolue quand le script est chargé
     */
    load(url: string, { async, defer }?: {
        async?: boolean | undefined;
        defer?: boolean | undefined;
    }): Promise<void>;
}
declare class BnumCookies {
    /**
     * Récupère la valeur d'un cookie par son nom
     * @param name Nom du cookie
     * @returns Valeur du cookie ou null si absent
     */
    get(name: string): Nullable<string>;
    /**
     * Définit un cookie
     * @param name Nom du cookie
     * @param value Valeur du cookie
     * @param options Options : nombre de jours de validité et chemin
     */
    set(name: string, value: string, options?: {
        days?: number;
        path?: string;
    }): void;
    /**
     * Supprime un cookie
     * @param name Nom du cookie à supprimer
     */
    delete(name: string): void;
}
/**
 * Singleton pour accéder aux feuilles de style dynamiques de l'application.
 */
export default class BnumDocument {
    #private;
    /**
     * Retourne l'instance unique de BnumDocument.
     */
    static get instance(): BnumDocument;
    /**
     * Retourne l'ensemble des feuilles de style dynamiques.
     */
    get styleSheets(): BnumStyleSheets;
    /**
     * Retourne l'objet de gestion des métadonnées du document.
     */
    get meta(): BnumMeta;
    /**
     * Retourne l'objet de gestion des scripts du document.
     */
    get scripts(): BnumScripts;
    /**
     * Retourne l'objet de gestion des cookies du document.
     */
    get cookies(): BnumCookies;
    /**
     * Retourne l'objet Document du navigateur.
     */
    get document(): Document;
}
export {};
