import { HTMLBnumCardItem } from '../bnum-card-item/bnum-card-item';
import { HTMLBnumDate } from '../../atoms/date/bnum-date';
import JsEvent from '@rotomeca/event';
import { CallbackChangedSimple } from '../../../core/utils/types';
/**
 * Composant HTML personnalisé représentant un élément de carte mail.
 *
 * Permet d'afficher un sujet, un expéditeur et une date, avec possibilité d'override du contenu par défaut.
 *
 * Utilise des slots pour l'intégration dans le Shadow DOM et propose des méthodes pour forcer ou réinitialiser le contenu.
 *
 * Note: En passant par `data-date` ou `.updateDate()`, le format d'affichage de la date est ajusté selon la logique métier :
 * - Si la date est aujourd'hui, seule l'heure est affichée (HH:mm).
 * - Si la date est comprise entre hier et il y a 7 jours, le jour de la semaine et l'heure sont affichés (E - HH:mm).
 * - Sinon, le format par défaut de HTMLBnumDate est utilisé.
 *
 * @structure Item de carte mail
 * <bnum-card-item-mail data-date="now">
 * <span slot="subject">Sujet par défaut</span>
 * <span slot="sender">Expéditeur par défaut</span>
 * </bnum-card-item-mail>
 *
 * @structure Item de carte data
 * <bnum-card-item-mail data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
 * </bnum-card-item-mail>
 *
 * @structure Item de carte lue
 * <bnum-card-item-mail read data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
 * </bnum-card-item-mail>
 *
 * @state read - Actif quand le mail est marqué comme lu.
 *
 * @slot (default) - N'existe pas, si vous mettez du contenu en dehors des slots, ils ne seront pas affichés.
 * @slot sender - Contenu de l'expéditeur (texte ou HTML).
 * @slot subject - Contenu du sujet (texte ou HTML).
 * @slot date - Contenu de la date. /!\ Si vous passez par ce slot, la mécanique de formatage automatique de la date ne s'appliquera pas.
 */
export declare class HTMLBnumCardItemMail extends HTMLBnumCardItem {
    #private;
    /**
     * Attribut data pour le sujet du mail.
     * @attr {string} (optional) data-subject - Sujet du mail.
     */
    static readonly DATA_SUBJECT = "subject";
    static readonly ATTRIBUTE_DATA_SUBJECT: string;
    /**
     * Attribut data pour la date du mail.
     * @attr {string} (optional) data-sender - Expéditeur du mail.
     */
    static readonly DATA_SENDER = "sender";
    static readonly ATTRIBUTE_DATA_SENDER: string;
    /**
     * Attribut data pour la date du mail.
     * @attr {string} (optional) data-date - Date du mail, optionnel, mais conseillé si vous voulez la logique de formatage automatique.
     */
    static readonly DATA_DATE = "date";
    static readonly ATTRIBUTE_DATA_DATE: string;
    /**
     * Attribut pour marquer le mail comme lu.
     * @attr {boolean} (optional) read - Indique si le mail est lu.
     */
    static readonly ATTRIBUTE_READ = "read";
    /**
     * Événement déclenché lors du changement de l'expéditeur du mail.
     * @event bnum-card-item-mail:sender-changed
     * @detail { caller: HTMLBnumCardItemMail }
     */
    static readonly EVENT_SENDER_CHANGED = "bnum-card-item-mail:sender-changed";
    /**
     * Événement déclenché lors du changement du sujet du mail.
     * @event bnum-card-item-mail:subject-changed
     * @detail { caller: HTMLBnumCardItemMail }
     */
    static readonly EVENT_SUBJECT_CHANGED = "bnum-card-item-mail:subject-changed";
    /**
     * Événement déclenché lors du changement de la date du mail.
     * @event bnum-card-item-mail:date-changed
     * @detail { caller: HTMLBnumCardItemMail }
     */
    static readonly EVENT_DATE_CHANGED = "bnum-card-item-mail:date-changed";
    /**
     * Nom du slot pour l'expéditeur.
     */
    static readonly SLOT_SENDER_NAME = "sender";
    /**
     * Nom du slot pour le sujet.
     */
    static readonly SLOT_SUBJECT_NAME = "subject";
    /**
     * Nom du slot pour la date.
     */
    static readonly SLOT_DATE_NAME = "date";
    /**
     * Nom de la part pour override de l'expéditeur.
     */
    static readonly PART_SENDER_OVERRIDE = "sender-override";
    /**
     * Nom de la part pour override du sujet.
     */
    static readonly PART_SUBJECT_OVERRIDE = "subject-override";
    /**
     * Nom de la part pour override de la date.
     */
    static readonly PART_DATE_OVERRIDE = "date-override";
    /**
     * Classe CSS pour l'expéditeur.
     */
    static readonly CLASS_SENDER = "sender";
    /**
     * Classe CSS pour le sujet.
     */
    static readonly CLASS_SUBJECT = "subject";
    /**
     * Classe CSS pour la date.
     */
    static readonly CLASS_DATE = "date";
    /**
     * Classe CSS pour le contenu principal.
     */
    static readonly CLASS_MAIN_CONTENT = "main-content";
    static readonly ID_DATE_ELEMENT_OVERRIDE = "date-element-override";
    static readonly ID_SENDER_SLOT = "senderslot";
    static readonly ID_SUBJECT_SLOT = "subjectslot";
    static readonly ID_DATE_SLOT = "dateslot";
    /**
     * Nom de l'état "lu".
     */
    static readonly STATE_READ = "read";
    /**
     * Format d'affichage de la date pour aujourd'hui.
     */
    static readonly TODAY_FORMAT = "HH:mm";
    /**
     * Format d'affichage de la date pour les autres jours.
     */
    static readonly OTHER_DAY_FORMAT = "dd/MM/yyyy";
    /**
     * Format d'affichage de la date pour la semaine.
     */
    static readonly WEEK_FORMAT = "E - HH:mm";
    static readonly SYMBOL_RESET: unique symbol;
    /**
     * Événement déclenché lors du changement du sujet du mail.
     * Permet d'attacher des gestionnaires personnalisés au changement de sujet.
     */
    onsubjectchanged: JsEvent<CallbackChangedSimple<HTMLBnumCardItemMail>>;
    /**
     * Événement déclenché lors du changement de l'expéditeur du mail.
     * Permet d'attacher des gestionnaires personnalisés au changement d'expéditeur.
     */
    onsenderchanged: JsEvent<CallbackChangedSimple<HTMLBnumCardItemMail>>;
    /**
     * Événement déclenché lors du changement de la date du mail.
     * Permet d'attacher des gestionnaires personnalisés au changement de date.
     */
    ondatechanged: JsEvent<CallbackChangedSimple<HTMLBnumCardItemMail>>;
    /**
     * Retourne la date du mail, en tenant compte de l'override si présent.
     */
    get date(): Date;
    /**
     * Constructeur du composant.
     */
    constructor();
    /**
     * Crée le layout du Shadow DOM (avec slots ET overrides).
     * @param container Le conteneur du Shadow DOM ou un élément HTML.
     */
    protected _p_buildDOM(container: ShadowRoot | HTMLElement): void;
    /**
     * Crée le contenu par défaut et l'attache aux slots.
     * Initialise les nœuds pour le sujedate-element-overridet, l'expéditeur et la date.
     */
    protected _p_attach(): void;
    /**
     * Retourne les stylesheets à appliquer au composant.
     * @returns Liste des CSSStyleSheet à appliquer.
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Méthode appelée lors de la mise à jour d'un attribut observé.
     * @param name Nom de l'attribut.
     * @param oldVal Ancienne valeur.
     * @param newVal Nouvelle valeur.
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void;
    /**
     * Retourne le template HTML utilisé pour le composant.
     * @returns Le template HTML.
     */
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * Force le contenu de l'expéditeur, en ignorant le slot.
     * @param content Contenu texte ou HTML à afficher comme expéditeur.
     * @returns L'instance courante pour chaînage.
     */
    updateSender(content: string | HTMLElement): this;
    /**
     * Réaffiche le contenu du slot "sender" (annule l'override).
     * @returns L'instance courante pour chaînage.
     */
    resetSender(): this;
    /**
     * Force le contenu du sujet, en ignorant le slot.
     * @param content Contenu texte ou HTML à afficher comme sujet.
     * @returns L'instance courante pour chaînage.
     */
    updateSubject(content: string | HTMLElement): this;
    /**
     * Réaffiche le contenu du slot "subject" (annule l'override).
     * @returns L'instance courante pour chaînage.
     */
    resetSubject(): this;
    /**
     * Force le contenu de la date, en ignorant le slot.
     * @param content Chaîne, Date ou élément HTML à afficher comme date.
     * @returns L'instance courante pour chaînage.
     */
    updateDate(content: string | Date | HTMLBnumDate): this;
    /**
     * Réaffiche le contenu du slot "date" (annule l'override).
     * @returns L'instance courante pour chaînage.
     */
    resetDate(): this;
    /**
     * Applique la logique de formatage de date à un élément HTMLBnumDate.
     * @param element Élément HTMLBnumDate à configurer.
     */
    static SetDateLogique(element: HTMLBnumDate): void;
    static _p_observedAttributes(): string[];
    /**
     * Crée une nouvelle instance du composant avec les valeurs fournies.
     * @param subject Sujet du mail.
     * @param sender Expéditeur du mail.
     * @param date Date du mail
     * @returns Instance HTMLBnumCardItemMail.
     */
    static Create(subject: string, sender: string, date: string | Date): HTMLBnumCardItemMail;
    /**
     * Retourne le tag HTML du composant.
     */
    static get TAG(): string;
}
