// getTextureParameters.js

import { gl } from '../GlTools';

function isPowerOfTwo(x) {
    return (x !== 0) && (!(x & (x - 1)));
};

const getTextureParameters = function (mParams, mType, mWidth, mHeight) {
    if (!mParams.minFilter) {
        let minFilter = gl.LINEAR;
        if (mWidth && mWidth) {
            if (isPowerOfTwo(mWidth) && isPowerOfTwo(mHeight)) {
                minFilter = gl.LINEAR_MIPMAP_NEAREST;
            }
        }

        mParams.minFilter = minFilter;
    }


    mParams.mipmap = mParams.mipmap || true;
    mParams.magFilter = mParams.magFilter || gl.LINEAR;
    mParams.wrapS = mParams.wrapS || gl.CLAMP_TO_EDGE;
    mParams.wrapT = mParams.wrapT || gl.CLAMP_TO_EDGE;
    mParams.format = mParams.format || gl.RGBA;
    mParams.premultiplyAlpha = mParams.premultiplyAlpha || false;
    mParams.level = mParams.level || 0;
    mParams.anisotropy = mParams.anisotropy || 0;

    if (!mParams.internalFormat && (mType !== gl.UNSIGNED_BYTE)) mParams.internalFormat = fixInternalFormat(mType, mParams.format)
    else mParams.internalFormat = mParams.internalFormat || gl.RGBA

    return mParams;
};

function fixInternalFormat(type, pixelFormat) {
    let internalFormat
    if (pixelFormat === gl.DEPTH_STENCIL) {
        internalFormat = gl.DEPTH24_STENCIL8;
    } else if (pixelFormat === gl.DEPTH_COMPONENT) {
        if (type === gl.UNSIGNED_SHORT) {
            internalFormat = gl.DEPTH_COMPONENT16;
        } else if (type === gl.UNSIGNED_INT) {
            internalFormat = gl.DEPTH_COMPONENT24;
        }
    }

    if (type === gl.FLOAT) {
        switch (pixelFormat) {
            case PixelFormat.RGBA:
                internalFormat = gl.RGBA32F;
                break;
            case PixelFormat.RGB:
                internalFormat = gl.RGB32F;
                break;
            case PixelFormat.RG:
                internalFormat = gl.RG32F;
                break;
            case PixelFormat.R:
                internalFormat = gl.R32F;
                break;
        }
    } else if (type === gl.HALF_FLOAT) {
        switch (pixelFormat) {
            case gl.RGBA:
                internalFormat = gl.RGBA16F;
                break;
            case gl.RGB:
                internalFormat = gl.RGB16F;
                break;
            case gl.RG:
                internalFormat = gl.RG16F;
                break;
            case gl.R:
                internalFormat = gl.R16F;
                break;
        }
    }

    return internalFormat
}

export default getTextureParameters;
