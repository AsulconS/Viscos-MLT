let scene, camera, renderer, cube, cubeRot;


function radians(angle) {
    return angle / 180.0 * Math.PI;
}


function setup() {
    const canvas = document.querySelector('#c');

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.x = 4;
    camera.position.y = 2;
    camera.position.z = 4;

    scene = new THREE.Scene();

    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        wireframe: true
    });
    cube = new THREE.Mesh(geometry, material);
    cubeRot = new THREE.Vector3();
    scene.add(cube);

    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 10;

    const gui = new dat.GUI();
    const cubeFolder = gui.addFolder('Cube');
    cubeFolder.add(cubeRot, 'x', 0, 90, 1);
    cubeFolder.add(cubeRot, 'y', 0, 90, 1);
    cubeFolder.add(cubeRot, 'z', 0, 90, 1);
    cubeFolder.open();
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(camera.position, 'z', controls.minDistance, controls.maxDistance).listen();
    cameraFolder.open();
}


function render() {
    cube.rotation.x = radians(cubeRot.x);
    cube.rotation.y = radians(cubeRot.y);
    cube.rotation.z = radians(cubeRot.z);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


setup();
window.addEventListener('resize', onWindowResize, false);
requestAnimationFrame(render);
