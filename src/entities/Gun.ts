import { Expand } from 'arx-convert/utils'
import { Entity, EntityConstructorPropsWithoutSrc, EntityModel, Texture } from 'arx-level-generator'
import { Label, Material, StackSize } from 'arx-level-generator/scripting/properties'
import { ak47 } from '@/models.js'

type GunContructorProps = Expand<
  EntityConstructorPropsWithoutSrc & {
    // TODO
  }
>

export class Gun extends Entity {
  constructor({ ...props }: GunContructorProps = {}) {
    super({
      src: 'items/weapons/gun',
      inventoryIcon: Texture.fromCustomFile({
        filename: 'ak47[icon].bmp',
        sourcePath: './ak47/textures/',
      }),
      model: EntityModel.fromThreeJsObj(ak47[0], {
        filename: 'gun.ftl',
        originIdx: 0,
        actionPoints: [
          {
            name: 'PRIMARY_ATTACH',
            vertexIdx: 200,
            action: -1,
            sfx: -1,
          },
          {
            name: 'HIT_30',
            vertexIdx: 0,
            action: -1,
            sfx: -1,
          },
          {
            name: 'HIT_15',
            vertexIdx: 100,
            action: -1,
            sfx: 0,
          },
        ],
      }),
      otherDependencies: [
        Texture.fromCustomFile({
          filename: 'ak47-texture.bmp',
          sourcePath: './ak47/textures/',
        }),
      ],
      ...props,
    })

    this.withScript()

    this.script?.on('init', () => {
      if (!this.script?.isRoot) {
        return ''
      }

      return [
        Material.weapon,
        StackSize.unstackable,
        `
          SET_WEAPON_MATERIAL SWORD
          SET_STRIKE_SPEECH [player_strike_small]
          SETOBJECTTYPE WEAPON
          SETOBJECTTYPE 1H
          SET_GROUP "BLADE"
          SET_GROUP ARMORY
          SETEQUIP DAMAGES 4
          SETEQUIP aim_time 800
        `,
      ]
    })

    this.script?.on('initend', () => {
      if (!this.script?.isRoot) {
        return ''
      }

      return [new Label(`ak47`)]
    })

    this.script?.on('equipin', () => {
      if (!this.script?.isRoot) {
        return ''
      }

      return `PLAY "equip_sword"`
    })

    this.script?.on('inventoryuse', () => {
      if (!this.script?.isRoot) {
        return ''
      }

      return `
        IF (^FIGHTING == 1) ACCEPT
        EQUIP PLAYER
      `
    })

    /*
    ON BREAK {
      PLAY "broken_weapon"
      DESTROY SELF
      ACCEPT
    }

    ON DURABILITY {
      SET_DURABILITY -c ~^$PARAM1~
      ACCEPT
    }
    */
  }
}
