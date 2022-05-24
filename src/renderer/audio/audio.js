const CiderAudio = {
    context: null,
    source: null,
    audioNodes: {
        gainNode: null,
        spatialNode: null,
        spatialInput: null,
        audioBands: null,
        vibrantbassNode: null,
        llpw: null,
        recorderNode: null,
        intelliGainComp: null,
        atmosphereRealizer1: null,
        atmosphereRealizer2: null,
    },
    ccON: false,
    mediaRecorder: null,
    init: function (cb = function () { }) {
        //AudioOutputs.fInit = true;
        let searchInt = setInterval(function () {
            if (document.getElementById("apple-music-player")) {
                //AudioOutputs.eqReady = true;
                document.getElementById("apple-music-player").crossOrigin = "anonymous";
                CiderAudio.connectContext(document.getElementById("apple-music-player"), 0);

                cb();
                clearInterval(searchInt);
            }
        }, 1000);
    },
    off: function () {
        try {
            CiderAudio.hierarchical_unloading();
            try {
                CiderAudio.audioNodes = {
                    gainNode: null,
                    spatialNode: null,
                    spatialInput: null,
                    audioBands: null,
                    vibrantbassNode: null,
                    llpw: null,
                    recorderNode: null,
                    intelliGainComp: null,
                    atmosphereRealizer1: null,
                    atmosphereRealizer2: null,
                }
            } catch (e) { }
            CiderAudio.source.connect(CiderAudio.context.destination);
        } catch (e) { }
    },
    connectContext: function (mediaElem) {
        if (!CiderAudio.context) {
            CiderAudio.context = new window.AudioContext({ sampleRate: 96000 }); // Don't ever remove the sample rate arg. Ask Maikiwi.
        }
        if (!CiderAudio.source) {
            CiderAudio.source = CiderAudio.context.createMediaElementSource(mediaElem);
        } else { try { CiderAudio.source.disconnect(CiderAudio.context.destination) } catch (e) { } }
        CiderAudio.audioNodes.gainNode = CiderAudio.context.createGain()
        CiderAudio.audioNodes.intelliGainComp = CiderAudio.context.createGain();
        CiderAudio.source.connect(CiderAudio.audioNodes.intelliGainComp);
        CiderAudio.audioNodes.intelliGainComp.connect(CiderAudio.audioNodes.gainNode);
        if (app.cfg.audio.normalization) {
            CiderAudio.normalizerOn()
        }
        if (app.cfg.audio.maikiwiAudio.spatial) {
            CiderAudio.spatialOn()
        }
        CiderAudio.hierarchical_loading();
    },
    normalizerOn: function () {
        try {
            let previewURL = null
            try {
                previewURL = app.mk.nowPlayingItem.previewURL
            } catch (e) {
            }
            if (previewURL == null && ((app.mk.nowPlayingItem?._songId ?? (app.mk.nowPlayingItem["songId"] ?? app.mk.nowPlayingItem.relationships.catalog.data[0].id)) != -1)) {
                app.mk.api.v3.music(`/v1/catalog/${app.mk.storefrontId}/songs/${app.mk.nowPlayingItem?._songId ?? (app.mk.nowPlayingItem["songId"] ?? app.mk.nowPlayingItem.relationships.catalog.data[0].id)}`).then((response) => {
                    previewURL = response.data.data[0].attributes.previews[0].url
                    if (previewURL)
                        ipcRenderer.send('getPreviewURL', previewURL)
                })
            } else {
                if (previewURL)
                    ipcRenderer.send('getPreviewURL', previewURL)
            }

        } catch (e) {
        }
    },
    normalizerOff: function () {
        CiderAudio.audioNodes.gainNode.gain.exponentialRampToValueAtTime(1.0, CiderAudio.context.currentTime + 0.5);
    },
    spatialProfiles: [
        {
            "id": "72_420maikiwi",
            "file": './cideraudio/impulses/CiderSpatial_v72.420_Maikiwi.wav',
            "name": "Maikiwi",
            "description": "",
            "gainComp": "1.3381352151540196",
        },
        {
            "id": "71_420maikiwi",
            "file": './cideraudio/impulses/CiderSpatial_v71.420_Maikiwi.wav',
            "name": "Soundstage",
            "description": "",
            "gainComp": "1.3963683610559376",
        },
        {
            "id": "70_422maikiwi",
            "file": './cideraudio/impulses/CiderSpatial_v70.422_Maikiwi.wav',
            "name": "Separation",
            "description": "",
            "gainComp": "1.30767553892022",
        },
        {
            "id": "standard",
            "file": './cideraudio/impulses/CiderSpatial_v69_Standard.wav',
            "name": "Minimal",
            "description": "",
            "gainComp": "1.2647363474711515",
        }
    ],
    atmosphereRealizerProfiles: [
        {
            "id": "NATURAL_STANDARD",
            "file": './cideraudio/impulses/AtmosphereRealizer_NaturalStandard.wav',
            "name": "Natural (Standard)",
            "description": "",
        },
        {
            "id": "NATURAL_PLUS",
            "file": './cideraudio/impulses/AtmosphereRealizer_Natural+.wav',
            "name": "Natural (Plus)",
            "description": "",
        },
        {
            "id": "CRYPTO",
            "file": './cideraudio/impulses/AtmosphereRealizer_Cryptofyre.wav',
            "name": "Cryptofyre",
            "description": "",
        }
    ],
    spatialOn: function () {
        CiderAudio.audioNodes.spatialNode = null;
        CiderAudio.audioNodes.spatialNode = CiderAudio.context.createConvolver();
        CiderAudio.audioNodes.spatialNode.normalize = false;

        let spatialProfile = CiderAudio.spatialProfiles.find(function (profile) {
            return profile.id === app.cfg.audio.maikiwiAudio.spatialProfile;
        });

        if (spatialProfile === undefined) {
            spatialProfile = CiderAudio.spatialProfiles[0];
        }
        fetch(spatialProfile.file).then(async (impulseData) => {
            let bufferedImpulse = await impulseData.arrayBuffer();
            CiderAudio.audioNodes.spatialNode.buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
        });
    },
    spatialOff: function () {
        CiderAudio.hierarchical_loading();
    },
    intelliGainComp_h0_0: function () {
        let filters = []; const precisionHz = 12;
        if (CiderAudio.audioNodes.audioBands !== null) { filters = filters.concat(CiderAudio.audioNodes.audioBands) }
        if (CiderAudio.audioNodes.vibrantbassNode !== null) { filters = filters.concat(CiderAudio.audioNodes.vibrantbassNode) }
        if (CiderAudio.audioNodes.llpw !== null && CiderAudio.audioNodes.llpw.length > 1) { filters = filters.concat(CiderAudio.audioNodes.llpw); }

        if (!filters || filters.length === 0) {
            let filterlessGain = 1;
            if (CiderAudio.audioNodes.llpw !== null && CiderAudio.audioNodes.llpw.length == 1) { filterlessGain = filterlessGain * 1.109174815262401 }
            if (app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true) { filterlessGain = filterlessGain * 1.096478196143185 }
            if (app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true) { filterlessGain = filterlessGain * 1.096478196143185 }
            if (app.cfg.audio.maikiwiAudio.spatial == true) {
                let spatialProfile = CiderAudio.spatialProfiles.find(function (profile) {
                    return profile.id === app.cfg.audio.maikiwiAudio.spatialProfile;
                });
                if (spatialProfile === undefined) {
                    spatialProfile = CiderAudio.spatialProfiles[0];
                }
                filterlessGain = filterlessGain * spatialProfile.gainComp
            }
            filterlessGain = Math.pow(10, (-1 * (20 * Math.log10(filterlessGain))) / 20).toFixed(4);
            filterlessGain > 1.0 ? CiderAudio.audioNodes.intelliGainComp.gain.exponentialRampToValueAtTime(1.0, CiderAudio.context.currentTime + 0.3) : CiderAudio.audioNodes.intelliGainComp.gain.exponentialRampToValueAtTime(filterlessGain, CiderAudio.context.currentTime + 0.3);
            console.debug(`[Cider][Audio] IntelliGainComp: ${filterlessGain > 1.0 ? 0 : (20 * Math.log10(filterlessGain)).toFixed(2)} dB (${filterlessGain > 1.0 ? 1 : filterlessGain})`)
            return;
        }

        filters.shift();
        let steps = Math.ceil(96000 / precisionHz);
        // Generate input array for getFrequencyResponse method
        let frequencies = new Float32Array(steps);
        for (let i = 0; i < steps; i++) {
            frequencies[i] = (i + 1) * precisionHz;
        }
        // Here we will store combined amplitude response
        let totalAmplitudeResp = new Float32Array(steps);
        for (let i = 0; i < steps; i++) {
            totalAmplitudeResp[i] = 1;
        }
        // Temporary container for every filter response
        let amplitudeResp = new Float32Array(steps), phaseResp = new Float32Array(steps);
        for (let i = filters.length - 1; i >= 0; i--) {
            let filter = filters[i];
            // Get filter response and convolve it with existing response
            filter.getFrequencyResponse(frequencies, amplitudeResp, phaseResp);
            for (let j = 0; j < steps; j++) {
                totalAmplitudeResp[j] *= amplitudeResp[j];
            }
        }
        // Find max gain
        let maxGain = -120
        for (let i = 0; i < steps; i++) {
            let gain = totalAmplitudeResp[i];
            if (gain > maxGain)
                maxGain = gain;
        }
        if (CiderAudio.audioNodes.llpw !== null && CiderAudio.audioNodes.llpw.length == 1) { maxGain = maxGain * 1.109174815262401 }
        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true) { maxGain = maxGain * 1.096478196143185 }
        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true) { maxGain = maxGain * 1.096478196143185 }
        if (app.cfg.audio.maikiwiAudio.spatial == true) {
            let spatialProfile = CiderAudio.spatialProfiles.find(function (profile) {
                return profile.id === app.cfg.audio.maikiwiAudio.spatialProfile;
            });
            if (spatialProfile === undefined) {
                spatialProfile = CiderAudio.spatialProfiles[0];
            }
            maxGain = maxGain * spatialProfile.gainComp
        }
        maxGain = Math.pow(10, (-1 * (20 * Math.log10(maxGain))) / 20).toFixed(4);
        maxGain > 1.0 ? CiderAudio.audioNodes.intelliGainComp.gain.exponentialRampToValueAtTime(1.0, CiderAudio.context.currentTime + 0.3) : CiderAudio.audioNodes.intelliGainComp.gain.exponentialRampToValueAtTime(maxGain, CiderAudio.context.currentTime + 0.3);
        console.debug(`[Cider][Audio] IntelliGainComp: ${maxGain > 1.0 ? 0 : (20 * Math.log10(maxGain)).toFixed(2)} dB (${maxGain > 1.0 ? 1 : maxGain})`);
    },
    sendAudio: function () {
        if (!CiderAudio.ccON) {
            CiderAudio.ccON = true
            let searchInt = setInterval(async function () {
                if (CiderAudio.context != null && CiderAudio.audioNodes.gainNode != null) {
                    // var options = {
                    //     mimeType: 'audio/webm; codecs=opus'
                    // };
                    // var destnode = CiderAudio.context.createMediaStreamDestination();
                    // CiderAudio.audioNodes.intelliGainComp.connect(CiderAudio.audioNodes.gainNode);
                    //            CiderAudio.audioNodes.gainNode.connect(destnode)
                    // CiderAudio.mediaRecorder = new MediaRecorder(destnode.stream, options);
                    // CiderAudio.mediaRecorder.start(1);
                    // CiderAudio.mediaRecorder.ondataavailable = function (e) {
                    //     e.data.arrayBuffer().then(buffer => {
                    //         ipcRenderer.send('writeAudio', buffer)
                    //     }
                    //     );
                    // }
                    const worklet = `class RecorderWorkletProcessor extends AudioWorkletProcessor {
                        static get parameterDescriptors() {
                          return [{
                            name: 'isRecording',
                            defaultValue: 0
                          },
                          {
                            name: 'numberOfChannels',
                            defaultValue: 2
                          }
                        ];
                        }
                      
                        constructor() {
                          super();
                          this._bufferSize = 2048;
                          this._buffers = null;
                          this._initBuffer();
                        }
                        _initBuffers(numberOfChannels) {
                          this._buffers = [];
                          for (let channel=0; channel < numberOfChannels; channel++) {
                            this._buffers.push(new Float32Array(this._bufferSize));
                          }
                        }
                      
                        _initBuffer() {
                          this._bytesWritten = 0;
                        }
                      
                        _isBufferEmpty() {
                          return this._bytesWritten === 0;
                        }
                      
                        _isBufferFull() {
                          return this._bytesWritten === this._bufferSize;
                        }
                        _pushToBuffers(audioRawData, numberOfChannels) {
                          if (this._isBufferFull()) {
                              this._flush();
                          }
                          try{
                          let dataLength = audioRawData[0].length;
                          for (let idx=0; idx<dataLength; idx++) {
                            for (let channel=0; channel < numberOfChannels; channel++) {
                              let value = audioRawData[channel][idx];
                              this._buffers[channel][this._bytesWritten] = value;
                            }
                            this._bytesWritten += 1;
                          }} catch (e){
                             // console.log(e)
                          }
                        }
                      
                        _flush() {
                          let buffers = [];
                          this._buffers.forEach((buffer, channel) => {
                            if (this._bytesWritten < this._bufferSize) {
                              buffer = buffer.slice(0, this._bytesWritten);
                            }
                            buffers[channel] = buffer;
                          });
                          this.port.postMessage({
                            eventType: 'data',
                            audioBuffer: buffers,
                            bufferSize: this._bufferSize
                          });
                          this._initBuffer();
                        }
                      
                        _recordingStopped() {
                          this.port.postMessage({
                            eventType: 'stop'
                          });
                        }
                      
                        process(inputs, outputs, parameters) {
                          const isRecordingValues = parameters.isRecording;
                          const numberOfChannels = parameters.numberOfChannels[0];   
                          if (this._buffers === null) {
                            this._initBuffers(numberOfChannels);
                          }
                          
                          for (let dataIndex = 0; dataIndex < isRecordingValues.length; dataIndex++) 
                          {
                            const shouldRecord = isRecordingValues[dataIndex] === 1;
                            if (!shouldRecord && !this._isBufferEmpty()) {
                              this._flush();
                              this._recordingStopped();
                            }
                      
                            if (shouldRecord) {
                              let audioRawData = inputs[0];
                              this._pushToBuffers(audioRawData, numberOfChannels);
                            }
                          }
                          return true;
                        }
                      
                      }
                      
                      registerProcessor('recorder-worklet', RecorderWorkletProcessor);`
                    let blob = new Blob([worklet], { type: 'application/javascript' });
                    await CiderAudio.context.audioWorklet.addModule(URL.createObjectURL(blob))
                        .then(() => {

                            const channels = 2;
                            CiderAudio.audioNodes.recorderNode = new window.AudioWorkletNode(CiderAudio.context,
                                'recorder-worklet',
                                { parameterData: { numberOfChannels: channels } });
                            CiderAudio.audioNodes.recorderNode.port.onmessage = (e) => {
                                const data = e.data;
                                switch (data.eventType) {
                                    case "data":
                                        const audioData = data.audioBuffer;
                                        const bufferSize = data.bufferSize;
                                        if ((audioData[0]).some(item => item !== 0) || (audioData[0]).some(item => item !== 0)) {
                                            ipcRenderer.send('writeWAV', audioData[0], audioData[1], bufferSize);
                                        }
                                        break;
                                    case "stop":
                                        break;
                                }
                            }
                            CiderAudio.audioNodes.recorderNode.parameters.get('isRecording').setValueAtTime(1, CiderAudio.context.currentTime);
                            CiderAudio.audioNodes.intelliGainComp.connect(CiderAudio.audioNodes.recorderNode);

                        });
                    clearInterval(searchInt);
                }
            }, 1000);
        } else {
            if (CiderAudio.audioNodes.recorderNode != null && CiderAudio.context != null) {
                CiderAudio.audioNodes.recorderNode.parameters.get('isRecording').setValueAtTime(1, CiderAudio.context.currentTime);
                // CiderAudio.audioNodes.recorderNode = null;
                // CiderAudio.ccON = false;
            }
        }

    },
    stopAudio() {
        if (CiderAudio.audioNodes.recorderNode != null && CiderAudio.context != null) {
            CiderAudio.audioNodes.recorderNode.parameters.get('isRecording').setValueAtTime(0, CiderAudio.context.currentTime);
            // CiderAudio.audioNodes.recorderNode = null;
            // CiderAudio.ccON = false;
        }
    },
    atmosphereRealizer2_h2_4: function (status, hierarchy) {
        if (status === true) {
            CiderAudio.audioNodes.atmosphereRealizer2 = CiderAudio.context.createConvolver();
            CiderAudio.audioNodes.atmosphereRealizer2.normalize = false;
            let atmosphereRealizerProfile = CiderAudio.atmosphereRealizerProfiles.find(function (profile) {
                return profile.id === app.cfg.audio.maikiwiAudio.atmosphereRealizer2_value;
            });
    
            if (atmosphereRealizerProfile === undefined) {
                atmosphereRealizerProfile = CiderAudio.atmosphereRealizerProfiles[0];
            }
            fetch(atmosphereRealizerProfile.file).then(async (impulseData) => {
                let bufferedImpulse = await impulseData.arrayBuffer();
                CiderAudio.audioNodes.atmosphereRealizer2.buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
            });

            switch (hierarchy) {
                case 'h2_3':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.atmosphereRealizer1);
                    } catch (e) { }
                    break;
                case 'h2_2':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.llpw[0]);
                    } catch (e) { }
                    break;
                case 'h2_1':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                    } catch (e) { }
                    break;
                case 'h1':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.audioBands[0]);
                    } catch (e) { }
                    break;
                case 'h0':
                    try { CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.context.destination); } catch (e) { }
                    break;
            }


        }
    },
    atmosphereRealizer1_h2_3: function (status, hierarchy) {     
        if (status === true) {
            CiderAudio.audioNodes.atmosphereRealizer1 = CiderAudio.context.createConvolver();
            CiderAudio.audioNodes.atmosphereRealizer1.normalize = false;
            let atmosphereRealizerProfile = CiderAudio.atmosphereRealizerProfiles.find(function (profile) {
                return profile.id === app.cfg.audio.maikiwiAudio.atmosphereRealizer1_value;
            });
    
            if (atmosphereRealizerProfile === undefined) {
                atmosphereRealizerProfile = CiderAudio.atmosphereRealizerProfiles[0];
            }
            fetch(atmosphereRealizerProfile.file).then(async (impulseData) => {
                let bufferedImpulse = await impulseData.arrayBuffer();
                CiderAudio.audioNodes.atmosphereRealizer1.buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
            });

            switch (hierarchy) {
                case 'h2_2':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.audioNodes.llpw[0]);
                    } catch (e) { }
                    break;
                case 'h2_1':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                    } catch (e) { }
                    break;
                case 'h1':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.audioNodes.audioBands[0]);
                    } catch (e) { }
                    break;
                case 'h0':
                    try { CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.context.destination); } catch (e) { }
                    break;
            }


        }
    },
    llpw_h2_2: function (status, hierarchy) {
        if (status === true) {
            let c_LLPW_Q = [1.250, 0.131, 10, 2.5, 2.293, 0.110, 14.14, 1.552, 28.28, 7.071, 2.847, 5, 0.625, 7.071, 3.856, 3.856, 20, 28.28, 20, 14.14, 2.102, 6.698, 3.536, 10];
            let c_LLPW_GAIN = [-0.11, 0.27, -0.8, 0.57, 1.84, -0.38, 0.47, -1.56, 0.83, 1.58, -1.79, -0.45, 0.48, 1.22, -1.58, -1.59, -2.03, 2.56, -2.2, -2.48, 4.75, 10.5, 1.43, 3.76];
            let c_LLPW_FREQUENCIES = [400.83, 5812.8, 8360, 10413, 10658, 12079, 12899, 13205, 14848, 15591, 15778, 15783, 16716, 16891, 17255, 17496, 18555, 18622, 19219, 19448, 19664, 21341, 21353, 22595];
            let LLPW_Q = [5, 1, 3.536, 1.25, 8.409, 1.25, 14.14, 7.071, 5, 0.625, 16.82, 20, 20, 20, 28.28, 28.28, 28.28, 20, 33.64, 33.64, 10, 28.28, 7.071, 3.856];
            let LLPW_GAIN = [0.38, -1.81, -0.23, -0.51, 0.4, 0.84, 0.36, -0.34, 0.27, -1.2, -0.42, -0.67, 0.81, 1.31, -0.71, 0.68, -1.04, 0.79, -0.73, -1.33, 1.17, 0.57, 0.35, 6.33];
            let LLPW_FREQUENCIES = [16.452, 24.636, 37.134, 74.483, 159.54, 308.18, 670.21, 915.81, 1200.7, 2766.4, 2930.6, 4050.6, 4409.1, 5395.2, 5901.6, 6455.5, 7164.1, 7724.1, 8449, 10573, 12368, 14198, 17910, 18916];
            CiderAudio.audioNodes.llpw = []

            switch (app.cfg.audio.maikiwiAudio.ciderPPE_value) {
                case "MAIKIWI":
                    CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.llpw[0].normalize = false;
                    fetch('./cideraudio/impulses/CAP_Maikiwi.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });

                    switch (hierarchy) {
                        case 'h2_1':
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.vibrantbassNode[0]); } catch (e) { }
                            break;
                        case 'h1':
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.audioBands[0]); } catch (e) { }
                            break;
                        case 'h0':
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.context.destination); } catch (e) { }
                            break;

                    }

                    console.debug("[Cider][Audio] CAP - Maikiwi Signature Mode");
                    break;

                case "NATURAL":
                    CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.llpw[0].normalize = false;
                    fetch('./cideraudio/impulses/CAP_Natural.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });

                    switch (hierarchy) {
                        case 'h2_1':
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.vibrantbassNode[0]); } catch (e) { }
                            break;
                        case 'h1':
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.audioBands[0]); } catch (e) { }
                            break;
                        case 'h0':
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.context.destination); } catch (e) { }
                            break;

                    }

                    console.debug("[Cider][Audio] CAP - Natural Mode");
                    break;

                default:
                    CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.llpw[0].normalize = false;
                    fetch('./cideraudio/impulses/CAP_Maikiwi.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });

                    switch (hierarchy) {
                        case 'h2_1':
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.vibrantbassNode[0]); } catch (e) { }
                            break;
                        case 'h1':
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.audioBands[0]); } catch (e) { }
                            break;
                        case 'h0':
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.context.destination); } catch (e) { }
                            break;

                    }
                    app.cfg.audio.maikiwiAudio.ciderPPE_value = "MAIKIWI";
                    console.debug("[Cider][Audio] CAP - MaikiwiSignature Mode (Defaulted from broki config)");
                    break;
            }
        }

    },
    vibrantbass_h2_1: function (status, hierarchy) {
        if (status === true) {
            let VIBRANTBASSBANDS = app.cfg.audio.maikiwiAudio.vibrantBass.frequencies;
            let VIBRANTBASSGAIN = app.cfg.audio.maikiwiAudio.vibrantBass.gain;
            let VIBRANTBASSQ = app.cfg.audio.maikiwiAudio.vibrantBass.Q;
            CiderAudio.audioNodes.vibrantbassNode = []

            for (let i = 0; i < VIBRANTBASSBANDS.length; i++) {
                CiderAudio.audioNodes.vibrantbassNode[i] = CiderAudio.context.createBiquadFilter();
                CiderAudio.audioNodes.vibrantbassNode[i].type = 'peaking'; // 'peaking';
                CiderAudio.audioNodes.vibrantbassNode[i].frequency.value = VIBRANTBASSBANDS[i];
                CiderAudio.audioNodes.vibrantbassNode[i].Q.value = VIBRANTBASSQ[i];
                CiderAudio.audioNodes.vibrantbassNode[i].gain.value = VIBRANTBASSGAIN[i] * (app.cfg.audio.equalizer.vibrantBass / 10);
            }

            for (let i = 1; i < VIBRANTBASSBANDS.length; i++) {
                CiderAudio.audioNodes.vibrantbassNode[i - 1].connect(CiderAudio.audioNodes.vibrantbassNode[i]);
            }

            switch (hierarchy) {
                case 'h0':
                    try {
                        CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.context.destination);
                    } catch (e) { }
                    break;
                case 'h1':
                    try { CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.audioNodes.audioBands[0]); } catch (e) { }
                    break;

            }
        }
    },
    hierarchical_unloading: function () {
        try { CiderAudio.audioNodes.spatialNode.output.disconnect(); } catch (e) { }
        try { CiderAudio.audioNodes.spatialNode.disconnect(); } catch (e) { }
        try { CiderAudio.audioNodes.gainNode.disconnect(); } catch (e) { }
        try { CiderAudio.audioNodes.atmosphereRealizer1.disconnect(); CiderAudio.audioNodes.atmosphereRealizer1 = null } catch (e) { }
        try { CiderAudio.audioNodes.atmosphereRealizer2.disconnect(); CiderAudio.audioNodes.atmosphereRealizer2 = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.llpw) { i.disconnect(); } CiderAudio.audioNodes.llpw = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.vibrantbassNode) { i.disconnect(); } CiderAudio.audioNodes.vibrantbassNode = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.audioBands) { i.disconnect(); } CiderAudio.audioNodes.audioBands = null } catch (e) { }

        console.debug("[Cider][Audio] Finished hierarchical unloading");

    },
    config_mapping: function () {
        return new Promise(resolve => {
            const map = new Map([
                ['h1', Math.max(...app.cfg.audio.equalizer.gain) != 0],
                ['h2_1', app.cfg.audio.equalizer.vibrantBass != 0],
                ['h2_2', app.cfg.audio.maikiwiAudio.ciderPPE === true],
                ['h2_3', app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true],
                ['h2_4', app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true],
                ['spatial', app.cfg.audio.maikiwiAudio.spatial === true]
            ]);

            resolve(map);
          });
    },
    hierarchical_loading: async function () {
        const configMap = await CiderAudio.config_mapping();
        CiderAudio.hierarchical_unloading();

        let nextTier = 0, lastNode = 'h0';
        for (let [tier, value] of configMap.entries()) { 
            if (value === true) {
                switch (tier) {
                    case 'h1':
                        CiderAudio.equalizer(true, lastNode);
                        lastNode = 'h1';
                        break;
                    case 'h2_1':
                        CiderAudio.vibrantbass_h2_1(true, lastNode);
                        lastNode = 'h2_1';
                        break;
                    case 'h2_2':
                        app.cfg.audio.normalization = true;
                        CiderAudio.llpw_h2_2(true, lastNode);
                        lastNode = 'h2_2';
                        break;
                    case 'h2_3':
                        app.cfg.audio.normalization = true;
                        CiderAudio.atmosphereRealizer1_h2_3(true, lastNode);
                        lastNode = 'h2_3';
                        break;
                    case 'h2_4':
                        app.cfg.audio.normalization = true;
                        CiderAudio.atmosphereRealizer2_h2_4(true, lastNode);
                        lastNode = 'h2_4';
                        break;
                    case 'spatial':
                        app.cfg.audio.normalization = true
                        CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);                                                                        
                        break;
                }
            }
        }

        switch (lastNode) {
            case 'h2_4':
                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer2);
                }
                else {
                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer2);
                }
                break;
            case 'h2_3':
                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer1);
                }
                else {
                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer1);
                }      
                break;
            case 'h2_2':
                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.llpw[0]);
                }
                else {
                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.llpw[0]);
                }     
                break;
            case 'h2_1':
                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                }
                else {
                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                }              
                break;
            case 'h1':
                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.audioBands[0]);
                }
                else {
                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.audioBands[0]);
                }             
                break;
            case 'h0':
                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.context.destination)
                }
                else {
                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.context.destination);
                }                 
                break;
        }

        console.debug('[Cider][Audio]\n' + [...configMap.entries()] + '\n lastNode: ' + lastNode);

        CiderAudio.intelliGainComp_h0_0();
        console.debug("[Cider][Audio] Finished hierarchical loading");

    },

    equalizer: function (status, hierarchy) { // h1_1
        if (status === true) {
            let BANDS = app.cfg.audio.equalizer.frequencies;
            let GAIN = app.cfg.audio.equalizer.gain;
            let Q = app.cfg.audio.equalizer.Q;

            CiderAudio.audioNodes.audioBands = [];
            for (let i = 0; i < BANDS.length; i++) {
                CiderAudio.audioNodes.audioBands[i] = CiderAudio.context.createBiquadFilter();
                CiderAudio.audioNodes.audioBands[i].type = 'peaking'; // 'peaking';
                CiderAudio.audioNodes.audioBands[i].frequency.value = BANDS[i];
                CiderAudio.audioNodes.audioBands[i].Q.value = Q[i];
                CiderAudio.audioNodes.audioBands[i].gain.value = GAIN[i] * app.cfg.audio.equalizer.mix;
            }

            for (let i = 1; i < BANDS.length; i++) {
                CiderAudio.audioNodes.audioBands[i - 1].connect(CiderAudio.audioNodes.audioBands[i]);
            }

            switch (hierarchy) {
                case 'h0':
                    try {
                        CiderAudio.audioNodes.audioBands[BANDS.length - 1].connect(CiderAudio.context.destination);
                    } catch (e) { }
                    break;
            }

        }
    }
}
export { CiderAudio }