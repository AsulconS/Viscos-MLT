import { MeshBasicMaterial, TubeGeometry, ConeGeometry, LineCurve3, Mesh, Group, Vector3 } from 'three';
export { Trace, LineMesh, ArrowMesh, BasisGizmo, AxesBasisGizmo };

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
    constructor(trace, thickness=1, headTickness=1, headScale=1, roundness=8, hexColor=0xff0000) {
        super(trace, thickness, roundness, hexColor);
        const traceLength = trace.start.distanceTo(trace.end);
        this.headGeometry = new ConeGeometry(thickness * 0.02 * headTickness, traceLength * 0.05 * headScale, roundness, 1);
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

class BasisGizmo {
    constructor(origin, xUnit, yUnit, zUnit, xHexColor=0xff0000, yHexColor=0x00ff00, zHexColor=0x0000ff, thickness=2, headTickness=2, headScale=2) {
        const xAxisArrow = new ArrowMesh(new Trace(origin, xUnit), thickness, headTickness, headScale, 8, xHexColor);
        const yAxisArrow = new ArrowMesh(new Trace(origin, yUnit), thickness, headTickness, headScale, 8, yHexColor);
        const zAxisArrow = new ArrowMesh(new Trace(origin, zUnit), thickness, headTickness, headScale, 8, zHexColor);

        this.group = new Group();
        this.group.add(xAxisArrow.group);
        this.group.add(yAxisArrow.group);
        this.group.add(zAxisArrow.group);
    }

    get getGroup() {
        return this.group;
    }
}

class AxesBasisGizmo extends BasisGizmo {
    constructor() {
        const origin = new Vector3(0.0, 0.0, 0.0).multiplyScalar(5);
        const xUnit = new Vector3(1.0, 0.0, 0.0).multiplyScalar(5);
        const yUnit = new Vector3(0.0, 0.0, 1.0).multiplyScalar(5);
        const zUnit = new Vector3(0.0, 1.0, 0.0).multiplyScalar(5);
        super(origin, xUnit, yUnit, zUnit);
    }
}
