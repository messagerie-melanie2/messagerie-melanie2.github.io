import BnumElementInternal from 'components/bnum-element-states';
import { Nullable } from 'core/utils/types';
import { CheckedChangeEvent } from 'core/utils/events/CheckedChangeEvent';
import JsEvent from '@rotomeca/event';
/**
 * Détails additionnels pour l'événement de changement de l'état coché.
 */
type CheckedChangeEventDetails = {
    /** L'événement natif sous-jacent */
    inner: Event;
    /** Indique si l'événement peut se propager */
    bubbles: boolean;
    /** Indique si l'événement peut être annulé */
    cancelable: boolean;
};
/**
 * Événement personnalisé déclenché lors du changement d'état d'un bouton radio.
 *
 * @remarks
 * Cet événement encapsule les informations sur le changement d'état (coché/décoché)
 * d'un élément radio personnalisé.
 */
export declare class BnumRadioCheckedChangeEvent extends CheckedChangeEvent<string, CheckedChangeEventDetails, HTMLBnumRadio> {
}
type OnChangeCallback = (ev: BnumRadioCheckedChangeEvent) => void;
type OnChangeEvent = JsEvent<OnChangeCallback>;
/**
 * Nom de l'événement 'change'.
 * @internal
 */
declare const EVENT_CHANGE = "bnum-radio:change";
/**
 * Composant personnalisé représentant un bouton radio avec support de formulaire.
 *
 * @remarks
 * Ce composant Web étend {@link BnumElementInternal} et fournit un bouton radio personnalisé
 * avec support complet des formulaires HTML, gestion d'état et accessibilité.
 *
 * Le composant utilise le Shadow DOM pour encapsuler son style et sa structure,
 * et synchronise automatiquement ses attributs avec un input radio natif sous-jacent.
 *
 * @example
 * Structure simple :
 * ```html
 * <bnum-radio name="rotomeca" value="valeur 1">
 *   Mon élément
 * </bnum-radio>
 * ```
 *
 * @example
 * Structure avec indice :
 * ```html
 * <bnum-radio name="rotomeca" value="valeur 2">
 *   Mon élément
 *   <span slot="hint">Indice !</span>
 * </bnum-radio>
 * ```
 *
 * @fires BnumRadioCheckedChangeEvent - Déclenché lorsque l'état coché du radio change
 *
 * @public
 *
 * @structure Structure simple
 * <bnum-radio name="rotomeca" value="valeur 1">
 *   Mon élément
 * </bnum-radio>
 *
 * @structure Structure avec indice
 * <bnum-radio name="rotomeca" value="valeur 2">
 *   Mon élément
 *   <span slot="hint">Indice !</span>
 * </bnum-radio>
 *
 * @structure Disabled
 * <bnum-radio name="radio" value="valeur x" data-legend="Mon élément" data-hint="Indice !" checked disabled></bnum-radio>
 *
 * @slot (default) - Légende de l'élément
 * @slot hint - Aide supplémentaire dans la légende
 *
 * @event {CustomEvent<{ inner: BnumRadioCheckedChangeEvent }>} bnum-radio:change - Lorsque l'élément change d'état
 *
 * @attr {string} value - Valeur de l'élément
 * @attr {string} name - Nom de l'élément, permet de gérer les interactions des radio ayant le même nom
 * @attr {'disabled' | '' | undefined} (optional) disabled - Désactive l'élément
 * @attr {'' | undefined} (optional) checked - Si l'élément est actif ou non
 * @attr {string | undefined} (optional) data-legend - Label de l'élément. Est écraser si un slot est défini.
 * @attr {string | undefined} (optional) data-hint - Aide supplémentaire pour le label. Est écraser si un slot est défini.
 *
 * @cssvar {#000091} --bnum-radio-color - Couleur du radio
 * @cssvar {1rem} --bnum-radio-font-size - Taille du label principal
 * @cssvar {1px} --bnum-radio-border-size - Taille du countour du radio
 * @cssvar {50%} --bnum-radio-border-radius - "border-radius" de l'élément
 */
export declare class HTMLBnumRadio extends BnumElementInternal {
    #private;
    /**
     * Indique que ce composant peut être associé à un formulaire.
     *
     * @remarks
     * Permet au composant de participer au cycle de vie des formulaires HTML,
     * notamment la soumission et la validation.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals#instance_properties | ElementInternals}
     */
    static readonly formAssociated = true;
    /**
     * Le nom du groupe de boutons radio.
     *
     * @remarks
     * Les boutons radio partageant le même nom forment un groupe mutuellement exclusif.
     * Un seul bouton peut être sélectionné à la fois dans un groupe.
     *
     * @defaultValue Chaîne vide
     */
    accessor name: string;
    /**
     * La valeur associée au bouton radio.
     *
     * @remarks
     * Cette valeur est envoyée lors de la soumission du formulaire si le radio est coché.
     *
     * @defaultValue Chaîne vide
     */
    accessor value: string;
    /**
     * Indique si le bouton radio est coché.
     *
     * @remarks
     * Contrôle l'état de sélection du bouton radio.
     *
     * @defaultValue `true`
     */
    accessor checked: boolean;
    /**
     * Indique si le bouton radio est désactivé.
     *
     * @remarks
     * Un bouton radio désactivé ne peut pas être sélectionné ni recevoir le focus.
     *
     * @defaultValue `false`
     */
    accessor disabled: boolean;
    /**
     * Appelé lorsque l'état de l'élément change
     */
    accessor onstatechange: OnChangeEvent;
    /**
     * Récupère l'input radio interne.
     *
     * @remarks
     * Permet d'accéder à l'input radio natif pour des opérations spécifiques.
     *
     * @returns L'input radio interne
     */
    get internalCheckbox(): HTMLInputElement;
    /**
     * Constructeur du composant HTMLBnumRadio.
     *
     * @remarks
     * Initialise l'instance du composant en appelant le constructeur parent.
     */
    constructor();
    /**
     * Attache un Shadow DOM au composant.
     *
     * @returns La racine du Shadow DOM créée
     *
     * @remarks
     * Configure le Shadow DOM en mode 'open' avec délégation du focus.
     * Cela permet au focus de se déplacer automatiquement vers l'input interne.
     *
     * @protected
     * @override
     */
    protected _p_attachCustomShadow(): Nullable<ShadowRoot>;
    /**
     * Construit le DOM du composant après son attachement.
     *
     * @remarks
     * Configure le rôle ARIA, initialise les écouteurs d'événements,
     * initialise le contenu des slots et synchronise l'état initial avec les attributs.
     *
     * @protected
     * @override
     */
    protected _p_buildDOM(): void;
    /**
     * Gère la mise à jour d'un attribut observé.
     *
     * @param name - Le nom de l'attribut modifié
     * @param oldVal - L'ancienne valeur de l'attribut
     * @param newVal - La nouvelle valeur de l'attribut
     *
     * @remarks
     * Cette méthode est appelée automatiquement lorsqu'un attribut observé change.
     * Elle détermine si une mise à jour est nécessaire et la déclenche si besoin.
     *
     * Pour l'attribut 'checked', compare l'état booléen plutôt que la chaîne.
     * Pour l'attribut 'value', compare avec la valeur de l'input interne.
     *
     * @protected
     * @override
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void | Nullable<'break'>;
    /**
     * Update l'état du radio et déclenche l'événement bnum-radio:change
     * @param checked - L'état à appliquer
     */
    updateCheckAndFire(checked: boolean): void;
    /**
     * Retourne la liste des attributs observés par le composant.
     *
     * @returns Un tableau contenant tous les noms d'attributs observés
     *
     * @remarks
     * Combine les attributs observés du parent avec les {@link SYNCED_ATTRIBUTES} spécifiques
     * à ce composant. Les changements de ces attributs déclencheront {@link _p_update}.
     *
     * @protected
     * @static
     * @override
     * @deprecated Utilisez le décorateur {@link Observe} du commit 3e38db0162eef596874dbe32490d9e96b09fb1c0
     * @see [feat(composants): ✨ Ajout d'un décorateur pour réduire le boilerplate des attibuts à observer](https://github.com/messagerie-melanie2/design-system-bnum/commit/3e38db0162eef596874dbe32490d9e96b09fb1c0)
     */
    protected static _p_observedAttributes(): string[];
    /**
     * Retourne le nom de l'événement 'change'.
     *
     * @returns Le nom de l'événement 'change'
     */
    static get EVENT_CHANGE(): typeof EVENT_CHANGE;
}
export {};
