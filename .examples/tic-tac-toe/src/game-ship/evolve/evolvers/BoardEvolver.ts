import { Evolver } from "theseus-js";
import type { GameState, MarkType } from "../../state/GameState";

export const BoardEvolver = Evolver.create("BoardEvolver", { noun: "gameState" })
	.toEvolve<GameState>()
	.withMutators({
		/**
		 * Set the mark at the given coordinates.
		 */
		setMark: ({ mutableGameState }, coords: [number, number], mark: MarkType): GameState => 
		{
			const [row, col] = coords;
			mutableGameState.board[row][col] = mark;
			return mutableGameState;
		},
	});