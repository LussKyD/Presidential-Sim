import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STATE_ADDRESS_PHASES, STATE_VISIT_PHASES, VISIT_REGION_PHASES, LAUNCH_INFRASTRUCTURE_PHASES } from '../../core/constants/activities'
import { REGION_IDS } from '../../core/constants/regions'
import { formatGameDate } from '../../utils/dateFormat'

// Oval Office style: president in lone chair behind desk, looking into room and at TV on far wall
const OFFICE_EYE = { x: 0, y: 1.6, z: 0.6 }
const OFFICE_LOOK = { x: 0, y: 1.4, z: -2.7 }
const OFFICE_DOOR = { x: 0, y: 1.6, z: -2.5 }
// Exterior: palace front, driveway, parliament (separate from office so motorcade is outside)
const PALACE_FRONT = { x: 0, z: -10 }
const DRIVEWAY = { x: 0, z: -7 }
const PARLIAMENT_POS = { x: -8, z: 4 }
// Drop-off in front of parliament (building extends z 2..6), not inside
const PARLIAMENT_DROP_OFF_Z = 1.5
const PARLIAMENT_ENTRANCE = { x: -8, y: 1.6, z: 3 }
const CHAMBER_VIEW = { x: -8, y: 1.6, z: 5.5 }
// State visit: airport (3D destination for motorcade)
const AIRPORT_POS = { x: 10, z: 8 }
const MOTORCADE_TO_AIRPORT_MS = 5500
// Visit region / Launch infra: generic "site" (region or project site)
const SITE_POS = { x: -10, z: 6 }
const MOTORCADE_TO_SITE_MS = 5000

const WALK_DURATION_MS = 2500
const MOTORCADE_DURATION_MS = 6000
const SPEECH_VIEW_MS = 3000

/** First-person 3D world: office interior (your eyes at desk), exterior (palace, cars, road, parliament), full state-address flow. */
const OFFICE_TV_CHANNELS = [
  { id: 'tv4', label: 'TV4' },
  { id: 'natv', label: 'NATV' },
  { id: 'defence', label: 'DEFENCE TV' },
  { id: 'ini', label: 'INI TV' },
]

const MAP_DEFAULT_POS = new THREE.Vector3(12, 9, 12)
const MAP_DEFAULT_TARGET = new THREE.Vector3(0, 0, -3)

const WorldViewInner = forwardRef(function WorldViewInner({
  state,
  viewMode = 'office',
  activityPhase,
  onPhaseComplete,
  onSpeechDone,
  onSpeechReady,
  onTabletClick,
  onResetView,
  stateVisitPhase,
  onStateVisitPhaseComplete,
  securityBriefingPhase,
  pressConferencePhase,
  cabinetMeetingActive,
  visitRegionPhase,
  launchInfrastructurePhase,
  onVisitRegionPhaseComplete,
  onLaunchInfrastructurePhaseComplete,
  budgetDayChamberActive,
}, ref) {
  const containerRef = useRef(null)
  const activityPhaseRef = useRef(activityPhase)
  const stateVisitPhaseRef = useRef(stateVisitPhase)
  const securityBriefingPhaseRef = useRef(securityBriefingPhase)
  const pressConferencePhaseRef = useRef(pressConferencePhase)
  const cabinetMeetingActiveRef = useRef(cabinetMeetingActive)
  const visitRegionPhaseRef = useRef(visitRegionPhase)
  const launchInfrastructurePhaseRef = useRef(launchInfrastructurePhase)
  const onVisitRegionPhaseCompleteRef = useRef(onVisitRegionPhaseComplete)
  const onLaunchInfrastructurePhaseCompleteRef = useRef(onLaunchInfrastructurePhaseComplete)
  const budgetDayChamberActiveRef = useRef(budgetDayChamberActive)
  const sitePhaseStartRef = useRef(null)
  const viewModeRef = useRef(viewMode)
  const phaseStartRef = useRef(null)
  const onPhaseCompleteRef = useRef(onPhaseComplete)
  const onStateVisitPhaseCompleteRef = useRef(onStateVisitPhaseComplete)
  const onSpeechDoneRef = useRef(onSpeechDone)
  const onSpeechReadyRef = useRef(onSpeechReady)
  const onTabletClickRef = useRef(onTabletClick)
  const speechReadyFiredRef = useRef(false)
  const officeCameraSettledRef = useRef(false)
  const mapCameraInitializedRef = useRef(false)
  const stateRef = useRef(state)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)

  useImperativeHandle(ref, () => ({
    resetMapView() {
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.copy(MAP_DEFAULT_POS)
        controlsRef.current.target.copy(MAP_DEFAULT_TARGET)
        mapCameraInitializedRef.current = true
      }
    },
  }), [])
  stateRef.current = state
  activityPhaseRef.current = activityPhase
  stateVisitPhaseRef.current = stateVisitPhase
  securityBriefingPhaseRef.current = securityBriefingPhase
  pressConferencePhaseRef.current = pressConferencePhase
  cabinetMeetingActiveRef.current = cabinetMeetingActive
  visitRegionPhaseRef.current = visitRegionPhase
  launchInfrastructurePhaseRef.current = launchInfrastructurePhase
  onVisitRegionPhaseCompleteRef.current = onVisitRegionPhaseComplete
  onLaunchInfrastructurePhaseCompleteRef.current = onLaunchInfrastructurePhaseComplete
  budgetDayChamberActiveRef.current = budgetDayChamberActive
  viewModeRef.current = viewMode
  onPhaseCompleteRef.current = onPhaseComplete
  onStateVisitPhaseCompleteRef.current = onStateVisitPhaseComplete
  onSpeechDoneRef.current = onSpeechDone
  onSpeechReadyRef.current = onSpeechReady
  onTabletClickRef.current = onTabletClick
  if (activityPhase !== STATE_ADDRESS_PHASES.SPEECH) speechReadyFiredRef.current = false

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
    cameraRef.current = camera

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0x404060, 0.9))
    const sun = new THREE.DirectionalLight(0xffeedd, 1)
    sun.position.set(10, 25, 10)
    scene.add(sun)

    // ---- Oval Office interior: president at desk (lone chair) looking at room + TV on far wall ----
    const officeGroup = new THREE.Group()
    const of = 6
    const officeFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(of, of),
      new THREE.MeshStandardMaterial({ color: 0x252220 })
    )
    officeFloor.rotation.x = -Math.PI / 2
    officeFloor.position.y = 0.01
    officeGroup.add(officeFloor)
    const ovalRug = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 48),
      new THREE.MeshStandardMaterial({ color: 0xd4c4a8 })
    )
    ovalRug.rotation.x = -Math.PI / 2
    ovalRug.scale.z = 1.2
    ovalRug.position.y = 0.015
    officeGroup.add(ovalRug)

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3d3832 })
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
      new THREE.BoxGeometry(2.4, 0.82, 1.05),
      new THREE.MeshStandardMaterial({ color: 0x6b4423 })
    )
    desk.position.set(0, 0.41, -1.4)
    officeGroup.add(desk)

    const chairMat = new THREE.MeshStandardMaterial({ color: 0x2a1510 })
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.18, 0.58), chairMat)
    chairSeat.position.set(0, 0.38, 0.12)
    officeGroup.add(chairSeat)
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.95, 0.12), chairMat)
    chairBack.position.set(0, 0.98, -0.08)
    officeGroup.add(chairBack)

    const visitorMat = new THREE.MeshStandardMaterial({ color: 0x2a2520 })
    ;[-0.65, 0, 0.65].forEach((px) => {
      const visitorSeat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.2, 0.48), visitorMat)
      visitorSeat.position.set(px, 0.34, -2.5)
      officeGroup.add(visitorSeat)
    })

    const couchMat = new THREE.MeshStandardMaterial({ color: 0x5c5348 })
    const couch = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.48, 0.65), couchMat)
    couch.position.set(-1.35, 0.24, 0.35)
    couch.rotation.y = Math.PI / 12
    officeGroup.add(couch)
    const couch2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.48, 0.65), couchMat)
    couch2.position.set(1.35, 0.24, 0.35)
    couch2.rotation.y = -Math.PI / 12
    officeGroup.add(couch2)
    const coffeeTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.48, 0.08, 24),
      new THREE.MeshStandardMaterial({ color: 0x4a4035 })
    )
    coffeeTable.position.set(0, 0.04, 0.25)
    officeGroup.add(coffeeTable)

    const tablet = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.03, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x1d9bf0, emissiveIntensity: 0.2 })
    )
    tablet.position.set(0.4, 0.82, -1.08)
    tablet.rotation.x = -Math.PI / 12
    officeGroup.add(tablet)

    const tvCanvas = document.createElement('canvas')
    tvCanvas.width = 512
    tvCanvas.height = 256
    const tvCtx = tvCanvas.getContext('2d')
    const tvTexture = new THREE.CanvasTexture(tvCanvas)
    tvTexture.minFilter = THREE.LinearFilter
    tvTexture.magFilter = THREE.LinearFilter
    const tvMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      emissive: 0x111827,
      emissiveIntensity: 0.6,
      map: tvTexture,
      emissiveMap: tvTexture,
    })
    const tv = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.04), tvMat)
    tv.position.set(0, 1.6, -2.85)
    officeGroup.add(tv)

    function drawTvScreen() {
      const s = stateRef.current
      const events = s?.events ?? []
      const recent = [...events].reverse().slice(0, 4)
      const lastEvent = events.length ? events[events.length - 1] : null
      const labels = ['TV4', 'NATV', 'DEFENCE TV', 'INI TV']
      const c = tvCtx
      const w = tvCanvas.width
      const h = tvCanvas.height
      c.fillStyle = '#0a0a0c'
      c.fillRect(0, 0, w, h)
      c.strokeStyle = 'rgba(0,0,0,0.15)'
      c.lineWidth = 1
      for (let y = 0; y < h; y += 4) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke() }
      const pad = 4
      const cw = (w - pad * 3) / 2
      const ch = (h - pad * 3) / 2
      const shortDate = (at) => {
        if (!at) return ''
        const name = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(at.month ?? 1) - 1]
        return name ? `${name} ${at.day ?? 1}` : `${at.month}/${at.year}`
      }
      for (let i = 0; i < 4; i++) {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = pad + col * (cw + pad)
        const y = pad + row * (ch + pad)
        c.fillStyle = '#111'
        c.fillRect(x, y, cw, ch)
        c.fillStyle = i === 0 ? '#1d9bf0' : '#8b98a5'
        c.font = 'bold 14px system-ui, sans-serif'
        c.fillText(labels[i], x + 8, y + 20)
        c.strokeStyle = '#2f3336'
        c.lineWidth = 1
        c.strokeRect(x, y, cw, ch)
        const ev = recent[i]
        if (ev) {
          c.fillStyle = '#6e767d'
          c.font = '11px system-ui, sans-serif'
          c.fillText(shortDate(ev.at), x + 8, y + 38)
          c.fillStyle = '#e7e9ea'
          c.font = '12px system-ui, sans-serif'
          const msg = (i === 0 && lastEvent ? 'LIVE ' : '') + (ev.message || '')
          const lines = msg.length > 36 ? msg.slice(0, 36) + '…' : msg
          c.fillText(lines, x + 8, y + 54)
        } else {
          c.fillStyle = '#6e767d'
          c.font = '12px system-ui, sans-serif'
          c.fillText('—', x + 8, y + 48)
        }
      }
      tvTexture.needsUpdate = true
    }
    drawTvScreen()

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

    // Airport (state visit): simple tarmac + terminal block
    const airportTerminal = new THREE.Mesh(
      new THREE.BoxGeometry(4, 1.5, 3),
      new THREE.MeshStandardMaterial({ color: 0x374151 })
    )
    airportTerminal.position.set(AIRPORT_POS.x, 0.75, AIRPORT_POS.z)
    scene.add(airportTerminal)
    const airportTarmac = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 10),
      new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    )
    airportTarmac.rotation.x = -Math.PI / 2
    airportTarmac.position.set(AIRPORT_POS.x, 0.01, AIRPORT_POS.z)
    scene.add(airportTarmac)

    // Plane interior (state visit FLIGHT phase): cabin with window and seat
    const PLANE_INTERIOR_POS = { x: 0, z: 15 }
    const planeInteriorGroup = new THREE.Group()
    planeInteriorGroup.position.set(PLANE_INTERIOR_POS.x, 0, PLANE_INTERIOR_POS.z)
    const planeFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 4),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    )
    planeFloor.rotation.x = -Math.PI / 2
    planeInteriorGroup.add(planeFloor)
    const planeWall = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x252a33 })
    )
    planeWall.position.set(0, 0.9, -2)
    planeInteriorGroup.add(planeWall)
    const planeWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1e3a5f })
    )
    planeWindow.position.set(0, 1, -1.95)
    planeInteriorGroup.add(planeWindow)
    const planeSeat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x374151 })
    )
    planeSeat.position.set(0, 0.25, 0.3)
    planeInteriorGroup.add(planeSeat)
    const planeTable = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.02, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x4a5568 })
    )
    planeTable.position.set(0, 0.5, 0.1)
    planeInteriorGroup.add(planeTable)
    scene.add(planeInteriorGroup)

    // Site (visit region / launch infra): generic landmark — platform + small structure
    const siteGroup = new THREE.Group()
    const sitePlatform = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.15, 3),
      new THREE.MeshStandardMaterial({ color: 0x374151 })
    )
    sitePlatform.position.set(SITE_POS.x, 0.075, SITE_POS.z)
    siteGroup.add(sitePlatform)
    const siteStructure = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.2, 1),
      new THREE.MeshStandardMaterial({ color: 0x4b5563 })
    )
    siteStructure.position.set(SITE_POS.x, 0.75, SITE_POS.z)
    siteGroup.add(siteStructure)
    scene.add(siteGroup)

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

    // ---- Briefing room (security briefing / cabinet): table, chairs, screen ----
    const BRIEFING_ROOM_POS = { x: 6, z: -4 }
    const briefingRoomGroup = new THREE.Group()
    briefingRoomGroup.position.set(BRIEFING_ROOM_POS.x, 0, BRIEFING_ROOM_POS.z)
    const briefFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 4),
      new THREE.MeshStandardMaterial({ color: 0x1a1f26 })
    )
    briefFloor.rotation.x = -Math.PI / 2
    briefingRoomGroup.add(briefFloor)
    const briefWall = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x252a33 })
    )
    briefWall.position.z = -2
    briefingRoomGroup.add(briefWall)
    const briefTable = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.08, 1),
      new THREE.MeshStandardMaterial({ color: 0x4a5568 })
    )
    briefTable.position.set(0, 0.4, 0)
    briefingRoomGroup.add(briefTable)
    const briefScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x0f1419 })
    )
    briefScreen.position.set(0, 1.35, -1.85)
    briefingRoomGroup.add(briefScreen)
    for (let i = -1; i <= 1; i++) {
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.35), new THREE.MeshStandardMaterial({ color: 0x374151 }))
      chair.position.set(i * 0.7, 0.225, 0.6)
      briefingRoomGroup.add(chair)
    }
    scene.add(briefingRoomGroup)

    // ---- Podium room (press conference): podium, audience seats ----
    const PODIUM_ROOM_POS = { x: 6, z: 2 }
    const podiumRoomGroup = new THREE.Group()
    podiumRoomGroup.position.set(PODIUM_ROOM_POS.x, 0, PODIUM_ROOM_POS.z)
    const podiumFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 5),
      new THREE.MeshStandardMaterial({ color: 0x1a1f26 })
    )
    podiumFloor.rotation.x = -Math.PI / 2
    podiumRoomGroup.add(podiumFloor)
    const podiumWall = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x252a33 })
    )
    podiumWall.position.z = -2.5
    podiumRoomGroup.add(podiumWall)
    const pressPodium = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.6, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x4a5568 })
    )
    pressPodium.position.set(0, 0.3, -0.8)
    podiumRoomGroup.add(pressPodium)
    for (let row = 0; row < 3; row++) {
      for (let col = -2; col <= 2; col++) {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), new THREE.MeshStandardMaterial({ color: 0x374151 }))
        seat.position.set(col * 0.5, 0.2, 0.5 + row * 0.5)
        podiumRoomGroup.add(seat)
      }
    }
    scene.add(podiumRoomGroup)

    // ---- Foreign palace meeting room (state visit bilateral meeting): different tone ----
    const FOREIGN_PALACE_ROOM_POS = { x: -6, z: -4 }
    const foreignPalaceRoomGroup = new THREE.Group()
    foreignPalaceRoomGroup.position.set(FOREIGN_PALACE_ROOM_POS.x, 0, FOREIGN_PALACE_ROOM_POS.z)
    const foreignFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 4),
      new THREE.MeshStandardMaterial({ color: 0x2a2218 })
    )
    foreignFloor.rotation.x = -Math.PI / 2
    foreignPalaceRoomGroup.add(foreignFloor)
    const foreignWall = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x3d2c1e })
    )
    foreignWall.position.z = -2
    foreignPalaceRoomGroup.add(foreignWall)
    const foreignTable = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.06, 1),
      new THREE.MeshStandardMaterial({ color: 0x5c4a32 })
    )
    foreignTable.position.set(0, 0.38, 0)
    foreignPalaceRoomGroup.add(foreignTable)
    const foreignFlag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x1e3a5f })
    )
    foreignFlag.position.set(0, 1.2, -1.9)
    foreignPalaceRoomGroup.add(foreignFlag)
    const foreignChair1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), new THREE.MeshStandardMaterial({ color: 0x4a3c2a }))
    foreignChair1.position.set(-0.6, 0.25, 0.65)
    foreignPalaceRoomGroup.add(foreignChair1)
    const foreignChair2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), new THREE.MeshStandardMaterial({ color: 0x4a3c2a }))
    foreignChair2.position.set(0.6, 0.25, 0.65)
    foreignPalaceRoomGroup.add(foreignChair2)
    scene.add(foreignPalaceRoomGroup)

    // ---- Residence wing (palace multiple rooms): private quarters ----
    const RESIDENCE_POS = { x: 4, z: -6 }
    const residenceGroup = new THREE.Group()
    residenceGroup.position.set(RESIDENCE_POS.x, 0, RESIDENCE_POS.z)
    const resFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshStandardMaterial({ color: 0x1e1a16 })
    )
    resFloor.rotation.x = -Math.PI / 2
    residenceGroup.add(resFloor)
    const resWall = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x2c2520 })
    )
    resWall.position.z = -2
    residenceGroup.add(resWall)
    const resBed = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.4, 1),
      new THREE.MeshStandardMaterial({ color: 0x4a3c2a })
    )
    resBed.position.set(-0.6, 0.2, 0.2)
    residenceGroup.add(resBed)
    const resTable = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.5, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x5c4a32 })
    )
    resTable.position.set(0.6, 0.25, 0.3)
    residenceGroup.add(resTable)
    const resLamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0x374151 })
    )
    resLamp.position.set(0.6, 0.6, 0.3)
    residenceGroup.add(resLamp)
    scene.add(residenceGroup)

    // Motorcade: limo + escorts (start at driveway, drive to parliament)
    const carGeo = new THREE.BoxGeometry(0.9, 0.45, 1.8)
    const limo = new THREE.Mesh(carGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.4, roughness: 0.4 }))
    const escort1 = new THREE.Mesh(carGeo, new THREE.MeshStandardMaterial({ color: 0x1f2933, metalness: 0.3, roughness: 0.5 }))
    const escort2 = new THREE.Mesh(carGeo, new THREE.MeshStandardMaterial({ color: 0x1f2933, metalness: 0.3, roughness: 0.5 }))
    const leadCar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 1.4), new THREE.MeshStandardMaterial({ color: 0x1f2933, metalness: 0.35, roughness: 0.5 }))
    const bikeGeo = new THREE.BoxGeometry(0.25, 0.35, 0.9)
    const bike1 = new THREE.Mesh(bikeGeo, new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.4, roughness: 0.5 }))
    const bike2 = new THREE.Mesh(bikeGeo, new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.4, roughness: 0.5 }))
    limo.position.set(DRIVEWAY.x, 0.22, DRIVEWAY.z)
    escort1.position.set(DRIVEWAY.x - 1.2, 0.22, DRIVEWAY.z - 0.5)
    escort2.position.set(DRIVEWAY.x + 1.2, 0.22, DRIVEWAY.z - 0.5)
    leadCar.position.set(DRIVEWAY.x, 0.2, DRIVEWAY.z + 1.5)
    bike1.position.set(DRIVEWAY.x - 0.6, 0.18, DRIVEWAY.z - 1.2)
    bike2.position.set(DRIVEWAY.x + 0.6, 0.18, DRIVEWAY.z - 1.2)
    scene.add(limo)
    scene.add(escort1)
    scene.add(escort2)
    scene.add(leadCar)
    scene.add(bike1)
    scene.add(bike2)

    const motorcadePathOut = [
      new THREE.Vector3(DRIVEWAY.x, 0.22, DRIVEWAY.z),
      new THREE.Vector3(-2, 0.22, -6),
      new THREE.Vector3(-5, 0.22, -2),
      new THREE.Vector3(PARLIAMENT_POS.x, 0.22, PARLIAMENT_DROP_OFF_Z),
    ]
    const motorcadePathBack = [...motorcadePathOut].reverse()

    // State visit: palace driveway -> airport (and back)
    const motorcadePathToAirport = [
      new THREE.Vector3(DRIVEWAY.x, 0.22, DRIVEWAY.z),
      new THREE.Vector3(3, 0.22, -5),
      new THREE.Vector3(6, 0.22, 0),
      new THREE.Vector3(10, 0.22, 4),
      new THREE.Vector3(AIRPORT_POS.x, 0.22, AIRPORT_POS.z),
    ]
    const motorcadePathFromAirport = [...motorcadePathToAirport].reverse()

    // Visit region / Launch infra: palace driveway -> site (and back)
    const motorcadePathToSite = [
      new THREE.Vector3(DRIVEWAY.x, 0.22, DRIVEWAY.z),
      new THREE.Vector3(-3, 0.22, -4),
      new THREE.Vector3(-6, 0.22, 1),
      new THREE.Vector3(SITE_POS.x, 0.22, SITE_POS.z),
    ]
    const motorcadePathFromSite = [...motorcadePathToSite].reverse()

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
    function setMotorcadeExtras(path, norm, yaw) {
      const dir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
      const leadPos = getPathPoint(path, Math.min(1, norm + 0.06))
      leadCar.position.copy(leadPos)
      leadCar.rotation.y = yaw
      const bike1Pos = getPathPoint(path, Math.max(0, norm - 0.05)).add(right.clone().multiplyScalar(-0.7))
      bike1.position.copy(bike1Pos)
      bike1.rotation.y = yaw
      const bike2Pos = getPathPoint(path, Math.max(0, norm - 0.09)).add(right.clone().multiplyScalar(0.7))
      bike2.position.copy(bike2Pos)
      bike2.rotation.y = yaw
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
    controlsRef.current = controls
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 4
    controls.maxDistance = 30
    controls.enablePan = true

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    function onCanvasClick(event) {
      if (activityPhaseRef.current || viewModeRef.current !== 'office') return
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObject(tablet, true)
      if (hits.length > 0) onTabletClickRef.current?.()
    }
    renderer.domElement.addEventListener('click', onCanvasClick)

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
      if (showOffice && vm === 'office' && !phase) drawTvScreen()
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
      leadCar.visible = showExterior
      bike1.visible = showExterior
      bike2.visible = showExterior
      npcs.forEach((n) => { n.mesh.visible = showExterior })

      const svPhase = stateVisitPhaseRef.current
      const showStateVisitExterior = svPhase === STATE_VISIT_PHASES.MOTORCADE_TO_AIRPORT || svPhase === STATE_VISIT_PHASES.RETURN_TO_OFFICE
      if (showStateVisitExterior) {
        ground.visible = true
        palace.visible = true
        road1.visible = true
        road2.visible = true
        road3.visible = true
        parliament.visible = false
        chamberGroup.visible = false
        airportTerminal.visible = true
        airportTarmac.visible = true
        limo.visible = true
        escort1.visible = true
        escort2.visible = true
        leadCar.visible = true
        bike1.visible = true
        bike2.visible = true
        officeGroup.visible = false
        npcs.forEach((n) => { n.mesh.visible = true })
      } else {
        airportTerminal.visible = false
        airportTarmac.visible = false
      }

      const inPlaneView = svPhase === STATE_VISIT_PHASES.FLIGHT
      if (inPlaneView) {
        officeGroup.visible = false
        ground.visible = false
        palace.visible = false
        road1.visible = false
        road2.visible = false
        road3.visible = false
        parliament.visible = false
        chamberGroup.visible = false
        airportTerminal.visible = false
        airportTarmac.visible = false
        siteGroup.visible = false
        limo.visible = false
        escort1.visible = false
        escort2.visible = false
        leadCar.visible = false
        bike1.visible = false
        bike2.visible = false
        briefingRoomGroup.visible = false
        podiumRoomGroup.visible = false
        foreignPalaceRoomGroup.visible = false
        residenceGroup.visible = false
        planeInteriorGroup.visible = true
        npcs.forEach((n) => { n.mesh.visible = false })
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(PLANE_INTERIOR_POS.x, 1.2, PLANE_INTERIOR_POS.z + 1.2), 0.1)
        controls.target.lerp(new THREE.Vector3(PLANE_INTERIOR_POS.x, 0.8, PLANE_INTERIOR_POS.z - 1), 0.1)
      } else {
        planeInteriorGroup.visible = false
      }

      const vrPhase = visitRegionPhaseRef.current
      const liPhase = launchInfrastructurePhaseRef.current
      const showSiteExterior = vrPhase === VISIT_REGION_PHASES.MOTORCADE || vrPhase === VISIT_REGION_PHASES.RETURN || liPhase === LAUNCH_INFRASTRUCTURE_PHASES.MOTORCADE || liPhase === LAUNCH_INFRASTRUCTURE_PHASES.RETURN
      if (showSiteExterior) {
        ground.visible = true
        palace.visible = true
        road1.visible = true
        road2.visible = true
        road3.visible = true
        parliament.visible = false
        chamberGroup.visible = false
        airportTerminal.visible = false
        airportTarmac.visible = false
        siteGroup.visible = true
        limo.visible = true
        escort1.visible = true
        escort2.visible = true
        leadCar.visible = true
        bike1.visible = true
        bike2.visible = true
        officeGroup.visible = false
        npcs.forEach((n) => { n.mesh.visible = true })
      } else {
        siteGroup.visible = false
      }

      const inBriefingRoom = !!securityBriefingPhaseRef.current || !!cabinetMeetingActiveRef.current
      const inPodiumRoom = !!pressConferencePhaseRef.current
      const inForeignPalaceMeeting = svPhase === STATE_VISIT_PHASES.MEETING_AT_PALACE
      const inResidenceView = vm === 'residence' && !phase && !showStateVisitExterior && !showSiteExterior && !inBriefingRoom && !inPodiumRoom && !inForeignPalaceMeeting
      const inBudgetDayChamber = !!budgetDayChamberActiveRef.current
      if (inBriefingRoom) {
        officeGroup.visible = false
        ground.visible = false
        palace.visible = false
        road1.visible = false
        road2.visible = false
        road3.visible = false
        parliament.visible = false
        chamberGroup.visible = false
        airportTerminal.visible = false
        airportTarmac.visible = false
        siteGroup.visible = false
        foreignPalaceRoomGroup.visible = false
        residenceGroup.visible = false
        planeInteriorGroup.visible = false
        limo.visible = false
        escort1.visible = false
        escort2.visible = false
        leadCar.visible = false
        bike1.visible = false
        bike2.visible = false
        briefingRoomGroup.visible = true
        podiumRoomGroup.visible = false
        npcs.forEach((n) => { n.mesh.visible = false })
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(BRIEFING_ROOM_POS.x, 1.5, BRIEFING_ROOM_POS.z + 1.8), 0.1)
        controls.target.lerp(new THREE.Vector3(BRIEFING_ROOM_POS.x, 1, BRIEFING_ROOM_POS.z), 0.1)
      } else if (inPodiumRoom) {
        officeGroup.visible = false
        ground.visible = false
        palace.visible = false
        road1.visible = false
        road2.visible = false
        road3.visible = false
        parliament.visible = false
        chamberGroup.visible = false
        airportTerminal.visible = false
        airportTarmac.visible = false
        siteGroup.visible = false
        foreignPalaceRoomGroup.visible = false
        residenceGroup.visible = false
        limo.visible = false
        escort1.visible = false
        escort2.visible = false
        leadCar.visible = false
        bike1.visible = false
        bike2.visible = false
        briefingRoomGroup.visible = false
        podiumRoomGroup.visible = true
        npcs.forEach((n) => { n.mesh.visible = false })
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(PODIUM_ROOM_POS.x, 1.5, PODIUM_ROOM_POS.z + 2.2), 0.1)
        controls.target.lerp(new THREE.Vector3(PODIUM_ROOM_POS.x, 1, PODIUM_ROOM_POS.z - 0.8), 0.1)
      } else if (inForeignPalaceMeeting) {
        officeGroup.visible = false
        ground.visible = false
        palace.visible = false
        road1.visible = false
        road2.visible = false
        road3.visible = false
        parliament.visible = false
        chamberGroup.visible = false
        airportTerminal.visible = false
        airportTarmac.visible = false
        siteGroup.visible = false
        limo.visible = false
        escort1.visible = false
        escort2.visible = false
        leadCar.visible = false
        bike1.visible = false
        bike2.visible = false
        briefingRoomGroup.visible = false
        podiumRoomGroup.visible = false
        foreignPalaceRoomGroup.visible = true
        residenceGroup.visible = false
        npcs.forEach((n) => { n.mesh.visible = false })
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(FOREIGN_PALACE_ROOM_POS.x, 1.5, FOREIGN_PALACE_ROOM_POS.z + 1.8), 0.1)
        controls.target.lerp(new THREE.Vector3(FOREIGN_PALACE_ROOM_POS.x, 1, FOREIGN_PALACE_ROOM_POS.z), 0.1)
      } else if (inResidenceView) {
        officeGroup.visible = false
        ground.visible = false
        palace.visible = false
        road1.visible = false
        road2.visible = false
        road3.visible = false
        parliament.visible = false
        chamberGroup.visible = false
        airportTerminal.visible = false
        airportTarmac.visible = false
        siteGroup.visible = false
        limo.visible = false
        escort1.visible = false
        escort2.visible = false
        leadCar.visible = false
        bike1.visible = false
        bike2.visible = false
        briefingRoomGroup.visible = false
        podiumRoomGroup.visible = false
        foreignPalaceRoomGroup.visible = false
        residenceGroup.visible = true
        npcs.forEach((n) => { n.mesh.visible = false })
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(RESIDENCE_POS.x, 1.4, RESIDENCE_POS.z + 1.6), 0.1)
        controls.target.lerp(new THREE.Vector3(RESIDENCE_POS.x, 0.8, RESIDENCE_POS.z), 0.1)
      } else if (inBudgetDayChamber) {
        officeGroup.visible = false
        ground.visible = false
        palace.visible = false
        road1.visible = false
        road2.visible = false
        road3.visible = false
        parliament.visible = false
        chamberGroup.visible = true
        airportTerminal.visible = false
        airportTarmac.visible = false
        siteGroup.visible = false
        limo.visible = false
        escort1.visible = false
        escort2.visible = false
        leadCar.visible = false
        bike1.visible = false
        bike2.visible = false
        briefingRoomGroup.visible = false
        podiumRoomGroup.visible = false
        foreignPalaceRoomGroup.visible = false
        residenceGroup.visible = false
        npcs.forEach((n) => { n.mesh.visible = false })
        controls.enabled = false
        camera.position.lerp(new THREE.Vector3(CHAMBER_VIEW.x, CHAMBER_VIEW.y, CHAMBER_VIEW.z), 0.1)
        controls.target.lerp(new THREE.Vector3(PARLIAMENT_POS.x, 1, PARLIAMENT_POS.z + 1), 0.1)
      } else {
        briefingRoomGroup.visible = false
        podiumRoomGroup.visible = false
        foreignPalaceRoomGroup.visible = false
        residenceGroup.visible = false
      }

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
        setMotorcadeExtras(motorcadePathOut, norm, yaw)
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
        if (elapsed >= SPEECH_VIEW_MS && !speechReadyFiredRef.current) {
          speechReadyFiredRef.current = true
          onSpeechReadyRef.current?.()
        }
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
        setMotorcadeExtras(motorcadePathBack, norm, yaw)
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
        officeCameraSettledRef.current = false
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
      } else if (svPhase === STATE_VISIT_PHASES.MOTORCADE_TO_AIRPORT) {
        if (phaseStartRef.current === null) phaseStartRef.current = Date.now()
        const elapsed = Date.now() - phaseStartRef.current
        const norm = Math.min(1, elapsed / MOTORCADE_TO_AIRPORT_MS)
        const pathPos = getPathPoint(motorcadePathToAirport, norm)
        limo.position.copy(pathPos)
        const back = getPathPoint(motorcadePathToAirport, Math.max(0, norm - 0.03))
        const dir = new THREE.Vector3().subVectors(pathPos, back).normalize()
        const yaw = Math.atan2(dir.x, dir.z)
        limo.rotation.y = yaw
        escort1.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
        escort2.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
        escort1.rotation.y = yaw
        escort2.rotation.y = yaw
        setMotorcadeExtras(motorcadePathToAirport, norm, yaw)
        const camPos = pathPos.clone().add(dir.clone().multiplyScalar(-4)).add(new THREE.Vector3(0, 2, 0))
        camera.position.lerp(camPos, 0.12)
        controls.target.lerp(pathPos, 0.15)
        controls.enabled = false
        if (norm >= 1) {
          phaseStartRef.current = null
          onStateVisitPhaseCompleteRef.current?.()
        }
      } else if (svPhase === STATE_VISIT_PHASES.RETURN_TO_OFFICE) {
        if (phaseStartRef.current === null) phaseStartRef.current = Date.now()
        const elapsed = Date.now() - phaseStartRef.current
        const motorcadeDuration = MOTORCADE_TO_AIRPORT_MS
        const totalDuration = motorcadeDuration + WALK_DURATION_MS
        if (elapsed < motorcadeDuration) {
          const norm = elapsed / motorcadeDuration
          const pathPos = getPathPoint(motorcadePathFromAirport, norm)
          limo.position.copy(pathPos)
          const back = getPathPoint(motorcadePathFromAirport, Math.max(0, norm - 0.03))
          const dir = new THREE.Vector3().subVectors(pathPos, back).normalize()
          const yaw = Math.atan2(dir.x, dir.z)
          limo.rotation.y = yaw
          escort1.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
          escort2.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
          escort1.rotation.y = yaw
          escort2.rotation.y = yaw
          setMotorcadeExtras(motorcadePathFromAirport, norm, yaw)
          const camPos = pathPos.clone().add(dir.clone().multiplyScalar(-4)).add(new THREE.Vector3(0, 2, 0))
          camera.position.lerp(camPos, 0.12)
          controls.target.lerp(pathPos, 0.15)
          controls.enabled = false
        } else {
          const walkElapsed = elapsed - motorcadeDuration
          const walkNorm = Math.min(1, walkElapsed / WALK_DURATION_MS)
          const outside = new THREE.Vector3(0, 1.6, -6.5)
          const door = new THREE.Vector3(OFFICE_DOOR.x, OFFICE_DOOR.y, OFFICE_DOOR.z)
          const eye = new THREE.Vector3(OFFICE_EYE.x, OFFICE_EYE.y, OFFICE_EYE.z)
          limo.position.set(DRIVEWAY.x, 0.22, DRIVEWAY.z)
          escort1.position.set(DRIVEWAY.x - 1.2, 0.22, DRIVEWAY.z - 0.5)
          escort2.position.set(DRIVEWAY.x + 1.2, 0.22, DRIVEWAY.z - 0.5)
          leadCar.position.set(DRIVEWAY.x, 0.2, DRIVEWAY.z + 1.5)
          bike1.position.set(DRIVEWAY.x - 0.6, 0.18, DRIVEWAY.z - 1.2)
          bike2.position.set(DRIVEWAY.x + 0.6, 0.18, DRIVEWAY.z - 1.2)
          if (walkNorm < 0.5) {
            const local = walkNorm * 2
            camera.position.lerpVectors(outside, door, local)
            controls.target.lerp(new THREE.Vector3(0, 1, -8), new THREE.Vector3(0, 1.2, -2), local)
          } else {
            const local = (walkNorm - 0.5) * 2
            camera.position.lerpVectors(door, eye, local)
            controls.target.lerp(new THREE.Vector3(OFFICE_LOOK.x, OFFICE_LOOK.y, OFFICE_LOOK.z), local)
          }
          controls.enabled = false
          if (walkNorm >= 1) {
            phaseStartRef.current = null
            officeCameraSettledRef.current = false
            onStateVisitPhaseCompleteRef.current?.()
          }
        }
      } else if (vrPhase === VISIT_REGION_PHASES.MOTORCADE || liPhase === LAUNCH_INFRASTRUCTURE_PHASES.MOTORCADE) {
        if (sitePhaseStartRef.current === null) sitePhaseStartRef.current = Date.now()
        const elapsed = Date.now() - sitePhaseStartRef.current
        const norm = Math.min(1, elapsed / MOTORCADE_TO_SITE_MS)
        const pathPos = getPathPoint(motorcadePathToSite, norm)
        limo.position.copy(pathPos)
        const back = getPathPoint(motorcadePathToSite, Math.max(0, norm - 0.03))
        const dir = new THREE.Vector3().subVectors(pathPos, back).normalize()
        const yaw = Math.atan2(dir.x, dir.z)
        limo.rotation.y = yaw
        escort1.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
        escort2.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
        escort1.rotation.y = yaw
        escort2.rotation.y = yaw
        setMotorcadeExtras(motorcadePathToSite, norm, yaw)
        const camPos = pathPos.clone().add(dir.clone().multiplyScalar(-4)).add(new THREE.Vector3(0, 2, 0))
        camera.position.lerp(camPos, 0.12)
        controls.target.lerp(pathPos, 0.15)
        controls.enabled = false
        if (norm >= 1) {
          sitePhaseStartRef.current = null
          if (vrPhase === VISIT_REGION_PHASES.MOTORCADE) onVisitRegionPhaseCompleteRef.current?.()
          else onLaunchInfrastructurePhaseCompleteRef.current?.()
        }
      } else if (vrPhase === VISIT_REGION_PHASES.RETURN || liPhase === LAUNCH_INFRASTRUCTURE_PHASES.RETURN) {
        if (sitePhaseStartRef.current === null) sitePhaseStartRef.current = Date.now()
        const elapsed = Date.now() - sitePhaseStartRef.current
        const motorcadeDuration = MOTORCADE_TO_SITE_MS
        const totalDuration = motorcadeDuration + WALK_DURATION_MS
        if (elapsed < motorcadeDuration) {
          const norm = elapsed / motorcadeDuration
          const pathPos = getPathPoint(motorcadePathFromSite, norm)
          limo.position.copy(pathPos)
          const back = getPathPoint(motorcadePathFromSite, Math.max(0, norm - 0.03))
          const dir = new THREE.Vector3().subVectors(pathPos, back).normalize()
          const yaw = Math.atan2(dir.x, dir.z)
          limo.rotation.y = yaw
          escort1.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
          escort2.position.copy(pathPos).add(dir.clone().multiplyScalar(-1.5)).add(new THREE.Vector3(-1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiplyScalar(0.8))
          escort1.rotation.y = yaw
          escort2.rotation.y = yaw
          setMotorcadeExtras(motorcadePathFromSite, norm, yaw)
          const camPos = pathPos.clone().add(dir.clone().multiplyScalar(-4)).add(new THREE.Vector3(0, 2, 0))
          camera.position.lerp(camPos, 0.12)
          controls.target.lerp(pathPos, 0.15)
          controls.enabled = false
        } else {
          const walkElapsed = elapsed - motorcadeDuration
          const walkNorm = Math.min(1, walkElapsed / WALK_DURATION_MS)
          const outside = new THREE.Vector3(0, 1.6, -6.5)
          const door = new THREE.Vector3(OFFICE_DOOR.x, OFFICE_DOOR.y, OFFICE_DOOR.z)
          const eye = new THREE.Vector3(OFFICE_EYE.x, OFFICE_EYE.y, OFFICE_EYE.z)
          limo.position.set(DRIVEWAY.x, 0.22, DRIVEWAY.z)
          escort1.position.set(DRIVEWAY.x - 1.2, 0.22, DRIVEWAY.z - 0.5)
          escort2.position.set(DRIVEWAY.x + 1.2, 0.22, DRIVEWAY.z - 0.5)
          leadCar.position.set(DRIVEWAY.x, 0.2, DRIVEWAY.z + 1.5)
          bike1.position.set(DRIVEWAY.x - 0.6, 0.18, DRIVEWAY.z - 1.2)
          bike2.position.set(DRIVEWAY.x + 0.6, 0.18, DRIVEWAY.z - 1.2)
          if (walkNorm < 0.5) {
            const local = walkNorm * 2
            camera.position.lerpVectors(outside, door, local)
            controls.target.lerp(new THREE.Vector3(0, 1, -8), new THREE.Vector3(0, 1.2, -2), local)
          } else {
            const local = (walkNorm - 0.5) * 2
            camera.position.lerpVectors(door, eye, local)
            controls.target.lerp(new THREE.Vector3(OFFICE_LOOK.x, OFFICE_LOOK.y, OFFICE_LOOK.z), local)
          }
          controls.enabled = false
          if (walkNorm >= 1) {
            sitePhaseStartRef.current = null
            officeCameraSettledRef.current = false
            if (vrPhase === VISIT_REGION_PHASES.RETURN) onVisitRegionPhaseCompleteRef.current?.()
            else onLaunchInfrastructurePhaseCompleteRef.current?.()
          }
        }
      } else if (!inBriefingRoom && !inPodiumRoom && !inForeignPalaceMeeting && !inResidenceView && !inBudgetDayChamber && !inPlaneView) {
        if (vm === 'office') {
          mapCameraInitializedRef.current = false
          controls.enabled = true
          controls.minDistance = 1.2
          controls.maxDistance = 10
          if (!phase && !svPhase && !vrPhase && !liPhase) {
            officeGroup.visible = true
          }
          if (!phase && !officeCameraSettledRef.current) {
            camera.position.copy(new THREE.Vector3(OFFICE_EYE.x, OFFICE_EYE.y, OFFICE_EYE.z))
            controls.target.copy(new THREE.Vector3(OFFICE_LOOK.x, OFFICE_LOOK.y, OFFICE_LOOK.z))
            officeCameraSettledRef.current = true
          }
        } else {
          officeCameraSettledRef.current = false
          controls.minDistance = 2
          controls.maxDistance = 50
          controls.enabled = true
          if (vm === 'map' && !mapCameraInitializedRef.current) {
            camera.position.set(12, 9, 12)
            controls.target.set(0, 0, -3)
            mapCameraInitializedRef.current = true
          }
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
      renderer.domElement.removeEventListener('click', onCanvasClick)
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
  const coup = state?.politics?.coupRisk
  const coupPct = typeof coup === 'number' ? Math.round(coup * 100) : '—'
  const date = state?.time ? formatGameDate(state.time) : '—'
  const events = state?.events ?? []
  const lastEvent = events.length ? events[events.length - 1] : null
  const recentEventsForTv = [...events].reverse().slice(0, 4)
  const showOfficeTv = viewMode === 'office' && !activityPhase
  function shortDate(at) {
    if (!at) return ''
    const name = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][(at.month ?? 1) - 1]
    return name ? `${name} ${at.day ?? 1}` : `${at.month}/${at.year}`
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 380, background: '#0f1419', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 380 }} />
      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
        <span style={{ color: '#8b98a5', fontSize: 12 }} title="Republic of Valdris — current game date">Republic of Valdris — {date}</span>
        <span style={{ color: '#8b98a5', fontSize: 12 }}>Approval: {approvalPct}% · Coup: {coupPct}%</span>
      </div>
      {viewMode === 'office' && (stateVisitPhase === STATE_VISIT_PHASES.MOTORCADE_TO_AIRPORT || stateVisitPhase === STATE_VISIT_PHASES.RETURN_TO_OFFICE) && (
        <div style={{ position: 'absolute', top: 44, left: 10, right: 10, textAlign: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: 11, color: '#8b98a5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {stateVisitPhase === STATE_VISIT_PHASES.MOTORCADE_TO_AIRPORT ? 'Motorcade to airport' : 'Returning to palace'}
          </span>
        </div>
      )}
      {viewMode === 'office' && (visitRegionPhase === VISIT_REGION_PHASES.MOTORCADE || visitRegionPhase === VISIT_REGION_PHASES.RETURN || launchInfrastructurePhase === LAUNCH_INFRASTRUCTURE_PHASES.MOTORCADE || launchInfrastructurePhase === LAUNCH_INFRASTRUCTURE_PHASES.RETURN) && (
        <div style={{ position: 'absolute', top: 44, left: 10, right: 10, textAlign: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: 11, color: '#8b98a5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {visitRegionPhase === VISIT_REGION_PHASES.MOTORCADE || launchInfrastructurePhase === LAUNCH_INFRASTRUCTURE_PHASES.MOTORCADE ? 'Motorcade to site' : 'Returning to palace'}
          </span>
        </div>
      )}
      {viewMode === 'map' && (
        <div style={{ position: 'absolute', bottom: 36, left: 10, right: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px', pointerEvents: 'none', zIndex: 5 }}>
          {date && <span style={{ fontSize: 11, color: '#8b98a5', marginRight: 8 }}>{date}</span>}
          {state?.regions && REGION_IDS.map((id) => {
            const pct = state.regions[id]
            const v = typeof pct === 'number' ? Math.round(pct * 100) : '—'
            const color = typeof v === 'number' ? (v >= 50 ? '#00ba7c' : v >= 35 ? '#f7931a' : '#f4212e') : '#8b98a5'
            return <span key={id} style={{ fontSize: 11, color: '#e7e9ea' }}><span style={{ color: '#8b98a5' }}>{id}:</span> <span style={{ color, fontWeight: 600 }}>{typeof v === 'number' ? `${v}%` : v}</span></span>
          })}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: '#8b98a5', fontSize: 12 }}>
          {viewMode === 'office' ? "You're at the desk — Drag to look around · Click tablet for diary, calendar, calls · Space: pause" : viewMode === 'map' ? 'Drag to orbit · Scroll to zoom · Space: pause' : viewMode === 'residence' ? 'Residence wing — Private quarters' : 'Orbit the capital'}
        </span>
        {viewMode === 'map' && onResetView && (
          <button
            type="button"
            onClick={onResetView}
            style={{ pointerEvents: 'auto', padding: '4px 10px', fontSize: 11, background: '#2f3336', border: '1px solid #536471', borderRadius: 6, color: '#e7e9ea', cursor: 'pointer', fontWeight: 600 }}
            title="Reset camera to default map view"
          >
            Reset view
          </button>
        )}
      </div>
    </div>
  )
})

const WorldView = forwardRef(function WorldView(props, ref) {
  return <WorldViewInner {...props} ref={ref} />
})
export default WorldView
