import { Nullable } from '../../../../../core/utils/types';
import { HTMLBnumIcon } from '../../../../atoms';
import { HTMLBnumSegmentedItem } from '../bnum-segmented-item.internal';
/**
 * Interface définissant les références aux éléments UI internes.
 */
export type BnumSegmentedItemUI = {
    /**
     * Référence à l'élément icône interne.
     */
    icon: Nullable<HTMLBnumIcon>;
    /**
     * Référence à l'élément label interne.
     */
    label: Nullable<HTMLSpanElement>;
    /**
     * Référence au conteneur principal de l'élément.
     */
    container: Nullable<HTMLDivElement>;
};
/**
 * Arguments passés lors de l'événement de sélection d'un item.
 */
export type EventSelectArgs = {
    /**
     * Evénement parent ayant déclenché la sélection.
     */
    parentEvent?: Nullable<Event>;
    /**
     * Contrôle segmenté parent de l'item.
     */
    caller: HTMLBnumSegmentedItem;
    /**
     * Valeur technique de l'item sélectionné.
     */
    value: string;
};
/**
 * Type de callback pour l'événement de sélection d'un item.
 */
export type OnSelectCallback = (args: EventSelectArgs) => void;
/**
 * Argument optionnel pour la fonction `callSelect` de `HTMLBnumSegmentedItem`.
 */
export type CallSelectArg = {
    /**
     * Evénement parent ayant déclenché la sélection.
     */
    parentEvent?: Nullable<Event>;
};
export type SegmentedItemCreateOptions = {
    label?: string;
    iconName?: string;
    disabled?: boolean;
    selected?: boolean;
    onSelect?: OnSelectCallback;
    OnError?: (error: Error, caller: HTMLBnumSegmentedItem) => void;
};
