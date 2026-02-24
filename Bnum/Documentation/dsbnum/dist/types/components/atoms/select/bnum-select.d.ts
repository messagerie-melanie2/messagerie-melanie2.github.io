import BnumElementInternal from 'components/bnum-element-states';
import { Nullable } from 'core/utils/types';
/**
 * Interface pour la récupération des données Ui de `HTMLBnumSelect`
 */
export interface BnumSelectUi {
    /**
     * slot du label
     */
    slotLabel: HTMLSlotElement;
    /**
     * slot de l'indice
     */
    slotHint: HTMLSlotElement;
    /**
     * select interne
     */
    select: HTMLSelectElement;
}
type Value = string | number | boolean;
/**
 * Item qui sert à la création d'une option pour {@link HTMLBnumSelect.addOption}
 */
export type BnumSelectAddOptionObject = {
    /**
     * Valeur de l'option dans l'attribut `value`
     */
    value: Nullable<Value>;
    /**
     * Texte de l'option. Si {@link BnumSelectAddOptionObject.value} est null ou pas défini, ça sera la valeur de l'option.
     */
    text: string;
    /**
     * Si vrai, l'option sera ajouté avant les autres options.
     */
    prepend?: boolean;
};
/**
 * @structure Defaut
 * <bnum-select>
 *   <span slot="label">Un select</span>
 *   <option value="none" selected disabled>Choisissez une option</option>
 *   <option value="a">a</option>
 *   <option value="b">b</option>
 * </bnum-select>
 *
 * @structure Avec des optgroup
 * <bnum-select>
 *   <span slot="label">Un select</span>
 *   <optgroup label="yolo">
 *   <option value="none" selected disabled>Choisissez une option</option>
 *   <option value="a">a</option>
 *   <option value="b">b</option>
 *   </optgroup>
 *   <optgroup label="swag">
 *   <option value="c">c</option>
 *   <option value="d">d</option>
 *   <option value="e">e</option>
 *   </optgroup>
 * </bnum-select>
 *
 * @structure Avec des data
 * <bnum-select data-legend="Legende data" data-hint="Indice !" data-default-value="none" data-default-text="Choisissez un option">
 * <option value="a">a</option>
 * <option value="b">b</option>
 * </bnum-select>
 *
 * @structure Sans légendes
 * <bnum-select no-legend data-legend="Legende data" data-hint="Indice !" data-default-value="none" data-default-text="Choisissez un option">
 * <option value="a">a</option>
 * <option value="b">b</option>
 * </bnum-select>
 *
 * @slot label - Légende du select
 * @slot hint - Légende additionnel
 *
 * @attr {undefined | boolean} (optional) no-legend - Cache visuellement la légende. (Ne dispence pas d'en mettre une.)
 * @attr {undefined | string} (optional) name - Nom de l'élément
 * @attr {undefined | string} (optional) data-legend - Texte de la légende. Est écrasé si le slot est défini.
 * @attr {undefined | string} (optional) data-hint - Texte additionnel de la légende. Est écrasé si le slot est défini.
 * @attr {undefined | string} (optional) data-default-value - Génère une option par défaut avec cette valeur.
 * @attr {undefined | string} (optional) data-default-text - Génère une option par défaut avec ce texte.
 *
 * @event {CustomEvent<{innerEvent: Event, caller: HTMLBnumSelect}>} change - Lorsque le select change de valeur.
 */
export declare class HTMLBnumSelect extends BnumElementInternal {
    #private;
    /**
     * Required to participate in HTMLFormElement
     */
    static readonly formAssociated = true;
    /**
     * Nom de l'input
     */
    accessor name: string;
    /**
     * Si l'attribut `no-legend` est actif, la légende ne s'affichera pas (seulement pour les lecteurs d'écrans).
     */
    accessor noLegend: boolean;
    /**
     * Valeur du select
     */
    get value(): string;
    set value(value: string);
    /**
     * Tout les options disponibles
     */
    get options(): ReadonlyArray<HTMLOptionElement>;
    /**
     * Select dans le shadow-root
     */
    get select(): HTMLSelectElement;
    constructor();
    /**
     * Callback appelée lorsque le composant est ajouté au DOM.
     *
     * Déclenche le rendu du composant.
     *
     * @override Pour pouvoir ajouter un observer et observer le light-dom.
     */
    connectedCallback(): void;
    /**
     * On attache un shadow-dom custom pour pouvoir déléger le focus.
     * @returns ShadowRoot ouvert avec le focus délégué.
     */
    protected _p_attachCustomShadow(): Nullable<ShadowRoot>;
    /**
     * @inheritdoc
     */
    protected _p_preload(): void;
    /**
     * @inheritdoc
     */
    protected _p_buildDOM(): void;
    /**
     * @inheritdoc
     */
    protected _p_attach(): void;
    /**
     * @inheritdoc
     */
    protected _p_detach(): void;
    /**
     * @inheritdoc
     */
    protected _p_update(): void | Nullable<'break'>;
    /**
     * Ajoute un groupe d'option
     * @param group Groupe à ajouter
     * @returns Le groupe ajouté au shadow-dom
     */
    addOptGroup(group: HTMLOptGroupElement): HTMLOptGroupElement;
    /**
     * Ajoute une option dans le select
     * @param option Element html à ajouter
     * @param param1 Paramètres optionnels
     * @returns Chaîne
     */
    addOption(option: HTMLOptionElement, { prepend }?: {
        prepend?: boolean;
    }): this;
    /**
     * Ajoute une option dans le select à partir d'un objet
     * @param item option à ajouter à partir d'un objet js.
     * @returns Option créée
     */
    addOption(item: BnumSelectAddOptionObject): HTMLOptionElement;
    /**
     * Réinitialise la valeur du champ lors d'une remise à zéro du formulaire parent.
     */
    formResetCallback(): void;
    /**
     * Active ou désactive le champ selon l'état du fieldset parent.
     */
    formDisabledCallback(disabled: boolean): void;
    /**
     * Méthode interne pour définir les attributs observés.
     * @returns Attributs à observer
     * @deprecated Utilisez le décorateur {@link Observe} du commit 3e38db0162eef596874dbe32490d9e96b09fb1c0
     * @see [feat(composants): ✨ Ajout d'un décorateur pour réduire le boilerplate des attibuts à observer](https://github.com/messagerie-melanie2/design-system-bnum/commit/3e38db0162eef596874dbe32490d9e96b09fb1c0)
     */
    protected static _p_observedAttributes(): string[];
}
export {};
