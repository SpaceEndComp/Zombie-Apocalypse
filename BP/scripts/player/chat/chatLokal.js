import { world } from "@minecraft/server";

// Event listener untuk chat
world.beforeEvents.chatSend.subscribe((eventData) => {
    const player = eventData.sender;
    const message = eventData.message;
    
    // Cek apakah ini adalah chat dengan awalan !s
    if (message.startsWith("!s ")) {
        // Batalkan event chat default
        eventData.cancel = true;
        
        // Ambil pesan tanpa awalan !s
        const actualMessage = message.substring(3);
        
        // Dapatkan posisi pengirim
        const senderPos = player.location;
        
        // Kirim pesan ke semua player dalam radius yang lebih jauh (20 block)
        for (const targetPlayer of world.getPlayers()) {
            const targetPos = targetPlayer.location;
            
            // Hitung jarak antara pengirim dan target
            const distance = Math.sqrt(
                Math.pow(senderPos.x - targetPos.x, 2) +
                Math.pow(senderPos.y - targetPos.y, 2) +
                Math.pow(senderPos.z - targetPos.z, 2)
            );
            
            // Jika dalam radius 20 block
            if (distance <= 20) {
                let color = "";
                
                // Tentukan warna berdasarkan jarak
                if (distance <= 10) {
                    color = "§f"; // Putih (normal)
                } else if (distance <= 15) {
                    color = "§7"; // Abu-abu
                } else if (distance <= 20) {
                    color = "§8"; // Hitam
                }
                
                // Format pesan dengan nama player, jarak, dan ! di akhir
                const formattedMessage = `${color}[${Math.floor(distance)}m] ${player.name}: ${actualMessage}!`;
                
                // Kirim pesan ke target player
                targetPlayer.sendMessage(formattedMessage);
            }
        }
        
        // Log untuk debugging (opsional)
        console.warn(`[Chat !s] ${player.name}: ${actualMessage}!`);
        return;
    }
    
    // Chat normal (tanpa awalan !s) - radius 10 block
    // Batalkan event chat default
    eventData.cancel = true;
    
    // Dapatkan posisi pengirim
    const senderPos = player.location;
    
    // Kirim pesan ke semua player dalam radius
    for (const targetPlayer of world.getPlayers()) {
        const targetPos = targetPlayer.location;
        
        // Hitung jarak antara pengirim dan target
        const distance = Math.sqrt(
            Math.pow(senderPos.x - targetPos.x, 2) +
            Math.pow(senderPos.y - targetPos.y, 2) +
            Math.pow(senderPos.z - targetPos.z, 2)
        );
        
        // Jika dalam radius 10 block
        if (distance <= 10) {
            let color = "";
            
            // Tentukan warna berdasarkan jarak
            if (distance <= 5) {
                color = "§f"; // Putih (normal)
            } else if (distance <= 7) {
                color = "§7"; // Abu-abu
            } else if (distance <= 10) {
                color = "§8"; // Hitam
            }
            
            // Format pesan dengan nama player dan jarak
            const formattedMessage = `${color}[${Math.floor(distance)}m] ${player.name}: ${message}`;
            
            // Kirim pesan ke target player
            targetPlayer.sendMessage(formattedMessage);
        }
    }
    
    // Log untuk debugging (opsional)
    console.warn(`[Chat Lokal] ${player.name}: ${message}`);
});
