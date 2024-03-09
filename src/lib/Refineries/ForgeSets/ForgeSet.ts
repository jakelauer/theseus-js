import getTheseusLogger from "@Shared/Log/get-theseus-logger";
import { Immutable } from "@Shared/String/makeImmutable";

import { ExposeForges, ForgeDefs } from "../Types/RefineryTypes";

const log = getTheseusLogger("ForgeSet");

/**
 * Represents a set of forge functions applied to forgeable data. Forge functions are responsible for refining
 * or transforming the data in a specific way. This class facilitates the organizati execution of these forge
 * functions.
 */
export class ForgeSet<
    TData extends object,
    TParamName extends Immutable,
    TForges extends ForgeDefs<TData, TParamName>,
> {
    protected readonly argName: TParamName;
    protected mutableData: { [key in TParamName]: TData };

    constructor(inputData: TData, argName: TParamName, forges: TForges) {
        this.argName = argName;
        this.mutableData = this.inputToObject(inputData);

        this.extendSelfWithForges(forges);
    }

    /**
     * Extends the ForgeSet instance with forge functions defined in the `forges` parameter. It recursively
     * traverses the forges object, adding each function to the instance.
     */
    private extendSelfWithForges(forges: TForges, path: string[] = []) {
        Object.keys(forges).forEach((key) => {
            const item = forges[key];
            const newPath = [...path, key];

            if (typeof item === "function") {
                // Use reduce to traverse and/or build the nested structure
                const lastKey = newPath.pop() as string;
                const context = newPath.reduce((obj, key) => {
                    if (!obj[key]) obj[key] = {};
                    return obj[key];
                }, this as any);

                // Assign the function
                this.addFunctionToSelf(context, lastKey, item);
            } else if (typeof item === "object" && item !== null) {
                // Recursive call for nested objects
                this.extendSelfWithForges(item as TForges, newPath);
            }
        });
    }

    /**
     * Adds a forge function to the instance at the specified path. This method is used internally by
     * `extendSelfWithForges` to attach forge functions to the instance.
     */
    protected addFunctionToSelf(context: any, selfPath: string, func: (...args: any[]) => any) {
        Object.assign(context, {
            [selfPath]: (...args: any[]) => {
                return func(this.mutableData, ...args);
            },
        });
    }

    /**
     * Transforms the input data into the structured format expected by the forge functions, keyed by the
     * parameter name.
     */
    protected inputToObject<TData, TParamName extends string>(input: TData): { [key in TParamName]: TData } {
        return { [this.argName]: input } as {
            [key in TParamName]: TData;
        };
    }

    /**
     * Factory method to create an instance of `ForgeSet` with specified initial data, argument name, and
     * forge definitions. This method facilitates the easy setup of a ForgeSet with a specific set of forges.
     *
     * @param data The initial forgeable data.
     * @param argName The name of the argument representing the forgeable part of the data.
     * @param forges The definitions of forge functions to apply to the data.
     * @returns An instance of `ForgeSet` configured with the provided parameters.
     */
    public static create<
        TData extends object,
        TParamName extends Immutable,
        TForges extends ForgeDefs<TData, TParamName>,
    >(data: TData, argName: TParamName, forges: TForges): ExposeForges<TData, TParamName, TForges> {
        return new ForgeSet(data, argName, forges) as ExposeForges<TData, TParamName, TForges>;
    }

    public get self() {
        return this;
    }
}
