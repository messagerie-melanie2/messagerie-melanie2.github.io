import BnumElement from '../../bnum-element';
import { HTMLBnumCardItemMail } from '../../molecules/card-item-mail/bnum-card-item-mail';
import { Nullable } from '../../../core/utils/types';
import JsEvent from '@rotomeca/event';
/**
 * Organisme qui permet d'afficher simplement une liste de mails dans une carte.
 *
 * @structure Avec des éléments
 * <bnum-card-email>
 * <bnum-card-item-mail data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
 * </bnum-card-item-mail>
 * <bnum-card-item-mail read data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
 * </bnum-card-item-mail>
 * <bnum-card-item-mail data-date="now">
 * <span slot="subject">Sujet par défaut</span>
 * <span slot="sender">Expéditeur par défaut</span>
 * </bnum-card-item-mail>
 * </bnum-card-email>
 *
 * @structure Sans éléments
 * <bnum-card-email>
 * </bnum-card-email>
 *
 * @structure Avec une url
 * <bnum-card-email data-url="#">
 * </bnum-card-email>
 *
 * @slot (default) - Contenu des éléments de type HTMLBnumCardItemMail.
 *
 * @cssvar {block} --bnum-card-email-display - Définit le display du composant. Par défaut à "block".
 */
export declare class HTMLBnumCardEmail extends BnumElement {
    #private;
    /**
     * Nom du event déclenché lorsque les éléments changent (ajout/suppression).
     * @event bnum-card-email:change
     * @detail HTMLBnumCardItemMail[]
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
     * ID du titre.
     */
    static readonly ID_CARD_TITLE: string;
    /**
     * ID de l'élément "Aucun élément".
     */
    static readonly ID_CARD_ITEM_NO_ELEMENTS: string;
    /**
     * Attribut pour le mode loading.
     * @attr {string | undefined} (optional) loading - Si présent, affiche le mode loading.
     */
    static readonly ATTRIBUTE_LOADING: string;
    /** Référence à la classe HTMLBnumCardEmail */
    _: typeof HTMLBnumCardEmail;
    /**
     * Déclenché lorsque les éléments changent (ajout/suppression).
     */
    get onElementChanged(): JsEvent<(data: HTMLBnumCardItemMail[]) => void>;
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
    add(...content: HTMLBnumCardItemMail[]): this;
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
     * @returns Nouvelle node HTMLBnumCardEmail
     */
    static Create({ contents, url, }?: {
        contents?: HTMLBnumCardItemMail[];
        url?: string;
    }): HTMLBnumCardEmail;
    /**
     * Tag du composant.
     */
    static get TAG(): string;
}
