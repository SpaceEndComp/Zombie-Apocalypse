import { world, system } from "@minecraft/server";

let lastSpawnTick = 0;
const cooldownTicks = 400;

export function randomMob() {
    try {
        const currentTick = system.currentTick;
        if (currentTick - lastSpawnTick < cooldownTicks) return;

        const mobs = [
            "minecraft:zombie",
            "minecraft:skeleton",
            "minecraft:creeper",
            "minecraft:spider",
            "minecraft:enderman",
        ];

        const randomIndex = Math.floor(Math.random() * mobs.length);
        const randomMob = mobs[randomIndex];

        const player = world.getPlayers()[0];

        if (player) {
            const position = player.location;
            const dimension = player.dimension;

            const mobEntity = dimension.spawnEntity(randomMob, position);

            if (mobEntity) {
                world.sendMessage(
                    `§l§aSebuah ${randomMob} telah muncul di dekatmu!`
                );
                mobEntity.addEffect("minecraft:strength", 99999, 1);
                mobEntity.addEffect("minecraft:speed", 100, 1);
                mobEntity.addEffect("minecraft:regeneration", 10, 0);
            } else {
                world.sendMessage("§l§cGagal memunculkan mob!");
            }

            lastSpawnTick = currentTick;
        }
    } catch (e) {
        world.sendMessage(`§l§cTerjadi kesalahan: ${e.message}`);
    }
}
