let facetexture, boxtexture;
let mtr_dict, facemtr;

export async function requireAllTextures() {
    facetexture = require("./textures/test.png");
    boxtexture = require("./textures/test.png");
}

export function loadObjectTexture(){
    mtr_dict = {
        'box': new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(boxtexture), side: THREE.DoubleSide })
    };
}

export function loadFaceTexture() {
    facemtr = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(facetexture), side: THREE.DoubleSide });
}

export function ObjectMaterial(name) {
    return mtr_dict[name];
}

export function FaceMaterial() {
    return facemtr;
}
