export type ParametersMinusFirst<T extends (...args: any) => any> = DropFirst<Parameters<T>>;

export type FuncMinusFirstArg<TFunc extends (...args: any) => any, TOutput = ReturnType<TFunc>> = (
    ...args: ParametersMinusFirst<TFunc>
) => TOutput;

/** Removes the first parameter from a set */
export type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never;

/**
 * Represents a type that checks if a specified type (`TCheckIfDisallowed`) is assignable to another type
 * (`DisallowedType`). If assignable, it further checks for an exact match using `DisallowExactMatch`.
 *
 * @template TCheckIfDisallowed - The type to check.
 * @template DisallowedType - The type that is disallowed.
 * @template TOtherwise - The fallback type if the check fails.
 */
type DisallowMatch<TCheckIfDisallowed, DisallowedType, TOtherwise> =
    [DisallowedType] extends (
        [TCheckIfDisallowed] // Checks if R is assignable to DisallowedType
    ) ?
        DisallowExactMatch<TCheckIfDisallowed, DisallowedType, TOtherwise>
    :   TOtherwise; // Allow if R is not assignable to DisallowedType

/**
 * Checks if a specified type (`TCheckIfDisallowed`) is exactly the same as another type (`DisallowedType`).
 * If it is, the type resolves to `never`, otherwise, it falls back to `TOtherwise`.
 *
 * @template TCheckIfDisallowed - The type to check for an exact match.
 * @template DisallowedType - The type to compare against.
 * @template TOtherwise - The fallback type if the check fails.
 */
type DisallowExactMatch<TCheckIfDisallowed, DisallowedType, TOtherwise> =
    Exclude<TCheckIfDisallowed, DisallowedType> extends (
        // Exclude R from DisallowedType, if nothing remains, it means R is exactly DisallowedType
        never
    ) ?
        // Disallow if R is exactly DisallowedType
        never
    :   // Allow if R is not exactly DisallowedType, but is assignable to it
        // (like boolean when DisallowedType is true | false)
        TOtherwise;

/**
 * Determines whether a potential function type (`TPotentialFunction`) returns a disallowed type
 * (`DisallowedType`). Utilizes `DisallowMatch` to perform the check.
 *
 * @template TPotentialFunction - The function type to check.
 * @template DisallowedType - The return type that is disallowed.
 */
type FunctionReturnsDisallowedType<TPotentialFunction, DisallowedType> =
    TPotentialFunction extends (...args: any[]) => infer R ?
        DisallowMatch<R, DisallowedType, TPotentialFunction>
    :   TPotentialFunction;

/**
 * Blocks a type (`T`) if its return type matches the disallowed type (`DisallowedType`). Uses
 * `FunctionReturnsDisallowedType` for the check and resolves to `never` if the check is true.
 *
 * @template T - The type to check and possibly block.
 * @template DisallowedType - The return type that is disallowed.
 */
export type BlockFunctionsWithDisallowedType<TPotentialFunction, DisallowedType> =
    FunctionReturnsDisallowedType<TPotentialFunction, DisallowedType> extends (
        true // true, in this case, means "not never"
    ) ?
        never
    :   TPotentialFunction;

/**
 * Constructs an object type where each property is a function, and none of the functions are allowed to
 * return a specified disallowed type.
 *
 * @template T - The object type with function properties.
 * @template DisallowedType - The return type that is disallowed for the functions.
 */
export type FuncDict_DisallowReturnType<T extends Record<string, (...args: any[]) => any>, DisallowedType> = {
    [K in keyof T]: BlockFunctionsWithDisallowedType<T[K], DisallowedType>;
};

/**
 * Intermediate type that applies the Readonly wrapper to the return type of a function, if the return type is
 * an object.
 *
 * @template TOutput - Function type to be modified.
 */
export type ReadonlyReturnType<TOutput extends (...args: any[]) => any> =
    ReturnType<TOutput> extends object ? (...args: Parameters<TOutput>) => Readonly<ReturnType<TOutput>>
    :   TOutput;

/**
 * Forces the return type of a function to be Readonly if the return type is an object. Utilizes
 * ReadonlyReturnType to apply the Readonly wrapper conditionally.
 *
 * @template TOutput - Function type to be processed.
 */
export type ForceReadonlyReturnType<TOutput> =
    TOutput extends (...args: any[]) => any ? ReadonlyReturnType<TOutput> : never;

// Utility type to remove a specified word from the start or end of a string type,
// supporting both capitalized and non-capitalized forms.
export type RemoveWord<T extends string, Word extends string> =
    T extends `${Word}${infer Rest}` ? Rest
    : T extends `${Capitalize<Word>}${infer Rest}` ? Rest
    : T extends `${infer Rest}${Word}` ? Rest
    : T extends `${infer Rest}${Capitalize<Word>}` ? Rest
    : T;

export type RemoveWordAndValidate<T extends string, Word extends string> = RemoveWord<T, Word> extends "" 
	? T 
	: RemoveWord<T, Word> extends `${number}`
		? T
		: RemoveWord<T, Word>;
