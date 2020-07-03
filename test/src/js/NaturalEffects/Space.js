
import GLTexture from 'libs/GLTexture'
import { gl, canvas } from '../../../libs/GlTools';

const rng = require('rng');

export function generateRandomSeed() {
	return (Math.random() * 1000000000000000000).toString(36);
}

export function hashcode(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		var char = str.charCodeAt(i)
		hash += (i + 1) * char;
	}
	return hash;
}

export function rand(seed, offset) {
	return new rng.MT(hashcode(seed) + offset);
}

let oneSeed

export function geneStarTexture(width, height, density, brightness) {

	const seed = generateRandomSeed()
	oneSeed = seed
	const randFunc = rand(seed, 0);
	const prng = randFunc.random.bind(randFunc)

	const count = Math.round(width * height * density);
	// Create a byte array for our texture.
	const data = new Uint8Array(width * height * 3);
	// For each star...
	for (let i = 0; i < count; i++) {
		// Select a random position.
		let r = Math.floor(prng() * width * height);
		// Select an intensity from an exponential distribution.
		let c = Math.round(255 * Math.log(1 - prng()) * -brightness);
		// Set a greyscale color with the intensity we chose at the pixel we selected.
		data[r * 3 + 0] = c;
		data[r * 3 + 1] = c;
		data[r * 3 + 2] = c;
	}

	return new GLTexture(data, { format: gl.RGB }, width, height)
}

export const starTexture = (width, height, density = 0.05, brightness = 0.125) => geneStarTexture(width, height, density, brightness)

function randomVec2(out, scale) {
    scale = scale || 1.0
    var r = Math.random() * 2.0 * Math.PI
    out[0] = Math.cos(r) * scale
    out[1] = Math.sin(r) * scale
    return out
}

export function geneNoiseTexture(size) {
	let l = size * size * 2;
	let array = new Uint8Array(l);
	for (let i = 0; i < l; i++) {
	  let r = randomVec2([]);
	  array[i * 2 + 0] = Math.round(0.5 * (1.0 + r[0]) * 255);
	  array[i * 2 + 1] = Math.round(0.5 * (1.0 + r[1]) * 255);
	}

	return new GLTexture(array, { format: gl.LUMINANCE_ALPHA, wrapS: gl.REPEAT, wrapT: gl.REPEAT }, size, size)
}
const tNoiseSize = 1024
const noiseTexture = geneNoiseTexture(tNoiseSize)

export const nebulaParams = () => {
	const randFunc = rand(oneSeed, 1000);
	const shortScale = false
	const scale = shortScale ? Math.min(canvas.width, canvas.height) : Math.max(canvas.width, canvas.height);
	let nebulaCount = Math.round(randFunc.random() * 4 + 1);
	console.log(nebulaCount, randFunc.random())

	return {
		tNoise: noiseTexture,
		tNoiseSize,
		offset: [randFunc.random() * 100, randFunc.random() * 100],
        scale: (randFunc.random() * 2 + 1) / scale,
        color: [randFunc.random(), randFunc.random(), randFunc.random()],
        density: randFunc.random() * 0.2,
        falloff: randFunc.random() * 2.0 + 3.0,
	}
}