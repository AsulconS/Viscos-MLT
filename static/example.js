
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'

const scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2
const renderer = new THREE.WebGLRenderer()
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
const controls = new OrbitControls(camera, renderer.domElement)
const loader = new GLTFLoader()
loader.load(
    'models/monkey_textured.glb',
    function (gltf) {
        gltf.scene.traverse(function (child) {
            if (child.isMesh) {
                let m = child
                m.receiveShadow = true
                m.castShadow = true
            }
            if (child.isLight) {
                let l = child
                l.castShadow = true
                l.shadow.bias = -0.003
                l.shadow.mapSize.width = 2048
                l.shadow.mapSize.height = 2048
            }
        })
        progressBar.style.display = 'none'
        scene.add(gltf.scene)
    },
    (xhr) => {
        if (xhr.lengthComputable) {
            var percentComplete = (xhr.loaded / xhr.total) * 100
            progressBar.value = percentComplete
            progressBar.style.display = 'block'
        }
    },
    (error) => {
        console.log(error)
    }
)
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}
const stats = Stats()
document.body.appendChild(stats.dom)
var animate = function () {
    requestAnimationFrame(animate)
    controls.update()
    render()
    stats.update()
}
function render() {
    renderer.render(scene, camera)
}
animate()
