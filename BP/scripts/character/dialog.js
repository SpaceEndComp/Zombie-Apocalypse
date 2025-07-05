import { world } from "@minecraft/server";

export function showDay10Dialog() {
    const dialogId = "za:dialog1_sent";
    const alreadySent = world.getDynamicProperty(dialogId);

    if (alreadySent) {
        return;
    }

    for (const player of world.getAllPlayers()) {
        player.onScreenDisplay.setActionBar({
            rawtext: [{ text: `${player.name}: ` }, { translate: "actionbar.za:dialog1" }],
        });
    }
    world.setDynamicProperty(dialogId, true);
}

