import { MeshBasicMaterial, TubeGeometry, ConeGeometry, LineCurve3, Mesh, Group } from 'three';
export { Trace, LineMesh, ArrowMesh };

class Trace {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
}

class LineMesh {
    constructor(trace, thickness=1, roundness=8, hexColor=0xff0000) {
        this.material = new MeshBasicMaterial({ color: hexColor });
        this.lineGeometry = new TubeGeometry(new LineCurve3(trace.start, trace.end), 1, thickness * 0.01, roundness, false);
        this.lineInnerMesh = new Mesh(this.lineGeometry, this.material);
        this.group = new Group();
        this.group.add(this.lineInnerMesh);
    }

    get getGroup() {
        return this.group;
    }
}

class ArrowMesh extends LineMesh {
    constructor(trace, thickness=1, headScale=1, roundness=8, hexColor=0xff0000) {
        super(trace, thickness, roundness, hexColor);
        const traceLength = trace.start.distanceTo(trace.end);
        this.headGeometry = new ConeGeometry(thickness * 0.02 * headScale, traceLength * 0.05 * headScale, roundness, 1);
        this.headInnerMesh = new Mesh(this.headGeometry, this.material);
        const x = trace.end.x;
        const y = trace.end.y;
        const z = trace.end.z;
        this.headInnerMesh.position.set(x, y, z);
        this.headInnerMesh.rotation.y = Math.atan2(x, z) - 0.5 * Math.PI;
        this.headInnerMesh.rotation.z = Math.atan2(y, Math.sqrt(x * x + z * z)) - 0.5 * Math.PI;
        this.group.add(this.headInnerMesh);
    }
}
