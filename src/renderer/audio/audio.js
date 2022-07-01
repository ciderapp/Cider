const CiderAudio = {
    context: null,
    source: null,
    audioNodes: {
        gainNode: null,
        spatialNode: null,
        audioBands: null,
        vibrantbassNode: null,
        llpw: null,
        recorderNode: null,
        intelliGainComp: null,
        atmosphereRealizer2: null,
        atmosphereRealizer1: null,
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
            try {
                CiderAudio.audioNodes = {
                    gainNode: null,
                    spatialNode: null,
                    audioBands: null,
                    vibrantbassNode: null,
                    llpw: null,
                    recorderNode: null,
                    intelliGainComp: null,
                    atmosphereRealizer2: null,
                    atmosphereRealizer1: null,
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
            console.debug("[Cider][MaikiwiSoundCheck] normalizer func err: " + e)
        }
    },
    normalizerOff: function () {
        CiderAudio.audioNodes.gainNode.gain.exponentialRampToValueAtTime(1.0, CiderAudio.context.currentTime + 0.5);
    },
    spatialProfiles: [
        {
            "id": "maikiwi",
            "file": './cideraudio/impulses/CiderSpatial_Maikiwi.wav',
            "name": "Maikiwi",
            "description": "",
            "gainComp": "1.044"
        },
        {
            "id": "maikiwiplus",
            "file": './cideraudio/impulses/CiderSpatial_MaikiwiPlus.wav',
            "name": "Maikiwi+",
            "description": "",
            "gainComp": "1.044"
        },
        {
            "id": "71_420maikiwi",
            "file": './cideraudio/impulses/CiderSpatial_v71.420_Maikiwi.wav',
            "name": "Soundstage",
            "description": "",
            "gainComp": "1.3963683610559376"
        },
        {
            "id": "70_422maikiwi",
            "file": './cideraudio/impulses/CiderSpatial_v70.422_Maikiwi.wav',
            "name": "Separation",
            "description": "",
            "gainComp": "1.30767553892022"
        },
        {
            "id": "standard",
            "file": './cideraudio/impulses/CiderSpatial_Natural.wav',
            "name": "Minimal",
            "description": "",
            "gainComp": "1.044"
        },
        {
            "id": "standardplus",
            "file": './cideraudio/impulses/CiderSpatial_Natural+.wav',
            "name": "Minimal+",
            "description": "",
            "gainComp": "1.044"
        },
        {
            "id": "diffused",
            "file": './cideraudio/impulses/CiderSpatial_Diffuse.wav',
            "name": "Diffused",
            "description": "",
            "gainComp": "1.044"
        },
        {
            "id": "BPLK",
            "file": './cideraudio/impulses/CiderSpatial_BPLK.wav',
            "name": "BPLK",
            "description": "",
            "gainComp": "1.044"
        },
        {
            "id": "HW2K",
            "file": './cideraudio/impulses/CiderSpatial_HW2K.wav',
            "name": "HW2K",
            "description": "",
            "gainComp": "1.044"
        },
        {
            "id": "live",
            "file": './cideraudio/impulses/CiderSpatial_LIVE_2.wav',
            "name": "live",
            "description": "",
            "gainComp": "1.2647363474711515"
        }
    ],
    atmosphereRealizerProfiles: [
        {
            "id": "NATURAL_STANDARD",
            "file": './cideraudio/impulses/AtmosphereRealizer_NaturalStandard.wav',
            "name": "ほうじ茶チーズクリーマティー",
            "description": "",
        },
        {
            "id": "NATURAL_PLUS",
            "file": './cideraudio/impulses/AtmosphereRealizer_Natural+.wav',
            "name": "玄米茶タピオカミルクティー",
            "description": "",
        },
        {
            "id": "E68_1",
            "file": './cideraudio/impulses/AtmosphereRealizer_E68_1.5.wav',
            "name": "岩塩クリームチーズティー",
            "description": "Light",
        },
        {
            "id": "E68_2",
            "file": './cideraudio/impulses/AtmosphereRealizer_E68_2.2.wav',
            "name": "抹茶ミルクティー",
            "description": "Dark",
        },
        {
            "id": "BSCBM",
            "file": './cideraudio/impulses/AtmosphereRealizer_BSCBM.wav',
            "name": "BSCBM",
            "description": "BSCBM",
        },
        {
            "id": "CUDDLE",
            "file": './cideraudio/impulses/AtmosphereRealizer_Cuddle.wav',
            "name": "CUDDLE",
            "description": "CUDDLE",
        },
        {
            "id": "E168_1",
            "file": './cideraudio/impulses/AtmosphereRealizer_E168_1.2.wav',
            "name": "春毫ジャスミンマキアート",
            "description": "Natural Air",
        },
        {
            "id": "Z3600",
            "file": './cideraudio/impulses/AtmosphereRealizer_Z3600.wav',
            "name": "ロイヤルミルクティー",
            "description": "3600",
        },
        {
            "id": "Z8500A",
            "file": './cideraudio/impulses/AtmosphereRealizer_Z8500_A.wav',
            "name": "ムーンライトソフトケーキ",
            "description": "8500",
        },
        {
            "id": "Z8500B",
            "file": './cideraudio/impulses/AtmosphereRealizer_Z8500_B.wav',
            "name": "Clafoutis aux Cerises",
            "description": "8500",
        },
        {
            "id": "Z8500C",
            "file": './cideraudio/impulses/AtmosphereRealizer_Z8500_C.wav',
            "name": "宇治抹茶だいふく",
            "description": "8500",
        }
    ],
    spatial_ninf: function () {
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

        // Always destination
        CiderAudio.audioNodes.spatialNode.connect(CiderAudio.context.destination)

        
    },
    spatialOff: function () {
        CiderAudio.hierarchical_loading();
    },
    intelliGainComp_n0_0: function () {
        let filters = []; const precisionHz = 12;
        // Biquad calculation
        if (CiderAudio.audioNodes.audioBands !== null) { filters = filters.concat(CiderAudio.audioNodes.audioBands) }
        if (CiderAudio.audioNodes.vibrantbassNode !== null) { filters = filters.concat(CiderAudio.audioNodes.vibrantbassNode) }
        if (CiderAudio.audioNodes.llpw !== null && CiderAudio.audioNodes.llpw.length > 2) { filters = filters.concat(CiderAudio.audioNodes.llpw); }

        if (!filters || filters.length === 0) {
            let filterlessGain = 1;
            // Impulse Calculation
            if (CiderAudio.audioNodes.llpw !== null && CiderAudio.audioNodes.llpw.length <= 2) { filterlessGain = filterlessGain * 1.109174815262401 }
            if (app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true) { filterlessGain = filterlessGain * 1.096478196143185 }
            if (app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true) { filterlessGain = filterlessGain * 1.096478196143185 }
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

        // Impulse Calculation
        if (CiderAudio.audioNodes.llpw !== null && CiderAudio.audioNodes.llpw.length <= 2) { maxGain = maxGain * 1.109174815262401 }
        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true) { maxGain = maxGain * 1.096478196143185 }
        if (app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true) { maxGain = maxGain * 1.096478196143185 }
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
                          let dataLength = audioRawData[0]?.length ?? 0;
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
    atmosphereRealizer2_n5: function (status, destination) {
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

            switch (destination) {
                case "spatial":
                    try { CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.spatialNode); console.debug("[Cider][Audio] atmosphereRealizer2_n5 -> Spatial");} catch (e) { }
                    break;
                case "n5":
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.atmosphereRealizer2);
                        console.debug("[Cider][Audio] atmosphereRealizer2_n5 -> atmosphereRealizer2");
                    } catch (e) { }
                    break;
                case 'n4':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.atmosphereRealizer1);
                        console.debug("[Cider][Audio] atmosphereRealizer2_n5 -> atmosphereRealizer1");
                    } catch (e) { }
                    break;
                case 'n3':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                        console.debug("[Cider][Audio] atmosphereRealizer2_n5 -> vibrantbassNode");
                    } catch (e) { }
                    break;
                case 'n2':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.audioBands[0]);
                        console.debug("[Cider][Audio] atmosphereRealizer2_n5 -> audioBands");
                    } catch (e) { }
                    break;
                case 'n1':
                        try {
                            CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.audioNodes.llpw[0]);
                            console.debug("[Cider][Audio] atmosphereRealizer2_n5 -> llpw");
                        } catch (e) { }
                    break;
                case 'n0':                 
                    try { CiderAudio.audioNodes.atmosphereRealizer2.connect(CiderAudio.context.destination); console.debug("[Cider][Audio] atmosphereRealizer2_n5 -> destination");} catch (e) { }
                    break;

            }


        }
    },
    atmosphereRealizer1_n4: function (status, destination) {     
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

            switch (destination) {
                case "spatial":
                    try { CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.audioNodes.spatialNode); console.debug("[Cider][Audio] atmosphereRealizer1_n4 -> Spatial");} catch (e) { }
                    break;
                case "n5":
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.audioNodes.atmosphereRealizer2);
                        console.debug("[Cider][Audio] atmosphereRealizer1_n4 -> atmosphereRealizer2");
                    } catch (e) { }
                    break;
                case 'n4':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.audioNodes.atmosphereRealizer1);
                        console.debug("[Cider][Audio] atmosphereRealizer1_n4 -> atmosphereRealizer1");
                    } catch (e) { }
                    break;
                case 'n3':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                        console.debug("[Cider][Audio] atmosphereRealizer1_n4 -> vibrantbassNode");
                    } catch (e) { }
                    break;
                case 'n2':
                    try {
                        CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.audioNodes.audioBands[0]);
                        console.debug("[Cider][Audio] atmosphereRealizer1_n4 -> audioBands");
                    } catch (e) { }
                    break;
                case 'n1':
                        try {
                            CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.audioNodes.llpw[0]);
                            console.debug("[Cider][Audio] atmosphereRealizer1_n4 -> llpw");
                        } catch (e) { }
                    break;     
                case 'n0':
                    try { CiderAudio.audioNodes.atmosphereRealizer1.connect(CiderAudio.context.destination); console.debug("[Cider][Audio] atmosphereRealizer1_n4 -> destination");} catch (e) { }
                    break;
                    
            }


        }
    },
    llpw_n1: function (status, destination) {
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
                
                    try { 
                        switch (localStorage.getItem("playingBitrate")) {
                            case "64":    
                                CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver();
                                CiderAudio.audioNodes.llpw[0].normalize = false;
                                fetch('./cideraudio/impulses/CAP_64.wav').then(async (impulseData) => {
                                    let bufferedImpulse = await impulseData.arrayBuffer();
                                    CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                                });
                                console.debug("[Cider][Audio] CAP Adaptive - 64kbps");
            
                                break;
                            case "256":
                                CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver(); CiderAudio.audioNodes.llpw[0].normalize = false;
                                CiderAudio.audioNodes.llpw[1] = CiderAudio.context.createGain(); CiderAudio.audioNodes.llpw[1].gain.value = 2.37; // Post Gain Compensation
                                CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.llpw[1]);
                                fetch('./cideraudio/impulses/CAP_256_FINAL_48k.wav').then(async (impulseData) => {
                                    let bufferedImpulse = await impulseData.arrayBuffer();
                                    CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                                });
                                console.debug("[Cider][Audio] CAP Adaptive - 256kbps_2_48k");
                                    
                                break;
                            default:
                                CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver(); CiderAudio.audioNodes.llpw[0].normalize = false;
                                CiderAudio.audioNodes.llpw[1] = CiderAudio.context.createGain(); CiderAudio.audioNodes.llpw[1].gain.value = 2.37; // Post Gain Compensation
                                CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.llpw[1]);
                                fetch('./cideraudio/impulses/CAP_256_FINAL_48k.wav').then(async (impulseData) => {
                                    let bufferedImpulse = await impulseData.arrayBuffer();
                                    CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                                });
                                console.debug("[Cider][Audio] CAP Adaptive - CONFIG FALLBACK - 256kbps_2_48k");

                                break;
                        }

                        } catch (e) {
                            CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver(); CiderAudio.audioNodes.llpw[0].normalize = false;
                            CiderAudio.audioNodes.llpw[1] = CiderAudio.context.createGain(); CiderAudio.audioNodes.llpw[1].gain.value = 2.37;
                            CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.llpw[1]);
                            fetch('./cideraudio/impulses/CAP_256_FINAL_48k.wav').then(async (impulseData) => {
                                let bufferedImpulse = await impulseData.arrayBuffer();
                                CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                            });
                            console.debug("[Cider][Audio] CAP Adaptive - (Error Fallback) 256kbps");
                        }
                        
                        break;
                case "MAIKIWI_LEGACY":
                    CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.llpw[0].normalize = false;
                    fetch('./cideraudio/impulses/CAP_Maikiwi.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });
                    console.debug("[Cider][Audio] CAP - Maikiwi Signature Mode");
                    break;
                case "NATURAL":
                    CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver();
                    CiderAudio.audioNodes.llpw[0].normalize = false;
                    fetch('./cideraudio/impulses/CAP_Natural.wav').then(async (impulseData) => {
                        let bufferedImpulse = await impulseData.arrayBuffer();
                        CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                    });

                    console.debug("[Cider][Audio] CAP - Natural Mode");
                    break;

                    case "LEGACY":
                        for (let i = 0; i < LLPW_FREQUENCIES.length; i++) {
                            CiderAudio.audioNodes.llpw[i] = CiderAudio.context.createBiquadFilter();
                            CiderAudio.audioNodes.llpw[i].type = 'peaking'; // 'peaking';
                            CiderAudio.audioNodes.llpw[i].frequency.value = LLPW_FREQUENCIES[i];
                            CiderAudio.audioNodes.llpw[i].Q.value = LLPW_Q[i];
                            CiderAudio.audioNodes.llpw[i].gain.value = LLPW_GAIN[i]; 
                        }
                        for (let i = 1; i < LLPW_FREQUENCIES.length; i ++) {
                            CiderAudio.audioNodes.llpw[i-1].connect(CiderAudio.audioNodes.llpw[i]);
                        } 
                    console.debug("[Cider][Audio] CAP - Legacy Mode");
                    
                    break;

                default:
                    CiderAudio.audioNodes.llpw[0] = CiderAudio.context.createConvolver(); CiderAudio.audioNodes.llpw[0].normalize = false;
                        CiderAudio.audioNodes.llpw[1] = CiderAudio.context.createGain(); CiderAudio.audioNodes.llpw[1].gain.value = 2.57;
                        CiderAudio.audioNodes.llpw[0].connect(CiderAudio.audioNodes.llpw[1]);
                        fetch('./cideraudio/impulses/CAP_256_FINAL_48k.wav').then(async (impulseData) => {
                            let bufferedImpulse = await impulseData.arrayBuffer();
                            CiderAudio.audioNodes.llpw[0].buffer = await CiderAudio.context.decodeAudioData(bufferedImpulse);
                        });
                    app.cfg.audio.maikiwiAudio.ciderPPE_value = "MAIKIWI";
                    
                    console.debug("[Cider][Audio] CAP - Maikiwi Adaptive Mode (Defaulted from broki config)");
                    break;
            }

            switch (destination) {
                case "spatial":
                    try { CiderAudio.audioNodes.llpw.at(-1).connect(CiderAudio.audioNodes.spatialNode); console.debug("[Cider][Audio] llpw_n1 -> Spatial");} catch (e) { }
                    break;
                case "n5":
                    try {
                        CiderAudio.audioNodes.llpw.at(-1).connect(CiderAudio.audioNodes.atmosphereRealizer2);
                        console.debug("[Cider][Audio] llpw_n1 -> atmosphereRealizer2");
                    } catch (e) { }
                    break;
                case 'n4':
                    try {
                        CiderAudio.audioNodes.llpw.at(-1).connect(CiderAudio.audioNodes.atmosphereRealizer1);
                        console.debug("[Cider][Audio] llpw_n1 -> atmosphereRealizer1");
                    } catch (e) { }
                    break;
                case 'n3':
                    try { CiderAudio.audioNodes.llpw.at(-1).connect(CiderAudio.audioNodes.vibrantbassNode[0]); 
                        console.debug("[Cider][Audio] llpw_n1 -> vibrantbassNode");} catch (e) { }
                    break;
                case 'n2':
                    try { CiderAudio.audioNodes.llpw.at(-1).connect(CiderAudio.audioNodes.audioBands[0]); console.debug("[Cider][Audio] llpw_n1 -> audioBands");} catch (e) { }
                    break;
                case 'n1':
                        try {
                            CiderAudio.audioNodes.llpw.at(-1).connect(CiderAudio.audioNodes.llpw[0]);
                            console.debug("[Cider][Audio] llpw_n1 -> llpw");
                        } catch (e) { }
                break;
                case 'n0':
                    try { CiderAudio.audioNodes.llpw.at(-1).connect(CiderAudio.context.destination); console.debug("[Cider][Audio] llpw_n1 -> destination");} catch (e) { }
                    break;
        }
        }

    },
    vibrantbass_n3: function (status, destination) {
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

            switch (destination) {
                case "spatial":
                    try { CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.audioNodes.spatialNode); console.debug("[Cider][Audio] vibrantbass_n3 -> Spatial");} catch (e) { }
                    break;
                
                case "n5":
                    try {
                        CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.audioNodes.atmosphereRealizer2);
                        console.debug("[Cider][Audio] vibrantbass_n3 -> atmosphereRealizer2");
                    } catch (e) { }
                    break;
                case 'n4':
                    try {
                        CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.audioNodes.atmosphereRealizer1);
                        console.debug("[Cider][Audio] vibrantbass_n3 -> atmosphereRealizer1");
                    } catch (e) { }
                    break;
                case 'n3':
                    try {
                        CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                        console.debug("[Cider][Audio] vibrantbass_n3 -> vibrantbassNode");
                    } catch (e) { }
                    break;
                case 'n2':
                    try {
                        CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.audioNodes.audioBands[0]);
                        console.debug("[Cider][Audio] vibrantbass_n3 -> audioBands");
                    } catch (e) { }
                    break;
                case 'n1':
                        try {
                            CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.audioNodes.llpw[0]);
                            console.debug("[Cider][Audio] vibrantbass_n3 -> llpw");
                        } catch (e) { }
                    break;
                case 'n0':
                    try { CiderAudio.audioNodes.vibrantbassNode[0].connect(CiderAudio.context.destination); console.debug("[Cider][Audio] vibrantbass_n3 -> destination");} catch (e) { }
                    break;
            }
        }
    },
    hierarchical_unloading: function () {
        try { CiderAudio.audioNodes.spatialNode.disconnect(); CiderAudio.audioNodes.spatialNode = null} catch (e) { }
        try { CiderAudio.audioNodes.gainNode.disconnect(); } catch (e) { }
        try { CiderAudio.audioNodes.atmosphereRealizer2.disconnect(); CiderAudio.audioNodes.atmosphereRealizer2 = null } catch (e) { }
        try { CiderAudio.audioNodes.atmosphereRealizer1.disconnect(); CiderAudio.audioNodes.atmosphereRealizer1 = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.llpw) { i.disconnect(); } CiderAudio.audioNodes.llpw = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.vibrantbassNode) { i.disconnect(); } CiderAudio.audioNodes.vibrantbassNode = null } catch (e) { }
        try { for (var i of CiderAudio.audioNodes.audioBands) { i.disconnect(); } CiderAudio.audioNodes.vibrantbassNode = null} catch (e) { };
        console.debug("[Cider][Audio] Finished hierarchical unloading")
    },
    hierarchical_loading: async function () {
        const configMap = new Map([
            ['spatial', app.cfg.audio.maikiwiAudio.spatial === true],
            ['n5', app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true],   
            ['n4', app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true], 
            ['n3', app.cfg.audio.equalizer.vibrantBass != 0],
            ['n2', Math.max(...app.cfg.audio.equalizer.gain) != 0],        
            ['n1', app.cfg.audio.maikiwiAudio.ciderPPE === true]
        ]);

        CiderAudio.hierarchical_unloading();
        let lastNode = 'n0';
        for (let [tier, value] of configMap.entries()) { 
            if (value === true) {
                switch (tier) {
                    case 'spatial': 
                        CiderAudio.spatial_ninf();
                        lastNode = 'spatial';
                        break;
                    case 'n5':
                        app.cfg.audio.normalization = true;
                        CiderAudio.atmosphereRealizer2_n5(true, lastNode);
                        lastNode = 'n5';
                        break;   
                    case 'n4':
                        app.cfg.audio.normalization = true;
                        CiderAudio.atmosphereRealizer1_n4(true, lastNode);
                        lastNode = 'n4';
                        break;
                    case 'n3':
                        CiderAudio.vibrantbass_n3(true, lastNode);
                        lastNode = 'n3';
                        break;   
                    case 'n2':
                        CiderAudio.equalizer(true, lastNode);
                        lastNode = 'n2';
                        break;
                    case 'n1':
                        app.cfg.audio.normalization = true;
                        CiderAudio.llpw_n1(true, lastNode);
                        lastNode = 'n1';
                        break;          
                }
            }
        }

        switch (lastNode) {
            case 'spatial': 
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.spatialNode);
                console.debug("[Cider][Audio] gainNode -> Spatial");
                break;
            case 'n5':
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer2);
                console.debug("[Cider][Audio] gainNode -> atmosphereRealizer2");
                break;
            case 'n4':
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.atmosphereRealizer1);
                console.debug("[Cider][Audio] gainNode -> atmosphereRealizer1");            
                break;
            case 'n3':
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                console.debug("[Cider][Audio] gainNode -> vibrantbass");             
                break;
            case 'n2':
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.audioBands[0]);
                console.debug("[Cider][Audio] gainNode -> audioBands");
        
                break;
            case 'n1':
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.audioNodes.llpw[0]);
                console.debug("[Cider][Audio] gainNode -> llpw");
                break;
            case 'n0': 
                CiderAudio.audioNodes.gainNode.connect(CiderAudio.context.destination);
                console.debug("[Cider][Audio] gainNode -> destination");
                break;
        }

        console.debug('[Cider][Audio]\n' + [...configMap.entries()] + '\n lastNode: ' + lastNode);

        CiderAudio.intelliGainComp_n0_0();
        console.debug("[Cider][Audio] Finished hierarchical loading");

    },

    equalizer: function (status, destination) { // n2_1
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

            switch (destination) {
                case 'spatial': 
                    CiderAudio.audioNodes.audioBands[BANDS.length - 1].connect(CiderAudio.audioNodes.spatialNode);
                    console.debug("[Cider][Audio] Equalizer -> Spatial");
                break;
                case "n5":
                    try {
                        CiderAudio.audioNodes.audioBands[BANDS.length - 1].connect(CiderAudio.audioNodes.atmosphereRealizer2);
                        console.debug("[Cider][Audio] Equalizer -> atmosphereRealizer2");
                    } catch (e) { }
                    break;
                case 'n4':
                    try {
                        CiderAudio.audioNodes.audioBands[BANDS.length - 1].connect(CiderAudio.audioNodes.atmosphereRealizer1);
                        console.debug("[Cider][Audio] Equalizer -> atmosphereRealizer1");
                    } catch (e) { }
                    break;
                case 'n3':
                    try {
                        CiderAudio.audioNodes.audioBands[BANDS.length - 1].connect(CiderAudio.audioNodes.vibrantbassNode[0]);
                        console.debug("[Cider][Audio] Equalizer -> vibrantbassNode");
                    } catch (e) { }
                    break;
                case 'n2':
                    try {
                        CiderAudio.audioNodes.audioBands[BANDS.length - 1].connect(CiderAudio.audioNodes.audioBands[0]);
                        console.debug("[Cider][Audio] Equalizer -> audioBands");
                    } catch (e) { }
                    break;
                case 'n1':
                    try {
                        CiderAudio.audioNodes.audioBands[BANDS.length - 1].connect(CiderAudio.audioNodes.llpw[0]);
                        console.debug("[Cider][Audio] Equalizer -> llpw");
                    } catch (e) { }
                    break;
                case 'n0':
                    try { CiderAudio.audioNodes.audioBands[BANDS.length - 1].connect(CiderAudio.context.destination); console.debug("[Cider][Audio] Equalizer -> destination");} catch (e) { }
                    break;        
            }

        }
    }
}
export { CiderAudio }