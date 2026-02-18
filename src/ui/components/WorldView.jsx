import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/** Minimal 3D city view — capital with key buildings. Phase 6. */
export default function WorldView({ state }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let renderer, scene, camera, controls, frameId
    const BUILDINGS = [
      { name: 'Palace', x: 0, z: 0, w: 2.5, h: 1.8, d: 2, color: 0x8b4513 },
      { name: 'Parliament', x: -4, z: 2, w: 3, h: 1.2, d: 2.2, color: 0x2f4f4f },
      { name: 'Media HQ', x: 3, z: -2, w: 1.8, h: 1, d: 1.5, color: 0x4a5568 },
      { name: 'Military HQ', x: -3, z: -3, w: 2, h: 1.2, d: 1.8, color: 0x36454f },
      { name: 'Central Bank', x: 2.5, z: 2.5, w: 1.5, h: 1.5, d: 1.5, color: 0x5d4e37 },
    ]

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f1419)
    scene.fog = new THREE.Fog(0x0f1419, 8, 22)

    camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(8, 6, 8)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0x404060, 0.8))
    const sun = new THREE.DirectionalLight(0xffeedd, 0.9)
    sun.position.set(5, 12, 5)
    scene.add(sun)

    const groundGeo = new THREE.PlaneGeometry(20, 20)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1f26 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    const grid = new THREE.GridHelper(20, 20, 0x2f3336, 0x252a30)
    grid.position.y = 0.01
    scene.add(grid)

    BUILDINGS.forEach((b) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d)
      const mat = new THREE.MeshStandardMaterial({ color: b.color })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(b.x, b.h / 2, b.z)
      mesh.userData.name = b.name
      scene.add(mesh)
    })

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 4
    controls.maxDistance = 20

    function animate() {
      frameId = requestAnimationFrame(animate)
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

  const approval = state?.population?.publicApproval
  const approvalPct = typeof approval === 'number' ? Math.round(approval * 100) : '—'
  const date = state?.time ? `${state.time.month}/${state.time.year}` : '—'

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 420, background: '#0f1419', borderRadius: 12, overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: 420 }} />
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
        Drag to rotate · Scroll to zoom · Palace (center), Parliament, Media, Military, Bank
      </div>
    </div>
  )
}
