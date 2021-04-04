import { GameObject } from './object';

const LVLS = [];
export async function loadGameLevels(lvl) {
  LVLS.push( await import('./levels/lvl1.json') );
  LVLS.push( await import('./levels/lvl2.json') );
}

const deadTime = 500;

let level;
let iter;

let objects;

let startTime;
let score;

export function gameChooseLevel(lvl) {
  level = LVLS[lvl];
  console.log('choose level: ', lvl);
  // pause the game
  startTime = null;
}

export function gameReset(scene) {
  // default to be level 1
  if (!level) level = LVLS[0];
  // clean up remainning objs
  if (objects) objects.forEach(obj => { scene.remove(obj) });
  objects = [];
  iter = 0;
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
    if (obj.canBeEaten(mouth)) {
      obj.lifetime = timeElasped - obj.spawnTime + deadTime;
      score += obj.eaten();
      console.log('score: ', score);
    }
    // delte dead objects
    if (timeElasped - obj.spawnTime > obj.lifetime) {
      scene.remove(obj);
      objects.splice(i, 1);
    }
  }
  // spawn objs
  for (let levelObj = level[iter]; iter < level.length && timeElasped > levelObj.spawnTime; levelObj = level[++iter]) {
    console.log('spawn ', timeElasped - levelObj.spawnTime);
    console.log('iter ', iter);
    const obj = new GameObject(levelObj);
    scene.add(obj);
    objects.push(obj);
  }
  // move objs
  return score;
}