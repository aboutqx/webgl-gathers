// Geom.js
import Mesh from './Mesh';
import { gl } from './GlTools'
import { binomial } from 'utils/Math'
const Geom = {};
let meshTri;

Geom.plane = function plane(width, height, numSegments, axis = 'xy', drawType = 4) {
    const positions = [];
    const coords = [];
    const indices = [];
    const normals = [];

    const gapX = width / numSegments;
    const gapY = height / numSegments;
    const gapUV = 1 / numSegments;
    const sx = -width * 0.5;
    const sy = -height * 0.5;
    let index = 0;

    for (let i = 0; i < numSegments; i++) {
        for (let j = 0; j < numSegments; j++) {
            const tx = gapX * i + sx;
            const ty = gapY * j + sy;

            const u = i / numSegments;
            const v = j / numSegments;

            if (axis === 'xz') {
                positions.push([tx, 0, ty + gapY]);
                positions.push([tx + gapX, 0, ty + gapY]);
                positions.push([tx + gapX, 0, ty]);
                positions.push([tx, 0, ty]);

                coords.push([u, 1.0 - (v + gapUV)]);
                coords.push([u + gapUV, 1.0 - (v + gapUV)]);
                coords.push([u + gapUV, 1.0 - v]);
                coords.push([u, 1.0 - v]);

                normals.push([0, 1, 0]);
                normals.push([0, 1, 0]);
                normals.push([0, 1, 0]);
                normals.push([0, 1, 0]);
            } else if (axis === 'yz') {
                positions.push([0, ty, tx]);
                positions.push([0, ty, tx + gapX]);
                positions.push([0, ty + gapY, tx + gapX]);
                positions.push([0, ty + gapY, tx]);

                coords.push([u, v]);
                coords.push([u + gapUV, v]);
                coords.push([u + gapUV, v + gapUV]);
                coords.push([u, v + gapUV]);

                normals.push([1, 0, 0]);
                normals.push([1, 0, 0]);
                normals.push([1, 0, 0]);
                normals.push([1, 0, 0]);
            } else {
                positions.push([tx, ty, 0]);
                positions.push([tx + gapX, ty, 0]);
                positions.push([tx + gapX, ty + gapY, 0]);
                positions.push([tx, ty + gapY, 0]);

                coords.push([u, v]);
                coords.push([u + gapUV, v]);
                coords.push([u + gapUV, v + gapUV]);
                coords.push([u, v + gapUV]);

                normals.push([0, 0, 1]);
                normals.push([0, 0, 1]);
                normals.push([0, 0, 1]);
                normals.push([0, 0, 1]);
            }


            indices.push(index * 4 + 0);
            indices.push(index * 4 + 1);
            indices.push(index * 4 + 2);
            indices.push(index * 4 + 0);
            indices.push(index * 4 + 2);
            indices.push(index * 4 + 3);

            index++;
        }
    }

    const mesh = new Mesh(drawType);
    mesh.bufferVertex(positions);
    mesh.bufferTexCoord(coords);
    mesh.bufferIndex(indices);
    mesh.bufferNormal(normals);
    return mesh;
};

Geom.sphere = function sphere(size, numSegments, isInvert = false, drawType = 4) {
    const positions = [];
    const coords = [];
    const indices = [];
    const normals = [];
    const gapUV = 1 / numSegments;
    let index = 0;


    function getPosition(i, j, isNormal = false) {	//	rx : -90 ~ 90 , ry : 0 ~ 360
        const rx = i / numSegments * Math.PI - Math.PI * 0.5;
        const ry = j / numSegments * Math.PI * 2;
        const r = isNormal ? 1 : size;
        const pos = [];
        pos[1] = Math.sin(rx) * r;
        const t = Math.cos(rx) * r;
        pos[0] = Math.cos(ry) * t;
        pos[2] = Math.sin(ry) * t;

        const precision = 10000;
        pos[0] = Math.floor(pos[0] * precision) / precision;
        pos[1] = Math.floor(pos[1] * precision) / precision;
        pos[2] = Math.floor(pos[2] * precision) / precision;

        return pos;
    };


    for (let i = 0; i < numSegments; i++) {
        for (let j = 0; j < numSegments; j++) {
            positions.push(getPosition(i, j));
            positions.push(getPosition(i + 1, j));
            positions.push(getPosition(i + 1, j + 1));
            positions.push(getPosition(i, j + 1));

            normals.push(getPosition(i, j, true));
            normals.push(getPosition(i + 1, j, true));
            normals.push(getPosition(i + 1, j + 1, true));
            normals.push(getPosition(i, j + 1, true));


            const u = j / numSegments;
            const v = i / numSegments;


            coords.push([1.0 - u, v]);
            coords.push([1.0 - u, v + gapUV]);
            coords.push([1.0 - u - gapUV, v + gapUV]);
            coords.push([1.0 - u - gapUV, v]);

            indices.push(index * 4 + 0);
            indices.push(index * 4 + 1);
            indices.push(index * 4 + 2);
            indices.push(index * 4 + 0);
            indices.push(index * 4 + 2);
            indices.push(index * 4 + 3);

            index++;
        }
    }


    if (isInvert) {
        indices.reverse();
    }

    const mesh = new Mesh(drawType);
    mesh.bufferVertex(positions);
    mesh.bufferTexCoord(coords);
    mesh.bufferIndex(indices);
    mesh.bufferNormal(normals);

    return mesh;
};

Geom.cube = function cube(w, h, d, drawType = 4) {
    h = h || w;
    d = d || w;

    const x = w / 2;
    const y = h / 2;
    const z = d / 2;

    const positions = [];
    const coords = [];
    const indices = [];
    const normals = [];
    let count = 0;


    // BACK
    positions.push([-x, y, -z]);
    positions.push([x, y, -z]);
    positions.push([x, -y, -z]);
    positions.push([-x, -y, -z]);

    normals.push([0, 0, -1]);
    normals.push([0, 0, -1]);
    normals.push([0, 0, -1]);
    normals.push([0, 0, -1]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;

    // RIGHT
    positions.push([x, y, -z]);
    positions.push([x, y, z]);
    positions.push([x, -y, z]);
    positions.push([x, -y, -z]);

    normals.push([1, 0, 0]);
    normals.push([1, 0, 0]);
    normals.push([1, 0, 0]);
    normals.push([1, 0, 0]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;

    // FRONT
    positions.push([x, y, z]);
    positions.push([-x, y, z]);
    positions.push([-x, -y, z]);
    positions.push([x, -y, z]);

    normals.push([0, 0, 1]);
    normals.push([0, 0, 1]);
    normals.push([0, 0, 1]);
    normals.push([0, 0, 1]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;


    // LEFT
    positions.push([-x, y, z]);
    positions.push([-x, y, -z]);
    positions.push([-x, -y, -z]);
    positions.push([-x, -y, z]);

    normals.push([-1, 0, 0]);
    normals.push([-1, 0, 0]);
    normals.push([-1, 0, 0]);
    normals.push([-1, 0, 0]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;

    // TOP
    positions.push([x, y, -z]);
    positions.push([-x, y, -z]);
    positions.push([-x, y, z]);
    positions.push([x, y, z]);

    normals.push([0, 1, 0]);
    normals.push([0, 1, 0]);
    normals.push([0, 1, 0]);
    normals.push([0, 1, 0]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;

    // BOTTOM
    positions.push([x, -y, z]);
    positions.push([-x, -y, z]);
    positions.push([-x, -y, -z]);
    positions.push([x, -y, -z]);

    normals.push([0, -1, 0]);
    normals.push([0, -1, 0]);
    normals.push([0, -1, 0]);
    normals.push([0, -1, 0]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;


    const mesh = new Mesh(drawType);
    mesh.bufferVertex(positions);
    mesh.bufferTexCoord(coords);
    mesh.bufferIndex(indices);
    //mesh.bufferNormal(normals);
    mesh.computeNormals(normals)
    return mesh;
};

Geom.skybox = function skybox(size, drawType = 4) {
    const positions = [];
    const coords = [];
    const indices = [];
    const normals = [];
    let count = 0;

    // BACK
    positions.push([size, size, -size]);
    positions.push([-size, size, -size]);
    positions.push([-size, -size, -size]);
    positions.push([size, -size, -size]);

    normals.push([0, 0, -1]);
    normals.push([0, 0, -1]);
    normals.push([0, 0, -1]);
    normals.push([0, 0, -1]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;

    // RIGHT
    positions.push([size, -size, -size]);
    positions.push([size, -size, size]);
    positions.push([size, size, size]);
    positions.push([size, size, -size]);

    normals.push([1, 0, 0]);
    normals.push([1, 0, 0]);
    normals.push([1, 0, 0]);
    normals.push([1, 0, 0]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;

    // FRONT
    positions.push([-size, size, size]);
    positions.push([size, size, size]);
    positions.push([size, -size, size]);
    positions.push([-size, -size, size]);

    normals.push([0, 0, 1]);
    normals.push([0, 0, 1]);
    normals.push([0, 0, 1]);
    normals.push([0, 0, 1]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;

    // LEFT
    positions.push([-size, -size, size]);
    positions.push([-size, -size, -size]);
    positions.push([-size, size, -size]);
    positions.push([-size, size, size]);

    normals.push([-1, 0, 0]);
    normals.push([-1, 0, 0]);
    normals.push([-1, 0, 0]);
    normals.push([-1, 0, 0]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;

    // TOP
    positions.push([size, size, size]);
    positions.push([-size, size, size]);
    positions.push([-size, size, -size]);
    positions.push([size, size, -size]);

    normals.push([0, 1, 0]);
    normals.push([0, 1, 0]);
    normals.push([0, 1, 0]);
    normals.push([0, 1, 0]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    count++;

    // BOTTOM
    positions.push([size, -size, -size]);
    positions.push([-size, -size, -size]);
    positions.push([-size, -size, size]);
    positions.push([size, -size, size]);

    normals.push([0, -1, 0]);
    normals.push([0, -1, 0]);
    normals.push([0, -1, 0]);
    normals.push([0, -1, 0]);

    coords.push([0, 0]);
    coords.push([1, 0]);
    coords.push([1, 1]);
    coords.push([0, 1]);

    indices.push(count * 4 + 0);
    indices.push(count * 4 + 1);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 0);
    indices.push(count * 4 + 2);
    indices.push(count * 4 + 3);

    const mesh = new Mesh(drawType);
    mesh.bufferVertex(positions);
    mesh.bufferTexCoord(coords);
    mesh.bufferIndex(indices);
    mesh.bufferNormal(normals);

    return mesh;
};

Geom.bigTriangle = function bigTriangle() {

    if (!meshTri) {
        const indices = [2, 1, 0];
        const positions = [
            [-1, -1],
            [-1, 4],
            [4, -1]
        ];

        meshTri = new Mesh();
        meshTri.bufferData(positions, 'position', 2);
        meshTri.bufferIndex(indices);
    }


    return meshTri;
};

Geom.singleLine = function singleLine(positionA, positionB) {
    const positions = [];
    const indices = [0, 1];
    const coords = [[0, 0], [1, 1]];
    positions.push(positionA);
    positions.push(positionB);

    const mesh = new Mesh(gl.LINES);
    mesh.bufferVertex(positions);
    mesh.bufferTexCoord(coords);
    mesh.bufferIndex(indices);

    return mesh;
}

Geom.points = function points(points) {
    const positions = Array.from(arguments);

    const indices = []
    for(let i = 0; i < points.length; i++) {
        indices.push(i)
    }
    const mesh = new Mesh(gl.POINTS);
    mesh.bufferVertex(positions);
    mesh.bufferIndex(indices);
    
    return mesh;
}

// c(u) = E(i=0 - n)B(u)Pi 0<= u <= 1
// 0 < offset < 1, points are at least 2 points
Geom.bezier = (points, offset) => {
    const vertices = []
    
    const n = points.length - 1 // 0-n

    for(let u = 0; u <= 1; u += offset){
        let t = []
        for(let i = 0; i <= n; i++){
            
        
            const Bu = binomial(n, i) * Math.pow(u, i) * Math.pow(1-u, n-i)
            const Pi = points[i]
            if(!t.length) {
                t = [Pi[0]* Bu, Pi[1]* Bu, Pi[2]* Bu]
            }
            else {
                t[0] += Pi[0]* Bu
                t[1] += Pi[1]* Bu
                t[2] += Pi[2]* Bu
            }

            vertices.push(t)
        }
    }
    const indices = []
    for(let i =0; i < vertices.length; i++) {
        indices.push(i)
    }
    const mesh = new Mesh(gl.LINE_STRIP);
    mesh.bufferVertex(vertices);
    mesh.bufferIndex(indices);

    return mesh;

}

//连接线起始点和被连接线的倒数2个点在一条直线上，这样保证tagent一样
Geom.joinBezier = () => {
    
}

Geom.bezierSurface = () => {

}

Geom.bSplines= () => {

}

//选中plane中的一个点为中心点，以此进行triangle_fan
//Practical Algorithms for 3D Computer Graphics (2nd ed.) [Ferguson 2013-12-19].pdf
Geom.bezierBorderPlane = function bezierBorderPlane(bezierLines) {

}


Geom.torus = (circlePoints, circleNum, rdius, Origin2CicleCenter, colors) => {
    const pos = []
    const index = []
    const normal = []
    const color = []
    const texCoord = []
    let tc
    for (let i = 0; i <= circlePoints; i++) {
        let theta = Math.PI * 2 / circlePoints * i
        // 圆平面弧度计算 x,y平面，得到y
        let rr = Math.cos(theta)
        let ry = Math.sin(theta)
        // Origin2Cicle平面计算 x,z 平面
        for (let j = 0; j <= circleNum; j++) {
            texCoord.push(j / circleNum, i / circlePoints);
            let alpha = Math.PI * 2 / circleNum * j
            let px = (rr * rdius + Origin2CicleCenter) * Math.cos(alpha)
            let py = ry * rdius
            let pz = (rr * rdius + Origin2CicleCenter) * Math.sin(alpha)
            pos.push(px, py, pz)

            if (colors) tc = colors
            else tc = hsva(360 / circleNum * j, 1, 1, 1) // hue色调，360度，红色为0°，绿色为120°,蓝色为240°
            color.push(tc[0], tc[1], tc[2], tc[3])

            let rx = rr * Math.cos(alpha)
            let rz = rr * Math.sin(alpha)
            normal.push(rx, ry, rz)
        }
    }
    // 每4个顶点，6个index，2个三角形
    for (let i = 0; i < circlePoints; i++) {
        for (let j = 0; j < circleNum; j++) {
            let r = (circleNum + 1) * i + j
            index.push(r, r + circleNum + 1, r + 1)
            index.push(r + circleNum + 1, r + circleNum + 2, r + 1)
        }
    }
    const torus = new Mesh()
    torus.bufferFlattenData(pos, 'position', 3)
    torus.bufferFlattenData(texCoord, 'texCoord', 2)
    torus.bufferFlattenData(color, 'color', 4)
    torus.bufferIndex(index)
    torus.bufferFlattenData(normal, 'normal', 3)
    return torus
}

function hsva(h, s, v, a) {
    if (s > 1 || v > 1 || a > 1) {
        return
    }
    const th = h % 360
    const i = Math.floor(th / 60)
    const f = th / 60 - i
    const m = v * (1 - s)
    const n = v * (1 - s * f)
    const k = v * (1 - s * (1 - f))
    const color = []
    if (!s > 0 && !s < 0) {
        color.push(v, v, v, a)
    } else {
        const r = [v, n, m, m, k, v]
        const g = [k, v, v, n, m, m]
        const b = [m, m, k, v, v, n]
        color.push(r[i], g[i], b[i], a)
    }
    return color
}

// 从平面到球，也是采用经纬度的方式
function Sphere(row, column, rad, color) {
    const pos = [],
        nor = [],
        col = [],
        st = [],
        idx = []
    for (var i = 0; i <= row; i++) {
        var r = Math.PI / row * i
        var ry = Math.cos(r)
        var rr = Math.sin(r)
        for (var ii = 0; ii <= column; ii++) {
            var tr = Math.PI * 2 / column * ii
            var tx = rr * rad * Math.cos(tr)
            var ty = ry * rad
            var tz = rr * rad * Math.sin(tr)
            var rx = rr * Math.cos(tr)
            var rz = rr * Math.sin(tr)
            if (color) {
                var tc = color
            } else {
                tc = hsva(360 / row * i, 1, 1, 1)
            }
            pos.push(tx, ty, tz)
            nor.push(rx, ry, rz)
            col.push(tc[0], tc[1], tc[2], tc[3])
            st.push(1 - 1 / column * ii, 1 / row * i)
        }
    }
    r = 0
    for (i = 0; i < row; i++) {
        for (ii = 0; ii < column; ii++) {
            r = (column + 1) * i + ii
            idx.push(r, r + 1, r + column + 2)
            idx.push(r, r + column + 2, r + column + 1)
        }
    }
    return {
        pos,
        normal: nor,
        color: col,
        uv: st,
        index: idx
    }
}


function f() {

}
function g() {

}
function h() {

}

Geom.torusKnot = () => {

}

Geom.regularPolyhedron = () =>{

}

Geom.star = () => {

}
export default Geom;
