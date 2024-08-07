import { frost } from "../../frost.js";
import {
	describe, expect, it, 
} from "vitest";
import { isFrost } from "../is-frost.js";

describe("is-frost-proxy", function () 
{
	it("should correctly identify a sandbox proxy object", function () 
	{
		const original = {
			a: 1,
			b: 2,
		};
		const proxy = frost(original);
		expect(isFrost(proxy)).to.equal(true);
	});

	it("should correctly identify a non-sandbox proxy object", function () 
	{
		const original = {
			a: 1,
			b: 2,
		};
		expect(isFrost(original)).to.equal(false);
	});

	it("should correctly identify a nested sandbox proxy object", function () 
	{
		const original = {
			a: 1,
			b: frost({
				c: 3,
				d: 4,
			}),
		};
		expect(isFrost(original, "every")).to.equal(false);
		expect(isFrost(original, "some")).to.equal(true);
	});
});
