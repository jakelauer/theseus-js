import { CONSTANTS } from "sandbox-constants";
import {
	expect, describe, it, 
} from "vitest";
import { assertValidVerificationProperty } from "../assertions.js";

describe("assertValidVerificationProperty", function () 
{
	it("should return true if the verification property matches the value", function () 
	{
		const verificationOwnerObj = {
			prop: "testProp",
			value: "testValue",
			[CONSTANTS.FROST.BASIS_SYMBOL]: 123,
		};

		const valueToCheck = 123;
		expect(assertValidVerificationProperty(verificationOwnerObj, valueToCheck)).to.be.true;
	});

	it("should throw an error if the verification property does not match the value", function () 
	{
		const verificationOwnerObj = {
			prop: "testProp",
			value: "testValue",
			[CONSTANTS.FROST.BASIS_SYMBOL]: 123,
		};

		const valueToCheck = 456;
		expect(() => assertValidVerificationProperty(verificationOwnerObj, valueToCheck)).to.throw(
			"Invalid verification property.",
		);
	});
});
