import { HTMLBnumButton } from '../button/bnum-button';
/**
 * Bouton Bnum de type "Danger".
 *
 * @structure Cas standard
 * <bnum-danger-button>Texte du bouton</bnum-danger-button>
 *
 * @structure Bouton avec icône
 * <bnum-danger-button data-icon="home">Texte du bouton</bnum-danger-button>
 *
 * @structure Bouton avec une icône à gauche
 * <bnum-danger-button data-icon="home" data-icon-pos="left">Texte du bouton</bnum-danger-button>
 *
 * @structure Bouton en état de chargement
 * <bnum-danger-button loading>Texte du bouton</bnum-danger-button>
 *
 * @structure Bouton arrondi
 * <bnum-danger-button rounded>Texte du bouton</bnum-danger-button>
 *
 * @structure Bouton cachant le texte sur les petits layouts
 * <bnum-danger-button data-hide="small" data-icon="menu">Menu</bnum-danger-button>
 */
export declare class HTMLBnumDangerButton extends HTMLBnumButton {
    constructor();
    static get TAG(): string;
}
