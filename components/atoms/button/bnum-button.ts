import { EMPTY_STRING } from '@rotomeca/utils';
import { TAG_BUTTON } from '../../../core/utils/constants/tags';
import BnumElement from '../../bnum-element';
import { REG_XSS_SAFE } from '../../../core/utils/constants/regexp';
import JsEvent from '@rotomeca/event';
import ElementChangedEvent from '../../../core/utils/events/ElementChangedEvent';
import { HTMLBnumIcon } from '../icon/bnum-icon';
import style from './bnum-button.less';
import { Scheduler } from '../../../core/utils/scheduler';
import { Nullable } from '../../../core/utils/types';

//#region External Constants
/**
 * Style CSS du composant bouton.
 */
const SHEET = BnumElement.ConstructCSSStyleSheet(style);

// Constantes pour les tags des différents types de boutons
/**
 * Tag du bouton Bnum.
 */
const TAG = TAG_BUTTON;
/**
 * Icône de chargement utilisée dans le bouton.
 */
const ICON_LOADER = 'progress_activity';
//#endregion External Constants
//#region Types and Enums
/**
 * Enumération des types de boutons.
 */
export enum EButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  DANGER = 'danger',
}

/**
 * Enumération des positions possibles de l'icône dans le bouton.
 */
export enum EIconPosition {
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * Enumération des tailles de layout pour cacher le texte.
 */
export enum EHideOn {
  SMALL = 'small',
  TOUCH = 'touch',
}

/**
 * Type représentant les variations possibles du bouton.
 */
export type ButtonVariation = 'primary' | 'secondary' | 'tertiary' | 'danger';

/**
 * Position possible de l'icône dans le bouton.
 */
export type IconPosition = 'left' | 'right';

/**
 * Taille de layout sur laquelle le texte doit être caché.
 */
export type HideTextOnLayoutSize = 'small' | 'touch' | null;
//#endregion Types and Enums
//#region Documentation
/**
 * Composant bouton principal de la bibliothèque Bnum.
 * Gère les variations, l'icône, l'état de chargement, etc.
 *
 * @structure Bouton primaire
 * <bnum-button data-variation="primary">Texte du bouton</bnum-button>
 *
 * @structure Bouton secondaire
 * <bnum-button data-variation="secondary">Texte du bouton</bnum-button>
 *
 * @structure Bouton danger
 * <bnum-button data-variation="danger">Texte du bouton</bnum-button>
 *
 * @structure Bouton avec icône
 * <bnum-button data-icon="home">Texte du bouton</bnum-button>
 *
 * @structure Bouton avec une icône à gauche
 * <bnum-button data-icon="home" data-icon-pos="left">Texte du bouton</bnum-button>
 *
 * @structure Bouton en état de chargement
 * <bnum-button loading>Texte du bouton</bnum-button>
 *
 * @structure Bouton arrondi
 * <bnum-button rounded>Texte du bouton</bnum-button>
 *
 * @structure Bouton cachant le texte sur les petits layouts
 * <bnum-button data-hide="small" data-icon="menu">Menu</bnum-button>
 *
 * @slot (default) - Contenu du bouton (texte, HTML, etc.)
 *
 * @state loading - Actif si le bouton est en état de chargement
 * @state rounded - Actif si le bouton est arrondi
 * @state disabled - Actif si le bouton est désactivé
 * @state icon - Actif si le bouton contient une icône
 * @state without-icon - Actif si le bouton ne contient pas d'icône
 * @state icon-pos-left - Actif si l'icône est positionnée à gauche
 * @state icon-pos-right - Actif si l'icône est positionnée à droite
 * @state hide-text-on-small - Actif si le texte est caché sur les petits layouts
 * @state hide-text-on-touch - Actif si le texte est caché sur les layouts tactiles
 * @state primary - Actif si le bouton est de type primaire
 * @state secondary - Actif si le bouton est de type secondaire
 * @state tertiary - Actif si le bouton est de type tertiaire
 * @state danger - Actif si le bouton est de type danger
 *
 * @cssvar {inline-block} --bnum-button-display - Définit le type d'affichage du bouton
 * @cssvar {6px 10px} --bnum-button-padding - Définit le padding interne du bouton
 * @cssvar {0} --bnum-button-border-radius - Définit l'arrondi des coins du bouton
 * @cssvar {pointer} --bnum-button-cursor - Définit le curseur de la souris au survol du bouton
 * @cssvar {5px} --bnum-button-rounded-border-radius - Arrondi des coins pour le bouton arrondi
 * @cssvar {7.5px} --bnum-button-without-icon-padding-top - Padding top si le bouton n'a pas d'icône
 * @cssvar {7.5px} --bnum-button-without-icon-padding-bottom - Padding bottom si le bouton n'a pas d'icône
 * @cssvar {var(--bnum-color-primary)} --bnum-button-primary-background-color - Couleur de fond du bouton (état primaire)
 * @cssvar {var(--bnum-text-on-primary)} --bnum-button-primary-text-color - Couleur du texte du bouton (état primaire)
 * @cssvar {solid thin var(--bnum-button-primary-border-color)} --bnum-button-primary-border - Bordure du bouton (état primaire)
 * @cssvar {var(--bnum-color-primary)} --bnum-button-primary-border-color - Couleur de la bordure (état primaire)
 * @cssvar {var(--bnum-color-primary-hover)} --bnum-button-primary-hover-background-color - Couleur de fond au survol (état primaire)
 * @cssvar {var(--bnum-text-on-primary-hover)} --bnum-button-primary-hover-text-color - Couleur du texte au survol (état primaire)
 * @cssvar {solid thin var(--bnum-button-primary-hover-border-color)} --bnum-button-primary-hover-border - Bordure au survol (état primaire)
 * @cssvar {var(--bnum-color-primary-hover)} --bnum-button-primary-hover-border-color - Couleur de la bordure au survol (état primaire)
 * @cssvar {var(--bnum-color-primary-active)} --bnum-button-primary-active-background-color - Couleur de fond lors du clic (état primaire)
 * @cssvar {var(--bnum-text-on-primary-active)} --bnum-button-primary-active-text-color - Couleur du texte lors du clic (état primaire)
 * @cssvar {solid thin var(--bnum-button-primary-active-border-color)} --bnum-button-primary-active-border - Bordure lors du clic (état primaire)
 * @cssvar {var(--bnum-color-primary-active)} --bnum-button-primary-active-border-color - Couleur de la bordure lors du clic (état primaire)
 * @cssvar {var(--bnum-color-secondary)} --bnum-button-secondary-background-color - Couleur de fond (état secondaire)
 * @cssvar {var(--bnum-text-on-secondary)} --bnum-button-secondary-text-color - Couleur du texte (état secondaire)
 * @cssvar {solid thin var(--bnum-button-secondary-border-color)} --bnum-button-secondary-border - Bordure (état secondaire)
 * @cssvar {var(--bnum-color-primary)} --bnum-button-secondary-border-color - Couleur de la bordure (état secondaire)
 * @cssvar {var(--bnum-color-secondary-hover)} --bnum-button-secondary-hover-background-color - Couleur de fond au survol (état secondaire)
 * @cssvar {var(--bnum-text-on-secondary-hover)} --bnum-button-secondary-hover-text-color - Couleur du texte au survol (état secondaire)
 * @cssvar {solid thin var(--bnum-button-secondary-hover-border-color)} --bnum-button-secondary-hover-border - Bordure au survol (état secondaire)
 * @cssvar {var(--bnum-color-primary)} --bnum-button-secondary-hover-border-color - Couleur de la bordure au survol (état secondaire)
 * @cssvar {var(--bnum-color-secondary-active)} --bnum-button-secondary-active-background-color - Couleur de fond lors du clic (état secondaire)
 * @cssvar {var(--bnum-text-on-secondary-active)} --bnum-button-secondary-active-text-color - Couleur du texte lors du clic (état secondaire)
 * @cssvar {solid thin var(--bnum-button-secondary-active-border-color)} --bnum-button-secondary-active-border - Bordure lors du clic (état secondaire)
 * @cssvar {var(--bnum-color-primary)} --bnum-button-secondary-active-border-color - Couleur de la bordure lors du clic (état secondaire)
 * @cssvar {var(--bnum-color-danger)} --bnum-button-danger-background-color - Couleur de fond (état danger)
 * @cssvar {var(--bnum-text-on-danger)} --bnum-button-danger-text-color - Couleur du texte (état danger)
 * @cssvar {solid thin var(--bnum-button-danger-border-color)} --bnum-button-danger-border - Bordure (état danger)
 * @cssvar {var(--bnum-color-danger)} --bnum-button-danger-border-color - Couleur de la bordure (état danger)
 * @cssvar {var(--bnum-color-danger-hover)} --bnum-button-danger-hover-background-color - Couleur de fond au survol (état danger)
 * @cssvar {var(--bnum-text-on-danger-hover)} --bnum-button-danger-hover-text-color - Couleur du texte au survol (état danger)
 * @cssvar {solid thin var(--bnum-button-danger-hover-border-color)} --bnum-button-danger-hover-border - Bordure au survol (état danger)
 * @cssvar {var(--bnum-color-danger-hover)} --bnum-button-danger-hover-border-color - Couleur de la bordure au survol (état danger)
 * @cssvar {var(--bnum-color-danger-active)} --bnum-button-danger-active-background-color - Couleur de fond lors du clic (état danger)
 * @cssvar {var(--bnum-text-on-danger-active)} --bnum-button-danger-active-text-color - Couleur du texte lors du clic (état danger)
 * @cssvar {solid thin var(--bnum-button-danger-active-border-color)} --bnum-button-danger-active-border - Bordure lors du clic (état danger)
 * @cssvar {var(--bnum-color-danger-active)} --bnum-button-danger-active-border-color - Couleur de la bordure lors du clic (état danger)
 * @cssvar {0.6} --bnum-button-disabled-opacity - Opacité du bouton désactivé
 * @cssvar {none} --bnum-button-disabled-pointer-events - Gestion des événements souris pour le bouton désactivé
 * @cssvar {flex} --bnum-button-wrapper-display - Type d'affichage du wrapper interne
 * @cssvar {center} --bnum-button-wrapper-align-items - Alignement vertical du contenu du wrapper
 * @cssvar {flex} --bnum-button-icon-display - Type d'affichage de l'icône
 * @cssvar {flex} --bnum-button-loader-display - Type d'affichage du loader
 * @cssvar {0.75s} --bnum-button-spin-duration - Durée de l'animation de spin
 * @cssvar {linear} --bnum-button-spin-timing - Fonction de timing de l'animation de spin
 * @cssvar {infinite} --bnum-button-spin-iteration - Nombre d'itérations de l'animation de spin
 */
export class HTMLBnumButton extends BnumElement {
  //#endregion Component Definition
  //#region Constantes
  /**
   * Attribut pour rendre le bouton arrondi.
   * @attr {boolean | undefined} (optional) rounded - Rend le bouton arrondi
   */
  static readonly ATTR_ROUNDED = 'rounded';
  /**
   * Attribut de chargement du bouton.
   * @attr {boolean | undefined} (optional) loading - Met le bouton en état de chargement et le désactive
   */
  static readonly ATTR_LOADING = 'loading';
  /**
   * Attribut de désactivation du bouton.
   * @attr {boolean | undefined} (optional) disabled - Désactive le bouton
   */
  static readonly ATTR_DISABLED = 'disabled';
  /**
   * Attribut de variation du bouton.
   * @attr {EButtonType | undefined} (optional) (default: EButtonType.PRIMARY) data-variation - Variation du bouton (primary, secondary, etc.)
   */
  static readonly ATTR_VARIATION = 'variation';
  /**
   * Attribut d'icône du bouton.
   * @attr {string | undefined} (optional) data-icon - Icône affichée dans le bouton
   */
  static readonly ATTR_ICON = 'icon';
  /**
   * Attribut de position de l'icône dans le bouton.
   * @attr {EIconPosition | undefined} (optional) (default: EIconPosition.RIGHT) data-icon-pos - Position de l'icône (gauche ou droite)
   */
  static readonly ATTR_ICON_POS = 'icon-pos';
  /**
   * Attribut de marge de l'icône dans le bouton.
   * @attr {string | undefined} (optional) (default: var（--custom-button-icon-margin, 20px）) data-icon-margin - Marge de l'icône (gauche, droite)
   */
  static readonly ATTR_ICON_MARGIN = 'icon-margin';
  /**
   * Attribut de taille de layout pour cacher le texte.
   * @attr {EHideOn | undefined} (optional) data-hide - Taille de layout pour cacher le texte
   */
  static readonly ATTR_HIDE = 'hide';
  /**
   * État du bouton lorsqu'il contient une icône.
   */
  static readonly STATE_ICON = 'icon';
  /**
   * État du bouton lorsqu'il ne contient pas d'icône.
   */
  static readonly STATE_WITHOUT_ICON = 'without-icon';
  /**
   * État du bouton lorsqu'il est arrondi.
   */
  static readonly STATE_ROUNDED = 'rounded';
  /**
   * État du bouton lorsqu'il est en chargement.
   */
  static readonly STATE_LOADING = 'loading';
  /**
   * État du bouton lorsqu'il est désactivé.
   */
  static readonly STATE_DISABLED = 'disabled';
  /**
   * Événement déclenché lors du changement d'icône.
   * @event custom:element-changed.icon
   * @detail ElementChangedEvent
   */
  static readonly EVENT_ICON = 'icon';
  /**
   * Événement déclenché lors du changement de variation du bouton.
   * @event custom:element-changed.variation
   * @detail ElementChangedEvent
   */
  static readonly EVENT_VARIATION = 'variation';
  /**
   * Événement déclenché lors du changement de propriété de l'icône.
   * @event custom:element-changed.icon.prop
   * @detail { type: string, newValue: boolean | string }
   */
  static readonly EVENT_ICON_PROP_CHANGED = 'custom:icon.prop.changed';
  /**
   * Événement déclenché lors du changement d'état de chargement.
   * @event custom:loading
   * @detail { state: boolean }
   */
  static readonly EVENT_LOADING_STATE_CHANGED = 'custom:loading';
  /**
   * Valeur par défaut de la marge de l'icône dans le bouton.
   */
  static readonly DEFAULT_CSS_VAR_ICON_MARGIN =
    'var(--custom-button-icon-margin, 20px)';
  /**
   * Nom de la propriété de l'icône pour la position.
   */
  static readonly ICON_PROP_POS = 'pos';
  /**
   * Classe CSS du wrapper du bouton.
   */
  static readonly CLASS_WRAPPER = 'wrapper';
  /**
   * Classe CSS de l'icône du bouton.
   */
  static readonly CLASS_ICON = 'icon';
  /**
   * Classe CSS du slot du bouton.
   */
  static readonly CLASS_SLOT = 'slot';
  /**
   * Propriété CSS pour la marge de l'icône.
   */
  static readonly CSS_PROPERTY_ICON_MARGIN = '--bnum-button-icon-gap';
  //#endregion Constantes

  //#region Private fields
  /**
   * Internals pour la gestion des états personnalisés.
   * @private
   */
  #_internals: ElementInternals;
  #_wrapper!: HTMLDivElement;
  #_iconEl!: HTMLBnumIcon;
  #_renderScheduler: Nullable<Scheduler<void>> = null;
  //#endregion Private fields
  //#region Public fields
  /**
   * Événement déclenché lors du changement d'état de chargement.
   */
  public onloadingstatechange: JsEvent<(state: boolean) => void> =
    new JsEvent();
  /**
   * Événement déclenché lors du changement d'icône.
   */
  public oniconchange: JsEvent<(newIcon: string, oldIcon: string) => void> =
    new JsEvent();
  /**
   * Événement déclenché lors du changement de propriété de l'icône.
   */
  public oniconpropchange: JsEvent<
    (type: 'margin' | 'pos', newValue: string) => void
  > = new JsEvent();
  /**
   * Événement déclenché lors du changement de variation du bouton.
   */
  public onvariationchange: JsEvent<
    (newVariation: ButtonVariation, oldVariation: ButtonVariation) => void
  > = new JsEvent();
  //#endregion Public fields
  //#region Getter/setter
  /**
   * Variation du bouton (primary, secondary, etc.).
   */
  get variation(): EButtonType {
    return (
      (this.data(HTMLBnumButton.ATTR_VARIATION) as EButtonType) ||
      EButtonType.PRIMARY
    );
  }
  set variation(value: EButtonType) {
    if (Object.values(EButtonType).includes(value)) {
      const fromAttribute = false;
      this.data(HTMLBnumButton.ATTR_VARIATION, value, fromAttribute);

      if (this.alreadyLoaded) {
        this.onvariationchange.call(value, this.variation);
        this.#_requestUpdateDOM();
      }
    }
  }

  /**
   * Icône affichée dans le bouton.
   */
  get icon(): string | null {
    return (this.data(HTMLBnumButton.ATTR_ICON) as string) || null;
  }
  set icon(value: string | null) {
    if (this.alreadyLoaded)
      this.oniconchange.call(value || EMPTY_STRING, this.icon || EMPTY_STRING);

    if (typeof value === 'string' && /^[\w-]+$/.test(value)) {
      const fromAttribute = false;
      this.data(HTMLBnumButton.ATTR_ICON, value, fromAttribute);
    } else {
      this.data(HTMLBnumButton.ATTR_ICON, null);
    }

    if (this.alreadyLoaded) this.#_requestUpdateDOM();
  }

  /**
   * Position de l'icône (gauche ou droite).
   */
  get iconPos(): EIconPosition {
    return (
      (this.data(HTMLBnumButton.ATTR_ICON_POS) as EIconPosition) ||
      EIconPosition
    );
  }
  set iconPos(value: EIconPosition) {
    if (this.alreadyLoaded)
      this.oniconpropchange.call(HTMLBnumButton.ICON_PROP_POS, value);

    if (Object.values(EIconPosition).includes(value)) {
      const fromAttribute = false;
      this.data(HTMLBnumButton.ATTR_ICON_POS, value, fromAttribute);
    }

    if (this.alreadyLoaded) this.#_requestUpdateDOM();
  }

  /**
   * Marge appliquée à l'icône.
   */
  get iconMargin(): string {
    return (
      (this.data(HTMLBnumButton.ATTR_ICON_MARGIN) as string) ||
      HTMLBnumButton.DEFAULT_CSS_VAR_ICON_MARGIN
    );
  }
  set iconMargin(value: string | null) {
    if (this.alreadyLoaded)
      this.oniconpropchange.call('margin', value || EMPTY_STRING);

    if (typeof value === 'string' && REG_XSS_SAFE.test(value)) {
      const fromAttribute = false;
      this.data(HTMLBnumButton.ATTR_ICON_MARGIN, value, fromAttribute);
      this.style.setProperty(HTMLBnumButton.CSS_PROPERTY_ICON_MARGIN, value);
    } else if (value === null) {
      this.data(HTMLBnumButton.ATTR_ICON_MARGIN, value);
      this.style.removeProperty(HTMLBnumButton.CSS_PROPERTY_ICON_MARGIN);
    }
  }

  /**
   * Taille de layout sur laquelle le texte doit être caché.
   */
  get hideTextOnLayoutSize(): EHideOn | null {
    const data = this.data<EHideOn | null | undefined>(
      HTMLBnumButton.ATTR_HIDE,
    );

    if ([...Object.values(EHideOn), null, undefined].includes(data))
      return data as EHideOn;
    return null;
  }
  //#endregion Getter/setter
  //#region Lifecycle
  /**
   * Constructeur du bouton Bnum.
   */
  constructor() {
    super();
    this.#_internals = this.attachInternals();

    this.oniconchange.push((n, o) => {
      this.dispatchEvent(
        new ElementChangedEvent(HTMLBnumButton.EVENT_ICON, n, o, this),
      );
    });

    this.onvariationchange.push((n, o) => {
      this.dispatchEvent(
        new ElementChangedEvent(HTMLBnumButton.EVENT_VARIATION, n, o, this),
      );
    });

    this.oniconpropchange.push((type, newValue) => {
      this.dispatchEvent(
        new CustomEvent(HTMLBnumButton.EVENT_ICON_PROP_CHANGED, {
          detail: { type, newValue },
        }),
      );
    });

    this.onloadingstatechange.push((state) => {
      this.dispatchEvent(
        new CustomEvent(HTMLBnumButton.EVENT_LOADING_STATE_CHANGED, {
          detail: { state },
        }),
      );
    });
  }

  /**
   * Template HTML du composant bouton.
   * @returns Template utiliser pour le composant
   */
  protected _p_fromTemplate(): HTMLTemplateElement | null {
    return TEMPLATE;
  }

  /**
   * Construit le DOM du composant bouton.
   * @param container - Le conteneur du Shadow DOM.
   */
  protected _p_buildDOM(container: ShadowRoot): void {
    this.#_wrapper = container.querySelector(
      `.${HTMLBnumButton.CLASS_WRAPPER}`,
    )!;
    this.#_iconEl = container.querySelector(
      `.${HTMLBnumButton.CLASS_ICON}`,
    )! as HTMLBnumIcon;

    if (this.data(HTMLBnumButton.ATTR_ICON_MARGIN)) {
      this.style.setProperty(
        HTMLBnumButton.CSS_PROPERTY_ICON_MARGIN,
        this.data(HTMLBnumButton.ATTR_ICON_MARGIN),
      );
    }

    this.#_updateDOM();
  }

  protected _p_update(
    name?: string,
    oldVal?: string | null,
    newVal?: string | null,
  ): void {
    if (!this.#_wrapper) return;

    this.#_updateDOM();
  }

  /**
   * @inheritdoc
   */
  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [SHEET];
  }
  //#endregion Lifecycle

  //#region Private methods
  /**
   * Demande une mise à jour du DOM du bouton.
   */
  #_requestUpdateDOM(): void {
    this.#_renderScheduler ??= new Scheduler<void>(() => {
      this.#_updateDOM();
    });
    this.#_renderScheduler.schedule();
  }

  /**
   * Met à jour le DOM du bouton (icône, états, etc.).
   * @private
   */
  #_updateDOM(): void {
    const isLoading = this.#_isLoading();
    const isDisabled = this.#_isDisabled();

    // Reset des états
    this.#_internals.states.clear();

    // États globaux
    this.#_internals.states.add(this.variation);
    if (this.#_isRounded())
      this.#_internals.states.add(HTMLBnumButton.STATE_ROUNDED);
    if (isLoading) this.#_internals.states.add(HTMLBnumButton.STATE_LOADING);
    if (isDisabled || isLoading)
      this.#_internals.states.add(HTMLBnumButton.STATE_DISABLED);

    // Gestion de l'icône
    const effectiveIcon = isLoading ? ICON_LOADER : this.icon;

    if (effectiveIcon) {
      this.#_internals.states.add(HTMLBnumButton.STATE_ICON);

      // L'état CSS "icon-pos-left" déclenchera le "flex-direction: row-reverse"
      this.#_internals.states.add(`icon-pos-${this.iconPos}`);

      if (this.hideTextOnLayoutSize) {
        this.#_internals.states.add(
          `hide-text-on-${this.hideTextOnLayoutSize}`,
        );
      }

      // Mise à jour du composant icône enfant
      if (this.#_iconEl.icon !== effectiveIcon)
        this.#_iconEl.icon = effectiveIcon;
      this.#_iconEl.hidden = false;
    } else {
      this.#_internals.states.add(HTMLBnumButton.STATE_WITHOUT_ICON);
      this.#_iconEl.hidden = true;
    }

    // Accessibilité (Internals gère aria-disabled, mais tabindex doit être géré ici)
    this.#_internals.ariaDisabled = String(isDisabled || isLoading);
    this.tabIndex = isDisabled || isLoading ? -1 : 0;
  }

  /**
   * Indique si le bouton est arrondi.
   * @private
   */
  #_isRounded(): boolean {
    return this.#_is(HTMLBnumButton.ATTR_ROUNDED);
  }
  /**
   * Indique si le bouton est en état de chargement.
   * @private
   */
  #_isLoading(): boolean {
    return this.#_is(HTMLBnumButton.ATTR_LOADING);
  }
  /**
   * Indique si le bouton est désactivé.
   * @private
   */
  #_isDisabled(): boolean {
    return this.#_is(HTMLBnumButton.ATTR_DISABLED);
  }

  /**
   * Vérifie la présence d'un attribut et sa valeur.
   * @private
   * @param attr Nom de l'attribut à vérifier
   * @returns true si l'attribut est présent et sa valeur est valide
   */
  #_is(attr: string): boolean {
    return (
      this.hasAttribute(attr) &&
      !['false', false].includes(this.getAttribute(attr) as any)
    );
  }
  //#endregion Private methods
  //#region Public methods
  /**
   * Met le bouton en état de chargement.
   * @returns L'instance du bouton
   */
  setLoading(): this {
    return this.attr(HTMLBnumButton.ATTR_LOADING, true);
  }
  /**
   * Arrête l'état de chargement du bouton.
   * @returns L'instance du bouton
   */
  stopLoading(): this {
    this.removeAttribute(HTMLBnumButton.ATTR_LOADING);
    return this;
  }

  /**
   * Bascule l'état de chargement du bouton.
   * @returns L'instance du bouton
   */
  toggleLoading(): this {
    if (this.#_isLoading()) {
      this.stopLoading();
    } else {
      this.setLoading();
    }
    return this;
  }
  //#endregion Public methods
  //#region Static methods
  /**
   * Retourne la liste des attributs observés par le composant.
   */
  static _p_observedAttributes(): string[] {
    return [
      HTMLBnumButton.ATTR_ROUNDED,
      HTMLBnumButton.ATTR_LOADING,
      HTMLBnumButton.ATTR_DISABLED,
    ];
  }

  /**
   * Transforme un élément en bouton accessible (role, tabindex, etc.).
   * @static
   * @param element Élément HTML à transformer
   * @returns L'élément modifié
   */
  static ToButton<T extends HTMLElement>(element: T): T {
    if (!element.onkeydown) {
      element.onkeydown = (e: KeyboardEvent) => {
        if (
          (e.key === ' ' || e.key === 'Enter') &&
          e.target instanceof HTMLElement
        ) {
          e.target.click();
        }
      };
      element.setAttribute('data-set-event', 'onkeydown');
    }

    if (
      !element.hasAttribute('role') ||
      element.getAttribute('role') !== 'button'
    )
      element.setAttribute('role', 'button');
    if (!element.hasAttribute('tabindex'))
      element.setAttribute('tabindex', '0');
    return element;
  }

  /**
   * Crée un bouton Bnum avec les options spécifiées.
   * @static
   * @param buttonClass Classe du bouton à instancier
   * @param options Options de configuration du bouton
   * @returns Instance du bouton créé
   */
  static _p_Create<T extends HTMLBnumButton>(
    buttonClass: { TAG: string },
    {
      text = EMPTY_STRING,
      icon = null,
      iconPos = EIconPosition.RIGHT,
      iconMargin = null,
      variation = null,
      rounded = false,
      loading = false,
      hideOn = null,
    }: {
      text?: string;
      icon?: string | null;
      iconPos?: EIconPosition;
      iconMargin?: string | null | 0;
      variation?: EButtonType | null;
      rounded?: boolean;
      loading?: boolean;
      hideOn?: Nullable<EHideOn>;
    } = {},
  ): T {
    const node = document.createElement(buttonClass.TAG) as unknown as T;
    node.textContent = text;

    if (rounded) node.setAttribute(HTMLBnumButton.ATTR_ROUNDED, 'true');
    if (iconMargin === 0) iconMargin = '0px';
    if (icon) node.setAttribute(`data-${HTMLBnumButton.ATTR_ICON}`, icon);
    if (iconPos)
      node.setAttribute(`data-${HTMLBnumButton.ATTR_ICON_POS}`, iconPos);
    if (iconMargin)
      node.setAttribute(`data-${HTMLBnumButton.ATTR_ICON_MARGIN}`, iconMargin);
    if (variation)
      node.setAttribute(`data-${HTMLBnumButton.ATTR_VARIATION}`, variation);
    if (loading) node.setAttribute(HTMLBnumButton.ATTR_LOADING, 'true');
    if (hideOn) node.setAttribute(`data-${HTMLBnumButton.ATTR_HIDE}`, hideOn);

    return node;
  }

  /**
   * Crée un bouton Bnum standard.
   * @static
   * @param options Options de configuration du bouton
   * @returns Instance du bouton créé
   */
  static Create(
    options: {
      text?: string;
      icon?: string | null;
      iconPos?: EIconPosition;
      iconMargin?: string | null;
      variation?: EButtonType | null;
      rounded?: boolean;
      loading?: boolean;
      hideOn?: EHideOn;
    } = {},
  ): HTMLBnumButton {
    return this._p_Create(this, options);
  }

  /**
   * Crée un bouton Bnum ne contenant qu'une icône.
   * @static
   * @param icon Nom de l'icône à afficher
   * @param options Options de configuration du bouton
   * @returns Instance du bouton créé
   */
  static CreateOnlyIcon(
    icon: string,
    {
      variation = EButtonType.PRIMARY,
      rounded = false,
      loading = false,
    }: {
      variation?: EButtonType | null;
      rounded?: boolean;
      loading?: boolean;
    } = {},
  ): HTMLBnumButton {
    return this.Create({
      icon,
      variation,
      rounded,
      loading,
      iconMargin: '0px',
    });
  }

  /**
   * Tag HTML du composant bouton.
   * @static
   * @returns Nom du tag HTML
   */
  static get TAG(): string {
    return TAG;
  }
  //#endregion Static methods
}

//#region Template
/**
 * Template HTML du composant bouton.
 */
const TEMPLATE = BnumElement.CreateTemplate(`
  <div class="${HTMLBnumButton.CLASS_WRAPPER}">
    <span class="${HTMLBnumButton.CLASS_SLOT}">
      <slot></slot>
    </span>
    <${HTMLBnumIcon.TAG} hidden="true" class="${HTMLBnumButton.CLASS_ICON}"></${HTMLBnumIcon.TAG}>
  </div>
  `);
//#endregion Template

//#region TryDefine
HTMLBnumButton.TryDefine();
//#endregion TryDefine
