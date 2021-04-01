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

import {TRIANGULATION} from './triangulation';

import * as THREE from 'three'

const NUM_KEYPOINTS = 468;
const NUM_IRIS_KEYPOINTS = 5;
const GREEN = '#32EEDB';
const RED = "#FF2C35";
const BLUE = "#157AB3";

function isMobile() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isAndroid || isiOS;
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function drawPath(ctx, points, closePath) {
  const region = new Path2D();
  region.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
  }

  if (closePath) {
    region.closePath();
  }
  ctx.stroke(region);
}

let model, videoWidth, videoHeight, video, rafID, cube, faceMesh;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const faceMaterial = new THREE.PointsMaterial( { color: 0xffffff, size: 10 } );

const VIDEO_SIZE = 500;
const mobile = isMobile();
// Don't render the point cloud on mobile in order to maximize performance and
// to avoid crowding limited screen space.
const renderPointcloud = mobile === false;
const stats = new Stats();
const state = {
  backend: 'webgl',
  maxFaces: 1,
  triangulateMesh: true,
  predictIrises: true
};

function setupDatGui() {
  const gui = new dat.GUI();
  gui.add(state, 'maxFaces', 1, 20, 1).onChange(async val => {
    model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      {maxFaces: val});
  });

  gui.add(state, 'triangulateMesh');
  gui.add(state, 'predictIrises');

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
  stats.begin();

  const predictions = await model.estimateFaces({
    input: video,
    returnTensors: false,
    flipHorizontal: false,
    predictIrises: state.predictIrises
  });

  if (predictions.length > 0) {
    faceMesh.geometry.dispose();
    const geometry = new THREE.BufferGeometry();
    const points = new Float32Array(predictions[0].scaledMesh.flat());
    geometry.setAttribute( 'position', new THREE.BufferAttribute( points, 3 ) );
    faceMesh.geometry = geometry;
  }

  //   predictions.forEach(prediction => {
  //     const keypoints = prediction.scaledMesh;

  //     if (state.triangulateMesh) {
  //       ctx.strokeStyle = GREEN;
  //       ctx.lineWidth = 0.5;

  //       for (let i = 0; i < TRIANGULATION.length / 3; i++) {
  //         const points = [
  //           TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
  //           TRIANGULATION[i * 3 + 2]
  //         ].map(index => keypoints[index]);

  //         drawPath(ctx, points, true);
  //       }
  //     } else {
  //       ctx.fillStyle = GREEN;

  //       for (let i = 0; i < NUM_KEYPOINTS; i++) {
  //         const x = keypoints[i][0];
  //         const y = keypoints[i][1];

  //         ctx.beginPath();
  //         ctx.arc(x, y, 1 /* radius */, 0, 2 * Math.PI);
  //         ctx.fill();
  //       }
  //     }

  //     if(keypoints.length > NUM_KEYPOINTS) {
  //       ctx.strokeStyle = RED;
  //       ctx.lineWidth = 1;

  //       const leftCenter = keypoints[NUM_KEYPOINTS];
  //       const leftDiameterY = distance(
  //         keypoints[NUM_KEYPOINTS + 4],
  //         keypoints[NUM_KEYPOINTS + 2]);
  //       const leftDiameterX = distance(
  //         keypoints[NUM_KEYPOINTS + 3],
  //         keypoints[NUM_KEYPOINTS + 1]);

  //       ctx.beginPath();
  //       ctx.ellipse(leftCenter[0], leftCenter[1], leftDiameterX / 2, leftDiameterY / 2, 0, 0, 2 * Math.PI);
  //       ctx.stroke();

  //       if(keypoints.length > NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS) {
  //         const rightCenter = keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS];
  //         const rightDiameterY = distance(
  //           keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 2],
  //           keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 4]);
  //         const rightDiameterX = distance(
  //           keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 3],
  //           keypoints[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 1]);

  //         ctx.beginPath();
  //         ctx.ellipse(rightCenter[0], rightCenter[1], rightDiameterX / 2, rightDiameterY / 2, 0, 0, 2 * Math.PI);
  //         ctx.stroke();
  //       }
  //     }
  //   });

    // if (renderPointcloud && state.renderPointcloud && scatterGL != null) {
    //   const pointsData = predictions.map(prediction => {
    //     let scaledMesh = prediction.scaledMesh;
    //     return scaledMesh.map(point => ([-point[0], -point[1], -point[2]]));
    //   });

    //   let flattenedPointsData = [];
    //   for (let i = 0; i < pointsData.length; i++) {
    //     flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
    //   }
    //   const dataset = new ScatterGL.Dataset(flattenedPointsData);

    //   if (!scatterGLHasInitialized) {
    //     scatterGL.setPointColorer((i) => {
    //       if(i % (NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS * 2) > NUM_KEYPOINTS) {
    //         return RED;
    //       }
    //       return BLUE;
    //     });
    //     scatterGL.render(dataset);
    //   } else {
    //     scatterGL.updateDataset(dataset);
    //   }
    //   scatterGLHasInitialized = true;
    // }
  // }

  stats.end();
  // rafID = requestAnimationFrame(renderPrediction);
};

function animate() {
  // cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;
  renderPrediction();
	renderer.render( scene, camera );
	rafID = requestAnimationFrame( animate );
}

async function main() {
  // await tf.setBackend(state.backend);
  setupDatGui();

  stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
  document.getElementById('main').appendChild(stats.dom);

  await setupCamera();
  video.play();
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  // const boxgeometry = new THREE.BoxGeometry();
  // const boxmaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // cube = new THREE.Mesh( boxgeometry, boxmaterial );
  // scene.add( cube );
  camera.position.z = 500;
  camera.rotateZ(3.1415926);

  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
    {maxFaces: state.maxFaces});

  faceMesh = new THREE.Points( new THREE.BufferGeometry().setFromPoints([]), faceMaterial );
  scene.add(faceMesh);


  // renderPrediction();
  animate();

};

main();
