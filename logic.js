import { GameObject } from './object';
import { loadLevelAudios, playLevelMusic } from './audio'

import * as THREE from 'three';

const LVLS = [];
export async function loadGameLevels(lvl) {
  loadLevelAudios();
  LVLS.push( await import('./levels/lvl1.json') );
  LVLS.push( await import('./levels/lvl2.json') );
}

let level, iLevel;
let iter;

let objects;

let startTime;
const scoreElement = document.getElementById('score'); 
let score;

export function gameChooseLevel(lvl) {
  iLevel = lvl;
  console.log('choose level: ', lvl);
  // pause the game
  startTime = null;
}

export function gameReset(scene) {
  level = LVLS[iLevel - 1];
  playLevelMusic(iLevel - 1);
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
    // move objs
    obj.position.x += obj.velocity[0] * (timeElasped - obj.spawnTime)/ 1000;
    obj.position.y += obj.velocity[1] * (timeElasped - obj.spawnTime)/ 1000;
    obj.position.z += obj.velocity[2] * (timeElasped - obj.spawnTime)/ 1000;
    // judge eaten
    if (obj.canBeEaten(mouth)) {
      obj.lifetime = timeElasped - obj.spawnTime + obj.deadTime;
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
  scoreElement.innerHTML = 'Score: ' + score;
  return score;
}