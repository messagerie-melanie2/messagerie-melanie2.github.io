/**
 * @namespace MainObjects
 * @property {MelEventManager} MelEventManager
 * @property {MelObject} MelObject
 */

export { MelObject };
import { Mel_Ajax } from '../js/mel_promise.js';
import { isNullOrUndefined } from '../js/mel.js';

/**
 * @abstract
 * Classe de base du framework bnum.
 *
 * Donne divers fonction d'aide pour programmer.
 * @class
 * @classdesc Donne divers fonction d'aide pour programmer.
 */
class MelObject {
  /**
   * Constructeur de la classe
   * @param  {...any} args Arguments de la classe
   */
  constructor(...args) {
    this.main(...args);
  }

  /**
   * @abstract
   * Cette fonction est appelé dans le constructeur de MelObject.
   *
   * Mettez vôtre code ici.
   * @param  {...any} args Arguments de la fonction
   */
  main(...args) {}

  /**
   * Effectue un appel ajax avec les options spécifiées.
   * @param {Object} options - Les options pour l'appel HTTP.
   * @param {string} options.url - L'URL à appeler.
   * @param {function} [options.on_success=() => {}] - La fonction à appeler en cas de succès.
   * @param {function} [options.on_error=(...args) => {console.error('###[http_call]', ...args)}] - La fonction à appeler en cas d'erreur.
   * @param {Object} [options.params=null] - Les paramètres à envoyer dans la requête.
   * @param {string} [options.type='POST'] - Le type de requête HTTP à effectuer.
   * @returns {Mel_Ajax}
   */
  http_call({
    url,
    on_success = () => {},
    on_error = (...args) => {
      console.error('###[http_call]', ...args);
    },
    params = null,
    type = 'POST',
  }) {
    return new Mel_Ajax({
      type,
      url,
      success: on_success,
      failed: on_error,
      datas: params,
    });
  }

  /**
   * Effectue un appel ajax vers les serveurs de l'application
   * @param {Object} options - Les options pour l'appel HTTP.
   * @param {string} options.task - Tache
   * @param {string} options.action - Action
   * @param {function} [options.on_success=() => {}] - La fonction à appeler en cas de succès.
   * @param {function} [options.on_error=(...args) => {console.error('###[http_call]', ...args)}] - La fonction à appeler en cas d'erreur.
   * @param {Object} [options.params=null] - Les paramètres à envoyer dans la requête.
   * @param {string} [options.type='POST'] - Le type de requête HTTP à effectuer.
   * @returns {Mel_Ajax}
   */
  http_internal_call({
    task,
    action,
    on_success = () => {},
    on_error = (...args) => {
      console.error('###[http_internal_call]', ...args);
    },
    params = null,
    type = 'POST',
  }) {
    return this.http_call({
      type,
      on_error,
      on_success,
      params: type === 'GET' ? null : params,
      url: this.url(task, {
        action: action,
        params: type === 'GET' ? params : null,
      }),
    });
  }

  /**
   * Effectue un appel ajax POST vers les serveurs de l'application
   * @param {Object} options - Les options pour l'appel HTTP.
   * @param {string} options.task - Tache
   * @param {string} options.action - Action
   * @param {function} [options.on_success=() => {}] - La fonction à appeler en cas de succès.
   * @param {function} [options.on_error=(...args) => {console.error('###[http_call]', ...args)}] - La fonction à appeler en cas d'erreur.
   * @param {Object} [options.params=null] - Les paramètres à envoyer dans la requête.
   * @returns {Mel_Ajax}
   */
  http_internal_post({
    task,
    action,
    on_success = () => {},
    on_error = (...args) => {
      console.error('###[http_internal_post]', ...args);
    },
    params = null,
  }) {
    return this.http_internal_call({
      task,
      action,
      on_success,
      on_error,
      params,
      type: 'POST',
    });
  }

  /**
   * Effectue un appel ajax GET vers les serveurs de l'application
   * @param {Object} options - Les options pour l'appel HTTP.
   * @param {string} options.task - Tache
   * @param {string} options.action - Action
   * @param {function} [options.on_success=() => {}] - La fonction à appeler en cas de succès.
   * @param {function} [options.on_error=(...args) => {console.error('###[http_call]', ...args)}] - La fonction à appeler en cas d'erreur.
   * @param {Object} [options.params=null] - Les paramètres à envoyer dans la requête.
   * @returns {Mel_Ajax}
   */
  http_internal_get({
    task,
    action,
    on_success = () => {},
    on_error = (...args) => {
      console.error('###[http_internal_post]', ...args);
    },
    params = null,
  }) {
    return this.http_internal_call({
      task,
      action,
      on_success,
      on_error,
      params,
      type: 'GET',
    });
  }

  /**
   * Séléctionne un document dom au format jquery
   * @param {string} selector Selecteur au format jquery
   * @returns {$}
   */
  select(selector) {
    return $(selector);
  }

  /**
   * Renvoie vrai si la variable vaut `null` ou `undefined`.
   * @param {*} item Variable à tester
   * @returns {boolean}
   */
  isNullOrUndefined(item) {
    return isNullOrUndefined(item);
  }

  static Empty() {
    return new MelObject();
  }
}
