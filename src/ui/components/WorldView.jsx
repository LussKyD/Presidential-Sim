import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STATE_ADDRESS_PHASES } from '../../core/constants/activities'

// Office interior (origin): president at desk, first-person = eyes behind desk looking into room
const OFFICE_EYE = { x: 0, y: 1.6, z: 0.6 }
const OFFICE_LOOK = { x: 0, y: 1.2, z: -2.5 }
const OFFICE_DOOR = { x: 0, y: 1.6, z: -2.5 }
// Exterior: palace front, driveway, parliament (separate from office so motorcade is outside)
const PALACE_FRONT = { x: 0, z: -10 }
const DRIVEWAY = { x: 0, z: -7 }
const PARLIAMENT_POS = { x: -8, z: 4 }
const PARLIAMENT_ENTRANCE = { x: -8, y: 1.6, z: 3 }
const CHAMBER_VIEW = { x: -8, y: 1.6, z: 5.5 }

const WALK_DURATION_MS = 2500
const MOTORCADE_DURATION_MS = 6000
const SPEECH_VIEW_MS = 3000

/** First-person 3D world: office interior (your eyes at desk), exterior (palace, cars, road, parliament), full state-address flow. */
export default function WorldView({
  state,
  viewMode = 'office',
  activityPhase,
  onPhaseComplete,
  onSpeechDone,
}) {
  const containerRef = useRef(null)
  const activityPhaseRef = useRef(activityPhase)
  const viewModeRef = useRef(viewMode)
  const phaseStartRef = useRef(null)
  const onPhaseCompleteRef = useRef(onPhaseComplete)
  const onSpeechDoneRef = useRef(onSpeechDone)
  activityPhaseRef.current = activityPhase
  viewModeRef.current = viewMode
  onPhaseCompleteRef.current = onPhaseComplete
  onSpeechDoneRef.current = onSpeechDone

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let renderer, scene, camera, controls, frameId
    const clock = new THREE.Clock()

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f1419)
    scene.fog = new THREE.Fog(0x0f1419, 15, 50)

    camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(OFFICE_EYE.x, OFFICE_EYE.y, OFFICE_EYE.z)
    camera.lookAt(OFFICE_LOOK.x, OFFICE_LOOK.y, OFFICE_LOOK.z)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0x404060, 0.9))
    const sun = new THREE.DirectionalLight(0xffeedd, 1)
    sun.position.set(10, 25, 10)
    scene.add(sun)

    // ---- Office interior (only visible when in office or walking to/from) ----
    const officeGroup = new THREE.Group()
    const of = 6
    const officeFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(of, of),
      new THREE.MeshStandardMaterial({ color: 0x1e2127 })
    )
    officeFloor.rotation.x = -Math.PI / 2
    officeFloor.position.y = 0.01
    officeGroup.add(officeFloor)

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x252a33 })
    const wallH = 2.6
    ;[
      [0, 1.3, -3, 0],
      [0, 1.3, 3, Math.PI],
      [-3, 1.3, 0, Math.PI / 2],
      [3, 1.3, 0, -Math.PI / 2],
    ].forEach(([px, py, pz, ry]) => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(of, wallH), wallMat)
      w.position.set(px, py, pz)
      w.rotation.y = ry
      officeGroup.add(w)
    })

    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.8, 1),
      new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
    )
    desk.position.set(0, 0.4, -1.4)
    officeGroup.add(desk)

    const chairMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.6), chairMat)
    chairSeat.position.set(0, 0.4, 0.1)
    officeGroup.add(chairSeat)
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.15), chairMat)
    chairBack.position.set(0, 0.85, -0.15)
    officeGroup.add(chairBack)

    const visitorSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), chairMat)
    visitorSeat.position.set(0, 0.35, -2.5)
    officeGroup.add(visitorSeat)

    const couchMat = new THREE.MeshStandardMaterial({ color: 0x3c434d })
    const couch = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.6), couchMat)
    couch.position.set(-1.4, 0.25, 0.4)
    couch.rotation.y = Math.PI / 12
    officeGroup.add(couch)
    const couch2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.6), couchMat)
    couch2.position.set(1.4, 0.25, 0.4)
    couch2.rotation.y = -Math.PI / 12
    officeGroup.add(couch2)

    const tablet = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.03, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x1d9bf0, emissiveIntensity: 0.2 })
    )
    tablet.position.set(0.4, 0.81, -1.1)
    tablet.rotation.x = -Math.PI / 12
    officeGroup.add(tablet)

    const tv = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.9, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x111827, emissiveIntensity: 0.5 })
    )
    tv.position.set(0, 1.5, 2.6)
    officeGroup.add(tv)

    scene.add(officeGroup)

    // ---- Exterior: ground, palace, driveway, road, parliament ----
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x14171a })
    )
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    const palace = new THREE.Mesh(
      new THREE.BoxGeometry(6, 3, 5),
      new THREE.MeshStandardMaterial({ color: 0x6b4423 })
    )
    palace.position.set(PALACE_FRONT.x, 1.5, PALACE_FRONT.z)
    scene.add(palace)

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    const road1 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.05, 2), roadMat)
    road1.position.set(0, 0.025, -8)
    scene.add(road1)
    const road2 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.05, 2), roadMat)
    road2.position.set(-4, 0.025, -2)
    road2.rotation.y = Math.PI / 2
    scene.add(road2)
    const road3 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.05, 2), roadMat)
    road3.position.set(-8, 0.025, 2)
    scene.add(road3)

    const parliament = new THREE.Mesh(
      new THREE.BoxGeometry(5, 2.2, 4),
      new THREE.MeshStandardMaterial({ color: 0x2f4f4f })
    )
    parliament.position.set(PARLIAMENT_POS.x, 1.1, PARLIAMENT_POS.z)
    scene.add(parliament)

    // Parliament chamber interior (simple room: seats + podium)
    const chamberGroup = new THREE.Group()
    chamberGroup.position.set(PARLIAMENT_POS.x, 0, PARLIAMENT_POS.z)
    const chamberFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 5),
      new THREE.MeshStandardMaterial({ color: 0x1a1f26 })
    )
    chamberFloor.rotation.x = -Math.PI / 2
    chamberGroup.add(chamberFloor)
    const chamberWall = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x252a33 })
    )
    chamberWall.position.z = -2.5
    chamberGroup.add(chamberWall)
    const podium = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x4a5568 })
    )
    podium.position.set(0, 0.25, 0.5)
    chamberGroup.add(podium)
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), new THREE.MeshStandardMaterial({ color: 0x374151 }))
        seat.position.set(i * 1.2, 0.25, j * 1 - 0.5)
        chamberGroup.add(seat)
      }
    }
    scene.add(chamberGroup)

    // Motorcade: limo + escorts (start at driveway, drive to parliament)
    const carGeo = new THREE.BoxGeometry(0.9, 0.45, 1.8)
    const limo = new THREE.Mesh(carGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.4 }))
    const escort1 = new THREE.Mesh(carGeo, new THREE.MeshStandardMaterial({ color: 0x1f2933, metalness: 0.3, roughness: 0.5 }))
    const escort2 = new THREE.Mesh(carGeo, new THREE.MeshStandardMaterial({ color: 0x1f2933, metalness: 0.3, roughness: 0.5 }))
    limo.position.set(DRIVEWAY.x, 0.22, DRIVEWAY.z)
    escort1.position.set(DRIVEWAY.x - 1.2, 0.22, DRIVEWAY.z - 0.5)
    escort2.position.set(DRIVEWAY.x + 1.2, 0.22, DRIVEWAY.z - 0.5)
    scene.add(limo)
    scene.add(escort1)
    scene.add(escort2)

    const motorcadePathOut = [
      new THREE.Vector3(DRIVEWAY.x, 0.22, DRIVEWAY.z),
      new THREE.Vector3(-2, 0.22, -6),
      new THREE.Vector3(-5, 0.22, -2),
      new THREE.Vector3(PARLIAMENT_POS.x, 0.22, PARLIAMENT_POS.z + 0.8),
    ]
    const motorcadePathBack = [...motorcadePathOut].reverse()

    function getPathPoint(path, tNorm) {
      const segs = path.length - 1
      if (segs <= 0) return path[0].clone()
      const scaled = tNorm * segs
      const idx = Math.min(segs - 1, Math.max(0, Math.floor(scaled)))
      const localT = THREE.MathUtils.clamp(scaled - idx, 0, 1)
      const result = new THREE.Vector3()
      result.lerpVectors(path[idx], path[idx + 1], localT)
      return result
    }

    // NPCs: guards at palace, crowds at parliament, parliamentarians in chamber
    const npcGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.65, 8)
    const guardMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x6b7280 })
    const crowdMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af })
    const npcs = []
    function addNpc(x, z, type, phaseOffset = 0) {
      const mat = type === 'guard' ? guardMat : type === 'crowd' ? crowdMat : staffMat
      const m = new THREE.Mesh(npcGeo, mat)
      m.position.set(x, 0.32, z)
      scene.add(m)
      npcs.push({ mesh: m, baseX: x, baseZ: z, phaseOffset, type })
    }
    addNpc(PALACE_FRONT.x + 2, PALACE_FRONT.z + 1, 'guard', 0)
    addNpc(PALACE_FRONT.x - 2, PALACE_FRONT.z + 1, 'guard', Math.PI)
    addNpc(PALACE_FRONT.x + 0.5, PALACE_FRONT.z - 0.5, 'staff', 0.5)
    addNpc(PARLIAMENT_POS.x + 2, PARLIAMENT_POS.z - 0.5, 'crowd', 0)
    addNpc(PARLIAMENT_POS.x - 2, PARLIAMENT_POS.z - 0.5, 'crowd', 1)
    addNpc(PARLIAMENT_POS.x, PARLIAMENT_POS.z - 1, 'crowd', 2)

    function updateNpcs(t) {
      npcs.forEach((n) => {
        const r = n.type === 'guard' ? 0.4 : 0.5
        const s = n.type === 'guard' ? 0.4 : 0.3
        n.mesh.position.x = n.baseX + Math.sin(t * s + n.phaseOffset) * r
        n.mesh.position.z = n.baseZ + Math.cos(t * s + n.phaseOffset) * r
      })
    }

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 4
    controls.maxDistance = 30
    controls.enablePan = true

    const phaseStart = () => {
      if (phaseStartRef.current === null) phaseStartRef.current = Date.now()
      return phaseStartRef.current
    }
    const resetPhaseStart = () => { phaseStartRef.current = null }

    function animate() {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const phase = activityPhaseRef.current
      const vm = viewModeRef.current

      updateNpcs(t)

      const exteriorPhases = [
        STATE_ADDRESS_PHASES.AT_CARS,
        STATE_ADDRESS_PHASES.MOTORCADE_TO_PARLIAMENT,
        STATE_ADDRESS_PHASES.AT_PARLIAMENT,
        STATE_ADDRESS_PHASES.ENTER_PARLIAMENT,
        STATE_ADDRESS_PHASES.SPEECH,
        STATE_ADDRESS_PHASES.EXIT_PARLIAMENT,
        STATE_ADDRESS_PHASES.MOTORCADE_TO_PALACE,
        STATE_ADDRESS_PHASES.AT_PALACE,
      ]
      let showOffice = !phase || phase === STATE_ADDRESS_PHASES.WALK_TO_OFFICE
      if (phase === STATE_ADDRESS_PHASES.WALK_TO_CARS) {
        const elapsed = Date.now() - (phaseStartRef.current || 0)
        showOffice = elapsed < WALK_DURATION_MS * 0.5
      }
      if (phase === STATE_ADDRESS_PHASES.WALK_TO_OFFICE) {
        const elapsed = Date.now() - (phaseStartRef.current || 0)
        showOffice = elapsed >= WALK_DURATION_MS * 0.5
      }
      let showExterior = exteriorPhases.includes(phase)
      if (phase === STATE_ADDRESS_PHASES.WALK_TO_CARS) {
        const elapsed = Date.now() - (phaseStartRef.current || 0)
        showExterior = elapsed >= WALK_DURATION_MS * 0.5
      }
      if (phase === STATE_ADDRESS_PHASES.WALK_TO_OFFICE) {
        const elapsed = Date.now() - (phaseStartRef.current || 0)
        showExterior = elapsed < WALK_DURATION_MS * 0.5
      }
      officeGroup.visible = showOffice
      ground.visible = showExterior
      palace.visible = showExterior
      road1.visible = showExterior
      road2.visible = showExterior
      road3.visible = showExterior
      const inChamber = phase === STATE_ADDRESS_PHASES.ENTER_PARLIAMENT || phase === STATE_ADDRESS_PHASES.SPEECH || phase === STATE_ADDRESS_PHASES.EXIT_PARLIAMENT
      parliament.visible = showExterior && !inChamber
      chamberGroup.visible = showExterior && inChamber
      limo.visible = showExterior
      escort1.visible = showExterior
      escort2.visible = showExterior
      npcs.forEach((n) => { n.mesh.visible = showExterior })

      if (phase === STATE_ADDRESS_PHASES.WALK_TO_CARS) {
        const elapsed = Date.now() - phaseStart()
        const norm = Math.min(1, elapsed / WALK_DURATION_MS)
        const eye = new THREE.Vector3(OFFICE_EYE.x, OFFICE_EYE.y, OFFICE_EYE.z)
        const door = new THREE.Vector3(OFFICE_DOOR.x, OFFICE_DOOR.y, OFFICE_DOOR.z)
        const outside = new THREE.Vector3(0, 1.6, -6.5)
        if (norm < 0.5) {
          const local = norm * 2
          camera.position.lerpVectors(eye, door, local)
          controls.target.lerpVectors(new THREE.Vector3(OFFICE_LOOK.x, OFFICE_LOOK.y, OFFICE_LOOK.z), new THREE.Vector3(0, 1.2, -4), local)
        } else {
          const local = (norm - 0.5) * 2
          camera.position.lerpVectors(door, outside, local)
          controls.target.lerp(new THREE.Vector3(0, 1, -8), local)
        }
        controls.enabled = false
        if (norm >= 1) {
          resetPhaseStart()
          onPhaseCompleteRef.current?.(STATE_ADDRESS_PHASES.WALK_TO_CARS)
        }
      } else if (phase === STATE_ADDRESS_PHASES.AT_CARS) {
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(0, 1.6, -6.5), 0.1)
        controls.target.lerp(new THREE.Vector3(0, 1, -8), 0.1)
      } else if (phase === STATE_ADDRESS_PHASES.MOTORCADE_TO_PARLIAMENT) {
        const elapsed = Date.now() - phaseStart()
        const norm = Math.min(1, elapsed / MOTORCADE_DURATION_MS)
        const pathPos = getPathPoint(motorcadePathOut, norm)
        limo.position.copy(pathPos)
        const back = getPathPoint(motorcadePathOut, Math.max(0, norm - 0.03))
        const dir = new THREE.Vector3().subVectors(pathPos, back).normalize()
        const yaw = Math.atan2(dir.x, dir.z)
        limo.rotation.y = yaw
        escort1.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
        escort2.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
        escort1.rotation.y = yaw
        escort2.rotation.y = yaw
        const camPos = pathPos.clone().add(dir.clone().multiplyScalar(-4)).add(new THREE.Vector3(0, 2, 0))
        camera.position.lerp(camPos, 0.12)
        controls.target.lerp(pathPos, 0.15)
        controls.enabled = false
        if (norm >= 1) {
          resetPhaseStart()
          onPhaseCompleteRef.current?.(STATE_ADDRESS_PHASES.MOTORCADE_TO_PARLIAMENT)
        }
      } else if (phase === STATE_ADDRESS_PHASES.AT_PARLIAMENT) {
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(PARLIAMENT_ENTRANCE.x, PARLIAMENT_ENTRANCE.y, PARLIAMENT_ENTRANCE.z), 0.1)
        controls.target.lerp(new THREE.Vector3(PARLIAMENT_POS.x, 1, PARLIAMENT_POS.z), 0.1)
      } else if (phase === STATE_ADDRESS_PHASES.ENTER_PARLIAMENT) {
        const elapsed = Date.now() - phaseStart()
        const norm = Math.min(1, elapsed / 1500)
        camera.position.lerpVectors(
          new THREE.Vector3(PARLIAMENT_ENTRANCE.x, PARLIAMENT_ENTRANCE.y, PARLIAMENT_ENTRANCE.z),
          new THREE.Vector3(CHAMBER_VIEW.x, CHAMBER_VIEW.y, CHAMBER_VIEW.z),
          norm
        )
        controls.target.lerp(new THREE.Vector3(PARLIAMENT_POS.x, 1, PARLIAMENT_POS.z + 2), norm)
        controls.enabled = false
        if (norm >= 1) onPhaseCompleteRef.current?.(STATE_ADDRESS_PHASES.ENTER_PARLIAMENT)
      } else if (phase === STATE_ADDRESS_PHASES.SPEECH) {
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(CHAMBER_VIEW.x, CHAMBER_VIEW.y, CHAMBER_VIEW.z), 0.1)
        controls.target.lerp(new THREE.Vector3(PARLIAMENT_POS.x, 1, PARLIAMENT_POS.z + 1), 0.1)
        const elapsed = Date.now() - phaseStart()
        if (elapsed >= SPEECH_VIEW_MS) onSpeechDoneRef.current?.()
      } else if (phase === STATE_ADDRESS_PHASES.EXIT_PARLIAMENT) {
        const elapsed = Date.now() - phaseStart()
        const norm = Math.min(1, elapsed / 1500)
        camera.position.lerpVectors(
          new THREE.Vector3(CHAMBER_VIEW.x, CHAMBER_VIEW.y, CHAMBER_VIEW.z),
          new THREE.Vector3(PARLIAMENT_ENTRANCE.x, PARLIAMENT_ENTRANCE.y, PARLIAMENT_ENTRANCE.z),
          norm
        )
        controls.enabled = false
        if (norm >= 1) onPhaseCompleteRef.current?.(STATE_ADDRESS_PHASES.EXIT_PARLIAMENT)
      } else if (phase === STATE_ADDRESS_PHASES.MOTORCADE_TO_PALACE) {
        const elapsed = Date.now() - phaseStart()
        const norm = Math.min(1, elapsed / MOTORCADE_DURATION_MS)
        const pathPos = getPathPoint(motorcadePathBack, norm)
        limo.position.copy(pathPos)
        const back = getPathPoint(motorcadePathBack, Math.max(0, norm - 0.03))
        const dir = new THREE.Vector3().subVectors(pathPos, back).normalize()
        const yaw = Math.atan2(dir.x, dir.z)
        limo.rotation.y = yaw
        escort1.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
        escort2.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
        escort1.rotation.y = yaw
        escort2.rotation.y = yaw
        const camPos = pathPos.clone().add(dir.clone().multiplyScalar(-4)).add(new THREE.Vector3(0, 2, 0))
        camera.position.lerp(camPos, 0.12)
        controls.target.lerp(pathPos, 0.15)
        controls.enabled = false
        if (norm >= 1) {
          resetPhaseStart()
          onPhaseCompleteRef.current?.(STATE_ADDRESS_PHASES.MOTORCADE_TO_PALACE)
        }
      } else if (phase === STATE_ADDRESS_PHASES.AT_PALACE) {
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(0, 1.6, -6.5), 0.1)
        controls.target.lerp(new THREE.Vector3(0, 1, -8), 0.1)
      } else if (phase === STATE_ADDRESS_PHASES.WALK_TO_OFFICE) {
        const elapsed = Date.now() - phaseStart()
        const norm = Math.min(1, elapsed / WALK_DURATION_MS)
        const outside = new THREE.Vector3(0, 1.6, -6.5)
        const door = new THREE.Vector3(OFFICE_DOOR.x, OFFICE_DOOR.y, OFFICE_DOOR.z)
        const eye = new THREE.Vector3(OFFICE_EYE.x, OFFICE_EYE.y, OFFICE_EYE.z)
        if (norm < 0.5) {
          const local = norm * 2
          camera.position.lerpVectors(outside, door, local)
          controls.target.lerp(new THREE.Vector3(0, 1, -8), new THREE.Vector3(0, 1.2, -2), local)
        } else {
          const local = (norm - 0.5) * 2
          camera.position.lerpVectors(door, eye, local)
          controls.target.lerp(new THREE.Vector3(OFFICE_LOOK.x, OFFICE_LOOK.y, OFFICE_LOOK.z), local)
        }
        controls.enabled = false
        if (norm >= 1) {
          resetPhaseStart()
          onPhaseCompleteRef.current?.(STATE_ADDRESS_PHASES.WALK_TO_OFFICE)
        }
      } else {
        if (vm === 'office') {
          controls.enabled = false
          camera.position.lerp(new THREE.Vector3(OFFICE_EYE.x, OFFICE_EYE.y, OFFICE_EYE.z), 0.08)
          controls.target.lerp(new THREE.Vector3(OFFICE_LOOK.x, OFFICE_LOOK.y, OFFICE_LOOK.z), 0.08)
        } else {
          controls.enabled = true
          camera.position.lerp(new THREE.Vector3(12, 9, 12), 0.05)
          controls.target.lerp(new THREE.Vector3(0, 0, -3), 0.05)
        }
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      if (!renderer || !camera || !el) return
      const w = el.clientWidth
      const h = el.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (frameId) cancelAnimationFrame(frameId)
      controls?.dispose()
      renderer?.dispose()
      if (el && renderer?.domElement && el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (activityPhase) phaseStartRef.current = Date.now()
  }, [activityPhase])

  const approval = state?.population?.publicApproval
  const approvalPct = typeof approval === 'number' ? Math.round(approval * 100) : '—'
  const date = state?.time ? `${state.time.month}/${state.time.year}` : '—'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 380, background: '#0f1419', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 380 }} />
      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <span style={{ color: '#8b98a5', fontSize: 12 }}>Republic of Valdris — {date}</span>
        <span style={{ color: '#8b98a5', fontSize: 12 }}>Approval: {approvalPct}%</span>
      </div>
      <div style={{ position: 'absolute', bottom: 10, left: 10, color: '#6e767d', fontSize: 11 }}>
        {viewMode === 'office' ? "First-person: you're at the desk · Activities from the desk" : 'Orbit the capital'}
      </div>
    </div>
  )
}
