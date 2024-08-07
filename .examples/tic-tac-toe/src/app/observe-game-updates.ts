import { getTheseusLogger } from "theseus-logger";
import { GameShip } from "../game-ship/game-ship.js";
import { onWinner } from "./on-winner.js";
import { onGameUpdated } from "./on-game-updated.js";

const log = getTheseusLogger("Observe");

export default function () 
{
	GameShip.observe(async (state) => 
	{
		switch (state.winner) 
		{
			case "stalemate":
				log.major("Stalemate detected! Game over.");
				break;
			case "X":
			case "O":
				onWinner();
				break;
			default:
				log.major("Move detected! Taking next turn...");
				await onGameUpdated();
				break;
		}
	}, false);
}
