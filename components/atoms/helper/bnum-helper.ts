// bnum-helper.ts

import { EMPTY_STRING } from '@rotomeca/utils';
import BnumElement from '../../bnum-element';
import { HTMLBnumIcon } from '../icon/bnum-icon';
import helperStyle from './bnum-helper.less';
import { TAG_HELPER } from '../../../core/utils/constants/tags';

const SHEET = BnumElement.ConstructCSSStyleSheet(helperStyle);

/**
 * Constante représentant l'icône utilisée par défaut.
 */
const ICON = 'help' as const;

/**
 * Élément web personnalisé représentant une aide contextuelle avec une icône.
 *
 * @structure Cas standard
 * <bnum-helper>Ceci est une aide contextuelle.</bnum-helper>
 */
export default class HTMLBnumHelper extends BnumElement {
  /**
   * Constructeur de l'élément HTMLBnumHelper.
   * Initialise l'élément.
   */
  constructor() {
    super();
  }

  /**
   * Précharge les données de l'élément.
   * Si l'élément possède des enfants, le texte est déplacé dans l'attribut title et le contenu est vidé.
   */
  protected _p_preload(): void {
    super._p_preload();
    setTimeout(() => {
      if (this.hasChildNodes()) {
        this.setAttribute('title', this.textContent ?? EMPTY_STRING);
        this.textContent = EMPTY_STRING;
      }
    }, 0);
  }

  /**
   * Construit le DOM interne de l'élément.
   * Ajoute l'icône d'aide dans le conteneur.
   * @param container Racine du shadow DOM ou élément HTML.
   */
  protected _p_buildDOM(container: ShadowRoot | HTMLElement): void {
    super._p_buildDOM(container);

    container.appendChild(HTMLBnumIcon.Create(ICON));
  }

  /**
   * @inheritdoc
   */
  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [SHEET];
  }

  /**
   * Crée une nouvelle instance de HTMLBnumHelper avec le texte d'aide spécifié.
   * @param title Texte d'aide à afficher dans l'attribut title.
   * @returns {HTMLBnumHelper} Instance du composant.
   */
  static Create(title: string): HTMLBnumHelper {
    const element = document.createElement(
      HTMLBnumHelper.TAG,
    ) as HTMLBnumHelper;
    element.setAttribute('title', title);
    return element;
  }

  /**
   * Tag HTML du composant.
   * @readonly
   * @returns {string} Tag HTML utilisé pour ce composant.
   */
  static get TAG(): string {
    return TAG_HELPER;
  }
}

HTMLBnumHelper.TryDefine();
