import { system, world } from "@minecraft/server";

system.runInterval(() => {
    const time = world.getTimeOfDay();
    const isMidnight = time > 13000 && time < 18000;

    for (const player of world.getPlayers()) {
        player.runCommand(
            `fog ${isMidnight ? "push" : "pop"} zombie_apocalypse_fog`
        );
    }
}, 100);
