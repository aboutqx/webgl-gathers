// material 应该在shader编译前，需要注入define来定义具有相关material map
//这里我们将shader compile相关任务放在shader.js这里
import Shader from 'libs/shaders/Shader'
export default class Material{

    constructor(vs, fs, uniforms={}, defines={}) {
		this._shader= Shader.get(vs, fs, defines);
		console.log(uniforms)
		this.uniforms = Object.assign({}, uniforms);
	}


	update() {
		this._shader.bind();
		this._shader.uniform(this.uniforms);
    }
    

}