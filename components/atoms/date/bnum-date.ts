import {
  format,
  parse,
  isValid,
  addDays,
  addMonths,
  addYears,
  type Locale,
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import BnumElementInternal from '../../bnum-element-states';
import { EMPTY_STRING } from '@rotomeca/utils';
import { TAG_DATE } from '../../../core/utils/constants/tags';
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
export class HTMLBnumDate extends BnumElementInternal {
  /**
   * Attribut format
   * @attr {string} (optional) (default: 'P') format - Le format de sortie selon date-fns
   */
  static readonly ATTRIBUTE_FORMAT = 'format';
  /**
   * Attribut locale
   * @attr {string} (optional) (default: 'fr') locale - La locale pour le formatage
   */
  static readonly ATTRIBUTE_LOCALE = 'locale';
  /**
   * Attribut date
   * @attr {string | undefined} (optional) data-date - La date source (prioritaire sur le textContent)
   */
  static readonly ATTRIBUTE_DATE = 'data-date';
  /**
   * Attribut start-format
   * @attr {string | undefined} (optional) data-start-format - Le format de parsing si la date source est une chaîne
   */
  static readonly ATTRIBUTE_START_FORMAT = 'data-start-format';
  /**
   * Événement déclenché lors de la mise à jour d'un attribut
   * @event bnum-date:attribute-updated
   * @detail { property: string; newValue: string | null; oldValue: string | null }
   */
  static readonly EVENT_ATTRIBUTE_UPDATED = 'bnum-date:attribute-updated';
  /**
   * Événement déclenché lors de la mise à jour du format de la date
   * @event bnum-date:attribute-updated:format
   * @detail { property: string; newValue: string | null; oldValue: string | null }
   */
  static readonly EVENT_ATTRIBUTE_UPDATED_FORMAT =
    'bnum-date:attribute-updated:format';
  /**
   * Événement déclenché lors de la mise à jour de la locale
   * @event bnum-date:attribute-updated:locale
   * @detail { property: string; newValue: string | null; oldValue: string | null }
   */
  static readonly EVENT_ATTRIBUTE_UPDATED_LOCALE =
    'bnum-date:attribute-updated:locale';
  /**
   * Événement déclenché lors de la mise à jour de la date
   * @event bnum-date:date
   * @detail { property: string; newValue: Date | null; oldValue: Date | null }
   */
  static readonly EVENT_DATE = 'bnum-date:date';
  /** Valeur par défaut du format */
  static readonly DEFAULT_FORMAT = 'P';
  /** Valeur par défaut de la locale */
  static readonly DEFAULT_LOCALE = 'fr';
  /**
   * État invalide
   */
  static readonly STATE_INVALID = 'invalid';
  /** État non prêt */
  static readonly STATE_NOT_READY = 'not-ready';

  /** Nom de la balise */
  static get TAG(): string {
    return TAG_DATE;
  }

  /**
   * Registre statique des locales date-fns supportées.
   * On importe 'enUS' pour 'en' pour être standard.
   */
  static readonly #LOCALES: Record<string, Locale> = {
    fr: fr,
    en: enUS,
  };

  /** Attributs observés pour la mise à jour. */
  protected static _p_observedAttributes(): string[] {
    return [HTMLBnumDate.ATTRIBUTE_FORMAT, HTMLBnumDate.ATTRIBUTE_LOCALE];
  }

  // --- Champs privés (état interne) ---

  /** L'objet Date (notre source de vérité) */
  #originalDate: Date | null = null;

  /** Le format d'affichage (ex: 'PPPP') */
  #outputFormat: string = HTMLBnumDate.DEFAULT_FORMAT; // 'P' -> 12/08/1997

  /** La locale (code) */
  #locale: string = HTMLBnumDate.DEFAULT_LOCALE;

  /** Le format de parsing (ex: 'dd/MM/yyyy') */
  #startFormat: string | null = null;

  /** L'élément SPAN interne qui contient le texte formaté */
  #outputElement: HTMLSpanElement | null = null;
  #_renderSheduled: boolean = false;

  /**
   * Événement circulaire déclenché lors du formatage de la date.
   * Permet de personnaliser le formatage via un listener externe.
   */
  public formatEvent: JsCircularEvent<
    (param: { date: string | Date }) => { date: string | Date }
  > = new JsCircularEvent();

  /**
   * Indique que ce composant utilise le Shadow DOM.
   * @returns {boolean}
   */
  protected _p_isShadowElement(): boolean {
    return true;
  }

  /**
   * Construit le DOM interne (appelé une seule fois).
   * @param container Le ShadowRoot
   */
  protected _p_buildDOM(container: ShadowRoot): void {
    this.#outputElement = document.createElement('span');
    this.#outputElement.setAttribute('part', 'date-text'); // Permet de styler depuis l'extérieur
    container.append(this.#outputElement);
  }

  /**
   * Phase de pré-chargement (avant _p_buildDOM).
   * On lit les attributs initiaux et le textContent.
   */
  protected _p_preload(): void {
    // On ajoute un listener sur `bnum-date:attribute-updated` pour trigger les propriété de manière + précises.
    this.addEventListener(HTMLBnumDate.EVENT_ATTRIBUTE_UPDATED, (e) => {
      this.trigger(
        `${HTMLBnumDate.EVENT_ATTRIBUTE_UPDATED}:${(e as CustomEvent).detail.property}`,
        (e as CustomEvent).detail,
      );
    });

    // Lire les attributs de configuration
    this.#outputFormat =
      this.getAttribute(HTMLBnumDate.ATTRIBUTE_FORMAT) || this.#outputFormat;
    this.#locale =
      this.getAttribute(HTMLBnumDate.ATTRIBUTE_LOCALE) || this.#locale;
    this.#startFormat =
      this.getAttribute(HTMLBnumDate.ATTRIBUTE_START_FORMAT) || null;

    // Déterminer la date initiale (priorité à data-date)
    const initialDateStr =
      this.getAttribute(HTMLBnumDate.ATTRIBUTE_DATE) ||
      this.textContent?.trim() ||
      null;

    // Définir la date sans déclencher de rendu (render=false)
    if (initialDateStr) this.setDate(initialDateStr, this.#startFormat, false);
  }

  /**
   * Phase d'attachement (après _p_buildDOM).
   * C'est ici qu'on fait le premier rendu.
   */
  protected _p_attach(): void {
    this.#renderDate();
  }

  /**
   * Gère les changements d'attributs (appelé après _p_preload).
   */
  protected _p_update(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    if (oldVal === newVal) return;

    let needsRender = false;

    switch (name) {
      case HTMLBnumDate.ATTRIBUTE_FORMAT:
        this.#outputFormat = newVal || HTMLBnumDate.DEFAULT_FORMAT;
        needsRender = true;
        break;
      case HTMLBnumDate.ATTRIBUTE_LOCALE:
        this.#locale = newVal || HTMLBnumDate.DEFAULT_LOCALE;
        needsRender = true;
        break;
      case HTMLBnumDate.ATTRIBUTE_START_FORMAT:
        this.#startFormat = newVal;
        // Pas de re-rendu, affecte seulement le prochain setDate()
        break;
      case HTMLBnumDate.ATTRIBUTE_DATE:
        // Re-parse la date
        this.setDate(newVal, this.#startFormat, false);
        needsRender = true;
        break;
    }

    if (needsRender) {
      this.#renderDate();
      // On déclenche l'événement pour la réactivité
      this.trigger(HTMLBnumDate.EVENT_ATTRIBUTE_UPDATED, {
        property: name,
        newValue: newVal,
        oldValue: oldVal,
      });
    }
  }

  // --- API Publique (Propriétés) ---

  /**
   * Définit ou obtient l'objet Date.
   * C'est le point d'entrée principal pour JS.
   */
  get date(): Date | null {
    return this.#originalDate;
  }
  set date(value: Date | string | null) {
    this.setDate(value, this.#startFormat, true);
  }

  /** Définit ou obtient le format d'affichage. */
  get format(): string {
    return this.#outputFormat;
  }
  set format(value: string) {
    this.setAttribute(HTMLBnumDate.ATTRIBUTE_FORMAT, value);
  }

  /** Définit ou obtient la locale. */
  get locale(): string {
    return this.#locale;
  }
  set locale(value: string) {
    this.setAttribute(HTMLBnumDate.ATTRIBUTE_LOCALE, value);
  }

  public get localeElement(): Locale {
    return (
      (this.constructor as typeof HTMLBnumDate).#LOCALES[this.#locale] || fr
    );
  }

  // --- API Publique (Méthodes) ---

  /**
   * Définit la date à partir d'une chaîne, d'un objet Date ou null.
   * @param dateInput La date source.
   * @param startFormat Le format pour parser la date si c'est une chaîne.
   * @param triggerRender Indique s'il faut rafraîchir l'affichage (par défaut: true).
   */
  public setDate(
    dateInput: string | Date | null,
    startFormat?: string | null,
    triggerRender: boolean = true,
  ): void {
    const oldDate = this.#originalDate;
    let newDate: Date | null = null;

    if (dateInput === null) {
      newDate = null;
    } else if (dateInput instanceof Date) {
      newDate = dateInput;
    } else if (typeof dateInput === 'string') {
      if (dateInput.trim() === 'now') {
        newDate = new Date();
      } else {
        const formatToUse = startFormat || this.#startFormat;
        if (formatToUse) {
          // Parsing avec format spécifique
          newDate = parse(dateInput, formatToUse, new Date());
        } else {
          // Parsing natif (ISO 8601, timestamps...)
          newDate = new Date(dateInput);
        }
      }
    }

    // Vérification de la validité
    if (newDate && isValid(newDate)) {
      this.#originalDate = newDate;
    } else {
      this.#originalDate = null;
    }

    // Déclenche le rendu et/ou l'événement si la date a changé
    if (oldDate?.getTime() !== this.#originalDate?.getTime()) {
      if (triggerRender) {
        this.#renderDate();
      }
      this.trigger(HTMLBnumDate.EVENT_DATE, {
        property: 'date',
        newValue: this.#originalDate,
        oldValue: oldDate,
      });
    }
  }

  /** Récupère l'objet Date actuel. */
  public getDate(): Date | null {
    return this.#originalDate;
  }

  /** Ajoute un nombre de jours à la date actuelle. */
  public addDays(days: number): void {
    if (!this.#originalDate) return;
    this.date = addDays(this.#originalDate, days);
  }

  /** Ajoute un nombre de mois à la date actuelle. */
  public addMonths(months: number): void {
    if (!this.#originalDate) return;
    this.date = addMonths(this.#originalDate, months);
  }

  /** Ajoute un nombre d'années à la date actuelle. */
  public addYears(years: number): void {
    if (!this.#originalDate) return;
    this.date = addYears(this.#originalDate, years);
  }

  public askRender(): void {
    if (this.#_renderSheduled) return;
    this.#_renderSheduled = true;
    requestAnimationFrame(() => {
      this.#_renderSheduled = false;
      this.#renderDate();
    });
  }

  // --- Méthodes Privées ---

  /**
   * Met à jour le textContent du span interne.
   * C'est la seule fonction qui écrit dans le DOM.
   */
  #renderDate(): void {
    this._p_clearStates();
    if (!this.#outputElement) {
      this._p_addState(HTMLBnumDate.STATE_NOT_READY);
      return; // Pas encore prêt
    }

    if (!this.#originalDate) {
      this.#outputElement.textContent = EMPTY_STRING; // Affiche une chaîne vide si date invalide/null
      this._p_addState(HTMLBnumDate.STATE_INVALID);
      return;
    }

    // Trouve la locale, avec fallback sur 'fr'
    const locale = this.localeElement;

    try {
      const formated = format(this.#originalDate, this.#outputFormat, {
        locale,
      });

      this.#outputElement.textContent =
        this.formatEvent.call({ date: this.#originalDate })?.date || formated;

      this.setAttribute('aria-label', this.#outputElement.textContent);
    } catch (e) {
      console.error(
        `###[bnum-date] Erreur de formatage date-fns. Format: "${this.#outputFormat}"`,
        e,
      );
      this.#outputElement.textContent = 'Date invalide';
      this._p_addState(HTMLBnumDate.STATE_INVALID);
    }

    this.setAttribute('aria-label', this.#outputElement.textContent);
  }

  /**
   * Méthode statique pour la création (non implémentée ici,
   * mais suit le pattern de BnumElement).
   */
  static Create(
    dateInput?: string | Date,
    options?: {
      format?: string;
      locale?: string;
      startFormat?: string;
    },
  ): HTMLBnumDate {
    const el = document.createElement(this.TAG) as HTMLBnumDate;
    if (options?.format) el.format = options.format;
    if (options?.locale) el.locale = options.locale;
    if (options?.startFormat)
      el.setAttribute(HTMLBnumDate.ATTRIBUTE_START_FORMAT, options.startFormat);

    if (typeof dateInput === 'string')
      el.appendChild(document.createTextNode(dateInput));
    else if (dateInput) el.date = dateInput;

    return el;
  }
}

// Auto-définition du composant
HTMLBnumDate.TryDefine();
