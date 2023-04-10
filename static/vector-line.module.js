import { MeshBasicMaterial, TubeGeometry, ConeGeometry, LineCurve3, Mesh, Group, Vector3 } from 'three';
export { Trace, LineMesh, ArrowMesh, BasisGizmo, AxesBasisGizmo };

class Trace {
    constructor(start=new Vector3(0, 0, 0), end=new Vector3(0, 0, 0)) {
        this.start = start;
        this.end = end;
    }

    get getStart() {
        return this.start;
    }

    get getEnd() {
        return this.end;
    }

    set setStart(start) {
        this.start = start;
    }

    set setEnd(end) {
        this.end = end;
    }
}

class LineMesh {
    constructor(trace, thickness=1, roundness=8, hexColor=0xff0000, opacity=1.0) {
        this.trace = trace;
        this.thickness = thickness;
        this.roundness = roundness;
        this.hexColor = hexColor;
        this.material = new MeshBasicMaterial({ color: this.hexColor, opacity: opacity, transparent: true });
        this.lineGeometry = new TubeGeometry(new LineCurve3(new Vector3(0, 0, 0), this.trace.end), 1, this.thickness * 0.01, this.roundness, false);
        this.lineInnerMesh = new Mesh(this.lineGeometry, this.material);
        this.group = new Group();
        this.group.add(this.lineInnerMesh);
        this.group.position.set(this.trace.start.x, this.trace.start.y, this.trace.start.z);

        this.lastTrace = new Trace(new Vector3(this.trace.start.x, this.trace.start.y, this.trace.start.z), new Vector3(this.trace.end.x, this.trace.end.y, this.trace.end.z));
    }

    get getGroup() {
        return this.group;
    }

    set setGroup(group) {
        this.group = group;
    }
}

class ArrowMesh extends LineMesh {
    constructor(trace, thickness=1, headRadius=1, headHeight=1, roundness=8, hexColor=0xff0000, opacity=1.0) {
        super(trace, thickness, roundness, hexColor, opacity);

        this.headHeight = headHeight;
        this.headRadius = headRadius
        this.headMaterial = new MeshBasicMaterial({ color: this.hexColor, opacity: 1.0, transparent: false });
        this.headGeometry = new ConeGeometry(0.1 * this.headRadius, 0.1 * this.headHeight, this.roundness, 1);
        this.headInnerMesh = new Mesh(this.headGeometry, this.headMaterial);

        const x = this.trace.end.x;
        const y = this.trace.end.y;
        const z = this.trace.end.z;
        const headPos = new Vector3(x, y, z);
        headPos.normalize();
        headPos.multiplyScalar(this.trace.end.length() + 0.05 * this.headHeight);
        this.headInnerMesh.position.set(headPos.x, headPos.y, headPos.z);
        this.headInnerMesh.rotation.y = Math.atan2(x, z) - 0.5 * Math.PI;
        this.headInnerMesh.rotation.z = Math.atan2(y, Math.sqrt(x * x + z * z)) - 0.5 * Math.PI;
        this.group.add(this.headInnerMesh);
    }

    updateLocation() {
        if ((this.trace.start.x == this.lastTrace.start.x) &&
            (this.trace.start.y == this.lastTrace.start.y) &&
            (this.trace.start.z == this.lastTrace.start.z) &&
            (this.trace.end.x == this.lastTrace.end.x) &&
            (this.trace.end.y == this.lastTrace.end.y) &&
            (this.trace.end.z == this.lastTrace.end.z))
        {
            return;
        }

        this.lineGeometry = new TubeGeometry(new LineCurve3(new Vector3(0, 0, 0), this.trace.end), 1, this.thickness * 0.01, this.roundness, false);
        this.lineInnerMesh.geometry = this.lineGeometry;
        this.group.position.set(this.trace.start.x, this.trace.start.y, this.trace.start.z);

        const x = this.trace.end.x;
        const y = this.trace.end.y;
        const z = this.trace.end.z;
        const headPos = new Vector3(x, y, z);
        headPos.normalize();
        headPos.multiplyScalar(this.trace.end.length() + 0.05 * this.headHeight);
        this.headInnerMesh.position.set(headPos.x, headPos.y, headPos.z);
        this.headInnerMesh.rotation.y = Math.atan2(x, z) - 0.5 * Math.PI;
        this.headInnerMesh.rotation.z = Math.atan2(y, Math.sqrt(x * x + z * z)) - 0.5 * Math.PI;

        this.lastTrace = new Trace(new Vector3(this.trace.start.x, this.trace.start.y, this.trace.start.z), new Vector3(this.trace.end.x, this.trace.end.y, this.trace.end.z));
    }

    get getTrace() {
        return this.trace;
    }

    set setTrace(trace) {
        this.trace = trace;
    }
}

class BasisGizmo {
    constructor(origin, xUnit, yUnit, zUnit, xHexColor=0xff0000, yHexColor=0x00ff00, zHexColor=0x0000ff, opacity=1.0, thickness=2, headRadius=1, headHeight=2) {
        const xAxisArrow = new ArrowMesh(new Trace(origin, xUnit), thickness, headRadius, headHeight, 8, xHexColor, opacity);
        const yAxisArrow = new ArrowMesh(new Trace(origin, yUnit), thickness, headRadius, headHeight, 8, yHexColor, opacity);
        const zAxisArrow = new ArrowMesh(new Trace(origin, zUnit), thickness, headRadius, headHeight, 8, zHexColor, opacity);

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
