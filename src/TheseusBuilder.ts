import type { BroadcasterObserver } from "@Broadcast/BroadcasterObserver";
import type { EvolverComplexInstance } from "@Evolvers/EvolverComplex";
import { EvolverComplex } from "@Evolvers/EvolverComplex";
import { RefineryComplex } from "@Refineries/RefineryComplex";
import { getTheseusLogger } from "@Shared/index";

import { Theseus } from "./Theseus";

import type { MacroMutatorsFormatted, MutatorsFormatted } from "@Evolvers/Types/EvolverComplexTypes";
import type { EvolverInstance } from "@Evolvers/Types/EvolverTypes";
import type { MutatorDefs } from "@Evolvers/Types/MutatorTypes";
import type { RefineryInitializer } from "@Refineries/Refinery";
import type { RefineryComplexInstance } from "@Refineries/RefineryComplex";
import type { ForgeDefs } from "@Refineries/Types";
import type { RefineryComplexOutcome } from "@Refineries/Types/RefineryComplexTypes";
import type { Immutable } from "@Shared/String/makeImmutable";
import type { Mutable } from "@Shared/String/makeMutable";
import type { ITheseus, TheseusParams } from "@Types/Theseus";
const log = getTheseusLogger("TheseusBuilder");

/** Extend Theseus with additional methods */
const extendTheseusWith = <TTheseus extends ITheseus<any>, TExtension extends object>(
    instance: TTheseus,
    extension: TExtension,
) => {
    const propertyMapFromExtension = Object.keys(extension).reduce((acc, key) => {
        const propertyDescriptor: any = Object.getOwnPropertyDescriptor(extension, key);
        if (propertyDescriptor.get || propertyDescriptor.set) {
            acc[key] = {};
            if (propertyDescriptor.get) {
                acc[key].get = propertyDescriptor.get; // Assign the getter function
            }
            if (propertyDescriptor.set) {
                acc[key].set = propertyDescriptor.set; // Assign the setter function
            }
        } else {
            acc[key] = {
                value: propertyDescriptor.value,
                writable: true,
            };
        }

        return acc;
    }, {} as PropertyDescriptorMap);

    Object.defineProperties(instance, propertyMapFromExtension);

    return instance as TTheseus & TExtension;
};

/** Create a new Theseus instance */
export default <TData extends object>(data: TData) => ({
    maintainWith: <
        TParamName extends string,
        TMutators extends MutatorDefs<TData, Mutable<TParamName>>,
        TEvolvers extends Record<string, EvolverInstance<TData, string, Mutable<TParamName>, TMutators>>,
        TForges extends ForgeDefs<TData, Immutable<TParamName>>,
        TRefineries extends Record<string, RefineryInitializer<TData, TParamName, TForges>>,
        TObserverType extends BroadcasterObserver<TData> = BroadcasterObserver<TData>,
    >(
        params: TheseusParams<TData, TParamName, TMutators, TEvolvers, TForges, TRefineries, TObserverType>,
    ) => {
        const { evolvers, refineries, ...rest } = params;
        const theseusInstance = new Theseus<TData, TObserverType>(data, rest);

        type ParamsAbbrev = TheseusParams<
            TData,
            TParamName,
            TMutators,
            TEvolvers,
            TForges,
            TRefineries,
            TObserverType
        >;

        type RefineExtension = {
            refine?: RefineryComplexOutcome<TData, TParamName, TForges, TRefineries>;
        };

        type BaseExtension = {
            evolve: MacroMutatorsFormatted<TData, TParamName, TEvolvers>;
            mutate: MutatorsFormatted<TData, TParamName, TEvolvers>;
        };
        type Extension = BaseExtension &
            (ParamsAbbrev["refineries"] extends undefined ? RefineExtension : Required<RefineExtension>);

        const addEvolversAndRefineries = (
            innerInstance: ITheseus<TData>,
            evolvers: TEvolvers | EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>,
            refineries?: TRefineries | RefineryComplexInstance<TData, TParamName, TForges, TRefineries>,
        ) => {
            const evolverComplex: EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers> =
                "evolve" in evolvers ?
                    (evolvers as EvolverComplexInstance<TData, TParamName, TMutators, TEvolvers>)
                :   EvolverComplex.create<TData>().withEvolvers(evolvers);

            // set theseus id for each evolver, so that we can track which theseus is being used
            Object.values(evolverComplex.__evolvers__).forEach(
                (evolver: EvolverInstance<TData, string, Mutable<TParamName>, TMutators>) =>
                    evolver.__setTheseusId(innerInstance.__uuid),
            );

            let extension: BaseExtension = {
                evolve: evolverComplex.evolve(innerInstance.state),
                mutate: evolverComplex.mutate(innerInstance.state),
            };

            log.debug(
                `Added evolvers and mutators to extension for Theseus instance ${innerInstance.__uuid}`,
                extension,
            );

            if (refineries) {
                log.debug(
                    `Refineries found, adding to extension for Theseus instance ${innerInstance.__uuid}`,
                );
                const complex: RefineryComplexInstance<TData, TParamName, TForges, TRefineries> =
                    "refine" in refineries ?
                        (refineries as RefineryComplexInstance<TData, TParamName, TForges, TRefineries>)
                    :   RefineryComplex.create<TData>().withRefineries(refineries);

                extension = Object.defineProperties<BaseExtension>(
                    { ...extension, refine: undefined } as any,
                    {
                        refine: {
                            get: () => {
                                const instanceState = Theseus.getInstance(innerInstance.__uuid).state;
                                return complex.refine(instanceState);
                            },
                        },
                    },
                ) as Extension;

                log.debug(
                    `Added refineries to extension for Theseus instance ${innerInstance.__uuid}`,
                    extension,
                );
            }

            return extension as Extension;
        };

        log.debug(
            `Extending Theseus instance ${theseusInstance.__uuid} with evolvers and refineries`,
            theseusInstance,
        );

        const extension = addEvolversAndRefineries(theseusInstance, evolvers, refineries);

        log.debug(`Built extension for Theseus instance ${theseusInstance.__uuid}`, extension);

        const theseusExtended = extendTheseusWith<ITheseus<TData>, Extension>(theseusInstance, extension);

        log.debug(`Theseus instance ${theseusInstance.__uuid} is ready`, theseusExtended);

        return theseusExtended;
    },
});
