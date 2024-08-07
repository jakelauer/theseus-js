import { sandbox } from "../sandbox.js";
import {
	expect, describe, it, 
} from "vitest";
import { isSandbox } from "../detect/is-sandbox-proxy.js";
import { CONSTANTS } from "sandbox-constants";
import { cement } from "../../cement/cement.js";

describe("sandbox", function () 
{
	it("should create a sandbox proxy for the given object", function () 
	{
		const original = {
			a: 1,
			b: 2,
		};
		const proxy = sandbox(original);
		expect(proxy).not.to.equal(original);
		expect(proxy.a).to.equal(1);
		expect(proxy.b).to.equal(2);
	});

	it('should allow modifications if the mode is "modify"', function () 
	{
		const original = {
			a: 1,
			b: 2,
		};
		const proxy = sandbox(original, {
			mode: "modify",
		});
		proxy.a = 3;
		expect(proxy.a).to.equal(3);
		expect(original.a).to.equal(1); // original should not be modified
	});

	it('should allow modifications if the mode is "copy"', function () 
	{
		const original = {
			a: 1,
			b: 2,
		};
		const proxy = sandbox(original, {
			mode: "copy",
		});
		expect(() => 
		{
			proxy.a = 3;
		}).not.to.throw();
	});

	it("should track changes made to the proxy object", function () 
	{
		const original = {
			a: 1,
			b: 2,
		};
		const proxy = sandbox(original);
		proxy.a = 3;
		expect((proxy as any)[CONSTANTS.SANDBOX_SYMBOL].changes.a).to.equal(3);
	});

	it("should create a proxy of nested objects as well", function () 
	{
		const original = {
			a: {
				b: 1,
				c: 2,
			},
		};
		const proxy = sandbox(original);

		const recursiveCheckIfProxy = (obj: any) => 
		{
			if (typeof obj === "object" && obj !== null) 
			{
				expect(isSandbox(obj)).to.be.true;
				for (const key in obj) 
				{
					recursiveCheckIfProxy(obj[key]);
				}
			}
		};
	});

	it("should not proxy the sandbox symbol", function () 
	{
		const original = {
			a: 1,
			b: 2,
		};
		const proxy = sandbox(original) as any;
		expect(proxy[CONSTANTS.SANDBOX_SYMBOL][CONSTANTS.SANDBOX_SYMBOL]).to.be.undefined;
	});

	it("should sandbox changes that replace nested objects", function () 
	{
		const original: any = {
			a: {
				b: 1,
				c: 2,
			},
		};
		const proxy = sandbox(original);
		proxy.a = {
			d: 3,
			e: 4,
		};
		expect(isSandbox(proxy.a)).to.be.true;
	});

	it("should sandbox arrays nested in objects", function () 
	{
		const original: any = {
			a: [1, 2, 3],
		};
		const proxy = sandbox(original);
		expect(isSandbox(proxy.a)).to.be.true;
	});

	it("should sandbox objects nested in arrays nested in objects", function () 
	{
		const original: any = {
			a: [
				{
					b: 1,
				},
				{
					c: 2,
				},
			],
		};
		const proxy = sandbox(original);
		expect(isSandbox(proxy.a[0])).to.be.true;
		expect(isSandbox(proxy.a[1])).to.be.true;
	});

	it("should correctly process changes to objects nested in arrays nested in objects", function () 
	{
		const original: any = {
			a: [
				{
					b: 1,
				},
				{
					c: 2,
				},
			],
		};
		const proxy = sandbox(original);
		proxy.a[0].b = 3;
		expect(proxy.a[0].b).to.equal(3);
		expect(original.a[0].b).to.equal(1);

		const result = cement(proxy);

		expect(result.a[0].b).to.equal(3, "cemented object should keep the changes from the sandbox");
		expect(original.a[0].b).to.equal(3);
		expect(result).to.equal(original);
	});

	it("should correctly process changes to objects nested in arrays nested in objects, and keep the original intact in copy mode", function () 
	{
		const original: any = {
			a: [
				{
					b: 1,
				},
				{
					c: 2,
				},
			],
		};
		const proxy = sandbox(original, {
			mode: "copy",
		});
		proxy.a[0].b = 3;
		expect(proxy.a[0].b).to.equal(3);
		expect(original.a[0].b).to.equal(1);

		const result = cement(proxy);

		expect(result.a[0].b).to.equal(3, "cemented object should keep the changes from the sandbox");
		expect(original.a[0].b).to.equal(1);
	});

	it("should not sandbox nullish values", function () 
	{
		const original: any = {
			a: null,
		};
		let proxy: any;
		expect(() => 
		{
			proxy = sandbox(original);
		}).not.to.throw();
		expect(isSandbox(proxy.a)).to.be.false;
	});

	it("should not break when dates are present", function () 
	{
		const original: any = {
			a: new Date(),
		};
		let proxy: any;
		expect(() => 
		{
			proxy = sandbox(original);
		}).not.to.throw();
		expect(isSandbox(proxy.a)).to.be.false;
	});
});
