import BnumElementInternal from '../../bnum-element-states';
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
