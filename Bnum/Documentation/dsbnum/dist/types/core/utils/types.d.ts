export type CallbackChanged<TNew, TOld, TCaller> = (newValue: TNew, oldValue: TOld, sender: TCaller) => void;
export type CallbackChangedSimple<TCaller> = (sender: TCaller) => void;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type MayBe<T> = Optional<Nullable<T>>;
export type PlainObject<T = unknown> = {
    [key: string]: T;
};
/**
 * Generic utility to extract values from an object type.
 * Eliminates the repetition of `(typeof T)[keyof typeof T]`.
 */
export type ValueOf<T> = T[keyof T];
export type ClickCallback = (e: MouseEvent) => void;
export type BasicDetail<T, TEvent extends Event> = {
    inner: TEvent;
    caller: T;
};
