var CiderAudio = {
    context : null,
    source : null,
    audioNodes : {
        gainNode : null,
        spatialNode : null,
        spatialInput: null,
        audioBands : null,
        preampNode : null,
        vibrantbassNode: null,
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
            try{
        CiderAudio.audioNodes.gainNode.disconnect(); } catch(e){}
        try{ CiderAudio.audioNodes.spatialNode.disconnect();} catch(e){}
        try{
            CiderAudio.audioNodes.preampNode.disconnect();
            CiderAudio.audioNodes.vibrantbassNode.disconnect();
            CiderAudio.audioNodes.audioBands[0].disconnect();
            CiderAudio.audioNodes.audioBands[9].disconnect();
        } catch(e){}
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
        if (app.cfg.audio.spatial){
            CiderAudio.spatialOn()
        }    
        CiderAudio.equalizer()
    },
    normalizerOn: function (){},
    normalizerOff: function (){
        CiderAudio.audioNodes.gainNode.gain.setTargetAtTime(1, CiderAudio.context.currentTime+ 1, 0.5);
    },
    spatialOn: function (){
        try{
        CiderAudio.audioNodes.gainNode.disconnect(CiderAudio.context.destination);} catch(e){}
        CiderAudio.audioNodes.spatialNode = new ResonanceAudio(CiderAudio.context);
        CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.context.destination);
        let roomDimensions = {
            width: 32,
            height: 12,
            depth: 32,
        };
        let roomMaterials = {
            // Room wall materials
            left: 'metal',
            right: 'metal',
            front: 'brick-bare',
            back: 'brick-bare',
            down: 'acoustic-ceiling-tiles',
            up: 'acoustic-ceiling-tiles',
        };
        CiderAudio.audioNodes.spatialNode.setRoomProperties(roomDimensions, roomMaterials);
        CiderAudio.audioNodes.spatialInput = CiderAudio.audioNodes.spatialNode.createSource();
        CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
    },
    spatialOff: function (){
        try{
        CiderAudio.audioNodes.spatialNode.output.disconnect(CiderAudio.context.destination);
        CiderAudio.audioNodes.gainNode.disconnect(CiderAudio.audioNodes.spatialInput.input);} catch(e){}
        CiderAudio.audioNodes.gainNode.connect(CiderAudio.context.destination);
    },
    sendAudio: function (){
        var options = {
            mimeType : 'audio/webm; codecs=opus'
          };
          var destnode =  CiderAudio.context.createMediaStreamDestination();
          CiderAudio.audioNodes.gainNode.connect(destnode)
          var mediaRecorder = new MediaRecorder(destnode.stream,options); 
          mediaRecorder.start(1);
          mediaRecorder.ondataavailable = function(e) {
            e.data.arrayBuffer().then(buffer => {  
                ipcRenderer.send('writeAudio',buffer)
            }
          );                   
        }
    },
    equalizer: function (){
        let BANDS = app.cfg.audio.equalizer.frequencies;
        let GAIN = app.cfg.audio.equalizer.gain;
        let Q = app.cfg.audio.equalizer.Q;
        let VIBRANTBASSBANDS = app.cfg.audio.vibrantBass.frequencies;
        let VIBRANTBASSGAIN = app.cfg.audio.vibrantBass.gain;
        let VIBRANTBASSQ = app.cfg.audio.vibrantBass.Q;
        CiderAudio.audioNodes.audioBands = []; CiderAudio.audioNodes.vibrantbassNode = [];

        for (i = 0; i < BANDS.length; i++) {
            CiderAudio.audioNodes.audioBands[i] = CiderAudio.context.createBiquadFilter();
            CiderAudio.audioNodes.audioBands[i].type = 'peaking'; // 'peaking';
            CiderAudio.audioNodes.audioBands[i].frequency.value = BANDS[i];
            CiderAudio.audioNodes.audioBands[i].Q.value = Q[i];
            CiderAudio.audioNodes.audioBands[i].gain.value = GAIN[i] * app.cfg.audio.equalizer.mix;
        }

        CiderAudio.audioNodes.preampNode = CiderAudio.context.createBiquadFilter();
        CiderAudio.audioNodes.preampNode.type = 'highshelf'; 
        CiderAudio.audioNodes.preampNode.frequency.value = 0; // allow all
        CiderAudio.audioNodes.preampNode.gain.value = app.cfg.audio.equalizer.preamp;

        for (i = 0; i < VIBRANTBASSBANDS.length; i++) {
            CiderAudio.audioNodes.vibrantbassNode[i] = CiderAudio.context.createBiquadFilter();
            CiderAudio.audioNodes.vibrantbassNode[i].type = 'peaking'; // 'peaking';
            CiderAudio.audioNodes.vibrantbassNode[i].frequency.value = VIBRANTBASSBANDS[i];
            CiderAudio.audioNodes.vibrantbassNode[i].Q.value = VIBRANTBASSQ[i];
            CiderAudio.audioNodes.vibrantbassNode[i].gain.value = VIBRANTBASSGAIN[i] * app.cfg.audio.vibrantBass.multiplier;
        }

        if (app.cfg.audio.spatial) {
            try{
            CiderAudio.audioNodes.spatialNode.output.disconnect(CiderAudio.context.destination); } catch(e){}
            CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.preampNode);
        } else {
            try{
            CiderAudio.audioNodes.gainNode.disconnect(CiderAudio.context.destination);} catch(e){}
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.preampNode);
        }

        CiderAudio.audioNodes.preampNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);

        for (i = 1; i < VIBRANTBASSBANDS.length; i ++) {
            CiderAudio.audioNodes.vibrantbassNode[i-1].connect(CiderAudio.audioNodes.vibrantbassNode[i]);
        }
        CiderAudio.audioNodes.vibrantbassNode[VIBRANTBASSBANDS.length-1].connect(CiderAudio.audioNodes.audioBands[0]);

        for (i = 1; i < BANDS.length; i ++) {
            CiderAudio.audioNodes.audioBands[i-1].connect(CiderAudio.audioNodes.audioBands[i]);
        }
        CiderAudio.audioNodes.audioBands[BANDS.length-1].connect(CiderAudio.context.destination);
    }

}
if (app.cfg.advanced.AudioContext){
    CiderAudio.init()
   
}