var CiderAudio = {
    context : null,
    source : null,
    audioNodes : {
        gainNode : null,
        spatialNode : null,
        spatialInput: null,
        audioBands : null,
        vibrantbassNode: null,
        llpw: null,
        llpwEnabled: null,
        analogWarmth: null
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
            for (var i of CiderAudio.audioNodes.analogWarmth){
                i.disconnect();
            }
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
                vibrantbassNode: null,
                llpw: null,
                llpwEnabled: null,
                analogWarmth: null
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
        if (app.cfg.audio.maikiwiAudio.spatial === true) { 
        CiderAudio.audioNodes.spatialNode = CiderAudio.context.createConvolver();

        fetch('./audio/CiderSpatial_Conv.wav').then(async (impulseData) => {
            let bufferedImpulse = await impulseData.arrayBuffer();
            CiderAudio.audioNodes.spatialNode.buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);    
            
        });
        CiderAudio.audioNodes.spatialNode.normalize = true;
        CiderAudio.audioNodes.spatialNode.connect(CiderAudio.context.destination);
        }
        else {
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
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);}
    },
    spatialOff: function (){
        CiderAudio.hierarchical_loading();
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
    analogWarmth_h2_3: function (status, hierarchy){ 
        if (status === true) { // 23 Band Adjustment 
            let WARMTH_FREQUENCIES = [10.513, 15.756, 224.01, 677.77, 1245.4, 2326.8, 2847.3, 4215.3, 11057, 12793, 16235, 16235, 17838, 18112, 18112, 19326, 19372, 19372, 20061, 20280, 20280, 20853, 22276];
            let WARMTH_GAIN = [-4.81, 0.74, 0.55, -0.84, -1.52, 0.84, 0.66, -0.29, 0.29, 0.94, 1.67, 1.62, -0.53, -0.81, -4.98, 1.43, 0.86, 1.13, -1.06, -0.95, -1.13, 1.78, -3.86];
            let WARMTH_Q = [0.442, 3.536, 2.102, 8.409, 0.625, 16.82, 5, 2.973, 3.536, 2.5, 2.5, 11.89, 0.625, 1.487, 1.153, 5, 5.453, 5, 2.973, 3.386, 3.386, 14.14, 8.409];
            CiderAudio.audioNodes.analogWarmth = []
            
            
            for (i = 0; i < WARMTH_FREQUENCIES.length; i++) {
                CiderAudio.audioNodes.analogWarmth[i] = CiderAudio.context.createBiquadFilter();
                CiderAudio.audioNodes.analogWarmth[i].type = 'peaking'; // 'peaking';
                CiderAudio.audioNodes.analogWarmth[i].frequency.value = WARMTH_FREQUENCIES[i];
                CiderAudio.audioNodes.analogWarmth[i].Q.value = WARMTH_Q[i];
                CiderAudio.audioNodes.analogWarmth[i].gain.value = WARMTH_GAIN[i] * app.cfg.audio.maikiwiAudio.analogWarmth_value; 
            }
    
            for (i = 1; i < WARMTH_FREQUENCIES.length; i ++) {
                CiderAudio.audioNodes.analogWarmth[i-1].connect(CiderAudio.audioNodes.analogWarmth[i]);
            }

            switch (hierarchy) { 
                case 3:
                    try{
                        CiderAudio.audioNodes.analogWarmth[WARMTH_FREQUENCIES.length-1].connect(CiderAudio.audioNodes.llpw[0]);} catch(e){}
                    break;
                case 2:
                    try{
                        CiderAudio.audioNodes.analogWarmth[WARMTH_FREQUENCIES.length-1].connect(CiderAudio.audioNodes.vibrantbassNode[0]);} catch(e){}
                    break;
                case 1:
                    try{
                        CiderAudio.audioNodes.analogWarmth[WARMTH_FREQUENCIES.length-1].connect(CiderAudio.audioNodes.audioBands[0]);} catch(e){}
                    break;
                    }
            
    
        }
    },
    llpw_h2_2: function (status, hierarchy){ 
        if (status === true) { 
        let LLPW_Q = [5, 1, 3.536, 1.25, 8.409, 1.25, 14.14, 7.071, 5, 0.625, 16.82, 20, 20, 20, 28.28, 28.28, 28.28, 20, 33.64, 33.64, 10, 28.28, 7.071, 3.856];
        let LLPW_GAIN = [0.38, -1.81, -0.23, -0.51, 0.4, 0.84, 0.36, -0.34, 0.27, -1.2, -0.42, -0.67, 0.81, 1.31, -0.71, 0.68, -1.04, 0.79, -0.73, -1.33, 1.17, 0.57, 0.35, 6.33];
        let LLPW_FREQUENCIES = [16.452, 24.636, 37.134, 74.483, 159.54, 308.18, 670.21, 915.81, 1200.7, 2766.4, 2930.6, 4050.6, 4409.1, 5395.2, 5901.6, 6455.5, 7164.1, 7724.1, 8449, 10573, 12368, 14198, 17910, 18916];
        CiderAudio.audioNodes.llpw = []
        
        for (i = 0; i < LLPW_FREQUENCIES.length; i++) {
            CiderAudio.audioNodes.llpw[i] = CiderAudio.context.createBiquadFilter();
            CiderAudio.audioNodes.llpw[i].type = 'peaking'; // 'peaking';
            CiderAudio.audioNodes.llpw[i].frequency.value = LLPW_FREQUENCIES[i];
            CiderAudio.audioNodes.llpw[i].Q.value = LLPW_Q[i];
            CiderAudio.audioNodes.llpw[i].gain.value = LLPW_GAIN[i] * app.cfg.audio.maikiwiAudio.ciderPPE_value; 
        }

        for (i = 1; i < LLPW_FREQUENCIES.length; i ++) {
            CiderAudio.audioNodes.llpw[i-1].connect(CiderAudio.audioNodes.llpw[i]);
        }

        switch (hierarchy) {  
            case 2: 
            try{
                CiderAudio.audioNodes.llpw[LLPW_FREQUENCIES.length-1].connect(CiderAudio.audioNodes.vibrantbassNode[0]);} catch(e){}
                break;
            case 1:
                try{CiderAudio.audioNodes.llpw[LLPW_FREQUENCIES.length-1].connect(CiderAudio.audioNodes.audioBands[0]);} catch(e){}
                break;

        }
        } 

    },
    vibrantbass_h2_1: function (status){ 
        if (status === true) { 
        let VIBRANTBASSBANDS = app.cfg.audio.maikiwiAudio.vibrantBass.frequencies;
        let VIBRANTBASSGAIN = app.cfg.audio.maikiwiAudio.vibrantBass.gain;
        let VIBRANTBASSQ = app.cfg.audio.maikiwiAudio.vibrantBass.Q;
        CiderAudio.audioNodes.vibrantbassNode = []
        
        for (i = 0; i < VIBRANTBASSBANDS.length; i++) {
            CiderAudio.audioNodes.vibrantbassNode[i] = CiderAudio.context.createBiquadFilter();
            CiderAudio.audioNodes.vibrantbassNode[i].type = 'peaking'; // 'peaking';
            CiderAudio.audioNodes.vibrantbassNode[i].frequency.value = VIBRANTBASSBANDS[i];
            CiderAudio.audioNodes.vibrantbassNode[i].Q.value = VIBRANTBASSQ[i];
            CiderAudio.audioNodes.vibrantbassNode[i].gain.value = VIBRANTBASSGAIN[i] * app.cfg.audio.maikiwiAudio.vibrantBass.multiplier;
        }

        for (i = 1; i < VIBRANTBASSBANDS.length; i ++) {
            CiderAudio.audioNodes.vibrantbassNode[i-1].connect(CiderAudio.audioNodes.vibrantbassNode[i]);
        }

        CiderAudio.audioNodes.vibrantbassNode[VIBRANTBASSBANDS.length-1].connect(CiderAudio.audioNodes.audioBands[0]);
        }
        
    },
    hierarchical_unloading: function (){
        try {CiderAudio.audioNodes.spatialNode.output.disconnect();} catch(e){}
        try {CiderAudio.audioNodes.spatialNode.disconnect();} catch(e){}
        try {CiderAudio.audioNodes.gainNode.disconnect();} catch(e){}
        try {for (var i of CiderAudio.audioNodes.analogWarmth){i.disconnect();} CiderAudio.audioNodes.analogWarmth = []} catch(e){}
        try {for (var i of CiderAudio.audioNodes.llpw){i.disconnect();} CiderAudio.audioNodes.llpw = []} catch(e){}
        try {for (var i of CiderAudio.audioNodes.vibrantbassNode){i.disconnect();} CiderAudio.audioNodes.vibrantbassNode = []} catch(e){}

        console.log("[Cider][Audio] Finished hierarchical unloading");
        
    },
    hierarchical_loading: function (){ 
        CiderAudio.hierarchical_unloading();

        // Vibrant Bass, CAP, Analog Warmth, Spatial
        if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier !== 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === true && 
            app.cfg.audio.spatial === true &&
            app.cfg.audio.maikiwiAudio.analogWarmth === true) { 

            CiderAudio.vibrantbass_h2_1(true)
            CiderAudio.llpw_h2_2(true, 2); 
            CiderAudio.analogWarmth_h2_3(true, 3); 

            if (app.cfg.audio.maikiwiAudio.spatial === true) {  
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                console.log('[Cider][Audio] Vibrant Bass, CAP, Analog Warmth, Maikiwi Spatial')
            }
            else {
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                console.log('[Cider][Audio] Vibrant Bass, CAP, Analog Warmth, Spatial')
            }
        }
        // Vibrant Bass, CAP, Spatial
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier !== 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === true && 
            app.cfg.audio.spatial === true &&
            app.cfg.audio.maikiwiAudio.analogWarmth === false) { 

            CiderAudio.vibrantbass_h2_1(true)
            CiderAudio.llpw_h2_2(true, 2); 
            if (app.cfg.audio.maikiwiAudio.spatial === true) {  
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.llpw[0]);
                console.log('[Cider][Audio] Vibrant Bass, CAP, Maikiwi Spatial')
            }
            else {
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.llpw[0]);
                console.log('[Cider][Audio] Vibrant Bass, CAP, Spatial')
            }
            
        }
        // Vibrant Bass, CAP, Analog Warmth
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier !== 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === true && 
            app.cfg.audio.spatial === false &&
            app.cfg.audio.maikiwiAudio.analogWarmth === true) { 

            CiderAudio.vibrantbass_h2_1(true)
            CiderAudio.llpw_h2_2(true, 2); 
            CiderAudio.analogWarmth_h2_3(true, 3); 
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
            console.log('[Cider][Audio] Vibrant Bass, CAP, Analog Warmth')
        }
        // CAP, Spatial
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier === 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === true && 
            app.cfg.audio.spatial === true &&
            app.cfg.audio.maikiwiAudio.analogWarmth === false) {  

            CiderAudio.llpw_h2_2(true, 1);
            if (app.cfg.audio.maikiwiAudio.spatial === true) {  
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.llpw[0]);
                console.log('[Cider][Audio] Maikiwi Spatial')
            }
            else {
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.llpw[0]);
                console.log('[Cider][Audio] CAP, Spatial')
            }
        }
        // Analog Warmth, Spatial
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier === 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === false && 
            app.cfg.audio.spatial === true &&
            app.cfg.audio.maikiwiAudio.analogWarmth === true) {  

            CiderAudio.analogWarmth_h2_3(true, 1); 
            if (app.cfg.audio.maikiwiAudio.spatial === true) {  
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                console.log('[Cider][Audio] Analog Warmth, Maikiwi Spatial')
            }
            else {
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                console.log('[Cider][Audio] Analog Warmth, Spatial')
            }
        }
        // CAP, Analog Warmth
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier === 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === true && 
            app.cfg.audio.spatial === false &&
            app.cfg.audio.maikiwiAudio.analogWarmth === true) { 

            CiderAudio.llpw_h2_2(true, 1);
            CiderAudio.analogWarmth_h2_3(true, 3); 
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
            console.log('[Cider][Audio] CAP and Analog Warmth')
        }
         // Vibrant Bass, Analog Warmth
         else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier !== 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === false && 
            app.cfg.audio.spatial === false &&
            app.cfg.audio.maikiwiAudio.analogWarmth === true) { 

            CiderAudio.vibrantbass_h2_1(true)
            CiderAudio.analogWarmth_h2_3(true, 2); 
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
            console.log('[Cider][Audio] Vibrant Bass, Analog Warmth')
        }

        // Vibrant Bass, CAP
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier !== 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === true && 
            app.cfg.audio.spatial === false &&
            app.cfg.audio.maikiwiAudio.analogWarmth === false) { 

            CiderAudio.vibrantbass_h2_1(true)
            CiderAudio.llpw_h2_2(true, 2); 
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.llpw[0]);
            console.log('[Cider][Audio] Vibrant Bass, CAP')
        }
        // Vibrant Bass, Spatial
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier !== 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === false && 
            app.cfg.audio.spatial === true &&
            app.cfg.audio.maikiwiAudio.analogWarmth === false) {  

            CiderAudio.vibrantbass_h2_1(true)
            if (app.cfg.audio.maikiwiAudio.spatial === true) {  
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                console.log('[Cider][Audio] Vibrant Bass, Maikiwi Spatial')
            }
            else {
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                console.log('[Cider][Audio] Vibrant Bass, Spatial')
            }

        }
        // Vibrant Bass
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier !== 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === false && 
            app.cfg.audio.spatial === false &&
            app.cfg.audio.maikiwiAudio.analogWarmth === false) {  
            CiderAudio.vibrantbass_h2_1(true)
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
            console.log('[Cider][Audio] Vibrant Bass')
        }
        // CAP
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier === 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === true && 
            app.cfg.audio.spatial === false &&
            app.cfg.audio.maikiwiAudio.analogWarmth === false) {  
            CiderAudio.llpw_h2_2(true, 1); 
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.llpw[0]);
            console.log('[Cider][Audio] CAP')
        }
        // Analog Warmth
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier === 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === false && 
            app.cfg.audio.maikiwiAudio.spatial === false &&
            app.cfg.audio.maikiwiAudio.analogWarmth === true) { 
            CiderAudio.analogWarmth_h2_3(true, 1); 
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
            console.log('[Cider][Audio] Analog Warmth')
        }
        // Spatial
        else if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier === 0 && 
            app.cfg.audio.maikiwiAudio.ciderPPE === false && 
            app.cfg.audio.spatial === true &&
            app.cfg.audio.maikiwiAudio.analogWarmth === false){
                if (app.cfg.audio.maikiwiAudio.spatial === true) {  
                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.audioBands[0]);
                    console.log('[Cider][Audio] Maikiwi Spatial')
                }
                else {
                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.audioBands[0]);
                    console.log('[Cider][Audio] Spatial')
                }

        }
        // Nothing
        else {        
            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.audioBands[0]);    
            console.log('[Cider][Audio] Nothing')                            // If CAP & vibrant bass is disabled
        }

        console.log("[Cider][Audio] Finished hierarchical loading");
        
    },

    equalizer: function (){ // h1_1
        let BANDS = app.cfg.audio.equalizer.frequencies;
        let GAIN = app.cfg.audio.equalizer.gain;
        let Q = app.cfg.audio.equalizer.Q;

        CiderAudio.audioNodes.audioBands = []; 

        for (i = 0; i < BANDS.length; i++) {
            CiderAudio.audioNodes.audioBands[i] = CiderAudio.context.createBiquadFilter();
            CiderAudio.audioNodes.audioBands[i].type = 'peaking'; // 'peaking';
            CiderAudio.audioNodes.audioBands[i].frequency.value = BANDS[i];
            CiderAudio.audioNodes.audioBands[i].Q.value = Q[i];
            CiderAudio.audioNodes.audioBands[i].gain.value = GAIN[i] * app.cfg.audio.equalizer.mix;
        }

        // Dynamic-ish loading
        CiderAudio.hierarchical_loading();

        for (i = 1; i < BANDS.length; i ++) {
            CiderAudio.audioNodes.audioBands[i-1].connect(CiderAudio.audioNodes.audioBands[i]);
        }
        CiderAudio.audioNodes.audioBands[BANDS.length-1].connect(CiderAudio.context.destination);
    }

}
if (app.cfg.advanced.AudioContext){
    CiderAudio.init()
   
}