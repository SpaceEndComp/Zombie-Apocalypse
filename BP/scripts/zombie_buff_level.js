import { world } from "@minecraft/server";

export function buffZombies(tahap) {
    const zombies = world
        .getDimension("overworld")
        .getEntities({ type: "minecraft:zombie" });

    zombies.forEach((z) => {
        // Stage 1: Slight speed, some health boost
        if (tahap >= 1) {
            z.addEffect("minecraft:speed", 999999, { amplifier: 1 }); // 5 min
            z.addEffect("minecraft:health_boost", 999999, { amplifier: 2 });
        }
        // Stage 2: More speed, some strength, night vision
        if (tahap >= 2) {
            z.addEffect("minecraft:speed", 999999, { amplifier: 2 });
            z.addEffect("minecraft:strength", 999999, { amplifier: 1 });
            z.addEffect("minecraft:night_vision", 999999, { amplifier: 0 });
        }
        // Stage 3: Add regeneration, resistance, fire resistance
        if (tahap >= 3) {
            z.addEffect("minecraft:regeneration", 999999, { amplifier: 1 });
            z.addEffect("minecraft:resistance", 999999, { amplifier: 1 });
            z.addEffect("minecraft:fire_resistance", 999999, { amplifier: 0 });
        }
    });

    world.sendMessage(
        `§a${zombies.length} zombie telah dibuff ke level ${tahap}!`
    );
}


export function spawnMutantZombie() {
    const platyers = world.getPlayers();

    platyers.forEach((player) => {
        const position = {
            x: player.location.x + (Math.random() - 0.5) * 10,
            y: player.location.y,
            z: player.location.z + (Math.random() - 0.5) * 10,
        };
        const dim = player.dimension;

        const mutant = dim.spawnEntity("minecraft:zombie", position);

        if (mutant) {
            mutant.nameTag = "§4§lZombie Mutant";
            mutant.addEffect("minecraft:strength", 120000, { amplifier: 3 }); // 10 min
            mutant.addEffect("minecraft:speed", 120000, { amplifier: 2 });
            mutant.addEffect("minecraft:resistance", 120000, { amplifier: 2 });
            mutant.addEffect("minecraft:regeneration", 120000, { amplifier: 2 });
            mutant.addEffect("minecraft:fire_resistance", 120000, { amplifier: 1 });
            mutant.addEffect("minecraft:health_boost", 120000, { amplifier: 5 });
        }
    });
}
