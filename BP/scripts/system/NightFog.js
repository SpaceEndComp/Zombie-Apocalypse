import { system, world } from "@minecraft/server";

system.runInterval(() => {
    const time = world.getTimeOfDay();
    const isMidnight = time > 13000 && time < 18000;

    for (const player of world.getPlayers()) {
        if (isMidnight) {
            player.addEffect("minecraft:darkness", 5, {
                amplifier: 0,
                showParticles: false,
            });
        } else {
            player.removeEffect("minecraft:darkness");
        }
    }
}, 10);
