/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
}
function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// type: interface
// description: Interface for a result type that can represent either a success or an error.
/**
 * Enumeration representing the state of the result.
 */
var ResultState;
(function (ResultState) {
    /**
     * The result represents a successful outcome.
     */
    ResultState[ResultState["Success"] = 0] = "Success";
    /**
     * The result represents an error outcome.
     */
    ResultState[ResultState["Error"] = 1] = "Error";
})(ResultState || (ResultState = {}));

// type: class
/**
 * Abstract class representing a result that can be either a success or an error.
 */
class ATresult {
    /**
     * Checks if the result is a success.
     *
     * @returns True if the result is a success, false otherwise.
     */
    isSuccess() {
        return this.state() === ResultState.Success;
    }
    /**
     * Checks if the result is an error.
     *
     * @returns True if the result is an error, false otherwise.
     */
    isError() {
        return this.state() === ResultState.Error;
    }
    /**
     * Creates a new Success result.
     * @param value Optional success value.
     * @returns A new Success instance containing the value.
     */
    static Ok(value) {
        return Success.Create(value);
    }
    /**
     * Creates a new Fail result.
     * @param error Optional error value.
     * @returns A new Fail instance containing the error.
     */
    static Fail(error) {
        return Fail.Create(error ?? new Error("An error occurred"));
    }
    /**
     * Throw an error from an Error object or a text.
     * @param error Error to throw
     * @throws An Error
     */
    static Throw(error = undefined) {
        const err = typeof error === 'string' ? new Error(error) : error;
        this.Fail(err).throwIfError();
    }
}

// type: class
/**
 * Class representing a successful result.
 * @template TSuccess - The type of the success value.
 * @template TE - The type of the error value (default is Error).
 */
class Success extends ATresult {
    /**
     * Creates an instance of Success.
     * @param value The success value.
     */
    constructor(value) {
        super();
        this.value = value;
    }
    /**
     * Returns the state of the result.
     * @returns The state indicating success.
     */
    state() {
        return ResultState.Success;
    }
    /**
     * Matches the result with the provided matcher functions.
     * @param matcher The matcher object containing functions for success and error cases.
     * @returns The result of the matched function.
     */
    match(matcher) {
        return matcher.Ok(this.value);
    }
    /**
     * Chains the result with another operation that returns a new result.
     * @param fn The function to apply if the result is successful.
     * @returns The result of the chained operation.
     */
    andThen(fn) {
        return fn(this.value);
    }
    /**
     * Maps the success value to a new value.
     * @param fn The function to apply to the success value.
     * @returns A new Success instance containing the mapped value.
     */
    map(fn) {
        return new Success(fn(this.value));
    }
    /**
     * Maps the error value to a new error value.
     * @param _ The function to apply to the error value.
     * @returns A new Success instance containing the original success value.
     */
    mapError(_) {
        return new Success(this.value);
    }
    /**
     * Returns the success value or throws an error if the result is an error.
     * @returns The success value.
     */
    throwIfError() {
        return this.value;
    }
    /**
     * Retrieves the success value or returns the provided default value if the result is an error.
     * @param _ The value to return if the result is an error.
     * @returns The success value if the result is a success, otherwise the default value.
     */
    unwrapOr(_) {
        return this.value;
    }
    /**
     * Executes the provided function if the result is an error, then returns the original result.
     * @param _ Unused function since this is a Success.
     * @returns The original Success result.
     */
    tapError(_) {
        return this;
    }
    /**
     * Executes the provided function if the result is a success, then returns the original result.
     * @param fn A function to execute with the success value.
     * @returns The original result.
     */
    tap(fn) {
        fn(this.value);
        return this;
    }
    /**
     * Creates a new Success instance.
     * @param value The success value.
     * @returns A new Success instance containing the value.
     *
     * @template TSuccess - The type of the success value.
     * @template TE - The type of the error value (default is Error).
     *
     * @static
     */
    static Create(value) {
        return new Success(value);
    }
}

// type: class
/**
 * Class representing a failed result.
 * @template TSuccess - The type of the success value.
 * @template TE - The type of the error value (default is Error).
 */
class Fail extends ATresult {
    /**
     * Creates an instance of Fail.
     * @param error The error value.
     */
    constructor(error) {
        super();
        this.error = error;
    }
    /**
     * Returns the state of the result.
     * @returns The state indicating failure.
     */
    state() {
        return ResultState.Error;
    }
    /**
     * Matches the result with the provided matcher functions.
     * @param matcher The matcher object containing functions for success and error cases.
     * @returns The result of the matched function.
     */
    match(matcher) {
        return matcher.Err(this.error);
    }
    /**
     * Chains the result with another operation that returns a new result.
     * @param fn The function to apply if the result is successful.
     * @returns The result of the chained operation.
     */
    andThen(_) {
        return new Fail(this.error);
    }
    /**
     * Maps the success value to a new value.
     * @param fn The function to apply to the success value.
     * @returns A new Success instance containing the mapped value.
     */
    map(_) {
        return new Fail(this.error);
    }
    /**
     * Maps the error value to a new error value.
     * @param _ The function to apply to the error value.
     * @returns A new Success instance containing the original success value.
     */
    mapError(fn) {
        return new Fail(fn(this.error));
    }
    /**
     * Returns the success value or throws an error if the result is an error.
     * @throws The error value if the result is an error.
     * @returns The success value.
     */
    throwIfError() {
        throw this.error;
    }
    /**
     * Retrieves the success value or returns the provided default value if the result is an error.
     * @param defaultValue The value to return if the result is an error.
     * @returns The success value if the result is a success, otherwise the default value.
     */
    unwrapOr(defaultValue) {
        return defaultValue;
    }
    /**
     * Executes the provided function if the result is an error, then returns the original result.
     * @param fn A function to execute with the error value.
     * @returns The original result.
     */
    tapError(fn) {
        fn(this.error);
        return this;
    }
    /**
     * Executes the provided function if the result is a success, then returns the original result.
     * @param fn A function to execute with the success value.
     * @returns The original result.
     */
    tap(_) {
        return this;
    }
    /**
     * Creates a new Fail instance.
     * @param error The error value.
     * @returns A new Fail instance containing the error.
     *
     * @template TSuccess - The type of the success value.
     * @template TE - The type of the error value (default is Error).
     *
     * @static
     */
    static Create(error) {
        return new Fail(error);
    }
}

// type: functions
/**
 * Handles synchronous risky operations by converting exceptions into Result types.
 * @param this The context in which the original function is called.
 * @param original The original function to be executed.
 * @param args Arguments to be passed to the original function.
 * @returns An ATresult representing success or failure.
 */
function riskySync(original, ...args) {
    try {
        const result = original.apply(this, args);
        return result instanceof ATresult ? result : Success.Create(result);
    }
    catch (error) {
        return error instanceof ATresult ? error : Fail.Create(error);
    }
}

// type: decorators
/**
 * Decorator to handle risky operations by converting exceptions into Result types.
 * @returns A method decorator that wraps the original method with error handling.
 */
function Risky() {
    return function (originalMethod, context) {
        if (context.kind !== "method") {
            throw new Error("Risky can only be applied to methods.");
        }
        return (function (...args) {
            return riskySync.call(this, originalMethod, ...args);
        });
    };
}

// type: decorators
/**
 * Decorator to handle risky operations by converting exceptions into Result types.
 * Use with HappyPath or ErrorPath to handle the respective paths.
 * @returns A method decorator that wraps the original method with error handling.
 */
function RiskyPath() {
    return function (originalMethod, context) {
        if (context.kind !== "method") {
            throw new Error("RiskyPath can only be applied to methods.");
        }
        return (function (...args) {
            return riskySync.call(this, originalMethod, ...args);
        });
    };
}

//type: functions
/**
 * Handles the error path for synchronous functions by executing a callback on errored results.
 * @param this The context in which the original function is called.
 * @param original The original function to be wrapped.
 * @param path The error callback to be executed on errored results.
 * @param args Arguments to be passed to the original function.
 * @returns The result of the original function or the result of the error callback.
 */
function errorPathSync(original, path, ...args) {
    const result = original.call(this, ...args);
    if (result instanceof ATresult) {
        return result.match({
            Ok: (_) => result,
            Err: (val) => val,
        });
    }
    return path(result);
}

//type: decorators
/**
 * Decorator to handle error path operations by executing a callback on errored results.
 * @param fn Error path callback to be executed on errored results.
 * @returns A method decorator that wraps the original method with error path handling.
 */
function ErrorPath(fn) {
    return function (originalMethod, context) {
        return function (...args) {
            return errorPathSync.call(this, originalMethod, fn, ...args);
        };
    };
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
        today: "Aujourd'hui",
        tomorrow: 'Demain',
        day: 'Journée',
        invalid_date: 'Date invalide',
        last_mails: 'Courriers récents',
        no_mails: 'Aucun courrier...',
        last_events: 'Prochains évènements',
        no_events: 'Aucun événement...',
        valid_input: 'Le champs est valide !',
        invalid_input: 'Le champs est invalide !',
        error_field: 'Ce champ contient une erreur.',
        search_field: 'Rechercher',
        active_switch: 'Activé',
        inactive_switch: 'Désactivé',
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
let BnumConfig = (() => {
    let _staticExtraInitializers = [];
    let _static_Initialize_decorators;
    return class BnumConfig {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _static_Initialize_decorators = [Risky()];
            __esDecorate(this, null, _static_Initialize_decorators, { kind: "method", name: "Initialize", static: true, private: false, access: { has: obj => "Initialize" in obj, get: obj => obj.Initialize }, metadata: _metadata }, null, _staticExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(this, _staticExtraInitializers);
        }
        /**
         * Initialise la configuration en fusionnant les défauts avec un objet partiel.
         * À appeler au démarrage si une config globale existe.
         */
        static Initialize(overrides) {
            _currentConfig = deepMerge(_currentConfig, overrides);
            return ATresult.Ok();
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
    };
})();

const EMPTY_STRING = '';

//#region MiscFunctions
function isNullOrUndefined$1(item) {
    return item !== null || item !== undefined;
}

function Capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function CapitalizeLine(line) {
  return line.split(' ')
          .map(Capitalize)
          .join(' ');
}

var css_248z$r = ":host([block]){display:block;flex:1;width:100%}:host(.flex){display:flex}:host(.center){align-items:center;justify-content:center;text-align:center}";

class BnumDOM {
    /**
     * "Caste" un container pour lui injecter les extensions Bnum via un Proxy.
     * C'est l'équivalent d'une méthode d'extension C# résolue à l'exécution.
     */
    static from(container) {
        return new Proxy(container, {
            get(target, prop, receiver) {
                if (prop === 'queryId') {
                    return (id) => {
                        return target instanceof ShadowRoot
                            ? target.getElementById(id)
                            : target.querySelector(`#${id}`);
                    };
                }
                else if (prop === 'queryClass') {
                    return (className) => {
                        return target instanceof ShadowRoot
                            ? target.querySelector(`.${className}`)
                            : target.getElementsByClassName(className)[0] || null;
                    };
                }
                const value = Reflect.get(target, prop, target);
                return typeof value === 'function' ? value.bind(target) : value;
            },
        });
    }
}

/**
 * Utilitaires pour les tableaux.
 */
class ArrayUtils {
    /**
     * Transforme un objet d'attributs en une chaîne de caractères pour utilisation dans une balise HTML.
     * @param attribs Objet contenant les attributs et leurs valeurs.
     * @returns Chaîne de caractères représentant les attributs pour une balise HTML.
     */
    static toStringAttribs(attribs) {
        return Object.entries(attribs)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
    }
    /**
     * Trie un tableau d'objets sur deux niveaux de dates (Descendant).
     * @param arr Le tableau d'objets à trier.
     * @param primarySelector Callback pour la date principale.
     * @param secondarySelector Callback pour la date secondaire (fallback).
     */
    static sortByDatesDescending(arr, primarySelector, secondarySelector) {
        return [...arr].sort((a, b) => {
            const dateA = this.#_getTime(primarySelector(a));
            const dateB = this.#_getTime(primarySelector(b));
            if (dateB !== dateA) {
                return dateA - dateB;
            }
            const subA = this.#_getTime(secondarySelector(a));
            const subB = this.#_getTime(secondarySelector(b));
            return subA - subB;
        });
    }
    /**
     * Récupère le timestamp d'une Date ou d'un nombre.
     * @param value Date ou nombre représentant un timestamp.
     * @returns Le timestamp en millisecondes.
     */
    static #_getTime(value) {
        return value instanceof Date ? value.getTime() : value;
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
        return this.__CONFIG_ATTRIBS_TO_OBSERVE_ ?? [];
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
            this._p_attachCustomShadow() ?? this.attachShadow({ mode: 'open' });
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
            this.render();
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
            this._p_buildDOM(BnumDOM.from(container));
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
    /**
     * Définit plusieurs attributs HTML à la fois.
     * @param attribs Objet contenant les paires nom-valeur des attributs à définir.
     * @returns L'instance courante pour le chaînage.
     */
    attrs(attribs) {
        for (const keys of Object.keys(attribs)) {
            this.attr(keys, attribs[keys]);
        }
        return this;
    }
    /**
     * Essaye de définir un attribut html
     * @param doSomething true pour le définir
     * @param name Nom de l'attribut
     * @param value Nouvelle valeur
     * @returns L'instance courante pour le chaînage.
     */
    condAttr(doSomething, name, value) {
        if (doSomething)
            this.attr(name, value);
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
    trigger(type, detail, options) {
        this.dispatchEvent(new CustomEvent(type, { detail, ...options }));
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
        if (this.constructor.__CONFIG_UPDATE_ALL__ ??
            this._p_isUpdateForAllAttributes())
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
     * Permet d'attacher un shadowroot custom au lieu de juste `{mode:'open'}`
     * @returns Null si pas de root custom.
     */
    _p_attachCustomShadow() {
        return null;
    }
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
        const sheets = [BASE_STYLE];
        const componentStyle = this.constructor.__CACHE_STYLE__;
        if (componentStyle)
            sheets.push(...(Array.isArray(componentStyle) ? componentStyle : [componentStyle]));
        return sheets;
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
        return this.constructor.__CACHE_TEMPLATE__ || null;
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
        return this.constructor.__CONFIG_SHADOW__ ?? true;
    }
    //#endregion
    // ======================
    // === Static API =======
    // ======================
    //#region static
    static _p_WriteAttributes(attrs) {
        if (Object.keys(attrs).length === 0)
            return EMPTY_STRING;
        return ArrayUtils.toStringAttribs(attrs);
    }
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
/**
 * Style commun à tous les BnumElement.
 */
const BASE_STYLE = BnumElement.ConstructCSSStyleSheet(css_248z$r);

class Log {
    static trace(context, ...args) {
        if (BnumConfig.Get('console_logging') &&
            BnumConfig.Get('console_logging_level') <= LogEnum.TRACE)
            console.trace(`[${context}]`, ...args);
    }
    static debug(context, ...args) {
        if (BnumConfig.Get('console_logging') &&
            BnumConfig.Get('console_logging_level') <= LogEnum.DEBUG)
            console.debug(`🔎 [${context}]`, ...args);
    }
    static info(context, ...args) {
        if (BnumConfig.Get('console_logging') &&
            BnumConfig.Get('console_logging_level') <= LogEnum.INFO)
            console.info(`ℹ️ [${context}]`, ...args);
    }
    static warn(context, ...args) {
        if (BnumConfig.Get('console_logging') &&
            BnumConfig.Get('console_logging_level') <= LogEnum.WARN)
            console.warn(`⚠️ [${context}]`, ...args);
    }
    static error(context, ...args) {
        if (BnumConfig.Get('console_logging') &&
            BnumConfig.Get('console_logging_level') <= LogEnum.ERROR)
            console.error(`### [${context}]`, ...args);
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

class RotomecaCookies {
    /**
     * Récupère la valeur d'un cookie par son nom
     * @param name Nom du cookie
     * @returns Valeur du cookie ou null si absent
     */
    get(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }
    /**
     * Définit un cookie
     * @param name Nom du cookie
     * @param value Valeur du cookie
     * @param options Options : nombre de jours de validité et chemin
     */
    set(name, value, options = {}) {
        const { days, path = '/', secure = true, sameSite = 'Lax' } = options;
        let expires = EMPTY_STRING;
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 86_400_000);
            expires = `; expires=${date.toUTCString()}`;
        }
        // Protection contre l'injection via encodeURIComponent et attributs de sécurité
        const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}${expires}; path=${path}; SameSite=${sameSite}${secure ? '; Secure' : EMPTY_STRING}`;
        document.cookie = cookieString;
    }
    /**
     * Supprime un cookie
     * @param name Nom du cookie à supprimer
     */
    delete(name) {
        this.set(name, '', { days: -1 });
    }
}

/**
 *  Classe pour gérer les métadonnées du document HTML (titre, balises meta).
 */
class RotomecaMeta {
    /**
     * Change le titre du document
     */
    set title(value) {
        document.title = value;
    }
    /**
     * Retourne le titre actuel du document
     */
    get title() {
        return document.title;
    }
    /**
     * Définit une balise meta standard (name="description")
     * @param content Contenu de la balise meta description
     */
    setDescription(content) {
        return this.#updateMeta('name', 'description', content);
    }
    /**
     * Définit une balise OpenGraph (property="og:image")
     * @param property Nom de la propriété OpenGraph (ex: "image")
     * @param content Valeur de la propriété
     */
    setOgTag(property, content) {
        return this.#updateMeta('property', `og:${property}`, content);
    }
    /**
     * Méthode générique interne pour créer ou mettre à jour une balise meta
     * @param attrKey "name" ou "property"
     * @param attrValue Valeur de l'attribut
     * @param content Contenu de la balise meta
     * @private
     */
    #updateMeta(attrKey, attrValue, content) {
        let tag = document.querySelector(`meta[${attrKey}="${attrValue}"]`);
        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute(attrKey, attrValue);
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
        return this;
    }
}

class RotomecaScripts {
    /**
     * Cache pour ne pas charger 2 fois le même script
     * @private
     */
    #_loaded = new Set();
    /**
     * Charge un script externe et attend qu'il soit prêt
     * @param url URL du script à charger
     * @param options async et defer (par défaut true)
     * @returns Promise résolue quand le script est chargé
     */
    load(url, { async = true, defer = true } = {}) {
        if (this.#_loaded.has(url))
            return Promise.resolve();
        // Si le script est déjà dans le DOM (ajouté manuellement)
        if (document.querySelector(`script[src="${url}"]`)) {
            this.#_loaded.add(url);
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = async;
            script.defer = defer;
            script.onload = () => {
                this.#_loaded.add(url);
                resolve();
            };
            script.onerror = () => {
                reject(new Error(`RotomecaScripts: Failed to load script ${url}`));
            };
            document.head.appendChild(script);
        });
    }
}

/**
 * Gère un ensemble de feuilles de style CSS dynamiques pour l'application.
 * Permet d'ajouter, supprimer et mettre à jour des règles CSS à la volée.
 */
class RotomecaStyleSheets {
    /**
     * Identifiant de la mise à jour planifiée (requestAnimationFrame).
     * Null si aucune mise à jour n'est en attente.
     */
    #_pendingUpdate = null;
    /**
     * Indique si la feuille de style native a été montée dans le document.
     */
    #_mounted = false;
    /**
     * Registre des règles CSS, indexées par identifiant.
     */
    #_registry = new Map();
    /**
     * Map des fonctions de nettoyage des listeners pour chaque règle.
     */
    #_listenersDisposers = new Map();
    /**
     * Feuille de style native utilisée pour injecter les règles dans le DOM.
     */
    #_nativeSheet = new CSSStyleSheet();
    /**
     * Ajoute une règle CSS avec un identifiant spécifique.
     * @param id Identifiant unique de la règle.
     * @param rule Règle CSS à ajouter.
     */
    add(id, rule) {
        if (this.#_registry.has(id)) {
            console.warn('/!\\[RotomecaStyleSheets/add]', `Rule with id '${id}' already exists.`);
            return this;
        }
        rule.onUpdate.add(id, () => this.#_scheduleRender());
        this.#_listenersDisposers.set(id, () => {
            rule.onUpdate.remove(id);
        });
        this.#_registry.set(id, rule);
        return this.#_scheduleRender();
    }
    /**
     * Ajoute une règle CSS et génère automatiquement un identifiant.
     * @param rule Règle CSS à ajouter.
     * @returns L'identifiant généré.
     */
    push(rule) {
        const id = this.#_generateId();
        void this.add(id, rule);
        return id;
    }
    /**
     * Ajoute plusieurs règles CSS à la feuille de style.
     * @param rules Liste des règles à ajouter.
     */
    addMultiples(...rules) {
        for (const rule of rules) {
            this.push(rule);
        }
        return this;
    }
    /**
     * Supprime une règle CSS par son identifiant.
     * @param id Identifiant de la règle à supprimer.
     */
    remove(id) {
        if (this.#_registry.has(id)) {
            const disposer = this.#_listenersDisposers.get(id);
            if (disposer)
                disposer();
            this.#_listenersDisposers.delete(id);
            this.#_registry.delete(id);
            return this.#_scheduleRender();
        }
        return this;
    }
    /**
     * Supprime toutes les règles CSS de la feuille de style.
     */
    clear() {
        for (const disposer of this.#_listenersDisposers.values()) {
            disposer();
        }
        this.#_registry.clear();
        this.#_listenersDisposers.clear();
        return this.#_scheduleRender();
    }
    /**
     * Monte la feuille de style native dans le document si ce n'est pas déjà fait.
     * @private
     */
    #_mount() {
        if (!this.#_mounted &&
            !document.adoptedStyleSheets.includes(this.#_nativeSheet)) {
            document.adoptedStyleSheets = [
                ...document.adoptedStyleSheets,
                this.#_nativeSheet,
            ];
            this.#_mounted = true;
        }
        return this;
    }
    /**
     * Planifie un rendu asynchrone de la feuille de style.
     * @private
     */
    #_scheduleRender() {
        if (this.#_pendingUpdate)
            return this;
        this.#_pendingUpdate = requestAnimationFrame(() => {
            this.#_render();
            this.#_pendingUpdate = null;
        });
        return this;
    }
    /**
     * Génère le CSS et le remplace dans la feuille de style native.
     * @private
     */
    #_render() {
        if (this.#_registry.size === 0) {
            this.#_nativeSheet.replaceSync(EMPTY_STRING);
            return this;
        }
        const cssContent = Array.from(this.#_registry.values())
            .map((rule) => rule.toString())
            .join('\n');
        this.#_nativeSheet.replaceSync(cssContent);
        return this.#_mount();
    }
    /**
     * Génère un identifiant unique pour une nouvelle règle CSS.
     * @private
     */
    #_generateId() {
        do {
            var id = `bnum-stylesheet-${crypto.randomUUID().substring(0, 8)}`;
        } while (this.#_registry.has(id));
        return id;
    }
}

/**
 * Singleton pour accéder aux feuilles de style dynamiques de l'application.
 */
class RotomecaDocument {
    /**
     * Instance unique de RotomecaDocument.
     * @private
     */
    static #_instance = null;
    /**
     * Retourne l'instance unique de RotomecaDocument.
     * @deprecated Utilisez RotomecaDocument.Instance à la place.
     */
    static get instance() {
        return this.Instance;
    }
    static get Instance() {
        return (this.#_instance ??= new RotomecaDocument());
    }
    /**
     * Instance des feuilles de style dynamiques.
     * @private
     */
    #_styleSheets = null;
    /**
     * Retourne l'ensemble des feuilles de style dynamiques.
     */
    get styleSheets() {
        return (this.#_styleSheets ??= new RotomecaStyleSheets());
    }
    #_meta = null;
    /**
     * Retourne l'objet de gestion des métadonnées du document.
     */
    get meta() {
        return (this.#_meta ??= new RotomecaMeta());
    }
    #_scripts = null;
    /**
     * Retourne l'objet de gestion des scripts du document.
     */
    get scripts() {
        return (this.#_scripts ??= new RotomecaScripts());
    }
    #_cookies = null;
    /**
     * Retourne l'objet de gestion des cookies du document.
     */
    get cookies() {
        return (this.#_cookies ??= new RotomecaCookies());
    }
    /**
     * Retourne l'objet Document du navigateur.
     */
    get document() {
        return document;
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

/**
 * Représente une règle CSS composée d'un sélecteur et de propriétés.
 * Permet d'ajouter ou de retirer dynamiquement des propriétés.
 */
class RotomecaCssRule {
    /**
     * Sélecteur CSS de la règle.
     * @private
     */
    #_selectorText;
    /**
     * Liste des propriétés CSS associées à la règle.
     * @private
     */
    #_properties;
    /**
     * Gestionnaire d'événements pour les changements de la règle.
     * @private
     */
    #_onUpdate = null;
    /**
     * Événement déclenché lors d'une modification de la règle.
     */
    get onUpdate() {
        return (this.#_onUpdate ??= new JsEvent());
    }
    /**
     * @param selectorText Sélecteur CSS de la règle.
     * @param args Propriétés CSS de la règle.
     */
    constructor(selectorText, ...args) {
        this.#_selectorText = selectorText;
        this.#_properties = args;
        for (const prop of this.#_properties) {
            prop.event.push(() => this.#_notifyParent());
        }
    }
    /**
     * Retourne le sélecteur CSS de la règle.
     */
    get selectorText() {
        return this.#_selectorText;
    }
    /**
     * Ajoute une propriété à la règle CSS.
     * @param prop Propriété à ajouter.
     */
    addProperty(prop) {
        this.#_properties.push(prop);
        prop.event.push(() => this.#_notifyParent());
        this.#_notifyParent();
        return this;
    }
    /**
     * Retourne une propriété de la règle CSS par son index.
     * @param index Index de la propriété à récupérer.
     */
    get(index) {
        return this.#_properties[index];
    }
    /**
     * Supprime une propriété de la règle CSS par son nom.
     * @param propName Nom de la propriété à supprimer.
     * @param options all: supprime toutes les occurrences si true.
     */
    removeProperty(propName, { all = false } = {}) {
        let stop = false;
        this.#_properties = this.#_properties.filter((prop) => {
            if (stop)
                return true;
            if (prop.name === propName) {
                if (!all)
                    stop = true;
                return false;
            }
            return true;
        });
        this.#_notifyParent();
        return this;
    }
    /**
     * Retourne la règle CSS sous forme de chaîne.
     */
    toString() {
        const props = this.#_properties
            .map((prop) => `  ${prop.toString()}`)
            .join('\n');
        return `${this.#_selectorText} {\n${props}\n}`;
    }
    /**
     * Notifie les listeners parents qu'une modification a eu lieu.
     * @private
     */
    #_notifyParent() {
        if (this.#_onUpdate && this.#_onUpdate.count() > 0)
            this.#_onUpdate.call();
    }
}

/**
 * Représente une propriété CSS (nom, valeur, important).
 * Permet de notifier les changements de valeur.
 */
class RotomecaCssProperty {
    /**
     * Nom de la propriété CSS.
     * @private
     */
    #_name;
    /**
     * Valeur de la propriété CSS.
     * @private
     */
    #_value;
    /**
     * Indique si la propriété est !important.
     * @private
     */
    #_important;
    /**
     * Gestionnaire d'événements pour les changements de la propriété.
     * @private
     */
    #_listeners = null;
    /**
     * Événement déclenché lors d'une modification de la propriété.
     */
    get event() {
        return (this.#_listeners ??= new JsEvent());
    }
    /**
     * @param name Nom de la propriété CSS.
     * @param value Valeur de la propriété CSS.
     * @param important Indique si la propriété est !important.
     */
    constructor(name, value, important = false) {
        this.#_name = name;
        this.#_value = value;
        this.#_important = important;
    }
    /**
     * Modifie la valeur de la propriété CSS.
     */
    set value(value) {
        if (this.#_value !== value) {
            this.#_value = value;
            this.#_notify();
        }
    }
    /**
     * Modifie l'état important de la propriété CSS.
     */
    set important(important) {
        if (this.#_important !== important) {
            this.#_important = important;
            this.#_notify();
        }
    }
    /**
     * Modifie le nom de la propriété CSS.
     */
    set name(name) {
        if (this.#_name !== name) {
            this.#_name = name;
            this.#_notify();
        }
    }
    /**
     * Retourne la valeur de la propriété CSS.
     */
    get value() {
        return this.#_value;
    }
    /**
     * Retourne le nom de la propriété CSS.
     */
    get name() {
        return this.#_name;
    }
    /**
     * Retourne si la propriété est !important.
     */
    get important() {
        return this.#_important;
    }
    /**
     * Retourne la propriété CSS sous forme de chaîne.
     */
    toString() {
        return `${this.#_name}: ${this.#_value}${this.#_important ? ' !important' : EMPTY_STRING};`;
    }
    /**
     * Notifie les listeners qu'une modification a eu lieu.
     * @private
     */
    #_notify() {
        if (this.#_listeners)
            this.#_listeners.call();
    }
}

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
    _p_addStates(...states) {
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
     * @returns Générateur d'éléments de type T[] ou symbol.
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

var css_248z$q = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{border-radius:var(--bnum-badge-border-radius,100px);display:var(--bnum-badge-display,inline-block);padding:var(--bnum-badge-padding,var(--bnum-space-xs,5px))}:host(:state(is-circle)){aspect-ratio:1;border-radius:var(--bnum-badge-circle-border-radius,100%)}:host(:state(is-circle)) span{align-items:center;display:flex;height:100%;justify-content:center}:host(:state(variation-primary)){background-color:var(--bnum-badge-primary-color,var(--bnum-color-primary,#000091));color:var(--bnum-badge-primary-text-color,var(--bnum-text-on-primary,#f5f5fe))}:host(:state(variation-secondary)){background-color:var(--bnum-badge-secondary-color,var(--bnum-color-secondary,#3a3a3a));color:var(--bnum-badge-secondary-text-color,var(--bnum-text-on-secondary,#fff))}:host(:state(variation-secondary)){border:var(--bnum-badge-type,solid) var(--bnum-badge-size,thin) var(--bnum-badge-secondary-text-color,var(--bnum-text-on-secondary,#fff))}:host(:state(variation-danger)){background-color:var(--bnum-badge-danger-color,var(--bnum-color-danger,#ce0500));color:var(--bnum-badge-danger-text-color,var(--bnum-text-on-danger,#f5f5fe))}";

/**
 * Décorateur de classe pour définir un Web Component.
 * * Il gère automatiquement :
 * 1. L'enregistrement du Custom Element via `customElements.define`.
 * 2. La création et la mise en cache du Template (Performance).
 * 3. La création et la mise en cache des Styles (Performance).
 * 4. La définition de la propriété statique `TAG` sur la classe.
 *
 * @param options Les options de configuration (tag, template, style)
 * @example
 * ```tsx
 * const VIEW = <div class="box"><slot /></div>;
 * @Define({
 * tag: 'my-component',
 * template: VIEW,
 * styles: '.box { color: red; }'
 * })
 * export class MyComponent extends BnumElementInternal {
 * // Pas besoin de déclarer static get TAG(), c'est automatique !
 * }
 * ```
 */
function Define(options = {}) {
    return function (target, context) {
        // Vérification de sécurité : on ne décore que des classes
        if (context.kind !== 'class') {
            throw new Error('@Define ne peut être utilisé que sur une classe.');
        }
        // Initialisation unique au chargement de la classe (Load Time)
        context.addInitializer(function () {
            const clazz = this;
            // ---------------------------------------------------------
            // 1. INJECTION DU STATIC TAG
            // ---------------------------------------------------------
            if (options.tag) {
                // On définit ou redéfinit la propriété statique 'TAG'
                Object.defineProperty(clazz, 'TAG', {
                    get: () => options.tag,
                    configurable: true, // Permet d'être reconfiguré si nécessaire
                    enumerable: true,
                });
            }
            // Vérification finale pour s'assurer qu'on a un TAG valide
            const finalTag = clazz.TAG;
            if (!finalTag) {
                console.warn(`[Define] La classe ${context.name} n'a pas de TAG défini (ni via options, ni via static TAG).`);
                return; // On ne peut pas enregistrer sans tag
            }
            // ---------------------------------------------------------
            // 2. COMPILATION UNIQUE DU TEMPLATE (CACHE)
            // ---------------------------------------------------------
            if (options.template) {
                const tpl = document.createElement('template');
                if (options.template instanceof Node) {
                    // Support du JSX DOM Node
                    tpl.content.appendChild(options.template);
                }
                else {
                    // Support du JSX String ou HTML String
                    tpl.innerHTML = String(options.template);
                }
                // Stockage caché sur le constructeur
                clazz.__CACHE_TEMPLATE__ = tpl;
            }
            // ---------------------------------------------------------
            // 3. COMPILATION UNIQUE DES STYLES (CACHE)
            // ---------------------------------------------------------
            if (options.styles)
                initStyle(clazz, options.styles);
            // ---------------------------------------------------------
            // 4. ENREGISTREMENT DU WEB COMPONENT
            // ---------------------------------------------------------
            if (!customElements.get(finalTag)) {
                customElements.define(finalTag, clazz);
            }
        });
    };
}
/**
 * Fonction qui gère le style de la classe
 *
 * @remark
 * Prend en compte les tableaux de string et les tableaux de CSSStyleSheet, mais aussi ces types la, à l'unitée.
 *
 * Voir {@link Style}
 *
 * @param clazz Classe qui contiendra le cache
 * @param styles Styles à ajouter au cache
 * @internal
 */
function initStyle(clazz, styles) {
    let strStyles;
    const array = Array.isArray(styles) ? styles : [styles];
    clazz.__CACHE_STYLE__ = [];
    for (const style of array) {
        if (style instanceof CSSStyleSheet)
            clazz.__CACHE_STYLE__.push(style);
        else if (!strStyles)
            strStyles = style;
        else
            strStyles += style;
    }
    if (strStyles && strStyles !== EMPTY_STRING) {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(strStyles);
        clazz.__CACHE_STYLE__.push(sheet);
    }
}

/**
 * @Attr : Synchronise une propriété (auto-accessor) avec un attribut HTML.
 * Gère dynamiquement les types string, boolean et number.
 */
function Attr(attributeName) {
    return function (_target, context) {
        const attrName = attributeName || String(context.name);
        return {
            get() {
                const val = this.getAttribute(attrName);
                // Logique de conversion selon la valeur de l'attribut
                // On utilise "as unknown as Value" pour satisfaire le compilateur
                if (val === EMPTY_STRING || val === 'true')
                    return true;
                if (val === null)
                    return false;
                // Si c'est un nombre (on vérifie si la conversion est possible)
                const num = Number(val);
                if (val !== EMPTY_STRING && !isNaN(num))
                    return num;
                return val;
            },
            set(value) {
                if (value === null || value === undefined || value === false) {
                    this.removeAttribute(attrName);
                }
                else {
                    // Si c'est un booléen true, on met un attribut vide (pattern HTML standard)
                    const strVal = value === true ? EMPTY_STRING : String(value);
                    this.setAttribute(attrName, strVal);
                }
            },
        };
    };
}
function Data(nameOrOptions, maybeOptions) {
    // 1. Déduction intelligente des arguments
    let attributeName;
    let setter = true;
    if (typeof nameOrOptions === 'string') {
        attributeName = nameOrOptions;
        setter = maybeOptions?.setter ?? true;
    }
    else if (typeof nameOrOptions === 'object') {
        setter = nameOrOptions.setter ?? true;
    }
    return function (_target, context) {
        // 2. Nettoyage du nom (ex: #_icon devient icon)
        // On enlève le # et le _ au début pour le nom de l'attribut data
        const autoName = String(context.name).replace(/^[#_]+/, '');
        const finalAttrName = attributeName || autoName;
        return {
            get() {
                const val = typeof this.data === 'function'
                    ? this.data(finalAttrName)
                    : this.getAttribute(`data-${finalAttrName}`);
                if (val === EMPTY_STRING || val === 'true')
                    return true;
                if (val === null || val === undefined)
                    return _target.get.call(this);
                const num = Number(val);
                if (val !== EMPTY_STRING && !isNaN(num))
                    return num;
                return val;
            },
            set(value) {
                if (!setter)
                    return;
                const isFalsy = value === null || value === undefined || value === false;
                const strVal = value === true ? EMPTY_STRING : String(value);
                if (typeof this.data === 'function') {
                    this.data(finalAttrName, isFalsy ? null : strVal);
                }
                else {
                    const domAttrName = `data-${finalAttrName}`;
                    if (isFalsy)
                        this.removeAttribute(domAttrName);
                    else
                        this.setAttribute(domAttrName, strVal);
                }
            },
        };
    };
}
/**
 * Option pour Data pour indiquer qu'un accessor ne devrait pas avoir de setter.
 *
 * @example
 * ```typescript
 * ///
 * @Data(NO_SETTER)
 * accessor #_label!: string;
 * ```
 */
const NO_SETTER = { setter: false };

/**
 * @SetAttr : Ajoute un attribut avec une valeur fixe à un élément.
 * @param attributeName Nom de l'attribut à ajouter.
 * @param value Valeur de l'attribut à définir.
 * @returns Un décorateur de méthode qui ajoute l'attribut à l'élément.
 */
function SetAttr(attributeName, value) {
    return function (originalMethod, context) {
        if (context.kind !== 'method')
            return;
        return function (..._args) {
            const rtn = originalMethod.apply(this, _args);
            _setAttribute(this, attributeName, value);
            return rtn;
        };
    };
}
/**
 * @SetAttrs : Ajoute un attribut avec une valeur fixe à un élément.
 * @param attributeName Nom de l'attribut à ajouter.
 * @param value Valeur de l'attribut à définir.
 * @returns Un décorateur de méthode qui ajoute l'attribut à l'élément.
 */
function SetAttrs(attribs) {
    return function (originalMethod, context) {
        if (context.kind !== 'method')
            return;
        return function (..._args) {
            if (this?.attrs)
                this.attrs(attribs);
            else {
                for (const [key, value] of Object.entries(attribs)) {
                    this.setAttribute(key, value);
                }
            }
            return originalMethod.apply(this, _args);
        };
    };
}
/**
 * @SetAttr : Ajoute un attribut avec une valeur fixe à un élément.
 * @param attributeName Nom de l'attribut à ajouter.
 * @param value Valeur de l'attribut à définir.
 * @returns Un décorateur de méthode qui ajoute l'attribut à l'élément.
 */
function InitAttr(attributeName, value) {
    return function (originalMethod, context) {
        if (context.kind !== 'method')
            return;
        return function (..._args) {
            const rtn = originalMethod.apply(this, _args);
            if (_getAttribute(this, attributeName) === null)
                _setAttribute(this, attributeName, value);
            return rtn;
        };
    };
}
function _setAttribute(instance, attributeName, value) {
    if (instance?.attr)
        instance.attr(attributeName, value);
    else
        instance.setAttribute(attributeName, value);
}
function _getAttribute(instance, attributeName) {
    if (instance?.attr)
        return instance.attr(attributeName);
    else
        return instance.getAttribute(attributeName);
}

/**
 * @Autobind : Lie automatiquement la méthode à l'instance.
 */
function Autobind(originalMethod, context) {
    context.addInitializer(function () {
        this[context.name] = originalMethod.bind(this);
    });
}

/**
 * @Fire : Déclenche un événement personnalisé.
 * Utilise la méthode trigger() de BnumElement si elle existe (Fluent API),
 * sinon utilise le dispatchEvent standard.
 */
function Fire(eventName, options = { bubbles: true, composed: true }) {
    return function (originalMethod, context) {
        if (context.kind !== 'method')
            return;
        return function (...args) {
            const result = originalMethod.apply(this, args);
            const detail = result ?? args[0];
            // Utilisation de trigger (BnumElement) ou dispatchEvent (Standard)
            if (typeof this.trigger === 'function') {
                this.trigger(eventName, detail, options);
            }
            else {
                this.dispatchEvent(new CustomEvent(eventName, { ...options, detail }));
            }
            return result;
        };
    };
}
/**
 * @CustomFire : Décorateur de méthode (Stage 3).
 * Déclenche un événement d'une classe spécifique lors de l'appel de la méthode.
 * * @param EventClass La classe de l'événement à instancier (doit étendre CustomEvent).
 * @param eventName Optionnel : Force un nom d'événement spécifique.
 * @param options Options d'initialisation (bubbles, composed, etc.).
 */
function CustomFire(EventClass, eventName, options = { bubbles: true, composed: true }) {
    return function (originalMethod, context) {
        if (context.kind !== 'method')
            return;
        return function (...args) {
            const result = originalMethod.apply(this, args);
            const detail = result ?? args[0];
            const eventInit = { ...options, detail };
            const event = _____StCustomFire
                .tryInitEvent(EventClass, eventName, eventInit)
                .unwrapOr(new EventClass(result));
            this.dispatchEvent(event);
            return result;
        };
    };
}
let _____StCustomFire = (() => {
    let _staticExtraInitializers = [];
    let _static_tryInitEvent_decorators;
    return class _____StCustomFire {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _static_tryInitEvent_decorators = [Risky()];
            __esDecorate(this, null, _static_tryInitEvent_decorators, { kind: "method", name: "tryInitEvent", static: true, private: false, access: { has: obj => "tryInitEvent" in obj, get: obj => obj.tryInitEvent }, metadata: _metadata }, null, _staticExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(this, _staticExtraInitializers);
        }
        static tryInitEvent(EventClass, eventName, eventInit) {
            const event = eventName
                ? new EventClass(eventName, eventInit)
                : new EventClass(eventInit);
            return ATresult.Ok(event);
        }
    };
})();

/**
 * @Self : Injecte la classe (le constructeur) dans la propriété.
 * Utilisable sur un champ simple : @Self _!: typeof MaClasse;
 */
function Self(_value, context) {
    if (context.kind !== 'field') {
        throw new Error('@Self ne peut être utilisé que sur un champ (field).');
    }
    // On enregistre une fonction qui s'exécutera à la création de l'instance
    context.addInitializer(function () {
        // On assigne le constructeur à la propriété (ex: '_')
        this[context.name] = this.constructor;
    });
}

function Light() {
    return function (target, context) {
        if (context.kind !== 'class') {
            throw new Error('@Light ne peut être utilisé que sur une classe.');
        }
        if (!(target.prototype instanceof BnumElement))
            throw new Error('@Light ne peut être utiliser sur une classe qui hérite de BnumElement');
        context.addInitializer(function () {
            this.__CONFIG_SHADOW__ = false;
        });
    };
}

/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/**
 * Décorateur de classe.
 * Indique que ce composant doit déclencher une mise à jour complète (`_p_update`)
 * à chaque modification d'un attribut observé.
 *  Cela évite d'avoir à surcharger manuellement `_p_isUpdateForAllAttributes`.
 * @example
 * ```tsx
 * // imports ...
 *
 * @Define({ ... })
 * @UpdateAll()
 * export class MyComponent extends BnumElementInternal { ... }
 * ```
 */
function UpdateAll() {
    return function (_, context) {
        if (context.kind !== 'class') {
            throw new Error('@UpdateAll ne peut être utilisé que sur une classe.');
        }
        context.addInitializer(function () {
            this.__CONFIG_UPDATE_ALL__ = true;
        });
    };
}

const TAG_PREFIX = BnumConfig.Get('tag_prefix');
const TAG_ICON = `${TAG_PREFIX}-icon`;
const TAG_BUTTON = `${TAG_PREFIX}-button`;
const TAG_PRIMARY = `${TAG_PREFIX}-primary-button`;
const TAG_SECONDARY = `${TAG_PREFIX}-secondary-button`;
const TAG_DANGER = `${TAG_PREFIX}-danger-button`;
const TAG_HELPER = `${TAG_PREFIX}-helper`;
const TAG_CARD_TITLE = `${TAG_PREFIX}-card-title`;
const TAG_CARD = `${TAG_PREFIX}-card`;
const TAG_CARD_EMAIL = `${TAG_PREFIX}-card-email`;
const TAG_CARD_AGENDA = `${TAG_PREFIX}-card-agenda`;
const TAG_CARD_ITEM = `${TAG_PREFIX}-card-item`;
const TAG_CARD_ITEM_MAIL = `${TAG_PREFIX}-card-item-mail`;
const TAG_CARD_ITEM_AGENDA = `${TAG_PREFIX}-card-item-agenda`;
const TAG_CARD_LIST = `${TAG_PREFIX}-card-list`;
const TAG_DATE = `${TAG_PREFIX}-date`;
const TAG_ICON_BUTTON = `${TAG_PREFIX}-icon-button`;
const TAG_COLUMN = `${TAG_PREFIX}-column`;
const TAG_INPUT = `${TAG_PREFIX}-input`;
const TAG_INPUT_DATE = `${TAG_INPUT}-date`;
const TAG_INPUT_NUMBER = `${TAG_INPUT}-number`;
const TAG_INPUT_SEARCH = `${TAG_INPUT}-search`;
const TAG_INPUT_TEXT = `${TAG_INPUT}-text`;
const TAG_INPUT_TIME = `${TAG_INPUT}-time`;
const TAG_FOLDER = `${TAG_PREFIX}-folder`;
const TAG_HIDE = `${TAG_PREFIX}-hide`;
const TAG_FOLDER_LIST = `${TAG_PREFIX}-folder-list`;
const TAG_HEADER = `${TAG_PREFIX}-header`;
const TAG_SEGMENTED_ITEM$1 = `${TAG_PREFIX}-segmented-item`;
const TAG_SEGMENTED_CONTROL = `${TAG_PREFIX}-segmented-control`;
const TAG_SELECT = `${TAG_PREFIX}-select`;
const TAG_BADGE = `${TAG_PREFIX}-badge`;
const TAG_FRAGMENT = `${TAG_PREFIX}-fragment`;
const TAG_RADIO = `${TAG_PREFIX}-radio`;
const TAG_RADIO_GROUP = `${TAG_PREFIX}-radio-group`;
const TAG_TREE = `${TAG_PREFIX}-tree`;

//#endregion Types
//#region Global constants
const DATA_VALUE = 'value';
const DATA_VARIATION = 'variation';
const ATTR_VALUE = 'data-value';
const ATTR_VARIATION$1 = 'data-variation';
const ATTR_CIRCLE = 'circle';
const VARIATION_PRIMARY = 'primary';
// Not used currently
// const VARIATION_SECONDARY = 'secondary';
// const VARIATION_DANGER = 'danger';
const STATE_HAS_VALUE = 'has-value';
const STATE_NO_VALUE = 'no-value';
const STATE_IS_CIRCLE = 'is-circle';
const STATE_VARIATION_PREFIX = 'variation-';
//#endregion Global constants
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
 * @attr {string} data-value - Valeur affichée dans le badge.
 * @attr {'primary' | 'secondary' | 'danger'} (optional) (default:'primary') data-variation - Variation du badge.
 * @attr {any} (optional) circle - Indique si le badge doit être affiché en cercle.
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
let HTMLBnumBadge = (() => {
    let _classDecorators = [Define({
            styles: css_248z$q,
            tag: TAG_BADGE,
        }), UpdateAll()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private Fields
        /**
         * Valeur affichée dans le badge.
         */
        #_value = EMPTY_STRING;
        /**
         * Planificateur de mise à jour asynchrone.
         */
        #_updateSchduler = null;
        /**
         * Élément span contenant la valeur du badge.
         */
        #_spanElement = null;
        //#endregion Private Fields
        //#region Getters/Setters
        /**
         * Récupère la valeur depuis l'attribut data-value.
         */
        get #_dataValue() {
            return this.data(DATA_VALUE) || EMPTY_STRING;
        }
        /**
         * Récupère la variation depuis l'attribut data-variation.
         */
        get #_dataVariation() {
            return this.data(DATA_VARIATION) || VARIATION_PRIMARY;
        }
        /**
         * Valeur affichée dans le badge.
         */
        get value() {
            if (!this.alreadyLoaded)
                this.#_value = this.#_dataValue;
            return this.#_value;
        }
        set value(value) {
            if (!this.alreadyLoaded)
                this.removeAttribute(ATTR_VALUE);
            this.#_value = value;
            this.#_requestUpdate();
        }
        /**
         * Variation de style du badge.
         */
        get variation() {
            return this.#_dataVariation;
        }
        set variation(value) {
            this.data(DATA_VARIATION, value);
            this.#_requestUpdate();
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
        }
        /**
         * Construit le DOM interne du composant.
         */
        _p_buildDOM(container) {
            super._p_buildDOM(container);
            this.#_spanElement = this._p_createSpan();
            container.appendChild(this.#_spanElement);
            const force = true;
            this.#_update(force);
        }
        /**
         * Met à jour le composant lors d'un changement d'attribut.
         */
        _p_update() {
            return this.#_update();
        }
        //#endregion Lifecycle
        //#region Private Methods
        /**
         * Demande une mise à jour asynchrone du composant.
         */
        #_requestUpdate() {
            (this.#_updateSchduler ??= new Scheduler(() => {
                this.#_update();
            })).schedule(0);
            return this;
        }
        /**
         * Met à jour l'affichage du badge selon ses propriétés et attributs.
         */
        #_update(force = false) {
            if (!this.alreadyLoaded && !force)
                return;
            this._p_clearStates();
            const value = this.value;
            this.#_spanElement.textContent = value;
            if (value !== EMPTY_STRING)
                this._p_addState(STATE_HAS_VALUE);
            else
                this._p_addState(STATE_NO_VALUE);
            if (this.hasAttribute(ATTR_CIRCLE))
                this._p_addState(STATE_IS_CIRCLE);
            this._p_addState(`${STATE_VARIATION_PREFIX}${this.variation}`);
        }
        //#endregion Private Methods
        //#region Static Methods
        /**
         * Attributs observés pour ce composant.
         */
        static _p_observedAttributes() {
            return [ATTR_CIRCLE];
        }
        /**
         * Crée un badge via JavaScript.
         * @param value Valeur à afficher
         * @param options Options de création (cercle, variation)
         */
        static Create(value, { circle = false, variation = undefined, } = {}) {
            const badge = document.createElement(this.TAG);
            return badge
                .attr(ATTR_VALUE, value)
                .condAttr(circle, ATTR_CIRCLE, true)
                .condAttr(variation !== undefined, ATTR_VARIATION$1, variation);
        }
        /**
         * Génère le HTML d'un badge.
         * @param value Valeur à afficher
         * @param attrs Attributs additionnels
         */
        static Write(value, attrs = {}) {
            const attributes = this._p_WriteAttributes(attrs);
            return `<${this.TAG} ${ATTR_VALUE}="${value}" ${attributes}></${this.TAG}>`;
        }
    });
    return _classThis;
})();

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

function OnIconChangeInitializer$1(event, instance) {
    event.push((newValue, oldValue) => {
        instance.dispatchEvent(new ElementChangedEvent(EVENT_ICON, newValue, oldValue, instance));
    });
}
function OnLoadingStateChangeInitializer(event, instance) {
    event.push(instance._p_onLoadingChange);
}
function OnIconPropChangeInitializer(event, instance) {
    event.push((type, newValue) => {
        instance.dispatchEvent(new CustomEvent(EVENT_ICON_PROP_CHANGED, {
            detail: { type, newValue },
        }));
    });
}
function OnVariationChangeInitializer(event, instance) {
    event.push((newValue, oldValue) => {
        instance.dispatchEvent(new ElementChangedEvent(EVENT_VARIATION, newValue, oldValue, instance));
    });
}
function OnClickInitializer(event, instance) {
    instance.addEventListener('click', () => {
        event.call();
    });
}

// --- Component Identity ---
// --- CSS Classes ---
const CLASS_WRAPPER = 'wrapper';
const CLASS_SLOT = 'slot';
const CLASS_ICON = 'icon';
// --- Attributes ---
const ATTR_ROUNDED = 'rounded';
const ATTR_LOADING = 'loading';
const ATTR_DISABLED$1 = 'disabled';
const ATTR_VARIATION = 'variation'; // or 'data-variation'
const ATTR_ICON$1 = 'icon';
const ATTR_ICON_POS = 'icon-pos';
const ATTR_ICON_MARGIN = 'icon-margin';
const ATTR_HIDE = 'hide';
// --- States (Internal/CSS) ---
const STATE_ICON$1 = 'icon';
const STATE_WITHOUT_ICON = 'without-icon';
const STATE_ROUNDED = 'rounded';
const STATE_LOADING$1 = 'loading';
const STATE_DISABLED$2 = 'disabled';
// --- Events ---
const EVENT_ICON = 'icon'; // Suffix
const EVENT_VARIATION = 'variation'; // Suffix
const EVENT_ICON_PROP_CHANGED = 'custom:icon.prop.changed';
const EVENT_LOADING_STATE_CHANGED = 'custom:loading';
// --- Defaults & CSS Vars ---
const DEFAULT_CSS_VAR_ICON_MARGIN = 'var(--custom-bnum-button-icon-margin, 10px)';
const ICON_PROP_POS = 'pos';
const CSS_PROPERTY_ICON_MARGIN = '--bnum-button-icon-gap';
// --- Logic Helpers ---
// Definition for attribute mapping in Factory
const BUTTON_ATTRIBUTE_MAP = [
    { prop: 'rounded', attr: ATTR_ROUNDED, isBool: true },
    { prop: 'loading', attr: ATTR_LOADING, isBool: true },
    { prop: 'icon', attr: `data-${ATTR_ICON$1}` },
    { prop: 'iconPos', attr: `data-${ATTR_ICON_POS}` },
    { prop: 'variation', attr: `data-${ATTR_VARIATION}` },
    { prop: 'hideOn', attr: `data-${ATTR_HIDE}` },
    { prop: 'iconMargin', attr: `data-${ATTR_ICON_MARGIN}` },
];
// Default Options for Factory
const DEFAULT_BUTTON_OPTIONS = {
    text: '',
    iconPos: 'right', // Assumes 'right' is default in enum
    rounded: false,
    loading: false,
};

const ButtonVariation = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    TERTIARY: 'tertiary',
    DANGER: 'danger',
};
const IconPosition = {
    LEFT: 'left',
    RIGHT: 'right',
};
const HideTextOnLayoutSize = {
    SMALL: 'small',
    TOUCH: 'touch',
};

// core/jsx/index.ts
const VOID_TAGS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]);
function h(tag, props, ...argsChildren) {
    if (typeof tag === 'function' && 'TAG' in tag) {
        tag = tag.TAG;
    }
    if (typeof tag === 'function') {
        const children = argsChildren.length ? argsChildren : props?.children || [];
        return tag({ ...props, children });
    }
    let attrs = EMPTY_STRING;
    if (props) {
        for (const key in props) {
            const value = props[key];
            if (key === 'children' || value == null || value === false)
                continue;
            const name = key === 'className' ? 'class' : key;
            if (key === 'style' && typeof value === 'object') {
                let styleStr = EMPTY_STRING;
                for (const sKey in value) {
                    styleStr += `${sKey}:${value[sKey]};`;
                }
                attrs += ` ${name}="${styleStr}"`;
            }
            else if (value === true) {
                attrs += ` ${name}`;
            }
            else {
                attrs += ` ${name}="${value}"`;
            }
        }
    }
    const open = `<${tag}${attrs}>`;
    if (VOID_TAGS.has(tag))
        return open;
    const rawChildren = argsChildren.length > 0 ? argsChildren : props?.children;
    const content = renderChildren(rawChildren);
    return `${open}${content}</${tag}>`;
}
// Helper récursif ultra-rapide pour les enfants
function renderChildren(child) {
    if (child == null || child === false || child === true)
        return EMPTY_STRING;
    if (Array.isArray(child)) {
        let str = EMPTY_STRING;
        for (let i = 0; i < child.length; i++) {
            str += renderChildren(child[i]);
        }
        return str;
    }
    return String(child);
}

/**
 * RegEx qui permet de vérifier si un texte possède uniquement des charactères alphanumériques.
 * @constant
 * @default /^[0-9a-zA-Z]+$/
 */
const REG_XSS_SAFE = /^[-.\w\s%()]+$/;

/**
 * Clé Symbol utilisée pour stocker la Map de cache des listeners sur l'instance cible.
 * @internal
 */
const listenersCacheKey = Symbol('listenersCache');
/**
 * Décorateur d'accesseur automatique pour gérer des instances de `JsEvent`.
 *
 * Ce décorateur transforme un accesseur (auto-accessor) en une propriété gérée,
 * assurant une instanciation unique (Singleton par propriété) et une gestion du cache.
 * Il empêche également l'écrasement accidentel de l'événement via le setter.
 *
 * @template TCallback Signature de la fonction callback de l'événement.
 * @template This Type de l'instance de la classe parente.
 *
 * @param initializator - (Optionnel) Fonction exécutée une seule fois à la création de l'événement pour le configurer.
 * @param options - (Optionnel) Configuration du comportement du listener (lazy loading, type d'événement).
 *
 * @returns Le décorateur d'accesseur de classe conforme à la norme ES Decorators (Stage 3).
 *
 * @throws {Error} Si une tentative d'assignation (setter) est effectuée sur la propriété décorée.
 *
 * @example
 * ```ts
 * class MyComponent {
 * @Listener((evt, instance) => evt.attach(instance.handleAction), { lazy: true })
 * accessor onAction: JsEvent<(val: string) => void>;
 *
 *  private handleAction(val: string) {
 *    console.log(val);
 *  }
 * }
 * ```
 */
function Listener(initializator, options) {
    const { circular = false, lazy = true } = options ?? {};
    return function (_target, context) {
        const methodName = String(context.name);
        const listenerCacheKey = Symbol(`listener_${methodName}`);
        const args = { listenerCacheKey, circular, initializator };
        if (!lazy) {
            context.addInitializer(function () {
                _get({ target: this, ...args });
            });
        }
        return {
            get() {
                return _get({ target: this, ...args });
            },
            set(_value) {
                throw new Error(`Cannot set decorated accessor ${String(context.name)}. It is managed by the @Listener decorator.`);
            },
        };
    };
}
/**
 * Helper interne pour récupérer ou créer l'instance de l'événement.
 * Imémente le principe DRY pour le chargement immédiat (eager) et différé (lazy).
 *
 * @template T Type de l'instance cible.
 * @template TCallback Type du callback de l'événement.
 * @param options Objet contenant les paramètres de récupération/création.
 * @returns L'instance de l'événement stockée dans le cache.
 * @throws {Error} Si l'initializator à échoué
 * @internal
 */
function _get(options) {
    const { target: self, listenerCacheKey, circular, initializator } = options;
    const cache = (self[listenersCacheKey] ??= new Map());
    if (!cache.has(listenerCacheKey)) {
        const event = circular
            ? new eventExports.JsCircularEvent()
            : new JsEvent();
        if (initializator && initializator.name !== NoInitListener.name) {
            try {
                initializator(event, self);
            }
            catch (error) {
                Log.error('@Listener', `Failed to initialize event for ${String(listenerCacheKey)}`, error, options);
                throw error;
            }
        }
        cache.set(listenerCacheKey, event);
    }
    return cache.get(listenerCacheKey);
}
/**
 * Fonction "No-op" (No Operation) servant de placeholder sémantique.
 *
 * Utilisez cette fonction comme premier argument du décorateur {@link Listener}
 * lorsque vous n'avez aucune logique d'initialisation à fournir, mais que vous
 * devez passer un objet d'options en second argument.
 *
 * Cela améliore la lisibilité du code et l'intention par rapport à l'utilisation de `null` ou `() => {}`.
 *
 * @example
 * ```ts
 * class GraphNode {
 * // On souhaite activer le mode 'circular', sans logique d'initialisation spécifique.
 * @Listener(NoInitListener, { circular: true })
 * accessor links: JsEvent<LinkCallback>;
 * }
 * ```
 */
function NoInitListener() { }

const EVENT_ICON_CHANGED = 'icon';
const DATA_ICON = 'icon';

function OnIconChangeInitializer(event, self) {
    event.add('default', (newIcon, oldIcon) => {
        self.dispatchEvent(new ElementChangedEvent(EVENT_ICON_CHANGED, newIcon, oldIcon, self));
    });
}

var css_248z$p = "@font-face{font-family:Material Symbols Outlined;font-style:normal;font-weight:200;src:url(fonts/material-symbol-v2.woff2) format(\"woff2\")}.material-symbols-outlined{word-wrap:normal;-moz-font-feature-settings:\"liga\";-moz-osx-font-smoothing:grayscale;direction:ltr;display:inline-block;font-family:Material Symbols Outlined;font-size:24px;font-style:normal;font-weight:400;letter-spacing:normal;line-height:1;text-transform:none;white-space:nowrap}";

var css_248z$o = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{font-size:var(--bnum-icon-font-size,var(--bnum-font-size-xxl,1.5rem));font-variation-settings:\"FILL\" var(--bnum-icon-fill,0),\"wght\" var(--bnum-icon-weight,400),\"GRAD\" var(--bnum-icon-grad,0),\"opsz\" var(--bnum-icon-opsz,24);font-weight:var(--bnum-icon-font-weight,var(--bnum-font-weight-normal,normal));height:var(--bnum-icon-font-size,var(--bnum-font-size-xxl,1.5rem));width:var(--bnum-icon-font-size,var(--bnum-font-size-xxl,1.5rem))}:host(:state(loading)){opacity:0}";

/**
 * Classe CSS utilisée pour les icônes Material Symbols.
 */
const ICON_CLASS = 'material-symbols-outlined';
/**
 * Feuille de style CSS pour les icônes Material Symbols.
 */
const SYMBOLS = BnumElement.ConstructCSSStyleSheet(css_248z$p.replaceAll(`.${ICON_CLASS}`, ':host'));
const STYLE = BnumElement.ConstructCSSStyleSheet(css_248z$o);
/**
 * Composant personnalisé "bnum-icon" pour afficher une icône Material Symbol.
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
 * @event {unknown} custom:element-changed:icon - Déclenché lors du changement d'icône.
 */
let HTMLBnumIcon = (() => {
    var _HTMLBnumIcon__fontPromise;
    let _classDecorators = [Define({ tag: TAG_ICON })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let ___decorators;
    let ___initializers = [];
    let ___extraInitializers = [];
    let _oniconchanged_decorators;
    let _oniconchanged_initializers = [];
    let _oniconchanged_extraInitializers = [];
    var HTMLBnumIcon = class extends _classSuper {
        static { _classThis = this; }
        static { __setFunctionName(this, "HTMLBnumIcon"); }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            ___decorators = [Self];
            _oniconchanged_decorators = [Listener(OnIconChangeInitializer, { lazy: false })];
            __esDecorate(this, null, _oniconchanged_decorators, { kind: "accessor", name: "oniconchanged", static: false, private: false, access: { has: obj => "oniconchanged" in obj, get: obj => obj.oniconchanged, set: (obj, value) => { obj.oniconchanged = value; } }, metadata: _metadata }, _oniconchanged_initializers, _oniconchanged_extraInitializers);
            __esDecorate(null, null, ___decorators, { kind: "field", name: "_", static: false, private: false, access: { has: obj => "_" in obj, get: obj => obj._, set: (obj, value) => { obj._ = value; } }, metadata: _metadata }, ___initializers, ___extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HTMLBnumIcon = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static {
            //#region Private fields
            _HTMLBnumIcon__fontPromise = { value: null };
        }
        #_updateScheduler = null;
        //#endregion Private fields
        //#region Getter/setter
        /** Référence à la classe HTMLBnumIcon */
        _ = __runInitializers(this, ___initializers, void 0);
        #oniconchanged_accessor_storage = (__runInitializers(this, ___extraInitializers), __runInitializers(this, _oniconchanged_initializers, void 0));
        /**
         * Événement déclenché lors du changement d'icône. (via la propriété icon)
         */
        get oniconchanged() { return this.#oniconchanged_accessor_storage; }
        set oniconchanged(value) { this.#oniconchanged_accessor_storage = value; }
        /**
         * Obtient le nom de l'icône actuellement affichée.
         * @returns {string} Le nom de l'icône.
         */
        get icon() {
            const icon = this.textContent?.trim?.() ||
                this.data(DATA_ICON) ||
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
                    this.data(DATA_ICON, value);
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
            __runInitializers(this, _oniconchanged_extraInitializers);
        }
        /**
         * Retourne les feuilles de style à appliquer dans le Shadow DOM.
         * @returns {CSSStyleSheet[]} Les feuilles de style.
         */
        _p_getStylesheets() {
            return [...super._p_getStylesheets(), SYMBOLS, STYLE];
        }
        /**
         * Construit le DOM interne du composant.
         * @param {ShadowRoot} container - Le conteneur du Shadow DOM.
         */
        _p_buildDOM(container) {
            container.appendChild(this._p_createSlot());
            const icon = this.data(DATA_ICON);
            if (icon)
                this.#_updateIcon(icon);
            if (!this.hasAttribute('aria-hidden') && !this.hasAttribute('aria-label')) {
                this.setAttribute('aria-hidden', 'true');
                this.#_checkAndLoadFont();
            }
        }
        //#endregion Lifecycle
        //#region Private methods
        async #_checkAndLoadFont() {
            const FONT_SPEC = '24px "Material Symbols Outlined"';
            // Optimisation : On ne lance le chargement qu'une fois globalement
            if (!document.fonts.check(FONT_SPEC)) {
                this._p_addState('loading');
                if (!__classPrivateFieldGet(this._, _classThis, "f", _HTMLBnumIcon__fontPromise)) {
                    __classPrivateFieldSet(this._, _classThis, document.fonts.load(FONT_SPEC).then(() => { }), "f", _HTMLBnumIcon__fontPromise);
                }
                await __classPrivateFieldGet(this._, _classThis, "f", _HTMLBnumIcon__fontPromise);
                this._p_removeState('loading');
            }
        }
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
        static Write(icon, attribs = {}) {
            return h(HTMLBnumIcon, { "data-icon": icon, ...attribs });
        }
        /**
         * Retourne un élément HTMLBnumIcon vide.
         * @returns {HTMLBnumIcon}
         */
        static get EMPTY() {
            return document.createElement(this.TAG);
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
            return this.Create('home');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'search'.
         * @returns {HTMLBnumIcon}
         */
        static get SEARCH() {
            return this.Create('search');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'settings'.
         * @returns {HTMLBnumIcon}
         */
        static get SETTINGS() {
            return this.Create('settings');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'person'.
         * @returns {HTMLBnumIcon}
         */
        static get USER() {
            return this.Create('person');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'mail'.
         * @returns {HTMLBnumIcon}
         */
        static get MAIL() {
            return this.Create('mail');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'close'.
         * @returns {HTMLBnumIcon}
         */
        static get CLOSE() {
            return this.Create('close');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'check'.
         * @returns {HTMLBnumIcon}
         */
        static get CHECK() {
            return this.Create('check');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'warning'.
         * @returns {HTMLBnumIcon}
         */
        static get WARNING() {
            return this.Create('warning');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'info'.
         * @returns {HTMLBnumIcon}
         */
        static get INFO() {
            return this.Create('info');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'delete'.
         * @returns {HTMLBnumIcon}
         */
        static get DELETE() {
            return this.Create('delete');
        }
        /**
         * Retourne une instance de HTMLBnumIcon avec l'icône 'add'.
         * @returns {HTMLBnumIcon}
         */
        static get ADD() {
            return this.Create('add');
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return HTMLBnumIcon = _classThis;
})();

var css_248z$n = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{--bnum-icon-font-size:var(--bnum-body-font-size);border-radius:var(--bnum-button-border-radius,0);cursor:var(--bnum-button-cursor,pointer);display:var(--bnum-button-display,inline-block);font-weight:600;height:-moz-fit-content;height:fit-content;line-height:1.5rem;padding:var(--bnum-button-padding,6px 10px);transition:background-color .2s ease,color .2s ease;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}:host(:state(rounded)){border-radius:var(--bnum-button-rounded-border-radius,5px)}:host(:state(without-icon)){padding-bottom:var(--bnum-button-without-icon-padding-bottom,7.5px);padding-top:var(--bnum-button-without-icon-padding-top,7.5px)}:host(:disabled),:host(:state(disabled)){cursor:not-allowed;opacity:var(--bnum-button-disabled-opacity,.6);pointer-events:var(--bnum-button-disabled-pointer-events,none)}:host(:state(loading)){cursor:progress}:host(:state(icon)){--bnum-button-icon-gap:var(--custom-bnum-button-icon-margin,var(--bnum-space-s,10px))}:host(:state(icon))>.wrapper{align-items:center;display:flex;flex-direction:row;gap:var(--bnum-button-icon-gap);justify-content:center}:host(:state(icon-pos-left)) .wrapper{flex-direction:row-reverse}:host(:focus-visible){outline:2px solid #0969da;outline-offset:2px}:host>.wrapper{align-items:var(--bnum-button-wrapper-align-items,center);display:var(--bnum-button-wrapper-display,flex)}:host bnum-icon.icon{display:var(--bnum-button-icon-display,flex)}:host bnum-icon.icon.hidden{display:none}:host bnum-icon.loader{display:var(--bnum-button-loader-display,flex)}:host(:is(:state(loading):state(without-icon-loading))) slot{display:none}@keyframes spin{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host .loader,:host .spin,:host(:state(loading)) .icon{animation:spin var(--bnum-button-spin-duration,.75s) var(--bnum-button-spin-timing,linear) var(--bnum-button-spin-iteration,infinite)}:host(:state(hide-text-on-small)) .slot,:host(:state(hide-text-on-touch)) .slot{display:var(--size-display-state,inline-block)}:host(:state(hide-text-on-small)) .icon,:host(:state(hide-text-on-touch)) .icon{margin-left:var(--size-margin-left-state,var(--custom-button-icon-margin-left))!important;margin-right:var(--size-margin-right-state,var(--custom-button-icon-margin-right))!important}:host .hidden,:host [hidden]{display:none!important}:host(:state(primary)){background-color:var(--bnum-button-primary-background-color,var(--bnum-color-primary));border:var(--bnum-button-primary-border,solid thin var(--bnum-button-primary-border-color,var(--bnum-color-primary)));color:var(--bnum-button-primary-text-color,var(--bnum-text-on-primary))}:host(:state(primary):hover){background-color:var(--bnum-button-primary-hover-background-color,var(--bnum-color-primary-hover));border:var(--bnum-button-primary-hover-border,solid thin var(--bnum-button-primary-hover-border-color,var(--bnum-color-primary-hover)));color:var(--bnum-button-primary-hover-text-color,var(--bnum-text-on-primary-hover))}:host(:state(primary):active){background-color:var(--bnum-button-primary-active-background-color,var(--bnum-color-primary-active));border:var(--bnum-button-primary-active-border,solid thin var(--bnum-button-primary-active-border-color,var(--bnum-color-primary-active)));color:var(--bnum-button-primary-active-text-color,var(--bnum-text-on-primary-active))}:host(:state(secondary)){background-color:var(--bnum-button-secondary-background-color,var(--bnum-color-secondary));border:var(--bnum-button-secondary-border,solid thin var(--bnum-button-secondary-border-color,var(--bnum-color-primary)));color:var(--bnum-button-secondary-text-color,var(--bnum-text-on-secondary))}:host(:state(secondary):hover){background-color:var(--bnum-button-secondary-hover-background-color,var(--bnum-color-secondary-hover));border:var(--bnum-button-secondary-hover-border,solid thin var(--bnum-button-secondary-hover-border-color,var(--bnum-color-primary)));color:var(--bnum-button-secondary-hover-text-color,var(--bnum-text-on-secondary-hover))}:host(:state(secondary):active){background-color:var(--bnum-button-secondary-active-background-color,var(--bnum-color-secondary-active));border:var(--bnum-button-secondary-active-border,solid thin var(--bnum-button-secondary-active-border-color,var(--bnum-color-primary)));color:var(--bnum-button-secondary-active-text-color,var(--bnum-text-on-secondary-active))}:host(:state(danger)){background-color:var(--bnum-button-danger-background-color,var(--bnum-color-danger));border:var(--bnum-button-danger-border,solid thin var(--bnum-button-danger-border-color,var(--bnum-color-danger)));color:var(--bnum-button-danger-text-color,var(--bnum-text-on-danger))}:host(:state(danger):hover){background-color:var(--bnum-button-danger-hover-background-color,var(--bnum-color-danger-hover));border:var(--bnum-button-danger-hover-border,solid thin var(--bnum-button-danger-hover-border-color,var(--bnum-color-danger-hover)));color:var(--bnum-button-danger-hover-text-color,var(--bnum-text-on-danger-hover))}:host(:state(danger):active){background-color:var(--bnum-button-danger-active-background-color,var(--bnum-color-danger-active));border:var(--bnum-button-danger-active-border,solid thin var(--bnum-button-danger-active-border-color,var(--bnum-color-danger-active)));color:var(--bnum-button-danger-active-text-color,var(--bnum-text-on-danger-active))}";

// core/decorators/ui.ts
function UI(selectorMap, options) {
    const { shadowRoot = true } = options || {};
    return function (target, context) {
        const name = String(context.name);
        // Symbole pour stocker l'objet UI une fois créé
        const uiCacheKey = Symbol(name);
        return {
            get() {
                // 1. Si l'objet UI existe déjà, on le retourne
                if (this[uiCacheKey]) {
                    return this[uiCacheKey];
                }
                const root = shadowRoot ? this.shadowRoot || this : this;
                // 2. On crée un objet vide
                const uiObject = {};
                // 3. On utilise un Map interne pour stocker les résultats des querySelector
                //    pour ne pas les refaire à chaque accès (Cache granulaire)
                const domCache = new Map();
                // 4. On définit dynamiquement des getters pour chaque clé
                for (const [key, selector] of Object.entries(selectorMap)) {
                    Object.defineProperty(uiObject, key, {
                        configurable: true,
                        enumerable: true,
                        get: () => {
                            // A. Si on a déjà cherché cet élément précis, on le rend
                            if (domCache.has(key)) {
                                return domCache.get(key);
                            }
                            // B. Sinon, on fait le querySelector (LAZY)
                            const element = root.querySelector(selector);
                            // C. On le met en cache
                            domCache.set(key, element);
                            return element;
                        },
                        // Permet d'écraser manuellement si besoin : this.#_ui.icon = ...
                        set: (value) => {
                            domCache.set(key, value);
                        },
                    });
                }
                // 5. On stocke l'objet configuré sur l'instance et on le retourne
                this[uiCacheKey] = uiObject;
                return uiObject;
            },
        };
    };
}

//#region External Constants
// Constantes pour les tags des différents types de boutons
/**
 * Icône de chargement utilisée dans le bouton.
 */
const ICON_LOADER = 'progress_activity';
//#endregion External Constants
//#region Template
const TEMPLATE$f = (h("div", { class: CLASS_WRAPPER, children: [h("span", { class: CLASS_SLOT, children: h("slot", {}) }), h(HTMLBnumIcon, { hidden: "true", class: CLASS_ICON })] }));
//#endregion Template
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
 * @attr {boolean | undefined} (optional) rounded - Rend le bouton arrondi
 * @attr {boolean | undefined} (optional) loading - Met le bouton en état de chargement et le désactive
 * @attr {boolean | undefined} (optional) disabled - Désactive le bouton
 * @attr {Optional<ButtonVariation>} (optional) (default: ButtonVariation.PRIMARY) data-variation - Variation du bouton (primary, secondary, etc.)
 * @attr {string | undefined} (optional) data-icon - Icône affichée dans le bouton
 * @attr {IconPosition | undefined} (optional) (default: IconPosition.RIGHT) data-icon-pos - Position de l'icône (gauche ou droite)
 * @attr {string | undefined} (optional) (default: var（--custom-bnum-button-icon-margin, 10px）) data-icon-margin - Marge de l'icône (gauche, droite)
 * @attr {HideTextOnLayoutSize | undefined} (optional) data-hide - Taille de layout pour cacher le texte
 *
 * @event {ElementChangedEvent} custom:element-changed.variation - Événement déclenché lors du changement de variation du bouton.
 * @event {ElementChangedEvent} custom:element-changed.icon - Événement déclenché lors du changement d'icône.
 * @event {CustomEvent<{ type: string, newValue: boolean | string }>} custom:icon.prop.changed - Événement déclenché lors du changement de propriété de l'icône.
 * @event {CustomEvent<{ state: boolean }>} custom:loading - Événement déclenché lors du changement d'état de chargement.
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
 * @cssvar {-3px} --bnum-button-margin-bottom-text-correction - Correction basse du texte
 */
let HTMLBnumButton = (() => {
    let _classDecorators = [Define({
            tag: TAG_BUTTON,
            template: TEMPLATE$f,
            styles: css_248z$n,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _onloadingstatechange_decorators;
    let _onloadingstatechange_initializers = [];
    let _onloadingstatechange_extraInitializers = [];
    let _oniconchange_decorators;
    let _oniconchange_initializers = [];
    let _oniconchange_extraInitializers = [];
    let _oniconpropchange_decorators;
    let _oniconpropchange_initializers = [];
    let _oniconpropchange_extraInitializers = [];
    let _onvariationchange_decorators;
    let _onvariationchange_initializers = [];
    let _onvariationchange_extraInitializers = [];
    let _linkedClickEvent_decorators;
    let _linkedClickEvent_initializers = [];
    let _linkedClickEvent_extraInitializers = [];
    let _private__onLinkedClick_decorators;
    let _private__onLinkedClick_descriptor;
    let _private__onLoadingChange_decorators;
    let _private__onLoadingChange_descriptor;
    let __p_onLoadingChange_decorators;
    let _setLoading_decorators;
    var HTMLBnumButton = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    wrapper: `.${CLASS_WRAPPER}`,
                    icon: `.${CLASS_ICON}`,
                })];
            _onloadingstatechange_decorators = [Listener(OnLoadingStateChangeInitializer, { lazy: false })];
            _oniconchange_decorators = [Listener(OnIconChangeInitializer$1, { lazy: false })];
            _oniconpropchange_decorators = [Listener(OnIconPropChangeInitializer, { lazy: false })];
            _onvariationchange_decorators = [Listener(OnVariationChangeInitializer, { lazy: false })];
            _linkedClickEvent_decorators = [Listener(OnClickInitializer)];
            _private__onLinkedClick_decorators = [Autobind, ErrorPath((e) => {
                    Log.error(`${TAG_BUTTON}/_onLinkedClick`, e.message, e);
                }), RiskyPath()];
            _private__onLoadingChange_decorators = [Fire(EVENT_LOADING_STATE_CHANGED)];
            __p_onLoadingChange_decorators = [Autobind];
            _setLoading_decorators = [SetAttr(ATTR_LOADING, true)];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _onloadingstatechange_decorators, { kind: "accessor", name: "onloadingstatechange", static: false, private: false, access: { has: obj => "onloadingstatechange" in obj, get: obj => obj.onloadingstatechange, set: (obj, value) => { obj.onloadingstatechange = value; } }, metadata: _metadata }, _onloadingstatechange_initializers, _onloadingstatechange_extraInitializers);
            __esDecorate(this, null, _oniconchange_decorators, { kind: "accessor", name: "oniconchange", static: false, private: false, access: { has: obj => "oniconchange" in obj, get: obj => obj.oniconchange, set: (obj, value) => { obj.oniconchange = value; } }, metadata: _metadata }, _oniconchange_initializers, _oniconchange_extraInitializers);
            __esDecorate(this, null, _oniconpropchange_decorators, { kind: "accessor", name: "oniconpropchange", static: false, private: false, access: { has: obj => "oniconpropchange" in obj, get: obj => obj.oniconpropchange, set: (obj, value) => { obj.oniconpropchange = value; } }, metadata: _metadata }, _oniconpropchange_initializers, _oniconpropchange_extraInitializers);
            __esDecorate(this, null, _onvariationchange_decorators, { kind: "accessor", name: "onvariationchange", static: false, private: false, access: { has: obj => "onvariationchange" in obj, get: obj => obj.onvariationchange, set: (obj, value) => { obj.onvariationchange = value; } }, metadata: _metadata }, _onvariationchange_initializers, _onvariationchange_extraInitializers);
            __esDecorate(this, null, _linkedClickEvent_decorators, { kind: "accessor", name: "linkedClickEvent", static: false, private: false, access: { has: obj => "linkedClickEvent" in obj, get: obj => obj.linkedClickEvent, set: (obj, value) => { obj.linkedClickEvent = value; } }, metadata: _metadata }, _linkedClickEvent_initializers, _linkedClickEvent_extraInitializers);
            __esDecorate(this, _private__onLinkedClick_descriptor = { value: __setFunctionName(function (click) {
                    // Si c'est un id unique
                    var elementToClick = document.getElementById(click);
                    if (elementToClick)
                        elementToClick.click();
                    else {
                        // Sinon on part du principe que c'est un sélecteur CSS
                        const elements = document.querySelector(click);
                        if (elements)
                            elements.click();
                        else
                            throw new Error('L\'attribut \'click\' ne référence aucun élément.');
                    }
                }, "#_onLinkedClick") }, _private__onLinkedClick_decorators, { kind: "method", name: "#_onLinkedClick", static: false, private: true, access: { has: obj => #_onLinkedClick in obj, get: obj => obj.#_onLinkedClick }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__onLoadingChange_descriptor = { value: __setFunctionName(function (state) {
                    return { state };
                }, "#_onLoadingChange") }, _private__onLoadingChange_decorators, { kind: "method", name: "#_onLoadingChange", static: false, private: true, access: { has: obj => #_onLoadingChange in obj, get: obj => obj.#_onLoadingChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, __p_onLoadingChange_decorators, { kind: "method", name: "_p_onLoadingChange", static: false, private: false, access: { has: obj => "_p_onLoadingChange" in obj, get: obj => obj._p_onLoadingChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _setLoading_decorators, { kind: "method", name: "setLoading", static: false, private: false, access: { has: obj => "setLoading" in obj, get: obj => obj.setLoading }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HTMLBnumButton = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#endregion Component Definition
        //#region Private fields
        #_renderScheduler = (__runInitializers(this, _instanceExtraInitializers), null);
        #_lastClick = null;
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        //#endregion Private fields
        //#region Getter/setter
        /**
         * Références UI du composant.
         */
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #onloadingstatechange_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _onloadingstatechange_initializers, void 0));
        /**
         * Événement déclenché lors du changement d'état de chargement.
         */
        get onloadingstatechange() { return this.#onloadingstatechange_accessor_storage; }
        set onloadingstatechange(value) { this.#onloadingstatechange_accessor_storage = value; }
        #oniconchange_accessor_storage = (__runInitializers(this, _onloadingstatechange_extraInitializers), __runInitializers(this, _oniconchange_initializers, void 0));
        /**
         * Événement déclenché lors du changement d'icône.
         */
        get oniconchange() { return this.#oniconchange_accessor_storage; }
        set oniconchange(value) { this.#oniconchange_accessor_storage = value; }
        #oniconpropchange_accessor_storage = (__runInitializers(this, _oniconchange_extraInitializers), __runInitializers(this, _oniconpropchange_initializers, void 0));
        /**
         * Événement déclenché lors du changement de propriété de l'icône.
         */
        get oniconpropchange() { return this.#oniconpropchange_accessor_storage; }
        set oniconpropchange(value) { this.#oniconpropchange_accessor_storage = value; }
        #onvariationchange_accessor_storage = (__runInitializers(this, _oniconpropchange_extraInitializers), __runInitializers(this, _onvariationchange_initializers, void 0));
        /**
         * Événement déclenché lors du changement de variation du bouton.
         */
        get onvariationchange() { return this.#onvariationchange_accessor_storage; }
        set onvariationchange(value) { this.#onvariationchange_accessor_storage = value; }
        #linkedClickEvent_accessor_storage = (__runInitializers(this, _onvariationchange_extraInitializers), __runInitializers(this, _linkedClickEvent_initializers, void 0));
        /** Événement déclenché lors du clic sur le bouton. */
        get linkedClickEvent() { return this.#linkedClickEvent_accessor_storage; }
        set linkedClickEvent(value) { this.#linkedClickEvent_accessor_storage = value; }
        /**
         * Variation du bouton (primary, secondary, etc.).
         */
        get variation() {
            return (this.data(ATTR_VARIATION) || ButtonVariation.PRIMARY);
        }
        set variation(value) {
            if (Object.values(ButtonVariation).includes(value)) {
                const fromAttribute = false;
                this.data(ATTR_VARIATION, value, fromAttribute);
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
            return this.data(ATTR_ICON$1) || null;
        }
        set icon(value) {
            if (this.alreadyLoaded)
                this.oniconchange.call(value || EMPTY_STRING, this.icon || EMPTY_STRING);
            if (typeof value === 'string' && /^[\w-]+$/.test(value)) {
                const fromAttribute = false;
                this.data(ATTR_ICON$1, value, fromAttribute);
            }
            else {
                this.data(ATTR_ICON$1, null);
            }
            if (this.alreadyLoaded)
                this.#_requestUpdateDOM();
        }
        /**
         * Position de l'icône (gauche ou droite).
         */
        get iconPos() {
            return this.data(ATTR_ICON_POS) || IconPosition.RIGHT;
        }
        set iconPos(value) {
            if (this.alreadyLoaded)
                this.oniconpropchange.call(ICON_PROP_POS, value);
            if (Object.values(IconPosition).includes(value)) {
                const fromAttribute = false;
                this.data(ATTR_ICON_POS, value, fromAttribute);
            }
            if (this.alreadyLoaded)
                this.#_requestUpdateDOM();
        }
        /**
         * Marge appliquée à l'icône.
         */
        get iconMargin() {
            return (this.data(ATTR_ICON_MARGIN) || DEFAULT_CSS_VAR_ICON_MARGIN);
        }
        set iconMargin(value) {
            if (this.alreadyLoaded)
                this.oniconpropchange.call('margin', value || EMPTY_STRING);
            if (typeof value === 'string' && REG_XSS_SAFE.test(value)) {
                const fromAttribute = false;
                this.data(ATTR_ICON_MARGIN, value, fromAttribute);
                this.style.setProperty(CSS_PROPERTY_ICON_MARGIN, value);
            }
            else if (value === null) {
                this.data(ATTR_ICON_MARGIN, value);
                this.style.removeProperty(CSS_PROPERTY_ICON_MARGIN);
            }
        }
        /**
         * Taille de layout sur laquelle le texte doit être caché.
         */
        get hideTextOnLayoutSize() {
            const data = this.data(ATTR_HIDE);
            if ([...Object.values(HideTextOnLayoutSize), null, undefined].includes(data))
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
            __runInitializers(this, _linkedClickEvent_extraInitializers);
        }
        /**
         * Construit le DOM du composant bouton.
         * @param container - Le conteneur du Shadow DOM.
         */
        _p_buildDOM() {
            if (this.data(ATTR_ICON_MARGIN)) {
                this.style.setProperty(CSS_PROPERTY_ICON_MARGIN, this.data(ATTR_ICON_MARGIN));
            }
            this.#_updateDOM();
            HTMLBnumButton.ToButton(this);
        }
        _p_update() {
            if (!this.#_ui.wrapper)
                return;
            this.#_updateDOM();
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
            this._p_clearStates();
            // États globaux
            this._p_addState(this.variation);
            this._p_addState(this.variation);
            if (this.#_isRounded())
                this._p_addState(STATE_ROUNDED);
            if (isLoading)
                this._p_addState(STATE_LOADING$1);
            if (isDisabled || isLoading)
                this._p_addState(STATE_DISABLED$2);
            // Gestion de l'icône
            const effectiveIcon = isLoading ? ICON_LOADER : this.icon;
            if (effectiveIcon) {
                this._p_addState(STATE_ICON$1);
                // L'état CSS "icon-pos-left" déclenchera le "flex-direction: row-reverse"
                this._p_addState(`icon-pos-${this.iconPos}`);
                if (this.hideTextOnLayoutSize) {
                    this._p_addState(`hide-text-on-${this.hideTextOnLayoutSize}`);
                }
                // Mise à jour du composant icône enfant
                if (this.#_ui.icon.icon !== effectiveIcon)
                    this.#_ui.icon.icon = effectiveIcon;
                this.#_ui.icon.hidden = false;
            }
            else {
                this._p_addState(STATE_WITHOUT_ICON);
                this.#_ui.icon.hidden = true;
            }
            // Accessibilité (Internals gère aria-disabled, mais tabindex doit être géré ici)
            this._p_internal.ariaDisabled = String(isDisabled || isLoading);
            this.tabIndex = isDisabled || isLoading ? -1 : 0;
            this.#_setLinkedEvent();
        }
        /**
         * Indique si le bouton est arrondi.
         * @private
         */
        #_isRounded() {
            return this.#_is(ATTR_ROUNDED);
        }
        /**
         * Indique si le bouton est en état de chargement.
         * @private
         */
        #_isLoading() {
            return this.#_is(ATTR_LOADING);
        }
        /**
         * Indique si le bouton est désactivé.
         * @private
         */
        #_isDisabled() {
            return this.#_is(ATTR_DISABLED$1);
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
        /**
         * Ajoute l'événement lié au clic d'un autre élément si l'attribut est présent.
         * @returns Cette instance du bouton
         */
        #_setLinkedEvent() {
            if (this.hasAttribute('click')) {
                const click = this.getAttribute('click');
                if (click !== this.#_lastClick) {
                    if (this.linkedClickEvent.has('click'))
                        this.linkedClickEvent.remove('click');
                    if (click && REG_XSS_SAFE.test(click)) {
                        this.#_lastClick = click;
                        this.linkedClickEvent.add('click', this.#_onLinkedClick, click);
                    }
                }
            }
            return this;
        }
        //#endregion Private methods
        //#region Event handlers
        /**
         * Action lors du clic lié à un autre élément.
         * @param click Identifiant ou sélecteur CSS de l'élément à cliquer
         */
        get #_onLinkedClick() { return _private__onLinkedClick_descriptor.value; }
        /**
         * Gestion du changement d'état de chargement.
         * @param state Nouvel état de chargement
         * @returns Détail de l'événement
         */
        get #_onLoadingChange() { return _private__onLoadingChange_descriptor.value; }
        _p_onLoadingChange(state) {
            return this.#_onLoadingChange(state);
        }
        //#endregion Event handlers
        //#region Public methods
        /**
         * Met le bouton en état de chargement.
         * @returns L'instance du bouton
         */
        setLoading() {
            return this;
        }
        /**
         * Arrête l'état de chargement du bouton.
         * @returns L'instance du bouton
         */
        stopLoading() {
            this.removeAttribute(ATTR_LOADING);
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
            return [ATTR_ROUNDED, ATTR_LOADING, ATTR_DISABLED$1, 'click'];
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
        static _p_Create(buttonClass, options) {
            const config = { ...DEFAULT_BUTTON_OPTIONS, ...options };
            const node = document.createElement(buttonClass.TAG);
            node.textContent = config.text ?? EMPTY_STRING;
            const finalMargin = config.iconMargin === 0 ? '0px' : config.iconMargin;
            for (const { prop, attr, isBool } of BUTTON_ATTRIBUTE_MAP) {
                const val = prop === 'iconMargin'
                    ? finalMargin
                    : config[prop];
                if (val === null || val === undefined)
                    continue;
                if (isBool && val === true)
                    node.setAttribute(attr, 'true');
                else if (!isBool && val !== EMPTY_STRING)
                    node.setAttribute(attr, String(val));
            }
            return node;
        }
        /**
         * Crée un bouton Bnum standard.
         * @static
         * @param options Options de configuration du bouton
         * @returns Instance du bouton créé
         */
        static Create(options) {
            return this._p_Create(this, options);
        }
        /**
         * Crée un bouton Bnum ne contenant qu'une icône.
         * @static
         * @param icon Nom de l'icône à afficher
         * @param options Options de configuration du bouton
         * @returns Instance du bouton créé
         */
        static CreateOnlyIcon(icon, { variation = ButtonVariation.PRIMARY, rounded = false, loading = false, } = {}) {
            return this.Create({
                icon,
                variation,
                rounded,
                loading,
                iconMargin: '0px',
            });
        }
    };
    return HTMLBnumButton = _classThis;
})();

/**
 * Décorateur de classe permettant de définir une variation par défaut pour un composant bouton.
 * Ce décorateur étend le constructeur de la classe cible (Pattern Proxy/Mixin) pour injecter
 * automatiquement la valeur de variation dans le dataset du composant lors de son instanciation.
 * @remarks
 * Ce décorateur utilise l'API standard ECMAScript (Stage 3). Il inclut une vérification
 * `instanceof` pour s'assurer que la classe décorée hérite bien de {@link HTMLBnumButton},
 * évitant ainsi des erreurs d'exécution sur des classes incompatibles.
 * @param variation - Le type de variation à appliquer (ex: 'primary', 'secondary').
 * Doit correspondre à une valeur valide de {@link ButtonVariation}.
 * @returns Une fonction décoratrice qui retourne la classe étendue avec la logique d'injection.
 * @example
 * ```typescript
 * import { HTMLBnumButton } from '../bnum-button';
 * import { Variation } from './decorators';
 * @Variation('primary')
 * export class PrimaryButton extends HTMLBnumButton {
 * // L'attribut ATTR_VARIATION sera défini à 'primary' dès la construction.
 * }
 * ```
 */
function Variation(variation) {
    return function (originalClass, context) {
        if (context.kind !== 'class')
            return;
        class InnerClass extends originalClass {
            constructor(...args) {
                super(...args);
                if (this instanceof HTMLBnumButton) {
                    const fromAttribute = false;
                    this.data(ATTR_VARIATION, variation, fromAttribute);
                }
            }
        }
        return InnerClass;
    };
}

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
let HTMLBnumDangerButton = (() => {
    let _classDecorators = [Define({ tag: TAG_DANGER }), Variation(ButtonVariation.DANGER)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumButton;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor() {
            super();
        }
    });
    return _classThis;
})();

var BnumDateLocale;
(function (BnumDateLocale) {
    BnumDateLocale["FR"] = "fr-FR";
    BnumDateLocale["EN"] = "en-US";
})(BnumDateLocale || (BnumDateLocale = {}));
/**
 * Native replacements for date-fns functions to reduce bundle size.
 * Uses Intl API for localization and native Date for manipulations.
 */
let BnumDateUtils = (() => {
    let _staticExtraInitializers = [];
    let _static_private__parse_decorators;
    let _static_private__parse_descriptor;
    return class BnumDateUtils {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _static_private__parse_decorators = [Risky()];
            __esDecorate(this, _static_private__parse_descriptor = { value: __setFunctionName(function (dateString, format) {
                    if (!dateString)
                        return null;
                    // 1. Si aucun format n'est fourni, on tente le parsing natif (ISO 8601)
                    if (!format) {
                        const d = new Date(dateString);
                        return (this.isValid(d) ? d : null);
                    }
                    else {
                        if (['PPPP', 'PPP', 'PP', 'P'].includes(format)) {
                            format = 'dd/MM/yyyy';
                        }
                    }
                    // On extrait les nombres de la chaîne (ignore les séparateurs comme / - :)
                    const values = dateString.match(/\d+/g);
                    const tokens = format.match(/[a-zA-Z]+/g);
                    if (!values || !tokens || values.length !== tokens.length) {
                        if (values && tokens && values.length < tokens.length) {
                            for (let index = values.length; index < tokens.length; ++index) {
                                values.push(Array.from(tokens[index])
                                    .map(() => '0')
                                    .join(EMPTY_STRING));
                            }
                        }
                        else
                            return null;
                    }
                    let year = new Date().getFullYear();
                    let month = 0;
                    let day = 1;
                    let hour = 0;
                    let minute = 0;
                    tokens.forEach((token, index) => {
                        const val = parseInt(values[index], 10);
                        if (token.includes('y'))
                            year = val;
                        if (token.includes('M'))
                            month = val - 1; // Mois 0-11 en JS
                        if (token.includes('d'))
                            day = val;
                        if (token.includes('H'))
                            hour = val;
                        if (token.includes('m'))
                            minute = val;
                    });
                    const result = new Date(year, month, day, hour, minute);
                    return (this.isValid(result) ? result : null);
                }, "#_parse") }, _static_private__parse_decorators, { kind: "method", name: "#_parse", static: true, private: true, access: { has: obj => #_parse in obj, get: obj => obj.#_parse }, metadata: _metadata }, null, _staticExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(this, _staticExtraInitializers);
        }
        /**
         * Equivalent to date-fns/format.
         * @param date Date to format.
         * @param options Intl options or a simple locale string.
         * @param locale Locale string (e.g., 'fr-FR', 'en-US').
         */
        static format(date, options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }, locale = 'fr-FR') {
            return new Intl.DateTimeFormat(locale, options).format(date);
        }
        /**
         * Parse une chaîne de caractères en objet Date.
         * @param dateString La chaîne à parser (ex: "12/08/1997")
         * @param format Optionnel : le format de la chaîne (ex: "dd/MM/yyyy")
         */
        static parse(dateString, format) {
            return this.#_parse(dateString, format).unwrapOr(null);
        }
        /**
         * Parse une chaîne de caractères en objet Date.
         * @param dateString La chaîne à parser (ex: "12/08/1997")
         * @param format Optionnel : le format de la chaîne (ex: "dd/MM/yyyy")
         */
        static get #_parse() { return _static_private__parse_descriptor.value; }
        /**
         * Equivalent to date-fns/isValid.
         */
        static isValid(date) {
            return date instanceof Date && !isNaN(date.getTime());
        }
        /**
         * Equivalent to date-fns/addDays (Immutable).
         */
        static addDays(date, days) {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }
        /**
         * Equivalent to date-fns/addMonths (Immutable).
         */
        static addMonths(date, months) {
            const result = new Date(date);
            result.setMonth(result.getMonth() + months);
            return result;
        }
        /**
         * Equivalent to date-fns/addYears (Immutable).
         */
        static addYears(date, years) {
            const result = new Date(date);
            result.setFullYear(result.getFullYear() + years);
            return result;
        }
        /**
         * Convertit dynamiquement une chaîne de tokens (ex: "dd/MM") en options Intl.
         * @param pattern La chaîne de formatage.
         */
        static getOptionsFromToken(pattern) {
            if (pattern.includes('PPPP'))
                return { dateStyle: 'full' };
            if (pattern.includes('PPP'))
                return { dateStyle: 'long' };
            if (pattern.includes('PP'))
                return { dateStyle: 'medium' };
            if (pattern.includes('P'))
                return { dateStyle: 'short' };
            const options = {};
            if (pattern.includes('yyyy'))
                options.year = 'numeric';
            else if (pattern.includes('yy'))
                options.year = '2-digit';
            if (pattern.includes('MMMM'))
                options.month = 'long';
            else if (pattern.includes('MMM'))
                options.month = 'short';
            else if (pattern.includes('MM'))
                options.month = '2-digit';
            else if (pattern.includes('M'))
                options.month = 'numeric';
            if (pattern.includes('dd'))
                options.day = '2-digit';
            else if (pattern.includes('d'))
                options.day = 'numeric';
            if (pattern.includes('EEEE'))
                options.weekday = 'long';
            else if (pattern.includes('E'))
                options.weekday = 'short';
            if (pattern.includes('HH'))
                options.hour = '2-digit';
            else if (pattern.includes('H'))
                options.hour = 'numeric';
            if (pattern.includes('mm'))
                options.minute = '2-digit';
            // Force 24h si on demande des heures
            if (options.hour)
                options.hour12 = false;
            return options;
        }
        /**
         * Vérifie si deux dates correspondent au même jour (ignore l'heure).
         * @param date Première date à comparer.
         * @param now Deuxième date à comparer (par défaut : Date actuelle).
         * @returns True si c'est le même jour.
         */
        static isSameDay(date, now = new Date()) {
            return (date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() === now.getDate());
        }
        /**
         * Vérifie si la date fournie est aujourd'hui.
         */
        static isToday(date) {
            return this.isSameDay(date, new Date());
        }
        /**
         * Retourne une nouvelle date fixée au début du jour (00:00:00.000).
         */
        static startOfDay(date) {
            const result = new Date(date);
            result.setHours(0, 0, 0, 0);
            return result;
        }
        /**
         * Retourne une nouvelle date fixée à la fin du jour (23:59:59.999).
         */
        static endOfDay(date) {
            const result = new Date(date);
            result.setHours(23, 59, 59, 999);
            return result;
        }
        /**
         * Soustrait un nombre de jours à une date (Immuable).
         */
        static subDays(date, amount) {
            return this.addDays(date, -amount);
        }
        /**
         * Vérifie si une date se trouve dans un intervalle donné (inclusif).
         * @param date Date à vérifier.
         * @param interval Objet contenant start et end.
         */
        static isWithinInterval(date, interval) {
            const time = date.getTime();
            return time >= interval.start.getTime() && time <= interval.end.getTime();
        }
    };
})();

const ATTRIBUTE_FORMAT = 'format';
const ATTRIBUTE_LOCALE = 'locale';
const ATTRIBUTE_DATE = 'data-date';
const ATTRIBUTE_START_FORMAT = 'data-start-format';
const EVENT_ATTRIBUTE_UPDATED = 'bnum-date:attribute-updated';
const EVENT_DATE = 'bnum-date:date';
const DEFAULT_FORMAT = 'dd/MM/yyyy HH:mm';
const DEFAULT_LOCALE = 'fr';
const STATE_INVALID = 'invalid';
const STATE_NOT_READY = 'not-ready';

function Observe(attribsToObserve1, ...attribsToObserve) {
    return function (target, context) {
        if (context.kind !== 'class') {
            throw new Error('@Observe ne peut être utilisé que sur une classe.');
        }
        context.addInitializer(function () {
            const attributesToObserve = Array.isArray(attribsToObserve1)
                ? attribsToObserve1
                : [attribsToObserve1, ...attribsToObserve];
            this.__CONFIG_ATTRIBS_TO_OBSERVE_ = attributesToObserve;
        });
    };
}

/**
 * Affiche une date formatée qui peut être mise à jour dynamiquement.
 *
 * /!\ Seuls les formats de date supportés ceux par intl.DateTimeFormat.
 *
 * Vous DEVEZ utiliser les tokens suivants pour la configuration du format en html:
 *
 * - P : format court (ex: 12/08/1997)
 * - PP : format moyen (ex: 12 août 1997)
 * - PPP : format long (ex: mardi 12 août 1997)
 * - PPPP : format complet (ex: mardi 12 août 1997)
 * - yyyy : année sur 4 chiffres
 * - yy : année sur 2 chiffres
 * - M : mois numérique sans zéro initial
 * - MM : mois numérique avec zéro initial
 * - MMM : mois abrégé (ex: août)
 * - MMMM : mois complet (ex: août)
 * - d : jour du mois sans zéro initial
 * - dd : jour du mois avec zéro initial
 * - EEEE : jour de la semaine complet (ex: mardi)
 * - E : jour de la semaine abrégé (ex: mar)
 * - H : heure sans zéro initial (0-23)
 * - HH : heure avec zéro initial (00-23)
 * - mm : minutes avec zéro initial (00-59)
 *
 * Pour la locale, utilisez ceux par intl.
 *
 * A la place de `fr_FR`, vous pouvez utilisez `fr`.
 *
 * @structure Date simple
 * <bnum-date format="P">1997-08-12</bnum-date>
 *
 * @structure Date avec parsing personnalisé
 * <bnum-date format="PPPP" data-start-format="dd/MM/yyyy">12/08/1997</bnum-date>
 *
 * @structure Date avec attribut data-date
 * <bnum-date format="ddMMyyyy HHmm" data-date="1997-08-12T15:30:00Z"></bnum-date>
 *
 * @structure Date en anglais
 * <bnum-date format="PPPP" locale="en">1997-08-12</bnum-date>
 *
 * @state invalid - Actif quand la date est invalide ou non définie
 * @state not-ready - Actif quand le composant n'est pas encore prêt
 */
let HTMLBnumDate = (() => {
    var _HTMLBnumDate__LOCALES;
    let _classDecorators = [Define({ tag: TAG_DATE }), Observe(ATTRIBUTE_FORMAT, ATTRIBUTE_LOCALE)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let ___decorators;
    let ___initializers = [];
    let ___extraInitializers = [];
    let _formatEvent_decorators;
    let _formatEvent_initializers = [];
    let _formatEvent_extraInitializers = [];
    let _private__format_decorators;
    let _private__format_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static { __setFunctionName(this, "HTMLBnumDate"); }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            ___decorators = [Self];
            _formatEvent_decorators = [Listener(NoInitListener, { circular: true })];
            _private__format_decorators = [Risky()];
            __esDecorate(this, null, _formatEvent_decorators, { kind: "accessor", name: "formatEvent", static: false, private: false, access: { has: obj => "formatEvent" in obj, get: obj => obj.formatEvent, set: (obj, value) => { obj.formatEvent = value; } }, metadata: _metadata }, _formatEvent_initializers, _formatEvent_extraInitializers);
            __esDecorate(this, _private__format_descriptor = { value: __setFunctionName(function (locale) {
                    if (this.#_originalDate === null)
                        throw new Error('Date is null');
                    return BnumDateUtils.format(this.#_originalDate, BnumDateUtils.getOptionsFromToken(this.#_outputFormat), locale);
                }, "#_format") }, _private__format_decorators, { kind: "method", name: "#_format", static: false, private: true, access: { has: obj => #_format in obj, get: obj => obj.#_format }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, null, ___decorators, { kind: "field", name: "_", static: false, private: false, access: { has: obj => "_" in obj, get: obj => obj._, set: (obj, value) => { obj._ = value; } }, metadata: _metadata }, ___initializers, ___extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static {
            //#region Constants
            _HTMLBnumDate__LOCALES = { value: {
                    fr: BnumDateLocale.FR,
                    en: BnumDateLocale.EN,
                } };
        }
        //#endregion Constants
        //#region Private fields
        /** Référence à la classe HTMLBnumDate */
        _ = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, ___initializers, void 0));
        /** L'objet Date (notre source de vérité) */
        #_originalDate = (__runInitializers(this, ___extraInitializers), null);
        /** Le format d'affichage (ex: 'PPPP') */
        #_outputFormat = DEFAULT_FORMAT; // 'P' -> 12/08/1997
        /** La locale (code) */
        #_locale = DEFAULT_LOCALE;
        /** Le format de parsing (ex: 'dd/MM/yyyy') */
        #_startFormat = null;
        /** L'élément SPAN interne qui contient le texte formaté */
        #_outputElement = null;
        #_renderSheduled = false;
        #formatEvent_accessor_storage = __runInitializers(this, _formatEvent_initializers, void 0);
        //#endregion Private fields
        //#region Getter/Setters
        /**
         * Événement circulaire déclenché lors du formatage de la date.
         * Permet de personnaliser le formatage via un listener externe.
         */
        get formatEvent() { return this.#formatEvent_accessor_storage; }
        set formatEvent(value) { this.#formatEvent_accessor_storage = value; }
        /**
         * Définit ou obtient l'objet Date.
         * C'est le point d'entrée principal pour JS.
         */
        get date() {
            return this.#_originalDate;
        }
        set date(value) {
            this.setDate(value, this.#_startFormat, true);
        }
        /** Définit ou obtient le format d'affichage. */
        get format() {
            return this.#_outputFormat;
        }
        set format(value) {
            this.setAttribute(ATTRIBUTE_FORMAT, value);
        }
        /** Définit ou obtient la locale. */
        get locale() {
            return this.#_locale;
        }
        set locale(value) {
            this.setAttribute(ATTRIBUTE_LOCALE, value);
        }
        get localeElement() {
            return (__classPrivateFieldGet(this._, _classThis, "f", _HTMLBnumDate__LOCALES)[this.#_locale] ||
                this.#_locale ||
                __classPrivateFieldGet(this._, _classThis, "f", _HTMLBnumDate__LOCALES)[DEFAULT_LOCALE]);
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
            __runInitializers(this, _formatEvent_extraInitializers);
        }
        /**
         * Construit le DOM interne (appelé une seule fois).
         * @param container Le ShadowRoot
         */
        _p_buildDOM(container) {
            this.#_outputElement = document.createElement('span');
            this.#_outputElement.setAttribute('part', 'date-text'); // Permet de styler depuis l'extérieur
            container.append(this.#_outputElement);
        }
        /**
         * Phase de pré-chargement (avant _p_buildDOM).
         * On lit les attributs initiaux et le textContent.
         */
        _p_preload() {
            // On ajoute un listener sur `bnum-date:attribute-updated` pour trigger les propriété de manière + précises.
            this.addEventListener(EVENT_ATTRIBUTE_UPDATED, (e) => {
                this.trigger(`${EVENT_ATTRIBUTE_UPDATED}:${e.detail.property}`, e.detail);
            });
            // Lire les attributs de configuration
            this.#_outputFormat =
                this.getAttribute(ATTRIBUTE_FORMAT) || this.#_outputFormat;
            this.#_locale = this.getAttribute(ATTRIBUTE_LOCALE) || this.#_locale;
            this.#_startFormat = this.getAttribute(ATTRIBUTE_START_FORMAT) || null;
            // Déterminer la date initiale (priorité à data-date)
            const initialDateStr = this.getAttribute(ATTRIBUTE_DATE) || this.textContent?.trim() || null;
            // Définir la date sans déclencher de rendu (render=false)
            if (initialDateStr)
                this.setDate(initialDateStr, this.#_startFormat, false);
        }
        /**
         * Phase d'attachement (après _p_buildDOM).
         * C'est ici qu'on fait le premier rendu.
         */
        _p_attach() {
            this.#_renderDate();
        }
        /**
         * Gère les changements d'attributs (appelé après _p_preload).
         */
        _p_update(name, oldVal, newVal) {
            if (oldVal === newVal)
                return;
            let needsRender = false;
            switch (name) {
                case ATTRIBUTE_FORMAT:
                    this.#_outputFormat = newVal || DEFAULT_FORMAT;
                    needsRender = true;
                    break;
                case ATTRIBUTE_LOCALE:
                    this.#_locale = newVal || DEFAULT_LOCALE;
                    needsRender = true;
                    break;
                case ATTRIBUTE_START_FORMAT:
                    this.#_startFormat = newVal;
                    // Pas de re-rendu, affecte seulement le prochain setDate()
                    break;
                case ATTRIBUTE_DATE:
                    // Re-parse la date
                    this.setDate(newVal, this.#_startFormat, false);
                    needsRender = true;
                    break;
            }
            if (needsRender) {
                this.#_renderDate();
                // On déclenche l'événement pour la réactivité
                this.trigger(EVENT_ATTRIBUTE_UPDATED, {
                    property: name,
                    newValue: newVal,
                    oldValue: oldVal,
                });
            }
        }
        //#endregion Lifecycle
        //#region Public Methods
        /**
         * Définit la date à partir d'une chaîne, d'un objet Date ou null.
         * @param dateInput La date source.
         * @param startFormat Le format pour parser la date si c'est une chaîne.
         * @param triggerRender Indique s'il faut rafraîchir l'affichage (par défaut: true).
         */
        setDate(dateInput, startFormat, triggerRender = true) {
            const oldDate = this.#_originalDate;
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
                    const formatToUse = startFormat || this.#_startFormat;
                    if (formatToUse) {
                        // Parsing avec format spécifique
                        newDate = BnumDateUtils.parse(dateInput, formatToUse); //parse(dateInput, formatToUse, new Date());
                    }
                    else {
                        // Parsing natif (ISO 8601, timestamps...)
                        newDate = new Date(dateInput);
                    }
                }
            }
            // Vérification de la validité
            if (newDate && BnumDateUtils.isValid(newDate)) {
                this.#_originalDate = newDate;
            }
            else {
                this.#_originalDate = null;
            }
            // Déclenche le rendu et/ou l'événement si la date a changé
            if (oldDate?.getTime() !== this.#_originalDate?.getTime()) {
                if (triggerRender) {
                    this.#_renderDate();
                }
                this.trigger(EVENT_DATE, {
                    property: 'date',
                    newValue: this.#_originalDate,
                    oldValue: oldDate,
                });
            }
        }
        /** Récupère l'objet Date actuel. */
        getDate() {
            return this.#_originalDate;
        }
        /** Ajoute un nombre de jours à la date actuelle. */
        addDays(days) {
            if (!this.#_originalDate)
                return;
            this.date = BnumDateUtils.addDays(this.#_originalDate, days);
        }
        /** Ajoute un nombre de mois à la date actuelle. */
        addMonths(months) {
            if (!this.#_originalDate)
                return;
            this.date = BnumDateUtils.addMonths(this.#_originalDate, months);
        }
        /** Ajoute un nombre d'années à la date actuelle. */
        addYears(years) {
            if (!this.#_originalDate)
                return;
            this.date = BnumDateUtils.addYears(this.#_originalDate, years);
        }
        askRender() {
            if (this.#_renderSheduled)
                return;
            this.#_renderSheduled = true;
            requestAnimationFrame(() => {
                this.#_renderSheduled = false;
                this.#_renderDate();
            });
        }
        //#endregion Public Methods
        //#region Private Methods
        /**
         * Met à jour le textContent du span interne.
         * C'est la seule fonction qui écrit dans le DOM.
         */
        #_renderDate() {
            this._p_clearStates();
            if (!this.#_outputElement) {
                this._p_addState(STATE_NOT_READY);
                return; // Pas encore prêt
            }
            if (!this.#_originalDate) {
                this.#_outputElement.textContent = EMPTY_STRING; // Affiche une chaîne vide si date invalide/null
                this._p_addState(STATE_INVALID);
                return;
            }
            // Trouve la locale, avec fallback sur 'fr'
            const locale = this.localeElement;
            const textContent = this.#_format(locale).match({
                Ok: (formated) => this.formatEvent.call({ date: formated })?.date || formated,
                Err: (e) => {
                    Log.error('HTMLBnumDate/renderDate', `Erreur de formatage Intl. Format: "${this.#_outputFormat}`, '\\', BnumDateUtils.getOptionsFromToken(this.#_outputFormat), '"', e);
                    this._p_addState(STATE_INVALID);
                    return 'Date invalide';
                },
            });
            this.#_outputElement.textContent = textContent;
            this.setAttribute('aria-label', this.#_outputElement.textContent);
        }
        get #_format() { return _private__format_descriptor.value; }
        //#endregion Private Methods
        //#region Statics
        /**
         * Méthode statique pour la création (non implémentée ici,
         * mais suit le pattern de BnumElement).
         */
        static Create(dateInput, options) {
            const el = document.createElement(this.TAG).condAttr(options?.startFormat, ATTRIBUTE_START_FORMAT, options?.startFormat ?? EMPTY_STRING);
            if (options?.format)
                el.format = options.format;
            if (options?.locale)
                el.locale = options.locale;
            if (typeof dateInput === 'string')
                el.appendChild(document.createTextNode(dateInput));
            else if (dateInput)
                el.date = dateInput;
            return el;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    });
    return _classThis;
})();

/**
 * Composant Web Component utilitaire "Fragment".
 * * Ce composant agit comme un conteneur logique pour regrouper des éléments du DOM
 * sans introduire de boîte de rendu visuelle supplémentaire (via `display: contents` généralement défini dans le style).
 *
 * @remarks
 * Il permet de contourner la règle "un seul élément racine" ou de grouper des éléments
 * pour des traitements logiques (boucles, conditions) sans briser le contexte de formatage
 * CSS du parent (ex: `display: grid` ou `display: flex`).
 *
 * @example
 * ```html
 * <div class="grid-container">
 * <bnum-fragment>
 * <div class="cell-1">Item A</div>
 * <div class="cell-2">Item B</div>
 * </bnum-fragment>
 * </div>
 * ```
 */
let HTMLBnumFragment = (() => {
    let _classDecorators = [Define({ tag: TAG_FRAGMENT }), Light()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElement;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor() {
            super();
        }
        connectedCallback() {
            if (this.style.display !== 'contents')
                this.style.display = 'contents';
        }
    });
    return _classThis;
})();

/**
 * Factory de décorateurs pour différer l'exécution d'une méthode.
 * @internal
 */
function createAsyncDecorator(scheduler, name) {
    return function (target, context) {
        const methodName = String(context.name);
        return function (...args) {
            // Planifie l'exécution
            scheduler(() => {
                try {
                    // Exécute la méthode originale avec le contexte et les arguments préservés
                    target.apply(this, args);
                }
                catch (error) {
                    console.error(`[${name}] Error executing deferred method '${methodName}'`, error);
                }
            });
        };
    };
}
/**
 * Diffère l'exécution de la méthode juste avant le prochain rafraîchissement de l'écran (Paint).
 * Utilise `requestAnimationFrame(...)`.
 *
 * Idéal pour les manipulations DOM visuelles ou les animations afin de garantir la fluidité (60fps)
 * et éviter le "Layout Thrashing".
 */
function RenderFrame() {
    return function (target, context) {
        return createAsyncDecorator((fn) => requestAnimationFrame(fn), 'RenderFrame')(target, context);
    };
}

var css_248z$m = ":host{border-bottom:thin dotted;cursor:help}";

/**
 * Constante représentant l'icône utilisée par défaut.
 */
const ICON = 'help';
(() => {
    let _classDecorators = [Define({ tag: TAG_HELPER, styles: css_248z$m })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElement;
    let _instanceExtraInitializers = [];
    let _private__render_decorators;
    let _private__render_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__render_decorators = [RenderFrame()];
            __esDecorate(this, _private__render_descriptor = { value: __setFunctionName(function () {
                    if (this.hasChildNodes()) {
                        this.setAttribute('title', this.textContent ?? EMPTY_STRING);
                        this.textContent = EMPTY_STRING;
                    }
                }, "#_render") }, _private__render_decorators, { kind: "method", name: "#_render", static: false, private: true, access: { has: obj => #_render in obj, get: obj => obj.#_render }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        /**
         * Constructeur de l'élément HTMLBnumHelper.
         * Initialise l'élément.
         */
        constructor() {
            super();
            __runInitializers(this, _instanceExtraInitializers);
        }
        /**
         * Précharge les données de l'élément.
         * Si l'élément possède des enfants, le texte est déplacé dans l'attribut title et le contenu est vidé.
         */
        _p_preload() {
            super._p_preload();
            this.#_render();
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
         * Génère le rendu du composant
         */
        get #_render() { return _private__render_descriptor.value; }
        /**
         * Crée une nouvelle instance de HTMLBnumHelper avec le texte d'aide spécifié.
         * @param title Texte d'aide à afficher dans l'attribut title.
         * @returns {HTMLBnumHelper} Instance du composant.
         */
        static Create(title) {
            const element = document.createElement(this.TAG);
            element.setAttribute('title', title);
            return element;
        }
    });
    return _classThis;
})();

function OnLinkedClickEventInitializer(event, instance) {
    instance.addEventListener('click', () => {
        event.call();
    });
}

var css_248z$l = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{cursor:pointer;font-variation-settings:\"wght\" 400;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}:host(:hover){--bnum-icon-fill:1}:host(:active){--bnum-icon-fill:1;--bnum-icon-weight:700;--bnum-icon-grad:200;--bnum-icon-opsz:20}:host(:disabled),:host([disabled]){cursor:not-allowed;opacity:var(--bnum-button-disabled-opacity,.6);pointer-events:var(--bnum-button-disabled-pointer-events,none)}";

//#region Global Constants
const ID_ICON$1 = 'icon';
//#endregion Global Constants
const TEMPLATE$e = (h(HTMLBnumIcon, { id: ID_ICON$1, children: h("slot", {}) }));
/**
 * Button contenant une icône.
 *
 * @structure Button Icon
 * <bnum-icon-button>home</bnum-icon-button>
 *
 * @structure Button Disabled
 * <bnum-icon-button disabled>home</bnum-icon-button>
 *
 * @cssvar {0.6} --bnum-button-disabled-opacity - Opacité du bouton désactivé
 * @cssvar {none} --bnum-button-disabled-pointer-events - Gestion des événements souris pour le bouton désactivé
 *
 * @slot (default) - Contenu de l'icône (nom de l'icône à afficher)
 */
let HTMLBnumButtonIcon = (() => {
    let _classDecorators = [Define({ styles: css_248z$l, tag: TAG_ICON_BUTTON, template: TEMPLATE$e }), Observe('click')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElement;
    let ___decorators;
    let ___initializers = [];
    let ___extraInitializers = [];
    let _private__linkedClickEvent_decorators;
    let _private__linkedClickEvent_initializers = [];
    let _private__linkedClickEvent_extraInitializers = [];
    let _private__linkedClickEvent_descriptor;
    var HTMLBnumButtonIcon = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            ___decorators = [Self];
            _private__linkedClickEvent_decorators = [Listener(OnLinkedClickEventInitializer, { lazy: false })];
            __esDecorate(this, _private__linkedClickEvent_descriptor = { get: __setFunctionName(function () { return this.#_linkedClickEvent_accessor_storage; }, "#_linkedClickEvent", "get"), set: __setFunctionName(function (value) { this.#_linkedClickEvent_accessor_storage = value; }, "#_linkedClickEvent", "set") }, _private__linkedClickEvent_decorators, { kind: "accessor", name: "#_linkedClickEvent", static: false, private: true, access: { has: obj => #_linkedClickEvent in obj, get: obj => obj.#_linkedClickEvent, set: (obj, value) => { obj.#_linkedClickEvent = value; } }, metadata: _metadata }, _private__linkedClickEvent_initializers, _private__linkedClickEvent_extraInitializers);
            __esDecorate(null, null, ___decorators, { kind: "field", name: "_", static: false, private: false, access: { has: obj => "_" in obj, get: obj => obj._, set: (obj, value) => { obj._ = value; } }, metadata: _metadata }, ___initializers, ___extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HTMLBnumButtonIcon = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        /**
         * Référence vers l'élément icône à l'intérieur du bouton
         */
        #_icon = null;
        #_lastClick = null;
        //#endregion Private fields
        //#region Getters/Setters
        /** Référence à la classe HTMLBnumButtonIcon */
        _ = __runInitializers(this, ___initializers, void 0);
        #_linkedClickEvent_accessor_storage = (__runInitializers(this, ___extraInitializers), __runInitializers(this, _private__linkedClickEvent_initializers, void 0));
        get #_linkedClickEvent() { return _private__linkedClickEvent_descriptor.get.call(this); }
        set #_linkedClickEvent(value) { return _private__linkedClickEvent_descriptor.set.call(this, value); }
        /**
         * Référence vers l'élément icône à l'intérieur du bouton.
         *
         * Si l'icône n'a pas été mise en mémoire, elle sera cherché puis mise en mémoire.
         */
        get #_iconElement() {
            if (!this.#_icon) {
                const icon = this.querySelector(HTMLBnumIcon.TAG) ??
                    this.shadowRoot?.getElementById(ID_ICON$1);
                if (!icon)
                    this.#_throw('Icon element not found inside icon button');
                this.#_icon = icon;
            }
            return this.#_icon;
        }
        /**
         * Icône affichée dans le bouton
         */
        get icon() {
            return ((this.#_iconElement.icon || this.#_throw('Icon is not defined')) ??
                EMPTY_STRING);
        }
        set icon(value) {
            this.#_iconElement.icon = value;
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
            __runInitializers(this, _private__linkedClickEvent_extraInitializers);
        }
        /**
         * @inheritdoc
         */
        _p_buildDOM() {
            HTMLBnumButton.ToButton(this);
            if (this.title === EMPTY_STRING)
                Log.warn(this._.TAG, 'Icon button should have a title for accessibility purposes');
            if (this.hasAttribute('click')) {
                const click = this.getAttribute('click');
                this.#_updateAttributeClick(click ?? EMPTY_STRING);
            }
        }
        _p_update(name, oldVal, newVal) {
            if (oldVal === newVal)
                return;
            if (name === 'click') {
                this.#_updateAttributeClick(newVal ?? EMPTY_STRING);
            }
        }
        //#endregion Lifecycle
        //#region Private methods
        #_updateAttributeClick(val) {
            if (val !== this.#_lastClick) {
                this.#_lastClick = val;
                if (this.#_linkedClickEvent.has('click'))
                    this.#_linkedClickEvent.remove('click');
                if (val && REG_XSS_SAFE.test(val)) {
                    this.#_linkedClickEvent.add('click', (click) => {
                        // Si c'est un id unique
                        var elementToClick = document.getElementById(click);
                        if (elementToClick)
                            elementToClick.click();
                        else {
                            // Sinon on part du principe que c'est un sélecteur CSS
                            const elements = document.querySelector(click);
                            if (elements)
                                elements.click();
                            else
                                throw new Error(`[${this._.TAG}] L'attribut 'click' ne référence aucun élément.`);
                        }
                    }, val);
                }
            }
        }
        /**
         * Permet de lancer une erreur avec un message spécifique dans une expression inline.
         * @param msg Message à envoyer dans l'erreur.
         */
        #_throw(msg) {
            throw new Error(msg);
        }
        //#endregion Private methods
        //#region Static methods
        /**
         * Génère un bouton icône avec l'icône spécifiée.
         * @param icon Icône à afficher dans le bouton.
         * @returns Node créée.
         */
        static Create(icon) {
            const node = document.createElement(this.TAG);
            node.icon = icon;
            return node;
        }
        /**
         * Génère le code HTML d'un bouton icône avec l'icône spécifiée.
         * @param icon Icône à afficher dans le bouton.
         * @returns Code HTML créée.
         */
        static Write(icon, attrs = {}) {
            return h(HTMLBnumButtonIcon, { ...attrs, children: icon });
        }
    };
    return HTMLBnumButtonIcon = _classThis;
})();

var css_248z$k = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host .addons__inner{position:relative;width:100%}:host #input__button,:host #input__icon,:host .state{display:none}:host(:disabled),:host(:state(disabled)){cursor:not-allowed;opacity:.6;pointer-events:none}:host(:state(button)) .addons{display:flex;gap:0}:host(:state(button)) .addons .addon__inner{flex:1}:host(:state(button)) input{border-top-right-radius:0}:host(:state(button)) #input__button,:host(:state(button)) input{--bnum-input-line-color:#000091}:host(:state(button)) #input__button{border-bottom-left-radius:0;border-bottom-right-radius:0;border-top-left-radius:0;display:block;height:auto}:host(:state(button):state(obi)) #input__button{--bnum-button-icon-gap:0;display:flex}:host(:state(icon)) #input__icon{display:block;position:absolute;right:var(--bnum-input-icon-right,10px);top:var(--bnum-input-icon-top,10px)}:host(:state(state):state(success)) #input__button,:host(:state(state):state(success)) input{--bnum-input-line-color:var(--bnum-input-state-success-color,var(--bnum-semantic-success,#36b37e))}:host(:state(state):state(error)) #input__button,:host(:state(state):state(error)) input{--bnum-input-line-color:var(--bnum-input-state-error-color,var(--bnum-semantic-danger,#de350b))}";

const ID_INPUT$1 = 'bnum-input';
const ID_HINT_TEXT = 'hint-text';
const ID_HINT_TEXT_LABEL = 'hint-text__label';
const ID_HINT_TEXT_HINT = 'hint-text__hint';
const ID_INPUT_ICON = 'input__icon';
const ID_INPUT_BUTTON = 'input__button';
const ID_STATE = 'state';
const ID_STATE_ICON = 'state__icon';
const ID_SUCCESS_TEXT = 'success-text';
const ID_ERROR_TEXT = 'error-text';
const CLASS_STATE_TEXT_SUCCESS = 'state__text success';
const CLASS_STATE_TEXT_ERROR = 'state__text error';
const DEFAULT_INPUT_TYPE = 'text';
const DEFAULT_BUTTON_VARIATION = ButtonVariation.PRIMARY;
const SLOT_HINT = 'hint';
const SLOT_BUTTON = 'button';
const SLOT_SUCCESS = 'success';
const SLOT_ERROR = 'error';
const TEXT_VALID_INPUT = BnumConfig.Get('local_keys')?.valid_input || 'Le champs est valide !';
const TEXT_INVALID_INPUT = BnumConfig.Get('local_keys')?.invalid_input || 'Le champs est invalide !';
const TEXT_ERROR_FIELD = BnumConfig.Get('local_keys')?.error_field || 'Ce champ contient une erreur.';
const EVENT_BUTTON_CLICK = 'bnum-input:button.click';
const EVENT_INPUT = 'input';
const EVENT_CHANGE$4 = 'change';
const ATTRIBUTE_DATA_VALUE = 'data-value';
const ATTRIBUTE_PLACEHOLDER = 'placeholder';
const ATTRIBUTE_TYPE = 'type';
const ATTRIBUTE_DISABLED$1 = 'disabled';
const ATTRIBUTE_STATE = 'state';
const ATTRIBUTE_BUTTON = 'button';
const ATTRIBUTE_BUTTON_ICON = 'button-icon';
const ATTRIBUTE_ICON = 'icon';
const ATTRIBUTE_REQUIRED = 'required';
const ATTRIBUTE_READONLY = 'readonly';
const ATTRIBUTE_PATTERN = 'pattern';
const ATTRIBUTE_MINLENGTH = 'minlength';
const ATTRIBUTE_MAXLENGTH = 'maxlength';
const ATTRIBUTE_AUTOCOMPLETE = 'autocomplete';
const ATTRIBUTE_INPUTMODE = 'inputmode';
const ATTRIBUTE_SPELLCHECK = 'spellcheck';
const ATTRIBUTE_IGNOREVALUE = 'ignorevalue';
const STATE_SUCCESS = 'success';
const STATE_ERROR$1 = 'error';
const STATE_BUTTON = 'button';
/**
 * obi = Only Button Icon
 */
const STATE_OBI = 'obi';
const STATE_STATE$1 = 'state';
const ICON_SUCCESS = 'check_circle';
const ICON_ERROR = 'cancel';

function Render(addonInner = EMPTY_STRING) {
    return (h(HTMLBnumFragment, { children: [h("label", { id: ID_HINT_TEXT, for: ID_INPUT$1, class: "label-container", children: [h("span", { id: ID_HINT_TEXT_LABEL, class: "label-container--label", children: h("slot", {}) }), h("span", { id: ID_HINT_TEXT_HINT, class: "label-container--hint hint-label", children: h("slot", { name: SLOT_HINT }) })] }), h("div", { class: "container", children: [h("div", { class: "addons", children: [h("div", { class: "addon__inner", children: [addonInner, h(HTMLBnumIcon, { id: ID_INPUT_ICON }), h("input", { class: "input-like", id: ID_INPUT$1, type: DEFAULT_INPUT_TYPE })] }), h(HTMLBnumButton, { id: ID_INPUT_BUTTON, rounded: true, "data-variation": DEFAULT_BUTTON_VARIATION, children: h("slot", { name: SLOT_BUTTON }) })] }), h("span", { id: ID_STATE, class: "state", children: [h(HTMLBnumIcon, { id: ID_STATE_ICON }), h("span", { id: ID_SUCCESS_TEXT, class: CLASS_STATE_TEXT_SUCCESS, children: h("slot", { name: SLOT_SUCCESS, children: ["$", TEXT_VALID_INPUT] }) }), h("span", { id: ID_ERROR_TEXT, class: CLASS_STATE_TEXT_ERROR, children: h("slot", { name: SLOT_ERROR, children: TEXT_INVALID_INPUT }) })] })] })] }));
}

const EVENT_DEFAULT = 'default';

function OnButtonClickedInitializer(event, instance) {
    event.add(EVENT_DEFAULT, (clickEvent) => {
        instance.trigger(EVENT_BUTTON_CLICK, {
            innerEvent: clickEvent,
        });
    });
}

var css_248z$j = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.label-container{--internal-gap:0.5rem;display:flex;flex-direction:column;gap:var(--internal-gap,.5rem);margin-bottom:var(--internal-gap,.5rem)}.label-container--label{font-family:var(--bnum-font-family-primary);font-size:var(--bnum-font-label-size,var(--bnum-font-size-m));line-height:var(--bnum-font-label-line-height,var(--bnum-font-height-text-m))}.label-container--hint{color:var(--bnum-input-hint-text-color,var(--bnum-text-hint,#666));font-family:var(--bnum-font-family-primary);font-size:var(--bnum-font-hint-size,var(--bnum-font-size-xs));line-height:var(--bnum-font-hint-line-height,var(--bnum-font-height-text-xs))}.input-like{background-color:var(--bnum-input-background-color,var(--bnum-color-input,#eee));border:none;border-radius:.25rem .25rem 0 0;box-shadow:var(--bnum-input-box-shadow,inset 0 -2px 0 0 var(--bnum-input-line-color,var(--bnum-color-input-border,#3a3a3a)));color:var(--bnum-input-color,var(--bnum-text-on-input,#666));display:block;font-size:1rem;line-height:1.5rem;padding:.5rem 1rem;width:100%}";

var css_248z$i = ":host(:state(state)){border-left:2px solid var(--internal-border-color);display:block;padding-left:10px}:host(:state(state)) .state{align-items:center;color:var(--internal-color);display:flex;font-size:.75rem;margin-top:1rem}:host(:state(state)) .state bnum-icon{--bnum-icon-font-size:1rem;margin-right:5px}:host(:state(state)) .hint-label{color:var(--internal-color)}:host(:state(state)) .error,:host(:state(state)) .success{display:none;margin-bottom:-4px}:host(:state(state):state(success)){--internal-border-color:var(--bnum-input-state-success-color,var(--bnum-semantic-success,#36b37e))}:host(:state(state):state(success)) .hint-label,:host(:state(state):state(success)) .state{--internal-color:var(--bnum-input-state-success-color,var(--bnum-semantic-success,#36b37e))}:host(:state(state):state(success)) .success{display:block}:host(:state(state):state(error)){--internal-border-color:var(--bnum-input-state-error-color,var(--bnum-semantic-danger,#de350b))}:host(:state(state):state(error)) .hint-label,:host(:state(state):state(error)) .state{--internal-color:var(--bnum-input-state-error-color,var(--bnum-semantic-danger,#de350b))}:host(:state(state):state(error)) .error{display:block}";

const INPUT_BASE_STYLE = BnumElementInternal.ConstructCSSStyleSheet(css_248z$j);
const INPUT_STYLE_STATES = BnumElementInternal.ConstructCSSStyleSheet(css_248z$i);
const OBSERVED_ATTRIBUTES = [
    ATTRIBUTE_DATA_VALUE,
    ATTRIBUTE_PLACEHOLDER,
    ATTRIBUTE_TYPE,
    ATTRIBUTE_DISABLED$1,
    ATTRIBUTE_STATE,
    ATTRIBUTE_BUTTON,
    ATTRIBUTE_BUTTON_ICON,
    ATTRIBUTE_ICON,
    ATTRIBUTE_REQUIRED,
    ATTRIBUTE_READONLY,
    ATTRIBUTE_PATTERN,
    ATTRIBUTE_MINLENGTH,
    ATTRIBUTE_MAXLENGTH,
    ATTRIBUTE_AUTOCOMPLETE,
    ATTRIBUTE_INPUTMODE,
    ATTRIBUTE_SPELLCHECK,
    'min',
    'max',
    'step',
];
/**
 * Composant Input du design system Bnum.
 * Permet de gérer un champ de saisie enrichi avec gestion d'états, d'icônes, de bouton et d'accessibilité.
 *
 * @structure Sans rien
 * <bnum-input></bnum-input>
 *
 * @structure Avec une légende
 * <bnum-input>Label du champ</bnum-input>
 *
 * @structure Avec une légende et un indice
 * <bnum-input>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input>
 *
 * @structure Avec un bouton
 * <bnum-input button="true" button-icon="add">Label du champ
 *   <span slot="button">Ajouter</span>
 * </bnum-input>
 *
 * @structure En erreur
 * <bnum-input pattern="^[a-zA-Z0-9]+$" data-value="@@@@@">Label du champ
 * </bnum-input>
 *
 * @structure Avec un état de succès
 * <bnum-input state="success">Label du champ
 *   <span slot="success">Le champ est valide !</span>
 * </bnum-input>
 *
 * @structure Avec une icône
 * <bnum-input icon="search">Label du champ</bnum-input>
 *
 * @structure Avec un bouton avec icône seulement
 * <bnum-input placeholder="LA LA !" button-icon="add">Label du champ
 * </bnum-input>
 *
 * @structure Nombre
 * <bnum-input type="number" data-value="42">Label du champ</bnum-input>
 *
 * @structure Désactivé
 * <bnum-input disabled>
 *   Label du champ
 * </bnum-input>
 *
 * @structure Complet
 * <bnum-input
 *   data-value="Valeur initiale"
 *   placeholder="Texte indicatif"
 *   type="text"
 *   state="error"
 *   icon="search"
 *   button="primary"
 *   button-icon="send"
 * >
 *   Label du champ
 *   <span slot="hint">Indice d'utilisation</span>
 *   <span slot="success">Le champ est valide !</span>
 *   <span slot="error">Le champ est invalide !</span>
 *   <span slot="button">Envoyer</span>
 * </bnum-input>
 *
 * @slot (defaut) - Contenu du label principal du champ.
 * @slot hint - Contenu de l'indice d'utilisation (hint) du champ.
 * @slot success - Contenu du message de succès du champ.
 * @slot error - Contenu du message d'erreur du champ.
 * @slot button - Contenu du bouton interne (si présent).
 *
 * @state success - État de succès.
 * @state error - État d'erreur.
 * @state disabled - État désactivé.
 * @state icon - Présence d'une icône.
 * @state button - Présence d'un bouton.
 * @state obi - Bouton avec icône seulement (sans texte).
 * @state state - Présence d'un état (success / error).
 *
 * @event {MouseEvent} bnum-input:button.click - Événement déclenché au clic sur le bouton interne.
 * @event {InputEvent} input - Événement déclenché à la saisie dans le champ.
 * @event {Event} change - Événement déclenché au changement de valeur du champ.
 *
 * @attr {string} (optional) (default: undefined) data-value - Valeur initiale du champ.
 * @attr {string} (optional) (default: undefined) placeholder - Texte indicatif du champ.
 * @attr {string} (optional) (default: 'text') type - Type de l'input (text, password, email, etc.)
 * @attr {string} (optional) (default: undefined) disabled - Désactive le champ.
 * @attr {string} (optional) (default: undefined) state - État du champ (success, error, etc.).
 * @attr {string} (optional) (default: undefined) button - Présence d'un bouton interne (primary, secondary, danger, ...).
 * @attr {string} (optional) (default: undefined) button-icon - Icône du bouton interne.
 * @attr {string} (optional) (default: undefined) icon - Icône à afficher dans le champ.
 * @attr {string} (optional) (default: undefined) required - Champ requis.
 * @attr {string} (optional) (default: undefined) readonly - Champ en lecture seule.
 * @attr {string} (optional) (default: undefined) pattern - Expression régulière de validation.
 * @attr {string} (optional) (default: undefined) minlength - Longueur minimale du champ.
 * @attr {string} (optional) (default: undefined) maxlength - Longueur maximale du champ.
 * @attr {string} (optional) (default: undefined) autocomplete - Attribut autocomplete HTML.
 * @attr {string} (optional) (default: undefined) inputmode - Mode de saisie (mobile).
 * @attr {string} (optional) (default: undefined) spellcheck - Correction orthographique.
 * @attr {string} (optional) (default: undefined) ignorevalue - Attribut interne pour ignorer la synchronisation de valeur. Ne pas utiliser.
 * @attr {string} (optional) (default: undefined) name - Nom du champ (attribut HTML name).
 *
 * @cssvar {#666} --bnum-input-hint-text-color - Couleur du texte du hint.
 * @cssvar {#eee} --bnum-input-background-color - Couleur de fond de l'input.
 * @cssvar {#666} --bnum-input-color - Couleur du texte de l'input.
 * @cssvar {#3a3a3a} --bnum-input-line-color - Couleur de la ligne/bordure de l'input.
 * @cssvar {#36b37e} --bnum-input-state-success-color - Couleur de l'état de succès.
 * @cssvar {#de350b} --bnum-input-state-error-color - Couleur de l'état d'erreur.
 * @cssvar {inset 0 -2px 0 0 #3a3a3a} --bnum-input-box-shadow - Ombre portée de l'input.
 *
 */
let HTMLBnumInput = (() => {
    var _HTMLBnumInput__CreateSlotElement;
    let _classDecorators = [Define({
            tag: TAG_INPUT,
            // eslint-disable-next-line no-restricted-syntax
            template: Render(),
            styles: [INPUT_BASE_STYLE, INPUT_STYLE_STATES, css_248z$k],
        }), Observe(OBSERVED_ATTRIBUTES)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let ___decorators;
    let ___initializers = [];
    let ___extraInitializers = [];
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _onButtonClicked_decorators;
    let _onButtonClicked_initializers = [];
    let _onButtonClicked_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let __p_inputValueChangedCallback_decorators;
    let _private__setFormValue_decorators;
    let _private__setFormValue_descriptor;
    let _private__internalSetValidity_decorators;
    let _private__internalSetValidity_descriptor;
    let _private__safeCheckValidity_decorators;
    let _private__safeCheckValidity_descriptor;
    let _private__dispatchEvent_decorators;
    let _private__dispatchEvent_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static { __setFunctionName(this, "HTMLBnumInput"); }
        static { _HTMLBnumInput__CreateSlotElement = function _HTMLBnumInput__CreateSlotElement(node, slotName, content) {
            if (content) {
                const element = document.createElement('span');
                element.slot = slotName;
                element.textContent = content;
                node.appendChild(element);
            }
        }; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            ___decorators = [Self];
            _private__ui_decorators = [UI({
                    stateIcon: `#${ID_STATE_ICON}`,
                    icon: `#${ID_INPUT_ICON}`,
                    button: `#${ID_INPUT_BUTTON}`,
                    input: `#${ID_INPUT$1}`,
                })];
            _onButtonClicked_decorators = [Listener(OnButtonClickedInitializer, { lazy: false })];
            _name_decorators = [Attr()];
            __p_inputValueChangedCallback_decorators = [Risky()];
            _private__setFormValue_decorators = [Risky()];
            _private__internalSetValidity_decorators = [Risky()];
            _private__safeCheckValidity_decorators = [Risky()];
            _private__dispatchEvent_decorators = [Risky()];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _onButtonClicked_decorators, { kind: "accessor", name: "onButtonClicked", static: false, private: false, access: { has: obj => "onButtonClicked" in obj, get: obj => obj.onButtonClicked, set: (obj, value) => { obj.onButtonClicked = value; } }, metadata: _metadata }, _onButtonClicked_initializers, _onButtonClicked_extraInitializers);
            __esDecorate(this, null, _name_decorators, { kind: "accessor", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(this, null, __p_inputValueChangedCallback_decorators, { kind: "method", name: "_p_inputValueChangedCallback", static: false, private: false, access: { has: obj => "_p_inputValueChangedCallback" in obj, get: obj => obj._p_inputValueChangedCallback }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__setFormValue_descriptor = { value: __setFunctionName(function (value) {
                    this._p_internal.setFormValue(value);
                    return ATresult.Ok();
                }, "#_setFormValue") }, _private__setFormValue_decorators, { kind: "method", name: "#_setFormValue", static: false, private: true, access: { has: obj => #_setFormValue in obj, get: obj => obj.#_setFormValue }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__internalSetValidity_descriptor = { value: __setFunctionName(function (flags, message, anchor) {
                    return this._p_internal.setValidity(flags, message, anchor);
                }, "#_internalSetValidity") }, _private__internalSetValidity_decorators, { kind: "method", name: "#_internalSetValidity", static: false, private: true, access: { has: obj => #_internalSetValidity in obj, get: obj => obj.#_internalSetValidity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__safeCheckValidity_descriptor = { value: __setFunctionName(function () {
                    return this.#_ui.input.checkValidity();
                }, "#_safeCheckValidity") }, _private__safeCheckValidity_decorators, { kind: "method", name: "#_safeCheckValidity", static: false, private: true, access: { has: obj => #_safeCheckValidity in obj, get: obj => obj.#_safeCheckValidity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__dispatchEvent_descriptor = { value: __setFunctionName(function (e) {
                    this.dispatchEvent(e);
                    return ATresult.Ok();
                }, "#_dispatchEvent") }, _private__dispatchEvent_decorators, { kind: "method", name: "#_dispatchEvent", static: false, private: true, access: { has: obj => #_dispatchEvent in obj, get: obj => obj.#_dispatchEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, null, ___decorators, { kind: "field", name: "_", static: false, private: false, access: { has: obj => "_" in obj, get: obj => obj._, set: (obj, value) => { obj._ = value; } }, metadata: _metadata }, ___initializers, ___extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        //#region Constants
        static SYNCED_ATTRIBUTES = [
            ATTRIBUTE_PATTERN,
            ATTRIBUTE_MINLENGTH,
            ATTRIBUTE_MAXLENGTH,
            ATTRIBUTE_AUTOCOMPLETE,
            ATTRIBUTE_INPUTMODE,
            ATTRIBUTE_SPELLCHECK,
            'min',
            'max',
            'step',
        ];
        //#endregion Constants
        //#region Private fields
        /**
         * Valeur initiale (pour la réinitialisation du formulaire)
         */
        #_initValue = (__runInitializers(this, _instanceExtraInitializers), EMPTY_STRING);
        //#endregion Private fields
        //#region Getters/Setters
        /** Référence à la classe HTMLBnumInput */
        _ = __runInitializers(this, ___initializers, void 0);
        #_ui_accessor_storage = (__runInitializers(this, ___extraInitializers), __runInitializers(this, _private__ui_initializers, void 0));
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #onButtonClicked_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _onButtonClicked_initializers, void 0));
        /**
         * Permet d'écouter le clic sur le bouton interne.
         */
        get onButtonClicked() { return this.#onButtonClicked_accessor_storage; }
        set onButtonClicked(value) { this.#onButtonClicked_accessor_storage = value; }
        #name_accessor_storage = (__runInitializers(this, _onButtonClicked_extraInitializers), __runInitializers(this, _name_initializers, EMPTY_STRING));
        // -- Formulaire --
        /**
         * Nom du champ (attribut HTML name).
         */
        get name() { return this.#name_accessor_storage; }
        set name(value) { this.#name_accessor_storage = value; }
        /**
         * Valeur courante du champ de saisie.
         */
        get value() {
            return (this.#_ui.input?.value ||
                this.getAttribute(ATTRIBUTE_DATA_VALUE) ||
                EMPTY_STRING);
        }
        set value(val) {
            if (this.#_ui.input === null)
                this.setAttribute(ATTRIBUTE_DATA_VALUE, val);
            else {
                this.#_ui.input.value = val;
                this.#_setFormValue(val);
            }
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        /**
         * Constructeur du composant.
         * Initialise la valeur initiale à partir de l'attribut data-value.
         */
        constructor() {
            super();
            __runInitializers(this, _name_extraInitializers);
            this.#_initValue = this.getAttribute(ATTRIBUTE_DATA_VALUE) ?? EMPTY_STRING;
        }
        /**
         * Attache un Shadow DOM personnalisé.
         */
        _p_attachCustomShadow() {
            return this.attachShadow({ mode: 'open', delegatesFocus: true });
        }
        /**
         * Construit le DOM interne et attache les écouteurs d'événements.
         */
        _p_buildDOM() {
            this.#_ui.input.addEventListener(EVENT_INPUT, e => {
                this.#_inputValueChangedCallback(e);
            });
            this.#_ui.input.addEventListener(EVENT_CHANGE$4, e => {
                this.#_inputValueChangedCallback(e);
            });
            this.#_initialiseButton().#_update().#_removeValueAttribute();
        }
        /**
         * Met à jour le composant lors d'un changement d'attribut.
         */
        _p_update(name, oldVal, newVal) {
            if (this.alreadyLoaded === false)
                return 'break';
            if (newVal == oldVal)
                return;
            switch (name) {
                case ATTRIBUTE_DATA_VALUE:
                    if (this.attr(ATTRIBUTE_IGNOREVALUE) !== null) {
                        this.removeAttribute(ATTRIBUTE_IGNOREVALUE);
                        break;
                    }
                    if (newVal !== null) {
                        this._p_internal.setFormValue(newVal);
                        if (this.#_ui.input)
                            this.#_ui.input.value = newVal;
                        this.#_removeValueAttribute();
                    }
                    break;
            }
        }
        /**
         * Appelé après le flush du DOM pour synchroniser l'état.
         */
        _p_postFlush() {
            this.#_update();
        }
        //#endregion Lifecycle
        //#region Public methods
        // --- Formulaire --
        /**
         * Réinitialise la valeur du champ lors d'une remise à zéro du formulaire parent.
         */
        formResetCallback() {
            this.value = this.#_initValue;
        }
        /**
         * Active ou désactive le champ selon l'état du fieldset parent.
         */
        formDisabledCallback(disabled) {
            if (disabled)
                this.setAttribute(ATTRIBUTE_DISABLED$1, 'disabled');
            this.#_sync();
        }
        // -- Helper --
        /**
         * Active le bouton interne avec texte, icône et variation éventuels.
         * @param options Objet contenant le texte, l'icône et la variation du bouton.
         * @returns {this} L'instance courante pour chaînage.
         */
        enableButton({ text = undefined, icon = undefined, variation = DEFAULT_BUTTON_VARIATION, } = {}) {
            this.setAttribute(ATTRIBUTE_BUTTON, variation);
            if (text !== undefined) {
                this.querySelector(`slot[name="${SLOT_BUTTON}"]`)?.remove?.();
                const span = this._p_createSpan({
                    child: text,
                    attributes: { slot: 'button' },
                });
                this.appendChild(span);
            }
            if (icon !== undefined) {
                this.setAttribute(ATTRIBUTE_BUTTON_ICON, icon);
            }
            return this;
        }
        /**
         * Active uniquement l'icône du bouton interne (sans texte).
         * @param icon Nom de l'icône à afficher sur le bouton.
         * @returns {this} L'instance courante pour chaînage.
         */
        enableButtonIconOnly(icon) {
            this.querySelector(`slot[name="${SLOT_BUTTON}"]`)?.remove?.();
            this.removeAttribute(ATTRIBUTE_BUTTON);
            this.setAttribute(ATTRIBUTE_BUTTON_ICON, icon);
            return this;
        }
        /**
         * Masque le bouton interne.
         * @returns {this} L'instance courante pour chaînage.
         */
        hideButton() {
            this.removeAttribute(ATTRIBUTE_BUTTON);
            this.removeAttribute(ATTRIBUTE_BUTTON_ICON);
            return this;
        }
        /**
         * Définit l'état de succès avec un message optionnel.
         * @param message Message de succès à afficher.
         * @returns {this} L'instance courante pour chaînage.
         */
        setSuccessState(message) {
            return this.#_setState(SLOT_SUCCESS, message);
        }
        /**
         * Définit l'état d'erreur avec un message optionnel.
         * @param message Message d'erreur à afficher.
         * @returns {this} L'instance courante pour chaînage.
         */
        setErrorState(message) {
            return this.#_setState(SLOT_ERROR, message);
        }
        /**
         * Définit une icône à afficher dans le champ.
         * @param icon Nom de l'icône à afficher.
         * @returns {this} L'instance courante pour chaînage.
         */
        setIcon(icon) {
            this.setAttribute(ATTRIBUTE_ICON, icon);
            return this;
        }
        /**
         * Supprime l'icône affichée dans le champ.
         * @returns {this} L'instance courante pour chaînage.
         */
        removeIcon() {
            this.removeAttribute(ATTRIBUTE_ICON);
            return this;
        }
        /**
         * Définit un indice d'utilisation (hint) pour le champ.
         * @param hint Texte de l'indice à afficher.
         * @returns {this} L'instance courante pour chaînage.
         */
        setHint(hint) {
            this.removeHint();
            const span = this._p_createSpan({
                child: hint,
                attributes: { slot: SLOT_HINT },
            });
            this.appendChild(span);
            return this;
        }
        /**
         * Supprime l'indice d'utilisation (hint) du champ.
         * @returns {this} L'instance courante pour chaînage.
         */
        removeHint() {
            this.querySelector(`slot[name="${SLOT_HINT}"]`)?.remove?.();
            return this;
        }
        /**
         * Définit le label principal du champ.
         * @param label Texte ou élément HTML à utiliser comme label.
         * @returns {this} L'instance courante pour chaînage.
         */
        setLabel(label) {
            // On supprime tout ce qui n'a pas l'attribut slot
            const nodes = Array.from(this.childNodes);
            for (const node of nodes) {
                if (node instanceof HTMLElement) {
                    const element = node;
                    if (!element.hasAttribute('slot'))
                        this.removeChild(element);
                }
            }
            if (typeof label === 'string')
                this.appendChild(this._p_createTextNode(label));
            else
                this.appendChild(label);
            return this;
        }
        //#endregion Public methods
        //#region Private methods
        /**
         * Supprime `data-value` et ajoute `ignorevalue` avant pour éviter les effets de bords
         * @returns Chaînage
         */
        #_removeValueAttribute() {
            this.attr(ATTRIBUTE_IGNOREVALUE, 'true').removeAttribute(ATTRIBUTE_DATA_VALUE);
            return this;
        }
        /**
         * Met à jour l'état visuel et fonctionnel du composant selon ses attributs.
         * @private
         * @returns {this} L'instance courante pour chaînage.
         */
        #_update() {
            this._p_clearStates();
            if (this.#_ui.input?.value || false)
                this._p_addState('value');
            const btnValue = this.attr(ATTRIBUTE_BUTTON);
            if (btnValue !== null) {
                this._p_addState(STATE_BUTTON);
                switch (btnValue) {
                    case ButtonVariation.PRIMARY:
                        this.#_ui.button.variation = ButtonVariation.PRIMARY;
                        break;
                    case ButtonVariation.SECONDARY:
                        this.#_ui.button.variation = ButtonVariation.SECONDARY;
                        break;
                    case ButtonVariation.DANGER:
                        this.#_ui.button.variation = ButtonVariation.DANGER;
                        break;
                }
            }
            const button_icon = this.attr(ATTRIBUTE_BUTTON_ICON);
            if (button_icon !== null) {
                this.#_ui.button.icon = button_icon;
                if (!this._p_hasState(STATE_BUTTON))
                    this._p_addStates(STATE_BUTTON, STATE_OBI);
                else if (btnValue === EMPTY_STRING)
                    this._p_addState(STATE_OBI);
            }
            const icon = this.attr(ATTRIBUTE_ICON);
            if (icon !== null) {
                this._p_addState(STATE_ICON$1);
                this.#_ui.icon.icon = icon;
            }
            if (this.attr(ATTRIBUTE_DISABLED$1) !== null)
                this._p_addState(STATE_DISABLED$2);
            return this.#_updateState(this.attr(ATTRIBUTE_STATE)).#_sync();
        }
        /**
         * Synchronise les propriétés et attributs de l'input interne.
         * Met à jour les propriétés HTML de l'input selon les attributs du composant.
         * @private
         * @returns {this} L'instance courante pour chaînage.
         */
        #_sync() {
            if (!this.#_ui.input)
                return this;
            const input = this.#_ui.input;
            // 1. Propriétés de base
            input.value = this.value;
            input.type = this.getAttribute(ATTRIBUTE_TYPE) || DEFAULT_INPUT_TYPE;
            input.placeholder =
                this.getAttribute(ATTRIBUTE_PLACEHOLDER) || EMPTY_STRING;
            // 2. États Booléens (On utilise .disabled / .readOnly pour la réactivité JS)
            input.disabled =
                this.hasAttribute(ATTRIBUTE_DISABLED$1) || this._p_hasState(STATE_DISABLED$2);
            input.readOnly = this.hasAttribute(ATTRIBUTE_READONLY);
            input.required = this.hasAttribute(ATTRIBUTE_REQUIRED);
            // 3. Validation & UX (On utilise setAttribute pour les attributs HTML5)
            for (const attr of this._.SYNCED_ATTRIBUTES) {
                this.#_setFieldAttr(attr);
            }
            return this.#_updateA11y();
        }
        /**
         * Met à jour l'accessibilité (a11y) de l'input selon l'état.
         * Met à jour les attributs ARIA et la validité de l'input.
         * @private
         * @returns {this} L'instance courante pour chaînage.
         */
        #_updateA11y() {
            if (!this.#_ui.input)
                return this;
            return this.#_setValidity();
        }
        /**
         * Met à jour l'état visuel selon l'état passé en paramètre.
         * @private
         * @param state L'état à appliquer (success, error, etc.)
         * @returns {this} L'instance courante pour chaînage.
         */
        #_updateState(state) {
            if (state !== null) {
                switch (state) {
                    case STATE_SUCCESS:
                        this._p_addStates(STATE_STATE$1, STATE_SUCCESS);
                        this.#_ui.stateIcon.icon = ICON_SUCCESS;
                        break;
                    case STATE_ERROR$1:
                        this._p_addStates(STATE_STATE$1, STATE_ERROR$1);
                        this.#_ui.stateIcon.icon = ICON_ERROR;
                        break;
                }
            }
            return this;
        }
        /**
         * Définit l'état (succès ou erreur) et le message associé.
         * @private
         * @param state Type d'état (success ou error).
         * @param message Message à afficher.
         * @returns {this} L'instance courante pour chaînage.
         */
        #_setState(state, message) {
            this.setAttribute(ATTRIBUTE_STATE, state);
            if (message) {
                this.querySelector(`slot[name="${state}"]`)?.remove?.();
                const span = this._p_createSpan({
                    child: message,
                    attributes: { slot: state },
                });
                this.appendChild(span);
            }
            return this;
        }
        /**
         * Met à jour la validité de l'input et les messages d'erreur/succès.
         * Gère également les attributs ARIA liés à la validation.
         * @private
         * @returns {this} L'instance courante pour chaînage.
         */
        #_setValidity() {
            if (!this.#_ui.input)
                return this;
            const stateAttr = this.attr(ATTRIBUTE_STATE);
            const isManualError = stateAttr === STATE_ERROR$1;
            if (isManualError) {
                this.#_internalSetValidity({ customError: true }, TEXT_ERROR_FIELD, this.#_ui.input);
            }
            else {
                this.#_safeCheckValidity().match({
                    Ok: isValid => {
                        const isSuccess = isValid && this.#_ui.input.validationMessage === EMPTY_STRING;
                        if (isSuccess) {
                            this.#_internalSetValidity({});
                        }
                        else {
                            this.#_internalSetValidity(this.#_ui.input.validity, this.#_ui.input.validationMessage, this.#_ui.input);
                        }
                        return void 0;
                    },
                    Err: () => this.#_internalSetValidity({}), // Fallback de sécurité
                });
            }
            return this.#_syncValidationUI(isManualError);
        }
        /**
         * Gère l'interface utilisateur de validation (messages, icônes, ARIA).
         * @param isManualError Si l'erreur est définie manuellement via l'attribut state.
         * @returns Cette instance pour chaînage.
         */
        #_syncValidationUI(isManualError) {
            const input = this.#_ui.input;
            const hasNativeError = input.validationMessage !== EMPTY_STRING;
            const isError = isManualError || (hasNativeError && !input.validity.valid);
            const isSuccess = !isManualError && hasNativeError && input.validity.valid;
            const hasState = isError || isSuccess;
            if (hasState) {
                this._p_addStates(STATE_STATE$1, isSuccess ? STATE_SUCCESS : STATE_ERROR$1);
                const successText = this.#_ui.input.validationMessage || TEXT_VALID_INPUT;
                const errorText = this.#_ui.input.validationMessage || TEXT_INVALID_INPUT;
                const validationText = isSuccess ? successText : errorText;
                const slotTextId = isSuccess ? ID_SUCCESS_TEXT : ID_ERROR_TEXT;
                this.shadowRoot.querySelector(`#${slotTextId} slot`).innerText = validationText;
                input.setAttribute('aria-invalid', isError ? 'true' : 'false');
                const descriptions = [];
                if (isError)
                    descriptions.push(ID_ERROR_TEXT);
                if (isSuccess)
                    descriptions.push(ID_SUCCESS_TEXT);
                input.setAttribute('aria-describedby', descriptions.join(' '));
            }
            else {
                input.removeAttribute('aria-invalid');
                input.removeAttribute('aria-describedby');
            }
            const finalState = isError ? STATE_ERROR$1 : isSuccess ? STATE_SUCCESS : null;
            return this.#_updateState(finalState);
        }
        /**
         * Initialise le bouton interne et son écouteur de clic.
         * Ajoute un écouteur d'événement sur le bouton si nécessaire.
         * @private
         * @returns {this} L'instance courante pour chaînage.
         */
        #_initialiseButton() {
            if (this.#_ui.button !== null) {
                this.#_ui.button.addEventListener('click', e => {
                    this.onButtonClicked.call(e);
                });
            }
            return this;
        }
        /**
         * Callback appelé lors d'un changement de valeur de l'input.
         * @private
         * @param e Evénement de changement de valeur.
         */
        #_inputValueChangedCallback(e) {
            this._p_inputValueChangedCallback(e);
        }
        /**
         * Callback protégé appelé lors d'un changement de valeur de l'input.
         * @protected
         * @param e Evénement de changement de valeur.
         * @returns Résultat de l'opération.
         */
        _p_inputValueChangedCallback(e) {
            this.#_setFormValue(this.#_ui.input.value);
            this.#_update();
            return this.#_dispatchEvent(e).tapError(() => {
                this.#_dispatchInputEventFallback(e);
            });
        }
        /**
         * Transfère un attribut du composant vers l'input interne si présent.
         * @private
         * @param attrName Nom de l'attribut à synchroniser.
         */
        #_setFieldAttr(attrName) {
            const val = this.getAttribute(attrName);
            if (val !== null)
                this.#_ui.input.setAttribute(attrName, val);
            else
                this.#_ui.input.removeAttribute(attrName);
            return this;
        }
        /**
         * Définit la valeur du formulaire interne.
         * @param value Valeur à définir.
         * @returns Résultat de l'opération.
         */
        get #_setFormValue() { return _private__setFormValue_descriptor.value; }
        /**
         * Met à jour la validité interne de l'input.
         * @param flags Drapeaux de validité.
         * @param message Message de validation.
         * @param anchor Ancre HTML pour le message.
         * @returns Résultat de l'opération.
         */
        get #_internalSetValidity() { return _private__internalSetValidity_descriptor.value; }
        /**
         * Fait une vérification sécurisée de la validité de l'input.
         * @returns Résultat de l'opération avec la validité.
         */
        get #_safeCheckValidity() { return _private__safeCheckValidity_descriptor.value; }
        /**
         * Effectue la dispatch de l'événement passé en paramètre.
         * @param e Evénement à dispatcher.
         * @returns Résultat de l'opération.
         */
        get #_dispatchEvent() { return _private__dispatchEvent_descriptor.value; }
        /**
         * Fallback pour la dispatch des événements input/change.
         * @param e Evènement qui pose problème
         */
        #_dispatchInputEventFallback(e) {
            this.dispatchEvent(e.type === 'input'
                ? new InputEvent('input', {
                    data: this.value,
                    inputType: this.attr('type') || 'text',
                })
                : new Event('change'));
        }
        //#endregion Private methods
        //#region Protected methods
        _p_initialiseButton() {
            return this.#_initialiseButton();
        }
        //#endregion Protected methods
        //#region Static methods
        /**
         * Crée une instance du composant avec les options fournies.
         * @param label Texte du label principal.
         * @param options Options d'initialisation (attributs et slots).
         * @returns {HTMLBnumInput} Instance du composant.
         */
        static Create(label, options = {}) {
            const slotsMap = {
                hint: SLOT_HINT,
                success: SLOT_SUCCESS,
                error: SLOT_ERROR,
                btnText: SLOT_BUTTON,
            };
            const el = document.createElement(this.TAG);
            el.textContent = label;
            for (const [key, value] of Object.entries(options)) {
                if (value === undefined)
                    continue;
                const slotName = slotsMap[key];
                if (slotName)
                    __classPrivateFieldGet(this, _classThis, "m", _HTMLBnumInput__CreateSlotElement).call(this, el, slotName, value);
                else
                    el.setAttribute(key, value);
            }
            return el;
        }
        static CreateRender(html = EMPTY_STRING) {
            // eslint-disable-next-line no-restricted-syntax
            return Render(html);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    });
    return _classThis;
})();

var css_248z$h = ":host(:state(icon)) #input__icon{--bnum-input-icon-right:var(--bnum-input-number-icon-right,40px)}";

const SHEET$3 = HTMLBnumInput.ConstructCSSStyleSheet(css_248z$h);
const TYPE$2 = 'number';
/**
 * Input nombre.
 *
 * @structure Sans rien
 * <bnum-input-number></bnum-input-number>
 *
 * @structure Avec une légende
 * <bnum-input-number>Label du champ</bnum-input-number>
 *
 * @structure Avec une légende et un indice
 * <bnum-input-number>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input-number>
 *
 * @structure Avec un bouton
 * <bnum-input-number button="true" button-icon="add">Label du champ
 *   <span slot="button">Ajouter</span>
 * </bnum-input-number>
 *
 * @structure En erreur
 * <bnum-input-number min="200" data-value="5">Label du champ
 * </bnum-input-number>
 *
 * @structure Avec un état de succès
 * <bnum-input-number state="success">Label du champ
 *   <span slot="success">Le champ est valide !</span>
 * </bnum-input-number>
 *
 * @structure Avec une icône
 * <bnum-input-number icon="search">Label du champ</bnum-input-number>
 *
 * @structure Avec un bouton avec icône seulement
 * <bnum-input-number placeholder="LA LA !" button-icon="add">Label du champ
 * </bnum-input-number>
 *
 * @structure Désactivé
 * <bnum-input-number disabled>
 *   Label du champ
 * </bnum-input-number>
 *
 * @structure Complet
 * <bnum-input-number
 *   data-value="5"
 *   placeholder="Texte indicatif"
 *   type="text"
 *   state="error"
 *   icon="search"
 *   button="primary"
 *   button-icon="send"
 *   step="10"
 * >
 *   Label du champ
 *   <span slot="hint">Indice d'utilisation</span>
 *   <span slot="success">Le champ est valide !</span>
 *   <span slot="error">Le champ est invalide !</span>
 *   <span slot="button">Envoyer</span>
 * </bnum-input-number>
 *
 * @attr {string} (optional) (default: 'number') type - Type de l'input (text, password, email, etc.) Ne pas modifier, toujours 'number' pour ce composant.
 *
 */
let HTMLBnumInputNumber = (() => {
    let _classDecorators = [Define({ tag: TAG_INPUT_NUMBER })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumInput;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor() {
            super();
        }
        _p_getStylesheets() {
            return [...super._p_getStylesheets(), SHEET$3];
        }
        _p_preload() {
            this.setAttribute(ATTRIBUTE_TYPE, TYPE$2);
        }
        /**
         *@inheritdoc
         */
        _p_buildDOM() {
            super._p_buildDOM();
        }
        /**
         *@inheritdoc
         */
        static _p_observedAttributes() {
            return super._p_observedAttributes().filter((x) => x !== ATTRIBUTE_TYPE);
        }
        /**
         * Crée une instance du composant avec les options fournies.
         * @param label Texte du label principal.
         * @param options Options d'initialisation (attributs et slots).
         * @returns Instance du composant.
         */
        static Create(label, options = {}) {
            const finalOptions = {
                type: TYPE$2,
                ...options,
            };
            return super.Create(label, finalOptions);
        }
        static get AdditionnalStylesheet() {
            return SHEET$3;
        }
    });
    return _classThis;
})();

const TYPE$1 = 'date';
/**
 * Input de date.
 *
 * @structure Sans rien
 * <bnum-input-date></bnum-input-date>
 *
 * @structure Avec une légende
 * <bnum-input-date>Label du champ</bnum-input-date>
 *
 * @structure Avec une légende et un indice
 * <bnum-input-date>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input-date>
 *
 * @structure Avec un bouton
 * <bnum-input-date button="true" button-icon="add">Label du champ
 *   <span slot="button">Ajouter</span>
 * </bnum-input-date>
 *
 * @structure En erreur
 * <bnum-input-date min="2025-01-01" data-value="2024-01-01">Label du champ
 * </bnum-input-date>
 *
 * @structure Avec un état de succès
 * <bnum-input-date state="success">Label du champ
 *   <span slot="success">Le champ est valide !</span>
 * </bnum-input-date>
 *
 * @structure Avec une icône
 * <bnum-input-date icon="search">Label du champ</bnum-input-date>
 *
 * @structure Avec un bouton avec icône seulement
 * <bnum-input-date placeholder="LA LA !" button-icon="add">Label du champ
 * </bnum-input-date>
 *
 * @structure Désactivé
 * <bnum-input-date disabled>
 *   Label du champ
 * </bnum-input-date>
 *
 * @structure Complet
 * <bnum-input-date
 *   data-value="5"
 *   placeholder="Texte indicatif"
 *   type="text"
 *   state="error"
 *   icon="search"
 *   button="primary"
 *   button-icon="send"
 *   step="10"
 * >
 *   Label du champ
 *   <span slot="hint">Indice d'utilisation</span>
 *   <span slot="success">Le champ est valide !</span>
 *   <span slot="error">Le champ est invalide !</span>
 *   <span slot="button">Envoyer</span>
 * </bnum-input-date>
 *
 * @attr {string} (optional) (default: 'number') type - Type de l'input (text, password, email, etc.) Ne pas modifier, toujours 'number' pour ce composant.
 *
 */
let HTMLBnumInputDate = (() => {
    let _classDecorators = [Define({ tag: TAG_INPUT_DATE })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumInput;
    let _instanceExtraInitializers = [];
    let __p_preload_decorators;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __p_preload_decorators = [SetAttr(ATTRIBUTE_TYPE, TYPE$1)];
            __esDecorate(this, null, __p_preload_decorators, { kind: "method", name: "_p_preload", static: false, private: false, access: { has: obj => "_p_preload" in obj, get: obj => obj._p_preload }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor() {
            super();
            __runInitializers(this, _instanceExtraInitializers);
        }
        _p_getStylesheets() {
            return [
                ...super._p_getStylesheets(),
                HTMLBnumInputNumber.AdditionnalStylesheet,
            ];
        }
        _p_preload() { }
        /**
         *@inheritdoc
         */
        _p_buildDOM() {
            super._p_buildDOM();
        }
        /**
         *@inheritdoc
         */
        static _p_observedAttributes() {
            return super._p_observedAttributes().filter((x) => x !== ATTRIBUTE_TYPE);
        }
        /**
         * Crée une instance du composant avec les options fournies.
         * @param label Texte du label principal.
         * @param options Options d'initialisation (attributs et slots).
         * @returns Instance du composant.
         */
        static Create(label, options = {}) {
            const finalOptions = {
                type: TYPE$1,
                ...options,
            };
            return super.Create(label, finalOptions);
        }
    });
    return _classThis;
})();

var css_248z$g = ":host #input-search-actions-container{display:flex;position:absolute;right:10px;top:8px}:host #input-search-actions-container #input-clear-button{display:none}:host(:state(value)) #input-search-actions-container #input-clear-button{display:inline-block}";

const ID_ACTIONS_CONTAINER = 'input-search-actions-container';
const ID_CLEAR_BUTTON = 'input-clear-button';
const SLOT_ACTIONS = 'actions';
const EVENT_SEARCH = 'bnum-input-search:search';
const EVENT_CLEAR = 'bnum-input-search:clear';
BnumConfig.Get('local_keys')?.search_field || 'Rechercher';
const BUTTON_ICON = 'search';
const INPUT_TYPE = 'search';

// type: functions
// descriptions: Fonctions utilitaires pour la gestion des événements DOM
/**
 * Délègue un événement à un sélecteur spécifique à partir d'une cible.
 * @param  target Élément sur lequel écouter l'événement
 * @param  event Nom de l'événement (ex: 'click')
 * @param  selector Sélecteur CSS pour filtrer la cible
 * @param  callback Fonction appelée lors de l'événement
 */
function delegate(target, event, selector, callback) {
    target.addEventListener(event, (e) => {
        if (!(e.target instanceof HTMLElement))
            return;
        // On cherche l'élément correspondant au sélecteur le plus proche
        const element = e.target.closest(selector);
        // On vérifie que l'élément trouvé est bien à l'intérieur de notre "target"
        if (element && target.contains(element)) {
            callback(new CustomEvent(event, {
                detail: { innerEvent: e, target: element },
            }));
        }
    });
}

// type: decorator
/**
 * Décorateur pour attacher automatiquement un écouteur d'événement.
 * La méthode décorée doit retourner la fonction de callback.
 *  @param eventName Nom de l'événement à écouter (ex: 'click')
 *  @param option Sélecteur CSS pour le délégateur (optionnel)
 */
function Listen(eventName, { selector = null } = {}) {
    return function (originalMethod, context) {
        if (context.kind !== 'method') {
            throw new Error('@Listen ne peut être utilisé que sur des méthodes.');
        }
        // On ajoute un initialiseur qui s'exécutera à la création de chaque instance
        context.addInitializer(function () {
            const handler = originalMethod.call(this);
            if (typeof handler === 'function') {
                const boundHandler = handler.bind(this);
                if (selector)
                    delegate(this, eventName, selector, boundHandler);
                else
                    this.addEventListener(eventName, boundHandler);
            }
            else {
                Log.warn('@Listen', `La méthode "${String(context.name)}" n'a pas renvoyé de fonction pour l'événement "${eventName}".`);
            }
        });
    };
}

const SHEET$2 = HTMLBnumInput.ConstructCSSStyleSheet(css_248z$g);
//#region Template
const TEMPLATE$d = (h("div", { id: ID_ACTIONS_CONTAINER, children: [h(HTMLBnumButtonIcon, { id: ID_CLEAR_BUTTON, children: "close" }), h("slot", { name: SLOT_ACTIONS })] }));
//#endregion Template
/**
 * Composant d'input de recherche.
 *
 * Utilise le composant de base `bnum-input` avec des configurations spécifiques pour la recherche.
 *
 * @structure Basique
 * <bnum-input-search>Label de recherche</bnum-input-search>
 *
 * @structure Avec une légende et un indice
 * <bnum-input-search>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input-search>
 *
 * @structure Désactivé
 * <bnum-input-search disabled placeholder="Recherche désactivée">
 *   Label du champ
 * </bnum-input-search>
 *
 * @structure Avec des boutons custom
 * <bnum-input-search placeholder="Recherche avec des boutons">
 *   Label du champ
 *   <bnum-icon-button slot="actions">filter_list</bnum-icon-button>
 *
 * </bnum-input-search>
 *
 * @slot button - Contenu du bouton de recherche (texte ou icône). (Inutilisé)
 * @slot actions - Contenu des actions personnalisées à droite du champ de recherche.
 *
 * @event {CustomEvent<{ value: string; name: string; caller: HTMLBnumInputSearch }>} bnum-input-search:search - Événement déclenché au clic par le bouton interne ou à la validation par la touche "Entrée". Envoie la valeur actuelle de l'input de recherche.
 * @event {MouseEvent} bnum-input:button.click - Événement déclenché au clic sur le bouton interne.
 * @event {CustomEvent<{ caller: HTMLBnumInputSearch }>} bnum-input-search:clear - Événement déclenché lors du clic sur le bouton de vidage du champ de recherche.
 *
 * @attr {string} (default: 'search') button-icon - Icône du bouton interne. Ne pas modifier, toujours 'search' pour ce composant.
 * @attr {string} (default: 'text') type - Type de l'input (text, password, email, etc.) Ne pas modifier, toujours 'text' pour ce composant.
 * @attr {undefined} (default: undefined) button - Attribut pour afficher le bouton interne. Ne pas modifier, toujours présent pour ce composant.
 */
let HTMLBnumInputSearch = (() => {
    let _classDecorators = [Define({ template: Render(TEMPLATE$d), tag: TAG_INPUT_SEARCH })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumInput;
    let _instanceExtraInitializers = [];
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let __p_preload_decorators;
    let __p_inputValueChangedCallback_decorators;
    let _private__triggerEventSearch_decorators;
    let _private__triggerEventSearch_descriptor;
    let _private__onKeyDown_decorators;
    let _private__onKeyDown_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    emptyButton: `#${ID_ACTIONS_CONTAINER} ${HTMLBnumButtonIcon.TAG}`,
                })];
            __p_preload_decorators = [SetAttr(ATTRIBUTE_BUTTON_ICON, 'search'), InitAttr(ATTRIBUTE_PLACEHOLDER, BnumConfig.Get('local_keys')?.search_field || 'Rechercher')];
            __p_inputValueChangedCallback_decorators = [Risky()];
            _private__triggerEventSearch_decorators = [Autobind, Fire(EVENT_SEARCH)];
            _private__onKeyDown_decorators = [Listen('keydown')];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, __p_preload_decorators, { kind: "method", name: "_p_preload", static: false, private: false, access: { has: obj => "_p_preload" in obj, get: obj => obj._p_preload }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, __p_inputValueChangedCallback_decorators, { kind: "method", name: "_p_inputValueChangedCallback", static: false, private: false, access: { has: obj => "_p_inputValueChangedCallback" in obj, get: obj => obj._p_inputValueChangedCallback }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__triggerEventSearch_descriptor = { value: __setFunctionName(function () {
                    return {
                        value: this.value,
                        name: this.name,
                        caller: this,
                    };
                }, "#_triggerEventSearch") }, _private__triggerEventSearch_decorators, { kind: "method", name: "#_triggerEventSearch", static: false, private: true, access: { has: obj => #_triggerEventSearch in obj, get: obj => obj.#_triggerEventSearch }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__onKeyDown_descriptor = { value: __setFunctionName(function () {
                    return (e) => {
                        if (e.key === 'Enter') {
                            this.#_triggerEventSearch();
                        }
                    };
                }, "#_onKeyDown") }, _private__onKeyDown_decorators, { kind: "method", name: "#_onKeyDown", static: false, private: true, access: { has: obj => #_onKeyDown in obj, get: obj => obj.#_onKeyDown }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        #_ui_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _private__ui_initializers, void 0));
        //#region Private fields
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        //#endregion Private fields
        //#region Lifecycle
        /**
         * Constructeur du composant de recherche.
         */
        constructor() {
            super();
            __runInitializers(this, _private__ui_extraInitializers);
        }
        _p_getStylesheets() {
            return [...super._p_getStylesheets(), SHEET$2];
        }
        /**
         * Précharge les attributs spécifiques à l'input de recherche.
         * Définit le placeholder et l'icône du bouton si non présents.
         */
        _p_preload() { }
        _p_buildDOM() {
            super._p_buildDOM();
            this.#_ui.emptyButton.addEventListener('click', () => {
                this.value = EMPTY_STRING;
                this._p_inputValueChangedCallback(new Event('input'));
                this.#_triggerEventSearch();
                this.trigger(EVENT_CLEAR, { caller: this });
            });
        }
        /**
         * Attache les événements nécessaires au composant.
         * Supprime les attributs inutiles et gère les événements de recherche.
         */
        _p_attach() {
            super._p_attach();
            this.removeAttribute(ATTRIBUTE_BUTTON);
            this.removeAttribute(ATTRIBUTE_BUTTON_ICON);
            this.onButtonClicked.add(EVENT_DEFAULT, this.#_triggerEventSearch);
            this.#_onKeyDown();
        }
        _p_inputValueChangedCallback(e) {
            this.removeAttribute(ATTRIBUTE_BUTTON);
            this.setAttribute(ATTRIBUTE_BUTTON_ICON, BUTTON_ICON);
            const result = super._p_inputValueChangedCallback?.(e);
            this.removeAttribute(ATTRIBUTE_BUTTON);
            return result;
        }
        /**
         * Nettoie les attributs après le rendu du composant.
         */
        _p_postFlush() {
            this.removeAttribute(ATTRIBUTE_BUTTON);
            this.setAttribute(ATTRIBUTE_BUTTON_ICON, BUTTON_ICON);
            super._p_postFlush();
            this.removeAttribute(ATTRIBUTE_BUTTON);
        }
        //#endregion Lifecycle
        //#region Public Methods
        /**
         * Désactive le bouton de recherche.
         */
        disableSearchButton() {
            (this._p_isShadowElement() === false ? this : this.shadowRoot)
                .querySelector(`#${ID_INPUT_BUTTON}`)
                ?.setAttribute(ATTRIBUTE_DISABLED$1, ATTRIBUTE_DISABLED$1);
            return this;
        }
        /**
         * Active le bouton de recherche.
         */
        enableSearchButton() {
            (this._p_isShadowElement() === false ? this : this.shadowRoot)
                .querySelector(`#${ID_INPUT_BUTTON}`)
                ?.removeAttribute(ATTRIBUTE_DISABLED$1);
            return this;
        }
        //#endregion Public Methods
        //#region Private Methods
        /**
         * Déclenche l'événement de recherche avec la valeur actuelle de l'input.
         * @private
         */
        get #_triggerEventSearch() { return _private__triggerEventSearch_descriptor.value; }
        get #_onKeyDown() { return _private__onKeyDown_descriptor.value; }
        //#endregion Private Methods
        //#region Static Methods
        /**
         * Retourne la liste des attributs observés, en excluant ceux spécifiques à la recherche.
         * @inheritdoc
         */
        static _p_observedAttributes() {
            return super._p_observedAttributes().filter((x) => {
                switch (x) {
                    case ATTRIBUTE_TYPE:
                    case ATTRIBUTE_BUTTON:
                    case ATTRIBUTE_BUTTON_ICON:
                        return false;
                    default:
                        return true;
                }
            });
        }
        /**
         * Crée une instance du composant avec les options fournies.
         * @param label Texte du label principal.
         * @param options Options d'initialisation (attributs et slots).
         * @returns {HTMLBnumInput} Instance du composant.
         */
        static Create(label, options = {}) {
            const finalOptions = {
                type: INPUT_TYPE,
                ...options,
            };
            return super.Create(label, finalOptions);
        }
    });
    return _classThis;
})();

const TYPE_TEXT = 'text';
/**
 * Input texte.
 *
 * @structure Sans rien
 * <bnum-input-text></bnum-input-text>
 *
 * @structure Avec une légende
 * <bnum-input-text>Label du champ</bnum-input-text>
 *
 * @structure Avec une légende et un indice
 * <bnum-input-text>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input-text>
 *
 * @structure Avec un bouton
 * <bnum-input-text button="true" button-icon="add">Label du champ
 *   <span slot="button">Ajouter</span>
 * </bnum-input-text>
 *
 * @structure En erreur
 * <bnum-input-text pattern="^[a-zA-Z0-9]+$" data-value="@@@@@">Label du champ
 * </bnum-input-text>
 *
 * @structure Avec un état de succès
 * <bnum-input-text state="success">Label du champ
 *   <span slot="success">Le champ est valide !</span>
 * </bnum-input-text>
 *
 * @structure Avec une icône
 * <bnum-input-text icon="search">Label du champ</bnum-input-text>
 *
 * @structure Avec un bouton avec icône seulement
 * <bnum-input-text placeholder="LA LA !" button-icon="add">Label du champ
 * </bnum-input-text>
 *
 * @structure Désactivé
 * <bnum-input-text disabled>
 *   Label du champ
 * </bnum-input-text>
 *
 * @structure Complet
 * <bnum-input-text
 *   data-value="Valeur initiale"
 *   placeholder="Texte indicatif"
 *   type="text"
 *   state="error"
 *   icon="search"
 *   button="primary"
 *   button-icon="send"
 * >
 *   Label du champ
 *   <span slot="hint">Indice d'utilisation</span>
 *   <span slot="success">Le champ est valide !</span>
 *   <span slot="error">Le champ est invalide !</span>
 *   <span slot="button">Envoyer</span>
 * </bnum-input-text>
 *
 * @attr {string} (optional) (default: 'text') type - Type de l'input (text, password, email, etc.) Ne pas modifier, toujours 'text' pour ce composant.
 *
 */
let HTMLBnumInputText = (() => {
    let _classDecorators = [Define({ tag: TAG_INPUT_TEXT })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumInput;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor() {
            super();
        }
        _p_preload() {
            super._p_preload();
            this.setAttribute(ATTRIBUTE_TYPE, TYPE_TEXT);
        }
        /**
         *@inheritdoc
         */
        _p_buildDOM() {
            super._p_buildDOM();
        }
        /**
         *@inheritdoc
         */
        static _p_observedAttributes() {
            return super._p_observedAttributes().filter((x) => x !== ATTRIBUTE_TYPE);
        }
        /**
         * Crée une instance du composant avec les options fournies.
         * @param label Texte du label principal.
         * @param options Options d'initialisation (attributs et slots).
         * @returns  Instance du composant.
         */
        static Create(label, options = {}) {
            const finalOptions = {
                type: TYPE_TEXT,
                ...options,
            };
            return super.Create(label, finalOptions);
        }
    });
    return _classThis;
})();

const TYPE = 'time';
/**
 * Input de temps.
 *
 * @structure Sans rien
 * <bnum-input-time></bnum-input-time>
 *
 * @structure Avec une légende
 * <bnum-input-time>Label du champ</bnum-input-time>
 *
 * @structure Avec une légende et un indice
 * <bnum-input-time>
 * Label du champ
 * <span slot="hint">Indice d'utilisation</span>
 * </bnum-input-time>
 *
 * @structure Avec un bouton
 * <bnum-input-time button="true" button-icon="add">Label du champ
 *   <span slot="button">Ajouter</span>
 * </bnum-input-time>
 *
 * @structure En erreur
 * <bnum-input-time min="05:00" data-value="04:00">Label du champ
 * </bnum-input-time>
 *
 * @structure Avec un état de succès
 * <bnum-input-time state="success">Label du champ
 *   <span slot="success">Le champ est valide !</span>
 * </bnum-input-time>
 *
 * @structure Avec une icône
 * <bnum-input-time icon="search">Label du champ</bnum-input-time>
 *
 * @structure Avec un bouton avec icône seulement
 * <bnum-input-time placeholder="LA LA !" button-icon="add">Label du champ
 * </bnum-input-time>
 *
 * @structure Désactivé
 * <bnum-input-time disabled>
 *   Label du champ
 * </bnum-input-time>
 *
 * @structure Complet
 * <bnum-input-time
 *   data-value="5"
 *   placeholder="Texte indicatif"
 *   type="text"
 *   state="error"
 *   icon="search"
 *   button="primary"
 *   button-icon="send"
 *   step="10"
 * >
 *   Label du champ
 *   <span slot="hint">Indice d'utilisation</span>
 *   <span slot="success">Le champ est valide !</span>
 *   <span slot="error">Le champ est invalide !</span>
 *   <span slot="button">Envoyer</span>
 * </bnum-input-time>
 *
 * @attr {string} (optional) (default: 'number') type - Type de l'input (text, password, email, etc.) Ne pas modifier, toujours 'number' pour ce composant.
 *
 */
let HTMLBnumInputTime = (() => {
    let _classDecorators = [Define({ tag: TAG_INPUT_TIME })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumInput;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor() {
            super();
        }
        _p_getStylesheets() {
            return [
                ...super._p_getStylesheets(),
                HTMLBnumInputNumber.AdditionnalStylesheet,
            ];
        }
        _p_preload() {
            this.setAttribute(ATTRIBUTE_TYPE, TYPE);
        }
        /**
         *@inheritdoc
         */
        _p_buildDOM() {
            super._p_buildDOM();
        }
        /**
         *@inheritdoc
         */
        static _p_observedAttributes() {
            return super._p_observedAttributes().filter((x) => x !== ATTRIBUTE_TYPE);
        }
        /**
         * Crée une instance du composant avec les options fournies.
         * @param label Texte du label principal.
         * @param options Options d'initialisation (attributs et slots).
         * @returns {HTMLBnumInputTime} Instance du composant.
         */
        static Create(label, options = {}) {
            const finalOptions = {
                type: TYPE,
                ...options,
            };
            return super.Create(label, finalOptions);
        }
    });
    return _classThis;
})();

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
let HTMLBnumPrimaryButton = (() => {
    let _classDecorators = [Define({
            tag: TAG_PRIMARY,
        }), Variation(ButtonVariation.PRIMARY)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumButton;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor() {
            super();
        }
    });
    return _classThis;
})();

const PropertyMode = {
    default: 'rw',
    readonly: 'readonly',
    init: 'init',
};
/**
 * @Property Gère la réactivité et les droits d'accès des Auto-Accessors.
 * Simule les comportements C# { get; set; }, { get; init; } et { get; }.
 */
function Property(options = {}) {
    const { mode = PropertyMode.default, reactive = false } = options;
    return function (target, context) {
        const name = String(context.name);
        return {
            // Init: Appelé lors de l'initialisation de la classe (ex: accessor x = 10)
            init(initialValue) {
                return initialValue;
            },
            // Get: Lecture standard via le backing field natif
            get() {
                return target.get.call(this);
            },
            // Set: Logique de protection et réactivité
            set(newValue) {
                const oldValue = target.get.call(this);
                // 1. Gestion des Modes (Runtime Security)
                if (mode === 'readonly') {
                    // Note: L'initialisation via "accessor x = val" passe par init(), pas set().
                    // Donc ici, c'est une tentative de modification ultérieure.
                    throw new Error(`[Property] '${name}' is ReadOnly ({ get; }).`);
                }
                if (mode === 'init') {
                    // Pattern { get; init; }
                    // On autorise si la valeur actuelle est undefined/null (premier set)
                    // Ou si on est techniquement encore dans la phase de construction (dur à détecter parfaitement en JS pur sans état,
                    // mais on suppose que si oldValue existe, c'est trop tard).
                    if (oldValue !== undefined && oldValue !== null) {
                        throw new Error(`[Property] '${name}' is InitOnly ({ get; init; }).`);
                    }
                }
                // 2. Optimisation : Pas de changement, pas d'event
                if (oldValue === newValue)
                    return;
                // 3. Mise à jour du backing field natif
                target.set.call(this, newValue);
                // 4. Réactivité (Appel du moteur de rendu Bnum)
                if (reactive && typeof this._p_update === 'function') {
                    this._p_update();
                }
            },
        };
    };
}

let CheckedChangeEvent = (() => {
    let _classSuper = CustomEvent;
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _checked_decorators;
    let _checked_initializers = [];
    let _checked_extraInitializers = [];
    let _caller_decorators;
    let _caller_initializers = [];
    let _caller_extraInitializers = [];
    return class CheckedChangeEvent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _value_decorators = [Property({ mode: PropertyMode.init })];
            _name_decorators = [Property({ mode: PropertyMode.init })];
            _checked_decorators = [Property({ mode: PropertyMode.init })];
            _caller_decorators = [Property({ mode: PropertyMode.init })];
            __esDecorate(this, null, _value_decorators, { kind: "accessor", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            __esDecorate(this, null, _name_decorators, { kind: "accessor", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(this, null, _checked_decorators, { kind: "accessor", name: "checked", static: false, private: false, access: { has: obj => "checked" in obj, get: obj => obj.checked, set: (obj, value) => { obj.checked = value; } }, metadata: _metadata }, _checked_initializers, _checked_extraInitializers);
            __esDecorate(this, null, _caller_decorators, { kind: "accessor", name: "caller", static: false, private: false, access: { has: obj => "caller" in obj, get: obj => obj.caller, set: (obj, value) => { obj.caller = value; } }, metadata: _metadata }, _caller_initializers, _caller_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #value_accessor_storage = __runInitializers(this, _value_initializers, void 0);
        get value() { return this.#value_accessor_storage; }
        set value(value) { this.#value_accessor_storage = value; }
        #name_accessor_storage = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        get name() { return this.#name_accessor_storage; }
        set name(value) { this.#name_accessor_storage = value; }
        #checked_accessor_storage = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _checked_initializers, void 0));
        get checked() { return this.#checked_accessor_storage; }
        set checked(value) { this.#checked_accessor_storage = value; }
        #caller_accessor_storage = (__runInitializers(this, _checked_extraInitializers), __runInitializers(this, _caller_initializers, void 0));
        get caller() { return this.#caller_accessor_storage; }
        set caller(value) { this.#caller_accessor_storage = value; }
        constructor(options) {
            super(`${options.caller.constructor.TAG}:change`, options.details ?? { bubbles: true, cancelable: true });
            __runInitializers(this, _caller_extraInitializers);
            this.value = options.value;
            this.name = options.name;
            this.checked = options.checked;
            this.caller = options.caller;
        }
    };
})();

function NonStd(reason, fatal = false) {
    // On accepte 'any' pour la value (car ça peut être une classe, une fonction, undefined pour un champ...)
    // On utilise notre type GenericContext
    return function (value, context) {
        // On construit un message propre selon le type (classe, méthode, field...)
        const typeLabel = {
            class: 'La classe',
            method: 'La méthode',
            getter: 'Le getter',
            setter: 'Le setter',
            field: 'Le champ',
            accessor: 'L\'accesseur',
        }[context.kind] || 'L\'élément';
        const name = String(context.name);
        const message = `${typeLabel} '${name}' est non standard${reason ? ` : ${reason}` : ''}.`;
        // addInitializer fonctionne partout !
        // - Pour une classe : s'exécute à la définition de la classe.
        // - Pour un membre (méthode/champ) : s'exécute à la création de l'instance.
        context.addInitializer(function () {
            if (fatal) {
                throw new Error(message);
            }
            else {
                Log.warn(name, message);
            }
        });
    };
}

var css_248z$f = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{--_internal-color:var(--bnum-radio-color,var(--bnum-color-primary,#000091));--_internal-font-size:var(--bnum-radio-font-size,var(--bnum-body-font-size,var(--bnum-font-size-m,1rem)));--_internal-radio-outer-size:var(--_internal-font-size);--_internal-radio-inner-size:calc(var(--_internal-radio-outer-size)*0.6);--_internal-border-size:var(--bnum-radio-border-size,1px);--_internal-border-radius:var(--bnum-radio-border-radius,var(--bnum-radius-circle,50%));position:relative}.radio{height:0;opacity:0;position:absolute;width:0}.radio__label{display:flex;flex-direction:column;margin-left:calc(var(--_internal-radio-outer-size) + 10px)}.radio__label--legend{font-size:var(--_internal-font-size)}.radio__label:before{border:solid var(--_internal-border-size) var(--_internal-color);box-sizing:border-box;height:var(--_internal-radio-outer-size);left:0;top:0;width:var(--_internal-radio-outer-size)}.radio__label:after,.radio__label:before{border-radius:var(--_internal-border-radius);content:\"\";position:absolute}.radio__label:after{--_internal-pos:calc(var(--_internal-radio-outer-size)/2);background:var(--_internal-color);display:none;height:var(--_internal-radio-inner-size);left:var(--_internal-pos);top:var(--_internal-pos);transform:translate(-50%,-50%);width:var(--_internal-radio-inner-size)}.radio:checked~.radio__label:after{display:block}.radio:focus~.radio__label:before,:host(:focus-visible) .radio__label:before{outline-color:#0a76f6;outline-offset:2px;outline-style:solid;outline-width:2px}:host(:focus-visible){outline:none}:host(:disabled),:host([disabled]){opacity:.6;pointer-events:none}";

//#region Utilities
/**
 * Vérifie si une valeur est null ou undefined.
 *
 * @template T - Le type de la valeur à vérifier
 * @param newVal - La valeur à tester
 * @returns `true` si la valeur est null ou undefined, `false` sinon
 *
 * @example
 * ```ts
 * isNullOrUndefined(null); // true
 * isNullOrUndefined(undefined); // true
 * isNullOrUndefined("test"); // false
 * ```
 */
function isNullOrUndefined(newVal) {
    return newVal === null || newVal === undefined;
}
/**
 * Vérifie si une clé correspond à une clé valide d'actions.
 *
 * @param key - La clé à vérifier
 * @returns `true` si la clé fait partie des actions disponibles, `false` sinon
 *
 * @remarks
 * Les clés valides sont : 'checked', 'value', 'name', 'disabled'
 */
function isOnActionKey(key) {
    return ['checked', 'value', 'name', 'disabled'].includes(key);
}
/**
 * Ajoute un listener sur l'instance qui active l'évènement
 * @param event Evènement qui est initialisé
 * @param instance Elément qui contient l'évènement
 */
function onStateChangeInitializer(event, instance) {
    instance.addEventListener('bnum-radio:change', (e) => event.call(e));
}
/**
 * Événement personnalisé déclenché lors du changement d'état d'un bouton radio.
 *
 * @remarks
 * Cet événement encapsule les informations sur le changement d'état (coché/décoché)
 * d'un élément radio personnalisé.
 */
class BnumRadioCheckedChangeEvent extends CheckedChangeEvent {
}
//#endregion Internals Types
//#region Global Constants
/**
 * Identifiant de l'élément input radio interne.
 * @internal
 */
const ID_INPUT = 'radio';
/**
 * Nom de l'attribut 'checked'.
 * @internal
 */
const ATTRIBUTE_CHECKED$1 = 'checked';
/**
 * Nom de l'attribut 'value'.
 * @internal
 */
const ATTRIBUTE_VALUE = 'value';
/**
 * Nom de l'événement 'change'.
 * @internal
 */
const EVENT_CHANGE$3 = 'bnum-radio:change';
/**
 * Liste des attributs synchronisés entre l'élément hôte et l'input interne.
 *
 * @remarks
 * Ces attributs sont automatiquement propagés de l'élément personnalisé vers l'input natif.
 * @internal
 */
const SYNCED_ATTRIBUTES$2 = ['name', 'checked', 'value', 'disabled'];
/**
 * Template HTML du composant radio.
 *
 * @remarks
 * Structure DOM utilisée pour créer le shadow DOM du composant.
 * Comprend un input radio natif et un label avec des slots pour le contenu et l'indice.
 * @internal
 */
const TEMPLATE$c = (h(HTMLBnumFragment, { children: [h("input", { type: "radio", id: ID_INPUT, class: "radio" }), h("label", { part: "label", for: "radio", class: "radio__label", children: [h("span", { class: "radio__label--legend", children: h("slot", { id: "legend" }) }), h("span", { class: "radio--hint label-container--hint", children: h("slot", { id: "hint", name: "hint" }) })] })] }));
//#endregion Global Constants
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
let HTMLBnumRadio = (() => {
    let _classDecorators = [Define({
            template: TEMPLATE$c,
            tag: TAG_RADIO,
            styles: [INPUT_BASE_STYLE, css_248z$f],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _staticExtraInitializers = [];
    let _instanceExtraInitializers = [];
    let _static__p_observedAttributes_decorators;
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    let _checked_decorators;
    let _checked_initializers = [];
    let _checked_extraInitializers = [];
    let _disabled_decorators;
    let _disabled_initializers = [];
    let _disabled_extraInitializers = [];
    let _private__legend_decorators;
    let _private__legend_initializers = [];
    let _private__legend_extraInitializers = [];
    let _private__legend_descriptor;
    let _onstatechange_decorators;
    let _onstatechange_initializers = [];
    let _onstatechange_extraInitializers = [];
    let _private__hint_decorators;
    let _private__hint_initializers = [];
    let _private__hint_extraInitializers = [];
    let _private__hint_descriptor;
    let __p_buildDOM_decorators;
    let _private__update_decorators;
    let _private__update_descriptor;
    let _private__fireChange_decorators;
    let _private__fireChange_descriptor;
    let _private__setFormValue_decorators;
    let _private__setFormValue_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    input: `#${ID_INPUT}`,
                    slotLegend: '#legend',
                    slotHint: '#hint',
                })];
            _name_decorators = [Attr()];
            _value_decorators = [Attr()];
            _checked_decorators = [Attr()];
            _disabled_decorators = [Attr()];
            _private__legend_decorators = [Data({ setter: false })];
            _onstatechange_decorators = [Listener(onStateChangeInitializer)];
            _private__hint_decorators = [Data({ setter: false })];
            __p_buildDOM_decorators = [SetAttr('role', 'radio')];
            _private__update_decorators = [Risky()];
            _private__fireChange_decorators = [CustomFire(BnumRadioCheckedChangeEvent)];
            _private__setFormValue_decorators = [Risky()];
            _static__p_observedAttributes_decorators = [NonStd('Deprecated')];
            __esDecorate(this, null, _static__p_observedAttributes_decorators, { kind: "method", name: "_p_observedAttributes", static: true, private: false, access: { has: obj => "_p_observedAttributes" in obj, get: obj => obj._p_observedAttributes }, metadata: _metadata }, null, _staticExtraInitializers);
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _name_decorators, { kind: "accessor", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(this, null, _value_decorators, { kind: "accessor", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            __esDecorate(this, null, _checked_decorators, { kind: "accessor", name: "checked", static: false, private: false, access: { has: obj => "checked" in obj, get: obj => obj.checked, set: (obj, value) => { obj.checked = value; } }, metadata: _metadata }, _checked_initializers, _checked_extraInitializers);
            __esDecorate(this, null, _disabled_decorators, { kind: "accessor", name: "disabled", static: false, private: false, access: { has: obj => "disabled" in obj, get: obj => obj.disabled, set: (obj, value) => { obj.disabled = value; } }, metadata: _metadata }, _disabled_initializers, _disabled_extraInitializers);
            __esDecorate(this, _private__legend_descriptor = { get: __setFunctionName(function () { return this.#_legend_accessor_storage; }, "#_legend", "get"), set: __setFunctionName(function (value) { this.#_legend_accessor_storage = value; }, "#_legend", "set") }, _private__legend_decorators, { kind: "accessor", name: "#_legend", static: false, private: true, access: { has: obj => #_legend in obj, get: obj => obj.#_legend, set: (obj, value) => { obj.#_legend = value; } }, metadata: _metadata }, _private__legend_initializers, _private__legend_extraInitializers);
            __esDecorate(this, null, _onstatechange_decorators, { kind: "accessor", name: "onstatechange", static: false, private: false, access: { has: obj => "onstatechange" in obj, get: obj => obj.onstatechange, set: (obj, value) => { obj.onstatechange = value; } }, metadata: _metadata }, _onstatechange_initializers, _onstatechange_extraInitializers);
            __esDecorate(this, _private__hint_descriptor = { get: __setFunctionName(function () { return this.#_hint_accessor_storage; }, "#_hint", "get"), set: __setFunctionName(function (value) { this.#_hint_accessor_storage = value; }, "#_hint", "set") }, _private__hint_decorators, { kind: "accessor", name: "#_hint", static: false, private: true, access: { has: obj => #_hint in obj, get: obj => obj.#_hint, set: (obj, value) => { obj.#_hint = value; } }, metadata: _metadata }, _private__hint_initializers, _private__hint_extraInitializers);
            __esDecorate(this, null, __p_buildDOM_decorators, { kind: "method", name: "_p_buildDOM", static: false, private: false, access: { has: obj => "_p_buildDOM" in obj, get: obj => obj._p_buildDOM }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__update_descriptor = { value: __setFunctionName(function (name, newVal, onactions) {
                    if (onactions && isOnActionKey(name)) {
                        const callback = onactions[name];
                        if (callback) {
                            const plugin = callback({
                                name,
                                val: newVal,
                            });
                            if (plugin) {
                                name = plugin.name;
                                newVal = plugin.val;
                            }
                        }
                    }
                    if (isNullOrUndefined(newVal))
                        this.#_ui.input.removeAttribute(name);
                    else
                        this.#_ui.input.setAttribute(name, newVal);
                    return ATresult.Ok();
                }, "#_update") }, _private__update_decorators, { kind: "method", name: "#_update", static: false, private: true, access: { has: obj => #_update in obj, get: obj => obj.#_update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__fireChange_descriptor = { value: __setFunctionName(function (ev) {
                    ev.stopPropagation();
                    this.#_updateInternal();
                    const details = {
                        inner: ev,
                        bubbles: true,
                        cancelable: true,
                    };
                    const options = {
                        value: this.value,
                        checked: this.checked,
                        name: this.name,
                        caller: this,
                        details,
                    };
                    return options;
                }, "#_fireChange") }, _private__fireChange_decorators, { kind: "method", name: "#_fireChange", static: false, private: true, access: { has: obj => #_fireChange in obj, get: obj => obj.#_fireChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__setFormValue_descriptor = { value: __setFunctionName(function (value) {
                    this._p_internal.setFormValue(value);
                    return ATresult.Ok();
                }, "#_setFormValue") }, _private__setFormValue_decorators, { kind: "method", name: "#_setFormValue", static: false, private: true, access: { has: obj => #_setFormValue in obj, get: obj => obj.#_setFormValue }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        //#region Constants
        /**
         * Indique que ce composant peut être associé à un formulaire.
         *
         * @remarks
         * Permet au composant de participer au cycle de vie des formulaires HTML,
         * notamment la soumission et la validation.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals#instance_properties | ElementInternals}
         */
        static formAssociated = (__runInitializers(_classThis, _staticExtraInitializers), true);
        #_ui_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _private__ui_initializers, void 0));
        //#endregion Constants
        //#region Getters/Setters
        /**
         * Références aux éléments du DOM interne.
         *
         * @remarks
         * Injecté automatiquement par le décorateur {@link UI}.
         * Fournit un accès typé à l'input radio natif et aux slots de contenu.
         *
         * @internal
         */
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #name_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _name_initializers, EMPTY_STRING));
        /**
         * Le nom du groupe de boutons radio.
         *
         * @remarks
         * Les boutons radio partageant le même nom forment un groupe mutuellement exclusif.
         * Un seul bouton peut être sélectionné à la fois dans un groupe.
         *
         * @defaultValue Chaîne vide
         */
        get name() { return this.#name_accessor_storage; }
        set name(value) { this.#name_accessor_storage = value; }
        #value_accessor_storage = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _value_initializers, EMPTY_STRING));
        /**
         * La valeur associée au bouton radio.
         *
         * @remarks
         * Cette valeur est envoyée lors de la soumission du formulaire si le radio est coché.
         *
         * @defaultValue Chaîne vide
         */
        get value() { return this.#value_accessor_storage; }
        set value(value) { this.#value_accessor_storage = value; }
        #checked_accessor_storage = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _checked_initializers, true));
        /**
         * Indique si le bouton radio est coché.
         *
         * @remarks
         * Contrôle l'état de sélection du bouton radio.
         *
         * @defaultValue `true`
         */
        get checked() { return this.#checked_accessor_storage; }
        set checked(value) { this.#checked_accessor_storage = value; }
        #disabled_accessor_storage = (__runInitializers(this, _checked_extraInitializers), __runInitializers(this, _disabled_initializers, false));
        /**
         * Indique si le bouton radio est désactivé.
         *
         * @remarks
         * Un bouton radio désactivé ne peut pas être sélectionné ni recevoir le focus.
         *
         * @defaultValue `false`
         */
        get disabled() { return this.#disabled_accessor_storage; }
        set disabled(value) { this.#disabled_accessor_storage = value; }
        #_legend_accessor_storage = (__runInitializers(this, _disabled_extraInitializers), __runInitializers(this, _private__legend_initializers, EMPTY_STRING));
        /**
         * Texte de la légende principale du bouton radio.
         *
         * @remarks
         * Stocke le contenu textuel qui sera affiché comme label principal du radio.
         * Cette propriété est en lecture seule (pas de setter) et est initialisée
         * lors de la construction du composant.
         *
         * @defaultValue Chaîne vide
         * @internal
         */
        get #_legend() { return _private__legend_descriptor.get.call(this); }
        set #_legend(value) { return _private__legend_descriptor.set.call(this, value); }
        #onstatechange_accessor_storage = (__runInitializers(this, _private__legend_extraInitializers), __runInitializers(this, _onstatechange_initializers, void 0));
        /**
         * Appelé lorsque l'état de l'élément change
         */
        get onstatechange() { return this.#onstatechange_accessor_storage; }
        set onstatechange(value) { this.#onstatechange_accessor_storage = value; }
        #_hint_accessor_storage = (__runInitializers(this, _onstatechange_extraInitializers), __runInitializers(this, _private__hint_initializers, EMPTY_STRING));
        /**
         * Texte de l'indice/aide du bouton radio.
         *
         * @remarks
         * Stocke le contenu textuel qui sera affiché comme information complémentaire.
         * Cette propriété est en lecture seule (pas de setter) et est initialisée
         * lors de la construction du composant.
         *
         * @defaultValue Chaîne vide
         * @internal
         */
        get #_hint() { return _private__hint_descriptor.get.call(this); }
        set #_hint(value) { return _private__hint_descriptor.set.call(this, value); }
        /**
         * Récupère l'input radio interne.
         *
         * @remarks
         * Permet d'accéder à l'input radio natif pour des opérations spécifiques.
         *
         * @returns L'input radio interne
         */
        get internalCheckbox() {
            return this.#_ui.input;
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        /**
         * Constructeur du composant HTMLBnumRadio.
         *
         * @remarks
         * Initialise l'instance du composant en appelant le constructeur parent.
         */
        constructor() {
            super();
            __runInitializers(this, _private__hint_extraInitializers);
        }
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
        _p_attachCustomShadow() {
            return this.attachShadow({ mode: 'open', delegatesFocus: true });
        }
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
        _p_buildDOM() {
            this.#_setupListeners().#_init().#_sync();
        }
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
        _p_update(name, oldVal, newVal) {
            let needUpdate = oldVal !== newVal;
            if (name === ATTRIBUTE_CHECKED$1) {
                const isChecked = this.#_ui.input.checked;
                const willBeChecked = newVal !== null && newVal !== 'false';
                needUpdate = isChecked !== willBeChecked;
            }
            else if (name === ATTRIBUTE_VALUE) {
                needUpdate = this.#_ui.input.value !== newVal;
            }
            if (needUpdate) {
                this.#_update(name, newVal, {
                    checked: this.#_onUpdateChecked.bind(this),
                }).tapError(error => Log.error('HTMLBnumRadio/_p_update', error.message, error));
            }
        }
        //#endregion Lifecycle
        //#region Public methods
        /**
         * Update l'état du radio et déclenche l'événement bnum-radio:change
         * @param checked - L'état à appliquer
         */
        updateCheckAndFire(checked) {
            this.internalCheckbox.checked = checked;
            this.#_fireChange(new Event('change', { bubbles: true, composed: true }));
        }
        //#endregion Public methods
        //#region Private methods
        /**
         * Initialise le contenu des slots avec les valeurs de légende et d'indice.
         *
         * @returns L'instance courante pour chaînage de méthodes
         *
         * @remarks
         * Cette méthode remplit les slots du Shadow DOM avec le contenu textuel
         * stocké dans les propriétés privées `#_legend` et `#_hint`.
         * Elle n'affecte les slots que si les valeurs correspondantes sont définies.
         *
         * @private
         */
        #_init() {
            const legend = this.#_legend;
            const hint = this.#_hint;
            const hasLegend = !!legend;
            const hasHint = !!hint;
            if (hasLegend)
                this.#_ui.slotLegend.innerText = legend;
            if (hasHint)
                this.#_ui.slotHint.innerText = hint;
            return this;
        }
        /**
         * Callback exécuté lors de la mise à jour de l'attribut 'checked'.
         *
         * @param options - Les paramètres de l'action contenant le nom et la valeur
         * @returns Les paramètres modifiés après traitement
         *
         * @remarks
         * Met à jour l'état coché de l'input interne, l'attribut ARIA et la valeur du formulaire.
         * Si le radio n'est pas coché, la valeur est définie à null pour le formulaire.
         *
         * @private
         */
        #_onUpdateChecked(options) {
            const { val: newVal } = options;
            const isChecked = !(isNullOrUndefined(newVal) || newVal === 'false');
            const input = this.#_ui.input;
            if (input.checked !== isChecked) {
                input.checked = isChecked;
            }
            this._p_internal.ariaChecked = String(isChecked);
            this.#_setFormValue(isChecked ? this.value : null);
            if (!isChecked)
                options.val = null;
            return options;
        }
        /**
         * Met à jour un attribut de l'input interne avec gestion des callbacks.
         *
         * @param name - Le nom de l'attribut à mettre à jour
         * @param newVal - La nouvelle valeur de l'attribut
         * @param onactions - Callbacks optionnels à exécuter avant la mise à jour
         * @returns Un {@link Result} indiquant le succès ou l'échec de l'opération
         *
         * @remarks
         * Si un callback est défini pour l'attribut concerné, il est exécuté avant la mise à jour.
         * Le callback peut modifier le nom et la valeur avant leur application.
         *
         * Si la nouvelle valeur est null ou undefined, l'attribut est supprimé de l'input.
         *
         * @private
         */
        get #_update() { return _private__update_descriptor.value; }
        /**
         * Configure l'écouteur d'événement pour les changements de l'input interne.
         *
         * @returns L'instance courante pour chaînage
         *
         * @remarks
         * Écoute l'événement 'change' de l'input natif et déclenche l'événement personnalisé.
         *
         * @private
         */
        #_handleInnerChange() {
            this.#_ui.input.addEventListener('change', ev => {
                this.#_fireChange(ev);
            });
            return this;
        }
        /**
         * Déclenche l'événement personnalisé de changement d'état.
         *
         * @param ev - L'événement natif ayant déclenché le changement
         * @returns Les options de construction de l'événement personnalisé
         *
         * @remarks
         * Stoppe la propagation de l'événement natif, met à jour l'état interne,
         * puis construit et déclenche un {@link BnumRadioCheckedChangeEvent}.
         *
         * Le décorateur {@link CustomFire} gère automatiquement la création et le dispatch
         * de l'événement à partir des options retournées.
         *
         * @fires BnumRadioCheckedChangeEvent
         * @private
         */
        get #_fireChange() { return _private__fireChange_descriptor.value; }
        /**
         * Met à jour l'état interne du composant à partir de l'input natif.
         *
         * @remarks
         * Synchronise les propriétés `checked` et `value` du composant
         * avec celles de l'input interne, et met à jour l'attribut ARIA correspondant.
         *
         * @private
         */
        #_updateInternal() {
            const input = this.#_ui.input;
            this.checked = !!input.checked;
            this._p_internal.ariaChecked = this.checked;
            this.value = input.value;
        }
        /**
         * Configure tous les écouteurs d'événements du composant.
         *
         * @returns L'instance courante pour chaînage
         *
         * @remarks
         * Actuellement configure uniquement l'écouteur de changement de l'input interne.
         *
         * @private
         */
        #_setupListeners() {
            this.#_handleInnerChange();
            return this;
        }
        /**
         * Synchronise les attributs entre l'élément hôte et l'input interne.
         *
         * @returns L'instance courante pour chaînage
         *
         * @remarks
         * Parcourt tous les {@link SYNCED_ATTRIBUTES} et applique leurs valeurs à l'input.
         *
         * Cas particulier : si l'attribut 'checked' n'est pas présent mais que la propriété
         * `checked` est à `true`, l'attribut est défini explicitement.
         *
         * @private
         */
        #_sync() {
            for (const attr of SYNCED_ATTRIBUTES$2) {
                if (this.hasAttribute(attr)) {
                    this._p_update(attr, null, this.getAttribute(attr));
                }
                else {
                    if (attr === ATTRIBUTE_CHECKED$1 && this.checked) {
                        this._p_update(ATTRIBUTE_CHECKED$1, null, 'true');
                    }
                }
            }
            return this;
        }
        /**
         * Définit la valeur du composant dans le formulaire parent.
         *
         * @param value - La valeur à définir (null si le radio n'est pas coché)
         * @returns Un {@link Result} indiquant le succès de l'opération
         *
         * @remarks
         * Utilise l'API ElementInternals pour intégrer le composant dans le système de formulaires.
         * La valeur est null lorsque le radio n'est pas coché, et correspond à la propriété
         * `value` lorsqu'il est coché.
         *
         * @private
         */
        get #_setFormValue() { return _private__setFormValue_descriptor.value; }
        //#endregion Private methods
        //#region Static
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
        static _p_observedAttributes() {
            return [...super._p_observedAttributes(), ...SYNCED_ATTRIBUTES$2];
        }
        /**
         * Retourne le nom de l'événement 'change'.
         *
         * @returns Le nom de l'événement 'change'
         */
        static get EVENT_CHANGE() {
            return EVENT_CHANGE$3;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    });
    return _classThis;
})();

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
let HTMLBnumSecondaryButton = (() => {
    let _classDecorators = [Define({ tag: TAG_SECONDARY }), Variation(ButtonVariation.SECONDARY)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumButton;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        constructor() {
            super();
        }
    });
    return _classThis;
})();

const schedulersKey = Symbol('schedulers');
/**
 * Décorateur permettant de planifier l'exécution d'une méthode via un {@link Scheduler}.
 *
 * Ce décorateur modifie le comportement de la méthode cible pour qu'elle agisse comme un initialiseur de `Scheduler`.
 * La méthode originale ne sera appelée qu'une seule fois par instance de classe pour configurer le callback du `Scheduler`.
 * Les appels subséquents à la méthode décorée déclencheront la planification (`schedule`) sur l'instance de `Scheduler` mise en cache,
 * en passant le premier argument de l'appel comme valeur à planifier.
 *
 * Le `Scheduler` utilise généralement `requestAnimationFrame` pour différer et regrouper l'exécution,
 * ce qui est utile pour des mises à jour d'interface ou des opérations coûteuses qui peuvent être regroupées.
 *
 * @returns Une fonction décoratrice de méthode.
 *
 * @example
 * ```typescript
 * class Composant {
 *   @Schedule()
 *   protected onUpdate(initValue: number) {
 *     // Cette méthode retourne le callback exécuté par le Scheduler.
 *     // Elle est appelée une seule fois à la première exécution.
 *     return (val: number | null) => {
 *       console.log('Valeur traitée :', val);
 *     };
 *   }
 *
 *   trigger() {
 *     this.onUpdate(1); // Initialise le scheduler et planifie 1
 *     this.onUpdate(2); // Planifie 2 (l'exécution réelle se fera plus tard avec la dernière valeur)
 *   }
 * }
 * ```
 */
function Schedule() {
    return function (target, context) {
        const sKey = Symbol(String(context.name));
        return function (...args) {
            const caches = (this[schedulersKey] ??= new Map());
            let scheduler;
            if (caches.has(sKey))
                scheduler = caches.get(sKey);
            else
                scheduler = new Scheduler(target.bind(this, ...args));
            if (scheduler)
                scheduler.schedule(args[0]);
        };
    };
}

var css_248z$e = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host([no-legend]) .bnum-select__container__label{clip:rect(1px,1px,1px,1px)!important;border:0!important;clip-path:inset(50%)!important;height:1px!important;overflow:hidden!important;padding:0!important;position:absolute!important;white-space:nowrap!important;width:1px!important}select{appearance:none;-webkit-appearance:none;-moz-appearance:none;cursor:pointer}.icon-arrow-down{position:absolute;right:5px;top:50%;transform:translateY(-50%);user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}.select-container{position:relative}";

//#endregon Types
//#region Global Constants
const SYNCED_ATTRIBUTES$1 = [
    'autocomplete',
    'autofocus',
    'disabled',
    'form',
    'multiple',
    'required',
    'size',
    'name',
    'value',
];
const TEMPLATE$b = (h("div", { class: "bnum-select__container", children: [h("label", { id: "select-label", class: "bnum-select__container__label label-container", for: "select", children: [h("span", { class: "bnum-select__container__label--legend label-container--label", children: h("slot", { name: "label" }) }), h("span", { class: "bnum-select__container__label--hint label-container--hint", children: h("slot", { name: "hint" }) })] }), h("div", { class: "select-container", children: [h("select", { id: "select", class: "bnum-select__container__select input-like" }), h(HTMLBnumIcon, { "data-icon": "keyboard_arrow_down", class: "icon-arrow-down" })] })] }));
//#endregion Global Constants
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
let HTMLBnumSelect = (() => {
    let _classDecorators = [Define({
            tag: TAG_SELECT,
            template: TEMPLATE$b,
            styles: [INPUT_BASE_STYLE, css_248z$e],
        }), UpdateAll()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _staticExtraInitializers = [];
    let _instanceExtraInitializers = [];
    let _static__p_observedAttributes_decorators;
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _private__legend_decorators;
    let _private__legend_initializers = [];
    let _private__legend_extraInitializers = [];
    let _private__legend_descriptor;
    let _private__hint_decorators;
    let _private__hint_initializers = [];
    let _private__hint_extraInitializers = [];
    let _private__hint_descriptor;
    let _private__defaultValue_decorators;
    let _private__defaultValue_initializers = [];
    let _private__defaultValue_extraInitializers = [];
    let _private__defaultValue_descriptor;
    let _private__defaultText_decorators;
    let _private__defaultText_initializers = [];
    let _private__defaultText_extraInitializers = [];
    let _private__defaultText_descriptor;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _noLegend_decorators;
    let _noLegend_initializers = [];
    let _noLegend_extraInitializers = [];
    let _private__obserse_decorators;
    let _private__obserse_descriptor;
    let _private__scheduleMoveOptions_decorators;
    let _private__scheduleMoveOptions_descriptor;
    let _private__tryInitValue_decorators;
    let _private__tryInitValue_descriptor;
    let _private__setFormValue_decorators;
    let _private__setFormValue_descriptor;
    let _private__fireSelect_decorators;
    let _private__fireSelect_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    slotLabel: '#select-label slot[name="label"]',
                    slotHint: '#select-label slot[name="hint"]',
                    select: '#select',
                })];
            _private__legend_decorators = [Data({ setter: false })];
            _private__hint_decorators = [Data({ setter: false })];
            _private__defaultValue_decorators = [Data('default-value', { setter: false })];
            _private__defaultText_decorators = [Data('default-text', { setter: false })];
            _name_decorators = [Attr()];
            _noLegend_decorators = [Attr('no-legend')];
            _private__obserse_decorators = [Autobind];
            _private__scheduleMoveOptions_decorators = [Schedule()];
            _private__tryInitValue_decorators = [Risky()];
            _private__setFormValue_decorators = [Risky()];
            _private__fireSelect_decorators = [Autobind, Fire('change')];
            _static__p_observedAttributes_decorators = [NonStd('Deprecated')];
            __esDecorate(this, null, _static__p_observedAttributes_decorators, { kind: "method", name: "_p_observedAttributes", static: true, private: false, access: { has: obj => "_p_observedAttributes" in obj, get: obj => obj._p_observedAttributes }, metadata: _metadata }, null, _staticExtraInitializers);
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, _private__legend_descriptor = { get: __setFunctionName(function () { return this.#_legend_accessor_storage; }, "#_legend", "get"), set: __setFunctionName(function (value) { this.#_legend_accessor_storage = value; }, "#_legend", "set") }, _private__legend_decorators, { kind: "accessor", name: "#_legend", static: false, private: true, access: { has: obj => #_legend in obj, get: obj => obj.#_legend, set: (obj, value) => { obj.#_legend = value; } }, metadata: _metadata }, _private__legend_initializers, _private__legend_extraInitializers);
            __esDecorate(this, _private__hint_descriptor = { get: __setFunctionName(function () { return this.#_hint_accessor_storage; }, "#_hint", "get"), set: __setFunctionName(function (value) { this.#_hint_accessor_storage = value; }, "#_hint", "set") }, _private__hint_decorators, { kind: "accessor", name: "#_hint", static: false, private: true, access: { has: obj => #_hint in obj, get: obj => obj.#_hint, set: (obj, value) => { obj.#_hint = value; } }, metadata: _metadata }, _private__hint_initializers, _private__hint_extraInitializers);
            __esDecorate(this, _private__defaultValue_descriptor = { get: __setFunctionName(function () { return this.#_defaultValue_accessor_storage; }, "#_defaultValue", "get"), set: __setFunctionName(function (value) { this.#_defaultValue_accessor_storage = value; }, "#_defaultValue", "set") }, _private__defaultValue_decorators, { kind: "accessor", name: "#_defaultValue", static: false, private: true, access: { has: obj => #_defaultValue in obj, get: obj => obj.#_defaultValue, set: (obj, value) => { obj.#_defaultValue = value; } }, metadata: _metadata }, _private__defaultValue_initializers, _private__defaultValue_extraInitializers);
            __esDecorate(this, _private__defaultText_descriptor = { get: __setFunctionName(function () { return this.#_defaultText_accessor_storage; }, "#_defaultText", "get"), set: __setFunctionName(function (value) { this.#_defaultText_accessor_storage = value; }, "#_defaultText", "set") }, _private__defaultText_decorators, { kind: "accessor", name: "#_defaultText", static: false, private: true, access: { has: obj => #_defaultText in obj, get: obj => obj.#_defaultText, set: (obj, value) => { obj.#_defaultText = value; } }, metadata: _metadata }, _private__defaultText_initializers, _private__defaultText_extraInitializers);
            __esDecorate(this, null, _name_decorators, { kind: "accessor", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(this, null, _noLegend_decorators, { kind: "accessor", name: "noLegend", static: false, private: false, access: { has: obj => "noLegend" in obj, get: obj => obj.noLegend, set: (obj, value) => { obj.noLegend = value; } }, metadata: _metadata }, _noLegend_initializers, _noLegend_extraInitializers);
            __esDecorate(this, _private__obserse_descriptor = { value: __setFunctionName(function (mutations) {
                    const hasOptionMutation = mutations.some((m) => Array.from(m.addedNodes).some((n) => n instanceof HTMLOptionElement || n instanceof HTMLOptGroupElement));
                    if (hasOptionMutation) {
                        this.#_scheduleMoveOptions();
                    }
                }, "#_obserse") }, _private__obserse_decorators, { kind: "method", name: "#_obserse", static: false, private: true, access: { has: obj => #_obserse in obj, get: obj => obj.#_obserse }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__scheduleMoveOptions_descriptor = { value: __setFunctionName(function () {
                    this.#_moveOptions();
                }, "#_scheduleMoveOptions") }, _private__scheduleMoveOptions_decorators, { kind: "method", name: "#_scheduleMoveOptions", static: false, private: true, access: { has: obj => #_scheduleMoveOptions in obj, get: obj => obj.#_scheduleMoveOptions }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__tryInitValue_descriptor = { value: __setFunctionName(function ({ ignoreSelectedValue = false, } = {}) {
                    if (isNullOrUndefined$1(this.#_initValue))
                        this.#_initValue =
                            this.#_defaultValue ?? (ignoreSelectedValue ? null : this.value);
                    return ATresult.Ok();
                }, "#_tryInitValue") }, _private__tryInitValue_decorators, { kind: "method", name: "#_tryInitValue", static: false, private: true, access: { has: obj => #_tryInitValue in obj, get: obj => obj.#_tryInitValue }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__setFormValue_descriptor = { value: __setFunctionName(function (value) {
                    this._p_internal.setFormValue(value);
                    return ATresult.Ok();
                }, "#_setFormValue") }, _private__setFormValue_decorators, { kind: "method", name: "#_setFormValue", static: false, private: true, access: { has: obj => #_setFormValue in obj, get: obj => obj.#_setFormValue }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__fireSelect_descriptor = { value: __setFunctionName(function (event) {
                    return { innerEvent: event, caller: this };
                }, "#_fireSelect") }, _private__fireSelect_decorators, { kind: "method", name: "#_fireSelect", static: false, private: true, access: { has: obj => #_fireSelect in obj, get: obj => obj.#_fireSelect }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        //#region Constants
        /**
         * Required to participate in HTMLFormElement
         */
        static formAssociated = (__runInitializers(_classThis, _staticExtraInitializers), true);
        //#endregion Constants
        //#region Private fields
        #_observer = (__runInitializers(this, _instanceExtraInitializers), null);
        #_initValue = null;
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        //#endregion Private fields
        //#region Getters/Setters
        /**
         * Elements d'interface interne
         */
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #_legend_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _private__legend_initializers, null));
        /**
         * Récupère l'information du data-legend.
         *
         * @remark
         * `data-legend` correspond à la légende affiché par défaut.
         */
        get #_legend() { return _private__legend_descriptor.get.call(this); }
        set #_legend(value) { return _private__legend_descriptor.set.call(this, value); }
        #_hint_accessor_storage = (__runInitializers(this, _private__legend_extraInitializers), __runInitializers(this, _private__hint_initializers, null));
        /**
         * Récupère l'information du data-hint.
         *
         * @remark
         * `data-hint` correspond à l'indice affiché par défaut.
         */
        get #_hint() { return _private__hint_descriptor.get.call(this); }
        set #_hint(value) { return _private__hint_descriptor.set.call(this, value); }
        #_defaultValue_accessor_storage = (__runInitializers(this, _private__hint_extraInitializers), __runInitializers(this, _private__defaultValue_initializers, null));
        /**
         * Récupère l'information du data-default-value.
         *
         * @remark
         * `data-default-value` génère un élément `<option value="${this.#_defaultValue}" selected disabled>${this.#_defaultText}</option>`
         */
        get #_defaultValue() { return _private__defaultValue_descriptor.get.call(this); }
        set #_defaultValue(value) { return _private__defaultValue_descriptor.set.call(this, value); }
        #_defaultText_accessor_storage = (__runInitializers(this, _private__defaultValue_extraInitializers), __runInitializers(this, _private__defaultText_initializers, null));
        /**
         * Récupère l'information du data-default-text.
         *
         * @remark
         * `data-default-text` génère un élément `<option value="${this.#_defaultValue}" selected disabled>${this.#_defaultText}</option>`
         */
        get #_defaultText() { return _private__defaultText_descriptor.get.call(this); }
        set #_defaultText(value) { return _private__defaultText_descriptor.set.call(this, value); }
        #name_accessor_storage = (__runInitializers(this, _private__defaultText_extraInitializers), __runInitializers(this, _name_initializers, EMPTY_STRING));
        /**
         * Nom de l'input
         */
        get name() { return this.#name_accessor_storage; }
        set name(value) { this.#name_accessor_storage = value; }
        #noLegend_accessor_storage = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _noLegend_initializers, true));
        /**
         * Si l'attribut `no-legend` est actif, la légende ne s'affichera pas (seulement pour les lecteurs d'écrans).
         */
        get noLegend() { return this.#noLegend_accessor_storage; }
        set noLegend(value) { this.#noLegend_accessor_storage = value; }
        /**
         * Valeur du select
         */
        get value() {
            return this.#_ui.select.value;
        }
        set value(value) {
            this.#_setFormValue(value);
            this.#_ui.select.value = value;
        }
        /**
         * Tout les options disponibles
         */
        get options() {
            return Array.from((this.shadowRoot || this).querySelectorAll('option'));
        }
        /**
         * Select dans le shadow-root
         */
        get select() {
            return this.#_ui.select;
        }
        /**
         * Récupère les options et optgroup du light-dom.
         */
        get #_lightOptions() {
            return Array.from(this.querySelectorAll(':scope > option, :scope > optgroup'));
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
            __runInitializers(this, _noLegend_extraInitializers);
            this.#_tryInitValue({ ignoreSelectedValue: true }).tapError((error) => {
                Log.error('HTMLBnumSelectElement', 'Impossible d\'initialiser la valeur par défaut !', error);
            });
        }
        /**
         * Callback appelée lorsque le composant est ajouté au DOM.
         *
         * Déclenche le rendu du composant.
         *
         * @override Pour pouvoir ajouter un observer et observer le light-dom.
         */
        connectedCallback() {
            super.connectedCallback();
            (this.#_observer ??= new MutationObserver(this.#_obserse)).observe(this, {
                childList: true,
            });
        }
        /**
         * On attache un shadow-dom custom pour pouvoir déléger le focus.
         * @returns ShadowRoot ouvert avec le focus délégué.
         */
        _p_attachCustomShadow() {
            return this.attachShadow({ mode: 'open', delegatesFocus: true });
        }
        /**
         * @inheritdoc
         */
        _p_preload() {
            this.#_setDefault();
        }
        /**
         * @inheritdoc
         */
        _p_buildDOM() {
            this.#_moveOptions();
        }
        /**
         * @inheritdoc
         */
        _p_attach() {
            this.#_tryInitValue().match({
                Ok: () => {
                    this.#_setDataLegend().#_setDataHint().#_initListeners().#_sync();
                    if (!this.#_hasLegend) {
                        Log.warn('HTMLBnumSelect', 'Vous devez mettre un libellé !');
                    }
                },
                Err: (error) => {
                    Log.error('HTMLBnumSelect', 'Impossible d\'initialiser la valeur du select !', error, this);
                },
            });
        }
        /**
         * @inheritdoc
         */
        _p_detach() {
            this.#_observer?.disconnect?.();
        }
        /**
         * @inheritdoc
         */
        _p_update() {
            this.#_sync();
        }
        //#endregion Lifecycle
        //#region Publics Methods
        /**
         * Ajoute un groupe d'option
         * @param group Groupe à ajouter
         * @returns Le groupe ajouté au shadow-dom
         */
        addOptGroup(group) {
            this.appendChild(group);
            return group;
        }
        /**
         * Ajoute une option dans le select
         * @param opt Option à ajouter
         * @param param1
         * @returns Chaîne ou option créée
         */
        addOption(opt, { prepend = false } = {}) {
            let returnElement;
            let option;
            if (opt instanceof HTMLOptionElement) {
                option = opt;
                returnElement = this;
            }
            else {
                option = document.createElement('option');
                if (opt.value !== null && opt.value !== undefined)
                    option.value = String(opt.value);
                option.text = opt.text;
                prepend = prepend || opt.prepend || false;
                returnElement = option;
            }
            if (prepend)
                this.prepend(option);
            else
                this.appendChild(option);
            return returnElement;
        }
        // --- Formulaire --
        /**
         * Réinitialise la valeur du champ lors d'une remise à zéro du formulaire parent.
         */
        formResetCallback() {
            this.value = this.#_defaultValue ?? EMPTY_STRING;
        }
        /**
         * Active ou désactive le champ selon l'état du fieldset parent.
         */
        formDisabledCallback(disabled) {
            if (disabled)
                this.setAttribute('disabled', 'disabled');
            this.#_sync();
        }
        //#endregion Publics Methods
        //#region Private methods
        #_initListeners() {
            return this.#_onInnerSelect();
        }
        get #_obserse() { return _private__obserse_descriptor.value; }
        get #_scheduleMoveOptions() { return _private__scheduleMoveOptions_descriptor.value; }
        #_moveOptions() {
            this.#_ui.select.append(...this.#_lightOptions);
            return this;
        }
        #_setDataLegend() {
            return this.#_setLabelPart(this.#_legend, this.#_ui.slotLabel);
        }
        #_setDataHint() {
            return this.#_setLabelPart(this.#_hint, this.#_ui.slotHint);
        }
        #_setLabelPart(what, slot) {
            if (what)
                slot.appendChild(this._p_createTextNode(what));
            return this;
        }
        #_hasLegend() {
            const hasLabel = this.querySelectorAll('[slot="label"]').length > 0 || this.#_legend;
            const hasHint = this.querySelectorAll('[slot="hint"]').length > 0 || this.#_hint;
            return hasLabel || hasHint;
        }
        #_setDefault() {
            const value = this.#_defaultValue;
            const text = this.#_defaultText;
            if (value || text) {
                const effectiveValue = value || text;
                const effectiveText = text || value;
                const createdOption = this.addOption({
                    value: effectiveValue,
                    text: effectiveText,
                    prepend: true,
                });
                createdOption.setAttribute('selected', 'true');
                createdOption.setAttribute('disabled', 'disabled');
            }
            return this;
        }
        #_sync() {
            const select = this.#_ui.select;
            for (const attr of SYNCED_ATTRIBUTES$1) {
                if (this.hasAttribute(attr))
                    select.setAttribute(attr, this.getAttribute(attr));
                else if (select.hasAttribute(attr))
                    select.removeAttribute(attr);
            }
        }
        get #_tryInitValue() { return _private__tryInitValue_descriptor.value; }
        get #_setFormValue() { return _private__setFormValue_descriptor.value; }
        get #_fireSelect() { return _private__fireSelect_descriptor.value; }
        #_onInnerSelect() {
            this.#_ui.select.addEventListener('change', this.#_fireSelect);
            return this;
        }
        //#endregion Private methods
        //#region Static
        /**
         * Méthode interne pour définir les attributs observés.
         * @returns Attributs à observer
         * @deprecated Utilisez le décorateur {@link Observe} du commit 3e38db0162eef596874dbe32490d9e96b09fb1c0
         * @see [feat(composants): ✨ Ajout d'un décorateur pour réduire le boilerplate des attibuts à observer](https://github.com/messagerie-melanie2/design-system-bnum/commit/3e38db0162eef596874dbe32490d9e96b09fb1c0)
         */
        static _p_observedAttributes() {
            return [...super._p_observedAttributes(), ...SYNCED_ATTRIBUTES$1];
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    });
    return _classThis;
})();

var css_248z$d = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{--_color:var(--bnum-checkbox-color,var(--bnum-primary-color,#000091));--_background-color:var(--bnum-checkbox-background-color,var(--bnum-color-background,#fff));--_internal-border-color:var(--_color);--_internal-error:var(--bnum-input-state-error-color,var(--bnum-semantic-danger,#de350b))}:host .checkbox__label{align-content:center;align-items:center;display:inline-flex;flex-direction:row;position:relative;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}:host .checkbox__label:before{background:var(--_background-color);border:thin solid var(--_internal-border-color);border-radius:500px;box-sizing:border-box;content:\"\";cursor:pointer;display:inline-block;height:1.5rem;width:2.5rem}:host .checkbox__label:after{background-color:var(--_background-color);border:thin solid var(--_internal-border-color);border-radius:100%;box-sizing:border-box;content:\"\";cursor:pointer;display:block;height:1.5rem;left:0;position:absolute;top:0;width:1.5rem}:host .checkbox__label__desc{color:var(--_color)!important;display:none;left:0;position:absolute;top:24px}:host .checkbox__state{display:none}:host .checkbox__label--hint{display:block;margin-top:1rem;user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}#native-input{height:0;opacity:0;position:absolute;width:0}#native-input:focus-visible~.checkbox__label:before{outline-color:#0a76f6;outline-offset:2px;outline-style:solid;outline-width:2px}#native-input:checked~.checkbox__label:before{background:var(--_color)}#native-input:checked~.checkbox__label:after{color:var(--_color);content:\"\\e5ca\";font-family:var(--bnum-icon-font-family);font-size:21px;line-height:22px;transform:translateX(1rem)}:host(:state(state)) .checkbox__state{display:block}:host(:state(state):state(error)){--_internal-border-color:var(--_internal-error)}:host(:state(state):state(error)) #active-text,:host(:state(state):state(error)) #inactive-text{color:var(--_internal-error)!important}:host(:state(helper)) #inactive-text{display:block}:host(:state(helper)) #active-text{display:none}:host(:state(helper)) #native-input:checked #inactive-text,:host([checked]:state(helper)) #inactive-text{display:none}:host(:state(helper)) #native-input:checked #active-text,:host([checked]:state(helper)) #active-text{display:block}:host([disabled]){opacity:.5;pointer-events:none}";

//#region Utilities
/**
 * Initialise l'écouteur d'événement `change` sur l'instance du checkbox.
 *
 * @remarks
 * Ajoute un listener natif `change` sur l'élément hôte et appelle le callback
 * de l'événement personnalisé {@link OnCheckedChangeEvent} lorsqu'il y a des abonnés.
 *
 * @param event - L'événement personnalisé à déclencher
 * @param instance - L'instance du composant {@link HTMLBnumSwitch}
 *
 * @internal
 */
function OnCheckedChangeInitializer(event, instance) {
    instance.addEventListener(EVENT_CHANGE$2, (e) => {
        if (event.haveEvents())
            event.call(e);
    });
}
//#endregion Internal Types
//#region Global Constants
/**
 * Icônes utilisées pour les états du checkbox.
 *
 * @remarks
 * Associe chaque état de validation à une icône Material Icons correspondante.
 *
 * @internal
 */
const BnumSwitchIcon = {
    SUCCESS: 'check_circle',
    ERROR: 'cancel',
};
/**
 * Nom de l'attribut 'checked'.
 * @internal
 */
const ATTRIBUTE_CHECKED = 'checked';
/**
 * Nom de l'attribut 'helper'.
 * @internal
 */
const ATTRIBUTE_HELPER = 'helper';
/**
 * Nom de l'événement 'change'.
 * @internal
 */
const EVENT_CHANGE$2 = 'change';
/**
 * Tag utilisé pour les messages de log du composant.
 * @internal
 */
const LOG_TAG = 'BnumCheckbox';
/**
 * Message d'avertissement affiché lorsqu'aucun label n'est trouvé.
 * @internal
 */
const WARN_NO_LABEL = "Aucun texte de description ou d'aide n'a été trouvé";
/**
 * Message de validité par défaut lorsqu'aucun message natif n'est disponible.
 * @internal
 */
const DEFAULT_VALIDITY_MESSAGE = 'Certaines conditions ne sont pas satisfaites';
/**
 * Nom de l'état interne 'state'.
 * @internal
 */
const STATE_STATE = 'state';
/**
 * Nom de l'état interne 'error'.
 * @internal
 */
const STATE_ERROR = 'error';
/**
 * Nom de l'attribut ARIA 'aria-checked'.
 * @internal
 */
const ARIA_CHECKED = 'aria-checked';
/**
 * Nom de l'attribut ARIA 'aria-required'.
 * @internal
 */
const ARIA_REQUIRED = 'aria-required';
/**
 * Nom de l'attribut ARIA 'aria-disabled'.
 * @internal
 */
const ARIA_DISABLED = 'aria-disabled';
/**
 * Nom de l'attribut ARIA 'aria-invalid'.
 * @internal
 */
const ARIA_INVALID = 'aria-invalid';
/**
 * Nom de l'attribut ARIA 'aria-describedby'.
 * @internal
 */
const ARIA_DESCRIBEDBY = 'aria-describedby';
/**
 * Identifiant du slot d'indice.
 * @internal
 */
const ID_HINT$1 = 'hint';
/**
 * Identifiant de l'élément affichant le texte de validité.
 * @internal
 */
const ID_VALIDITY_TEXT = 'validity-text';
/**
 * Valeur booléenne 'true' sous forme de chaîne.
 * @internal
 */
const ARIA_TRUE = 'true';
/**
 * Texte par défaut pour l'état actif.
 * @internal
 */
const TEXT_ACTIVE_DEFAULT = BnumConfig.Get('local_keys')?.active_switch ?? 'Activé';
/**
 * Texte par défaut pour l'état inactif.
 * @internal
 */
const TEXT_INACTIVE_DEFAULT = BnumConfig.Get('local_keys')?.inactive_switch ?? 'Désactivé';
/**
 * Liste des attributs synchronisés entre l'élément hôte et l'input interne.
 *
 * @remarks
 * Ces attributs sont automatiquement propagés de l'élément personnalisé vers l'input natif.
 * @internal
 */
const SYNCED_ATTRIBUTES = ['name', 'checked', 'value', 'disabled', 'required'];
//#endregion Global Constants
//#region Template
/**
 * Template HTML du composant checkbox.
 *
 * @remarks
 * Structure DOM utilisée pour créer le shadow DOM du composant.
 * Comprend un input checkbox natif configuré en rôle `switch`, un label
 * avec des slots pour le contenu actif/inactif, et une zone d'état de validation.
 *
 * @internal
 */
const TEMPLATE$a = (h(HTMLBnumFragment, { children: [h("input", { id: "native-input", type: "checkbox", role: "switch" }), h("label", { class: "checkbox__label label-container hint-label", for: "native-input", children: [h("span", { class: "checkbox__label--legend label-container--label ", children: h("slot", { id: "legend" }) }), h("span", { id: "active-text", class: "checkbox__label__desc checkbox__label__desc--ok label-container--hint", children: h("slot", { name: "activeText", children: TEXT_ACTIVE_DEFAULT }) }), h("span", { id: "inactive-text", class: "checkbox__label__desc checkbox__label__desc--no label-container--hint", children: h("slot", { name: "inactiveText", children: TEXT_INACTIVE_DEFAULT }) })] }), h("span", { class: "checkbox__label--hint hint-label label-container--hint", children: h("slot", { id: ID_HINT$1, name: ID_HINT$1 }) }), h("div", { class: "checkbox__state state", children: [h(HTMLBnumIcon, { id: "icon" }), h("span", { id: ID_VALIDITY_TEXT })] })] }));
//#endregion Template
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
 * <bnum-switch>Click me !</bnum-switch>
 * ```
 *
 * @example
 * Structure avec indice :
 * ```html
 * <bnum-switch>Click me !<span slot="hint">Indice</span></bnum-switch>
 * ```
 *
 * @example
 * Structure required avec helper :
 * ```html
 * <bnum-switch helper required>Click me !<span slot="hint">Indice</span></bnum-switch>
 * ```
 *
 * @fires CustomEvent<BnumCheckBoxDetail> - Déclenché lorsque l'état coché du checkbox change
 *
 * @public
 *
 * @structure Classique
 * <bnum-switch>Click me !</bnum-switch>
 *
 * @structure Avec indice
 * <bnum-switch checked>Click me !<span slot="hint">Indice</span></bnum-switch>
 *
 * @structure Requis
 * <bnum-switch required>Click me !<span slot="hint">Indice</span></bnum-switch>
 *
 * @structure Avec un texte d'aide
 * <bnum-switch helper>Click me !<span slot="hint">Indice</span></bnum-switch>
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
 * @cssvar {#000091} --bnum-switch-color - Couleur du checkbox
 * @cssvar {white} --bnum-switch-background-color - Couleur de fond du checkbox
 * @cssvar {#de350b} --bnum-input-state-error-color - Couleur de l'erreur
 */
let HTMLBnumSwitch = (() => {
    let _classDecorators = [Define({
            tag: 'bnum-switch',
            template: TEMPLATE$a,
            styles: [INPUT_BASE_STYLE, INPUT_STYLE_STATES, css_248z$d],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _staticExtraInitializers = [];
    let _instanceExtraInitializers = [];
    let _static__p_observedAttributes_decorators;
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _checked_decorators;
    let _checked_initializers = [];
    let _checked_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    let _disabled_decorators;
    let _disabled_initializers = [];
    let _disabled_extraInitializers = [];
    let _required_decorators;
    let _required_initializers = [];
    let _required_extraInitializers = [];
    let _helper_decorators;
    let _helper_initializers = [];
    let _helper_extraInitializers = [];
    let _private__legend_decorators;
    let _private__legend_initializers = [];
    let _private__legend_extraInitializers = [];
    let _private__legend_descriptor;
    let _private__hint_decorators;
    let _private__hint_initializers = [];
    let _private__hint_extraInitializers = [];
    let _private__hint_descriptor;
    let _oncheckedchange_decorators;
    let _oncheckedchange_initializers = [];
    let _oncheckedchange_extraInitializers = [];
    let _private__checkValidity_decorators;
    let _private__checkValidity_descriptor;
    let _private__reportValidity_decorators;
    let _private__reportValidity_descriptor;
    let _private__change_decorators;
    let _private__change_descriptor;
    let _private__setText_decorators;
    let _private__setText_descriptor;
    let _private__setInternalError_decorators;
    let _private__setInternalError_descriptor;
    let _private__setValidity_decorators;
    let _private__setValidity_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    input: '#native-input',
                    textActive: '#active-text',
                    textInactive: '#inactive-text',
                    slotLegend: '#legend',
                    slotHint: `#${ID_HINT$1}`,
                    validityText: `#${ID_VALIDITY_TEXT}`,
                    icon: '#icon',
                })];
            _checked_decorators = [Attr()];
            _name_decorators = [Attr()];
            _value_decorators = [Attr()];
            _disabled_decorators = [Attr()];
            _required_decorators = [Attr()];
            _helper_decorators = [Attr()];
            _private__legend_decorators = [Data()];
            _private__hint_decorators = [Data()];
            _oncheckedchange_decorators = [Listener(OnCheckedChangeInitializer)];
            _private__checkValidity_decorators = [Risky()];
            _private__reportValidity_decorators = [Risky()];
            _private__change_decorators = [Fire(EVENT_CHANGE$2)];
            _private__setText_decorators = [Risky()];
            _private__setInternalError_decorators = [Risky()];
            _private__setValidity_decorators = [Risky()];
            _static__p_observedAttributes_decorators = [NonStd('Deprecated')];
            __esDecorate(this, null, _static__p_observedAttributes_decorators, { kind: "method", name: "_p_observedAttributes", static: true, private: false, access: { has: obj => "_p_observedAttributes" in obj, get: obj => obj._p_observedAttributes }, metadata: _metadata }, null, _staticExtraInitializers);
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _checked_decorators, { kind: "accessor", name: "checked", static: false, private: false, access: { has: obj => "checked" in obj, get: obj => obj.checked, set: (obj, value) => { obj.checked = value; } }, metadata: _metadata }, _checked_initializers, _checked_extraInitializers);
            __esDecorate(this, null, _name_decorators, { kind: "accessor", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(this, null, _value_decorators, { kind: "accessor", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            __esDecorate(this, null, _disabled_decorators, { kind: "accessor", name: "disabled", static: false, private: false, access: { has: obj => "disabled" in obj, get: obj => obj.disabled, set: (obj, value) => { obj.disabled = value; } }, metadata: _metadata }, _disabled_initializers, _disabled_extraInitializers);
            __esDecorate(this, null, _required_decorators, { kind: "accessor", name: "required", static: false, private: false, access: { has: obj => "required" in obj, get: obj => obj.required, set: (obj, value) => { obj.required = value; } }, metadata: _metadata }, _required_initializers, _required_extraInitializers);
            __esDecorate(this, null, _helper_decorators, { kind: "accessor", name: "helper", static: false, private: false, access: { has: obj => "helper" in obj, get: obj => obj.helper, set: (obj, value) => { obj.helper = value; } }, metadata: _metadata }, _helper_initializers, _helper_extraInitializers);
            __esDecorate(this, _private__legend_descriptor = { get: __setFunctionName(function () { return this.#_legend_accessor_storage; }, "#_legend", "get"), set: __setFunctionName(function (value) { this.#_legend_accessor_storage = value; }, "#_legend", "set") }, _private__legend_decorators, { kind: "accessor", name: "#_legend", static: false, private: true, access: { has: obj => #_legend in obj, get: obj => obj.#_legend, set: (obj, value) => { obj.#_legend = value; } }, metadata: _metadata }, _private__legend_initializers, _private__legend_extraInitializers);
            __esDecorate(this, _private__hint_descriptor = { get: __setFunctionName(function () { return this.#_hint_accessor_storage; }, "#_hint", "get"), set: __setFunctionName(function (value) { this.#_hint_accessor_storage = value; }, "#_hint", "set") }, _private__hint_decorators, { kind: "accessor", name: "#_hint", static: false, private: true, access: { has: obj => #_hint in obj, get: obj => obj.#_hint, set: (obj, value) => { obj.#_hint = value; } }, metadata: _metadata }, _private__hint_initializers, _private__hint_extraInitializers);
            __esDecorate(this, null, _oncheckedchange_decorators, { kind: "accessor", name: "oncheckedchange", static: false, private: false, access: { has: obj => "oncheckedchange" in obj, get: obj => obj.oncheckedchange, set: (obj, value) => { obj.oncheckedchange = value; } }, metadata: _metadata }, _oncheckedchange_initializers, _oncheckedchange_extraInitializers);
            __esDecorate(this, _private__checkValidity_descriptor = { value: __setFunctionName(function () {
                    return this.#_ui.input.checkValidity();
                }, "#_checkValidity") }, _private__checkValidity_decorators, { kind: "method", name: "#_checkValidity", static: false, private: true, access: { has: obj => #_checkValidity in obj, get: obj => obj.#_checkValidity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__reportValidity_descriptor = { value: __setFunctionName(function () {
                    return this.#_ui.input.reportValidity();
                }, "#_reportValidity") }, _private__reportValidity_decorators, { kind: "method", name: "#_reportValidity", static: false, private: true, access: { has: obj => #_reportValidity in obj, get: obj => obj.#_reportValidity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__change_descriptor = { value: __setFunctionName(function (event) {
                    this.checked = this.#_ui.input.checked;
                    return { inner: event, caller: this };
                }, "#_change") }, _private__change_decorators, { kind: "method", name: "#_change", static: false, private: true, access: { has: obj => #_change in obj, get: obj => obj.#_change }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__setText_descriptor = { value: __setFunctionName(function () {
                    if (this.#_ui.validityText.textContent !== this.#_ui.input.validationMessage)
                        this.#_ui.validityText.textContent = this.#_ui.input.validationMessage;
                    return null;
                }, "#_setText") }, _private__setText_decorators, { kind: "method", name: "#_setText", static: false, private: true, access: { has: obj => #_setText in obj, get: obj => obj.#_setText }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__setInternalError_descriptor = { value: __setFunctionName(function () {
                    if (!this.checkValidity()) {
                        this._p_internal.setValidity(this.#_ui.input.validity, this.#_ui.input.validationMessage, this.#_ui.input);
                    }
                    return null;
                }, "#_setInternalError") }, _private__setInternalError_decorators, { kind: "method", name: "#_setInternalError", static: false, private: true, access: { has: obj => #_setInternalError in obj, get: obj => obj.#_setInternalError }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__setValidity_descriptor = { value: __setFunctionName(function () {
                    if (this.checkValidity()) {
                        this._p_internal.setValidity({});
                    }
                    return null;
                }, "#_setValidity") }, _private__setValidity_decorators, { kind: "method", name: "#_setValidity", static: false, private: true, access: { has: obj => #_setValidity in obj, get: obj => obj.#_setValidity }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _staticExtraInitializers);
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private Fields
        /**
         * État initial du checkbox lors du chargement.
         *
         * @remarks
         * Stocké lors du préchargement pour pouvoir restaurer l'état initial
         * lors d'un reset du formulaire via {@link formResetCallback}.
         *
         * @internal
         */
        #_initState = __runInitializers(this, _instanceExtraInitializers);
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        /**
         * Références aux éléments du DOM interne.
         *
         * @remarks
         * Injecté automatiquement par le décorateur {@link UI}.
         * Fournit un accès typé à l'input checkbox natif, aux slots de contenu
         * et aux éléments d'état de validation.
         *
         * @internal
         */
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #checked_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _checked_initializers, false));
        //#endregion Private Fields
        //#region Public Fields
        /**
         * Indique si le checkbox est coché.
         *
         * @remarks
         * Contrôle l'état de sélection du checkbox.
         *
         * @defaultValue `false`
         */
        get checked() { return this.#checked_accessor_storage; }
        set checked(value) { this.#checked_accessor_storage = value; }
        #name_accessor_storage = (__runInitializers(this, _checked_extraInitializers), __runInitializers(this, _name_initializers, undefined));
        /**
         * Le nom du checkbox pour les formulaires.
         *
         * @remarks
         * Permet d'identifier le champ lors de la soumission du formulaire.
         *
         * @defaultValue `undefined`
         */
        get name() { return this.#name_accessor_storage; }
        set name(value) { this.#name_accessor_storage = value; }
        #value_accessor_storage = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _value_initializers, 'on'));
        /**
         * La valeur associée au checkbox.
         *
         * @remarks
         * Cette valeur est envoyée lors de la soumission du formulaire si le checkbox est coché.
         *
         * @defaultValue `'on'`
         */
        get value() { return this.#value_accessor_storage; }
        set value(value) { this.#value_accessor_storage = value; }
        #disabled_accessor_storage = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _disabled_initializers, false));
        /**
         * Indique si le checkbox est désactivé.
         *
         * @remarks
         * Un checkbox désactivé ne peut pas être sélectionné ni recevoir le focus.
         *
         * @defaultValue `false`
         */
        get disabled() { return this.#disabled_accessor_storage; }
        set disabled(value) { this.#disabled_accessor_storage = value; }
        #required_accessor_storage = (__runInitializers(this, _disabled_extraInitializers), __runInitializers(this, _required_initializers, false));
        /**
         * Indique si le checkbox est obligatoire.
         *
         * @remarks
         * Un checkbox obligatoire doit être coché pour que le formulaire soit valide.
         *
         * @defaultValue `false`
         */
        get required() { return this.#required_accessor_storage; }
        set required(value) { this.#required_accessor_storage = value; }
        #helper_accessor_storage = (__runInitializers(this, _required_extraInitializers), __runInitializers(this, _helper_initializers, false));
        /**
         * Active le mode d'aide visuelle.
         *
         * @remarks
         * Lorsque activé, ajoute l'état `helper` au composant pour un rendu visuel spécifique.
         *
         * @defaultValue `false`
         */
        get helper() { return this.#helper_accessor_storage; }
        set helper(value) { this.#helper_accessor_storage = value; }
        #_legend_accessor_storage = (__runInitializers(this, _helper_extraInitializers), __runInitializers(this, _private__legend_initializers, undefined));
        /**
         * Texte de la légende principale du checkbox.
         *
         * @remarks
         * Stocke le contenu textuel provenant de l'attribut `data-legend`.
         * Utilisé pour initialiser le slot de légende si défini.
         *
         * @defaultValue `undefined`
         * @internal
         */
        get #_legend() { return _private__legend_descriptor.get.call(this); }
        set #_legend(value) { return _private__legend_descriptor.set.call(this, value); }
        #_hint_accessor_storage = (__runInitializers(this, _private__legend_extraInitializers), __runInitializers(this, _private__hint_initializers, undefined));
        /**
         * Texte de l'indice/aide du checkbox.
         *
         * @remarks
         * Stocke le contenu textuel provenant de l'attribut `data-hint`.
         * Utilisé pour initialiser le slot d'indice si défini.
         *
         * @defaultValue `undefined`
         * @internal
         */
        get #_hint() { return _private__hint_descriptor.get.call(this); }
        set #_hint(value) { return _private__hint_descriptor.set.call(this, value); }
        #oncheckedchange_accessor_storage = (__runInitializers(this, _private__hint_extraInitializers), __runInitializers(this, _oncheckedchange_initializers, void 0));
        /**
         * Événement personnalisé déclenché lors du changement d'état coché.
         *
         * @remarks
         * Initialisé par {@link OnCheckedChangeInitializer} via le décorateur {@link Listener}.
         * Permet de s'abonner aux changements d'état du checkbox.
         */
        get oncheckedchange() { return this.#oncheckedchange_accessor_storage; }
        set oncheckedchange(value) { this.#oncheckedchange_accessor_storage = value; }
        //#endregion Public Fields
        //#region Lifecycle
        /**
         * Constructeur du composant HTMLBnumCheckbox.
         *
         * @remarks
         * Initialise l'instance du composant en appelant le constructeur parent.
         */
        constructor() {
            super();
            __runInitializers(this, _oncheckedchange_extraInitializers);
        }
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
        _p_preload() {
            this.#_initState = !!(this.checked || false);
        }
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
        _p_attach() {
            this.#_init().#_sync().#_checkLabel().#_ifOnErrorSet();
            if (this.helper)
                this._p_addState(ATTRIBUTE_HELPER);
        }
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
        _p_update(name, oldVal, newVal) {
            if (newVal === EMPTY_STRING)
                newVal = ARIA_TRUE;
            if (oldVal === newVal)
                return;
            switch (name) {
                case ATTRIBUTE_CHECKED:
                    if (this.#_ui.input.checked !== this.checked) {
                        this.#_ui.input.checked = this.checked;
                        this.#_ui.input.setAttribute(ARIA_CHECKED, String(this.checked));
                    }
                    break;
                case ATTRIBUTE_HELPER:
                    if (newVal)
                        this._p_addState(ATTRIBUTE_HELPER);
                    else
                        this._p_removeState(ATTRIBUTE_HELPER);
                    break;
                default:
                    if (newVal)
                        this.#_ui.input.setAttribute(name, newVal);
                    else
                        this.#_ui.input.removeAttribute(name);
                    break;
            }
        }
        /**
         * Effectue les opérations post-flush du composant.
         *
         * @remarks
         * Vérifie l'état d'erreur et resynchronise les attributs après un flush.
         *
         * @protected
         * @override
         */
        _p_postFlush() {
            this.#_ifOnErrorSet().#_sync();
        }
        /**
         * Callback de réinitialisation du formulaire.
         *
         * @remarks
         * Restaure l'état coché initial du checkbox lorsque le formulaire est réinitialisé.
         */
        formResetCallback() {
            this.checked = this.#_initState;
        }
        /**
         * Active ou désactive le champ selon l'état du fieldset parent.
         *
         * @param disabled - `true` pour désactiver, `false` pour activer
         */
        formDisabledCallback(disabled) {
            this.disabled = disabled;
        }
        /**
         * Met à jour l'état coché du checkbox et déclenche l'événement de changement.
         *
         * @param checked - L'état coché à définir
         *
         * @remarks
         * Cette méthode est utilisée en interne pour mettre à jour l'état coché
         * et déclencher l'événement de changement correspondant.
         */
        updateCheckedAndFire(checked) {
            this.checked = checked;
            this.#_change(new Event('change'));
        }
        //#endregion Lifecycle
        //#region Public Methods
        /**
         * Vérifie la validité du checkbox sans afficher de message.
         *
         * @returns `true` si le checkbox est valide, `false` sinon
         *
         * @remarks
         * Délègue la vérification à l'input natif sous-jacent.
         * En cas d'erreur, retourne `true` par défaut.
         */
        checkValidity() {
            return this.#_checkValidity().unwrapOr(true);
        }
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
        reportValidity() {
            return this.#_reportValidity().unwrapOr(true);
        }
        //#endregion Public Methods
        //#region Private Methods
        /**
         * Vérifie la validité de l'input natif sans rapport.
         *
         * @returns Un {@link Result} contenant le résultat de la vérification
         *
         * @private
         */
        get #_checkValidity() { return _private__checkValidity_descriptor.value; }
        /**
         * Vérifie la validité de l'input natif avec rapport.
         *
         * @returns Un {@link Result} contenant le résultat de la vérification
         *
         * @private
         */
        get #_reportValidity() { return _private__reportValidity_descriptor.value; }
        /**
         * Initialise les données internes du composant.
         *
         * @returns L'instance courante pour chaînage de méthodes
         *
         * @remarks
         * Initialise les données des slots de légende et d'indice,
         * puis configure les écouteurs d'événements.
         *
         * @private
         */
        #_init() {
            return this.#_initDataLegend().#_initDataHint().#_setListeners();
        }
        /**
         * Initialise le slot de légende avec la donnée correspondante.
         *
         * @returns L'instance courante pour chaînage
         *
         * @private
         */
        #_initDataLegend() {
            return this.#_initData(this.#_legend, this.#_ui.slotLegend);
        }
        /**
         * Initialise le slot d'indice avec la donnée correspondante.
         *
         * @returns L'instance courante pour chaînage
         *
         * @private
         */
        #_initDataHint() {
            return this.#_initData(this.#_hint, this.#_ui.slotHint);
        }
        /**
         * Initialise un slot avec une donnée textuelle.
         *
         * @param data - La donnée textuelle à insérer dans le slot
         * @param slot - Le slot cible dans lequel insérer la donnée
         * @returns L'instance courante pour chaînage
         *
         * @remarks
         * N'affecte le slot que si la donnée est définie et non vide.
         *
         * @private
         */
        #_initData(data, slot) {
            if (data)
                slot.textContent = data;
            return this;
        }
        /**
         * Configure tous les écouteurs d'événements du composant.
         *
         * @returns L'instance courante pour chaînage
         *
         * @remarks
         * Actuellement configure uniquement l'écouteur de changement de l'input interne.
         *
         * @private
         */
        #_setListeners() {
            return this.#_listenChange();
        }
        /**
         * Configure l'écouteur d'événement pour les changements de l'input interne.
         *
         * @returns L'instance courante pour chaînage
         *
         * @remarks
         * Écoute l'événement `change` de l'input natif et déclenche
         * la méthode {@link #_change} pour propager le changement.
         *
         * @private
         */
        #_listenChange() {
            this.#_ui.input.addEventListener(EVENT_CHANGE$2, e => {
                this.#_change(e);
            });
            return this;
        }
        /**
         * Traite le changement d'état du checkbox et déclenche l'événement personnalisé.
         *
         * @param event - L'événement natif de changement
         * @returns Les détails de l'événement contenant la référence à l'instance
         *
         * @remarks
         * Met à jour la propriété `checked` à partir de l'input natif,
         * puis retourne les détails nécessaires au décorateur {@link Fire}
         * pour dispatcher l'événement `change`.
         *
         * @fires CustomEvent<BnumCheckBoxDetail>
         * @private
         */
        get #_change() { return _private__change_descriptor.value; }
        /**
         * Vérifie et applique l'état d'erreur si nécessaire.
         *
         * @returns L'instance courante pour chaînage
         *
         * @remarks
         * Si la validation échoue, applique l'état d'erreur via {@link #_setOnError}.
         * Si la validation réussit et que l'état d'erreur est actif,
         * le supprime et réinitialise la validité.
         *
         * @private
         */
        #_ifOnErrorSet() {
            if (!this.checkValidity()) {
                this.#_setOnError();
            }
            else if (this._p_hasState(STATE_ERROR)) {
                this._p_removeStates([STATE_STATE, STATE_ERROR]).#_setValidity();
                this.#_ui.input.removeAttribute(ARIA_INVALID);
            }
            return this;
        }
        /**
         * Applique l'état d'erreur au composant.
         *
         * @remarks
         * Configure l'icône d'erreur, met à jour le texte de validité,
         * ajoute les états internes `state` et `error`, et positionne
         * l'attribut ARIA `aria-invalid` à `true`.
         *
         * Si le texte de validation natif n'est pas disponible, utilise
         * le message par défaut {@link DEFAULT_VALIDITY_MESSAGE}.
         *
         * @private
         */
        #_setOnError() {
            if (this.#_ui.icon.icon !== BnumSwitchIcon.ERROR)
                this.#_ui.icon.icon = BnumSwitchIcon.ERROR;
            this.#_setText()
                .tapError(() => {
                this.#_ui.validityText.textContent = DEFAULT_VALIDITY_MESSAGE;
            })
                .andThen(() => this.#_setInternalError());
            this._p_addStates(STATE_STATE, STATE_ERROR);
            this.#_ui.input.setAttribute(ARIA_INVALID, ARIA_TRUE);
        }
        /**
         * Met à jour le texte de validité à partir du message natif de l'input.
         *
         * @returns Un {@link Result} indiquant le succès de l'opération
         *
         * @remarks
         * Ne met à jour le texte que si il diffère du message de validation courant.
         *
         * @private
         */
        get #_setText() { return _private__setText_descriptor.value; }
        /**
         * Propage l'état de validité de l'input natif vers les internals du composant.
         *
         * @returns Un {@link Result} indiquant le succès de l'opération
         *
         * @remarks
         * Utilise l'API `ElementInternals.setValidity` pour synchroniser
         * la validité du composant avec celle de l'input natif sous-jacent.
         *
         * @private
         */
        get #_setInternalError() { return _private__setInternalError_descriptor.value; }
        /**
         * Réinitialise la validité du composant.
         *
         * @returns Un {@link Result} indiquant le succès de l'opération
         *
         * @remarks
         * Supprime l'état d'erreur des internals lorsque le checkbox redevient valide.
         *
         * @private
         */
        get #_setValidity() { return _private__setValidity_descriptor.value; }
        /**
         * Synchronise les attributs entre l'élément hôte et l'input interne.
         *
         * @returns L'instance courante pour chaînage
         *
         * @remarks
         * Parcourt tous les {@link SYNCED_ATTRIBUTES} et applique leurs valeurs à l'input.
         * Cas particulier : l'attribut `checked` est traité en tant que propriété booléenne.
         * Après la synchronisation des attributs, met à jour les attributs ARIA.
         *
         * @private
         */
        #_sync() {
            for (const attr of SYNCED_ATTRIBUTES) {
                if (attr === ATTRIBUTE_CHECKED) {
                    this.#_ui.input.checked = this.checked;
                }
                else {
                    if (this.hasAttribute(attr)) {
                        this.#_ui.input.setAttribute(attr, this.getAttribute(attr));
                    }
                    else
                        this.#_ui.input.removeAttribute(attr);
                }
            }
            this.#_syncAria();
            return this;
        }
        /**
         * Synchronise les attributs ARIA du composant avec l'input interne.
         *
         * @remarks
         * Met à jour les attributs `aria-checked`, `aria-required`, `aria-disabled`
         * et `aria-describedby` en fonction de l'état courant du composant.
         *
         * L'attribut `aria-describedby` est composé dynamiquement à partir
         * des éléments d'aide et de validité présents.
         *
         * @private
         */
        #_syncAria() {
            const input = this.#_ui.input;
            input.setAttribute(ARIA_CHECKED, String(this.checked));
            if (this.required)
                input.setAttribute(ARIA_REQUIRED, ARIA_TRUE);
            else
                input.removeAttribute(ARIA_REQUIRED);
            if (this.disabled)
                input.setAttribute(ARIA_DISABLED, ARIA_TRUE);
            else
                input.removeAttribute(ARIA_DISABLED);
            const descriptions = [];
            if (this.#_ui.slotHint.assignedNodes().length > 0)
                descriptions.push(ID_HINT$1);
            if (this.#_ui.validityText.textContent)
                descriptions.push(ID_VALIDITY_TEXT);
            if (descriptions.length > 0)
                input.setAttribute(ARIA_DESCRIBEDBY, descriptions.join(' '));
            else
                input.removeAttribute(ARIA_DESCRIBEDBY);
        }
        /**
         * Vérifie la présence d'un label accessible et affiche un avertissement sinon.
         *
         * @returns L'instance courante pour chaînage
         *
         * @remarks
         * Vérifie si une légende ou un indice est disponible pour le composant.
         * Si aucun texte accessible n'est trouvé, émet un avertissement dans la console.
         *
         * @private
         */
        #_checkLabel() {
            const hasLabel = this.#_verifyLabel();
            if (!hasLabel) {
                Log.warn(LOG_TAG, WARN_NO_LABEL);
            }
            return this;
        }
        /**
         * Vérifie si au moins une source de label est disponible.
         *
         * @returns `true` si une légende ou un indice existe, `false` sinon
         *
         * @private
         */
        #_verifyLabel() {
            return this.#_verifyLegend() || this.#_verifyHint();
        }
        /**
         * Vérifie la présence d'une légende.
         *
         * @returns `true` si une légende est définie ou si des éléments enfants existent
         *
         * @private
         */
        #_verifyLegend() {
            return this.#_verifyData(this.#_legend);
        }
        /**
         * Vérifie la présence d'un indice.
         *
         * @returns `true` si un indice est défini ou si des éléments slottés existent
         *
         * @private
         */
        #_verifyHint() {
            return this.#_verifyData(this.#_hint, ID_HINT$1);
        }
        /**
         * Vérifie la disponibilité d'une donnée ou d'éléments enfants associés.
         *
         * @param data - La donnée textuelle à vérifier
         * @param slotName - Le nom du slot à inspecter (null pour le slot par défaut)
         * @returns `true` si la donnée est définie ou si des éléments enfants existent
         *
         * @private
         */
        #_verifyData(data, slotName = null) {
            const hasData = !!data;
            const hasElements = this.#_verifyElements(slotName);
            return hasData || hasElements;
        }
        /**
         * Vérifie la présence d'éléments enfants dans un slot donné.
         *
         * @param slotName - Le nom du slot à inspecter (null pour les enfants sans slot)
         * @returns `true` si au moins un élément est trouvé
         *
         * @private
         */
        #_verifyElements(slotName) {
            const iterator = this.#_getVerifyElements(slotName);
            return !iterator.next().done;
        }
        /**
         * Générateur produisant les éléments enfants d'un slot donné.
         *
         * @param slotName - Le nom du slot à inspecter (null pour les enfants sans slot)
         * @yields Les éléments enfants correspondant au critère de slot
         *
         * @remarks
         * Si un nom de slot est fourni, retourne les éléments ayant l'attribut `slot` correspondant.
         * Sinon, retourne les éléments enfants sans attribut `slot` et les nœuds texte non vides.
         *
         * @private
         */
        *#_getVerifyElements(slotName) {
            if (slotName)
                yield* Array.from(this.querySelectorAll(`[slot="${slotName}"]`));
            else {
                const nodes = [...Array.from(this.childNodes)];
                for (const node of nodes) {
                    if (node instanceof HTMLElement) {
                        if (!node.hasAttribute('slot'))
                            yield node;
                    }
                    else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
                        yield node;
                }
            }
        }
        //#endregion Private Methods
        //#region Static Methods
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
        static _p_observedAttributes() {
            return [
                ...super._p_observedAttributes(),
                ...SYNCED_ATTRIBUTES,
                ATTRIBUTE_HELPER,
            ];
        }
        /**
         * Indique que ce composant peut être associé à un formulaire.
         *
         * @remarks
         * Permet au composant de participer au cycle de vie des formulaires HTML,
         * notamment la soumission, la validation et la réinitialisation.
         *
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals#instance_properties | ElementInternals}
         */
        static get formAssociated() {
            return true;
        }
    });
    return _classThis;
})();

var css_248z$c = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{background-color:var(--bnum-card-item-background-color,var(--bnum-color-surface,#f6f6f7));cursor:var(--bnum-card-item-cursor,pointer);display:var(--bnum-card-item-display,block);padding:var(--bnum-card-item-padding,15px);user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;width:calc(var(--bnum-card-item-width-percent, 100%) - var(--bnum-card-item-width-modifier, 30px))}:host(:hover){background-color:var(--bnum-card-item-background-color-hover,var(--bnum-color-surface-hover,#eaeaea))}:host(:active){background-color:var(--bnum-card-item-background-color-active,var(--bnum-color-surface-active,#dfdfdf))}:host(:disabled),:host(:state(disabled)),:host([disabled]){cursor:not-allowed;opacity:.6;pointer-events:none}";

/**
 * Rendu du template de l'item de carte.
 * @param childTemplate Le template du contenu de l'item.
 * @param options Les options de rendu.
 * @returns Le template de l'item de carte.
 */
function render(childTemplate, options) {
    const { defaultSlot = true, slotName = EMPTY_STRING } = options || {};
    const attrs = { id: 'defaultslot' };
    if (slotName)
        attrs['name'] = slotName;
    const slot = defaultSlot ? h("slot", { ...attrs }) : EMPTY_STRING;
    return slot + childTemplate;
}
/**
 * Indique qu'on utilise le slot par défaut.
 */
const DEFAULT = EMPTY_STRING;
/**
 * Indique qu'on n'utilise pas le slot par défaut.
 */
const NO_DEFAULT = { defaultSlot: false };

/**
 * Initialise le gestionnaire de clic pour un item de carte.
 * @param event L'événement JsEvent à déclencher.
 * @param instance L'instance de BnumElement sur laquelle écouter le clic.
 */
function onItemClickedInitializer(event, instance) {
    instance.addEventListener('click', e => {
        if (event.haveEvents())
            event.call(e);
    });
}

//#region Global constants
const ATTRIBUTE_DISABLED = 'disabled';
const STATE_DISABLED$1 = 'disabled';
const ROLE = 'listitem';
//#endregion Global constants
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
 * @attr {boolean | 'disabled' | undefined} (optional) disabled - Indique si l'item est désactivé
 *
 * @event {MouseEvent} click - Déclenché lors du clic sur l'item
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
let HTMLBnumCardItem = (() => {
    let _classDecorators = [Define({ tag: TAG_CARD_ITEM, styles: css_248z$c, template: render(DEFAULT) }), UpdateAll(), Observe('disabled')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let _onitemclicked_decorators;
    let _onitemclicked_initializers = [];
    let _onitemclicked_extraInitializers = [];
    let __p_attach_decorators;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _onitemclicked_decorators = [Listener(onItemClickedInitializer)];
            __p_attach_decorators = [SetAttr('role', ROLE)];
            __esDecorate(this, null, _onitemclicked_decorators, { kind: "accessor", name: "onitemclicked", static: false, private: false, access: { has: obj => "onitemclicked" in obj, get: obj => obj.onitemclicked, set: (obj, value) => { obj.onitemclicked = value; } }, metadata: _metadata }, _onitemclicked_initializers, _onitemclicked_extraInitializers);
            __esDecorate(this, null, __p_attach_decorators, { kind: "method", name: "_p_attach", static: false, private: false, access: { has: obj => "_p_attach" in obj, get: obj => obj._p_attach }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Fields
        /**
         * Slot par défaut contenant le contenu de l'item.
         * @protected
         */
        _p_slot = (__runInitializers(this, _instanceExtraInitializers), null);
        #onitemclicked_accessor_storage = __runInitializers(this, _onitemclicked_initializers, void 0);
        /**
         * Événement déclenché lors du clic sur l'item.
         */
        get onitemclicked() { return this.#onitemclicked_accessor_storage; }
        set onitemclicked(value) { this.#onitemclicked_accessor_storage = value; }
        //#endregion Fields
        //#region Lifecycle
        /**
         * Constructeur du composant.
         * Initialise l'instance de l'élément.
         */
        constructor() {
            super();
            __runInitializers(this, _onitemclicked_extraInitializers);
        }
        /**
         * Construit le DOM interne du composant.
         * Récupère le slot par défaut.
         * @param container ShadowRoot ou HTMLElement contenant le DOM.
         * @protected
         */
        _p_buildDOM(container) {
            this._p_slot = container.queryId('defaultslot');
        }
        /**
         * Méthode appelée lors de l'attachement du composant au DOM.
         * Définit le rôle ARIA et met à jour l'état du bouton.
         * @protected
         */
        _p_attach() {
            super._p_attach();
            HTMLBnumButton.ToButton(this)._p_update();
        }
        /**
         * Met à jour le rendu du composant.
         * @protected
         */
        _p_update() {
            this._p_render();
        }
        //#endregion Lifecycle
        //#region Protected methods
        /**
         * Gère le rendu et les états du composant.
         * Met à jour l'attribut `aria-disabled` et l'état visuel.
         * @protected
         */
        _p_render() {
            this._p_clearStates();
            if (this.hasAttribute(ATTRIBUTE_DISABLED)) {
                this.setAttribute('aria-disabled', 'true');
                this._p_addState(STATE_DISABLED$1);
            }
            else
                this.removeAttribute('aria-disabled');
        }
    });
    return _classThis;
})();

var css_248z$b = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.bold{font-weight:var(--bnum-card-item-agenda-date-bold,var(--bnum-font-weight-bold,bold))}.bold-500{font-weight:var(--bnum-card-item-agenda-date-bold-medium,var(--bnum-font-weight-medium,500))}:host{display:flex;flex-direction:column;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));position:relative}:host .bnum-card-item-agenda-horizontal{display:flex;flex-direction:row;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));justify-content:space-between}:host .bnum-card-item-agenda-vertical{display:flex;flex:1;flex-direction:column;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));min-width:0}:host .bnum-card-item-agenda-block{display:flex;flex:1;flex-direction:row;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));min-width:0}:host .bnum-card-item-agenda-hour{border-bottom:var(--bnum-card-item-agenda-date-border-bottom,none);border-left:var(--bnum-card-item-agenda-date-border-left,none);border-right:var(--bnum-card-item-agenda-date-border-right,var(--bnum-border-surface,solid 4px #000091));border-top:var(--bnum-card-item-agenda-date-border-top,none);display:flex;flex-direction:column;flex-shrink:0;gap:var(--bnum-card-item-agenda-gap,var(--bnum-space-s,10px));padding:var(--bnum-card-item-agenda-padding-top-hour,0) var(--bnum-card-item-agenda-padding-right-hour,var(--bnum-space-s,10px)) var(--bnum-card-item-agenda-padding-bottom-hour,0) var(--bnum-card-item-agenda-padding-left-hour,0)}:host .bnum-card-item-agenda-location{font-size:var(--bnum-card-item-agenda-location-font-size,var(--bnum-font-size-xs,.75rem))}:host .bnum-card-item-agenda-location{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host .bnum-card-item-agenda-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host [hidden]{display:none}:host(:state(private)) .bnum-card-item-agenda-private-icon{position:absolute;right:var(--bnum-card-item-agenda-private-icon-right,10px);top:var(--bnum-card-item-agenda-private-icon-top,10px)}:host(:state(all-day)) .bnum-card-item-agenda-hour .bnum-card-item-agenda-all-day{margin-bottom:auto;margin-top:auto}:host(:state(mode-telework)){font-style:var(--bnum-card-item-agenda-telework-font-style,italic)}:host(:state(mode-telework)):before{bottom:var(--bnum-card-item-agenda-telework-icon-bottom,10px);content:var(--bnum-card-item-agenda-telework-icon-content,\"\\e88a\");font-family:var(--bnum-card-item-agenda-telework-icon-font-family,var(--bnum-icon-font-family,\"Material Symbols Outlined\"));font-size:var(--bnum-card-item-agenda-telework-icon-font-size,var(--bnum-font-size-xxl,1.5rem));font-style:normal;position:absolute;right:var(--bnum-card-item-agenda-telework-icon-right,10px)}:host(:state(mode-telework):state(action)) .bnum-card-item-agenda-action{margin-right:var(--bnum-card-item-agenda-telework-action-margin-right,20px)}";

//CLASS
const CLASS_DAY = 'bnum-card-item-agenda-day';
const CLASS_HORIZONTAL = 'bnum-card-item-agenda-horizontal';
const CLASS_BLOCK = 'bnum-card-item-agenda-block';
const CLASS_HOUR = 'bnum-card-item-agenda-hour';
const CLASS_VERTICAL = 'bnum-card-item-agenda-vertical';
const CLASS_TITLE = 'bnum-card-item-agenda-title';
const CLASS_TITLE_OVERRIDE = 'bnum-card-item-agenda-title-override';
const CLASS_LOCATION = 'bnum-card-item-agenda-location';
const CLASS_LOCATION_OVERRIDE = 'bnum-card-item-agenda-location-override';
const CLASS_ACTION = 'bnum-card-item-agenda-action';
const CLASS_ACTION_OVERRIDE = 'bnum-card-item-agenda-action-override';
const CLASS_PRIVATE_ICON = 'bnum-card-item-agenda-private-icon';
const CLASS_ALL_DAY = 'bnum-card-item-agenda-all-day';
//ATTRIBUTES
const ATTRIBUTE_ALL_DAY = 'all-day';
const ATTRIBUTE_PRIVATE = 'private';
const ATTRIBUTE_MODE$1 = 'mode';
const ATTRIBUTE_DATA_TITLE = 'data-title';
const ATTRIBUTE_DATA_LOCATION = 'data-location';
// SLOTS
const SLOT_TITLE$1 = 'title';
const SLOT_LOCATION = 'location';
const SLOT_ACTION = 'action';
// ETATS
const STATE_ALL_DAY = 'all-day';
const STATE_PRIVATE = 'private';
const STATE_MODE_PREFIX = 'mode-';
const STATE_NO_LOCATION = 'no-location';
const STATE_ACTION_DEFINED = 'action';

//#region Global Constants
const SHEET$1 = HTMLBnumCardItem.ConstructCSSStyleSheet(css_248z$b);
/** Format par défaut pour la date (ex: 2024-01-01) */
const FORMAT_DATE_DEFAULT = 'yyyy-MM-dd';
/** Format par défaut pour la date et l'heure (ex: 2024-01-01 08:00:00) */
const FORMAT_DATE_TIME_DEFAULT = 'yyyy-MM-dd HH:mm';
/** Format par défaut pour l'heure (ex: 08:00) */
const FORMAT_HOUR_DEFAULT = 'HH:mm';
/** Format pour l'heure si le jour est différent (ex: 20/11) */
const FORMAT_HOUR_DIFF_DAY = 'dd/MM';
/** Texte pour "Aujourd'hui" (localisé) */
const FORMAT_TODAY = BnumConfig.Get('local_keys').today;
/** Texte pour "Demain" (localisé) */
const FORMAT_TOMORROW = BnumConfig.Get('local_keys').tomorrow;
/** Format pour la date d'événement (ex: lundi 20 novembre) */
const FORMAT_EVENT_DATE = 'EEEE dd MMMM';
const ICON_PRIVATE = 'lock';
/** Texte affiché pour "toute la journée" (localisé) */
const TEXT_ALL_DAY = BnumConfig.Get('local_keys').day;
/** Attribut d'état interne pour la gestion du rendu différé */
const ATTRIBUTE_PENDING = 'agenda_all';
/** Mode par défaut */
const MODE_DEFAULT = 'default';
/** Symbole pour la réinitialisation interne */
const SYMBOL_RESET$3 = Symbol('reset');
//#endregion Global Constants
//#region Template
const AGENDA = (h(HTMLBnumFragment, { children: [h("span", { class: CLASS_DAY + ' bold' }), h("div", { class: CLASS_HORIZONTAL, children: [h("div", { class: CLASS_BLOCK, children: [h("span", { class: CLASS_HOUR + ' bold' }), h("div", { class: CLASS_VERTICAL, children: [h("span", { class: CLASS_TITLE + ' bold-500', children: [h("slot", { id: SLOT_TITLE$1, name: SLOT_TITLE$1 }), h("div", { class: CLASS_TITLE_OVERRIDE, hidden: true })] }), h("span", { class: CLASS_LOCATION, children: [h("slot", { id: SLOT_LOCATION, name: SLOT_LOCATION }), h("div", { class: CLASS_LOCATION_OVERRIDE, hidden: true })] })] })] }), h("span", { class: CLASS_ACTION, children: [h("slot", { id: SLOT_ACTION, name: SLOT_ACTION }), h("div", { class: CLASS_ACTION_OVERRIDE, hidden: true })] })] }), h(HTMLBnumIcon, { class: CLASS_PRIVATE_ICON, hidden: true, children: ICON_PRIVATE })] }));
//#endregion Template
/**
 * Item de carte agenda
 *
 * @structure Initalisation basique
 * <bnum-card-item-agenda
 * data-date="2024-01-01"
 * data-start-date="2024-01-01 08:00:00"
 * data-end-date="2024-01-01 10:00:00"
 * data-title="Réunion de projet"
 * data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 *
 * @structure Exemple avec des dates de départs et fin différentes du jour de base
 * <bnum-card-item-agenda
 * data-date="2025-11-20"
 * data-start-date="2025-10-20 09:40:00"
 * data-end-date="2025-12-20 10:10:00"
 * data-title="Réunion de projet"
 * data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 *
 * @structure Exemple de journée entière
 * <bnum-card-item-agenda all-day
 * data-date="2025-11-21"
 * data-title="Télétravail"
 * data-location="A la maison">
 * </bnum-card-item-agenda>
 *
 *
 * @structure Exemple avec des slots
 * <bnum-card-item-agenda
 * data-date="2025-11-20"
 * data-start-date="2025-11-20 09:40:00"
 * data-end-date="2025-11-20 10:10:00">
 * <span slot="title">Réunion de projet avec l'équipe marketing</span>
 * <span slot="location">Salle de conférence, Bâtiment A</span>
 * <bnum-primary-button slot="action" rounded data-icon='video_camera_front' data-icon-margin="0" onclick="alert('Action déclenchée !')"></bnum-primary-button>
 * </bnum-card-item-agenda>
 *
 * @structure Exemple de journée privée
 * <bnum-card-item-agenda all-day private
 * data-date="2025-11-21"
 * data-title="Télétravail"
 * data-location="A la maison">
 * </bnum-card-item-agenda>
 *
 * @structure Exemple de journée avec un mode
 * <bnum-card-item-agenda all-day mode="telework"
 * data-date="2025-11-21"
 * data-title="Télétravail"
 * data-location="A la maison">
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
 * @attr {boolean | string | undefined} (optional) (default: undefined) all-day - Indique si l'événement dure toute la journée
 * @attr {boolean | string | undefined} (optional) (default: undefined) private - Indique si l'événement est privé
 * @attr {string | undefined} (optional) (default: undefined) mode - Indique le mode de l'événement et permet des affichages visuels (custom ou non) en fonction de celui-ci. Créer l'état CSS `mode-X`.
 * @attr {string | undefined} (optional) (default: undefined) data-title - Titre de l'événement
 * @attr {string | undefined} (optional) (default: undefined) data-location - Lieu de l'événement
 * @attr {string | undefined} data-date - Date de base de l'événement
 * @attr {string | undefined} (optional) (default: yyyy-MM-dd) data-date-format - Format de la date de base de l'événement
 * @attr {string | undefined} data-start-date - Date de début de l'événement
 * @attr {string | undefined} (optional) (default: yyyy-MM-dd HH:mm:ss) data-start-date-format - Format de la date de début de l'événement
 * @attr {string | undefined} data-end-date - Date de fin de l'événement
 * @attr {string | undefined} (optional) (default: yyyy-MM-dd HH:mm:ss) data-end-date-format - Format de la date de fin de l'événement
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
let HTMLBnumCardItemAgenda = (() => {
    var _HTMLBnumCardItemAgenda__TryGetAgendaDate, _HTMLBnumCardItemAgenda__tryGetAgendaDates;
    let _classDecorators = [Define({
            tag: TAG_CARD_ITEM_AGENDA,
            template: render(AGENDA, NO_DEFAULT),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumCardItem;
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _onstartdefineaction_decorators;
    let _onstartdefineaction_initializers = [];
    let _onstartdefineaction_extraInitializers = [];
    let _private__baseDate_decorators;
    let _private__baseDate_initializers = [];
    let _private__baseDate_extraInitializers = [];
    let _private__baseDate_descriptor;
    let _private__baseDateFormat_decorators;
    let _private__baseDateFormat_initializers = [];
    let _private__baseDateFormat_extraInitializers = [];
    let _private__baseDateFormat_descriptor;
    let _private__startDate_decorators;
    let _private__startDate_initializers = [];
    let _private__startDate_extraInitializers = [];
    let _private__startDate_descriptor;
    let _private__startDateFormat_decorators;
    let _private__startDateFormat_initializers = [];
    let _private__startDateFormat_extraInitializers = [];
    let _private__startDateFormat_descriptor;
    let _private__endDate_decorators;
    let _private__endDate_initializers = [];
    let _private__endDate_extraInitializers = [];
    let _private__endDate_descriptor;
    let _private__endDateFormat_decorators;
    let _private__endDateFormat_initializers = [];
    let _private__endDateFormat_extraInitializers = [];
    let _private__endDateFormat_descriptor;
    let _private__title_decorators;
    let _private__title_initializers = [];
    let _private__title_extraInitializers = [];
    let _private__title_descriptor;
    let _private__location_decorators;
    let _private__location_initializers = [];
    let _private__location_extraInitializers = [];
    let _private__location_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static { __setFunctionName(this, "HTMLBnumCardItemAgenda"); }
        static { _HTMLBnumCardItemAgenda__TryGetAgendaDate = function _HTMLBnumCardItemAgenda__TryGetAgendaDate(val, selector) {
            return typeof val === 'string'
                ? new Date(val)
                : val?.toDate
                    ? val.toDate()
                    : (selector?.(val) ?? new Date('Date invalide'));
        }, _HTMLBnumCardItemAgenda__tryGetAgendaDates = function _HTMLBnumCardItemAgenda__tryGetAgendaDates(...options) {
            return options.map(option => __classPrivateFieldGet(this, _classThis, "m", _HTMLBnumCardItemAgenda__TryGetAgendaDate).call(this, option.val, option.selector));
        }; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    slotTitle: `#${SLOT_TITLE$1}`,
                    slotLocation: `#${SLOT_LOCATION}`,
                    slotAction: `#${SLOT_ACTION}`,
                    spanDate: `.${CLASS_DAY}`,
                    spanHour: `.${CLASS_HOUR}`,
                    overrideTitle: `.${CLASS_TITLE_OVERRIDE}`,
                    overrideLocation: `.${CLASS_LOCATION_OVERRIDE}`,
                    overrideAction: `.${CLASS_ACTION_OVERRIDE}`,
                    privateIcon: `.${CLASS_PRIVATE_ICON}`,
                })];
            _onstartdefineaction_decorators = [Listener(NoInitListener, { circular: true })];
            _private__baseDate_decorators = [Data('date', NO_SETTER)];
            _private__baseDateFormat_decorators = [Data('date-format', NO_SETTER)];
            _private__startDate_decorators = [Data('start-date', NO_SETTER)];
            _private__startDateFormat_decorators = [Data('start-date-format', NO_SETTER)];
            _private__endDate_decorators = [Data('end-date', NO_SETTER)];
            _private__endDateFormat_decorators = [Data('end-date-format', NO_SETTER)];
            _private__title_decorators = [Data(NO_SETTER)];
            _private__location_decorators = [Data(NO_SETTER)];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _onstartdefineaction_decorators, { kind: "accessor", name: "onstartdefineaction", static: false, private: false, access: { has: obj => "onstartdefineaction" in obj, get: obj => obj.onstartdefineaction, set: (obj, value) => { obj.onstartdefineaction = value; } }, metadata: _metadata }, _onstartdefineaction_initializers, _onstartdefineaction_extraInitializers);
            __esDecorate(this, _private__baseDate_descriptor = { get: __setFunctionName(function () { return this.#_baseDate_accessor_storage; }, "#_baseDate", "get"), set: __setFunctionName(function (value) { this.#_baseDate_accessor_storage = value; }, "#_baseDate", "set") }, _private__baseDate_decorators, { kind: "accessor", name: "#_baseDate", static: false, private: true, access: { has: obj => #_baseDate in obj, get: obj => obj.#_baseDate, set: (obj, value) => { obj.#_baseDate = value; } }, metadata: _metadata }, _private__baseDate_initializers, _private__baseDate_extraInitializers);
            __esDecorate(this, _private__baseDateFormat_descriptor = { get: __setFunctionName(function () { return this.#_baseDateFormat_accessor_storage; }, "#_baseDateFormat", "get"), set: __setFunctionName(function (value) { this.#_baseDateFormat_accessor_storage = value; }, "#_baseDateFormat", "set") }, _private__baseDateFormat_decorators, { kind: "accessor", name: "#_baseDateFormat", static: false, private: true, access: { has: obj => #_baseDateFormat in obj, get: obj => obj.#_baseDateFormat, set: (obj, value) => { obj.#_baseDateFormat = value; } }, metadata: _metadata }, _private__baseDateFormat_initializers, _private__baseDateFormat_extraInitializers);
            __esDecorate(this, _private__startDate_descriptor = { get: __setFunctionName(function () { return this.#_startDate_accessor_storage; }, "#_startDate", "get"), set: __setFunctionName(function (value) { this.#_startDate_accessor_storage = value; }, "#_startDate", "set") }, _private__startDate_decorators, { kind: "accessor", name: "#_startDate", static: false, private: true, access: { has: obj => #_startDate in obj, get: obj => obj.#_startDate, set: (obj, value) => { obj.#_startDate = value; } }, metadata: _metadata }, _private__startDate_initializers, _private__startDate_extraInitializers);
            __esDecorate(this, _private__startDateFormat_descriptor = { get: __setFunctionName(function () { return this.#_startDateFormat_accessor_storage; }, "#_startDateFormat", "get"), set: __setFunctionName(function (value) { this.#_startDateFormat_accessor_storage = value; }, "#_startDateFormat", "set") }, _private__startDateFormat_decorators, { kind: "accessor", name: "#_startDateFormat", static: false, private: true, access: { has: obj => #_startDateFormat in obj, get: obj => obj.#_startDateFormat, set: (obj, value) => { obj.#_startDateFormat = value; } }, metadata: _metadata }, _private__startDateFormat_initializers, _private__startDateFormat_extraInitializers);
            __esDecorate(this, _private__endDate_descriptor = { get: __setFunctionName(function () { return this.#_endDate_accessor_storage; }, "#_endDate", "get"), set: __setFunctionName(function (value) { this.#_endDate_accessor_storage = value; }, "#_endDate", "set") }, _private__endDate_decorators, { kind: "accessor", name: "#_endDate", static: false, private: true, access: { has: obj => #_endDate in obj, get: obj => obj.#_endDate, set: (obj, value) => { obj.#_endDate = value; } }, metadata: _metadata }, _private__endDate_initializers, _private__endDate_extraInitializers);
            __esDecorate(this, _private__endDateFormat_descriptor = { get: __setFunctionName(function () { return this.#_endDateFormat_accessor_storage; }, "#_endDateFormat", "get"), set: __setFunctionName(function (value) { this.#_endDateFormat_accessor_storage = value; }, "#_endDateFormat", "set") }, _private__endDateFormat_decorators, { kind: "accessor", name: "#_endDateFormat", static: false, private: true, access: { has: obj => #_endDateFormat in obj, get: obj => obj.#_endDateFormat, set: (obj, value) => { obj.#_endDateFormat = value; } }, metadata: _metadata }, _private__endDateFormat_initializers, _private__endDateFormat_extraInitializers);
            __esDecorate(this, _private__title_descriptor = { get: __setFunctionName(function () { return this.#_title_accessor_storage; }, "#_title", "get"), set: __setFunctionName(function (value) { this.#_title_accessor_storage = value; }, "#_title", "set") }, _private__title_decorators, { kind: "accessor", name: "#_title", static: false, private: true, access: { has: obj => #_title in obj, get: obj => obj.#_title, set: (obj, value) => { obj.#_title = value; } }, metadata: _metadata }, _private__title_initializers, _private__title_extraInitializers);
            __esDecorate(this, _private__location_descriptor = { get: __setFunctionName(function () { return this.#_location_accessor_storage; }, "#_location", "get"), set: __setFunctionName(function (value) { this.#_location_accessor_storage = value; }, "#_location", "set") }, _private__location_decorators, { kind: "accessor", name: "#_location", static: false, private: true, access: { has: obj => #_location in obj, get: obj => obj.#_location, set: (obj, value) => { obj.#_location = value; } }, metadata: _metadata }, _private__location_initializers, _private__location_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private Fields
        #_sd = null;
        #_ed = null;
        #_bd = null;
        #_pr = null;
        #_spanAllday = null;
        #_bnumDateStart = null;
        #_bnumDateEnd = null;
        #_shedulerTitle = null;
        #_shedulerLocation = null;
        #_shedulerAction = null;
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        //#endregion
        //#region Public Fields
        //#endregion
        //#region Getters/Setters
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #onstartdefineaction_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _onstartdefineaction_initializers, void 0));
        /**
         * Événement circulaire déclenché lors de la définition de l'action.
         * Permet de personnaliser l'action affichée dans la carte agenda.
         */
        get onstartdefineaction() { return this.#onstartdefineaction_accessor_storage; }
        set onstartdefineaction(value) { this.#onstartdefineaction_accessor_storage = value; }
        #_baseDate_accessor_storage = (__runInitializers(this, _onstartdefineaction_extraInitializers), __runInitializers(this, _private__baseDate_initializers, EMPTY_STRING));
        get #_baseDate() { return _private__baseDate_descriptor.get.call(this); }
        set #_baseDate(value) { return _private__baseDate_descriptor.set.call(this, value); }
        #_baseDateFormat_accessor_storage = (__runInitializers(this, _private__baseDate_extraInitializers), __runInitializers(this, _private__baseDateFormat_initializers, FORMAT_DATE_DEFAULT));
        get #_baseDateFormat() { return _private__baseDateFormat_descriptor.get.call(this); }
        set #_baseDateFormat(value) { return _private__baseDateFormat_descriptor.set.call(this, value); }
        #_startDate_accessor_storage = (__runInitializers(this, _private__baseDateFormat_extraInitializers), __runInitializers(this, _private__startDate_initializers, EMPTY_STRING));
        get #_startDate() { return _private__startDate_descriptor.get.call(this); }
        set #_startDate(value) { return _private__startDate_descriptor.set.call(this, value); }
        #_startDateFormat_accessor_storage = (__runInitializers(this, _private__startDate_extraInitializers), __runInitializers(this, _private__startDateFormat_initializers, FORMAT_DATE_TIME_DEFAULT));
        get #_startDateFormat() { return _private__startDateFormat_descriptor.get.call(this); }
        set #_startDateFormat(value) { return _private__startDateFormat_descriptor.set.call(this, value); }
        #_endDate_accessor_storage = (__runInitializers(this, _private__startDateFormat_extraInitializers), __runInitializers(this, _private__endDate_initializers, EMPTY_STRING));
        get #_endDate() { return _private__endDate_descriptor.get.call(this); }
        set #_endDate(value) { return _private__endDate_descriptor.set.call(this, value); }
        #_endDateFormat_accessor_storage = (__runInitializers(this, _private__endDate_extraInitializers), __runInitializers(this, _private__endDateFormat_initializers, FORMAT_DATE_TIME_DEFAULT));
        get #_endDateFormat() { return _private__endDateFormat_descriptor.get.call(this); }
        set #_endDateFormat(value) { return _private__endDateFormat_descriptor.set.call(this, value); }
        #_title_accessor_storage = (__runInitializers(this, _private__endDateFormat_extraInitializers), __runInitializers(this, _private__title_initializers, null));
        get #_title() { return _private__title_descriptor.get.call(this); }
        set #_title(value) { return _private__title_descriptor.set.call(this, value); }
        #_location_accessor_storage = (__runInitializers(this, _private__title_extraInitializers), __runInitializers(this, _private__location_initializers, null));
        get #_location() { return _private__location_descriptor.get.call(this); }
        set #_location(value) { return _private__location_descriptor.set.call(this, value); }
        /**
         * Indique si l'événement dure toute la journée.
         */
        get isAllDay() {
            return this.hasAttribute(ATTRIBUTE_ALL_DAY);
        }
        /**
         * Date de base de l'événement (jour affiché).
         */
        get baseDate() {
            return (this.#_bd ??
                BnumDateUtils.parse(this.#_baseDate, this.#_baseDateFormat) ??
                new Date());
        }
        set baseDate(value) {
            if (typeof value === 'string') {
                value = BnumDateUtils.parse(value, this.#_baseDateFormat) ?? new Date();
            }
            const oldValue = this.#_bd;
            this.#_bd = value;
            this.#_bnumDateStart?.askRender?.();
            this.#_bnumDateEnd?.askRender?.();
            this._p_addPendingAttribute(ATTRIBUTE_PENDING, oldValue === null
                ? null
                : BnumDateUtils.format(oldValue, BnumDateUtils.getOptionsFromToken(this.#_baseDateFormat)), BnumDateUtils.format(value, BnumDateUtils.getOptionsFromToken(this.#_baseDateFormat)))._p_requestAttributeUpdate();
        }
        /**
         * Date de début de l'événement.
         */
        get startDate() {
            return (this.#_sd ??
                BnumDateUtils.parse(this.#_startDate, this.#_startDateFormat) ??
                new Date());
        }
        set startDate(value) {
            if (typeof value === 'string') {
                value = BnumDateUtils.parse(value, this.#_startDateFormat) ?? new Date();
            }
            const oldValue = this.#_sd;
            this.#_sd = value;
            this.#_bnumDateEnd?.askRender?.();
            this._p_addPendingAttribute(ATTRIBUTE_PENDING, oldValue === null
                ? null
                : BnumDateUtils.format(oldValue, BnumDateUtils.getOptionsFromToken(this.#_startDateFormat)), BnumDateUtils.format(value, BnumDateUtils.getOptionsFromToken(this.#_startDateFormat)))._p_requestAttributeUpdate();
        }
        /**
         * Date de fin de l'événement.
         */
        get endDate() {
            return (this.#_ed ??
                BnumDateUtils.parse(this.#_endDate, this.#_endDateFormat) ??
                new Date());
        }
        set endDate(value) {
            if (typeof value === 'string') {
                value = BnumDateUtils.parse(value, this.#_endDateFormat) ?? new Date();
            }
            const oldValue = this.#_ed;
            this.#_ed = value;
            this.#_bnumDateStart?.askRender?.();
            this._p_addPendingAttribute(ATTRIBUTE_PENDING, oldValue === null
                ? null
                : BnumDateUtils.format(oldValue, BnumDateUtils.getOptionsFromToken(this.#_endDateFormat)), BnumDateUtils.format(value, BnumDateUtils.getOptionsFromToken(this.#_endDateFormat)))._p_requestAttributeUpdate();
        }
        get private() {
            return this.#_pr ?? this.#_private;
        }
        set private(value) {
            const oldValue = this.#_pr;
            this.#_pr = value;
            this._p_addPendingAttribute(ATTRIBUTE_PENDING, JSON.stringify(oldValue), JSON.stringify(value))._p_requestAttributeUpdate();
        }
        get #_private() {
            return this.hasAttribute(ATTRIBUTE_PRIVATE);
        }
        get #_getMode() {
            return this.getAttribute(ATTRIBUTE_MODE$1) || MODE_DEFAULT;
        }
        //#endregion
        constructor() {
            super();
            __runInitializers(this, _private__location_extraInitializers);
        }
        //#region Lifecycle Hooks
        /**
         * Récupère le style CSS à appliquer au composant.
         * @returns Chaîne de style CSS à appliquer au composant.
         */
        _p_getStylesheets() {
            return [...super._p_getStylesheets(), SHEET$1];
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
            super._p_buildDOM(container);
            const dateHtml = this.#_generateDateHtml(new Date());
            this.#_ui.spanDate.appendChild(dateHtml);
            this.#_bnumDateStart = this.setHourLogic(HTMLBnumDate.Create(new Date()));
            this.#_bnumDateEnd = this.setHourLogic(HTMLBnumDate.Create(new Date()));
            this.#_spanAllday = this._p_createSpan({
                classes: [CLASS_ALL_DAY],
                child: TEXT_ALL_DAY,
            });
            this.#_spanAllday.hidden = true;
            this.#_ui.spanHour.append(this.#_bnumDateStart, this.#_bnumDateEnd, this.#_spanAllday);
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
                this.#_ui.slotTitle.appendChild(defaultTitle);
            }
            if (this.#_location) {
                const defaultLocation = document.createTextNode(this.#_location);
                this.#_ui.slotLocation.appendChild(defaultLocation);
            }
            this.#_renderDOM();
            this.#_release();
        }
        /**
         * Libère les attributs data- utilisés pour l'initialisation.
         */
        #_release() {
            void this.#_startDate;
            void this.#_endDate;
            void this.#_startDateFormat;
            void this.#_endDateFormat;
            void this.#_baseDate;
            void this.#_baseDateFormat;
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
            let createDate = true;
            this._p_addState(`${STATE_MODE_PREFIX}${this.#_getMode}`);
            // Gestion des slots
            if (this.#_isSlotLocationEmpty())
                this._p_addState(STATE_NO_LOCATION);
            // Gestion de l'action
            const eventResult = this.onstartdefineaction.call({
                location: this.#_isSlotLocationEmpty()
                    ? this.#_location || EMPTY_STRING
                    : this.#_ui.slotLocation.textContent || EMPTY_STRING,
                action: undefined,
            });
            if (eventResult.action) {
                this.updateAction(eventResult.action, { forceCall: true });
            }
            if (eventResult.action ||
                this.#_ui.overrideAction.hidden === false ||
                (this.#_ui.slotAction && this.#_ui.slotAction.children.length > 0)) {
                this._p_addState(STATE_ACTION_DEFINED);
            }
            if (this.#_ui.spanDate && this.#_ui.spanDate.children.length > 0) {
                const dateHtml = this.shadowRoot.querySelector(HTMLBnumDate.TAG);
                if (dateHtml !== null) {
                    createDate = false;
                    dateHtml.date = this.baseDate;
                }
            }
            if (createDate) {
                const dateHtml = this.#_generateDateHtml(this.baseDate);
                this.#_ui.spanDate.appendChild(dateHtml);
            }
            // Gestion de la date
            if (this.isAllDay) {
                if (this.#_bnumDateStart !== null)
                    this.#_bnumDateStart.hidden = true;
                if (this.#_bnumDateEnd !== null)
                    this.#_bnumDateEnd.hidden = true;
                if (this.#_spanAllday === null) {
                    this._p_addState(STATE_ALL_DAY);
                    const spanAllDay = this._p_createSpan({
                        classes: [CLASS_ALL_DAY],
                        child: TEXT_ALL_DAY,
                    });
                    this.#_spanAllday = spanAllDay;
                    this.#_ui.spanHour.appendChild(spanAllDay);
                }
                else
                    this.#_spanAllday.hidden = false;
            }
            else {
                if (this.#_spanAllday !== null)
                    this.#_spanAllday.hidden = true;
                if (this.#_bnumDateStart === null && this.#_bnumDateEnd === null) {
                    const htmlStartDate = this.setHourLogic(HTMLBnumDate.Create(this.startDate));
                    const htmlEndDate = this.setHourLogic(HTMLBnumDate.Create(this.endDate));
                    this.#_bnumDateStart = htmlStartDate;
                    this.#_bnumDateEnd = htmlEndDate;
                    this.#_ui.spanHour.append(htmlStartDate, htmlEndDate);
                }
                else {
                    this.#_bnumDateStart.hidden = false;
                    this.#_bnumDateEnd.hidden = false;
                    this.#_bnumDateStart.date = this.startDate;
                    this.#_bnumDateEnd.date = this.endDate;
                }
            }
            if (this.#_private) {
                this._p_addState(STATE_PRIVATE);
                if (this.#_ui.privateIcon === null) {
                    this.#_ui.privateIcon =
                        HTMLBnumIcon.Create(ICON_PRIVATE).addClass(CLASS_PRIVATE_ICON);
                    this.shadowRoot.appendChild(this.#_ui.privateIcon);
                }
                else
                    this.#_ui.privateIcon.hidden = false;
            }
            else if (this.#_ui.privateIcon)
                this.#_ui.privateIcon.hidden = true;
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
            return this.#_requestShedulerAction(SYMBOL_RESET$3);
        }
        updateTitle(element) {
            return this.#_requestShedulerTitle(element);
        }
        /**
         * Réinitialise le titre à sa valeur par défaut.
         * @returns L'instance du composant
         */
        resetTitle() {
            return this.#_requestShedulerTitle(SYMBOL_RESET$3);
        }
        updateLocation(element) {
            return this.#_requestShedulerLocation(element);
        }
        /**
         * Réinitialise le lieu à sa valeur par défaut.
         * @returns L'instance du composant
         */
        resetLocation() {
            return this.#_requestShedulerLocation(SYMBOL_RESET$3);
        }
        /**
         * Applique la logique d'affichage pour la date (aujourd'hui, demain, etc.).
         * @param element Instance HTMLBnumDate à formater
         * @returns Instance HTMLBnumDate modifiée
         */
        setDateLogic(element) {
            element.formatEvent.add(EVENT_DEFAULT, param => {
                const now = new Date();
                const date = typeof param.date === 'string'
                    ? (BnumDateUtils.parse(param.date, element.format) ??
                        param.date)
                    : param.date;
                if (BnumDateUtils.isSameDay(date, now))
                    param.date = FORMAT_TODAY;
                else if (BnumDateUtils.isSameDay(date, BnumDateUtils.addDays(now, 1)))
                    param.date = FORMAT_TOMORROW;
                else
                    // eslint-disable-next-line no-restricted-syntax
                    param.date = CapitalizeLine(BnumDateUtils.format(date, BnumDateUtils.getOptionsFromToken(FORMAT_EVENT_DATE), element.localeElement));
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
                const date = typeof param.date === 'string'
                    ? (BnumDateUtils.parse(param.date, element.format) ??
                        param.date)
                    : param.date;
                if (BnumDateUtils.isSameDay(date, this.baseDate))
                    param.date = BnumDateUtils.format(date, BnumDateUtils.getOptionsFromToken(FORMAT_HOUR_DEFAULT), element.localeElement);
                else
                    param.date = BnumDateUtils.format(date, BnumDateUtils.getOptionsFromToken(FORMAT_HOUR_DIFF_DAY), element.localeElement);
                return param;
            });
            return element;
        }
        //#endregion
        //#region Private Methods
        #_requestShedulerAction(element, { forceCall = false } = {}) {
            this.#_shedulerAction ??= new Scheduler(innerElement => this.#_updateAction(innerElement));
            if (forceCall)
                this.#_shedulerAction.call(element);
            else
                this.#_shedulerAction.schedule(element);
            return this;
        }
        #_updateAction(element) {
            if (element === SYMBOL_RESET$3) {
                this._p_removeState(STATE_ACTION_DEFINED);
                this.#_resetItem(this.#_ui.overrideAction, this.#_ui.slotAction);
                return;
            }
            this._p_addState(STATE_ACTION_DEFINED);
            this.#_ui.overrideAction.innerHTML = EMPTY_STRING;
            this.#_ui.overrideAction.appendChild(element);
            this.#_ui.slotAction.hidden = true;
            this.#_ui.overrideAction.hidden = false;
        }
        #_requestShedulerTitle(element) {
            this.#_shedulerTitle ??= new Scheduler(innerElement => this.#_updateTitle(innerElement));
            this.#_shedulerTitle.schedule(element);
            return this;
        }
        #_updateTitle(element) {
            if (element === SYMBOL_RESET$3) {
                this.#_resetItem(this.#_ui.overrideTitle, this.#_ui.slotTitle);
                return;
            }
            this.#_ui.overrideTitle.innerHTML = EMPTY_STRING;
            if (typeof element === 'string') {
                const textNode = document.createTextNode(element);
                this.#_ui.overrideTitle.appendChild(textNode);
            }
            else {
                this.#_ui.overrideTitle.appendChild(element);
            }
            this.#_ui.slotTitle.hidden = true;
            this.#_ui.overrideTitle.hidden = false;
        }
        #_requestShedulerLocation(element) {
            this.#_shedulerLocation ??= new Scheduler(innerElement => this.#_updateLocation(innerElement));
            this.#_shedulerLocation.schedule(element);
            return this;
        }
        #_updateLocation(element) {
            if (element === SYMBOL_RESET$3) {
                this.#_resetItem(this.#_ui.overrideLocation, this.#_ui.slotLocation);
                return;
            }
            this.#_ui.overrideLocation.innerHTML = EMPTY_STRING;
            if (typeof element === 'string') {
                const textNode = document.createTextNode(element);
                this.#_ui.overrideLocation.appendChild(textNode);
            }
            else {
                this.#_ui.overrideLocation.appendChild(element);
            }
            this.#_ui.slotLocation.hidden = true;
            this.#_ui.overrideLocation.hidden = false;
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
            return this.#_ui.slotLocation
                ? this.#_slotEmpty(this.#_ui.slotLocation)
                : true;
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
            const node = document.createElement(this.TAG);
            node.baseDate = baseDate;
            node.startDate = startDate;
            node.endDate = endDate;
            if (allDay)
                node.setAttribute(ATTRIBUTE_ALL_DAY, ATTRIBUTE_ALL_DAY);
            if (title)
                node.setAttribute(ATTRIBUTE_DATA_TITLE, title);
            if (location)
                node.setAttribute(ATTRIBUTE_DATA_LOCATION, location);
            if (isPrivate)
                node.setAttribute(ATTRIBUTE_PRIVATE, ATTRIBUTE_PRIVATE);
            if (mode)
                node.setAttribute(ATTRIBUTE_MODE$1, mode);
            if (action) {
                if (typeof action === 'function')
                    node.onstartdefineaction.push(action);
                else
                    node.onstartdefineaction.push(param => {
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
                ATTRIBUTE_ALL_DAY,
                ATTRIBUTE_PRIVATE,
                ATTRIBUTE_MODE$1,
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
            const [startDate, endDate] = __classPrivateFieldGet(this, _classThis, "m", _HTMLBnumCardItemAgenda__tryGetAgendaDates).call(this, {
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
    });
    return _classThis;
})();

var css_248z$a = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{align-items:center;display:flex;justify-content:space-between}:host .sender{font-family:var(--bnum-font-family-primary);font-size:var(--bnum-font-size-m);font-weight:var(--bnum-card-item-mail-font-weight-bold,var(--bnum-font-weight-bold,bold));margin-bottom:var(--bnum-card-item-mail-margin-bottom,var(--bnum-space-s,10px));max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host .subject{font-family:var(--bnum-font-family-primary);font-size:var(--bnum-font-size-s);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host(:state(read)) .sender{font-weight:var(--bnum-card-item-mail-sender-read-font-weight,initial)}:host(:state(read)) .subject{font-style:var(--bnum-card-item-mail-subject-read-font-style,italic)}";

function _baseInitializer(event, instance, eventName) {
    event.add(EVENT_DEFAULT, ((sender) => {
        instance.trigger(eventName, { caller: sender });
    }));
}
function OnSenderChangedInitializer(event, instance) {
    _baseInitializer(event, instance, 'bnum-card-item-mail:sender-changed');
}
function OnSubjectChangedInitializer(event, instance) {
    _baseInitializer(event, instance, 'bnum-card-item-mail:subject-changed');
}
function OnDateChangedInitializer(event, instance) {
    _baseInitializer(event, instance, 'bnum-card-item-mail:date-changed');
}

// events
const EVENT_SENDER_CHANGED = 'bnum-card-item-mail:sender-changed';
const EVENT_SUBJECT_CHANGED = 'bnum-card-item-mail:subject-changed';
const EVENT_DATE_CHANGED = 'bnum-card-item-mail:date-changed';
// classes
const CLASS_MAIN_CONTENT = 'main-content';
const CLASS_SENDER = 'sender';
const CLASS_SUBJECT = 'subject';
const CLASS_DATE = 'date';
// ids
const ID_SUBJECT_SLOT = 'subjectslot';
const ID_SENDER_SLOT = 'senderslot';
const ID_DATE_SLOT = 'dateslot';
const ID_DATE_ELEMENT_OVERRIDE = 'date-element-override';
// slots
const SLOT_SENDER_NAME = 'sender';
const SLOT_SUBJECT_NAME = 'subject';
const SLOT_DATE_NAME = 'date';
// parts
const PART_SENDER_OVERRIDE = 'sender-override';
const PART_SUBJECT_OVERRIDE = 'subject-override';
const PART_DATE_OVERRIDE = 'date-override';
// data
const DATA_SUBJECT = 'subject';
const DATA_SENDER = 'sender';
const DATA_DATE = 'date';
// attributes
const ATTRIBUTE_DATA_SUBJECT = `data-${DATA_SUBJECT}`;
const ATTRIBUTE_DATA_SENDER = `data-${DATA_SENDER}`;
const ATTRIBUTE_DATA_DATE = `data-${DATA_DATE}`;
const ATTRIBUTE_READ = 'read';
// states
const STATE_READ = 'read';

//#endregion Types
//#region Global Constants
const SHEET = HTMLBnumCardItem.ConstructCSSStyleSheet(css_248z$a);
const EVENTS$2 = {
    CHANGED: {
        SENDER: EVENT_SENDER_CHANGED,
        SUBJECT: EVENT_SUBJECT_CHANGED,
        DATE: EVENT_DATE_CHANGED,
    },
};
/**
 * Format d'affichage de la date pour aujourd'hui.
 */
const TODAY_FORMAT = 'HH:mm';
/**
 * Format d'affichage de la date pour les autres jours.
 */
const OTHER_DAY_FORMAT = 'dd/MM/yyyy';
/**
 * Format d'affichage de la date pour la semaine.
 */
const WEEK_FORMAT = 'E - HH:mm';
const SYMBOL_RESET$2 = Symbol('reset');
//#endregion Global Constants
//#region Template
const TEMPLATE$9 = (h(HTMLBnumFragment, { children: [h("div", { class: CLASS_MAIN_CONTENT, children: [h("div", { class: CLASS_SENDER, children: [h("slot", { id: ID_SENDER_SLOT, name: SLOT_SENDER_NAME }), h("span", { class: PART_SENDER_OVERRIDE, part: PART_SENDER_OVERRIDE, hidden: true })] }), h("div", { class: CLASS_SUBJECT, children: [h("slot", { id: ID_SUBJECT_SLOT, name: SLOT_SUBJECT_NAME }), h("span", { class: PART_SUBJECT_OVERRIDE, part: PART_SUBJECT_OVERRIDE, hidden: true })] })] }), h("div", { class: CLASS_DATE, children: [h("slot", { id: ID_DATE_SLOT, name: SLOT_DATE_NAME }), h("span", { class: PART_DATE_OVERRIDE, part: PART_DATE_OVERRIDE, hidden: true, children: h(HTMLBnumDate, { id: ID_DATE_ELEMENT_OVERRIDE }) })] })] }));
//#endregion Template
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
 * @attr {string} (optional) data-subject - Sujet du mail.
 * @attr {string} (optional) data-sender - Expéditeur du mail.
 * @attr {string} (optional) data-date - Date du mail, optionnel, mais conseillé si vous voulez la logique de formatage automatique.
 * @attr {boolean} (optional) read - Indique si le mail est lu.
 *
 * @event {CustomElement<{ caller: HTMLBnumCardItemMail }>} bnum-card-item-mail:sender-changed - Événement déclenché lors du changement de l'expéditeur du mail.
 * @event {CustomElement<{ caller: HTMLBnumCardItemMail }>} bnum-card-item-mail:subject-changed - Événement déclenché lors du changement du sujet du mail.
 * @event {CustomElement<{ caller: HTMLBnumCardItemMail }>} bnum-card-item-mail:date-changed - Événement déclenché lors du changement de la date du mail.
 *
 * @slot (default) - N'existe pas, si vous mettez du contenu en dehors des slots, ils ne seront pas affichés.
 * @slot sender - Contenu de l'expéditeur (texte ou HTML).
 * @slot subject - Contenu du sujet (texte ou HTML).
 * @slot date - Contenu de la date. /!\ Si vous passez par ce slot, la mécanique de formatage automatique de la date ne s'appliquera pas.
 */
let HTMLBnumCardItemMail = (() => {
    let _classDecorators = [Define({ tag: TAG_CARD_ITEM_MAIL, template: render(TEMPLATE$9, NO_DEFAULT) }), UpdateAll()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = HTMLBnumCardItem;
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let ___decorators;
    let ___initializers = [];
    let ___extraInitializers = [];
    let _onsubjectchanged_decorators;
    let _onsubjectchanged_initializers = [];
    let _onsubjectchanged_extraInitializers = [];
    let _onsenderchanged_decorators;
    let _onsenderchanged_initializers = [];
    let _onsenderchanged_extraInitializers = [];
    let _ondatechanged_decorators;
    let _ondatechanged_initializers = [];
    let _ondatechanged_extraInitializers = [];
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    slotSender: `#${ID_SENDER_SLOT}`,
                    slotDate: `#${ID_DATE_SLOT}`,
                    slotSubject: `#${ID_SUBJECT_SLOT}`,
                    overriderSender: `.${PART_SENDER_OVERRIDE}`,
                    overriderSubject: `.${PART_SUBJECT_OVERRIDE}`,
                    overriderDate: `.${PART_DATE_OVERRIDE}`,
                })];
            ___decorators = [Self];
            _onsubjectchanged_decorators = [Listener(OnSubjectChangedInitializer)];
            _onsenderchanged_decorators = [Listener(OnSenderChangedInitializer)];
            _ondatechanged_decorators = [Listener(OnDateChangedInitializer)];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _onsubjectchanged_decorators, { kind: "accessor", name: "onsubjectchanged", static: false, private: false, access: { has: obj => "onsubjectchanged" in obj, get: obj => obj.onsubjectchanged, set: (obj, value) => { obj.onsubjectchanged = value; } }, metadata: _metadata }, _onsubjectchanged_initializers, _onsubjectchanged_extraInitializers);
            __esDecorate(this, null, _onsenderchanged_decorators, { kind: "accessor", name: "onsenderchanged", static: false, private: false, access: { has: obj => "onsenderchanged" in obj, get: obj => obj.onsenderchanged, set: (obj, value) => { obj.onsenderchanged = value; } }, metadata: _metadata }, _onsenderchanged_initializers, _onsenderchanged_extraInitializers);
            __esDecorate(this, null, _ondatechanged_decorators, { kind: "accessor", name: "ondatechanged", static: false, private: false, access: { has: obj => "ondatechanged" in obj, get: obj => obj.ondatechanged, set: (obj, value) => { obj.ondatechanged = value; } }, metadata: _metadata }, _ondatechanged_initializers, _ondatechanged_extraInitializers);
            __esDecorate(null, null, ___decorators, { kind: "field", name: "_", static: false, private: false, access: { has: obj => "_" in obj, get: obj => obj._, set: (obj, value) => { obj._ = value; } }, metadata: _metadata }, ___initializers, ___extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
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
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        //#endregion Private fields
        //#region Getters
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        /** Référence à la classe HTMLBnumCardItemMail */
        _ = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, ___initializers, void 0));
        #onsubjectchanged_accessor_storage = (__runInitializers(this, ___extraInitializers), __runInitializers(this, _onsubjectchanged_initializers, void 0));
        /**
         * Événement déclenché lors du changement du sujet du mail.
         * Permet d'attacher des gestionnaires personnalisés au changement de sujet.
         */
        get onsubjectchanged() { return this.#onsubjectchanged_accessor_storage; }
        set onsubjectchanged(value) { this.#onsubjectchanged_accessor_storage = value; }
        #onsenderchanged_accessor_storage = (__runInitializers(this, _onsubjectchanged_extraInitializers), __runInitializers(this, _onsenderchanged_initializers, void 0));
        /**
         * Événement déclenché lors du changement de l'expéditeur du mail.
         * Permet d'attacher des gestionnaires personnalisés au changement d'expéditeur.
         */
        get onsenderchanged() { return this.#onsenderchanged_accessor_storage; }
        set onsenderchanged(value) { this.#onsenderchanged_accessor_storage = value; }
        #ondatechanged_accessor_storage = (__runInitializers(this, _onsenderchanged_extraInitializers), __runInitializers(this, _ondatechanged_initializers, void 0));
        /**
         * Événement déclenché lors du changement de la date du mail.
         * Permet d'attacher des gestionnaires personnalisés au changement de date.
         */
        get ondatechanged() { return this.#ondatechanged_accessor_storage; }
        set ondatechanged(value) { this.#ondatechanged_accessor_storage = value; }
        /**
         * Retourne l'élément HTMLBnumDate pour l'override de la date.
         *
         * Initialise la variable si elle n'a pas encore été initialisée.
         */
        get #_lazyDateOverrideElement() {
            return (this.#_dateOverrideElement ??= (() => {
                const existingDateElement = this.#_queryById(this.#_ui.overriderDate, ID_DATE_ELEMENT_OVERRIDE);
                this.#_configureDateElement(existingDateElement);
                return existingDateElement;
            })());
        }
        // --- Getters pour lire les data-attributs ---
        /**
         * Retourne la date du mail, en tenant compte de l'override si présent.
         */
        get date() {
            return this.#_ui.overriderDate?.hidden === false
                ? this.#_lazyDateOverrideElement.getDate()
                : (this.#_defaultDate?.getDate?.() ?? new Date());
        }
        /**
         * Retourne le sujet du mail depuis l'attribut data.
         */
        get #_mailSubject() {
            return this.data(DATA_SUBJECT) || EMPTY_STRING;
        }
        /**
         * Retourne la date du mail depuis l'attribut data.
         */
        get #_mailDate() {
            return this.data(DATA_DATE) || EMPTY_STRING;
        }
        /**
         * Retourne l'expéditeur du mail depuis l'attribut data.
         */
        get #_mailSender() {
            return this.data(DATA_SENDER) || EMPTY_STRING;
        }
        //#endregion Getters
        //#region Lifecycle
        /**
         * Constructeur du composant.
         */
        constructor() {
            super();
            __runInitializers(this, _ondatechanged_extraInitializers);
        }
        /**
         * Crée le layout du Shadow DOM (avec slots ET overrides).
         * @param container Le conteneur du Shadow DOM ou un élément HTML.
         */
        _p_buildDOM(container) {
            super._p_buildDOM(container);
            // On écrase _p_slot car dans notre template, il n'y a pas de slot par défaut
            this._p_slot = container.queryId(ID_SUBJECT_SLOT);
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
                this.#_ui.slotSender.appendChild(this._p_createTextNode(this.#_mailSender));
            if (this.#_mailDate !== EMPTY_STRING) {
                // Crée l'élément DATE par défaut
                const defaultDate = HTMLBnumDate.Create(this.#_mailDate);
                this.#_configureDateElement(defaultDate); // Applique la logique
                this.#_ui.slotDate.appendChild(defaultDate);
                this.#_defaultDate = defaultDate;
            }
        }
        /**
         * Retourne les stylesheets à appliquer au composant.
         * @returns Liste des CSSStyleSheet à appliquer.
         */
        _p_getStylesheets() {
            return [...super._p_getStylesheets(), SHEET];
        }
        /**
         * Méthode appelée lors de la mise à jour d'un attribut observé.
         * @param name Nom de l'attribut.
         * @param oldVal Ancienne valeur.
         * @param newVal Nouvelle valeur.
         */
        _p_update() {
            super._p_update();
            if (this.hasAttribute(ATTRIBUTE_READ))
                this._p_addState(STATE_READ);
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
            return this.#_requestUpdateSender(SYMBOL_RESET$2);
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
            return this.#_requestUpdateSubject(SYMBOL_RESET$2);
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
            return this.#_requestUpdateDate(SYMBOL_RESET$2);
        }
        //#endregion Public methods
        //#region Private methods
        /**
         * Met à jour l'affichage de l'expéditeur (slot ou override).
         * @param content Contenu à afficher ou symbole de reset.
         */
        #_updateSender(content) {
            if (!this.#_ui.overriderSender || !this.#_ui.slotSender)
                return;
            if (content === SYMBOL_RESET$2) {
                this.#_ui.slotSender.hidden = false;
                this.#_ui.overriderSender.hidden = true;
            }
            else {
                if (typeof content === 'string')
                    this.#_ui.overriderSender.innerHTML = content;
                else
                    this.#_ui.overriderSender.replaceChildren(content);
                // On cache le slot, on montre l'override
                this.#_ui.slotSender.hidden = true;
                this.#_ui.overriderSender.hidden = false;
            }
            this.onsenderchanged.call(this);
        }
        /**
         * Planifie la mise à jour de l'expéditeur.
         * @param content Contenu à afficher ou symbole de reset.
         * @returns L'instance courante pour chaînage.
         */
        #_requestUpdateSender(content) {
            (this.#_senderScheduler ??= new Scheduler(value => this.#_updateSender(value))).schedule(content);
            return this;
        }
        /**
         * Met à jour l'affichage du sujet (slot ou override).
         * @param content Contenu à afficher ou symbole de reset.
         */
        #_updateSubject(content) {
            if (!this.#_ui.overriderSubject || !this.#_ui.slotSubject)
                return;
            if (content === SYMBOL_RESET$2) {
                this.#_ui.slotSubject.hidden = false;
                this.#_ui.overriderSubject.hidden = true;
            }
            else if (typeof content === 'string')
                this.#_ui.overriderSubject.innerHTML = content;
            else
                this.#_ui.overriderSubject.replaceChildren(content);
            // On cache le slot, on montre l'override
            this.#_ui.slotSubject.hidden = true;
            this.#_ui.overriderSubject.hidden = false;
            this.onsubjectchanged.call(this);
        }
        /**
         * Planifie la mise à jour du sujet.
         * @param content Contenu à afficher ou symbole de reset.
         * @returns L'instance courante pour chaînage.
         */
        #_requestUpdateSubject(content) {
            (this.#_subjectScheduler ??= new Scheduler(value => this.#_updateSubject(value))).schedule(content);
            return this;
        }
        /**
         * Met à jour l'affichage de la date (slot ou override).
         * @param content Contenu à afficher ou symbole de reset.
         */
        #_updateDate(content) {
            if (!this.#_ui.overriderDate || !this.#_ui.slotDate)
                return;
            if (content === SYMBOL_RESET$2) {
                this.#_ui.slotDate.hidden = false;
                this.#_ui.overriderDate.hidden = true;
            }
            else {
                if (typeof content === 'string' || content instanceof Date)
                    this.#_lazyDateOverrideElement.setDate(content);
                else
                    this.#_lazyDateOverrideElement.setDate(content.getDate());
                this.#_ui.slotDate.hidden = true;
                this.#_ui.overriderDate.hidden = false;
            }
            this.ondatechanged.call(this);
        }
        /**
         * Planifie la mise à jour de la date.
         * @param content Contenu à afficher ou symbole de reset.
         * @returns L'instance courante pour chaînage.
         */
        #_requestUpdateDate(content) {
            (this.#_dateScheduler ??= new Scheduler(value => this.#_updateDate(value))).schedule(content);
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
         * Configure le format d'affichage de la date selon la logique métier :
         * - Affiche l'heure si la date est aujourd'hui.
         * - Affiche le jour et l'heure si la date est comprise entre hier et il y a 7 jours.
         * - Sinon, conserve le format par défaut.
         * @param element Instance de HTMLBnumDate à configurer.
         */
        #_configureDateElement(element) {
            this._.SetDateLogique(element);
        }
        //#endregion Private methods
        //#region Static methods
        /**
         * Applique la logique de formatage de date à un élément HTMLBnumDate.
         * @param element Élément HTMLBnumDate à configurer.
         */
        static SetDateLogique(element) {
            element.formatEvent.add(EVENT_DEFAULT, param => {
                const originalDate = element.getDate();
                if (!originalDate)
                    return param;
                if (BnumDateUtils.isToday(originalDate)) {
                    return {
                        date: BnumDateUtils.format(originalDate, BnumDateUtils.getOptionsFromToken(TODAY_FORMAT), element.localeElement),
                    };
                }
                const now = new Date();
                const startOfInterval = BnumDateUtils.startOfDay(BnumDateUtils.subDays(now, 7));
                const endOfInterval = BnumDateUtils.endOfDay(BnumDateUtils.subDays(now, 1));
                if (BnumDateUtils.isWithinInterval(originalDate, {
                    start: startOfInterval,
                    end: endOfInterval,
                })) {
                    return {
                        date: BnumDateUtils.format(originalDate, BnumDateUtils.getOptionsFromToken(WEEK_FORMAT), element.localeElement),
                    };
                }
                return {
                    date: BnumDateUtils.format(originalDate, BnumDateUtils.getOptionsFromToken(OTHER_DAY_FORMAT), element.localeElement), // Format par défaut si aucune condition n'est remplie
                };
            });
        }
        static _p_observedAttributes() {
            return [...super._p_observedAttributes(), ATTRIBUTE_READ];
        }
        /**
         * Crée une nouvelle instance du composant avec les valeurs fournies.
         * @param subject Sujet du mail.
         * @param sender Expéditeur du mail.
         * @param date Date du mail
         * @returns Instance HTMLBnumCardItemMail.
         */
        static Create(subject, sender, date) {
            const node = document.createElement(this.TAG);
            node.attr(ATTRIBUTE_DATA_SUBJECT, subject);
            node.attr(ATTRIBUTE_DATA_SENDER, sender);
            if (typeof date === 'string')
                node.attr(ATTRIBUTE_DATA_DATE, date);
            else
                node.attr(ATTRIBUTE_DATA_DATE, date.toISOString());
            return node;
        }
        static get EVENTS_AVAILABLES() {
            return EVENTS$2;
        }
    });
    return _classThis;
})();

var css_248z$9 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{padding:var(--bnum-space-s,10px)}:host ::slotted([role=listitem]){border-bottom:var(--bnum-border-in-surface,solid 1px #ddd)}:host ::slotted([role=listitem]:last-child){border-bottom:none}:host ::slotted([hidden]),:host [hidden]{display:none}";

//#region Global Constants
const SYMBOL_RESET$1 = Symbol('reset');
//#endregion Global Constants
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
let HTMLBnumCardList = (() => {
    let _classDecorators = [Define({ tag: TAG_CARD_LIST, styles: css_248z$9 })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElement;
    let _instanceExtraInitializers = [];
    let __p_buildDOM_decorators;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __p_buildDOM_decorators = [SetAttr('role', 'list')];
            __esDecorate(this, null, __p_buildDOM_decorators, { kind: "method", name: "_p_buildDOM", static: false, private: false, access: { has: obj => "_p_buildDOM" in obj, get: obj => obj._p_buildDOM }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        /**
         * Ordonnanceur de modifications de la liste.
         */
        #_modifierScheduler = (__runInitializers(this, _instanceExtraInitializers), null);
        //#endregion Private fields
        //#region Lifecycle
        /**
         * Constructeur de la liste de cartes.
         */
        constructor() {
            super();
        }
        /**
         * Construit le DOM interne du composant.
         * @param container Racine du shadow DOM ou élément HTML
         */
        _p_buildDOM(container) {
            super._p_buildDOM(container);
            container.appendChild(this._p_createSlot());
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
            return this.#_requestModifier(SYMBOL_RESET$1);
        }
        //#endregion Public methods
        //#region  Private methods
        #_requestModifier(items) {
            (this.#_modifierScheduler ??= new SchedulerArray(values => this.#_modifier(values), SYMBOL_RESET$1)).schedule(items);
            return this;
        }
        #_modifier(items) {
            if (items === SYMBOL_RESET$1) {
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
            const node = document.createElement(this.TAG);
            if (items && items.length > 0) {
                node.add(...items.filter((item) => item !== null));
            }
            return node;
        }
    });
    return _classThis;
})();

var css_248z$8 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host a{align-items:var(--bnum-card-title-align-items,center);display:var(--bnum-card-title-display,flex);gap:var(--bnum-card-title-gap,var(--bnum-space-s,10px))}:host(:state(url)) a{color:var(--a-color,var(--bnum-text-primary,#000));-webkit-text-decoration:var(--a-text-decoration,none);text-decoration:var(--a-text-decoration,none)}:host(:state(url)) a:hover{color:var(--a-hover-color,var(--bnum-text-primary,#000));-webkit-text-decoration:var(--a-hover-text-decoration,underline);text-decoration:var(--a-hover-text-decoration,underline)}h2{font-size:var(--bnum-card-title-font-size,var(--bnum-font-size-h6,1.25rem));margin:var(--bnum-card-title-margin,0)}";

//#region Global Constants
const ATTRIBUTE_URL = 'url';
const ATTRIBUTE_DATA_ICON = 'icon';
const SLOT_NAME_ICON = 'icon';
const CLASS_LINK = 'card-title-link';
const STATE_URL = 'url';
const STATE_WITHOUT_URL = 'without-url';
const CLASS_ICON_TITLE = 'card-icon-title';
const ID_SLOT_ICON = 'sloticon';
const ID_SLOT_TEXT = 'mainslot';
const ID_CUSTOM_BODY = 'custombody';
//#endregion Global Constants
//#region Template
const TEMPLATE$8 = (h("h2", { children: h("a", { class: CLASS_LINK, children: [h("span", { class: "container", children: [h("slot", { id: ID_SLOT_ICON, name: SLOT_NAME_ICON }), h(HTMLBnumIcon, { class: CLASS_ICON_TITLE, hidden: true })] }), h("span", { class: "container", children: [h("slot", { id: ID_SLOT_TEXT }), h("span", { id: ID_CUSTOM_BODY, hidden: true })] })] }) }));
//#endregion Template
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
 * <bnum-icon slot="icon">drive_folder_upload</bnum-icon>
 * Titre de la carte
 * </bnum-card-title>
 *
 * @state url - Actif lorsque le titre contient un lien.
 * @state without-url - Actif lorsque le titre ne contient pas de lien.
 *
 * @slot (default) - Titre de la carte (texte ou HTML)
 * @slot icon - Icône personnalisée à afficher avant le titre. Note: si une icône est définie via l'attribut `data-icon` ou via la propriété `icon`, ce slot sera ignoré.
 *
 * @attr {string | null} (optional) url - URL du lien du titre de la carte
 * @attr {string | null} (optional) data-icon - Nom de l'icône (Material Symbols) à afficher avant le titre
 *
 * @cssvar {flex} --bnum-card-title-display - Définit le mode d'affichage du titre de la carte.
 * @cssvar {center} --bnum-card-title-align-items - Définit l'alignement vertical des éléments dans le titre de la carte.
 * @cssvar {var(--bnum-space-s, 10px)} --bnum-card-title-gap - Définit l'espacement entre l'icône et le texte du titre.
 */
let HTMLBnumCardTitle = (() => {
    let _classDecorators = [Define({ tag: TAG_CARD_TITLE, styles: css_248z$8, template: TEMPLATE$8 }), UpdateAll(), Observe(ATTRIBUTE_URL)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _url_decorators;
    let _url_initializers = [];
    let _url_extraInitializers = [];
    let _private__updateDOM_decorators;
    let _private__updateDOM_descriptor;
    var HTMLBnumCardTitle = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    slotIcon: `#${ID_SLOT_ICON}`,
                    slotText: `#${ID_SLOT_TEXT}`,
                    customBody: `#${ID_CUSTOM_BODY}`,
                    link: `.${CLASS_LINK}`,
                    icon: `.${CLASS_ICON_TITLE}`,
                })];
            _url_decorators = [Attr()];
            _private__updateDOM_decorators = [Schedule()];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _url_decorators, { kind: "accessor", name: "url", static: false, private: false, access: { has: obj => "url" in obj, get: obj => obj.url, set: (obj, value) => { obj.url = value; } }, metadata: _metadata }, _url_initializers, _url_extraInitializers);
            __esDecorate(this, _private__updateDOM_descriptor = { value: __setFunctionName(function () {
                    const url = this.url;
                    const icon = this.icon;
                    this._p_clearStates();
                    if (icon) {
                        this.#_ui.icon.icon = icon;
                        this.#_ui.icon.hidden = false;
                        this.#_ui.slotIcon.hidden = true;
                    }
                    else
                        this.#_ui.icon.hidden = true;
                    if (url) {
                        this.#_ui.link.href = url;
                        this._p_addState(STATE_URL);
                        this.#_ui.link.removeAttribute('role');
                        this.#_ui.link.removeAttribute('aria-disabled');
                    }
                    else {
                        this.#_ui.link.removeAttribute('href');
                        this._p_addState(STATE_WITHOUT_URL);
                    }
                }, "#_updateDOM") }, _private__updateDOM_decorators, { kind: "method", name: "#_updateDOM", static: false, private: true, access: { has: obj => #_updateDOM in obj, get: obj => obj.#_updateDOM }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HTMLBnumCardTitle = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        #_bodyScheduler = (__runInitializers(this, _instanceExtraInitializers), null);
        #_initBody = null;
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        //#endregion Private fields
        //#region Getter/Setters
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #url_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _url_initializers, null));
        /**
         * URL du lien du titre de la carte.
         */
        get url() { return this.#url_accessor_storage; }
        set url(value) { this.#url_accessor_storage = value; }
        /**
         * Obtient le nom de l'icône associée au titre de la carte.
         * @returns {string | null} Nom de l'icône ou null si aucune icône n'est définie
         */
        get icon() {
            return this.data(ATTRIBUTE_DATA_ICON);
        }
        /**
         * Définit le nom de l'icône associée au titre de la carte.
         * Met à jour le DOM pour refléter le changement.
         * @param {string | null} v Nom de l'icône ou null
         */
        set icon(v) {
            if (this.alreadyLoaded) {
                this._p_setData(ATTRIBUTE_DATA_ICON, v).#_updateDOM();
            }
            else {
                const fromAttribute = true;
                this.data(ATTRIBUTE_DATA_ICON, v, fromAttribute);
            }
        }
        //#endregion Getter/Setters
        //#region Lifecycle
        /**
         * Constructeur du composant HTMLBnumCardTitle.
         * Initialise le composant sans ajouter d'éléments DOM.
         */
        constructor() {
            super();
            __runInitializers(this, _url_extraInitializers);
        }
        /**
         * Construit le DOM du composant dans le conteneur donné.
         *
         * Ajoute l'icône, le texte et le lien selon les propriétés définies.
         */
        _p_buildDOM() {
            this.#_updateDOM();
            if (this.#_initBody) {
                this.#_updateBody(this.#_initBody);
                this.#_initBody = null;
            }
        }
        /**
         * Méthode appelée lors de la mise à jour d'un attribut observé.
         * Met à jour le DOM du composant.
         */
        _p_update() {
            if (this.alreadyLoaded)
                this.#_updateDOM();
        }
        //#endregion Lifecycle
        //#region Private methods
        /**
         * Met à jour le DOM du composant selon les propriétés actuelles.
         * Affiche ou masque l'icône et met à jour le lien si nécessaire.
         * @private
         */
        get #_updateDOM() { return _private__updateDOM_descriptor.value; }
        /**
         * Met à jour le corps du titre de la carte.
         * @param element Elément HTML, texte ou nœud Text à insérer dans le titre
         * @private
         */
        #_updateBody(element) {
            this.#_ui.customBody.hidden = false;
            this.#_ui.slotText.hidden = true;
            if (typeof element === 'string')
                this.#_ui.customBody.textContent = element;
            else
                this.#_ui.customBody.appendChild(element);
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
         * Crée dynamiquement une instance du composant HTMLBnumCardTitle.
         * Permet d'initialiser le titre avec un texte, une icône et/ou un lien.
         * @param {HTMLElement | string | Text} text Le contenu du titre (élément, texte ou chaîne)
         * @param {{ icon?: string | null; link?: string | null }} options Options pour l'icône et le lien
         * @returns {HTMLBnumCardTitle} Instance du composant configurée
         */
        static Create(text, { icon = null, link = null, }) {
            const node = document.createElement(this.TAG);
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
            const data = {};
            if (icon)
                data['data-icon'] = icon;
            if (link)
                data.url = link;
            if (data.url || data['data-icon'])
                return h(HTMLBnumCardTitle, { ...data, children: text });
            else
                return h(HTMLBnumCardTitle, { children: text });
        }
    };
    return HTMLBnumCardTitle = _classThis;
})();

/**
 * Représente un élément personnalisé de type liste de dossiers (Folder List) pour l'interface Bnum.
 * Cet élément utilise le tag HTML défini par `TAG_FOLDER_LIST` et est rendu dans le Light DOM (pas de Shadow DOM).
 */
let HTMLBnumFolderList = (() => {
    let _classDecorators = [Define({ tag: TAG_FOLDER_LIST }), Light()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElement;
    let _instanceExtraInitializers = [];
    let __p_preload_decorators;
    var HTMLBnumFolderList = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __p_preload_decorators = [SetAttr('role', 'group')];
            __esDecorate(this, null, __p_preload_decorators, { kind: "method", name: "_p_preload", static: false, private: false, access: { has: obj => "_p_preload" in obj, get: obj => obj._p_preload }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HTMLBnumFolderList = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        /**
         * Initialise une nouvelle instance du composant `HTMLBnumFolderList`.
         */
        constructor() {
            super();
            __runInitializers(this, _instanceExtraInitializers);
        }
        /**
         * Méthode de préchargement interne du composant.
         * Le décorateur `@SetAttr` applique automatiquement l'attribut HTML `role="group"`
         * à l'élément lors de son cycle de vie.
         * @protected
         * @returns
         */
        _p_preload() { }
        /**
         * Génère et retourne la structure JSX/TSX (ou chaîne de caractères) du composant `HTMLBnumFolderList`.
         * * @static
         * @param  content Le contenu (texte ou éléments enfants) à insérer à l'intérieur de la balise.
         * @param  attrs Un dictionnaire (clé-valeur) représentant les attributs HTML à appliquer au composant.
         * @returns L'élément rendu
         */
        static Write(content = EMPTY_STRING, attrs = {}) {
            if (attrs && Object.keys(attrs).length > 0)
                return h(HTMLBnumFolderList, { ...attrs, children: content });
            else
                return h(HTMLBnumFolderList, { children: content });
        }
    };
    return HTMLBnumFolderList = _classThis;
})();

var css_248z$7 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{--_local-indent:calc(var(--bnum-folder-indentation-base, 0.5em)*var(--internal-bnum-folder-level, 0));display:var(--bnum-folder-display,block);padding-left:var(--bnum-folder-indentation,var(--_local-indent));width:var(--bnum-folder-width,100%)}:host .bal-container{display:flex;justify-content:space-between;padding:var(--bnum-folder-title-padding,10px 15px);transition:background-color .2s ease}:host .bal-container__left,:host .bal-container__title{align-content:center;align-items:center;display:flex;gap:var(--bnum-folder-gap,var(--bnum-space-s,10px))}:host .bal-container__title__name{text-wrap:nowrap;max-width:var(--bnum-folder-text-ellipisis-max-width,125px);overflow:hidden;pointer-events:none;text-overflow:ellipsis}:host .bal-container__title__icon{color:var(--bnum-folder-icon-color,inherit);flex-shrink:0}:host bnum-badge{font-size:15px;height:calc(16px - var(--bnum-badge-padding, var(--bnum-space-xs, 5px))*2);transition:all .2s ease;width:calc(16px - var(--bnum-badge-padding, var(--bnum-space-xs, 5px))*2)}:host bnum-badge.is-cumulative{background-color:var(--bnum-color-primary-active)}:host bnum-badge:state(no-value){display:none}:host([level=\"0\"]){border-bottom:var(--bnum-border-in-column)}:host([level=\"0\"]) .bal-container{padding:var(--bnum-folder-bal-title-padding,15px 15px)}:host(:state(no-subfolders)) .bal-container__toggle{display:none}:host(:state(double-digit-unread)) bnum-badge{font-size:var(--bnum-font-badge-s,.5625rem)}:host(:state(triple-digit-unread)) bnum-badge{font-size:var(--bnum-font-badge-s,.5625rem);height:calc(18px - var(--bnum-badge-padding, var(--bnum-space-xs, 5px))*2);width:calc(18px - var(--bnum-badge-padding, var(--bnum-space-xs, 5px))*2)}:host([is-collapsed=true]) .bal-sub-folders{display:none}:host([is-virtual=false]){cursor:pointer}:host([is-virtual=false]) .bal-container__title__name{pointer-events:all}:host([is-virtual=false]:hover) .bal-container{background-color:var(--bnum-color-list-hover)}:host([is-selected=true]) .bal-container{background-color:var(--bnum-color-list);cursor:default}:host([is-selected=true]:hover) .bal-container{background-color:var(--bnum-color-list)}:host(.dragover) .bal-container{background-color:var(--bnum-color-list-drag)}";

//type: consts
// Attributes
const ATTR_IS_COLLAPSED = 'is-collapsed';
const ATTR_IS_VIRTUAL = 'is-virtual';
const ATTR_IS_SELECTED = 'is-selected';
const ATTR_UNREAD = 'unread';
const ATTR_LEVEL = 'level';
const ATTR_LABEL = 'label';
const ATTR_ICON = 'icon';
const ATTR_ROLE = 'role';
// Events
const EVENT_CLICK$1 = 'click';
const EVENT_UNREAD_CHANGED = 'bnum-folder:unread-changed';
const EVENT_SELECT = 'bnum-folder:select';
const EVENT_TOGGLE = 'bnum-folder:toggle';
// Classes
const CLASS_CONTAINER = 'bal-container';
const CLASS_TITLE_ICON = 'bal-container__title__icon';
const CLASS_LEFT_BADGE = 'bal-container__left__badge';
const CLASS_TOGGLE = 'bal-container__toggle';
const CLASS_IS_CUMULATIVE = 'is-cumulative';
// IDs
const ID_NAME = 'bal-name';
// States
const STATE_NO_SUBFOLDERS = 'no-subfolders';
const STATE_TRIPLE_DIGIT = 'triple-digit-unread';
const STATE_DOUBLE_DIGIT = 'double-digit-unread';
const STATE_SINGLE_DIGIT = 'single-digit-unread';
const STATE_NO_UNREAD = 'no-unread';
// Values & Configs
const VAL_MIN_UNREAD = 0;
const VAL_MAX_UNREAD = 99;
const VAL_TRUE = 'true';
const VAL_FALSE = 'false';
const VAL_99_PLUS = `${VAL_MAX_UNREAD}+`;
const VAL_ROLE_TREEITEM = 'treeitem';
const ARIA_EXPANDED = 'aria-expanded';
const ARIA_SELECTED = 'aria-selected';
const CSS_VAR_LEVEL = '--internal-bnum-folder-level';
const ICON_ARROW_DOWN = 'keyboard_arrow_down';
const ICON_ARROW_UP = 'keyboard_arrow_up';

//#region Template
const TEMPLATE$7 = (h(HTMLBnumFragment, { children: [h("div", { class: "bal-container", children: [h("div", { class: "bal-container__title", children: [h(HTMLBnumIcon, { class: "bal-container__title__icon", children: "square" }), h("a", { tabindex: "-1", id: "bal-name", class: "bal-container__title__name" })] }), h("div", { class: "bal-container__left", children: [h(HTMLBnumBadge, { circle: true, class: "bal-container__left__badge", children: "0" }), h(HTMLBnumButtonIcon, { tabindex: "-1", class: "bal-container__toggle flex", children: "keyboard_arrow_down" })] })] }), h(HTMLBnumFolderList, { class: "bal-sub-folders", children: h("slot", { name: "folders" }) })] }));
//#endregion Template
/**
 * Composant Web Component représentant un dossier dans une structure arborescente.
 * Gère l'affichage hiérarchique, les badges de notification (non-lus), la sélection et l'état d'expansion.
 *
 * @structure Base
 * <bnum-folder
 * folder-id="identifiant-unique-du-dossier"
 * id="rcmliINBOX"
 * label="Dossier Racine"
 * unread="5"
 * icon="folder"
 * level="0"
 * is-virtual="false"
 * is-collapsed="true"
 * is-selected="false"
 * >
 * </bnum-folder>
 *
 * @structure Avec de sous-dossiers
 * <bnum-tree id="rcmliTREE">
 * <bnum-folder
 * folder-id="identifiant-unique-du-dossier"
 * id="rcmliINBOX"
 * label="Dossier Racine"
 * unread="17"
 * icon="folder"
 * level="0"
 * is-virtual="true"
 * is-collapsed="true"
 * is-selected="false"
 * >
 *  <bnum-folder
 *  slot="folders"
 *  folder-id="identifiant-unique-du-dossier-sub"
 *  id="rcmliSUBFOLDER"
 *  label="Dossier enfant"
 *  unread="17"
 *  icon="folder"
 *  level="1"
 *  is-virtual="false"
 *  is-collapsed="true"
 *  is-selected="false"
 *  >
 *  </bnum-folder>
 *  <bnum-folder
 *  slot="folders"
 *  folder-id="identifiant-unique-du-dossier-sub2"
 *  id="rcmliSUBFOLDER"
 *  label="Dossier enfant 2"
 *  unread="0"
 *  icon="folder"
 *  level="1"
 *  is-virtual="false"
 *  is-collapsed="true"
 *  is-selected="false"
 *  >
 *   <bnum-folder
 *   slot="folders"
 *   folder-id="identifiant-unique-du-dossier--sub-sub2"
 *   id="rcmliSUBFOLDERSUB"
 *   label="Dossier enfant enfant"
 *   unread="0"
 *   icon="folder"
 *   level="2"
 *   is-virtual="false"
 *   is-collapsed="true"
 *   is-selected="false"
 *   >
 *   </bnum-folder>
 *  </bnum-folder>
 * </bnum-folder>
 * </bnum-tree>
 *
 *
 * @slot folders - Slot pour insérer des sous-dossiers (`bnum-folder`).
 *
 * @state no-subfolders - Indique que le dossier n'a pas de sous-dossiers.
 * @state triple-digit-unread - Indique que le compteur de non-lu est à 3 chiffres (99+).
 * @state double-digit-unread - Indique que le compteur de non-lu est à 2 chiffres (10-99).
 * @state single-digit-unread - Indique que le compteur de non-lu est à 1 chiffre (1-9).
 *
 * @extends BnumElementInternal
 * @fires bnum-folder:unread-changed - Lorsqu'un compteur de non-lu est mis à jour.
 * @fires bnum-folder:select - Lorsque le dossier est sélectionné.
 * @fires bnum-folder:toggle - Lorsque le dossier est plié ou déplié.
 *
 * @attr {boolean} (default: true) is-collapsed - Indique si le dossier est visuellement replié.
 * @attr {boolean} (default: true) is-virtual - Indique si le dossier est virtuel.
 * @attr {boolean} (default: false) is-selected - Indique si le dossier est sélectionné.
 * @attr {number} (default: 0) unread - Nombre d'éléments non lus dans le dossier.
 * @attr {number} (default: 0) level - Niveau de profondeur du dossier dans l'arborescence.
 * @attr {string} (default: /) label - Libellé (nom) du dossier.
 * @attr {string} (default: /) icon - Nom de l'icône à afficher pour le dossier.
 *
 * @event {MouseEvent} click - Déclenché lorsque le dossier est cliqué.
 * @event {UnreadChangedEventDetail} bnum-folder:unread-changed - Événement custom pour le changement de non-lu
 * @event {CustomEvent<{ caller: HTMLBnumFolder; innerEvent?: Event }>} bnum-folder:select - Événement custom pour la sélection du dossier
 * @event {CustomEvent<{ caller: HTMLBnumFolder; innerEvent?: Event; collapsed: boolean }>} bnum-folder:toggle - Événement custom pour le pliage ou dépliage du dossier
 *
 * @cssvar {0.5em} --bnum-folder-indentation-base - Unité de base pour le calcul du décalage (padding-left) par niveau de profondeur.
 * @cssvar {0} --internal-bnum-folder-level - Variable interne (pilotée par JS) indiquant le niveau de profondeur actuel.
 * @cssvar {Calculated} --bnum-folder-indentation - Valeur finale du padding-left (base * level).
 * @cssvar {block} --bnum-folder-display - Type d'affichage du composant host.
 * @cssvar {100%} --bnum-folder-width - Largeur du composant host.
 * @cssvar {10px 15px} --bnum-folder-title-padding - Espacement interne du conteneur flex (Standard : 10px vertical, 15px horizontal).
 * @cssvar {10px} --bnum-folder-gap - Espace entre l'icône, le titre et les badges.
 * @cssvar {125px} --bnum-folder-text-ellipisis-max-width - Largeur maximale du libellé avant troncation.
 * @cssvar {inherit} --bnum-folder-icon-color - Couleur de l'icône du dossier.
 * @cssvar {5px} --bnum-badge-padding - Padding interne pour réduire la taille du badge (calcul de la taille).
 * @cssvar {#2e2eff} --bnum-color-primary-active - Couleur de fond du badge en mode cumulatif (Blue Thunder Active).
 * @cssvar {solid 1px #ddd} --bnum-border-in-column - Bordure inférieure appliquée aux dossiers de niveau 0.
 * @cssvar {15px 15px} --bnum-folder-bal-title-padding - Padding spécifique pour les dossiers racines (15px vertical, 15px horizontal).
 * @cssvar {#c1c1fb} --bnum-color-list-hover - Couleur de fond au survol d'un dossier interactif (Blue List Hover).
 * @cssvar {#e3e3fd} --bnum-color-list - Couleur de fond d'un dossier sélectionné (Blue List).
 * @cssvar {#adadf9} --bnum-color-list-drag - Couleur de fond lors du dragover (Blue List Active).
 */
let HTMLBnumFolder = (() => {
    let _classDecorators = [Define({ styles: css_248z$7, template: TEMPLATE$7, tag: TAG_FOLDER }), Observe(ATTR_LABEL, ATTR_UNREAD, ATTR_ICON, ATTR_IS_COLLAPSED, ATTR_LEVEL, ATTR_IS_SELECTED)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let ___decorators;
    let ___initializers = [];
    let ___extraInitializers = [];
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    var HTMLBnumFolder = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            ___decorators = [Self];
            _private__ui_decorators = [UI({
                    name: `#${ID_NAME}`,
                    icon: `.${CLASS_TITLE_ICON}`,
                    toggle: `.${CLASS_TOGGLE}`,
                    badge: `.${CLASS_LEFT_BADGE}`,
                    container: `.${CLASS_CONTAINER}`,
                })];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(null, null, ___decorators, { kind: "field", name: "_", static: false, private: false, access: { has: obj => "_" in obj, get: obj => obj._, set: (obj, value) => { obj._ = value; } }, metadata: _metadata }, ___initializers, ___extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HTMLBnumFolder = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        /**
         * Compteur interne des éléments non lus propres à ce dossier (hors enfants).
         * @private
         * @type {number}
         */
        #_selfUnread = 0;
        //#endregion Private fields
        //#region Getters/Setters
        /** Référence à la classe HTMLBnumFolder */
        _ = __runInitializers(this, ___initializers, void 0);
        #_ui_accessor_storage = (__runInitializers(this, ___extraInitializers), __runInitializers(this, _private__ui_initializers, void 0));
        /**
         * Cache pour les éléments internes du Shadow DOM.
         * Initialisé lors de `_p_buildDOM`.
         * @private
         * @type {Ui}
         */
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        /**
         * Indique si le dossier est visuellement replié.
         * @returns {boolean} `true` si l'attribut `is-collapsed` est à 'true'.
         */
        get collapsed() {
            return this.getAttribute(ATTR_IS_COLLAPSED) === VAL_TRUE;
        }
        /**
         * Récupère la liste des classes CSS appliquées à l'élément hôte.
         * @returns {string[]} Un tableau des classes.
         */
        get classes() {
            return Array.from(this.classList);
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        /**
         * Constructeur du composant.
         */
        constructor() {
            super();
            __runInitializers(this, _private__ui_extraInitializers);
        }
        /**
         * Construit le DOM et initialise les références UI et les écouteurs d'événements internes.
         * @protected
         * @param container - Le conteneur racine.
         */
        _p_buildDOM(container) {
            super._p_buildDOM(container);
            this.#_ui.container.addEventListener(EVENT_CLICK$1, (e) => {
                this.select(e);
            });
            this.#_ui.toggle.addEventListener(EVENT_CLICK$1, (e) => {
                this.toggle(e);
            });
        }
        /**
         * Appelé lorsque le composant est attaché au DOM.
         * Initialise les états par défaut et les écouteurs globaux.
         * @protected
         */
        _p_attach() {
            super._p_attach();
            if (this.childElementCount === 0) {
                this._p_addState(STATE_NO_SUBFOLDERS);
            }
            else {
                this.addEventListener(EVENT_UNREAD_CHANGED, this.#_onChildUnreadChanged.bind(this));
            }
            if (this.hasAttribute(ATTR_IS_COLLAPSED) === false) {
                this.setAttribute(ATTR_IS_COLLAPSED, VAL_TRUE);
            }
            this.addEventListener(EVENT_SELECT, this.#_onFolderSelect.bind(this));
            // Initialisation des valeurs visuelles basées sur les attributs initiaux
            this.attr(ATTR_ROLE, VAL_ROLE_TREEITEM)
                .#_updateIcon(this.attr(ATTR_ICON) ?? EMPTY_STRING)
                .#_updateLabel(this.attr(ATTR_LABEL) ?? EMPTY_STRING)
                .#_updateLevel(this.attr(ATTR_LEVEL) ? +this.attr(ATTR_LEVEL) : 0)
                .#_updateSelected(this.attr(ATTR_IS_SELECTED) === VAL_TRUE)
                .#_updateIsCollapsed(this.attr(ATTR_IS_COLLAPSED) === VAL_TRUE)
                .#_updateUnread(this.attr(ATTR_UNREAD)
                ? +this.attr(ATTR_UNREAD)
                : VAL_MIN_UNREAD);
        }
        /**
         * Gère la mise à jour des attributs observés.
         * @protected
         * @param {string} name - Nom de l'attribut modifié.
         * @param {string | null} oldVal - Ancienne valeur.
         * @param {string | null} newVal - Nouvelle valeur.
         * @returns {void | Nullable<'break'>} Peut retourner 'break' pour arrêter la propagation.
         */
        _p_update(name, oldVal, newVal) {
            if (name === ATTR_UNREAD) {
                // On gère les dissonances visuels (badge value vs attribute value)
                oldVal = this.#_ui.badge?.value ?? oldVal;
                // Optimisation: Evite les updates de DOM coûteux si déjà en 99+
                if (this.#_shouldSkipUnreadUpdate(oldVal, newVal))
                    return;
            }
            if (oldVal === newVal)
                return;
            switch (name) {
                case ATTR_LABEL:
                    this.#_updateLabel(newVal ?? EMPTY_STRING);
                    break;
                case ATTR_UNREAD:
                    this.#_updateUnread(newVal ? +newVal : 0);
                    break;
                case ATTR_ICON:
                    this.#_updateIcon(newVal ?? EMPTY_STRING);
                    break;
                case ATTR_IS_COLLAPSED:
                    this.#_updateIsCollapsed(newVal === VAL_TRUE);
                    this.#_refreshDisplay();
                    break;
                case ATTR_LEVEL:
                    this.#_updateLevel(newVal ? +newVal : 0);
                    break;
                case ATTR_IS_SELECTED:
                    this.#_updateSelected(newVal === VAL_TRUE);
                    break;
            }
        }
        //#endregion Lifecycle
        //#region Event handlers
        /**
         * Gestionnaire d'événement pour le changement de statut "non-lu" des enfants.
         * Déclenche un rafraîchissement de l'affichage cumulatif si nécessaire.
         * @private
         * @param {Event} e - L'événement custom `UnreadChangedEventDetail`.
         */
        #_onChildUnreadChanged(e) {
            const detail = e.detail;
            // Protection contre les boucles infinies (self-trigger)
            if (detail?.caller === this)
                return;
            this.#_refreshDisplay();
        }
        /**
         * Intercepte la sélection pour empêcher l'action sur les dossiers virtuels.
         * @private
         * @param {Event} e - L'événement de sélection.
         */
        #_onFolderSelect(e) {
            if (this.getAttribute(ATTR_IS_VIRTUAL) === VAL_TRUE) {
                e.stopPropagation();
            }
        }
        //#endregion Event handlers
        //#region Private methods
        /**
         * Détermine si la mise à jour visuelle du badge doit être sautée (ex: 99+ vers 100).
         * @private
         * @param {string | null} oldVal - Ancienne valeur.
         * @param {string | null} newVal - Nouvelle valeur.
         * @returns {boolean} True si la mise à jour doit être ignorée.
         */
        #_shouldSkipUnreadUpdate(oldVal, newVal) {
            const oldNum = oldVal ? +oldVal : VAL_MIN_UNREAD;
            const newNum = newVal ? +newVal : VAL_MIN_UNREAD;
            return oldNum > VAL_MAX_UNREAD && newNum > VAL_MAX_UNREAD;
        }
        /**
         * Calcule le total des éléments non lus (Soi-même + tous les descendants).
         * @private
         * @returns {number} Le total calculé.
         */
        #_getTotalUnread() {
            let total = this.#_selfUnread;
            const descendants = this.getElementsByTagName(this._.TAG);
            for (let i = 0, len = descendants.length; i < len; i++) {
                const val = descendants[i].getAttribute(ATTR_UNREAD);
                if (val)
                    total += +val;
            }
            return total;
        }
        /**
         * Met à jour uniquement l'élément visuel (Badge) en fonction de l'état (plié/déplié).
         * Si plié, affiche le cumulatif. Si déplié, affiche le score propre.
         * @private
         */
        #_refreshDisplay() {
            if (!this.#_ui.badge)
                return;
            const isCollapsed = this.collapsed;
            const hasChildren = this.children.length > 0;
            const displayValue = isCollapsed && hasChildren ? this.#_getTotalUnread() : this.#_selfUnread;
            this.#_applyBadgeState(displayValue, isCollapsed);
        }
        /**
         * Applique l'état visuel et la valeur au badge.
         * @private
         * @param {number} value - La valeur numérique à afficher.
         * @param {boolean} isCollapsed - Si le dossier parent est replié (pour le style cumulatif).
         */
        #_applyBadgeState(value, isCollapsed) {
            const badge = this.#_ui.badge;
            let state = STATE_NO_UNREAD;
            let text = EMPTY_STRING;
            if (value > VAL_MAX_UNREAD) {
                text = VAL_99_PLUS;
                state = STATE_TRIPLE_DIGIT;
            }
            else if (value > 0) {
                text = value.toString();
                state = value > 9 ? STATE_DOUBLE_DIGIT : STATE_SINGLE_DIGIT;
            }
            if (badge.value !== text)
                badge.value = text;
            this._p_addState(state);
            const isCumulative = value !== this.#_selfUnread && isCollapsed;
            if (badge.classList.contains(CLASS_IS_CUMULATIVE) !== isCumulative) {
                badge.classList.toggle(CLASS_IS_CUMULATIVE, isCumulative);
            }
        }
        /**
         * Met à jour le libellé du dossier dans le DOM.
         * @private
         * @param {string} label - Nouveau libellé.
         * @returns {this}
         */
        #_updateLabel(label) {
            if (this.#_ui.name) {
                this.#_ui.name.textContent = label;
                this.#_ui.name.title = label;
            }
            return this;
        }
        /**
         * Met à jour la valeur interne 'non-lu' et propage l'événement.
         * @private
         * @param {number} unread - Nouvelle valeur.
         * @returns {this}
         */
        #_updateUnread(unread) {
            this.#_selfUnread = unread;
            this.#_refreshDisplay();
            if (this.alreadyLoaded) {
                this.trigger(EVENT_UNREAD_CHANGED, {
                    unread: unread,
                    caller: this,
                }, { bubbles: true, composed: true });
            }
            return this;
        }
        /**
         * Met à jour l'icône de toggle et l'attribut ARIA.
         * @private
         * @param {boolean} isCollapsed - État plié.
         * @returns {this}
         */
        #_updateIsCollapsed(isCollapsed) {
            if (this.#_ui.toggle) {
                this.#_ui.toggle.icon = isCollapsed
                    ? ICON_ARROW_DOWN
                    : ICON_ARROW_UP;
            }
            this.setAttribute(ARIA_EXPANDED, String(!isCollapsed));
            return this;
        }
        /**
         * Met à jour l'icône principale du dossier.
         * @private
         * @param {string} icon - Nom de l'icône.
         * @returns {this}
         */
        #_updateIcon(icon) {
            if (this.#_ui.icon) {
                this.#_ui.icon.icon = icon;
            }
            return this;
        }
        /**
         * Met à jour le niveau d'indentation via CSS Variable.
         * @private
         * @param {number} level - Niveau de profondeur (clamped 0-10).
         * @returns {this}
         */
        #_updateLevel(level) {
            const levelClamped = Math.max(0, Math.min(level, 10));
            this.style.setProperty(CSS_VAR_LEVEL, levelClamped.toString());
            return this;
        }
        /**
         * Met à jour l'attribut ARIA de sélection.
         * @private
         * @param {boolean} isSelected - État sélectionné.
         * @returns {this}
         */
        #_updateSelected(isSelected) {
            return this.attr(ARIA_SELECTED, isSelected.toString());
        }
        //#endregion Private methods
        //#region Public methods
        /**
         * Bascule l'état plié/déplié du dossier.
         * Met à jour l'attribut DOM et déclenche l'événement `EVENT_TOGGLE`.
         * @public
         * @param {Event} [innerEvent] - L'événement déclencheur originel (optionnel).
         * @returns {this} L'instance courante pour chaînage.
         */
        toggle(innerEvent) {
            innerEvent?.stopPropagation?.();
            const isCollapsed = this.getAttribute(ATTR_IS_COLLAPSED) === VAL_TRUE;
            this.setAttribute(ATTR_IS_COLLAPSED, isCollapsed ? VAL_FALSE : VAL_TRUE);
            this.trigger(EVENT_TOGGLE, {
                innerEvent,
                caller: this,
                collapsed: !isCollapsed,
            });
            return this;
        }
        /**
         * Sélectionne le dossier.
         * Déclenche l'événement `EVENT_SELECT`.
         * @public
         * @param {Event} [innerEvent] - L'événement déclencheur originel (optionnel).
         * @returns {this} L'instance courante pour chaînage.
         */
        select(innerEvent) {
            this.trigger(EVENT_SELECT, {
                innerEvent,
                caller: this,
            });
            return this;
        }
        //#endregion Public methods
        //#region Static methods
        /**
         * Génère la chaîne HTML statique pour ce composant (SSR / Helper).
         * @static
         * @param {Object} props - Propriétés de construction.
         * @param {Record<string, string>} [props.attributes={}] - Attributs HTML.
         * @param {string[]} [props.children=[]] - Contenu enfant.
         * @returns {string} Le HTML sous forme de chaîne.
         */
        static Write({ attributes = {}, children = [], } = {}) {
            const childrenString = children.join(EMPTY_STRING);
            if (attributes && Object.keys(attributes).length > 0)
                return h(HTMLBnumFolder, { ...attributes, children: childrenString });
            else
                return h(HTMLBnumFolder, { children: childrenString });
        }
    };
    return HTMLBnumFolder = _classThis;
})();

/**
 * Liste des points de rupture (breakpoints) gérés par le composant.
 */
const BREAKPOINTS = {
    /** Mobile */
    phone: 480,
    /** Tablette portrait */
    small: 768,
    /** Tablette paysage / Ordinateurs portables tactiles */
    touch: 1024,
    /** Bureau */
    normal: 1200,
};
/**
 * Liste des modes de masquage.
 */
const MODES = {
    /** En dessous du breakpoint */
    DOWN: 'down',
    /** Au-dessus du breakpoint */
    UP: 'up',
};
//#region Global constants
const ATTRIBUTE_BREAKPOINT = 'breakpoint';
const ATTRIBUTE_MODE = 'mode';
//#endregion Global constants
/**
 * Composant BnumHide.
 * Permet de cacher son contenu selon des points de rupture (breakpoints) définis.
 *
 * @structure Base
 * <bnum-hide breakpoint="small" mode="down">Bonjour</bnum-hide>
 *
 * @attr {'phone' | 'small' | 'touch' | 'normal'} (default:'touch') breakpoint - Le point de rupture à partir duquel cacher l'élément.
 * @attr {'up' | 'down'} (optional) (default:'down') mode - Sens du masquage : 'up' pour cacher au-dessus du breakpoint, 'down' en-dessous.
 */
let HTMLBnumHide = (() => {
    let _classDecorators = [Define({ tag: TAG_HIDE }), Light(), Observe(ATTRIBUTE_BREAKPOINT, ATTRIBUTE_MODE), UpdateAll()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let _private__handleChange_decorators;
    let _private__handleChange_descriptor;
    let _private__hide_decorators;
    let _private__hide_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__handleChange_decorators = [Autobind];
            _private__hide_decorators = [SetAttr('hidden', EMPTY_STRING)];
            __esDecorate(this, _private__handleChange_descriptor = { value: __setFunctionName(function (mq) {
                    const shouldHide = mq.matches;
                    if (shouldHide)
                        this.#_hide();
                    else
                        this.#_show();
                }, "#_handleChange") }, _private__handleChange_decorators, { kind: "method", name: "#_handleChange", static: false, private: true, access: { has: obj => #_handleChange in obj, get: obj => obj.#_handleChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__hide_descriptor = { value: __setFunctionName(function () {
                    this.style.display = 'none';
                    this.ariaHidden = 'true';
                }, "#_hide") }, _private__hide_decorators, { kind: "method", name: "#_hide", static: false, private: true, access: { has: obj => #_hide in obj, get: obj => obj.#_hide }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        /**
         * Liste de requêtes média pour le suivi du breakpoint.
         */
        #_mediaQueryList = (__runInitializers(this, _instanceExtraInitializers), null);
        /**
         * Référence liée de la fonction de gestion du changement de média pour l'abonnement/désabonnement.
         */
        #_boundHandleChange;
        //#endregion Private fields
        //#region Lifecycle
        /**
         * Initialise une nouvelle instance du composant.
         */
        constructor() {
            super();
            this.#_boundHandleChange = this.#_handleChange;
        }
        /**
         * Appelé lorsque le composant est inséré dans le DOM.
         */
        connectedCallback() {
            super.connectedCallback?.();
            this.#_setupListener();
        }
        /**
         * Appelé lorsque le composant est retiré du DOM.
         */
        disconnectedCallback() {
            this.#_removeListener();
            super.disconnectedCallback?.();
        }
        /**
         * Met à jour le composant lors d'un changement d'état ou d'attribut.
         */
        _p_update() {
            this.#_setupListener();
        }
        //#endregion Lifecycle
        //#region Private methods
        /**
         * Configure l'écouteur `matchMedia` en fonction des attributs actuels.
         */
        #_setupListener() {
            this.#_removeListener();
            const breakpointKey = (this.getAttribute(ATTRIBUTE_BREAKPOINT) || 'touch');
            const mode = (this.getAttribute(ATTRIBUTE_MODE) ||
                MODES.DOWN);
            const width = BREAKPOINTS[breakpointKey];
            if (!width) {
                console.warn(`[${TAG_HIDE}] Breakpoint inconnu : ${breakpointKey}. Utilisez: ${Object.keys(BREAKPOINTS).join(', ')}`);
                return;
            }
            const query = mode === MODES.UP
                ? `(min-width: ${width}px)`
                : `(max-width: ${width - 0.02}px)`;
            this.#_mediaQueryList = window.matchMedia(query);
            this.#_handleChange(this.#_mediaQueryList);
            this.#_mediaQueryList.addEventListener('change', this.#_boundHandleChange);
        }
        /**
         * Supprime l'écouteur des requêtes média.
         */
        #_removeListener() {
            if (this.#_mediaQueryList) {
                this.#_mediaQueryList.removeEventListener('change', this.#_boundHandleChange);
                this.#_mediaQueryList = null;
            }
        }
        /**
         * Réagit au changement de statut de la requête média.
         * Si la requête correspond, l'élément est caché.
         *
         * @param mq Objet MediaQueryList ou événement associé.
         */
        get #_handleChange() { return _private__handleChange_descriptor.value; }
        /**
         * Cache l'élément en ajoutant l'attribut `hidden` et en forçant le style CSS.
         */
        get #_hide() { return _private__hide_descriptor.value; }
        /**
         * Affiche l'élément en retirant l'attribut `hidden` et les styles forcés.
         */
        #_show() {
            this.removeAttribute('hidden');
            this.style.removeProperty('display');
            this.ariaHidden = 'false';
        }
    });
    return _classThis;
})();

var css_248z$6 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{--internal-gap:var(--bnum-radio-group-gap,var(--bnum-space-m,15px))}.group__label__group{display:flex;flex-direction:column;gap:var(--internal-gap)}:host(:state(inline)) .group__label__group{flex-direction:row}::slotted(bnum-radio){user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}";

//#endregion Types
//#region Global constants
// eslint-disable-next-line quotes
const DEFAULT_LABEL = "Perdu dans l'arbre";
const DEFAULT_HINT = EMPTY_STRING;
const ID_GROUP = 'group';
const ID_LEGEND = 'legend';
const ID_HINT = 'hint';
const DATA_INLINE = 'inline';
const STATE_INLINE = DATA_INLINE;
const ATTR_NAME = 'name';
const EVENT_CHANGE$1 = 'change';
//#endregion Global constants
//#region Template
const TEMPLATE$6 = (h(HTMLBnumFragment, { children: [h("div", { class: "group__label label-container", id: "label", children: [h("div", { class: "group__label--legend label-container--label", children: h("slot", { id: ID_LEGEND, name: "legend", children: DEFAULT_LABEL }) }), h("div", { class: "group__label--hint label-container--hint", children: h("slot", { id: ID_HINT, name: "hint", children: DEFAULT_HINT }) })] }), h("div", { id: ID_GROUP, role: "radiogroup", class: "group__label__group", "aria-describedby": "label", children: h("slot", {}) })] }));
//#endregion Template
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
let HTMLBnumRadioGroup = (() => {
    let _classDecorators = [Define({
            tag: TAG_RADIO_GROUP,
            template: TEMPLATE$6,
            styles: [INPUT_BASE_STYLE, css_248z$6],
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _staticExtraInitializers = [];
    let _instanceExtraInitializers = [];
    let _static__p_observedAttributes_decorators;
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _private__label_decorators;
    let _private__label_initializers = [];
    let _private__label_extraInitializers = [];
    let _private__label_descriptor;
    let _private__hint_decorators;
    let _private__hint_initializers = [];
    let _private__hint_extraInitializers = [];
    let _private__hint_descriptor;
    let _private__value_decorators;
    let _private__value_initializers = [];
    let _private__value_extraInitializers = [];
    let _private__value_descriptor;
    let _private__setDefaultRadioFromValue_decorators;
    let _private__setDefaultRadioFromValue_descriptor;
    let _private__listenRadioChange_decorators;
    let _private__listenRadioChange_descriptor;
    let _private__handleKeyboardNavigation_decorators;
    let _private__handleKeyboardNavigation_descriptor;
    let _private__handleRadioChange_decorators;
    let _private__handleRadioChange_descriptor;
    let _private__fireChange_decorators;
    let _private__fireChange_descriptor;
    let _private__scheduleSetupRadios_decorators;
    let _private__scheduleSetupRadios_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    group: `#${ID_GROUP}`,
                    legend: `#${ID_LEGEND}`,
                    hint: `#${ID_HINT}`,
                })];
            _name_decorators = [Attr()];
            _private__label_decorators = [Data(NO_SETTER)];
            _private__hint_decorators = [Data(NO_SETTER)];
            _private__value_decorators = [Data(NO_SETTER)];
            _private__setDefaultRadioFromValue_decorators = [Risky()];
            _private__listenRadioChange_decorators = [Listen(HTMLBnumRadio.EVENT_CHANGE, { selector: HTMLBnumRadio.TAG })];
            _private__handleKeyboardNavigation_decorators = [Listen('keydown')];
            _private__handleRadioChange_decorators = [Autobind];
            _private__fireChange_decorators = [Fire('change')];
            _private__scheduleSetupRadios_decorators = [Schedule()];
            _static__p_observedAttributes_decorators = [NonStd('Deprecated')];
            __esDecorate(this, null, _static__p_observedAttributes_decorators, { kind: "method", name: "_p_observedAttributes", static: true, private: false, access: { has: obj => "_p_observedAttributes" in obj, get: obj => obj._p_observedAttributes }, metadata: _metadata }, null, _staticExtraInitializers);
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _name_decorators, { kind: "accessor", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(this, _private__label_descriptor = { get: __setFunctionName(function () { return this.#_label_accessor_storage; }, "#_label", "get"), set: __setFunctionName(function (value) { this.#_label_accessor_storage = value; }, "#_label", "set") }, _private__label_decorators, { kind: "accessor", name: "#_label", static: false, private: true, access: { has: obj => #_label in obj, get: obj => obj.#_label, set: (obj, value) => { obj.#_label = value; } }, metadata: _metadata }, _private__label_initializers, _private__label_extraInitializers);
            __esDecorate(this, _private__hint_descriptor = { get: __setFunctionName(function () { return this.#_hint_accessor_storage; }, "#_hint", "get"), set: __setFunctionName(function (value) { this.#_hint_accessor_storage = value; }, "#_hint", "set") }, _private__hint_decorators, { kind: "accessor", name: "#_hint", static: false, private: true, access: { has: obj => #_hint in obj, get: obj => obj.#_hint, set: (obj, value) => { obj.#_hint = value; } }, metadata: _metadata }, _private__hint_initializers, _private__hint_extraInitializers);
            __esDecorate(this, _private__value_descriptor = { get: __setFunctionName(function () { return this.#_value_accessor_storage; }, "#_value", "get"), set: __setFunctionName(function (value) { this.#_value_accessor_storage = value; }, "#_value", "set") }, _private__value_decorators, { kind: "accessor", name: "#_value", static: false, private: true, access: { has: obj => #_value in obj, get: obj => obj.#_value, set: (obj, value) => { obj.#_value = value; } }, metadata: _metadata }, _private__value_initializers, _private__value_extraInitializers);
            __esDecorate(this, _private__setDefaultRadioFromValue_descriptor = { value: __setFunctionName(function () {
                    const value = this.#_value;
                    if (!value)
                        return ATresult.Ok();
                    const radio = this.radios.find(r => r.value === value);
                    if (radio) {
                        this.#_check(radio);
                        return ATresult.Ok();
                    }
                    throw new Error(`Aucun radio trouvé avec la valeur "${value}"`);
                }, "#_setDefaultRadioFromValue") }, _private__setDefaultRadioFromValue_decorators, { kind: "method", name: "#_setDefaultRadioFromValue", static: false, private: true, access: { has: obj => #_setDefaultRadioFromValue in obj, get: obj => obj.#_setDefaultRadioFromValue }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__listenRadioChange_descriptor = { value: __setFunctionName(function () {
                    return this.#_handleRadioChange;
                }, "#_listenRadioChange") }, _private__listenRadioChange_decorators, { kind: "method", name: "#_listenRadioChange", static: false, private: true, access: { has: obj => #_listenRadioChange in obj, get: obj => obj.#_listenRadioChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__handleKeyboardNavigation_descriptor = { value: __setFunctionName(function () {
                    return (e) => {
                        const isRTL = getComputedStyle(this).direction === 'rtl';
                        const KEY_NEXT = ['ArrowDown', isRTL ? 'ArrowLeft' : 'ArrowRight'];
                        const KEY_PREV = ['ArrowUp', isRTL ? 'ArrowRight' : 'ArrowLeft'];
                        const ALL_KEYS = [...KEY_NEXT, ...KEY_PREV];
                        if (!ALL_KEYS.includes(e.key))
                            return;
                        e.preventDefault();
                        const radios = this.radios;
                        if (radios.length === 0)
                            return;
                        const currentRadio = radios.find(r => r.checked);
                        const currentIndex = currentRadio ? radios.indexOf(currentRadio) : -1;
                        const direction = KEY_PREV.includes(e.key) ? -1 : 1;
                        const nextIndex = (currentIndex + direction + radios.length) % radios.length;
                        const targetRadio = radios[nextIndex];
                        if (targetRadio) {
                            this.#_check(targetRadio, { fire: true });
                            targetRadio.internalCheckbox.focus();
                        }
                    };
                }, "#_handleKeyboardNavigation") }, _private__handleKeyboardNavigation_decorators, { kind: "method", name: "#_handleKeyboardNavigation", static: false, private: true, access: { has: obj => #_handleKeyboardNavigation in obj, get: obj => obj.#_handleKeyboardNavigation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__handleRadioChange_descriptor = { value: __setFunctionName(function (e) {
                    e.stopPropagation();
                    const { innerEvent: inner } = e.detail;
                    if (inner.checked)
                        this.#_check(inner.caller).#_fireChange(inner);
                }, "#_handleRadioChange") }, _private__handleRadioChange_decorators, { kind: "method", name: "#_handleRadioChange", static: false, private: true, access: { has: obj => #_handleRadioChange in obj, get: obj => obj.#_handleRadioChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__fireChange_descriptor = { value: __setFunctionName(function (e) {
                    return { inner: e, caller: this };
                }, "#_fireChange") }, _private__fireChange_decorators, { kind: "method", name: "#_fireChange", static: false, private: true, access: { has: obj => #_fireChange in obj, get: obj => obj.#_fireChange }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__scheduleSetupRadios_descriptor = { value: __setFunctionName(function () {
                    this.#_setupRadios();
                }, "#_scheduleSetupRadios") }, _private__scheduleSetupRadios_decorators, { kind: "method", name: "#_scheduleSetupRadios", static: false, private: true, access: { has: obj => #_scheduleSetupRadios in obj, get: obj => obj.#_scheduleSetupRadios }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _staticExtraInitializers);
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        /**
         * Instance de MutationObserver pour surveiller les changements dans les enfants du groupe.
         * @private
         */
        #_observer = (__runInitializers(this, _instanceExtraInitializers), null);
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        //#endregion Private fields
        //#region Getters/Setters
        /**
         * Références aux éléments du DOM interne.
         * @private
         */
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #name_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _name_initializers, EMPTY_STRING));
        /**
         * Le nom du groupe de boutons radio.
         * Cet attribut est appliqué à tous les boutons radio enfants pour assurer qu'ils appartiennent au même groupe logique.
         */
        get name() { return this.#name_accessor_storage; }
        set name(value) { this.#name_accessor_storage = value; }
        #_label_accessor_storage = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _private__label_initializers, EMPTY_STRING));
        /**
         * Le libellé du groupe.
         * @private
         */
        get #_label() { return _private__label_descriptor.get.call(this); }
        set #_label(value) { return _private__label_descriptor.set.call(this, value); }
        #_hint_accessor_storage = (__runInitializers(this, _private__label_extraInitializers), __runInitializers(this, _private__hint_initializers, EMPTY_STRING));
        /**
         * Le texte d'indice ou d'aide pour le groupe.
         * @private
         */
        get #_hint() { return _private__hint_descriptor.get.call(this); }
        set #_hint(value) { return _private__hint_descriptor.set.call(this, value); }
        #_value_accessor_storage = (__runInitializers(this, _private__hint_extraInitializers), __runInitializers(this, _private__value_initializers, null));
        /**
         * La valeur initiale sélectionnée du groupe.
         * @private
         */
        get #_value() { return _private__value_descriptor.get.call(this); }
        set #_value(value) { return _private__value_descriptor.set.call(this, value); }
        /**
         * Indique si le groupe doit afficher ses options en ligne (horizontalement).
         *
         * @returns {boolean} `true` si le mode inline est activé, sinon `false`.
         */
        get inline() {
            return this.data(DATA_INLINE);
        }
        /**
         * Définit si le groupe doit afficher ses options en ligne.
         *
         * @param {boolean} value - La nouvelle valeur pour le mode inline.
         */
        set inline(value) {
            this.data(DATA_INLINE, value).#_setInlineState();
        }
        /**
         * Récupère la liste de tous les éléments `bnum-radio` enfants directs du groupe.
         *
         * @returns {HTMLBnumRadio[]} Un tableau contenant les éléments `HTMLBnumRadio`.
         */
        get radios() {
            return Array.from(this.querySelectorAll(HTMLBnumRadio.TAG));
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
            __runInitializers(this, _private__value_extraInitializers);
        }
        /**
         * Appelée lorsque le composant est inséré dans le DOM.
         * Initialise l'observateur de mutations pour détecter l'ajout ou la suppression de boutons radio.
         */
        connectedCallback() {
            super.connectedCallback();
            (this.#_observer ??= new MutationObserver(e => this.#_obserse(e))).observe(this, {
                childList: true,
            });
        }
        /**
         * Méthode protégée pour construire le DOM initial.
         * @protected
         */
        _p_buildDOM() {
            this.#_init();
        }
        /**
         * Méthode protégée appelée lorsqu'un attribut observé change.
         *
         * @param {string} name - Le nom de l'attribut modifié.
         * @param {string | null} oldVal - L'ancienne valeur de l'attribut.
         * @param {string | null} newVal - La nouvelle valeur de l'attribut.
         * @returns {void | Nullable<'break'>}
         * @protected
         */
        _p_update(name, oldVal, newVal) {
            if (name === ATTR_NAME && oldVal !== newVal) {
                this.#_setName();
            }
        }
        /**
         * Appelée lorsque le composant est retiré du DOM.
         * Nettoie l'observateur de mutations.
         * @protected
         */
        _p_detach() {
            this.#_observer?.disconnect?.();
        }
        //#endregion Lifecycle
        //#region Private methods
        /**
         * Initialise le composant.
         * Configure les écouteurs, les données par défaut, la valeur par défaut et les états.
         * @private
         */
        #_init() {
            return this.#_setListeners()
                .#_setDefaultData()
                .#_setDefaultValue()
                .#_initStates();
        }
        /**
         * Propage le nom du groupe à tous les boutons radio enfants.
         * @private
         */
        #_setName() {
            for (const radio of this.radios) {
                radio.name = this.name;
            }
            return this;
        }
        /**
         * Initialise le libellé (légende) du groupe dans le slot correspondant.
         * @private
         */
        #_setLegend() {
            return this.#_initData(this.#_label, this.#_ui.legend);
        }
        /**
         * Initialise l'indice (hint) du groupe dans le slot correspondant.
         * @private
         */
        #_setHint() {
            return this.#_initData(this.#_hint, this.#_ui.hint);
        }
        /**
         * Helper pour initialiser le contenu textuel d'un slot si des données sont fournies.
         * @private
         */
        #_initData(data, slot) {
            if (data)
                slot.textContent = data;
            return this;
        }
        /**
         * Initialise les états visuels du composant (ex: inline).
         * @private
         */
        #_initStates() {
            return this.#_initInline();
        }
        /**
         * Applique l'état initial pour le mode inline.
         * @private
         */
        #_initInline() {
            if (this.inline)
                this.#_setInlineState();
            return this;
        }
        /**
         * Définit les données par défaut (nom, légende, indice).
         * @private
         */
        #_setDefaultData() {
            return this.#_setName().#_setLegend().#_setHint();
        }
        /**
         * Définit la sélection initiale basée sur la valeur par défaut.
         * Si la valeur par défaut ne correspond à aucun radio, enregistre une erreur ou sélectionne le premier par défaut.
         * @private
         */
        #_setDefaultValue() {
            this.#_setDefaultRadioFromValue().match({
                Ok: () => this.#_setDefaultRadio(),
                Err: e => Log.error(this.constructor.name, e.message, e),
            });
            return this;
        }
        /**
         * Tente de définir le bouton radio sélectionné en fonction de `_value`.
         * @returns {Result<void>} Résultat de l'opération.
         * @private
         */
        get #_setDefaultRadioFromValue() { return _private__setDefaultRadioFromValue_descriptor.value; }
        /**
         * Sélectionne le premier bouton radio par défaut si aucun n'est déjà sélectionné.
         * @private
         */
        #_setDefaultRadio() {
            if (this.radios.length > 0 && !this.radios.find(x => x.checked)) {
                this.#_check(this.radios[0]);
            }
        }
        /**
         * Configure les écouteurs d'événements pour le changement de radio et la navigation clavier.
         * @private
         */
        #_setListeners() {
            this.#_listenRadioChange();
            this.#_handleKeyboardNavigation();
            return this;
        }
        /**
         * Écoute l'événement de changement d'un bouton radio enfant.
         * @private
         */
        get #_listenRadioChange() { return _private__listenRadioChange_descriptor.value; }
        /**
         * Gère la navigation au clavier (flèches directionnelles) entre les boutons radio.
         * @private
         */
        get #_handleKeyboardNavigation() { return _private__handleKeyboardNavigation_descriptor.value; }
        /**
         * Gère le changement d'état d'un bouton radio.
         * Assure qu'un seul radio est sélectionné à la fois.
         *
         * @param {CustomEvent} e - L'événement de changement.
         * @private
         */
        get #_handleRadioChange() { return _private__handleRadioChange_descriptor.value; }
        /**
         * Notifie les écouteurs externes qu'un changement de sélection a eu lieu.
         *
         * @param {BnumRadioCheckedChangeEvent} e - L'événement interne du radio.
         * @returns L'événement formaté.
         * @private
         */
        get #_fireChange() { return _private__fireChange_descriptor.value; }
        /**
         * Marque un bouton radio comme sélectionné et désélectionne les autres.
         * Met à jour les attributs `tabindex` pour la navigation clavier.
         *
         * @param {HTMLBnumRadio} radio - Le bouton radio à sélectionner.
         * @param {object} options - Options supplémentaires.
         * @param {boolean} [options.fire=false] - Si `true`, déclenche l'événement de changement sur le radio.
         * @private
         */
        #_check(radio, { fire = false } = {}) {
            for (const r of this.radios) {
                if (r !== radio) {
                    r.checked = false;
                    this.#_stopFocus(r);
                }
            }
            if (fire)
                radio.updateCheckAndFire(true);
            else
                radio.checked = true;
            this.#_canFocus(radio);
            return this;
        }
        /**
         * Fonction de rappel pour l'observateur de mutations.
         * Détecte si de nouveaux boutons radio sont ajoutés et planifie leur initialisation.
         * @private
         */
        #_obserse(mutations) {
            const hasOptionMutation = mutations.some(m => Array.from(m.addedNodes).some(n => n instanceof HTMLBnumRadio));
            if (hasOptionMutation) {
                this.#_scheduleSetupRadios();
            }
        }
        /**
         * Planifie la configuration des radios (utilisé lors de mutations dynamiques).
         * @private
         */
        get #_scheduleSetupRadios() { return _private__scheduleSetupRadios_descriptor.value; }
        /**
         * Configure l'état initial des boutons radio (nom, sélection, focus).
         * @private
         */
        #_setupRadios() {
            let hasChecked = false;
            for (const radio of this.radios) {
                if (radio.name !== this.name)
                    radio.name = this.name;
                if (radio.checked) {
                    if (!hasChecked) {
                        hasChecked = true;
                        this.#_canFocus(radio);
                    }
                    else {
                        radio.checked = false;
                        this.#_stopFocus(radio);
                    }
                }
                else
                    this.#_stopFocus(radio);
            }
            return this;
        }
        /**
         * Autorise le focus sur le radio.
         * @param radio Bouton radio concerné.
         * @returns Chaîne
         */
        #_canFocus(radio) {
            radio.setAttribute('tabindex', '0');
            return this;
        }
        /**
         * Retire le focus du radio.
         * @param radio Bouton radio concerné.
         * @returns Chaîne
         */
        #_stopFocus(radio) {
            radio.setAttribute('tabindex', '-1');
            return this;
        }
        /**
         * Applique ou retire l'état visuel "inline" sur le composant.
         * @private
         */
        #_setInlineState() {
            if (this.inline)
                this._p_addState(STATE_INLINE);
            else
                this._p_removeState(STATE_INLINE);
        }
        //#endregion Private methods
        //#region Static
        /**
         * Liste des attributs observés par le composant.
         * @returns {string[]} Liste des noms d'attributs.
         * @protected
         * @static
         * @override
         * @deprecated Utilisez le décorateur {@link Observe} du commit 3e38db0162eef596874dbe32490d9e96b09fb1c0
         * @see [feat(composants): ✨ Ajout d'un décorateur pour réduire le boilerplate des attibuts à observer](https://github.com/messagerie-melanie2/design-system-bnum/commit/3e38db0162eef596874dbe32490d9e96b09fb1c0)
         */
        static _p_observedAttributes() {
            return [ATTR_NAME];
        }
        /**
         * Evènements disponibles pour ce composant.
         * @readonly
         */
        static get EVENTS() {
            return {
                [EVENT_CHANGE$1]: EVENT_CHANGE$1,
            };
        }
    });
    return _classThis;
})();

//type: enum
//description: États internes pour bnum-segmented-item
/**
 * États possibles pour l'élément bnum-segmented-item.
 */
var States;
(function (States) {
    States["SELECTED"] = "selected";
    States["DISABLED"] = "disabled";
    States["ICON"] = "icon";
})(States || (States = {}));

var css_248z$5 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{--_internal_font_size:var(--bnum-segmented-item-font-size,var(--bnum-body-font-size,var(--bnum-font-size-m,1rem)));--_internal-background-color:var(--bnum-segmented-item-background-color,var(--bnum-color-secondary-alt,transparent));--_internal-background-color-hover:var(--bnum-segmented-item-background-color-hover,var(--bnum-color-secondary-hover,#f6f6f6));--_internal-background-color-active:var(--bnum-segmented-item-background-color-active,var(--bnum-color-secondary-active,#ededed));--_internal-background-color-selected:var(--bnum-segmented-item-background-color-selected,var(--bnum-segmented-item-background-color,var(--bnum-color-secondary,transparent)));--_internal-color-selected:var(--bnum-segmented-item-color-selected,var(--bnum-color-primary,#000091));--_internal-gap:var(--bnum-segmented-item-gap,var(--bnum-space-s,10px));--_internal-padding:var(--bnum-segmented-item-padding,var(--bnum-space-s,10px) var(--bnum-space-m,15px));--_internal-border-radius:var(--bnum-segmented-item-border-radius,var(--bnum-radius-m,5px));--_internal-border-color-active:var(--bnum-segmented-item-border-color-active,var(--bnum-color-primary,#000091));--_internal-border-shadow-active:inset 0 0 0 1px var(--_internal-border-color-active);--_internal-border-color:none;--_internal-border-shadow:none;--bnum-icon-font-size:var(--_internal_font_size);cursor:pointer;display:inline-block;font-size:var(--_internal_font_size);user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}:host .segmented-item__container{align-items:center;background-color:var(--_internal-background-color);border-radius:var(--_internal-border-radius);box-shadow:var(--_internal-border-shadow);display:inline-flex;gap:var(--_internal-gap);justify-content:center;padding:var(--_internal-padding)}:host .segmented-item__container__icon{display:none}:host(:hover){--_internal-background-color:var(--_internal-background-color-hover)}:host(:active){--_internal-background-color:var(--_internal-background-color-active)}:host(:state(selected)){--_internal-background-color:var(--_internal-background-color-selected);color:var(--_internal-color-selected);cursor:default}:host(:state(selected)) .segmented-item__container{box-shadow:var(--_internal-border-shadow-active)}:host(:state(icon)) .segmented-item__container__icon{display:inline-block}:host(:state(disabled)){cursor:not-allowed;opacity:.5;pointer-events:none}";

//#region Global constants
// --- FLAT CONSTANTS ---
// Ids
const ID_ICON = 'icon';
const ID_CONTAINER = 'container';
const ID_LABEL = 'label';
// Selectors
const SEL_ICON = `#${ID_ICON}`;
const SEL_CONTAINER = `#${ID_CONTAINER}`;
const SEL_LABEL = `#${ID_LABEL}`;
// Events
const EVT_SELECTED = 'bnum-segmented-item:selected';
const EVT_ERROR = 'bnum-segmented-item:error';
// Attributes
const ATTR_SELECTED$1 = 'selected';
const ATTR_DISABLED = 'disabled';
// States
const STATE_SELECTED = States.SELECTED;
const STATE_DISABLED = States.DISABLED;
const STATE_ICON = States.ICON;
// --- PUBLIC OBJECTS ---
/**
 * Evènements non-conventionnels
 */
const EVENTS$1 = {
    SELECTED: EVT_SELECTED,
    ERROR: EVT_ERROR,
};
//#endregion Global constants
//#region Template
const TEMPLATE$5 = (h("div", { class: "segmented-item__container", id: ID_CONTAINER, children: [h(HTMLBnumIcon, { class: "segmented-item__container__icon", id: ID_ICON }), h("span", { class: "segmented-item__container__label", id: ID_LABEL, children: h("slot", {}) })] }));
//#endregion Template
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
let HTMLBnumSegmentedItem = (() => {
    let _classDecorators = [Define({
            tag: TAG_SEGMENTED_ITEM$1,
            styles: css_248z$5,
            template: TEMPLATE$5,
        }), UpdateAll()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _selected_decorators;
    let _selected_initializers = [];
    let _selected_extraInitializers = [];
    let _disabled_decorators;
    let _disabled_initializers = [];
    let _disabled_extraInitializers = [];
    let _private__icon_decorators;
    let _private__icon_initializers = [];
    let _private__icon_extraInitializers = [];
    let _private__icon_descriptor;
    let _onSelected_decorators;
    let _onSelected_initializers = [];
    let _onSelected_extraInitializers = [];
    let __p_buildDOM_decorators;
    let _updateLabel_decorators;
    let _is_decorators;
    let _private__updateDom_decorators;
    let _private__updateDom_descriptor;
    let _private__verifyUi_decorators;
    let _private__verifyUi_descriptor;
    let _private__setIcon_decorators;
    let _private__setIcon_descriptor;
    let _private__updateIcon_decorators;
    let _private__updateIcon_descriptor;
    let _private__disable_decorators;
    let _private__disable_descriptor;
    let _private__enable_decorators;
    let _private__enable_descriptor;
    let _private__select_decorators;
    let _private__select_descriptor;
    let _private__unselect_decorators;
    let _private__unselect_descriptor;
    let _private__dispatchError_decorators;
    let _private__dispatchError_descriptor;
    let _private__onclick_decorators;
    let _private__onclick_descriptor;
    let _private__listenClick_decorators;
    let _private__listenClick_descriptor;
    let _private__listenKeyDown_decorators;
    let _private__listenKeyDown_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    icon: SEL_ICON,
                    label: SEL_LABEL,
                    container: SEL_CONTAINER,
                })];
            _selected_decorators = [Attr()];
            _disabled_decorators = [Attr()];
            _private__icon_decorators = [Data({ setter: false })];
            _onSelected_decorators = [Listener(OnSelectListenerInitializer)];
            __p_buildDOM_decorators = [SetAttr('role', 'radio')];
            _updateLabel_decorators = [Risky()];
            _is_decorators = [Risky()];
            _private__updateDom_decorators = [Risky()];
            _private__verifyUi_decorators = [Risky()];
            _private__setIcon_decorators = [Risky()];
            _private__updateIcon_decorators = [Risky()];
            _private__disable_decorators = [SetAttrs({ 'aria-disabled': 'true', tabindex: '-1' })];
            _private__enable_decorators = [SetAttr('aria-disabled', 'false')];
            _private__select_decorators = [SetAttrs({
                    'aria-checked': 'true',
                    tabindex: '0',
                })];
            _private__unselect_decorators = [SetAttrs({
                    'aria-checked': 'false',
                    tabindex: '-1',
                })];
            _private__dispatchError_decorators = [Fire(EVT_ERROR)];
            _private__onclick_decorators = [Fire(EVT_SELECTED)];
            _private__listenClick_decorators = [Listen('click')];
            _private__listenKeyDown_decorators = [Listen('keydown')];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _selected_decorators, { kind: "accessor", name: "selected", static: false, private: false, access: { has: obj => "selected" in obj, get: obj => obj.selected, set: (obj, value) => { obj.selected = value; } }, metadata: _metadata }, _selected_initializers, _selected_extraInitializers);
            __esDecorate(this, null, _disabled_decorators, { kind: "accessor", name: "disabled", static: false, private: false, access: { has: obj => "disabled" in obj, get: obj => obj.disabled, set: (obj, value) => { obj.disabled = value; } }, metadata: _metadata }, _disabled_initializers, _disabled_extraInitializers);
            __esDecorate(this, _private__icon_descriptor = { get: __setFunctionName(function () { return this.#_icon_accessor_storage; }, "#_icon", "get"), set: __setFunctionName(function (value) { this.#_icon_accessor_storage = value; }, "#_icon", "set") }, _private__icon_decorators, { kind: "accessor", name: "#_icon", static: false, private: true, access: { has: obj => #_icon in obj, get: obj => obj.#_icon, set: (obj, value) => { obj.#_icon = value; } }, metadata: _metadata }, _private__icon_initializers, _private__icon_extraInitializers);
            __esDecorate(this, null, _onSelected_decorators, { kind: "accessor", name: "onSelected", static: false, private: false, access: { has: obj => "onSelected" in obj, get: obj => obj.onSelected, set: (obj, value) => { obj.onSelected = value; } }, metadata: _metadata }, _onSelected_initializers, _onSelected_extraInitializers);
            __esDecorate(this, null, __p_buildDOM_decorators, { kind: "method", name: "_p_buildDOM", static: false, private: false, access: { has: obj => "_p_buildDOM" in obj, get: obj => obj._p_buildDOM }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _updateLabel_decorators, { kind: "method", name: "updateLabel", static: false, private: false, access: { has: obj => "updateLabel" in obj, get: obj => obj.updateLabel }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _is_decorators, { kind: "method", name: "is", static: false, private: false, access: { has: obj => "is" in obj, get: obj => obj.is }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__updateDom_descriptor = { value: __setFunctionName(function () {
                    return this.#_verifyUi()
                        .tap(() => this.#_clearStates())
                        .tap(() => this.#_updateSelected())
                        .tap(() => this.#_updateDisabled())
                        .andThen(() => this.#_setIcon());
                }, "#_updateDom") }, _private__updateDom_decorators, { kind: "method", name: "#_updateDom", static: false, private: true, access: { has: obj => #_updateDom in obj, get: obj => obj.#_updateDom }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__verifyUi_descriptor = { value: __setFunctionName(function () {
                    if (!this.#_ui.icon || !this.#_ui.label || !this.#_ui.container) {
                        Log.error('HTMLBnumSegmentedItem', 'UI not correctly initialized');
                        throw new Error('UI not correctly initialized');
                    }
                    return ATresult.Ok();
                }, "#_verifyUi") }, _private__verifyUi_decorators, { kind: "method", name: "#_verifyUi", static: false, private: true, access: { has: obj => #_verifyUi in obj, get: obj => obj.#_verifyUi }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__setIcon_descriptor = { value: __setFunctionName(function () {
                    return this.#_updateIcon(this.#_icon).tap(() => {
                        this._p_addState(STATE_ICON);
                    });
                }, "#_setIcon") }, _private__setIcon_decorators, { kind: "method", name: "#_setIcon", static: false, private: true, access: { has: obj => #_setIcon in obj, get: obj => obj.#_setIcon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__updateIcon_descriptor = { value: __setFunctionName(function (icon) {
                    return this.#_verifyUi().tap(() => {
                        this.#_ui.icon.icon = icon;
                    });
                }, "#_updateIcon") }, _private__updateIcon_decorators, { kind: "method", name: "#_updateIcon", static: false, private: true, access: { has: obj => #_updateIcon in obj, get: obj => obj.#_updateIcon }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__disable_descriptor = { value: __setFunctionName(function () {
                    this._p_addState(STATE_DISABLED);
                }, "#_disable") }, _private__disable_decorators, { kind: "method", name: "#_disable", static: false, private: true, access: { has: obj => #_disable in obj, get: obj => obj.#_disable }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__enable_descriptor = { value: __setFunctionName(function () {
                    if (!this.hasAttribute(ATTR_SELECTED$1))
                        this.#_unselect();
                }, "#_enable") }, _private__enable_decorators, { kind: "method", name: "#_enable", static: false, private: true, access: { has: obj => #_enable in obj, get: obj => obj.#_enable }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__select_descriptor = { value: __setFunctionName(function () {
                    this._p_addState(STATE_SELECTED);
                }, "#_select") }, _private__select_decorators, { kind: "method", name: "#_select", static: false, private: true, access: { has: obj => #_select in obj, get: obj => obj.#_select }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__unselect_descriptor = { value: __setFunctionName(function () { }, "#_unselect") }, _private__unselect_decorators, { kind: "method", name: "#_unselect", static: false, private: true, access: { has: obj => #_unselect in obj, get: obj => obj.#_unselect }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__dispatchError_descriptor = { value: __setFunctionName(function (error) {
                    return { error, caller: this };
                }, "#_dispatchError") }, _private__dispatchError_decorators, { kind: "method", name: "#_dispatchError", static: false, private: true, access: { has: obj => #_dispatchError in obj, get: obj => obj.#_dispatchError }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__onclick_descriptor = { value: __setFunctionName(function (e) {
                    return { event: e, caller: this, value: this.value };
                }, "#_onclick") }, _private__onclick_decorators, { kind: "method", name: "#_onclick", static: false, private: true, access: { has: obj => #_onclick in obj, get: obj => obj.#_onclick }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__listenClick_descriptor = { value: __setFunctionName(function () {
                    return this.#_onClickDisabled;
                }, "#_listenClick") }, _private__listenClick_decorators, { kind: "method", name: "#_listenClick", static: false, private: true, access: { has: obj => #_listenClick in obj, get: obj => obj.#_listenClick }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__listenKeyDown_descriptor = { value: __setFunctionName(function () {
                    return this.#_onKeyDown;
                }, "#_listenKeyDown") }, _private__listenKeyDown_decorators, { kind: "method", name: "#_listenKeyDown", static: false, private: true, access: { has: obj => #_listenKeyDown in obj, get: obj => obj.#_listenKeyDown }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        #_ui_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _private__ui_initializers, void 0));
        //#region Private Fields
        /** Références aux éléments du Shadow DOM. */
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #selected_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _selected_initializers, false));
        //#endregion Private Fields
        //#region Getters/Setters
        /** @attr {boolean} (optional) (default: false) selected - État de sélection. */
        get selected() { return this.#selected_accessor_storage; }
        set selected(value) { this.#selected_accessor_storage = value; }
        #disabled_accessor_storage = (__runInitializers(this, _selected_extraInitializers), __runInitializers(this, _disabled_initializers, false));
        /** @attr {boolean} (optional) (default: false) disabled - État désactivé. */
        get disabled() { return this.#disabled_accessor_storage; }
        set disabled(value) { this.#disabled_accessor_storage = value; }
        #_icon_accessor_storage = (__runInitializers(this, _disabled_extraInitializers), __runInitializers(this, _private__icon_initializers, EMPTY_STRING));
        /** @attr {string} (optional) (default: '') data-icon - Nom de l'icône à afficher. */
        get #_icon() { return _private__icon_descriptor.get.call(this); }
        set #_icon(value) { return _private__icon_descriptor.set.call(this, value); }
        #onSelected_accessor_storage = (__runInitializers(this, _private__icon_extraInitializers), __runInitializers(this, _onSelected_initializers, void 0));
        /** Instance JsEvent pour la souscription aux changements de sélection. */
        get onSelected() { return this.#onSelected_accessor_storage; }
        set onSelected(value) { this.#onSelected_accessor_storage = value; }
        /** @attr {string} value - Valeur technique de l'item. */
        get value() {
            return this.getAttribute('value') || this.innerText || EMPTY_STRING;
        }
        set value(value) {
            this.setAttribute('value', value);
        }
        /** Récupère le nom de l'icône actuelle. */
        get icon() {
            return this.#_icon;
        }
        /** Définit une nouvelle icône et met à jour le DOM. */
        set icon(value) {
            this.#_icon = value;
            this.#_updateIcon(value);
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
            __runInitializers(this, _onSelected_extraInitializers);
        }
        /** Initialise le DOM et les écouteurs. */
        _p_buildDOM() {
            this.#_updateDom().match({
                Ok: () => this.#_setListeners(),
                Err: (error) => this.#_dispatchError(error),
            });
        }
        /** Gère la mise à jour des attributs. */
        _p_update(_, __, ___) {
            this.#_updateDom().tapError((error) => this.#_dispatchError(error));
        }
        //#endregion Lifecycle
        //#region Public Methods
        /**
         * Met à jour le texte du label via textContent.
         * @param text Nouveau texte.
         */
        updateLabel(text) {
            return this.#_verifyUi().tap(() => {
                this.textContent = text;
            });
        }
        /**
         * Vérifie si l'élément possède un état spécifique.
         * @param state État à vérifier.
         */
        is(state) {
            var result;
            switch (state) {
                case States.SELECTED:
                    result = this.hasAttribute(ATTR_SELECTED$1);
                    break;
                case States.DISABLED:
                    result = this.hasAttribute(ATTR_DISABLED);
                    break;
                case States.ICON:
                    result = this.#_icon !== EMPTY_STRING;
                    break;
                default:
                    throw new Error(`State "${state}" is not recognized.`);
            }
            return ATresult.Ok(result);
        }
        /**
         * Désactive l'élément.
         * @returns Cette instance pour le chaînage.
         */
        disable() {
            this.disabled = true;
            return this;
        }
        /**
         * Active l'élément.
         * @returns Cette instance pour le chaînage.
         */
        enable() {
            this.disabled = false;
            return this;
        }
        /**
         * Sélectionne l'élément.
         * @returns Cette instance pour le chaînage.
         */
        select() {
            this.selected = true;
            return this;
        }
        /**
         * Désélectionne l'élément.
         * @returns Cette instance pour le chaînage.
         */
        unselect() {
            this.selected = false;
            return this;
        }
        /**
         * Met à jour la valeur technique de l'élément.
         * @param value Nouvelle valeur.
         * @returns Cette instance pour le chaînage.
         */
        updateValue(value) {
            this.value = value;
            return this;
        }
        /**
         * Déclenche manuellement la logique de sélection.
         *
         * /!\ Ne modifie pas l'état sélectionné de l'élément.
         * @param options Options incluant l'événement parent.
         */
        callSelect({ parentEvent = null } = {}) {
            const args = {
                parentEvent,
                caller: this,
                value: this.value,
            };
            this.onSelected.call(args);
        }
        //#endregion Public Methods
        //#region Private Methods
        /** Synchronise l'ensemble du DOM avec les états internes. */
        get #_updateDom() { return _private__updateDom_descriptor.value; }
        /** Vérifie la disponibilité des éléments UI du Shadow DOM. */
        get #_verifyUi() { return _private__verifyUi_descriptor.value; }
        /** Configure l'icône et active l'état associé. */
        get #_setIcon() { return _private__setIcon_descriptor.value; }
        /** Met à jour la propriété icon du webcomponent bnum-icon interne. */
        get #_updateIcon() { return _private__updateIcon_descriptor.value; }
        /** Réinitialise tous les états CSS custom. */
        #_clearStates() {
            this._p_clearStates();
            return this;
        }
        /** Met à jour l'UI en fonction de l'attribut selected. */
        #_updateSelected() {
            if (this.hasAttribute(ATTR_SELECTED$1))
                this.#_select();
            else
                this.#_unselect();
            return this;
        }
        /** Met à jour l'UI en fonction de l'attribut disabled. */
        #_updateDisabled() {
            if (this.hasAttribute(ATTR_DISABLED))
                this.#_disable();
            else
                this.#_enable();
            return this;
        }
        /** Active l'état désactivé. */
        get #_disable() { return _private__disable_descriptor.value; }
        /** Désactive l'état désactivé. */
        get #_enable() { return _private__enable_descriptor.value; }
        /** Applique les attributs et états de sélection. */
        get #_select() { return _private__select_descriptor.value; }
        /** Retire les attributs et états de sélection. */
        get #_unselect() { return _private__unselect_descriptor.value; }
        /** Filtre le clic si l'item est désactivé ou déjà sélectionné. */
        #_onClickDisabled(e) {
            const canBeClicked = !this.disabled && !this.selected;
            if (canBeClicked)
                return this.callSelect({ parentEvent: e });
        }
        /** Émet l'événement d'erreur. */
        get #_dispatchError() { return _private__dispatchError_descriptor.value; }
        /** Émet l'événement de sélection. */
        get #_onclick() { return _private__onclick_descriptor.value; }
        /** Gère l'accessibilité clavier (Entrée/Espace). */
        #_onKeyDown(e) {
            const canBeClicked = !this.disabled && !this.selected;
            const isEnterOrSpace = e.key === 'Enter' || e.key === ' ';
            if (canBeClicked && isEnterOrSpace) {
                e.preventDefault();
                return this.click();
            }
        }
        /** Initialise les écouteurs via décorateur @Listen. */
        #_setListeners() {
            this.#_listenClick();
            this.#_listenKeyDown();
        }
        /**
         * Ecoute les clics sur l'élément.
         * @returns Action à faire lors d'un clic.
         */
        get #_listenClick() { return _private__listenClick_descriptor.value; }
        /**
         * Ecoute les événements clavier sur l'élément.
         * @returns Action à faire lors d'un keydown.
         */
        get #_listenKeyDown() { return _private__listenKeyDown_descriptor.value; }
        //#endregion Private Methods
        //#region Protected Methods
        /**
         * Déclencheur interne pour le pont avec l'initialiseur de Listener.
         * @internal
         */
        _p_onSelectedTrigger(e) {
            this.#_onclick(e);
        }
        //#endregion Protected Methods
        //#region Static Methods
        static _p_observedAttributes() {
            return [...super._p_observedAttributes(), ATTR_SELECTED$1, ATTR_DISABLED];
        }
        /**
         * Crée un élément segmented-item.
         * @param value Valeur technique de l'item.
         * @param options Options de création.
         * @returns L'élément créé.
         */
        static Create(value, options) {
            const node = document.createElement(this.TAG);
            if (options?.onSelect)
                node.addEventListener(EVT_SELECTED, (e) => options.onSelect(e));
            if (options?.OnError)
                node.addEventListener(EVT_ERROR, (e) => options.OnError(e.error, e.caller));
            if (options?.label)
                node.textContent = options.label;
            return node
                .attr('value', value)
                .condAttr(options?.iconName, 'data-icon', options.iconName)
                .condAttr(options?.selected, ATTR_SELECTED$1, true)
                .condAttr(options?.disabled, ATTR_DISABLED, true);
        }
        /**
         * Accès aux états disponibles pour cet élément.
         */
        static get States() {
            return States;
        }
        /**
         * Accès aux évènements non-conventionnels de cet élément.
         */
        static get Events() {
            return EVENTS$1;
        }
    });
    return _classThis;
})();

// type: functions
// description: Fonctions pour initialiser les listeners internes
function OnSelectListenerInitializer(listener, instance) {
    listener.add('default', (args) => {
        instance._p_onSelectedTrigger(args.parentEvent ?? new Event('click'));
    });
}

var css_248z$4 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{--_internal-display:var(--bnum-segmented-control-display,inline-block);--_internal-border-color:var(--bnum-segmented-control-border-color,var(--bnum-color-border,#ddd));--_internal-border:var(--bnum-segmented-control-border,inset 0 0 0 1px var(--_internal-border-color,var(--bnum-segmented-control-border-color,var(--bnum-color-border,#ddd))));--_internal-border-radius:var(--bnum-segmented-control-border-radius,5px);--_internal-hover-padding:var(--bnum-segmented-control-hover-padding,var(--bnum-space-xs,5px) var(--bnum-space-s,10px));--_internal-margin-right-correction:calc(var(--bnum-space-m, 15px) - var(--bnum-space-s, 10px));--_internal-margin-left-correction:var(--_internal-margin-right-correction);box-sizing:border-box;display:var(--_internal-display)}:host .bnum-segmented-control__legend{display:block;margin-bottom:.75rem}:host .bnum-segmented-control__items{border-radius:var(--_internal-border-radius);box-shadow:var(--_internal-border);display:inline-block}:host(:state(no-legend)) .bnum-segmented-control__legend{display:none}::slotted(bnum-segmented-item:not([selected]):hover){--bnum-segmented-item-padding:var(--_internal-hover-padding);margin-inline-end:var(--_internal-margin-right-correction);margin-inline-start:var(--_internal-margin-left-correction)}";

//#region Global constants
const SELECTOR_SELECTED = '[selected]';
const STATE_NO_LEGEND = 'no-legend';
const EVENT_CHANGE = 'bnum-segmented-control:change';
const EVENT_ERROR = 'bnum-segmented-control:error';
const TAG_SEGMENTED_ITEM = HTMLBnumSegmentedItem.TAG;
/**
 * Énumération des événements émis par le contrôle segmenté.
 *
 * @remarks
 * - `CHANGE` : déclenché lors de la sélection d'un item
 * - `ERROR` : déclenché en cas d'erreur interne
 *
 * @example
 * ```typescript
 * control.addEventListener(
 *   HTMLBnumSegmentedControl.Events.CHANGE,
 *   (e) => console.log('Sélection:', e.detail.value)
 * );
 * ```
 */
const EVENTS = {
    CHANGE: EVENT_CHANGE,
    ERROR: EVENT_ERROR,
};
//#endregion Global constants
//#region Template
const TEMPLATE$4 = (h("div", { id: "container", children: [h("label", { class: "bnum-segmented-control__legend", children: h("slot", {}) }), h("div", { class: "bnum-segmented-control__items", children: [' ', h("slot", { name: "items" })] })] }));
//#endregion Template
/**
 * Élément de contrôle segmenté (groupe de boutons radio).
 *
 * @structure Sans icône
 * <bnum-segmented-control>
 *   Légende du contrôle
 *  <bnum-segmented-item slot="items" value="option1">Option 1</bnum-segmented-item>
 *  <bnum-segmented-item slot="items" value="option2">Option 2</bnum-segmented-item>
 * </bnum-segmented-control>
 *
 * @structure Avec icône
 * <bnum-segmented-control>
 *   Légende du contrôle
 *  <bnum-segmented-item slot="items" data-icon="add" value="option1">Option 1</bnum-segmented-item>
 *  <bnum-segmented-item slot="items" data-icon="remove" value="option2">Option 2</bnum-segmented-item>
 * </bnum-segmented-control>
 *
 * @structure Avec 3 segments
 * <bnum-segmented-control>
 *   Légende du contrôle
 *  <bnum-segmented-item slot="items" data-icon="view_agenda" value="option1">Option 1</bnum-segmented-item>
 *  <bnum-segmented-item slot="items" data-icon="view_array" value="option2">Option 2</bnum-segmented-item>
 *  <bnum-segmented-item slot="items" data-icon="view_carousel" value="option3">Option 3</bnum-segmented-item>
 * </bnum-segmented-control>
 *
 * @description
 * Composant permettant de présenter plusieurs options mutuellement exclusives
 * sous la forme d'un groupe de contrôles segmentés.
 *
 * @remarks
 * - Respecte le pattern WAI-ARIA "Radio Group"
 * - Support complet de la navigation au clavier (flèches, boucle cyclique)
 * - Support de la directionnalité RTL (arabe, hébreu, etc.)
 * - La sélection suit le focus pour l'accessibilité
 *
 * @example
 * ```html
 * <bnum-segmented-control>
 *    Choisir une option
 *    <bnum-segmented-item slot="items" selected value="opt1">Option 1</bnum-segmented-item>
 *    <bnum-segmented-item slot="items" value="opt2">Option 2</bnum-segmented-item>
 * </bnum-segmented-control>
 * ```
 *
 * @example
 * ```typescript
 * const control = HTMLBnumSegmentedControl.Create('Ma légende');
 * control.addEventListener('bnum-segmented-control:change', (e) => {
 *   console.log('Valeur sélectionnée:', e.detail.value);
 * });
 * ```
 *
 * @event {CustomEvent} bnum-segmented-control:change - Émis lors de la sélection d'un item. Détail : `{value: string, item: HTMLBnumSegmentedItem, caller: HTMLBnumSegmentedControl}`
 * @event {CustomEvent} bnum-segmented-control:error - Émis en cas d'erreur interne. Détail : `{error: Error, caller: HTMLBnumSegmentedControl}`
 *
 * @see {@link HTMLBnumSegmentedItem}
 */
let HTMLBnumSegmentedControl = (() => {
    let _classDecorators = [Define({
            tag: TAG_SEGMENTED_CONTROL,
            styles: css_248z$4,
            template: TEMPLATE$4,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let _private__legend_decorators;
    let _private__legend_initializers = [];
    let _private__legend_extraInitializers = [];
    let _private__legend_descriptor;
    let __p_buildDOM_decorators;
    let _private__handleKeyboardNavigation_decorators;
    let _private__handleKeyboardNavigation_descriptor;
    let _private__onItemSelected_decorators;
    let _private__onItemSelected_descriptor;
    let _private__onItemSelectedAction_decorators;
    let _private__onItemSelectedAction_descriptor;
    let _private__onError_decorators;
    let _private__onError_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__legend_decorators = [Data()];
            __p_buildDOM_decorators = [SetAttr('role', 'radiogroup')];
            _private__handleKeyboardNavigation_decorators = [Listen('keydown')];
            _private__onItemSelected_decorators = [Listen(HTMLBnumSegmentedItem.Events.SELECTED, {
                    selector: TAG_SEGMENTED_ITEM,
                })];
            _private__onItemSelectedAction_decorators = [Fire(EVENT_CHANGE)];
            _private__onError_decorators = [Fire(EVENT_ERROR)];
            __esDecorate(this, _private__legend_descriptor = { get: __setFunctionName(function () { return this.#_legend_accessor_storage; }, "#_legend", "get"), set: __setFunctionName(function (value) { this.#_legend_accessor_storage = value; }, "#_legend", "set") }, _private__legend_decorators, { kind: "accessor", name: "#_legend", static: false, private: true, access: { has: obj => #_legend in obj, get: obj => obj.#_legend, set: (obj, value) => { obj.#_legend = value; } }, metadata: _metadata }, _private__legend_initializers, _private__legend_extraInitializers);
            __esDecorate(this, null, __p_buildDOM_decorators, { kind: "method", name: "_p_buildDOM", static: false, private: false, access: { has: obj => "_p_buildDOM" in obj, get: obj => obj._p_buildDOM }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__handleKeyboardNavigation_descriptor = { value: __setFunctionName(function () {
                    return (e) => {
                        // Définition des touches de navigation
                        // Support RTL : si la page est en arabe/hébreu, Gauche/Droite sont inversés
                        const isRTL = getComputedStyle(this).direction === 'rtl';
                        const KEY_NEXT = ['ArrowDown', isRTL ? 'ArrowLeft' : 'ArrowRight'];
                        const KEY_PREV = ['ArrowUp', isRTL ? 'ArrowRight' : 'ArrowLeft'];
                        const ALL_KEYS = [...KEY_NEXT, ...KEY_PREV];
                        // Ignorer les touches non concernées
                        if (!ALL_KEYS.includes(e.key))
                            return;
                        // Prévenir le scroll natif de la page
                        e.preventDefault();
                        // Récupération des items
                        const items = Array.from(this.querySelectorAll(TAG_SEGMENTED_ITEM));
                        if (items.length === 0)
                            return;
                        // Calcul du nouvel index (Logique cyclique)
                        const currentItem = this.selected;
                        // Si rien n'est sélectionné, on part de -1 (donc next sera 0)
                        const currentIndex = currentItem ? items.indexOf(currentItem) : -1;
                        const direction = KEY_PREV.includes(e.key) ? -1 : 1;
                        // Formule mathématique pour le "wrap-around" (boucle fin -> début)
                        const nextIndex = (currentIndex + direction + items.length) % items.length;
                        const targetItem = items[nextIndex];
                        if (targetItem) {
                            targetItem.focus();
                            targetItem.click();
                        }
                    };
                }, "#_handleKeyboardNavigation") }, _private__handleKeyboardNavigation_decorators, { kind: "method", name: "#_handleKeyboardNavigation", static: false, private: true, access: { has: obj => #_handleKeyboardNavigation in obj, get: obj => obj.#_handleKeyboardNavigation }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__onItemSelected_descriptor = { value: __setFunctionName(function () {
                    return this.#_onItemSelectedAction;
                }, "#_onItemSelected") }, _private__onItemSelected_decorators, { kind: "method", name: "#_onItemSelected", static: false, private: true, access: { has: obj => #_onItemSelected in obj, get: obj => obj.#_onItemSelected }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__onItemSelectedAction_descriptor = { value: __setFunctionName(function (e) {
                    const { target } = e.detail;
                    if (!target) {
                        this.#_onError(new Error("Élément cible manquant dans l'événement sélectionné."));
                        return;
                    }
                    this.#_unselectAllItems();
                    this.#_selectItem(target);
                    return { value: target?.value, item: target, caller: this };
                }, "#_onItemSelectedAction") }, _private__onItemSelectedAction_decorators, { kind: "method", name: "#_onItemSelectedAction", static: false, private: true, access: { has: obj => #_onItemSelectedAction in obj, get: obj => obj.#_onItemSelectedAction }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__onError_descriptor = { value: __setFunctionName(function (error) {
                    Log.error('HTMLBnumSegmentedControl', 'Une erreur est survenue', error);
                    return { error, caller: this };
                }, "#_onError") }, _private__onError_decorators, { kind: "method", name: "#_onError", static: false, private: true, access: { has: obj => #_onError in obj, get: obj => obj.#_onError }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        #_legend_accessor_storage = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _private__legend_initializers, true));
        //#region Getters/Setters
        /**
         * Contrôle l'affichage de la légende du contrôle segmenté.
         *
         * @remarks
         * - `true` : affiche la légende (défaut)
         * - `false` : masque la légende via la classe `no-legend`
         *
         * @decorator `@Data()`
         * @default true
         */
        get #_legend() { return _private__legend_descriptor.get.call(this); }
        set #_legend(value) { return _private__legend_descriptor.set.call(this, value); }
        /**
         * Récupère l'élément actuellement sélectionné dans le contrôle.
         *
         * @remarks
         * Retourne `null` si aucun élément n'est sélectionné.
         *
         * @readonly
         * @returns {Nullable<HTMLBnumSegmentedItem>} L'item sélectionné ou null.
         */
        get selected() {
            return this.querySelector(SELECTOR_SELECTED);
        }
        /**
         * Récupère la valeur de l'élément actuellement sélectionné.
         *
         * @remarks
         * La valeur provient de l'attribut `value` de l'item sélectionné.
         * Retourne `null` si aucun élément n'est sélectionné.
         *
         * @readonly
         * @returns {Nullable<string>} La valeur de l'item sélectionné ou null.
         *
         * @example
         * ```typescript
         * const control = document.querySelector('bnum-segmented-control');
         * console.log(control.currentValue); // "option1"
         * ```
         */
        get currentValue() {
            return this.selected?.value || null;
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
            __runInitializers(this, _private__legend_extraInitializers);
        }
        /**
         * Initialise le DOM et configure le composant.
         *
         * @remarks
         * Définit l'attribut `role="radiogroup"` et initialise :
         * - L'affichage/masquage de la légende
         * - Les écouteurs d'événements clavier
         * - Les écouteurs de sélection d'items
         *
         * @protected
         * @decorator `@SetAttr('role', 'radiogroup')`
         */
        _p_buildDOM() {
            this.#_initLegendVisibility().#_setListeners().#_initSelectedItem();
        }
        //#endregion Lifecycle
        //#region Private methods
        /**
         * Gère l'affichage de la légende en fonction de l'attribut `data-legend`.
         *
         * @remarks
         * Si `legend` est `false`, ajoute l'état CSS `no-legend` au composant.
         *
         * @private
         * @returns L'instance courante pour le chaînage de méthodes.
         */
        #_initLegendVisibility() {
            if (!(this.#_legend ?? true))
                this._p_addState(STATE_NO_LEGEND);
            return this;
        }
        /**
       * Initialise la sélection du premier item par défaut.
       *
       * @description
       * Si aucun item n'est déjà sélectionné, sélectionne automatiquement
       * le premier item du contrôle segmenté.
       *
       * @remarks
       * - Garantit qu'au moins un item est toujours sélectionné
       * - Déclenche l'événement `bnum-segmented-control:change` via `click()`
       * - Utile pour initialiser le state du composant au chargement
    
       * @returns L'instance courante pour le chaînage de méthodes.
       */
        #_initSelectedItem() {
            if (!this.selected) {
                const firstItem = this.querySelector(TAG_SEGMENTED_ITEM);
                if (firstItem)
                    firstItem.click();
            }
            return this;
        }
        /**
         * Enregistre les écouteurs d'événements du composant.
         *
         * @remarks
         * Configure :
         * - La navigation au clavier (flèches, boucle cyclique)
         * - La sélection d'items
         *
         * @private
         * @returns L'instance courante pour le chaînage de méthodes.
         */
        #_setListeners() {
            this.#_onItemSelected();
            this.#_handleKeyboardNavigation();
            return this;
        }
        /**
         * Gère la navigation au clavier au sein du groupe (accessibilité).
         *
         * @description
         * Intercepte les touches fléchées pour déplacer le focus et la sélection :
         * - **Flèche bas / Flèche droite (LTR)** : sélectionne l'item suivant
         * - **Flèche haut / Flèche gauche (LTR)** : sélectionne l'item précédent
         * - **Support RTL** : les flèches droite/gauche sont inversées
         * - **Comportement cyclique** : la dernière option ramène à la première
         *
         * @remarks
         * Respecte le pattern WAI-ARIA "Radio Group" où la sélection suit le focus.
         * Prévient le scroll natif de la page lors de la navigation.
         *
         * @private
         * @decorator `@Listen('keydown')`
         * @returns Fonction de gestion de l'événement clavier.
         */
        get #_handleKeyboardNavigation() { return _private__handleKeyboardNavigation_descriptor.value; }
        /**
         * Enregistre l'écouteur pour l'événement de sélection d'un item.
         *
         * @remarks
         * Déclenche {@link #_onItemSelectedAction} lorsqu'un item emet l'événement
         * `HTMLBnumSegmentedItem.Events.SELECTED`.
         *
         * @private
         * @decorator `@Listen(HTMLBnumSegmentedItem.Events.SELECTED, { selector: TAG_SEGMENTED_ITEM })`
         * @returns Fonction de gestion de la sélection d'item.
         */
        get #_onItemSelected() { return _private__onItemSelected_descriptor.value; }
        /**
         * Traite la sélection d'un item du contrôle segmenté.
         *
         * @description
         * Désélectionne tous les items existants et sélectionne le nouvel item.
         * Émet l'événement `bnum-segmented-control:change` avec les détails.
         *
         * @remarks
         * - Valide que la cible de l'événement existe
         * - Lève une erreur si la cible est manquante
         * - Garantit qu'un seul item est sélectionné à la fois
         *
         * @private
         * @decorator `@Fire('bnum-segmented-control:change')`
         * @param e - Événement de sélection d'item depuis `HTMLBnumSegmentedItem`.
         * @returns Détails de l'événement émis : `{value: string, item: HTMLBnumSegmentedItem, caller: HTMLBnumSegmentedControl}`
         *
         * @fires bnum-segmented-control:change
         *
         * @example
         * ```typescript
         * control.addEventListener('bnum-segmented-control:change', (e) => {
         *   console.log('Item sélectionné:', e.detail.item);
         *   console.log('Valeur:', e.detail.value);
         * });
         * ```
         */
        get #_onItemSelectedAction() { return _private__onItemSelectedAction_descriptor.value; }
        /**
         * Traite les erreurs internes du composant.
         *
         * @remarks
         * - Enregistre l'erreur dans les logs
         * - Émet l'événement `bnum-segmented-control:error`
         * - Peut être déclenché lors de la sélection d'items invalides
         *
         * @private
         * @decorator `@Fire('bnum-segmented-control:error')`
         * @param error - L'erreur survenue.
         * @returns Détails de l'événement d'erreur : `{error: Error, caller: HTMLBnumSegmentedControl}`
         *
         * @fires bnum-segmented-control:error
         *
         * @example
         * ```typescript
         * control.addEventListener('bnum-segmented-control:error', (e) => {
         *   console.error('Erreur dans le contrôle:', e.detail.error);
         * });
         * ```
         */
        get #_onError() { return _private__onError_descriptor.value; }
        /**
         * Désélectionne tous les items du contrôle segmenté.
         *
         * @remarks
         * Supprime l'attribut `selected` de tous les items, indépendamment de leur
         * état actuel.
         *
         * @private
         */
        #_unselectAllItems() {
            const items = this.querySelectorAll(TAG_SEGMENTED_ITEM);
            if (items.length > 0) {
                for (const element of Array.from(items)) {
                    element.removeAttribute('selected');
                }
            }
        }
        /**
         * Sélectionne un item spécifique du contrôle segmenté.
         *
         * @remarks
         * Ajoute l'attribut `selected="true"` à l'item fourni.
         * Doit être appelé après {@link #_unselectAllItems} pour respecter
         * le comportement de sélection unique.
         *
         * @private
         * @param item - L'item à sélectionner.
         */
        #_selectItem(item) {
            item.setAttribute('selected', 'true');
        }
        //#region Private methods
        //#region Static methods
        /**
         * Crée un nouveau contrôle segmenté avec une légende.
         *
         * @remarks
         * Fabrique statique pour créer rapidement un contrôle segmenté vide.
         * Les items doivent être ajoutés manuellement après la création.
         *
         * @static
         * @param legend - La légende du contrôle segmenté.
         * @returns L'élément de contrôle segmenté créé.
         *
         * @example
         * ```typescript
         * const control = HTMLBnumSegmentedControl.Create('Choisir une option');
         * document.body.appendChild(control);
         * ```
         */
        static Create(legend) {
            const node = document.createElement(this.TAG);
            node.textContent = legend;
            return node;
        }
        /**
         * Récupère l'énumération des événements du composant.
         *
         * @remarks
         * Contient les noms des événements personnalisés émis par le composant.
         * Utiliser ces constantes plutôt que des chaînes de caractères brutes
         * pour éviter les erreurs typographiques.
         *
         * @example
         * ```typescript
         * const control = document.querySelector('bnum-segmented-control');
         *
         * // Bonne pratique : utiliser Events
         * control.addEventListener(
         *   HTMLBnumSegmentedControl.Events.CHANGE,
         *   (e) => console.log('Changement:', e.detail)
         * );
         *
         * // À éviter : chaîne brute
         * control.addEventListener('bnum-segmented-control:change', (e) => {});
         * ```
         */
        static get Events() {
            return EVENTS;
        }
    });
    return _classThis;
})();

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

var css_248z$3 = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{background-color:var(--bnum-card-background-color,var(--bnum-color-surface,#f6f6f6));border-bottom:var(--bnum-border-on-surface-bottom,solid 4px #000091);border-left:var(--bnum-border-on-surface-left,none);border-right:var(--bnum-border-on-surface-right,none);border-top:var(--bnum-border-on-surface-top,none);display:var(--bnum-card-display,block);height:var(--bnum-card-height,auto);padding:var(--bnum-card-padding,var(--bnum-space-m,15px));position:relative;width:var(--bnum-card-width,auto)}:host .card-loading{display:none}:host(:state(clickable)){cursor:var(--bnum-card-clickable-cursor,pointer)}:host(:hover:state(clickable)){background-color:var(--bnum-card-background-color-hover,var(--bnum-color-surface-hover,#dfdfdf))}:host(:active:state(clickable)){background-color:var(--bnum-card-background-color-active,var(--bnum-color-surface-active,#cfcfcf))}:host(:state(loading)){--bnum-card-background-color-hover:var(--bnum-card-background-color,var(--bnum-color-surface,#f6f6f6));--bnum-card-background-color-active:var(--bnum-card-background-color,var(--bnum-color-surface,#f6f6f6));opacity:.8;pointer-events:none}:host(:state(loading)) .card-loading{align-items:center;display:flex;inset:0;justify-content:center;position:absolute;z-index:10}:host(:state(loading)) .card-loading .loader{animation:var(--bnum-card-loader-animation-rotate360,var(--bnum-animation-rotate360,rotate360 1s linear infinite))}:host(:state(loading)) .card-body slot{visibility:hidden}";

//type: class
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

const STATE_CLICKABLE = 'clickable';
const STATE_LOADING = 'loading';
const CSS_CLASS_TITLE = 'card-title';
const CSS_CLASS_BODY = 'card-body';
const CSS_CLASS_LOADING = 'card-loading';
const SLOT_TITLE = 'title';
const DATA_TITLE_ICON = 'title-icon';
const DATA_TITLE_TEXT = 'title-text';
const DATA_TITLE_LINK = 'title-link';
const EVENT_LOADING = 'bnum-card:loading';
const EVENT_CLICK = 'bnum-card:click';
const ICON_SPINNER = 'progress_activity';

// #region Global constants
const SYMBOL_RESET = Symbol('reset');
// #endregion Global constants
//#region Template
const TEMPLATE$3 = (h(HTMLBnumFragment, { children: [h("div", { class: CSS_CLASS_TITLE, children: h("slot", { name: SLOT_TITLE }) }), h("div", { class: CSS_CLASS_BODY, children: h("slot", { id: "mainslot" }) })] }));
//#endregion Template
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
 * <span>Contenu principal.</span>
 * </bnum-card>
 *
 * @structure Carte cliquable
 * <bnum-card clickable>
 * <span slot="title">Carte cliquable</span>
 * <span>Cliquez n'importe où.</span>
 * </bnum-card>
 *
 * @structure Carte avec titre par défaut (via data-attrs)
 * <bnum-card
 * data-title-text="Titre généré"
 * data-title-icon="info"
 * >
 * <span>Le slot "title" est vide.</span>
 * </bnum-card>
 *
 * @structure Carte avec un chargement
 * <bnum-card loading>
 * <bnum-card-title slot="title" data-icon="info">Titre en cours de chargement...</bnum-card-title>
 * <span>Chargement</span>
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
let HTMLBnumCardElement = (() => {
    let _classDecorators = [Define({
            tag: TAG_CARD,
            styles: css_248z$3,
            template: TEMPLATE$3,
        }), Observe(STATE_CLICKABLE, STATE_LOADING)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let __titleIcon_decorators;
    let __titleIcon_initializers = [];
    let __titleIcon_extraInitializers = [];
    let __titleText_decorators;
    let __titleText_initializers = [];
    let __titleText_extraInitializers = [];
    let __titleLink_decorators;
    let __titleLink_initializers = [];
    let __titleLink_extraInitializers = [];
    let _private__listenClick_decorators;
    let _private__listenClick_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __titleIcon_decorators = [Data(DATA_TITLE_ICON, NO_SETTER)];
            __titleText_decorators = [Data(DATA_TITLE_TEXT, NO_SETTER)];
            __titleLink_decorators = [Data(DATA_TITLE_LINK, NO_SETTER)];
            _private__listenClick_decorators = [Listen('click')];
            __esDecorate(this, null, __titleIcon_decorators, { kind: "accessor", name: "_titleIcon", static: false, private: false, access: { has: obj => "_titleIcon" in obj, get: obj => obj._titleIcon, set: (obj, value) => { obj._titleIcon = value; } }, metadata: _metadata }, __titleIcon_initializers, __titleIcon_extraInitializers);
            __esDecorate(this, null, __titleText_decorators, { kind: "accessor", name: "_titleText", static: false, private: false, access: { has: obj => "_titleText" in obj, get: obj => obj._titleText, set: (obj, value) => { obj._titleText = value; } }, metadata: _metadata }, __titleText_initializers, __titleText_extraInitializers);
            __esDecorate(this, null, __titleLink_decorators, { kind: "accessor", name: "_titleLink", static: false, private: false, access: { has: obj => "_titleLink" in obj, get: obj => obj._titleLink, set: (obj, value) => { obj._titleLink = value; } }, metadata: _metadata }, __titleLink_initializers, __titleLink_extraInitializers);
            __esDecorate(this, _private__listenClick_descriptor = { value: __setFunctionName(function () {
                    return this.#_handleClick;
                }, "#_listenClick") }, _private__listenClick_decorators, { kind: "method", name: "#_listenClick", static: false, private: true, access: { has: obj => #_listenClick in obj, get: obj => obj.#_listenClick }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        /**
         * Élément HTML utilisé pour afficher l'indicateur de chargement (spinner).
         * @private
         */
        #_loadingElement = (__runInitializers(this, _instanceExtraInitializers), null);
        /**
         * Planificateur responsable des mises à jour asynchrones du corps de la carte.
         * @private
         */
        #_scheduleBody = null;
        /**
         * Planificateur responsable des mises à jour asynchrones du titre de la carte.
         * @private
         */
        #_scheduleTitle = null;
        /**
         * Planificateur responsable de l'ajout asynchrone d'éléments au sein de la carte.
         * @private
         */
        #_scheduleAppend = null;
        #_titleIcon_accessor_storage = __runInitializers(this, __titleIcon_initializers, EMPTY_STRING);
        //#endregion Private fields
        //#region Getters/Setters
        /**
         * Icône du titre récupérée depuis les attributs de données du composant (`data-title-icon`).
         * @private
         */
        get _titleIcon() { return this.#_titleIcon_accessor_storage; }
        set _titleIcon(value) { this.#_titleIcon_accessor_storage = value; }
        #_titleText_accessor_storage = (__runInitializers(this, __titleIcon_extraInitializers), __runInitializers(this, __titleText_initializers, EMPTY_STRING));
        /**
         * Texte du titre récupéré depuis les attributs de données du composant (`data-title-text`).
         * @private
         */
        get _titleText() { return this.#_titleText_accessor_storage; }
        set _titleText(value) { this.#_titleText_accessor_storage = value; }
        #_titleLink_accessor_storage = (__runInitializers(this, __titleText_extraInitializers), __runInitializers(this, __titleLink_initializers, EMPTY_STRING));
        /**
         * Lien du titre récupéré depuis les attributs de données du composant (`data-title-link`).
         * @private
         */
        get _titleLink() { return this.#_titleLink_accessor_storage; }
        set _titleLink(value) { this.#_titleLink_accessor_storage = value; }
        /**
         * Retourne les données du titre agrégées sous forme d'un objet `TitleData`.
         * @returns Un objet encapsulant l'icône, le texte, le lien et la validité du titre.
         * @private
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
         * Indique si la carte est actuellement en état de chargement.
         * Si vrai, la carte affiche un spinner, masque le corps et désactive ses évènements pointer.
         * @returns `true` si la carte charge, sinon `false`.
         */
        get loading() {
            return this.hasAttribute(STATE_LOADING);
        }
        /**
         * Définit l'état de chargement de la carte.
         * @param value - `true` pour activer le chargement, `false` pour le désactiver.
         */
        set loading(value) {
            if (value) {
                this.setAttribute(STATE_LOADING, STATE_LOADING);
            }
            else {
                this.removeAttribute(STATE_LOADING);
            }
        }
        /**
         * Indique si la carte est configurée pour être cliquable et interactive.
         * @returns `true` si la carte est cliquable, sinon `false`.
         */
        get clickable() {
            return this.hasAttribute(STATE_CLICKABLE);
        }
        /**
         * Définit si la carte doit être cliquable ou non, ajustant son rôle pour l'accessibilité.
         * @param value - `true` pour la rendre cliquable, `false` sinon.
         */
        set clickable(value) {
            if (value) {
                this.setAttribute(STATE_CLICKABLE, STATE_CLICKABLE);
                setButtonRole(this);
            }
            else {
                this.removeAttribute(STATE_CLICKABLE);
                removeButtonRole(this);
            }
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        /**
         * Initialise une nouvelle instance de `HTMLBnumCardElement`.
         */
        constructor() {
            super();
            __runInitializers(this, __titleLink_extraInitializers);
        }
        /**
         * Étape de pré-chargement du cycle de vie du composant.
         * Met en place les écouteurs d'évènements initiaux.
         * @protected
         */
        _p_preload() {
            this.#_listenClick();
        }
        /**
         * Construit et insère les éléments du DOM interne de la carte.
         * @param container - Le conteneur cible (Shadow Root ou HTMLElement) où créer le DOM.
         * @protected
         */
        _p_buildDOM(container) {
            const titleData = this._titleData;
            if (titleData.has()) {
                HTMLBnumCardTitle.Create(titleData.text || EMPTY_STRING, {
                    icon: titleData.icon || null,
                    link: titleData.link || null,
                }).appendTo(container.querySelector(`slot[name="${SLOT_TITLE}"]`));
            }
            this.#_updateDOM();
        }
        /**
         * Méthode appelée lors de la modification d'un attribut observé.
         * @param name - Le nom de l'attribut ayant changé.
         * @param oldVal - La valeur précédente de l'attribut.
         * @param newVal - La nouvelle valeur de l'attribut.
         * @protected
         */
        _p_update(name, oldVal, newVal) {
            if (name === STATE_LOADING) {
                this.trigger(EVENT_LOADING, {
                    oldValue: oldVal,
                    newValue: newVal,
                    caller: this,
                });
            }
            this.#_updateDOM();
        }
        //#endregion Lifecycle
        //#region Private methods
        /**
         * Synchronise l'affichage du DOM avec l'état interne actuel du composant.
         * @private
         */
        #_updateDOM() {
            this._p_clearStates();
            if (this.clickable)
                this._p_addState(STATE_CLICKABLE);
            if (this.loading) {
                this._p_addState(STATE_LOADING);
                if (!this.#_loadingElement) {
                    const div = this.shadowRoot.querySelector(`.${CSS_CLASS_BODY}`);
                    div.appendChild(this.#_getLoading());
                }
            }
        }
        /**
         * Instancie et retourne l'élément HTML servant d'indicateur de chargement (spinner).
         * @returns Le conteneur HTML du spinner.
         * @private
         */
        #_getLoading() {
            if (!this.#_loadingElement) {
                const loadingDiv = document.createElement('div');
                loadingDiv.classList.add(CSS_CLASS_LOADING);
                const spinner = HTMLBnumIcon.Create(ICON_SPINNER).addClass('loader');
                loadingDiv.appendChild(spinner);
                this.#_loadingElement = loadingDiv;
            }
            return this.#_loadingElement;
        }
        /**
         * Attache un écouteur sur l'évènement `click` du composant.
         * @returns La fonction associée à la gestion du clic.
         * @private
         */
        get #_listenClick() { return _private__listenClick_descriptor.value; }
        /**
         * Traite l'évènement de clic sur la carte si celle-ci est cliquable.
         * @param event - L'évènement déclenché par l'utilisateur.
         * @private
         */
        #_handleClick(event) {
            if (this.clickable) {
                this.trigger(EVENT_CLICK, { originalEvent: event });
            }
        }
        /**
         * Demande une mise à jour ou la réinitialisation du titre via le planificateur.
         * @param element - Le nouvel élément titre ou le symbole indiquant une réinitialisation.
         * @private
         */
        #_requestUpdateTitle(element) {
            this.#_scheduleTitle ??= new Scheduler(el => this.#_updateOrResetTitle(el));
            this.#_scheduleTitle.schedule(element);
        }
        /**
         * Oriente le composant vers une mise à jour ou une réinitialisation du titre.
         * @param element - Le nouvel élément ou le symbole de réinitialisation.
         * @private
         */
        #_updateOrResetTitle(element) {
            if (element === SYMBOL_RESET)
                this.#_resetTitle();
            else
                this.#_updateTitle(element);
        }
        /**
         * Met à jour le DOM pour remplacer le contenu actuel du slot de titre par le nouvel élément.
         * @param element - L'élément à insérer dans le slot de titre.
         * @private
         */
        #_updateTitle(element) {
            element.setAttribute('slot', SLOT_TITLE);
            const oldTitles = this.querySelectorAll(`[slot="${SLOT_TITLE}"]`);
            oldTitles.forEach(node => node.remove());
            this.appendChild(element);
        }
        /**
         * Supprime tous les éléments enfants rattachés au slot de titre.
         * @private
         */
        #_resetTitle() {
            const nodes = this.querySelectorAll(`[slot="${SLOT_TITLE}"]`);
            nodes.forEach(node => node.remove());
        }
        /**
         * Demande une mise à jour ou la réinitialisation du corps de la carte via le planificateur.
         * @param element - Le nouvel élément de corps ou le symbole indiquant une réinitialisation.
         * @private
         */
        #_requestUpdateBody(element) {
            this.#_scheduleBody ??= new Scheduler(el => this.#_updateOrResetBody(el));
            this.#_scheduleBody.schedule(element);
        }
        /**
         * Oriente le composant vers une mise à jour ou une réinitialisation du corps.
         * @param element - Le nouvel élément ou le symbole de réinitialisation.
         * @private
         */
        #_updateOrResetBody(element) {
            if (element === SYMBOL_RESET)
                this.#_resetBody();
            else
                this.#_updateBody(element);
        }
        /**
         * Met à jour le DOM pour remplacer le contenu du corps de la carte par le nouvel élément.
         * @param element - L'élément à insérer dans le corps de la carte.
         * @private
         */
        #_updateBody(element) {
            element.removeAttribute('slot');
            const oldBodyNodes = Array.from(this.childNodes).filter(node => (node.nodeType === Node.ELEMENT_NODE &&
                node.getAttribute('slot') !== SLOT_TITLE) ||
                (node.nodeType === Node.TEXT_NODE &&
                    node.textContent?.trim() !== EMPTY_STRING));
            oldBodyNodes.forEach(node => node.remove());
            this.appendChild(element);
        }
        /**
         * Supprime tous les éléments enfants appartenant au corps (hors slot de titre).
         * @private
         */
        #_resetBody() {
            const nodes = Array.from(this.childNodes).filter(node => (node.nodeType === Node.ELEMENT_NODE &&
                node.getAttribute('slot') !== SLOT_TITLE) ||
                (node.nodeType === Node.TEXT_NODE &&
                    node.textContent?.trim() !== EMPTY_STRING));
            nodes.forEach(node => node.remove());
        }
        /**
         * Demande l'ajout d'un élément supplémentaire dans la carte via le planificateur.
         * @param appended - Données de l'élément planifié à ajouter.
         * @private
         */
        #_requestAppendElement(appended) {
            this.#_scheduleAppend ??= new Scheduler(el => this.#_appendElement(el));
            this.#_scheduleAppend.schedule(appended);
        }
        /**
         * Ajoute physiquement un élément planifié au sein de la carte.
         * @param appended - Données de l'élément contenant l'élément et son slot potentiel.
         * @private
         */
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
         * Remplace intégralement le contenu du slot "title" par l'élément fourni.
         * @param element - Le nouvel élément à insérer comme titre.
         * @returns L'instance courante pour le chaînage d'appels.
         */
        updateTitle(element) {
            this.#_requestUpdateTitle(element);
            return this;
        }
        /**
         * Remplace intégralement le contenu du corps principal (slot par défaut) par l'élément fourni.
         * @param element - Le nouvel élément à insérer dans le corps.
         * @returns L'instance courante pour le chaînage d'appels.
         */
        updateBody(element) {
            this.#_requestUpdateBody(element);
            return this;
        }
        /**
         * Supprime tous les éléments actuellement insérés dans le slot "title".
         * @returns L'instance courante pour le chaînage d'appels.
         */
        clearTitle() {
            this.#_requestUpdateTitle(SYMBOL_RESET);
            return this;
        }
        /**
         * Supprime tous les éléments actuellement insérés dans le corps principal (hors slot "title").
         * @returns L'instance courante pour le chaînage d'appels.
         */
        clearBody() {
            this.#_requestUpdateBody(SYMBOL_RESET);
            return this;
        }
        /**
         * Ajoute un nouvel élément au sein du slot "title", préservant les éléments déjà présents.
         * @param element - L'élément à ajouter au titre.
         * @returns L'instance courante pour le chaînage d'appels.
         */
        appendToTitle(element) {
            this.#_requestAppendElement(new ScheduleElementAppend(element, SLOT_TITLE));
            return this;
        }
        /**
         * Ajoute un nouvel élément au sein du corps de la carte, préservant les éléments déjà présents.
         * @param element - L'élément à ajouter au corps.
         * @returns L'instance courante pour le chaînage d'appels.
         */
        appendToBody(element) {
            this.#_requestAppendElement(new ScheduleElementAppend(element));
            return this;
        }
        //#endregion Public methods
        //#region Static properties
        /**
         * Instancie une nouvelle `HTMLBnumCardElement` initialisée avec les options spécifiées.
         *
         * @param options - Objet de configuration de la carte.
         * @param options.title - Élément pour le titre de la carte (optionnel).
         * @param options.body - Élément pour le corps de la carte (optionnel).
         * @param options.clickable - Indique si la carte est cliquable (défaut: `false`).
         * @param options.loading - Indique si la carte est en état de chargement (défaut: `false`).
         * @returns Une nouvelle instance configurée de l'élément HTML.
         */
        static Create({ title = null, body = null, clickable = false, loading = false, } = {}) {
            const card = document.createElement(this.TAG);
            if (title)
                card.updateTitle(title);
            if (body)
                card.updateBody(body);
            if (clickable)
                card.setAttribute(STATE_CLICKABLE, STATE_CLICKABLE);
            if (loading)
                card.setAttribute(STATE_LOADING, STATE_LOADING);
            return card;
        }
    });
    return _classThis;
})();

var css_248z$2 = ":host{display:var(--bnum-card-agenda-display,block)}[hidden]{display:none}";

/**
 * ID du titre de la carte.
 */
const ID_CARD_TITLE$1 = 'bnum-card-title';
/**
 * ID de l'élément affiché quand il n'y a pas d'événements.
 */
const ID_CARD_ITEM_NO_ELEMENTS$1 = 'no-elements';
/**
 * Nom de l'événement déclenché lorsque les éléments changent.
 */
const CHANGE_EVENT$1 = 'bnum-card-agenda:change';
/**
 * Clé de données pour l'URL.
 */
const DATA_URL$1 = 'url';
/**
 * Attribut pour l'URL des données.
 */
const ATTRIBUTE_DATA_URL$1 = `data-${DATA_URL$1}`;
/**
 * Attribut pour l'état de chargement.
 */
const ATTRIBUTE_LOADING$1 = 'loading';

function onElementChangedInitializer$1(event, instance) {
    event.add(EVENT_DEFAULT, data => {
        instance.trigger(CHANGE_EVENT$1, { detail: data });
    });
}

//#region Global constants
const TEXT_LAST_EVENTS = BnumConfig.Get('local_keys').last_events;
const TEXT_NO_EVENTS = BnumConfig.Get('local_keys').no_events;
//#endregion Global constants
//#region Template
const TEMPLATE$2 = (h(HTMLBnumCardElement, { children: [h(HTMLBnumCardTitle, { id: ID_CARD_TITLE$1, slot: "title", "data-icon": "today", children: TEXT_LAST_EVENTS }), h(HTMLBnumCardList, { children: [h("slot", {}), h(HTMLBnumCardItem, { id: ID_CARD_ITEM_NO_ELEMENTS$1, disabled: true, hidden: true, children: TEXT_NO_EVENTS })] })] }));
//#endregion Template
/**
 * Organisme qui permet d'afficher simplement une liste d'évènements dans une carte.
 *
 * @structure Avec des éléments
 * <bnum-card-agenda>
 * <bnum-card-item-agenda
 *    data-date="2024-01-01"
 *    data-start-date="2024-01-01 08:00:00"
 *    data-end-date="2024-01-01 10:00:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 * <bnum-card-item-agenda
 *    data-date="2025-11-20"
 *    data-start-date="2025-10-20 09:40:00"
 *    data-end-date="2025-12-20 10:10:00"
 *    data-title="Réunion de projet"
 *    data-location="Salle de conférence">
 * </bnum-card-item-agenda>
 * <bnum-card-item-agenda all-day
 *    data-date="2025-11-21"
 *    data-title="Télétravail"
 *    data-location="A la maison">
 * </bnum-card-item-agenda>
 * </bnum-card-agenda>
 *
 * @structure Sans éléments
 * <bnum-card-agenda>
 * </bnum-card-agenda>
 *
 * @structure Avec une url
 * <bnum-card-agenda data-url="#">
 * </bnum-card-agenda>
 *
 * @slot (default) - Contenu des éléments de type HTMLBnumCardItemAgenda.
 *
 * @attr {string | undefined} (optional) data-url - Ajoute une url au titre. Ne rien mettre pour que l'option "url" du titre ne s'active pas.
 * @attr {string | undefined} (optional) loading - Si présent, affiche le mode loading.
 *
 * @event {CustomEvent<HTMLBnumCardItemAgenda[]>} bnum-card-agenda:change - Déclenché lorsque les éléments changent (ajout/suppression).
 *
 * @cssvar {block} --bnum-card-agenda - Définit le display du composant. Par défaut à "block".
 */
let HTMLBnumCardAgenda = (() => {
    let _classDecorators = [Define({ tag: TAG_CARD_AGENDA, styles: css_248z$2, template: TEMPLATE$2 }), Observe(ATTRIBUTE_LOADING$1)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElement;
    let _instanceExtraInitializers = [];
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _onElementChanged_decorators;
    let _onElementChanged_initializers = [];
    let _onElementChanged_extraInitializers = [];
    let _loading_decorators;
    let _loading_initializers = [];
    let _loading_extraInitializers = [];
    let _private__url_decorators;
    let _private__url_initializers = [];
    let _private__url_extraInitializers = [];
    let _private__url_descriptor;
    let _private__sortChildren_decorators;
    let _private__sortChildren_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    cardTitle: `#${ID_CARD_TITLE$1}`,
                    slot: 'slot',
                    noElements: `#${ID_CARD_ITEM_NO_ELEMENTS$1}`,
                })];
            _onElementChanged_decorators = [Listener(onElementChangedInitializer$1)];
            _loading_decorators = [Attr()];
            _private__url_decorators = [Data()];
            _private__sortChildren_decorators = [RenderFrame()];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _onElementChanged_decorators, { kind: "accessor", name: "onElementChanged", static: false, private: false, access: { has: obj => "onElementChanged" in obj, get: obj => obj.onElementChanged, set: (obj, value) => { obj.onElementChanged = value; } }, metadata: _metadata }, _onElementChanged_initializers, _onElementChanged_extraInitializers);
            __esDecorate(this, null, _loading_decorators, { kind: "accessor", name: "loading", static: false, private: false, access: { has: obj => "loading" in obj, get: obj => obj.loading, set: (obj, value) => { obj.loading = value; } }, metadata: _metadata }, _loading_initializers, _loading_extraInitializers);
            __esDecorate(this, _private__url_descriptor = { get: __setFunctionName(function () { return this.#_url_accessor_storage; }, "#_url", "get"), set: __setFunctionName(function (value) { this.#_url_accessor_storage = value; }, "#_url", "set") }, _private__url_decorators, { kind: "accessor", name: "#_url", static: false, private: true, access: { has: obj => #_url in obj, get: obj => obj.#_url, set: (obj, value) => { obj.#_url = value; } }, metadata: _metadata }, _private__url_initializers, _private__url_extraInitializers);
            __esDecorate(this, _private__sortChildren_descriptor = { value: __setFunctionName(function () {
                    // Récupérer les éléments assignés au slot
                    const elements = this.#_ui.slot.assignedElements();
                    // Filtrer pour être sûr de ne trier que des événements (sécurité)
                    const agendaItems = elements.filter(el => el.tagName.toLowerCase().includes(HTMLBnumCardItemAgenda.TAG));
                    if (agendaItems.length === 0) {
                        this.#_ui.noElements.hidden = false;
                        this.#_ui.slot.hidden = true;
                        return;
                    }
                    else {
                        this.#_ui.noElements.hidden = true;
                        this.#_ui.slot.hidden = false;
                    }
                    if (agendaItems.length < 2)
                        return; // Pas besoin de trier
                    // 2. Vérifier si un tri est nécessaire (optimisation)
                    let isSorted = true;
                    for (let i = 0; i < agendaItems.length - 1; i++) {
                        if (this.#_getDate(agendaItems[i]) < this.#_getDate(agendaItems[i + 1])) {
                            isSorted = false;
                            break;
                        }
                        else if (this.#_getDate(agendaItems[i]) === this.#_getDate(agendaItems[i + 1])) {
                            // Même date de base, on regardmailItemse la date de début
                            if (this.#_getStartDate(agendaItems[i]) <
                                this.#_getStartDate(agendaItems[i + 1])) {
                                isSorted = false;
                                break;
                            }
                        }
                    }
                    if (isSorted)
                        return;
                    this.#_isSorting = true; // Verrouiller pour éviter que le déplacement ne relance slotchange
                    // Réinsérer dans l'ordre via un Fragment (1 seul Reflow)
                    const fragment = document.createDocumentFragment();
                    const sortedItems = ArrayUtils.sortByDatesDescending(agendaItems, x => this.#_getDate(x), x => this.#_getStartDate(x));
                    fragment.append(...sortedItems);
                    this.appendChild(fragment); // Déplace les éléments existants, ne les recrée pas.
                    // Notifier le changement
                    this.onElementChanged.call(agendaItems);
                    // Déverrouiller après que le microtask de mutation soit passé
                    setTimeout(() => {
                        this.#_isSorting = false;
                    }, 0);
                }, "#_sortChildren") }, _private__sortChildren_decorators, { kind: "method", name: "#_sortChildren", static: false, private: true, access: { has: obj => #_sortChildren in obj, get: obj => obj.#_sortChildren }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        #_isSorting = (__runInitializers(this, _instanceExtraInitializers), false);
        #_card = null;
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        //#endregion Private fields
        //#region Getters/Setters
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #onElementChanged_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _onElementChanged_initializers, void 0));
        /**
         * Déclenché lorsque les éléments changent (ajout/suppression).
         */
        get onElementChanged() { return this.#onElementChanged_accessor_storage; }
        set onElementChanged(value) { this.#onElementChanged_accessor_storage = value; }
        #loading_accessor_storage = (__runInitializers(this, _onElementChanged_extraInitializers), __runInitializers(this, _loading_initializers, false));
        get loading() { return this.#loading_accessor_storage; }
        set loading(value) { this.#loading_accessor_storage = value; }
        #_url_accessor_storage = (__runInitializers(this, _loading_extraInitializers), __runInitializers(this, _private__url_initializers, EMPTY_STRING));
        get #_url() { return _private__url_descriptor.get.call(this); }
        set #_url(value) { return _private__url_descriptor.set.call(this, value); }
        get #_cardPart() {
            if (this.#_card === null) {
                this.#_card =
                    this.querySelector?.(HTMLBnumCardElement.TAG) ??
                        this.shadowRoot?.querySelector?.(HTMLBnumCardElement.TAG) ??
                        null;
            }
            return this.#_card;
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
            __runInitializers(this, _private__url_extraInitializers);
        }
        _p_attach() {
            if (this.#_url !== EMPTY_STRING)
                this.#_ui.cardTitle.url = this.#_url;
            // On écoute les changements dans le slot (Items statiques ou ajoutés via JS)
            this.#_ui.slot.addEventListener('slotchange', this.#_handleSlotChange.bind(this));
            this.#_handleSlotChange();
        }
        _p_update(name, _, newVal) {
            switch (name) {
                case ATTRIBUTE_LOADING$1:
                    if (newVal === null)
                        this.#_cardPart.removeAttribute(ATTRIBUTE_LOADING$1);
                    else
                        this.#_cardPart.setAttribute(ATTRIBUTE_LOADING$1, newVal ?? EMPTY_STRING);
                    break;
            }
        }
        //#endregion Lifecycle
        //#region Public methods
        /**
         * Ajoute des éléments.
         *
         * Note: On ajoute simplement au Light DOM. Le slotchange détectera l'ajout et déclenchera le tri.
         * @param content Elements à ajouter
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
            this.#_sortChildren();
        }
        /**
         * Tri les éléments enfants de la liste par date décroissante.
         */
        get #_sortChildren() { return _private__sortChildren_descriptor.value; }
        /**
         * Helper pour parser la date de manière robuste
         */
        #_getDate(item) {
            return item.baseDate.getTime();
        }
        /**
         * Helper pour parser la date de manière robuste
         */
        #_getStartDate(item) {
            return item.isAllDay ? this.#_getDate(item) : item.startDate.getTime();
        }
        //#endregion Private methods
        //#region Static methods
        /**
         * Méthode statique pour créer une instance du composant.
         * @param param0 Options de création
         * @param param0.contents Contenus initiaux à ajouter
         * @param param0.url URL du titre
         * @returns Nouvelle node HTMLBnumCardAgenda
         */
        static Create({ contents = [], url = EMPTY_STRING, } = {}) {
            const node = document.createElement(this.TAG);
            if (url !== EMPTY_STRING)
                node.setAttribute(ATTRIBUTE_DATA_URL$1, url);
            if (contents.length > 0)
                node.add(...contents);
            return node;
        }
    });
    return _classThis;
})();

var css_248z$1 = ":host{display:var(--bnum-card-email-display,block)}[hidden]{display:none}";

/**
 * ID du titre de la carte.
 */
const ID_CARD_TITLE = 'bnum-card-title';
/**
 * ID de l'élément affiché quand il n'y a pas de mails.
 */
const ID_CARD_ITEM_NO_ELEMENTS = 'no-elements';
/**
 * Nom de l'événement déclenché lorsque les éléments changent (ajout/suppression).
 */
const CHANGE_EVENT = 'bnum-card-email:change';
/**
 * Clé de données pour l'URL.
 */
const DATA_URL = 'url';
/**
 * Attribut pour l'URL des données.
 */
const ATTRIBUTE_DATA_URL = `data-${DATA_URL}`;
/**
 * Attribut pour l'état de chargement.
 */
const ATTRIBUTE_LOADING = 'loading';

function onElementChangedInitializer(event, instance) {
    event.add(EVENT_DEFAULT, data => {
        instance.trigger(CHANGE_EVENT, { detail: data });
    });
}

//#region Global constants
const TEXT_LAST_MAILS = BnumConfig.Get('local_keys').last_mails;
const TEXT_NO_MAILS = BnumConfig.Get('local_keys').no_mails;
//#endregion Global constants
//#region Template
const TEMPLATE$1 = (h(HTMLBnumCardElement, { children: [h(HTMLBnumCardTitle, { id: ID_CARD_TITLE, slot: "title", "data-icon": "mail", children: TEXT_LAST_MAILS }), h(HTMLBnumCardList, { children: [h("slot", {}), h(HTMLBnumCardItem, { id: ID_CARD_ITEM_NO_ELEMENTS, disabled: true, hidden: true, children: TEXT_NO_MAILS })] })] }));
//#endregion Template
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
 * @attr {string | undefined} (optional) data-url - Ajoute une url au titre. Ne rien mettre pour que l'option "url" du titre ne s'active pas.
 * @attr {string | undefined} (optional) loading - Si présent, affiche le mode loading.
 *
 * @event {CustomEvent<HTMLBnumCardItemMail[]>} bnum-card-email:change - Déclenché lorsque les éléments changent (ajout/suppression).
 *
 * @cssvar {block} --bnum-card-email-display - Définit le display du composant. Par défaut à "block".
 */
let HTMLBnumCardEmail = (() => {
    let _classDecorators = [Define({ tag: TAG_CARD_EMAIL, styles: css_248z$1, template: TEMPLATE$1 }), Observe(ATTRIBUTE_LOADING)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElement;
    let _instanceExtraInitializers = [];
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _onElementChanged_decorators;
    let _onElementChanged_initializers = [];
    let _onElementChanged_extraInitializers = [];
    let _loading_decorators;
    let _loading_initializers = [];
    let _loading_extraInitializers = [];
    let _private__url_decorators;
    let _private__url_initializers = [];
    let _private__url_extraInitializers = [];
    let _private__url_descriptor;
    let _private__sortChildren_decorators;
    let _private__sortChildren_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    cardTitle: `#${ID_CARD_TITLE}`,
                    slot: 'slot',
                    noElements: `#${ID_CARD_ITEM_NO_ELEMENTS}`,
                })];
            _onElementChanged_decorators = [Listener(onElementChangedInitializer)];
            _loading_decorators = [Attr()];
            _private__url_decorators = [Data()];
            _private__sortChildren_decorators = [RenderFrame()];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _onElementChanged_decorators, { kind: "accessor", name: "onElementChanged", static: false, private: false, access: { has: obj => "onElementChanged" in obj, get: obj => obj.onElementChanged, set: (obj, value) => { obj.onElementChanged = value; } }, metadata: _metadata }, _onElementChanged_initializers, _onElementChanged_extraInitializers);
            __esDecorate(this, null, _loading_decorators, { kind: "accessor", name: "loading", static: false, private: false, access: { has: obj => "loading" in obj, get: obj => obj.loading, set: (obj, value) => { obj.loading = value; } }, metadata: _metadata }, _loading_initializers, _loading_extraInitializers);
            __esDecorate(this, _private__url_descriptor = { get: __setFunctionName(function () { return this.#_url_accessor_storage; }, "#_url", "get"), set: __setFunctionName(function (value) { this.#_url_accessor_storage = value; }, "#_url", "set") }, _private__url_decorators, { kind: "accessor", name: "#_url", static: false, private: true, access: { has: obj => #_url in obj, get: obj => obj.#_url, set: (obj, value) => { obj.#_url = value; } }, metadata: _metadata }, _private__url_initializers, _private__url_extraInitializers);
            __esDecorate(this, _private__sortChildren_descriptor = { value: __setFunctionName(function () {
                    // 1. Récupérer les éléments assignés au slot (Uniquement les Nodes Elements, pas le texte)
                    const elements = this.#_ui.slot.assignedElements();
                    // Filtrer pour être sûr de ne trier que des mails (sécurité)
                    const mailItems = elements.filter(el => el.tagName.toLowerCase().includes(HTMLBnumCardItemMail.TAG));
                    if (mailItems.length === 0) {
                        this.#_ui.noElements.hidden = false;
                        this.#_ui.slot.hidden = true;
                        return;
                    }
                    else {
                        this.#_ui.noElements.hidden = true;
                        this.#_ui.slot.hidden = false;
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
                    mailItems.forEach(item => fragment.appendChild(item));
                    this.appendChild(fragment); // Déplace les éléments existants, ne les recrée pas.
                    // Notifier le changement
                    this.onElementChanged.call(mailItems);
                    // Déverrouiller après que le microtask de mutation soit passé
                    setTimeout(() => {
                        this.#_isSorting = false;
                    }, 0);
                }, "#_sortChildren") }, _private__sortChildren_decorators, { kind: "method", name: "#_sortChildren", static: false, private: true, access: { has: obj => #_sortChildren in obj, get: obj => obj.#_sortChildren }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        #_isSorting = (__runInitializers(this, _instanceExtraInitializers), false);
        #_card = null;
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        //#endregion Private fields
        //#region Getters/Setters
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #onElementChanged_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _onElementChanged_initializers, void 0));
        /**
         * Déclenché lorsque les éléments changent (ajout/suppression).
         */
        get onElementChanged() { return this.#onElementChanged_accessor_storage; }
        set onElementChanged(value) { this.#onElementChanged_accessor_storage = value; }
        #loading_accessor_storage = (__runInitializers(this, _onElementChanged_extraInitializers), __runInitializers(this, _loading_initializers, false));
        get loading() { return this.#loading_accessor_storage; }
        set loading(value) { this.#loading_accessor_storage = value; }
        #_url_accessor_storage = (__runInitializers(this, _loading_extraInitializers), __runInitializers(this, _private__url_initializers, EMPTY_STRING));
        get #_url() { return _private__url_descriptor.get.call(this); }
        set #_url(value) { return _private__url_descriptor.set.call(this, value); }
        get #_cardPart() {
            if (this.#_card === null) {
                this.#_card =
                    this.querySelector?.(HTMLBnumCardElement.TAG) ??
                        this.shadowRoot?.querySelector?.(HTMLBnumCardElement.TAG) ??
                        null;
            }
            return this.#_card;
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
            __runInitializers(this, _private__url_extraInitializers);
        }
        _p_attach() {
            if (this.#_url !== EMPTY_STRING)
                this.#_ui.cardTitle.url = this.#_url;
            // On écoute les changements dans le slot (Items statiques ou ajoutés via JS)
            this.#_ui.slot.addEventListener('slotchange', this.#_handleSlotChange.bind(this));
            this.#_handleSlotChange();
        }
        _p_update(name, _, newVal) {
            switch (name) {
                case ATTRIBUTE_LOADING:
                    if (newVal === null)
                        this.#_cardPart.removeAttribute(ATTRIBUTE_LOADING);
                    else
                        this.#_cardPart.setAttribute(ATTRIBUTE_LOADING, newVal ?? EMPTY_STRING);
                    break;
            }
        }
        //#endregion Lifecycle
        //#region Public methods
        /**
         * Ajoute des éléments.
         *
         * Note: On ajoute simplement au Light DOM. Le slotchange détectera l'ajout et déclenchera le tri.
         * @param content Elements à ajouter
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
            this.#_sortChildren();
        }
        /**
         * Tri les éléments enfants de la liste par date décroissante.
         */
        get #_sortChildren() { return _private__sortChildren_descriptor.value; }
        /**
         * Helper pour parser la date de manière robuste
         */
        #_getDate(item) {
            const dateStr = item.getAttribute(ATTRIBUTE_DATA_DATE);
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
                node.setAttribute(ATTRIBUTE_DATA_URL, url);
            if (contents.length > 0)
                node.add(...contents);
            return node;
        }
    });
    return _classThis;
})();

var css_248z = "@keyframes rotate360{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}:host{background-color:var(--bnum-header-background-color,var(--bnum-color-surface,#f6f6f6));border-bottom:var(--bnum-header-border-bottom,var(--bnum-border-in-surface,solid 1px #ddd));box-sizing:border-box;display:var(--bnum-header-display,block);height:var(--bnum-header-height,60px)}:host .bnum-header-container{box-sizing:border-box;display:flex;height:100%;padding:0 1rem;width:100%}:host .header-left,:host .header-right{align-items:center;display:flex;flex:1}:host .header-left{gap:var(--bnum-header-left-gap,var(--bnum-space-s,10px));justify-content:flex-start}:host .header-left ::slotted(div),:host .header-left ::slotted(h1),:host .header-left ::slotted(h2),:host .header-left ::slotted(p),:host .header-left ::slotted(span),:host .header-left h1{--_internal-font-size:var(--bnum-font-size-xl,1.25rem);--bnum-font-size-h1:var(--bnum-header-title-font-size,var(--_internal-font-size));align-items:center;display:flex;line-height:1.2;margin:var(--bnum-header-title-margin,0)!important}:host .header-right{gap:var(--bnum-header-right-gap,var(--bnum-space-l,20px));justify-content:flex-end}:host ::slotted(bnum-img),:host ::slotted(img),:host bnum-img,:host img{display:block;height:var(--bnum-header-logo-height,45px);-o-object-fit:contain;object-fit:contain;width:auto}::slotted(bnum-secondary-button){--bnum-button-padding:var(--bnum-header-background-button-padding,5px 3px)}::slotted(.main-action-button){-padding:var(--bnum-header-background-button-padding,5px 3px)}:host(:state(with-background)){background-color:unset!important;background-image:var(--bnum-header-background-image);background-position:50%!important;background-size:cover!important;color:var(--bnum-header-with-background-color,#fff)}:host(:state(with-background)) .header-modifier{background:linear-gradient(90deg,#161616,transparent) 0 /50% 100% no-repeat,linear-gradient(270deg,#161616,transparent) 100% /50% 100% no-repeat}:host(:state(with-background)) ::slotted(.main-action-button),:host(:state(with-background)) ::slotted(bnum-secondary-button){background-color:#1616164d;border-color:var(--bnum-header-main-action-border-color,#fff);color:var(--bnum-header-main-action-color,#fff)}:host(:state(with-background)) ::slotted(.main-action-button):hover,:host(:state(with-background)) ::slotted(bnum-secondary-button):hover{background-color:#343434d2}:host(:state(with-background)) ::slotted(.main-action-button):active,:host(:state(with-background)) ::slotted(bnum-secondary-button):active{background-color:#474747ee}:host(:state(with-background)) ::slotted(.main-action-button:hover),:host(:state(with-background)) ::slotted(bnum-secondary-button:hover){background-color:#343434d2}:host(:state(with-background)) ::slotted(.main-action-button:active),:host(:state(with-background)) ::slotted(bnum-secondary-button:active){background-color:#474747ee}";

const DATA_BACKGROUND = 'background';
const CLASS_HEADER_CONTAINER = 'bnum-header-container';
const CLASS_HEADER_LEFT = 'header-left';
const CLASS_HEADER_RIGHT = 'header-right';
const CLASS_HEADER_TITLE = 'header-title';
const CLASS_HEADER_CUSTOM = 'header-custom';
const CLASS_HEADER_MODIFIER = 'header-modifier';
const PART_HEADER_CONTAINER = 'header-container';
const PART_HEADER_LEFT = 'header-left';
const PART_HEADER_RIGHT = 'header-right';
const PART_HEADER_TITLE = 'header-title';
const PART_HEADER_CUSTOM = 'header-custom';
const ID_TITLE_TEXT = 'title-text';
const ID_TITLE_CUSTOM = 'title-custom';
const SLOT_NAME_LOGO = 'logo';
const SLOT_NAME_TITLE = 'title';
const SLOT_NAME_ACTIONS = 'actions';
const SLOT_NAME_AVATAR = 'avatar';
const EVENT_BACKGROUND_CHANGED = 'bnum-header:background.changed';
const CSS_VARIABLE_BACKGROUND_IMAGE = '--bnum-header-background-image';
const STATE_WITH_BACKGROUND = 'with-background';

function onBackgroundChangedInitializer(event, instance) {
    event.add(EVENT_DEFAULT, newBackground => {
        instance.trigger(EVENT_BACKGROUND_CHANGED, { newBackground });
    });
}

//#endregion Types
//#region Template
const TEMPLATE = (h("div", { class: CLASS_HEADER_MODIFIER, children: h("div", { part: PART_HEADER_CONTAINER, class: CLASS_HEADER_CONTAINER, children: [h("div", { part: PART_HEADER_LEFT, class: CLASS_HEADER_LEFT, children: [h("slot", { name: SLOT_NAME_LOGO }), h("slot", { name: SLOT_NAME_TITLE }), h("h1", { part: PART_HEADER_TITLE, id: ID_TITLE_TEXT, class: CLASS_HEADER_TITLE, hidden: true }), h("div", { part: PART_HEADER_CUSTOM, id: ID_TITLE_CUSTOM, class: CLASS_HEADER_CUSTOM, hidden: true })] }), h("div", { part: PART_HEADER_RIGHT, class: CLASS_HEADER_RIGHT, children: [h("slot", { name: SLOT_NAME_ACTIONS }), h("slot", { name: SLOT_NAME_AVATAR })] })] }) }));
//#endregion Template
/**
 * Composant Header du Bnum
 *
 * @structure Par défaut
 * <bnum-header>
 * <img slot="logo" src="assets/bnumloader.svg" alt="Logo du bnum"/>
 * <h1 slot="title">Accueil</h1>
 *
 * <bnum-secondary-button slot="actions" data-icon="add">Créer</bnum-secondary-button>
 * <bnum-icon-button slot="actions">article</bnum-icon-button>
 * <bnum-icon-button slot="actions">help</bnum-icon-button>
 * <bnum-icon-button slot="actions">settings</bnum-icon-button>
 * <bnum-icon-button slot="actions">notifications</bnum-icon-button>
 *
 * <img slot="avatar" style="border-radius: 100%" src="assets/avatar.png" alt="Avatar de remplacement"></img>
 * </bnum-header>
 *
 * @structure Avec image de fond
 * <bnum-header data-background="assets/headerbackground.gif">
 * <img slot="logo" src="assets/bnumloader.svg" alt="Logo du bnum"/>
 * <h1 slot="title">Accueil</h1>
 *
 * <bnum-secondary-button slot="actions" data-icon="add">Créer</bnum-secondary-button>
 * <bnum-icon-button slot="actions">article</bnum-icon-button>
 * <bnum-icon-button slot="actions">help</bnum-icon-button>
 * <bnum-icon-button slot="actions">settings</bnum-icon-button>
 * <bnum-icon-button slot="actions">notifications</bnum-icon-button>
 *
 * <img slot="avatar" style="border-radius: 100%" src="assets/avatar.png" alt="Avatar de remplacement"></img>
 * </bnum-header>
 *
 * @slot logo - Slot pour le logo
 * @slot title - Slot pour le titre
 * @slot actions - Slot pour les actions
 * @slot avatar - Slot pour l'avatar
 *
 * @state with-background - Actif si une image de fond est définie
 *
 * @attr {string | undefined} (optional) data-background - Met une image de fond par défaut
 * @event {CustomEvent<{newBackground:Nullable<string>}>} bnum-header:background.changed - Événement déclenché lorsque l'image de fond change
 *
 * @cssvar {block} --bnum-header-display - Définit le type d'affichage du header
 * @cssvar {60px} --bnum-header-height - Hauteur du header
 * @cssvar {#f5f6fa} --bnum-header-background-color - Couleur de fond du header
 * @cssvar {1px solid #e5e7eb} --bnum-header-border-bottom - Bordure basse du header
 * @cssvar {8px} --bnum-header-left-gap - Espace à gauche entre les éléments du header
 * @cssvar {24px} --bnum-header-right-gap - Espace à droite entre les éléments du header
 * @cssvar {45px} --bnum-header-logo-height - Hauteur du logo dans le header
 * @cssvar {none} --bnum-header-background-image - Image de fond du header (par défaut aucune)
 * @cssvar {#ffffff} --bnum-header-with-background-color - Couleur du texte sur fond personnalisé
 * @cssvar {#ffffff} --bnum-header-main-action-border-color - Couleur de la bordure du bouton principal sur fond personnalisé
 * @cssvar {#ffffff} --bnum-header-main-action-color - Couleur du texte du bouton principal sur fond personnalisé
 * @cssvar {5px 3px} --bnum-header-background-button-padding - Padding de l'action principale
 * @cssvar {0} --bnum-header-title-margin - Marge du titre
 * @cssvar {1.25rem} --bnum-header-title-font-size - Taille de la police du titre
 */
let HTMLBnumHeader = (() => {
    let _classDecorators = [Define({ tag: TAG_HEADER, styles: css_248z, template: TEMPLATE })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _private__ui_decorators;
    let _private__ui_initializers = [];
    let _private__ui_extraInitializers = [];
    let _private__ui_descriptor;
    let _onBackgroundChanged_decorators;
    let _onBackgroundChanged_initializers = [];
    let _onBackgroundChanged_extraInitializers = [];
    let _imgBackground_decorators;
    let _imgBackground_initializers = [];
    let _imgBackground_extraInitializers = [];
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _private__ui_decorators = [UI({
                    slotTitle: `slot[name="${SLOT_NAME_TITLE}"]`,
                    titleText: `#${ID_TITLE_TEXT}`,
                    customTitleContainer: `#${ID_TITLE_CUSTOM}`,
                })];
            _onBackgroundChanged_decorators = [Listener(onBackgroundChangedInitializer)];
            _imgBackground_decorators = [Data(DATA_BACKGROUND)];
            __esDecorate(this, _private__ui_descriptor = { get: __setFunctionName(function () { return this.#_ui_accessor_storage; }, "#_ui", "get"), set: __setFunctionName(function (value) { this.#_ui_accessor_storage = value; }, "#_ui", "set") }, _private__ui_decorators, { kind: "accessor", name: "#_ui", static: false, private: true, access: { has: obj => #_ui in obj, get: obj => obj.#_ui, set: (obj, value) => { obj.#_ui = value; } }, metadata: _metadata }, _private__ui_initializers, _private__ui_extraInitializers);
            __esDecorate(this, null, _onBackgroundChanged_decorators, { kind: "accessor", name: "onBackgroundChanged", static: false, private: false, access: { has: obj => "onBackgroundChanged" in obj, get: obj => obj.onBackgroundChanged, set: (obj, value) => { obj.onBackgroundChanged = value; } }, metadata: _metadata }, _onBackgroundChanged_initializers, _onBackgroundChanged_extraInitializers);
            __esDecorate(this, null, _imgBackground_decorators, { kind: "accessor", name: "imgBackground", static: false, private: false, access: { has: obj => "imgBackground" in obj, get: obj => obj.imgBackground, set: (obj, value) => { obj.imgBackground = value; } }, metadata: _metadata }, _imgBackground_initializers, _imgBackground_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private fields
        // Scheduler pour éviter le layout thrashing
        /**
         * Scheduler pour la mise à jour du titre
         */
        #_scheduleUpdateTitle = null;
        /**
         * Scheduler pour la mise à jour de l'image de fond
         */
        #_scheduleUpdateBackground = null;
        #_ui_accessor_storage = __runInitializers(this, _private__ui_initializers, void 0);
        //#endregion Private fields
        //#region Getters/Setters
        get #_ui() { return _private__ui_descriptor.get.call(this); }
        set #_ui(value) { return _private__ui_descriptor.set.call(this, value); }
        #onBackgroundChanged_accessor_storage = (__runInitializers(this, _private__ui_extraInitializers), __runInitializers(this, _onBackgroundChanged_initializers, void 0));
        /**
         * Evènement du changement d'image de fond
         */
        get onBackgroundChanged() { return this.#onBackgroundChanged_accessor_storage; }
        set onBackgroundChanged(value) { this.#onBackgroundChanged_accessor_storage = value; }
        #imgBackground_accessor_storage = (__runInitializers(this, _onBackgroundChanged_extraInitializers), __runInitializers(this, _imgBackground_initializers, null));
        get imgBackground() { return this.#imgBackground_accessor_storage; }
        set imgBackground(value) { this.#imgBackground_accessor_storage = value; }
        /**
         * Scheduler pour la mise à jour de l'image de fond
         */
        get #_backgroundScheduler() {
            return (this.#_scheduleUpdateBackground ??
                (this.#_scheduleUpdateBackground = new Scheduler(val => this.#_updateBackground(val))));
        }
        //#endregion Getters/Setters
        //#region Lifecycle
        constructor() {
            super();
            __runInitializers(this, _imgBackground_extraInitializers);
        }
        /**
         * @inheritdoc
         */
        _p_attach() {
            if (this.imgBackground !== null)
                this.#_backgroundScheduler.call(this.imgBackground);
        }
        /**
         * Change le titre dynamiquement.
         *
         * @param content
         * - String : Met à jour le H1.
         * - HTMLElement : Affiche l'élément dans le conteneur dédié.
         * - null : Affiche le slot par défaut.
         */
        setPageTitle(content) {
            // Initialisation Lazy du scheduler
            (this.#_scheduleUpdateTitle ??= new Scheduler(val => this.#_applyTitleUpdate(val))).schedule(content);
            return this;
        }
        /**
         * Met à jour l'image de fond du header.
         * @param urlOrData Interpréte la valeur comme une URL ou une Data URL.
         * @returns L'instance courante pour le chaînage.
         */
        updateBackground(urlOrData) {
            this.#_requestBackgroundUpdate(urlOrData);
            return this;
        }
        /**
         * Supprime l'image de fond du header.
         * @returns L'instance courante pour le chaînage.
         */
        clearBackground() {
            this.#_requestBackgroundUpdate(null);
            return this;
        }
        //#endregion Public methods
        //#region Private methods
        /**
         * Exécuté par le Scheduler (au prochain frame ou microtask)
         * @param content Contenu à appliquer
         */
        #_applyTitleUpdate(content) {
            // Cas "Reset" -> On veut voir le Slot
            if (!content) {
                this.#_resetVisibility(true, false, false);
                return;
            }
            // Cas "String" -> On utilise le H1 natif
            if (typeof content === 'string') {
                // Optimisation: ne toucher au DOM que si le texte change vraiment
                if (this.#_ui.titleText.textContent !== content) {
                    this.#_ui.titleText.textContent = content;
                }
                this.#_resetVisibility(false, true, false);
                return;
            }
            // Cas "HTMLElement" -> On injecte dans le conteneur custom
            // On vide proprement le conteneur avant d'ajouter le nouvel élément
            this.#_ui.customTitleContainer.replaceChildren(content);
            this.#_resetVisibility(false, false, true);
        }
        /**
         * Helper pour gérer la visibilité exclusive des 3 zones (Slot, H1, Custom)
         * Utilise l'attribut 'hidden' standard HTML5
         * @param showSlot Affiche le slot par défaut
         * @param showText Affiche le H1
         * @param showCustom Affiche le conteneur custom
         */
        #_resetVisibility(showSlot, showText, showCustom) {
            if (this.#_ui.slotTitle)
                this.#_ui.slotTitle.hidden = !showSlot;
            if (this.#_ui.titleText)
                this.#_ui.titleText.hidden = !showText;
            if (this.#_ui.customTitleContainer)
                this.#_ui.customTitleContainer.hidden = !showCustom;
        }
        /**
         * Planifie la mise à jour de l'image de fond
         * @param value Nouvelle URL de l'image de fond, ou null pour la supprimer
         */
        #_requestBackgroundUpdate(value) {
            this.#_backgroundScheduler.schedule(value);
        }
        /**
         * Met à jour l'image de fond du header
         * @param value Nouvelle URL de l'image de fond, ou null pour la supprimer
         */
        #_updateBackground(value) {
            if (value) {
                this.style.setProperty(CSS_VARIABLE_BACKGROUND_IMAGE, `url(${value})`);
                this._p_addState(STATE_WITH_BACKGROUND);
            }
            else {
                this.style.removeProperty(CSS_VARIABLE_BACKGROUND_IMAGE);
                this._p_removeState(STATE_WITH_BACKGROUND);
            }
            this.onBackgroundChanged.call(value);
        }
        //#endregion Private methods
        //#region Static methods
        /**
         * Génère un nouvel élément HTMLBnumHeader
         * @returns Element créé
         */
        static Create({ background = null, } = {}) {
            return document.createElement(this.TAG).condAttr(background !== null, `data-${DATA_BACKGROUND}`, background);
        }
    });
    return _classThis;
})();

//#region Global Constants
const ATTR_SELECTED = 'is-selected';
const ATTR_COLLAPSED = 'is-collapsed';
const ROLE_ITEM = '[role="treeitem"]';
//#endregion Global Constants
/**
 * Webcomposant représentant un arbre.
 */
let HTMLBnumTree = (() => {
    let _classDecorators = [Define({ tag: TAG_TREE }), Light()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElementInternal;
    let _instanceExtraInitializers = [];
    let __p_attach_decorators;
    let _private__listenKeyDown_decorators;
    let _private__listenKeyDown_descriptor;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __p_attach_decorators = [SetAttrs({
                    role: 'tree',
                    tabindex: '0',
                })];
            _private__listenKeyDown_decorators = [Listen('keydown')];
            __esDecorate(this, null, __p_attach_decorators, { kind: "method", name: "_p_attach", static: false, private: false, access: { has: obj => "_p_attach" in obj, get: obj => obj._p_attach }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, _private__listenKeyDown_descriptor = { value: __setFunctionName(function () {
                    return this.#_handleKeyDown;
                }, "#_listenKeyDown") }, _private__listenKeyDown_decorators, { kind: "method", name: "#_listenKeyDown", static: false, private: true, access: { has: obj => #_listenKeyDown in obj, get: obj => obj.#_listenKeyDown }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Private Fields
        #_selectedItem = (__runInitializers(this, _instanceExtraInitializers), null);
        #_focusedItem = null;
        //#endregion Private Fields
        //#region Lifecycle
        constructor() {
            super();
        }
        _p_attach() {
            super._p_attach();
            if (!this.attr('aria-label') && !this.attr('aria-labellerby')) {
                Log.warn('HTMLBnumTree', "Un arbre doit avoir un attribut aria-label ou aria-labelledby pour des raisons d'accessibilité.", 'Un texte par défaut a été ajouté.');
                this.attr('aria-label', 'Arbre perdu dans la forêt');
            }
            this.#_initListeners().#_initializeRovingTabindex();
        }
        //#endregion Lifecycle
        //#region Public Methods
        /**
         * Méthode publique pour sélectionner un item programmatiquement
         * @param item L'élément à sélectionner
         */
        SelectItem(item) {
            // 1. Désélection de l'ancien (O(1))
            if (this.#_selectedItem && this.#_selectedItem !== item) {
                this.#_selectedItem.setAttribute(ATTR_SELECTED, 'false');
            }
            else if (!this.#_selectedItem) {
                // Si aucun élément n'était sélectionné auparavant
                this.querySelectorAll(`[${ATTR_SELECTED}="true"]`).forEach(el => {
                    el.setAttribute(ATTR_SELECTED, 'false');
                });
            }
            // 2. Sélection du nouveau
            item.setAttribute(ATTR_SELECTED, 'true');
            this.#_selectedItem = item;
            // 3. Mise à jour du focus clavier (Roving Tabindex)
            this.#_updateFocus(item);
            // 4. Notification pour le reste de l'application
            this.trigger('bnum-tree:change', { item });
        }
        /**
         * Ajoute des nodes à l'arbre.
         *
         * Les nodes de type texte sont enveloppés dans un span avec le rôle treeitem.
         *
         * Les éléments HTML qui n'ont pas le rôle treeitem se voient attribuer ce rôle.
         * @param nodes Nodes à ajouter.
         * @returns L'instance courante.
         */
        append(...nodes) {
            const arrayOfNodes = [];
            for (const node of nodes) {
                if (typeof node === 'string') {
                    Log.warn('HTMLBnumTree', "L'ajout direct de texte dans un arbre n'est pas autorisé. L'élément est envellopper dans un span !.");
                    arrayOfNodes.push(this._p_createSpan({ child: node, attributes: { role: 'treeitem' } }));
                }
                else if (node instanceof HTMLElement &&
                    node.getAttribute('role') === 'group') {
                    arrayOfNodes.push(node);
                }
                else if (node instanceof HTMLElement &&
                    node.getAttribute('role') !== 'treeitem') {
                    node.setAttribute('role', 'treeitem');
                    arrayOfNodes.push(node);
                }
            }
            super.append(...arrayOfNodes);
            return this;
        }
        /**
         * Ajoute une node brute à l'arbre.
         * @param node Node à ajouter.
         * @returns Node ajoutée.
         */
        appendChild(node) {
            return super.appendChild(node);
        }
        //#endregion Public Methods
        //#region Private Methods
        /**
         * Initialise le focus : seul le premier élément est tabulable.
         */
        #_initializeRovingTabindex() {
            const items = this.#_getAllItems();
            if (items.length === 0)
                return;
            const selected = items.find(i => i.getAttribute(ATTR_SELECTED) === 'true');
            items.forEach(i => i.setAttribute('tabindex', '-1'));
            const initial = selected || items[0];
            initial.setAttribute('tabindex', '0');
            this.#_focusedItem = initial;
        }
        /**
         * Gestionnaire de sélection générique
         * @param e Événement de clic
         */
        #_handleSelection(e) {
            // On cherche l'élément treeitem le plus proche de la cible du clic
            const target = e.target.closest(ROLE_ITEM);
            if (!target || target.getAttribute('is-virtual') === 'true')
                return;
            this.SelectItem(target);
        }
        #_initListeners() {
            this.#_listenKeyDown();
            this.#_listenClick();
            return this;
        }
        get #_listenKeyDown() { return _private__listenKeyDown_descriptor.value; }
        #_listenClick() {
            return this.#_handleSelection;
        }
        #_handleKeyDown(e) {
            const current = this.#_focusedItem;
            if (!current)
                return;
            const visibleItems = this.#_getVisibleItems();
            const index = visibleItems.indexOf(current);
            let next = null;
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    next = visibleItems[index + 1] || null;
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    next = visibleItems[index - 1] || null;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    // Si l'élément est repliable
                    if (current.hasAttribute(ATTR_COLLAPSED)) {
                        if (current.getAttribute(ATTR_COLLAPSED) === 'true') {
                            current.setAttribute(ATTR_COLLAPSED, 'false');
                        }
                        else {
                            next = visibleItems[index + 1] || null;
                        }
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (current.getAttribute(ATTR_COLLAPSED) === 'false') {
                        current.setAttribute(ATTR_COLLAPSED, 'true');
                    }
                    else {
                        const parent = current.parentElement?.closest(ROLE_ITEM);
                        if (parent)
                            next = parent;
                    }
                    break;
                case 'Home':
                    e.preventDefault();
                    next = visibleItems[0];
                    break;
                case 'End':
                    e.preventDefault();
                    next = visibleItems[visibleItems.length - 1];
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    current.click();
                    break;
            }
            if (next)
                this.#_updateFocus(next);
        }
        #_updateFocus(target) {
            if (this.#_focusedItem) {
                this.#_focusedItem.setAttribute('tabindex', '-1');
            }
            target.setAttribute('tabindex', '0');
            target.focus();
            this.#_focusedItem = target;
        }
        #_getAllItems() {
            return Array.from(this.querySelectorAll(`${ROLE_ITEM}, bnum-tree-item, ${HTMLBnumFolder.TAG}`));
        }
        #_getVisibleItems() {
            return this.#_getAllItems().filter(item => {
                let parent = item.parentElement?.closest(ROLE_ITEM);
                while (parent) {
                    if (parent.getAttribute(ATTR_COLLAPSED) === 'true')
                        return false;
                    parent = parent.parentElement?.closest(ROLE_ITEM);
                }
                return true;
            });
        }
    });
    return _classThis;
})();

/**
 * Nom de l'attribut pour le type de colonne.
 */
const ATTR_TYPE = 'type';
/**
 * Valeur par défaut pour le type de colonne.
 */
const DEFAULT_COLUMN_TYPE = 'default';
/**
 * Préfixe commun pour les classes CSS de la colonne.
 */
const CLASS_PREFIX = TAG_COLUMN;
/**
 * Classe CSS pour l'en-tête de la colonne.
 */
const CLASS_HEADER = `${CLASS_PREFIX}__header`;
/**
 * Classe CSS "legacy" pour l'en-tête (compatibilité).
 */
const CLASS_RC_HEADER = 'header';
/**
 * Ancienne classe CSS pour l'en-tête (pour rétrocompatibilité).
 */
const CLASS_RC_HEADER_OLD = 'old-header';
/**
 * Classe CSS pour le corps de la colonne.
 */
const CLASS_BODY = `${CLASS_PREFIX}__body`;
/**
 * Classe CSS pour le pied de page de la colonne.
 */
const CLASS_FOOTER = `${CLASS_PREFIX}__footer`;
/**
 * Classe CSS "legacy" pour le pied de page (compatibilité).
 */
const CLASS_RC_FOOTER = 'footer';
/**
 * Classe CSS indiquant qu'un élément provient d'un slot.
 */
const CLASS_FROM_SLOT = 'from-slot';
/**
 * Préfixe pour les classes CSS de contenu.
 */
const CLASS_CONTENT_PREFIX = CLASS_PREFIX;
/**
 * Suffixe pour les classes CSS de contenu.
 */
const CLASS_CONTENT_POSTFIX = 'content';
/**
 * Classe CSS pour le contenu de l'en-tête.
 */
const CLASS_CONTENT_HEADER = `${CLASS_CONTENT_PREFIX}__header__${CLASS_CONTENT_POSTFIX}`;
/**
 * Classe CSS pour le contenu du corps.
 */
const CLASS_CONTENT_BODY = `${CLASS_CONTENT_PREFIX}__body__${CLASS_CONTENT_POSTFIX}`;
/**
 * Classe CSS pour le contenu du pied de page.
 */
const CLASS_CONTENT_FOOTER = `${CLASS_CONTENT_PREFIX}__footer__${CLASS_CONTENT_POSTFIX}`;
/**
 * Nom du slot pour l'en-tête.
 */
const SLOT_HEADER = 'header';
/**
 * Nom du slot pour le pied de page.
 */
const SLOT_FOOTER = 'footer';
/**
 * Nom de l'attribut de données pour conserver le corps.
 */
const DATA_KEEP_BODY = 'keep-body';
/**
 * Regroupe les différentes classes CSS utilisées par le composant.
 */
const CLASSES = {
    HOST: TAG_COLUMN,
    HEADER: {
        MAIN: CLASS_HEADER,
        RC: CLASS_RC_HEADER,
        OLD: CLASS_RC_HEADER_OLD,
    },
    BODY: CLASS_BODY,
    FOOTER: {
        MAIN: CLASS_FOOTER,
        RC: CLASS_RC_FOOTER,
    },
    CONTENT_PREFIX: TAG_COLUMN,
    FROM_SLOT: CLASS_FROM_SLOT,
    CONTENT: {
        HEADER: CLASS_CONTENT_HEADER,
        BODY: CLASS_CONTENT_BODY,
        FOOTER: CLASS_CONTENT_FOOTER,
    },
};
/**
 * Regroupe les noms de slots utilisés.
 */
const SLOTS = {
    HEADER: SLOT_HEADER,
    FOOTER: SLOT_FOOTER,
};
/**
 * Regroupe les noms d'attributs utilisés.
 */
const ATTRIBUTES = {
    TYPE: ATTR_TYPE,
    DATA: {
        KEEP_BODY: DATA_KEEP_BODY,
    },
};

//#region Types
/**
 * Constantes représentant les slots possibles d'une colonne.
 */
const ColumnSlot = {
    HEADER: 'header',
    FOOTER: 'footer',
    BODY: 'body',
};
//#endregion Types
/**
 *  Permet de structurer une colonne avec un en-tête, un corps et un pied de page.
 *
 * @structure Colonne
 * <bnum-column>
 *  <div slot="header">En-tête de la colonne</div>
 *   <div>Contenu principal de la colonne</div>
 *  <div slot="footer">Pied de page de la colonne</div>
 * </bnum-column>
 *
 * @attr {string} (optional) (default: 'default') type - Le type de colonne (ex: "sidebar", "main", "tools")
 */
let HTMLBnumColumn = (() => {
    let _classDecorators = [Define({ tag: TAG_COLUMN }), Light(), Observe(ATTRIBUTES.TYPE)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BnumElement;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        //#region Getters/Setters
        /**
         * Permet de définir le type de colonne (ex: "sidebar", "main", "tools")
         * Utile pour le CSS qui va définir la largeur
         */
        get type() {
            return this.getAttribute(ATTRIBUTES.TYPE) || DEFAULT_COLUMN_TYPE;
        }
        /**
         * Indique si le corps de la colonne doit être conservé lors de certaines opérations.
         *
         * Rappel: data- ne sert qu'à stocker des informations avant la création du composant.
         */
        get #_keepBody() {
            return this.data(ATTRIBUTES.DATA.KEEP_BODY) === 'true';
        }
        //#endregion Getters/Setters
        //#region LifeCycle
        /**
         * Constructeur de la colonne Bnum.
         */
        constructor() {
            super();
        }
        /**
         * Logique de rendu Light DOM
         * On récupère les enfants existants et on les réorganise.
         * @param container Le conteneur dans lequel injecter le DOM reconstruit
         * @protected
         */
        _p_buildDOM(container) {
            // Sauvegarde des enfants actuels
            const originalChildren = Array.from(this.childNodes);
            // Fragment temporaire pour construire le DOM avant injection
            const fragment = document.createDocumentFragment();
            // Création des conteneurs
            const [headerContainer, bodyContainer, footerContainer] = this._p_createDivs({
                classes: [CLASSES.HEADER.MAIN, CLASSES.HEADER.RC],
            }, {
                classes: [CLASSES.BODY],
            }, {
                classes: [CLASSES.FOOTER.MAIN, CLASSES.FOOTER.RC],
            });
            // Distribution des enfants (Slotting manuel)
            let hasHeader = false;
            let hasFooter = false;
            for (const node of originalChildren) {
                // Si c'est un noeud texte vide, on ignore
                if (node.nodeType === Node.TEXT_NODE) {
                    if (node.textContent?.trim())
                        bodyContainer.appendChild(node);
                    continue;
                }
                const nodeElement = node.nodeType === Node.ELEMENT_NODE ? node : null;
                if (!nodeElement)
                    continue;
                const slotName = nodeElement.getAttribute
                    ? nodeElement.getAttribute('slot')
                    : null;
                switch (slotName) {
                    case SLOTS.HEADER:
                        this.#_processNode(nodeElement, CLASSES.CONTENT.HEADER);
                        headerContainer.appendChild(node);
                        if (!hasHeader)
                            hasHeader = true;
                        break;
                    case SLOTS.FOOTER:
                        this.#_processNode(nodeElement, CLASSES.CONTENT.FOOTER);
                        footerContainer.appendChild(node);
                        if (!hasFooter)
                            hasFooter = true;
                        break;
                    default:
                        this.#_processNode(nodeElement, CLASSES.CONTENT.BODY);
                        bodyContainer.appendChild(node);
                        break;
                }
            }
            // Nettoyage du container principal
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            // Ajout des classes principales
            this.classList.add(CLASSES.HOST, `${CLASSES.CONTENT_PREFIX}--${this.type}`);
            // Injection conditionnelle dans le DOM
            if (hasHeader)
                fragment.appendChild(headerContainer);
            if (this.#_keepBody)
                fragment.appendChild(bodyContainer);
            else
                fragment.append(...Array.from(bodyContainer.childNodes));
            if (hasFooter)
                fragment.appendChild(footerContainer);
            container.appendChild(fragment);
        }
        /**
         * Reactivity for Type attribute change
         */
        _p_update(name, oldVal, newVal) {
            if (oldVal === newVal)
                return;
            if (name === ATTRIBUTES.TYPE && this.alreadyLoaded) {
                if (oldVal)
                    this.classList.remove(`${CLASSES.CONTENT_PREFIX}--${oldVal}`);
                if (newVal)
                    this.classList.add(`${CLASSES.CONTENT_PREFIX}--${newVal}`);
            }
        }
        //#endregion LifeCycle
        //#region Méthodes privées
        /**
         * Traite un élément enfant : supprime l'attribut slot, ajoute les classes CSS nécessaires,
         * et gère la rétrocompatibilité des classes "header".
         * @param {HTMLElement} element L'élément à traiter
         * @param {string} specificClass Classe CSS spécifique à ajouter
         * @private
         */
        #_processNode(element, specificClass) {
            element.removeAttribute('slot');
            element.classList.add(specificClass, CLASSES.FROM_SLOT);
            // Gestion legacy "header" class duplication
            if (element.classList.contains(CLASSES.HEADER.RC)) {
                element.classList.remove(CLASSES.HEADER.RC);
                element.classList.add(CLASSES.HEADER.OLD);
            }
        }
    });
    return _classThis;
})();

if (typeof window !== 'undefined' && window.DsBnumConfig) {
    BnumConfig.Initialize(window.DsBnumConfig).tapError(error => {
        Log.error('design-system-bnum', "Erreur lors de l'initialisation de la configuration globale :", error);
    });
}

export { BREAKPOINTS, BnumElement, BnumRadioCheckedChangeEvent, ButtonVariation, ColumnSlot, BnumConfig as Config, RotomecaCssProperty as DsCssProperty, RotomecaCssRule as DsCssRule, RotomecaDocument as DsDocument, HTMLBnumBadge, HTMLBnumButton, HTMLBnumButtonIcon, HTMLBnumCardAgenda, HTMLBnumCardElement, HTMLBnumCardEmail, HTMLBnumCardItem, HTMLBnumCardItemAgenda, HTMLBnumCardItemMail, HTMLBnumCardList, HTMLBnumCardTitle, HTMLBnumColumn, HTMLBnumDangerButton, HTMLBnumDate, HTMLBnumFolder, HTMLBnumFolderList, HTMLBnumFragment, HTMLBnumHeader, HTMLBnumHide, HTMLBnumIcon, HTMLBnumInput, HTMLBnumInputDate, HTMLBnumInputNumber, HTMLBnumInputSearch, HTMLBnumInputText, HTMLBnumInputTime, HTMLBnumPrimaryButton, HTMLBnumRadio, HTMLBnumRadioGroup, HTMLBnumSecondaryButton, HTMLBnumSegmentedControl, HTMLBnumSegmentedItem, HTMLBnumSelect, HTMLBnumSwitch, HTMLBnumTree, HideTextOnLayoutSize, INPUT_BASE_STYLE, INPUT_STYLE_STATES, IconPosition, MODES };
//# sourceMappingURL=ds-module-bnum.js.map
