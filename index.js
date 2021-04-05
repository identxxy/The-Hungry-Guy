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
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

import { TRIANGULATION } from './triangulation';

import * as THREE from 'three';

import { gameLogic, gameReset } from './logic';

const NUM_KEYPOINTS = 468;
const NUM_IRIS_KEYPOINTS = 5;
const PI = 3.1415926;

function isMobile() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isAndroid || isiOS;
}

let model, videoWidth, videoHeight, video, rafID, faceMesh;
// three.js settings
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ canvas: mainCanvas, alpha: true });
renderer.setClearColor(new THREE.Color(0xffffff));
renderer.setClearAlpha(0.7);
renderer.setSize(window.innerWidth, window.innerHeight);
const faceMaterial = new THREE.MeshLambertMaterial({ color: 0x000000, wireframe: true});

const VIDEO_SIZE = 500;
const mobile = isMobile();
// Don't render the point cloud on mobile in order to maximize performance and
// to avoid crowding limited screen space.
const stats = new Stats();
const state = {
  backend: 'webgl',
  maxFaces: 1,
  debug: false,
};

function setupDatGui() {
  const gui = new dat.GUI();
  gui.add(state, 'maxFaces', 1, 20, 1).onChange(async val => {
    model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: val });
  });

  gui.add(state, 'debug');
  const obj = { Start: function () { console.log("game start!"); gameReset(scene); } };
  gui.add(obj, 'Start');
}

async function setupCamera() {
  video = document.getElementById('video');

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      // Only setting the video to a specified size in order to accommodate a
      // point cloud, so on mobile devices accept the default size.
      width: mobile ? undefined : VIDEO_SIZE,
      height: mobile ? undefined : VIDEO_SIZE
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
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
      var points = new Float32Array(TRIANGULATION.length*3);
      for (var i = 0; i < TRIANGULATION.length; i++) {
          const index = TRIANGULATION[i];
          points[i * 3] = (predictions[0].scaledMesh[index].flat())[0];
          points[i * 3 + 1] = (predictions[0].scaledMesh[index].flat())[1];
          points[i * 3 + 2] = (predictions[0].scaledMesh[index].flat())[2];
      }
      //const points = new Float32Array(predictions[0].scaledMesh.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
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
  gameLogic(scene, mouth, state);
  renderer.render(scene, camera);
  stats.end();
  rafID = requestAnimationFrame(animate);
}

async function main() {
  await tf.setBackend(state.backend);
  setupDatGui();

  stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
  document.getElementById('main').appendChild(stats.dom);

  await setupCamera();
  video.play();
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  camera.position.z = 500;

  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    { maxFaces: state.maxFaces });

  faceMesh = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([]), faceMaterial);
  faceMesh.rotateZ(PI);
  faceMesh.position.x = videoWidth / 2;
  faceMesh.position.y = videoHeight / 2;
  scene.add(faceMesh);

  animate();

};

main();
