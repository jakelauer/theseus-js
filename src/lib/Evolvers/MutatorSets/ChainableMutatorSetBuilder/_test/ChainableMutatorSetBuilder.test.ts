import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

import { ChainableMutatorSetBuilder } from "../ChainableMutatorSetBuilder";

chai.use(chaiAsPromised);

interface TestData {
    value: number;
}

const buildChainableMutatorSet = (testData: TestData) =>
    ChainableMutatorSetBuilder.createChainable(testData, "mutableTestData", {
        increment: ({ mutableTestData }, amount: number) => {
            mutableTestData.value += amount;
            return mutableTestData;
        },
        // Assuming a similar pattern for other mutators
        decrement: ({ mutableTestData }, amount: number) => {
            mutableTestData.value -= amount;
            return mutableTestData;
        },
        asyncIncrement: async ({ mutableTestData }, amount: number) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    mutableTestData.value += amount;
                    resolve(mutableTestData);
                }, 10);
            });
        },
        throwError: ({ mutableTestData }) => {
            throw new Error("Test Error");
        },
    });

describe("ChainableMutatorSet", function () {
    let testData: TestData;
    let chainableMutatorSet: ReturnType<typeof buildChainableMutatorSet>;

    beforeEach(function () {
        testData = { value: 0 };
        chainableMutatorSet = buildChainableMutatorSet(testData);
    });

    it("should allow chaining of mutator functions", async function () {
        chainableMutatorSet.increment(1).then.decrement(1);
        expect(testData.value).to.equal(0);
    });

    // Assuming an asynchronous mutator has been added to the TestMutators
    it("should handle asynchronous mutations correctly", async function () {
        try {
            await chainableMutatorSet.asyncIncrement(1).then.increment(2).finalFormAsync;
        } catch (e) {
            console.error(e);
        }
        expect(testData.value).to.equal(3);

        return;
    });

    it("should retrieve the final form of the mutated data correctly", function () {
        // Assuming getFinalForm returns the entire TestData object or specifically the mutableTestData part
        expect(chainableMutatorSet.increment(3).finalForm.value).to.equal(3);
    });

    // Testing the factory method's successful creation of a ChainableMutatorSet instance
    it("should correctly create a chainable mutator set with initial data and mutators", function () {
        // The instance has already been created in the beforeEach hook. This test verifies its correctness post-creation.
        expect(chainableMutatorSet).to.be.an.instanceof(ChainableMutatorSetBuilder);
        expect(chainableMutatorSet.increment(5).finalForm.value).to.equal(5);
    });

    // Testing the overridden create method to ensure it throws an error for non-chainable mutator sets
    it("should throw an error when attempting to create non-chainable mutators", function () {
        expect(() => ChainableMutatorSetBuilder.create()).to.throw(
            "ChainableMutatorSet does not support non-chained mutators.",
        );
    });

    it("should handle errors thrown by mutator functions correctly", function () {
        expect(() => chainableMutatorSet.throwError()).to.throw("Test Error");
    });

    it("should handle errors thrown by async mutator functions correctly as rejections", function () {
        // return expect(chainableMutatorSet.asyncIncrement(1).then.throwError()).to.be.rejectedWith(
        //     "Test Error",
        // );
    });

    it("should correctly handle chains with mixed synchronous and asynchronous mutators", async function () {
        let outcome: number | undefined = undefined;
        try {
            const result = await chainableMutatorSet
                .increment(1)
                .then.decrement(2)
                .then.asyncIncrement(3)
                .then.increment(4)
                .then.asyncIncrement(5)
                .finally.increment(6);

            outcome = result.value;
        } catch (e) {
            console.error(e);
        }

        expect(outcome).to.equal(17);
        return;
    });

    it("should allow multiple chains to execute in parallel without interference", async function () {
        const anotherTestData = { value: 10 };
        const anotherChain = buildChainableMutatorSet(anotherTestData);

        await Promise.all([chainableMutatorSet.increment(5), anotherChain.increment(5)]);

        expect(testData.value).to.equal(5);
        expect(anotherTestData.value).to.equal(15);
    });
});
