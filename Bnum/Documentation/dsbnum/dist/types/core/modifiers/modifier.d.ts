declare global {
    const rcmail: any;
    const rcube_event: any;
    interface Window {
        rcmail: any;
    }
}
/**
 * Classe d'initialisation des comportements liés aux éléments du Bnum
 */
export declare class Initialiser {
    #private;
    static get Instance(): Initialiser;
    /**
     * Initialise les comportements liés au mail
     * @param $: JQueryStatic (généralement passé par Roundcube)
     */
    initializeMail($: any): this;
}
