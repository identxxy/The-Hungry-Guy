import * as THREE from 'three'

let facetexture, boxtexture;
let mtr_dict, facemtr;
const TEXLoader = new THREE.TextureLoader();

export async function requireAllTextures() {
    facetexture = [];
    for (let i=1 ; i <= 7; ++i)
        facetexture.push( "textures/face"+i+".jpg");
    boxtexture = "textures/test.png";
}

export function loadObjectTexture(){
    mtr_dict = {
        'box': new THREE.MeshBasicMaterial({ map: TEXLoader.load(boxtexture), side: THREE.DoubleSide })
    };
}

export function loadFaceTexture() {
    facemtr = [];
    facetexture.forEach(element => {
        facemtr.push(new THREE.MeshBasicMaterial({ map: TEXLoader.load(element), side: THREE.BackSide }));
    });
}

export function objectMaterial(name) {
    return mtr_dict[name];
}

export function faceMaterial(i) {
    if(!i) return facemtr[0]
    return facemtr[i-1];
}
