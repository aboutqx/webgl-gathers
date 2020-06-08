
import GLShader from '../GLShader';
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

const addPointSize = (vs, size = 1.) => {
	String.prototype.splice = function(idx, rem, str) {
		return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
	};
	const glPosIndex = vs.indexOf('gl_Position')
	vs = vs.splice(glPosIndex, 0, `gl_PointSize = ${size};\n`);
	return vs
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
	addInstanceMatrix
}
