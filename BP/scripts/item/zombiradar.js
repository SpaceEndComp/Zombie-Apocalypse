import { system, world } from "@minecraft/server";

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const inv = player.getComponent("inventory").container;
        let hasDetector = false;

        for (let i = 0; i < inv.size; i++) {
            const item = inv.getItem(i);
            if (item && item.typeId === "minecraft:diamond") {
                hasDetector = true;
                break;
            }
        }

        if (hasDetector) {
            const zombies = player.dimension.getEntities({
                type: "seza:zombie",
                location: player.location,
                maxDistance: 40,
            });

            player.runCommand(
                `title @s actionbar §c${zombies.length} Zombie Terdeteksi!`
            );
        } else {
            // clear actionbar
            player.runCommand(`title @s actionbar`);
        }
    }
}, 20);
