
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


	return _shader;
}

export default {
	get
}
