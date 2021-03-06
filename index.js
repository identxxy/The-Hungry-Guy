/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import Stats from 'stats.js';
import * as tf from '@tensorflow/tfjs-core';
import * as THREE from 'three'
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

import { TRIANGULATION } from './triangulation';
import { UV_COORDS } from './uv_coords';

import { loadGameLevels, gameLogic, gameReset, gameChooseLevel } from './logic';
import { playLoadingMusic, muteMusic } from './audio';
import { requireAllTextures, getFaceMaterial, loadAllObjects, objLoader, mtlLoader, getGameOBJ } from './loader';

const NUM_KEYPOINTS = 468;
const NUM_IRIS_KEYPOINTS = 5;
const PI = 3.1415926;

function isMobile() {
  return false;
  /*const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isAndroid || isiOS;*/
}

// elements settings
let video, score, rafID;
video = document.getElementById('video');
score = document.getElementById('score');
const docStyle = getComputedStyle(document.documentElement);
const videoWidth = parseInt(docStyle.getPropertyValue('--video-width'), 10);
const videoHeight = parseInt(docStyle.getPropertyValue('--video-height'), 10);
const canvasWidth = parseInt(docStyle.getPropertyValue('--canvas-width'), 10);
const canvasHeight = parseInt(docStyle.getPropertyValue('--canvas-height'), 10);
// Physi.js settings
const scene = new Physijs.Scene();
scene.setGravity(new THREE.Vector3(0, -10 * myMeter, 0));
// three.js settings
const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ canvas: mainCanvas, alpha: true });
renderer.setClearColor(new THREE.Color(0xffffff));
renderer.setClearAlpha(0.7);
renderer.setSize(canvasWidth, canvasHeight);
renderer.antialias = true;
// faceMesh setting
let model, faceMesh;

// Don't render the point cloud on mobile in order to maximize performance and
// to avoid crowding limited screen space.
const mobile = isMobile();
// stats
const stats = new Stats();
const state = {
  faceType: 1,
  mute: false,
  showVideo: true,
  gameLevel: 1
};

function setupDatGui() {
  const gui = new dat.GUI();
  gui.add(state, 'faceType', 1, 7, 1).onChange(async val => {
    faceMesh.material = getFaceMaterial(val);
  });
  gui.add(state, 'gameLevel', 1, 3, 1).onChange(async val => {
    gameChooseLevel(val);
  });
  // initial choice
  gameChooseLevel(1);

  gui.add(state, 'mute').onChange(async val => {
    muteMusic(val);
  })
  gui.add(state, 'showVideo').onChange(async val => {
    video.style.display = state.showVideo ? 'inline' : 'none';
  });
  const startButton = { Start: function () { console.log("game start!"); gameReset(scene); } };
  gui.add(startButton, 'Start');
}

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      // Only setting the video to a specified size in order to accommodate a
      // point cloud, so on mobile devices accept the default size.
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight
    },
  });
  video.srcObject = stream;
  video.play();

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function setupLight() {
    var light = new THREE.PointLight("#ffffff");
    light.position.set(100, 100, 30);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    var pointLight = new THREE.PointLight("#ffffff");
    pointLight.position.set(-100, 100, 100);
    scene.add(pointLight);
}

async function renderPrediction() {

  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: false,
    predictIrises: true
  });

  if (predictions.length > 0) {
    faceMesh.geometry.dispose();
    const geometry = new THREE.BufferGeometry();
    var points = new Float32Array(TRIANGULATION.length * 3);
    var points_uv = new Float32Array(TRIANGULATION.length * 2);
    for (var i = 0; i < TRIANGULATION.length; i++) {
      const index = TRIANGULATION[i];
      points[i * 3] = (predictions[0].scaledMesh[index].flat())[0];
      points[i * 3 + 1] = (predictions[0].scaledMesh[index].flat())[1];
      // points[i * 3 + 2] = (predictions[0].scaledMesh[index].flat())[2];

      points_uv[i * 2] = (UV_COORDS[index])[0];
      points_uv[i * 2 + 1] = (UV_COORDS[index])[1];
    }
    //const points = new Float32Array(predictions[0].scaledMesh.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(points_uv, 2));
    faceMesh.geometry = geometry;
    const annotation = predictions[0].annotations;
    const up = annotation.lipsUpperInner[5];
    up[0] = videoWidth / 2 - up[0];
    up[1] = videoHeight / 2 - up[1];
    const low = annotation.lipsLowerInner[5];
    low[0] = videoWidth / 2 - low[0];
    low[1] = videoHeight / 2 - low[1];
    const left = annotation.lipsLowerInner[10];
    left[0] = videoWidth / 2 - left[0];
    left[1] = videoHeight / 2 - left[1];
    const right = annotation.lipsLowerInner[0];
    right[0] = videoWidth / 2 - right[0];
    right[1] = videoHeight / 2 - right[1];
    const mouth = {
      up: up,
      low: low,
      left: left,
      right: right
    }
    return mouth;
  }
  faceMesh.geometry.dispose();
  faceMesh.geometry = new THREE.BufferGeometry().setFromPoints([]);
};

async function animate() {
  stats.begin();
  const mouth = await renderPrediction();
  // const mouth = null;
  gameLogic(scene, mouth);
  scene.simulate();
  renderer.render(scene, camera);
  stats.end();
  rafID = requestAnimationFrame(animate);
}

function loadScene(){
  const tableMaterial = Physijs.createMaterial(
    new THREE.MeshBasicMaterial({color: 0x00ff00, transparent:true, opacity: 0.0}),
    0.5,
    0.2
  );
  const tableCollision = new Physijs.BoxMesh(
    new THREE.BoxGeometry(500, 1, 600),
    tableMaterial
  );
  tableCollision.position.z = 200
  tableCollision.position.y = -110;
  tableCollision.mass = 0;
  scene.add(tableCollision);
}


async function main() {
  // bgm
  playLoadingMusic();
  // gui
  setupDatGui();
  stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
  document.getElementById('main').appendChild(stats.dom);
  loadAllObjects(scene);
  loadScene();
  // real camera
  await setupCamera();
  //set up light
  await setupLight();
  // game levels
  await loadGameLevels();
  // load texture picture
  await requireAllTextures();
  // tfjs 
  await tf.setBackend('webgl');
  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: state.maxFaces });

  // three.js camera
  camera.position.z = 500;
  faceMesh = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([]), getFaceMaterial());
  faceMesh.rotateZ(PI);
  faceMesh.position.x = videoWidth / 2;
  faceMesh.position.y = videoHeight / 2;
  scene.add(faceMesh);
  //load all objs

  score = document.getElementById("score");
  score.innerHTML = "Detecting face...";
  while (true) {
    let mouth = await renderPrediction();
    if (mouth != null) break;
  }
  score.innerHTML = "Are YOU Ready?";
  animate();

};

main();
