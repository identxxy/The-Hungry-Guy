import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import {scene} from './index'


const PI = 3.1415926;

let faceMaterial;
const texLoader = new THREE.TextureLoader();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

const objList = [
    { name: 'kitchen', scale: 0 },
    { name: 'table', scale: 0 },
    { name: 'apple', scale: 10 },
    { name: 'banana', scale: 0.5 },
    { name: 'jelly', scale: 10 },
    { name: 'pancake', scale: 500 },
    { name: 'watermelon', scale: 5 },
    { name: 'chicken', scale: 0.5 },
    { name: 'egg', scale: 10 },
    { name: 'wrench', scale: 1 },
    { name: 'iphone', scale: 1 },
    { name: 'rose', scale: 1 },
    { name: 'knife', scale: 1 },
    { name: 'cap', scale: 1 }
];
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
    if (loadIter == 0) {
        obj.rotateX(PI / 30);
        obj.position.set(-2300, -600, -1100);
        obj.scale.set(0.6, 0.6, 0.2);
        scene.add(obj);
    }
    else if (loadIter == 1) {
        obj.rotateX(-PI / 25);
        obj.position.set(0, -300, 220);
        obj.scale.set(0.5, 0.5, 0.4);
        scene.add(obj);
    }
    else
        obj.scale.set(s, s, s);
    objDone.push(obj);
    loadIter++;
    if (loadIter >= objList.length) {
        return;
    }
    loadAllObjects();
}
