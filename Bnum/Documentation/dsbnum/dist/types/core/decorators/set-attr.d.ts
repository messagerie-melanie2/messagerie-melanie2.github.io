/**
 * @SetAttr : Ajoute un attribut avec une valeur fixe à un élément.
 * @param attributeName Nom de l'attribut à ajouter.
 * @param value Valeur de l'attribut à définir.
 * @returns Un décorateur de méthode qui ajoute l'attribut à l'élément.
 */
export declare function SetAttr(attributeName: string, value: string | number | boolean): (originalMethod: any, context: ClassMethodDecoratorContext) => ((this: HTMLElement, ..._args: any[]) => any) | undefined;
/**
 * @SetAttrs : Ajoute un attribut avec une valeur fixe à un élément.
 * @param attributeName Nom de l'attribut à ajouter.
 * @param value Valeur de l'attribut à définir.
 * @returns Un décorateur de méthode qui ajoute l'attribut à l'élément.
 */
export declare function SetAttrs(attribs: Record<string, string | boolean | number>): (originalMethod: any, context: ClassMethodDecoratorContext) => ((this: HTMLElement, ..._args: any[]) => any) | undefined;
