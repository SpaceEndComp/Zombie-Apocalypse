import { system, world } from "@minecraft/server";

system.runInterval(() => {
    const time = world.getTimeOfDay();
    const isMidnight = time > 13000 && time < 22000;

    for (const player of world.getPlayers()) {
        if (isMidnight) {
            player.runCommand(`fog @s push "custom:dark_fog" "DarkOverride"`);
        } else {
            player.runCommand(`fog @s remove "DarkOverride"`);
        }
    }
}, 20);