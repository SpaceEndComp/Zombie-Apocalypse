import { world, system} from "@minecraft/server";

let trigerred = false;
system.runInterval(() => {
    let day = world.getDay();
    if (day == 2 && !trigerred) {
        world.sendMessage("§l§4Hari ke-2 dimulai!, zombie berevolusi ke tahap 2!");
        const zombies = world.getDimension("overworld").getEntities({ type: "minecraft:zombie" });
        zombies.forEach(zombie => {
            zombie.addEffect(strength, 99999, 1);
            zombie.addEffect(speed, 100, 1);
            zombie.addEffect(regeneration, 10, 0);
        });
        trigerred = true;
    }
}, 0);