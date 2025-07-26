import { world, system } from "@minecraft/server";

export function fireFighterAxeLogic() {
// Using another interval to remove the weakness effect faster, you can combine it with the other one if you dont mind the slight delay
system.runInterval(() => {
    for (let player of world.getAllPlayers()) {
        let item = player.getComponent("equippable").getEquipment("Mainhand")
        if (item === undefined) continue
        if (!(Object.keys(itemsConfig).includes(item.typeId))) continue

        player.addEffect("weakness", 1, {
            showParticles: false,
            amplifier: 255
        })
    }
})

    // The config for each item, you can adjust these as u like
    let itemsConfig = {
        "za:fire_fighter_axe": {
            cd: 0.5,
            dmg: 8
        }
    }
    let playersItemCD = {} // keep this empty, but dont remove this line

    if (world.afterEvents && world.afterEvents.entityDie && world.afterEvents.entityHitEntity) {
        world.afterEvents.entityDie.subscribe((ev) => {
            if (
                ev.deadEntity.typeId === ZOMBIE_ID &&
                ev.damageSource?.damagingEntity?.typeId === "minecraft:player"
            ) {
            const player = ev.damageSource.damagingEntity;
                const current = player.getDynamicProperty(PLAYER_KILL_PROP) ?? 0;
                player.setDynamicProperty(PLAYER_KILL_PROP, current + 1);
            }
        });

        world.afterEvents.entityHitEntity.subscribe(event => {
            let entityHit = event.hitEntity
            let player = event.damagingEntity

            if (player.typeId != "minecraft:player") return

            let item = player.getComponent("equippable").getEquipment("Mainhand")
            if (!(Object.keys(itemsConfig).includes(item.typeId))) return

            player.playSound("note.pling", { pitch: 0.7, volume: 0.2 }) // Play sound when a hit is registered, u can remove this for the finsihed product

            let currentTime = Date.now()
            let skip = false
            if (!playersItemCD[player.nameTag]) { playersItemCD[player.nameTag] = currentTime; skip = true }

            if (!skip) {
                let timeDiff = (currentTime - playersItemCD[player.nameTag])/1000
                if (!(timeDiff >= itemsConfig[item.typeId].cd)) return
                playersItemCD[player.nameTag] = currentTime
            }

            system.runTimeout(() => {
                player.playSound("note.pling", {pitch: 1.5}) // This line also plays a sound when it deals dmg to the target, you can also remove this in the finale product
                if (!entityHit) return
                entityHit.applyDamage(8, { cause: "entityAttack", damagingEntity: player })
            }, itemsConfig[item.typeId].cd*20)
        })
    }
}