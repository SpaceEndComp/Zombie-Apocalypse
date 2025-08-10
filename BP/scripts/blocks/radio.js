import { world, system } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';

// Ganti dengan identifier block radio kamu
const RADIO_BLOCK_ID = 'seza:radio';
const BROADCAST_RADIUS = 100;
const LISTEN_RADIUS = 15;

// Fungsi untuk validasi versi API (opsional)
function checkAPICompatibility() {
    try {
        // Test beberapa method yang mungkin berbeda di versi beta
        const testPlayer = world.getAllPlayers()[0];
        if (testPlayer) {
            // Method untuk mendapatkan dimensi bisa berbeda
            const dimension = testPlayer.dimension;
            return true;
        }
    } catch (error) {
        console.warn('API compatibility issue detected:', error.message);
        return false;
    }
    return true;
}

// Fungsi untuk menampilkan form frekuensi
function showFrequencyForm(player, radioBlock) {
    const form = new ModalFormData()
        .title('🔧 Atur Frekuensi Radio')
        .textField('Masukkan Frekuensi (1-999)', 'Contoh: 101.5');

    // Gunakan Promise dengan error handling yang lebih baik untuk API beta
    form.show(player).then(response => {
        if (!response || response.canceled || !response.formValues) {
            return; // User cancel atau error
        }

        const frequencyInput = response.formValues[0];
        
        if (!frequencyInput || typeof frequencyInput !== 'string') {
            player.sendMessage('§c[Radio] Input tidak valid!');
            return;
        }

        const frequency = frequencyInput.toString().trim();
        
        // Validasi input
        if (frequency === '') {
            player.sendMessage('§c[Radio] Frekuensi tidak boleh kosong!');
            return;
        }
        
        const freqNumber = parseFloat(frequency);
        if (isNaN(freqNumber) || freqNumber <= 0 || freqNumber > 999) {
            player.sendMessage('§c[Radio] Frekuensi harus berupa angka antara 1-999!');
            return;
        }
        
        // Simpan frekuensi dengan error handling
        try {
            radioBlock.setDynamicProperty('radioFrequency', frequency);
            player.sendMessage(`§a[Radio] §fFrekuensi diatur ke: §e${frequency} MHz`);
            
            // Play sound dengan fallback jika method berbeda di API beta
            try {
                player.playSound('note.pling', { pitch: 1.2, volume: 0.8 });
            } catch {
                // Fallback untuk versi API yang mungkin berbeda
                player.playSound('note.pling');
            }
        } catch (error) {
            player.sendMessage(`§c[Radio] Error menyimpan frekuensi: ${error.message}`);
        }
        
    }).catch(error => {
        player.sendMessage(`§c[Radio] Error menampilkan form: ${error.message}`);
    });
}

// Fungsi untuk menampilkan form pesan
function showMessageForm(player, radioBlock) {
    const frequency = radioBlock.getDynamicProperty('radioFrequency');
    
    const form = new ModalFormData()
        .title(`📻 Kirim Pesan - ${frequency} MHz`)
        .textField('Tulis pesanmu:', 'Masukkan pesan...');

    form.show(player).then(response => {
        if (!response || response.canceled || !response.formValues) {
            return;
        }

        const messageInput = response.formValues[0];
        
        if (!messageInput || typeof messageInput !== 'string') {
            player.sendMessage('§c[Radio] Input pesan tidak valid!');
            return;
        }
        
        const message = messageInput.toString().trim();
        
        if (message === '') {
            player.sendMessage('§c[Radio] Pesan tidak boleh kosong!');
            return;
        }
        
        if (message.length > 256) {
            player.sendMessage('§c[Radio] Pesan terlalu panjang! Maksimal 256 karakter.');
            return;
        }
        
        const senderName = player.name;
        const currentFreq = radioBlock.getDynamicProperty('radioFrequency');

        // Broadcast dengan error handling
        broadcastMessage(player, senderName, message, currentFreq, radioBlock.location);
        
    }).catch(error => {
        player.sendMessage(`§c[Radio] Error menampilkan form pesan: ${error.message}`);
    });
}

// Fungsi broadcast yang kompatibel dengan API beta
function broadcastMessage(sender, senderName, message, frequency, senderLocation) {
    // Gunakan system.run dengan delay untuk stabilitas pada API beta
    system.run(() => {
        try {
            const dimension = sender.dimension;
            let receiverCount = 0;
            const processedPositions = new Set();
            
            // Pastikan dimension valid
            if (!dimension) {
                sender.sendMessage('§c[Radio] Error: Dimensi tidak ditemukan');
                return;
            }

            // Scan area dengan optimasi untuk API beta
            const centerX = Math.floor(senderLocation.x);
            const centerY = Math.floor(senderLocation.y);
            const centerZ = Math.floor(senderLocation.z);
            
            // Gunakan range yang lebih konservatif untuk API beta
            const scanRadius = Math.min(BROADCAST_RADIUS, 80); // Kurangi dari 100 ke 80 untuk stabilitas
            
            for (let x = -scanRadius; x <= scanRadius; x += 3) { // Step 3 untuk performa
                for (let z = -scanRadius; z <= scanRadius; z += 3) {
                    for (let y = -20; y <= 20; y += 5) { // Batasi range Y
                        
                        const blockX = centerX + x;
                        const blockY = centerY + y;
                        const blockZ = centerZ + z;
                        
                        const posKey = `${blockX},${blockY},${blockZ}`;
                        if (processedPositions.has(posKey)) continue;
                        processedPositions.add(posKey);
                        
                        // Cek jarak actual
                        const distance = Math.sqrt(x*x + y*y + z*z);
                        if (distance > scanRadius) continue;
                        
                        // Skip posisi pengirim
                        if (blockX === centerX && blockY === centerY && blockZ === centerZ) {
                            continue;
                        }
                        
                        try {
                            // Cek apakah posisi valid dalam world bounds
                            const blockPos = { x: blockX, y: blockY, z: blockZ };
                            
                            // Gunakan try-catch untuk setiap getBlock karena API beta mungkin unstable
                            let block;
                            try {
                                block = dimension.getBlock(blockPos);
                            } catch (getBlockError) {
                                continue; // Skip blok yang tidak bisa diakses
                            }
                            
                            if (!block || block.typeId !== RADIO_BLOCK_ID) {
                                continue;
                            }
                            
                            const blockFreq = block.getDynamicProperty('radioFrequency');
                            if (blockFreq !== frequency) {
                                continue;
                            }
                            
                            // Cari players nearby dengan method yang kompatibel API beta
                            let nearbyPlayers = [];
                            try {
                                // Metode 1: Gunakan getPlayers dengan filter location jika tersedia
                                nearbyPlayers = dimension.getPlayers({
                                    location: blockPos,
                                    maxDistance: LISTEN_RADIUS
                                });
                            } catch {
                                // Metode 2: Fallback manual distance check
                                const allPlayers = world.getAllPlayers();
                                nearbyPlayers = allPlayers.filter(p => {
                                    try {
                                        if (p.dimension.id !== dimension.id) return false;
                                        const pLoc = p.location;
                                        const dist = Math.sqrt(
                                            Math.pow(pLoc.x - blockX, 2) +
                                            Math.pow(pLoc.y - blockY, 2) +
                                            Math.pow(pLoc.z - blockZ, 2)
                                        );
                                        return dist <= LISTEN_RADIUS;
                                    } catch {
                                        return false;
                                    }
                                });
                            }
                            
                            if (nearbyPlayers.length > 0) {
                                const roundedDistance = Math.round(distance);
                                const radioMessage = `§6📻 [${frequency} MHz] §f${senderName}: §a${message}`;
                                const distanceInfo = `§7(Jarak: ${roundedDistance}m)`;
                                
                                for (const nearbyPlayer of nearbyPlayers) {
                                    try {
                                        nearbyPlayer.sendMessage(radioMessage);
                                        nearbyPlayer.sendMessage(distanceInfo);
                                        
                                        // Sound dengan fallback untuk API beta
                                        try {
                                            const volume = Math.max(0.3, 1.0 - (distance / scanRadius));
                                            nearbyPlayer.playSound('note.chime', { 
                                                pitch: 0.9, 
                                                volume: volume 
                                            });
                                        } catch {
                                            nearbyPlayer.playSound('note.chime');
                                        }
                                    } catch (playerError) {
                                        // Skip player jika error
                                        continue;
                                    }
                                }
                                
                                receiverCount++;
                            }
                            
                        } catch (blockProcessError) {
                            // Skip blok yang error
                            continue;
                        }
                    }
                }
            }
            
            // Konfirmasi ke pengirim
            if (receiverCount > 0) {
                sender.sendMessage(`§a📡 Pesan terkirim ke §6${receiverCount} §aradio di frekuensi §e${frequency} MHz`);
                try {
                    sender.playSound('note.pling', { pitch: 1.0, volume: 1.0 });
                } catch {
                    sender.playSound('note.pling');
                }
            } else {
                sender.sendMessage(`§e📡 Tidak ada penerima di frekuensi §e${frequency} MHz §edalam radius ${scanRadius} blok`);
                try {
                    sender.playSound('note.bass', { pitch: 0.7, volume: 0.8 });
                } catch {
                    sender.playSound('note.bass');
                }
            }
            
        } catch (broadcastError) {
            sender.sendMessage(`§c[Radio] Error saat broadcast: ${broadcastError.message}`);
            console.error('Broadcast error:', broadcastError);
        }
    });
}

// Event handler dengan compatibility check
world.afterEvents.playerInteractWithBlock.subscribe(event => {
    const { player, block } = event;

    if (block.typeId !== RADIO_BLOCK_ID) return;

    // Delay untuk stabilitas API beta
    system.runTimeout(() => {
        try {
            const frequency = block.getDynamicProperty('radioFrequency');

            if (!frequency) {
                showFrequencyForm(player, block);
            } else {
                showMessageForm(player, block);
            }
        } catch (error) {
            player.sendMessage(`§c[Radio] Error interaksi: ${error.message}`);
            console.error('Interaction error:', error);
        }
    }, 1); // 1 tick delay
});

// Debug commands dengan safety check untuk API beta
world.beforeEvents.chatSend.subscribe(event => {
    const { sender, message } = event;
    
    if (!message.startsWith('!radio')) return;
    
    event.cancel = true;
    
    try {
        const args = message.split(' ');
        
        if (args[1] === 'clear') {
            try {
                const hitResult = sender.getBlockFromViewDirection({ maxDistance: 10 });
                if (hitResult && hitResult.block && hitResult.block.typeId === RADIO_BLOCK_ID) {
                    hitResult.block.setDynamicProperty('radioFrequency', undefined);
                    sender.sendMessage('§a[Radio] Frekuensi dihapus!');
                } else {
                    sender.sendMessage('§c[Radio] Arahkan pandangan ke radio!');
                }
            } catch (raycastError) {
                sender.sendMessage('§c[Radio] Error raycast - API mungkin tidak stabil');
            }
            
        } else if (args[1] === 'info') {
            try {
                const hitResult = sender.getBlockFromViewDirection({ maxDistance: 10 });
                if (hitResult && hitResult.block && hitResult.block.typeId === RADIO_BLOCK_ID) {
                    const freq = hitResult.block.getDynamicProperty('radioFrequency');
                    sender.sendMessage(`§e[Radio] Frekuensi: ${freq || 'Belum diatur'}`);
                } else {
                    sender.sendMessage('§c[Radio] Tidak ada radio dalam pandangan!');
                }
            } catch (raycastError) {
                sender.sendMessage('§c[Radio] Error raycast');
            }
            
        } else if (args[1] === 'test') {
            // Command untuk test kompatibilitas API
            const compatible = checkAPICompatibility();
            sender.sendMessage(`§e[Radio] API Compatibility: ${compatible ? '§aOK' : '§cIssue detected'}`);
            
        } else {
            sender.sendMessage('§e[Radio] Commands: !radio clear, !radio info, !radio test');
        }
    } catch (commandError) {
        sender.sendMessage(`§c[Radio] Command error: ${commandError.message}`);
    }
});

// Inisialisasi dengan version check
system.runInterval(() => {
    // Periodic health check untuk API beta (opsional)
    // Bisa ditambah logging atau monitoring di sini
}, 1200); // Setiap 60 detik