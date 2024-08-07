import { getTheseusLogger } from "theseus-logger";
import { enumValToFlagNames } from "../../../../Shared/Object/Flags.js";
import type { ProxyActionMapParameters } from "./proxy-action-map.js";

export enum ProxyActionType {
    none = 0 << 0,
    function = 1 << 0, // 1
    mutator = 1 << 1, // 2
    toJSON = 1 << 2, // 4
    property = 1 << 3, // 8
    chainTermination = 1 << 4, // 16
    chainHelper = 1 << 5, // 32
    updateData = 1 << 6, // 64,
}

const log = getTheseusLogger("proxy-actions");

export abstract class ProxyActions 
{
	constructor() {}

    public abstract readonly type: ProxyActionType;

    public test(params: ProxyActionMapParameters, matchingRequestTypes: ProxyActionType) 
    {
    	const outcome = this.runTest(params, matchingRequestTypes);

    	if (outcome) 
    	{
    		log.verbose(`[${params.prop}] type: ${ProxyActionType[this.type]}`);
    	}

    	return outcome;
    }

    /**
	 * Determines whether the action should be run based on the parameters
	 */
    public abstract runTest(params: ProxyActionMapParameters, matchedRequestTypes: ProxyActionType): boolean;

    /**
	 * The action's main processing function
	 */
    public abstract process(params: ProxyActionMapParameters, requestType: ProxyActionType): any;

    public static flagNames(type: ProxyActionType) 
    {
    	return enumValToFlagNames(type, ProxyActionType);
    }
}
