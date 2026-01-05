import { HTMLBnumCardItem } from '../bnum-card-item/bnum-card-item';
import { JsCircularEvent } from '@rotomeca/event';
import { HTMLBnumDate } from '../../atoms/date/bnum-date';
import { Nullable } from '../../../core/utils/types';
/**
 * Type de callback pour la définition de l'action au démarrage.
 * Permet de personnaliser l'action affichée dans la carte agenda.
 */
export declare type OnStartDefineActionCallback = (param: {
    location: string;
    action: HTMLElement | null | undefined;
}) => {
    location: string;
    action: HTMLElement | null | undefined;
};
/**
 * Type pour la création d'une action d'événement.
 */
export declare type EventCreationAction = Nullable<{
    element: HTMLElement;
    callback: () => void;
}> | Nullable<OnStartDefineActionCallback>;
/**
 * Options pour la création d'une instance HTMLBnumCardItemAgenda.
 */
export declare type CreateConstructorOptions = {
    allDay?: boolean;
    title?: Nullable<string>;
    location?: Nullable<string>;
    action?: Nullable<EventCreationAction>;
    isPrivate?: Nullable<boolean>;
    mode?: Nullable<string>;
};
/**
 * Options pour la création d'une instance HTMLBnumCardItemAgenda à partir d'un événement.
 */
export declare type FromEventConstructorOptions = {
    startDateSelector?: Nullable<(agendaEvent: any) => Date>;
    endDateSelector?: Nullable<(agendaEvent: any) => Date>;
    allDaySelector?: Nullable<(agendaEvent: any) => boolean>;
    titleSelector?: Nullable<(agendaEvent: any) => string>;
    locationSelector?: Nullable<(agendaEvent: any) => string>;
    action?: Nullable<EventCreationAction>;
};
/**
 * Item de carte agenda
 *
 * @structure Initalisation basique
 * <bnum-card-item-agenda
 *    data-date="2024-01-01"
 *    data-start-date="2024-01-01 08:00:00"
 *    data-end-date="2024-01-01 10:00:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 *
 * @structure Exemple avec des dates de départs et fin différentes du jour de base
 * <bnum-card-item-agenda
 *    data-date="2025-11-20"
 *    data-start-date="2025-10-20 09:40:00"
 *    data-end-date="2025-12-20 10:10:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 *
 * @structure Exemple de journée entière
 * <bnum-card-item-agenda all-day
 *    data-date="2025-11-21"
 *    data-title="Télétravail"
 *    data-location="A la maison">
 * </bnum-card-item-agenda>
 *
 *
 * @structure Exemple avec des slots
 * <bnum-card-item-agenda
 *    data-date="2025-11-20"
 *    data-start-date="2025-11-20 09:40:00"
 *    data-end-date="2025-11-20 10:10:00">
 *   <span slot="title">Réunion de projet avec l'équipe marketing</span>
 *   <span slot="location">Salle de conférence, Bâtiment A</span>
 *   <bnum-primary-button slot="action" rounded data-icon='video_camera_front' data-icon-margin="0" onclick="alert('Action déclenchée !')"></bnum-primary-button>
 * </bnum-card-item-agenda>
 *
 * @structure Exemple de journée privée
 * <bnum-card-item-agenda all-day private
 *    data-date="2025-11-21"
 *    data-title="Télétravail"
 *    data-location="A la maison">
 * </bnum-card-item-agenda>
 *
 * @structure Exemple de journée avec un mode
 * <bnum-card-item-agenda all-day mode="telework"
 *    data-date="2025-11-21"
 *    data-title="Télétravail"
 *    data-location="A la maison">
 * </bnum-card-item-agenda>
 *
 * @slot title - Contenu du titre de l'événement
 * @slot location - Contenu du lieu de l'événement
 * @slot action - Contenu de l'action de l'événement (bouton etc...)
 *
 * @state no-location - Actif quand le lieu n'est pas défini
 * @state all-day - Actif quand l'événement dure toute la journée
 * @state private - Actif quand l'événement est privé
 * @state mode-X - Actif quand le mode de l'événement est défini à "X" (remplacer X par le mode)
 * @state action - Actif quand une action est définie pour l'événement
 *
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-gap - Contrôle l'espacement général entre les éléments du composant.
 * @cssvar {var(--bnum-font-weight-bold, 700)} --bnum-card-item-agenda-date-bold - Poids de police pour les textes en gras (date).
 * @cssvar {var(--bnum-font-weight-medium, 500)} --bnum-card-item-agenda-date-bold-medium - Poids de police medium pour certains textes.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-padding-right-hour - Padding à droite de l'heure.
 * @cssvar {0} --bnum-card-item-agenda-padding-left-hour - Padding à gauche de l'heure.
 * @cssvar {0} --bnum-card-item-agenda-padding-top-hour - Padding en haut de l'heure.
 * @cssvar {0} --bnum-card-item-agenda-padding-bottom-hour - Padding en bas de l'heure.
 * @cssvar {var(--bnum-border-surface, 1px solid #E0E0E0)} --bnum-card-item-agenda-date-border-right - Bordure à droite de l'heure.
 * @cssvar {none} --bnum-card-item-agenda-date-border-left - Bordure à gauche de l'heure.
 * @cssvar {none} --bnum-card-item-agenda-date-border-top - Bordure en haut de l'heure.
 * @cssvar {none} --bnum-card-item-agenda-date-border-bottom - Bordure en bas de l'heure.
 * @cssvar {var(--bnum-font-size-xs, 12px)} --bnum-card-item-agenda-location-font-size - Taille de police pour le lieu.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-private-icon-top - Position top de l'icône privée.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-private-icon-right - Position right de l'icône privée.
 * @cssvar {italic} --bnum-card-item-agenda-telework-font-style - Style de police en mode télétravail.
 * @cssvar {'\e88a'} --bnum-card-item-agenda-telework-icon-content - Contenu de l'icône télétravail.
 * @cssvar {var(--bnum-icon-font-family, 'Material Symbols Outlined')} --bnum-card-item-agenda-telework-icon-font-family - Famille de police de l'icône télétravail.
 * @cssvar {var(--bnum-font-size-xxl, 32px)} --bnum-card-item-agenda-telework-icon-font-size - Taille de l'icône télétravail.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-telework-icon-bottom - Position bottom de l'icône télétravail.
 * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-telework-icon-right - Position right de l'icône télétravail.
 * @cssvar {20px} --bnum-card-item-agenda-telework-action-margin-right - Marge à droite de l'action en mode télétravail.
 */
export declare class HTMLBnumCardItemAgenda extends HTMLBnumCardItem {
    #private;
    /** Attribut HTML pour indiquer un événement sur toute la journée
     * @attr {boolean | string | undefined} (optional) (default: undefined) all-day - Indique si l'événement dure toute la journée
     */
    static readonly ATTRIBUTE_ALL_DAY: string;
    /** Attribut HTML pour indiquer un événement privé
     * @attr {boolean | string | undefined} (optional) (default: undefined) private - Indique si l'événement est privé
     */
    static readonly ATTRIBUTE_PRIVATE: string;
    /** Attribut HTML pour indiquer le mode de l'événement
     * @attr {string | undefined} (optional) (default: undefined) mode - Indique le mode de l'événement et permet des affichages visuels (custom ou non) en fonction de celui-ci. Créer l'état CSS `mode-X`.
     */
    static readonly ATTRIBUTE_MODE: string;
    /** Attribut HTML pour le titre (data-title)
     * @attr {string | undefined} (optional) (default: undefined) data-title - Titre de l'événement
     */
    static readonly ATTRIBUTE_DATA_TITLE: string;
    /** Attribut HTML pour le lieu (data-location)
     * @attr {string | undefined} (optional) (default: undefined) data-location - Lieu de l'événement
     */
    static readonly ATTRIBUTE_DATA_LOCATION: string;
    /** Clé de donnée pour la date de base
     * @attr {string | undefined} data-date - Date de base de l'événement
     */
    static readonly DATA_DATE: string;
    /** Clé de donnée pour le format de la date de base
     * @attr {string | undefined} (optional) (default: yyyy-MM-dd) data-date-format - Format de la date de base de l'événement
     */
    static readonly DATA_DATE_FORMAT: string;
    /** Clé de donnée pour la date de début
     * @attr {string | undefined} data-start-date - Date de début de l'événement
     */
    static readonly DATA_START_DATE: string;
    /** Clé de donnée pour le format de la date de début
     * @attr {string | undefined} (optional) (default: yyyy-MM-dd HH:mm:ss) data-start-date-format - Format de la date de début de l'événement
     */
    static readonly DATA_START_DATE_FORMAT: string;
    /** Clé de donnée pour la date de fin
     * @attr {string | undefined} data-end-date - Date de fin de l'événement
     */
    static readonly DATA_END_DATE: string;
    /** Clé de donnée pour le format de la date de fin
     * @attr {string | undefined} (optional) (default: yyyy-MM-dd HH:mm:ss) data-end-date-format - Format de la date de fin de l'événement
     */
    static readonly DATA_END_DATE_FORMAT: string;
    /** Clé de donnée pour le titre */
    static readonly DATA_TITLE: string;
    /** Clé de donnée pour le lieu */
    static readonly DATA_LOCATION: string;
    /** Format par défaut pour la date (ex: 2024-01-01) */
    static readonly FORMAT_DATE_DEFAULT: string;
    /** Format par défaut pour la date et l'heure (ex: 2024-01-01 08:00:00) */
    static readonly FORMAT_DATE_TIME_DEFAULT: string;
    /** Format par défaut pour l'heure (ex: 08:00) */
    static readonly FORMAT_HOUR_DEFAULT: string;
    /** Format pour l'heure si le jour est différent (ex: 20/11) */
    static readonly FORMAT_HOUR_DIFF_DAY: string;
    /** Texte pour "Aujourd'hui" (localisé) */
    static readonly FORMAT_TODAY: string;
    /** Texte pour "Demain" (localisé) */
    static readonly FORMAT_TOMORROW: string;
    /** Format pour la date d'événement (ex: lundi 20 novembre) */
    static readonly FORMAT_EVENT_DATE: string;
    /** Classe CSS pour le jour de l'agenda */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_DAY = "bnum-card-item-agenda-day";
    /** Classe CSS pour l'heure de l'agenda */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_HOUR = "bnum-card-item-agenda-hour";
    /** Classe CSS pour le titre de l'agenda */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_TITLE = "bnum-card-item-agenda-title";
    /** Classe CSS pour le lieu de l'agenda */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION = "bnum-card-item-agenda-location";
    /** Classe CSS pour l'action de l'agenda */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_ACTION = "bnum-card-item-agenda-action";
    /** Classe CSS pour le titre en override */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_TITLE_OVERRIDE = "bnum-card-item-agenda-title-override";
    /** Classe CSS pour le lieu en override */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION_OVERRIDE = "bnum-card-item-agenda-location-override";
    /** Classe CSS pour l'action en override */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_ACTION_OVERRIDE = "bnum-card-item-agenda-action-override";
    /** Classe CSS pour la disposition horizontale */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_HORIZONTAL = "bnum-card-item-agenda-horizontal";
    /** Classe CSS pour la disposition verticale */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_VERTICAL = "bnum-card-item-agenda-vertical";
    /** Classe CSS pour l'affichage "toute la journée" */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_ALL_DAY = "bnum-card-item-agenda-all-day";
    /** Classe CSS pour l'icône privée */
    static readonly CLASS_BNUM_CARD_ITEM_AGENDA_PRIVATE_ICON = "bnum-card-item-agenda-private-icon";
    /** Nom du slot pour le titre */
    static readonly SLOT_NAME_TITLE: string;
    /** Nom du slot pour le lieu */
    static readonly SLOT_NAME_LOCATION: string;
    /** Nom du slot pour l'action */
    static readonly SLOT_NAME_ACTION: string;
    /** État CSS pour absence de lieu */
    static readonly STATE_NO_LOCATION: string;
    /** État CSS pour "toute la journée" */
    static readonly STATE_ALL_DAY: string;
    /** État CSS pour événement privé */
    static readonly STATE_PRIVATE: string;
    /** Préfixe d'état CSS pour le mode */
    static readonly STATE_MODE_PREFIX: string;
    /**
     * État CSS lorsque l'action est définie
     */
    static readonly STATE_ACTION_DEFINED: string;
    /** Texte affiché pour "toute la journée" (localisé) */
    static readonly TEXT_ALL_DAY: string;
    /** Attribut d'état interne pour la gestion du rendu différé */
    static readonly ATTRIBUTE_PENDING: string;
    /** Mode par défaut */
    static readonly MODE_DEFAULT: string;
    /** Nom de l'icône pour les événements privés */
    static readonly ICON_PRIVATE: string;
    /** Symbole pour la réinitialisation interne */
    static readonly SYMBOL_RESET: Symbol;
    /**
     * Événement circulaire déclenché lors de la définition de l'action.
     *
     * Permet de personnaliser l'action affichée dans la carte agenda.
     */
    get onstartdefineaction(): JsCircularEvent<OnStartDefineActionCallback>;
    /**
     * Indique si l'événement dure toute la journée.
     */
    get isAllDay(): boolean;
    /**
     * Date de base de l'événement (jour affiché).
     */
    get baseDate(): Date;
    set baseDate(value: Date);
    /**
     * Date de début de l'événement.
     */
    get startDate(): Date;
    set startDate(value: Date);
    /**
     * Date de fin de l'événement.
     */
    get endDate(): Date;
    set endDate(value: Date);
    get private(): boolean;
    set private(value: boolean);
    constructor();
    /**
     * Récupère le style CSS à appliquer au composant.
     * @returns Chaîne de style CSS à appliquer au composant.
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Précharge les données nécessaires à l'initialisation du composant.
     */
    protected _p_preload(): void;
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    /**
     * Attache le composant au DOM et initialise les valeurs par défaut.
     */
    protected _p_attach(): void;
    /**
     * Met à jour le rendu du composant.
     */
    protected _p_render(): void;
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * Met à jour l'action affichée dans la carte agenda.
     * @param element Élément HTML à afficher comme action
     * @returns L'instance du composant
     */
    updateAction(element: HTMLElement, { forceCall }?: {
        forceCall?: boolean;
    }): HTMLBnumCardItemAgenda;
    /**
     * Réinitialise l'action à sa valeur par défaut.
     * @returns L'instance du composant
     */
    resetAction(): HTMLBnumCardItemAgenda;
    /**
     * Met à jour le titre affiché dans la carte agenda.
     * @param element Élément HTML ou texte à afficher comme titre
     * @returns L'instance du composant
     */
    updateTitle(element: HTMLElement): HTMLBnumCardItemAgenda;
    updateTitle(element: string): HTMLBnumCardItemAgenda;
    /**
     * Réinitialise le titre à sa valeur par défaut.
     * @returns L'instance du composant
     */
    resetTitle(): HTMLBnumCardItemAgenda;
    /**
     * Met à jour le lieu affiché dans la carte agenda.
     * @param element Élément HTML ou texte à afficher comme lieu
     * @returns L'instance du composant
     */
    updateLocation(element: HTMLElement): HTMLBnumCardItemAgenda;
    updateLocation(element: string): HTMLBnumCardItemAgenda;
    /**
     * Réinitialise le lieu à sa valeur par défaut.
     * @returns L'instance du composant
     */
    resetLocation(): HTMLBnumCardItemAgenda;
    /**
     * Applique la logique d'affichage pour la date (aujourd'hui, demain, etc.).
     * @param element Instance HTMLBnumDate à formater
     * @returns Instance HTMLBnumDate modifiée
     */
    setDateLogic(element: HTMLBnumDate): HTMLBnumDate;
    /**
     * Applique la logique d'affichage pour l'heure (heure ou date selon le jour).
     * @param element Instance HTMLBnumDate à formater
     * @returns Instance HTMLBnumDate modifiée
     */
    setHourLogic(element: HTMLBnumDate): HTMLBnumDate;
    /**
     * Crée une nouvelle instance du composant agenda avec les paramètres donnés.
     * @param baseDate Date de base
     * @param startDate Date de début
     * @param endDate Date de fin
     * @param options Options supplémentaires (allDay, title, location, action)
     * @returns Instance HTMLBnumCardItemAgenda
     */
    static Create(baseDate: Date, startDate: Date, endDate: Date, { allDay, title, location, action, isPrivate, mode, }?: CreateConstructorOptions): HTMLBnumCardItemAgenda;
    /**
     * @inheritdoc
     */
    static _p_observedAttributes(): string[];
    /**
     * Crée une nouvelle instance du composant agenda à partir d'un objet événement.
     * @param baseDate Date de base
     * @param agendaEvent Objet événement source
     * @param options Fonctions de sélection et action personnalisée
     * @returns Instance HTMLBnumCardItemAgenda
     */
    static FromEvent(baseDate: Date, agendaEvent: any, { startDateSelector, endDateSelector, allDaySelector, titleSelector, locationSelector, action, }?: FromEventConstructorOptions): HTMLBnumCardItemAgenda;
    /**
     * Retourne le tag HTML du composant.
     */
    static get TAG(): string;
}
