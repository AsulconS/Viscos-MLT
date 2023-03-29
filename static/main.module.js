import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui';
import Stats from 'three/addons/libs/stats.module';

import { BasisGizmo, AxesBasisGizmo } from '/static/vector-line.module.js';


let scene, camera, renderer, kart, kartPos, kartRot, localBasis;


function radians(angle) {
    return angle / 180.0 * Math.PI;
}


function unreal_lhspos_to_rhspos(position) {
    position.set(position.x, position.z, position.y);
}


function unreal_lhsrot_to_rhsrot(rotation) {
    rotation.set(rotation.x, -rotation.z, rotation.y);
}


function unreal_lhssca_to_rhssca(scale) {
    scale.set(scale.x, scale.z, scale.y);
}


function unreal_lhs_to_rhs(object) {
    // Transform Position
    unreal_lhspos_to_rhspos(object.position);
    // Transform Rotation
    unreal_lhsrot_to_rhsrot(object.rotation);
    // Transform Scale
    unreal_lhssca_to_rhssca(object.scale);
}


function setup() {
    // Canvas Reference
    const canvas = document.querySelector('#c');

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Camera Setup
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.x = 4;
    camera.position.y = 3;
    camera.position.z = 4;
    
    // Scene Creation
    scene = new THREE.Scene();

    // Ambient Light Setup
    const hlight = new THREE.AmbientLight(0xf0f0f0, 1);
    scene.add(hlight);

    // World Grid Visualizer
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Axes Helper
    const axesBasis = new AxesBasisGizmo();
    scene.add(axesBasis.group);

    // Local Axes Helper
    const origin = new THREE.Vector3(0.0, 0.0, 0.0);
    const xUnit = new THREE.Vector3(1.0, 0.0, 0.0);
    const yUnit = new THREE.Vector3(0.0, 0.0, 1.0);
    const zUnit = new THREE.Vector3(0.0, 1.0, 0.0);
    localBasis = new BasisGizmo(origin, xUnit, yUnit, zUnit, 0xffaa00, 0xaaff00, 0x00aaff, 4, 1, 4);
    scene.add(localBasis.group);

    // Mesh Loading
    const loader = new GLTFLoader();
    loader.load(
        // resource URL
        'static/models/kart/glb/Kart.glb',
        // called when the resource is loaded
        (gltf) => {
            kart = gltf;
            //gltf.animations; // Array<THREE.AnimationClip>
            //gltf.scene; // THREE.Group
            //gltf.scenes; // Array<THREE.Group>
            //gltf.cameras; // Array<THREE.Camera>
            //gltf.asset; // Object
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    let m = child;
                    m.receiveShadow = true;
                    m.castShadow = true;
                }
                if (child.isLight) {
                    let l = child;
                    l.castShadow = true;
                    l.shadow.bias = -0.003;
                    l.shadow.mapSize.width = 2048;
                    l.shadow.mapSize.height = 2048;
                }
            });
            gltf.scene.scale.set(0.5, 0.5, 0.5);
            scene.add(gltf.scene);
        },
        // called while loading is progressing
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        (error) => {
            console.log(error);
        }
    )

    // Kart Rotation Folder GUI
    kartPos = new THREE.Vector3(2, 2, 2);
    kartRot = new THREE.Vector3(35, 30, 335);
    const gui = new GUI();
    const positionFolder = gui.addFolder('Position');
    positionFolder.add(kartPos, 'x', -5, 5, 1);
    positionFolder.add(kartPos, 'y', -5, 5, 1);
    positionFolder.add(kartPos, 'z', -5, 5, 1);
    positionFolder.open();

    const rotationFolder = gui.addFolder('Rotation');
    rotationFolder.add(kartRot, 'x', 0, 360, 1);
    rotationFolder.add(kartRot, 'y', 0, 360, 1);
    rotationFolder.add(kartRot, 'z', 0, 360, 1);
    rotationFolder.open();

    // Controls
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 10;
}


function render() {
    if (kart) {
        kart.scene.position.set(kartPos.x, kartPos.y, kartPos.z);
        kart.scene.rotation.set(radians(kartRot.x), radians(kartRot.y), radians(kartRot.z));
        unreal_lhs_to_rhs(kart.scene);
    }
    if (localBasis) {
        localBasis.group.position.set(kartPos.x, kartPos.y, kartPos.z);
        localBasis.group.rotation.set(radians(kartRot.x), radians(kartRot.y), radians(kartRot.z));
        unreal_lhs_to_rhs(localBasis.group);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);

    stats.update();
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}


const stats = Stats();
document.body.appendChild(stats.dom);
setup();
window.addEventListener('resize', onWindowResize, false);
requestAnimationFrame(render);
