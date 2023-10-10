import { ArxMap, DONT_QUADIFY, HudElements, Rotation, SHADING_SMOOTH, Settings, Vector3 } from 'arx-level-generator'
import { loadRooms } from 'arx-level-generator/prefabs/rooms'
import { Speed } from 'arx-level-generator/scripting/properties'
import { applyTransformations } from 'arx-level-generator/utils'
import { Gun } from '@/entities/Gun.js'
import { ak47 } from '@/models.js'

const settings = new Settings()

const map = new ArxMap()
map.config.offset = new Vector3(6000, 0, 6000)
map.player.position.adjustToPlayerHeight()
map.player.withScript()
map.player.script?.properties.push(new Speed(1.5))
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
