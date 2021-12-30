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
    off: function(){
        try{
        CiderAudio.audioNodes.gainNode.disconnect();
        CiderAudio.source.connect(CiderAudio.context.destination);} catch(e){}
    },
    connectContext: function (mediaElem){

        if (!CiderAudio.context){
        CiderAudio.context = new (window.AudioContext || window.webkitAudioContext);
        }
        if (!CiderAudio.source){
        CiderAudio.source = CiderAudio.context.createMediaElementSource(mediaElem);
        } else {try{CiderAudio.source.disconnect(CiderAudio.context.destination)}catch(e){}}
        CiderAudio.audioNodes.gainNode = CiderAudio.context.createGain()
        CiderAudio.source.connect(CiderAudio.audioNodes.gainNode);
        CiderAudio.audioNodes.gainNode.connect(CiderAudio.context.destination);
        if(app.cfg.audio.normalization){
            CiderAudio.normalizerOn()
        }
    },
    normalizerOn: function (){},
    normalizerOff: function (){
        CiderAudio.audioNodes.gainNode.gain.setTargetAtTime(1, CiderAudio.context.currentTime+ 1, 0.5);
    }

}
if (app.cfg.advanced.AudioContext){
    CiderAudio.init()
   
}