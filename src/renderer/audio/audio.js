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
        analogWarmth: null,
        recorderNode: null,
        intelliGainComp: null,
        atmosphereRealizer: null,
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
                    analogWarmth: null,
                    recorderNode: null,
                    intelliGainComp: null,
                    atmosphereRealizer: null,
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
            "file": './audio/impulses/CiderSpatial_v72.420_Maikiwi.wav',
            "name": "Maikiwi",
            "description": "",
            "gainComp": "1.3381352151540196",
            "img": "./assets/audiolabs/focused.png",
        },
        {
            "id": "71_420maikiwi",
            "file": './audio/impulses/CiderSpatial_v71.420_Maikiwi.wav',
            "name": "Soundstage",
            "description": "",
            "gainComp": "1.3963683610559376",
            "img": "./assets/audiolabs/expansive.png",
        },
        {
            "id": "70_422maikiwi",
            "file": './audio/impulses/CiderSpatial_v70.422_Maikiwi.wav',
            "name": "Separation",
            "description": "",
            "gainComp": "1.30767553892022",
            "img": "./assets/audiolabs/classic.png",
        },
        {
            "id": "standard",
            "file": './audio/impulses/CiderSpatial_v69_Standard.wav',
            "name": "Minimal",
            "description": "",
            "gainComp": "1.2647363474711515",
            "img": "./assets/audiolabs/minimal.png",
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
        if (CiderAudio.audioNodes.analogWarmth !== null) { filters = filters.concat(CiderAudio.audioNodes.analogWarmth) }

        if (!filters || filters.length === 0) {
            let filterlessGain = 1;
            if (CiderAudio.audioNodes.llpw !== null && CiderAudio.audioNodes.llpw.length == 1) { filterlessGain = filterlessGain * 1.109174815262401 }
            if (app.cfg.audio.maikiwiAudio.atmosphereRealizer == true) { filterlessGain = filterlessGain * 1.096478196143185 }
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
        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer == true) { maxGain = maxGain * 1.096478196143185 }
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
                          this._bufferSize = 1024;
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
                          let dataLength = audioRawData[0].length;
                          for (let idx=0; idx<dataLength; idx++) {
                            for (let channel=0; channel < numberOfChannels; channel++) {
                              let value = audioRawData[channel][idx];
                              this._buffers[channel][this._bytesWritten] = value;
                            }
                            this._bytesWritten += 1;
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
                            CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.recorderNode);

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
    atmosphereRealizer_h2_4: function (status, hierarchy) {
        if (status === true) {
            switch (app.cfg.audio.maikiwiAudio.atmosphereRealizer_value) {
                case "NATURAL_STANDARD":
                    CiderAudio.audioNodes.atmosphereRealizer = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.atmosphereRealizer.normalize = false;

                    fetch('./audio/impulses/AtmosphereRealizer_NaturalStandard.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.atmosphereRealizer.buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });
                    break;


                case "NATURAL_HIGH":
                    CiderAudio.audioNodes.atmosphereRealizer = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.atmosphereRealizer.normalize = false;

                    fetch('./audio/impulses/AtmosphereRealizer_NaturalHigh.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.atmosphereRealizer.buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });
                    break;

                case "NATURAL_PLUS":
                    CiderAudio.audioNodes.atmosphereRealizer = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.atmosphereRealizer.normalize = false;

                    fetch('./audio/impulses/AtmosphereRealizer_Natural+.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.atmosphereRealizer.buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });
                    break;
                case "CRYPTO":
                    CiderAudio.audioNodes.atmosphereRealizer = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.atmosphereRealizer.normalize = false;

                    fetch('./audio/impulses/AtmosphereRealizer_Cryptofyre.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.atmosphereRealizer.buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });
                    break;

                default:
                    CiderAudio.audioNodes.atmosphereRealizer = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.atmosphereRealizer.normalize = false;

                    fetch('./audio/impulses/AtmosphereRealizer_Standard.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.atmosphereRealizer.buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });
                    app.cfg.audio.maikiwiAudio.atmosphereRealizer_value = "STANDARD";
                    break;
            }

            switch (hierarchy) {
                case 4:
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer.connect(CiderAudio.audioNodes.analogWarmth[0]);
                    } catch (e) { }
                    break;
                case 3:
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer.connect(CiderAudio.audioNodes.llpw[0]);
                    } catch (e) { }
                    break;
                case 2:
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                    } catch (e) { }
                    break;
                case 1:
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer.connect(CiderAudio.audioNodes.audioBands[0]);
                    } catch (e) { }
                    break;
                case 0:
                    try { CiderAudio.audioNodes.atmosphereRealizer.connect(CiderAudio.context.destination); } catch (e) { }
                    break;
            }


        }
    },
    analogWarmth_h2_3: function (status, hierarchy) {
        if (status === true) { // 23 Band Adjustment 
            let WARMTH_FREQUENCIES = [10.513, 15.756, 224.01, 677.77, 1245.4, 2326.8, 2847.3, 4215.3, 11057, 12793, 16235, 16235, 17838, 18112, 18112, 19326, 19372, 19372, 20061, 20280, 20280, 20853, 22276];
            let WARMTH_GAIN = [-4.81, 0.74, 0.55, -0.84, -1.52, 0.84, 0.66, -0.29, 0.29, 0.94, 1.67, 1.62, -0.53, -0.81, -4.98, 1.43, 0.86, 1.13, -1.06, -0.95, -1.13, 1.78, -3.86];
            let WARMTH_Q = [0.442, 3.536, 2.102, 8.409, 0.625, 16.82, 5, 2.973, 3.536, 2.5, 2.5, 11.89, 0.625, 1.487, 1.153, 5, 5.453, 5, 2.973, 3.386, 3.386, 14.14, 8.409];
            CiderAudio.audioNodes.analogWarmth = []

            switch (app.cfg.audio.maikiwiAudio.analogWarmth_value) {
                case "SMOOTH":
                    for (let i = 0; i < WARMTH_FREQUENCIES.length; i++) {
                        CiderAudio.audioNodes.analogWarmth[i] = CiderAudio.context.createBiquadFilter();
                        CiderAudio.audioNodes.analogWarmth[i].type = 'peaking'; // 'peaking';
                        CiderAudio.audioNodes.analogWarmth[i].frequency.value = WARMTH_FREQUENCIES[i];
                        CiderAudio.audioNodes.analogWarmth[i].Q.value = WARMTH_Q[i];
                        CiderAudio.audioNodes.analogWarmth[i].gain.value = WARMTH_GAIN[i] * 1.25;
                    }
                    break;

                case "WARM":
                    for (let i = 0; i < WARMTH_FREQUENCIES.length; i++) {
                        CiderAudio.audioNodes.analogWarmth[i] = CiderAudio.context.createBiquadFilter();
                        CiderAudio.audioNodes.analogWarmth[i].type = 'peaking'; // 'peaking';
                        CiderAudio.audioNodes.analogWarmth[i].frequency.value = WARMTH_FREQUENCIES[i];
                        CiderAudio.audioNodes.analogWarmth[i].Q.value = WARMTH_Q[i];
                        CiderAudio.audioNodes.analogWarmth[i].gain.value = WARMTH_GAIN[i] * 1.75;
                    }
                    break;

                default:
                    for (let i = 0; i < WARMTH_FREQUENCIES.length; i++) {
                        CiderAudio.audioNodes.analogWarmth[i] = CiderAudio.context.createBiquadFilter();
                        CiderAudio.audioNodes.analogWarmth[i].type = 'peaking'; // 'peaking';
                        CiderAudio.audioNodes.analogWarmth[i].frequency.value = WARMTH_FREQUENCIES[i];
                        CiderAudio.audioNodes.analogWarmth[i].Q.value = WARMTH_Q[i];
                        CiderAudio.audioNodes.analogWarmth[i].gain.value = WARMTH_GAIN[i] * 1.25;
                    }
                    app.cfg.audio.maikiwiAudio.analogWarmth_value = "SMOOTH";
                    break;
            }


            for (let i = 1; i < WARMTH_FREQUENCIES.length; i++) {
                CiderAudio.audioNodes.analogWarmth[i - 1].connect(CiderAudio.audioNodes.analogWarmth[i]);
            }

            switch (hierarchy) {
                case 3:
                    try {
                        CiderAudio.audioNodes.analogWarmth[WARMTH_FREQUENCIES.length - 1].connect(CiderAudio.audioNodes.llpw[0]);
                    } catch (e) { }
                    break;
                case 2:
                    try {
                        CiderAudio.audioNodes.analogWarmth[WARMTH_FREQUENCIES.length - 1].connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                    } catch (e) { }
                    break;
                case 1:
                    try {
                        CiderAudio.audioNodes.analogWarmth[WARMTH_FREQUENCIES.length - 1].connect(CiderAudio.audioNodes.audioBands[0]);
                    } catch (e) { }
                    break;
                case 0:
                    try { CiderAudio.audioNodes.analogWarmth[WARMTH_FREQUENCIES.length - 1].connect(CiderAudio.context.destination); } catch (e) { }
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
                    fetch('./audio/impulses/CAP_Maikiwi.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });

                    switch (hierarchy) {
                        case 2:
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.vibrantbassNode[0]); } catch (e) { }
                            break;
                        case 1:
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.audioBands[0]); } catch (e) { }
                            break;
                        case 0:
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.context.destination); } catch (e) { }
                            break;

                    }

                    console.debug("[Cider][Audio] CAP - Maikiwi Signature Mode");
                    break;

                case "NATURAL":
                    CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.llpw[0].normalize = false;
                    fetch('./audio/impulses/CAP_Natural.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });

                    switch (hierarchy) {
                        case 2:
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.vibrantbassNode[0]); } catch (e) { }
                            break;
                        case 1:
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.audioBands[0]); } catch (e) { }
                            break;
                        case 0:
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.context.destination); } catch (e) { }
                            break;

                    }

                    console.debug("[Cider][Audio] CAP - Natural Mode");
                    break;

                case "AGGRESSIVE": // Aggressive
                    for (let i = 0; i < c_LLPW_FREQUENCIES.length; i++) {
                        CiderAudio.audioNodes.llpw[i] = CiderAudio.context.createBiquadFilter();
                        CiderAudio.audioNodes.llpw[i].type = 'peaking'; // 'peaking';
                        CiderAudio.audioNodes.llpw[i].frequency.value = c_LLPW_FREQUENCIES[i];
                        CiderAudio.audioNodes.llpw[i].Q.value = c_LLPW_Q[i];
                        CiderAudio.audioNodes.llpw[i].gain.value = c_LLPW_GAIN[i];
                    }
                    for (let i = 1; i < c_LLPW_FREQUENCIES.length; i++) {
                        CiderAudio.audioNodes.llpw[i - 1].connect(CiderAudio.audioNodes.llpw[i]);
                    }

                    switch (hierarchy) {
                        case 2:
                            try { CiderAudio.audioNodes.llpw[c_LLPW_FREQUENCIES.length - 1].connect(CiderAudio.audioNodes.vibrantbassNode[0]); } catch (e) { }
                            break;
                        case 1:
                            try { CiderAudio.audioNodes.llpw[c_LLPW_FREQUENCIES.length - 1].connect(CiderAudio.audioNodes.audioBands[0]); } catch (e) { }
                            break;
                        case 0:
                            try { CiderAudio.audioNodes.llpw[c_LLPW_FREQUENCIES.length - 1].connect(CiderAudio.context.destination); } catch (e) { }
                            break;

                    }

                    console.debug("[Cider][Audio] CAP - Clarity Mode");
                    break;

                default:
                    CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.llpw[0].normalize = false;
                    fetch('./audio/impulses/CAP_Maikiwi.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });

                    switch (hierarchy) {
                        case 2:
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.vibrantbassNode[0]); } catch (e) { }
                            break;
                        case 1:
                            try { CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.audioBands[0]); } catch (e) { }
                            break;
                        case 0:
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
                case 0:
                    try {
                        CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.context.destination);
                    } catch (e) { }
                    break;
                case 1:
                    try { CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.audioNodes.audioBands[0]); } catch (e) { }
                    break;

            }
        }
    },
    hierarchical_unloading: function () {
        try { CiderAudio.audioNodes.spatialNode.output.disconnect(); } catch (e) { }
        try { CiderAudio.audioNodes.spatialNode.disconnect(); } catch (e) { }
        try { CiderAudio.audioNodes.gainNode.disconnect(); } catch (e) { }
        try { CiderAudio.audioNodes.atmosphereRealizer.disconnect(); CiderAudio.audioNodes.atmosphereRealizer = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.analogWarmth) { i.disconnect(); } CiderAudio.audioNodes.analogWarmth = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.llpw) { i.disconnect(); } CiderAudio.audioNodes.llpw = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.vibrantbassNode) { i.disconnect(); } CiderAudio.audioNodes.vibrantbassNode = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.audioBands) { i.disconnect(); } CiderAudio.audioNodes.audioBands = null } catch (e) { }

        console.debug("[Cider][Audio] Finished hierarchical unloading");

    },
    hierarchical_loading: function () {
        CiderAudio.hierarchical_unloading();

        if (Math.max(...app.cfg.audio.equalizer.gain) != 0) {
            CiderAudio.equalizer(true, 0);

            if (app.cfg.audio.equalizer.vibrantBass !== '0') {
                CiderAudio.vibrantbass_h2_1(true, 1);

                if (app.cfg.audio.maikiwiAudio.ciderPPE === true) { // Vibrant Bass, CAP
                    CiderAudio.llpw_h2_2(true, 2);

                    if (app.cfg.audio.maikiwiAudio.analogWarmth === true) { // Vibrant Bass, CAP, Analog Warmth
                        CiderAudio.analogWarmth_h2_3(true, 3);

                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 4);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {  // Vibrant Bass, CAP, Analog Warmth, Maikiwi Spatial                              
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Analog Warmth, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {                          // Vibrant Bass, CAP, Analog Warmth, Spatial
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Analog Warmth, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Analog Warmth, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {  // Vibrant Bass, CAP, Analog Warmth, Maikiwi Spatial                              
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Analog Warmth, Maikiwi Spatial')
                                }
                                else {                          // Vibrant Bass, CAP, Analog Warmth, Spatial
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Analog Warmth, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Analog Warmth')
                            }
                        }
                    }
                    else {
                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 3)

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Atmosphere Realizer')
                            }
                        }
                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.llpw[0]);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.llpw[0]);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.llpw[0]);
                                console.debug('[Cider][Audio] Equalizer, Vibrant Bass, CAP')
                            }
                        }
                    }
                }
                else {
                    if (app.cfg.audio.maikiwiAudio.analogWarmth === true) {
                        CiderAudio.analogWarmth_h2_3(true, 2);

                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 4)

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Analog Warmth, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Analog Warmth, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Analog Warmth, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Analog Warmth, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Analog Warmth, Spatial')
                                }
                            }
                            else {
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Analog Warmth')
                            }
                        }
                    }
                    else {
                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 2)

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                                    console.debug('[Cider][Audio] Equalizer, Vibrant Bass, Spatial')
                                }
                            }
                            else {
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                                console.debug('[Cider][Audio] Equalizer, Vibrant Bass')
                            }
                        }

                    }
                }
            }
            // Vibrant Bass ends here
            else { // if (app.cfg.audio.maikiwiAudio.vibrantBass.multiplier) === 0
                if (app.cfg.audio.maikiwiAudio.ciderPPE === true) {
                    CiderAudio.llpw_h2_2(true, 1);

                    if (app.cfg.audio.maikiwiAudio.analogWarmth === true) {
                        CiderAudio.analogWarmth_h2_3(true, 3);

                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 4);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, CAP, Analog Warmth, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, CAP, Analog Warmth, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Equalizer, CAP and Analog Warmth, Atmosphere Realizer')
                            }
                        }

                        else {

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Equalizer, CAP, Analog Warmth, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Equalizer, CAP, Analog Warmth, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                console.debug('[Cider][Audio] Equalizer, CAP and Analog Warmth')
                            }
                        }
                    }
                    else {
                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 3);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, CAP, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, CAP, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Equalizer, CAP, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.llpw[0]);
                                    console.debug('[Cider][Audio] Equalizer, CAP, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.llpw[0]);
                                    console.debug('[Cider][Audio] Equalizer, CAP, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.llpw[0]);
                                console.debug('[Cider][Audio] Equalizer, CAP')
                            }
                        }
                    }
                } // CAP ends here
                else {
                    if (app.cfg.audio.maikiwiAudio.analogWarmth === true) {
                        CiderAudio.analogWarmth_h2_3(true, 1);

                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 4);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Analog Warmth, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Analog Warmth, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Equalizer, Analog Warmth, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Equalizer, Analog Warmth, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Equalizer, Analog Warmth, Spatial')
                                }
                            }
                            else {
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                console.debug('[Cider][Audio] Equalizer, Analog Warmth')
                            }
                        }
                    }
                    else {
                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 1);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Equalizer, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Equalizer, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.audioBands[0]);
                                    console.debug('[Cider][Audio] Equalizer, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.audioBands[0]);
                                    console.debug('[Cider][Audio] Equalizer, Spatial')
                                }
                            }
                            else {
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.audioBands[0]);
                                console.debug('[Cider][Audio] Equalizer')
                            }
                        }
                    }
                }
            }
        }
        else { //if (Math.max(...app.cfg.audio.equalizer.gain) == 0)
            if (app.cfg.audio.equalizer.vibrantBass !== '0') { // Vibrant Bass
                CiderAudio.vibrantbass_h2_1(true, 0)

                if (app.cfg.audio.maikiwiAudio.ciderPPE === true) { // Vibrant Bass, CAP
                    CiderAudio.llpw_h2_2(true, 2);

                    if (app.cfg.audio.maikiwiAudio.analogWarmth === true) { // Vibrant Bass, CAP, Analog Warmth
                        CiderAudio.analogWarmth_h2_3(true, 3);

                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 4);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {  // Vibrant Bass, CAP, Analog Warmth, Maikiwi Spatial
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Vibrant Bass, CAP, Analog Warmth, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {                                  // Vibrant Bass, CAP, Analog Warmth, Spatial
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Vibrant Bass, CAP, Analog Warmth, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Vibrant Bass, CAP, Analog Warmth, Atmosphere Realizer')
                            }

                        }
                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {  // Vibrant Bass, CAP, Analog Warmth, Maikiwi Spatial
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Vibrant Bass, CAP, Analog Warmth, Maikiwi Spatial')
                                }
                                else {                                  // Vibrant Bass, CAP, Analog Warmth, Spatial
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Vibrant Bass, CAP, Analog Warmth, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                console.debug('[Cider][Audio] Vibrant Bass, CAP, Analog Warmth')
                            }
                        }
                    }
                    else { // if (app.cfg.audio.maikiwiAudio.analogWarmth) !== true
                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 3);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Vibrant Bass, CAP, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Vibrant Bass, CAP, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Vibrant Bass, CAP, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.llpw[0]);
                                    console.debug('[Cider][Audio] Vibrant Bass, CAP, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.llpw[0]);
                                    console.debug('[Cider][Audio] Vibrant Bass, CAP, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.llpw[0]);
                                console.debug('[Cider][Audio] Vibrant Bass, CAP')
                            }
                        }
                    }
                }
                else {
                    if (app.cfg.audio.maikiwiAudio.analogWarmth === true) {
                        CiderAudio.analogWarmth_h2_3(true, 2);

                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 4);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Vibrant Bass, Analog Warmth, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Vibrant Bass, Analog Warmth, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Vibrant Bass, Analog Warmth, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Vibrant Bass, Analog Warmth, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Vibrant Bass, Analog Warmth, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                console.debug('[Cider][Audio] Vibrant Bass, Analog Warmth')
                            }
                        }

                    }
                    else {
                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 2);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Vibrant Bass, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Vibrant Bass, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Vibrant Bass, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                                    console.debug('[Cider][Audio] Vibrant Bass, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                                    console.debug('[Cider][Audio] Vibrant Bass, Spatial')
                                }
                            }
                            else {
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                                console.debug('[Cider][Audio] Vibrant Bass')
                            }
                        }
                    }
                }
            }
            // Vibrant Bass ends here
            else {
                if (app.cfg.audio.maikiwiAudio.ciderPPE === true) {
                    CiderAudio.llpw_h2_2(true, 0);

                    if (app.cfg.audio.maikiwiAudio.analogWarmth === true) {
                        CiderAudio.analogWarmth_h2_3(true, 3);

                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 4);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] CAP, Analog Warmth, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] CAP, Analog Warmth, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] CAP and Analog Warmth, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] CAP, Analog Warmth, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] CAP, Analog Warmth, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                console.debug('[Cider][Audio] CAP and Analog Warmth')
                            }
                        }
                    }
                    else {
                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 3);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] CAP, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] CAP, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] CAP, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.llpw[0]);
                                    console.debug('[Cider][Audio] CAP, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.llpw[0]);
                                    console.debug('[Cider][Audio] CAP, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.llpw[0]);
                                console.debug('[Cider][Audio] CAP')
                            }
                        }
                    }
                } // CAP ends here
                else {
                    if (app.cfg.audio.maikiwiAudio.analogWarmth === true) {
                        CiderAudio.analogWarmth_h2_3(true, 0);

                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 4);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Analog Warmth, Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Analog Warmth, Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Analog Warmth, Atmosphere Realizer')
                            }
                        }

                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Analog Warmth, Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                    console.debug('[Cider][Audio] Analog Warmth, Spatial')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.analogWarmth[0]);
                                console.debug('[Cider][Audio] Analog Warmth')
                            }
                        }
                    }
                    else {
                        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer === true) {
                            CiderAudio.atmosphereRealizer_h2_4(true, 0);

                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Maikiwi Spatial, Atmosphere Realizer')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                    console.debug('[Cider][Audio] Spatial, Atmosphere Realizer')
                                }
                            }
                            else {
                                app.cfg.audio.normalization = true;
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer);
                                console.debug('[Cider][Audio] Atmosphere Realizer')
                            }
                        }
                        else {
                            if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                if (app.cfg.audio.maikiwiAudio.spatial === true) {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                                    CiderAudio.audioNodes.spatialNode.connect(CiderAudio.context.destination);
                                    console.debug('[Cider][Audio] Maikiwi Spatial')
                                }
                                else {
                                    app.cfg.audio.normalization = true;
                                    CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialInput.input);
                                    CiderAudio.audioNodes.spatialNode.output.connect(CiderAudio.context.destination);
                                    console.debug('[Cider][Audio] Spatial')
                                }
                            }
                            else {
                                CiderAudio.audioNodes.gainNode.connect(CiderAudio.context.destination);
                                console.debug('[Cider][Audio] Literal Nothing')
                            }
                        }
                    }
                }
            }
        }
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
                case 0:
                    try {
                        CiderAudio.audioNodes.audioBands[BANDS.length - 1].connect(CiderAudio.context.destination);
                    } catch (e) { }
                    break;
            }

        }
    }
}
export { CiderAudio }