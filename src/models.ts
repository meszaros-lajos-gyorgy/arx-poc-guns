import { ArxPolygonFlags } from 'arx-convert/types'
import { Rotation } from 'arx-level-generator'
import { loadOBJ } from 'arx-level-generator/tools/mesh'
import { MathUtils } from 'three'

export const ak47 = await loadOBJ('./ak47/ak47', {
  scale: 0.3,
  // TODO: scaleUV doesn't work when mesh is given to EntityModel
  // scaleUV: new Vector2(1, -1),
  materialFlags: ArxPolygonFlags.None,
  reversedPolygonWinding: true,
  orientation: new Rotation(0, 0, MathUtils.degToRad(60)),
})

// export const m4a1 = await loadOBJ('./m4a1/m4a1', {
//   scale: 0.1,
//   scaleUV: new Vector2(1, -1),
//   orientation: new Rotation(0, MathUtils.degToRad(180), 0),
//   fallbackTexture: Texture.l4DwarfIronBoard02,
// })
