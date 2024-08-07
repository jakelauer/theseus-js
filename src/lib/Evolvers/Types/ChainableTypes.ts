import type { FuncMinusFirstArg } from "../../Types/Modifiers.js";
import type { MutatorDefChild } from "./MutatorTypes.js";

type AsyncTracker = "sync" | "async";
type FinalTracker = "final" | "notFinal";

/**
 * Type representing a callable mutator function, with its first argument removed. This facilitates chaining
 * by allowing subsequent calls to pass only the arguments needed for the mutator's operation, excluding the
 * state object.
 */
type MutatorCallable<TMutator extends (...args: any[]) => any, TReturn> = FuncMinusFirstArg<
    (...args: Parameters<TMutator>) => TReturn
>;

/**
 * Defines a type for a synchronous chainable operation on the evolver's data. This type is part of the
 * infrastructure that allows for the fluent chaining of mutation operations, providing a clear and intuitive
 * API for evolving state in a synchronous context, with the capability to transition to asynchronous chains
 * if necessary.
 *
 * @template TData The type of data being mutated within the chain.
 * @template TParamNoun The type representing the name of the data.
 * @template TMutators The type representing the definitions of mutators applicable to the data.
 * @template TMutator The specific mutator function being applied in this chain link.
 * @template IsFinal A tracker indicating whether the current operation is considered the final one in the
 *   chain, allowing for the conditional exposure of the `lastly` property for concluding the chain.
 *
 *   The `SyncChainable` type dynamically adjusts its return type based on whether the chain is marked as final:
 *
 *   - If not final (`IsFinal` is "notFinal"), it continues the chain by returning an object with `.and` for
 *       chaining further synchronous operations, and `.lastly` for transitioning to the final operation. It
 *       also includes `.result` to retrieve the current state at any point in the chain.
 *   - If marked as final (`IsFinal` is "final"), it simplifies the return type to directly return the mutated
 *       data type `TData`, indicating that no further chaining is possible and the chain must be concluded.
 *
 *   This design supports a flexible and expressive approach to state mutation, allowing developers to
 *   succinctly describe a sequence of mutations and control the flow of chaining with type safety, ensuring
 *   that operations can only be chained in a manner consistent with their asynchronous or synchronous
 *   nature.
 */
type SyncChainable<
    TData extends object,
    TParamNoun extends string,
    TMutators extends MutatorDefChild<TData, TParamNoun>,
    TMutator extends (...args: any[]) => any,
    IsAsync extends AsyncTracker,
    IsFinal extends FinalTracker = "notFinal",
> = MutatorCallable<
    TMutator,
    IsFinal extends "final" ? TData
    :   Record<"and", ChainableMutators<TData, TParamNoun, TMutators, IsFinal, IsAsync>> &
            Record<"end", () => TData> &
            Record<"lastly", ChainableMutators<TData, TParamNoun, TMutators, "final", IsAsync>>
>;

export type FinishChain<
    TData extends object,
    TParamNoun extends string,
    TMutators extends MutatorDefChild<TData, TParamNoun>,
    IsAsync extends AsyncTracker,
> = Record<"endAsync", () => Promise<TData>> &
    Record<"lastlyAsync", ChainableMutators<TData, TParamNoun, TMutators, "final", IsAsync>>;

type AsyncChainable<
    TData extends object,
    TParamNoun extends string,
    TMutators extends MutatorDefChild<TData, TParamNoun>,
    TMutator extends (...args: any[]) => any,
    IsAsync extends AsyncTracker,
    IsFinal extends FinalTracker = "notFinal",
> = MutatorCallable<
    TMutator,
    IsFinal extends "final" ? TData
    :   Record<"andAsync", ThenableStub<IsAsync> & ChainableMutators<TData, TParamNoun, TMutators, IsFinal, IsAsync>> &
            FinishChain<TData, TParamNoun, TMutators, IsAsync>
	>;

type ThenableStub<IsAsync extends AsyncTracker> = IsAsync extends "async" ? {
	/**
	 * @deprecated This method is not intended for direct use. It allows ESLint to recognize the `then` method
	 * in order to allow detection of floating promises.
	 */
	then: PromiseLike<any>["then"];
}: unknown;

/**
 * Determines if a set of mutators includes any asynchronous operations, affecting whether the chain is
 * treated as async.
 */
type IsChainAsync<TMutators, PrevAsync extends AsyncTracker> = {
    [K in keyof TMutators]: TMutators[K] extends (...args: any[]) => Promise<any> ? "async" : PrevAsync;
}[keyof TMutators];

/**
 * Constructs a type for chainable mutators, facilitating the chaining of state mutation operations. This type
 * supports both synchronous and asynchronous operations, dynamically adjusting the chain's return types to
 * match the operations' nature (sync or async) and whether the chain is at its final operation.
 *
 * @template TData The type of data being mutated by the chain.
 * @template TParamNoun The type representing the name of the data.
 * @template TMutators The type representing the definitions of mutators applicable to the data.
 * @template IsFinal A tracker indicating whether the current operation is the final one in the chain.
 *
 *   The type dynamically constructs an object where each key corresponds to a mutator operation. Depending on
 *   the mutator function's return type (Promise or direct value), the structure adjusts to either continue
 *   the chain with `.and` and `.lastly` properties or to provide a method `.result` for retrieving the
 *   final mutated state.
 *
 *   If a mutator returns a Promise, the chain is marked as async, and subsequent operations must handle the
 *   asynchronous nature, even if they are themselves synchronous. This ensures that async operations do not
 *   break the chain's flow.
 *
 *   The `IsFinal` tracker allows the type to differentiate between operations that can continue the chain and
 *   those that conclude it, enabling type-safe access to the `.lastly` property only when no further
 *   chaining is possible.
 */

export type ChainableMutators<
    TData extends object,
    TParamNoun extends string,
    TMutators extends MutatorDefChild<TData, TParamNoun>,
    IsFinal extends FinalTracker = "notFinal",
    IsAsync extends AsyncTracker = IsChainAsync<TMutators, "sync">,
> = {
    [K in keyof TMutators]: TMutators[K] extends (...args: any[]) => Promise<any> ?
        IsFinal extends "final" ?
            FuncMinusFirstArg<(...args: Parameters<TMutators[K]>) => Promise<TData>>
        :   // For async mutators, return a function type that expects the mutator's parameters (minus the first one)
            // and returns a Promise of the mutated data type.
            AsyncChainable<TData, TParamNoun, TMutators, TMutators[K], "async", "notFinal">
    : TMutators[K] extends (...args: any[]) => any ?
        // For sync mutators, if it's the final operation, determine if the entire chain is async and adjust
        // the return type accordingly. Otherwise, return a SyncChainable type allowing further chaining or
        // finalization.
        IsFinal extends "final" ?
            IsChainAsync<TMutators, IsAsync> extends "async" ?
                FuncMinusFirstArg<(...args: Parameters<TMutators[K]>) => Promise<TData>>
            :   FuncMinusFirstArg<(...args: Parameters<TMutators[K]>) => TData>
        : IsChainAsync<TMutators, IsAsync> extends "async" ?
            AsyncChainable<TData, TParamNoun, TMutators, TMutators[K], "async", "notFinal">
        :   SyncChainable<TData, TParamNoun, TMutators, TMutators[K], IsAsync, "notFinal">
    : TMutators[K] extends { [key: string]: any } ?
        // For nested mutator objects, recursively apply ChainableMutators to enable deep chaining.
        ChainableMutators<never, never, TMutators[K], never, never>
    :   never;
};

// Interface defining the capability to retrieve the final form of the mutated data.
export interface Chainable<TData extends object> {
    end: () => TData;
    // eslint-disable-next-line theseus/break-on-chainable
    endAsync: () => Promise<TData>;
}

export type FinalMutators<
    TData extends object,
    TParamNoun extends string,
    TMutators extends MutatorDefChild<TData, TParamNoun>,
> = ChainableMutators<TData, TParamNoun, TMutators, "final">;
