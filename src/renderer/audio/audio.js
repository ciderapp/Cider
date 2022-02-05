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
        llpw: null,
        llpwEnabled: null
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
            for (var i of CiderAudio.audioNodes.llpw){
                i.disconnect();
            }
            for (var i of CiderAudio.audioNodes.vibrantbassNode){
                i.disconnect();
            }
            for (var i of CiderAudio.audioNodes.audioBands){
                i.disconnect();
            }
        } catch(e){}
        try{
            CiderAudio.audioNodes = {
                gainNode : null,
                spatialNode : null,
                spatialInput: null,
                audioBands : null,
                preampNode : null,
                vibrantbassNode: null,
            }
        } catch (e) {}
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
        LLPW_Q = [5, 1, 3.536, 1.25, 8.409, 1.25, 14.14, 7.071, 5, 0.625, 16.82, 20, 20, 20, 28.28, 28.28, 28.28, 20, 33.64, 33.64, 10, 28.28, 7.071, 3.856];
        LLPW_GAIN = [0.38, -1.81, -0.23, -0.51, 0.4, 0.84, 0.36, -0.34, 0.27, -1.2, -0.42, -0.67, 0.81, 1.31, -0.71, 0.68, -1.04, 0.79, -0.73, -1.33, 1.17, 0.57, 0.35, 6.33];
        LLPW_FREQUENCIES = [16.452, 24.636, 37.134, 74.483, 159.54, 308.18, 670.21, 915.81, 1200.7, 2766.4, 2930.6, 4050.6, 4409.1, 5395.2, 5901.6, 6455.5, 7164.1, 7724.1, 8449, 10573, 12368, 14198, 17910, 18916];
        CiderAudio.audioNodes.audioBands = []; CiderAudio.audioNodes.vibrantbassNode = []; 
        CiderAudio.audioNodes.llpw = []; CiderAudio.audioNodes.llpwEnabled = 0;

        for (i = 0; i < BANDS.length; i++) {
            CiderAudio.audioNodes.audioBands[i] = CiderAudio.context.createBiquadFilter();
            CiderAudio.audioNodes.audioBands[i].type = 'peaking'; // 'peaking';
            CiderAudio.audioNodes.audioBands[i].frequency.value = BANDS[i];
            CiderAudio.audioNodes.audioBands[i].Q.value = Q[i];
            CiderAudio.audioNodes.audioBands[i].gain.value = GAIN[i] * app.cfg.audio.equalizer.mix;
        }
        
        for (i = 0; i < LLPW_FREQUENCIES.length; i++) {
            CiderAudio.audioNodes.llpw[i] = CiderAudio.context.createBiquadFilter();
            CiderAudio.audioNodes.llpw[i].type = 'peaking'; // 'peaking';
            CiderAudio.audioNodes.llpw[i].frequency.value = LLPW_FREQUENCIES[i];
            CiderAudio.audioNodes.llpw[i].Q.value = LLPW_Q[i];
            CiderAudio.audioNodes.llpw[i].gain.value = LLPW_GAIN[i] * app.cfg.audio.ciderPPE_value * CiderAudio.audioNodes.llpwEnabled; 
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
            CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.llpw[0]);
        } else {
            try{
            CiderAudio.audioNodes.gainNode.disconnect(CiderAudio.context.destination);} catch(e){}
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.llpw[0]);
        }

        for (i = 1; i < LLPW_FREQUENCIES.length; i ++) {
            CiderAudio.audioNodes.llpw[i-1].connect(CiderAudio.audioNodes.llpw[i]);
        }
        CiderAudio.audioNodes.llpw[LLPW_FREQUENCIES.length-1].connect(CiderAudio.audioNodes.preampNode);

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