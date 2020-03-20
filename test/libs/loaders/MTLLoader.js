import load from 'load-asset'
// code from https://github.com/mrdoob/three.js

export default class MTLLoader {
    _materials = {}
    materialsInfo = {}
    name = ''
    constructor(name, path) {
        this.name = name
        this.path = path
    }
    async parse(text) {
        const lines = text.split('\n')
        let info = {}
        const delimiterPattern = /\s+/;


        for (var i = 0; i < lines.length; i++) {

            var line = lines[i];
            line = line.trim();

            if (line.length === 0 || line.charAt(0) === '#') {

                // Blank line or comment ignore
                continue;

            }

            var pos = line.indexOf(' ');

            var key = (pos >= 0) ? line.substring(0, pos) : line;
            key = key.toLowerCase();

            var value = (pos >= 0) ? line.substring(pos + 1) : '';
            value = value.trim();

            if (key === 'newmtl') {

                // New material

                info = {
                    name: value
                };
                this.materialsInfo[value] = info;

            } else {

                if (key === 'ka' || key === 'kd' || key === 'ks') {

                    var ss = value.split(delimiterPattern, 3);
                    info[key] = [parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2])];

                } else {

                    info[key] = value;

                }
            }
        }
        await this.setMaterials()
        return this.materials
    }
    //
    async setMaterials() {
        let n
        for (let key in this.materialsInfo) {
            this._materials[key] = {}
            for (let prop in this.materialsInfo[key]) {
                let value = this.materialsInfo[key][prop]

                switch (prop.toLowerCase()) {
                    case 'kd':
                        this._materials[key].kd = value
                        break;

                    case 'ks':
                        this._materials[key].ks = value
                        break;

                    case 'map_ka':

                        this._materials[key].ambientMap = await this.setMapType("ambientMap", value);

                        break;

                    case 'map_kd':
                        this._materials[key].diffuseMap = await this.setMapType("diffuseMap", value)
                        break

                    case 'map_ks':

                        // Specular map

                        this._materials[key].specularMap = await this.setMapType("specularMap", value);

                        break;

                    case 'norm':

                        this._materials[key].normalMap = await this.setMapType("normalMap", value);

                        break;

                    case 'map_bump':
                    case 'bump':

                        // Bump texture map

                        this._materials[key].bumpMap = await this.setMapType("bumpMap", value);

                        break;

                    case 'map_ke':

                        this._materials[key].emissiveMap = await this.setMapType("emissiveMap", value);

                        break;

                    case 'map_d':

                        // Alpha map

                        this._materials[key].alphaMap = await this.setMapType("alphaMap", value);
                        params.transparent = true;

                        break;

                    case 'ns':

                        // The specular exponent (defines the focus of the specular highlight)
                        // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

                        this._materials[key].shininess = parseFloat(value);

                        break;

                    case 'd':
                        n = parseFloat(value);

                        if (n < 1) {

                            this._materials[key].opacity = n;

                        }

                        break;

                    case 'tr':
                        n = parseFloat(value);

                        n = 1 - n;

                        if (n > 0) {

                            this._materials[key].opacity = 1 - n;

                        }

                        break;

                    default:
                        break;

                }

            }
        }
    }

    async setMapType(name, text) {
        //simply skip texture params
        let url = text.split(/\s+/).pop()
        const asset = await load(this.path + '/' + url)
        return asset
    }
    // material: { materialName: { ...params, aoMap: ..., diffuseMap: ..., ....}
    get materials() {
        return this._materials
    }

    set materials(value) {
        this._materials = value
    }
}
