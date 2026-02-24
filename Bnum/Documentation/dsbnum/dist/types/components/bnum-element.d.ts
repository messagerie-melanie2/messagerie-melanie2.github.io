import { Nullable } from '../core/utils/types';
import { Container, EnhancedContainer } from '../core/utils/BnumDom';
export type CustomDom = EnhancedContainer<Container>;
/**
 * Type du callback déclenché lors d’un changement d’attribut HTML.
 *
 * @param name Nom de l'attribut modifié.
 * @param oldVal Ancienne valeur de l'attribut.
 * @param newVal Nouvelle valeur de l'attribut.
 */
export type BnumHTMLElementAttributeChangedCallback = (name: string, oldVal: string | null, newVal: string | null) => void;
export type TagCreatorConstructor = {
    classes?: Nullable<string[]>;
    attributes?: Nullable<Record<string, any>>;
    data?: Nullable<Record<string, any>>;
    child?: Nullable<HTMLElement | string>;
};
/**
 * Classe de base pour les composants bnum personnalisés.
 *
 * Fournit les méthodes de cycle de vie et de gestion des attributs pour les webcomponents.
 * Permet la gestion de données internes, d'attributs, de classes CSS, de styles, d'événements, et de rendu.
 */
export default abstract class BnumElement extends HTMLElement {
    #private;
    protected _p_styleElement: HTMLStyleElement | null;
    /**
     * Retourne la liste des attributs observés par le composant.
     * À surcharger dans les classes dérivées pour observer des attributs spécifiques.
     */
    static get observedAttributes(): string[];
    /**
     * Méthode interne pour définir les attributs observés.
     * Peut être surchargée par les classes dérivées.
     * @returns Liste des noms d'attributs à observer.
     */
    protected static _p_observedAttributes(): string[];
    /**
     * Indique si le composant a été chargé au moins une fois.
     * Utile pour différencier le premier chargement des rechargements.
     */
    get alreadyLoaded(): boolean;
    /**
     * Constructeur du composant.
     * Initialise l'event de changement d'attribut et attache un shadow DOM si nécessaire.
     */
    constructor();
    /**
     * Callback appelée lors d’un changement d’attribut observé.
     * Déclenche l'événement interne de changement d'attribut.
     *
     * @param name Nom de l'attribut modifié.
     * @param oldVal Ancienne valeur.
     * @param newVal Nouvelle valeur.
     */
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
    /**
     * Callback appelée lorsque le composant est ajouté au DOM.
     * Déclenche le rendu du composant.
     */
    connectedCallback(): void;
    /**
     * Callback appelée lorsque le composant est retiré du DOM.
     * Permet de nettoyer les ressources ou événements.
     */
    disconnectedCallback(): void;
    /**
     * Déclenche le rendu du composant.
     * Appelle les hooks de préchargement, de rendu et d'attachement.
     */
    render(): void;
    /**
     * Récupère ou définit une donnée liée à l'élément.
     * @param name Nom de la donnée.
     * @param options Options de récupération ou de définition.
     * @returns La valeur de la donnée ou l'instance courante.
     */
    data<T>(name: string, opts?: {
        fromAttribute?: boolean;
    }): T;
    data<T>(name: string, value: T | symbol, fromAttribute?: boolean): this;
    /** Ajoute une ou plusieurs classes CSS à l'élément. */
    addClass(...classNames: string[]): this;
    /** Retire une ou plusieurs classes CSS de l'élément. */
    removeClass(...classNames: string[]): this;
    /** Bascule une classe CSS sur l’élément. */
    toggleClass(className: string, force?: boolean): this;
    /** Vérifie si l’élément possède une classe CSS donnée. */
    hasClass(className: string): boolean;
    /**
     * Obtient ou définit un attribut HTML.
     * @param name Nom de l'attribut.
     * @param value Valeur à définir (optionnel).
     * @returns Valeur de l'attribut ou l'instance courante.
     */
    attr(name: string): string | null;
    attr(name: string, value: string | boolean | number): this;
    /**
     * Définit plusieurs attributs HTML à la fois.
     * @param attribs Objet contenant les paires nom-valeur des attributs à définir.
     * @returns L'instance courante pour le chaînage.
     */
    attrs(attribs: Record<string, string | boolean | number>): this;
    /**
     * Essaye de définir un attribut html
     * @param doSomething true pour le définir
     * @param name Nom de l'attribut
     * @param value Nouvelle valeur
     * @returns L'instance courante pour le chaînage.
     */
    condAttr(doSomething: boolean, name: string, value: string | boolean | number): this;
    /**
     * Manipule les styles CSS de l'élément.
     * @param prop Propriété CSS ou objet de propriétés.
     * @param value Valeur à définir (optionnel).
     * @returns Valeur du style ou l'instance courante.
     */
    css(prop: string): string;
    css(prop: string, value: string): this;
    css(prop: Record<string, string>): this;
    /**
     * Manipule le contenu HTML de l'élément.
     * @param value Valeur à définir (optionnel).
     * @returns Contenu HTML ou l'instance courante.
     */
    html(): string;
    html(value: string): this;
    /**
     * Manipule le texte de l'élément.
     * @param value Valeur à définir (optionnel).
     * @returns Texte ou l'instance courante.
     */
    text(): string;
    text(value: string): this;
    /**
     * Manipule la valeur (pour input/select/textarea).
     * @param value Valeur à définir (optionnel).
     * @returns Valeur ou l'instance courante.
     */
    val(): string | undefined;
    val(value: string): this | undefined;
    /**
     * Ajoute un écouteur d'événement sur l'élément.
     * @param type Type d'événement.
     * @param listener Fonction de rappel.
     * @param options Options d'écoute.
     * @returns L'instance courante.
     */
    on(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): this;
    /**
     * Retire un écouteur d'événement de l'élément.
     * @param type Type d'événement.
     * @param listener Fonction de rappel.
     * @param options Options d'écoute.
     * @returns L'instance courante.
     */
    off(type: string, listener: EventListener, options?: boolean | EventListenerOptions): this;
    /**
     * Déclenche un événement personnalisé sur l'élément.
     * @param type Type d'événement.
     * @param detail Détail de l'événement.
     * @returns L'instance courante.
     */
    trigger(type: string, detail?: any, options?: CustomEventInit): this;
    /**
     * Ajoute un ou plusieurs nœuds ou chaînes HTML à la fin de l'élément.
     * @param nodes Nœuds ou chaînes HTML à ajouter.
     * @returns L'instance courante.
     */
    append(...nodes: (Node | string)[]): this;
    /**
     * Ajoute l'élément courant à un autre élément cible.
     * @param target Élément cible.
     * @returns L'instance courante.
     */
    appendTo(target: Element): this;
    /**
     * Ajoute un ou plusieurs nœuds ou chaînes HTML au début de l'élément.
     * @param nodes Nœuds ou chaînes HTML à ajouter.
     * @returns L'instance courante.
     */
    prepend(...nodes: (Node | string)[]): this;
    /**
     * Ajoute l'élément courant au début d'un autre élément cible.
     * @param target Élément cible.
     * @returns L'instance courante.
     */
    prependTo(target: Element): this;
    /**
     * Insère un ou plusieurs nœuds ou chaînes HTML avant l'élément courant.
     * @param nodes Nœuds ou chaînes HTML à insérer.
     * @returns L'instance courante.
     */
    before(...nodes: (Node | string)[]): this;
    /**
     * Insère un ou plusieurs nœuds ou chaînes HTML après l'élément courant.
     * @param nodes Nœuds ou chaînes HTML à insérer.
     * @returns L'instance courante.
     */
    after(...nodes: (Node | string)[]): this;
    /**
     * Cache l'élément en lui appliquant la classe `hidden`
     * @returns Chaîne
     */
    hide(): this;
    /**
     * Affiche l'élément en lui enlevant la classe `hidden`
     * @returns Chaîne
     */
    show(): this;
    /**
     * Permet d'attacher un shadowroot custom au lieu de juste `{mode:'open'}`
     * @returns Null si pas de root custom.
     */
    protected _p_attachCustomShadow(): Nullable<ShadowRoot>;
    /**
     * Demande une mise à jour de l'élément.
     * La mise à jour sera effectuée lors du prochain frame via requestAnimationFrame.
     */
    protected _p_requestAttributeUpdate(): this;
    /**
     * Ajoute des attributs en attente de traitement.
     * @param name Nom de l'attribut.
     * @param oldVal Ancienne valeur
     * @param newVal Nouvelle valeur
     * @returns Chaîne
     */
    protected _p_addPendingAttribute(name: string, oldVal: string | null, newVal: string | null): this;
    /**
     * Récupère une donnée interne.
     * @param name Nom de la donnée.
     * @returns Valeur de la donnée.
     */
    protected _p_getData<T>(name: string): T;
    /**
     * Définit une donnée interne.
     * @param name Nom de la donnée.
     * @param value Valeur à définir.
     * @returns L'instance courante.
     */
    protected _p_setData<T>(name: string, value: T): this;
    /**
     * Vérifie si une donnée interne existe.
     * @param name Nom de la donnée.
     * @returns Vrai si la donnée existe.
     */
    protected _p_hasData(name: string): boolean;
    /**
     * Crée un élément HTML générique avec options (classes, attributs, data, enfant).
     * @param tag Nom de la balise HTML à créer.
     * @param options Options de création (classes, attributs, data, enfant).
     * @returns L'élément HTML créé.
     */
    protected _p_createTag<T extends HTMLElement>(tag: string, options?: TagCreatorConstructor): T;
    /**
     * Crée un élément <span> avec options.
     * @param tag 'span'
     * @param options Options de création.
     * @returns L'élément HTMLSpanElement créé.
     */
    protected _p_createTag<HTMLSpanElement>(tag: 'span', options?: TagCreatorConstructor): HTMLSpanElement;
    /**
     * Crée un élément <slot> avec options.
     * @param tag 'slot'
     * @param options Options de création.
     * @returns L'élément HTMLSlotElement créé.
     */
    protected _p_createTag<HTMLSlotElement>(tag: 'slot', options?: TagCreatorConstructor): HTMLSlotElement;
    /**
     * Crée un élément <div> avec options.
     * @param tag 'div'
     * @param options Options de création.
     * @returns L'élément HTMLDivElement créé.
     */
    protected _p_createTag<HTMLDivElement>(tag: 'div', options?: TagCreatorConstructor): HTMLDivElement;
    /**
     * Crée un élément <slot> avec nom et valeur par défaut.
     * @param name Nom du slot (optionnel).
     * @param defaultValue Valeur par défaut si le slot est vide (optionnel).
     * @returns L'élément HTMLSlotElement créé.
     */
    protected _p_createSlot(name?: string, defaultValue?: HTMLElement): HTMLSlotElement;
    /**
     * Crée plusieurs éléments <slot> selon les options fournies.
     * @param options Liste d'options pour chaque slot.
     * @returns Tableau d'éléments HTMLSlotElement créés.
     */
    protected _p_createSlots(...options: {
        name?: string;
        defaultValue?: HTMLElement;
    }[]): HTMLSlotElement[];
    /**
     * Crée un élément <span> avec options.
     * @param options Options de création.
     * @returns L'élément HTMLSpanElement créé.
     */
    protected _p_createSpan(options?: TagCreatorConstructor): HTMLSpanElement;
    /**
     * Crée plusieurs éléments <span> selon les options fournies.
     * @param options Liste d'options pour chaque span.
     * @returns Tableau d'éléments HTMLSpanElement créés.
     */
    protected _p_createSpans(...options: (TagCreatorConstructor | null)[]): HTMLSpanElement[];
    /**
     * Crée un élément <div> avec options.
     * @param options Options de création.
     * @returns L'élément HTMLDivElement créé.
     */
    protected _p_createDiv(options?: TagCreatorConstructor): HTMLDivElement;
    /**
     * Crée plusieurs éléments <div> selon les options fournies.
     * @param options Liste d'options pour chaque div.
     * @returns Tableau d'éléments HTMLDivElement créés.
     */
    protected _p_createDivs(...options: (TagCreatorConstructor | null)[]): HTMLDivElement[];
    /**
     * Crée un nœud de texte.
     * @param text Texte à insérer dans le nœud.
     * @returns Le nœud de texte créé.
     */
    protected _p_createTextNode(text: string): Text;
    /**
     * Indique si l'élément est à l'intérieur d'un ShadowRoot.
     */
    get _p_isInsideShadowRoot(): boolean;
    /**
     * Hook appelé après le flush des mises à jour d'attributs.
     */
    protected _p_postFlush(): void;
    /**
     * Si la méthode _p_update doit être appelé une seule fois ou non.
     * @returns `true` pour appeler _p_update une seule fois, `false` pour l'appeler à chaque changement d'attribut.
     */
    protected _p_isUpdateForAllAttributes(): boolean;
    /**
     * Retourne le style CSS à injecter dans le composant.
     * @returns Chaîne de style CSS.
     * @deprecated Utiliser _p_getStylesheet ou _p_getStylesheets à la place.
     */
    protected _p_getStyle(): string;
    /**
     * Retourne la liste des feuilles de style CSS à injecter dans le composant.
     * @returns Tableau de feuilles de style CSS.
     */
    protected _p_getStylesheets(): CSSStyleSheet[];
    /**
     * Hook appelé avant le rendu du composant.
     * À surcharger dans les classes dérivées.
     */
    protected _p_preload(): void;
    /**
     * Hook appelé à la création de l'élément.
     *
     * À surcharger dans les classes dérivées, doit créer le dom via des nodes et non via innerHTML.
     *
     * Est appelé qu'une seule fois.
     *
     * @param container Le conteneur (ShadowRoot ou this) où construire le DOM.
     */
    protected _p_buildDOM(container: CustomDom): void;
    protected _p_fromTemplate(): HTMLTemplateElement | null;
    /**
     * Hook appelé LORS D'UN CHANGEMENT d'attribut, après le premier rendu.
     *
     * C'est ici que doit se faire la mise à jour "chirurgicale" du DOM.
     *
     * @param name Nom de l'attribut modifié.
     * @param oldVal Ancienne valeur.
     * @param newVal Nouvelle valeur.
     */
    protected _p_update(name: string, oldVal: string | null, newVal: string | null): void | Nullable<'break'>;
    /**
     * Hook appelé après le rendu du composant.
     * À surcharger dans les classes dérivées.
     */
    protected _p_attach(): void;
    /**
     * Hook appelé avant le déchargement du composant.
     * À surcharger dans les classes dérivées.
     */
    protected _p_preunload(): void;
    /**
     * Hook appelé lors du détachement du composant.
     * À surcharger dans les classes dérivées.
     */
    protected _p_detach(): void;
    /**
     * Indique si le composant doit utiliser un Shadow DOM.
     * À surcharger dans les classes dérivées.
     * @returns Vrai si Shadow DOM.
     */
    protected _p_isShadowElement(): boolean;
    protected static _p_WriteAttributes(attrs: Record<string, string>): string;
    /**
     * Méthode statique pour créer une instance du composant.
     * Doit être implémentée dans les classes dérivées.
     * @throws Erreur si non implémentée.
     */
    static Create(...args: any[]): BnumElement;
    /**
     * Retourne le nom de la balise du composant.
     * Doit être implémenté dans les classes dérivées.
     * @throws Erreur si non implémenté.
     * @readonly
     */
    static get TAG(): string;
    /**
     * Construit une feuille de style CSS à partir d'une chaîne CSS.
     * @param cssText CSS à ajouter
     * @returns Feuille de style
     */
    static ConstructCSSStyleSheet(cssText: string): CSSStyleSheet;
    static CreateTemplate(html: string): HTMLTemplateElement;
    /**
     * Définit le composant comme élément personnalisé si ce n'est pas déjà fait.
     */
    static TryDefine(): void;
    /**
     * Définit un élément personnalisé avec le tag et le constructeur donnés.
     * @param tag Nom de la balise personnalisée.
     * @param constructor Constructeur de l'élément.
     */
    static TryDefineElement(tag: string, constructor: CustomElementConstructor): void;
}
