import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

let faceMaterial;
const texLoader = new THREE.TextureLoader();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

const objList = [
    {name: 'apple', scale: 10},
    {name: 'banana', scale: 0.5},
    {name: 'jelly', scale: 10},
    {name: 'pancake', scale: 500},
    {name: 'watermelon', scale: 5},
    {name: 'chicken', scale: 0.5},
    {name: 'egg', scale: 10}
]
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
    for(let i = 0 ; i < objList.length; ++i){
        if (name == objList[i].name){
            return objDone[i];
        }
    }
}


export function loadAllObjects() {
    mtlLoader.load(objList[loadIter].name + '.mtl', mCB);
}
function mCB(mtr) {
    objLoader.setMaterials(mtr);
    objLoader.load(objList[loadIter].name + '.obj', oCB);
}
function oCB(obj) {
    let s = objList[loadIter].scale;
    obj.scale.set(s, s, s);
    objDone.push(obj);
    loadIter++;
    if (loadIter >= objList.length) {
        return;
    }
    loadAllObjects();
}
