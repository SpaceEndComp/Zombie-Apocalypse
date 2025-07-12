import { dayLeveling } from "./DayLeveling";
import { world, EffectType } from "@minecraft/server";
import { showStatusUI } from "./ui/ShowStatusUI";

// Initialize the day leveling system
dayLeveling();

// Initialize the status UI
world.beforeEvents.chatSend.subscribe((msg) => {
    if (msg.message.toLowerCase() === "status") {
        msg.cancel = true;
        showStatusUI(msg.sender);
    }
});

// --- Fire Axe Custom Logic ---
const FIRE_AXE_ID = "za:fire_axe";

world.afterEvents.entityHit.subscribe(eventData => {
    const { damagingEntity, hitEntity } = eventData;

    // Check if the attacker is a player
    if (damagingEntity?.typeId !== "minecraft:player") {
        return;
    }

    // Get the player's held item
    const equipment = damagingEntity.getComponent("minecraft:equipable");
    const mainHandItem = equipment?.getEquipment("Mainhand");

    // If the held item has our custom weapon component...
    if (mainHandItem?.hasComponent("za:is_weapon")) {
        // 1. Trigger the attack cooldown. This is the modern replacement for "minecraft:weapon"
        //    and is what makes the "v.attack_time" variable work for your animation controller.
        damagingEntity.startItemCooldown("mainhand", 10); // 10 ticks = 0.5 seconds

        // 2. (Optional) Apply a special ability, like slowness.
        hitEntity.addEffect(EffectType.get("slowness"), 100, { amplifier: 1, showParticles: true });
    }
});
