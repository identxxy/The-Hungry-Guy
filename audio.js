const bgm = document.getElementById('bgm');
const effect = document.getElementById('soundEffect');
const loadingMusic = '/bgm/Loading.mp3';
const soundEffects = [
    '/effect/eat.wav'
];

let lvlMusics;

export function loadLevelAudios() {
    lvlMusics = [];
    lvlMusics.push('/bgm/lvl1.wav');
    lvlMusics.push('/bgm/lvl2.mp3');
    lvlMusics.push('/bgm/lvl3.mp3');
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