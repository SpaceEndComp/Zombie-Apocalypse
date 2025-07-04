import { world, system } from "@minecraft/server";

system.runInterval(() => {
    const day = world.getDay();
    if (day == 10) {
        world.sendMessage("§4§lHari ke-10 dimulai!, zombie berevousi ketahap 2!");
        
    }
}, 0);