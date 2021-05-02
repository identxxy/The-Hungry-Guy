const bgm = document.getElementById('bgm');
const effect = document.getElementById('soundEffect');
const loadingMusic = require('./music/bgm/Loading.mp3');
const soundEffects = [
    require('./music/effect/eat.wav')
];

let lvlMusics;

export function loadLevelAudios() {
    lvlMusics = [];
    lvlMusics.push(require('./music/bgm/lvl1.mp3'));
    lvlMusics.push(require('./music/bgm/lvl2.mp3'));
    lvlMusics.push(require('./music/bgm/lvl3.mp3'));
    effect.loop = false;
}

export function playLoadingMusic() {
    bgm.src = loadingMusic;
    bgm.loop = true;
    bgm.load();
    bgm.play();    
}

export function playLevelMusic(i) {
    bgm.pause();
    bgm.currentTime = 0;
    bgm.loop = false;
    bgm.src = lvlMusics[i];
    bgm.load();
    bgm.play();
}

export function playSoundEffect(i){
    effect.src = soundEffects[i];
    effect.play();
}

export function muteMusic(muted) {
    bgm.muted = muted;
}