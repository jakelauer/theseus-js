import { Evolver, EvolverComplex, Refinery, RefineryComplex } from "../lib";

export interface MockData {
    touched: boolean;
}

export const mockRefineryComplex = RefineryComplex.create().withRefineries({
    mockRefinery: Refinery.create("mockRefinery", { noun: "mockData" })
        .toRefine<MockData>()
        .withForges({
            getOppositeOfTouched: ({ immutableMockData }) => {
                return !immutableMockData.touched;
            },
        }).mockRefinery,
});

export const mockEvolverComplex = EvolverComplex.create().withEvolvers({
    mockEvolver: Evolver.create("mockEvolver", { noun: "mockData" })
        .toEvolve<MockData>()
        .withMutators({
            toggleTouch: ({ mutableMockData }) => {
                mutableMockData.touched = !mutableMockData.touched;

                return mutableMockData;
            },
        }).mockEvolver,
});

export const mockEvolverKeyMap = {
    mock: {
        touch: "",
    },
};

export const mockMutatorKeyMap = {
    mock: {
        getOppositeOfTouched: "",
    },
};
