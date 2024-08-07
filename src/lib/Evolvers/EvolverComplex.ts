import { getTheseusLogger } from "theseus-logger";
import type { EvolverInstance } from "./Types/EvolverTypes.js";
import type { MutatorDefs } from "./Types/MutatorTypes.js";
import type { MacroMutatorsFormatted, MutatorsFormatted } from "@Evolvers/Types/EvolverComplexTypes";

const log = getTheseusLogger("EvolverComplex");

export const generateEvolveMethods = <
    TData extends object,
    TIsMacro extends boolean,
    TParamNoun extends string,
    TEvolvers extends EvolverInstance<TData, string, TParamNoun, any>[],
>(
		evolvers: TEvolvers,
		input: TData,
		macro: TIsMacro,
	) => 
{
	// Iterates over each evolver name, reducing the collection of evolvers into a single object (result)
	// that maps formatted evolver names to their mutators. This object is then returned as the final result
	// of the method, representing the cumulative mutations available for application to the state.
	const result = evolvers.reduce(
		(acc, evolver) => 
		{
			const mutators = macro ? evolver.evolve(input).getMutators() : evolver.mutate(input).getMutators();

			(acc as Record<string, any>)[evolver.evolverName] = mutators;

			return acc;
		},
        {} as TIsMacro extends true ? MacroMutatorsFormatted<TData, TParamNoun, TEvolvers>
        :   MutatorsFormatted<TData, TParamNoun, TEvolvers>,
	);

	return result;
};

export const evolve = <
    TData extends object,
    TEvolvers extends EvolverInstance<TData, string, TParamNoun, TMutators>[],
    TMutators extends MutatorDefs<TData, TParamNoun>,
    TParamNoun extends string,
>(
		input: TData,
	) => 
{
	return {
		/** Sets up the evolution process with specified evolvers for chained mutations. */
		withEvolvers: (evolvers: TEvolvers) => 
		{
			return generateEvolveMethods(evolvers, input, true);
		},
	};
};

const mutate = <
    TData extends object,
    TEvolvers extends EvolverInstance<TData, string, TParamNoun, TMutators>[],
    TMutators extends MutatorDefs<TData, TParamNoun>,
    TParamNoun extends string,
>(
		input: TData,
	) => 
{
	return {
		/** Configures the mutation process with specific evolvers. */
		withEvolvers: (evolvers: TEvolvers) => 
		{
			return generateEvolveMethods(evolvers, input, false);
		},
	};
};

export const EvolversSymbol = Symbol("Evolvers");

export const create = <TData extends object>() => ({
	withEvolvers: <
        TMutators extends MutatorDefs<TData, TParamNoun>,
        TEvolvers extends EvolverInstance<TData, string, TParamNoun, TMutators>[],
        TParamNoun extends string,
    >(
		...evolvers: TEvolvers
	): EvolverComplexInstance<TData, TParamNoun, TMutators, TEvolvers> => 
	{
		log.verbose("Creating evolver complex with evolvers:", {
			evolvers: Object.keys(evolvers),
		});

		const mutation = (input: TData) =>
			mutate<TData, TEvolvers, TMutators, TParamNoun>(input).withEvolvers(evolvers);
		const evolution = (input: TData) =>
			evolve<TData, TEvolvers, TMutators, TParamNoun>(input).withEvolvers(evolvers);

		return {
			[EvolversSymbol]: evolvers,
			/**
             * Performs a single mutation on the given input, and returns the resulting transformed data.
             *
             * Examples:
             *
             *     const { BoxScore } = BaseballEvolverComplex.mutate(myData);
             *     const result = BoxScore.setRuns(5);
             */
			mutate: mutation,
			/**
             * Performs multiple mutations on the given input, chained together. The final result is available
             * via the `finish` method, or by preceding the final chained call with `.lastly`.
             *
             * Examples:
             *
             *     const { BoxScore } = BaseballEvolverComplex.evolve(myData);
             *     const result = BoxScore.setRuns(5).and.setHits(10).and.setErrors(0).finish(); // option 1
             *     const result = BoxScore.setRuns(5).and.setHits(10).and.lastly.setErrors(0); // option 2
             */
			evolve: evolution,
			use: (input: TData) => ({
				mutate: mutation(input),
				evolve: evolution(input),
			}),
			addTheseusId: (theseusId: string) => 
			{
				evolvers.forEach((evolver) => evolver.__setTheseusId(theseusId));
			},
		};
	},
});

/** Facilitates complex data transformations by combining multiple Evolvers. */
export class EvolverComplex 
{
	/** Initializes the creation process for a new EvolverComplex instance. */
	public static create = create;
}

export type EvolverComplexInstance<
    TData extends object,
    TParamNoun extends string,
    TMutators extends MutatorDefs<TData, TParamNoun>,
    TEvolvers extends EvolverInstance<TData, string, TParamNoun, TMutators>[],
> = {
    [EvolversSymbol]: TEvolvers;
    mutate: (data: TData) => MutatorsFormatted<TData, TParamNoun, TEvolvers>;
    evolve: (data: TData) => MacroMutatorsFormatted<TData, TParamNoun, TEvolvers>;
    use: (data: TData) => {
        mutate: MutatorsFormatted<TData, TParamNoun, TEvolvers>;
        evolve: MacroMutatorsFormatted<TData, TParamNoun, TEvolvers>;
    };
    addTheseusId: (theseusId: string) => void;
};
