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
    normalizerOn: function (){
        let tuna = Tuna(CiderAudio.context)
         if (!CiderAudio.audioNodes.compressorNode){
         CiderAudio.audioNodes.compressorNode = new tuna.Compressor({
            threshold: -80,    //-100 to 0
            makeupGain: 5,     //0 and up (in decibels)
            attack: 2,         //0 to 1000
            release: 200,      //0 to 3000
            ratio: 8,          //1 to 20
            knee: 0,           //0 to 40
            automakeup: false, //true/false
            bypass: 0
        });
        }
        try{
        CiderAudio.audioNodes.gainNode.disconnect(CiderAudio.context.destination);
        } catch (e){}
        CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.compressorNode);
        CiderAudio.audioNodes.compressorNode.connect(CiderAudio.context.destination);
    },
    normalizerOff: function (){
        try{
        CiderAudio.audioNodes.compressorNode.disconnect();
        CiderAudio.audioNodes.compressorNode = null
        } catch (e){}
        CiderAudio.audioNodes.gainNode.connect(CiderAudio.context.destination);
    }

}
if (app.cfg.advanced.AudioContext){
    CiderAudio.init()
   
}