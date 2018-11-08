export function Torus(circlePoints, circleNum, rdius, Origin2CicleCenter, colors) {
  let pos = []
  let index = []
  let normal = []
  let color = []
  let tc
  for (let i = 0; i <= circlePoints; i++) {
    let theta = Math.PI * 2 / circlePoints * i
    // 圆平面弧度计算 x,y平面，得到y
    let rr = Math.cos(theta)
    let ry = Math.sin(theta)
    // Origin2Cicle平面计算 x,z 平面
    for (let j = 0; j <= circleNum; j++) {
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
  return {
    pos,
    index,
    normal,
    color
  }
}

export function hsva(h, s, v, a) {
  if (s > 1 || v > 1 || a > 1) {
    return
  }
  let th = h % 360
  let i = Math.floor(th / 60)
  let f = th / 60 - i
  let m = v * (1 - s)
  let n = v * (1 - s * f)
  let k = v * (1 - s * (1 - f))
  let color = []
  if (!s > 0 && !s < 0) {
    color.push(v, v, v, a)
  } else {
    let r = [v, n, m, m, k, v]
    let g = [k, v, v, n, m, m]
    let b = [m, m, k, v, v, n]
    color.push(r[i], g[i], b[i], a)
  }
  return color
}

export function Sphere(row, column, rad, color) {
  var pos = [],
    nor = [],
    col = [],
    st = [],
    idx = []
  for (var i = 0; i <= row; i++) {
    var r = Math.PI / row * i;
    var ry = Math.cos(r);
    var rr = Math.sin(r);
    for (var ii = 0; ii <= column; ii++) {
      var tr = Math.PI * 2 / column * ii;
      var tx = rr * rad * Math.cos(tr);
      var ty = ry * rad;
      var tz = rr * rad * Math.sin(tr);
      var rx = rr * Math.cos(tr);
      var rz = rr * Math.sin(tr);
      if (color) {
        var tc = color;
      } else {
        tc = hsva(360 / row * i, 1, 1, 1);
      }
      pos.push(tx, ty, tz);
      nor.push(rx, ry, rz);
      col.push(tc[0], tc[1], tc[2], tc[3]);
      st.push(1 - 1 / column * ii, 1 / row * i);
    }
  }
  r = 0
  for (i = 0; i < row; i++) {
    for (ii = 0; ii < column; ii++) {
      r = (column + 1) * i + ii;
      idx.push(r, r + 1, r + column + 2);
      idx.push(r, r + column + 2, r + column + 1);
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
export const QuadData = [
  // position texCoord
  -1.0, 1.0, 0.0, 0.0, 1.0,
  -1.0, -1.0, 0.0, 0.0, 0.0,
  1.0, 1.0, 0.0, 1.0, 1.0,
  1.0, -1.0, 0.0, 1.0, 0.0
]

export const CubeData = [
  // pos normal textCoord
  // back face
  -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // bottom-left
  1.0, 1.0, -1.0, 0.0, 0.0, -1.0, 1.0, 1.0, // top-right
  1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 1.0, 0.0, // bottom-right
  1.0, 1.0, -1.0, 0.0, 0.0, -1.0, 1.0, 1.0, // top-right
  -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // bottom-left
  -1.0, 1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, // top-left
  // front face
  -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // bottom-left
  1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, // bottom-right
  1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, // top-right
  1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, // top-right
  -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, // top-left
  -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // bottom-left
  // left face
  -1.0, 1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 0.0, // top-right
  -1.0, 1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0, // top-left
  -1.0, -1.0, -1.0, -1.0, 0.0, 0.0, 0.0, 1.0, // bottom-left
  -1.0, -1.0, -1.0, -1.0, 0.0, 0.0, 0.0, 1.0, // bottom-left
  -1.0, -1.0, 1.0, -1.0, 0.0, 0.0, 0.0, 0.0, // bottom-right
  -1.0, 1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 0.0, // top-right
  // right face
  1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, // top-left
  1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, // bottom-right
  1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, // top-right
  1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, // bottom-right
  1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, // top-left
  1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, // bottom-left
  // bottom face
  -1.0, -1.0, -1.0, 0.0, -1.0, 0.0, 0.0, 1.0, // top-right
  1.0, -1.0, -1.0, 0.0, -1.0, 0.0, 1.0, 1.0, // top-left
  1.0, -1.0, 1.0, 0.0, -1.0, 0.0, 1.0, 0.0, // bottom-left
  1.0, -1.0, 1.0, 0.0, -1.0, 0.0, 1.0, 0.0, // bottom-left
  -1.0, -1.0, 1.0, 0.0, -1.0, 0.0, 0.0, 0.0, // bottom-right
  -1.0, -1.0, -1.0, 0.0, -1.0, 0.0, 0.0, 1.0, // top-right
  // top face
  -1.0, 1.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, // top-left
  1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, // bottom-right
  1.0, 1.0, -1.0, 0.0, 1.0, 0.0, 1.0, 1.0, // top-right
  1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, // bottom-right
  -1.0, 1.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, // top-left
  -1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 0.0 // bottom-left
]
