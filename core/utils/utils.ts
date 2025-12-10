import BnumElement from '../../components/bnum-element';
import { HTMLBnumButton } from '../../components/atoms/button/bnum-button';

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
function setButtonRole(element: BnumElement): BnumElement {
  return HTMLBnumButton.ToButton(element);
}

/**
 * Supprime le rôle du bouton et les attributs associés de l'élément donné.
 * @param element Élément Bnum à modifier.
 * @returns L'élément Bnum modifié sans rôle de bouton.
 */
function removeButtonRole(element: BnumElement): BnumElement {
  if (element.getAttribute('data-set-event') === 'onkeydown') {
    element.removeAttribute('data-set-event');
    element.onkeydown = null;
  }

  element.removeAttribute('role');
  element.removeAttribute('tabindex');

  return element;
}
