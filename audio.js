const audio = document.getElementById('audio');
const loadingMusic = require('./bgm/Loading.m4a');
const lvlMusics = [];
let mute = false;

export function loadLevelAudios() {
    lvlMusics.push(require('./bgm/lvl1.m4a'));
    lvlMusics.push(require('./bgm/lvl2.m4a'));
}

export function playLoadingMusic() {
    audio.src = loadingMusic;
    audio.loop = true;
    audio.load();
    audio.play();    
}

export function playLevelMusic(i) {
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
    audio.src = lvlMusics[i];
    audio.load();
    audio.play();
}

export function muteMusic(muted) {
    audio.muted = muted;
}