import { type Locale } from 'date-fns';
import BnumElementInternal from '../../bnum-element-states';
import { JsCircularEvent } from '@rotomeca/event';
/**
 * Affiche une date formatée qui peut être mise à jour dynamiquement.
 *
 * /!\ Seuls les formats de date supportés par date-fns sont utilisables et seules les locales `fr` et `en` sont supportées.
 *
 * @structure Date simple
 * <bnum-date format="P">1997-08-12</bnum-date>
 *
 * @structure Date avec parsing personnalisé
 * <bnum-date format="PPPP" data-start-format="dd/MM/yyyy">12/08/1997</bnum-date>
 *
 * @structure Date avec attribut data-date
 * <bnum-date format="P" data-date="1997-08-12T15:30:00Z"></bnum-date>
 *
 * @structure Date en anglais
 * <bnum-date format="PPPP" locale="en">1997-08-12</bnum-date>
 *
 * @state invalid - Actif quand la date est invalide ou non définie
 * @state not-ready - Actif quand le composant n'est pas encore prêt
 */
export declare class HTMLBnumDate extends BnumElementInternal {
    #private;
    /**
     * Attribut format
     * @attr {string} (optional) (default: 'P') format - Le format de sortie selon date-fns
     */
    static readonly ATTRIBUTE_FORMAT = "format";
    /**
     * Attribut locale
     * @attr {string} (optional) (default: 'fr') locale - La locale pour le formatage
     */
    static readonly ATTRIBUTE_LOCALE = "locale";
    /**
     * Attribut date
     * @attr {string | undefined} (optional) data-date - La date source (prioritaire sur le textContent)
     */
    static readonly ATTRIBUTE_DATE = "data-date";
    /**
     * Attribut start-format
     * @attr {string | undefined} (optional) data-start-format - Le format de parsing si la date source est une chaîne
     */
    static readonly ATTRIBUTE_START_FORMAT = "data-start-format";
    /**
     * Événement déclenché lors de la mise à jour d'un attribut
     * @event bnum-date:attribute-updated
     * @detail { property: string; newValue: string | null; oldValue: string | null }
     */
    static readonly EVENT_ATTRIBUTE_UPDATED = "bnum-date:attribute-updated";
    /**
     * Événement déclenché lors de la mise à jour du format de la date
     * @event bnum-date:attribute-updated:format
     * @detail { property: string; newValue: string | null; oldValue: string | null }
     */
    static readonly EVENT_ATTRIBUTE_UPDATED_FORMAT = "bnum-date:attribute-updated:format";
    /**
     * Événement déclenché lors de la mise à jour de la locale
     * @event bnum-date:attribute-updated:locale
     * @detail { property: string; newValue: string | null; oldValue: string | null }
     */
    static readonly EVENT_ATTRIBUTE_UPDATED_LOCALE = "bnum-date:attribute-updated:locale";
    /**
     * Événement déclenché lors de la mise à jour de la date
     * @event bnum-date:date
     * @detail { property: string; newValue: Date | null; oldValue: Date | null }
     */
    static readonly EVENT_DATE = "bnum-date:date";
    /** Valeur par défaut du format */
    static readonly DEFAULT_FORMAT = "P";
    /** Valeur par défaut de la locale */
    static readonly DEFAULT_LOCALE = "fr";
    /**
     * État invalide
     */
    static readonly STATE_INVALID = "invalid";
    /** État non prêt */
    static readonly STATE_NOT_READY = "not-ready";
    /** Nom de la balise */
    static get TAG(): string;
    /** Attributs observés pour la mise à jour. */
    protected static _p_observedAttributes(): string[];
    /**
     * Événement circulaire déclenché lors du formatage de la date.
     * Permet de personnaliser le formatage via un listener externe.
     */
    formatEvent: JsCircularEvent<(param: {
        date: string | Date;
    }) => {
        date: string | Date;
    }>;
    /**
     * Indique que ce composant utilise le Shadow DOM.
     * @returns {boolean}
     */
    protected _p_isShadowElement(): boolean;
    /**
     * Construit le DOM interne (appelé une seule fois).
     * @param container Le ShadowRoot
     */
    protected _p_buildDOM(container: ShadowRoot): void;
    /**
     * Phase de pré-chargement (avant _p_buildDOM).
     * On lit les attributs initiaux et le textContent.
     */
    protected _p_preload(): void;
    /**
     * Phase d'attachement (après _p_buildDOM).
     * C'est ici qu'on fait le premier rendu.
     */
    protected _p_attach(): void;
    /**
     * Gère les changements d'attributs (appelé après _p_preload).
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void;
    /**
     * Définit ou obtient l'objet Date.
     * C'est le point d'entrée principal pour JS.
     */
    get date(): Date | null;
    set date(value: Date | string | null);
    /** Définit ou obtient le format d'affichage. */
    get format(): string;
    set format(value: string);
    /** Définit ou obtient la locale. */
    get locale(): string;
    set locale(value: string);
    get localeElement(): Locale;
    /**
     * Définit la date à partir d'une chaîne, d'un objet Date ou null.
     * @param dateInput La date source.
     * @param startFormat Le format pour parser la date si c'est une chaîne.
     * @param triggerRender Indique s'il faut rafraîchir l'affichage (par défaut: true).
     */
    setDate(dateInput: string | Date | null, startFormat?: string | null, triggerRender?: boolean): void;
    /** Récupère l'objet Date actuel. */
    getDate(): Date | null;
    /** Ajoute un nombre de jours à la date actuelle. */
    addDays(days: number): void;
    /** Ajoute un nombre de mois à la date actuelle. */
    addMonths(months: number): void;
    /** Ajoute un nombre d'années à la date actuelle. */
    addYears(years: number): void;
    askRender(): void;
    /**
     * Méthode statique pour la création (non implémentée ici,
     * mais suit le pattern de BnumElement).
     */
    static Create(dateInput?: string | Date, options?: {
        format?: string;
        locale?: string;
        startFormat?: string;
    }): HTMLBnumDate;
}
