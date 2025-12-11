var Bnum = (function (exports) {
  'use strict';

  const EMPTY_STRING = '';

  function Capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }

  function CapitalizeLine(line) {
    return line.split(' ')
            .map(Capitalize)
            .join(' ');
  }

  var LogEnum;
  (function (LogEnum) {
      LogEnum[LogEnum["TRACE"] = 0] = "TRACE";
      LogEnum[LogEnum["DEBUG"] = 1] = "DEBUG";
      LogEnum[LogEnum["INFO"] = 2] = "INFO";
      LogEnum[LogEnum["WARN"] = 3] = "WARN";
      LogEnum[LogEnum["ERROR"] = 4] = "ERROR";
  })(LogEnum || (LogEnum = {}));

  const DEFAULT_CONFIG = {
      local_keys: {
          today: 'Aujourd\'hui',
          tomorrow: 'Demain',
          day: 'Journée',
          invalid_date: 'Date invalide',
          last_mails: 'Courriers récents',
          no_mails: 'Aucun courrier...',
      },
      console_logging: true,
      console_logging_level: LogEnum.TRACE,
      tag_prefix: 'bnum',
  };

  /**
   * Vérifie si une valeur est un objet (et pas un tableau).
   * @param item Item à vérifier
   * @returns Vrai si l'item est un objet (et pas un tableau), sinon faux.
   */
  function isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
  }
  /**
   * Fonction de fusion profonde (Deep Merge) native.
   * @param target L'objet cible (qui sera modifié).
   * @param source L'objet source (qui écrase la cible).
   * @returns L'objet cible fusionné.
   */
  function deepMerge(target, source) {
      // Si l'un des deux n'est pas un objet, on retourne la source (écrasement)
      if (!isObject(target) || !isObject(source)) {
          return source;
      }
      const output = target;
      Object.keys(source).forEach((key) => {
          const targetValue = output[key];
          const sourceValue = source[key];
          if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
              // Choix architectural : Pour les tableaux de config, on remplace souvent tout le tableau.
              // Si tu préfères concaténer : output[key] = targetValue.concat(sourceValue);
              output[key] = sourceValue;
          }
          else if (isObject(targetValue) && isObject(sourceValue)) {
              // Récursion pour les objets imbriqués
              output[key] = deepMerge(targetValue, sourceValue);
          }
          else {
              // Assignation directe pour les primitives
              output[key] = sourceValue;
          }
      });
      return output;
  }
  // Variable locale au module (privée) pour stocker l'état
  let _currentConfig = { ...DEFAULT_CONFIG };
  /**
   * Gestionnaire de configuration global pour Bnum.
   */
  class BnumConfig {
      /**
       * Initialise la configuration en fusionnant les défauts avec un objet partiel.
       * À appeler au démarrage si une config globale existe.
       */
      static Initialize(overrides) {
          _currentConfig = deepMerge(_currentConfig, overrides);
      }
      static Get(key) {
          if (key) {
              return _currentConfig[key];
          }
          return _currentConfig;
      }
      /**
       * Met à jour la configuration à la volée.
       */
      static Set(overrides) {
          this.Initialize(overrides);
          // Optionnel : Déclencher un événement global pour dire que la config a changé
          // document.dispatchEvent(new CustomEvent('bnum:config-changed', { detail: _currentConfig }));
      }
      /**
       * Reset la configuration aux valeurs par défaut
       */
      static Reset() {
          _currentConfig = { ...DEFAULT_CONFIG };
      }
      /**
       * Récupère une copie profonde de la configuration actuelle.
       * @readonly
       */
      static get Clone() {
          return JSON.parse(JSON.stringify(_currentConfig));
      }
  }

  class Log {
      static trace(context, ...args) {
          if (BnumConfig.Get('console_logging') &&
              BnumConfig.Get('console_logging_level') <= LogEnum.TRACE)
              console.trace(`[${context}] ${args.join(' ')}`);
      }
      static debug(context, ...args) {
          if (BnumConfig.Get('console_logging') &&
              BnumConfig.Get('console_logging_level') <= LogEnum.DEBUG)
              console.debug(`🔎 [${context}] ${args.join(' ')}`);
      }
      static info(context, ...args) {
          if (BnumConfig.Get('console_logging') &&
              BnumConfig.Get('console_logging_level') <= LogEnum.INFO)
              console.info(`(i) [${context}] ${args.join(' ')}`);
      }
      static warn(context, ...args) {
          if (BnumConfig.Get('console_logging') &&
              BnumConfig.Get('console_logging_level') <= LogEnum.WARN)
              console.warn(`/!\\ [${context}] ${args.join(' ')}`);
      }
      static error(context, ...args) {
          if (BnumConfig.Get('console_logging') &&
              BnumConfig.Get('console_logging_level') <= LogEnum.ERROR)
              console.error(`### [${context}] ${args.join(' ')}`);
      }
      static time(label) {
          if (BnumConfig.Get('console_logging') &&
              BnumConfig.Get('console_logging_level') <= LogEnum.DEBUG)
              console.time(label);
      }
      static timeEnd(label) {
          if (BnumConfig.Get('console_logging') &&
              BnumConfig.Get('console_logging_level') <= LogEnum.DEBUG)
              console.timeEnd(label);
      }
  }

  /**
   * Classe de base pour les composants bnum personnalisés.
   *
   * Fournit les méthodes de cycle de vie et de gestion des attributs pour les webcomponents.
   * Permet la gestion de données internes, d'attributs, de classes CSS, de styles, d'événements, et de rendu.
   */
  class BnumElement extends HTMLElement {
      /** Données mises en mémoire, accessibles via la méthode data(). */
      #_data = null;
      #_pendingAttributes = null;
      #_updateScheduled = false;
      /** Indique si le composant a déjà été chargé une première fois. */
      #firstLoad = false;
      /** Symbole utilisé pour indiquer l'absence de valeur lors de l'accès aux données. */
      static #_NoItem = Symbol('NoItem');
      _p_styleElement = null;
      /**
       * Retourne la liste des attributs observés par le composant.
       * À surcharger dans les classes dérivées pour observer des attributs spécifiques.
       */
      static get observedAttributes() {
          return this._p_observedAttributes();
      }
      /**
       * Méthode interne pour définir les attributs observés.
       * Peut être surchargée par les classes dérivées.
       * @returns Liste des noms d'attributs à observer.
       */
      static _p_observedAttributes() {
          return [];
      }
      /**
       * Indique si le composant a été chargé au moins une fois.
       * Utile pour différencier le premier chargement des rechargements.
       */
      get alreadyLoaded() {
          return this.#firstLoad;
      }
      /**
       * Constructeur du composant.
       * Initialise l'event de changement d'attribut et attache un shadow DOM si nécessaire.
       */
      constructor() {
          super();
          if (this._p_isShadowElement())
              this.attachShadow({ mode: 'open' });
          // Supprime tout script enfant pour éviter l'exécution indésirable.
          const script = this.querySelector('script');
          if (script)
              script.remove();
      }
      /**
       * Callback appelée lors d’un changement d’attribut observé.
       * Déclenche l'événement interne de changement d'attribut.
       *
       * @param name Nom de l'attribut modifié.
       * @param oldVal Ancienne valeur.
       * @param newVal Nouvelle valeur.
       */
      attributeChangedCallback(name, oldVal, newVal) {
          if (this.#firstLoad) {
              this.#_pendingAttributes ??= new Map();
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
      connectedCallback() {
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
      disconnectedCallback() {
          this._p_preunload();
          this._p_detach();
      }
      /**
       * Déclenche le rendu du composant.
       * Appelle les hooks de préchargement, de rendu et d'attachement.
       */
      render() {
          // Empêche de relancer le rendu complet
          if (this.#firstLoad)
              return;
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
                  if (stylesheets.length > 0 &&
                      'adoptedStyleSheets' in Document.prototype) {
                      container.adoptedStyleSheets = [
                          ...container.adoptedStyleSheets,
                          ...stylesheets,
                      ];
                  }
              }
              // Si un template est déjà défini, on l'utilise
              const template = this._p_fromTemplate();
              if (template) {
                  const templateContent = template.content.cloneNode(true);
                  container.appendChild(templateContent);
              }
              // On construit le DOM interne
              this._p_buildDOM(container);
          }
          this._p_attach();
          this.#firstLoad = true;
      }
      data(name, valueOrOpts, fromAttribute = false) {
          // Cas lecture : opts est un objet ou undefined
          if (valueOrOpts === undefined ||
              valueOrOpts === null ||
              (typeof valueOrOpts === 'object' && !('value' in valueOrOpts))) {
              const opts = valueOrOpts || {};
              return this.#_getData(name, opts.fromAttribute ?? false);
          }
          // Cas écriture : valueOrOpts est T ou symbol
          return this.#_setData(name, valueOrOpts, fromAttribute);
      }
      /** Ajoute une ou plusieurs classes CSS à l'élément. */
      addClass(...classNames) {
          this.classList.add(...classNames.flatMap((c) => c.split(' ')));
          return this;
      }
      /** Retire une ou plusieurs classes CSS de l'élément. */
      removeClass(...classNames) {
          this.classList.remove(...classNames.flatMap((c) => c.split(' ')));
          return this;
      }
      /** Bascule une classe CSS sur l’élément. */
      toggleClass(className, force) {
          this.classList.toggle(className, force);
          return this;
      }
      /** Vérifie si l’élément possède une classe CSS donnée. */
      hasClass(className) {
          return this.classList.contains(className);
      }
      attr(name, value) {
          if (value === undefined || value === null)
              return this.getAttribute(name);
          this.setAttribute(name, typeof value === 'string' ? value : value.toString());
          return this;
      }
      css(prop, value) {
          if (typeof prop === 'string') {
              if (value === undefined)
                  return this.style[prop];
              this.style[prop] = value;
          }
          else {
              for (const [k, v] of Object.entries(prop)) {
                  this.style[k] = v;
              }
          }
          return this;
      }
      html(value) {
          if (value === undefined)
              return this.innerHTML;
          this.innerHTML = value;
          return this;
      }
      text(value) {
          if (value === undefined)
              return this.textContent || '';
          this.textContent = value;
          return this;
      }
      val(value) {
          if ('value' in this) {
              if (value === undefined)
                  return this.value;
              this.value = value;
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
      on(type, listener, options) {
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
      off(type, listener, options) {
          this.removeEventListener(type, listener, options);
          return this;
      }
      /**
       * Déclenche un événement personnalisé sur l'élément.
       * @param type Type d'événement.
       * @param detail Détail de l'événement.
       * @returns L'instance courante.
       */
      trigger(type, detail) {
          this.dispatchEvent(new CustomEvent(type, { detail }));
          return this;
      }
      /**
       * Ajoute un ou plusieurs nœuds ou chaînes HTML à la fin de l'élément.
       * @param nodes Nœuds ou chaînes HTML à ajouter.
       * @returns L'instance courante.
       */
      append(...nodes) {
          for (const node of nodes) {
              if (typeof node === 'string') {
                  this.insertAdjacentHTML('beforeend', node);
              }
              else {
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
      appendTo(target) {
          target?.appendChild(this);
          return this;
      }
      /**
       * Ajoute un ou plusieurs nœuds ou chaînes HTML au début de l'élément.
       * @param nodes Nœuds ou chaînes HTML à ajouter.
       * @returns L'instance courante.
       */
      prepend(...nodes) {
          for (let i = nodes.length - 1; i >= 0; --i) {
              const node = nodes[i];
              if (typeof node === 'string') {
                  this.insertAdjacentHTML('afterbegin', node);
              }
              else {
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
      prependTo(target) {
          target?.insertBefore(this, target.firstChild);
          return this;
      }
      /**
       * Insère un ou plusieurs nœuds ou chaînes HTML avant l'élément courant.
       * @param nodes Nœuds ou chaînes HTML à insérer.
       * @returns L'instance courante.
       */
      before(...nodes) {
          for (const node of nodes) {
              if (typeof node === 'string') {
                  this.insertAdjacentHTML('beforebegin', node);
              }
              else {
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
      after(...nodes) {
          for (let i = nodes.length - 1; i >= 0; --i) {
              const node = nodes[i];
              if (typeof node === 'string') {
                  this.insertAdjacentHTML('afterend', node);
              }
              else if (this.parentNode) {
                  if (this.nextSibling) {
                      this.parentNode.insertBefore(node, this.nextSibling);
                  }
                  else {
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
      #_getData(name, fromAttribute) {
          let data = EMPTY_STRING;
          if (fromAttribute) {
              data = this.getAttribute(`data-${name}`);
          }
          else {
              if (this.hasAttribute(`data-${name}`)) {
                  data = this.#_getData(name, true);
                  this.removeAttribute(`data-${name}`);
                  this._p_setData(name, data);
              }
              else {
                  data = this._p_getData(name);
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
      #_setData(name, value, fromAttribute) {
          if (fromAttribute)
              this.setAttribute(`data-${name}`, String(value));
          else
              this._p_setData(name, value);
          return this;
      }
      /**
       * Exécute toutes les mises à jour en attente en une seule fois.
       */
      #_flushUpdates() {
          // On libère le verrou pour permettre de futures mises à jour
          this.#_updateScheduled = false;
          if (this.#_pendingAttributes === null)
              return;
          if (this._p_isUpdateForAllAttributes())
              this._p_update('all', null, null);
          else {
              // On itère sur tous les changements accumulés
              for (const [name, { oldVal, newVal }] of this.#_pendingAttributes) {
                  if (this._p_update(name, oldVal, newVal) === 'break')
                      break;
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
      _p_requestAttributeUpdate() {
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
      _p_addPendingAttribute(name, oldVal, newVal) {
          this.#_pendingAttributes ??= new Map();
          this.#_pendingAttributes.set(name, { oldVal, newVal });
          return this;
      }
      /**
       * Récupère une donnée interne.
       * @param name Nom de la donnée.
       * @returns Valeur de la donnée.
       */
      _p_getData(name) {
          this.#_data ??= new Map();
          return this.#_data.get(name);
      }
      /**
       * Définit une donnée interne.
       * @param name Nom de la donnée.
       * @param value Valeur à définir.
       * @returns L'instance courante.
       */
      _p_setData(name, value) {
          this.#_data ??= new Map();
          this.#_data.set(name, value);
          return this;
      }
      /**
       * Vérifie si une donnée interne existe.
       * @param name Nom de la donnée.
       * @returns Vrai si la donnée existe.
       */
      _p_hasData(name) {
          return this.#_data === null ? false : this.#_data.has(name);
      }
      /**
       * Implémentation de la création d'un élément HTML avec options.
       * @param tag Nom de la balise HTML à créer.
       * @param options Options de création (classes, attributs, data, enfant).
       * @returns L'élément HTML créé.
       */
      _p_createTag(tag, options) {
          const element = document.createElement(tag);
          if (options) {
              const { classes, attributes, data, child } = options;
              if (classes) {
                  if (attributes)
                      attributes['class'] = classes.join(' ');
                  else
                      element.classList.add(...classes);
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
                  element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
          }
          return element;
      }
      /**
       * Crée un élément <slot> avec nom et valeur par défaut.
       * @param name Nom du slot (optionnel).
       * @param defaultValue Valeur par défaut si le slot est vide (optionnel).
       * @returns L'élément HTMLSlotElement créé.
       */
      _p_createSlot(name, defaultValue) {
          const slot = this._p_createTag('slot', {
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
      _p_createSlots(...options) {
          const slots = [];
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
      _p_createSpan(options) {
          return this._p_createTag('span', options);
      }
      /**
       * Crée plusieurs éléments <span> selon les options fournies.
       * @param options Liste d'options pour chaque span.
       * @returns Tableau d'éléments HTMLSpanElement créés.
       */
      _p_createSpans(...options) {
          const spans = [];
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
      _p_createDiv(options) {
          return this._p_createTag('div', options);
      }
      /**
       * Crée plusieurs éléments <div> selon les options fournies.
       * @param options Liste d'options pour chaque div.
       * @returns Tableau d'éléments HTMLDivElement créés.
       */
      _p_createDivs(...options) {
          const divs = [];
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
      _p_createTextNode(text) {
          return document.createTextNode(text);
      }
      /**
       * Indique si l'élément est à l'intérieur d'un ShadowRoot.
       */
      get _p_isInsideShadowRoot() {
          return this.getRootNode({ composed: false }) instanceof ShadowRoot;
      }
      // ======================
      // === Virtual methods ==
      // ======================
      /**
       * Hook appelé après le flush des mises à jour d'attributs.
       */
      _p_postFlush() { }
      /**
       * Si la méthode _p_update doit être appelé une seule fois ou non.
       * @returns `true` pour appeler _p_update une seule fois, `false` pour l'appeler à chaque changement d'attribut.
       */
      _p_isUpdateForAllAttributes() {
          return false;
      }
      /**
       * Retourne le style CSS à injecter dans le composant.
       * @returns Chaîne de style CSS.
       * @deprecated Utiliser _p_getStylesheet ou _p_getStylesheets à la place.
       */
      _p_getStyle() {
          return EMPTY_STRING;
      }
      /**
       * Retourne la liste des feuilles de style CSS à injecter dans le composant.
       * @returns Tableau de feuilles de style CSS.
       */
      _p_getStylesheets() {
          return [];
      }
      /**
       * Hook appelé avant le rendu du composant.
       * À surcharger dans les classes dérivées.
       */
      _p_preload() { }
      /**
       * Hook appelé à la création de l'élément.
       *
       * À surcharger dans les classes dérivées, doit créer le dom via des nodes et non via innerHTML.
       *
       * Est appelé qu'une seule fois.
       *
       * @param container Le conteneur (ShadowRoot ou this) où construire le DOM.
       */
      _p_buildDOM(container) { }
      _p_fromTemplate() {
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
      _p_update(name, oldVal, newVal) { }
      /**
       * Hook appelé après le rendu du composant.
       * À surcharger dans les classes dérivées.
       */
      _p_attach() { }
      /**
       * Hook appelé avant le déchargement du composant.
       * À surcharger dans les classes dérivées.
       */
      _p_preunload() { }
      /**
       * Hook appelé lors du détachement du composant.
       * À surcharger dans les classes dérivées.
       */
      _p_detach() { }
      /**
       * Indique si le composant doit utiliser un Shadow DOM.
       * À surcharger dans les classes dérivées.
       * @returns Vrai si Shadow DOM.
       */
      _p_isShadowElement() {
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
      static Create(...args) {
          throw new Error('Create method must be implemented in derived class.');
      }
      /**
       * Retourne le nom de la balise du composant.
       * Doit être implémenté dans les classes dérivées.
       * @throws Erreur si non implémenté.
       * @readonly
       */
      static get TAG() {
          throw new Error('TAG getter must be implemented in derived class.');
      }
      /**
       * Construit une feuille de style CSS à partir d'une chaîne CSS.
       * @param cssText CSS à ajouter
       * @returns Feuille de style
       */
      static ConstructCSSStyleSheet(cssText) {
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(cssText);
          return sheet;
      }
      static CreateTemplate(html) {
          const template = document.createElement('template');
          template.innerHTML = html;
          return template;
      }
      /**
       * Définit le composant comme élément personnalisé si ce n'est pas déjà fait.
       */
      static TryDefine() {
          this.TryDefineElement(this.TAG, this);
      }
      /**
       * Définit un élément personnalisé avec le tag et le constructeur donnés.
       * @param tag Nom de la balise personnalisée.
       * @param constructor Constructeur de l'élément.
       */
      static TryDefineElement(tag, constructor) {
          if (!customElements.get(tag)) {
              customElements.define(tag, constructor);
          }
      }
  }

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var event = {exports: {}};

  /**
   * @template T
   * @callback OnCallbackAddedCallback
   * @param {string} key
   * @param {T} callbackAdded
   * @return {void}
   */

  var JsEvent_1;
  var hasRequiredJsEvent;

  function requireJsEvent () {
  	if (hasRequiredJsEvent) return JsEvent_1;
  	hasRequiredJsEvent = 1;
  	/**
  	 * @template T
  	 * @callback OnCallbackRemovedCallback
  	 * @param {string} key
  	 * @param {T} callbackRemoved
  	 * @return {void}
  	 */

  	/**
  	 * @class
  	 * @classdesc Contient les données d'un callback. La fonction et les arguments.
  	 * @template T
  	 * @package
  	 */
  	class JsEventData {
  	  /**
  	   * T doit être une fonction
  	   * @param {T} callback Fonction qui sera appelé
  	   * @param {Array} args Arguments à ajouter lorsque la fonction sera appelé
  	   */
  	  constructor(callback, args) {
  	    /**
  	     * Fonction qui sera appelé
  	     * @type {T}
  	     */
  	    this.callback = callback;
  	    /**
  	     * Arguments à ajouter lorsque la fonction sera appelé
  	     * @type {Array}
  	     */
  	    this.args = args;
  	  }
  	}

  	/**
  	 * @class
  	 * @classdesc Représente un évènement. On lui ajoute ou supprime des callbacks, puis on les appelle les un après les autres.
  	 * @template T
  	 */
  	class JsEvent {
  	  #_onnadded;
  	  #_onremoved;
  	  /**
  	   * Constructeur de la classe.
  	   */
  	  constructor() {
  	    /**
  	     * Liste des évènements à appeler
  	     * @type {Object<string, JsEventData<T>>}
  	     * @member
  	     */
  	    this.events = {};
  	  }

  	  /**
  	   * Fire when a callback is added
  	   * @type {JsEvent<OnCallbackAddedCallback<T>>}
  	   * @readonly
  	   * @event
  	   */
  	  get onadded() {
  	    if (!this.#_onnadded) this.#_onnadded = new JsEvent();

  	    return this.#_onnadded;
  	  }

  	  /**
  	   * Fire when a callback is removed
  	   * @type {JsEvent<OnCallbackRemovedCallback<T>>}
  	   * @event
  	   * @readonly
  	   */
  	  get onremoved() {
  	    if (!this.#_onremoved) this.#_onremoved = new JsEvent();

  	    return this.#_onremoved;
  	  }

  	  /**
  	   * Ajoute un callback
  	   * @param {T} event Callback qui sera appelé lors de l'appel de l'évènement
  	   * @param  {...any} args Liste des arguments qui seront passé aux callback
  	   * @returns {string} Clé créée
  	   * @fires JsEvent.onadded
  	   */
  	  push(event, ...args) {
  	    const key = this.#_generateKey();
  	    this.add(key, event, ...args);
  	    return key;
  	  }

  	  /**
  	   * Ajoute un callback avec un clé qui permet de le retrouver plus tard
  	   * @param {string} key Clé de l'évènement
  	   * @param {T} event Callback qui sera appelé lors de l'appel de l'évènement
  	   * @param  {...any} args Liste des arguments qui seront passé aux callback
  	   * @fires JsEvent.onadded
  	   */
  	  add(key, event, ...args) {
  	    this.events[key] = new JsEventData(event, args);
  	    this.onadded.call(key, this.events[key]);
  	  }

  	  /**
  	   * Vérifie si une clé éxiste
  	   * @param {string} key
  	   * @returns {boolean}
  	   */
  	  has(key) {
  	    return !!this.events[key];
  	  }

  	  /**
  	   * Supprime un callback
  	   * @param {string} key Clé
  	   * @fires JsEvent.onremoved
  	   */
  	  remove(key) {
  	    this.onremoved.call(key, this.events[key]);
  	    this.events[key] = null;
  	  }

  	  /**
  	   * Renvoie si il y a des évènements ou non.
  	   * @returns {boolean}
  	   */
  	  haveEvents() {
  	    return this.count() > 0;
  	  }

  	  /**
  	   * Affiche le nombre d'évènements
  	   * @returns {number}
  	   */
  	  count() {
  	    return Object.keys(this.events).length;
  	  }

  	  /**
  	   * Appèle les callbacks
  	   * @param  {...any} params Paramètres à envoyer aux callbacks
  	   * @returns {null | any | Array}
  	   */
  	  call(...params) {
  	    let results = {};
  	    const keys = Object.keys(this.events);

  	    if (keys.length !== 0) {
  	      for (let index = 0, len = keys.length; index < len; ++index) {
  	        const key = keys[index];

  	        if (this.events[key]) {
  	          const { args, callback } = this.events[key];

  	          if (callback)
  	            results[key] = this.#_call_callback(
  	              callback,
  	              ...[...args, ...params],
  	            );
  	        }
  	      }
  	    }

  	    switch (Object.keys(results).length) {
  	      case 0:
  	        return null;
  	      case 1:
  	        return results[Object.keys(results)[0]];
  	      default:
  	        return results;
  	    }
  	  }

  	  /**
  	   * Vide la classe
  	   */
  	  clear() {
  	    this.events = {};
  	  }

  	    /**
  	   * Lance un callback
  	   * @param {T} callback Callback à appeler
  	   * @param  {...any} args Paramètres à envoyer aux callbacks
  	   * @returns {*}
  	   * @private
  	   */
  	  #_call_callback(callback, ...args) {
  	    return callback(...args);
  	  }

  	  /**
  	   * Génère une clé pour l'évènement
  	   * @private
  	   * @returns {string}
  	   */
  	  #_generateKey() {
  	    const g_key = Math.random() * (this.count() + 10);

  	    let ae = false;
  	    for (const key in this.events) {
  	      if (Object.hasOwnProperty.call(this.events, key)) {
  	        if (key === g_key) {
  	          ae = true;
  	          break;
  	        }
  	      }
  	    }

  	    if (ae) return this.#_generateKey();
  	    else return g_key;
  	  }
  	}

  	JsEvent_1 = JsEvent;
  	return JsEvent_1;
  }

  var JsCircularEvent_1;
  var hasRequiredJsCircularEvent;

  function requireJsCircularEvent () {
  	if (hasRequiredJsCircularEvent) return JsCircularEvent_1;
  	hasRequiredJsCircularEvent = 1;
  	const JsEvent = requireJsEvent();

  	class JsCircularEvent extends JsEvent {
  	    constructor() {
  	        super();
  	    }

  	    call(param) {
  	        let results = param;
  	        const keys = Object.keys(this.events);

  	        if (keys.length !== 0) {
  	            for (let index = 0, len = keys.length; index < len; ++index) {
  	                const key = keys[index];

  	                if (this.events[key]) {
  	                    const { args, callback } = this.events[key];
  	                    results.defaultsParams = args;
  	                    if (callback){
  	                        results = {...results, ...this.#_call_callback(
  	                        callback,
  	                        results
  	                        ) ?? {}};
  	                    }
  	                }
  	            }
  	        }

  	        return results;
  	    }

  	  #_call_callback(callback, ...args) {
  	    return callback(...args);
  	  }
  	}

  	JsCircularEvent_1 = JsCircularEvent;
  	return JsCircularEvent_1;
  }

  var hasRequiredEvent;

  function requireEvent () {
  	if (hasRequiredEvent) return event.exports;
  	hasRequiredEvent = 1;
  	const JsEvent = requireJsEvent();
  	const JsCircularEvent = requireJsCircularEvent();

  	event.exports = JsEvent;
  	event.exports.JsCircularEvent = JsCircularEvent;
  	return event.exports;
  }

  var eventExports = requireEvent();
  var JsEvent = /*@__PURE__*/getDefaultExportFromCjs(eventExports);

  var css_248z$a = "@font-face{font-family:Material Symbols Outlined;font-style:normal;font-weight:200;src:url(fonts/material-symbol-v2.woff2) format(\"woff2\")}.material-symbols-outlined{word-wrap:normal;-moz-font-feature-settings:\"liga\";-moz-osx-font-smoothing:grayscale;direction:ltr;display:inline-block;font-family:Material Symbols Outlined;font-size:24px;font-style:normal;font-weight:400;letter-spacing:normal;line-height:1;text-transform:none;white-space:nowrap}";

  /**
   * Événement personnalisé signalant le changement d'un élément.
   *
   * @template T Type du nouvel élément.
   * @template Y Type de l'ancien élément.
   * @template TCaller Type de l'élément ayant déclenché l'événement (doit hériter de HTMLElement).
   */
  class ElementChangedEvent extends CustomEvent {
      #_new;
      #_old;
      #_caller;
      /**
       * Crée une nouvelle instance d'ElementChangedEvent.
       *
       * @param type Le type de changement.
       * @param newElement Le nouvel élément.
       * @param oldElement L'ancien élément.
       * @param caller L'élément ayant déclenché l'événement.
       * @param initDict Options d'initialisation de l'événement.
       */
      constructor(type, newElement, oldElement, caller, initDict = {}) {
          super(`custom:element-changed.${type}`, initDict);
          this.#_new = newElement;
          this.#_old = oldElement;
          this.#_caller = caller;
      }
      /** Retourne le nouvel élément. */
      get newElement() {
          return this.#_new;
      }
      /** Retourne l'ancien élément. */
      get oldElement() {
          return this.#_old;
      }
      /** Retourne l'élément qui a déclenché l'événement. */
      get caller() {
          return this.#_caller;
      }
  }

  const TAG_ICON = `${BnumConfig.Get('tag_prefix')}-icon`;
  const TAG_BUTTON = `${BnumConfig.Get('tag_prefix')}-button`;
  const TAG_PRIMARY = `${BnumConfig.Get('tag_prefix')}-primary-button`;
  const TAG_SECONDARY = `${BnumConfig.Get('tag_prefix')}-secondary-button`;
  const TAG_DANGER = `${BnumConfig.Get('tag_prefix')}-danger-button`;
  const TAG_HELPER = `${BnumConfig.Get('tag_prefix')}-helper`;
  const TAG_PICTURE = `${BnumConfig.Get('tag_prefix')}-img`;
  const TAG_CARD_TITLE = `${BnumConfig.Get('tag_prefix')}-card-title`;
  const TAG_CARD = `${BnumConfig.Get('tag_prefix')}-card`;
  const TAG_CARD_EMAIL = `${BnumConfig.Get('tag_prefix')}-card-email`;
  const TAG_CARD_ITEM = `${BnumConfig.Get('tag_prefix')}-card-item`;
  const TAG_CARD_ITEM_MAIL = `${BnumConfig.Get('tag_prefix')}-card-item-mail`;
  const TAG_CARD_ITEM_AGENDA = `${BnumConfig.Get('tag_prefix')}-card-item-agenda`;
  const TAG_CARD_LIST = `${BnumConfig.Get('tag_prefix')}-card-list`;
  const TAG_DATE = `${BnumConfig.Get('tag_prefix')}-date`;

  /**
   * Classe de gestion de planification d'exécution de callback.
   * Permet de regrouper plusieurs appels en une seule exécution lors du prochain frame.
   */
  class Scheduler {
      /**
       * Indique si une exécution est déjà planifiée.
       * @private
       */
      #_started = false;
      /**
       * Dernière valeur planifiée pour l'exécution.
       * @private
       */
      #_lastValue = null;
      /**
       * Callback à exécuter lors de la planification.
       * @private
       */
      #_callback;
      /**
       * Constructeur de la classe Scheduler.
       * @param callback Sera appelée avec la dernière valeur planifiée lors du prochain frame.
       */
      constructor(callback) {
          this.#_callback = callback;
      }
      /**
       * Demande la planification de l'exécution de la callback avec la valeur donnée.
       * Si une exécution est déjà planifiée, seule la dernière valeur sera utilisée.
       * @param value Valeur la plus récente planifiée pour l'exécution.
       */
      schedule(value) {
          this.#_lastValue = value;
          if (!this.#_started) {
              this.#_started = true;
              requestAnimationFrame(() => {
                  this.#_callback(this.#_lastValue);
                  this.#_started = false;
                  this.#_lastValue = null;
              });
          }
      }
      /**
       * Accesseur protégé pour obtenir la dernière valeur planifiée.
       */
      get _p_value() {
          return this.#_lastValue;
      }
      /**
       * Accesseur protégé pour définir la dernière valeur planifiée.
       */
      set _p_value(value) {
          this.#_lastValue = value;
      }
      /**
       * Appelle immédiatement la callback avec la valeur donnée, sans planification.
       * @param value Valeur à transmettre au callback
       */
      call(value) {
          this.#_callback(value);
      }
  }
  /**
   * Variante de Scheduler pour gérer des tableaux ou des symboles de réinitialisation.
   *
   * Permet de regrouper plusieurs appels en une seule exécution lors du prochain frame.
   *
   * Si jamais une réinitialisation est demandée, le tableau sera vidé avant d'ajouter de nouveaux éléments.
   */
  class SchedulerArray {
      /**
       * Indique si une exécution est déjà planifiée.
       * @private
       */
      #_started = false;
      /**
       * Symbole utilisé pour réinitialiser le tableau.
       * @private
       */
      #_resetSymbol;
      /**
       * Pile des éléments planifiés.
       * @private
       */
      #_stack = [];
      /**
       * Callback à exécuter lors de la planification.
       * @private
       */
      #_callback;
      /**
       * Constructeur de la classe SchedulerArray.
       * @param callback Fonction appelée lors de la planification.
       * @param resetSymbol Symbole utilisé pour réinitialiser le tableau.
       */
      constructor(callback, resetSymbol) {
          this.#_callback = callback;
          this.#_resetSymbol = resetSymbol;
      }
      schedule(value) {
          this.#_add(value);
          if (!this.#_started) {
              this.#_started = true;
              requestAnimationFrame(() => {
                  for (const element of this.#_getStackItems()) {
                      this.#_callback(element);
                  }
                  this.#_started = false;
                  this.#_stack.length = 0;
              });
          }
      }
      /**
       * Appelle immédiatement la callback avec la valeur donnée, sans planification.
       *
       * La stack en mémoire est utilisé si aucune valeur n'est fournie. Sinon, elle sera vidée avant d'ajouter la nouvelle valeur.
       * @param value Valeur à transmettre au callback
       */
      call(value) {
          if (value !== null) {
              this.#_stack.length = 0;
              this.#_add(value);
          }
          for (const element of this.#_getStackItems()) {
              this.#_callback(element);
          }
          this.#_stack.length = 0;
      }
      /**
       * Ajoute une valeur ou un tableau de valeurs à la pile, ou gère le symbole de réinitialisation.
       * @param value Valeur, tableau de valeurs ou symbole de réinitialisation à ajouter.
       * @returns void
       */
      #_add(value) {
          // Gestion du symbole de réinitialisation
          if (value === this.#_resetSymbol) {
              this.#_stack.length = 0;
              this.#_stack.push(value);
              this.#_stack.push([]);
              return;
          }
          // Initialisation de la pile si vide
          if (this.#_stack.length === 0)
              this.#_stack.push([]);
          // Ajout de l'élément ou des éléments au dernier tableau de la pile
          if (Array.isArray(value)) {
              this.#_stack[this.#_stack.length - 1].push(...value);
          }
          else if (value !== this.#_resetSymbol) {
              this.#_stack[this.#_stack.length - 1].push(value);
          }
      }
      /**
       * Générateur pour obtenir les éléments de la pile un par un.
       *
       * Gère les tableaux et le symbole de réinitialisation.
       * @returns Générateur d'éléments de type T[] ou Symbol.
       */
      *#_getStackItems() {
          for (const element of this.#_stack) {
              if (element === this.#_resetSymbol) {
                  yield element;
              }
              else if (Array.isArray(element)) {
                  yield element;
              }
              else {
                  yield [element];
              }
          }
      }
  }

  /**
   * Classe CSS utilisée pour les icônes Material Symbols.
   */
  const ICON_CLASS = 'material-symbols-outlined';
  /**
   * Feuille de style CSS pour les icônes Material Symbols.
   */
  const SYMBOLS = BnumElement.ConstructCSSStyleSheet(css_248z$a.replaceAll(`.${ICON_CLASS}`, ':host'));
  /**
   * Composant personnalisé <bnum-icon> pour afficher une icône Material Symbol.
   *
   * Ce composant permet d'afficher une icône en utilisant le nom de l'icône Material Symbol.
   * Le nom peut être défini via le contenu du slot ou via l'attribut `data-icon`.
   *
   * @example
   * <bnum-icon>home</bnum-icon>
   * <bnum-icon data-icon="search"></bnum-icon>
   *
   * @slot (default) - Nom de l'icône material symbol.
   *
   * @event custom:element-changed:icon - Déclenché lors du changement d'icône.
   */
  class HTMLBnumIcon extends BnumElement {
      //#region Constantes
      /**
       * Nom de l'événement déclenché lors du changement d'icône.
       * @type {string}
       */
      static EVENT_ICON_CHANGED = 'icon';
      /**
       * Nom de la donnée pour l'icône.
       * @type {string}
       */
      static DATA_ICON = 'icon';
      /**
       * Attribut HTML pour définir l'icône.
       * @type {string}
       */
      static ATTRIBUTE_DATA_ICON = `data-${HTMLBnumIcon.DATA_ICON}`;
      /**
       * Nom de l'attribut class.
       * @type {string}
       */
      static ATTRIBUTE_CLASS = 'class';
      //#endregion Constantes
      //#region Private fields
      #_updateScheduler = null;
      /**
       * Événement déclenché lors du changement d'icône.
       */
      #_oniconchanged = null;
      //#endregion Private fields
      //#region Getter/setter
      /**
       * Événement déclenché lors du changement d'icône. (via la propriété icon)
       */
      get oniconchanged() {
          this.#_oniconchanged ??= new JsEvent();
          return this.#_oniconchanged;
      }
      /**
       * Obtient le nom de l'icône actuellement affichée.
       * @returns {string} Le nom de l'icône.
       */
      get icon() {
          const icon = this.textContent?.trim?.() ||
              this.data(HTMLBnumIcon.DATA_ICON) ||
              EMPTY_STRING;
          return icon;
      }
      /**
       * Définit le nom de l'icône à afficher.
       * Déclenche l'événement oniconchanged si la valeur change.
       * @param {string | null} value - Le nouveau nom de l'icône.
       * @throws {Error} Si la valeur n'est pas une chaîne valide.
       */
      set icon(value) {
          if (value !== null) {
              if (typeof value === 'string' && /^[\w-]+$/.test(value)) {
                  const oldValue = this.icon;
                  this.data(HTMLBnumIcon.DATA_ICON, value);
                  this.#_requestUpdateDOM(value);
                  this.oniconchanged.call(value, oldValue);
              }
              else {
                  throw new Error('Icon must be a valid string.');
              }
          }
      }
      //#endregion Getter/setter
      //#region Lifecycle
      /**
       * Constructeur du composant HTMLBnumIcon.
       * Initialise les écouteurs d'attributs et l'événement oniconchanged.
       */
      constructor() {
          super();
          this.oniconchanged.add('default', (newIcon, oldIcon) => {
              this.dispatchEvent(new ElementChangedEvent(HTMLBnumIcon.EVENT_ICON_CHANGED, newIcon, oldIcon, this));
          });
      }
      /**
       * Retourne les feuilles de style à appliquer dans le Shadow DOM.
       * @returns {CSSStyleSheet[]} Les feuilles de style.
       */
      _p_getStylesheets() {
          return [SYMBOLS];
      }
      /**
       * Construit le DOM interne du composant.
       * @param {ShadowRoot} container - Le conteneur du Shadow DOM.
       */
      _p_buildDOM(container) {
          container.appendChild(this._p_createSlot());
          const icon = this.data(HTMLBnumIcon.DATA_ICON);
          if (icon)
              this.#_updateIcon(icon);
          if (!this.hasAttribute('aria-hidden') && !this.hasAttribute('aria-label')) {
              this.setAttribute('aria-hidden', 'true');
          }
      }
      //#endregion Lifecycle
      //#region Private methods
      /**
       * Demande une mise à jour du DOM pour l'icône.
       * @param {string} icon - Nom de l'icône.
       * @returns {this}
       * @private
       */
      #_requestUpdateDOM(icon) {
          this.#_updateScheduler ??= new Scheduler((icon) => {
              this.#_updateIcon(icon);
          });
          this.#_updateScheduler.schedule(icon);
          return this;
      }
      /**
       * Met à jour l'affichage de l'icône.
       * @param {string} icon - Nom de l'icône.
       * @private
       */
      #_updateIcon(icon) {
          this.textContent = icon;
      }
      //#endregion Private methods
      //#region Static methods
      /**
       * Crée une nouvelle instance de HTMLBnumIcon avec l'icône spécifiée.
       * @param {string} icon - Le nom de l'icône à utiliser.
       * @returns {HTMLBnumIcon} L'élément créé.
       */
      static Create(icon) {
          const element = this.EMPTY;
          element.icon = icon;
          return element;
      }
      /**
       * Retourne le tag HTML utilisé pour ce composant.
       * @returns {string}
       * @readonly
       */
      static get TAG() {
          return TAG_ICON;
      }
      /**
       * Retourne un élément HTMLBnumIcon vide.
       * @returns {HTMLBnumIcon}
       */
      static get EMPTY() {
          return document.createElement(HTMLBnumIcon.TAG);
      }
      /**
       * Retourne la classe CSS utilisée pour les icônes Material Symbols.
       * @returns {string}
       */
      static get HTML_CLASS() {
          return ICON_CLASS;
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'home'.
       * @returns {HTMLBnumIcon}
       */
      static get HOME() {
          return HTMLBnumIcon.Create('home');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'search'.
       * @returns {HTMLBnumIcon}
       */
      static get SEARCH() {
          return HTMLBnumIcon.Create('search');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'settings'.
       * @returns {HTMLBnumIcon}
       */
      static get SETTINGS() {
          return HTMLBnumIcon.Create('settings');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'person'.
       * @returns {HTMLBnumIcon}
       */
      static get USER() {
          return HTMLBnumIcon.Create('person');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'mail'.
       * @returns {HTMLBnumIcon}
       */
      static get MAIL() {
          return HTMLBnumIcon.Create('mail');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'close'.
       * @returns {HTMLBnumIcon}
       */
      static get CLOSE() {
          return HTMLBnumIcon.Create('close');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'check'.
       * @returns {HTMLBnumIcon}
       */
      static get CHECK() {
          return HTMLBnumIcon.Create('check');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'warning'.
       * @returns {HTMLBnumIcon}
       */
      static get WARNING() {
          return HTMLBnumIcon.Create('warning');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'info'.
       * @returns {HTMLBnumIcon}
       */
      static get INFO() {
          return HTMLBnumIcon.Create('info');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'delete'.
       * @returns {HTMLBnumIcon}
       */
      static get DELETE() {
          return HTMLBnumIcon.Create('delete');
      }
      /**
       * Retourne une instance de HTMLBnumIcon avec l'icône 'add'.
       * @returns {HTMLBnumIcon}
       */
      static get ADD() {
          return HTMLBnumIcon.Create('add');
      }
  }
  //#region TryDefine
  HTMLBnumIcon.TryDefine();
  //#endregion TryDefine

  /**
   * RegEx qui permet de vérifier si un texte possède uniquement des charactères alphanumériques.
   * @constant
   * @default /^[0-9a-zA-Z]+$/
   */
  const REG_LIGHT_PICTURE_NAME = /(-light)\.(([\w\d]+)|\1?.+)$/;
  const REG_XSS_SAFE = /^[-.\w\s%()]+$/;

  var css_248z$9 = ":host{border-radius:var(--bnum-button-border-radius,0);cursor:var(--bnum-button-cursor,pointer);display:var(--bnum-button-display,inline-block);padding:var(--bnum-button-padding,6px 10px);transition:background-color .2s ease,color .2s ease;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}:host(:state(rounded)){border-radius:var(--bnum-button-rounded-border-radius,5px)}:host(:state(without-icon)){padding-bottom:var(--bnum-button-without-icon-padding-bottom,7.5px);padding-top:var(--bnum-button-without-icon-padding-top,7.5px)}:host(:disabled),:host(:state(disabled)){cursor:not-allowed;opacity:var(--bnum-button-disabled-opacity,.6);pointer-events:var(--bnum-button-disabled-pointer-events,none)}:host(:state(loading)){cursor:progress}:host(:state(icon)){--bnum-button-icon-gap:var(--custom-button-icon-margin,20px)}:host(:state(icon))>.wrapper{align-items:center;display:flex;flex-direction:row;gap:var(--bnum-button-icon-gap);justify-content:center}:host(:state(icon-pos-left)) .wrapper{flex-direction:row-reverse}:host(:focus-visible){outline:2px solid #0969da;outline-offset:2px}:host>.wrapper{align-items:var(--bnum-button-wrapper-align-items,center);display:var(--bnum-button-wrapper-display,flex)}:host bnum-icon.icon{display:var(--bnum-button-icon-display,flex)}:host bnum-icon.icon.hidden{display:none}:host bnum-icon.loader{display:var(--bnum-button-loader-display,flex)}:host(:is(:state(loading):state(without-icon-loading))) slot{display:none}@keyframes spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host .loader,:host .spin,:host(:state(loading)) .icon{animation:spin var(--bnum-button-spin-duration,.75s) var(--bnum-button-spin-timing,linear) var(--bnum-button-spin-iteration,infinite)}:host(:state(hide-text-on-small)) .slot,:host(:state(hide-text-on-touch)) .slot{display:var(--size-display-state,inline-block)}:host(:state(hide-text-on-small)) .icon,:host(:state(hide-text-on-touch)) .icon{margin-left:var(--size-margin-left-state,var(--custom-button-icon-margin-left))!important;margin-right:var(--size-margin-right-state,var(--custom-button-icon-margin-right))!important}:host(:state(primary)){background-color:var(--bnum-button-primary-background-color,var(--bnum-color-primary));border:var(--bnum-button-primary-border,solid thin var(--bnum-button-primary-border-color,var(--bnum-color-primary)));color:var(--bnum-button-primary-text-color,var(--bnum-text-on-primary))}:host(:state(primary):hover){background-color:var(--bnum-button-primary-hover-background-color,var(--bnum-color-primary-hover));border:var(--bnum-button-primary-hover-border,solid thin var(--bnum-button-primary-hover-border-color,var(--bnum-color-primary-hover)));color:var(--bnum-button-primary-hover-text-color,var(--bnum-text-on-primary-hover))}:host(:state(primary):active){background-color:var(--bnum-button-primary-active-background-color,var(--bnum-color-primary-active));border:var(--bnum-button-primary-active-border,solid thin var(--bnum-button-primary-active-border-color,var(--bnum-color-primary-active)));color:var(--bnum-button-primary-active-text-color,var(--bnum-text-on-primary-active))}:host(:state(secondary)){background-color:var(--bnum-button-secondary-background-color,var(--bnum-color-secondary));border:var(--bnum-button-secondary-border,solid thin var(--bnum-button-secondary-border-color,var(--bnum-color-primary)));color:var(--bnum-button-secondary-text-color,var(--bnum-text-on-secondary))}:host(:state(secondary):hover){background-color:var(--bnum-button-secondary-hover-background-color,var(--bnum-color-secondary-hover));border:var(--bnum-button-secondary-hover-border,solid thin var(--bnum-button-secondary-hover-border-color,var(--bnum-color-primary)));color:var(--bnum-button-secondary-hover-text-color,var(--bnum-text-on-secondary-hover))}:host(:state(secondary):active){background-color:var(--bnum-button-secondary-active-background-color,var(--bnum-color-secondary-active));border:var(--bnum-button-secondary-active-border,solid thin var(--bnum-button-secondary-active-border-color,var(--bnum-color-primary)));color:var(--bnum-button-secondary-active-text-color,var(--bnum-text-on-secondary-active))}:host(:state(danger)){background-color:var(--bnum-button-danger-background-color,var(--bnum-color-danger));border:var(--bnum-button-danger-border,solid thin var(--bnum-button-danger-border-color,var(--bnum-color-danger)));color:var(--bnum-button-danger-text-color,var(--bnum-text-on-danger))}:host(:state(danger):hover){background-color:var(--bnum-button-danger-hover-background-color,var(--bnum-color-danger-hover));border:var(--bnum-button-danger-hover-border,solid thin var(--bnum-button-danger-hover-border-color,var(--bnum-color-danger-hover)));color:var(--bnum-button-danger-hover-text-color,var(--bnum-text-on-danger-hover))}:host(:state(danger):active){background-color:var(--bnum-button-danger-active-background-color,var(--bnum-color-danger-active));border:var(--bnum-button-danger-active-border,solid thin var(--bnum-button-danger-active-border-color,var(--bnum-color-danger-active)));color:var(--bnum-button-danger-active-text-color,var(--bnum-text-on-danger-active))}";

  //#region External Constants
  /**
   * Style CSS du composant bouton.
   */
  const SHEET$9 = BnumElement.ConstructCSSStyleSheet(css_248z$9);
  // Constantes pour les tags des différents types de boutons
  /**
   * Tag du bouton Bnum.
   */
  const TAG = TAG_BUTTON;
  /**
   * Icône de chargement utilisée dans le bouton.
   */
  const ICON_LOADER = 'progress_activity';
  //#endregion External Constants
  //#region Types and Enums
  /**
   * Enumération des types de boutons.
   */
  exports.EButtonType = void 0;
  (function (EButtonType) {
      EButtonType["PRIMARY"] = "primary";
      EButtonType["SECONDARY"] = "secondary";
      EButtonType["TERTIARY"] = "tertiary";
      EButtonType["DANGER"] = "danger";
  })(exports.EButtonType || (exports.EButtonType = {}));
  /**
   * Enumération des positions possibles de l'icône dans le bouton.
   */
  exports.EIconPosition = void 0;
  (function (EIconPosition) {
      EIconPosition["LEFT"] = "left";
      EIconPosition["RIGHT"] = "right";
  })(exports.EIconPosition || (exports.EIconPosition = {}));
  /**
   * Enumération des tailles de layout pour cacher le texte.
   */
  exports.EHideOn = void 0;
  (function (EHideOn) {
      EHideOn["SMALL"] = "small";
      EHideOn["TOUCH"] = "touch";
  })(exports.EHideOn || (exports.EHideOn = {}));
  //#endregion Types and Enums
  //#region Documentation
  /**
   * Composant bouton principal de la bibliothèque Bnum.
   * Gère les variations, l'icône, l'état de chargement, etc.
   *
   * @structure Bouton primaire
   * <bnum-button data-variation="primary">Texte du bouton</bnum-button>
   *
   * @structure Bouton secondaire
   * <bnum-button data-variation="secondary">Texte du bouton</bnum-button>
   *
   * @structure Bouton danger
   * <bnum-button data-variation="danger">Texte du bouton</bnum-button>
   *
   * @structure Bouton avec icône
   * <bnum-button data-icon="home">Texte du bouton</bnum-button>
   *
   * @structure Bouton avec une icône à gauche
   * <bnum-button data-icon="home" data-icon-pos="left">Texte du bouton</bnum-button>
   *
   * @structure Bouton en état de chargement
   * <bnum-button loading>Texte du bouton</bnum-button>
   *
   * @structure Bouton arrondi
   * <bnum-button rounded>Texte du bouton</bnum-button>
   *
   * @structure Bouton cachant le texte sur les petits layouts
   * <bnum-button data-hide="small" data-icon="menu">Menu</bnum-button>
   *
   * @slot (default) - Contenu du bouton (texte, HTML, etc.)
   *
   * @state loading - Actif si le bouton est en état de chargement
   * @state rounded - Actif si le bouton est arrondi
   * @state disabled - Actif si le bouton est désactivé
   * @state icon - Actif si le bouton contient une icône
   * @state without-icon - Actif si le bouton ne contient pas d'icône
   * @state icon-pos-left - Actif si l'icône est positionnée à gauche
   * @state icon-pos-right - Actif si l'icône est positionnée à droite
   * @state hide-text-on-small - Actif si le texte est caché sur les petits layouts
   * @state hide-text-on-touch - Actif si le texte est caché sur les layouts tactiles
   * @state primary - Actif si le bouton est de type primaire
   * @state secondary - Actif si le bouton est de type secondaire
   * @state tertiary - Actif si le bouton est de type tertiaire
   * @state danger - Actif si le bouton est de type danger
   *
   * @cssvar {inline-block} --bnum-button-display - Définit le type d'affichage du bouton
   * @cssvar {6px 10px} --bnum-button-padding - Définit le padding interne du bouton
   * @cssvar {0} --bnum-button-border-radius - Définit l'arrondi des coins du bouton
   * @cssvar {pointer} --bnum-button-cursor - Définit le curseur de la souris au survol du bouton
   * @cssvar {5px} --bnum-button-rounded-border-radius - Arrondi des coins pour le bouton arrondi
   * @cssvar {7.5px} --bnum-button-without-icon-padding-top - Padding top si le bouton n'a pas d'icône
   * @cssvar {7.5px} --bnum-button-without-icon-padding-bottom - Padding bottom si le bouton n'a pas d'icône
   * @cssvar {var(--bnum-color-primary)} --bnum-button-primary-background-color - Couleur de fond du bouton (état primaire)
   * @cssvar {var(--bnum-text-on-primary)} --bnum-button-primary-text-color - Couleur du texte du bouton (état primaire)
   * @cssvar {solid thin var(--bnum-button-primary-border-color)} --bnum-button-primary-border - Bordure du bouton (état primaire)
   * @cssvar {var(--bnum-color-primary)} --bnum-button-primary-border-color - Couleur de la bordure (état primaire)
   * @cssvar {var(--bnum-color-primary-hover)} --bnum-button-primary-hover-background-color - Couleur de fond au survol (état primaire)
   * @cssvar {var(--bnum-text-on-primary-hover)} --bnum-button-primary-hover-text-color - Couleur du texte au survol (état primaire)
   * @cssvar {solid thin var(--bnum-button-primary-hover-border-color)} --bnum-button-primary-hover-border - Bordure au survol (état primaire)
   * @cssvar {var(--bnum-color-primary-hover)} --bnum-button-primary-hover-border-color - Couleur de la bordure au survol (état primaire)
   * @cssvar {var(--bnum-color-primary-active)} --bnum-button-primary-active-background-color - Couleur de fond lors du clic (état primaire)
   * @cssvar {var(--bnum-text-on-primary-active)} --bnum-button-primary-active-text-color - Couleur du texte lors du clic (état primaire)
   * @cssvar {solid thin var(--bnum-button-primary-active-border-color)} --bnum-button-primary-active-border - Bordure lors du clic (état primaire)
   * @cssvar {var(--bnum-color-primary-active)} --bnum-button-primary-active-border-color - Couleur de la bordure lors du clic (état primaire)
   * @cssvar {var(--bnum-color-secondary)} --bnum-button-secondary-background-color - Couleur de fond (état secondaire)
   * @cssvar {var(--bnum-text-on-secondary)} --bnum-button-secondary-text-color - Couleur du texte (état secondaire)
   * @cssvar {solid thin var(--bnum-button-secondary-border-color)} --bnum-button-secondary-border - Bordure (état secondaire)
   * @cssvar {var(--bnum-color-primary)} --bnum-button-secondary-border-color - Couleur de la bordure (état secondaire)
   * @cssvar {var(--bnum-color-secondary-hover)} --bnum-button-secondary-hover-background-color - Couleur de fond au survol (état secondaire)
   * @cssvar {var(--bnum-text-on-secondary-hover)} --bnum-button-secondary-hover-text-color - Couleur du texte au survol (état secondaire)
   * @cssvar {solid thin var(--bnum-button-secondary-hover-border-color)} --bnum-button-secondary-hover-border - Bordure au survol (état secondaire)
   * @cssvar {var(--bnum-color-primary)} --bnum-button-secondary-hover-border-color - Couleur de la bordure au survol (état secondaire)
   * @cssvar {var(--bnum-color-secondary-active)} --bnum-button-secondary-active-background-color - Couleur de fond lors du clic (état secondaire)
   * @cssvar {var(--bnum-text-on-secondary-active)} --bnum-button-secondary-active-text-color - Couleur du texte lors du clic (état secondaire)
   * @cssvar {solid thin var(--bnum-button-secondary-active-border-color)} --bnum-button-secondary-active-border - Bordure lors du clic (état secondaire)
   * @cssvar {var(--bnum-color-primary)} --bnum-button-secondary-active-border-color - Couleur de la bordure lors du clic (état secondaire)
   * @cssvar {var(--bnum-color-danger)} --bnum-button-danger-background-color - Couleur de fond (état danger)
   * @cssvar {var(--bnum-text-on-danger)} --bnum-button-danger-text-color - Couleur du texte (état danger)
   * @cssvar {solid thin var(--bnum-button-danger-border-color)} --bnum-button-danger-border - Bordure (état danger)
   * @cssvar {var(--bnum-color-danger)} --bnum-button-danger-border-color - Couleur de la bordure (état danger)
   * @cssvar {var(--bnum-color-danger-hover)} --bnum-button-danger-hover-background-color - Couleur de fond au survol (état danger)
   * @cssvar {var(--bnum-text-on-danger-hover)} --bnum-button-danger-hover-text-color - Couleur du texte au survol (état danger)
   * @cssvar {solid thin var(--bnum-button-danger-hover-border-color)} --bnum-button-danger-hover-border - Bordure au survol (état danger)
   * @cssvar {var(--bnum-color-danger-hover)} --bnum-button-danger-hover-border-color - Couleur de la bordure au survol (état danger)
   * @cssvar {var(--bnum-color-danger-active)} --bnum-button-danger-active-background-color - Couleur de fond lors du clic (état danger)
   * @cssvar {var(--bnum-text-on-danger-active)} --bnum-button-danger-active-text-color - Couleur du texte lors du clic (état danger)
   * @cssvar {solid thin var(--bnum-button-danger-active-border-color)} --bnum-button-danger-active-border - Bordure lors du clic (état danger)
   * @cssvar {var(--bnum-color-danger-active)} --bnum-button-danger-active-border-color - Couleur de la bordure lors du clic (état danger)
   * @cssvar {0.6} --bnum-button-disabled-opacity - Opacité du bouton désactivé
   * @cssvar {none} --bnum-button-disabled-pointer-events - Gestion des événements souris pour le bouton désactivé
   * @cssvar {flex} --bnum-button-wrapper-display - Type d'affichage du wrapper interne
   * @cssvar {center} --bnum-button-wrapper-align-items - Alignement vertical du contenu du wrapper
   * @cssvar {flex} --bnum-button-icon-display - Type d'affichage de l'icône
   * @cssvar {flex} --bnum-button-loader-display - Type d'affichage du loader
   * @cssvar {0.75s} --bnum-button-spin-duration - Durée de l'animation de spin
   * @cssvar {linear} --bnum-button-spin-timing - Fonction de timing de l'animation de spin
   * @cssvar {infinite} --bnum-button-spin-iteration - Nombre d'itérations de l'animation de spin
   */
  class HTMLBnumButton extends BnumElement {
      //#endregion Component Definition
      //#region Constantes
      /**
       * Attribut pour rendre le bouton arrondi.
       * @attr {boolean | undefined} (optional) rounded - Rend le bouton arrondi
       */
      static ATTR_ROUNDED = 'rounded';
      /**
       * Attribut de chargement du bouton.
       * @attr {boolean | undefined} (optional) loading - Met le bouton en état de chargement et le désactive
       */
      static ATTR_LOADING = 'loading';
      /**
       * Attribut de désactivation du bouton.
       * @attr {boolean | undefined} (optional) disabled - Désactive le bouton
       */
      static ATTR_DISABLED = 'disabled';
      /**
       * Attribut de variation du bouton.
       * @attr {EButtonType | undefined} (optional) (default: EButtonType.PRIMARY) data-variation - Variation du bouton (primary, secondary, etc.)
       */
      static ATTR_VARIATION = 'variation';
      /**
       * Attribut d'icône du bouton.
       * @attr {string | undefined} (optional) data-icon - Icône affichée dans le bouton
       */
      static ATTR_ICON = 'icon';
      /**
       * Attribut de position de l'icône dans le bouton.
       * @attr {EIconPosition | undefined} (optional) (default: EIconPosition.RIGHT) data-icon-pos - Position de l'icône (gauche ou droite)
       */
      static ATTR_ICON_POS = 'icon-pos';
      /**
       * Attribut de marge de l'icône dans le bouton.
       * @attr {string | undefined} (optional) (default: var（--custom-button-icon-margin, 20px）) data-icon-margin - Marge de l'icône (gauche, droite)
       */
      static ATTR_ICON_MARGIN = 'icon-margin';
      /**
       * Attribut de taille de layout pour cacher le texte.
       * @attr {EHideOn | undefined} (optional) data-hide - Taille de layout pour cacher le texte
       */
      static ATTR_HIDE = 'hide';
      /**
       * État du bouton lorsqu'il contient une icône.
       */
      static STATE_ICON = 'icon';
      /**
       * État du bouton lorsqu'il ne contient pas d'icône.
       */
      static STATE_WITHOUT_ICON = 'without-icon';
      /**
       * État du bouton lorsqu'il est arrondi.
       */
      static STATE_ROUNDED = 'rounded';
      /**
       * État du bouton lorsqu'il est en chargement.
       */
      static STATE_LOADING = 'loading';
      /**
       * État du bouton lorsqu'il est désactivé.
       */
      static STATE_DISABLED = 'disabled';
      /**
       * Événement déclenché lors du changement d'icône.
       * @event custom:element-changed.icon
       * @detail ElementChangedEvent
       */
      static EVENT_ICON = 'icon';
      /**
       * Événement déclenché lors du changement de variation du bouton.
       * @event custom:element-changed.variation
       * @detail ElementChangedEvent
       */
      static EVENT_VARIATION = 'variation';
      /**
       * Événement déclenché lors du changement de propriété de l'icône.
       * @event custom:element-changed.icon.prop
       * @detail { type: string, newValue: boolean | string }
       */
      static EVENT_ICON_PROP_CHANGED = 'custom:icon.prop.changed';
      /**
       * Événement déclenché lors du changement d'état de chargement.
       * @event custom:loading
       * @detail { state: boolean }
       */
      static EVENT_LOADING_STATE_CHANGED = 'custom:loading';
      /**
       * Valeur par défaut de la marge de l'icône dans le bouton.
       */
      static DEFAULT_CSS_VAR_ICON_MARGIN = 'var(--custom-button-icon-margin, 20px)';
      /**
       * Nom de la propriété de l'icône pour la position.
       */
      static ICON_PROP_POS = 'pos';
      /**
       * Classe CSS du wrapper du bouton.
       */
      static CLASS_WRAPPER = 'wrapper';
      /**
       * Classe CSS de l'icône du bouton.
       */
      static CLASS_ICON = 'icon';
      /**
       * Classe CSS du slot du bouton.
       */
      static CLASS_SLOT = 'slot';
      /**
       * Propriété CSS pour la marge de l'icône.
       */
      static CSS_PROPERTY_ICON_MARGIN = '--bnum-button-icon-gap';
      //#endregion Constantes
      //#region Private fields
      /**
       * Internals pour la gestion des états personnalisés.
       * @private
       */
      #_internals;
      #_wrapper;
      #_iconEl;
      #_renderScheduler = null;
      //#endregion Private fields
      //#region Public fields
      /**
       * Événement déclenché lors du changement d'état de chargement.
       */
      onloadingstatechange = new JsEvent();
      /**
       * Événement déclenché lors du changement d'icône.
       */
      oniconchange = new JsEvent();
      /**
       * Événement déclenché lors du changement de propriété de l'icône.
       */
      oniconpropchange = new JsEvent();
      /**
       * Événement déclenché lors du changement de variation du bouton.
       */
      onvariationchange = new JsEvent();
      //#endregion Public fields
      //#region Getter/setter
      /**
       * Variation du bouton (primary, secondary, etc.).
       */
      get variation() {
          return (this.data(HTMLBnumButton.ATTR_VARIATION) ||
              exports.EButtonType.PRIMARY);
      }
      set variation(value) {
          if (Object.values(exports.EButtonType).includes(value)) {
              const fromAttribute = false;
              this.data(HTMLBnumButton.ATTR_VARIATION, value, fromAttribute);
              if (this.alreadyLoaded) {
                  this.onvariationchange.call(value, this.variation);
                  this.#_requestUpdateDOM();
              }
          }
      }
      /**
       * Icône affichée dans le bouton.
       */
      get icon() {
          return this.data(HTMLBnumButton.ATTR_ICON) || null;
      }
      set icon(value) {
          if (this.alreadyLoaded)
              this.oniconchange.call(value || EMPTY_STRING, this.icon || EMPTY_STRING);
          if (typeof value === 'string' && /^[\w-]+$/.test(value)) {
              const fromAttribute = false;
              this.data(HTMLBnumButton.ATTR_ICON, value, fromAttribute);
          }
          else {
              this.data(HTMLBnumButton.ATTR_ICON, null);
          }
          if (this.alreadyLoaded)
              this.#_requestUpdateDOM();
      }
      /**
       * Position de l'icône (gauche ou droite).
       */
      get iconPos() {
          return (this.data(HTMLBnumButton.ATTR_ICON_POS) ||
              exports.EIconPosition);
      }
      set iconPos(value) {
          if (this.alreadyLoaded)
              this.oniconpropchange.call(HTMLBnumButton.ICON_PROP_POS, value);
          if (Object.values(exports.EIconPosition).includes(value)) {
              const fromAttribute = false;
              this.data(HTMLBnumButton.ATTR_ICON_POS, value, fromAttribute);
          }
          if (this.alreadyLoaded)
              this.#_requestUpdateDOM();
      }
      /**
       * Marge appliquée à l'icône.
       */
      get iconMargin() {
          return (this.data(HTMLBnumButton.ATTR_ICON_MARGIN) ||
              HTMLBnumButton.DEFAULT_CSS_VAR_ICON_MARGIN);
      }
      set iconMargin(value) {
          if (this.alreadyLoaded)
              this.oniconpropchange.call('margin', value || EMPTY_STRING);
          if (typeof value === 'string' && REG_XSS_SAFE.test(value)) {
              const fromAttribute = false;
              this.data(HTMLBnumButton.ATTR_ICON_MARGIN, value, fromAttribute);
              this.style.setProperty(HTMLBnumButton.CSS_PROPERTY_ICON_MARGIN, value);
          }
          else if (value === null) {
              this.data(HTMLBnumButton.ATTR_ICON_MARGIN, value);
              this.style.removeProperty(HTMLBnumButton.CSS_PROPERTY_ICON_MARGIN);
          }
      }
      /**
       * Taille de layout sur laquelle le texte doit être caché.
       */
      get hideTextOnLayoutSize() {
          const data = this.data(HTMLBnumButton.ATTR_HIDE);
          if ([...Object.values(exports.EHideOn), null, undefined].includes(data))
              return data;
          return null;
      }
      //#endregion Getter/setter
      //#region Lifecycle
      /**
       * Constructeur du bouton Bnum.
       */
      constructor() {
          super();
          this.#_internals = this.attachInternals();
          this.oniconchange.push((n, o) => {
              this.dispatchEvent(new ElementChangedEvent(HTMLBnumButton.EVENT_ICON, n, o, this));
          });
          this.onvariationchange.push((n, o) => {
              this.dispatchEvent(new ElementChangedEvent(HTMLBnumButton.EVENT_VARIATION, n, o, this));
          });
          this.oniconpropchange.push((type, newValue) => {
              this.dispatchEvent(new CustomEvent(HTMLBnumButton.EVENT_ICON_PROP_CHANGED, {
                  detail: { type, newValue },
              }));
          });
          this.onloadingstatechange.push((state) => {
              this.dispatchEvent(new CustomEvent(HTMLBnumButton.EVENT_LOADING_STATE_CHANGED, {
                  detail: { state },
              }));
          });
      }
      /**
       * Template HTML du composant bouton.
       * @returns Template utiliser pour le composant
       */
      _p_fromTemplate() {
          return TEMPLATE$5;
      }
      /**
       * Construit le DOM du composant bouton.
       * @param container - Le conteneur du Shadow DOM.
       */
      _p_buildDOM(container) {
          this.#_wrapper = container.querySelector(`.${HTMLBnumButton.CLASS_WRAPPER}`);
          this.#_iconEl = container.querySelector(`.${HTMLBnumButton.CLASS_ICON}`);
          if (this.data(HTMLBnumButton.ATTR_ICON_MARGIN)) {
              this.style.setProperty(HTMLBnumButton.CSS_PROPERTY_ICON_MARGIN, this.data(HTMLBnumButton.ATTR_ICON_MARGIN));
          }
          this.#_updateDOM();
      }
      _p_update(name, oldVal, newVal) {
          if (!this.#_wrapper)
              return;
          this.#_updateDOM();
      }
      /**
       * @inheritdoc
       */
      _p_getStylesheets() {
          return [SHEET$9];
      }
      //#endregion Lifecycle
      //#region Private methods
      /**
       * Demande une mise à jour du DOM du bouton.
       */
      #_requestUpdateDOM() {
          this.#_renderScheduler ??= new Scheduler(() => {
              this.#_updateDOM();
          });
          this.#_renderScheduler.schedule();
      }
      /**
       * Met à jour le DOM du bouton (icône, états, etc.).
       * @private
       */
      #_updateDOM() {
          const isLoading = this.#_isLoading();
          const isDisabled = this.#_isDisabled();
          // Reset des états
          this.#_internals.states.clear();
          // États globaux
          this.#_internals.states.add(this.variation);
          if (this.#_isRounded())
              this.#_internals.states.add(HTMLBnumButton.STATE_ROUNDED);
          if (isLoading)
              this.#_internals.states.add(HTMLBnumButton.STATE_LOADING);
          if (isDisabled || isLoading)
              this.#_internals.states.add(HTMLBnumButton.STATE_DISABLED);
          // Gestion de l'icône
          const effectiveIcon = isLoading ? ICON_LOADER : this.icon;
          if (effectiveIcon) {
              this.#_internals.states.add(HTMLBnumButton.STATE_ICON);
              // L'état CSS "icon-pos-left" déclenchera le "flex-direction: row-reverse"
              this.#_internals.states.add(`icon-pos-${this.iconPos}`);
              if (this.hideTextOnLayoutSize) {
                  this.#_internals.states.add(`hide-text-on-${this.hideTextOnLayoutSize}`);
              }
              // Mise à jour du composant icône enfant
              if (this.#_iconEl.icon !== effectiveIcon)
                  this.#_iconEl.icon = effectiveIcon;
              this.#_iconEl.hidden = false;
          }
          else {
              this.#_internals.states.add(HTMLBnumButton.STATE_WITHOUT_ICON);
              this.#_iconEl.hidden = true;
          }
          // Accessibilité (Internals gère aria-disabled, mais tabindex doit être géré ici)
          this.#_internals.ariaDisabled = String(isDisabled || isLoading);
          this.tabIndex = isDisabled || isLoading ? -1 : 0;
      }
      /**
       * Indique si le bouton est arrondi.
       * @private
       */
      #_isRounded() {
          return this.#_is(HTMLBnumButton.ATTR_ROUNDED);
      }
      /**
       * Indique si le bouton est en état de chargement.
       * @private
       */
      #_isLoading() {
          return this.#_is(HTMLBnumButton.ATTR_LOADING);
      }
      /**
       * Indique si le bouton est désactivé.
       * @private
       */
      #_isDisabled() {
          return this.#_is(HTMLBnumButton.ATTR_DISABLED);
      }
      /**
       * Vérifie la présence d'un attribut et sa valeur.
       * @private
       * @param attr Nom de l'attribut à vérifier
       * @returns true si l'attribut est présent et sa valeur est valide
       */
      #_is(attr) {
          return (this.hasAttribute(attr) &&
              !['false', false].includes(this.getAttribute(attr)));
      }
      //#endregion Private methods
      //#region Public methods
      /**
       * Met le bouton en état de chargement.
       * @returns L'instance du bouton
       */
      setLoading() {
          return this.attr(HTMLBnumButton.ATTR_LOADING, true);
      }
      /**
       * Arrête l'état de chargement du bouton.
       * @returns L'instance du bouton
       */
      stopLoading() {
          this.removeAttribute(HTMLBnumButton.ATTR_LOADING);
          return this;
      }
      /**
       * Bascule l'état de chargement du bouton.
       * @returns L'instance du bouton
       */
      toggleLoading() {
          if (this.#_isLoading()) {
              this.stopLoading();
          }
          else {
              this.setLoading();
          }
          return this;
      }
      //#endregion Public methods
      //#region Static methods
      /**
       * Retourne la liste des attributs observés par le composant.
       */
      static _p_observedAttributes() {
          return [
              HTMLBnumButton.ATTR_ROUNDED,
              HTMLBnumButton.ATTR_LOADING,
              HTMLBnumButton.ATTR_DISABLED,
          ];
      }
      /**
       * Transforme un élément en bouton accessible (role, tabindex, etc.).
       * @static
       * @param element Élément HTML à transformer
       * @returns L'élément modifié
       */
      static ToButton(element) {
          if (!element.onkeydown) {
              element.onkeydown = (e) => {
                  if ((e.key === ' ' || e.key === 'Enter') &&
                      e.target instanceof HTMLElement) {
                      e.target.click();
                  }
              };
              element.setAttribute('data-set-event', 'onkeydown');
          }
          if (!element.hasAttribute('role') ||
              element.getAttribute('role') !== 'button')
              element.setAttribute('role', 'button');
          if (!element.hasAttribute('tabindex'))
              element.setAttribute('tabindex', '0');
          return element;
      }
      /**
       * Crée un bouton Bnum avec les options spécifiées.
       * @static
       * @param buttonClass Classe du bouton à instancier
       * @param options Options de configuration du bouton
       * @returns Instance du bouton créé
       */
      static _p_Create(buttonClass, { text = EMPTY_STRING, icon = null, iconPos = exports.EIconPosition.RIGHT, iconMargin = null, variation = null, rounded = false, loading = false, hideOn = null, } = {}) {
          const node = document.createElement(buttonClass.TAG);
          node.textContent = text;
          if (rounded)
              node.setAttribute(HTMLBnumButton.ATTR_ROUNDED, 'true');
          if (iconMargin === 0)
              iconMargin = '0px';
          if (icon)
              node.setAttribute(`data-${HTMLBnumButton.ATTR_ICON}`, icon);
          if (iconPos)
              node.setAttribute(`data-${HTMLBnumButton.ATTR_ICON_POS}`, iconPos);
          if (iconMargin)
              node.setAttribute(`data-${HTMLBnumButton.ATTR_ICON_MARGIN}`, iconMargin);
          if (variation)
              node.setAttribute(`data-${HTMLBnumButton.ATTR_VARIATION}`, variation);
          if (loading)
              node.setAttribute(HTMLBnumButton.ATTR_LOADING, 'true');
          if (hideOn)
              node.setAttribute(`data-${HTMLBnumButton.ATTR_HIDE}`, hideOn);
          return node;
      }
      /**
       * Crée un bouton Bnum standard.
       * @static
       * @param options Options de configuration du bouton
       * @returns Instance du bouton créé
       */
      static Create(options = {}) {
          return this._p_Create(this, options);
      }
      /**
       * Crée un bouton Bnum ne contenant qu'une icône.
       * @static
       * @param icon Nom de l'icône à afficher
       * @param options Options de configuration du bouton
       * @returns Instance du bouton créé
       */
      static CreateOnlyIcon(icon, { variation = exports.EButtonType.PRIMARY, rounded = false, loading = false, } = {}) {
          return this.Create({
              icon,
              variation,
              rounded,
              loading,
              iconMargin: '0px',
          });
      }
      /**
       * Tag HTML du composant bouton.
       * @static
       * @returns Nom du tag HTML
       */
      static get TAG() {
          return TAG;
      }
  }
  //#region Template
  /**
   * Template HTML du composant bouton.
   */
  const TEMPLATE$5 = BnumElement.CreateTemplate(`
  <div class="${HTMLBnumButton.CLASS_WRAPPER}">
    <span class="${HTMLBnumButton.CLASS_SLOT}">
      <slot></slot>
    </span>
    <${HTMLBnumIcon.TAG} hidden="true" class="${HTMLBnumButton.CLASS_ICON}"></${HTMLBnumIcon.TAG}>
  </div>
  `);
  //#endregion Template
  //#region TryDefine
  HTMLBnumButton.TryDefine();
  //#endregion TryDefine

  /**
   * Bouton Bnum de type "Primary".
   *
   * @structure Cas standard
   * <bnum-primary-button>Texte du bouton</bnum-primary-button>
   *
   * @structure Bouton avec icône
   * <bnum-primary-button data-icon="home">Texte du bouton</bnum-primary-button>
   *
   * @structure Bouton avec une icône à gauche
   * <bnum-primary-button data-icon="home" data-icon-pos="left">Texte du bouton</bnum-primary-button>
   *
   * @structure Bouton en état de chargement
   * <bnum-primary-button loading>Texte du bouton</bnum-primary-button>
   *
   * @structure Bouton arrondi
   * <bnum-primary-button rounded>Texte du bouton</bnum-primary-button>
   *
   * @structure Bouton cachant le texte sur les petits layouts
   * <bnum-primary-button data-hide="small" data-icon="menu">Menu</bnum-primary-button>
   */
  class HTMLBnumPrimaryButton extends HTMLBnumButton {
      constructor() {
          super();
          const fromAttribute = false;
          this.data(HTMLBnumButton.ATTR_VARIATION, exports.EButtonType.PRIMARY, fromAttribute);
      }
      static get TAG() {
          return TAG_PRIMARY;
      }
  }
  HTMLBnumPrimaryButton.TryDefine();

  /**
   * Bouton Bnum de type "Secondary".
   *
   * @structure Cas standard
   * <bnum-secondary-button>Texte du bouton</bnum-secondary-button>
   *
   * @structure Bouton avec icône
   * <bnum-secondary-button data-icon="home">Texte du bouton</bnum-secondary-button>
   *
   * @structure Bouton avec une icône à gauche
   * <bnum-secondary-button data-icon="home" data-icon-pos="left">Texte du bouton</bnum-secondary-button>
   *
   * @structure Bouton en état de chargement
   * <bnum-secondary-button loading>Texte du bouton</bnum-secondary-button>
   *
   * @structure Bouton arrondi
   * <bnum-secondary-button rounded>Texte du bouton</bnum-secondary-button>
   *
   * @structure Bouton cachant le texte sur les petits layouts
   * <bnum-secondary-button data-hide="small" data-icon="menu">Menu</bnum-secondary-button>
   */
  class HTMLBnumSecondaryButton extends HTMLBnumButton {
      constructor() {
          super();
          const fromAttribute = false;
          this.data(HTMLBnumButton.ATTR_VARIATION, exports.EButtonType.SECONDARY, fromAttribute);
      }
      static get TAG() {
          return TAG_SECONDARY;
      }
  }
  HTMLBnumSecondaryButton.TryDefine();

  /**
   * Bouton Bnum de type "Danger".
   *
   * @structure Cas standard
   * <bnum-danger-button>Texte du bouton</bnum-danger-button>
   *
   * @structure Bouton avec icône
   * <bnum-danger-button data-icon="home">Texte du bouton</bnum-danger-button>
   *
   * @structure Bouton avec une icône à gauche
   * <bnum-danger-button data-icon="home" data-icon-pos="left">Texte du bouton</bnum-danger-button>
   *
   * @structure Bouton en état de chargement
   * <bnum-danger-button loading>Texte du bouton</bnum-danger-button>
   *
   * @structure Bouton arrondi
   * <bnum-danger-button rounded>Texte du bouton</bnum-danger-button>
   *
   * @structure Bouton cachant le texte sur les petits layouts
   * <bnum-danger-button data-hide="small" data-icon="menu">Menu</bnum-danger-button>
   */
  class HTMLBnumDangerButton extends HTMLBnumButton {
      constructor() {
          super();
          const fromAttribute = false;
          this.data(HTMLBnumButton.ATTR_VARIATION, exports.EButtonType.DANGER, fromAttribute);
      }
      static get TAG() {
          return TAG_DANGER;
      }
  }
  HTMLBnumDangerButton.TryDefine();

  var css_248z$8 = ":host{border-bottom:thin dotted;cursor:help}";

  // bnum-helper.ts
  const SHEET$8 = BnumElement.ConstructCSSStyleSheet(css_248z$8);
  /**
   * Constante représentant l'icône utilisée par défaut.
   */
  const ICON = 'help';
  /**
   * Élément web personnalisé représentant une aide contextuelle avec une icône.
   *
   * @structure Cas standard
   * <bnum-helper>Ceci est une aide contextuelle.</bnum-helper>
   */
  class HTMLBnumHelper extends BnumElement {
      /**
       * Constructeur de l'élément HTMLBnumHelper.
       * Initialise l'élément.
       */
      constructor() {
          super();
      }
      /**
       * Précharge les données de l'élément.
       * Si l'élément possède des enfants, le texte est déplacé dans l'attribut title et le contenu est vidé.
       */
      _p_preload() {
          super._p_preload();
          setTimeout(() => {
              if (this.hasChildNodes()) {
                  this.setAttribute('title', this.textContent ?? EMPTY_STRING);
                  this.textContent = EMPTY_STRING;
              }
          }, 0);
      }
      /**
       * Construit le DOM interne de l'élément.
       * Ajoute l'icône d'aide dans le conteneur.
       * @param container Racine du shadow DOM ou élément HTML.
       */
      _p_buildDOM(container) {
          super._p_buildDOM(container);
          container.appendChild(HTMLBnumIcon.Create(ICON));
      }
      /**
       * @inheritdoc
       */
      _p_getStylesheets() {
          return [SHEET$8];
      }
      /**
       * Crée une nouvelle instance de HTMLBnumHelper avec le texte d'aide spécifié.
       * @param title Texte d'aide à afficher dans l'attribut title.
       * @returns {HTMLBnumHelper} Instance du composant.
       */
      static Create(title) {
          const element = document.createElement(HTMLBnumHelper.TAG);
          element.setAttribute('title', title);
          return element;
      }
      /**
       * Tag HTML du composant.
       * @readonly
       * @returns {string} Tag HTML utilisé pour ce composant.
       */
      static get TAG() {
          return TAG_HELPER;
      }
  }
  HTMLBnumHelper.TryDefine();

  var css_248z$7 = ":host{--_image-url:var(--_image-light);display:inline-block}img{content:var(--_image-url);height:100%;width:100%}";

  /**
   * Feuille de style CSS pour le composant BnumHTMLPicture.
   */
  const SHEET$7 = BnumElement.ConstructCSSStyleSheet(css_248z$7);
  /**
   * Élément web personnalisé permettant d'afficher une image qui s'adapte automatiquement au mode sombre ou clair de l'interface.
   *
   * Le composant utilise des variables CSS pour gérer les différentes versions de l'image en fonction du thème.
   *
   * ## Attributs
   * - `src` : L'URL de l'image à afficher.
   * - `alt` : Texte alternatif pour l'image.
   *
   * ## Evènements
   * - `load` : Déclenché lorsque l'image est chargée avec succès.
   * - `error` : Déclenché si une erreur survient lors du chargement de l'image.
   *
   * @structure Image avec -light dans le nom de fichier
   * <bnum-img src="assets/icon-light.png" alt="Description"></bnum-img>
   *
   * @structure Image sans -light dans le nom de fichier
   * <bnum-img src="assets/logo.png" alt="Description"></bnum-img>
   *
   * @cssvar {var(--_image-light)} --_image-url - Url de l'image de la balise `img`. Ne pas modifier, sauf lors de la surcharge dans votre système de mode sombre.
   * @cssvar {} --_image-dark - Variable à assigner à `--_image-url` en mode sombre. Ne pas modifier.
   * @cssvar {} --_image-light - Ne pas modifier.
   *
   *
   * @class
   * @extends BnumElement
   * @example
   * <bnum-img src="image-light.png" alt="Description"></bnum-img>
   */
  class HTMLBnumPicture extends BnumElement {
      //#region Constants
      /**
       * Nom de l'attribut 'src'.
       * @attr {string} src - Utilisé pour définir l'URL de l'image.
       */
      static ATTRIBUTE_SRC = 'src';
      /**
       * Nom de l'attribut 'alt'.
       * @attr {string} (optional) alt - Utilisé pour définir le texte alternatif de l'image. Optionnel, mais recommandé pour l'accessibilité.
       */
      static ATTRIBUTE_ALT = 'alt';
      /**
       * Chaîne de caractères représentant le suffixe pour les images en mode clair.
       */
      static STRING_SRC_LIGHT = '-light';
      /**
       * Chaîne de caractères représentant le suffixe pour les images en mode sombre.
       */
      static STRING_SRC_DARK = '-dark';
      /**
       * Nom de l'événement déclenché lorsque l'image est chargée avec succès.
       * @event load
       * @detail Event
       */
      static EVENT_LOAD = 'load';
      /**
       * Nom de l'événement déclenché lorsqu'une erreur survient lors du chargement de l'image.
       * @event error
       * @detail Event
       */
      static EVENT_ERROR = 'error';
      /**
       * Nom de la variable CSS pour l'URL de l'image en mode clair.
       */
      static CSS_VARIABLE_IMAGE_LIGHT = '--_image-light';
      /**
       * Nom de la variable CSS pour l'URL de l'image en mode sombre.
       */
      static CSS_VARIABLE_IMAGE_DARK = '--_image-dark';
      //#endregion Constants
      //#region Private fields
      #_img = null;
      //#endregion Private fields
      //#region Setters/Getters
      /**
       * Retourne l'URL de l'image.
       * Permet d'obtenir la valeur de l'attribut 'src'.
       * @type {string}
       * @readonly
       */
      get src() {
          return this.getAttribute(HTMLBnumPicture.ATTRIBUTE_SRC);
      }
      /**
       * Retourne l'URL de l'image en mode sombre.
       * Génère dynamiquement l'URL pour le mode sombre à partir de l'attribut 'src'.
       * @type {string}
       * @readonly
       */
      get darkUrl() {
          if (this.hasAttribute(HTMLBnumPicture.ATTRIBUTE_SRC)) {
              //On récupère l'attribut src de l'élément
              const attr = this.getAttribute(HTMLBnumPicture.ATTRIBUTE_SRC);
              //On vérifie si l'attibut src contient le mot clé "light".
              if (attr.match(REG_LIGHT_PICTURE_NAME)?.length)
                  //Si c'est le cas, on remplace "light" par "dark" dans l'URL de l'image.
                  return attr.replace(REG_LIGHT_PICTURE_NAME, `${HTMLBnumPicture.STRING_SRC_DARK}.$2`);
              else
                  // Si l'attribut src ne contient pas le mot clé "light", on remplace la dernière partie de l'URL par "-dark".
                  return (attr.split('.').slice(0, -1).join('.') +
                      `${HTMLBnumPicture.STRING_SRC_DARK}.` +
                      attr.split('.').slice(-1));
          }
          return null;
      }
      /**
       * Retourne l'élément image HTML associé.
       * Permet d'accéder directement à l'élément <img> du composant.
       * @type {HTMLImageElement}
       * @readonly
       */
      get picture() {
          return this.shadowRoot.querySelector('img');
      }
      //#endregion Setters/Getters
      //#region Lifecycle
      /**
       * Constructeur de l'élément BnumHTMLPicture.
       * Initialise l'observateur de mutations et les gestionnaires d'attributs.
       */
      constructor() {
          super();
      }
      /**
       * @inheritdoc
       */
      _p_getStylesheets() {
          return [SHEET$7];
      }
      /**
       * Construit le DOM du composant.
       * Crée l'élément <img> et initialise ses attributs.
       * @param {ShadowRoot | HTMLElement} container - Le conteneur dans lequel insérer l'image.
       * @protected
       */
      _p_buildDOM(container) {
          this.#_img = document.createElement('img');
          // On met à jour les attributs (logique de _p_update)
          this.#_updatePicture(this.src, this.getAttribute(HTMLBnumPicture.ATTRIBUTE_ALT));
          container.appendChild(this.#_img);
          this.setAttribute('role', 'img');
      }
      /**
       * Met à jour le composant lors d'un changement d'attribut.
       * Actualise l'image et ses propriétés selon les nouveaux attributs.
       * @param {string} name - Nom de l'attribut modifié.
       * @param {string | null} oldVal - Ancienne valeur de l'attribut.
       * @param {string | null} newVal - Nouvelle valeur de l'attribut.
       * @protected
       */
      _p_update(name, oldVal, newVal) {
          if (name === HTMLBnumPicture.ATTRIBUTE_SRC ||
              name === HTMLBnumPicture.ATTRIBUTE_ALT) {
              this.#_updatePicture(this.src, this.getAttribute(HTMLBnumPicture.ATTRIBUTE_ALT));
          }
      }
      /**
       * Attache les gestionnaires d'événements à l'image.
       * Permet de réagir aux événements 'load' et 'error' de l'image.
       * @protected
       */
      _p_attach() {
          super._p_attach();
          if (this.#_img) {
              this.#_img.addEventListener(HTMLBnumPicture.EVENT_LOAD, this.trigger.bind(this, HTMLBnumPicture.EVENT_LOAD));
              this.#_img.addEventListener(HTMLBnumPicture.EVENT_ERROR, this.trigger.bind(this, HTMLBnumPicture.EVENT_ERROR));
          }
      }
      /**
       * @inheritdoc
       */
      _p_isUpdateForAllAttributes() {
          return true;
      }
      //#endregion Lifecycle
      //#region Private methods
      /**
       * Met à jour l'image affichée et ses propriétés.
       * Centralise la logique de mise à jour de l'élément <img>.
       * @param {string | null} src - URL de l'image.
       * @param {string | null} alt - Texte alternatif.
       * @private
       */
      #_updatePicture(src, alt) {
          if (!this.#_img)
              return;
          const darkSrc = this.darkUrl;
          // 1. On passe les URLs au CSS via des variables sur :host
          this.style.setProperty(HTMLBnumPicture.CSS_VARIABLE_IMAGE_LIGHT, `url(${src ?? EMPTY_STRING})`);
          this.style.setProperty(HTMLBnumPicture.CSS_VARIABLE_IMAGE_DARK, `url(${darkSrc ?? EMPTY_STRING})`);
          this.#_img.alt = alt ?? EMPTY_STRING;
          if (alt)
              this.setAttribute('aria-label', alt ?? EMPTY_STRING);
      }
      //#endregion Private methods
      //#region Static methods
      /**
       * Retourne la liste des attributs observés par le composant.
       * Permet au composant de réagir aux changements de ces attributs.
       * @returns {string[]}
       * @protected
       */
      static _p_observedAttributes() {
          const array = super._p_observedAttributes();
          array.push(HTMLBnumPicture.ATTRIBUTE_SRC, HTMLBnumPicture.ATTRIBUTE_ALT);
          return array;
      }
      /**
       * Crée un nouvel élément BnumHTMLPicture avec la source spécifiée.
       * Permet d'instancier facilement le composant avec une image donnée.
       * @param {string} src - L'URL de l'image à afficher.
       * @returns {HTMLBnumPicture}
       * @static
       */
      static Create(src) {
          const element = document.createElement(this.TAG);
          element.setAttribute(HTMLBnumPicture.ATTRIBUTE_SRC, src);
          return element;
      }
      /**
       * Retourne le nom de la balise personnalisée associée à ce composant.
       * Utilisé pour définir et référencer le composant dans le DOM.
       * @type {string}
       * @static
       * @readonly
       */
      static get TAG() {
          return TAG_PICTURE;
      }
  }
  //#region TryDefine
  HTMLBnumPicture.TryDefine();
  //#endregion

  var css_248z$6 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host a{align-items:var(--bnum-card-title-align-items,center);display:var(--bnum-card-title-display,flex);gap:var(--bnum-card-title-gap,var(--bnum-space-s,10px))}:host(:state(url)) a{color:var(--a-color,var(--bnum-text-primary,#000));-webkit-text-decoration:var(--a-text-decoration,none);text-decoration:var(--a-text-decoration,none)}:host(:state(url)) a:hover{color:var(--a-hover-color,var(--bnum-text-primary,#000));-webkit-text-decoration:var(--a-hover-text-decoration,underline);text-decoration:var(--a-hover-text-decoration,underline)}";

  const SHEET$6 = BnumElement.ConstructCSSStyleSheet(css_248z$6);
  /**
   * Composant représentant le titre d'une carte, pouvant inclure une icône et un lien.
   * Permet d'afficher un titre enrichi avec une icône et éventuellement un lien cliquable.
   *
   * @structure Cas url et icône
   * <bnum-card-title data-icon="labs" url="https://example.com">Titre de la carte</bnum-card-title>
   *
   * @structure Cas icône uniquement
   * <bnum-card-title data-icon="labs">Titre de la carte</bnum-card-title>
   *
   * @structure Cas lien uniquement
   * <bnum-card-title url="https://example.com">Titre de la carte</bnum-card-title>
   *
   * @structure Cas texte seul
   * <bnum-card-title>Titre de la carte</bnum-card-title>
   *
   * @structure Cas icône via slot
   * <bnum-card-title>
   *  <bnum-icon slot="icon">drive_folder_upload</bnum-icon>
   *  Titre de la carte
   * </bnum-card-title>
   *
   * @state url - Actif lorsque le titre contient un lien.
   * @state without-url - Actif lorsque le titre ne contient pas de lien.
   *
   * @slot (default) - Titre de la carte (texte ou HTML)
   * @slot icon - Icône personnalisée à afficher avant le titre. Note: si une icône est définie via l'attribut `data-icon` ou via la propriété `icon`, ce slot sera ignoré.
   *
   * @cssvar {flex} --bnum-card-title-display - Définit le mode d'affichage du titre de la carte.
   * @cssvar {center} --bnum-card-title-align-items - Définit l'alignement vertical des éléments dans le titre de la carte.
   * @cssvar {var(--bnum-space-s, 10px)} --bnum-card-title-gap - Définit l'espacement entre l'icône et le texte du titre.
   */
  class HTMLBnumCardTitle extends BnumElement {
      //#region Constants
      /**
       * Nom de l'attribut pour définir l'URL du lien du titre de la carte.
       * @attr {string | null} (optional) url - URL du lien du titre de la carte
       */
      static ATTRIBUTE_URL = 'url';
      /**
       * Nom de la data pour définir l'icône du titre de la carte.
       * @attr {string | null} (optional) data-icon - Nom de l'icône (Material Symbols) à afficher avant le titre
       */
      static ATTRIBUTE_DATA_ICON = 'icon';
      /**
       * Nom du slot pour l'icône du titre de la carte.
       */
      static SLOT_NAME_ICON = 'icon';
      /**
       * Nom de la classe au titre de la carte lorsqu'un url est défini
       */
      static CLASS_LINK = 'card-title-link';
      /**
       * Nom de l'état lorsque le titre contient un lien.
       */
      static STATE_URL = 'url';
      /**
       * Nom de l'état lorsque le titre ne contient pas de lien.
       */
      static STATE_WITHOUT_URL = 'without-url';
      /**
       * Nom de la classe pour l'icône du titre de la carte.
       */
      static CLASS_ICON_TITLE = 'card-icon-title';
      /**
       * ID du slot pour l'icône du titre de la carte.
       */
      static ID_SLOT_ICON = 'sloticon';
      /**
       * ID du slot pour le texte du titre de la carte.
       */
      static ID_SLOT_TEXT = 'mainslot';
      /**
       * ID de l'élément personnalisé pour le corps du titre de la carte.
       */
      static ID_CUSTOM_BODY = 'custombody';
      //#endregion Constants
      //#region Private fields
      /**
       * Élément représentant l'icône du titre de la carte.
       * Peut être un composant icône ou un slot HTML.
       * @private
       */
      #_iconElement = null;
      #_iconSlotElement = null;
      /**
       * Slot pour le texte du titre de la carte.
       * @private
       */
      #_textSlotElement = null;
      #_customBodyElement = null;
      /**
       * Élément lien (<a>) englobant le titre si une URL est définie.
       * @private
       */
      #_linkElement = null;
      #_internals = this.attachInternals();
      #_domScheduler = null;
      #_bodyScheduler = null;
      #_initBody = null;
      //#endregion Private fields
      //#region Getter/Setters
      /**
       * Obtient le nom de l'icône associée au titre de la carte.
       * @returns {string | null} Nom de l'icône ou null si aucune icône n'est définie
       */
      get icon() {
          return this.data(HTMLBnumCardTitle.ATTRIBUTE_DATA_ICON);
      }
      /**
       * Définit le nom de l'icône associée au titre de la carte.
       * Met à jour le DOM pour refléter le changement.
       * @param {string | null} v Nom de l'icône ou null
       */
      set icon(v) {
          if (this.alreadyLoaded) {
              this._p_setData(HTMLBnumCardTitle.ATTRIBUTE_DATA_ICON, v);
              this.#_requestUpdateDom();
          }
          else {
              const fromAttribute = true;
              this.data(HTMLBnumCardTitle.ATTRIBUTE_DATA_ICON, v, fromAttribute);
          }
      }
      /**
       * Obtient l'URL du lien du titre de la carte.
       * @returns {string | null} URL ou null si aucun lien n'est défini
       */
      get url() {
          return this.getAttribute(HTMLBnumCardTitle.ATTRIBUTE_URL);
      }
      /**
       * Définit l'URL du lien du titre de la carte.
       * Ajoute ou retire l'attribut selon la valeur.
       * @param {string | null} v URL ou null
       */
      set url(v) {
          if (v)
              this.setAttribute(HTMLBnumCardTitle.ATTRIBUTE_URL, v);
          else
              this.removeAttribute(HTMLBnumCardTitle.ATTRIBUTE_URL);
      }
      //#endregion Getter/Setters
      //#region Lifecycle
      /**
       * Constructeur du composant HTMLBnumCardTitle.
       * Initialise le composant sans ajouter d'éléments DOM.
       */
      constructor() {
          super();
      }
      _p_getStylesheets() {
          return [SHEET$6];
      }
      _p_fromTemplate() {
          return TEMPLATE$4;
      }
      /**
       * Construit le DOM du composant dans le conteneur donné.
       * Ajoute l'icône, le texte et le lien selon les propriétés définies.
       * @param {ShadowRoot | HTMLElement} container Conteneur dans lequel construire le DOM
       */
      _p_buildDOM(container) {
          this.#_iconSlotElement = container.querySelector(`#${HTMLBnumCardTitle.ID_SLOT_ICON}`);
          this.#_textSlotElement = container.querySelector(`#${HTMLBnumCardTitle.ID_SLOT_TEXT}`);
          this.#_customBodyElement = container.querySelector(`#${HTMLBnumCardTitle.ID_CUSTOM_BODY}`);
          this.#_linkElement = container.querySelector(`.${HTMLBnumCardTitle.CLASS_LINK}`);
          this.#_iconElement = container.querySelector(`.${HTMLBnumCardTitle.CLASS_ICON_TITLE}`);
          this.#_updateDOM();
          if (this.#_initBody) {
              this.#_updateBody(this.#_initBody);
              this.#_initBody = null;
          }
      }
      _p_isUpdateForAllAttributes() {
          return true;
      }
      /**
       * Méthode appelée lors de la mise à jour d'un attribut observé.
       * Met à jour le DOM du composant.
       * @param {string} name Nom de l'attribut modifié
       * @param {string | null} oldVal Ancienne valeur
       * @param {string | null} newVal Nouvelle valeur
       */
      _p_update(name, oldVal, newVal) {
          if (this.alreadyLoaded)
              this.#_updateDOM();
      }
      //#endregion Lifecycle
      //#region Private methods
      /**
       * Demande une mise à jour du DOM du composant.
       * Utilise un ordonnanceur pour éviter les mises à jour redondantes.
       * @private
       */
      #_requestUpdateDom() {
          this.#_domScheduler ??= new Scheduler(() => {
              this.#_updateDOM();
          });
          this.#_domScheduler.schedule();
      }
      /**
       * Met à jour le DOM du composant selon les propriétés actuelles.
       * Affiche ou masque l'icône et met à jour le lien si nécessaire.
       * @private
       */
      #_updateDOM() {
          const url = this.url;
          const icon = this.icon;
          this.#_internals.states.clear();
          if (icon) {
              this.#_iconElement.icon = icon;
              this.#_iconElement.hidden = false;
              this.#_iconSlotElement.hidden = true;
          }
          else
              this.#_iconElement.hidden = true;
          if (url) {
              this.#_linkElement.href = url;
              this.#_internals.states.add(HTMLBnumCardTitle.STATE_URL);
              this.#_linkElement.removeAttribute('role');
              this.#_linkElement.removeAttribute('aria-disabled');
          }
          else {
              this.#_linkElement.removeAttribute('href');
              this.#_internals.states.add(HTMLBnumCardTitle.STATE_WITHOUT_URL);
          }
      }
      /**
       * Met à jour le corps du titre de la carte.
       * @param element Elément HTML, texte ou nœud Text à insérer dans le titre
       * @private
       */
      #_updateBody(element) {
          this.#_customBodyElement.hidden = false;
          this.#_textSlotElement.hidden = true;
          if (typeof element === 'string')
              this.#_customBodyElement.textContent = element;
          else
              this.#_customBodyElement.appendChild(element);
      }
      //#endregion Private methods
      //#region Public methods
      /**
       * Met à jour le contenu du titre de la carte.
       * Remplace le texte ou ajoute un élément HTML comme corps du titre.
       * @param {HTMLElement | string | Text} element Le contenu à insérer (texte, élément ou nœud Text)
       * @returns {HTMLBnumCardTitle} Retourne l'instance pour chaînage
       */
      updateBody(element, { force = false } = {}) {
          this.#_bodyScheduler ??= new Scheduler((el) => {
              this.#_updateBody(el);
          });
          if (!this.alreadyLoaded)
              this.#_initBody = element;
          else if (force)
              this.#_bodyScheduler.call(element);
          else
              this.#_bodyScheduler.schedule(element);
          return this;
      }
      //#endregion Public methods
      //#region Static methods
      /**
       * Retourne la liste des attributs observés par le composant.
       * Permet de réagir aux changements de ces attributs.
       * @returns {string[]} Liste des attributs observés
       */
      static _p_observedAttributes() {
          return [HTMLBnumCardTitle.ATTRIBUTE_URL];
      }
      /**
       * Crée dynamiquement une instance du composant HTMLBnumCardTitle.
       * Permet d'initialiser le titre avec un texte, une icône et/ou un lien.
       * @param {HTMLElement | string | Text} text Le contenu du titre (élément, texte ou chaîne)
       * @param {{ icon?: string | null; link?: string | null }} options Options pour l'icône et le lien
       * @returns {HTMLBnumCardTitle} Instance du composant configurée
       */
      static Create(text, { icon = null, link = null, }) {
          let node = document.createElement(HTMLBnumCardTitle.TAG);
          if (icon)
              node.icon = icon;
          if (link)
              node.url = link;
          return node.updateBody(text, { force: true });
      }
      /**
       * Génère le HTML d'un titre de carte avec icône et lien optionnels.
       * Utile pour créer dynamiquement le composant dans une chaîne HTML.
       * @param {string | null} icon Icône à afficher
       * @param {string} text Texte du titre
       * @param {string | null} link URL du lien
       * @returns {string} HTML généré
       */
      static Generate(icon, text, link) {
          let data = [];
          if (icon)
              data.push(`data-icon="${icon}"`);
          if (link)
              data.push(`url="${link}"`);
          return `<${HTMLBnumCardTitle.TAG} ${data.join(' ')}>${text}</${HTMLBnumCardTitle.TAG}>`;
      }
      /**
       * Retourne le tag HTML du composant.
       * Permet d'obtenir le nom du composant pour l'utiliser dans le DOM.
       * @readonly
       * @returns {string} Tag HTML
       */
      static get TAG() {
          return TAG_CARD_TITLE;
      }
  }
  const TEMPLATE$4 = BnumElement.CreateTemplate(`
      <a class="${HTMLBnumCardTitle.CLASS_LINK}">
        <span class="container">
          <slot id="${HTMLBnumCardTitle.ID_SLOT_ICON}" name="${HTMLBnumCardTitle.SLOT_NAME_ICON}"></slot>
          <${HTMLBnumIcon.TAG} class="${HTMLBnumCardTitle.CLASS_ICON_TITLE}" hidden></${HTMLBnumIcon.TAG}>
        </span>
        <span class="container">
          <slot id="${HTMLBnumCardTitle.ID_SLOT_TEXT}"></slot>
          <span id="${HTMLBnumCardTitle.ID_CUSTOM_BODY}" hidden></span>
        </span>
      </a>
    `);
  //#region TryDefine
  HTMLBnumCardTitle.TryDefine();
  //#endregion TryDefine

  /**
   * Classe interne étendant BnumElement pour gérer les états personnalisés via ElementInternals.
   */
  class BnumElementInternal extends BnumElement {
      /**
       * Internals de l'élément, utilisé pour accéder aux états personnalisés.
       * @private
       */
      #_internal = this.attachInternals();
      constructor() {
          super();
      }
      /**
       * Retourne l'objet ElementInternals associé à l'élément.
       * @protected
       */
      get _p_internal() {
          return this.#_internal;
      }
      /**
       * Retourne l'ensemble des états personnalisés de l'élément.
       * @protected
       */
      get _p_states() {
          return this._p_internal.states;
      }
      /**
       * Efface tous les états personnalisés de l'élément.
       * @returns {this}
       * @protected
       */
      _p_clearStates() {
          this._p_states.clear();
          return this;
      }
      /**
       * Ajoute un état personnalisé à l'élément.
       * @param {string} state - Nom de l'état à ajouter.
       * @returns {this}
       * @protected
       */
      _p_addState(state) {
          this._p_states.add(state);
          return this;
      }
      /**
       * Ajoute plusieurs états personnalisés à l'élément.
       * @param {string[]} states - Liste des états à ajouter.
       * @returns {this}
       * @protected
       */
      _p_addStates(states) {
          for (let index = 0, len = states.length; index < len; ++index) {
              this._p_states.add(states[index]);
          }
          return this;
      }
      /**
       * Supprime un état personnalisé de l'élément.
       * @param {string} state - Nom de l'état à supprimer.
       * @returns {this}
       * @protected
       */
      _p_removeState(state) {
          this._p_states.delete(state);
          return this;
      }
      /**
       * Supprime plusieurs états personnalisés de l'élément.
       * @param {string[]} states - Liste des états à supprimer.
       * @returns {this}
       * @protected
       */
      _p_removeStates(states) {
          for (let index = 0, len = states.length; index < len; ++index) {
              this._p_states.delete(states[index]);
          }
          return this;
      }
      /**
       * Vérifie si l'élément possède un état personnalisé donné.
       * @param {string} state - Nom de l'état à vérifier.
       * @returns {boolean}
       * @protected
       */
      _p_hasState(state) {
          return this._p_states.has(state);
      }
  }

  /**
   * Définit le rôle du bouton sur l'élément donné.
   * @param element Élément Bnum à modifier.
   * @returns L'élément Bnum modifié en bouton.
   */
  function setButtonRole(element) {
      return HTMLBnumButton.ToButton(element);
  }
  /**
   * Supprime le rôle du bouton et les attributs associés de l'élément donné.
   * @param element Élément Bnum à modifier.
   * @returns L'élément Bnum modifié sans rôle de bouton.
   */
  function removeButtonRole(element) {
      if (element.getAttribute('data-set-event') === 'onkeydown') {
          element.removeAttribute('data-set-event');
          element.onkeydown = null;
      }
      element.removeAttribute('role');
      element.removeAttribute('tabindex');
      return element;
  }

  var css_248z$5 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{background-color:var(--bnum-card-background-color,var(--bnum-color-surface,#f6f6f6));border-bottom:var(--bnum-border-on-surface-bottom,solid 4px #000091);border-left:var(--bnum-border-on-surface-left,none);border-right:var(--bnum-border-on-surface-right,none);border-top:var(--bnum-border-on-surface-top,none);display:var(--bnum-card-display,block);height:var(--bnum-card-height,auto);padding:var(--bnum-card-padding,var(--bnum-space-m,15px));position:relative;width:var(--bnum-card-width,auto)}:host .card-loading{display:none}:host(:state(clickable)){cursor:var(--bnum-card-clickable-cursor,pointer)}:host(:hover:state(clickable)){background-color:var(--bnum-card-background-color-hover,var(--bnum-color-surface-hover,#dfdfdf))}:host(:active:state(clickable)){background-color:var(--bnum-card-background-color-active,var(--bnum-color-surface-active,#cfcfcf))}:host(:state(loading)){--bnum-card-background-color-hover:var(--bnum-card-background-color,var(--bnum-color-surface,#f6f6f6));--bnum-card-background-color-active:var(--bnum-card-background-color,var(--bnum-color-surface,#f6f6f6));opacity:.8;pointer-events:none}:host(:state(loading)) .card-loading{align-items:center;display:flex;inset:0;justify-content:center;position:absolute;z-index:10}:host(:state(loading)) .card-loading .loader{animation:var(--bnum-card-loader-animation-rotate360,var(--bnum-animation-rotate360,rotate360 1s linear infinite))}:host(:state(loading)) .card-body slot{visibility:hidden}";

  const SHEET$5 = BnumElementInternal.ConstructCSSStyleSheet(css_248z$5);
  /**
   * Élément à ajouter dans un slot avec un nom de slot optionnel.
   */
  class ScheduleElementAppend {
      #_element;
      #_slot;
      /**
       * Constructeur de la classe ScheduleElementAppend.
       * @param element Element à ajouter
       * @param slot Dans quel slot (null pour le slot principal)
       */
      constructor(element, slot = null) {
          this.#_element = element;
          this.#_slot = slot;
      }
      /**
       * Retourne l'élément à ajouter.
       */
      get element() {
          return this.#_element;
      }
      /**
       * Retourne le nom du slot où ajouter l'élément.
       */
      get slot() {
          return this.#_slot;
      }
  }
  /**
   * Élément HTML représentant une carte personnalisée Bnum.
   *
   * Liste des slots :
   * - title : Contenu du titre de la carte. Si aucun contenu n'est fourni, un titre par défaut sera généré à partir des attributs de données.
   * - (slot par défaut) : Contenu du corps de la carte.
   *
   * Liste des data :
   * - title-icon : Icône du titre de la carte.
   * - title-text : Texte du titre de la carte.
   * - title-link : Lien du titre de la carte.
   *
   * /!\ Les data servent à définir un titre par défaut, si le slot "title" est vide ou pas défini.
   *
   * Liste des attributs :
   * - clickable : Rend la carte cliquable.
   * - loading : Indique si la carte est en état de chargement.
   *
   * Évènements personnalisés :
   * - bnum-card:loading : Déclenché lorsque l'état de chargement de la carte change.
   * - bnum-card:click : Déclenché lorsqu'un clic est effectué sur une carte cliquable.
   *
   * @structure Cas standard
   * <bnum-card>
   * <span slot="title">Titre de la carte</span>
   * <p>Contenu principal.</p>
   * </bnum-card>
   *
   * @structure Carte cliquable
   * <bnum-card clickable>
   * <span slot="title">Carte cliquable</span>
   * <p>Cliquez n'importe où.</p>
   * </bnum-card>
   *
   * @structure Carte avec titre par défaut (via data-attrs)
   * <bnum-card
   * data-title-text="Titre généré"
   * data-title-icon="info"
   * >
   * <p>Le slot "title" est vide.</p>
   * </bnum-card>
   *
   * @structure Carte avec un chargement
   * <bnum-card loading>
   * <bnum-card-title slot="title" data-icon="info">Titre en cours de chargement...</bnum-card-title>
   * <p>Chargement</p>
   * </bnum-card>
   *
   * @state clickable - Est actif lorsque la carte est cliquable.
   * @state loading - Est actif lorsque la carte est en état de chargement.
   *
   * @slot title - Contenu du titre de la carte. Si aucun contenu n'est fourni, un titre par défaut sera généré.
   * @slot (default) - Contenu du corps de la carte. Masqué si l'état `loading` est actif.
   *
   * @cssvar {block} --bnum-card-display - Définit le type d'affichage du composant.
   * @cssvar {var(--bnum-space-m, 15px)} --bnum-card-padding - Définit le padding interne de la carte.
   * @cssvar {auto} --bnum-card-width - Définit la largeur de la carte.
   * @cssvar {auto} --bnum-card-height - Définit la hauteur de la carte.
   * @cssvar {var(--bnum-color-surface, #f6f6f7)} --bnum-card-background-color - Couleur de fond de la carte.
   * @cssvar {var(--bnum-color-surface-hover, #eaeaea)} --bnum-card-background-color-hover - Couleur de fond au survol.
   * @cssvar {var(--bnum-color-surface-active, #dfdfdf)} --bnum-card-background-color-active - Couleur de fond à l'état actif.
   * @cssvar {pointer} --bnum-card-clickable-cursor - Curseur utilisé lorsque la carte est cliquable.
   * @cssvar {var(--bnum-card-loader-animation-rotate360, var(--bnum-animation-rotate360, rotate360 1s linear infinite))} --bnum-card-loader-animation-rotate360 - Animation appliquée au loader (spinner).
   *
   */
  class HTMLBnumCardElement extends BnumElementInternal {
      //#region Constants
      /**
       * Indique si la carte est cliquable.
       * @prop {boolean | undefined} clickable - Si vrai, rend la carte interactive et accessible (rôle bouton).
       * @attr {boolean | string | undefined} (optional) clickable
       * @type {string}
       */
      static STATE_CLICKABLE = 'clickable';
      /**
       * Indique si la carte est en cours de chargement.
       * @prop {boolean | undefined} loading - Si vrai, affiche un spinner et masque le corps.
       * @attr {boolean | string | undefined} (optional) loading
       * @type {string}
       */
      static STATE_LOADING = 'loading';
      /**
       * Classe CSS pour le titre de la carte.
       * @type {string}
       */
      static CSS_CLASS_TITLE = 'card-title';
      /**
       * Classe CSS pour le corps de la carte.
       * @type {string}
       */
      static CSS_CLASS_BODY = 'card-body';
      /**
       * Classe CSS pour l'affichage du loading.
       * @type {string}
       */
      static CSS_CLASS_LOADING = 'card-loading';
      /**
       * Nom de la data pour l'icône du titre.
       * @attr {string | undefined} (optional) data-title-icon - Nom de l'icône (Material Symbols) pour le titre par défaut.
       * @type {string}
       */
      static DATA_TITLE_ICON = 'title-icon';
      /**
       * Nom de la data pour le texte du titre.
       * @attr {string | undefined} (optional) data-title-text - Texte à afficher dans le titre par défaut.
       * @type {string}
       */
      static DATA_TITLE_TEXT = 'title-text';
      /**
       * Nom de la data pour le lien du titre.
       * @attr {string | undefined} (optional) data-title-link - URL à utiliser si le titre par défaut doit être un lien.
       * @type {string}
       */
      static DATA_TITLE_LINK = 'title-link';
      /**
       * Nom de l'évènement déclenché lors du loading.
       * @event bnum-card:loading
       * @detail { oldValue: string|null, newValue: string|null, caller: HTMLBnumCardElement }
       * @type {string}
       */
      static EVENT_LOADING = 'bnum-card:loading';
      /**
       * Nom de l'évènement déclenché lors d'un clic sur la carte.
       * @event bnum-card:click
       * @detail { originalEvent: MouseEvent }
       * @type {string}
       */
      static EVENT_CLICK = 'bnum-card:click';
      /**
       * Nom du slot pour le titre.
       * @type {string}
       */
      static SLOT_TITLE = 'title';
      /**
       * Nom de l'icône utilisée pour le spinner de chargement.
       * @type {string}
       */
      static ICON_SPINNER = 'progress_activity';
      /**
       * Symbole utilisé pour réinitialiser le contenu du slot.
       */
      static SYMBOL_RESET = Symbol('reset');
      //#endregion
      //#region Private fields
      /**
       * Élément HTML utilisé pour afficher le loading.
       * @type {HTMLElement | null}
       */
      #_loadingElement = null;
      /**
       * Élément HTML du corps de la carte.
       * @type {HTMLElement | null}
       */
      #_bodyElement = null;
      #_scheduleBody = null;
      #_scheduleTitle = null;
      #_scheduleAppend = null;
      //#endregion Private fields
      //#region Getters/Setters
      /**
       * Retourne l'icône du titre depuis les données du composant.
       * @returns {string} Icône du titre.
       */
      get _titleIcon() {
          return this.data(HTMLBnumCardElement.DATA_TITLE_ICON);
      }
      /**
       * Retourne le texte du titre depuis les données du composant.
       * @returns {string} Texte du titre.
       */
      get _titleText() {
          return this.data(HTMLBnumCardElement.DATA_TITLE_TEXT);
      }
      /**
       * Retourne le lien du titre depuis les données du composant.
       * @returns {string} Lien du titre.
       */
      get _titleLink() {
          return this.data(HTMLBnumCardElement.DATA_TITLE_LINK);
      }
      /**
       * Retourne les données du titre sous forme d'objet TitleData.
       * @returns {TitleData} Objet contenant les données du titre.
       */
      get _titleData() {
          return {
              icon: this._titleIcon,
              text: this._titleText,
              link: this._titleLink,
              has: () => {
                  return this._titleText !== null && this._titleText !== undefined;
              },
          };
      }
      /**
       * Si vrai, affiche la carte en état de chargement. Elle montre un spinner et masque le corps, de plus, tout les `pointer-events` sont désactivés.
       * @returns {boolean}
       */
      get loading() {
          return this.hasAttribute(HTMLBnumCardElement.STATE_LOADING);
      }
      /**
       * Définit l'état de chargement de la carte.
       * @param {boolean} value
       * @returns {void}
       */
      set loading(value) {
          if (value) {
              this.setAttribute(HTMLBnumCardElement.STATE_LOADING, HTMLBnumCardElement.STATE_LOADING);
          }
          else {
              this.removeAttribute(HTMLBnumCardElement.STATE_LOADING);
          }
      }
      /**
       * Si vrai, la carte est cliquable et interactive.
       * @returns {boolean}
       */
      get clickable() {
          return this.hasAttribute(HTMLBnumCardElement.STATE_CLICKABLE);
      }
      /**
       * Définit si la carte est cliquable ou non.
       * @param {boolean} value
       * @returns {void}
       */
      set clickable(value) {
          // Ajoute le rôle et la tabulation pour l'accessibilité
          if (value) {
              this.setAttribute(HTMLBnumCardElement.STATE_CLICKABLE, HTMLBnumCardElement.STATE_CLICKABLE);
              setButtonRole(this);
          }
          else {
              this.removeAttribute(HTMLBnumCardElement.STATE_CLICKABLE);
              removeButtonRole(this);
          }
      }
      //#endregion Getters/Setters
      /**
       * Retourne la liste des attributs observés par le composant.
       * @returns {string[]} Liste des attributs observés.
       */
      static _p_observedAttributes() {
          return [
              HTMLBnumCardElement.STATE_CLICKABLE,
              HTMLBnumCardElement.STATE_LOADING,
          ];
      }
      //#region Lifecycle
      /**
       * Constructeur de la classe HTMLBnumCardElement.
       * Initialise les écouteurs d'évènements.
       * @constructor
       */
      constructor() {
          super();
          this.addEventListener('click', this.#_handleClick.bind(this));
      }
      _p_fromTemplate() {
          return TEMPLATE$3;
      }
      /**
       * Construit le DOM interne du composant.
       * @param {ShadowRoot | HTMLElement} container ShadowRoot ou HTMLElement cible.
       * @returns {void}
       */
      _p_buildDOM(container) {
          this.#_bodyElement = container.querySelector('#mainslot');
          const titleData = this._titleData;
          if (titleData.has()) {
              HTMLBnumCardTitle.Create(titleData.text || EMPTY_STRING, {
                  icon: titleData.icon || null,
                  link: titleData.link || null,
              }).appendTo(container.querySelector(`slot[name="${HTMLBnumCardElement.SLOT_TITLE}"]`));
          }
          this.#_updateDOM();
      }
      /**
       * Met à jour le composant lors d'un changement d'attribut.
       * @param {string} name Nom de l'attribut modifié.
       * @param {string | null} oldVal Ancienne valeur.
       * @param {string | null} newVal Nouvelle valeur.
       * @returns {void}
       */
      _p_update(name, oldVal, newVal) {
          if (name === HTMLBnumCardElement.STATE_LOADING) {
              this.trigger(HTMLBnumCardElement.EVENT_LOADING, {
                  oldValue: oldVal,
                  newValue: newVal,
                  caller: this,
              });
          }
          this.#_updateDOM();
      }
      _p_getStylesheets() {
          return [SHEET$5];
      }
      //#endregion Lifecycle
      //#region Private methods
      /**
       * Met à jour l'affichage du DOM selon l'état du composant.
       * @returns {void}
       */
      #_updateDOM() {
          this._p_clearStates();
          if (this.clickable)
              this._p_addState(HTMLBnumCardElement.STATE_CLICKABLE);
          if (this.loading) {
              this._p_addState(HTMLBnumCardElement.STATE_LOADING);
              // Initialise le loading si nécessaire
              if (!this.#_loadingElement) {
                  this.#_bodyElement?.appendChild(this.#_getLoading());
              }
          }
      }
      /**
       * Retourne l'élément HTML du loading (spinner).
       * @returns {HTMLElement} Élément HTML du loading.
       */
      #_getLoading() {
          if (!this.#_loadingElement) {
              const loadingDiv = document.createElement('div');
              loadingDiv.classList.add(HTMLBnumCardElement.CSS_CLASS_LOADING);
              const spinner = HTMLBnumIcon.Create(HTMLBnumCardElement.ICON_SPINNER).addClass('loader');
              loadingDiv.appendChild(spinner);
              this.#_loadingElement = loadingDiv;
          }
          return this.#_loadingElement;
      }
      /**
       * Gère le clic sur la carte.
       * @param {MouseEvent} event Événement de clic sur la carte.
       * @returns {void}
       */
      #_handleClick(event) {
          if (this.clickable) {
              // Déclenche un événement "click" natif
              // ou un événement personnalisé si vous préférez
              this.trigger(HTMLBnumCardElement.EVENT_CLICK, { originalEvent: event });
          }
      }
      #_requestUpdateTitle(element) {
          this.#_scheduleTitle ??= new Scheduler((el) => this.#_updateOrResetTitle(el));
          this.#_scheduleTitle.schedule(element);
      }
      #_updateOrResetTitle(element) {
          if (element === HTMLBnumCardElement.SYMBOL_RESET)
              this.#_resetTitle();
          else
              this.#_updateTitle(element);
      }
      #_updateTitle(element) {
          element.setAttribute('slot', HTMLBnumCardElement.SLOT_TITLE);
          const oldTitles = this.querySelectorAll(`[slot="${HTMLBnumCardElement.SLOT_TITLE}"]`);
          oldTitles.forEach((node) => node.remove());
          this.appendChild(element);
      }
      #_resetTitle() {
          // On trouve tous les éléments du Light DOM assignés au slot "title"
          const nodes = this.querySelectorAll(`[slot="${HTMLBnumCardElement.SLOT_TITLE}"]`);
          nodes.forEach((node) => node.remove());
      }
      #_requestUpdateBody(element) {
          this.#_scheduleBody ??= new Scheduler((el) => this.#_updateOrResetBody(el));
          this.#_scheduleBody.schedule(element);
      }
      #_updateOrResetBody(element) {
          if (element === HTMLBnumCardElement.SYMBOL_RESET)
              this.#_resetBody();
          else
              this.#_updateBody(element);
      }
      #_updateBody(element) {
          element.removeAttribute('slot');
          const oldBodyNodes = Array.from(this.childNodes).filter((node) => (node.nodeType === Node.ELEMENT_NODE &&
              node.getAttribute('slot') !==
                  HTMLBnumCardElement.SLOT_TITLE) ||
              (node.nodeType === Node.TEXT_NODE &&
                  node.textContent?.trim() !== EMPTY_STRING));
          oldBodyNodes.forEach((node) => node.remove());
          this.appendChild(element);
      }
      #_resetBody() {
          // On trouve tous les éléments qui n'ont PAS de slot="title"
          const nodes = Array.from(this.childNodes).filter((node) => (node.nodeType === Node.ELEMENT_NODE &&
              node.getAttribute('slot') !==
                  HTMLBnumCardElement.SLOT_TITLE) ||
              (node.nodeType === Node.TEXT_NODE &&
                  node.textContent?.trim() !== EMPTY_STRING));
          nodes.forEach((node) => node.remove());
      }
      #_requestAppendElement(appended) {
          this.#_scheduleAppend ??= new Scheduler((el) => this.#_appendElement(el));
          this.#_scheduleAppend.schedule(appended);
      }
      #_appendElement(appended) {
          if (appended.slot)
              appended.element.setAttribute('slot', appended.slot);
          else
              appended.element.removeAttribute('slot');
          this.appendChild(appended.element);
      }
      //#endregion Private methods
      //#region Public methods
      /**
       * Remplace tout le contenu du slot "title" par un nouvel élément.
       * @param {Element} element Élément à insérer dans le slot "title".
       * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
       */
      updateTitle(element) {
          this.#_requestUpdateTitle(element);
          return this;
      }
      /**
       * Remplace tout le contenu du slot par défaut (body) par un nouvel élément.
       * @param {Element} element Élément à insérer dans le corps de la carte.
       * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
       */
      updateBody(element) {
          this.#_requestUpdateBody(element);
          return this;
      }
      /**
       * Supprime tous les éléments du slot "title".
       * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
       */
      clearTitle() {
          this.#_requestUpdateTitle(HTMLBnumCardElement.SYMBOL_RESET);
          return this;
      }
      /**
       * Supprime tous les éléments du corps de la carte (hors slot "title").
       * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
       */
      clearBody() {
          this.#_requestUpdateBody(HTMLBnumCardElement.SYMBOL_RESET);
          return this;
      }
      /**
       * Ajoute un élément au slot "title" sans supprimer les éléments existants.
       * @param {Element} element Élément à ajouter au slot "title".
       * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
       */
      appendToTitle(element) {
          this.#_requestAppendElement(new ScheduleElementAppend(element, HTMLBnumCardElement.SLOT_TITLE));
          return this;
      }
      /**
       * Ajoute un élément au corps de la carte (slot par défaut) sans supprimer les éléments existants.
       * @param {Element} element Élément à ajouter au corps de la carte.
       * @returns {HTMLBnumCardElement} L'instance courante de HTMLCardElement.
       */
      appendToBody(element) {
          this.#_requestAppendElement(new ScheduleElementAppend(element));
          return this;
      }
      //#endregion Public methods
      //#region Static properties
      /**
       * Crée une nouvelle instance de HTMLBnumCardElement avec les options spécifiées.
       * @param param0 Options de création de la carte
       * @param param0.title Titre de la carte (optionnel)
       * @param param0.body Corps de la carte (optionnel)
       * @param param0.clickable Si vrai, rend la carte cliquable (optionnel, défaut false)
       * @param param0.loading Si vrai, affiche la carte en état de chargement (optionnel, défaut false)
       * @returns Element HTMLBnumCardElement créé
       */
      static Create({ title = null, body = null, clickable = false, loading = false, } = {}) {
          const card = document.createElement(HTMLBnumCardElement.TAG);
          if (title)
              card.updateTitle(title);
          if (body)
              card.updateBody(body);
          if (clickable)
              card.setAttribute(HTMLBnumCardElement.STATE_CLICKABLE, HTMLBnumCardElement.STATE_CLICKABLE);
          if (loading)
              card.setAttribute(HTMLBnumCardElement.STATE_LOADING, HTMLBnumCardElement.STATE_LOADING);
          return card;
      }
      /**
       * Retourne le nom de la balise personnalisée pour cet élément.
       * @returns Nom de la balise personnalisée.
       */
      static get TAG() {
          return TAG_CARD;
      }
  }
  const TEMPLATE$3 = BnumElementInternal.CreateTemplate(`
      <div class="${HTMLBnumCardElement.CSS_CLASS_TITLE}">
        <slot name="${HTMLBnumCardElement.SLOT_TITLE}"></slot>
      </div>
      <div class="${HTMLBnumCardElement.CSS_CLASS_BODY}">
        <slot id="mainslot"></slot>
      </div>
    `);
  HTMLBnumCardElement.TryDefine();

  var css_248z$4 = ":host{background-color:var(--bnum-card-item-background-color,var(--bnum-color-surface,#f6f6f7));cursor:var(--bnum-card-item-cursor,pointer);display:var(--bnum-card-item-display,block);padding:var(--bnum-card-item-padding,15px);user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;width:calc(var(--bnum-card-item-width-percent, 100%) - var(--bnum-card-item-width-modifier, 30px))}:host(:hover){background-color:var(--bnum-card-item-background-color-hover,var(--bnum-color-surface-hover,#eaeaea))}:host(:active){background-color:var(--bnum-card-item-background-color-active,var(--bnum-color-surface-active,#dfdfdf))}:host(:disabled),:host(:state(disabled)),:host([disabled]){cursor:not-allowed;opacity:.6;pointer-events:none}";

  const SHEET$4 = BnumElementInternal.ConstructCSSStyleSheet(css_248z$4);
  /**
   * Représente un item d'une carte `<bnum-card>` qui peut être mis dans un `bnum-card-list`.
   *
   * L'élément est considéré comme un `li` d'une liste pour des raisons d'accessibilité.
   *
   * @structure Item de carte
   * <bnum-card-item><p>Contenu de l'item</p></bnum-card-item>
   *
   * @structure Désactivé
   * <bnum-card-item disabled><p>Contenu de l'item</p></bnum-card-item>
   *
   * @state disabled - Actif quand l'item est désactivé
   *
   * @slot (default) - Contenu de l'item
   *
   * @cssvar {100%} --bnum-card-item-width-percent - Largeur en pourcentage du composant
   * @cssvar {30px} --bnum-card-item-width-modifier - Valeur soustraite à la largeur
   * @cssvar {var(--bnum-color-surface, #f6f6f7)} --bnum-card-item-background-color - Couleur de fond normale
   * @cssvar {var(--bnum-color-surface-hover, #eaeaea)} --bnum-card-item-background-color-hover - Couleur de fond au survol
   * @cssvar {var(--bnum-color-surface-active, #dfdfdf)} --bnum-card-item-background-color-active - Couleur de fond à l'état actif
   * @cssvar {pointer} --bnum-card-item-cursor - Type de curseur
   * @cssvar {15px} --bnum-card-item-padding - Espacement interne
   * @cssvar {block} --bnum-card-item-display - Type d'affichage
   */
  class HTMLBnumCardItem extends BnumElementInternal {
      /**
       * Attribut désactivé
       * @attr {boolean | 'disabled' | undefined} (optional) disabled - Indique si l'item est désactivé
       */
      static ATTRIBUTE_DISABLED = 'disabled';
      /**
       * État désactivé
       */
      static STATE_DISABLED = 'disabled';
      /**
       * Rôle du composant
       */
      static ROLE = 'listitem';
      /**
       * Événement click
       * @event click
       * @detail MouseEvent
       */
      static CLICK = 'click';
      /**
       * Événement déclenché lors du clic sur l'item.
       * Permet d'attacher des gestionnaires personnalisés au clic.
       */
      #_onitemclicked = null;
      _p_slot = null;
      /**
       * Retourne la liste des attributs observés par le composant.
       * Utile pour détecter les changements d'attributs et mettre à jour l'état du composant.
       * @returns {string[]} Liste des attributs observés.
       */
      static _p_observedAttributes() {
          return [HTMLBnumCardItem.ATTRIBUTE_DISABLED];
      }
      /**
       * Événement déclenché lors du clic sur l'item.
       * Permet d'attacher des gestionnaires personnalisés au clic.
       */
      get onitemclicked() {
          this.#_onitemclicked ??= new JsEvent();
          return this.#_onitemclicked;
      }
      /**
       * Constructeur du composant.
       * Initialise l'événement personnalisé et attache le gestionnaire de clic.
       */
      constructor() {
          super();
          this.addEventListener(HTMLBnumCardItem.CLICK, (e) => {
              if (this.onitemclicked.haveEvents())
                  this.onitemclicked.call(e);
          });
      }
      _p_fromTemplate() {
          return BASE_TEMPLATE;
      }
      /**
       * Construit le DOM interne du composant.
       * Ajoute le slot pour le contenu et configure les attributs nécessaires.
       * @param container ShadowRoot ou HTMLElement qui contient le DOM du composant.
       */
      _p_buildDOM(container) {
          this._p_slot =
              container instanceof ShadowRoot
                  ? container.getElementById('defaultslot')
                  : container.querySelector('#defaultslot');
      }
      _p_attach() {
          super._p_attach();
          HTMLBnumButton.ToButton(this)
              .attr('role', HTMLBnumCardItem.ROLE)
              ._p_update(HTMLBnumCardItem.ATTRIBUTE_DISABLED, null, this.attr(HTMLBnumCardItem.ATTRIBUTE_DISABLED));
      }
      /**
       * Met à jour l'état du composant en fonction des changements d'attributs.
       * Gère l'état désactivé et l'attribut aria-disabled.
       * @param name Nom de l'attribut modifié.
       * @param oldVal Ancienne valeur de l'attribut.
       * @param newVal Nouvelle valeur de l'attribut.
       */
      _p_update(name, oldVal, newVal) {
          this._p_render();
      }
      _p_render() {
          this._p_clearStates();
          if (this.hasAttribute('disabled')) {
              this.setAttribute('aria-disabled', 'true');
              this._p_addState(HTMLBnumCardItem.STATE_DISABLED);
          }
          else
              this.removeAttribute('aria-disabled');
      }
      _p_isUpdateForAllAttributes() {
          return true;
      }
      _p_getStylesheets() {
          return [SHEET$4];
      }
      static CreateChildTemplate(childTemplate, { defaultSlot = true, slotName = EMPTY_STRING, } = {}) {
          const template = document.createElement('template');
          template.innerHTML = `${defaultSlot ? `<slot id="defaultslot" ${slotName ? `name="${slotName}"` : ''}></slot>` : EMPTY_STRING}${childTemplate}`;
          return template;
      }
      /**
       * Retourne le tag du composant.
       * @returns {string} Tag du composant.
       */
      static get TAG() {
          return TAG_CARD_ITEM;
      }
  }
  const BASE_TEMPLATE = HTMLBnumCardItem.CreateChildTemplate(EMPTY_STRING);
  HTMLBnumCardItem.TryDefine();

  /**
   * @module constants
   * @summary Useful constants
   * @description
   * Collection of useful date constants.
   *
   * The constants could be imported from `date-fns/constants`:
   *
   * ```ts
   * import { maxTime, minTime } from "./constants/date-fns/constants";
   *
   * function isAllowedTime(time) {
   *   return time <= maxTime && time >= minTime;
   * }
   * ```
   */

  /**
   * @constant
   * @name millisecondsInWeek
   * @summary Milliseconds in 1 week.
   */
  const millisecondsInWeek = 604800000;

  /**
   * @constant
   * @name millisecondsInDay
   * @summary Milliseconds in 1 day.
   */
  const millisecondsInDay = 86400000;

  /**
   * @constant
   * @name millisecondsInMinute
   * @summary Milliseconds in 1 minute
   */
  const millisecondsInMinute = 60000;

  /**
   * @constant
   * @name millisecondsInHour
   * @summary Milliseconds in 1 hour
   */
  const millisecondsInHour = 3600000;

  /**
   * @constant
   * @name millisecondsInSecond
   * @summary Milliseconds in 1 second
   */
  const millisecondsInSecond = 1000;

  /**
   * @constant
   * @name constructFromSymbol
   * @summary Symbol enabling Date extensions to inherit properties from the reference date.
   *
   * The symbol is used to enable the `constructFrom` function to construct a date
   * using a reference date and a value. It allows to transfer extra properties
   * from the reference date to the new date. It's useful for extensions like
   * [`TZDate`](https://github.com/date-fns/tz) that accept a time zone as
   * a constructor argument.
   */
  const constructFromSymbol = Symbol.for("constructDateFrom");

  /**
   * @name constructFrom
   * @category Generic Helpers
   * @summary Constructs a date using the reference date and the value
   *
   * @description
   * The function constructs a new date using the constructor from the reference
   * date and the given value. It helps to build generic functions that accept
   * date extensions.
   *
   * It defaults to `Date` if the passed reference date is a number or a string.
   *
   * Starting from v3.7.0, it allows to construct a date using `[Symbol.for("constructDateFrom")]`
   * enabling to transfer extra properties from the reference date to the new date.
   * It's useful for extensions like [`TZDate`](https://github.com/date-fns/tz)
   * that accept a time zone as a constructor argument.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   *
   * @param date - The reference date to take constructor from
   * @param value - The value to create the date
   *
   * @returns Date initialized using the given date and value
   *
   * @example
   * import { constructFrom } from "./constructFrom/date-fns";
   *
   * // A function that clones a date preserving the original type
   * function cloneDate<DateType extends Date>(date: DateType): DateType {
   *   return constructFrom(
   *     date, // Use constructor from the given date
   *     date.getTime() // Use the date value to create a new date
   *   );
   * }
   */
  function constructFrom(date, value) {
    if (typeof date === "function") return date(value);

    if (date && typeof date === "object" && constructFromSymbol in date)
      return date[constructFromSymbol](value);

    if (date instanceof Date) return new date.constructor(value);

    return new Date(value);
  }

  /**
   * @name toDate
   * @category Common Helpers
   * @summary Convert the given argument to an instance of Date.
   *
   * @description
   * Convert the given argument to an instance of Date.
   *
   * If the argument is an instance of Date, the function returns its clone.
   *
   * If the argument is a number, it is treated as a timestamp.
   *
   * If the argument is none of the above, the function returns Invalid Date.
   *
   * Starting from v3.7.0, it clones a date using `[Symbol.for("constructDateFrom")]`
   * enabling to transfer extra properties from the reference date to the new date.
   * It's useful for extensions like [`TZDate`](https://github.com/date-fns/tz)
   * that accept a time zone as a constructor argument.
   *
   * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param argument - The value to convert
   *
   * @returns The parsed date in the local time zone
   *
   * @example
   * // Clone the date:
   * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
   * //=> Tue Feb 11 2014 11:30:30
   *
   * @example
   * // Convert the timestamp to date:
   * const result = toDate(1392098430000)
   * //=> Tue Feb 11 2014 11:30:30
   */
  function toDate(argument, context) {
    // [TODO] Get rid of `toDate` or `constructFrom`?
    return constructFrom(context || argument, argument);
  }

  /**
   * The {@link addDays} function options.
   */

  /**
   * @name addDays
   * @category Day Helpers
   * @summary Add the specified number of days to the given date.
   *
   * @description
   * Add the specified number of days to the given date.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The date to be changed
   * @param amount - The amount of days to be added.
   * @param options - An object with options
   *
   * @returns The new date with the days added
   *
   * @example
   * // Add 10 days to 1 September 2014:
   * const result = addDays(new Date(2014, 8, 1), 10)
   * //=> Thu Sep 11 2014 00:00:00
   */
  function addDays(date, amount, options) {
    const _date = toDate(date, options?.in);
    if (isNaN(amount)) return constructFrom(options?.in || date, NaN);

    // If 0 days, no-op to avoid changing times in the hour before end of DST
    if (!amount) return _date;

    _date.setDate(_date.getDate() + amount);
    return _date;
  }

  /**
   * The {@link addMonths} function options.
   */

  /**
   * @name addMonths
   * @category Month Helpers
   * @summary Add the specified number of months to the given date.
   *
   * @description
   * Add the specified number of months to the given date.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The date to be changed
   * @param amount - The amount of months to be added.
   * @param options - The options object
   *
   * @returns The new date with the months added
   *
   * @example
   * // Add 5 months to 1 September 2014:
   * const result = addMonths(new Date(2014, 8, 1), 5)
   * //=> Sun Feb 01 2015 00:00:00
   *
   * // Add one month to 30 January 2023:
   * const result = addMonths(new Date(2023, 0, 30), 1)
   * //=> Tue Feb 28 2023 00:00:00
   */
  function addMonths(date, amount, options) {
    const _date = toDate(date, options?.in);
    if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
    if (!amount) {
      // If 0 months, no-op to avoid changing times in the hour before end of DST
      return _date;
    }
    const dayOfMonth = _date.getDate();

    // The JS Date object supports date math by accepting out-of-bounds values for
    // month, day, etc. For example, new Date(2020, 0, 0) returns 31 Dec 2019 and
    // new Date(2020, 13, 1) returns 1 Feb 2021.  This is *almost* the behavior we
    // want except that dates will wrap around the end of a month, meaning that
    // new Date(2020, 13, 31) will return 3 Mar 2021 not 28 Feb 2021 as desired. So
    // we'll default to the end of the desired month by adding 1 to the desired
    // month and using a date of 0 to back up one day to the end of the desired
    // month.
    const endOfDesiredMonth = constructFrom(options?.in || date, _date.getTime());
    endOfDesiredMonth.setMonth(_date.getMonth() + amount + 1, 0);
    const daysInMonth = endOfDesiredMonth.getDate();
    if (dayOfMonth >= daysInMonth) {
      // If we're already at the end of the month, then this is the correct date
      // and we're done.
      return endOfDesiredMonth;
    } else {
      // Otherwise, we now know that setting the original day-of-month value won't
      // cause an overflow, so set the desired day-of-month. Note that we can't
      // just set the date of `endOfDesiredMonth` because that object may have had
      // its time changed in the unusual case where where a DST transition was on
      // the last day of the month and its local time was in the hour skipped or
      // repeated next to a DST transition.  So we use `date` instead which is
      // guaranteed to still have the original time.
      _date.setFullYear(
        endOfDesiredMonth.getFullYear(),
        endOfDesiredMonth.getMonth(),
        dayOfMonth,
      );
      return _date;
    }
  }

  let defaultOptions = {};

  function getDefaultOptions$1() {
    return defaultOptions;
  }

  /**
   * The {@link startOfWeek} function options.
   */

  /**
   * @name startOfWeek
   * @category Week Helpers
   * @summary Return the start of a week for the given date.
   *
   * @description
   * Return the start of a week for the given date.
   * The result will be in the local timezone.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The original date
   * @param options - An object with options
   *
   * @returns The start of a week
   *
   * @example
   * // The start of a week for 2 September 2014 11:55:00:
   * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Sun Aug 31 2014 00:00:00
   *
   * @example
   * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
   * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
   * //=> Mon Sep 01 2014 00:00:00
   */
  function startOfWeek(date, options) {
    const defaultOptions = getDefaultOptions$1();
    const weekStartsOn =
      options?.weekStartsOn ??
      options?.locale?.options?.weekStartsOn ??
      defaultOptions.weekStartsOn ??
      defaultOptions.locale?.options?.weekStartsOn ??
      0;

    const _date = toDate(date, options?.in);
    const day = _date.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;

    _date.setDate(_date.getDate() - diff);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  /**
   * The {@link startOfISOWeek} function options.
   */

  /**
   * @name startOfISOWeek
   * @category ISO Week Helpers
   * @summary Return the start of an ISO week for the given date.
   *
   * @description
   * Return the start of an ISO week for the given date.
   * The result will be in the local timezone.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The original date
   * @param options - An object with options
   *
   * @returns The start of an ISO week
   *
   * @example
   * // The start of an ISO week for 2 September 2014 11:55:00:
   * const result = startOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Mon Sep 01 2014 00:00:00
   */
  function startOfISOWeek(date, options) {
    return startOfWeek(date, { ...options, weekStartsOn: 1 });
  }

  /**
   * The {@link getISOWeekYear} function options.
   */

  /**
   * @name getISOWeekYear
   * @category ISO Week-Numbering Year Helpers
   * @summary Get the ISO week-numbering year of the given date.
   *
   * @description
   * Get the ISO week-numbering year of the given date,
   * which always starts 3 days before the year's first Thursday.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @param date - The given date
   *
   * @returns The ISO week-numbering year
   *
   * @example
   * // Which ISO-week numbering year is 2 January 2005?
   * const result = getISOWeekYear(new Date(2005, 0, 2))
   * //=> 2004
   */
  function getISOWeekYear(date, options) {
    const _date = toDate(date, options?.in);
    const year = _date.getFullYear();

    const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
    fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
    fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);

    const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
    fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
    fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);

    if (_date.getTime() >= startOfNextYear.getTime()) {
      return year + 1;
    } else if (_date.getTime() >= startOfThisYear.getTime()) {
      return year;
    } else {
      return year - 1;
    }
  }

  /**
   * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
   * They usually appear for dates that denote time before the timezones were introduced
   * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
   * and GMT+01:00:00 after that date)
   *
   * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
   * which would lead to incorrect calculations.
   *
   * This function returns the timezone offset in milliseconds that takes seconds in account.
   */
  function getTimezoneOffsetInMilliseconds(date) {
    const _date = toDate(date);
    const utcDate = new Date(
      Date.UTC(
        _date.getFullYear(),
        _date.getMonth(),
        _date.getDate(),
        _date.getHours(),
        _date.getMinutes(),
        _date.getSeconds(),
        _date.getMilliseconds(),
      ),
    );
    utcDate.setUTCFullYear(_date.getFullYear());
    return +date - +utcDate;
  }

  function normalizeDates(context, ...dates) {
    const normalize = constructFrom.bind(
      null,
      context || dates.find((date) => typeof date === "object"),
    );
    return dates.map(normalize);
  }

  /**
   * The {@link startOfDay} function options.
   */

  /**
   * @name startOfDay
   * @category Day Helpers
   * @summary Return the start of a day for the given date.
   *
   * @description
   * Return the start of a day for the given date.
   * The result will be in the local timezone.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The original date
   * @param options - The options
   *
   * @returns The start of a day
   *
   * @example
   * // The start of a day for 2 September 2014 11:55:00:
   * const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Tue Sep 02 2014 00:00:00
   */
  function startOfDay(date, options) {
    const _date = toDate(date, options?.in);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  /**
   * The {@link differenceInCalendarDays} function options.
   */

  /**
   * @name differenceInCalendarDays
   * @category Day Helpers
   * @summary Get the number of calendar days between the given dates.
   *
   * @description
   * Get the number of calendar days between the given dates. This means that the times are removed
   * from the dates and then the difference in days is calculated.
   *
   * @param laterDate - The later date
   * @param earlierDate - The earlier date
   * @param options - The options object
   *
   * @returns The number of calendar days
   *
   * @example
   * // How many calendar days are between
   * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
   * const result = differenceInCalendarDays(
   *   new Date(2012, 6, 2, 0, 0),
   *   new Date(2011, 6, 2, 23, 0)
   * )
   * //=> 366
   * // How many calendar days are between
   * // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
   * const result = differenceInCalendarDays(
   *   new Date(2011, 6, 3, 0, 1),
   *   new Date(2011, 6, 2, 23, 59)
   * )
   * //=> 1
   */
  function differenceInCalendarDays(laterDate, earlierDate, options) {
    const [laterDate_, earlierDate_] = normalizeDates(
      options?.in,
      laterDate,
      earlierDate,
    );

    const laterStartOfDay = startOfDay(laterDate_);
    const earlierStartOfDay = startOfDay(earlierDate_);

    const laterTimestamp =
      +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
    const earlierTimestamp =
      +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);

    // Round the number of days to the nearest integer because the number of
    // milliseconds in a day is not constant (e.g. it's different in the week of
    // the daylight saving time clock shift).
    return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
  }

  /**
   * The {@link startOfISOWeekYear} function options.
   */

  /**
   * @name startOfISOWeekYear
   * @category ISO Week-Numbering Year Helpers
   * @summary Return the start of an ISO week-numbering year for the given date.
   *
   * @description
   * Return the start of an ISO week-numbering year,
   * which always starts 3 days before the year's first Thursday.
   * The result will be in the local timezone.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The original date
   * @param options - An object with options
   *
   * @returns The start of an ISO week-numbering year
   *
   * @example
   * // The start of an ISO week-numbering year for 2 July 2005:
   * const result = startOfISOWeekYear(new Date(2005, 6, 2))
   * //=> Mon Jan 03 2005 00:00:00
   */
  function startOfISOWeekYear(date, options) {
    const year = getISOWeekYear(date, options);
    const fourthOfJanuary = constructFrom(options?.in || date, 0);
    fourthOfJanuary.setFullYear(year, 0, 4);
    fourthOfJanuary.setHours(0, 0, 0, 0);
    return startOfISOWeek(fourthOfJanuary);
  }

  /**
   * The {@link addYears} function options.
   */

  /**
   * @name addYears
   * @category Year Helpers
   * @summary Add the specified number of years to the given date.
   *
   * @description
   * Add the specified number of years to the given date.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type.
   *
   * @param date - The date to be changed
   * @param amount - The amount of years to be added.
   * @param options - The options
   *
   * @returns The new date with the years added
   *
   * @example
   * // Add 5 years to 1 September 2014:
   * const result = addYears(new Date(2014, 8, 1), 5)
   * //=> Sun Sep 01 2019 00:00:00
   */
  function addYears(date, amount, options) {
    return addMonths(date, amount * 12, options);
  }

  /**
   * @name constructNow
   * @category Generic Helpers
   * @summary Constructs a new current date using the passed value constructor.
   * @pure false
   *
   * @description
   * The function constructs a new current date using the constructor from
   * the reference date. It helps to build generic functions that accept date
   * extensions and use the current date.
   *
   * It defaults to `Date` if the passed reference date is a number or a string.
   *
   * @param date - The reference date to take constructor from
   *
   * @returns Current date initialized using the given date constructor
   *
   * @example
   * import { constructNow, isSameDay } from 'date-fns'
   *
   * function isToday<DateType extends Date>(
   *   date: DateArg<DateType>,
   * ): boolean {
   *   // If we were to use `new Date()` directly, the function would  behave
   *   // differently in different timezones and return false for the same date.
   *   return isSameDay(date, constructNow(date));
   * }
   */
  function constructNow(date) {
    return constructFrom(date, Date.now());
  }

  /**
   * The {@link isSameDay} function options.
   */

  /**
   * @name isSameDay
   * @category Day Helpers
   * @summary Are the given dates in the same day (and year and month)?
   *
   * @description
   * Are the given dates in the same day (and year and month)?
   *
   * @param laterDate - The first date to check
   * @param earlierDate - The second date to check
   * @param options - An object with options
   *
   * @returns The dates are in the same day (and year and month)
   *
   * @example
   * // Are 4 September 06:00:00 and 4 September 18:00:00 in the same day?
   * const result = isSameDay(new Date(2014, 8, 4, 6, 0), new Date(2014, 8, 4, 18, 0))
   * //=> true
   *
   * @example
   * // Are 4 September and 4 October in the same day?
   * const result = isSameDay(new Date(2014, 8, 4), new Date(2014, 9, 4))
   * //=> false
   *
   * @example
   * // Are 4 September, 2014 and 4 September, 2015 in the same day?
   * const result = isSameDay(new Date(2014, 8, 4), new Date(2015, 8, 4))
   * //=> false
   */
  function isSameDay(laterDate, earlierDate, options) {
    const [dateLeft_, dateRight_] = normalizeDates(
      options?.in,
      laterDate,
      earlierDate,
    );
    return +startOfDay(dateLeft_) === +startOfDay(dateRight_);
  }

  /**
   * @name isDate
   * @category Common Helpers
   * @summary Is the given value a date?
   *
   * @description
   * Returns true if the given value is an instance of Date. The function works for dates transferred across iframes.
   *
   * @param value - The value to check
   *
   * @returns True if the given value is a date
   *
   * @example
   * // For a valid date:
   * const result = isDate(new Date())
   * //=> true
   *
   * @example
   * // For an invalid date:
   * const result = isDate(new Date(NaN))
   * //=> true
   *
   * @example
   * // For some value:
   * const result = isDate('2014-02-31')
   * //=> false
   *
   * @example
   * // For an object:
   * const result = isDate({})
   * //=> false
   */
  function isDate(value) {
    return (
      value instanceof Date ||
      (typeof value === "object" &&
        Object.prototype.toString.call(value) === "[object Date]")
    );
  }

  /**
   * @name isValid
   * @category Common Helpers
   * @summary Is the given date valid?
   *
   * @description
   * Returns false if argument is Invalid Date and true otherwise.
   * Argument is converted to Date using `toDate`. See [toDate](https://date-fns.org/docs/toDate)
   * Invalid Date is a Date, whose time value is NaN.
   *
   * Time value of Date: http://es5.github.io/#x15.9.1.1
   *
   * @param date - The date to check
   *
   * @returns The date is valid
   *
   * @example
   * // For the valid date:
   * const result = isValid(new Date(2014, 1, 31))
   * //=> true
   *
   * @example
   * // For the value, convertible into a date:
   * const result = isValid(1393804800000)
   * //=> true
   *
   * @example
   * // For the invalid date:
   * const result = isValid(new Date(''))
   * //=> false
   */
  function isValid(date) {
    return !((!isDate(date) && typeof date !== "number") || isNaN(+toDate(date)));
  }

  /**
   * The {@link endOfDay} function options.
   */

  /**
   * @name endOfDay
   * @category Day Helpers
   * @summary Return the end of a day for the given date.
   *
   * @description
   * Return the end of a day for the given date.
   * The result will be in the local timezone.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The original date
   * @param options - An object with options
   *
   * @returns The end of a day
   *
   * @example
   * // The end of a day for 2 September 2014 11:55:00:
   * const result = endOfDay(new Date(2014, 8, 2, 11, 55, 0))
   * //=> Tue Sep 02 2014 23:59:59.999
   */
  function endOfDay(date, options) {
    const _date = toDate(date, options?.in);
    _date.setHours(23, 59, 59, 999);
    return _date;
  }

  /**
   * The {@link startOfYear} function options.
   */

  /**
   * @name startOfYear
   * @category Year Helpers
   * @summary Return the start of a year for the given date.
   *
   * @description
   * Return the start of a year for the given date.
   * The result will be in the local timezone.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The original date
   * @param options - The options
   *
   * @returns The start of a year
   *
   * @example
   * // The start of a year for 2 September 2014 11:55:00:
   * const result = startOfYear(new Date(2014, 8, 2, 11, 55, 00))
   * //=> Wed Jan 01 2014 00:00:00
   */
  function startOfYear(date, options) {
    const date_ = toDate(date, options?.in);
    date_.setFullYear(date_.getFullYear(), 0, 1);
    date_.setHours(0, 0, 0, 0);
    return date_;
  }

  const formatDistanceLocale$1 = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds",
    },

    xSeconds: {
      one: "1 second",
      other: "{{count}} seconds",
    },

    halfAMinute: "half a minute",

    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes",
    },

    xMinutes: {
      one: "1 minute",
      other: "{{count}} minutes",
    },

    aboutXHours: {
      one: "about 1 hour",
      other: "about {{count}} hours",
    },

    xHours: {
      one: "1 hour",
      other: "{{count}} hours",
    },

    xDays: {
      one: "1 day",
      other: "{{count}} days",
    },

    aboutXWeeks: {
      one: "about 1 week",
      other: "about {{count}} weeks",
    },

    xWeeks: {
      one: "1 week",
      other: "{{count}} weeks",
    },

    aboutXMonths: {
      one: "about 1 month",
      other: "about {{count}} months",
    },

    xMonths: {
      one: "1 month",
      other: "{{count}} months",
    },

    aboutXYears: {
      one: "about 1 year",
      other: "about {{count}} years",
    },

    xYears: {
      one: "1 year",
      other: "{{count}} years",
    },

    overXYears: {
      one: "over 1 year",
      other: "over {{count}} years",
    },

    almostXYears: {
      one: "almost 1 year",
      other: "almost {{count}} years",
    },
  };

  const formatDistance$1 = (token, count, options) => {
    let result;

    const tokenValue = formatDistanceLocale$1[token];
    if (typeof tokenValue === "string") {
      result = tokenValue;
    } else if (count === 1) {
      result = tokenValue.one;
    } else {
      result = tokenValue.other.replace("{{count}}", count.toString());
    }

    if (options?.addSuffix) {
      if (options.comparison && options.comparison > 0) {
        return "in " + result;
      } else {
        return result + " ago";
      }
    }

    return result;
  };

  function buildFormatLongFn(args) {
    return (options = {}) => {
      // TODO: Remove String()
      const width = options.width ? String(options.width) : args.defaultWidth;
      const format = args.formats[width] || args.formats[args.defaultWidth];
      return format;
    };
  }

  const dateFormats$1 = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy",
  };

  const timeFormats$1 = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a",
  };

  const dateTimeFormats$1 = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}",
  };

  const formatLong$1 = {
    date: buildFormatLongFn({
      formats: dateFormats$1,
      defaultWidth: "full",
    }),

    time: buildFormatLongFn({
      formats: timeFormats$1,
      defaultWidth: "full",
    }),

    dateTime: buildFormatLongFn({
      formats: dateTimeFormats$1,
      defaultWidth: "full",
    }),
  };

  const formatRelativeLocale$1 = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P",
  };

  const formatRelative$1 = (token, _date, _baseDate, _options) =>
    formatRelativeLocale$1[token];

  /**
   * The localize function argument callback which allows to convert raw value to
   * the actual type.
   *
   * @param value - The value to convert
   *
   * @returns The converted value
   */

  /**
   * The map of localized values for each width.
   */

  /**
   * The index type of the locale unit value. It types conversion of units of
   * values that don't start at 0 (i.e. quarters).
   */

  /**
   * Converts the unit value to the tuple of values.
   */

  /**
   * The tuple of localized era values. The first element represents BC,
   * the second element represents AD.
   */

  /**
   * The tuple of localized quarter values. The first element represents Q1.
   */

  /**
   * The tuple of localized day values. The first element represents Sunday.
   */

  /**
   * The tuple of localized month values. The first element represents January.
   */

  function buildLocalizeFn(args) {
    return (value, options) => {
      const context = options?.context ? String(options.context) : "standalone";

      let valuesArray;
      if (context === "formatting" && args.formattingValues) {
        const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
        const width = options?.width ? String(options.width) : defaultWidth;

        valuesArray =
          args.formattingValues[width] || args.formattingValues[defaultWidth];
      } else {
        const defaultWidth = args.defaultWidth;
        const width = options?.width ? String(options.width) : args.defaultWidth;

        valuesArray = args.values[width] || args.values[defaultWidth];
      }
      const index = args.argumentCallback ? args.argumentCallback(value) : value;

      // @ts-expect-error - For some reason TypeScript just don't want to match it, no matter how hard we try. I challenge you to try to remove it!
      return valuesArray[index];
    };
  }

  const eraValues$1 = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"],
  };

  const quarterValues$1 = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"],
  };

  // Note: in English, the names of days of the week and months are capitalized.
  // If you are making a new locale based on this one, check if the same is true for the language you're working on.
  // Generally, formatted dates should look like they are in the middle of a sentence,
  // e.g. in Spanish language the weekdays and months should be in the lowercase.
  const monthValues$1 = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    wide: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  };

  const dayValues$1 = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
  };

  const dayPeriodValues$1 = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night",
    },
  };

  const formattingDayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night",
    },
  };

  const ordinalNumber$1 = (dirtyNumber, _options) => {
    const number = Number(dirtyNumber);

    // If ordinal numbers depend on context, for example,
    // if they are different for different grammatical genders,
    // use `options.unit`.
    //
    // `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
    // 'day', 'hour', 'minute', 'second'.

    const rem100 = number % 100;
    if (rem100 > 20 || rem100 < 10) {
      switch (rem100 % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
      }
    }
    return number + "th";
  };

  const localize$1 = {
    ordinalNumber: ordinalNumber$1,

    era: buildLocalizeFn({
      values: eraValues$1,
      defaultWidth: "wide",
    }),

    quarter: buildLocalizeFn({
      values: quarterValues$1,
      defaultWidth: "wide",
      argumentCallback: (quarter) => quarter - 1,
    }),

    month: buildLocalizeFn({
      values: monthValues$1,
      defaultWidth: "wide",
    }),

    day: buildLocalizeFn({
      values: dayValues$1,
      defaultWidth: "wide",
    }),

    dayPeriod: buildLocalizeFn({
      values: dayPeriodValues$1,
      defaultWidth: "wide",
      formattingValues: formattingDayPeriodValues,
      defaultFormattingWidth: "wide",
    }),
  };

  function buildMatchFn(args) {
    return (string, options = {}) => {
      const width = options.width;

      const matchPattern =
        (width && args.matchPatterns[width]) ||
        args.matchPatterns[args.defaultMatchWidth];
      const matchResult = string.match(matchPattern);

      if (!matchResult) {
        return null;
      }
      const matchedString = matchResult[0];

      const parsePatterns =
        (width && args.parsePatterns[width]) ||
        args.parsePatterns[args.defaultParseWidth];

      const key = Array.isArray(parsePatterns)
        ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString))
        : // [TODO] -- I challenge you to fix the type
          findKey(parsePatterns, (pattern) => pattern.test(matchedString));

      let value;

      value = args.valueCallback ? args.valueCallback(key) : key;
      value = options.valueCallback
        ? // [TODO] -- I challenge you to fix the type
          options.valueCallback(value)
        : value;

      const rest = string.slice(matchedString.length);

      return { value, rest };
    };
  }

  function findKey(object, predicate) {
    for (const key in object) {
      if (
        Object.prototype.hasOwnProperty.call(object, key) &&
        predicate(object[key])
      ) {
        return key;
      }
    }
    return undefined;
  }

  function findIndex(array, predicate) {
    for (let key = 0; key < array.length; key++) {
      if (predicate(array[key])) {
        return key;
      }
    }
    return undefined;
  }

  function buildMatchPatternFn(args) {
    return (string, options = {}) => {
      const matchResult = string.match(args.matchPattern);
      if (!matchResult) return null;
      const matchedString = matchResult[0];

      const parseResult = string.match(args.parsePattern);
      if (!parseResult) return null;
      let value = args.valueCallback
        ? args.valueCallback(parseResult[0])
        : parseResult[0];

      // [TODO] I challenge you to fix the type
      value = options.valueCallback ? options.valueCallback(value) : value;

      const rest = string.slice(matchedString.length);

      return { value, rest };
    };
  }

  const matchOrdinalNumberPattern$1 = /^(\d+)(th|st|nd|rd)?/i;
  const parseOrdinalNumberPattern$1 = /\d+/i;

  const matchEraPatterns$1 = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i,
  };
  const parseEraPatterns$1 = {
    any: [/^b/i, /^(a|c)/i],
  };

  const matchQuarterPatterns$1 = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i,
  };
  const parseQuarterPatterns$1 = {
    any: [/1/i, /2/i, /3/i, /4/i],
  };

  const matchMonthPatterns$1 = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i,
  };
  const parseMonthPatterns$1 = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],

    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^ap/i,
      /^may/i,
      /^jun/i,
      /^jul/i,
      /^au/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],
  };

  const matchDayPatterns$1 = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i,
  };
  const parseDayPatterns$1 = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i],
  };

  const matchDayPeriodPatterns$1 = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i,
  };
  const parseDayPeriodPatterns$1 = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i,
    },
  };

  const match$1 = {
    ordinalNumber: buildMatchPatternFn({
      matchPattern: matchOrdinalNumberPattern$1,
      parsePattern: parseOrdinalNumberPattern$1,
      valueCallback: (value) => parseInt(value, 10),
    }),

    era: buildMatchFn({
      matchPatterns: matchEraPatterns$1,
      defaultMatchWidth: "wide",
      parsePatterns: parseEraPatterns$1,
      defaultParseWidth: "any",
    }),

    quarter: buildMatchFn({
      matchPatterns: matchQuarterPatterns$1,
      defaultMatchWidth: "wide",
      parsePatterns: parseQuarterPatterns$1,
      defaultParseWidth: "any",
      valueCallback: (index) => index + 1,
    }),

    month: buildMatchFn({
      matchPatterns: matchMonthPatterns$1,
      defaultMatchWidth: "wide",
      parsePatterns: parseMonthPatterns$1,
      defaultParseWidth: "any",
    }),

    day: buildMatchFn({
      matchPatterns: matchDayPatterns$1,
      defaultMatchWidth: "wide",
      parsePatterns: parseDayPatterns$1,
      defaultParseWidth: "any",
    }),

    dayPeriod: buildMatchFn({
      matchPatterns: matchDayPeriodPatterns$1,
      defaultMatchWidth: "any",
      parsePatterns: parseDayPeriodPatterns$1,
      defaultParseWidth: "any",
    }),
  };

  /**
   * @category Locales
   * @summary English locale (United States).
   * @language English
   * @iso-639-2 eng
   * @author Sasha Koss [@kossnocorp](https://github.com/kossnocorp)
   * @author Lesha Koss [@leshakoss](https://github.com/leshakoss)
   */
  const enUS = {
    code: "en-US",
    formatDistance: formatDistance$1,
    formatLong: formatLong$1,
    formatRelative: formatRelative$1,
    localize: localize$1,
    match: match$1,
    options: {
      weekStartsOn: 0 /* Sunday */,
      firstWeekContainsDate: 1,
    },
  };

  /**
   * The {@link getDayOfYear} function options.
   */

  /**
   * @name getDayOfYear
   * @category Day Helpers
   * @summary Get the day of the year of the given date.
   *
   * @description
   * Get the day of the year of the given date.
   *
   * @param date - The given date
   * @param options - The options
   *
   * @returns The day of year
   *
   * @example
   * // Which day of the year is 2 July 2014?
   * const result = getDayOfYear(new Date(2014, 6, 2))
   * //=> 183
   */
  function getDayOfYear(date, options) {
    const _date = toDate(date, options?.in);
    const diff = differenceInCalendarDays(_date, startOfYear(_date));
    const dayOfYear = diff + 1;
    return dayOfYear;
  }

  /**
   * The {@link getISOWeek} function options.
   */

  /**
   * @name getISOWeek
   * @category ISO Week Helpers
   * @summary Get the ISO week of the given date.
   *
   * @description
   * Get the ISO week of the given date.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @param date - The given date
   * @param options - The options
   *
   * @returns The ISO week
   *
   * @example
   * // Which week of the ISO-week numbering year is 2 January 2005?
   * const result = getISOWeek(new Date(2005, 0, 2))
   * //=> 53
   */
  function getISOWeek(date, options) {
    const _date = toDate(date, options?.in);
    const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);

    // Round the number of weeks to the nearest integer because the number of
    // milliseconds in a week is not constant (e.g. it's different in the week of
    // the daylight saving time clock shift).
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  /**
   * The {@link getWeekYear} function options.
   */

  /**
   * @name getWeekYear
   * @category Week-Numbering Year Helpers
   * @summary Get the local week-numbering year of the given date.
   *
   * @description
   * Get the local week-numbering year of the given date.
   * The exact calculation depends on the values of
   * `options.weekStartsOn` (which is the index of the first day of the week)
   * and `options.firstWeekContainsDate` (which is the day of January, which is always in
   * the first week of the week-numbering year)
   *
   * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
   *
   * @param date - The given date
   * @param options - An object with options.
   *
   * @returns The local week-numbering year
   *
   * @example
   * // Which week numbering year is 26 December 2004 with the default settings?
   * const result = getWeekYear(new Date(2004, 11, 26))
   * //=> 2005
   *
   * @example
   * // Which week numbering year is 26 December 2004 if week starts on Saturday?
   * const result = getWeekYear(new Date(2004, 11, 26), { weekStartsOn: 6 })
   * //=> 2004
   *
   * @example
   * // Which week numbering year is 26 December 2004 if the first week contains 4 January?
   * const result = getWeekYear(new Date(2004, 11, 26), { firstWeekContainsDate: 4 })
   * //=> 2004
   */
  function getWeekYear(date, options) {
    const _date = toDate(date, options?.in);
    const year = _date.getFullYear();

    const defaultOptions = getDefaultOptions$1();
    const firstWeekContainsDate =
      options?.firstWeekContainsDate ??
      options?.locale?.options?.firstWeekContainsDate ??
      defaultOptions.firstWeekContainsDate ??
      defaultOptions.locale?.options?.firstWeekContainsDate ??
      1;

    const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
    firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
    firstWeekOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);

    const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
    firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
    firstWeekOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);

    if (+_date >= +startOfNextYear) {
      return year + 1;
    } else if (+_date >= +startOfThisYear) {
      return year;
    } else {
      return year - 1;
    }
  }

  /**
   * The {@link startOfWeekYear} function options.
   */

  /**
   * @name startOfWeekYear
   * @category Week-Numbering Year Helpers
   * @summary Return the start of a local week-numbering year for the given date.
   *
   * @description
   * Return the start of a local week-numbering year.
   * The exact calculation depends on the values of
   * `options.weekStartsOn` (which is the index of the first day of the week)
   * and `options.firstWeekContainsDate` (which is the day of January, which is always in
   * the first week of the week-numbering year)
   *
   * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type.
   *
   * @param date - The original date
   * @param options - An object with options
   *
   * @returns The start of a week-numbering year
   *
   * @example
   * // The start of an a week-numbering year for 2 July 2005 with default settings:
   * const result = startOfWeekYear(new Date(2005, 6, 2))
   * //=> Sun Dec 26 2004 00:00:00
   *
   * @example
   * // The start of a week-numbering year for 2 July 2005
   * // if Monday is the first day of week
   * // and 4 January is always in the first week of the year:
   * const result = startOfWeekYear(new Date(2005, 6, 2), {
   *   weekStartsOn: 1,
   *   firstWeekContainsDate: 4
   * })
   * //=> Mon Jan 03 2005 00:00:00
   */
  function startOfWeekYear(date, options) {
    const defaultOptions = getDefaultOptions$1();
    const firstWeekContainsDate =
      options?.firstWeekContainsDate ??
      options?.locale?.options?.firstWeekContainsDate ??
      defaultOptions.firstWeekContainsDate ??
      defaultOptions.locale?.options?.firstWeekContainsDate ??
      1;

    const year = getWeekYear(date, options);
    const firstWeek = constructFrom(options?.in || date, 0);
    firstWeek.setFullYear(year, 0, firstWeekContainsDate);
    firstWeek.setHours(0, 0, 0, 0);
    const _date = startOfWeek(firstWeek, options);
    return _date;
  }

  /**
   * The {@link getWeek} function options.
   */

  /**
   * @name getWeek
   * @category Week Helpers
   * @summary Get the local week index of the given date.
   *
   * @description
   * Get the local week index of the given date.
   * The exact calculation depends on the values of
   * `options.weekStartsOn` (which is the index of the first day of the week)
   * and `options.firstWeekContainsDate` (which is the day of January, which is always in
   * the first week of the week-numbering year)
   *
   * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
   *
   * @param date - The given date
   * @param options - An object with options
   *
   * @returns The week
   *
   * @example
   * // Which week of the local week numbering year is 2 January 2005 with default options?
   * const result = getWeek(new Date(2005, 0, 2))
   * //=> 2
   *
   * @example
   * // Which week of the local week numbering year is 2 January 2005,
   * // if Monday is the first day of the week,
   * // and the first week of the year always contains 4 January?
   * const result = getWeek(new Date(2005, 0, 2), {
   *   weekStartsOn: 1,
   *   firstWeekContainsDate: 4
   * })
   * //=> 53
   */
  function getWeek(date, options) {
    const _date = toDate(date, options?.in);
    const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);

    // Round the number of weeks to the nearest integer because the number of
    // milliseconds in a week is not constant (e.g. it's different in the week of
    // the daylight saving time clock shift).
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  function addLeadingZeros(number, targetLength) {
    const sign = number < 0 ? "-" : "";
    const output = Math.abs(number).toString().padStart(targetLength, "0");
    return sign + output;
  }

  /*
   * |     | Unit                           |     | Unit                           |
   * |-----|--------------------------------|-----|--------------------------------|
   * |  a  | AM, PM                         |  A* |                                |
   * |  d  | Day of month                   |  D  |                                |
   * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
   * |  m  | Minute                         |  M  | Month                          |
   * |  s  | Second                         |  S  | Fraction of second             |
   * |  y  | Year (abs)                     |  Y  |                                |
   *
   * Letters marked by * are not implemented but reserved by Unicode standard.
   */

  const lightFormatters = {
    // Year
    y(date, token) {
      // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
      // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
      // |----------|-------|----|-------|-------|-------|
      // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
      // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
      // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
      // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
      // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |

      const signedYear = date.getFullYear();
      // Returns 1 for 1 BC (which is year 0 in JavaScript)
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
    },

    // Month
    M(date, token) {
      const month = date.getMonth();
      return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
    },

    // Day of the month
    d(date, token) {
      return addLeadingZeros(date.getDate(), token.length);
    },

    // AM or PM
    a(date, token) {
      const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";

      switch (token) {
        case "a":
        case "aa":
          return dayPeriodEnumValue.toUpperCase();
        case "aaa":
          return dayPeriodEnumValue;
        case "aaaaa":
          return dayPeriodEnumValue[0];
        case "aaaa":
        default:
          return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
      }
    },

    // Hour [1-12]
    h(date, token) {
      return addLeadingZeros(date.getHours() % 12 || 12, token.length);
    },

    // Hour [0-23]
    H(date, token) {
      return addLeadingZeros(date.getHours(), token.length);
    },

    // Minute
    m(date, token) {
      return addLeadingZeros(date.getMinutes(), token.length);
    },

    // Second
    s(date, token) {
      return addLeadingZeros(date.getSeconds(), token.length);
    },

    // Fraction of second
    S(date, token) {
      const numberOfDigits = token.length;
      const milliseconds = date.getMilliseconds();
      const fractionalSeconds = Math.trunc(
        milliseconds * Math.pow(10, numberOfDigits - 3),
      );
      return addLeadingZeros(fractionalSeconds, token.length);
    },
  };

  const dayPeriodEnum = {
    am: "am",
    pm: "pm",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
  };

  /*
   * |     | Unit                           |     | Unit                           |
   * |-----|--------------------------------|-----|--------------------------------|
   * |  a  | AM, PM                         |  A* | Milliseconds in day            |
   * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
   * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
   * |  d  | Day of month                   |  D  | Day of year                    |
   * |  e  | Local day of week              |  E  | Day of week                    |
   * |  f  |                                |  F* | Day of week in month           |
   * |  g* | Modified Julian day            |  G  | Era                            |
   * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
   * |  i! | ISO day of week                |  I! | ISO week of year               |
   * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
   * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
   * |  l* | (deprecated)                   |  L  | Stand-alone month              |
   * |  m  | Minute                         |  M  | Month                          |
   * |  n  |                                |  N  |                                |
   * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
   * |  p! | Long localized time            |  P! | Long localized date            |
   * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
   * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
   * |  s  | Second                         |  S  | Fraction of second             |
   * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
   * |  u  | Extended year                  |  U* | Cyclic year                    |
   * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
   * |  w  | Local week of year             |  W* | Week of month                  |
   * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
   * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
   * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
   *
   * Letters marked by * are not implemented but reserved by Unicode standard.
   *
   * Letters marked by ! are non-standard, but implemented by date-fns:
   * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
   * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
   *   i.e. 7 for Sunday, 1 for Monday, etc.
   * - `I` is ISO week of year, as opposed to `w` which is local week of year.
   * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
   *   `R` is supposed to be used in conjunction with `I` and `i`
   *   for universal ISO week-numbering date, whereas
   *   `Y` is supposed to be used in conjunction with `w` and `e`
   *   for week-numbering date specific to the locale.
   * - `P` is long localized date format
   * - `p` is long localized time format
   */

  const formatters = {
    // Era
    G: function (date, token, localize) {
      const era = date.getFullYear() > 0 ? 1 : 0;
      switch (token) {
        // AD, BC
        case "G":
        case "GG":
        case "GGG":
          return localize.era(era, { width: "abbreviated" });
        // A, B
        case "GGGGG":
          return localize.era(era, { width: "narrow" });
        // Anno Domini, Before Christ
        case "GGGG":
        default:
          return localize.era(era, { width: "wide" });
      }
    },

    // Year
    y: function (date, token, localize) {
      // Ordinal number
      if (token === "yo") {
        const signedYear = date.getFullYear();
        // Returns 1 for 1 BC (which is year 0 in JavaScript)
        const year = signedYear > 0 ? signedYear : 1 - signedYear;
        return localize.ordinalNumber(year, { unit: "year" });
      }

      return lightFormatters.y(date, token);
    },

    // Local week-numbering year
    Y: function (date, token, localize, options) {
      const signedWeekYear = getWeekYear(date, options);
      // Returns 1 for 1 BC (which is year 0 in JavaScript)
      const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;

      // Two digit year
      if (token === "YY") {
        const twoDigitYear = weekYear % 100;
        return addLeadingZeros(twoDigitYear, 2);
      }

      // Ordinal number
      if (token === "Yo") {
        return localize.ordinalNumber(weekYear, { unit: "year" });
      }

      // Padding
      return addLeadingZeros(weekYear, token.length);
    },

    // ISO week-numbering year
    R: function (date, token) {
      const isoWeekYear = getISOWeekYear(date);

      // Padding
      return addLeadingZeros(isoWeekYear, token.length);
    },

    // Extended year. This is a single number designating the year of this calendar system.
    // The main difference between `y` and `u` localizers are B.C. years:
    // | Year | `y` | `u` |
    // |------|-----|-----|
    // | AC 1 |   1 |   1 |
    // | BC 1 |   1 |   0 |
    // | BC 2 |   2 |  -1 |
    // Also `yy` always returns the last two digits of a year,
    // while `uu` pads single digit years to 2 characters and returns other years unchanged.
    u: function (date, token) {
      const year = date.getFullYear();
      return addLeadingZeros(year, token.length);
    },

    // Quarter
    Q: function (date, token, localize) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "Q":
          return String(quarter);
        // 01, 02, 03, 04
        case "QQ":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "Qo":
          return localize.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "QQQ":
          return localize.quarter(quarter, {
            width: "abbreviated",
            context: "formatting",
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "QQQQQ":
          return localize.quarter(quarter, {
            width: "narrow",
            context: "formatting",
          });
        // 1st quarter, 2nd quarter, ...
        case "QQQQ":
        default:
          return localize.quarter(quarter, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // Stand-alone quarter
    q: function (date, token, localize) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "q":
          return String(quarter);
        // 01, 02, 03, 04
        case "qq":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "qo":
          return localize.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "qqq":
          return localize.quarter(quarter, {
            width: "abbreviated",
            context: "standalone",
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "qqqqq":
          return localize.quarter(quarter, {
            width: "narrow",
            context: "standalone",
          });
        // 1st quarter, 2nd quarter, ...
        case "qqqq":
        default:
          return localize.quarter(quarter, {
            width: "wide",
            context: "standalone",
          });
      }
    },

    // Month
    M: function (date, token, localize) {
      const month = date.getMonth();
      switch (token) {
        case "M":
        case "MM":
          return lightFormatters.M(date, token);
        // 1st, 2nd, ..., 12th
        case "Mo":
          return localize.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "MMM":
          return localize.month(month, {
            width: "abbreviated",
            context: "formatting",
          });
        // J, F, ..., D
        case "MMMMM":
          return localize.month(month, {
            width: "narrow",
            context: "formatting",
          });
        // January, February, ..., December
        case "MMMM":
        default:
          return localize.month(month, { width: "wide", context: "formatting" });
      }
    },

    // Stand-alone month
    L: function (date, token, localize) {
      const month = date.getMonth();
      switch (token) {
        // 1, 2, ..., 12
        case "L":
          return String(month + 1);
        // 01, 02, ..., 12
        case "LL":
          return addLeadingZeros(month + 1, 2);
        // 1st, 2nd, ..., 12th
        case "Lo":
          return localize.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "LLL":
          return localize.month(month, {
            width: "abbreviated",
            context: "standalone",
          });
        // J, F, ..., D
        case "LLLLL":
          return localize.month(month, {
            width: "narrow",
            context: "standalone",
          });
        // January, February, ..., December
        case "LLLL":
        default:
          return localize.month(month, { width: "wide", context: "standalone" });
      }
    },

    // Local week of year
    w: function (date, token, localize, options) {
      const week = getWeek(date, options);

      if (token === "wo") {
        return localize.ordinalNumber(week, { unit: "week" });
      }

      return addLeadingZeros(week, token.length);
    },

    // ISO week of year
    I: function (date, token, localize) {
      const isoWeek = getISOWeek(date);

      if (token === "Io") {
        return localize.ordinalNumber(isoWeek, { unit: "week" });
      }

      return addLeadingZeros(isoWeek, token.length);
    },

    // Day of the month
    d: function (date, token, localize) {
      if (token === "do") {
        return localize.ordinalNumber(date.getDate(), { unit: "date" });
      }

      return lightFormatters.d(date, token);
    },

    // Day of year
    D: function (date, token, localize) {
      const dayOfYear = getDayOfYear(date);

      if (token === "Do") {
        return localize.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
      }

      return addLeadingZeros(dayOfYear, token.length);
    },

    // Day of week
    E: function (date, token, localize) {
      const dayOfWeek = date.getDay();
      switch (token) {
        // Tue
        case "E":
        case "EE":
        case "EEE":
          return localize.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting",
          });
        // T
        case "EEEEE":
          return localize.day(dayOfWeek, {
            width: "narrow",
            context: "formatting",
          });
        // Tu
        case "EEEEEE":
          return localize.day(dayOfWeek, {
            width: "short",
            context: "formatting",
          });
        // Tuesday
        case "EEEE":
        default:
          return localize.day(dayOfWeek, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // Local day of week
    e: function (date, token, localize, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (Nth day of week with current locale or weekStartsOn)
        case "e":
          return String(localDayOfWeek);
        // Padded numerical value
        case "ee":
          return addLeadingZeros(localDayOfWeek, 2);
        // 1st, 2nd, ..., 7th
        case "eo":
          return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "eee":
          return localize.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting",
          });
        // T
        case "eeeee":
          return localize.day(dayOfWeek, {
            width: "narrow",
            context: "formatting",
          });
        // Tu
        case "eeeeee":
          return localize.day(dayOfWeek, {
            width: "short",
            context: "formatting",
          });
        // Tuesday
        case "eeee":
        default:
          return localize.day(dayOfWeek, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // Stand-alone local day of week
    c: function (date, token, localize, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (same as in `e`)
        case "c":
          return String(localDayOfWeek);
        // Padded numerical value
        case "cc":
          return addLeadingZeros(localDayOfWeek, token.length);
        // 1st, 2nd, ..., 7th
        case "co":
          return localize.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "ccc":
          return localize.day(dayOfWeek, {
            width: "abbreviated",
            context: "standalone",
          });
        // T
        case "ccccc":
          return localize.day(dayOfWeek, {
            width: "narrow",
            context: "standalone",
          });
        // Tu
        case "cccccc":
          return localize.day(dayOfWeek, {
            width: "short",
            context: "standalone",
          });
        // Tuesday
        case "cccc":
        default:
          return localize.day(dayOfWeek, {
            width: "wide",
            context: "standalone",
          });
      }
    },

    // ISO day of week
    i: function (date, token, localize) {
      const dayOfWeek = date.getDay();
      const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      switch (token) {
        // 2
        case "i":
          return String(isoDayOfWeek);
        // 02
        case "ii":
          return addLeadingZeros(isoDayOfWeek, token.length);
        // 2nd
        case "io":
          return localize.ordinalNumber(isoDayOfWeek, { unit: "day" });
        // Tue
        case "iii":
          return localize.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting",
          });
        // T
        case "iiiii":
          return localize.day(dayOfWeek, {
            width: "narrow",
            context: "formatting",
          });
        // Tu
        case "iiiiii":
          return localize.day(dayOfWeek, {
            width: "short",
            context: "formatting",
          });
        // Tuesday
        case "iiii":
        default:
          return localize.day(dayOfWeek, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // AM or PM
    a: function (date, token, localize) {
      const hours = date.getHours();
      const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";

      switch (token) {
        case "a":
        case "aa":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          });
        case "aaa":
          return localize
            .dayPeriod(dayPeriodEnumValue, {
              width: "abbreviated",
              context: "formatting",
            })
            .toLowerCase();
        case "aaaaa":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting",
          });
        case "aaaa":
        default:
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // AM, PM, midnight, noon
    b: function (date, token, localize) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours === 12) {
        dayPeriodEnumValue = dayPeriodEnum.noon;
      } else if (hours === 0) {
        dayPeriodEnumValue = dayPeriodEnum.midnight;
      } else {
        dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      }

      switch (token) {
        case "b":
        case "bb":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          });
        case "bbb":
          return localize
            .dayPeriod(dayPeriodEnumValue, {
              width: "abbreviated",
              context: "formatting",
            })
            .toLowerCase();
        case "bbbbb":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting",
          });
        case "bbbb":
        default:
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // in the morning, in the afternoon, in the evening, at night
    B: function (date, token, localize) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours >= 17) {
        dayPeriodEnumValue = dayPeriodEnum.evening;
      } else if (hours >= 12) {
        dayPeriodEnumValue = dayPeriodEnum.afternoon;
      } else if (hours >= 4) {
        dayPeriodEnumValue = dayPeriodEnum.morning;
      } else {
        dayPeriodEnumValue = dayPeriodEnum.night;
      }

      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting",
          });
        case "BBBBB":
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting",
          });
        case "BBBB":
        default:
          return localize.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting",
          });
      }
    },

    // Hour [1-12]
    h: function (date, token, localize) {
      if (token === "ho") {
        let hours = date.getHours() % 12;
        if (hours === 0) hours = 12;
        return localize.ordinalNumber(hours, { unit: "hour" });
      }

      return lightFormatters.h(date, token);
    },

    // Hour [0-23]
    H: function (date, token, localize) {
      if (token === "Ho") {
        return localize.ordinalNumber(date.getHours(), { unit: "hour" });
      }

      return lightFormatters.H(date, token);
    },

    // Hour [0-11]
    K: function (date, token, localize) {
      const hours = date.getHours() % 12;

      if (token === "Ko") {
        return localize.ordinalNumber(hours, { unit: "hour" });
      }

      return addLeadingZeros(hours, token.length);
    },

    // Hour [1-24]
    k: function (date, token, localize) {
      let hours = date.getHours();
      if (hours === 0) hours = 24;

      if (token === "ko") {
        return localize.ordinalNumber(hours, { unit: "hour" });
      }

      return addLeadingZeros(hours, token.length);
    },

    // Minute
    m: function (date, token, localize) {
      if (token === "mo") {
        return localize.ordinalNumber(date.getMinutes(), { unit: "minute" });
      }

      return lightFormatters.m(date, token);
    },

    // Second
    s: function (date, token, localize) {
      if (token === "so") {
        return localize.ordinalNumber(date.getSeconds(), { unit: "second" });
      }

      return lightFormatters.s(date, token);
    },

    // Fraction of second
    S: function (date, token) {
      return lightFormatters.S(date, token);
    },

    // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
    X: function (date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();

      if (timezoneOffset === 0) {
        return "Z";
      }

      switch (token) {
        // Hours and optional minutes
        case "X":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);

        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XX`
        case "XXXX":
        case "XX": // Hours and minutes without `:` delimiter
          return formatTimezone(timezoneOffset);

        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XXX`
        case "XXXXX":
        case "XXX": // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },

    // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
    x: function (date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();

      switch (token) {
        // Hours and optional minutes
        case "x":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);

        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xx`
        case "xxxx":
        case "xx": // Hours and minutes without `:` delimiter
          return formatTimezone(timezoneOffset);

        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xxx`
        case "xxxxx":
        case "xxx": // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },

    // Timezone (GMT)
    O: function (date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();

      switch (token) {
        // Short
        case "O":
        case "OO":
        case "OOO":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "OOOO":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },

    // Timezone (specific non-location)
    z: function (date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();

      switch (token) {
        // Short
        case "z":
        case "zz":
        case "zzz":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "zzzz":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },

    // Seconds timestamp
    t: function (date, token, _localize) {
      const timestamp = Math.trunc(+date / 1000);
      return addLeadingZeros(timestamp, token.length);
    },

    // Milliseconds timestamp
    T: function (date, token, _localize) {
      return addLeadingZeros(+date, token.length);
    },
  };

  function formatTimezoneShort(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = Math.trunc(absOffset / 60);
    const minutes = absOffset % 60;
    if (minutes === 0) {
      return sign + String(hours);
    }
    return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
  }

  function formatTimezoneWithOptionalMinutes(offset, delimiter) {
    if (offset % 60 === 0) {
      const sign = offset > 0 ? "-" : "+";
      return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
    }
    return formatTimezone(offset, delimiter);
  }

  function formatTimezone(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
    const minutes = addLeadingZeros(absOffset % 60, 2);
    return sign + hours + delimiter + minutes;
  }

  const dateLongFormatter = (pattern, formatLong) => {
    switch (pattern) {
      case "P":
        return formatLong.date({ width: "short" });
      case "PP":
        return formatLong.date({ width: "medium" });
      case "PPP":
        return formatLong.date({ width: "long" });
      case "PPPP":
      default:
        return formatLong.date({ width: "full" });
    }
  };

  const timeLongFormatter = (pattern, formatLong) => {
    switch (pattern) {
      case "p":
        return formatLong.time({ width: "short" });
      case "pp":
        return formatLong.time({ width: "medium" });
      case "ppp":
        return formatLong.time({ width: "long" });
      case "pppp":
      default:
        return formatLong.time({ width: "full" });
    }
  };

  const dateTimeLongFormatter = (pattern, formatLong) => {
    const matchResult = pattern.match(/(P+)(p+)?/) || [];
    const datePattern = matchResult[1];
    const timePattern = matchResult[2];

    if (!timePattern) {
      return dateLongFormatter(pattern, formatLong);
    }

    let dateTimeFormat;

    switch (datePattern) {
      case "P":
        dateTimeFormat = formatLong.dateTime({ width: "short" });
        break;
      case "PP":
        dateTimeFormat = formatLong.dateTime({ width: "medium" });
        break;
      case "PPP":
        dateTimeFormat = formatLong.dateTime({ width: "long" });
        break;
      case "PPPP":
      default:
        dateTimeFormat = formatLong.dateTime({ width: "full" });
        break;
    }

    return dateTimeFormat
      .replace("{{date}}", dateLongFormatter(datePattern, formatLong))
      .replace("{{time}}", timeLongFormatter(timePattern, formatLong));
  };

  const longFormatters = {
    p: timeLongFormatter,
    P: dateTimeLongFormatter,
  };

  const dayOfYearTokenRE = /^D+$/;
  const weekYearTokenRE = /^Y+$/;

  const throwTokens = ["D", "DD", "YY", "YYYY"];

  function isProtectedDayOfYearToken(token) {
    return dayOfYearTokenRE.test(token);
  }

  function isProtectedWeekYearToken(token) {
    return weekYearTokenRE.test(token);
  }

  function warnOrThrowProtectedError(token, format, input) {
    const _message = message(token, format, input);
    console.warn(_message);
    if (throwTokens.includes(token)) throw new RangeError(_message);
  }

  function message(token, format, input) {
    const subject = token[0] === "Y" ? "years" : "days of the month";
    return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
  }

  // This RegExp consists of three parts separated by `|`:
  // - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
  //   (one of the certain letters followed by `o`)
  // - (\w)\1* matches any sequences of the same letter
  // - '' matches two quote characters in a row
  // - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
  //   except a single quote symbol, which ends the sequence.
  //   Two quote characters do not end the sequence.
  //   If there is no matching single quote
  //   then the sequence will continue until the end of the string.
  // - . matches any single character unmatched by previous parts of the RegExps
  const formattingTokensRegExp$1 =
    /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;

  // This RegExp catches symbols escaped by quotes, and also
  // sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
  const longFormattingTokensRegExp$1 = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

  const escapedStringRegExp$1 = /^'([^]*?)'?$/;
  const doubleQuoteRegExp$1 = /''/g;
  const unescapedLatinCharacterRegExp$1 = /[a-zA-Z]/;

  /**
   * The {@link format} function options.
   */

  /**
   * @name format
   * @alias formatDate
   * @category Common Helpers
   * @summary Format the date.
   *
   * @description
   * Return the formatted date string in the given format. The result may vary by locale.
   *
   * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
   * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * The characters wrapped between two single quotes characters (') are escaped.
   * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
   * (see the last example)
   *
   * Format of the string is based on Unicode Technical Standard #35:
   * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
   * with a few additions (see note 7 below the table).
   *
   * Accepted patterns:
   * | Unit                            | Pattern | Result examples                   | Notes |
   * |---------------------------------|---------|-----------------------------------|-------|
   * | Era                             | G..GGG  | AD, BC                            |       |
   * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
   * |                                 | GGGGG   | A, B                              |       |
   * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
   * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
   * |                                 | yy      | 44, 01, 00, 17                    | 5     |
   * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
   * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
   * |                                 | yyyyy   | ...                               | 3,5   |
   * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
   * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
   * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
   * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
   * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
   * |                                 | YYYYY   | ...                               | 3,5   |
   * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
   * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
   * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
   * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
   * |                                 | RRRRR   | ...                               | 3,5,7 |
   * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
   * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
   * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
   * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
   * |                                 | uuuuu   | ...                               | 3,5   |
   * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
   * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
   * |                                 | QQ      | 01, 02, 03, 04                    |       |
   * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
   * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
   * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
   * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
   * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
   * |                                 | qq      | 01, 02, 03, 04                    |       |
   * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
   * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
   * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
   * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
   * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
   * |                                 | MM      | 01, 02, ..., 12                   |       |
   * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
   * |                                 | MMMM    | January, February, ..., December  | 2     |
   * |                                 | MMMMM   | J, F, ..., D                      |       |
   * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
   * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
   * |                                 | LL      | 01, 02, ..., 12                   |       |
   * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
   * |                                 | LLLL    | January, February, ..., December  | 2     |
   * |                                 | LLLLL   | J, F, ..., D                      |       |
   * | Local week of year              | w       | 1, 2, ..., 53                     |       |
   * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
   * |                                 | ww      | 01, 02, ..., 53                   |       |
   * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
   * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
   * |                                 | II      | 01, 02, ..., 53                   | 7     |
   * | Day of month                    | d       | 1, 2, ..., 31                     |       |
   * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
   * |                                 | dd      | 01, 02, ..., 31                   |       |
   * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
   * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
   * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
   * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
   * |                                 | DDDD    | ...                               | 3     |
   * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
   * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
   * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
   * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
   * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
   * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
   * |                                 | ii      | 01, 02, ..., 07                   | 7     |
   * |                                 | iii     | Mon, Tue, Wed, ..., Sun           | 7     |
   * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
   * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
   * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 7     |
   * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
   * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
   * |                                 | ee      | 02, 03, ..., 01                   |       |
   * |                                 | eee     | Mon, Tue, Wed, ..., Sun           |       |
   * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
   * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
   * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
   * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
   * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
   * |                                 | cc      | 02, 03, ..., 01                   |       |
   * |                                 | ccc     | Mon, Tue, Wed, ..., Sun           |       |
   * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
   * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
   * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
   * | AM, PM                          | a..aa   | AM, PM                            |       |
   * |                                 | aaa     | am, pm                            |       |
   * |                                 | aaaa    | a.m., p.m.                        | 2     |
   * |                                 | aaaaa   | a, p                              |       |
   * | AM, PM, noon, midnight          | b..bb   | AM, PM, noon, midnight            |       |
   * |                                 | bbb     | am, pm, noon, midnight            |       |
   * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
   * |                                 | bbbbb   | a, p, n, mi                       |       |
   * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
   * |                                 | BBBB    | at night, in the morning, ...     | 2     |
   * |                                 | BBBBB   | at night, in the morning, ...     |       |
   * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
   * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
   * |                                 | hh      | 01, 02, ..., 11, 12               |       |
   * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
   * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
   * |                                 | HH      | 00, 01, 02, ..., 23               |       |
   * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
   * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
   * |                                 | KK      | 01, 02, ..., 11, 00               |       |
   * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
   * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
   * |                                 | kk      | 24, 01, 02, ..., 23               |       |
   * | Minute                          | m       | 0, 1, ..., 59                     |       |
   * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
   * |                                 | mm      | 00, 01, ..., 59                   |       |
   * | Second                          | s       | 0, 1, ..., 59                     |       |
   * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
   * |                                 | ss      | 00, 01, ..., 59                   |       |
   * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
   * |                                 | SS      | 00, 01, ..., 99                   |       |
   * |                                 | SSS     | 000, 001, ..., 999                |       |
   * |                                 | SSSS    | ...                               | 3     |
   * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
   * |                                 | XX      | -0800, +0530, Z                   |       |
   * |                                 | XXX     | -08:00, +05:30, Z                 |       |
   * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
   * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
   * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
   * |                                 | xx      | -0800, +0530, +0000               |       |
   * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
   * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
   * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
   * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
   * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
   * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
   * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
   * | Seconds timestamp               | t       | 512969520                         | 7     |
   * |                                 | tt      | ...                               | 3,7   |
   * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
   * |                                 | TT      | ...                               | 3,7   |
   * | Long localized date             | P       | 04/29/1453                        | 7     |
   * |                                 | PP      | Apr 29, 1453                      | 7     |
   * |                                 | PPP     | April 29th, 1453                  | 7     |
   * |                                 | PPPP    | Friday, April 29th, 1453          | 2,7   |
   * | Long localized time             | p       | 12:00 AM                          | 7     |
   * |                                 | pp      | 12:00:00 AM                       | 7     |
   * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
   * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
   * | Combination of date and time    | Pp      | 04/29/1453, 12:00 AM              | 7     |
   * |                                 | PPpp    | Apr 29, 1453, 12:00:00 AM         | 7     |
   * |                                 | PPPppp  | April 29th, 1453 at ...           | 7     |
   * |                                 | PPPPpppp| Friday, April 29th, 1453 at ...   | 2,7   |
   * Notes:
   * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
   *    are the same as "stand-alone" units, but are different in some languages.
   *    "Formatting" units are declined according to the rules of the language
   *    in the context of a date. "Stand-alone" units are always nominative singular:
   *
   *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
   *
   *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
   *
   * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
   *    the single quote characters (see below).
   *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
   *    the output will be the same as default pattern for this unit, usually
   *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
   *    are marked with "2" in the last column of the table.
   *
   *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
   *
   *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
   *
   *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
   *
   *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
   *
   *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
   *
   * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
   *    The output will be padded with zeros to match the length of the pattern.
   *
   *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
   *
   * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
   *    These tokens represent the shortest form of the quarter.
   *
   * 5. The main difference between `y` and `u` patterns are B.C. years:
   *
   *    | Year | `y` | `u` |
   *    |------|-----|-----|
   *    | AC 1 |   1 |   1 |
   *    | BC 1 |   1 |   0 |
   *    | BC 2 |   2 |  -1 |
   *
   *    Also `yy` always returns the last two digits of a year,
   *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
   *
   *    | Year | `yy` | `uu` |
   *    |------|------|------|
   *    | 1    |   01 |   01 |
   *    | 14   |   14 |   14 |
   *    | 376  |   76 |  376 |
   *    | 1453 |   53 | 1453 |
   *
   *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
   *    except local week-numbering years are dependent on `options.weekStartsOn`
   *    and `options.firstWeekContainsDate` (compare [getISOWeekYear](https://date-fns.org/docs/getISOWeekYear)
   *    and [getWeekYear](https://date-fns.org/docs/getWeekYear)).
   *
   * 6. Specific non-location timezones are currently unavailable in `date-fns`,
   *    so right now these tokens fall back to GMT timezones.
   *
   * 7. These patterns are not in the Unicode Technical Standard #35:
   *    - `i`: ISO day of week
   *    - `I`: ISO week of year
   *    - `R`: ISO week-numbering year
   *    - `t`: seconds timestamp
   *    - `T`: milliseconds timestamp
   *    - `o`: ordinal number modifier
   *    - `P`: long localized date
   *    - `p`: long localized time
   *
   * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
   *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * 9. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
   *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * @param date - The original date
   * @param format - The string of tokens
   * @param options - An object with options
   *
   * @returns The formatted date string
   *
   * @throws `date` must not be Invalid Date
   * @throws `options.locale` must contain `localize` property
   * @throws `options.locale` must contain `formatLong` property
   * @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws format string contains an unescaped latin alphabet character
   *
   * @example
   * // Represent 11 February 2014 in middle-endian format:
   * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
   * //=> '02/11/2014'
   *
   * @example
   * // Represent 2 July 2014 in Esperanto:
   * import { eoLocale } from 'date-fns/locale/eo'
   * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
   *   locale: eoLocale
   * })
   * //=> '2-a de julio 2014'
   *
   * @example
   * // Escape string by single quote characters:
   * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
   * //=> "3 o'clock"
   */
  function format(date, formatStr, options) {
    const defaultOptions = getDefaultOptions$1();
    const locale = options?.locale ?? defaultOptions.locale ?? enUS;

    const firstWeekContainsDate =
      options?.firstWeekContainsDate ??
      options?.locale?.options?.firstWeekContainsDate ??
      defaultOptions.firstWeekContainsDate ??
      defaultOptions.locale?.options?.firstWeekContainsDate ??
      1;

    const weekStartsOn =
      options?.weekStartsOn ??
      options?.locale?.options?.weekStartsOn ??
      defaultOptions.weekStartsOn ??
      defaultOptions.locale?.options?.weekStartsOn ??
      0;

    const originalDate = toDate(date, options?.in);

    if (!isValid(originalDate)) {
      throw new RangeError("Invalid time value");
    }

    let parts = formatStr
      .match(longFormattingTokensRegExp$1)
      .map((substring) => {
        const firstCharacter = substring[0];
        if (firstCharacter === "p" || firstCharacter === "P") {
          const longFormatter = longFormatters[firstCharacter];
          return longFormatter(substring, locale.formatLong);
        }
        return substring;
      })
      .join("")
      .match(formattingTokensRegExp$1)
      .map((substring) => {
        // Replace two single quote characters with one single quote character
        if (substring === "''") {
          return { isToken: false, value: "'" };
        }

        const firstCharacter = substring[0];
        if (firstCharacter === "'") {
          return { isToken: false, value: cleanEscapedString$1(substring) };
        }

        if (formatters[firstCharacter]) {
          return { isToken: true, value: substring };
        }

        if (firstCharacter.match(unescapedLatinCharacterRegExp$1)) {
          throw new RangeError(
            "Format string contains an unescaped latin alphabet character `" +
              firstCharacter +
              "`",
          );
        }

        return { isToken: false, value: substring };
      });

    // invoke localize preprocessor (only for french locales at the moment)
    if (locale.localize.preprocessor) {
      parts = locale.localize.preprocessor(originalDate, parts);
    }

    const formatterOptions = {
      firstWeekContainsDate,
      weekStartsOn,
      locale,
    };

    return parts
      .map((part) => {
        if (!part.isToken) return part.value;

        const token = part.value;

        if (
          (!options?.useAdditionalWeekYearTokens &&
            isProtectedWeekYearToken(token)) ||
          (!options?.useAdditionalDayOfYearTokens &&
            isProtectedDayOfYearToken(token))
        ) {
          warnOrThrowProtectedError(token, formatStr, String(date));
        }

        const formatter = formatters[token[0]];
        return formatter(originalDate, token, locale.localize, formatterOptions);
      })
      .join("");
  }

  function cleanEscapedString$1(input) {
    const matched = input.match(escapedStringRegExp$1);

    if (!matched) {
      return input;
    }

    return matched[1].replace(doubleQuoteRegExp$1, "'");
  }

  /**
   * @name getDefaultOptions
   * @category Common Helpers
   * @summary Get default options.
   * @pure false
   *
   * @description
   * Returns an object that contains defaults for
   * `options.locale`, `options.weekStartsOn` and `options.firstWeekContainsDate`
   * arguments for all functions.
   *
   * You can change these with [setDefaultOptions](https://date-fns.org/docs/setDefaultOptions).
   *
   * @returns The default options
   *
   * @example
   * const result = getDefaultOptions()
   * //=> {}
   *
   * @example
   * setDefaultOptions({ weekStarsOn: 1, firstWeekContainsDate: 4 })
   * const result = getDefaultOptions()
   * //=> { weekStarsOn: 1, firstWeekContainsDate: 4 }
   */
  function getDefaultOptions() {
    return Object.assign({}, getDefaultOptions$1());
  }

  /**
   * The {@link getISODay} function options.
   */

  /**
   * @name getISODay
   * @category Weekday Helpers
   * @summary Get the day of the ISO week of the given date.
   *
   * @description
   * Get the day of the ISO week of the given date,
   * which is 7 for Sunday, 1 for Monday etc.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @param date - The given date
   * @param options - An object with options
   *
   * @returns The day of ISO week
   *
   * @example
   * // Which day of the ISO week is 26 February 2012?
   * const result = getISODay(new Date(2012, 1, 26))
   * //=> 7
   */
  function getISODay(date, options) {
    const day = toDate(date, options?.in).getDay();
    return day === 0 ? 7 : day;
  }

  /**
   * @name transpose
   * @category Generic Helpers
   * @summary Transpose the date to the given constructor.
   *
   * @description
   * The function transposes the date to the given constructor. It helps you
   * to transpose the date in the system time zone to say `UTCDate` or any other
   * date extension.
   *
   * @typeParam InputDate - The input `Date` type derived from the passed argument.
   * @typeParam ResultDate - The result `Date` type derived from the passed constructor.
   *
   * @param date - The date to use values from
   * @param constructor - The date constructor to use
   *
   * @returns Date transposed to the given constructor
   *
   * @example
   * // Create July 10, 2022 00:00 in locale time zone
   * const date = new Date(2022, 6, 10)
   * //=> 'Sun Jul 10 2022 00:00:00 GMT+0800 (Singapore Standard Time)'
   *
   * @example
   * // Transpose the date to July 10, 2022 00:00 in UTC
   * transpose(date, UTCDate)
   * //=> 'Sun Jul 10 2022 00:00:00 GMT+0000 (Coordinated Universal Time)'
   */
  function transpose(date, constructor) {
    const date_ = isConstructor(constructor)
      ? new constructor(0)
      : constructFrom(constructor, 0);
    date_.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    date_.setHours(
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    );
    return date_;
  }

  function isConstructor(constructor) {
    return (
      typeof constructor === "function" &&
      constructor.prototype?.constructor === constructor
    );
  }

  const TIMEZONE_UNIT_PRIORITY = 10;

  class Setter {
    subPriority = 0;

    validate(_utcDate, _options) {
      return true;
    }
  }

  class ValueSetter extends Setter {
    constructor(
      value,

      validateValue,

      setValue,

      priority,
      subPriority,
    ) {
      super();
      this.value = value;
      this.validateValue = validateValue;
      this.setValue = setValue;
      this.priority = priority;
      if (subPriority) {
        this.subPriority = subPriority;
      }
    }

    validate(date, options) {
      return this.validateValue(date, this.value, options);
    }

    set(date, flags, options) {
      return this.setValue(date, flags, this.value, options);
    }
  }

  class DateTimezoneSetter extends Setter {
    priority = TIMEZONE_UNIT_PRIORITY;
    subPriority = -1;

    constructor(context, reference) {
      super();
      this.context = context || ((date) => constructFrom(reference, date));
    }

    set(date, flags) {
      if (flags.timestampIsSet) return date;
      return constructFrom(date, transpose(date, this.context));
    }
  }

  class Parser {
    run(dateString, token, match, options) {
      const result = this.parse(dateString, token, match, options);
      if (!result) {
        return null;
      }

      return {
        setter: new ValueSetter(
          result.value,
          this.validate,
          this.set,
          this.priority,
          this.subPriority,
        ),
        rest: result.rest,
      };
    }

    validate(_utcDate, _value, _options) {
      return true;
    }
  }

  class EraParser extends Parser {
    priority = 140;

    parse(dateString, token, match) {
      switch (token) {
        // AD, BC
        case "G":
        case "GG":
        case "GGG":
          return (
            match.era(dateString, { width: "abbreviated" }) ||
            match.era(dateString, { width: "narrow" })
          );

        // A, B
        case "GGGGG":
          return match.era(dateString, { width: "narrow" });
        // Anno Domini, Before Christ
        case "GGGG":
        default:
          return (
            match.era(dateString, { width: "wide" }) ||
            match.era(dateString, { width: "abbreviated" }) ||
            match.era(dateString, { width: "narrow" })
          );
      }
    }

    set(date, flags, value) {
      flags.era = value;
      date.setFullYear(value, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = ["R", "u", "t", "T"];
  }

  const numericPatterns = {
    month: /^(1[0-2]|0?\d)/, // 0 to 12
    date: /^(3[0-1]|[0-2]?\d)/, // 0 to 31
    dayOfYear: /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/, // 0 to 366
    week: /^(5[0-3]|[0-4]?\d)/, // 0 to 53
    hour23h: /^(2[0-3]|[0-1]?\d)/, // 0 to 23
    hour24h: /^(2[0-4]|[0-1]?\d)/, // 0 to 24
    hour11h: /^(1[0-1]|0?\d)/, // 0 to 11
    hour12h: /^(1[0-2]|0?\d)/, // 0 to 12
    minute: /^[0-5]?\d/, // 0 to 59
    second: /^[0-5]?\d/, // 0 to 59

    singleDigit: /^\d/, // 0 to 9
    twoDigits: /^\d{1,2}/, // 0 to 99
    threeDigits: /^\d{1,3}/, // 0 to 999
    fourDigits: /^\d{1,4}/, // 0 to 9999

    anyDigitsSigned: /^-?\d+/,
    singleDigitSigned: /^-?\d/, // 0 to 9, -0 to -9
    twoDigitsSigned: /^-?\d{1,2}/, // 0 to 99, -0 to -99
    threeDigitsSigned: /^-?\d{1,3}/, // 0 to 999, -0 to -999
    fourDigitsSigned: /^-?\d{1,4}/, // 0 to 9999, -0 to -9999
  };

  const timezonePatterns = {
    basicOptionalMinutes: /^([+-])(\d{2})(\d{2})?|Z/,
    basic: /^([+-])(\d{2})(\d{2})|Z/,
    basicOptionalSeconds: /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
    extended: /^([+-])(\d{2}):(\d{2})|Z/,
    extendedOptionalSeconds: /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/,
  };

  function mapValue(parseFnResult, mapFn) {
    if (!parseFnResult) {
      return parseFnResult;
    }

    return {
      value: mapFn(parseFnResult.value),
      rest: parseFnResult.rest,
    };
  }

  function parseNumericPattern(pattern, dateString) {
    const matchResult = dateString.match(pattern);

    if (!matchResult) {
      return null;
    }

    return {
      value: parseInt(matchResult[0], 10),
      rest: dateString.slice(matchResult[0].length),
    };
  }

  function parseTimezonePattern(pattern, dateString) {
    const matchResult = dateString.match(pattern);

    if (!matchResult) {
      return null;
    }

    // Input is 'Z'
    if (matchResult[0] === "Z") {
      return {
        value: 0,
        rest: dateString.slice(1),
      };
    }

    const sign = matchResult[1] === "+" ? 1 : -1;
    const hours = matchResult[2] ? parseInt(matchResult[2], 10) : 0;
    const minutes = matchResult[3] ? parseInt(matchResult[3], 10) : 0;
    const seconds = matchResult[5] ? parseInt(matchResult[5], 10) : 0;

    return {
      value:
        sign *
        (hours * millisecondsInHour +
          minutes * millisecondsInMinute +
          seconds * millisecondsInSecond),
      rest: dateString.slice(matchResult[0].length),
    };
  }

  function parseAnyDigitsSigned(dateString) {
    return parseNumericPattern(numericPatterns.anyDigitsSigned, dateString);
  }

  function parseNDigits(n, dateString) {
    switch (n) {
      case 1:
        return parseNumericPattern(numericPatterns.singleDigit, dateString);
      case 2:
        return parseNumericPattern(numericPatterns.twoDigits, dateString);
      case 3:
        return parseNumericPattern(numericPatterns.threeDigits, dateString);
      case 4:
        return parseNumericPattern(numericPatterns.fourDigits, dateString);
      default:
        return parseNumericPattern(new RegExp("^\\d{1," + n + "}"), dateString);
    }
  }

  function parseNDigitsSigned(n, dateString) {
    switch (n) {
      case 1:
        return parseNumericPattern(numericPatterns.singleDigitSigned, dateString);
      case 2:
        return parseNumericPattern(numericPatterns.twoDigitsSigned, dateString);
      case 3:
        return parseNumericPattern(numericPatterns.threeDigitsSigned, dateString);
      case 4:
        return parseNumericPattern(numericPatterns.fourDigitsSigned, dateString);
      default:
        return parseNumericPattern(new RegExp("^-?\\d{1," + n + "}"), dateString);
    }
  }

  function dayPeriodEnumToHours(dayPeriod) {
    switch (dayPeriod) {
      case "morning":
        return 4;
      case "evening":
        return 17;
      case "pm":
      case "noon":
      case "afternoon":
        return 12;
      case "am":
      case "midnight":
      case "night":
      default:
        return 0;
    }
  }

  function normalizeTwoDigitYear(twoDigitYear, currentYear) {
    const isCommonEra = currentYear > 0;
    // Absolute number of the current year:
    // 1 -> 1 AC
    // 0 -> 1 BC
    // -1 -> 2 BC
    const absCurrentYear = isCommonEra ? currentYear : 1 - currentYear;

    let result;
    if (absCurrentYear <= 50) {
      result = twoDigitYear || 100;
    } else {
      const rangeEnd = absCurrentYear + 50;
      const rangeEndCentury = Math.trunc(rangeEnd / 100) * 100;
      const isPreviousCentury = twoDigitYear >= rangeEnd % 100;
      result = twoDigitYear + rangeEndCentury - (isPreviousCentury ? 100 : 0);
    }

    return isCommonEra ? result : 1 - result;
  }

  function isLeapYearIndex(year) {
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  }

  // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_Patterns
  // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
  // |----------|-------|----|-------|-------|-------|
  // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
  // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
  // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
  // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
  // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
  class YearParser extends Parser {
    priority = 130;
    incompatibleTokens = ["Y", "R", "u", "w", "I", "i", "e", "c", "t", "T"];

    parse(dateString, token, match) {
      const valueCallback = (year) => ({
        year,
        isTwoDigitYear: token === "yy",
      });

      switch (token) {
        case "y":
          return mapValue(parseNDigits(4, dateString), valueCallback);
        case "yo":
          return mapValue(
            match.ordinalNumber(dateString, {
              unit: "year",
            }),
            valueCallback,
          );
        default:
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
      }
    }

    validate(_date, value) {
      return value.isTwoDigitYear || value.year > 0;
    }

    set(date, flags, value) {
      const currentYear = date.getFullYear();

      if (value.isTwoDigitYear) {
        const normalizedTwoDigitYear = normalizeTwoDigitYear(
          value.year,
          currentYear,
        );
        date.setFullYear(normalizedTwoDigitYear, 0, 1);
        date.setHours(0, 0, 0, 0);
        return date;
      }

      const year =
        !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
      date.setFullYear(year, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  // Local week-numbering year
  class LocalWeekYearParser extends Parser {
    priority = 130;

    parse(dateString, token, match) {
      const valueCallback = (year) => ({
        year,
        isTwoDigitYear: token === "YY",
      });

      switch (token) {
        case "Y":
          return mapValue(parseNDigits(4, dateString), valueCallback);
        case "Yo":
          return mapValue(
            match.ordinalNumber(dateString, {
              unit: "year",
            }),
            valueCallback,
          );
        default:
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
      }
    }

    validate(_date, value) {
      return value.isTwoDigitYear || value.year > 0;
    }

    set(date, flags, value, options) {
      const currentYear = getWeekYear(date, options);

      if (value.isTwoDigitYear) {
        const normalizedTwoDigitYear = normalizeTwoDigitYear(
          value.year,
          currentYear,
        );
        date.setFullYear(
          normalizedTwoDigitYear,
          0,
          options.firstWeekContainsDate,
        );
        date.setHours(0, 0, 0, 0);
        return startOfWeek(date, options);
      }

      const year =
        !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
      date.setFullYear(year, 0, options.firstWeekContainsDate);
      date.setHours(0, 0, 0, 0);
      return startOfWeek(date, options);
    }

    incompatibleTokens = [
      "y",
      "R",
      "u",
      "Q",
      "q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "i",
      "t",
      "T",
    ];
  }

  // ISO week-numbering year
  class ISOWeekYearParser extends Parser {
    priority = 130;

    parse(dateString, token) {
      if (token === "R") {
        return parseNDigitsSigned(4, dateString);
      }

      return parseNDigitsSigned(token.length, dateString);
    }

    set(date, _flags, value) {
      const firstWeekOfYear = constructFrom(date, 0);
      firstWeekOfYear.setFullYear(value, 0, 4);
      firstWeekOfYear.setHours(0, 0, 0, 0);
      return startOfISOWeek(firstWeekOfYear);
    }

    incompatibleTokens = [
      "G",
      "y",
      "Y",
      "u",
      "Q",
      "q",
      "M",
      "L",
      "w",
      "d",
      "D",
      "e",
      "c",
      "t",
      "T",
    ];
  }

  class ExtendedYearParser extends Parser {
    priority = 130;

    parse(dateString, token) {
      if (token === "u") {
        return parseNDigitsSigned(4, dateString);
      }

      return parseNDigitsSigned(token.length, dateString);
    }

    set(date, _flags, value) {
      date.setFullYear(value, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = ["G", "y", "Y", "R", "w", "I", "i", "e", "c", "t", "T"];
  }

  class QuarterParser extends Parser {
    priority = 120;

    parse(dateString, token, match) {
      switch (token) {
        // 1, 2, 3, 4
        case "Q":
        case "QQ": // 01, 02, 03, 04
          return parseNDigits(token.length, dateString);
        // 1st, 2nd, 3rd, 4th
        case "Qo":
          return match.ordinalNumber(dateString, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "QQQ":
          return (
            match.quarter(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.quarter(dateString, {
              width: "narrow",
              context: "formatting",
            })
          );

        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "QQQQQ":
          return match.quarter(dateString, {
            width: "narrow",
            context: "formatting",
          });
        // 1st quarter, 2nd quarter, ...
        case "QQQQ":
        default:
          return (
            match.quarter(dateString, {
              width: "wide",
              context: "formatting",
            }) ||
            match.quarter(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.quarter(dateString, {
              width: "narrow",
              context: "formatting",
            })
          );
      }
    }

    validate(_date, value) {
      return value >= 1 && value <= 4;
    }

    set(date, _flags, value) {
      date.setMonth((value - 1) * 3, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "M",
      "L",
      "w",
      "I",
      "d",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T",
    ];
  }

  class StandAloneQuarterParser extends Parser {
    priority = 120;

    parse(dateString, token, match) {
      switch (token) {
        // 1, 2, 3, 4
        case "q":
        case "qq": // 01, 02, 03, 04
          return parseNDigits(token.length, dateString);
        // 1st, 2nd, 3rd, 4th
        case "qo":
          return match.ordinalNumber(dateString, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "qqq":
          return (
            match.quarter(dateString, {
              width: "abbreviated",
              context: "standalone",
            }) ||
            match.quarter(dateString, {
              width: "narrow",
              context: "standalone",
            })
          );

        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "qqqqq":
          return match.quarter(dateString, {
            width: "narrow",
            context: "standalone",
          });
        // 1st quarter, 2nd quarter, ...
        case "qqqq":
        default:
          return (
            match.quarter(dateString, {
              width: "wide",
              context: "standalone",
            }) ||
            match.quarter(dateString, {
              width: "abbreviated",
              context: "standalone",
            }) ||
            match.quarter(dateString, {
              width: "narrow",
              context: "standalone",
            })
          );
      }
    }

    validate(_date, value) {
      return value >= 1 && value <= 4;
    }

    set(date, _flags, value) {
      date.setMonth((value - 1) * 3, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = [
      "Y",
      "R",
      "Q",
      "M",
      "L",
      "w",
      "I",
      "d",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T",
    ];
  }

  class MonthParser extends Parser {
    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "Q",
      "L",
      "w",
      "I",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T",
    ];

    priority = 110;

    parse(dateString, token, match) {
      const valueCallback = (value) => value - 1;

      switch (token) {
        // 1, 2, ..., 12
        case "M":
          return mapValue(
            parseNumericPattern(numericPatterns.month, dateString),
            valueCallback,
          );
        // 01, 02, ..., 12
        case "MM":
          return mapValue(parseNDigits(2, dateString), valueCallback);
        // 1st, 2nd, ..., 12th
        case "Mo":
          return mapValue(
            match.ordinalNumber(dateString, {
              unit: "month",
            }),
            valueCallback,
          );
        // Jan, Feb, ..., Dec
        case "MMM":
          return (
            match.month(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.month(dateString, { width: "narrow", context: "formatting" })
          );

        // J, F, ..., D
        case "MMMMM":
          return match.month(dateString, {
            width: "narrow",
            context: "formatting",
          });
        // January, February, ..., December
        case "MMMM":
        default:
          return (
            match.month(dateString, { width: "wide", context: "formatting" }) ||
            match.month(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.month(dateString, { width: "narrow", context: "formatting" })
          );
      }
    }

    validate(_date, value) {
      return value >= 0 && value <= 11;
    }

    set(date, _flags, value) {
      date.setMonth(value, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  class StandAloneMonthParser extends Parser {
    priority = 110;

    parse(dateString, token, match) {
      const valueCallback = (value) => value - 1;

      switch (token) {
        // 1, 2, ..., 12
        case "L":
          return mapValue(
            parseNumericPattern(numericPatterns.month, dateString),
            valueCallback,
          );
        // 01, 02, ..., 12
        case "LL":
          return mapValue(parseNDigits(2, dateString), valueCallback);
        // 1st, 2nd, ..., 12th
        case "Lo":
          return mapValue(
            match.ordinalNumber(dateString, {
              unit: "month",
            }),
            valueCallback,
          );
        // Jan, Feb, ..., Dec
        case "LLL":
          return (
            match.month(dateString, {
              width: "abbreviated",
              context: "standalone",
            }) ||
            match.month(dateString, { width: "narrow", context: "standalone" })
          );

        // J, F, ..., D
        case "LLLLL":
          return match.month(dateString, {
            width: "narrow",
            context: "standalone",
          });
        // January, February, ..., December
        case "LLLL":
        default:
          return (
            match.month(dateString, { width: "wide", context: "standalone" }) ||
            match.month(dateString, {
              width: "abbreviated",
              context: "standalone",
            }) ||
            match.month(dateString, { width: "narrow", context: "standalone" })
          );
      }
    }

    validate(_date, value) {
      return value >= 0 && value <= 11;
    }

    set(date, _flags, value) {
      date.setMonth(value, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "Q",
      "M",
      "w",
      "I",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T",
    ];
  }

  /**
   * The {@link setWeek} function options.
   */

  /**
   * @name setWeek
   * @category Week Helpers
   * @summary Set the local week to the given date.
   *
   * @description
   * Set the local week to the given date, saving the weekday number.
   * The exact calculation depends on the values of
   * `options.weekStartsOn` (which is the index of the first day of the week)
   * and `options.firstWeekContainsDate` (which is the day of January, which is always in
   * the first week of the week-numbering year)
   *
   * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The date to be changed
   * @param week - The week of the new date
   * @param options - An object with options
   *
   * @returns The new date with the local week set
   *
   * @example
   * // Set the 1st week to 2 January 2005 with default options:
   * const result = setWeek(new Date(2005, 0, 2), 1)
   * //=> Sun Dec 26 2004 00:00:00
   *
   * @example
   * // Set the 1st week to 2 January 2005,
   * // if Monday is the first day of the week,
   * // and the first week of the year always contains 4 January:
   * const result = setWeek(new Date(2005, 0, 2), 1, {
   *   weekStartsOn: 1,
   *   firstWeekContainsDate: 4
   * })
   * //=> Sun Jan 4 2004 00:00:00
   */
  function setWeek(date, week, options) {
    const date_ = toDate(date, options?.in);
    const diff = getWeek(date_, options) - week;
    date_.setDate(date_.getDate() - diff * 7);
    return toDate(date_, options?.in);
  }

  // Local week of year
  class LocalWeekParser extends Parser {
    priority = 100;

    parse(dateString, token, match) {
      switch (token) {
        case "w":
          return parseNumericPattern(numericPatterns.week, dateString);
        case "wo":
          return match.ordinalNumber(dateString, { unit: "week" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(_date, value) {
      return value >= 1 && value <= 53;
    }

    set(date, _flags, value, options) {
      return startOfWeek(setWeek(date, value, options), options);
    }

    incompatibleTokens = [
      "y",
      "R",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "i",
      "t",
      "T",
    ];
  }

  /**
   * The {@link setISOWeek} function options.
   */

  /**
   * @name setISOWeek
   * @category ISO Week Helpers
   * @summary Set the ISO week to the given date.
   *
   * @description
   * Set the ISO week to the given date, saving the weekday number.
   *
   * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The `Date` type of the context function.
   *
   * @param date - The date to be changed
   * @param week - The ISO week of the new date
   * @param options - An object with options
   *
   * @returns The new date with the ISO week set
   *
   * @example
   * // Set the 53rd ISO week to 7 August 2004:
   * const result = setISOWeek(new Date(2004, 7, 7), 53)
   * //=> Sat Jan 01 2005 00:00:00
   */
  function setISOWeek(date, week, options) {
    const _date = toDate(date, options?.in);
    const diff = getISOWeek(_date, options) - week;
    _date.setDate(_date.getDate() - diff * 7);
    return _date;
  }

  // ISO week of year
  class ISOWeekParser extends Parser {
    priority = 100;

    parse(dateString, token, match) {
      switch (token) {
        case "I":
          return parseNumericPattern(numericPatterns.week, dateString);
        case "Io":
          return match.ordinalNumber(dateString, { unit: "week" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(_date, value) {
      return value >= 1 && value <= 53;
    }

    set(date, _flags, value) {
      return startOfISOWeek(setISOWeek(date, value));
    }

    incompatibleTokens = [
      "y",
      "Y",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "w",
      "d",
      "D",
      "e",
      "c",
      "t",
      "T",
    ];
  }

  const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const DAYS_IN_MONTH_LEAP_YEAR = [
    31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];

  // Day of the month
  class DateParser extends Parser {
    priority = 90;
    subPriority = 1;

    parse(dateString, token, match) {
      switch (token) {
        case "d":
          return parseNumericPattern(numericPatterns.date, dateString);
        case "do":
          return match.ordinalNumber(dateString, { unit: "date" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(date, value) {
      const year = date.getFullYear();
      const isLeapYear = isLeapYearIndex(year);
      const month = date.getMonth();
      if (isLeapYear) {
        return value >= 1 && value <= DAYS_IN_MONTH_LEAP_YEAR[month];
      } else {
        return value >= 1 && value <= DAYS_IN_MONTH[month];
      }
    }

    set(date, _flags, value) {
      date.setDate(value);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "Q",
      "w",
      "I",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T",
    ];
  }

  class DayOfYearParser extends Parser {
    priority = 90;

    subpriority = 1;

    parse(dateString, token, match) {
      switch (token) {
        case "D":
        case "DD":
          return parseNumericPattern(numericPatterns.dayOfYear, dateString);
        case "Do":
          return match.ordinalNumber(dateString, { unit: "date" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(date, value) {
      const year = date.getFullYear();
      const isLeapYear = isLeapYearIndex(year);
      if (isLeapYear) {
        return value >= 1 && value <= 366;
      } else {
        return value >= 1 && value <= 365;
      }
    }

    set(date, _flags, value) {
      date.setMonth(0, value);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "Q",
      "M",
      "L",
      "w",
      "I",
      "d",
      "E",
      "i",
      "e",
      "c",
      "t",
      "T",
    ];
  }

  /**
   * The {@link setDay} function options.
   */

  /**
   * @name setDay
   * @category Weekday Helpers
   * @summary Set the day of the week to the given date.
   *
   * @description
   * Set the day of the week to the given date.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The date to be changed
   * @param day - The day of the week of the new date
   * @param options - An object with options.
   *
   * @returns The new date with the day of the week set
   *
   * @example
   * // Set week day to Sunday, with the default weekStartsOn of Sunday:
   * const result = setDay(new Date(2014, 8, 1), 0)
   * //=> Sun Aug 31 2014 00:00:00
   *
   * @example
   * // Set week day to Sunday, with a weekStartsOn of Monday:
   * const result = setDay(new Date(2014, 8, 1), 0, { weekStartsOn: 1 })
   * //=> Sun Sep 07 2014 00:00:00
   */
  function setDay(date, day, options) {
    const defaultOptions = getDefaultOptions$1();
    const weekStartsOn =
      options?.weekStartsOn ??
      options?.locale?.options?.weekStartsOn ??
      defaultOptions.weekStartsOn ??
      defaultOptions.locale?.options?.weekStartsOn ??
      0;

    const date_ = toDate(date, options?.in);
    const currentDay = date_.getDay();

    const remainder = day % 7;
    const dayIndex = (remainder + 7) % 7;

    const delta = 7 - weekStartsOn;
    const diff =
      day < 0 || day > 6
        ? day - ((currentDay + delta) % 7)
        : ((dayIndex + delta) % 7) - ((currentDay + delta) % 7);
    return addDays(date_, diff, options);
  }

  // Day of week
  class DayParser extends Parser {
    priority = 90;

    parse(dateString, token, match) {
      switch (token) {
        // Tue
        case "E":
        case "EE":
        case "EEE":
          return (
            match.day(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.day(dateString, { width: "short", context: "formatting" }) ||
            match.day(dateString, { width: "narrow", context: "formatting" })
          );

        // T
        case "EEEEE":
          return match.day(dateString, {
            width: "narrow",
            context: "formatting",
          });
        // Tu
        case "EEEEEE":
          return (
            match.day(dateString, { width: "short", context: "formatting" }) ||
            match.day(dateString, { width: "narrow", context: "formatting" })
          );

        // Tuesday
        case "EEEE":
        default:
          return (
            match.day(dateString, { width: "wide", context: "formatting" }) ||
            match.day(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.day(dateString, { width: "short", context: "formatting" }) ||
            match.day(dateString, { width: "narrow", context: "formatting" })
          );
      }
    }

    validate(_date, value) {
      return value >= 0 && value <= 6;
    }

    set(date, _flags, value, options) {
      date = setDay(date, value, options);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = ["D", "i", "e", "c", "t", "T"];
  }

  // Local day of week
  class LocalDayParser extends Parser {
    priority = 90;
    parse(dateString, token, match, options) {
      const valueCallback = (value) => {
        // We want here floor instead of trunc, so we get -7 for value 0 instead of 0
        const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
        return ((value + options.weekStartsOn + 6) % 7) + wholeWeekDays;
      };

      switch (token) {
        // 3
        case "e":
        case "ee": // 03
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
        // 3rd
        case "eo":
          return mapValue(
            match.ordinalNumber(dateString, {
              unit: "day",
            }),
            valueCallback,
          );
        // Tue
        case "eee":
          return (
            match.day(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.day(dateString, { width: "short", context: "formatting" }) ||
            match.day(dateString, { width: "narrow", context: "formatting" })
          );

        // T
        case "eeeee":
          return match.day(dateString, {
            width: "narrow",
            context: "formatting",
          });
        // Tu
        case "eeeeee":
          return (
            match.day(dateString, { width: "short", context: "formatting" }) ||
            match.day(dateString, { width: "narrow", context: "formatting" })
          );

        // Tuesday
        case "eeee":
        default:
          return (
            match.day(dateString, { width: "wide", context: "formatting" }) ||
            match.day(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.day(dateString, { width: "short", context: "formatting" }) ||
            match.day(dateString, { width: "narrow", context: "formatting" })
          );
      }
    }

    validate(_date, value) {
      return value >= 0 && value <= 6;
    }

    set(date, _flags, value, options) {
      date = setDay(date, value, options);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = [
      "y",
      "R",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "E",
      "i",
      "c",
      "t",
      "T",
    ];
  }

  // Stand-alone local day of week
  class StandAloneLocalDayParser extends Parser {
    priority = 90;

    parse(dateString, token, match, options) {
      const valueCallback = (value) => {
        // We want here floor instead of trunc, so we get -7 for value 0 instead of 0
        const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
        return ((value + options.weekStartsOn + 6) % 7) + wholeWeekDays;
      };

      switch (token) {
        // 3
        case "c":
        case "cc": // 03
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
        // 3rd
        case "co":
          return mapValue(
            match.ordinalNumber(dateString, {
              unit: "day",
            }),
            valueCallback,
          );
        // Tue
        case "ccc":
          return (
            match.day(dateString, {
              width: "abbreviated",
              context: "standalone",
            }) ||
            match.day(dateString, { width: "short", context: "standalone" }) ||
            match.day(dateString, { width: "narrow", context: "standalone" })
          );

        // T
        case "ccccc":
          return match.day(dateString, {
            width: "narrow",
            context: "standalone",
          });
        // Tu
        case "cccccc":
          return (
            match.day(dateString, { width: "short", context: "standalone" }) ||
            match.day(dateString, { width: "narrow", context: "standalone" })
          );

        // Tuesday
        case "cccc":
        default:
          return (
            match.day(dateString, { width: "wide", context: "standalone" }) ||
            match.day(dateString, {
              width: "abbreviated",
              context: "standalone",
            }) ||
            match.day(dateString, { width: "short", context: "standalone" }) ||
            match.day(dateString, { width: "narrow", context: "standalone" })
          );
      }
    }

    validate(_date, value) {
      return value >= 0 && value <= 6;
    }

    set(date, _flags, value, options) {
      date = setDay(date, value, options);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = [
      "y",
      "R",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "E",
      "i",
      "e",
      "t",
      "T",
    ];
  }

  /**
   * The {@link setISODay} function options.
   */

  /**
   * @name setISODay
   * @category Weekday Helpers
   * @summary Set the day of the ISO week to the given date.
   *
   * @description
   * Set the day of the ISO week to the given date.
   * ISO week starts with Monday.
   * 7 is the index of Sunday, 1 is the index of Monday, etc.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The date to be changed
   * @param day - The day of the ISO week of the new date
   * @param options - An object with options
   *
   * @returns The new date with the day of the ISO week set
   *
   * @example
   * // Set Sunday to 1 September 2014:
   * const result = setISODay(new Date(2014, 8, 1), 7)
   * //=> Sun Sep 07 2014 00:00:00
   */
  function setISODay(date, day, options) {
    const date_ = toDate(date, options?.in);
    const currentDay = getISODay(date_, options);
    const diff = day - currentDay;
    return addDays(date_, diff, options);
  }

  // ISO day of week
  class ISODayParser extends Parser {
    priority = 90;

    parse(dateString, token, match) {
      const valueCallback = (value) => {
        if (value === 0) {
          return 7;
        }
        return value;
      };

      switch (token) {
        // 2
        case "i":
        case "ii": // 02
          return parseNDigits(token.length, dateString);
        // 2nd
        case "io":
          return match.ordinalNumber(dateString, { unit: "day" });
        // Tue
        case "iii":
          return mapValue(
            match.day(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
              match.day(dateString, {
                width: "short",
                context: "formatting",
              }) ||
              match.day(dateString, {
                width: "narrow",
                context: "formatting",
              }),
            valueCallback,
          );
        // T
        case "iiiii":
          return mapValue(
            match.day(dateString, {
              width: "narrow",
              context: "formatting",
            }),
            valueCallback,
          );
        // Tu
        case "iiiiii":
          return mapValue(
            match.day(dateString, {
              width: "short",
              context: "formatting",
            }) ||
              match.day(dateString, {
                width: "narrow",
                context: "formatting",
              }),
            valueCallback,
          );
        // Tuesday
        case "iiii":
        default:
          return mapValue(
            match.day(dateString, {
              width: "wide",
              context: "formatting",
            }) ||
              match.day(dateString, {
                width: "abbreviated",
                context: "formatting",
              }) ||
              match.day(dateString, {
                width: "short",
                context: "formatting",
              }) ||
              match.day(dateString, {
                width: "narrow",
                context: "formatting",
              }),
            valueCallback,
          );
      }
    }

    validate(_date, value) {
      return value >= 1 && value <= 7;
    }

    set(date, _flags, value) {
      date = setISODay(date, value);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    incompatibleTokens = [
      "y",
      "Y",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "w",
      "d",
      "D",
      "E",
      "e",
      "c",
      "t",
      "T",
    ];
  }

  class AMPMParser extends Parser {
    priority = 80;

    parse(dateString, token, match) {
      switch (token) {
        case "a":
        case "aa":
        case "aaa":
          return (
            match.dayPeriod(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.dayPeriod(dateString, {
              width: "narrow",
              context: "formatting",
            })
          );

        case "aaaaa":
          return match.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting",
          });
        case "aaaa":
        default:
          return (
            match.dayPeriod(dateString, {
              width: "wide",
              context: "formatting",
            }) ||
            match.dayPeriod(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.dayPeriod(dateString, {
              width: "narrow",
              context: "formatting",
            })
          );
      }
    }

    set(date, _flags, value) {
      date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }

    incompatibleTokens = ["b", "B", "H", "k", "t", "T"];
  }

  class AMPMMidnightParser extends Parser {
    priority = 80;

    parse(dateString, token, match) {
      switch (token) {
        case "b":
        case "bb":
        case "bbb":
          return (
            match.dayPeriod(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.dayPeriod(dateString, {
              width: "narrow",
              context: "formatting",
            })
          );

        case "bbbbb":
          return match.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting",
          });
        case "bbbb":
        default:
          return (
            match.dayPeriod(dateString, {
              width: "wide",
              context: "formatting",
            }) ||
            match.dayPeriod(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.dayPeriod(dateString, {
              width: "narrow",
              context: "formatting",
            })
          );
      }
    }

    set(date, _flags, value) {
      date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }

    incompatibleTokens = ["a", "B", "H", "k", "t", "T"];
  }

  // in the morning, in the afternoon, in the evening, at night
  class DayPeriodParser extends Parser {
    priority = 80;

    parse(dateString, token, match) {
      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return (
            match.dayPeriod(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.dayPeriod(dateString, {
              width: "narrow",
              context: "formatting",
            })
          );

        case "BBBBB":
          return match.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting",
          });
        case "BBBB":
        default:
          return (
            match.dayPeriod(dateString, {
              width: "wide",
              context: "formatting",
            }) ||
            match.dayPeriod(dateString, {
              width: "abbreviated",
              context: "formatting",
            }) ||
            match.dayPeriod(dateString, {
              width: "narrow",
              context: "formatting",
            })
          );
      }
    }

    set(date, _flags, value) {
      date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }

    incompatibleTokens = ["a", "b", "t", "T"];
  }

  class Hour1to12Parser extends Parser {
    priority = 70;

    parse(dateString, token, match) {
      switch (token) {
        case "h":
          return parseNumericPattern(numericPatterns.hour12h, dateString);
        case "ho":
          return match.ordinalNumber(dateString, { unit: "hour" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(_date, value) {
      return value >= 1 && value <= 12;
    }

    set(date, _flags, value) {
      const isPM = date.getHours() >= 12;
      if (isPM && value < 12) {
        date.setHours(value + 12, 0, 0, 0);
      } else if (!isPM && value === 12) {
        date.setHours(0, 0, 0, 0);
      } else {
        date.setHours(value, 0, 0, 0);
      }
      return date;
    }

    incompatibleTokens = ["H", "K", "k", "t", "T"];
  }

  class Hour0to23Parser extends Parser {
    priority = 70;

    parse(dateString, token, match) {
      switch (token) {
        case "H":
          return parseNumericPattern(numericPatterns.hour23h, dateString);
        case "Ho":
          return match.ordinalNumber(dateString, { unit: "hour" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(_date, value) {
      return value >= 0 && value <= 23;
    }

    set(date, _flags, value) {
      date.setHours(value, 0, 0, 0);
      return date;
    }

    incompatibleTokens = ["a", "b", "h", "K", "k", "t", "T"];
  }

  class Hour0To11Parser extends Parser {
    priority = 70;

    parse(dateString, token, match) {
      switch (token) {
        case "K":
          return parseNumericPattern(numericPatterns.hour11h, dateString);
        case "Ko":
          return match.ordinalNumber(dateString, { unit: "hour" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(_date, value) {
      return value >= 0 && value <= 11;
    }

    set(date, _flags, value) {
      const isPM = date.getHours() >= 12;
      if (isPM && value < 12) {
        date.setHours(value + 12, 0, 0, 0);
      } else {
        date.setHours(value, 0, 0, 0);
      }
      return date;
    }

    incompatibleTokens = ["h", "H", "k", "t", "T"];
  }

  class Hour1To24Parser extends Parser {
    priority = 70;

    parse(dateString, token, match) {
      switch (token) {
        case "k":
          return parseNumericPattern(numericPatterns.hour24h, dateString);
        case "ko":
          return match.ordinalNumber(dateString, { unit: "hour" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(_date, value) {
      return value >= 1 && value <= 24;
    }

    set(date, _flags, value) {
      const hours = value <= 24 ? value % 24 : value;
      date.setHours(hours, 0, 0, 0);
      return date;
    }

    incompatibleTokens = ["a", "b", "h", "H", "K", "t", "T"];
  }

  class MinuteParser extends Parser {
    priority = 60;

    parse(dateString, token, match) {
      switch (token) {
        case "m":
          return parseNumericPattern(numericPatterns.minute, dateString);
        case "mo":
          return match.ordinalNumber(dateString, { unit: "minute" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(_date, value) {
      return value >= 0 && value <= 59;
    }

    set(date, _flags, value) {
      date.setMinutes(value, 0, 0);
      return date;
    }

    incompatibleTokens = ["t", "T"];
  }

  class SecondParser extends Parser {
    priority = 50;

    parse(dateString, token, match) {
      switch (token) {
        case "s":
          return parseNumericPattern(numericPatterns.second, dateString);
        case "so":
          return match.ordinalNumber(dateString, { unit: "second" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }

    validate(_date, value) {
      return value >= 0 && value <= 59;
    }

    set(date, _flags, value) {
      date.setSeconds(value, 0);
      return date;
    }

    incompatibleTokens = ["t", "T"];
  }

  class FractionOfSecondParser extends Parser {
    priority = 30;

    parse(dateString, token) {
      const valueCallback = (value) =>
        Math.trunc(value * Math.pow(10, -token.length + 3));
      return mapValue(parseNDigits(token.length, dateString), valueCallback);
    }

    set(date, _flags, value) {
      date.setMilliseconds(value);
      return date;
    }

    incompatibleTokens = ["t", "T"];
  }

  // Timezone (ISO-8601. +00:00 is `'Z'`)
  class ISOTimezoneWithZParser extends Parser {
    priority = 10;

    parse(dateString, token) {
      switch (token) {
        case "X":
          return parseTimezonePattern(
            timezonePatterns.basicOptionalMinutes,
            dateString,
          );
        case "XX":
          return parseTimezonePattern(timezonePatterns.basic, dateString);
        case "XXXX":
          return parseTimezonePattern(
            timezonePatterns.basicOptionalSeconds,
            dateString,
          );
        case "XXXXX":
          return parseTimezonePattern(
            timezonePatterns.extendedOptionalSeconds,
            dateString,
          );
        case "XXX":
        default:
          return parseTimezonePattern(timezonePatterns.extended, dateString);
      }
    }

    set(date, flags, value) {
      if (flags.timestampIsSet) return date;
      return constructFrom(
        date,
        date.getTime() - getTimezoneOffsetInMilliseconds(date) - value,
      );
    }

    incompatibleTokens = ["t", "T", "x"];
  }

  // Timezone (ISO-8601)
  class ISOTimezoneParser extends Parser {
    priority = 10;

    parse(dateString, token) {
      switch (token) {
        case "x":
          return parseTimezonePattern(
            timezonePatterns.basicOptionalMinutes,
            dateString,
          );
        case "xx":
          return parseTimezonePattern(timezonePatterns.basic, dateString);
        case "xxxx":
          return parseTimezonePattern(
            timezonePatterns.basicOptionalSeconds,
            dateString,
          );
        case "xxxxx":
          return parseTimezonePattern(
            timezonePatterns.extendedOptionalSeconds,
            dateString,
          );
        case "xxx":
        default:
          return parseTimezonePattern(timezonePatterns.extended, dateString);
      }
    }

    set(date, flags, value) {
      if (flags.timestampIsSet) return date;
      return constructFrom(
        date,
        date.getTime() - getTimezoneOffsetInMilliseconds(date) - value,
      );
    }

    incompatibleTokens = ["t", "T", "X"];
  }

  class TimestampSecondsParser extends Parser {
    priority = 40;

    parse(dateString) {
      return parseAnyDigitsSigned(dateString);
    }

    set(date, _flags, value) {
      return [constructFrom(date, value * 1000), { timestampIsSet: true }];
    }

    incompatibleTokens = "*";
  }

  class TimestampMillisecondsParser extends Parser {
    priority = 20;

    parse(dateString) {
      return parseAnyDigitsSigned(dateString);
    }

    set(date, _flags, value) {
      return [constructFrom(date, value), { timestampIsSet: true }];
    }

    incompatibleTokens = "*";
  }

  /*
   * |     | Unit                           |     | Unit                           |
   * |-----|--------------------------------|-----|--------------------------------|
   * |  a  | AM, PM                         |  A* | Milliseconds in day            |
   * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
   * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
   * |  d  | Day of month                   |  D  | Day of year                    |
   * |  e  | Local day of week              |  E  | Day of week                    |
   * |  f  |                                |  F* | Day of week in month           |
   * |  g* | Modified Julian day            |  G  | Era                            |
   * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
   * |  i! | ISO day of week                |  I! | ISO week of year               |
   * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
   * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
   * |  l* | (deprecated)                   |  L  | Stand-alone month              |
   * |  m  | Minute                         |  M  | Month                          |
   * |  n  |                                |  N  |                                |
   * |  o! | Ordinal number modifier        |  O* | Timezone (GMT)                 |
   * |  p  |                                |  P  |                                |
   * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
   * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
   * |  s  | Second                         |  S  | Fraction of second             |
   * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
   * |  u  | Extended year                  |  U* | Cyclic year                    |
   * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
   * |  w  | Local week of year             |  W* | Week of month                  |
   * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
   * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
   * |  z* | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
   *
   * Letters marked by * are not implemented but reserved by Unicode standard.
   *
   * Letters marked by ! are non-standard, but implemented by date-fns:
   * - `o` modifies the previous token to turn it into an ordinal (see `parse` docs)
   * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
   *   i.e. 7 for Sunday, 1 for Monday, etc.
   * - `I` is ISO week of year, as opposed to `w` which is local week of year.
   * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
   *   `R` is supposed to be used in conjunction with `I` and `i`
   *   for universal ISO week-numbering date, whereas
   *   `Y` is supposed to be used in conjunction with `w` and `e`
   *   for week-numbering date specific to the locale.
   */
  const parsers = {
    G: new EraParser(),
    y: new YearParser(),
    Y: new LocalWeekYearParser(),
    R: new ISOWeekYearParser(),
    u: new ExtendedYearParser(),
    Q: new QuarterParser(),
    q: new StandAloneQuarterParser(),
    M: new MonthParser(),
    L: new StandAloneMonthParser(),
    w: new LocalWeekParser(),
    I: new ISOWeekParser(),
    d: new DateParser(),
    D: new DayOfYearParser(),
    E: new DayParser(),
    e: new LocalDayParser(),
    c: new StandAloneLocalDayParser(),
    i: new ISODayParser(),
    a: new AMPMParser(),
    b: new AMPMMidnightParser(),
    B: new DayPeriodParser(),
    h: new Hour1to12Parser(),
    H: new Hour0to23Parser(),
    K: new Hour0To11Parser(),
    k: new Hour1To24Parser(),
    m: new MinuteParser(),
    s: new SecondParser(),
    S: new FractionOfSecondParser(),
    X: new ISOTimezoneWithZParser(),
    x: new ISOTimezoneParser(),
    t: new TimestampSecondsParser(),
    T: new TimestampMillisecondsParser(),
  };

  /**
   * The {@link parse} function options.
   */

  // This RegExp consists of three parts separated by `|`:
  // - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
  //   (one of the certain letters followed by `o`)
  // - (\w)\1* matches any sequences of the same letter
  // - '' matches two quote characters in a row
  // - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
  //   except a single quote symbol, which ends the sequence.
  //   Two quote characters do not end the sequence.
  //   If there is no matching single quote
  //   then the sequence will continue until the end of the string.
  // - . matches any single character unmatched by previous parts of the RegExps
  const formattingTokensRegExp =
    /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;

  // This RegExp catches symbols escaped by quotes, and also
  // sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
  const longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

  const escapedStringRegExp = /^'([^]*?)'?$/;
  const doubleQuoteRegExp = /''/g;

  const notWhitespaceRegExp = /\S/;
  const unescapedLatinCharacterRegExp = /[a-zA-Z]/;

  /**
   * @name parse
   * @category Common Helpers
   * @summary Parse the date.
   *
   * @description
   * Return the date parsed from string using the given format string.
   *
   * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
   * > See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * The characters in the format string wrapped between two single quotes characters (') are escaped.
   * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
   *
   * Format of the format string is based on Unicode Technical Standard #35:
   * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
   * with a few additions (see note 5 below the table).
   *
   * Not all tokens are compatible. Combinations that don't make sense or could lead to bugs are prohibited
   * and will throw `RangeError`. For example usage of 24-hour format token with AM/PM token will throw an exception:
   *
   * ```javascript
   * parse('23 AM', 'HH a', new Date())
   * //=> RangeError: The format string mustn't contain `HH` and `a` at the same time
   * ```
   *
   * See the compatibility table: https://docs.google.com/spreadsheets/d/e/2PACX-1vQOPU3xUhplll6dyoMmVUXHKl_8CRDs6_ueLmex3SoqwhuolkuN3O05l4rqx5h1dKX8eb46Ul-CCSrq/pubhtml?gid=0&single=true
   *
   * Accepted format string patterns:
   * | Unit                            |Prior| Pattern | Result examples                   | Notes |
   * |---------------------------------|-----|---------|-----------------------------------|-------|
   * | Era                             | 140 | G..GGG  | AD, BC                            |       |
   * |                                 |     | GGGG    | Anno Domini, Before Christ        | 2     |
   * |                                 |     | GGGGG   | A, B                              |       |
   * | Calendar year                   | 130 | y       | 44, 1, 1900, 2017, 9999           | 4     |
   * |                                 |     | yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
   * |                                 |     | yy      | 44, 01, 00, 17                    | 4     |
   * |                                 |     | yyy     | 044, 001, 123, 999                | 4     |
   * |                                 |     | yyyy    | 0044, 0001, 1900, 2017            | 4     |
   * |                                 |     | yyyyy   | ...                               | 2,4   |
   * | Local week-numbering year       | 130 | Y       | 44, 1, 1900, 2017, 9000           | 4     |
   * |                                 |     | Yo      | 44th, 1st, 1900th, 9999999th      | 4,5   |
   * |                                 |     | YY      | 44, 01, 00, 17                    | 4,6   |
   * |                                 |     | YYY     | 044, 001, 123, 999                | 4     |
   * |                                 |     | YYYY    | 0044, 0001, 1900, 2017            | 4,6   |
   * |                                 |     | YYYYY   | ...                               | 2,4   |
   * | ISO week-numbering year         | 130 | R       | -43, 1, 1900, 2017, 9999, -9999   | 4,5   |
   * |                                 |     | RR      | -43, 01, 00, 17                   | 4,5   |
   * |                                 |     | RRR     | -043, 001, 123, 999, -999         | 4,5   |
   * |                                 |     | RRRR    | -0043, 0001, 2017, 9999, -9999    | 4,5   |
   * |                                 |     | RRRRR   | ...                               | 2,4,5 |
   * | Extended year                   | 130 | u       | -43, 1, 1900, 2017, 9999, -999    | 4     |
   * |                                 |     | uu      | -43, 01, 99, -99                  | 4     |
   * |                                 |     | uuu     | -043, 001, 123, 999, -999         | 4     |
   * |                                 |     | uuuu    | -0043, 0001, 2017, 9999, -9999    | 4     |
   * |                                 |     | uuuuu   | ...                               | 2,4   |
   * | Quarter (formatting)            | 120 | Q       | 1, 2, 3, 4                        |       |
   * |                                 |     | Qo      | 1st, 2nd, 3rd, 4th                | 5     |
   * |                                 |     | QQ      | 01, 02, 03, 04                    |       |
   * |                                 |     | QQQ     | Q1, Q2, Q3, Q4                    |       |
   * |                                 |     | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
   * |                                 |     | QQQQQ   | 1, 2, 3, 4                        | 4     |
   * | Quarter (stand-alone)           | 120 | q       | 1, 2, 3, 4                        |       |
   * |                                 |     | qo      | 1st, 2nd, 3rd, 4th                | 5     |
   * |                                 |     | qq      | 01, 02, 03, 04                    |       |
   * |                                 |     | qqq     | Q1, Q2, Q3, Q4                    |       |
   * |                                 |     | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
   * |                                 |     | qqqqq   | 1, 2, 3, 4                        | 3     |
   * | Month (formatting)              | 110 | M       | 1, 2, ..., 12                     |       |
   * |                                 |     | Mo      | 1st, 2nd, ..., 12th               | 5     |
   * |                                 |     | MM      | 01, 02, ..., 12                   |       |
   * |                                 |     | MMM     | Jan, Feb, ..., Dec                |       |
   * |                                 |     | MMMM    | January, February, ..., December  | 2     |
   * |                                 |     | MMMMM   | J, F, ..., D                      |       |
   * | Month (stand-alone)             | 110 | L       | 1, 2, ..., 12                     |       |
   * |                                 |     | Lo      | 1st, 2nd, ..., 12th               | 5     |
   * |                                 |     | LL      | 01, 02, ..., 12                   |       |
   * |                                 |     | LLL     | Jan, Feb, ..., Dec                |       |
   * |                                 |     | LLLL    | January, February, ..., December  | 2     |
   * |                                 |     | LLLLL   | J, F, ..., D                      |       |
   * | Local week of year              | 100 | w       | 1, 2, ..., 53                     |       |
   * |                                 |     | wo      | 1st, 2nd, ..., 53th               | 5     |
   * |                                 |     | ww      | 01, 02, ..., 53                   |       |
   * | ISO week of year                | 100 | I       | 1, 2, ..., 53                     | 5     |
   * |                                 |     | Io      | 1st, 2nd, ..., 53th               | 5     |
   * |                                 |     | II      | 01, 02, ..., 53                   | 5     |
   * | Day of month                    |  90 | d       | 1, 2, ..., 31                     |       |
   * |                                 |     | do      | 1st, 2nd, ..., 31st               | 5     |
   * |                                 |     | dd      | 01, 02, ..., 31                   |       |
   * | Day of year                     |  90 | D       | 1, 2, ..., 365, 366               | 7     |
   * |                                 |     | Do      | 1st, 2nd, ..., 365th, 366th       | 5     |
   * |                                 |     | DD      | 01, 02, ..., 365, 366             | 7     |
   * |                                 |     | DDD     | 001, 002, ..., 365, 366           |       |
   * |                                 |     | DDDD    | ...                               | 2     |
   * | Day of week (formatting)        |  90 | E..EEE  | Mon, Tue, Wed, ..., Sun           |       |
   * |                                 |     | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
   * |                                 |     | EEEEE   | M, T, W, T, F, S, S               |       |
   * |                                 |     | EEEEEE  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
   * | ISO day of week (formatting)    |  90 | i       | 1, 2, 3, ..., 7                   | 5     |
   * |                                 |     | io      | 1st, 2nd, ..., 7th                | 5     |
   * |                                 |     | ii      | 01, 02, ..., 07                   | 5     |
   * |                                 |     | iii     | Mon, Tue, Wed, ..., Sun           | 5     |
   * |                                 |     | iiii    | Monday, Tuesday, ..., Sunday      | 2,5   |
   * |                                 |     | iiiii   | M, T, W, T, F, S, S               | 5     |
   * |                                 |     | iiiiii  | Mo, Tu, We, Th, Fr, Sa, Su        | 5     |
   * | Local day of week (formatting)  |  90 | e       | 2, 3, 4, ..., 1                   |       |
   * |                                 |     | eo      | 2nd, 3rd, ..., 1st                | 5     |
   * |                                 |     | ee      | 02, 03, ..., 01                   |       |
   * |                                 |     | eee     | Mon, Tue, Wed, ..., Sun           |       |
   * |                                 |     | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
   * |                                 |     | eeeee   | M, T, W, T, F, S, S               |       |
   * |                                 |     | eeeeee  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
   * | Local day of week (stand-alone) |  90 | c       | 2, 3, 4, ..., 1                   |       |
   * |                                 |     | co      | 2nd, 3rd, ..., 1st                | 5     |
   * |                                 |     | cc      | 02, 03, ..., 01                   |       |
   * |                                 |     | ccc     | Mon, Tue, Wed, ..., Sun           |       |
   * |                                 |     | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
   * |                                 |     | ccccc   | M, T, W, T, F, S, S               |       |
   * |                                 |     | cccccc  | Mo, Tu, We, Th, Fr, Sa, Su        |       |
   * | AM, PM                          |  80 | a..aaa  | AM, PM                            |       |
   * |                                 |     | aaaa    | a.m., p.m.                        | 2     |
   * |                                 |     | aaaaa   | a, p                              |       |
   * | AM, PM, noon, midnight          |  80 | b..bbb  | AM, PM, noon, midnight            |       |
   * |                                 |     | bbbb    | a.m., p.m., noon, midnight        | 2     |
   * |                                 |     | bbbbb   | a, p, n, mi                       |       |
   * | Flexible day period             |  80 | B..BBB  | at night, in the morning, ...     |       |
   * |                                 |     | BBBB    | at night, in the morning, ...     | 2     |
   * |                                 |     | BBBBB   | at night, in the morning, ...     |       |
   * | Hour [1-12]                     |  70 | h       | 1, 2, ..., 11, 12                 |       |
   * |                                 |     | ho      | 1st, 2nd, ..., 11th, 12th         | 5     |
   * |                                 |     | hh      | 01, 02, ..., 11, 12               |       |
   * | Hour [0-23]                     |  70 | H       | 0, 1, 2, ..., 23                  |       |
   * |                                 |     | Ho      | 0th, 1st, 2nd, ..., 23rd          | 5     |
   * |                                 |     | HH      | 00, 01, 02, ..., 23               |       |
   * | Hour [0-11]                     |  70 | K       | 1, 2, ..., 11, 0                  |       |
   * |                                 |     | Ko      | 1st, 2nd, ..., 11th, 0th          | 5     |
   * |                                 |     | KK      | 01, 02, ..., 11, 00               |       |
   * | Hour [1-24]                     |  70 | k       | 24, 1, 2, ..., 23                 |       |
   * |                                 |     | ko      | 24th, 1st, 2nd, ..., 23rd         | 5     |
   * |                                 |     | kk      | 24, 01, 02, ..., 23               |       |
   * | Minute                          |  60 | m       | 0, 1, ..., 59                     |       |
   * |                                 |     | mo      | 0th, 1st, ..., 59th               | 5     |
   * |                                 |     | mm      | 00, 01, ..., 59                   |       |
   * | Second                          |  50 | s       | 0, 1, ..., 59                     |       |
   * |                                 |     | so      | 0th, 1st, ..., 59th               | 5     |
   * |                                 |     | ss      | 00, 01, ..., 59                   |       |
   * | Seconds timestamp               |  40 | t       | 512969520                         |       |
   * |                                 |     | tt      | ...                               | 2     |
   * | Fraction of second              |  30 | S       | 0, 1, ..., 9                      |       |
   * |                                 |     | SS      | 00, 01, ..., 99                   |       |
   * |                                 |     | SSS     | 000, 001, ..., 999                |       |
   * |                                 |     | SSSS    | ...                               | 2     |
   * | Milliseconds timestamp          |  20 | T       | 512969520900                      |       |
   * |                                 |     | TT      | ...                               | 2     |
   * | Timezone (ISO-8601 w/ Z)        |  10 | X       | -08, +0530, Z                     |       |
   * |                                 |     | XX      | -0800, +0530, Z                   |       |
   * |                                 |     | XXX     | -08:00, +05:30, Z                 |       |
   * |                                 |     | XXXX    | -0800, +0530, Z, +123456          | 2     |
   * |                                 |     | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
   * | Timezone (ISO-8601 w/o Z)       |  10 | x       | -08, +0530, +00                   |       |
   * |                                 |     | xx      | -0800, +0530, +0000               |       |
   * |                                 |     | xxx     | -08:00, +05:30, +00:00            | 2     |
   * |                                 |     | xxxx    | -0800, +0530, +0000, +123456      |       |
   * |                                 |     | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
   * | Long localized date             |  NA | P       | 05/29/1453                        | 5,8   |
   * |                                 |     | PP      | May 29, 1453                      |       |
   * |                                 |     | PPP     | May 29th, 1453                    |       |
   * |                                 |     | PPPP    | Sunday, May 29th, 1453            | 2,5,8 |
   * | Long localized time             |  NA | p       | 12:00 AM                          | 5,8   |
   * |                                 |     | pp      | 12:00:00 AM                       |       |
   * | Combination of date and time    |  NA | Pp      | 05/29/1453, 12:00 AM              |       |
   * |                                 |     | PPpp    | May 29, 1453, 12:00:00 AM         |       |
   * |                                 |     | PPPpp   | May 29th, 1453 at ...             |       |
   * |                                 |     | PPPPpp  | Sunday, May 29th, 1453 at ...     | 2,5,8 |
   * Notes:
   * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
   *    are the same as "stand-alone" units, but are different in some languages.
   *    "Formatting" units are declined according to the rules of the language
   *    in the context of a date. "Stand-alone" units are always nominative singular.
   *    In `format` function, they will produce different result:
   *
   *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
   *
   *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
   *
   *    `parse` will try to match both formatting and stand-alone units interchangeably.
   *
   * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
   *    the single quote characters (see below).
   *    If the sequence is longer than listed in table:
   *    - for numerical units (`yyyyyyyy`) `parse` will try to match a number
   *      as wide as the sequence
   *    - for text units (`MMMMMMMM`) `parse` will try to match the widest variation of the unit.
   *      These variations are marked with "2" in the last column of the table.
   *
   * 3. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
   *    These tokens represent the shortest form of the quarter.
   *
   * 4. The main difference between `y` and `u` patterns are B.C. years:
   *
   *    | Year | `y` | `u` |
   *    |------|-----|-----|
   *    | AC 1 |   1 |   1 |
   *    | BC 1 |   1 |   0 |
   *    | BC 2 |   2 |  -1 |
   *
   *    Also `yy` will try to guess the century of two digit year by proximity with `referenceDate`:
   *
   *    `parse('50', 'yy', new Date(2018, 0, 1)) //=> Sat Jan 01 2050 00:00:00`
   *
   *    `parse('75', 'yy', new Date(2018, 0, 1)) //=> Wed Jan 01 1975 00:00:00`
   *
   *    while `uu` will just assign the year as is:
   *
   *    `parse('50', 'uu', new Date(2018, 0, 1)) //=> Sat Jan 01 0050 00:00:00`
   *
   *    `parse('75', 'uu', new Date(2018, 0, 1)) //=> Tue Jan 01 0075 00:00:00`
   *
   *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
   *    except local week-numbering years are dependent on `options.weekStartsOn`
   *    and `options.firstWeekContainsDate` (compare [setISOWeekYear](https://date-fns.org/docs/setISOWeekYear)
   *    and [setWeekYear](https://date-fns.org/docs/setWeekYear)).
   *
   * 5. These patterns are not in the Unicode Technical Standard #35:
   *    - `i`: ISO day of week
   *    - `I`: ISO week of year
   *    - `R`: ISO week-numbering year
   *    - `o`: ordinal number modifier
   *    - `P`: long localized date
   *    - `p`: long localized time
   *
   * 6. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
   *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * 7. `D` and `DD` tokens represent days of the year but they are often confused with days of the month.
   *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * 8. `P+` tokens do not have a defined priority since they are merely aliases to other tokens based
   *    on the given locale.
   *
   *    using `en-US` locale: `P` => `MM/dd/yyyy`
   *    using `en-US` locale: `p` => `hh:mm a`
   *    using `pt-BR` locale: `P` => `dd/MM/yyyy`
   *    using `pt-BR` locale: `p` => `HH:mm`
   *
   * Values will be assigned to the date in the descending order of its unit's priority.
   * Units of an equal priority overwrite each other in the order of appearance.
   *
   * If no values of higher priority are parsed (e.g. when parsing string 'January 1st' without a year),
   * the values will be taken from 3rd argument `referenceDate` which works as a context of parsing.
   *
   * `referenceDate` must be passed for correct work of the function.
   * If you're not sure which `referenceDate` to supply, create a new instance of Date:
   * `parse('02/11/2014', 'MM/dd/yyyy', new Date())`
   * In this case parsing will be done in the context of the current date.
   * If `referenceDate` is `Invalid Date` or a value not convertible to valid `Date`,
   * then `Invalid Date` will be returned.
   *
   * The result may vary by locale.
   *
   * If `formatString` matches with `dateString` but does not provides tokens, `referenceDate` will be returned.
   *
   * If parsing failed, `Invalid Date` will be returned.
   * Invalid Date is a Date, whose time value is NaN.
   * Time value of Date: http://es5.github.io/#x15.9.1.1
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param dateStr - The string to parse
   * @param formatStr - The string of tokens
   * @param referenceDate - defines values missing from the parsed dateString
   * @param options - An object with options.
   *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *   see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   *
   * @returns The parsed date
   *
   * @throws `options.locale` must contain `match` property
   * @throws use `yyyy` instead of `YYYY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws use `yy` instead of `YY` for formatting years using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws use `d` instead of `D` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws use `dd` instead of `DD` for formatting days of the month using [format provided] to the input [input provided]; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md
   * @throws format string contains an unescaped latin alphabet character
   *
   * @example
   * // Parse 11 February 2014 from middle-endian format:
   * var result = parse('02/11/2014', 'MM/dd/yyyy', new Date())
   * //=> Tue Feb 11 2014 00:00:00
   *
   * @example
   * // Parse 28th of February in Esperanto locale in the context of 2010 year:
   * import eo from 'date-fns/locale/eo'
   * var result = parse('28-a de februaro', "do 'de' MMMM", new Date(2010, 0, 1), {
   *   locale: eo
   * })
   * //=> Sun Feb 28 2010 00:00:00
   */
  function parse(dateStr, formatStr, referenceDate, options) {
    const invalidDate = () => constructFrom(options?.in || referenceDate, NaN);
    const defaultOptions = getDefaultOptions();
    const locale = options?.locale ?? defaultOptions.locale ?? enUS;

    const firstWeekContainsDate =
      options?.firstWeekContainsDate ??
      options?.locale?.options?.firstWeekContainsDate ??
      defaultOptions.firstWeekContainsDate ??
      defaultOptions.locale?.options?.firstWeekContainsDate ??
      1;

    const weekStartsOn =
      options?.weekStartsOn ??
      options?.locale?.options?.weekStartsOn ??
      defaultOptions.weekStartsOn ??
      defaultOptions.locale?.options?.weekStartsOn ??
      0;

    if (!formatStr)
      return dateStr ? invalidDate() : toDate(referenceDate, options?.in);

    const subFnOptions = {
      firstWeekContainsDate,
      weekStartsOn,
      locale,
    };

    // If timezone isn't specified, it will try to use the context or
    // the reference date and fallback to the system time zone.
    const setters = [new DateTimezoneSetter(options?.in, referenceDate)];

    const tokens = formatStr
      .match(longFormattingTokensRegExp)
      .map((substring) => {
        const firstCharacter = substring[0];
        if (firstCharacter in longFormatters) {
          const longFormatter = longFormatters[firstCharacter];
          return longFormatter(substring, locale.formatLong);
        }
        return substring;
      })
      .join("")
      .match(formattingTokensRegExp);

    const usedTokens = [];

    for (let token of tokens) {
      if (
        !options?.useAdditionalWeekYearTokens &&
        isProtectedWeekYearToken(token)
      ) {
        warnOrThrowProtectedError(token, formatStr, dateStr);
      }
      if (
        !options?.useAdditionalDayOfYearTokens &&
        isProtectedDayOfYearToken(token)
      ) {
        warnOrThrowProtectedError(token, formatStr, dateStr);
      }

      const firstCharacter = token[0];
      const parser = parsers[firstCharacter];
      if (parser) {
        const { incompatibleTokens } = parser;
        if (Array.isArray(incompatibleTokens)) {
          const incompatibleToken = usedTokens.find(
            (usedToken) =>
              incompatibleTokens.includes(usedToken.token) ||
              usedToken.token === firstCharacter,
          );
          if (incompatibleToken) {
            throw new RangeError(
              `The format string mustn't contain \`${incompatibleToken.fullToken}\` and \`${token}\` at the same time`,
            );
          }
        } else if (parser.incompatibleTokens === "*" && usedTokens.length > 0) {
          throw new RangeError(
            `The format string mustn't contain \`${token}\` and any other token at the same time`,
          );
        }

        usedTokens.push({ token: firstCharacter, fullToken: token });

        const parseResult = parser.run(
          dateStr,
          token,
          locale.match,
          subFnOptions,
        );

        if (!parseResult) {
          return invalidDate();
        }

        setters.push(parseResult.setter);

        dateStr = parseResult.rest;
      } else {
        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError(
            "Format string contains an unescaped latin alphabet character `" +
              firstCharacter +
              "`",
          );
        }

        // Replace two single quote characters with one single quote character
        if (token === "''") {
          token = "'";
        } else if (firstCharacter === "'") {
          token = cleanEscapedString(token);
        }

        // Cut token from string, or, if string doesn't match the token, return Invalid Date
        if (dateStr.indexOf(token) === 0) {
          dateStr = dateStr.slice(token.length);
        } else {
          return invalidDate();
        }
      }
    }

    // Check if the remaining input contains something other than whitespace
    if (dateStr.length > 0 && notWhitespaceRegExp.test(dateStr)) {
      return invalidDate();
    }

    const uniquePrioritySetters = setters
      .map((setter) => setter.priority)
      .sort((a, b) => b - a)
      .filter((priority, index, array) => array.indexOf(priority) === index)
      .map((priority) =>
        setters
          .filter((setter) => setter.priority === priority)
          .sort((a, b) => b.subPriority - a.subPriority),
      )
      .map((setterArray) => setterArray[0]);

    let date = toDate(referenceDate, options?.in);

    if (isNaN(+date)) return invalidDate();

    const flags = {};
    for (const setter of uniquePrioritySetters) {
      if (!setter.validate(date, subFnOptions)) {
        return invalidDate();
      }

      const result = setter.set(date, flags, subFnOptions);
      // Result is tuple (date, flags)
      if (Array.isArray(result)) {
        date = result[0];
        Object.assign(flags, result[1]);
        // Result is date
      } else {
        date = result;
      }
    }

    return date;
  }

  function cleanEscapedString(input) {
    return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
  }

  /**
   * The {@link isToday} function options.
   */

  /**
   * @name isToday
   * @category Day Helpers
   * @summary Is the given date today?
   * @pure false
   *
   * @description
   * Is the given date today?
   *
   * @param date - The date to check
   * @param options - An object with options
   *
   * @returns The date is today
   *
   * @example
   * // If today is 6 October 2014, is 6 October 14:00:00 today?
   * const result = isToday(new Date(2014, 9, 6, 14, 0))
   * //=> true
   */
  function isToday(date, options) {
    return isSameDay(
      constructFrom(options?.in || date, date),
      constructNow(options?.in || date),
    );
  }

  /**
   * The {@link isWithinInterval} function options.
   */

  /**
   * @name isWithinInterval
   * @category Interval Helpers
   * @summary Is the given date within the interval?
   *
   * @description
   * Is the given date within the interval? (Including start and end.)
   *
   * @param date - The date to check
   * @param interval - The interval to check
   * @param options - An object with options
   *
   * @returns The date is within the interval
   *
   * @example
   * // For the date within the interval:
   * isWithinInterval(new Date(2014, 0, 3), {
   *   start: new Date(2014, 0, 1),
   *   end: new Date(2014, 0, 7)
   * })
   * // => true
   *
   * @example
   * // For the date outside of the interval:
   * isWithinInterval(new Date(2014, 0, 10), {
   *   start: new Date(2014, 0, 1),
   *   end: new Date(2014, 0, 7)
   * })
   * // => false
   *
   * @example
   * // For date equal to the interval start:
   * isWithinInterval(date, { start, end: date })
   * // => true
   *
   * @example
   * // For date equal to the interval end:
   * isWithinInterval(date, { start: date, end })
   * // => true
   */
  function isWithinInterval(date, interval, options) {
    const time = +toDate(date, options?.in);
    const [startTime, endTime] = [
      +toDate(interval.start, options?.in),
      +toDate(interval.end, options?.in),
    ].sort((a, b) => a - b);

    return time >= startTime && time <= endTime;
  }

  /**
   * The {@link subDays} function options.
   */

  /**
   * @name subDays
   * @category Day Helpers
   * @summary Subtract the specified number of days from the given date.
   *
   * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
   * @typeParam ResultDate - The result `Date` type, it is the type returned from the context function if it is passed, or inferred from the arguments.
   *
   * @param date - The date to be changed
   * @param amount - The amount of days to be subtracted.
   * @param options - An object with options
   *
   * @returns The new date with the days subtracted
   *
   * @example
   * // Subtract 10 days from 1 September 2014:
   * const result = subDays(new Date(2014, 8, 1), 10)
   * //=> Fri Aug 22 2014 00:00:00
   */
  function subDays(date, amount, options) {
    return addDays(date, -amount, options);
  }

  const formatDistanceLocale = {
    lessThanXSeconds: {
      one: "moins d’une seconde",
      other: "moins de {{count}} secondes",
    },

    xSeconds: {
      one: "1 seconde",
      other: "{{count}} secondes",
    },

    halfAMinute: "30 secondes",

    lessThanXMinutes: {
      one: "moins d’une minute",
      other: "moins de {{count}} minutes",
    },

    xMinutes: {
      one: "1 minute",
      other: "{{count}} minutes",
    },

    aboutXHours: {
      one: "environ 1 heure",
      other: "environ {{count}} heures",
    },

    xHours: {
      one: "1 heure",
      other: "{{count}} heures",
    },

    xDays: {
      one: "1 jour",
      other: "{{count}} jours",
    },

    aboutXWeeks: {
      one: "environ 1 semaine",
      other: "environ {{count}} semaines",
    },

    xWeeks: {
      one: "1 semaine",
      other: "{{count}} semaines",
    },

    aboutXMonths: {
      one: "environ 1 mois",
      other: "environ {{count}} mois",
    },

    xMonths: {
      one: "1 mois",
      other: "{{count}} mois",
    },

    aboutXYears: {
      one: "environ 1 an",
      other: "environ {{count}} ans",
    },

    xYears: {
      one: "1 an",
      other: "{{count}} ans",
    },

    overXYears: {
      one: "plus d’un an",
      other: "plus de {{count}} ans",
    },

    almostXYears: {
      one: "presqu’un an",
      other: "presque {{count}} ans",
    },
  };

  const formatDistance = (token, count, options) => {
    let result;
    const form = formatDistanceLocale[token];
    if (typeof form === "string") {
      result = form;
    } else if (count === 1) {
      result = form.one;
    } else {
      result = form.other.replace("{{count}}", String(count));
    }

    if (options?.addSuffix) {
      if (options.comparison && options.comparison > 0) {
        return "dans " + result;
      } else {
        return "il y a " + result;
      }
    }

    return result;
  };

  const dateFormats = {
    full: "EEEE d MMMM y",
    long: "d MMMM y",
    medium: "d MMM y",
    short: "dd/MM/y",
  };

  const timeFormats = {
    full: "HH:mm:ss zzzz",
    long: "HH:mm:ss z",
    medium: "HH:mm:ss",
    short: "HH:mm",
  };

  const dateTimeFormats = {
    full: "{{date}} 'à' {{time}}",
    long: "{{date}} 'à' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}",
  };

  const formatLong = {
    date: buildFormatLongFn({
      formats: dateFormats,
      defaultWidth: "full",
    }),

    time: buildFormatLongFn({
      formats: timeFormats,
      defaultWidth: "full",
    }),

    dateTime: buildFormatLongFn({
      formats: dateTimeFormats,
      defaultWidth: "full",
    }),
  };

  const formatRelativeLocale = {
    lastWeek: "eeee 'dernier à' p",
    yesterday: "'hier à' p",
    today: "'aujourd’hui à' p",
    tomorrow: "'demain à' p'",
    nextWeek: "eeee 'prochain à' p",
    other: "P",
  };

  const formatRelative = (token, _date, _baseDate, _options) =>
    formatRelativeLocale[token];

  const eraValues = {
    narrow: ["av. J.-C", "ap. J.-C"],
    abbreviated: ["av. J.-C", "ap. J.-C"],
    wide: ["avant Jésus-Christ", "après Jésus-Christ"],
  };

  const quarterValues = {
    narrow: ["T1", "T2", "T3", "T4"],
    abbreviated: ["1er trim.", "2ème trim.", "3ème trim.", "4ème trim."],
    wide: ["1er trimestre", "2ème trimestre", "3ème trimestre", "4ème trimestre"],
  };

  const monthValues = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "janv.",
      "févr.",
      "mars",
      "avr.",
      "mai",
      "juin",
      "juil.",
      "août",
      "sept.",
      "oct.",
      "nov.",
      "déc.",
    ],

    wide: [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ],
  };

  const dayValues = {
    narrow: ["D", "L", "M", "M", "J", "V", "S"],
    short: ["di", "lu", "ma", "me", "je", "ve", "sa"],
    abbreviated: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],

    wide: [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
    ],
  };

  const dayPeriodValues = {
    narrow: {
      am: "AM",
      pm: "PM",
      midnight: "minuit",
      noon: "midi",
      morning: "mat.",
      afternoon: "ap.m.",
      evening: "soir",
      night: "mat.",
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "minuit",
      noon: "midi",
      morning: "matin",
      afternoon: "après-midi",
      evening: "soir",
      night: "matin",
    },
    wide: {
      am: "AM",
      pm: "PM",
      midnight: "minuit",
      noon: "midi",
      morning: "du matin",
      afternoon: "de l’après-midi",
      evening: "du soir",
      night: "du matin",
    },
  };

  const ordinalNumber = (dirtyNumber, options) => {
    const number = Number(dirtyNumber);
    const unit = options?.unit;

    if (number === 0) return "0";

    const feminineUnits = ["year", "week", "hour", "minute", "second"];
    let suffix;

    if (number === 1) {
      suffix = unit && feminineUnits.includes(unit) ? "ère" : "er";
    } else {
      suffix = "ème";
    }

    return number + suffix;
  };

  const LONG_MONTHS_TOKENS = ["MMM", "MMMM"];

  const localize = {
    preprocessor: (date, parts) => {
      // Replaces the `do` tokens with `d` when used with long month tokens and the day of the month is greater than one.
      // Use case "do MMMM" => 1er août, 29 août
      // see https://github.com/date-fns/date-fns/issues/1391

      if (date.getDate() === 1) return parts;

      const hasLongMonthToken = parts.some(
        (part) => part.isToken && LONG_MONTHS_TOKENS.includes(part.value),
      );

      if (!hasLongMonthToken) return parts;

      return parts.map((part) =>
        part.isToken && part.value === "do"
          ? { isToken: true, value: "d" }
          : part,
      );
    },

    ordinalNumber,

    era: buildLocalizeFn({
      values: eraValues,
      defaultWidth: "wide",
    }),

    quarter: buildLocalizeFn({
      values: quarterValues,
      defaultWidth: "wide",
      argumentCallback: (quarter) => quarter - 1,
    }),

    month: buildLocalizeFn({
      values: monthValues,
      defaultWidth: "wide",
    }),

    day: buildLocalizeFn({
      values: dayValues,
      defaultWidth: "wide",
    }),

    dayPeriod: buildLocalizeFn({
      values: dayPeriodValues,
      defaultWidth: "wide",
    }),
  };

  const matchOrdinalNumberPattern = /^(\d+)(ième|ère|ème|er|e)?/i;
  const parseOrdinalNumberPattern = /\d+/i;

  const matchEraPatterns = {
    narrow: /^(av\.J\.C|ap\.J\.C|ap\.J\.-C)/i,
    abbreviated: /^(av\.J\.-C|av\.J-C|apr\.J\.-C|apr\.J-C|ap\.J-C)/i,
    wide: /^(avant Jésus-Christ|après Jésus-Christ)/i,
  };
  const parseEraPatterns = {
    any: [/^av/i, /^ap/i],
  };

  const matchQuarterPatterns = {
    narrow: /^T?[1234]/i,
    abbreviated: /^[1234](er|ème|e)? trim\.?/i,
    wide: /^[1234](er|ème|e)? trimestre/i,
  };
  const parseQuarterPatterns = {
    any: [/1/i, /2/i, /3/i, /4/i],
  };

  const matchMonthPatterns = {
    narrow: /^[jfmasond]/i,
    abbreviated:
      /^(janv|févr|mars|avr|mai|juin|juill|juil|août|sept|oct|nov|déc)\.?/i,
    wide: /^(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i,
  };
  const parseMonthPatterns = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],

    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^av/i,
      /^ma/i,
      /^juin/i,
      /^juil/i,
      /^ao/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i,
    ],
  };

  const matchDayPatterns = {
    narrow: /^[lmjvsd]/i,
    short: /^(di|lu|ma|me|je|ve|sa)/i,
    abbreviated: /^(dim|lun|mar|mer|jeu|ven|sam)\.?/i,
    wide: /^(dimanche|lundi|mardi|mercredi|jeudi|vendredi|samedi)/i,
  };
  const parseDayPatterns = {
    narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^j/i, /^v/i, /^s/i],
    any: [/^di/i, /^lu/i, /^ma/i, /^me/i, /^je/i, /^ve/i, /^sa/i],
  };

  const matchDayPeriodPatterns = {
    narrow: /^(a|p|minuit|midi|mat\.?|ap\.?m\.?|soir|nuit)/i,
    any: /^([ap]\.?\s?m\.?|du matin|de l'après[-\s]midi|du soir|de la nuit)/i,
  };
  const parseDayPeriodPatterns = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^min/i,
      noon: /^mid/i,
      morning: /mat/i,
      afternoon: /ap/i,
      evening: /soir/i,
      night: /nuit/i,
    },
  };

  const match = {
    ordinalNumber: buildMatchPatternFn({
      matchPattern: matchOrdinalNumberPattern,
      parsePattern: parseOrdinalNumberPattern,
      valueCallback: (value) => parseInt(value),
    }),

    era: buildMatchFn({
      matchPatterns: matchEraPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseEraPatterns,
      defaultParseWidth: "any",
    }),

    quarter: buildMatchFn({
      matchPatterns: matchQuarterPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseQuarterPatterns,
      defaultParseWidth: "any",
      valueCallback: (index) => index + 1,
    }),

    month: buildMatchFn({
      matchPatterns: matchMonthPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseMonthPatterns,
      defaultParseWidth: "any",
    }),

    day: buildMatchFn({
      matchPatterns: matchDayPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseDayPatterns,
      defaultParseWidth: "any",
    }),

    dayPeriod: buildMatchFn({
      matchPatterns: matchDayPeriodPatterns,
      defaultMatchWidth: "any",
      parsePatterns: parseDayPeriodPatterns,
      defaultParseWidth: "any",
    }),
  };

  /**
   * @category Locales
   * @summary French locale.
   * @language French
   * @iso-639-2 fra
   * @author Jean Dupouy [@izeau](https://github.com/izeau)
   * @author François B [@fbonzon](https://github.com/fbonzon)
   */
  const fr = {
    code: "fr",
    formatDistance: formatDistance,
    formatLong: formatLong,
    formatRelative: formatRelative,
    localize: localize,
    match: match,
    options: {
      weekStartsOn: 1 /* Monday */,
      firstWeekContainsDate: 4,
    },
  };

  /**
   * Affiche une date formatée qui peut être mise à jour dynamiquement.
   *
   * /!\ Seuls les formats de date supportés par date-fns sont utilisables et seules les locales `fr` et `en` sont supportées.
   *
   * @structure Date simple
   * <bnum-date format="P">1997-08-12</bnum-date>
   *
   * @structure Date avec parsing personnalisé
   * <bnum-date format="PPPP" data-start-format="dd/MM/yyyy">12/08/1997</bnum-date>
   *
   * @structure Date avec attribut data-date
   * <bnum-date format="P" data-date="1997-08-12T15:30:00Z"></bnum-date>
   *
   * @structure Date en anglais
   * <bnum-date format="PPPP" locale="en">1997-08-12</bnum-date>
   *
   * @state invalid - Actif quand la date est invalide ou non définie
   * @state not-ready - Actif quand le composant n'est pas encore prêt
   */
  class HTMLBnumDate extends BnumElementInternal {
      /**
       * Attribut format
       * @attr {string} (optional) (default: 'P') format - Le format de sortie selon date-fns
       */
      static ATTRIBUTE_FORMAT = 'format';
      /**
       * Attribut locale
       * @attr {string} (optional) (default: 'fr') locale - La locale pour le formatage
       */
      static ATTRIBUTE_LOCALE = 'locale';
      /**
       * Attribut date
       * @attr {string | undefined} (optional) data-date - La date source (prioritaire sur le textContent)
       */
      static ATTRIBUTE_DATE = 'data-date';
      /**
       * Attribut start-format
       * @attr {string | undefined} (optional) data-start-format - Le format de parsing si la date source est une chaîne
       */
      static ATTRIBUTE_START_FORMAT = 'data-start-format';
      /**
       * Événement déclenché lors de la mise à jour d'un attribut
       * @event bnum-date:attribute-updated
       * @detail { property: string; newValue: string | null; oldValue: string | null }
       */
      static EVENT_ATTRIBUTE_UPDATED = 'bnum-date:attribute-updated';
      /**
       * Événement déclenché lors de la mise à jour du format de la date
       * @event bnum-date:attribute-updated:format
       * @detail { property: string; newValue: string | null; oldValue: string | null }
       */
      static EVENT_ATTRIBUTE_UPDATED_FORMAT = 'bnum-date:attribute-updated:format';
      /**
       * Événement déclenché lors de la mise à jour de la locale
       * @event bnum-date:attribute-updated:locale
       * @detail { property: string; newValue: string | null; oldValue: string | null }
       */
      static EVENT_ATTRIBUTE_UPDATED_LOCALE = 'bnum-date:attribute-updated:locale';
      /**
       * Événement déclenché lors de la mise à jour de la date
       * @event bnum-date:date
       * @detail { property: string; newValue: Date | null; oldValue: Date | null }
       */
      static EVENT_DATE = 'bnum-date:date';
      /** Valeur par défaut du format */
      static DEFAULT_FORMAT = 'P';
      /** Valeur par défaut de la locale */
      static DEFAULT_LOCALE = 'fr';
      /**
       * État invalide
       */
      static STATE_INVALID = 'invalid';
      /** État non prêt */
      static STATE_NOT_READY = 'not-ready';
      /** Nom de la balise */
      static get TAG() {
          return TAG_DATE;
      }
      /**
       * Registre statique des locales date-fns supportées.
       * On importe 'enUS' pour 'en' pour être standard.
       */
      static #LOCALES = {
          fr: fr,
          en: enUS,
      };
      /** Attributs observés pour la mise à jour. */
      static _p_observedAttributes() {
          return [HTMLBnumDate.ATTRIBUTE_FORMAT, HTMLBnumDate.ATTRIBUTE_LOCALE];
      }
      // --- Champs privés (état interne) ---
      /** L'objet Date (notre source de vérité) */
      #originalDate = null;
      /** Le format d'affichage (ex: 'PPPP') */
      #outputFormat = HTMLBnumDate.DEFAULT_FORMAT; // 'P' -> 12/08/1997
      /** La locale (code) */
      #locale = HTMLBnumDate.DEFAULT_LOCALE;
      /** Le format de parsing (ex: 'dd/MM/yyyy') */
      #startFormat = null;
      /** L'élément SPAN interne qui contient le texte formaté */
      #outputElement = null;
      #_renderSheduled = false;
      /**
       * Événement circulaire déclenché lors du formatage de la date.
       * Permet de personnaliser le formatage via un listener externe.
       */
      formatEvent = new eventExports.JsCircularEvent();
      /**
       * Indique que ce composant utilise le Shadow DOM.
       * @returns {boolean}
       */
      _p_isShadowElement() {
          return true;
      }
      /**
       * Construit le DOM interne (appelé une seule fois).
       * @param container Le ShadowRoot
       */
      _p_buildDOM(container) {
          this.#outputElement = document.createElement('span');
          this.#outputElement.setAttribute('part', 'date-text'); // Permet de styler depuis l'extérieur
          container.append(this.#outputElement);
      }
      /**
       * Phase de pré-chargement (avant _p_buildDOM).
       * On lit les attributs initiaux et le textContent.
       */
      _p_preload() {
          // On ajoute un listener sur `bnum-date:attribute-updated` pour trigger les propriété de manière + précises.
          this.addEventListener(HTMLBnumDate.EVENT_ATTRIBUTE_UPDATED, (e) => {
              this.trigger(`${HTMLBnumDate.EVENT_ATTRIBUTE_UPDATED}:${e.detail.property}`, e.detail);
          });
          // Lire les attributs de configuration
          this.#outputFormat =
              this.getAttribute(HTMLBnumDate.ATTRIBUTE_FORMAT) || this.#outputFormat;
          this.#locale =
              this.getAttribute(HTMLBnumDate.ATTRIBUTE_LOCALE) || this.#locale;
          this.#startFormat =
              this.getAttribute(HTMLBnumDate.ATTRIBUTE_START_FORMAT) || null;
          // Déterminer la date initiale (priorité à data-date)
          const initialDateStr = this.getAttribute(HTMLBnumDate.ATTRIBUTE_DATE) ||
              this.textContent?.trim() ||
              null;
          // Définir la date sans déclencher de rendu (render=false)
          if (initialDateStr)
              this.setDate(initialDateStr, this.#startFormat, false);
      }
      /**
       * Phase d'attachement (après _p_buildDOM).
       * C'est ici qu'on fait le premier rendu.
       */
      _p_attach() {
          this.#renderDate();
      }
      /**
       * Gère les changements d'attributs (appelé après _p_preload).
       */
      _p_update(name, oldVal, newVal) {
          if (oldVal === newVal)
              return;
          let needsRender = false;
          switch (name) {
              case HTMLBnumDate.ATTRIBUTE_FORMAT:
                  this.#outputFormat = newVal || HTMLBnumDate.DEFAULT_FORMAT;
                  needsRender = true;
                  break;
              case HTMLBnumDate.ATTRIBUTE_LOCALE:
                  this.#locale = newVal || HTMLBnumDate.DEFAULT_LOCALE;
                  needsRender = true;
                  break;
              case HTMLBnumDate.ATTRIBUTE_START_FORMAT:
                  this.#startFormat = newVal;
                  // Pas de re-rendu, affecte seulement le prochain setDate()
                  break;
              case HTMLBnumDate.ATTRIBUTE_DATE:
                  // Re-parse la date
                  this.setDate(newVal, this.#startFormat, false);
                  needsRender = true;
                  break;
          }
          if (needsRender) {
              this.#renderDate();
              // On déclenche l'événement pour la réactivité
              this.trigger(HTMLBnumDate.EVENT_ATTRIBUTE_UPDATED, {
                  property: name,
                  newValue: newVal,
                  oldValue: oldVal,
              });
          }
      }
      // --- API Publique (Propriétés) ---
      /**
       * Définit ou obtient l'objet Date.
       * C'est le point d'entrée principal pour JS.
       */
      get date() {
          return this.#originalDate;
      }
      set date(value) {
          this.setDate(value, this.#startFormat, true);
      }
      /** Définit ou obtient le format d'affichage. */
      get format() {
          return this.#outputFormat;
      }
      set format(value) {
          this.setAttribute(HTMLBnumDate.ATTRIBUTE_FORMAT, value);
      }
      /** Définit ou obtient la locale. */
      get locale() {
          return this.#locale;
      }
      set locale(value) {
          this.setAttribute(HTMLBnumDate.ATTRIBUTE_LOCALE, value);
      }
      get localeElement() {
          return (this.constructor.#LOCALES[this.#locale] || fr);
      }
      // --- API Publique (Méthodes) ---
      /**
       * Définit la date à partir d'une chaîne, d'un objet Date ou null.
       * @param dateInput La date source.
       * @param startFormat Le format pour parser la date si c'est une chaîne.
       * @param triggerRender Indique s'il faut rafraîchir l'affichage (par défaut: true).
       */
      setDate(dateInput, startFormat, triggerRender = true) {
          const oldDate = this.#originalDate;
          let newDate = null;
          if (dateInput === null) {
              newDate = null;
          }
          else if (dateInput instanceof Date) {
              newDate = dateInput;
          }
          else if (typeof dateInput === 'string') {
              if (dateInput.trim() === 'now') {
                  newDate = new Date();
              }
              else {
                  const formatToUse = startFormat || this.#startFormat;
                  if (formatToUse) {
                      // Parsing avec format spécifique
                      newDate = parse(dateInput, formatToUse, new Date());
                  }
                  else {
                      // Parsing natif (ISO 8601, timestamps...)
                      newDate = new Date(dateInput);
                  }
              }
          }
          // Vérification de la validité
          if (newDate && isValid(newDate)) {
              this.#originalDate = newDate;
          }
          else {
              this.#originalDate = null;
          }
          // Déclenche le rendu et/ou l'événement si la date a changé
          if (oldDate?.getTime() !== this.#originalDate?.getTime()) {
              if (triggerRender) {
                  this.#renderDate();
              }
              this.trigger(HTMLBnumDate.EVENT_DATE, {
                  property: 'date',
                  newValue: this.#originalDate,
                  oldValue: oldDate,
              });
          }
      }
      /** Récupère l'objet Date actuel. */
      getDate() {
          return this.#originalDate;
      }
      /** Ajoute un nombre de jours à la date actuelle. */
      addDays(days) {
          if (!this.#originalDate)
              return;
          this.date = addDays(this.#originalDate, days);
      }
      /** Ajoute un nombre de mois à la date actuelle. */
      addMonths(months) {
          if (!this.#originalDate)
              return;
          this.date = addMonths(this.#originalDate, months);
      }
      /** Ajoute un nombre d'années à la date actuelle. */
      addYears(years) {
          if (!this.#originalDate)
              return;
          this.date = addYears(this.#originalDate, years);
      }
      askRender() {
          if (this.#_renderSheduled)
              return;
          this.#_renderSheduled = true;
          requestAnimationFrame(() => {
              this.#_renderSheduled = false;
              this.#renderDate();
          });
      }
      // --- Méthodes Privées ---
      /**
       * Met à jour le textContent du span interne.
       * C'est la seule fonction qui écrit dans le DOM.
       */
      #renderDate() {
          this._p_clearStates();
          if (!this.#outputElement) {
              this._p_addState(HTMLBnumDate.STATE_NOT_READY);
              return; // Pas encore prêt
          }
          if (!this.#originalDate) {
              this.#outputElement.textContent = EMPTY_STRING; // Affiche une chaîne vide si date invalide/null
              this._p_addState(HTMLBnumDate.STATE_INVALID);
              return;
          }
          // Trouve la locale, avec fallback sur 'fr'
          const locale = this.localeElement;
          try {
              const formated = format(this.#originalDate, this.#outputFormat, {
                  locale,
              });
              this.#outputElement.textContent =
                  this.formatEvent.call({ date: this.#originalDate })?.date || formated;
              this.setAttribute('aria-label', this.#outputElement.textContent);
          }
          catch (e) {
              console.error(`###[bnum-date] Erreur de formatage date-fns. Format: "${this.#outputFormat}"`, e);
              this.#outputElement.textContent = 'Date invalide';
              this._p_addState(HTMLBnumDate.STATE_INVALID);
          }
          this.setAttribute('aria-label', this.#outputElement.textContent);
      }
      /**
       * Méthode statique pour la création (non implémentée ici,
       * mais suit le pattern de BnumElement).
       */
      static Create(dateInput, options) {
          const el = document.createElement(this.TAG);
          if (options?.format)
              el.format = options.format;
          if (options?.locale)
              el.locale = options.locale;
          if (options?.startFormat)
              el.setAttribute(HTMLBnumDate.ATTRIBUTE_START_FORMAT, options.startFormat);
          if (typeof dateInput === 'string')
              el.appendChild(document.createTextNode(dateInput));
          else if (dateInput)
              el.date = dateInput;
          return el;
      }
  }
  // Auto-définition du composant
  HTMLBnumDate.TryDefine();

  var css_248z$3 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{align-items:center;display:flex;justify-content:space-between}:host .sender{font-family:var(--bnum-font-family-primary);font-size:var(--bnum-font-size-m);font-weight:var(--bnum-card-item-mail-font-weight-bold,var(--bnum-font-weight-bold,bold));margin-bottom:var(--bnum-card-item-mail-margin-bottom,var(--bnum-space-s,10px));max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host .subject{font-family:var(--bnum-font-family-primary);font-size:var(--bnum-font-size-s);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host(:state(read)) .sender{font-weight:var(--bnum-card-item-mail-sender-read-font-weight,initial)}:host(:state(read)) .subject{font-style:var(--bnum-card-item-mail-subject-read-font-style,italic)}";

  const EVENT_DEFAULT = 'default';

  // --- Importe tes dépendances (date-fns, BnumCardItem, etc.) ---
  const SHEET$3 = HTMLBnumCardItem.ConstructCSSStyleSheet(css_248z$3);
  /**
   * Composant HTML personnalisé représentant un élément de carte mail.
   *
   * Permet d'afficher un sujet, un expéditeur et une date, avec possibilité d'override du contenu par défaut.
   *
   * Utilise des slots pour l'intégration dans le Shadow DOM et propose des méthodes pour forcer ou réinitialiser le contenu.
   *
   * Note: En passant par `data-date` ou `.updateDate()`, le format d'affichage de la date est ajusté selon la logique métier :
   * - Si la date est aujourd'hui, seule l'heure est affichée (HH:mm).
   * - Si la date est comprise entre hier et il y a 7 jours, le jour de la semaine et l'heure sont affichés (E - HH:mm).
   * - Sinon, le format par défaut de HTMLBnumDate est utilisé.
   *
   * @structure Item de carte mail
   * <bnum-card-item-mail data-date="now">
   * <span slot="subject">Sujet par défaut</span>
   * <span slot="sender">Expéditeur par défaut</span>
   * </bnum-card-item-mail>
   *
   * @structure Item de carte data
   * <bnum-card-item-mail data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
   * </bnum-card-item-mail>
   *
   * @structure Item de carte lue
   * <bnum-card-item-mail read data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
   * </bnum-card-item-mail>
   *
   * @state read - Actif quand le mail est marqué comme lu.
   *
   * @slot (default) - N'existe pas, si vous mettez du contenu en dehors des slots, ils ne seront pas affichés.
   * @slot sender - Contenu de l'expéditeur (texte ou HTML).
   * @slot subject - Contenu du sujet (texte ou HTML).
   * @slot date - Contenu de la date. /!\ Si vous passez par ce slot, la mécanique de formatage automatique de la date ne s'appliquera pas.
   */
  class HTMLBnumCardItemMail extends HTMLBnumCardItem {
      //#region Constants
      /**
       * Attribut data pour le sujet du mail.
       * @attr {string} (optional) data-subject - Sujet du mail.
       */
      static DATA_SUBJECT = 'subject';
      static ATTRIBUTE_DATA_SUBJECT = `data-${HTMLBnumCardItemMail.DATA_SUBJECT}`;
      /**
       * Attribut data pour la date du mail.
       * @attr {string} (optional) data-sender - Expéditeur du mail.
       */
      static DATA_SENDER = 'sender';
      static ATTRIBUTE_DATA_SENDER = `data-${HTMLBnumCardItemMail.DATA_SENDER}`;
      /**
       * Attribut data pour la date du mail.
       * @attr {string} (optional) data-date - Date du mail, optionnel, mais conseillé si vous voulez la logique de formatage automatique.
       */
      static DATA_DATE = 'date';
      static ATTRIBUTE_DATA_DATE = `data-${HTMLBnumCardItemMail.DATA_DATE}`;
      /**
       * Attribut pour marquer le mail comme lu.
       * @attr {boolean} (optional) read - Indique si le mail est lu.
       */
      static ATTRIBUTE_READ = 'read';
      /**
       * Événement déclenché lors du changement de l'expéditeur du mail.
       * @event bnum-card-item-mail:sender-changed
       * @detail { caller: HTMLBnumCardItemMail }
       */
      static EVENT_SENDER_CHANGED = 'bnum-card-item-mail:sender-changed';
      /**
       * Événement déclenché lors du changement du sujet du mail.
       * @event bnum-card-item-mail:subject-changed
       * @detail { caller: HTMLBnumCardItemMail }
       */
      static EVENT_SUBJECT_CHANGED = 'bnum-card-item-mail:subject-changed';
      /**
       * Événement déclenché lors du changement de la date du mail.
       * @event bnum-card-item-mail:date-changed
       * @detail { caller: HTMLBnumCardItemMail }
       */
      static EVENT_DATE_CHANGED = 'bnum-card-item-mail:date-changed';
      /**
       * Nom du slot pour l'expéditeur.
       */
      static SLOT_SENDER_NAME = 'sender';
      /**
       * Nom du slot pour le sujet.
       */
      static SLOT_SUBJECT_NAME = 'subject';
      /**
       * Nom du slot pour la date.
       */
      static SLOT_DATE_NAME = 'date';
      /**
       * Nom de la part pour override de l'expéditeur.
       */
      static PART_SENDER_OVERRIDE = 'sender-override';
      /**
       * Nom de la part pour override du sujet.
       */
      static PART_SUBJECT_OVERRIDE = 'subject-override';
      /**
       * Nom de la part pour override de la date.
       */
      static PART_DATE_OVERRIDE = 'date-override';
      /**
       * Classe CSS pour l'expéditeur.
       */
      static CLASS_SENDER = 'sender';
      /**
       * Classe CSS pour le sujet.
       */
      static CLASS_SUBJECT = 'subject';
      /**
       * Classe CSS pour la date.
       */
      static CLASS_DATE = 'date';
      /**
       * Classe CSS pour le contenu principal.
       */
      static CLASS_MAIN_CONTENT = 'main-content';
      static ID_DATE_ELEMENT_OVERRIDE = 'date-element-override';
      static ID_SENDER_SLOT = 'senderslot';
      static ID_SUBJECT_SLOT = 'subjectslot';
      static ID_DATE_SLOT = 'dateslot';
      /**
       * Nom de l'état "lu".
       */
      static STATE_READ = 'read';
      /**
       * Format d'affichage de la date pour aujourd'hui.
       */
      static TODAY_FORMAT = 'HH:mm';
      /**
       * Format d'affichage de la date pour les autres jours.
       */
      static OTHER_DAY_FORMAT = 'dd/MM/yyyy';
      /**
       * Format d'affichage de la date pour la semaine.
       */
      static WEEK_FORMAT = 'E - HH:mm';
      static SYMBOL_RESET = Symbol('reset');
      //#endregion
      //#region Private fields
      // --- Slots du Shadow DOM ---
      /**
       * Slot pour la date dans le Shadow DOM.
       */
      #_slot_date = null;
      /**
       * Slot pour l'expéditeur dans le Shadow DOM.
       */
      #_slot_sender = null;
      // --- Conteneurs d'OVERRIDE (cachés par défaut) ---
      /**
       * Élément pour override de l'expéditeur.
       */
      #_override_sender = null;
      /**
       * Élément pour override du sujet.
       */
      #_override_subject = null;
      /**
       * Élément pour override de la date.
       */
      #_override_date = null;
      /**
       * Élément HTMLBnumDate utilisé pour override la date.
       */
      #_dateOverrideElement = null;
      /**
       * Scheduler pour la mise à jour du sujet.
       */
      #_subjectScheduler = null;
      /**
       * Scheduler pour la mise à jour de la date.
       */
      #_dateScheduler = null;
      #_defaultDate = null;
      /**
       * Scheduler pour la mise à jour de l'expéditeur.
       */
      #_senderScheduler = null;
      //#endregion Private fields
      //#region Public fields
      /**
       * Événement déclenché lors du changement du sujet du mail.
       * Permet d'attacher des gestionnaires personnalisés au changement de sujet.
       */
      onsubjectchanged = new JsEvent();
      /**
       * Événement déclenché lors du changement de l'expéditeur du mail.
       * Permet d'attacher des gestionnaires personnalisés au changement d'expéditeur.
       */
      onsenderchanged = new JsEvent();
      /**
       * Événement déclenché lors du changement de la date du mail.
       * Permet d'attacher des gestionnaires personnalisés au changement de date.
       */
      ondatechanged = new JsEvent();
      //#endregion Public fields
      //#region Getters
      /**
       * Retourne l'élément HTMLBnumDate pour l'override de la date.
       *
       * Initialise la variable si elle n'a pas encore été initialisée.
       */
      get #_lazyDateOverrideElement() {
          return (this.#_dateOverrideElement ??= (() => {
              const tmp = this.#_queryById(this.#_override_date, HTMLBnumCardItemMail.ID_DATE_ELEMENT_OVERRIDE);
              this.#_configureDateElement(tmp);
              return tmp;
          })());
      }
      // --- Getters pour lire les data-attributs ---
      /**
       * Retourne la date du mail, en tenant compte de l'override si présent.
       */
      get date() {
          return this.#_override_date?.hidden === false
              ? this.#_lazyDateOverrideElement.getDate()
              : (this.#_defaultDate?.getDate?.() ?? new Date());
      }
      /**
       * Retourne le sujet du mail depuis l'attribut data.
       */
      get #_mailSubject() {
          return this.data(HTMLBnumCardItemMail.DATA_SUBJECT) || EMPTY_STRING;
      }
      /**
       * Retourne la date du mail depuis l'attribut data.
       */
      get #_mailDate() {
          return this.data(HTMLBnumCardItemMail.DATA_DATE) || EMPTY_STRING;
      }
      /**
       * Retourne l'expéditeur du mail depuis l'attribut data.
       */
      get #_mailSender() {
          return this.data(HTMLBnumCardItemMail.DATA_SENDER) || EMPTY_STRING;
      }
      //#endregion Getters
      //#region Lifecycle
      /**
       * Constructeur du composant.
       */
      constructor() {
          super();
          this.onsenderchanged.add(EVENT_DEFAULT, (sender) => {
              this.trigger(HTMLBnumCardItemMail.EVENT_SENDER_CHANGED, {
                  caller: sender,
              });
          });
          this.onsubjectchanged.add(EVENT_DEFAULT, (sender) => {
              this.trigger(HTMLBnumCardItemMail.EVENT_SUBJECT_CHANGED, {
                  caller: sender,
              });
          });
          this.ondatechanged.add(EVENT_DEFAULT, (sender) => {
              this.trigger(HTMLBnumCardItemMail.EVENT_DATE_CHANGED, { caller: sender });
          });
      }
      /**
       * Crée le layout du Shadow DOM (avec slots ET overrides).
       * @param container Le conteneur du Shadow DOM ou un élément HTML.
       */
      _p_buildDOM(container) {
          super._p_buildDOM(container);
          // Hydratation
          this.#_slot_sender = this.#_queryById(container, HTMLBnumCardItemMail.ID_SENDER_SLOT);
          this.#_override_sender = this.#_queryByClass(container, HTMLBnumCardItemMail.PART_SENDER_OVERRIDE);
          // On écrase _p_slot car dans notre template, il n'y a pas de slot par défaut
          this._p_slot = this.#_queryById(container, HTMLBnumCardItemMail.ID_SUBJECT_SLOT);
          this.#_override_subject = this.#_queryByClass(container, HTMLBnumCardItemMail.PART_SUBJECT_OVERRIDE);
          this.#_slot_date = this.#_queryById(container, HTMLBnumCardItemMail.ID_DATE_SLOT);
          this.#_override_date = this.#_queryByClass(container, HTMLBnumCardItemMail.PART_DATE_OVERRIDE);
      }
      /**
       * Crée le contenu par défaut et l'attache aux slots.
       * Initialise les nœuds pour le sujedate-element-overridet, l'expéditeur et la date.
       */
      _p_attach() {
          super._p_attach();
          if (this.#_mailSubject !== EMPTY_STRING)
              this._p_slot.appendChild(this._p_createTextNode(this.#_mailSubject));
          // Crée le nœud texte pour l'EXPÉDITEUR par défaut
          if (this.#_mailSender !== EMPTY_STRING)
              this.#_slot_sender.appendChild(this._p_createTextNode(this.#_mailSender));
          if (this.#_mailDate !== EMPTY_STRING) {
              // Crée l'élément DATE par défaut
              const defaultDate = HTMLBnumDate.Create(this.#_mailDate);
              this.#_configureDateElement(defaultDate); // Applique la logique
              this.#_slot_date.appendChild(defaultDate);
              this.#_defaultDate = defaultDate;
          }
      }
      /**
       * Retourne les stylesheets à appliquer au composant.
       * @returns Liste des CSSStyleSheet à appliquer.
       */
      _p_getStylesheets() {
          return [...super._p_getStylesheets(), SHEET$3];
      }
      /**
       * Méthode appelée lors de la mise à jour d'un attribut observé.
       * @param name Nom de l'attribut.
       * @param oldVal Ancienne valeur.
       * @param newVal Nouvelle valeur.
       */
      _p_update(name, oldVal, newVal) {
          super._p_update(name, oldVal, newVal);
          if (this.hasAttribute(HTMLBnumCardItemMail.ATTRIBUTE_READ))
              this._p_addState(HTMLBnumCardItemMail.STATE_READ);
      }
      /**
       * Retourne le template HTML utilisé pour le composant.
       * @returns Le template HTML.
       */
      _p_fromTemplate() {
          return TEMPLATE$2;
      }
      //#endregion Lifecycle
      //#region Public methods
      /**
       * Force le contenu de l'expéditeur, en ignorant le slot.
       * @param content Contenu texte ou HTML à afficher comme expéditeur.
       * @returns L'instance courante pour chaînage.
       */
      updateSender(content) {
          return this.#_requestUpdateSender(content);
      }
      /**
       * Réaffiche le contenu du slot "sender" (annule l'override).
       * @returns L'instance courante pour chaînage.
       */
      resetSender() {
          return this.#_requestUpdateSender(HTMLBnumCardItemMail.SYMBOL_RESET);
      }
      /**
       * Force le contenu du sujet, en ignorant le slot.
       * @param content Contenu texte ou HTML à afficher comme sujet.
       * @returns L'instance courante pour chaînage.
       */
      updateSubject(content) {
          return this.#_requestUpdateSubject(content);
      }
      /**
       * Réaffiche le contenu du slot "subject" (annule l'override).
       * @returns L'instance courante pour chaînage.
       */
      resetSubject() {
          return this.#_requestUpdateSubject(HTMLBnumCardItemMail.SYMBOL_RESET);
      }
      /**
       * Force le contenu de la date, en ignorant le slot.
       * @param content Chaîne, Date ou élément HTML à afficher comme date.
       * @returns L'instance courante pour chaînage.
       */
      updateDate(content) {
          return this.#_requestUpdateDate(content);
      }
      /**
       * Réaffiche le contenu du slot "date" (annule l'override).
       * @returns L'instance courante pour chaînage.
       */
      resetDate() {
          return this.#_requestUpdateDate(HTMLBnumCardItemMail.SYMBOL_RESET);
      }
      //#endregion Public methods
      //#region Private methods
      /**
       * Met à jour l'affichage de l'expéditeur (slot ou override).
       * @param content Contenu à afficher ou symbole de reset.
       */
      #_updateSender(content) {
          if (!this.#_override_sender || !this.#_slot_sender)
              return;
          if (content === HTMLBnumCardItemMail.SYMBOL_RESET) {
              this.#_slot_sender.hidden = false;
              this.#_override_sender.hidden = true;
          }
          else {
              if (typeof content === 'string')
                  this.#_override_sender.innerHTML = content;
              else
                  this.#_override_sender.replaceChildren(content);
              // On cache le slot, on montre l'override
              this.#_slot_sender.hidden = true;
              this.#_override_sender.hidden = false;
          }
          this.onsenderchanged.call(this);
      }
      /**
       * Planifie la mise à jour de l'expéditeur.
       * @param content Contenu à afficher ou symbole de reset.
       * @returns L'instance courante pour chaînage.
       */
      #_requestUpdateSender(content) {
          (this.#_senderScheduler ??= new Scheduler((value) => this.#_updateSender(value))).schedule(content);
          return this;
      }
      /**
       * Met à jour l'affichage du sujet (slot ou override).
       * @param content Contenu à afficher ou symbole de reset.
       */
      #_updateSubject(content) {
          if (!this.#_override_subject || !this._p_slot)
              return;
          if (content === HTMLBnumCardItemMail.SYMBOL_RESET) {
              this._p_slot.hidden = false;
              this.#_override_subject.hidden = true;
          }
          else if (typeof content === 'string')
              this.#_override_subject.innerHTML = content;
          else
              this.#_override_subject.replaceChildren(content);
          // On cache le slot, on montre l'override
          this._p_slot.hidden = true;
          this.#_override_subject.hidden = false;
          this.onsubjectchanged.call(this);
      }
      /**
       * Planifie la mise à jour du sujet.
       * @param content Contenu à afficher ou symbole de reset.
       * @returns L'instance courante pour chaînage.
       */
      #_requestUpdateSubject(content) {
          (this.#_subjectScheduler ??= new Scheduler((value) => this.#_updateSubject(value))).schedule(content);
          return this;
      }
      /**
       * Met à jour l'affichage de la date (slot ou override).
       * @param content Contenu à afficher ou symbole de reset.
       */
      #_updateDate(content) {
          if (!this.#_override_date || !this.#_slot_date)
              return;
          if (content === HTMLBnumCardItemMail.SYMBOL_RESET) {
              this.#_slot_date.hidden = false;
              this.#_override_date.hidden = true;
          }
          else {
              if (typeof content === 'string' || content instanceof Date)
                  this.#_lazyDateOverrideElement.setDate(content);
              else
                  this.#_lazyDateOverrideElement.setDate(content.getDate());
              this.#_slot_date.hidden = true;
              this.#_override_date.hidden = false;
          }
          this.ondatechanged.call(this);
      }
      /**
       * Planifie la mise à jour de la date.
       * @param content Contenu à afficher ou symbole de reset.
       * @returns L'instance courante pour chaînage.
       */
      #_requestUpdateDate(content) {
          (this.#_dateScheduler ??= new Scheduler((value) => this.#_updateDate(value))).schedule(content);
          return this;
      }
      /**
       * Recherche un élément par son id dans le container donné.
       * @param container Container dans lequel chercher.
       * @param id Id de l'élément.
       * @returns L'élément trouvé.
       */
      #_queryById(container, id) {
          return container instanceof ShadowRoot
              ? container.getElementById(id)
              : container.querySelector(`#${id}`);
      }
      /**
       * Recherche un élément par sa classe dans le container donné.
       * @param container Container dans lequel chercher.
       * @param className Classe de l'élément.
       * @returns L'élément trouvé.
       */
      #_queryByClass(container, className) {
          return container instanceof ShadowRoot
              ? container.querySelector(`.${className}`)
              : container.getElementsByClassName(className)?.[0];
      }
      /**
       * Configure le format d'affichage de la date selon la logique métier :
       * - Affiche l'heure si la date est aujourd'hui.
       * - Affiche le jour et l'heure si la date est comprise entre hier et il y a 7 jours.
       * - Sinon, conserve le format par défaut.
       * @param element Instance de HTMLBnumDate à configurer.
       */
      #_configureDateElement(element) {
          HTMLBnumCardItemMail.SetDateLogique(element);
      }
      //#endregion Private methods
      //#region Static methods
      /**
       * Applique la logique de formatage de date à un élément HTMLBnumDate.
       * @param element Élément HTMLBnumDate à configurer.
       */
      static SetDateLogique(element) {
          element.formatEvent.add(EVENT_DEFAULT, (param) => {
              const originalDate = element.getDate();
              if (!originalDate)
                  return param;
              if (isToday(originalDate)) {
                  return {
                      date: format(originalDate, HTMLBnumCardItemMail.TODAY_FORMAT),
                  };
              }
              const now = new Date();
              const startOfInterval = startOfDay(subDays(now, 7));
              const endOfInterval = endOfDay(subDays(now, 1));
              if (isWithinInterval(originalDate, {
                  start: startOfInterval,
                  end: endOfInterval,
              })) {
                  return {
                      date: format(originalDate, HTMLBnumCardItemMail.WEEK_FORMAT, {
                          locale: element.localeElement,
                      }),
                  };
              }
              return {
                  date: format(originalDate, HTMLBnumCardItemMail.OTHER_DAY_FORMAT, {
                      locale: element.localeElement,
                  }), // Format par défaut si aucune condition n'est remplie
              };
          });
      }
      static _p_observedAttributes() {
          return [
              ...super._p_observedAttributes(),
              HTMLBnumCardItemMail.ATTRIBUTE_READ,
          ];
      }
      /**
       * Crée une nouvelle instance du composant avec les valeurs fournies.
       * @param subject Sujet du mail.
       * @param sender Expéditeur du mail.
       * @param date Date du mail
       * @returns Instance HTMLBnumCardItemMail.
       */
      static Create(subject, sender, date) {
          let node = document.createElement(HTMLBnumCardItemMail.TAG);
          node.attr(HTMLBnumCardItemMail.ATTRIBUTE_DATA_SUBJECT, subject);
          node.attr(HTMLBnumCardItemMail.ATTRIBUTE_DATA_SENDER, sender);
          if (typeof date === 'string')
              node.attr(HTMLBnumCardItemMail.ATTRIBUTE_DATA_DATE, date);
          else
              node.attr(HTMLBnumCardItemMail.ATTRIBUTE_DATA_DATE, date.toISOString());
          return node;
      }
      /**
       * Retourne le tag HTML du composant.
       */
      static get TAG() {
          return TAG_CARD_ITEM_MAIL;
      }
  }
  const TEMPLATE$2 = HTMLBnumCardItem.CreateChildTemplate(`
  <div class="${HTMLBnumCardItemMail.CLASS_MAIN_CONTENT}">
    <div class="${HTMLBnumCardItemMail.CLASS_SENDER}">
      <slot id="${HTMLBnumCardItemMail.ID_SENDER_SLOT}" name="${HTMLBnumCardItemMail.SLOT_SENDER_NAME}"></slot>
      <span class="${HTMLBnumCardItemMail.PART_SENDER_OVERRIDE}" part="${HTMLBnumCardItemMail.PART_SENDER_OVERRIDE}" hidden></span>
    </div>
    <div class="${HTMLBnumCardItemMail.CLASS_SUBJECT}">
      <slot id="${HTMLBnumCardItemMail.ID_SUBJECT_SLOT}" name="${HTMLBnumCardItemMail.SLOT_SUBJECT_NAME}"></slot>
      <span class="${HTMLBnumCardItemMail.PART_SUBJECT_OVERRIDE}" part="${HTMLBnumCardItemMail.PART_SUBJECT_OVERRIDE}" hidden></span>
    </div>
  </div>
  <div class="${HTMLBnumCardItemMail.CLASS_DATE}">
    <slot id="${HTMLBnumCardItemMail.ID_DATE_SLOT}" name="${HTMLBnumCardItemMail.SLOT_DATE_NAME}"></slot>
    <span class="${HTMLBnumCardItemMail.PART_DATE_OVERRIDE}" part="${HTMLBnumCardItemMail.PART_DATE_OVERRIDE}" hidden>
      <${HTMLBnumDate.TAG} id="${HTMLBnumCardItemMail.ID_DATE_ELEMENT_OVERRIDE}"></${HTMLBnumDate.TAG}>
    </span>
  </div>
  `, { defaultSlot: false });
  //#region TryDefine
  HTMLBnumCardItemMail.TryDefine();
  //#endregion

  var css_248z$2 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.bold{font-weight:var(--bnum-card-item-agenda-date-bold,var(--bnum-font-weight-bold,bold))}.bold-500{font-weight:var(--bnum-card-item-agenda-date-bold-medium,var(--bnum-font-weight-medium,500))}:host{display:flex;flex-direction:column;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));position:relative}:host .bnum-card-item-agenda-horizontal{display:flex;flex-direction:row;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));justify-content:space-between}:host .bnum-card-item-agenda-vertical{display:flex;flex:1;flex-direction:column;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));min-width:0}:host .bnum-card-item-agenda-block{display:flex;flex:1;flex-direction:row;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));min-width:0}:host .bnum-card-item-agenda-hour{border-bottom:var(--bnum-card-item-agenda-date-border-bottom,none);border-left:var(--bnum-card-item-agenda-date-border-left,none);border-right:var(--bnum-card-item-agenda-date-border-right,var(--bnum-border-surface,solid 4px #000091));border-top:var(--bnum-card-item-agenda-date-border-top,none);display:flex;flex-direction:column;flex-shrink:0;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));padding:var(--bnum-card-item-agenda-padding-top-hour,0) var(--bnum-card-item-agenda-padding-right-hour,var(--bnum-space-s,10px)) var(--bnum-card-item-agenda-padding-bottom-hour,0) var(--bnum-card-item-agenda-padding-left-hour,0)}:host .bnum-card-item-agenda-location{font-size:var(--bnum-card-item-agenda-location-font-size,var(--bnum-font-size-xs,12px))}:host .bnum-card-item-agenda-location{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host .bnum-card-item-agenda-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host [hidden]{display:none}:host(:state(private)) .bnum-card-item-agenda-private-icon{position:absolute;right:var(--bnum-card-item-agenda-private-icon-right,10px);top:var(--bnum-card-item-agenda-private-icon-top,10px)}:host(:state(all-day)) .bnum-card-item-agenda-hour .bnum-card-item-agenda-all-day{margin-bottom:auto;margin-top:auto}:host(:state(mode-telework)){font-style:var(--bnum-card-item-agenda-telework-font-style,italic)}:host(:state(mode-telework)):before{bottom:var(--bnum-card-item-agenda-telework-icon-bottom,10px);content:var(--bnum-card-item-agenda-telework-icon-content,\"\\e88a\");font-family:var(--bnum-card-item-agenda-telework-icon-font-family,var(--bnum-icon-font-family,\"Material Symbols Outlined\"));font-size:var(--bnum-card-item-agenda-telework-icon-font-size,var(--bnum-font-size-xxl,24px));font-style:normal;position:absolute;right:var(--bnum-card-item-agenda-telework-icon-right,10px)}:host(:state(mode-telework):state(action)) .bnum-card-item-agenda-action{margin-right:var(--bnum-card-item-agenda-telework-action-margin-right,20px)}";

  const SHEET$2 = HTMLBnumCardItem.ConstructCSSStyleSheet(css_248z$2);
  /**
   * Item de carte agenda
   *
   * @structure Initalisation basique
   * <bnum-card-item-agenda
   *    data-date="2024-01-01"
   *    data-start-date="2024-01-01 08:00:00"
   *    data-end-date="2024-01-01 10:00:00"
   *    data-title="Réunion de projet"
   *    data-location="Salle de conférence">
   * </bnum-card-item-agenda>
   *
   * @structure Exemple avec des dates de départs et fin différentes du jour de base
   * <bnum-card-item-agenda
   *    data-date="2025-11-20"
   *    data-start-date="2025-10-20 09:40:00"
   *    data-end-date="2025-12-20 10:10:00"
   *    data-title="Réunion de projet"
   *    data-location="Salle de conférence">
   * </bnum-card-item-agenda>
   *
   * @structure Exemple de journée entière
   * <bnum-card-item-agenda all-day
   *    data-date="2025-11-21"
   *    data-title="Télétravail"
   *    data-location="A la maison">
   * </bnum-card-item-agenda>
   *
   *
   * @structure Exemple avec des slots
   * <bnum-card-item-agenda
   *    data-date="2025-11-20"
   *    data-start-date="2025-11-20 09:40:00"
   *    data-end-date="2025-11-20 10:10:00">
   *   <span slot="title">Réunion de projet avec l'équipe marketing</span>
   *   <span slot="location">Salle de conférence, Bâtiment A</span>
   *   <bnum-primary-button slot="action" rounded data-icon='video_camera_front' data-icon-margin="0" onclick="alert('Action déclenchée !')"></bnum-primary-button>
   * </bnum-card-item-agenda>
   *
   * @structure Exemple de journée privée
   * <bnum-card-item-agenda all-day private
   *    data-date="2025-11-21"
   *    data-title="Télétravail"
   *    data-location="A la maison">
   * </bnum-card-item-agenda>
   *
   * @structure Exemple de journée avec un mode
   * <bnum-card-item-agenda all-day mode="telework"
   *    data-date="2025-11-21"
   *    data-title="Télétravail"
   *    data-location="A la maison">
   * </bnum-card-item-agenda>
   *
   * @slot title - Contenu du titre de l'événement
   * @slot location - Contenu du lieu de l'événement
   * @slot action - Contenu de l'action de l'événement (bouton etc...)
   *
   * @state no-location - Actif quand le lieu n'est pas défini
   * @state all-day - Actif quand l'événement dure toute la journée
   * @state private - Actif quand l'événement est privé
   * @state mode-X - Actif quand le mode de l'événement est défini à "X" (remplacer X par le mode)
   * @state action - Actif quand une action est définie pour l'événement
   *
   * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-gap - Contrôle l'espacement général entre les éléments du composant.
   * @cssvar {var(--bnum-font-weight-bold, 700)} --bnum-card-item-agenda-date-bold - Poids de police pour les textes en gras (date).
   * @cssvar {var(--bnum-font-weight-medium, 500)} --bnum-card-item-agenda-date-bold-medium - Poids de police medium pour certains textes.
   * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-padding-right-hour - Padding à droite de l'heure.
   * @cssvar {0} --bnum-card-item-agenda-padding-left-hour - Padding à gauche de l'heure.
   * @cssvar {0} --bnum-card-item-agenda-padding-top-hour - Padding en haut de l'heure.
   * @cssvar {0} --bnum-card-item-agenda-padding-bottom-hour - Padding en bas de l'heure.
   * @cssvar {var(--bnum-border-surface, 1px solid #E0E0E0)} --bnum-card-item-agenda-date-border-right - Bordure à droite de l'heure.
   * @cssvar {none} --bnum-card-item-agenda-date-border-left - Bordure à gauche de l'heure.
   * @cssvar {none} --bnum-card-item-agenda-date-border-top - Bordure en haut de l'heure.
   * @cssvar {none} --bnum-card-item-agenda-date-border-bottom - Bordure en bas de l'heure.
   * @cssvar {var(--bnum-font-size-xs, 12px)} --bnum-card-item-agenda-location-font-size - Taille de police pour le lieu.
   * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-private-icon-top - Position top de l'icône privée.
   * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-private-icon-right - Position right de l'icône privée.
   * @cssvar {italic} --bnum-card-item-agenda-telework-font-style - Style de police en mode télétravail.
   * @cssvar {'\e88a'} --bnum-card-item-agenda-telework-icon-content - Contenu de l'icône télétravail.
   * @cssvar {var(--bnum-icon-font-family, 'Material Symbols Outlined')} --bnum-card-item-agenda-telework-icon-font-family - Famille de police de l'icône télétravail.
   * @cssvar {var(--bnum-font-size-xxl, 32px)} --bnum-card-item-agenda-telework-icon-font-size - Taille de l'icône télétravail.
   * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-telework-icon-bottom - Position bottom de l'icône télétravail.
   * @cssvar {var(--bnum-space-s, 8px)} --bnum-card-item-agenda-telework-icon-right - Position right de l'icône télétravail.
   * @cssvar {20px} --bnum-card-item-agenda-telework-action-margin-right - Marge à droite de l'action en mode télétravail.
   */
  class HTMLBnumCardItemAgenda extends HTMLBnumCardItem {
      //#region Constants
      /** Attribut HTML pour indiquer un événement sur toute la journée
       * @attr {boolean | string | undefined} (optional) (default: undefined) all-day - Indique si l'événement dure toute la journée
       */
      static ATTRIBUTE_ALL_DAY = 'all-day';
      /** Attribut HTML pour indiquer un événement privé
       * @attr {boolean | string | undefined} (optional) (default: undefined) private - Indique si l'événement est privé
       */
      static ATTRIBUTE_PRIVATE = 'private';
      /** Attribut HTML pour indiquer le mode de l'événement
       * @attr {string | undefined} (optional) (default: undefined) mode - Indique le mode de l'événement et permet des affichages visuels (custom ou non) en fonction de celui-ci. Créer l'état CSS `mode-X`.
       */
      static ATTRIBUTE_MODE = 'mode';
      /** Attribut HTML pour le titre (data-title)
       * @attr {string | undefined} (optional) (default: undefined) data-title - Titre de l'événement
       */
      static ATTRIBUTE_DATA_TITLE = 'data-title';
      /** Attribut HTML pour le lieu (data-location)
       * @attr {string | undefined} (optional) (default: undefined) data-location - Lieu de l'événement
       */
      static ATTRIBUTE_DATA_LOCATION = 'data-location';
      /** Clé de donnée pour la date de base
       * @attr {string | undefined} data-date - Date de base de l'événement
       */
      static DATA_DATE = 'date';
      /** Clé de donnée pour le format de la date de base
       * @attr {string | undefined} (optional) (default: yyyy-MM-dd) data-date-format - Format de la date de base de l'événement
       */
      static DATA_DATE_FORMAT = 'date-format';
      /** Clé de donnée pour la date de début
       * @attr {string | undefined} data-start-date - Date de début de l'événement
       */
      static DATA_START_DATE = 'start-date';
      /** Clé de donnée pour le format de la date de début
       * @attr {string | undefined} (optional) (default: yyyy-MM-dd HH:mm:ss) data-start-date-format - Format de la date de début de l'événement
       */
      static DATA_START_DATE_FORMAT = 'start-date-format';
      /** Clé de donnée pour la date de fin
       * @attr {string | undefined} data-end-date - Date de fin de l'événement
       */
      static DATA_END_DATE = 'end-date';
      /** Clé de donnée pour le format de la date de fin
       * @attr {string | undefined} (optional) (default: yyyy-MM-dd HH:mm:ss) data-end-date-format - Format de la date de fin de l'événement
       */
      static DATA_END_DATE_FORMAT = 'end-date-format';
      /** Clé de donnée pour le titre */
      static DATA_TITLE = 'title';
      /** Clé de donnée pour le lieu */
      static DATA_LOCATION = 'location';
      /** Format par défaut pour la date (ex: 2024-01-01) */
      static FORMAT_DATE_DEFAULT = 'yyyy-MM-dd';
      /** Format par défaut pour la date et l'heure (ex: 2024-01-01 08:00:00) */
      static FORMAT_DATE_TIME_DEFAULT = 'yyyy-MM-dd HH:mm:ss';
      /** Format par défaut pour l'heure (ex: 08:00) */
      static FORMAT_HOUR_DEFAULT = 'HH:mm';
      /** Format pour l'heure si le jour est différent (ex: 20/11) */
      static FORMAT_HOUR_DIFF_DAY = 'dd/MM';
      /** Texte pour "Aujourd'hui" (localisé) */
      static FORMAT_TODAY = BnumConfig.Get('local_keys').today;
      /** Texte pour "Demain" (localisé) */
      static FORMAT_TOMORROW = BnumConfig.Get('local_keys').tomorrow;
      /** Format pour la date d'événement (ex: lundi 20 novembre) */
      static FORMAT_EVENT_DATE = 'EEEE dd MMMM';
      /** Classe CSS pour le jour de l'agenda */
      static CLASS_BNUM_CARD_ITEM_AGENDA_DAY = 'bnum-card-item-agenda-day';
      /** Classe CSS pour l'heure de l'agenda */
      static CLASS_BNUM_CARD_ITEM_AGENDA_HOUR = 'bnum-card-item-agenda-hour';
      /** Classe CSS pour le titre de l'agenda */
      static CLASS_BNUM_CARD_ITEM_AGENDA_TITLE = 'bnum-card-item-agenda-title';
      /** Classe CSS pour le lieu de l'agenda */
      static CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION = 'bnum-card-item-agenda-location';
      /** Classe CSS pour l'action de l'agenda */
      static CLASS_BNUM_CARD_ITEM_AGENDA_ACTION = 'bnum-card-item-agenda-action';
      /** Classe CSS pour le titre en override */
      static CLASS_BNUM_CARD_ITEM_AGENDA_TITLE_OVERRIDE = 'bnum-card-item-agenda-title-override';
      /** Classe CSS pour le lieu en override */
      static CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION_OVERRIDE = 'bnum-card-item-agenda-location-override';
      /** Classe CSS pour l'action en override */
      static CLASS_BNUM_CARD_ITEM_AGENDA_ACTION_OVERRIDE = 'bnum-card-item-agenda-action-override';
      /** Classe CSS pour la disposition horizontale */
      static CLASS_BNUM_CARD_ITEM_AGENDA_HORIZONTAL = 'bnum-card-item-agenda-horizontal';
      /** Classe CSS pour la disposition verticale */
      static CLASS_BNUM_CARD_ITEM_AGENDA_VERTICAL = 'bnum-card-item-agenda-vertical';
      /** Classe CSS pour l'affichage "toute la journée" */
      static CLASS_BNUM_CARD_ITEM_AGENDA_ALL_DAY = 'bnum-card-item-agenda-all-day';
      /** Classe CSS pour l'icône privée */
      static CLASS_BNUM_CARD_ITEM_AGENDA_PRIVATE_ICON = 'bnum-card-item-agenda-private-icon';
      /** Nom du slot pour le titre */
      static SLOT_NAME_TITLE = 'title';
      /** Nom du slot pour le lieu */
      static SLOT_NAME_LOCATION = 'location';
      /** Nom du slot pour l'action */
      static SLOT_NAME_ACTION = 'action';
      /** État CSS pour absence de lieu */
      static STATE_NO_LOCATION = 'no-location';
      /** État CSS pour "toute la journée" */
      static STATE_ALL_DAY = 'all-day';
      /** État CSS pour événement privé */
      static STATE_PRIVATE = 'private';
      /** Préfixe d'état CSS pour le mode */
      static STATE_MODE_PREFIX = 'mode-';
      /**
       * État CSS lorsque l'action est définie
       */
      static STATE_ACTION_DEFINED = 'action';
      /** Texte affiché pour "toute la journée" (localisé) */
      static TEXT_ALL_DAY = BnumConfig.Get('local_keys').day;
      /** Attribut d'état interne pour la gestion du rendu différé */
      static ATTRIBUTE_PENDING = 'agenda_all';
      /** Mode par défaut */
      static MODE_DEFAULT = 'default';
      /** Nom de l'icône pour les événements privés */
      static ICON_PRIVATE = 'lock';
      /** Symbole pour la réinitialisation interne */
      static SYMBOL_RESET = Symbol('reset');
      //#endregion
      //#region Private Fields
      #_sd = null;
      #_ed = null;
      #_bd = null;
      #_pr = null;
      #_spanDate = null;
      #_spanHour = null;
      #_slotLocation = null;
      #_slotTitle = null;
      #_slotAction = null;
      #_overrideAction = null;
      #_overrideLocation = null;
      #_overrideTitle = null;
      #_privateIcon = null;
      #_spanAllday = null;
      #_bnumDateStart = null;
      #_bnumDateEnd = null;
      #_shedulerTitle = null;
      #_shedulerLocation = null;
      #_shedulerAction = null;
      /**
       * Événement circulaire déclenché lors de la définition de l'action.
       * Permet de personnaliser l'action affichée dans la carte agenda.
       */
      #_onstartdefineaction = null;
      //#endregion
      //#region Public Fields
      //#endregion
      //#region Getters/Setters
      /**
       * Événement circulaire déclenché lors de la définition de l'action.
       *
       * Permet de personnaliser l'action affichée dans la carte agenda.
       */
      get onstartdefineaction() {
          this.#_onstartdefineaction ??=
              new eventExports.JsCircularEvent();
          return this.#_onstartdefineaction;
      }
      /**
       * Indique si l'événement dure toute la journée.
       */
      get isAllDay() {
          return this.hasAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_ALL_DAY);
      }
      /**
       * Date de base de l'événement (jour affiché).
       */
      get baseDate() {
          return (this.#_bd ?? parse(this.#_baseDate, this.#_baseDateFormat, new Date()));
      }
      set baseDate(value) {
          const oldValue = this.#_bd;
          this.#_bd = value;
          this.#_bnumDateStart?.askRender?.();
          this.#_bnumDateEnd?.askRender?.();
          this._p_addPendingAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_PENDING, oldValue === null ? null : format(oldValue, this.#_baseDateFormat), format(value, this.#_baseDateFormat))._p_requestAttributeUpdate();
      }
      /**
       * Date de début de l'événement.
       */
      get startDate() {
          return (this.#_sd ?? parse(this.#_startDate, this.#_startDateFormat, new Date()));
      }
      set startDate(value) {
          const oldValue = this.#_sd;
          this.#_sd = value;
          this.#_bnumDateEnd?.askRender?.();
          this._p_addPendingAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_PENDING, oldValue === null ? null : format(oldValue, this.#_startDateFormat), format(value, this.#_startDateFormat))._p_requestAttributeUpdate();
      }
      /**
       * Date de fin de l'événement.
       */
      get endDate() {
          return this.#_ed ?? parse(this.#_endDate, this.#_endDateFormat, new Date());
      }
      set endDate(value) {
          const oldValue = this.#_ed;
          this.#_ed = value;
          this.#_bnumDateStart?.askRender?.();
          this._p_addPendingAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_PENDING, oldValue === null ? null : format(oldValue, this.#_endDateFormat), format(value, this.#_endDateFormat))._p_requestAttributeUpdate();
      }
      get private() {
          return this.#_pr ?? this.#_private;
      }
      set private(value) {
          const oldValue = this.#_pr;
          this.#_pr = value;
          this._p_addPendingAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_PENDING, JSON.stringify(oldValue), JSON.stringify(value))._p_requestAttributeUpdate();
      }
      get #_private() {
          return this.hasAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_PRIVATE);
      }
      get #_getMode() {
          return (this.getAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_MODE) ||
              HTMLBnumCardItemAgenda.MODE_DEFAULT);
      }
      get #_baseDate() {
          return this.data(HTMLBnumCardItemAgenda.DATA_DATE) || EMPTY_STRING;
      }
      get #_baseDateFormat() {
          return (this.data(HTMLBnumCardItemAgenda.DATA_DATE_FORMAT) ||
              HTMLBnumCardItemAgenda.FORMAT_DATE_DEFAULT);
      }
      get #_startDate() {
          return this.data(HTMLBnumCardItemAgenda.DATA_START_DATE) || EMPTY_STRING;
      }
      get #_startDateFormat() {
          return (this.data(HTMLBnumCardItemAgenda.DATA_START_DATE_FORMAT) ||
              HTMLBnumCardItemAgenda.FORMAT_DATE_TIME_DEFAULT);
      }
      get #_endDate() {
          return this.data(HTMLBnumCardItemAgenda.DATA_END_DATE) || EMPTY_STRING;
      }
      get #_endDateFormat() {
          return (this.data(HTMLBnumCardItemAgenda.DATA_END_DATE_FORMAT) ||
              HTMLBnumCardItemAgenda.FORMAT_DATE_TIME_DEFAULT);
      }
      get #_title() {
          return this.data(HTMLBnumCardItemAgenda.DATA_TITLE);
      }
      get #_location() {
          return this.data(HTMLBnumCardItemAgenda.DATA_LOCATION);
      }
      //#endregion
      constructor() {
          super();
      }
      //#region Lifecycle Hooks
      /**
       * Récupère le style CSS à appliquer au composant.
       * @returns Chaîne de style CSS à appliquer au composant.
       */
      _p_getStylesheets() {
          return [...super._p_getStylesheets(), SHEET$2];
      }
      /**
       * Précharge les données nécessaires à l'initialisation du composant.
       */
      _p_preload() {
          super._p_preload();
          this.#_sd = this.startDate;
          this.#_ed = this.endDate;
      }
      _p_buildDOM(container) {
          // Note: BnumElement a déjà cloné le template dans 'container' grâce à _p_fromTemplate
          super._p_buildDOM(container);
          // Récupération des références du Template
          // On utilise '!' car on sait que le template contient ces classes
          this.#_spanDate = container.querySelector(`.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_DAY}`);
          this.#_spanHour = container.querySelector(`.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_HOUR}`);
          // Slots et Overrides
          const slots = container.querySelectorAll('slot');
          this.#_slotTitle = slots[0];
          this.#_slotLocation = slots[1];
          this.#_slotAction = slots[2];
          this.#_overrideTitle = container.querySelector(`.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_TITLE_OVERRIDE}`);
          this.#_overrideLocation = container.querySelector(`.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION_OVERRIDE}`);
          this.#_overrideAction = container.querySelector(`.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ACTION_OVERRIDE}`);
          // Initialisation UNIQUE des sous-composants (Date & Heure)
          // On crée les composants maintenant, on les mettra à jour dans renderDOM
          const dateHtml = this.#_generateDateHtml(new Date());
          this.#_spanDate.appendChild(dateHtml);
          // Création des heures (Start / End)
          this.#_bnumDateStart = this.setHourLogic(HTMLBnumDate.Create(new Date()));
          this.#_bnumDateEnd = this.setHourLogic(HTMLBnumDate.Create(new Date()));
          // Création du label "Toute la journée" (caché par défaut)
          this.#_spanAllday = this._p_createSpan({
              classes: [HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ALL_DAY],
              child: HTMLBnumCardItemAgenda.TEXT_ALL_DAY,
          });
          this.#_spanAllday.hidden = true;
          // On attache tout au DOM maintenant (pour ne plus y toucher)
          this.#_spanHour.append(this.#_bnumDateStart, this.#_bnumDateEnd, this.#_spanAllday);
          // Initialisation de l'icône privée
          this.#_privateIcon = container.querySelector(`.${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_PRIVATE_ICON}`);
      }
      /**
       * Attache le composant au DOM et initialise les valeurs par défaut.
       */
      _p_attach() {
          super._p_attach();
          if (this._p_slot)
              this._p_slot.hidden = true;
          if (this.#_title) {
              const defaultTitle = document.createTextNode(this.#_title);
              this.#_slotTitle.appendChild(defaultTitle);
          }
          if (this.#_location) {
              const defaultLocation = document.createTextNode(this.#_location);
              this.#_slotLocation.appendChild(defaultLocation);
          }
          this.#_renderDOM();
          this.#_release();
      }
      /**
       * Libère les attributs data- utilisés pour l'initialisation.
       */
      #_release() {
          this.#_startDate;
          this.#_endDate;
          this.#_startDateFormat;
          this.#_endDateFormat;
          this.#_baseDate;
          this.#_baseDateFormat;
      }
      /**
       * Met à jour le rendu du composant.
       */
      _p_render() {
          super._p_render();
          this.#_renderDOM();
      }
      /**
       * Met à jour l'affichage du composant selon les données courantes.
       */
      #_renderDOM() {
          var createDate = true;
          this._p_addState(`${HTMLBnumCardItemAgenda.STATE_MODE_PREFIX}${this.#_getMode}`);
          // Gestion des slots
          if (this.#_isSlotLocationEmpty())
              this._p_addState(HTMLBnumCardItemAgenda.STATE_NO_LOCATION);
          // Gestion de l'action
          const eventResult = this.onstartdefineaction.call({
              location: this.#_isSlotLocationEmpty()
                  ? this.#_location || EMPTY_STRING
                  : this.#_slotLocation.textContent || EMPTY_STRING,
              action: undefined,
          });
          if (eventResult.action) {
              this.updateAction(eventResult.action, { forceCall: true });
          }
          if (eventResult.action ||
              this.#_overrideAction.hidden === false ||
              (this.#_slotAction && this.#_slotAction.children.length > 0)) {
              this._p_addState(HTMLBnumCardItemAgenda.STATE_ACTION_DEFINED);
          }
          if (this.#_spanDate && this.#_spanDate.children.length > 0) {
              const dateHtml = this.shadowRoot.querySelector(HTMLBnumDate.TAG);
              if (dateHtml != null) {
                  createDate = false;
                  dateHtml.date = this.baseDate;
              }
          }
          if (createDate) {
              const dateHtml = this.#_generateDateHtml(this.baseDate);
              this.#_spanDate.appendChild(dateHtml);
          }
          // Gestion de la date
          if (this.isAllDay) {
              if (this.#_bnumDateStart !== null)
                  this.#_bnumDateStart.hidden = true;
              if (this.#_bnumDateEnd !== null)
                  this.#_bnumDateEnd.hidden = true;
              if (this.#_spanAllday === null) {
                  this._p_addState(HTMLBnumCardItemAgenda.STATE_ALL_DAY);
                  const spanAllDay = this._p_createSpan({
                      classes: [HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ALL_DAY],
                      child: HTMLBnumCardItemAgenda.TEXT_ALL_DAY,
                  });
                  this.#_spanAllday = spanAllDay;
                  this.#_spanHour.appendChild(spanAllDay);
              }
              else
                  this.#_spanAllday.hidden = false;
          }
          else {
              if (this.#_spanAllday !== null)
                  this.#_spanAllday.hidden = true;
              if (this.#_bnumDateStart == null && this.#_bnumDateEnd == null) {
                  const htmlStartDate = this.setHourLogic(HTMLBnumDate.Create(this.startDate));
                  const htmlEndDate = this.setHourLogic(HTMLBnumDate.Create(this.endDate));
                  this.#_bnumDateStart = htmlStartDate;
                  this.#_bnumDateEnd = htmlEndDate;
                  this.#_spanHour.append(htmlStartDate, htmlEndDate);
              }
              else {
                  this.#_bnumDateStart.hidden = false;
                  this.#_bnumDateEnd.hidden = false;
                  this.#_bnumDateStart.date = this.startDate;
                  this.#_bnumDateEnd.date = this.endDate;
              }
          }
          if (this.#_private) {
              this._p_addState(HTMLBnumCardItemAgenda.STATE_PRIVATE);
              if (this.#_privateIcon === null) {
                  this.#_privateIcon = HTMLBnumIcon.Create(HTMLBnumCardItemAgenda.ICON_PRIVATE).addClass(HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_PRIVATE_ICON);
                  this.shadowRoot.appendChild(this.#_privateIcon);
              }
              else
                  this.#_privateIcon.hidden = false;
          }
          else if (this.#_privateIcon)
              this.#_privateIcon.hidden = true;
      }
      _p_fromTemplate() {
          return TEMPLATE$1;
      }
      //#endregion
      //#region Public Methods
      /**
       * Met à jour l'action affichée dans la carte agenda.
       * @param element Élément HTML à afficher comme action
       * @returns L'instance du composant
       */
      updateAction(element, { forceCall = false } = {}) {
          return this.#_requestShedulerAction(element, { forceCall });
      }
      /**
       * Réinitialise l'action à sa valeur par défaut.
       * @returns L'instance du composant
       */
      resetAction() {
          return this.#_requestShedulerAction(HTMLBnumCardItemAgenda.SYMBOL_RESET);
      }
      updateTitle(element) {
          return this.#_requestShedulerTitle(element);
      }
      /**
       * Réinitialise le titre à sa valeur par défaut.
       * @returns L'instance du composant
       */
      resetTitle() {
          return this.#_requestShedulerTitle(HTMLBnumCardItemAgenda.SYMBOL_RESET);
      }
      updateLocation(element) {
          return this.#_requestShedulerLocation(element);
      }
      /**
       * Réinitialise le lieu à sa valeur par défaut.
       * @returns L'instance du composant
       */
      resetLocation() {
          return this.#_requestShedulerLocation(HTMLBnumCardItemAgenda.SYMBOL_RESET);
      }
      /**
       * Applique la logique d'affichage pour la date (aujourd'hui, demain, etc.).
       * @param element Instance HTMLBnumDate à formater
       * @returns Instance HTMLBnumDate modifiée
       */
      setDateLogic(element) {
          element.formatEvent.add(EVENT_DEFAULT, (param) => {
              const now = new Date();
              const date = param.date;
              if (isSameDay(date, now))
                  param.date = HTMLBnumCardItemAgenda.FORMAT_TODAY;
              else if (isSameDay(date, addDays(now, 1)))
                  param.date = HTMLBnumCardItemAgenda.FORMAT_TOMORROW;
              else
                  param.date = CapitalizeLine(format(date, HTMLBnumCardItemAgenda.FORMAT_EVENT_DATE, {
                      locale: element.localeElement,
                  }));
              return param;
          });
          return element;
      }
      /**
       * Applique la logique d'affichage pour l'heure (heure ou date selon le jour).
       * @param element Instance HTMLBnumDate à formater
       * @returns Instance HTMLBnumDate modifiée
       */
      setHourLogic(element) {
          element.formatEvent.add(EVENT_DEFAULT, (param) => {
              const date = param.date;
              if (isSameDay(date, this.baseDate))
                  param.date = format(date, HTMLBnumCardItemAgenda.FORMAT_HOUR_DEFAULT, {
                      locale: element.localeElement,
                  });
              else
                  param.date = format(date, HTMLBnumCardItemAgenda.FORMAT_HOUR_DIFF_DAY, {
                      locale: element.localeElement,
                  });
              return param;
          });
          return element;
      }
      //#endregion
      //#region Private Methods
      #_requestShedulerAction(element, { forceCall = false } = {}) {
          this.#_shedulerAction ??= new Scheduler((element) => this.#_updateAction(element));
          if (forceCall)
              this.#_shedulerAction.call(element);
          else
              this.#_shedulerAction.schedule(element);
          return this;
      }
      #_updateAction(element) {
          if (element === HTMLBnumCardItemAgenda.SYMBOL_RESET) {
              this._p_removeState(HTMLBnumCardItemAgenda.STATE_ACTION_DEFINED);
              this.#_resetItem(this.#_overrideAction, this.#_slotAction);
              return;
          }
          this._p_addState(HTMLBnumCardItemAgenda.STATE_ACTION_DEFINED);
          this.#_overrideAction.innerHTML = EMPTY_STRING;
          this.#_overrideAction.appendChild(element);
          this.#_slotAction.hidden = true;
          this.#_overrideAction.hidden = false;
      }
      #_requestShedulerTitle(element) {
          this.#_shedulerTitle ??= new Scheduler((element) => this.#_updateTitle(element));
          this.#_shedulerTitle.schedule(element);
          return this;
      }
      #_updateTitle(element) {
          if (element === HTMLBnumCardItemAgenda.SYMBOL_RESET) {
              this.#_resetItem(this.#_overrideTitle, this.#_slotTitle);
              return;
          }
          this.#_overrideTitle.innerHTML = EMPTY_STRING;
          if (typeof element === 'string') {
              const textNode = document.createTextNode(element);
              this.#_overrideTitle.appendChild(textNode);
          }
          else {
              this.#_overrideTitle.appendChild(element);
          }
          this.#_slotTitle.hidden = true;
          this.#_overrideTitle.hidden = false;
      }
      #_requestShedulerLocation(element) {
          this.#_shedulerLocation ??= new Scheduler((element) => this.#_updateLocation(element));
          this.#_shedulerLocation.schedule(element);
          return this;
      }
      #_updateLocation(element) {
          if (element === HTMLBnumCardItemAgenda.SYMBOL_RESET) {
              this.#_resetItem(this.#_overrideLocation, this.#_slotLocation);
              return;
          }
          this.#_overrideLocation.innerHTML = EMPTY_STRING;
          if (typeof element === 'string') {
              const textNode = document.createTextNode(element);
              this.#_overrideLocation.appendChild(textNode);
          }
          else {
              this.#_overrideLocation.appendChild(element);
          }
          this.#_slotLocation.hidden = true;
          this.#_overrideLocation.hidden = false;
      }
      #_resetItem(action, slot) {
          action.innerHTML = EMPTY_STRING;
          slot.hidden = false;
          action.hidden = true;
          return this;
      }
      #_slotEmpty(slot) {
          return slot.assignedNodes().length === 0;
      }
      #_isSlotLocationEmpty() {
          return this.#_slotLocation ? this.#_slotEmpty(this.#_slotLocation) : true;
      }
      #_generateDateHtml(startDate) {
          return this.setDateLogic(HTMLBnumDate.Create(startDate));
      }
      //#endregion
      //#region Static Methods
      /**
       * Crée une nouvelle instance du composant agenda avec les paramètres donnés.
       * @param baseDate Date de base
       * @param startDate Date de début
       * @param endDate Date de fin
       * @param options Options supplémentaires (allDay, title, location, action)
       * @returns Instance HTMLBnumCardItemAgenda
       */
      static Create(baseDate, startDate, endDate, { allDay = false, title = null, location = null, action = null, isPrivate = false, mode = null, } = {}) {
          let node = document.createElement(HTMLBnumCardItemAgenda.TAG);
          node.baseDate = baseDate;
          node.startDate = startDate;
          node.endDate = endDate;
          if (allDay)
              node.setAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_ALL_DAY, HTMLBnumCardItemAgenda.ATTRIBUTE_ALL_DAY);
          if (title)
              node.setAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_DATA_TITLE, title);
          if (location)
              node.setAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_DATA_LOCATION, location);
          if (isPrivate)
              node.setAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_PRIVATE, HTMLBnumCardItemAgenda.ATTRIBUTE_PRIVATE);
          if (mode)
              node.setAttribute(HTMLBnumCardItemAgenda.ATTRIBUTE_MODE, mode);
          if (action) {
              if (typeof action === 'function')
                  node.onstartdefineaction.push(action);
              else
                  node.onstartdefineaction.push((param) => {
                      param.action = action.element;
                      param.action.onclick = action.callback;
                      return param;
                  });
          }
          return node;
      }
      /**
       * @inheritdoc
       */
      static _p_observedAttributes() {
          return [
              ...super._p_observedAttributes(),
              HTMLBnumCardItemAgenda.ATTRIBUTE_ALL_DAY,
              HTMLBnumCardItemAgenda.ATTRIBUTE_PRIVATE,
              HTMLBnumCardItemAgenda.ATTRIBUTE_MODE,
          ];
      }
      /**
       * Crée une nouvelle instance du composant agenda à partir d'un objet événement.
       * @param baseDate Date de base
       * @param agendaEvent Objet événement source
       * @param options Fonctions de sélection et action personnalisée
       * @returns Instance HTMLBnumCardItemAgenda
       */
      static FromEvent(baseDate, agendaEvent, { startDateSelector = null, endDateSelector = null, allDaySelector = null, titleSelector = null, locationSelector = null, action = null, } = {}) {
          const [startDate, endDate] = this.#_tryGetAgendaDates({
              val: agendaEvent.start,
              selector: startDateSelector,
          }, {
              val: agendaEvent.end,
              selector: endDateSelector,
          });
          const allDay = agendaEvent?.allDay ?? allDaySelector?.(agendaEvent) ?? false;
          const title = agendaEvent?.title ?? titleSelector?.(agendaEvent) ?? EMPTY_STRING;
          const location = agendaEvent?.location ?? locationSelector?.(agendaEvent) ?? EMPTY_STRING;
          return this.Create(baseDate, startDate, endDate, {
              allDay: allDay,
              title: title,
              location: location,
              action: action,
          });
      }
      /**
       * Retourne le tag HTML du composant.
       */
      static get TAG() {
          return TAG_CARD_ITEM_AGENDA;
      }
      /**
       * Tente d'obtenir une date d'agenda à partir d'une valeur donnée.
       * @param val La valeur à analyser.
       * @param selector Une fonction de sélection pour extraire la date.
       * @returns La date d'agenda ou une date invalide.
       */
      static #_TryGetAgendaDate(val, selector) {
          return typeof val === 'string'
              ? new Date(val)
              : val?.toDate
                  ? val.toDate()
                  : (selector?.(val) ?? new Date('Date invalide'));
      }
      /**
       * Tente d'obtenir une liste de dates d'agenda à partir des valeurs données.
       * @param options Options contenant les valeurs et sélecteurs.
       * @returns La liste des dates d'agenda.
       */
      static #_tryGetAgendaDates(...options) {
          return options.map((option) => this.#_TryGetAgendaDate(option.val, option.selector));
      }
  }
  const AGENDA = `
  <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_DAY} bold"></span>
  <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_HORIZONTAL}">
     <div class="bnum-card-item-agenda-block">
        <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_HOUR} bold"></span>
        <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_VERTICAL}">
            <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_TITLE} bold-500">
                <slot name="${HTMLBnumCardItemAgenda.SLOT_NAME_TITLE}"></slot>
                <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_TITLE_OVERRIDE}" hidden></div>
            </span>
            <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION}">
                <slot name="${HTMLBnumCardItemAgenda.SLOT_NAME_LOCATION}"></slot>
                <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_LOCATION_OVERRIDE}" hidden></div>
            </span>
        </div>
     </div>
     <span class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ACTION}">
        <slot name="${HTMLBnumCardItemAgenda.SLOT_NAME_ACTION}"></slot>
        <div class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_ACTION_OVERRIDE}" hidden></div>
     </span>
  </div>
  <${HTMLBnumIcon.TAG} class="${HTMLBnumCardItemAgenda.CLASS_BNUM_CARD_ITEM_AGENDA_PRIVATE_ICON}" hidden>${HTMLBnumCardItemAgenda.ICON_PRIVATE}</${HTMLBnumIcon.TAG}>
`;
  // Optimisation : Le HTML est parsé une seule fois ici.
  const TEMPLATE$1 = HTMLBnumCardItem.CreateChildTemplate(AGENDA, {
      defaultSlot: false,
  });
  HTMLBnumCardItemAgenda.TryDefine();

  var css_248z$1 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{padding:var(--bnum-space-s,10px)}:host ::slotted([role=listitem]){border-bottom:var(--bnum-border-in-surface,solid 1px #ddd)}:host ::slotted([role=listitem]:last-child){border-bottom:none}:host ::slotted([hidden]),:host [hidden]{display:none}";

  /**
   * Feuille de style CSS pour le composant liste de cartes.
   */
  const SHEET$1 = BnumElement.ConstructCSSStyleSheet(css_248z$1);
  /**
   * Composant liste de cartes Bnum.
   * Permet d'afficher une liste d'éléments de type carte.
   *
   * @structure Default
   * <bnum-card-list>
   *  <bnum-card-item></bnum-card-item>
   *  <bnum-card-item></bnum-card-item>
   *  <bnum-card-item></bnum-card-item>
   * </bnum-card-list>
   *
   * @structure Mail et agenda
   * <bnum-card-list>
   *   <bnum-card-item-mail data-date="now">
   *     <span slot="subject">Sujet par défaut</span>
   *     <span slot="sender">Expéditeur par défaut</span>
   *   </bnum-card-item-mail>
   * <bnum-card-item-agenda
   *    data-date="2025-11-20"
   *    data-start-date="2025-10-20 09:40:00"
   *    data-end-date="2025-12-20 10:10:00"
   *    data-title="Réunion de projet"
   *    data-location="Salle de conférence">
   * </bnum-card-item-agenda>
   * </bnum-card-list>
   *
   * @structure Dans une card
   * <bnum-card>
   * <bnum-card-title slot="title" data-icon="info">Diverses informations</bnum-card-title>
   * <bnum-card-list>
   *   <bnum-card-item-mail data-date="now">
   *     <span slot="subject">Sujet par défaut</span>
   *     <span slot="sender">Expéditeur par défaut</span>
   *   </bnum-card-item-mail>
   * <bnum-card-item-agenda
   *    data-date="2025-11-20"
   *    data-start-date="2025-10-20 09:40:00"
   *    data-end-date="2025-12-20 10:10:00"
   *    data-title="Réunion de projet"
   *    data-location="Salle de conférence">
   * </bnum-card-item-agenda>
   * </bnum-card-list>
   * </bnum-card>
   *
   * @slot (default) - Contenu de la liste de cartes (éléments HTMLBnumCardItem)
   *
   *
   */
  class HTMLBnumCardList extends BnumElement {
      //#region Constants
      /**
       * Symbole utilisé pour réinitialiser la liste.
       */
      static SYMBOL_RESET = Symbol('reset');
      //#endregion Constants
      //#region Private fields
      /**
       * Ordonnanceur de modifications de la liste.
       */
      #_modifierScheduler = null;
      //#endregion Private fields
      //#region Lifecycle
      /**
       * Constructeur de la liste de cartes.
       */
      constructor() {
          super();
      }
      /**
       * Retourne la feuille de style à appliquer au composant.
       * @returns {CSSStyleSheet[]} Feuilles de style CSS
       */
      _p_getStylesheets() {
          return [SHEET$1];
      }
      /**
       * Construit le DOM interne du composant.
       * @param container Racine du shadow DOM ou élément HTML
       */
      _p_buildDOM(container) {
          container.appendChild(this._p_createSlot());
          this.setAttribute('role', 'list');
      }
      //#endregion Lifecycle
      //#region Public methods
      /**
       * Ajoute un ou plusieurs éléments de type carte à la liste.
       * @param nodes Éléments HTMLBnumCardItem à ajouter
       * @returns {this} L'instance courante
       */
      add(...nodes) {
          return this.#_requestModifier(nodes);
      }
      /**
       * Vide la liste de toutes ses cartes.
       * @returns {this} L'instance courante
       */
      clear() {
          return this.#_requestModifier(HTMLBnumCardList.SYMBOL_RESET);
      }
      //#endregion Public methods
      //#region  Private methods
      #_requestModifier(items) {
          (this.#_modifierScheduler ??= new SchedulerArray((values) => this.#_modifier(values), HTMLBnumCardList.SYMBOL_RESET)).schedule(items);
          return this;
      }
      #_modifier(items) {
          if (items === HTMLBnumCardList.SYMBOL_RESET) {
              this.innerHTML = EMPTY_STRING;
          }
          else
              this.append(...items);
      }
      //#endregion  Private methods
      //#region Static methods
      /**
       * Crée une nouvelle instance de liste de cartes avec des éléments optionnels.
       * @param items Tableau d'éléments HTMLBnumCardItem ou null
       * @returns {HTMLBnumCardList} Nouvelle instance de liste de cartes
       */
      static Create(items = null) {
          const node = document.createElement(TAG_CARD_LIST);
          if (items && items.length > 0) {
              node.add(...items.filter((item) => item !== null));
          }
          return node;
      }
      /**
       * Retourne le tag HTML du composant.
       */
      static get TAG() {
          return TAG_CARD_LIST;
      }
  }
  HTMLBnumCardList.TryDefine();

  var css_248z = ":host{display:var(--bnum-card-email-display,block)}[hidden]{display:none}";

  const SHEET = BnumElement.ConstructCSSStyleSheet(css_248z);
  /**
   * Organisme qui permet d'afficher simplement une liste de mails dans une carte.
   *
   * @structure Avec des éléments
   * <bnum-card-email>
   * <bnum-card-item-mail data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
   * </bnum-card-item-mail>
   * <bnum-card-item-mail read data-date="2025-10-31 11:11" data-subject="Sujet ici" data-sender="Expéditeur ici">
   * </bnum-card-item-mail>
   * <bnum-card-item-mail data-date="now">
   * <span slot="subject">Sujet par défaut</span>
   * <span slot="sender">Expéditeur par défaut</span>
   * </bnum-card-item-mail>
   * </bnum-card-email>
   *
   * @structure Sans éléments
   * <bnum-card-email>
   * </bnum-card-email>
   *
   * @structure Avec une url
   * <bnum-card-email data-url="#">
   * </bnum-card-email>
   *
   * @slot (default) - Contenu des éléments de type HTMLBnumCardItemMail.
   *
   * @cssvar {block} --bnum-card-email-display - Définit le display du composant. Par défaut à "block".
   */
  class HTMLBnumCardEmail extends BnumElement {
      //#region Constants
      /**
       * Nom du event déclenché lorsque les éléments changent (ajout/suppression).
       * @event bnum-card-email:change
       * @detail HTMLBnumCardItemMail[]
       */
      static CHANGE_EVENT = 'bnum-card-email:change';
      /**
       * Data pour l'URL du titre.
       */
      static DATA_URL = 'url';
      /**
       * Attribut data pour l'URL du titre.
       * @attr {string | undefined} (optional) data-url - Ajoute une url au titre. Ne rien mettre pour que l'option "url" du titre ne s'active pas.
       */
      static ATTRIBUTE_DATA_URL = `data-${HTMLBnumCardEmail.DATA_URL}`;
      /**
       * ID du titre.
       */
      static ID_CARD_TITLE = 'bnum-card-title';
      /**
       * ID de l'élément "Aucun élément".
       */
      static ID_CARD_ITEM_NO_ELEMENTS = 'no-elements';
      //#endregion Constants
      //#region Private fields
      #_isSorting = false;
      #_cardTitle;
      #_slot;
      #_noElements;
      /**
       * Déclenché lorsque les éléments changent (ajout/suppression).
       */
      #_onchange = null;
      //#endregion Private fields
      //#region Getters/Setters
      /**
       * Déclenché lorsque les éléments changent (ajout/suppression).
       */
      get onElementChanged() {
          if (this.#_onchange === null) {
              this.#_onchange = new JsEvent();
              this.#_onchange.add(EVENT_DEFAULT, (data) => {
                  this.trigger(HTMLBnumCardEmail.CHANGE_EVENT, { detail: data });
              });
          }
          return this.#_onchange;
      }
      /**
       * Récupère l'URL du titre.
       */
      get #_url() {
          return this.data(HTMLBnumCardEmail.DATA_URL) || EMPTY_STRING;
      }
      //#endregion Getters/Setters
      //#region Lifecycle
      constructor() {
          super();
      }
      get _p_styleSheets() {
          return [SHEET];
      }
      _p_fromTemplate() {
          return TEMPLATE;
      }
      _p_buildDOM(container) {
          this.#_cardTitle = container.querySelector(`#${HTMLBnumCardEmail.ID_CARD_TITLE}`);
          this.#_slot = container.querySelector('slot');
          this.#_noElements = container.querySelector(`#${HTMLBnumCardEmail.ID_CARD_ITEM_NO_ELEMENTS}`);
      }
      _p_attach() {
          if (this.#_url !== EMPTY_STRING)
              this.#_cardTitle.url = this.#_url;
          // On écoute les changements dans le slot (Items statiques ou ajoutés via JS)
          this.#_slot.addEventListener('slotchange', this.#_handleSlotChange.bind(this));
          this.#_handleSlotChange();
      }
      //#endregion Lifecycle
      //#region Public methods
      /**
       * Ajoute des éléments.
       *
       * Note: On ajoute simplement au Light DOM. Le slotchange détectera l'ajout et déclenchera le tri.
       */
      add(...content) {
          this.append(...content);
          return this;
      }
      /**
       * Vide le composant.
       */
      clear() {
          this.innerHTML = EMPTY_STRING; // Vide le Light DOM
          return this;
      }
      //#endregion Public methods
      //#region Private methods
      /**
       * Gère le tri des éléments.
       * Utilise requestAnimationFrame pour ne pas bloquer le thread si beaucoup d'items.
       */
      #_handleSlotChange() {
          if (this.#_isSorting)
              return;
          // On planifie le tri au prochain frame pour regrouper les appels multiples
          requestAnimationFrame(() => {
              this.#_sortChildren();
          });
      }
      /**
       * Tri les éléments enfants de la liste par date décroissante.
       */
      #_sortChildren() {
          // 1. Récupérer les éléments assignés au slot (Uniquement les Nodes Elements, pas le texte)
          const elements = this.#_slot.assignedElements();
          // Filtrer pour être sûr de ne trier que des mails (sécurité)
          const mailItems = elements.filter((el) => el.tagName.toLowerCase().includes(HTMLBnumCardItemMail.TAG));
          if (mailItems.length === 0) {
              this.#_noElements.hidden = false;
              this.#_slot.hidden = true;
              return;
          }
          else {
              this.#_noElements.hidden = true;
              this.#_slot.hidden = false;
          }
          if (mailItems.length < 2)
              return; // Pas besoin de trier
          // 2. Vérifier si un tri est nécessaire (optimisation)
          let isSorted = true;
          for (let i = 0; i < mailItems.length - 1; i++) {
              if (this.#_getDate(mailItems[i]) < this.#_getDate(mailItems[i + 1])) {
                  isSorted = false;
                  break;
              }
          }
          if (isSorted)
              return;
          // 3. Trier en mémoire
          this.#_isSorting = true; // Verrouiller pour éviter que le déplacement ne relance slotchange
          mailItems.sort((a, b) => {
              // Tri décroissant (le plus récent en haut)
              return this.#_getDate(b) - this.#_getDate(a);
          });
          // 4. Réinsérer dans l'ordre via un Fragment (1 seul Reflow)
          const fragment = document.createDocumentFragment();
          mailItems.forEach((item) => fragment.appendChild(item));
          this.appendChild(fragment); // Déplace les éléments existants, ne les recrée pas.
          // Notifier le changement
          this.onElementChanged.call(mailItems);
          // Déverrouiller après que le microtask de mutation soit passé
          setTimeout(() => {
              this.#_isSorting = false;
          }, 0);
      }
      /**
       * Helper pour parser la date de manière robuste
       */
      #_getDate(item) {
          const dateStr = item.getAttribute(HTMLBnumCardItemMail.ATTRIBUTE_DATA_DATE);
          if (!dateStr)
              return item.date.getTime();
          if (dateStr === 'now')
              return Date.now();
          return new Date(dateStr).getTime();
      }
      //#endregion Private methods
      //#region Static methods
      /**
       * Méthode statique pour créer une instance du composant.
       * @param param0 Options de création
       * @param param0.contents Contenus initiaux à ajouter
       * @param param0.url URL du titre
       * @returns Nouvelle node HTMLBnumCardEmail
       */
      static Create({ contents = [], url = EMPTY_STRING, } = {}) {
          const node = document.createElement(this.TAG);
          if (url !== EMPTY_STRING)
              node.setAttribute(HTMLBnumCardEmail.ATTRIBUTE_DATA_URL, url);
          if (contents.length > 0)
              node.add(...contents);
          return node;
      }
      /**
       * Tag du composant.
       */
      static get TAG() {
          return TAG_CARD_EMAIL;
      }
  }
  const TEMPLATE = BnumElement.CreateTemplate(`
    <${HTMLBnumCardElement.TAG}>
      <${HTMLBnumCardTitle.TAG} id="${HTMLBnumCardEmail.ID_CARD_TITLE}" slot="title" data-icon="mail">${BnumConfig.Get('local_keys').last_mails}</${HTMLBnumCardTitle.TAG}>
        <${HTMLBnumCardList.TAG}>
          <slot></slot>
          <${HTMLBnumCardItem.TAG} id="${HTMLBnumCardEmail.ID_CARD_ITEM_NO_ELEMENTS}" disabled hidden>${BnumConfig.Get('local_keys').no_mails}</${HTMLBnumCardItem.TAG}>
        </${HTMLBnumCardList.TAG}>
    </${HTMLBnumCardElement.TAG}>
    `);
  //#region TryDefine
  HTMLBnumCardEmail.TryDefine();
  //#endregion TryDefine

  // Auto-init au chargement
  if (typeof window !== 'undefined' && window.DsBnumConfig) {
      BnumConfig.Initialize(window.DsBnumConfig);
  }

  exports.BnumElement = BnumElement;
  exports.Config = BnumConfig;
  exports.HTMLBnumButton = HTMLBnumButton;
  exports.HTMLBnumCardElement = HTMLBnumCardElement;
  exports.HTMLBnumCardEmail = HTMLBnumCardEmail;
  exports.HTMLBnumCardItem = HTMLBnumCardItem;
  exports.HTMLBnumCardItemAgenda = HTMLBnumCardItemAgenda;
  exports.HTMLBnumCardItemMail = HTMLBnumCardItemMail;
  exports.HTMLBnumCardList = HTMLBnumCardList;
  exports.HTMLBnumCardTitle = HTMLBnumCardTitle;
  exports.HTMLBnumDangerButton = HTMLBnumDangerButton;
  exports.HTMLBnumDate = HTMLBnumDate;
  exports.HTMLBnumHelper = HTMLBnumHelper;
  exports.HTMLBnumIcon = HTMLBnumIcon;
  exports.HTMLBnumPicture = HTMLBnumPicture;
  exports.HTMLBnumPrimaryButton = HTMLBnumPrimaryButton;
  exports.HTMLBnumSecondaryButton = HTMLBnumSecondaryButton;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
