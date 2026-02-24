import BnumElementInternal from '../../bnum-element-states';
import { Nullable } from '../../../core/utils/types';
import { CustomDom } from '../../bnum-element';
/**
 * Badge d'information.
 *
 * @structure Badge classique
 * <bnum-badge data-value="Je suis un badge !"></bnum-badge>
 *
 * @structure Badge avec un nombre
 * <bnum-badge data-value="9999"></bnum-badge>
 *
 * @structure Arrondi forcé
 * <bnum-badge data-value="9999" circle></bnum-badge>
 *
 * @structure Secondary
 * <bnum-badge data-value="42" data-variation="secondary" circle></bnum-badge>
 *
 * @structure Danger
 * <bnum-badge data-value="42" data-variation="danger" circle></bnum-badge>
 *
 * @state has-value - Le badge a une valeur.
 * @state no-value - Le badge n'a pas de valeur.
 * @state is-circle - Le badge est en mode cercle.
 * @state variation-primary - Le badge utilise la variation primaire.
 * @state variation-secondary - Le badge utilise la variation secondaire.
 * @state variation-danger - Le badge utilise la variation danger.
 *
 * @cssvar {inline-block} --bnum-badge-display - Permet de surcharger la propriété CSS display du badge.
 * @cssvar {100px} --bnum-badge-border-radius - Permet de surcharger le rayon de bordure du badge.
 * @cssvar {10px} --bnum-badge-padding - Permet de surcharger le padding du badge.
 * @cssvar {100%} --bnum-badge-circle-border-radius - Permet de surcharger le rayon de bordure du badge en mode "cercle".
 * @cssvar {#000091} --bnum-badge-primary-color - Définit la couleur de fond du badge en variation "primary".
 * @cssvar {#f5f5fe} --bnum-badge-primary-text-color - Définit la couleur du texte du badge en variation "primary".
 * @cssvar {#ffffff} --bnum-badge-secondary-color - Définit la couleur de fond du badge en variation "secondary".
 * @cssvar {#000091} --bnum-badge-secondary-text-color - Définit la couleur du texte du badge en variation "secondary".
 * @cssvar {solid} --bnum-badge-type - Permet de surcharger le type de bordure (ex: solid, dashed) pour la variation "secondary".
 * @cssvar {thin} --bnum-badge-size - Permet de surcharger l’épaisseur de la bordure pour la variation "secondary".
 * @cssvar {#ce0500} --bnum-badge-danger-color - Définit la couleur de fond du badge en variation "danger".
 * @cssvar {#f5f5fe} --bnum-badge-danger-text-color - Définit la couleur du texte du badge en variation "danger".
 *
 */
export declare class HTMLBnumBadge extends BnumElementInternal {
    #private;
    /**
     * Nom de l'attribut pour la valeur du badge.
     */
    static readonly DATA_VALUE = "value";
    /**
     * Nom de l'attribut pour la variation du badge.
     */
    static readonly DATA_VARIATION = "variation";
    /**
     * Nom de l'attribut pour la valeur du badge.
     * @attr {string} data-value - Valeur affichée dans le badge.
     */
    static readonly ATTR_VALUE = "data-value";
    /**
     * Nom de l'attribut pour la variation du badge.
     * @attr {'primary' | 'secondary' | 'danger'} (optional) (default:'primary') data-variation - Variation du badge.
     */
    static readonly ATTR_VARIATION = "data-variation";
    /**
     * Nom de l'attribut pour le mode cercle.
     * @attr {any} (optional) circle - Indique si le badge doit être affiché en cercle.
     */
    static readonly ATTR_CIRCLE = "circle";
    /**
     * Valeur de variation primaire.
     */
    static readonly VARIATION_PRIMARY = "primary";
    /**
     * Valeur de variation secondaire.
     */
    static readonly VARIATION_SECONDARY = "secondary";
    /**
     * Valeur de variation danger.
     */
    static readonly VARIATION_DANGER = "danger";
    /**
     * Nom de la classe d'état "a une valeur".
     */
    static readonly STATE_HAS_VALUE = "has-value";
    /**
     * Nom de la classe d'état "pas de valeur".
     */
    static readonly STATE_NO_VALUE = "no-value";
    /**
     * Nom de la classe d'état "cercle".
     */
    static readonly STATE_IS_CIRCLE = "is-circle";
    /**
     * Préfixe de la classe d'état pour la variation.
     */
    static readonly STATE_VARIATION_PREFIX = "variation-";
    /** Référence à la classe HTMLBnumBadge */
    _: typeof HTMLBnumBadge;
    /**
     * Valeur affichée dans le badge.
     */
    get value(): string;
    set value(value: string);
    /**
     * Variation de style du badge.
     */
    get variation(): string;
    set variation(value: string);
    constructor();
    /**
     * Retourne les styles à appliquer au composant.
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Construit le DOM interne du composant.
     */
    protected _p_buildDOM(container: CustomDom): void;
    /**
     * Indique si toutes les modifications d'attributs doivent déclencher une mise à jour.
     */
    protected _p_isUpdateForAllAttributes(): boolean;
    /**
     * Met à jour le composant lors d'un changement d'attribut.
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void | Nullable<'break'>;
    /**
     * Attributs observés pour ce composant.
     */
    protected static _p_observedAttributes(): string[];
    /**
     * Crée un badge via JavaScript.
     * @param value Valeur à afficher
     * @param options Options de création (cercle, variation)
     */
    static Create(value: string, { circle, variation, }?: {
        circle?: boolean;
        variation?: 'primary' | 'secondary' | 'danger';
    }): HTMLBnumBadge;
    /**
     * Génère le HTML d'un badge.
     * @param value Valeur à afficher
     * @param attrs Attributs additionnels
     */
    static Write(value: string, attrs?: Record<string, string>): string;
    /**
     * Tag HTML du composant.
     */
    static get TAG(): string;
}
