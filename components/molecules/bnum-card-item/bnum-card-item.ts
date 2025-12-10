import JsEvent from '@rotomeca/event';
import { TAG_CARD_ITEM } from '../../../core/utils/constants/tags';
import BnumElementInternal from '../../bnum-element-states';
import style from './bnum-card-item.less';
import { HTMLBnumButton } from '../../atoms/button/bnum-button';
import { EMPTY_STRING } from '@rotomeca/utils';
import { Nullable } from '../../../core/utils/types';

const SHEET = BnumElementInternal.ConstructCSSStyleSheet(style);

/**
 * Représente un item d'une carte `<bnum-card>` qui peut être mis dans un `bnum-card-list`.
 *
 * L'élément est considéré comme un `li` d'une liste pour des raisons d'accessibilité.
 *
 * @structure Item de carte
 * <bnum-card-item><p>Contenu de l'item</p></bnum-card-item>
 *
 * @structure Désactivé
 * <bnum-card-item disabled><p>Contenu de l'item</p></bnum-card-item>
 *
 * @state disabled - Actif quand l'item est désactivé
 *
 * @slot (default) - Contenu de l'item
 *
 * @cssvar {100%} --bnum-card-item-width-percent - Largeur en pourcentage du composant
 * @cssvar {30px} --bnum-card-item-width-modifier - Valeur soustraite à la largeur
 * @cssvar {var(--bnum-color-surface, #f6f6f7)} --bnum-card-item-background-color - Couleur de fond normale
 * @cssvar {var(--bnum-color-surface-hover, #eaeaea)} --bnum-card-item-background-color-hover - Couleur de fond au survol
 * @cssvar {var(--bnum-color-surface-active, #dfdfdf)} --bnum-card-item-background-color-active - Couleur de fond à l'état actif
 * @cssvar {pointer} --bnum-card-item-cursor - Type de curseur
 * @cssvar {15px} --bnum-card-item-padding - Espacement interne
 * @cssvar {block} --bnum-card-item-display - Type d'affichage
 */
export class HTMLBnumCardItem extends BnumElementInternal {
  /**
   * Attribut désactivé
   * @attr {boolean | 'disabled' | undefined} (optional) disabled - Indique si l'item est désactivé
   */
  static readonly ATTRIBUTE_DISABLED = 'disabled';
  /**
   * État désactivé
   */
  static readonly STATE_DISABLED = 'disabled';
  /**
   * Rôle du composant
   */
  static readonly ROLE = 'listitem';
  /**
   * Événement click
   * @event click
   * @detail MouseEvent
   */
  static readonly CLICK = 'click';

  /**
   * Événement déclenché lors du clic sur l'item.
   * Permet d'attacher des gestionnaires personnalisés au clic.
   */
  #_onitemclicked: Nullable<JsEvent<(e: MouseEvent) => void>> = null;
  protected _p_slot: HTMLSlotElement | null = null;

  /**
   * Retourne la liste des attributs observés par le composant.
   * Utile pour détecter les changements d'attributs et mettre à jour l'état du composant.
   * @returns {string[]} Liste des attributs observés.
   */
  static _p_observedAttributes(): string[] {
    return [HTMLBnumCardItem.ATTRIBUTE_DISABLED];
  }

  /**
   * Événement déclenché lors du clic sur l'item.
   * Permet d'attacher des gestionnaires personnalisés au clic.
   */
  get onitemclicked(): JsEvent<(e: MouseEvent) => void> {
    this.#_onitemclicked ??= new JsEvent<(e: MouseEvent) => void>();

    return this.#_onitemclicked;
  }

  /**
   * Constructeur du composant.
   * Initialise l'événement personnalisé et attache le gestionnaire de clic.
   */
  constructor() {
    super();
    this.addEventListener(HTMLBnumCardItem.CLICK, (e: MouseEvent) => {
      if (this.onitemclicked.haveEvents()) this.onitemclicked.call(e);
    });
  }

  protected _p_fromTemplate(): HTMLTemplateElement | null {
    return BASE_TEMPLATE;
  }

  /**
   * Construit le DOM interne du composant.
   * Ajoute le slot pour le contenu et configure les attributs nécessaires.
   * @param container ShadowRoot ou HTMLElement qui contient le DOM du composant.
   */
  protected _p_buildDOM(container: ShadowRoot | HTMLElement): void {
    this._p_slot =
      container instanceof ShadowRoot
        ? (container.getElementById('defaultslot') as HTMLSlotElement)
        : (container.querySelector('#defaultslot') as HTMLSlotElement);
  }

  protected _p_attach(): void {
    super._p_attach();

    HTMLBnumButton.ToButton(this)
      .attr('role', HTMLBnumCardItem.ROLE)
      ._p_update(
        HTMLBnumCardItem.ATTRIBUTE_DISABLED,
        null,
        this.attr(HTMLBnumCardItem.ATTRIBUTE_DISABLED),
      );
  }

  /**
   * Met à jour l'état du composant en fonction des changements d'attributs.
   * Gère l'état désactivé et l'attribut aria-disabled.
   * @param name Nom de l'attribut modifié.
   * @param oldVal Ancienne valeur de l'attribut.
   * @param newVal Nouvelle valeur de l'attribut.
   */
  protected _p_update(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    this._p_render();
  }

  protected _p_render() {
    this._p_clearStates();

    if (this.hasAttribute('disabled')) {
      this.setAttribute('aria-disabled', 'true');
      this._p_addState(HTMLBnumCardItem.STATE_DISABLED);
    } else this.removeAttribute('aria-disabled');
  }

  protected _p_isUpdateForAllAttributes(): boolean {
    return true;
  }

  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [SHEET];
  }

  static CreateChildTemplate(
    childTemplate: string,
    {
      defaultSlot = true,
      slotName = EMPTY_STRING,
    }: { defaultSlot?: boolean; slotName?: string } = {},
  ): HTMLTemplateElement {
    const template = document.createElement('template');
    template.innerHTML = `${defaultSlot ? `<slot id="defaultslot" ${slotName ? `name="${slotName}"` : ''}></slot>` : EMPTY_STRING}${childTemplate}`;
    return template;
  }

  /**
   * Retourne le tag du composant.
   * @returns {string} Tag du composant.
   */
  static get TAG(): string {
    return TAG_CARD_ITEM;
  }
}

const BASE_TEMPLATE = HTMLBnumCardItem.CreateChildTemplate(EMPTY_STRING);

HTMLBnumCardItem.TryDefine();
