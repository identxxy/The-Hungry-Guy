import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

let faceMaterial;
const texLoader = new THREE.TextureLoader();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();


const objList = ['apple', 'banana', 'jelly', 'pancake'];
const objDone = [];
let loadIter = 0;

export async function requireAllTextures() {
    faceMaterial = [];
    for (let i=1 ; i <= 7; ++i)
        faceMaterial.push( new THREE.MeshBasicMaterial({ 
            map: texLoader.load("textures/face"+i+".jpg"),
            side: THREE.BackSide
        }) );
}

export function getFaceMaterial(i) {
    if(!i) return faceMaterial[0]
    return faceMaterial[i-1];
}
export function getGameOBJ(name){
    // TODO:
    return objDone[objList.indexOf(name)];
}


export function loadAllObjects() {
    let name = objList[loadIter] + '.mtl';
    console.log(name);
    mtlLoader.load(objList[loadIter] + '.mtl', mCB, (val) => { console.log('prog M'); }, (val) => { console.log('error M'); });
}
function mCB(mtr) {
    console.log("done ", loadIter, " M");
    objLoader.setMaterials(mtr);
    let name = objList[loadIter] + '.obj';
    console.log(name);
    objLoader.load(objList[loadIter] + '.obj', oCB, (val) => { console.log('prog M'); }, (val) => { console.log('error O'); });
}
function oCB(obj) {
    console.log("done ", loadIter, " O");
    objDone.push(obj);
    loadIter++;
    if (loadIter >= objList.length) {
        adjustPos();
        return;
    }
    loadAllObjects();
}

function adjustPos() {
    objDone[0].scale.set(10, 10, 10);
    objDone[1].scale.set(0.5, 0.5, 0.5);
    objDone[2].scale.set(10, 10, 10);
    objDone[3].scale.set(1000, 1000, 1000);
}