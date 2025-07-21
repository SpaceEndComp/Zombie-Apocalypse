import { world} from "@minecraft/server";

// Fungsi untuk mengirim hari saat player mengetik !days
export function registerDayStatusCommand() {
    world.beforeEvents.chatSend.subscribe((event, player) => {
        if (event.message.trim().toLowerCase() === "!days") {
            event.cancel = true;
            let danger = "§aDamai";
            const day = world.getDay();
            const player = event.sender;
            if (day >= 1 && day <= 9) {
                danger = "§aDamai";
            } else if (day >= 10 && day <= 49) {
                danger = "§eWaspada"
            } else if (day >= 50) {
                danger = "§4Berbahaya"
            }
            player.sendMessage(`§aHari ke-${day} di dunia ini!\nTingkat bahaya: ${danger}`);
        }
    });
}