import { world, system } from "@minecraft/server";

let done = false;
let days = world.getDay();
system.runInterval(() => {
    if (days === 2 && !done) {
        world.sendMessage("§l§4Hari ke-2 telah dimulai!\nSEMUA ZOMBIE BEREVOLUSI KETAHAP 2!");
        done = true
    };
    const zombie = world.getDimension("overworld").getEntities({ type: "minecraft:zombie" });
    zombie.forEach(zombie) => {
        zombie.addEffect("minecraft:strength", 600, { amplifier: 1 });
    }
})