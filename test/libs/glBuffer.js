
var BufferUtils = {
  getComponentSize: function (type) {
    switch (type) {
      case 0x1400: // gl.BYTE:
      case 0x1401: // gl.UNSIGNED_BYTE:
        return 1
      case 0x1402: // gl.SHORT:
      case 0x1403: // gl.UNSIGNED_SHORT:
        return 2
      case 0x1404: // gl.INT:
      case 0x1405: // gl.UNSIGNED_INT:
      case 0x1406: // gl.FLOAT:
        return 4
      default:
        return 0
    }
  },

  Drawable: function (proto) {
    proto.drawPoints = function (count, offset) { this.draw(0 /* POINTS         */, count, offset) }
    proto.drawLines = function (count, offset) { this.draw(1 /* LINES          */, count, offset) }
    proto.drawLineLoop = function (count, offset) { this.draw(2 /* LINE_LOOP      */, count, offset) }
    proto.drawLineStrip = function (count, offset) { this.draw(3 /* LINE_STRIP     */, count, offset) }
    proto.drawTriangles = function (count, offset) { this.draw(4 /* TRIANGLES      */, count, offset) }
    proto.drawTriangleStrip = function (count, offset) { this.draw(5 /* TRIANGLE_STRIP */, count, offset) }
    proto.drawTriangleFan = function (count, offset) { this.draw(6 /* TRIANGLE_FAN   */, count, offset) }
  }

}
/*
 * GL_ARRAY_BUFFER */
var TGT = 0x8892

/**
 * @class
 * @implements {Drawable}
 * @param {WebGLRenderingContext} gl      then webgl context this ArrayBuffer belongs to
 * @param {TypedArray|uint} [data]   optional data to copy to buffer, or the size (in bytes)
 * @param {GLenum} [usage=GL_STATIC_DRAW] the usage hint for this buffer.
 *
 */
function ArrayBuffer (gl, data, usage) {
  this.gl = gl
  this.usage = usage || gl.STATIC_DRAW
  this.buffer = gl.createBuffer()
  this.attribs = []
  this.stride = 0
  this.byteLength = 0
  this.length = 0

  if (data) {
    this.data(data)
  }
}

ArrayBuffer.prototype = {

  /**
   * Bind the underlying webgl buffer.
   */
  bind: function () {
    this.gl.bindBuffer(TGT, this.buffer)
  },

  /**
   * Add attribute declaration for this buffer. Once attributes declared, the buffer can be linked to
   * programs attributes using {@link ArrayBuffer#attribPointer}
   *  @param {string} name the name of the program's attribute
   *  @param {uint} size the size of the attribute (3 for a vec3)
   *  @param {GLenum} type the type of data (GL_FLOAT, GL_SHORT etc)
   *  @param {boolean} [normalize=false] indicate if the data must be normalized
   */
  attrib: function (name, size, type, normalize) {
    this.attribs.push({
      name: name,
      type: 0 | type,
      size: 0 | size,
      normalize: !!normalize,
      offset: this.stride
    })
    // use only one buffer for multiple attributes
    this.stride += BufferUtils.getComponentSize(type) * size
    this._computeLength()
    return this
  },

  /**
   * Fill webgl buffer with the given data. You can also pass a uint  to allocate the buffer to the given size.
   *   @param {TypedArray|uint} array the data to send to the buffer, or a size.
   */
  data: function (array) {
    var gl = this.gl
    gl.bindBuffer(TGT, this.buffer)
    gl.bufferData(TGT, array, this.usage)
    gl.bindBuffer(TGT, null)

    this.byteLength = (array.byteLength === undefined) ? array : array.byteLength
    this._computeLength()
  },

  /**
   * Set a part of the buffer with the given data, starting a offset (in bytes)
   *  @param {typedArray} array the data to send to buffer
   *  @param {uint} offset the offset in byte where the data will be written
   */
  subData: function (array, offset) {
    var gl = this.gl
    gl.bindBuffer(TGT, this.buffer)
    gl.bufferSubData(TGT, offset, array)
    gl.bindBuffer(TGT, null)
  },

  /**
   * Link given program attributes to this buffer. You should first declare attributes using {@link ArrayBuffer#attrib}
   * before calling this method.
   *   @param {Program} program the nanogl Program
   */
  attribPointer: function (program, list) {
    var gl = this.gl
    gl.bindBuffer(TGT, this.buffer)
    if (list && list.length) {
      for (let i = 0; i < list.length; i++) {
        for (var j = 0; j < this.attribs.length; j++) {
          let attrib = this.attribs[j]
          if (list[i] === attrib.name) {
            if (program[attrib.name] !== undefined) {
              let aLocation = program[attrib.name]()
              gl.enableVertexAttribArray(aLocation)
              gl.vertexAttribPointer(aLocation,
                attrib.size,
                attrib.type,
                attrib.normalize,
                this.stride,
                attrib.offset
              )
            } else {
              console.warn(`glBuffer can't get Attribute "${attrib.name}" Location.`)
            }
          }
        }
      }
      return
    }
    for (var i = 0; i < this.attribs.length; i++) {
      var attrib = this.attribs[i]

      if (program[attrib.name] !== undefined) {
        var aLocation = program[attrib.name]()
        gl.enableVertexAttribArray(aLocation)
        gl.vertexAttribPointer(aLocation,
          attrib.size,
          attrib.type,
          attrib.normalize,
          this.stride,
          attrib.offset
        )
      } else {
        console.warn(`glBuffer can't get Attribute "${attrib.name}" Location.`)
      }
    }
  },

  /**
   * Shortcut to gl.drawArrays
   *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position of the first vertex to draw
   */
  draw: function (mode, count, offset) {
    count = (count === undefined) ? this.length : count
    this.gl.drawArrays(mode, offset, 0 | count)
  },

  /**
   * Delete underlying webgl objects
   */
  dispose: function () {
    this.gl && this.gl.deleteBuffer(this.buffer)
    this.buffer = null
    this.gl = null
  },

  _computeLength: function () {
    if (this.stride > 0) {
      this.length = this.byteLength / this.stride
    }
  }

}

/*
 * Implement Drawable
 */
BufferUtils.Drawable(ArrayBuffer.prototype)

/* GL_ELEMENT_ARRAY_BUFFER 34963 */
var ELEMENT_ARRAY_BUFFER = 0x8893

/**
 * @class
 * @implements {Drawable}
 * @param {WebGLRenderingContext} gl      then webgl context this ArrayBuffer belongs to
 * @param {GLenum} [type=GL_UNSIGNED_SHORT]  the inetger type of the indices (GL_UNSIGNED_BYTE, GL_UNSIGNED_INT etc)
 * @param {TypedArray|uint} [data]   optional data to copy to buffer, or the size (in bytes)
 * @param {GLenum} [usage=GL_STATIC_DRAW] the usage hint for this buffer.
 *
 */
function IndexBuffer (gl, type, data, usage) {
  this.gl = gl
  this.buffer = gl.createBuffer()
  this.usage = usage || gl.STATIC_DRAW
  this.type = 0
  this.typeSize = 0
  this.size = 0

  this.setType(type || gl.UNSIGNED_SHORT)

  if (data) {
    this.data(data)
  }
}

IndexBuffer.prototype = {

  /**
   * Bind the underlying webgl buffer.
   */
  bind: function () {
    this.gl.bindBuffer(ELEMENT_ARRAY_BUFFER, this.buffer)
  },

  /**
   *  Change the type of internal type of the IndexBuffer
   *  @param {GLenum} type  the integer type of the indices (GL_UNSIGNED_BYTE, GL_UNSIGNED_INT etc)
   */
  setType: function (type) {
    this.type = type
    this.typeSize = BufferUtils.getComponentSize(type)
  },

  /**
   * Fill webgl buffer with the given data. You can also pass a uint  to allocate the buffer to the given size.
   *   @param {TypedArray|uint} array the data to send to the buffer, or a size.
   */
  data: function (array) {
    var gl = this.gl
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, this.buffer)
    gl.bufferData(ELEMENT_ARRAY_BUFFER, array, this.usage)
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, null)
    this.size = (array.byteLength === undefined) ? array : array.byteLength
  },

  /**
   * Set a part of the buffer with the given data, starting a offset (in bytes)
   *  @param {typedArray} array the data to send to buffer
   *  @param {uint} offset the offset in byte where the data will be written
   */
  subData: function (array, offset) {
    var gl = this.gl
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, this.buffer)
    gl.bufferSubData(ELEMENT_ARRAY_BUFFER, offset, array)
    gl.bindBuffer(ELEMENT_ARRAY_BUFFER, null)
  },

  /**
   * Delete underlying webgl objects
   */
  dispose: function () {
    this.gl.deleteBuffer(this.buffer)
    this.buffer = null
    this.gl = null
  },

  /**
   * Shortcut to gl.drawArrays
   *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
   *   @param {uint} [count] the number of indices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position of the first index to draw
   */
  draw: function (mode, count, offset) {
    count = (count === undefined) ? this.size / this.typeSize : count
    this.gl.drawElements(mode, count, this.type, 0 | offset)
  }

}
/*
 * Implement Drawable
 */
BufferUtils.Drawable(IndexBuffer.prototype)

export { ArrayBuffer, IndexBuffer }
