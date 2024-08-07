import {
	describe, it, expect, 
} from "vitest";

import { normalizeEvolverName } from "../normalizeEvolverName.js";

describe("normalizeEvolverName", () => 
{
	it("should remove \"Evolver\" from the start of the string, respecting case sensitivity", () => 
	{
		const result = normalizeEvolverName("EvolverName" as any);
		expect(result).to.equal("Name");
	});

	it("should remove \"evolver\" from the start of the string, respecting case sensitivity", () => 
	{
		const result = normalizeEvolverName("evolverName" as any);
		expect(result).to.equal("Name");
	});

	it("should remove \"Evolver\" from the end of the string, respecting case sensitivity", () => 
	{
		const result = normalizeEvolverName("NameEvolver");
		expect(result).to.equal("Name");
	});

	it("should remove \"evolver\" from the end of the string, respecting case sensitivity", () => 
	{
		const result = normalizeEvolverName("Nameevolver" as any);
		expect(result).to.equal("Name");
	});

	it("should remove \"Evolver\" from both the start and the end of the string, respecting case sensitivity", () => 
	{
		const result = normalizeEvolverName("EvolverNameEvolver" as any);
		expect(result).to.equal("Name");
	});

	it("should remove \"evolver\" from both the start and the end of the string, respecting case sensitivity", () => 
	{
		const result = normalizeEvolverName("evolverNameevolver" as any);
		expect(result).to.equal("Name");
	});

	it("should not alter the string if \"Evolver\" or \"evolver\" is not present", () => 
	{
		const result = normalizeEvolverName("Name" as any);
		expect(result).to.equal("Name");
	});

	it("should handle strings with only \"Evolver\", respecting case sensitivity", () => 
	{
		const result = normalizeEvolverName("Evolver");
		expect(result).to.equal("Evolver");
	});

	it("should handle strings with only \"evolver\", respecting case sensitivity", () => 
	{
		const result = normalizeEvolverName("evolver");
		expect(result).to.equal("evolver");
	});

	it("should correctly process an empty string", () => 
	{
		expect(() => normalizeEvolverName("")).to.throw("Name cannot be empty.");
	});

	it("should ensure name is a valid JS propert", () => 
	{
		const result = normalizeEvolverName("Evolver1");
		expect(result).to.equal("Evolver1");

	});
});
