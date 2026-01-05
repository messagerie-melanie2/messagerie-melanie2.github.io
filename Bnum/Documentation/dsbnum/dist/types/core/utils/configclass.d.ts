import { BnumConfigOptions } from './constants/config';
/**
 * Gestionnaire de configuration global pour Bnum.
 */
export declare class BnumConfig {
    /**
     * Initialise la configuration en fusionnant les défauts avec un objet partiel.
     * À appeler au démarrage si une config globale existe.
     */
    static Initialize(overrides: Partial<BnumConfigOptions>): void;
    /**
     * Récupère la configuration complète ou une valeur spécifique.
     * @param key Clé optionnelle pour récupérer une sous-partie
     */
    static Get(): BnumConfigOptions;
    static Get<K extends keyof BnumConfigOptions>(key: K): BnumConfigOptions[K];
    /**
     * Met à jour la configuration à la volée.
     */
    static Set(overrides: Partial<BnumConfigOptions>): void;
    /**
     * Reset la configuration aux valeurs par défaut
     */
    static Reset(): void;
    /**
     * Récupère une copie profonde de la configuration actuelle.
     * @readonly
     */
    static get Clone(): BnumConfigOptions;
}
