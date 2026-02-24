import BnumElement from '../../components/bnum-element';
/**
 * Définit le rôle du bouton sur l'élément donné.
 * @param element Élément Bnum à modifier.
 * @returns L'élément Bnum modifié en bouton.
 */
export { setButtonRole, removeButtonRole };
/**
 * Définit le rôle du bouton sur l'élément donné.
 * @param element Élément Bnum à modifier.
 * @returns L'élément Bnum modifié en bouton.
 */
declare function setButtonRole(element: BnumElement): BnumElement;
/**
 * Supprime le rôle du bouton et les attributs associés de l'élément donné.
 * @param element Élément Bnum à modifier.
 * @returns L'élément Bnum modifié sans rôle de bouton.
 */
declare function removeButtonRole(element: BnumElement): BnumElement;
