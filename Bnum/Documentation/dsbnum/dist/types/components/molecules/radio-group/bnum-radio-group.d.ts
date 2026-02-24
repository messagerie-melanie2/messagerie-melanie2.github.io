import { HTMLBnumRadio } from 'components/atoms';
import BnumElementInternal from 'components/bnum-element-states';
import { Nullable } from 'core/utils/types';
type BnumRadioGroupEvents = {
    [EVENT_CHANGE]: typeof EVENT_CHANGE;
};
declare const EVENT_CHANGE = "change";
/**
 * Composant `bnum-radio-group`
 *
 * Ce composant représente un groupe de boutons radio. Il gère la sélection unique parmi ses enfants `bnum-radio`,
 * la navigation au clavier, et l'accessibilité (via `role="radiogroup"`).
 *
 * @structure Structure de base
 * <bnum-radio-group id="groupe1" name="choix" data-label="Faites un choix" data-hint="Indice !">
 *   <bnum-radio value="1">Choix 1</bnum-radio>
 *   <bnum-radio value="2">Choix 2</bnum-radio>
 * </bnum-radio-group>
 *
 * @structure Structure en ligne (inline)
 * <bnum-radio-group id="groupe2" name="inline" data-inline="true" data-label="Choix en ligne">
 *   <bnum-radio value="A">Choix A</bnum-radio>
 *   <bnum-radio value="B">Choix B</bnum-radio>
 * </bnum-radio-group>
 *
 * @slot legend - Description du groupe
 * @slot hint - Indice ou aide pour le groupe
 * @slot (default) - Boutons radio
 *
 * @state inline - Indique si le groupe doit afficher ses options en ligne
 *
 * @attr {string} name - Le nom du groupe de boutons radio. Cet attribut est appliqué à tous les boutons radio enfants pour assurer qu'ils appartiennent au même groupe logique.
 * @attr {string} data-label - Le libellé du groupe.
 * @attr {string} data-hint - L'indice ou l'aide pour le groupe.
 *
 * @event {CustomEvent<{inner:BnumRadioCheckedChangeEvent, caller: HTMLBnumRadioGroup}>} change - Lorsque la valeur change
 *
 * @cssvar {15px} --bnum-radio-group-gap - Espacement entre les boutons radio
 * @cssvar {#666} --bnum-input-hint-text-color - Couleur du texte d'indice ou d'aide
 */
export declare class HTMLBnumRadioGroup extends BnumElementInternal {
    #private;
    /**
     * Le nom du groupe de boutons radio.
     * Cet attribut est appliqué à tous les boutons radio enfants pour assurer qu'ils appartiennent au même groupe logique.
     */
    accessor name: string;
    /**
     * Indique si le groupe doit afficher ses options en ligne (horizontalement).
     *
     * @returns {boolean} `true` si le mode inline est activé, sinon `false`.
     */
    get inline(): boolean;
    /**
     * Définit si le groupe doit afficher ses options en ligne.
     *
     * @param {boolean} value - La nouvelle valeur pour le mode inline.
     */
    set inline(value: boolean);
    /**
     * Récupère la liste de tous les éléments `bnum-radio` enfants directs du groupe.
     *
     * @returns {HTMLBnumRadio[]} Un tableau contenant les éléments `HTMLBnumRadio`.
     */
    get radios(): HTMLBnumRadio[];
    constructor();
    /**
     * Appelée lorsque le composant est inséré dans le DOM.
     * Initialise l'observateur de mutations pour détecter l'ajout ou la suppression de boutons radio.
     */
    connectedCallback(): void;
    /**
     * Méthode protégée pour construire le DOM initial.
     * @protected
     */
    protected _p_buildDOM(): void;
    /**
     * Méthode protégée appelée lorsqu'un attribut observé change.
     *
     * @param {string} name - Le nom de l'attribut modifié.
     * @param {string | null} oldVal - L'ancienne valeur de l'attribut.
     * @param {string | null} newVal - La nouvelle valeur de l'attribut.
     * @returns {void | Nullable<'break'>}
     * @protected
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void | Nullable<'break'>;
    /**
     * Appelée lorsque le composant est retiré du DOM.
     * Nettoie l'observateur de mutations.
     * @protected
     */
    protected _p_detach(): void;
    /**
     * Liste des attributs observés par le composant.
     * @returns {string[]} Liste des noms d'attributs.
     * @protected
     * @static
     * @override
     * @deprecated Utilisez le décorateur {@link Observe} du commit 3e38db0162eef596874dbe32490d9e96b09fb1c0
     * @see [feat(composants): ✨ Ajout d'un décorateur pour réduire le boilerplate des attibuts à observer](https://github.com/messagerie-melanie2/design-system-bnum/commit/3e38db0162eef596874dbe32490d9e96b09fb1c0)
     */
    protected static _p_observedAttributes(): string[];
    /**
     * Evènements disponibles pour ce composant.
     * @readonly
     */
    static get EVENTS(): Readonly<BnumRadioGroupEvents>;
}
export {};
