
/**
 * The required shape of a Forge. Forges must be a function which is passed an object with one key, which is
 * `TParamNoun`, and a value of type `TData`. They may additionally specify any further arguments as required
 * by the functionality. They must return some type other than TData.
 */
export type Forge<TData extends object, TPropName extends string> = (
    input: { [key in TPropName]: TData},
    ...args: any[]
) => any;
