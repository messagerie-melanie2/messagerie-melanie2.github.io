import BnumElement from 'components/bnum-element';
import { Nullable } from '../types';
export type CheckedChangeEventConstructorOption<TValue, TDetails, TCaller extends HTMLElement> = {
    value: TValue;
    checked: boolean;
    name: string;
    caller: TCaller;
    details?: Nullable<TDetails>;
};
export declare class CheckedChangeEvent<TValue, TDetails, TCaller extends BnumElement> extends CustomEvent<TDetails> {
    accessor value: TValue;
    accessor name: string;
    accessor checked: boolean;
    accessor caller: TCaller;
    constructor(options: CheckedChangeEventConstructorOption<TValue, TDetails, TCaller>);
}
