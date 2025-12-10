import { EMPTY_STRING } from '@rotomeca/utils';
import { Nullable } from '../core/utils/types';
import Log from '../core/utils/Log';

/**
 * Type du callback déclenché lors d’un changement d’attribut HTML.
 *
 * @param name Nom de l'attribut modifié.
 * @param oldVal Ancienne valeur de l'attribut.
 * @param newVal Nouvelle valeur de l'attribut.
 */
export type BnumHTMLElementAttributeChangedCallback = (
  name: string,
  oldVal: string | null,
  newVal: string | null,
) => void;

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
  /** Données mises en mémoire, accessibles via la méthode data(). */
  #_data: Map<string, any> | null = null;
  #_pendingAttributes: Map<
    string,
    { oldVal: string | null; newVal: string | null }
  > | null = null;
  #_updateScheduled = false;

  /** Indique si le composant a déjà été chargé une première fois. */
  #firstLoad = false;

  /** Symbole utilisé pour indiquer l'absence de valeur lors de l'accès aux données. */
  static readonly #_NoItem = Symbol('NoItem');

  protected _p_styleElement: HTMLStyleElement | null = null;

  /**
   * Retourne la liste des attributs observés par le composant.
   * À surcharger dans les classes dérivées pour observer des attributs spécifiques.
   */
  static get observedAttributes(): string[] {
    return this._p_observedAttributes();
  }

  /**
   * Méthode interne pour définir les attributs observés.
   * Peut être surchargée par les classes dérivées.
   * @returns Liste des noms d'attributs à observer.
   */
  protected static _p_observedAttributes(): string[] {
    return [];
  }

  /**
   * Indique si le composant a été chargé au moins une fois.
   * Utile pour différencier le premier chargement des rechargements.
   */
  get alreadyLoaded(): boolean {
    return this.#firstLoad;
  }

  /**
   * Constructeur du composant.
   * Initialise l'event de changement d'attribut et attache un shadow DOM si nécessaire.
   */
  constructor() {
    super();

    if (this._p_isShadowElement()) this.attachShadow({ mode: 'open' });

    // Supprime tout script enfant pour éviter l'exécution indésirable.
    const script = this.querySelector('script');
    if (script) script.remove();
  }

  /**
   * Callback appelée lors d’un changement d’attribut observé.
   * Déclenche l'événement interne de changement d'attribut.
   *
   * @param name Nom de l'attribut modifié.
   * @param oldVal Ancienne valeur.
   * @param newVal Nouvelle valeur.
   */
  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    if (this.#firstLoad) {
      this.#_pendingAttributes ??= new Map<
        string,
        { oldVal: string | null; newVal: string | null }
      >();

      this.#_pendingAttributes.set(name, { oldVal, newVal });

      if (!this.#_updateScheduled) {
        this.#_updateScheduled = true;

        requestAnimationFrame(() => this.#_flushUpdates());
      }
    }
  }

  /**
   * Callback appelée lorsque le composant est ajouté au DOM.
   * Déclenche le rendu du composant.
   */
  connectedCallback(): void {
    if (!this.#firstLoad) {
      Log.time('Render : ' + this.constructor.name);
      this.render();
      Log.timeEnd('Render : ' + this.constructor.name);
    }
  }

  /**
   * Callback appelée lorsque le composant est retiré du DOM.
   * Permet de nettoyer les ressources ou événements.
   */
  disconnectedCallback(): void {
    this._p_preunload();
    this._p_detach();
  }

  /**
   * Déclenche le rendu du composant.
   * Appelle les hooks de préchargement, de rendu et d'attachement.
   */
  render(): void {
    // Empêche de relancer le rendu complet
    if (this.#firstLoad) return;

    this._p_preload();

    const container = this._p_isShadowElement() ? this.shadowRoot : this;
    if (container) {
      if (this._p_isShadowElement()) {
        // On injecte le style de manière sécurisée
        const styleStr = this._p_getStyle();
        if (styleStr) {
          const styleEl = document.createElement('style');
          // .textContent est sécurisé contre l'injection XSS
          styleEl.textContent = styleStr;
          container.appendChild(styleEl);

          this._p_styleElement = styleEl;
        }

        // On gère les feuilles de styles adoptées
        const stylesheets = this._p_getStylesheets();
        if (
          stylesheets.length > 0 &&
          'adoptedStyleSheets' in Document.prototype
        ) {
          (container as ShadowRoot).adoptedStyleSheets = [
            ...(container as ShadowRoot).adoptedStyleSheets,
            ...stylesheets,
          ];
        }
      }

      // Si un template est déjà défini, on l'utilise
      const template = this._p_fromTemplate();
      if (template) {
        const templateContent = template.content.cloneNode(
          true,
        ) as DocumentFragment;
        container.appendChild(templateContent);
      }

      // On construit le DOM interne
      this._p_buildDOM(container);
    }

    this._p_attach();
    this.#firstLoad = true;
  }

  // ======================
  // === Public helpers ===
  // ======================
  //#region public

  /**
   * Récupère ou définit une donnée liée à l'élément.
   * @param name Nom de la donnée.
   * @param options Options de récupération ou de définition.
   * @returns La valeur de la donnée ou l'instance courante.
   */
  data<T>(name: string, opts?: { fromAttribute?: boolean }): T;
  data<T>(name: string, value: T | symbol, fromAttribute?: boolean): this;
  data<T>(
    name: string,
    valueOrOpts?: T | symbol | { fromAttribute?: boolean },
    fromAttribute: boolean = false,
  ): T | this {
    // Cas lecture : opts est un objet ou undefined
    if (
      valueOrOpts === undefined ||
      valueOrOpts === null ||
      (typeof valueOrOpts === 'object' && !('value' in valueOrOpts))
    ) {
      const opts = (valueOrOpts as { fromAttribute?: boolean }) || {};
      return this.#_getData<T>(name, opts.fromAttribute ?? false);
    }

    // Cas écriture : valueOrOpts est T ou symbol
    return this.#_setData(name, valueOrOpts as T, fromAttribute);
  }

  /** Ajoute une ou plusieurs classes CSS à l'élément. */
  addClass(...classNames: string[]): this {
    this.classList.add(...classNames.flatMap((c) => c.split(' ')));
    return this;
  }

  /** Retire une ou plusieurs classes CSS de l'élément. */
  removeClass(...classNames: string[]): this {
    this.classList.remove(...classNames.flatMap((c) => c.split(' ')));
    return this;
  }

  /** Bascule une classe CSS sur l’élément. */
  toggleClass(className: string, force?: boolean): this {
    this.classList.toggle(className, force);
    return this;
  }

  /** Vérifie si l’élément possède une classe CSS donnée. */
  hasClass(className: string): boolean {
    return this.classList.contains(className);
  }

  /**
   * Obtient ou définit un attribut HTML.
   * @param name Nom de l'attribut.
   * @param value Valeur à définir (optionnel).
   * @returns Valeur de l'attribut ou l'instance courante.
   */
  attr(name: string): string | null;
  attr(name: string, value: string | boolean | number): this;
  attr(name: string, value?: string | boolean | number): string | this | null {
    if (value === undefined || value === null) return this.getAttribute(name);
    this.setAttribute(
      name,
      typeof value === 'string' ? value : value.toString(),
    );
    return this;
  }

  /**
   * Manipule les styles CSS de l'élément.
   * @param prop Propriété CSS ou objet de propriétés.
   * @param value Valeur à définir (optionnel).
   * @returns Valeur du style ou l'instance courante.
   */
  css(prop: string): string;
  css(prop: string, value: string): this;
  css(prop: Record<string, string>): this;
  css(prop: string | Record<string, string>, value?: string): string | this {
    if (typeof prop === 'string') {
      if (value === undefined) return this.style[prop as any];
      this.style[prop as any] = value;
    } else {
      for (const [k, v] of Object.entries(prop)) {
        this.style[k as any] = v;
      }
    }
    return this;
  }

  /**
   * Manipule le contenu HTML de l'élément.
   * @param value Valeur à définir (optionnel).
   * @returns Contenu HTML ou l'instance courante.
   */
  html(): string;
  html(value: string): this;
  html(value?: string): string | this {
    if (value === undefined) return this.innerHTML;
    this.innerHTML = value;
    return this;
  }

  /**
   * Manipule le texte de l'élément.
   * @param value Valeur à définir (optionnel).
   * @returns Texte ou l'instance courante.
   */
  text(): string;
  text(value: string): this;
  text(value?: string): string | this {
    if (value === undefined) return this.textContent || '';
    this.textContent = value;
    return this;
  }

  /**
   * Manipule la valeur (pour input/select/textarea).
   * @param value Valeur à définir (optionnel).
   * @returns Valeur ou l'instance courante.
   */
  val(): string | undefined;
  val(value: string): this | undefined;
  val(value?: string): string | this | undefined {
    if ('value' in this) {
      if (value === undefined) return (this as any).value;
      (this as any).value = value;
      return this;
    }
    return undefined;
  }

  /**
   * Ajoute un écouteur d'événement sur l'élément.
   * @param type Type d'événement.
   * @param listener Fonction de rappel.
   * @param options Options d'écoute.
   * @returns L'instance courante.
   */
  on(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): this {
    this.addEventListener(type, listener, options);
    return this;
  }

  /**
   * Retire un écouteur d'événement de l'élément.
   * @param type Type d'événement.
   * @param listener Fonction de rappel.
   * @param options Options d'écoute.
   * @returns L'instance courante.
   */
  off(
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions,
  ): this {
    this.removeEventListener(type, listener, options);
    return this;
  }

  /**
   * Déclenche un événement personnalisé sur l'élément.
   * @param type Type d'événement.
   * @param detail Détail de l'événement.
   * @returns L'instance courante.
   */
  trigger(type: string, detail?: any): this {
    this.dispatchEvent(new CustomEvent(type, { detail }));
    return this;
  }

  /**
   * Ajoute un ou plusieurs nœuds ou chaînes HTML à la fin de l'élément.
   * @param nodes Nœuds ou chaînes HTML à ajouter.
   * @returns L'instance courante.
   */
  append(...nodes: (Node | string)[]): this {
    for (const node of nodes) {
      if (typeof node === 'string') {
        this.insertAdjacentHTML('beforeend', node);
      } else {
        this.appendChild(node);
      }
    }
    return this;
  }

  /**
   * Ajoute l'élément courant à un autre élément cible.
   * @param target Élément cible.
   * @returns L'instance courante.
   */
  appendTo(target: Element): this {
    target?.appendChild(this);
    return this;
  }

  /**
   * Ajoute un ou plusieurs nœuds ou chaînes HTML au début de l'élément.
   * @param nodes Nœuds ou chaînes HTML à ajouter.
   * @returns L'instance courante.
   */
  prepend(...nodes: (Node | string)[]): this {
    for (let i = nodes.length - 1; i >= 0; --i) {
      const node = nodes[i];
      if (typeof node === 'string') {
        this.insertAdjacentHTML('afterbegin', node);
      } else {
        this.insertBefore(node, this.firstChild);
      }
    }
    return this;
  }

  /**
   * Ajoute l'élément courant au début d'un autre élément cible.
   * @param target Élément cible.
   * @returns L'instance courante.
   */
  prependTo(target: Element): this {
    target?.insertBefore(this, target.firstChild);
    return this;
  }

  /**
   * Insère un ou plusieurs nœuds ou chaînes HTML avant l'élément courant.
   * @param nodes Nœuds ou chaînes HTML à insérer.
   * @returns L'instance courante.
   */
  before(...nodes: (Node | string)[]): this {
    for (const node of nodes) {
      if (typeof node === 'string') {
        this.insertAdjacentHTML('beforebegin', node);
      } else {
        this.parentNode?.insertBefore(node, this);
      }
    }
    return this;
  }

  /**
   * Insère un ou plusieurs nœuds ou chaînes HTML après l'élément courant.
   * @param nodes Nœuds ou chaînes HTML à insérer.
   * @returns L'instance courante.
   */
  after(...nodes: (Node | string)[]): this {
    for (let i = nodes.length - 1; i >= 0; --i) {
      const node = nodes[i];
      if (typeof node === 'string') {
        this.insertAdjacentHTML('afterend', node);
      } else if (this.parentNode) {
        if (this.nextSibling) {
          this.parentNode.insertBefore(node, this.nextSibling);
        } else {
          this.parentNode.appendChild(node);
        }
      }
    }
    return this;
  }

  /**
   * Cache l'élément en lui appliquant la classe `hidden`
   * @returns Chaîne
   */
  hide() {
    return this.addClass('hidden');
  }

  /**
   * Affiche l'élément en lui enlevant la classe `hidden`
   * @returns Chaîne
   */
  show() {
    return this.removeClass('hidden');
  }
  //#endregion

  // ======================
  // === Private helpers ==
  // ======================
  //#region private

  /**
   * Récupère une donnée interne ou depuis un attribut data-*.
   * @param name Nom de la donnée.
   * @param fromAttribute Si vrai, lit depuis l'attribut data-*.
   * @returns La valeur de la donnée.
   */
  #_getData<T>(name: string, fromAttribute: boolean): T {
    let data: any = EMPTY_STRING;

    if (fromAttribute) {
      data = this.getAttribute(`data-${name}`);
    } else {
      if (this.hasAttribute(`data-${name}`)) {
        data = this.#_getData<T>(name, true);
        this.removeAttribute(`data-${name}`);
        this._p_setData(name, data);
      } else {
        data = this._p_getData<T>(name);
      }
    }

    return data;
  }

  /**
   * Définit une donnée interne ou dans un attribut data-*.
   * @param name Nom de la donnée.
   * @param value Valeur à définir.
   * @param fromAttribute Si vrai, écrit dans l'attribut data-*.
   * @returns L'instance courante.
   */
  #_setData<T>(name: string, value: T, fromAttribute: boolean): this {
    if (fromAttribute) this.setAttribute(`data-${name}`, String(value));
    else this._p_setData(name, value);
    return this;
  }

  /**
   * Exécute toutes les mises à jour en attente en une seule fois.
   */
  #_flushUpdates(): void {
    // On libère le verrou pour permettre de futures mises à jour
    this.#_updateScheduled = false;

    if (this.#_pendingAttributes === null) return;

    if (this._p_isUpdateForAllAttributes()) this._p_update('all', null, null);
    else {
      // On itère sur tous les changements accumulés
      for (const [name, { oldVal, newVal }] of this.#_pendingAttributes) {
        if (this._p_update(name, oldVal, newVal) === 'break') break;
      }
    }

    // On vide la liste des modifications en attente
    this.#_pendingAttributes.clear();

    this._p_postFlush();
  }
  //#endregion

  // ======================
  // === Protected ========
  // ======================
  //#region protected
  /**
   * Demande une mise à jour de l'élément.
   * La mise à jour sera effectuée lors du prochain frame via requestAnimationFrame.
   */
  protected _p_requestAttributeUpdate(): this {
    if (this.#firstLoad && !this.#_updateScheduled) {
      this.#_updateScheduled = true;
      requestAnimationFrame(() => this.#_flushUpdates());
    }

    return this;
  }

  /**
   * Ajoute des attributs en attente de traitement.
   * @param name Nom de l'attribut.
   * @param oldVal Ancienne valeur
   * @param newVal Nouvelle valeur
   * @returns Chaîne
   */
  protected _p_addPendingAttribute(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): this {
    this.#_pendingAttributes ??= new Map<
      string,
      { oldVal: string | null; newVal: string | null }
    >();

    this.#_pendingAttributes.set(name, { oldVal, newVal });

    return this;
  }

  /**
   * Récupère une donnée interne.
   * @param name Nom de la donnée.
   * @returns Valeur de la donnée.
   */
  protected _p_getData<T>(name: string): T {
    this.#_data ??= new Map<string, any>();

    return this.#_data.get(name);
  }

  /**
   * Définit une donnée interne.
   * @param name Nom de la donnée.
   * @param value Valeur à définir.
   * @returns L'instance courante.
   */
  protected _p_setData<T>(name: string, value: T): this {
    this.#_data ??= new Map<string, any>();

    this.#_data.set(name, value);
    return this;
  }

  /**
   * Vérifie si une donnée interne existe.
   * @param name Nom de la donnée.
   * @returns Vrai si la donnée existe.
   */
  protected _p_hasData(name: string): boolean {
    return this.#_data === null ? false : this.#_data.has(name);
  }

  /**
   * Crée un élément HTML générique avec options (classes, attributs, data, enfant).
   * @param tag Nom de la balise HTML à créer.
   * @param options Options de création (classes, attributs, data, enfant).
   * @returns L'élément HTML créé.
   */
  protected _p_createTag<T extends HTMLElement>(
    tag: string,
    options?: TagCreatorConstructor,
  ): T;
  /**
   * Crée un élément <span> avec options.
   * @param tag 'span'
   * @param options Options de création.
   * @returns L'élément HTMLSpanElement créé.
   */
  protected _p_createTag<HTMLSpanElement>(
    tag: 'span',
    options?: TagCreatorConstructor,
  ): HTMLSpanElement;
  /**
   * Crée un élément <slot> avec options.
   * @param tag 'slot'
   * @param options Options de création.
   * @returns L'élément HTMLSlotElement créé.
   */
  protected _p_createTag<HTMLSlotElement>(
    tag: 'slot',
    options?: TagCreatorConstructor,
  ): HTMLSlotElement;
  /**
   * Crée un élément <div> avec options.
   * @param tag 'div'
   * @param options Options de création.
   * @returns L'élément HTMLDivElement créé.
   */
  protected _p_createTag<HTMLDivElement>(
    tag: 'div',
    options?: TagCreatorConstructor,
  ): HTMLDivElement;
  /**
   * Implémentation de la création d'un élément HTML avec options.
   * @param tag Nom de la balise HTML à créer.
   * @param options Options de création (classes, attributs, data, enfant).
   * @returns L'élément HTML créé.
   */
  protected _p_createTag<T extends HTMLElement>(
    tag: string,
    options?: TagCreatorConstructor,
  ): T {
    const element = document.createElement(tag) as T;

    if (options) {
      const { classes, attributes, data, child } = options;

      if (classes) {
        if (attributes) attributes['class'] = classes.join(' ');
        else element.classList.add(...classes);
      }

      if (data) {
        for (const [dataName, dataValue] of Object.entries(data)) {
          element.setAttribute(`data-${dataName}`, String(dataValue));
        }
      }

      if (attributes) {
        for (const [attrName, attrValue] of Object.entries(attributes)) {
          element.setAttribute(attrName, String(attrValue));
        }
      }

      if (child)
        element.appendChild(
          typeof child === 'string' ? document.createTextNode(child) : child,
        );
    }

    return element;
  }

  /**
   * Crée un élément <slot> avec nom et valeur par défaut.
   * @param name Nom du slot (optionnel).
   * @param defaultValue Valeur par défaut si le slot est vide (optionnel).
   * @returns L'élément HTMLSlotElement créé.
   */
  protected _p_createSlot(
    name?: string,
    defaultValue?: HTMLElement,
  ): HTMLSlotElement {
    const slot = this._p_createTag<HTMLSlotElement>('slot', {
      attributes: name ? { name } : undefined,
      child: defaultValue || null,
    });
    return slot;
  }

  /**
   * Crée plusieurs éléments <slot> selon les options fournies.
   * @param options Liste d'options pour chaque slot.
   * @returns Tableau d'éléments HTMLSlotElement créés.
   */
  protected _p_createSlots(
    ...options: { name?: string; defaultValue?: HTMLElement }[]
  ): HTMLSlotElement[] {
    const slots: HTMLSlotElement[] = [];
    for (const opt of options) {
      slots.push(this._p_createSlot(opt.name, opt.defaultValue));
    }
    return slots;
  }

  /**
   * Crée un élément <span> avec options.
   * @param options Options de création.
   * @returns L'élément HTMLSpanElement créé.
   */
  protected _p_createSpan(options?: TagCreatorConstructor): HTMLSpanElement {
    return this._p_createTag('span', options);
  }

  /**
   * Crée plusieurs éléments <span> selon les options fournies.
   * @param options Liste d'options pour chaque span.
   * @returns Tableau d'éléments HTMLSpanElement créés.
   */
  protected _p_createSpans(
    ...options: (TagCreatorConstructor | null)[]
  ): HTMLSpanElement[] {
    const spans: HTMLSpanElement[] = [];
    for (const opt of options) {
      spans.push(this._p_createSpan(opt || undefined));
    }
    return spans;
  }

  /**
   * Crée un élément <div> avec options.
   * @param options Options de création.
   * @returns L'élément HTMLDivElement créé.
   */
  protected _p_createDiv(options?: TagCreatorConstructor): HTMLDivElement {
    return this._p_createTag('div', options);
  }

  /**
   * Crée plusieurs éléments <div> selon les options fournies.
   * @param options Liste d'options pour chaque div.
   * @returns Tableau d'éléments HTMLDivElement créés.
   */
  protected _p_createDivs(
    ...options: (TagCreatorConstructor | null)[]
  ): HTMLDivElement[] {
    const divs: HTMLDivElement[] = [];
    for (const opt of options) {
      divs.push(this._p_createDiv(opt || undefined));
    }
    return divs;
  }

  /**
   * Crée un nœud de texte.
   * @param text Texte à insérer dans le nœud.
   * @returns Le nœud de texte créé.
   */
  protected _p_createTextNode(text: string): Text {
    return document.createTextNode(text);
  }

  /**
   * Indique si l'élément est à l'intérieur d'un ShadowRoot.
   */
  get _p_isInsideShadowRoot(): boolean {
    return this.getRootNode({ composed: false }) instanceof ShadowRoot;
  }

  // ======================
  // === Virtual methods ==
  // ======================

  /**
   * Hook appelé après le flush des mises à jour d'attributs.
   */
  protected _p_postFlush(): void {}

  /**
   * Si la méthode _p_update doit être appelé une seule fois ou non.
   * @returns `true` pour appeler _p_update une seule fois, `false` pour l'appeler à chaque changement d'attribut.
   */
  protected _p_isUpdateForAllAttributes(): boolean {
    return false;
  }

  /**
   * Retourne le style CSS à injecter dans le composant.
   * @returns Chaîne de style CSS.
   * @deprecated Utiliser _p_getStylesheet ou _p_getStylesheets à la place.
   */
  protected _p_getStyle(): string {
    return EMPTY_STRING;
  }

  /**
   * Retourne la liste des feuilles de style CSS à injecter dans le composant.
   * @returns Tableau de feuilles de style CSS.
   */
  protected _p_getStylesheets(): CSSStyleSheet[] {
    return [];
  }

  /**
   * Hook appelé avant le rendu du composant.
   * À surcharger dans les classes dérivées.
   */
  protected _p_preload(): void {}

  /**
   * Hook appelé à la création de l'élément.
   *
   * À surcharger dans les classes dérivées, doit créer le dom via des nodes et non via innerHTML.
   *
   * Est appelé qu'une seule fois.
   *
   * @param container Le conteneur (ShadowRoot ou this) où construire le DOM.
   */
  protected _p_buildDOM(container: ShadowRoot | HTMLElement): void {}

  protected _p_fromTemplate(): HTMLTemplateElement | null {
    return null;
  }

  /**
   * Hook appelé LORS D'UN CHANGEMENT d'attribut, après le premier rendu.
   *
   * C'est ici que doit se faire la mise à jour "chirurgicale" du DOM.
   *
   * @param name Nom de l'attribut modifié.
   * @param oldVal Ancienne valeur.
   * @param newVal Nouvelle valeur.
   */
  protected _p_update(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void | Nullable<'break'> {}

  /**
   * Hook appelé après le rendu du composant.
   * À surcharger dans les classes dérivées.
   */
  protected _p_attach(): void {}

  /**
   * Hook appelé avant le déchargement du composant.
   * À surcharger dans les classes dérivées.
   */
  protected _p_preunload(): void {}

  /**
   * Hook appelé lors du détachement du composant.
   * À surcharger dans les classes dérivées.
   */
  protected _p_detach(): void {}

  /**
   * Indique si le composant doit utiliser un Shadow DOM.
   * À surcharger dans les classes dérivées.
   * @returns Vrai si Shadow DOM.
   */
  protected _p_isShadowElement(): boolean {
    return true;
  }
  //#endregion

  // ======================
  // === Static API =======
  // ======================
  //#region static

  /**
   * Méthode statique pour créer une instance du composant.
   * Doit être implémentée dans les classes dérivées.
   * @throws Erreur si non implémentée.
   */
  static Create(...args: any[]): BnumElement {
    throw new Error('Create method must be implemented in derived class.');
  }

  /**
   * Retourne le nom de la balise du composant.
   * Doit être implémenté dans les classes dérivées.
   * @throws Erreur si non implémenté.
   * @readonly
   */
  static get TAG(): string {
    throw new Error('TAG getter must be implemented in derived class.');
  }

  /**
   * Construit une feuille de style CSS à partir d'une chaîne CSS.
   * @param cssText CSS à ajouter
   * @returns Feuille de style
   */
  static ConstructCSSStyleSheet(cssText: string): CSSStyleSheet {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssText);
    return sheet;
  }

  static CreateTemplate(html: string): HTMLTemplateElement {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template;
  }

  /**
   * Définit le composant comme élément personnalisé si ce n'est pas déjà fait.
   */
  static TryDefine(): void {
    this.TryDefineElement(
      this.TAG,
      this as unknown as CustomElementConstructor,
    );
  }

  /**
   * Définit un élément personnalisé avec le tag et le constructeur donnés.
   * @param tag Nom de la balise personnalisée.
   * @param constructor Constructeur de l'élément.
   */
  static TryDefineElement<T extends BnumElement>(
    tag: string,
    constructor: CustomElementConstructor,
  ): void {
    if (!customElements.get(tag)) {
      customElements.define(tag, constructor);
    }
  }

  //#endregion
}
