import "./DayLeveling";

// Blocks
import "./blocks/radio";

// Guns
import "./gun/logic_pistol";

// Player
import "./player/chat/chatLokal";

// UI
import "./ui/ShowStatusUI";

// System
import "./system/NightFog";

// Items
import "./item/zombiradar"; // sesuaikan zombie
import "./item/meleHitDelays";

// Mobs
import "./mobs/ZombieBehav"; // sesuaikan zombie


import { world, system, BlockPermutation } from '@minecraft/server';

// Konfigurasi sistem hearing
const HEARING_CONFIG = {
    maxHearingDistance: 32,
    soundEvents: [
        'blockBreak',
        'blockPlace', 
        'playerMove',
        'itemDrop'
    ]
};

// Storage untuk posisi suara terakhir
const lastSoundPositions = new Map();

// Event listener untuk block break
world.afterEvents.playerBreakBlock.subscribe((event) => {
    const soundPos = event.block.location;
    const playerId = event.player.id;
    
    lastSoundPositions.set('break_' + Date.now(), {
        x: soundPos.x,
        y: soundPos.y, 
        z: soundPos.z,
        timestamp: Date.now(),
        type: 'blockBreak'
    });
    
    attractZombies(soundPos, 'blockBreak');
});

// Event listener untuk block place
world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const soundPos = event.block.location;
    
    lastSoundPositions.set('place_' + Date.now(), {
        x: soundPos.x,
        y: soundPos.y,
        z: soundPos.z, 
        timestamp: Date.now(),
        type: 'blockPlace'
    });
    
    attractZombies(soundPos, 'blockPlace');
});

// Event listener untuk item drop (suara item jatuh)
world.afterEvents.itemSpawn.subscribe((event) => {
    const soundPos = event.entity.location;
    
    lastSoundPositions.set('drop_' + Date.now(), {
        x: soundPos.x,
        y: soundPos.y,
        z: soundPos.z,
        timestamp: Date.now(), 
        type: 'itemDrop'
    });
    
    attractZombies(soundPos, 'itemDrop');
});

// Fungsi utama untuk menarik zombie ke sumber suara
function attractZombies(soundLocation, soundType) {
    const dimension = world.getDimension('overworld');
    
    // Cari semua zombie dalam radius
    const zombies = dimension.getEntities({
        type: 'minecraft:zombie',
        location: soundLocation,
        maxDistance: HEARING_CONFIG.maxHearingDistance
    });
    
    zombies.forEach(zombie => {
        // Hitung jarak dari zombie ke sumber suara
        const zombiePos = zombie.location;
        const distance = Math.sqrt(
            Math.pow(zombiePos.x - soundLocation.x, 2) +
            Math.pow(zombiePos.y - soundLocation.y, 2) +
            Math.pow(zombiePos.z - soundLocation.z, 2)
        );
        
        // Zombie hanya bereaksi jika dalam jarak hearing
        if (distance <= HEARING_CONFIG.maxHearingDistance) {
            // Set target ke posisi suara
            zombie.runCommand(`tp @s ~ ~ ~ facing ${soundLocation.x} ${soundLocation.y} ${soundLocation.z}`);
            
            // Beri efek untuk menunjukkan zombie "mendengar"
            zombie.runCommand('effect @s speed 3 0 true');
            
            // Tambahkan partikel untuk efek visual
            dimension.runCommand(`particle minecraft:villager_angry ${zombiePos.x} ${zombiePos.y + 2} ${zombiePos.z}`);
        }
    });
}

// Sistem pembersihan data lama (cleanup)
system.runInterval(() => {
    const currentTime = Date.now();
    
    for (const [key, soundData] of lastSoundPositions.entries()) {
        // Hapus data suara yang sudah lebih dari 30 detik
        if (currentTime - soundData.timestamp > 30000) {
            lastSoundPositions.delete(key);
        }
    }
}, 200); // Jalankan setiap 10 detik (200 ticks)

// Sistem deteksi gerakan player (opsional - untuk suara langkah kaki)
let playerLastPositions = new Map();

system.runInterval(() => {
    world.getAllPlayers().forEach(player => {
        const currentPos = player.location;
        const lastPos = playerLastPositions.get(player.id);
        
        if (lastPos) {
            const moved = Math.abs(currentPos.x - lastPos.x) > 0.1 || 
                         Math.abs(currentPos.z - lastPos.z) > 0.1;
            
            // Deteksi gerakan cepat (berlari)
            const fastMovement = Math.abs(currentPos.x - lastPos.x) > 0.3 || 
                               Math.abs(currentPos.z - lastPos.z) > 0.3;
            
            if (fastMovement) {
                lastSoundPositions.set('move_' + Date.now(), {
                    x: currentPos.x,
                    y: currentPos.y,
                    z: currentPos.z,
                    timestamp: Date.now(),
                    type: 'playerMove'
                });
                
                attractZombies(currentPos, 'playerMove');
            }
        }
        
        playerLastPositions.set(player.id, {
            x: currentPos.x,
            y: currentPos.y, 
            z: currentPos.z
        });
    });
}, 5); // Check setiap 5 ticks

// Export fungsi jika diperlukan untuk addon lain
export { attractZombies, HEARING_CONFIG };