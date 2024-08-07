import { Theseus } from "@/Theseus";
import { getTheseusLogger } from "theseus-logger";
import { ProxyActions, ProxyActionType } from "../proxy-actions.js";
import type { ProxyActionMapParameters } from "../proxy-action-map.js";
import { cement } from "theseus-sandbox";

const log = getTheseusLogger("mutator-proxy-action");

export class MutatorAction extends ProxyActions 
{
	public override type: ProxyActionType = ProxyActionType.mutator;

	public override runTest({ target, prop }: ProxyActionMapParameters): boolean 
	{
		return typeof target.mutatorsForProxy?.[prop] === "function";
	}

	public override process(params: ProxyActionMapParameters) 
	{
		return this.handleMutatorCall(params);
	}

	private handleMutatorCall({
		target,
		prop,
		proxyManager,
		proxy, 
	}: ProxyActionMapParameters) 
	{
		return (...args: any[]) => 
		{
			log.verbose(`Mutator "${prop}" requested`);

			const queueResult = proxyManager.queue.queueMutation(prop, target.mutatorsForProxy[prop], args);

			if (proxyManager.isFinalChainLink) 
			{
				const complete = (execResult: any) => 
				{
					const cementedResult = cement(execResult);

					if (proxyManager.params.observationId) 
					{
						void Theseus.updateInstance(proxyManager.params.observationId, cementedResult);
					}

					return proxyManager.finalizeAndReset(cementedResult);
				};

				return queueResult instanceof Promise
					? queueResult.then(complete)
					: complete(queueResult);
			}

			return proxy;
		};
	}
}
