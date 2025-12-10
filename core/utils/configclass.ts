import { BnumConfigOptions, DEFAULT_CONFIG } from './constants/config';

/**
 * Vérifie si une valeur est un objet (et pas un tableau).
 * @param item Item à vérifier
 * @returns Vrai si l'item est un objet (et pas un tableau), sinon faux.
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Fonction de fusion profonde (Deep Merge) native.
 * @param target L'objet cible (qui sera modifié).
 * @param source L'objet source (qui écrase la cible).
 * @returns L'objet cible fusionné.
 */
function deepMerge<T>(target: T, source: any): T {
  // Si l'un des deux n'est pas un objet, on retourne la source (écrasement)
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  const output = target as any;

  Object.keys(source).forEach((key) => {
    const targetValue = output[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      // Choix architectural : Pour les tableaux de config, on remplace souvent tout le tableau.
      // Si tu préfères concaténer : output[key] = targetValue.concat(sourceValue);
      output[key] = sourceValue;
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      // Récursion pour les objets imbriqués
      output[key] = deepMerge(targetValue, sourceValue);
    } else {
      // Assignation directe pour les primitives
      output[key] = sourceValue;
    }
  });

  return output;
}

// Variable locale au module (privée) pour stocker l'état
let _currentConfig: BnumConfigOptions = { ...DEFAULT_CONFIG };

/**
 * Gestionnaire de configuration global pour Bnum.
 */
export class BnumConfig {
  /**
   * Initialise la configuration en fusionnant les défauts avec un objet partiel.
   * À appeler au démarrage si une config globale existe.
   */
  static Initialize(overrides: Partial<BnumConfigOptions>): void {
    _currentConfig = deepMerge(_currentConfig, overrides);
  }

  /**
   * Récupère la configuration complète ou une valeur spécifique.
   * @param key Clé optionnelle pour récupérer une sous-partie
   */
  static Get(): BnumConfigOptions;
  static Get<K extends keyof BnumConfigOptions>(key: K): BnumConfigOptions[K];
  static Get<K extends keyof BnumConfigOptions>(
    key?: K,
  ): BnumConfigOptions | BnumConfigOptions[K] {
    if (key) {
      return _currentConfig[key];
    }
    return _currentConfig;
  }

  /**
   * Met à jour la configuration à la volée.
   */
  static Set(overrides: Partial<BnumConfigOptions>): void {
    this.Initialize(overrides);
    // Optionnel : Déclencher un événement global pour dire que la config a changé
    // document.dispatchEvent(new CustomEvent('bnum:config-changed', { detail: _currentConfig }));
  }

  /**
   * Reset la configuration aux valeurs par défaut
   */
  static Reset(): void {
    _currentConfig = { ...DEFAULT_CONFIG };
  }

  /**
   * Récupère une copie profonde de la configuration actuelle.
   * @readonly
   */
  static get Clone(): BnumConfigOptions {
    return JSON.parse(JSON.stringify(_currentConfig));
  }
}
