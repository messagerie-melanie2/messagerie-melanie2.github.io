import BnumElement from '../../bnum-element';
import { Nullable } from '../../../core/utils/types';
import JsEvent from '@rotomeca/event';
import { HTMLBnumCardItemAgenda } from '../../molecules/card-item-agenda/bnum-card-item-agenda';
/**
 * Organisme qui permet d'afficher simplement une liste d'évènements dans une carte.
 *
 * @structure Avec des éléments
 * <bnum-card-agenda>
 * <bnum-card-item-agenda
 *    data-date="2024-01-01"
 *    data-start-date="2024-01-01 08:00:00"
 *    data-end-date="2024-01-01 10:00:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 * <bnum-card-item-agenda
 *    data-date="2025-11-20"
 *    data-start-date="2025-10-20 09:40:00"
 *    data-end-date="2025-12-20 10:10:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 * <bnum-card-item-agenda all-day
 *    data-date="2025-11-21"
 *    data-title="Télétravail"
 *    data-location="A la maison">
 * </bnum-card-item-agenda>
 * </bnum-card-agenda>
 *
 * @structure Sans éléments
 * <bnum-card-agenda>
 * </bnum-card-agenda>
 *
 * @structure Avec une url
 * <bnum-card-agenda data-url="#">
 * </bnum-card-agenda>
 *
 * @slot (default) - Contenu des éléments de type HTMLBnumCardItemAgenda.
 *
 * @cssvar {block} --bnum-card-agenda - Définit le display du composant. Par défaut à "block".
 */
export declare class HTMLBnumCardAgenda extends BnumElement {
    #private;
    /**
     * Nom du event déclenché lorsque les éléments changent (ajout/suppression).
     * @event bnum-card-agenda:change
     * @detail HTMLBnumCardItemAgenda[]
     */
    static readonly CHANGE_EVENT: string;
    /**
     * Data pour l'URL du titre.
     */
    static readonly DATA_URL: string;
    /**
     * Attribut data pour l'URL du titre.
     * @attr {string | undefined} (optional) data-url - Ajoute une url au titre. Ne rien mettre pour que l'option "url" du titre ne s'active pas.
     */
    static readonly ATTRIBUTE_DATA_URL: string;
    /**
     * Attribut pour le mode loading.
     * @attr {string | undefined} (optional) loading - Si présent, affiche le mode loading.
     */
    static readonly ATTRIBUTE_LOADING: string;
    /**
     * ID du titre.
     */
    static readonly ID_CARD_TITLE = "bnum-card-title";
    /**
     * ID de l'élément "Aucun élément".
     */
    static readonly ID_CARD_ITEM_NO_ELEMENTS = "no-elements";
    /** Référence à la classe HTMLBnumCardAgenda */
    _: typeof HTMLBnumCardAgenda;
    /**
     * Déclenché lorsque les éléments changent (ajout/suppression).
     */
    get onElementChanged(): JsEvent<(data: HTMLBnumCardItemAgenda[]) => void>;
    /**
     * Mode loading.
     */
    get loading(): boolean;
    set loading(value: boolean);
    constructor();
    protected get _p_styleSheets(): CSSStyleSheet[];
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    protected _p_attach(): void;
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void | Nullable<'break'>;
    /**
     * Ajoute des éléments.
     *
     * Note: On ajoute simplement au Light DOM. Le slotchange détectera l'ajout et déclenchera le tri.
     * @param content Elements à ajouter
     */
    add(...content: HTMLBnumCardItemAgenda[]): this;
    /**
     * Vide le composant.
     */
    clear(): this;
    protected static _p_observedAttributes(): string[];
    /**
     * Méthode statique pour créer une instance du composant.
     * @param param0 Options de création
     * @param param0.contents Contenus initiaux à ajouter
     * @param param0.url URL du titre
     * @returns Nouvelle node HTMLBnumCardAgenda
     */
    static Create({ contents, url, }?: {
        contents?: HTMLBnumCardItemAgenda[];
        url?: string;
    }): HTMLBnumCardAgenda;
    /**
     * Tag du composant.
     */
    static get TAG(): string;
}
