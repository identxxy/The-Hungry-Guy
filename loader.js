import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import {scene} from './index'
import { load } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';

const PI = 3.1415926;

let faceMaterial;
const texLoader = new THREE.TextureLoader();
export const objLoader = new OBJLoader();
export const mtlLoader = new MTLLoader();


const objList = ['kitchen', 'table', 'apple', 'banana', 'jelly', 'pancake'];
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
    if ((loadIter == 0)|| (loadIter == 1))
        scene.add(obj);
    objDone.push(obj);
    loadIter++;
    if (loadIter >= objList.length) {
        adjustPos();
        return;
    }
    loadAllObjects();
}

function adjustPos() {
    //kitchen
    objDone[0].rotateX(PI / 30);
    objDone[0].position.set(-2300, -600, -1100);
    objDone[0].scale.set(0.6, 0.6, 0.2);
    //table
    objDone[1].rotateX(-PI / 25);
    objDone[1].position.set(0, -300, 220);
    objDone[1].scale.set(0.5, 0.5, 0.4);

    objDone[2].scale.set(10, 10, 10);
    objDone[3].scale.set(0.5, 0.5, 0.5);
    objDone[4].scale.set(10, 10, 10);
    objDone[5].scale.set(1000, 1000, 1000);

}