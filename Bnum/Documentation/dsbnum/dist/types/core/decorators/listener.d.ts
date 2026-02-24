import JsEvent from '@rotomeca/event';
import { Nullable } from '../utils/types';
export declare function Listener<TCallback extends Function, This = any>(initilizator?: Nullable<(event: JsEvent<TCallback>, instance: This) => void>): (_target: ClassAccessorDecoratorTarget<This, JsEvent<TCallback>>, context: ClassAccessorDecoratorContext<This, JsEvent<TCallback>>) => ClassAccessorDecoratorResult<This, JsEvent<TCallback>>;
