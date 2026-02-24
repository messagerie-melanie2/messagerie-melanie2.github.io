import BnumElementInternal from '../../../bnum-element-states';
import { Nullable } from '../../../../core/utils/types';
import { Result } from '@rotomeca/rop';
import JsEvent from '@rotomeca/event';
import { CallSelectArg, OnSelectCallback, SegmentedItemCreateOptions } from './bnum-segmented-item.internal';
import { States } from './bnum-segmented-item.internal/States';
/**
 * Composant représentant un item individuel au sein d'un contrôle segmenté.
 * * @structure Defaut
 * <bnum-segmented-item value="item1" data-icon="home">Item 1</bnum-segmented-item>
 *
 * @structure Selected
 * <bnum-segmented-item value="item1" selected data-icon="home">Item 1</bnum-segmented-item>
 *
 * @structure Disabled
 * <bnum-segmented-item value="item1" disabled data-icon="home">Item 1</bnum-segmented-item>
 *
 * @slot default - Le contenu textuel (label) de l'élément.
 *
 * @state selected - quand l'élément est sélectionné.
 * @state disabled - quand l'élément est désactivé.
 * @state icon - quand une icône est définie via data-icon.
 *
 * @attr {boolean} (optional) (default: false) disabled - Indique si l'item est désactivé.
 * @attr {boolean} (optional) (default: false) selected - Indique si l'item est sélectionné.

 */
export declare class HTMLBnumSegmentedItem extends BnumElementInternal {
    #private;
    /** @attr {boolean} (optional) (default: false) selected - État de sélection. */
    accessor selected: boolean;
    /** @attr {boolean} (optional) (default: false) disabled - État désactivé. */
    accessor disabled: boolean;
    /** Instance JsEvent pour la souscription aux changements de sélection. */
    accessor onSelected: JsEvent<OnSelectCallback>;
    /** @attr {string} value - Valeur technique de l'item. */
    get value(): string;
    set value(value: string);
    /** Récupère le nom de l'icône actuelle. */
    get icon(): string;
    /** Définit une nouvelle icône et met à jour le DOM. */
    set icon(value: string);
    constructor();
    /** Initialise le DOM et les écouteurs. */
    protected _p_buildDOM(): void;
    /** Gère la mise à jour des attributs. */
    protected _p_update(_: string, __: string | null, ___: string | null): void | Nullable<'break'>;
    /**
     * Met à jour le texte du label via textContent.
     * @param text Nouveau texte.
     */
    updateLabel(text: string): Result<void>;
    /**
     * Vérifie si l'élément possède un état spécifique.
     * @param state État à vérifier.
     */
    is(state: States): Result<boolean>;
    /**
     * Désactive l'élément.
     * @returns Cette instance pour le chaînage.
     */
    disable(): this;
    /**
     * Active l'élément.
     * @returns Cette instance pour le chaînage.
     */
    enable(): this;
    /**
     * Sélectionne l'élément.
     * @returns Cette instance pour le chaînage.
     */
    select(): this;
    /**
     * Désélectionne l'élément.
     * @returns Cette instance pour le chaînage.
     */
    unselect(): this;
    /**
     * Met à jour la valeur technique de l'élément.
     * @param value Nouvelle valeur.
     * @returns Cette instance pour le chaînage.
     */
    updateValue(value: string): this;
    /**
     * Déclenche manuellement la logique de sélection.
     *
     * /!\ Ne modifie pas l'état sélectionné de l'élément.
     * @param options Options incluant l'événement parent.
     */
    callSelect({ parentEvent }?: CallSelectArg): void;
    /**
     * Déclencheur interne pour le pont avec l'initialiseur de Listener.
     * @internal
     */
    protected _p_onSelectedTrigger(e: Event): void;
    protected static _p_observedAttributes(): string[];
    /**
     * Crée un élément segmented-item.
     * @param value Valeur technique de l'item.
     * @param options Options de création.
     * @returns L'élément créé.
     */
    static Create(value: string, options?: SegmentedItemCreateOptions): HTMLBnumSegmentedItem;
    /**
     * Accès aux états disponibles pour cet élément.
     */
    static get States(): typeof States;
    /**
     * Accès aux évènements non-conventionnels de cet élément.
     */
    static get Events(): {
        readonly SELECTED: "bnum-segmented-item:selected";
        readonly ERROR: "bnum-segmented-item:error";
    };
}
