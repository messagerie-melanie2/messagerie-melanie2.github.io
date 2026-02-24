import BnumElementInternal from '../../bnum-element-states';
/**
 * Composant BnumHide
 * Permet de cacher son contenu selon des breakpoints définis.
 * @structure Base
 * <bnum-hide breakpoint="small" mode="down">Bonjour</bnum-hide>
 */
export declare class HTMLBnumHide extends BnumElementInternal {
    #private;
    constructor();
    static get TAG(): string;
    static get observedAttributes(): string[];
    protected _p_isShadowElement(): boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldVal: string, newVal: string): void;
}
