import {
  ArxMap,
  DONT_QUADIFY,
  Entity,
  HudElements,
  Rotation,
  SHADING_SMOOTH,
  Settings,
  Vector3,
} from 'arx-level-generator'
import { loadRooms } from 'arx-level-generator/prefabs/rooms'
import { ControlZone, Speed } from 'arx-level-generator/scripting/properties'
import { createZone } from 'arx-level-generator/tools'
import { applyTransformations } from 'arx-level-generator/utils'
import { Gun } from '@/entities/Gun.js'
import { Shany } from '@/entities/Shany.js'
import { ak47 } from '@/models.js'

const settings = new Settings()

//const map = new ArxMap()
const map = await ArxMap.fromOriginalLevel(11, settings)
const indexOfShany = map.entities.findIndex((entity) => entity.ref === 'human_base_0094')
const oldShany = map.entities[indexOfShany]
const newShany = new Shany({
  position: oldShany.position,
  orientation: oldShany.orientation,
})
newShany.script?.on('grow', () => {
  return `
    set @new_scale ^#param1
    mul @new_scale 100
    setscale @new_scale
  `
})
map.entities[indexOfShany] = newShany

const fountainPos = new Vector3(11182 - 5250 + 250, 1388 - 1055 + 50, 6826 - 4350 + 50 + 300)

const fountainZone = createZone({
  name: 'fountain_zone',
  position: fountainPos,
  size: new Vector3(300, Infinity, 300),
})
map.zones.push(fountainZone)

const fountain = new Entity({
  src: 'fix_inter/fountain_youth',
  position: fountainPos,
})
fountain.withScript()
fountain.script?.properties.push(new ControlZone(fountainZone))
fountain.script?.on('controlledzone_enter', () => {
  return `
    if (^$param1 == "human_base_0094") {
      sendevent grow human_base_0094 5.0
    }
  `
})
map.entities.push(fountain)

// map.config.offset = new Vector3(6000, 0, 6000)
// map.player.position.adjustToPlayerHeight()
map.player.withScript()
map.player.script?.properties.push(new Speed(1.5))
map.player.script?.on('init', () => {
  return `
    inventory playeradd weapons/arrows/arrows

    // loadanim missile_ready_part_1 human_fight_wait_1handed
    // loadanim missile_ready_part_2 human_fight_wait_1handed
    // loadanim missile_unready_part_1 player_wait_1st
    // loadanim missile_unready_part_2 player_wait_1st
    loadanim missile_wait human_fight_shield_hit

    // ez:
    loadanim missile_strike_part_1 human_fight_shield_hit
    loadanim missile_strike_part_2 human_fight_shield_hit
    loadanim missile_strike_cycle human_fight_shield_hit
    loadanim missile_strike human_fight_shield_hit
  `
})

map.hud.hide(HudElements.Minimap)

// ---------------------------

// const meshes = [...ak47]
// meshes.forEach((mesh) => {
//   applyTransformations(mesh)
//   mesh.translateX(map.config.offset.x)
//   mesh.translateY(map.config.offset.y)
//   mesh.translateZ(map.config.offset.z)
//   applyTransformations(mesh)
//   map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
// })

// ---------------------------

const rootGun = new Gun()
rootGun.script?.makeIntoRoot()
map.entities.push(rootGun)

const gun = new Gun({
  position: new Vector3(0, -100, 0),
})
map.entities.push(gun)

// ---------------------------

const rooms = await loadRooms('./map.rooms', settings)
rooms.forEach((room) => {
  map.add(room, true)
})

map.finalize()
await map.saveToDisk(settings)

console.log('done')
