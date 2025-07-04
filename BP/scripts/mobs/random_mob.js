import { world, system } from "@minecraft/server";

export function randomMob() {
    try {
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
            const position = {
                x: player.location.x + (Math.random() - 0.5) * 20,
                y: player.location.y,
                z: player.location.z + (Math.random() - 0.5) * 20
            };
            const dimension = player.dimension;

            const mobEntity = dimension.spawnEntity(randomMob, position);

            if (mobEntity) {
                world.sendMessage(
                    `§l§aSebuah ${randomMob} telah muncul di dekatmu!`
                );
                mobEntity.addEffect("minecraft:strength", 99999, 255);
                mobEntity.addEffect("minecraft:speed", 100, 100);
                mobEntity.addEffect("minecraft:regeneration", 1000, 20);
            } else {
                world.sendMessage("§l§cGagal memunculkan mob!");
            }
        }
    } catch (e) {
        world.sendMessage(`§l§cTerjadi kesalahan: ${e.message}`);
    }
}
