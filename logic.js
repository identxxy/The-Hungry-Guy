import { getColorMatrixTextureShapeWidthHeight } from '@tensorflow/tfjs-backend-webgl/dist/tex_util';
import { GameObject } from './object';

const OBJSPAWNTIME = [
    1000, 2000, 3000
];

const OBJSPAWNPOS = [
    [0, 0, 100],
    [100, 0, 100],
    [100, 100, 100],
];

let objects;
let iPos;
let iTime;

let startTime;

export function gameReset(){
  objects = [];
  iPos = 0;
  iTime = 0;
  startTime = new Date().getTime();
}

export function gameLogic(scene, mouth) {
  if (!startTime) return;
  let timeElasped = new Date().getTime() - startTime;
  console.log('time gone: ', timeElasped);
  // delete objs
  for (let i = 0; i < objects.length; ++i) {
    if (timeElasped - objects[i].birthtime > objects[i].lifetime) {
      scene.remove(objects[i]);
      objects.splice(i, 1);
    }
  }
  // spawn objs
  if (timeElasped > OBJSPAWNTIME[iTime]) {
    let pos = OBJSPAWNPOS[iPos];
    iTime++;
    iPos++;
    const obj = new GameObject("box", true, timeElasped);
    obj.position.x = pos[0];
    obj.position.y = pos[1];
    obj.position.z = pos[2];
    scene.add(obj);
    objects.push(obj);
  }
}