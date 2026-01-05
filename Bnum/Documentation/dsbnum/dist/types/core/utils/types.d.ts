export declare type CallbackChanged<TNew, TOld, TCaller> = (newValue: TNew, oldValue: TOld, sender: TCaller) => void;
export declare type CallbackChangedSimple<TCaller> = (sender: TCaller) => void;
export declare type Nullable<T> = T | null;
