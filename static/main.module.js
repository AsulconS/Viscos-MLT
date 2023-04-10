import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui';
import Stats from 'three/addons/libs/stats.module';

import { BasisGizmo, AxesBasisGizmo, ArrowMesh, Trace } from '/static/vector-line.module.js';


let scene, camera, renderer, kart, kartPos, kartRot, localBasis;
let controls, cameraOffset, lastKartPos, lastKartRot, baseHelper, vectorIndex;

let sceneVectors;


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


function readSingleFile(e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        displayContents(contents);
    };
    reader.readAsText(file);
}


function displayContents(contents) {
    console.log(contents);
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
    cameraOffset = new THREE.Vector3(0, 0, 0);
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
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
    localBasis = new BasisGizmo(origin, xUnit, yUnit, zUnit, 0xffaa00, 0xaaff00, 0x00aaff, 0.75, 4, 1, 4);
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
                    m.material.wireframe = true;
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
    kartPos = new THREE.Vector3(1, 1, 1);
    kartRot = new THREE.Vector3(35, 30, 335);
    lastKartPos = new THREE.Vector3(kartPos.x - 1, kartPos.y - 1, kartPos.z - 1);
    lastKartRot = new THREE.Vector3(kartPos.x - 1, kartPos.y - 1, kartPos.z - 1);
    camera.position.set(kartPos.x + cameraOffset.x, kartPos.z + cameraOffset.z, kartPos.y + cameraOffset.y);

    // Local Base Helper
    baseHelper = new THREE.PolarGridHelper(1, 8, 4, 64, 0x0000ff);
    scene.add(baseHelper);

    // Kart Rotation Folder GUI
    const gui = new GUI( { width: 400 } );
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

    const utilsFolder = gui.addFolder('Utils');
    const loadParams = {
        loadFile: () => { 
            document.getElementById('file-input').click();
        }
    };
    utilsFolder.add(loadParams, 'loadFile').name('Load Project File');
    utilsFolder.open();

    vectorIndex = 0;
    sceneVectors = [];
    const equationsFolder = gui.addFolder('Equations');
    const addVectorParams = {
        addVector: () => {
            sceneVectors.push(new ArrowMesh(new Trace(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 1, 1)), 2, 1, 2, 8, 0x0033bb));
            scene.add(sceneVectors[vectorIndex].group);

            const vectorFolder = equationsFolder.addFolder('Vector' + String(vectorIndex));
            vectorFolder.open();

            const vectorOriginFolder = vectorFolder.addFolder('Origin');
            vectorOriginFolder.add(sceneVectors[vectorIndex].trace.start, 'x');
            vectorOriginFolder.add(sceneVectors[vectorIndex].trace.start, 'z').name('y');
            vectorOriginFolder.add(sceneVectors[vectorIndex].trace.start, 'y').name('z');
            vectorOriginFolder.open();

            const vectorComponentsFolder = vectorFolder.addFolder('Components');
            vectorComponentsFolder.add(sceneVectors[vectorIndex].trace.end, 'x');
            vectorComponentsFolder.add(sceneVectors[vectorIndex].trace.end, 'z').name('y');
            vectorComponentsFolder.add(sceneVectors[vectorIndex].trace.end, 'y').name('z');
            vectorComponentsFolder.open();

            vectorIndex += 1;
        }
    };
    equationsFolder.add(addVectorParams, 'addVector').name('Add Vector');
    equationsFolder.open();

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.update();
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
    controls.target.set(kartPos.x, kartPos.z, kartPos.y);
    if ((kartPos.x != lastKartPos.x) || (kartPos.y != lastKartPos.y) || (kartPos.z != lastKartPos.z) ||
        (kartRot.x != lastKartRot.x) || (kartRot.y != lastKartRot.y) || (kartRot.z != lastKartRot.z)) {
        baseHelper.position.set(kartPos.x, kartPos.z, kartPos.y);
        baseHelper.rotation.set(radians(kartRot.x), -radians(kartRot.z), radians(kartRot.y));
        cameraOffset.set(camera.position.x - lastKartPos.x, camera.position.z - lastKartPos.y, camera.position.y - lastKartPos.z);
        camera.position.set(kartPos.x + cameraOffset.x, kartPos.z + cameraOffset.z, kartPos.y + cameraOffset.y);
    }
    controls.update();

    sceneVectors.forEach((vector) => {
        vector.updateLocation();
    });

    renderer.render(scene, camera);
    requestAnimationFrame(render);
    stats.update();
    lastKartPos.set(kartPos.x, kartPos.y, kartPos.z);
    lastKartRot.set(kartRot.x, kartRot.y, kartRot.z);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}


document.getElementById('file-input').addEventListener('change', readSingleFile, false);

const stats = Stats();
document.body.appendChild(stats.dom);
setup();
window.addEventListener('resize', onWindowResize, false);
requestAnimationFrame(render);
