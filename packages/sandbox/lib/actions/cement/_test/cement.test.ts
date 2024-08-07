import { cement } from "../cement.js";
import {
	expect, describe, it, 
} from "vitest";
import { CONSTANTS } from "sandbox-constants";
import {
	containsSandbox, isSandbox, sandbox, 
} from "../../sandbox/index.js";
import structuredClone from "@ungap/structured-clone";
import { frost } from "../../frost/index.js";

describe("cement", function () 
{
	it("should modify the original object if it is a sandbox proxy in modify mode", function () 
	{
		const original = {
			key1: "value1",
			key2: "value2",
		};
		const changes = {
			key2: "newValue2",
			key3: "value3",
		};
		const proxy = {
			...original,
			[CONSTANTS.SANDBOX_SYMBOL]: {
				original,
				changes,
				params: {
					mode: "modify",
				},
			},
		};

		const result = cement(proxy);
		expect(result).to.equal(original); // Ensure that the result is the original object
		expect(result).to.deep.equal({
			key1: "value1",
			key2: "newValue2",
			key3: "value3",
		});
	});

	it("should return a new object with changes applied if it is a sandbox proxy in copy mode", function () 
	{
		const original = {
			key1: "value1",
			key2: "value2",
		};
		const changes = {
			key2: "newValue2",
			key3: "value3",
		};
		const proxy = {
			...original,
			[CONSTANTS.SANDBOX_SYMBOL]: {
				original,
				changes,
				params: {
					mode: "copy",
				},
			},
		};

		// Mock the isSandbox function to return true

		const result = cement(proxy);
		expect(result).to.deep.equal({
			key1: "value1",
			key2: "newValue2",
			key3: "value3",
		});
		expect(result).to.not.equal(original); // Ensure that the result is a new object
	});

	it("should apply changes to a target object with nested objects which have changes", function () 
	{
		const original = {
			key1: "value1",
			key2: {
				key3: "value3",
			},
		};
		const changes = {
			key2: {
				key3: "newValue3",
				key4: "value",
			},
		};
		const proxy = {
			...original,
			[CONSTANTS.SANDBOX_SYMBOL]: {
				original,
				changes,
				params: {
					mode: "copy",
				},
			},
		};

		const result = cement(proxy) as any;
		expect(result).to.deep.equal({
			key1: "value1",
			key2: {
				key3: "newValue3",
				key4: "value",
			},
		});
		expect(result.key2).to.not.equal(original.key2); // Ensure that the nested object is a new object
		expect(result).to.not.equal(original); // Ensure that the nested object is a new object
	});

	it("should find no remaining sandboxes in nested functions", function () 
	{
		const original = {
			key1: "value1",
			key2: {
				key3: "value3",
			},
		};
		const sb = sandbox(original);
		sb.key2.key3 = "replacement";
		const result = cement(sb);
		expect(result).to.deep.equal({
			key1: "value1",
			key2: {
				key3: "replacement",
			},
		});

		expect(isSandbox(result, "some")).to.be.false;
	});

	it("should cement nested objects even if the root object is not a sandbox", function () 
	{
		const original = {
			key1: "value1",
			key2: {
				key3: "value3",
			},
		};
		const sb = sandbox(original.key2);
		sb.key3 = "replacement";
		original.key2 = sb;
		const result = cement(original);
		expect(result).to.deep.equal({
			key1: "value1",
			key2: {
				key3: "replacement",
			},
		});

		expect(isSandbox(result)).to.be.false;
	});

	it("should cement deeply nested objects, even if the parent object is not a sandbox", function () 
	{
		const original = {
			key1: "value1",
			key2: {
				key3: {
					key4: {
						key5: "unchanged",
					},
				},
			},
		};

		const clone = structuredClone(original);

		const sb = sandbox(clone.key2.key3.key4);
		clone.key2.key3.key4 = sb;

		clone.key2.key3.key4.key5 = "changed";

		expect(clone.key2.key3.key4.key5).to.equal("changed");
		expect(original.key2.key3.key4.key5).to.equal("unchanged");

		const cemented = cement(clone);

		expect(cemented.key2.key3.key4.key5).to.equal("changed");
		expect(original.key2.key3.key4.key5).to.equal("unchanged");
		expect(containsSandbox(cemented)).to.be.false;
	});

	it("should handle sandbox set to property inside another sandbox", function () 
	{
		const sb1 = sandbox({
			sb1Prop: {},
		});

		const sb2 = sandbox({
			sb2Prop: {},
		});

		sb1.sb1Prop = sb2;

		const result = cement(sb1);

		expect(result).to.deep.equal({
			sb1Prop: {
				sb2Prop: {},
			},
		});

		expect(containsSandbox(result)).to.be.false;
	});

	it("should modify original object when cementing without using return", function () 
	{
		const obj = {
			a: 1,
			b: {
				c: 2,
			},
		};
		const frosted = frost(obj);
		const sb = sandbox(frosted);

		sb.a = 2;
		sb.b.c = 3;

		cement(sb);

		expect(obj).to.deep.equal({
			a: 2,
			b: {
				c: 3,
			},
		});

		expect(JSON.stringify(obj)).to.equal(JSON.stringify(frosted));
		expect(JSON.stringify(obj)).to.equal(JSON.stringify(sb));
	});

	it("should error after editing a cemented frosted object", function () 
	{
		const frostedObj = frost({
			a: 1,
		});
		const sb = sandbox(frostedObj);
		sb.a = 2;
		cement(sb);
		expect(() => 
		{
			// @ts-expect-error - This is a test
			frostedObj.a = 3;
		}).to.throw("Cannot modify property \"a\" of the original object.");
	});
});
