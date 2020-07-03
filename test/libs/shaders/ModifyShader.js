
import GLShader from '../GLShader';
import { gl } from '../GlTools'

const shaderCache = [];

const definesToString = function (defines) {
	let outStr = '';
	for (const def in defines) {
		if (defines[def]) {
			outStr += `#define ${def} ${defines[def]}\n`;
		}

	}
	return outStr;
};

const injectDefines = function (mShader, mDefines) {
	mShader = mShader.replace('#version 300 es', '')
	return `#version 300 es\n${definesToString(mDefines)}\n${mShader}`;

};

const addInstanceMatrix = (vs) => {
	vs = vs.replace('#version 300 es', '')
	if(vs.indexOf('instanceMatrix') == -1) {
		vs = vs.replace('uniform mat4 uModelMatrix', 'in mat4 instanceMatrix')
		vs = vs.replace('uniform mat4 mMatrix', 'in mat4 instanceMatrix')
		vs = vs.replace(/uModelMatrix/g, 'instanceMatrix')
		vs = vs.replace(/mMatrix/g, 'instanceMatrix')


	}
	return `#version 300 es
	${vs}`;

}

String.prototype.splice = function(idx, rem, str) {
	return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const addPointSize = (vs, size = 1.) => {
	if(vs.indexOf('gl_PointSize') !== -1) return;
	const [minSize, maxSize] = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
	console.log('point size range:', minSize, maxSize)
	
	const glPosIndex = vs.indexOf('gl_Position')
	vs = vs.splice(glPosIndex, 0, `gl_PointSize = ${parseFloat(size).toFixed(1)};\n`);
	return vs
}

const addVertIn = (vs, type, varyingName) => {
	const glPosIndex = vs.indexOf('void main')
	const firstUpper = varyingName[0].toUpperCase() + varyingName.slice(1)
	vs = vs.splice(glPosIndex, 0, `in ${type} ${varyingName};\n	out ${type} v${firstUpper};\n`);
	const lastClose = vs.lastIndexOf('}')
	vs = vs.splice(lastClose - 1, 0, `\nv${firstUpper} = ${varyingName};\n`);
	return vs
}

const replaceHold = (glsl, replace) => {
	const reg = new RegExp('${' + pattern + '}', 'g');
}

const get = (vs, fs, defines = {}) => {
	let _shader;
	const _vs = injectDefines(vs, defines);
	const _fs = injectDefines(fs, defines);

	shaderCache.forEach(shader => {
		if (_vs === shader.vs && _fs === shader.fs) {
			_shader = shader.glShader;
		}
	});

	if (!_shader) {
		_shader = new GLShader(_vs, _fs);
		shaderCache.push({
			vs: _vs,
			fs: _fs,
			glShader: _shader
		});
	}


	return {
		vs: _vs,
		fs: _fs,
		glShader: _shader
	}
}

export default {
	get,
	addInstanceMatrix,
	addPointSize,
	addVertIn
}
