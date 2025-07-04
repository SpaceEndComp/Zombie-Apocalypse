import { world, system } from "@minecraft/server";

system.runInterval(() => {
    let day = world.getDay();
    if (day == 2) {
        world.sendMessage(
            "§4§lHari ke-10 dimulai!, zombie berevousi ketahap 2!"
        );

        for (const player of world.getPlayers()) {
            const zombies = player.dimension.getEntities({
                type: "minecraft:zombie",
                maxDistance: 100,
                location: player.location,
            });

            for (const zombie of zombies) {
                zombie.addEffect(MinecraftEffectTypes.strength, 99999, 1);
                zombie.addEffect(MinecraftEffectTypes.speed, 100, 1);
                zombie.addEffect(MinecraftEffectTypes.regeneration, 10, 0);
            }
        }
    }
}, 0);


// halop