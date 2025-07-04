import { world, system } from "@minecraft/server";
import { randomMob } from "./random_mob";

let isDayTriggered = {};

system.runInterval(() => {
    let day = world.getDay();

    if (!isDayTriggered[day]) {
        if (day === 2 && !trigerred) {
            world.sendMessage(
                "§l§4Hari ke-2 dimulai!, zombie berevolusi ke tahap 2!"
            );
        }
        isDayTriggered[day] = true;
    }
    randomMob();
}, 20);
