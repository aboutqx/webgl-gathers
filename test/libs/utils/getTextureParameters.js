// getTextureParameters.js

import { gl } from '../GlTools';

function isPowerOfTwo(x) {	
	return (x !== 0) && (!(x & (x - 1)));
};

const getTextureParameters = function (mParams, mSource, mWidth, mHeight) {
	if(!mParams.minFilter) {
		let minFilter = gl.LINEAR;
		if(mWidth && mWidth) {
			if(isPowerOfTwo(mWidth) && isPowerOfTwo(mHeight)) {
				minFilter = gl.LINEAR_MIPMAP_NEAREST;
			}
		}

		mParams.minFilter = minFilter;
	} 


	mParams.mipmap = mParams.mipmap || true;
	mParams.magFilter = mParams.magFilter || gl.LINEAR;
	mParams.wrapS = mParams.wrapS || gl.CLAMP_TO_EDGE;
	mParams.wrapT = mParams.wrapT || gl.CLAMP_TO_EDGE;
	mParams.internalFormat = mParams.internalFormat || gl.RGBA;
	mParams.format = mParams.format || gl.RGBA;
	mParams.premultiplyAlpha = mParams.premultiplyAlpha || false;
	mParams.level = mParams.level || 0;
	mParams.anisotropy = mParams.anisotropy || 0;

	return mParams;
};


export default getTextureParameters;