var CiderAudio = {
    context : null,
    source : null,
    audioNodes : {
        gainNode : null,
        spatialNode : null,
        spatialInput: null,
        audioBands : null,
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
        CiderAudio.audioNodes.spatialNode.disconnect();
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
        CiderAudio.audioNodes.audioBands = {};

        BANDS.forEach((band, i) => {
        const filter = CiderAudio.context.createBiquadFilter();

        CiderAudio.audioNodes.audioBands[i] = filter;

        if (i === 0) {
            // The first filter, includes all lower frequencies
            filter.type = "lowshelf";
        } else if (i === BANDS.length - 1) {
            // The last filter, includes all higher frequencies
            filter.type = "highshelf";
        } else {
            filter.type = "peaking";
        }
        filter.frequency.value = BANDS[i];
        filter.gain.value = GAIN[i];
        filter.Q.value = Q[i];
        if (i == 0){
            if (app.cfg.audio.spatial) {
                CiderAudio.audioNodes.spatialNode.output.disconnect(CiderAudio.context.destination);
                CiderAudio.audioNodes.spatialNode.output.connect(filter);
            } else {
                CiderAudio.audioNodes.gainNode.disconnect(CiderAudio.context.destination);
                CiderAudio.audioNodes.gainNode.connect(filter);
            }
        } else if (i === BANDS.length - 1) {
            CiderAudio.audioNodes.audioBands[i - 1].connect(filter);
        } else {
            CiderAudio.audioNodes.audioBands[i - 1].connect(filter);
            filter.connect(CiderAudio.context.destination);
        }

        });
    }

}
if (app.cfg.advanced.AudioContext){
    CiderAudio.init()
   
}