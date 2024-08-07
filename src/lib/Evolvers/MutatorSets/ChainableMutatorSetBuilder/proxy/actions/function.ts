import { getTheseusLogger } from "theseus-logger";
import type { ProxyActionMapParameters } from "../proxy-action-map.js";
import { ProxyActions, ProxyActionType } from "../proxy-actions.js";
import { ChainTerminationAction } from "./chain-termination.js";

const log = getTheseusLogger("function-proxy-action");

export class FunctionAction extends ProxyActions 
{
	public override type: ProxyActionType = ProxyActionType.function;

	public override runTest(params: ProxyActionMapParameters): boolean 
	{
		const { target, prop } = params;
		const chainTerminationAction = new ChainTerminationAction();
		return (
			typeof target[prop] === "function" && !chainTerminationAction.test(params, ProxyActionType.chainTermination)
		);
	}

	public override process({ target, prop }: ProxyActionMapParameters) 
	{
		return this.handleFunctionCall(prop, target);
	}

	private handleFunctionCall(prop: string, target: any) 
	{
		log.verbose(`Function "${prop}" called`);
		return target[prop];
	}
}
