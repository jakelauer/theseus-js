import {
	expect, afterEach, beforeEach, describe, it, vi,
} from "vitest";
import TheseusBuilder from "../TheseusBuilder.js";
import { getTheseusLogger } from "theseus-logger";

// Mock external dependencies and types
// Assuming these mock functions and classes are implemented elsewhere in the test suite
import {
	mockEvolverComplex, mockRefineryComplex, type MockData, 
} from "./mocks.js";

describe("TheseusBuilder", function () 
{
	let loggerSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(function () 
	{
		// Mock the logger to observe logging operations
		loggerSpy = vi.spyOn(getTheseusLogger("test"), "debug");
	});

	afterEach(function () 
	{
		vi.restoreAllMocks(); // Reset all mocks and spies
	});

	it("extends a Theseus instance with evolvers correctly", function () 
	{
		const theseusInstance = TheseusBuilder<MockData>({
			touched: false,
		}).maintainWith({
			evolvers: mockEvolverComplex,
		});

		// Verify the extension was successful
		expect(theseusInstance).not.to.have.property("refine");
		expect(theseusInstance).to.have.property("evolve");
		expect(theseusInstance).to.have.property("mutate");
		expect(theseusInstance.evolve).to.have.property("mock");
		expect(theseusInstance.mutate).to.have.property("mock");

		expect(() =>
			theseusInstance.evolve.mock
				.toggleTouch()
				.and.toggleTouch()
				.and.toggleTouch()
				.and.toggleTouch()
				.lastly.toggleTouch(),
		).not.to.throw();

		expect(() => theseusInstance.mutate.mock.toggleTouch()).not.to.throw();
	});

	it("extends a Theseus instance with evolvers and refineries correctly", function () 
	{
		const theseusInstance = TheseusBuilder<MockData>({
			touched: false,
		}).maintainWith({
			evolvers: mockEvolverComplex,
			refineries: mockRefineryComplex,
		});

		// Verify the extension was successful
		expect(theseusInstance).to.have.property("evolve");
		expect(theseusInstance.evolve).to.have.property("mock");

		expect(theseusInstance).to.have.property("refine");
		expect(theseusInstance.refine).to.have.property("mock");

		const refinerTest = (refiner: () => any, expectedValue: any) => 
		{
			const result = refiner();
			expect(result).to.equal(expectedValue);
		};

		refinerTest(() => theseusInstance.refine.mock.getOppositeOfTouched(), !theseusInstance.state.touched);
	});
});
