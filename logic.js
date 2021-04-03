import { getColorMatrixTextureShapeWidthHeight } from '@tensorflow/tfjs-backend-webgl/dist/tex_util';
import { GameObject } from './object';

const deadTime = 500;

const OBJSPAWNTIME = [
    1000, 1100, 1200,
    1300, 1400, 1500
];

const OBJSPAWNPOS = [
    [0, 0, 0],
    [50, 0, 0],
    [100, 0, 0],
    [100, 100, 0],
    [100, 50, 0],
    [50, 50, 0],
];

let objects;
let iPos;
let iTime;

let startTime;
let score;

export function gameReset(scene){
  if (objects) objects.forEach(obj => {scene.remove(obj)});
  objects = [];
  iPos = 0;
  iTime = 0;
  score = 0;
  startTime = new Date().getTime();
}

export function gameLogic(scene, mouth, state) {
  if (!startTime) return;
  let timeElasped = new Date().getTime() - startTime;
  if (state.debug) console.log('time gone: ', timeElasped);
  // for each obj
  for (let i = 0; i < objects.length; ++i) {
    const obj = objects[i];
    if (obj.canBeEaten(mouth)){
        obj.lifetime = timeElasped - obj.birthtime + deadTime;
        score += obj.eaten();
        console.log('score: ', score);
    }
    // delte dead objects
    if (timeElasped - obj.birthtime > obj.lifetime) {
      scene.remove(obj);
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
  return score;
}