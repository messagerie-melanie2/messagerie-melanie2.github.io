import { HTMLBnumButton } from '../button/bnum-button';
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
export declare class HTMLBnumPrimaryButton extends HTMLBnumButton {
    constructor();
    static get TAG(): string;
}
