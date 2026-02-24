import { Nullable } from './types';
export declare enum BnumDateLocale {
    FR = "fr-FR",
    EN = "en-US"
}
/**
 * Native replacements for date-fns functions to reduce bundle size.
 * Uses Intl API for localization and native Date for manipulations.
 */
export declare class BnumDateUtils {
    #private;
    /**
     * Equivalent to date-fns/format.
     * @param date Date to format.
     * @param options Intl options or a simple locale string.
     * @param locale Locale string (e.g., 'fr-FR', 'en-US').
     */
    static format(date: Date, options?: Intl.DateTimeFormatOptions, locale?: string): string;
    /**
     * Parse une chaîne de caractères en objet Date.
     * @param dateString La chaîne à parser (ex: "12/08/1997")
     * @param format Optionnel : le format de la chaîne (ex: "dd/MM/yyyy")
     */
    static parse(dateString: string, format?: string): Nullable<Date>;
    /**
     * Equivalent to date-fns/isValid.
     */
    static isValid(date: any): date is Date;
    /**
     * Equivalent to date-fns/addDays (Immutable).
     */
    static addDays(date: Date, days: number): Date;
    /**
     * Equivalent to date-fns/addMonths (Immutable).
     */
    static addMonths(date: Date, months: number): Date;
    /**
     * Equivalent to date-fns/addYears (Immutable).
     */
    static addYears(date: Date, years: number): Date;
    /**
     * Convertit dynamiquement une chaîne de tokens (ex: "dd/MM") en options Intl.
     * @param pattern La chaîne de formatage.
     */
    static getOptionsFromToken(pattern: string): Intl.DateTimeFormatOptions;
    /**
     * Vérifie si deux dates correspondent au même jour (ignore l'heure).
     * @param date Première date à comparer.
     * @param now Deuxième date à comparer (par défaut : Date actuelle).
     * @returns True si c'est le même jour.
     */
    static isSameDay(date: Date, now?: Date): boolean;
    /**
     * Vérifie si la date fournie est aujourd'hui.
     */
    static isToday(date: Date): boolean;
    /**
     * Retourne une nouvelle date fixée au début du jour (00:00:00.000).
     */
    static startOfDay(date: Date): Date;
    /**
     * Retourne une nouvelle date fixée à la fin du jour (23:59:59.999).
     */
    static endOfDay(date: Date): Date;
    /**
     * Soustrait un nombre de jours à une date (Immuable).
     */
    static subDays(date: Date, amount: number): Date;
    /**
     * Vérifie si une date se trouve dans un intervalle donné (inclusif).
     * @param date Date à vérifier.
     * @param interval Objet contenant start et end.
     */
    static isWithinInterval(date: Date, interval: {
        start: Date;
        end: Date;
    }): boolean;
}
