import { Entity, EntityConstructorPropsWithoutSrc } from 'arx-level-generator'
import { ScriptSubroutine } from 'arx-level-generator/scripting'
import { Scale } from 'arx-level-generator/scripting/properties'

export class Shany extends Entity {
  constructor({ ...props }: EntityConstructorPropsWithoutSrc = {}) {
    super({
      ...props,
      src: 'npc/human_base',
      id: 94,
    })

    this.withScript()

    // ----------------------------

    const lasuite = new ScriptSubroutine(
      'LASUITE',
      () => {
        return `
          SENDEVENT CUSTOM HUMAN_BASE_0052 "PATROL"
          SET §refuse 0
          SET §talked 1
          GOTO DECISION
        `
      },
      'goto',
    )

    const clearMiceTarget = new ScriptSubroutine('CLEAR_MICE_TARGET', () => {
      return `
      // if we care about mice : clear current mice target and listen to other mice
      IF ( §care_about_mice == 1 )
      {
        SET £targeted_mice "NOMOUSE"
        SETGROUP MICECARE // listen to other mice
      }
      `
    })

    const saveBehavior = new ScriptSubroutine('SAVE_BEHAVIOR', () => {
      return `
      TIMERcolplayer OFF 
      // to avoid TIMERcolplayer to restore the behavior 1 sec later
       IF (§main_behavior_stacked == 0) 
       {
        IF (§frozen == 1)
        { 
          // frozen anim -> wake up !
          SET §frozen 0
          PLAYANIM NONE
          PLAYANIM -2 NONE
          PHYSICAL ON
          COLLISION ON
          BEHAVIOR FRIENDLY
          SETTARGET PLAYER
        }
        SET §main_behavior_stacked 1
        HEROSAY -d "STACK"
        BEHAVIOR STACK
       }
       ELSE
       { // behavior already saved : clear mice target if one
        GOSUB CLEAR_MICE_TARGET
       }
      `
    })

    const restoreBehavior = new ScriptSubroutine('RESTORE_BEHAVIOR', () => {
      return `
      IF (§main_behavior_stacked == 1) 
      {
       GOSUB CLEAR_MICE_TARGET
       HEROSAY -d "UNSTACK"
       BEHAVIOR UNSTACK
       SET §main_behavior_stacked 0
       RETURN
      }
     IF (£init_marker != "NONE")
       { 
        BEHAVIOR MOVE_TO
        SETTARGET -a ~£init_marker~
        SETMOVEMODE WALK
        RETURN
       }
     HEROSAY -d "go_home"
     BEHAVIOR GO_HOME
     SETTARGET PLAYER
      `
    })

    const startChat = new ScriptSubroutine('START_CHAT', () => {
      return `
      // save misc reflection mode
      SET §saved_reflection §reflection_mode
      // no more stupid reflections !
      SET §reflection_mode 0
      // fo not change behavior if frozen
      IF ( §frozen == 1 ) RETURN
      // save behavior (if not saved)
      GOSUB SAVE_BEHAVIOR
      // look at player
      BEHAVIOR FRIENDLY
      SETTARGET PLAYER
      `
    })

    const endChat = new ScriptSubroutine('END_CHAT', () => {
      return `
      SET_EVENT COLLIDE_NPC ON
      SET §collided_player 0
      // restor behavior only if not in fighting mode
      IF ( §fighting_mode == 0 )
      {
       // restore misc reflection mode
       SET §reflection_mode §saved_reflection
       // if frozen : don't restore behavior
       IF ( §frozen == 1 ) RETURN
       // restore behavior
       GOSUB RESTORE_BEHAVIOR
      }
      `
    })

    this.script?.subroutines.push(lasuite, clearMiceTarget, saveBehavior, restoreBehavior, startChat, endChat)

    this.script?.appendRaw(`
      >>DIALOGUE1_1
        PLAYER_LOOKAT ME
        SET_PLAYER_CONTROLS OFF
        CINEMASCOPE -s ON
        PLAYER_INTERFACE -s HIDE
        SPEAK [shany_greetings] GOTO DIALOGUE1_2
        ACCEPT
      
      >>DIALOGUE1_2
        SPEAK -p [player_shany_about_crypt] GOTO DIALOGUE1_3
        ACCEPT
      
      >>DIALOGUE1_3
        SPEAK [shany_tells_about_crypt] GOTO DIALOGUE1_4  
        ACCEPT
      
      >>DIALOGUE1_4
        SET §chatpos 1
        SET_PLAYER_CONTROLS ON
        CINEMASCOPE -s OFF
        PLAYER_INTERFACE -s SHOW
        TIMERdecision 1 10 GOTO DECISION 
        GOSUB END_CHAT
        ACCEPT
      
      >>NEXT_STEP1_1
        BEHAVIOR MOVE_TO
        SETTARGET MARKER_0060
        ACCEPT
      
      >>NEXT_STEP1_2
        BEHAVIOR MOVE_TO
        SETTARGET MARKER_0062
        ACCEPT
      
      >>DECISION
        BEHAVIOR MOVE_TO
        SETTARGET MARKER_0062
        ACCEPT
    `)

    // ----------------------------

    this.script?.on('init', () => {
      return `
      SET £key_carried "key_base_0030"
      SET £friend "kingdom"
      SET £type "human_child"
      SET §refuse 0				// Used to check collision with player
      SET §talked 0				// Used to know if Shany has talked to the guard
      `
    })

    this.script?.on('initend', () => {
      return `
      IF (^GORE == 0) {
        SET_NPC_STAT armor_class 8
        SET_NPC_STAT absorb 10
        SET_NPC_STAT life 500
      }
     LOADANIM ACTION4 "human_normal_lay_in"
     LOADANIM ACTION5 "human_normal_lay_cycle"
     LOADANIM ACTION6 "human_normal_lay_out"
     TELEPORT MARKER_0884
     SET §refuse 1
     BEHAVIOR FRIENDLY
     SETTARGET MARKER_0883
      `
    })

    this.script?.on('load', () => {
      return `
      USE_MESH "HUMAN_FEMALE_CHILD\\HUMAN_FEMALE_CHILD.TEO"
      `
    })

    this.script?.on('collide_npc', () => {
      return `
      IF (§refuse == 1) REFUSE
      `
    })

    this.script?.on('game_ready', () => {
      return `
      SETGORE OFF
      `
    })

    this.script?.on('reachedtarget', () => {
      return `
      IF (^TARGET == MARKER_0062) {
        PLAYANIM ACTION2
        BEHAVIOR WANDER_AROUND 400
        SETTARGET NONE
        TIMERnext 1 60 GOTO NEXT_STEP1_1
        ACCEPT
      }
      IF (^TARGET == MARKER_0060) {
        PLAYANIM ACTION2
        BEHAVIOR WANDER_AROUND 300
        SETTARGET NONE
        TIMERnext 1 60 GOTO NEXT_STEP1_2
        ACCEPT
      }
      IF (^TARGET == MARKER_0032) {
        BEHAVIOR FRIENDLY
        SETTARGET PLAYER
        ACCEPT
      }
      IF (^TARGET == MARKER_0426) {
        SET §reflection_mode 1
        SETMOVEMODE WALK
        BEHAVIOR FRIENDLY
        SETTARGET PLAYER
        TIMERplay 1 20 GOTO NEXT_STEP1_1
        ACCEPT
      }
      `
    })

    this.script?.on('aggression', () => {
      return `
      SENDEVENT PLAYER_ENEMY HUMAN_BASE_0114 ""
      `
    })

    this.script?.on('ouch', () => {
      return `
      IF (^GORE == 0) {
        INVULNERABILITY ON
        ACCEPT
      }
      `
    })

    this.script?.on('die', () => {
      return `
      SENDEVENT CUSTOM CHEST_METAL_0023 "SHANY_DEAD"
 SENDEVENT CUSTOM CHEST_METAL_0043 "SHANY_DEAD"
 SENDEVENT CUSTOM LIGHT_DOOR_0020 "SHANY_DEAD"
 SENDEVENT CUSTOM LIGHT_DOOR_0021 "SHANY_DEAD"
      `
    })

    this.script?.on('chat', () => {
      return `
      IF (^SPEAKING == 1) ACCEPT
  IF (§chatpos == 1) {
    GOSUB START_CHAT
    SPEAK [shany_misc_playing] GOSUB END_CHAT
    ACCEPT
  }
 GOSUB START_CHAT
 TIMERnext OFF
 TIMERplay OFF
 GOTO DIALOGUE1_1
      `
    })

    this.script?.on('custom', () => {
      return `
      IF (^$PARAM1 == "DISPUTE") {
        SPEAK [shany_guard_playing] GOTO LASUITE
        ACCEPT
      }
      IF (^$PARAM1 == "HIDE") {
        OBJECT_HIDE SELF ON
        ACCEPT
      }
      IF (^$PARAM1 == "SHOW") {
        OBJECT_HIDE SELF OFF
        PHYSICAL ON
        PLAYANIM NONE
        SET §reflection_mode 1
        SETEVENT CHAT ON
        SET §sleeping 0
        SET §frozen 0
        TELEPORT MARKER_0332
        SETMOVEMODE RUN
        BEHAVIOR MOVE_TO
        SETTARGET MARKER_0426
        ACCEPT
      }
      `
    })

    this.script?.on('reload', () => {
      return `
      IF (#statue_destroyed > 0) {
        IF (#look_for_shany == 1) {
         SET #look_for_shany 3
        }
       }
       IF (#look_for_shany > 2) DESTROY SELF
       IF (#shield_elder_retrieved == 1) SET §chatpos 1 
       IF (#PLAYER_ON_QUEST == 6) {
         TELEPORT MARKER_0032
         SET §reflection_mode 0
         BEHAVIOR FRIENDLY
         SETTARGET MARKER_0020
         ACCEPT
       }
       IF (#PLAYER_ON_QUEST == 7) {
         SENDEVENT CUSTOM CUSCION_0022 "SHOW"
         TELEPORT MARKER_0032
         FORCE_ANGLE 180
         PHYSICAL OFF
         SET §reflection_mode 0
         PLAYANIM -l ACTION5
         SETEVENT CHAT OFF
         SET §sleeping 1
         SET §frozen 1
         ACCEPT
       }
       IF (#carlo_rituals == 1) {
         SET §reflection_mode 0
         SET §refuse 0				
         OBJECT_HIDE SELF ON
         ACCEPT
       }
       IF (#look_for_shany > 1) {
         IF (#KINGDOM_ENEMY == 1) {
           TELEPORT MARKER_0332
           OBJECT_HIDE SELF OFF
           PHYSICAL ON
           BEHAVIOR WANDER_AROUND 400
           SETTARGET NONE
           ACCEPT
         }
        TELEPORT MARKER_0332
        BEHAVIOR NONE
        SETTARGET NONE
        ACCEPT
       }
       IF (§talked == 1) {
         TELEPORT MARKER_0062
         BEHAVIOR WANDER_AROUND 400
         SETTARGET NONE
         TIMERgo 1 10 GOTO NEXT_STEP1_1
         ACCEPT
       }
      `
    })
  }
}
