import { TAG_PRIMARY } from '../../../core/utils/constants/tags';
import { EButtonType, HTMLBnumButton } from '../button/bnum-button';

/**
 * Bouton Bnum de type "Primary".
 *
 * @structure Cas standard
 * <bnum-primary-button>Texte du bouton</bnum-primary-button>
 *
 * @structure Bouton avec icône
 * <bnum-primary-button data-icon="home">Texte du bouton</bnum-primary-button>
 *
 * @structure Bouton avec une icône à gauche
 * <bnum-primary-button data-icon="home" data-icon-pos="left">Texte du bouton</bnum-primary-button>
 *
 * @structure Bouton en état de chargement
 * <bnum-primary-button loading>Texte du bouton</bnum-primary-button>
 *
 * @structure Bouton arrondi
 * <bnum-primary-button rounded>Texte du bouton</bnum-primary-button>
 *
 * @structure Bouton cachant le texte sur les petits layouts
 * <bnum-primary-button data-hide="small" data-icon="menu">Menu</bnum-primary-button>
 */
export class HTMLBnumPrimaryButton extends HTMLBnumButton {
  constructor() {
    super();
    const fromAttribute = false;
    this.data(
      HTMLBnumButton.ATTR_VARIATION,
      EButtonType.PRIMARY,
      fromAttribute,
    );
  }
  static get TAG(): string {
    return TAG_PRIMARY;
  }
}

HTMLBnumPrimaryButton.TryDefine();
