import * as THREE from 'three';

const geo_dict = {
    'box': new THREE.BoxGeometry(10, 10, 10)
}

const mtr_dict = {
    'box': new THREE.MeshBasicMaterial( {color: 0x00ff00} )
}

export class GameObject extends THREE.Mesh{
    constructor(name, isFood, time, lifetime = 3000){
        super(geo_dict[name], mtr_dict[name]);
        console.log('spawn object ', name);
        if (Object.keys(geo_dict).indexOf(name) === -1){
            console.error('invalid object name:', name, 'at GameObject constructor');
        }
        this.isFood = isFood;
        this.lifetime = lifetime;
        this.birthtime = time;
        this.name = name;
    }

}

