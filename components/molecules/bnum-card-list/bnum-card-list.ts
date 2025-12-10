import { EMPTY_STRING } from '@rotomeca/utils';
import BnumElement from '../../bnum-element';
import { HTMLBnumCardItem } from '../bnum-card-item/bnum-card-item';
import { TAG_CARD_LIST } from '../../../core/utils/constants/tags';
import style from './bnum-card-list.less';
import { Nullable } from '../../../core/utils/types';
import { SchedulerArray } from '../../../core/utils/scheduler';

/**
 * Feuille de style CSS pour le composant liste de cartes.
 */
const SHEET = BnumElement.ConstructCSSStyleSheet(style);

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
export class HTMLBnumCardList extends BnumElement {
  //#region Constants
  /**
   * Symbole utilisé pour réinitialiser la liste.
   */
  static readonly SYMBOL_RESET = Symbol('reset');
  //#endregion Constants
  //#region Private fields
  /**
   * Ordonnanceur de modifications de la liste.
   */
  #_modifierScheduler: Nullable<SchedulerArray<HTMLBnumCardItem>> = null;
  //#endregion Private fields

  //#region Lifecycle
  /**
   * Constructeur de la liste de cartes.
   */
  constructor() {
    super();
  }

  /**
   * Retourne la feuille de style à appliquer au composant.
   * @returns {CSSStyleSheet[]} Feuilles de style CSS
   */
  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [SHEET];
  }

  /**
   * Construit le DOM interne du composant.
   * @param container Racine du shadow DOM ou élément HTML
   */
  protected _p_buildDOM(container: ShadowRoot | HTMLElement): void {
    container.appendChild(this._p_createSlot());

    this.setAttribute('role', 'list');
  }
  //#endregion Lifecycle

  //#region Public methods
  /**
   * Ajoute un ou plusieurs éléments de type carte à la liste.
   * @param nodes Éléments HTMLBnumCardItem à ajouter
   * @returns {this} L'instance courante
   */
  public add(...nodes: HTMLBnumCardItem[]): this {
    return this.#_requestModifier(nodes);
  }

  /**
   * Vide la liste de toutes ses cartes.
   * @returns {this} L'instance courante
   */
  public clear(): this {
    return this.#_requestModifier(HTMLBnumCardList.SYMBOL_RESET);
  }
  //#endregion Public methods
  //#region  Private methods
  #_requestModifier(items: HTMLBnumCardItem[] | Symbol): this {
    (this.#_modifierScheduler ??= new SchedulerArray<HTMLBnumCardItem>(
      (values) => this.#_modifier(values!),
      HTMLBnumCardList.SYMBOL_RESET,
    )).schedule(items);

    return this;
  }
  #_modifier(items: HTMLBnumCardItem[] | Symbol): void {
    if (items === HTMLBnumCardList.SYMBOL_RESET) {
      this.innerHTML! = EMPTY_STRING;
    } else this.append(...(items as HTMLBnumCardItem[]));
  }
  //#endregion  Private methods

  //#region Static methods
  /**
   * Crée une nouvelle instance de liste de cartes avec des éléments optionnels.
   * @param items Tableau d'éléments HTMLBnumCardItem ou null
   * @returns {HTMLBnumCardList} Nouvelle instance de liste de cartes
   */
  static Create(items: Nullable<HTMLBnumCardItem[]> = null): HTMLBnumCardList {
    const node = document.createElement(TAG_CARD_LIST) as HTMLBnumCardList;

    if (items && items.length > 0) {
      node.add(
        ...items.filter((item): item is HTMLBnumCardItem => item !== null),
      );
    }

    return node;
  }

  /**
   * Retourne le tag HTML du composant.
   */
  static get TAG(): string {
    return TAG_CARD_LIST;
  }
  //#endregion Static methods
}

HTMLBnumCardList.TryDefine();
