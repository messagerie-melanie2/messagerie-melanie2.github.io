import { HTMLBnumButton } from '../button/bnum-button';
/**
 * Bouton Bnum de type "Secondary".
 *
 * @structure Cas standard
 * <bnum-secondary-button>Texte du bouton</bnum-secondary-button>
 *
 * @structure Bouton avec icône
 * <bnum-secondary-button data-icon="home">Texte du bouton</bnum-secondary-button>
 *
 * @structure Bouton avec une icône à gauche
 * <bnum-secondary-button data-icon="home" data-icon-pos="left">Texte du bouton</bnum-secondary-button>
 *
 * @structure Bouton en état de chargement
 * <bnum-secondary-button loading>Texte du bouton</bnum-secondary-button>
 *
 * @structure Bouton arrondi
 * <bnum-secondary-button rounded>Texte du bouton</bnum-secondary-button>
 *
 * @structure Bouton cachant le texte sur les petits layouts
 * <bnum-secondary-button data-hide="small" data-icon="menu">Menu</bnum-secondary-button>
 */
export declare class HTMLBnumSecondaryButton extends HTMLBnumButton {
    constructor();
    static get TAG(): string;
}
