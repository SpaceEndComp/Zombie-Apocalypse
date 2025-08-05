import { world, system } from '@minecraft/server';
import { ModalFormData } from '@minecraft/server-ui';

// Ganti 'seza:radio' dengan identifier blok yang kamu buat.
const RADIO_BLOCK_ID = 'seza:radio';

// Fungsi untuk menampilkan form frekuensi
function showFrequencyForm(player, radioBlock) {
    const form = new ModalFormData()
        .title('Atur Frekuensi Radio')
        .textField('Masukkan Frekuensi (angka)', 'Misalnya: 12345');

    form.show(player).then(response => {
        if (response.formValues[0]) {
            const frequency = response.formValues[0];
            radioBlock.setDynamicProperty('radioFrequency', frequency);
            player.sendMessage(`§a[Radio] §fFrekuensi radio diatur ke: §e${frequency}`);
        }
    });
}

// Fungsi untuk menampilkan form pesan
function showMessageForm(player, radioBlock) {
    const form = new ModalFormData()
        .title('Kirim Pesan')
        .textField('Tulis pesanmu di sini', '');

    form.show(player).then(response => {
        if (response.formValues[0]) {
            const message = response.formValues[0];
            const senderName = player.name;
            const frequency = radioBlock.getDynamicProperty('radioFrequency');

            // Panggil fungsi untuk mengirim pesan ke semua radio dengan frekuensi yang sama
            broadcastMessage(senderName, message, frequency);
        }
    });
}

// Fungsi untuk menyebarkan pesan ke radio lain
function broadcastMessage(sender, message, frequency) {
    // Gunakan system.run untuk mencegah lag
    system.run(() => {
        const players = world.getPlayers();
        
        // Loop melalui semua blok radio di dunia
        const dimension = world.getDimension('overworld');
        
        // Cari semua blok radio dalam radius tertentu dari setiap player
        for (const player of players) {
            const playerLocation = player.location;
            let messageSent = false; // Flag untuk mencegah pesan ganda
            
            // Cari blok radio dalam radius 30 blok dari player
            for (let x = -100; x <= 100; x += 3) {
                if (messageSent) break; // Keluar dari loop x jika pesan sudah dikirim
                for (let z = -100; z <= 100; z += 3) {
                    if (messageSent) break; // Keluar dari loop z jika pesan sudah dikirim
                    
                    const blockLocation = {
                        x: playerLocation.x + x,
                        y: playerLocation.y,
                        z: playerLocation.z + z
                    };
                    
                    try {
                        const block = dimension.getBlock(blockLocation);
                        if (block && block.typeId === RADIO_BLOCK_ID) {
                            const blockFrequency = block.getDynamicProperty('radioFrequency');
                            if (blockFrequency === frequency) {
                                // Kirim pesan ke player yang berada di dekat radio ini
                                const distance = playerLocation.distance(blockLocation);
                                if (distance < 20) {
                                    player.sendMessage(`§6[Radio] §fPesan dari §b${sender} §fdi frekuensi §e${frequency}: §r${message}`);
                                    messageSent = true; // Set flag untuk mencegah pesan ganda
                                    break; // Keluar dari loop dalam
                                }
                            }
                        }
                    } catch (error) {
                        // Block tidak ada atau di luar batas dunia
                        continue;
                    }
                }
            }
        }
    });
}

// Event handler ketika pemain berinteraksi dengan blok
world.afterEvents.playerInteractWithBlock.subscribe(event => {
    const { player, block } = event;

    // Cek apakah blok yang diinteraksi adalah blok radio kita
    if (block.typeId === RADIO_BLOCK_ID) {
        // Cek apakah blok sudah memiliki properti frekuensi
        const frequency = block.getDynamicProperty('radioFrequency');

        if (!frequency) {
            // Jika belum ada frekuensi, tampilkan form untuk mengatur frekuensi
            showFrequencyForm(player, block);
        } else {
            // Jika sudah ada, tampilkan form untuk mengirim pesan
            showMessageForm(player, block);
        }
    }
});