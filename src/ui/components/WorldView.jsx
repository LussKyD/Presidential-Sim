import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const PALACE = { x: 0, z: 0 }
const PARLIAMENT = { x: -4, z: 2 }
const OFFICE_CAM = { x: 0, y: 1.4, z: 0.8 }
const OFFICE_LOOK = { x: 0, y: 1.2, z: -1.5 }
const MOTORCADE_DURATION_MS = 4500

/** 3D world: Office interior + capital city. Office = president at desk; Map = orbit over State House & city. Motorcade drives Palace → Parliament. */
export default function WorldView({ state, viewMode = 'office', motorcadeActive, onMotorcadeComplete }) {
  const containerRef = useRef(null)
  const motorcadeStartRef = useRef(null)
  const onCompleteRef = useRef(onMotorcadeComplete)
  const viewModeRef = useRef(viewMode)
  const motorcadeActiveRef = useRef(motorcadeActive)
  onCompleteRef.current = onMotorcadeComplete
  viewModeRef.current = viewMode
  motorcadeActiveRef.current = motorcadeActive

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let renderer, scene, camera, controls, frameId
    const BUILDINGS = [
      { name: 'Palace', x: 0, z: -8, w: 4, h: 2, d: 3, color: 0x8b4513 },
      { name: 'Parliament', x: -8, z: 4, w: 4.5, h: 1.6, d: 3, color: 0x2f4f4f },
      { name: 'Media HQ', x: 6, z: -3, w: 2.5, h: 1.4, d: 2, color: 0x4a5568 },
      { name: 'Military HQ', x: -6, z: -5, w: 3, h: 1.5, d: 2.4, color: 0x36454f },
      { name: 'Central Bank', x: 5, z: 5, w: 2, h: 1.8, d: 2, color: 0x5d4e37 },
    ]

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f1419)
    scene.fog = new THREE.Fog(0x0f1419, 8, 22)

    camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(OFFICE_CAM.x, OFFICE_CAM.y, OFFICE_CAM.z)
    camera.lookAt(OFFICE_LOOK.x, OFFICE_LOOK.y, OFFICE_LOOK.z)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const clock = new THREE.Clock()

    scene.add(new THREE.AmbientLight(0x404060, 0.8))
    const sun = new THREE.DirectionalLight(0xffeedd, 0.9)
    sun.position.set(10, 20, 10)
    scene.add(sun)

    const groundGeo = new THREE.PlaneGeometry(40, 40)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x14171a })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    // Office interior: floor, walls, desk, tablet, couches, visitor chair, TV.
    const officeGroup = new THREE.Group()
    const officeFloorGeo = new THREE.PlaneGeometry(6, 6)
    const officeFloorMat = new THREE.MeshStandardMaterial({ color: 0x1e2127 })
    const officeFloor = new THREE.Mesh(officeFloorGeo, officeFloorMat)
    officeFloor.rotation.x = -Math.PI / 2
    officeFloor.position.set(0, 0.01, 0)
    officeGroup.add(officeFloor)

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x252a33 })
    const wallGeo = new THREE.PlaneGeometry(6, 2.4)
    const backWall = new THREE.Mesh(wallGeo, wallMat)
    backWall.position.set(0, 1.2, -3)
    officeGroup.add(backWall)
    const frontWall = new THREE.Mesh(wallGeo, wallMat)
    frontWall.rotation.y = Math.PI
    frontWall.position.set(0, 1.2, 3)
    officeGroup.add(frontWall)
    const sideWallGeo = new THREE.PlaneGeometry(6, 2.4)
    const leftWall = new THREE.Mesh(sideWallGeo, wallMat)
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.set(-3, 1.2, 0)
    officeGroup.add(leftWall)
    const rightWall = new THREE.Mesh(sideWallGeo, wallMat)
    rightWall.rotation.y = -Math.PI / 2
    rightWall.position.set(3, 1.2, 0)
    officeGroup.add(rightWall)

    // Desk
    const deskGeo = new THREE.BoxGeometry(2.4, 0.8, 1)
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
    const desk = new THREE.Mesh(deskGeo, deskMat)
    desk.position.set(0, 0.4, -1.4)
    officeGroup.add(desk)

    // President chair
    const chairSeatGeo = new THREE.BoxGeometry(0.6, 0.2, 0.6)
    const chairBackGeo = new THREE.BoxGeometry(0.6, 0.7, 0.15)
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
    const chairSeat = new THREE.Mesh(chairSeatGeo, chairMat)
    chairSeat.position.set(0, 0.4, 0.1)
    const chairBack = new THREE.Mesh(chairBackGeo, chairMat)
    chairBack.position.set(0, 0.85, -0.15)
    officeGroup.add(chairSeat)
    officeGroup.add(chairBack)

    // Visitor chair in front of desk
    const visitorSeat = new THREE.Mesh(chairSeatGeo, chairMat)
    visitorSeat.scale.set(0.8, 1, 0.8)
    visitorSeat.position.set(0, 0.35, -2.5)
    officeGroup.add(visitorSeat)

    // Couches (oval-office style)
    const couchGeo = new THREE.BoxGeometry(1.6, 0.5, 0.6)
    const couchMat = new THREE.MeshStandardMaterial({ color: 0x3c434d })
    const couch1 = new THREE.Mesh(couchGeo, couchMat)
    couch1.position.set(-1.4, 0.25, 0.4)
    couch1.rotation.y = Math.PI / 12
    officeGroup.add(couch1)
    const couch2 = new THREE.Mesh(couchGeo, couchMat)
    couch2.position.set(1.4, 0.25, 0.4)
    couch2.rotation.y = -Math.PI / 12
    officeGroup.add(couch2)

    // Tablet on desk
    const tabletGeo = new THREE.BoxGeometry(0.7, 0.03, 0.45)
    const tabletMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x1d9bf0, emissiveIntensity: 0.2 })
    const tablet = new THREE.Mesh(tabletGeo, tabletMat)
    tablet.position.set(0.4, 0.81, -1.1)
    tablet.rotation.x = -Math.PI / 12
    officeGroup.add(tablet)

    // TV on wall
    const tvGeo = new THREE.BoxGeometry(1.6, 0.9, 0.05)
    const tvMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x111827, emissiveIntensity: 0.5 })
    const tv = new THREE.Mesh(tvGeo, tvMat)
    tv.position.set(0, 1.5, 2.6)
    officeGroup.add(tv)

    scene.add(officeGroup)

    BUILDINGS.forEach((b) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d)
      const mat = new THREE.MeshStandardMaterial({ color: b.color })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(b.x, b.h / 2, b.z)
      mesh.userData.name = b.name
      scene.add(mesh)
    })

    // Simple roads from Palace to Parliament.
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
    const road1Geo = new THREE.BoxGeometry(3, 0.04, 1.2)
    const road1 = new THREE.Mesh(road1Geo, roadMat)
    road1.position.set(PALACE.x - 1.5, 0.02, PALACE.z + 1.8)
    scene.add(road1)
    const road2Geo = new THREE.BoxGeometry(8, 0.04, 1.2)
    const road2 = new THREE.Mesh(road2Geo, roadMat)
    road2.position.set(-4.5, 0.02, 2)
    scene.add(road2)

    // Motorcade vehicles (simple boxes).
    const carGeo = new THREE.BoxGeometry(0.8, 0.4, 1.6)
    const limoMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.4 })
    const escortMat = new THREE.MeshStandardMaterial({ color: 0x1f2933, metalness: 0.2, roughness: 0.6 })
    const limo = new THREE.Mesh(carGeo, limoMat)
    const escort1 = new THREE.Mesh(carGeo, escortMat)
    const escort2 = new THREE.Mesh(carGeo, escortMat)
    limo.visible = false
    escort1.visible = false
    escort2.visible = false
    scene.add(limo)
    scene.add(escort1)
    scene.add(escort2)

    const motorcadePath = [
      new THREE.Vector3(PALACE.x, 0.12, PALACE.z + 1.4),
      new THREE.Vector3(-1.5, 0.12, 1.9),
      new THREE.Vector3(-4.5, 0.12, 2),
      new THREE.Vector3(PARLIAMENT.x - 1.2, 0.12, PARLIAMENT.z + 0.6),
    ]

    function getPathPoint(tNorm) {
      const segs = motorcadePath.length - 1
      if (segs <= 0) return motorcadePath[0].clone()
      const scaled = tNorm * segs
      const idx = Math.min(segs - 1, Math.max(0, Math.floor(scaled)))
      const localT = THREE.MathUtils.clamp(scaled - idx, 0, 1)
      const from = motorcadePath[idx]
      const to = motorcadePath[idx + 1]
      const result = new THREE.Vector3()
      result.lerpVectors(from, to, localT)
      return result
    }

    // Simple roaming NPCs as chess-piece-like cylinders.
    const npcGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8)
    const guardMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    const staffMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af })
    const npcs = []

    function addNpc(x, z, type, phaseOffset = 0) {
      const mat = type === 'guard' ? guardMat : staffMat
      const mesh = new THREE.Mesh(npcGeo, mat)
      mesh.position.set(x, 0.3, z)
      scene.add(mesh)
      npcs.push({ mesh, type, baseX: x, baseZ: z, phaseOffset })
    }

    // Secret service outside State House.
    addNpc(PALACE.x + 1.5, PALACE.z - 7, 'guard', 0)
    addNpc(PALACE.x - 1.5, PALACE.z - 7, 'guard', Math.PI)
    // Staff walking in State House courtyard.
    addNpc(1.2, -5.5, 'staff', Math.PI / 2)
    addNpc(-1, -6, 'staff', Math.PI * 1.3)

    function updateNpcs(t) {
      npcs.forEach((n) => {
        const speed = n.type === 'guard' ? 0.35 : 0.25
        const radius = n.type === 'guard' ? 0.7 : 0.9
        const dx = Math.sin(t * speed + n.phaseOffset) * radius
        const dz = Math.cos(t * speed + n.phaseOffset) * radius
        n.mesh.position.x = n.baseX + dx
        n.mesh.position.z = n.baseZ + dz
      })
    }

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 6
    controls.maxDistance = 26
    controls.enablePan = true

    function animate() {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const mot = motorcadeActiveRef.current
      const vm = viewModeRef.current

      // NPCs roam continuously.
      updateNpcs(t)

      if (mot && motorcadeStartRef.current !== null) {
        // Motorcade: drive along road with camera following the limo.
        const elapsed = Date.now() - motorcadeStartRef.current
        const raw = elapsed / MOTORCADE_DURATION_MS
        const norm = Math.min(1, Math.max(0, raw))
        const pathPos = getPathPoint(norm)

        limo.visible = true
        escort1.visible = true
        escort2.visible = true

        limo.position.copy(pathPos)
        const backPos = getPathPoint(Math.max(0, norm - 0.04))
        const dir = new THREE.Vector3().subVectors(pathPos, backPos).normalize()
        const yaw = Math.atan2(dir.x, dir.z)
        limo.rotation.y = yaw

        // Escorts behind and to the side.
        const offsetSide = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
        const backOffset = dir.clone().multiplyScalar(-1.2)
        escort1.position.copy(pathPos).add(backOffset).add(offsetSide.clone().multiplyScalar(0.6))
        escort2.position.copy(pathPos).add(backOffset).add(offsetSide.clone().multiplyScalar(-0.6))
        escort1.rotation.y = yaw
        escort2.rotation.y = yaw

        // Camera follow from behind and slightly above the limo.
        const camOffset = dir.clone().multiplyScalar(-4).add(new THREE.Vector3(0, 2.2, 0))
        const camTarget = pathPos.clone()
        const desiredCamPos = pathPos.clone().add(camOffset)
        camera.position.lerp(desiredCamPos, 0.15)
        controls.target.lerp(camTarget, 0.2)

        if (norm >= 1) {
          motorcadeStartRef.current = null
          onCompleteRef.current?.()
        }
      } else {
        // No motorcade: either seated in office or orbiting the map.
        limo.visible = false
        escort1.visible = false
        escort2.visible = false

        if (vm === 'office') {
          controls.enabled = false
          const officePos = new THREE.Vector3(OFFICE_CAM.x, OFFICE_CAM.y, OFFICE_CAM.z)
          const officeLook = new THREE.Vector3(OFFICE_LOOK.x, OFFICE_LOOK.y, OFFICE_LOOK.z)
          camera.position.lerp(officePos, 0.1)
          controls.target.lerp(officeLook, 0.1)
        } else {
          controls.enabled = true
          const mapPos = new THREE.Vector3(10, 8, 10)
          const mapLook = new THREE.Vector3(0, 0, 0)
          camera.position.lerp(mapPos, 0.05)
          controls.target.lerp(mapLook, 0.05)
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
    if (motorcadeActive) motorcadeStartRef.current = Date.now()
  }, [motorcadeActive])

  const approval = state?.population?.publicApproval
  const approvalPct = typeof approval === 'number' ? Math.round(approval * 100) : '—'
  const date = state?.time ? `${state.time.month}/${state.time.year}` : '—'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 380, background: '#0f1419', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 380 }} />
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <span style={{ color: '#8b98a5', fontSize: 12 }}>Republic of Valdris — {date}</span>
        <span style={{ color: '#8b98a5', fontSize: 12 }}>Approval: {approvalPct}%</span>
      </div>
      <div style={{ position: 'absolute', bottom: 10, left: 10, color: '#6e767d', fontSize: 11 }}>
        {viewMode === 'office'
          ? "In the President's Office · Dashboard on tablet · TV shows the headlines"
          : 'Orbit the capital · Roads, motorcade, and key institutions'}
      </div>
    </div>
  )
}
