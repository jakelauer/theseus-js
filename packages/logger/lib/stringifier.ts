import { CONSTANTS } from "sandbox-constants";

const isPrimitive = (obj: object) =>
	obj === null || ["string", "number", "boolean", "object"].includes(typeof obj);

const isArrayOfPrimitive = (obj: object) => Array.isArray(obj) && obj.every(isPrimitive);

const format = (arr: any[]) => `^^^[ ${arr.map((val) => JSON.stringify(val)).join(", ")} ]`;

const replacer = (_key: any, value: any) => (isArrayOfPrimitive(value) ? format(value) : value);

const expand = (str: string) =>
	str.replace(/(?:"\^\^\^)(\[ .* \])(?:")/g, (_match, a) => a.replace(/\\"/g, '"'));

export const stringifier = (obj: object) => 
{
	if (isShallowSandbox(obj))
	{
		return "Sandbox";
	}
	
	if (isShallowFrost(obj))
	{
		return "Frost";
	}

	try 
	{
		return expand(JSON.stringify(obj, replacer, 2));
	}
	catch (e) 
	{
		if (e instanceof Error) 
		{
			return `CANNOT_STRINGIFY: ${e.message} ${e.stack}`;
		}
		return `CANNOT_STRINGIFY: ${e}`;
	}
};
function isShallowSandbox<T extends object>(obj: T) 
{
	return !!(obj as any)?.[CONSTANTS.SANDBOX_SYMBOL];
}

function isShallowFrost<T extends object>(obj: T) 
{
	return !!(obj as any)?.[CONSTANTS.FROST.BASIS_SYMBOL];
}

