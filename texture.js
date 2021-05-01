import * as THREE from 'three'

let facetexture, boxtexture;
let mtr_dict, facemtr;
const TEXLoader = new THREE.TextureLoader();

export async function requireAllTextures() {
    facetexture = require("./textures/face2.jpg");
    boxtexture = require("./textures/test.png");
}

export function loadObjectTexture(){
    mtr_dict = {
        'box': new THREE.MeshBasicMaterial({ map: TEXLoader.load(boxtexture), side: THREE.DoubleSide })
    };
}

export function loadFaceTexture() {
    facemtr = new THREE.MeshBasicMaterial({ map: TEXLoader.load(facetexture), side: THREE.BackSide });
}

export function ObjectMaterial(name) {
    return mtr_dict[name];
}

export function FaceMaterial() {
    return facemtr;
}
