import { world} from "@minecraft/server";

// Fungsi untuk mengirim hari saat player mengetik !days
export function registerDayStatusCommand() {
    world.beforeEvents.chatSend.subscribe((event) => {
        if (event.message.trim().toLowerCase() === "!days") {
            event.cancel = true;
            const day = world.getDay();
            world.sendMessage(`§aHari ke-${day} di dunia ini!`);
        }
    });
}