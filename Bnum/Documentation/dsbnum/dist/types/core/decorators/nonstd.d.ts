type GenericContext = ClassDecoratorContext | ClassMethodDecoratorContext | ClassGetterDecoratorContext | ClassSetterDecoratorContext | ClassFieldDecoratorContext | ClassAccessorDecoratorContext;
export declare function NonStd(reason?: string, fatal?: boolean): (value: any, context: GenericContext) => void;
export {};
