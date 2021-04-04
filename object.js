import * as THREE from 'three';

const geo_dict = {
    'box': [new THREE.BoxGeometry(10, 10, 10),
            new THREE.SphereGeometry(5)]
}

const mtr_dict = {
    'box': [new THREE.MeshBasicMaterial( {color: 0x00ff00} ),
            new THREE.MeshBasicMaterial( {color: 0xff0000} )]
}

const score_dict = {
    'box': 10
}

export class GameObject extends THREE.Mesh{
    constructor(levelObj){
        const name = levelObj.name;
        super(geo_dict[name][0], mtr_dict[name][0]);
        if (Object.keys(geo_dict).indexOf(name) === -1){
            console.error('invalid object name:', name, 'at GameObject constructor');
        }
        this.name = levelObj.name;
        this.isFood = levelObj.isFood;
        this.lifetime = levelObj.lifetime;
        this.spawnTime = levelObj.spawnTime;
        this.position.x = levelObj.spawnPos[0];
        this.position.y = levelObj.spawnPos[1];
        this.position.z = levelObj.spawnPos[2];
        this.score = score_dict[name];
        this.eatenGeometry = geo_dict[name][1];
        this.eatenMaterial = mtr_dict[name][1];
        this.isEaten = false;
    }

    canBeEaten(mouth){
        if (!mouth || this.isEaten)
            return false;
        const ymax = mouth.up[1];
        const ymin = mouth.low[1];
        const xmax = mouth.right[0];
        const xmin = mouth.left[0];
        if (ymax > this.position.y && ymin < this.position.y &&
            xmax > this.position.x && xmin < this.position.x ){
            return true;
        }
        return false;
    }
    
    eaten(){
        this.geometry = this.eatenGeometry;
        this.material = this.eatenMaterial;
        this.isEaten = true;
        return this.score;
    }
}

