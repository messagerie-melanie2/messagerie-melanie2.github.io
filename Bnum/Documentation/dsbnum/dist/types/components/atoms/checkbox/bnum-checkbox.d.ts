import BnumElementInternal from 'components/bnum-element-states';
import { BasicDetail, Nullable, Optional } from 'core/utils/types';
import JsEvent from '@rotomeca/event';
/**
 * Détails de l'événement de changement d'état du checkbox.
 *
 * @remarks
 * Contient l'événement natif sous-jacent et la référence à l'instance du composant.
 */
type BnumCheckBoxDetail = BasicDetail<HTMLBnumCheckbox, Event>;
/**
 * Événement personnalisé déclenché lors du changement d'état du checkbox.
 */
type BnumCheckBoxChangeCustomEvent = CustomEvent<BnumCheckBoxDetail>;
/**
 * Signature du callback exécuté lors du changement d'état coché.
 *
 * @param event - L'événement personnalisé contenant les détails du changement
 */
type OnCheckedChangeCallback = (event: BnumCheckBoxChangeCustomEvent) => void;
/**
 * Type d'événement personnalisé pour le changement d'état coché.
 */
type OnCheckedChangeEvent = JsEvent<OnCheckedChangeCallback>;
/**
 * Composant personnalisé représentant un checkbox avec support de formulaire.
 *
 * @remarks
 * Ce composant Web étend {@link BnumElementInternal} et fournit un checkbox personnalisé
 * avec support complet des formulaires HTML, gestion d'état, validation et accessibilité.
 *
 * Le composant utilise le Shadow DOM pour encapsuler son style et sa structure,
 * et synchronise automatiquement ses attributs avec un input checkbox natif sous-jacent.
 * Il fonctionne en mode `switch` (interrupteur on/off) avec des textes configurables
 * pour les états actif et inactif.
 *
 * @example
 * Structure simple :
 * ```html
 * <bnum-checkbox>Click me !</bnum-checkbox>
 * ```
 *
 * @example
 * Structure avec indice :
 * ```html
 * <bnum-checkbox>Click me !<span slot="hint">Indice</span></bnum-checkbox>
 * ```
 *
 * @example
 * Structure required avec helper :
 * ```html
 * <bnum-checkbox helper required>Click me !<span slot="hint">Indice</span></bnum-checkbox>
 * ```
 *
 * @fires CustomEvent<BnumCheckBoxDetail> - Déclenché lorsque l'état coché du checkbox change
 *
 * @public
 *
 * @structure Classique
 * <bnum-checkbox>Click me !</bnum-checkbox>
 *
 * @structure Avec indice
 * <bnum-checkbox checked>Click me !<span slot="hint">Indice</span></bnum-checkbox>
 *
 * @structure Requis
 * <bnum-checkbox required>Click me !<span slot="hint">Indice</span></bnum-checkbox>
 *
 * @structure Avec un texte d'aide
 * <bnum-checkbox helper>Click me !<span slot="hint">Indice</span></bnum-checkbox>
 *
 * @slot (default) - Légende de l'élément
 * @slot activeText - Texte affiché lorsque le checkbox est activé
 * @slot inactiveText - Texte affiché lorsque le checkbox est désactivé
 * @slot hint - Aide supplémentaire dans la légende
 *
 * @event {CustomEvent<BnumCheckBoxDetail>} change - Lorsque l'élément change d'état
 *
 * @attr {boolean} (optional) (default: false) checked - Si l'élément est coché ou non
 * @attr {string} (optional) name - Nom de l'élément pour les formulaires
 * @attr {string} (optional) (default: 'on') value - Valeur de l'élément
 * @attr {boolean} (optional) (default: false) disabled - Désactive l'élément
 * @attr {boolean} (optional) (default: false) required - Rend le champ obligatoire
 * @attr {boolean} (optional) (default: false) helper - Active le mode d'aide visuelle
 *
 * @state error - Lorsque la validation échoue
 * @state helper - Lorsque l'attribut helper est actif
 *
 * @cssvar {#000091} --bnum-checkbox-color - Couleur du checkbox
 * @cssvar {white} --bnum-checkbox-background-color - Couleur de fond du checkbox
 * @cssvar {#de350b} --bnum-input-state-error-color - Couleur de l'erreur
 */
export declare class HTMLBnumCheckbox extends BnumElementInternal {
    #private;
    /**
     * Indique si le checkbox est coché.
     *
     * @remarks
     * Contrôle l'état de sélection du checkbox.
     *
     * @defaultValue `false`
     */
    accessor checked: boolean;
    /**
     * Le nom du checkbox pour les formulaires.
     *
     * @remarks
     * Permet d'identifier le champ lors de la soumission du formulaire.
     *
     * @defaultValue `undefined`
     */
    accessor name: Optional<string>;
    /**
     * La valeur associée au checkbox.
     *
     * @remarks
     * Cette valeur est envoyée lors de la soumission du formulaire si le checkbox est coché.
     *
     * @defaultValue `'on'`
     */
    accessor value: string;
    /**
     * Indique si le checkbox est désactivé.
     *
     * @remarks
     * Un checkbox désactivé ne peut pas être sélectionné ni recevoir le focus.
     *
     * @defaultValue `false`
     */
    accessor disabled: boolean;
    /**
     * Indique si le checkbox est obligatoire.
     *
     * @remarks
     * Un checkbox obligatoire doit être coché pour que le formulaire soit valide.
     *
     * @defaultValue `false`
     */
    accessor required: boolean;
    /**
     * Active le mode d'aide visuelle.
     *
     * @remarks
     * Lorsque activé, ajoute l'état `helper` au composant pour un rendu visuel spécifique.
     *
     * @defaultValue `false`
     */
    accessor helper: boolean;
    /**
     * Événement personnalisé déclenché lors du changement d'état coché.
     *
     * @remarks
     * Initialisé par {@link OnCheckedChangeInitializer} via le décorateur {@link Listener}.
     * Permet de s'abonner aux changements d'état du checkbox.
     */
    accessor oncheckedchange: OnCheckedChangeEvent;
    /**
     * Constructeur du composant HTMLBnumCheckbox.
     *
     * @remarks
     * Initialise l'instance du composant en appelant le constructeur parent.
     */
    constructor();
    /**
     * Précharge l'état initial du checkbox.
     *
     * @remarks
     * Sauvegarde l'état coché initial pour permettre la restauration
     * lors d'un reset de formulaire.
     *
     * @protected
     * @override
     */
    protected _p_preload(): void;
    /**
     * Attache le composant au DOM et initialise son comportement.
     *
     * @remarks
     * Initialise les données des slots, synchronise les attributs avec l'input natif,
     * vérifie la présence d'un label et gère l'état d'erreur initial.
     * Ajoute l'état `helper` si l'attribut correspondant est défini.
     *
     * @protected
     * @override
     */
    protected _p_attach(): void;
    /**
     * Gère la mise à jour d'un attribut observé.
     *
     * @param name - Le nom de l'attribut modifié
     * @param oldVal - L'ancienne valeur de l'attribut
     * @param newVal - La nouvelle valeur de l'attribut
     * @returns `void` ou `'break'` pour interrompre le traitement
     *
     * @remarks
     * Cette méthode est appelée automatiquement lorsqu'un attribut observé change.
     * Elle traite spécifiquement les attributs `checked` et `helper`,
     * et délègue les autres attributs à l'input natif.
     *
     * @protected
     * @override
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void | Nullable<'break'>;
    /**
     * Effectue les opérations post-flush du composant.
     *
     * @remarks
     * Vérifie l'état d'erreur et resynchronise les attributs après un flush.
     *
     * @protected
     * @override
     */
    protected _p_postFlush(): void;
    /**
     * Callback de réinitialisation du formulaire.
     *
     * @remarks
     * Restaure l'état coché initial du checkbox lorsque le formulaire est réinitialisé.
     */
    formResetCallback(): void;
    /**
     * Active ou désactive le champ selon l'état du fieldset parent.
     *
     * @param disabled - `true` pour désactiver, `false` pour activer
     */
    formDisabledCallback(disabled: boolean): void;
    /**
     * Met à jour l'état coché du checkbox et déclenche l'événement de changement.
     *
     * @param checked - L'état coché à définir
     *
     * @remarks
     * Cette méthode est utilisée en interne pour mettre à jour l'état coché
     * et déclencher l'événement de changement correspondant.
     */
    updateCheckedAndFire(checked: boolean): void;
    /**
     * Vérifie la validité du checkbox sans afficher de message.
     *
     * @returns `true` si le checkbox est valide, `false` sinon
     *
     * @remarks
     * Délègue la vérification à l'input natif sous-jacent.
     * En cas d'erreur, retourne `true` par défaut.
     */
    checkValidity(): boolean;
    /**
     * Vérifie la validité du checkbox et affiche le message de validation.
     *
     * @returns `true` si le checkbox est valide, `false` sinon
     *
     * @remarks
     * Délègue la vérification à l'input natif sous-jacent et déclenche
     * l'affichage du message de validation natif si invalide.
     * En cas d'erreur, retourne `true` par défaut.
     */
    reportValidity(): boolean;
    /**
     * Retourne la liste des attributs observés par le composant.
     *
     * @returns Un tableau contenant tous les noms d'attributs observés
     *
     * @remarks
     * Combine les attributs observés du parent avec les {@link SYNCED_ATTRIBUTES}
     * et l'attribut `helper` spécifiques à ce composant.
     * Les changements de ces attributs déclencheront {@link _p_update}.
     *
     * @protected
     * @static
     * @override
     * @deprecated Utilisez le décorateur {@link Observe} du commit 3e38db0162eef596874dbe32490d9e96b09fb1c0
     * @see [feat(composants): ✨ Ajout d'un décorateur pour réduire le boilerplate des attibuts à observer](https://github.com/messagerie-melanie2/design-system-bnum/commit/3e38db0162eef596874dbe32490d9e96b09fb1c0)
     */
    protected static _p_observedAttributes(): string[];
    /**
     * Indique que ce composant peut être associé à un formulaire.
     *
     * @remarks
     * Permet au composant de participer au cycle de vie des formulaires HTML,
     * notamment la soumission, la validation et la réinitialisation.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals#instance_properties | ElementInternals}
     */
    static get formAssociated(): Readonly<boolean>;
}
export {};
