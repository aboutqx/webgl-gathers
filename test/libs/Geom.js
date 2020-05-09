// Geom.js

'use strict';

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

// c(u) = E(i=0 - n)B(u)Pi 0<= u <= 1
// 0 < offset < 1, points are at least 2 points
Geom.bezier = (points, offset) => {
    const vertices = []
    const indices = []
    
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

    const coords = [[0, 0], [1, 1]]
    for(let i = 0; i < vertices.length; i++) {
        indices.push(i)
    }

    const mesh = new Mesh(gl.POINTS);
    mesh.bufferVertex(vertices);
    mesh.bufferTexCoord(coords);
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
export default Geom;
