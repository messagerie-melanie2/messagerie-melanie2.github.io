import BnumElement from '../../bnum-element';
import { HTMLBnumCardItem } from '../bnum-card-item/bnum-card-item';
import { Nullable } from '../../../core/utils/types';
/**
 * Composant liste de cartes Bnum.
 * Permet d'afficher une liste d'éléments de type carte.
 *
 * @structure Default
 * <bnum-card-list>
 *  <bnum-card-item></bnum-card-item>
 *  <bnum-card-item></bnum-card-item>
 *  <bnum-card-item></bnum-card-item>
 * </bnum-card-list>
 *
 * @structure Mail et agenda
 * <bnum-card-list>
 *   <bnum-card-item-mail data-date="now">
 *     <span slot="subject">Sujet par défaut</span>
 *     <span slot="sender">Expéditeur par défaut</span>
 *   </bnum-card-item-mail>
 * <bnum-card-item-agenda
 *    data-date="2025-11-20"
 *    data-start-date="2025-10-20 09:40:00"
 *    data-end-date="2025-12-20 10:10:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 * </bnum-card-list>
 *
 * @structure Dans une card
 * <bnum-card>
 * <bnum-card-title slot="title" data-icon="info">Diverses informations</bnum-card-title>
 * <bnum-card-list>
 *   <bnum-card-item-mail data-date="now">
 *     <span slot="subject">Sujet par défaut</span>
 *     <span slot="sender">Expéditeur par défaut</span>
 *   </bnum-card-item-mail>
 * <bnum-card-item-agenda
 *    data-date="2025-11-20"
 *    data-start-date="2025-10-20 09:40:00"
 *    data-end-date="2025-12-20 10:10:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 * </bnum-card-list>
 * </bnum-card>
 *
 * @slot (default) - Contenu de la liste de cartes (éléments HTMLBnumCardItem)
 *
 *
 */
export declare class HTMLBnumCardList extends BnumElement {
    #private;
    /**
     * Symbole utilisé pour réinitialiser la liste.
     */
    static readonly SYMBOL_RESET: unique symbol;
    /**
     * Constructeur de la liste de cartes.
     */
    constructor();
    /**
     * Retourne la feuille de style à appliquer au composant.
     * @returns {CSSStyleSheet[]} Feuilles de style CSS
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Construit le DOM interne du composant.
     * @param container Racine du shadow DOM ou élément HTML
     */
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    /**
     * Ajoute un ou plusieurs éléments de type carte à la liste.
     * @param nodes Éléments HTMLBnumCardItem à ajouter
     * @returns {this} L'instance courante
     */
    add(...nodes: HTMLBnumCardItem[]): this;
    /**
     * Vide la liste de toutes ses cartes.
     * @returns {this} L'instance courante
     */
    clear(): this;
    /**
     * Crée une nouvelle instance de liste de cartes avec des éléments optionnels.
     * @param items Tableau d'éléments HTMLBnumCardItem ou null
     * @returns {HTMLBnumCardList} Nouvelle instance de liste de cartes
     */
    static Create(items?: Nullable<HTMLBnumCardItem[]>): HTMLBnumCardList;
    /**
     * Retourne le tag HTML du composant.
     */
    static get TAG(): string;
}
