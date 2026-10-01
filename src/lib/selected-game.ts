import { cookies } from "next/headers";
import { parseGame } from "./games";
export async function getSelectedGame() {
  return parseGame((await cookies()).get("poker-game")?.value);
}
