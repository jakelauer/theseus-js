import { expect } from "chai";

import { MutatorSetBuilder } from "../MutatorSetBuilder";

describe("MutatorSetBuilder", function () {
    type TestData = { testProp: number };
    const argName = "mutableTestProp";

    let initialData: TestData = { testProp: 42 };
    const makeBuilder = () =>
        MutatorSetBuilder.create(initialData, argName, {
            increase: ({ mutableTestProp }, amount: number) => {
                mutableTestProp.testProp += amount;
                return mutableTestProp;
            },
        });
    let builder = makeBuilder();

    beforeEach(function () {
        initialData = { testProp: 42 };
        builder = makeBuilder();
    });

    it("should correctly initialize with given data, argument name, and mutators", function () {
        expect(builder)
            .to.have.property("mutableData")
            .that.deep.equals({ [argName]: initialData });
    });

    it("inputToObject transforms input data into structured format", function () {
        const structuredData = (builder as any)["inputToObject"](initialData);
        expect(structuredData).to.deep.equal({ [argName]: initialData });
    });

    it("create method returns a new instance of MutatorSetBuilder", function () {
        expect(builder).to.be.instanceOf(MutatorSetBuilder);
        expect(builder)
            .to.have.property("mutableData")
            .that.deep.equals({ [argName]: initialData });
    });

    it("create method returns a new instance with mutators applied", function () {
        // Assert the builder is correctly initialized
        expect(builder).to.be.an.instanceof(MutatorSetBuilder);
        expect(builder.increase(0)).to.deep.equal(initialData);

        // Dynamically check if the 'increase' mutator is applied and works as expected
        // This will invoke the 'increase' function directly on the builder, demonstrating its presence and functionality
        const result = builder.increase(10);
        expect(result).to.deep.equal({ testProp: 52 });
    });
});
