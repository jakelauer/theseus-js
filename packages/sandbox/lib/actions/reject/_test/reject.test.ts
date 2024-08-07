import { reject } from "../reject.js";
import {
	expect, describe, it, 
} from "vitest";
import { CONSTANTS } from "sandbox-constants";

describe("reject", function () 
{
	it("should return the original object if it is a sandbox proxy", function () 
	{
		const original = {
			key: "value",
		};
		const proxy = {
			...original,
			[CONSTANTS.SANDBOX_SYMBOL]: {
				original,
			},
		};

		expect(reject(proxy)).to.equal(original);
	});

	it("should return the object itself if it is not a sandbox proxy", function () 
	{
		const obj = {
			key: "value",
		};

		expect(reject(obj)).to.equal(obj);
	});
});
