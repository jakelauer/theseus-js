import "../set-log-level";
import { GameShip } from "../game-ship/game-ship";
import observeGameUpdates from "./observe-game-updates";

observeGameUpdates();

GameShip.mutate.Turn.nextTurn().catch(console.error);
