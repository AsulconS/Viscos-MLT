let scene, camera, renderer, cube;


function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 4;

    renderer = new THREE.WebGLRenderer( {antialias: true} );
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        wireframe: true
    });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 3;
    controls.maxDistance = 10;

    const gui = new dat.GUI();
    const cubeFolder = gui.addFolder('Cube');
    cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2);
    cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2);
    cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2);
    cubeFolder.open();
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(camera.position, 'z', controls.minDistance, controls.maxDistance).listen();
    cameraFolder.open();
}


function animate() {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


window.addEventListener('resize', onWindowResize, false);


init();
animate();
