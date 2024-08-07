import { getTheseusLogger } from "theseus-logger";
import type { ProxyActionMapParameters } from "../proxy-action-map.js";
import { ProxyActions, ProxyActionType } from "../proxy-actions.js";

const log = getTheseusLogger("to-json-proxy-action");

export class ToJsonAction extends ProxyActions 
{
	public override type: ProxyActionType = ProxyActionType.toJSON;

	public override runTest({ prop }: ProxyActionMapParameters): boolean 
	{
		return prop === "toJSON";
	}

	public override process({ target }: ProxyActionMapParameters) 
	{
		return this.toJson(target);
	}

	/** Handles the toJSON operation to allow serialization of the proxied object. */
	private toJson(target: any) 
	{
		log.verbose("toJSON called");
		return () => 
		{
			const copy = {
				...target,
			};
			delete copy.chainingProxy; // Remove the circular reference when serializing
			return copy;
		};
	}
}
