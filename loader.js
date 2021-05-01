import * as THREE from 'three'

let faceMaterial;
const TEXLoader = new THREE.TextureLoader();
const OBJLoader = new THREE.ObjectLoader();
const MTLLoader = new THREE.MaterialLoader();

export async function requireAllTextures() {
    faceMaterial = [];
    for (let i=1 ; i <= 7; ++i)
        faceMaterial.push( new THREE.MeshBasicMaterial({ 
            map: TEXLoader.load("textures/face"+i+".jpg"),
            side: THREE.BackSide
        }) );
}

export function getFaceMaterial(i) {
    if(!i) return faceMaterial[0]
    return faceMaterial[i-1];
}
export function getGameOBJ(name){
    // TODO:
    return new THREE.Mesh( new THREE.BoxGeometry(10,10,10), new THREE.MeshBasicMaterial({color: 0x0000ff}) );
}