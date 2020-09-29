/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';

const videoElement = document.querySelector('video');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [videoSelect];


function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      console.log('Camera found: ', option.text);
      console.log('Device info: ', deviceInfo);
      console.log('Available constraints with camera:', navigator.mediaDevices.getSupportedConstraints());
      videoSelect.appendChild(option);
    } else {
    //  console.log('Device info: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}



function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;

  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('Error: ', error.message, error.name);
}


function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const videoSource = videoSelect.value;
  const constraints = {
    audio: false,
    video: {
      width: {
        max: 1920,
        ideal: 1920
      },
      height: {
        max: 1080,
        ideal: 1080
      },
      aspectRatio: 16/9,
      resizeMode: 'crop-and-scale',
      deviceId: videoSource ? {exact: videoSource} : undefined
    }
  };
  console.log('Using camera source ID:', videoSource);
  console.log('Requesting constraints:', constraints);
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);

}

videoSelect.onchange = start;

async function getCamera(){
  console.log('Opening camera');
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const constraints = window.constraints = {
      audio: false,
      video: true
    };

  const stream = navigator.mediaDevices.getUserMedia(constraints);

  console.log('Got stream with constraints:', constraints);
  window.stream = stream; // make variable available to browser console
  videoElement.srcObject = stream;



  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function getDevices(){
  console.log('Finding devices');
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
  document.getElementById("showCMSVideo").disabled = false;

}


async function init(e) {
  try {
    console.log('Calling getUserMedia()');
    start()
  }
  catch (e) {
    handleError(e);
  }
}

document.getElementById("showCMSVideo").disabled = true;

document.querySelector('#showCMSVideo').addEventListener('click', e => init(e));
// document.querySelector('#showVideo').addEventListener('click', getCamera);
document.querySelector('#getDevices').addEventListener('click', getDevices);
