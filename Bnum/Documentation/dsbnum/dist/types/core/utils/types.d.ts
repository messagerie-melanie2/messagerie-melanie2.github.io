export declare type CallbackChanged<TNew, TOld, TCaller> = (newValue: TNew, oldValue: TOld, sender: TCaller) => void;
export declare type CallbackChangedSimple<TCaller> = (sender: TCaller) => void;
export declare type Nullable<T> = T | null;
export declare type Optional<T> = T | undefined;
export declare type PlainObject<T = any> = {
    [key: string]: T;
};
