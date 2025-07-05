import { dayLeveling } from "./DayLeveling";
import { world } from "@minecraft/server";
import { showStatusUI } from "./ui/ShowStatusUI";
import { charDialog } from "./character/dialog"

// Initialize the day leveling system
dayLeveling();

// Initialize the status UI
world.beforeEvents.chatSend.subscribe((msg) => {
    if (msg.message.toLowerCase() === "status") {
        msg.cancel = true;
        showStatusUI(msg.sender)
    }
});
