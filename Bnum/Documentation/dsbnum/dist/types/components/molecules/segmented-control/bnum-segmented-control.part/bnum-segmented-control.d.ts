import { HTMLBnumSegmentedItem } from '../bnum-segmented-item.part';
import BnumElementInternal from '../../../bnum-element-states';
import { Nullable } from '../../../../core/utils/types';
/**
 * Élément de contrôle segmenté (groupe de boutons radio).
 *
 * @structure Sans icône
 * <bnum-segmented-control>
 *   Légende du contrôle
 *  <bnum-segmented-item slot="items" value="option1">Option 1</bnum-segmented-item>
 *  <bnum-segmented-item slot="items" value="option2">Option 2</bnum-segmented-item>
 * </bnum-segmented-control>
 *
 * @structure Avec icône
 * <bnum-segmented-control>
 *   Légende du contrôle
 *  <bnum-segmented-item slot="items" data-icon="add" value="option1">Option 1</bnum-segmented-item>
 *  <bnum-segmented-item slot="items" data-icon="remove" value="option2">Option 2</bnum-segmented-item>
 * </bnum-segmented-control>
 *
 * @structure Avec 3 segments
 * <bnum-segmented-control>
 *   Légende du contrôle
 *  <bnum-segmented-item slot="items" data-icon="view_agenda" value="option1">Option 1</bnum-segmented-item>
 *  <bnum-segmented-item slot="items" data-icon="view_array" value="option2">Option 2</bnum-segmented-item>
 *  <bnum-segmented-item slot="items" data-icon="view_carousel" value="option3">Option 3</bnum-segmented-item>
 * </bnum-segmented-control>
 *
 * @description
 * Composant permettant de présenter plusieurs options mutuellement exclusives
 * sous la forme d'un groupe de contrôles segmentés.
 *
 * @remarks
 * - Respecte le pattern WAI-ARIA "Radio Group"
 * - Support complet de la navigation au clavier (flèches, boucle cyclique)
 * - Support de la directionnalité RTL (arabe, hébreu, etc.)
 * - La sélection suit le focus pour l'accessibilité
 *
 * @example
 * ```html
 * <bnum-segmented-control>
 *    Choisir une option
 *    <bnum-segmented-item slot="items" selected value="opt1">Option 1</bnum-segmented-item>
 *    <bnum-segmented-item slot="items" value="opt2">Option 2</bnum-segmented-item>
 * </bnum-segmented-control>
 * ```
 *
 * @example
 * ```typescript
 * const control = HTMLBnumSegmentedControl.Create('Ma légende');
 * control.addEventListener('bnum-segmented-control:change', (e) => {
 *   console.log('Valeur sélectionnée:', e.detail.value);
 * });
 * ```
 *
 * @fires {CustomEvent} bnum-segmented-control:change - Émis lors de la sélection d'un item. Détail : `{value: string, item: HTMLBnumSegmentedItem, caller: HTMLBnumSegmentedControl}`
 * @fires {CustomEvent} bnum-segmented-control:error - Émis en cas d'erreur interne. Détail : `{error: Error, caller: HTMLBnumSegmentedControl}`
 *
 * @see {@link HTMLBnumSegmentedItem}
 */
export declare class HTMLBnumSegmentedControl extends BnumElementInternal {
    #private;
    /**
     * Récupère l'élément actuellement sélectionné dans le contrôle.
     *
     * @remarks
     * Retourne `null` si aucun élément n'est sélectionné.
     *
     * @readonly
     * @returns {Nullable<HTMLBnumSegmentedItem>} L'item sélectionné ou null.
     */
    get selected(): Nullable<HTMLBnumSegmentedItem>;
    /**
     * Récupère la valeur de l'élément actuellement sélectionné.
     *
     * @remarks
     * La valeur provient de l'attribut `value` de l'item sélectionné.
     * Retourne `null` si aucun élément n'est sélectionné.
     *
     * @readonly
     * @returns {Nullable<string>} La valeur de l'item sélectionné ou null.
     *
     * @example
     * ```typescript
     * const control = document.querySelector('bnum-segmented-control');
     * console.log(control.currentValue); // "option1"
     * ```
     */
    get currentValue(): Nullable<string>;
    constructor();
    /**
     * Initialise le DOM et configure le composant.
     *
     * @remarks
     * Définit l'attribut `role="radiogroup"` et initialise :
     * - L'affichage/masquage de la légende
     * - Les écouteurs d'événements clavier
     * - Les écouteurs de sélection d'items
     *
     * @protected
     * @decorator `@SetAttr('role', 'radiogroup')`
     */
    protected _p_buildDOM(): void;
    /**
     * Crée un nouveau contrôle segmenté avec une légende.
     *
     * @remarks
     * Fabrique statique pour créer rapidement un contrôle segmenté vide.
     * Les items doivent être ajoutés manuellement après la création.
     *
     * @static
     * @param legend - La légende du contrôle segmenté.
     * @returns L'élément de contrôle segmenté créé.
     *
     * @example
     * ```typescript
     * const control = HTMLBnumSegmentedControl.Create('Choisir une option');
     * document.body.appendChild(control);
     * ```
     */
    static Create(legend: string): HTMLBnumSegmentedControl;
    /**
     * Récupère l'énumération des événements du composant.
     *
     * @remarks
     * Contient les noms des événements personnalisés émis par le composant.
     * Utiliser ces constantes plutôt que des chaînes de caractères brutes
     * pour éviter les erreurs typographiques.
     *
     * @example
     * ```typescript
     * const control = document.querySelector('bnum-segmented-control');
     *
     * // Bonne pratique : utiliser Events
     * control.addEventListener(
     *   HTMLBnumSegmentedControl.Events.CHANGE,
     *   (e) => console.log('Changement:', e.detail)
     * );
     *
     * // À éviter : chaîne brute
     * control.addEventListener('bnum-segmented-control:change', (e) => {});
     * ```
     */
    static get Events(): {
        readonly CHANGE: "bnum-segmented-control:change";
        readonly ERROR: "bnum-segmented-control:error";
    };
}
