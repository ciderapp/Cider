var CiderAudio = {
    context : null,
    source : null,
    audioNodes : {
        gainNode : null,
        compressorNode : null,
    },
    init: function (cb = function () { }) {
        //AudioOutputs.fInit = true;
        searchInt = setInterval(function () {
          if (document.getElementById("apple-music-player")) {
            //AudioOutputs.eqReady = true;
            document.getElementById("apple-music-player").crossOrigin = "anonymous";
            CiderAudio.connectContext(document.getElementById("apple-music-player"), 0);
    
            cb();
            clearInterval(searchInt);
          }
        }, 1000);
    },
    connectContext: function (mediaElem){
        CiderAudio.context = new (window.AudioContext || window.webkitAudioContext);
        CiderAudio.source = CiderAudio.context.createMediaElementSource(mediaElem);
        CiderAudio.audioNodes.gainNode = CiderAudio.context.createGain()
        CiderAudio.source.connect(CiderAudio.audioNodes.gainNode);
        CiderAudio.audioNodes.gainNode.connect(CiderAudio.context.destination);
        if(app.cfg.audio.normalization){
            CiderAudio.normalizerOn()
        }
    },
    normalizerOn: function (){},
    normalizerOff: function (){
        CiderAudio.audioNodes.gainNode.gain.value = 1;
    }

}
if (app.cfg.advanced.AudioContext){
    CiderAudio.init()
   
}