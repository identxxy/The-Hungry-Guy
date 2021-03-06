import { GameObject } from './object';
import { loadLevelAudios, playLevelMusic, playSoundEffect } from './audio';

let levels, level, iLevel;
let iter;
let objects;
let startTime;

const scoreElement = document.getElementById('score'); 
let score;

export function loadGameLevels() {
  loadLevelAudios();
  levels = [];
  levels.push( 'lvl1.json' );
  levels.push( 'lvl2.json' );
  levels.push( 'lvl3.json' );
}

export function gameChooseLevel(lvl) {
  iLevel = lvl;
  console.log('choose level: ', lvl);
  // pause the game
  startTime = null;
}

export async function gameReset(scene) {
  const response = await fetch(levels[iLevel-1]);
  level = await response.json();
  // level = JSON.parselevels[iLevel - 1];
  playLevelMusic(iLevel - 1);
  // clean up remainning objs
  if (objects) objects.forEach(obj => {
    scene.remove(obj);
    if(obj.constraint)
      scene.removeConstraint(obj.constraint);
  });
  objects = [];
  iter = 0;
  score = 0;
  startTime = new Date().getTime();
}

export function gameLogic(scene, mouth) {
  if (!startTime) return;
  let timeElasped = new Date().getTime() - startTime;
  // for each obj
  for (let i = 0; i < objects.length; ++i) {
    const obj = objects[i];
    // judge eaten
    if (obj.canBeEaten(mouth)) {
      const objScore = obj.score;
      score += objScore;
      playSoundEffect(objScore);
      scene.remove(obj);
      if(obj.constraint)
        scene.removeConstraint(obj.constraint);
      objects.splice(i, 1);
    }
    // judge taken
    if (obj.canBeTaken(timeElasped)) {
      obj.take();
    }
    // judge removed
    if (obj.canBeRemoved(timeElasped)) {
      scene.remove(obj);
      if(obj.constraint)
        scene.removeConstraint(obj.constraint);
      objects.splice(i, 1);
    }
  }
  // spawn objs
  for (let levelObj = level[iter]; iter < level.length && timeElasped > levelObj.spawnTime; levelObj = level[++iter]) {
    console.log('iter ', iter);
    const obj = new GameObject(levelObj);
    scene.add(obj);
    if (obj.addConstraint())
      scene.addConstraint(obj.constraint);
    obj.give();
    objects.push(obj);
  }
  scoreElement.innerHTML = 'Score: ' + score;
  return score;
}