import BnumElement from '../../bnum-element';
export declare class HTMLBnumFolderList extends BnumElement {
    constructor();
    protected _p_preload(): void;
    protected _p_isShadowElement(): boolean;
    static Write(content?: string, attrs?: Record<string, string>): string;
    static get TAG(): string;
}
