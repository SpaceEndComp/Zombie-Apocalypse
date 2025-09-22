import { system, world } from "@minecraft/server";

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        // const item = player.getComponent("equippable").getEquipment("Mainhand");
        const item = player.getComponent("inventory").container;

        const lightItems = [
            "minecraft:torch",
            "minecraft:glowstone",
            "minecraft:lantern",
            "minecraft:sea_lantern",
            "minecraft:beacon",
            "minecraft:respawn_anchor",
            "minecraft:end_rod",
            "minecraft:blaze_rod",
            "minecraft:fire_charge",
        ];

        const hasLightObject = Array.from({ length: item.size }).some(
            (_, i) => {
                const itemStack = item.getItem(i);
                return itemStack && lightItems.includes(itemStack.typeId);
            }
        );

        if (hasLightObject) {
            const zombies = world.getDimension("overworld").getEntities({
                type: "seza:zombie",
                location: player.location,
                maxDistance: 15,
            });

            for (const zombie of zombies) {
                zombie.runCommand("effect @s speed 1 1 false");
            }
        }
    }
}, 20);
