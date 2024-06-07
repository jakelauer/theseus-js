import { Theseus } from "@/Theseus";
import { getTheseusLogger } from "../../../../../Shared";
import { ProxyActions, ProxyActionType } from "../proxy-actions";
import type { ProxyActionMapParameters } from "../proxy-action-map";


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

	private handleMutatorCall({ target, prop, proxyManager, proxy }: ProxyActionMapParameters) 
	{
		return (...args: any[]) => 
		{
			log.verbose(`Mutator "${prop}" requested`);

			const execResult = proxyManager.queue.queueMutation(prop, target.mutatorsForProxy[prop], args);

			if (proxyManager.isFinalChainLink) 
			{
				if (proxyManager.params.observationId) 
				{
					void Theseus.updateInstance(proxyManager.params.observationId, execResult);
				}

				//this.log.verbose(`.lastly mode active, returning result of queued operations after prop ${prop}`, execResult);

				return proxyManager.finalizeAndReset(execResult);
			}

			return proxy;
		};
	}
}