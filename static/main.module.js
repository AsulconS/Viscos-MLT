import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui';
import Stats from 'three/addons/libs/stats.module';

import { Trace, ArrowMesh } from '/static/vector-line.module.js';


let scene, camera, renderer, kart, kartRot;


function radians(angle) {
    return angle / 180.0 * Math.PI;
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

    // World Grid Visualizer
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Axes Helper
    const worldOrigin = new THREE.Vector3(0.0, 0.0, 0.0);
    const xUnitAxis = new THREE.Vector3(1.0, 0.0, 0.0);
    const yUnitAxis = new THREE.Vector3(0.0, 1.0, 0.0);
    const zUnitAxis = new THREE.Vector3(0.0, 0.0, 1.0);

    const xAxisLine = new ArrowMesh(new Trace(worldOrigin, xUnitAxis.multiplyScalar(5)), 2, 2, 8, 0xff0000);
    const yAxisLine = new ArrowMesh(new Trace(worldOrigin, yUnitAxis.multiplyScalar(5)), 2, 2, 8, 0x0000ff);
    const zAxisLine = new ArrowMesh(new Trace(worldOrigin, zUnitAxis.multiplyScalar(5)), 2, 2, 8, 0x00ff00);
    scene.add(xAxisLine.group);
    scene.add(yAxisLine.group);
    scene.add(zAxisLine.group);

    // Ambient Light Setup
    const hlight = new THREE.AmbientLight(0xf0f0f0, 1);
    scene.add(hlight);

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
            gltf.scene.scale.set(1, 1, 1);
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

    let controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 10;
    
    kartRot = new THREE.Vector3();

    const gui = new GUI();
    const transformFolder = gui.addFolder('Mesh');
    transformFolder.add(kartRot, 'x', 0, 90, 1);
    transformFolder.add(kartRot, 'y', 0, 90, 1);
    transformFolder.add(kartRot, 'z', 0, 90, 1);
    transformFolder.open();
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(camera.position, 'z', controls.minDistance, controls.maxDistance).listen();
    cameraFolder.open();
}


function render() {
    if (kart)
    {
        kart.scene.rotation.x = radians(kartRot.x);
        kart.scene.rotation.y = radians(kartRot.y);
        kart.scene.rotation.z = radians(kartRot.z);
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
