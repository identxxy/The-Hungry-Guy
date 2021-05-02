const bgm = document.getElementById('bgm');
const effect = document.getElementById('soundEffect');
const loadingMusic = '/bgm/Loading.mp3';
const soundEffects = [
    '/effect/eat.wav',
    '/effect/yue.wav',
    '/effect/ah.wav'
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

export function playSoundEffect(score){
    switch (score){
        case 10: effect.src = soundEffects[0];break;
        case -10: effect.src = soundEffects[1];break;
        case -20: effect.src = soundEffects[2];break;
    }
    effect.play();
}

export function muteMusic(muted) {
    bgm.muted = muted;
    effect.muted = muted;
}