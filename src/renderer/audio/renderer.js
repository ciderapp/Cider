const CiderAudioRenderer = {
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
    opportunisticCorrection: null,
  },
  off: function () {
    CiderAudioRenderer.hierarchical_unloading();
    try {
      CiderAudioRenderer.audioNodes = {
        gainNode: null,
        spatialNode: null,
        audioBands: null,
        vibrantbassNode: null,
        llpw: null,
        recorderNode: null,
        intelliGainComp: null,
        atmosphereRealizer2: null,
        atmosphereRealizer1: null,
        opportunisticCorrection: null,
      };
    } catch (e) {}
  },
  init: function () {
    CiderAudioRenderer.context = new OfflineAudioContext({
      numberOfChannels: 2,
      length: 96000 * 8,
      sampleRate: 96000,
    });
    CiderAudioRenderer.audioNodes.gainNode = CiderAudioRenderer.context.createGain();
    CiderAudioRenderer.audioNodes.gainNode.gain.value = 1;
    CiderAudioRenderer.audioNodes.intelliGainComp = CiderAudioRenderer.context.createGain();
    CiderAudioRenderer.audioNodes.intelliGainComp.gain.value = 1;
    CiderAudioRenderer.audioNodes.intelliGainComp.connect(CiderAudioRenderer.audioNodes.gainNode);
    CiderAudioRenderer.hierarchical_loading();
  },
  optimizerProfile: [
    {
      id: "dirac32_96",
      file: "./cideraudio/impulses/OptimizerDirac32_96.wav",
      bitDepth: 32,
      sampleRate: 96000,
      container: "WAV",
    },
  ],
  spatialProfiles: [
    {
      id: "maikiwi",
      file: "./cideraudio/impulses/CiderSpatial_Maikiwi.wav",
      name: "Maikiwi",
      description: "",
      gainComp: "1.044",
    },
    {
      id: "maikiwiplus",
      file: "./cideraudio/impulses/CiderSpatial_MaikiwiPlus.wav",
      name: "Maikiwi+",
      description: "",
      gainComp: "1.044",
    },
    {
      id: "71_420maikiwi",
      file: "./cideraudio/impulses/CiderSpatial_v71.420_Maikiwi.wav",
      name: "Soundstage",
      description: "",
      gainComp: "1.3963683610559376",
    },
    {
      id: "70_422maikiwi",
      file: "./cideraudio/impulses/CiderSpatial_v70.422_Maikiwi.wav",
      name: "Separation",
      description: "",
      gainComp: "1.30767553892022",
    },
    {
      id: "standard",
      file: "./cideraudio/impulses/CiderSpatial_Natural.wav",
      name: "Minimal",
      description: "",
      gainComp: "1.044",
    },
    {
      id: "standardplus",
      file: "./cideraudio/impulses/CiderSpatial_Natural+.wav",
      name: "Minimal+",
      description: "",
      gainComp: "1.044",
    },
    {
      id: "diffused",
      file: "./cideraudio/impulses/CiderSpatial_Diffuse.wav",
      name: "Diffused",
      description: "",
      gainComp: "1.044",
    },
    {
      id: "BPLK",
      file: "./cideraudio/impulses/CiderSpatial_BPLK.wav",
      name: "BPLK",
      description: "",
      gainComp: "1.044",
    },
    {
      id: "HW2K",
      file: "./cideraudio/impulses/CiderSpatial_HW2K.wav",
      name: "HW2K",
      description: "",
      gainComp: "1.044",
    },
    {
      id: "live",
      file: "./cideraudio/impulses/CiderSpatial_LIVE_2.wav",
      name: "live",
      description: "",
      gainComp: "1.2647363474711515",
    },
  ],
  atmosphereRealizerProfiles: [
    {
      id: "NATURAL_STANDARD",
      file: "./cideraudio/impulses/AtmosphereRealizer_NaturalStandard.wav",
      name: "ほうじ茶チーズクリーマティー",
      description: "",
    },
    {
      id: "NATURAL_PLUS",
      file: "./cideraudio/impulses/AtmosphereRealizer_Natural+.wav",
      name: "玄米茶タピオカミルクティー",
      description: "",
    },
    {
      id: "E68_1",
      file: "./cideraudio/impulses/AtmosphereRealizer_E68_1.5.wav",
      name: "岩塩クリームチーズティー",
      description: "Light",
    },
    {
      id: "E68_2",
      file: "./cideraudio/impulses/AtmosphereRealizer_E68_2.2.wav",
      name: "抹茶ミルクティー",
      description: "Dark",
    },
    {
      id: "BSCBM",
      file: "./cideraudio/impulses/AtmosphereRealizer_BSCBM.wav",
      name: "BSCBM",
      description: "BSCBM",
    },
    {
      id: "CUDDLE",
      file: "./cideraudio/impulses/AtmosphereRealizer_Cuddle.wav",
      name: "CUDDLE",
      description: "CUDDLE",
    },
    {
      id: "E168_1",
      file: "./cideraudio/impulses/AtmosphereRealizer_E168_1.2.wav",
      name: "春毫ジャスミンマキアート",
      description: "Natural Air",
    },
    {
      id: "Z3600",
      file: "./cideraudio/impulses/AtmosphereRealizer_Z3600.wav",
      name: "ロイヤルミルクティー",
      description: "3600",
    },
    {
      id: "Z8500A",
      file: "./cideraudio/impulses/AtmosphereRealizer_Z8500_A.wav",
      name: "ムーンライトソフトケーキ",
      description: "8500",
    },
    {
      id: "Z8500B",
      file: "./cideraudio/impulses/AtmosphereRealizer_Z8500_B.wav",
      name: "Clafoutis aux Cerises",
      description: "8500",
    },
    {
      id: "Z8500C",
      file: "./cideraudio/impulses/AtmosphereRealizer_Z8500_C.wav",
      name: "宇治抹茶だいふく",
      description: "8500",
    },
  ],
  opportunisticCorrectionProfiles: [
    {
      id: "CHU",
      file: "./cideraudio/impulses/MoondropCHU_Cider.wav",
      name: "Moondrop CHU Specific",
      description: "",
    },
  ],
  spatial_ninf: function () {
    CiderAudioRenderer.audioNodes.spatialNode = null;
    CiderAudioRenderer.audioNodes.spatialNode = CiderAudioRenderer.context.createConvolver();
    CiderAudioRenderer.audioNodes.spatialNode.normalize = false;

    let spatialProfile = CiderAudioRenderer.spatialProfiles.find(function (profile) {
      return profile.id === app.cfg.audio.maikiwiAudio.spatialProfile;
    });

    if (spatialProfile === undefined) {
      spatialProfile = CiderAudioRenderer.spatialProfiles[0];
    }
    fetch(spatialProfile.file).then(async (impulseData) => {
      let bufferedImpulse = await impulseData.arrayBuffer();
      CiderAudioRenderer.audioNodes.spatialNode.buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
    });

    // Always destination
    CiderAudioRenderer.audioNodes.spatialNode.connect(CiderAudioRenderer.context.destination);
  },
  spatialOff: function () {
    CiderAudioRenderer.hierarchical_loading();
  },
  intelliGainComp_n0_0: function () {
    let filters = [];
    const precisionHz = 12;
    // Biquad calculation
    if (CiderAudioRenderer.audioNodes.audioBands !== null) {
      filters = filters.concat(CiderAudioRenderer.audioNodes.audioBands);
    }
    if (CiderAudioRenderer.audioNodes.vibrantbassNode !== null) {
      filters = filters.concat(CiderAudioRenderer.audioNodes.vibrantbassNode);
    }
    if (CiderAudioRenderer.audioNodes.llpw !== null && CiderAudioRenderer.audioNodes.llpw.length > 2) {
      filters = filters.concat(CiderAudioRenderer.audioNodes.llpw);
    }

    if (!filters || filters.length === 0) {
      let filterlessGain = 1;
      // Impulse Calculation
      if (CiderAudioRenderer.audioNodes.llpw !== null && CiderAudioRenderer.audioNodes.llpw.length <= 2) {
        filterlessGain = filterlessGain * 1.109174815262401;
      }
      if (app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true) {
        filterlessGain = filterlessGain * 1.096478196143185;
      }
      if (app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true) {
        filterlessGain = filterlessGain * 1.096478196143185;
      }
      if (app.cfg.audio.maikiwiAudio.spatial == true) {
        let spatialProfile = CiderAudioRenderer.spatialProfiles.find(function (profile) {
          return profile.id === app.cfg.audio.maikiwiAudio.spatialProfile;
        });
        if (spatialProfile === undefined) {
          spatialProfile = CiderAudioRenderer.spatialProfiles[0];
        }
        filterlessGain = filterlessGain * spatialProfile.gainComp;
      }
      filterlessGain = Math.pow(10, (-1 * (20 * Math.log10(filterlessGain))) / 20).toFixed(4);
      filterlessGain > 1.0
        ? CiderAudioRenderer.audioNodes.intelliGainComp.gain.exponentialRampToValueAtTime(1.0, CiderAudioRenderer.context.currentTime + 0.3)
        : CiderAudioRenderer.audioNodes.intelliGainComp.gain.exponentialRampToValueAtTime(filterlessGain, CiderAudioRenderer.context.currentTime + 0.3);
      console.debug(`[Cider][Audio] IntelliGainComp: ${filterlessGain > 1.0 ? 0 : (20 * Math.log10(filterlessGain)).toFixed(2)} dB (${filterlessGain > 1.0 ? 1 : filterlessGain})`);
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
    let amplitudeResp = new Float32Array(steps),
      phaseResp = new Float32Array(steps);
    for (let i = filters.length - 1; i >= 0; i--) {
      let filter = filters[i];
      // Get filter response and convolve it with existing response
      filter.getFrequencyResponse(frequencies, amplitudeResp, phaseResp);
      for (let j = 0; j < steps; j++) {
        totalAmplitudeResp[j] *= amplitudeResp[j];
      }
    }
    // Find max gain
    let maxGain = -120;
    for (let i = 0; i < steps; i++) {
      let gain = totalAmplitudeResp[i];
      if (gain > maxGain) maxGain = gain;
    }

    // Impulse Calculation
    if (CiderAudioRenderer.audioNodes.llpw !== null && CiderAudioRenderer.audioNodes.llpw.length <= 2) {
      maxGain = maxGain * 1.109174815262401;
    }
    if (app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true) {
      maxGain = maxGain * 1.096478196143185;
    }
    if (app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true) {
      maxGain = maxGain * 1.096478196143185;
    }
    if (app.cfg.audio.maikiwiAudio.spatial == true) {
      let spatialProfile = CiderAudioRenderer.spatialProfiles.find(function (profile) {
        return profile.id === app.cfg.audio.maikiwiAudio.spatialProfile;
      });
      if (spatialProfile === undefined) {
        spatialProfile = CiderAudioRenderer.spatialProfiles[0];
      }
      maxGain = maxGain * spatialProfile.gainComp;
    }
    maxGain = Math.pow(10, (-1 * (20 * Math.log10(maxGain))) / 20).toFixed(4);
    maxGain > 1.0
      ? CiderAudioRenderer.audioNodes.intelliGainComp.gain.exponentialRampToValueAtTime(1.0, CiderAudioRenderer.context.currentTime + 0.3)
      : CiderAudioRenderer.audioNodes.intelliGainComp.gain.exponentialRampToValueAtTime(maxGain, CiderAudioRenderer.context.currentTime + 0.3);
    console.debug(`[Cider][Audio] IntelliGainComp: ${maxGain > 1.0 ? 0 : (20 * Math.log10(maxGain)).toFixed(2)} dB (${maxGain > 1.0 ? 1 : maxGain})`);
  },
  atmosphereRealizer2_n6: function (status, destination) {
    if (status === true) {
      CiderAudioRenderer.audioNodes.atmosphereRealizer2 = CiderAudioRenderer.context.createConvolver();
      CiderAudioRenderer.audioNodes.atmosphereRealizer2.normalize = false;
      let atmosphereRealizerProfile = CiderAudioRenderer.atmosphereRealizerProfiles.find(function (profile) {
        return profile.id === app.cfg.audio.maikiwiAudio.atmosphereRealizer2_value;
      });

      if (atmosphereRealizerProfile === undefined) {
        atmosphereRealizerProfile = CiderAudioRenderer.atmosphereRealizerProfiles[0];
      }
      fetch(atmosphereRealizerProfile.file).then(async (impulseData) => {
        let bufferedImpulse = await impulseData.arrayBuffer();
        CiderAudioRenderer.audioNodes.atmosphereRealizer2.buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
      });

      switch (destination) {
        case "spatial":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.connect(CiderAudioRenderer.audioNodes.spatialNode);
            console.debug("[Cider][Audio] atmosphereRealizer2_n6 -> Spatial");
          } catch (e) {}
          break;
        case "n6":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer2);
            console.debug("[Cider][Audio] atmosphereRealizer2_n6 -> atmosphereRealizer2");
          } catch (e) {}
          break;
        case "n5":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer1);
            console.debug("[Cider][Audio] atmosphereRealizer2_n6 -> atmosphereRealizer1");
          } catch (e) {}
          break;
        case "n4":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.connect(CiderAudioRenderer.audioNodes.vibrantbassNode[0]);
            console.debug("[Cider][Audio] atmosphereRealizer2_n6 -> vibrantbassNode");
          } catch (e) {}
          break;
        case "n3":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.connect(CiderAudioRenderer.audioNodes.audioBands[0]);
            console.debug("[Cider][Audio] atmosphereRealizer2_n6 -> audioBands");
          } catch (e) {}
          break;
        case "n2":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.connect(CiderAudioRenderer.audioNodes.opportunisticCorrection);
            console.debug("[Cider][Audio] atmosphereRealizer2_n6 -> opportunisticCorrection");
          } catch (e) {}
          break;
        case "n1":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.connect(CiderAudioRenderer.audioNodes.llpw[0]);
            console.debug("[Cider][Audio] atmosphereRealizer2_n6 -> llpw");
          } catch (e) {}
          break;
        case "n0":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.connect(CiderAudioRenderer.context.destination);
            console.debug("[Cider][Audio] atmosphereRealizer2_n6 -> destination");
          } catch (e) {}
          break;
      }
    }
  },
  atmosphereRealizer1_n5: function (status, destination) {
    if (status === true) {
      CiderAudioRenderer.audioNodes.atmosphereRealizer1 = CiderAudioRenderer.context.createConvolver();
      CiderAudioRenderer.audioNodes.atmosphereRealizer1.normalize = false;
      let atmosphereRealizerProfile = CiderAudioRenderer.atmosphereRealizerProfiles.find(function (profile) {
        return profile.id === app.cfg.audio.maikiwiAudio.atmosphereRealizer1_value;
      });

      if (atmosphereRealizerProfile === undefined) {
        atmosphereRealizerProfile = CiderAudioRenderer.atmosphereRealizerProfiles[0];
      }
      fetch(atmosphereRealizerProfile.file).then(async (impulseData) => {
        let bufferedImpulse = await impulseData.arrayBuffer();
        CiderAudioRenderer.audioNodes.atmosphereRealizer1.buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
      });

      switch (destination) {
        case "spatial":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.connect(CiderAudioRenderer.audioNodes.spatialNode);
            console.debug("[Cider][Audio] atmosphereRealizer1_n5 -> Spatial");
          } catch (e) {}
          break;
        case "n6":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer2);
            console.debug("[Cider][Audio] atmosphereRealizer1_n5 -> atmosphereRealizer2");
          } catch (e) {}
          break;
        case "n5":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer1);
            console.debug("[Cider][Audio] atmosphereRealizer1_n5 -> atmosphereRealizer1");
          } catch (e) {}
          break;
        case "n4":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.connect(CiderAudioRenderer.audioNodes.vibrantbassNode[0]);
            console.debug("[Cider][Audio] atmosphereRealizer1_n5 -> vibrantbassNode");
          } catch (e) {}
          break;
        case "n3":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.connect(CiderAudioRenderer.audioNodes.audioBands[0]);
            console.debug("[Cider][Audio] atmosphereRealizer1_n5 -> audioBands");
          } catch (e) {}
          break;
        case "n2":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.connect(CiderAudioRenderer.audioNodes.opportunisticCorrection);
            console.debug("[Cider][Audio] atmosphereRealizer1_n5 -> opportunisticCorrection");
          } catch (e) {}
          break;
        case "n1":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.connect(CiderAudioRenderer.audioNodes.llpw[0]);
            console.debug("[Cider][Audio] atmosphereRealizer1_n5 -> llpw");
          } catch (e) {}
          break;
        case "n0":
          try {
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.connect(CiderAudioRenderer.context.destination);
            console.debug("[Cider][Audio] atmosphereRealizer1_n5 -> destination");
          } catch (e) {}
          break;
      }
    }
  },
  opportunisticCorrection_n2: function (status, destination) {
    if (status === true) {
      CiderAudioRenderer.audioNodes.opportunisticCorrection = CiderAudioRenderer.context.createConvolver();
      CiderAudioRenderer.audioNodes.opportunisticCorrection.normalize = false;
      let opportunisticCorrectionProfile = CiderAudioRenderer.opportunisticCorrectionProfiles.find(function (profile) {
        return profile.id === app.cfg.audio.maikiwiAudio.opportunisticCorrection_state;
      });

      if (opportunisticCorrectionProfile === undefined) {
        opportunisticCorrectionProfile = CiderAudioRenderer.opportunisticCorrectionProfiles[0];
      }
      fetch(opportunisticCorrectionProfile.file).then(async (impulseData) => {
        let bufferedImpulse = await impulseData.arrayBuffer();
        CiderAudioRenderer.audioNodes.opportunisticCorrection.buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
      });

      switch (destination) {
        case "spatial":
          try {
            CiderAudioRenderer.audioNodes.opportunisticCorrection.connect(CiderAudioRenderer.audioNodes.spatialNode);
            console.debug("[Cider][Audio] opportunisticCorrection_n2 -> Spatial");
          } catch (e) {}
          break;
        case "n6":
          try {
            CiderAudioRenderer.audioNodes.opportunisticCorrection.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer2);
            console.debug("[Cider][Audio] opportunisticCorrection_n2 -> atmosphereRealizer2");
          } catch (e) {}
          break;
        case "n5":
          try {
            CiderAudioRenderer.audioNodes.opportunisticCorrection.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer1);
            console.debug("[Cider][Audio] opportunisticCorrection_n2 -> atmosphereRealizer1");
          } catch (e) {}
          break;
        case "n4":
          try {
            CiderAudioRenderer.audioNodes.opportunisticCorrection.connect(CiderAudioRenderer.audioNodes.vibrantbassNode[0]);
            console.debug("[Cider][Audio] opportunisticCorrection_n2 -> vibrantbassNode");
          } catch (e) {}
          break;
        case "n3":
          try {
            CiderAudioRenderer.audioNodes.opportunisticCorrection.connect(CiderAudioRenderer.audioNodes.audioBands[0]);
            console.debug("[Cider][Audio] opportunisticCorrection_n2 -> audioBands");
          } catch (e) {}
          break;
        case "n2":
          try {
            CiderAudioRenderer.audioNodes.opportunisticCorrection.connect(CiderAudioRenderer.audioNodes.opportunisticCorrection);
            console.debug("[Cider][Audio] opportunisticCorrection_n2 -> opportunisticCorrection");
          } catch (e) {}
          break;
        case "n1":
          try {
            CiderAudioRenderer.audioNodes.opportunisticCorrection.connect(CiderAudioRenderer.audioNodes.opportunisticCorrection[0]);
            console.debug("[Cider][Audio] opportunisticCorrection_n2 -> opportunisticCorrection");
          } catch (e) {}
          break;
        case "n0":
          try {
            CiderAudioRenderer.audioNodes.opportunisticCorrection.connect(CiderAudioRenderer.context.destination);
            console.debug("[Cider][Audio] opportunisticCorrection_n2 -> destination");
          } catch (e) {}
          break;
      }
    }
  },
  llpw_n1: function (status, destination) {
    if (status === true) {
      let c_LLPW_Q = [1.25, 0.131, 10, 2.5, 2.293, 0.11, 14.14, 1.552, 28.28, 7.071, 2.847, 5, 0.625, 7.071, 3.856, 3.856, 20, 28.28, 20, 14.14, 2.102, 6.698, 3.536, 10];
      let c_LLPW_GAIN = [-0.11, 0.27, -0.8, 0.57, 1.84, -0.38, 0.47, -1.56, 0.83, 1.58, -1.79, -0.45, 0.48, 1.22, -1.58, -1.59, -2.03, 2.56, -2.2, -2.48, 4.75, 10.5, 1.43, 3.76];
      let c_LLPW_FREQUENCIES = [400.83, 5812.8, 8360, 10413, 10658, 12079, 12899, 13205, 14848, 15591, 15778, 15783, 16716, 16891, 17255, 17496, 18555, 18622, 19219, 19448, 19664, 21341, 21353, 22595];
      let LLPW_Q = [5, 1, 3.536, 1.25, 8.409, 1.25, 14.14, 7.071, 5, 0.625, 16.82, 20, 20, 20, 28.28, 28.28, 28.28, 20, 33.64, 33.64, 10, 28.28, 7.071, 3.856];
      let LLPW_GAIN = [0.38, -1.81, -0.23, -0.51, 0.4, 0.84, 0.36, -0.34, 0.27, -1.2, -0.42, -0.67, 0.81, 1.31, -0.71, 0.68, -1.04, 0.79, -0.73, -1.33, 1.17, 0.57, 0.35, 6.33];
      let LLPW_FREQUENCIES = [16.452, 24.636, 37.134, 74.483, 159.54, 308.18, 670.21, 915.81, 1200.7, 2766.4, 2930.6, 4050.6, 4409.1, 5395.2, 5901.6, 6455.5, 7164.1, 7724.1, 8449, 10573, 12368, 14198, 17910, 18916];
      CiderAudioRenderer.audioNodes.llpw = [];

      switch (app.cfg.audio.maikiwiAudio.ciderPPE_value) {
        case "MAIKIWI":
          try {
            switch (localStorage.getItem("playingBitrate")) {
              case "64":
                CiderAudioRenderer.audioNodes.llpw[0] = CiderAudioRenderer.context.createConvolver();
                CiderAudioRenderer.audioNodes.llpw[0].normalize = false;
                fetch("./cideraudio/impulses/CAP_64.wav").then(async (impulseData) => {
                  let bufferedImpulse = await impulseData.arrayBuffer();
                  CiderAudioRenderer.audioNodes.llpw[0].buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
                });
                console.debug("[Cider][Audio] CAP Adaptive - 64kbps");

                break;
              case "256":
                CiderAudioRenderer.audioNodes.llpw[0] = CiderAudioRenderer.context.createConvolver();
                CiderAudioRenderer.audioNodes.llpw[0].normalize = false;
                CiderAudioRenderer.audioNodes.llpw[1] = CiderAudioRenderer.context.createGain();
                CiderAudioRenderer.audioNodes.llpw[1].gain.value = 2.37; // Post Gain Compensation
                CiderAudioRenderer.audioNodes.llpw[0].connect(CiderAudioRenderer.audioNodes.llpw[1]);
                fetch("./cideraudio/impulses/CAP_256_FINAL_48k.wav").then(async (impulseData) => {
                  let bufferedImpulse = await impulseData.arrayBuffer();
                  CiderAudioRenderer.audioNodes.llpw[0].buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
                });
                console.debug("[Cider][Audio] CAP Adaptive - 256kbps");

                break;
              default:
                CiderAudioRenderer.audioNodes.llpw[0] = CiderAudioRenderer.context.createGain();
                CiderAudioRenderer.audioNodes.llpw[0].gain.value = 1;
                console.debug("[Cider][Audio] CAP Disabled (Passthrough) : Non-Lossy Bitrate.");

                break;
            }
          } catch (e) {
            CiderAudioRenderer.audioNodes.llpw[0] = CiderAudioRenderer.context.createConvolver();
            CiderAudioRenderer.audioNodes.llpw[0].normalize = false;
            CiderAudioRenderer.audioNodes.llpw[1] = CiderAudioRenderer.context.createGain();
            CiderAudioRenderer.audioNodes.llpw[1].gain.value = 2.37;
            CiderAudioRenderer.audioNodes.llpw[0].connect(CiderAudioRenderer.audioNodes.llpw[1]);
            fetch("./cideraudio/impulses/CAP_256_FINAL_48k.wav").then(async (impulseData) => {
              let bufferedImpulse = await impulseData.arrayBuffer();
              CiderAudioRenderer.audioNodes.llpw[0].buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
            });
            console.debug("[Cider][Audio] CAP Adaptive - (Error Fallback) 256kbps");
          }

          break;
        case "MAIKIWI_LEGACY":
          CiderAudioRenderer.audioNodes.llpw[0] = CiderAudioRenderer.context.createConvolver();
          CiderAudioRenderer.audioNodes.llpw[0].normalize = false;
          fetch("./cideraudio/impulses/CAP_Maikiwi.wav").then(async (impulseData) => {
            let bufferedImpulse = await impulseData.arrayBuffer();
            CiderAudioRenderer.audioNodes.llpw[0].buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
          });
          console.debug("[Cider][Audio] CAP - Maikiwi Signature Mode");
          break;
        case "NATURAL":
          CiderAudioRenderer.audioNodes.llpw[0] = CiderAudioRenderer.context.createConvolver();
          CiderAudioRenderer.audioNodes.llpw[0].normalize = false;
          fetch("./cideraudio/impulses/CAP_Natural.wav").then(async (impulseData) => {
            let bufferedImpulse = await impulseData.arrayBuffer();
            CiderAudioRenderer.audioNodes.llpw[0].buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
          });

          console.debug("[Cider][Audio] CAP - Natural Mode");
          break;

        case "LEGACY":
          for (let i = 0; i < LLPW_FREQUENCIES.length; i++) {
            CiderAudioRenderer.audioNodes.llpw[i] = CiderAudioRenderer.context.createBiquadFilter();
            CiderAudioRenderer.audioNodes.llpw[i].type = "peaking"; // 'peaking';
            CiderAudioRenderer.audioNodes.llpw[i].frequency.value = LLPW_FREQUENCIES[i];
            CiderAudioRenderer.audioNodes.llpw[i].Q.value = LLPW_Q[i];
            CiderAudioRenderer.audioNodes.llpw[i].gain.value = LLPW_GAIN[i];
          }
          for (let i = 1; i < LLPW_FREQUENCIES.length; i++) {
            CiderAudioRenderer.audioNodes.llpw[i - 1].connect(CiderAudioRenderer.audioNodes.llpw[i]);
          }
          console.debug("[Cider][Audio] CAP - Legacy Mode");

          break;

        default:
          CiderAudioRenderer.audioNodes.llpw[0] = CiderAudioRenderer.context.createConvolver();
          CiderAudioRenderer.audioNodes.llpw[0].normalize = false;
          CiderAudioRenderer.audioNodes.llpw[1] = CiderAudioRenderer.context.createGain();
          CiderAudioRenderer.audioNodes.llpw[1].gain.value = 2.57;
          CiderAudioRenderer.audioNodes.llpw[0].connect(CiderAudioRenderer.audioNodes.llpw[1]);
          fetch("./cideraudio/impulses/CAP_256_FINAL_48k.wav").then(async (impulseData) => {
            let bufferedImpulse = await impulseData.arrayBuffer();
            CiderAudioRenderer.audioNodes.llpw[0].buffer = await CiderAudioRenderer.context.decodeAudioData(bufferedImpulse);
          });
          app.cfg.audio.maikiwiAudio.ciderPPE_value = "MAIKIWI";

          console.debug("[Cider][Audio] CAP - Maikiwi Adaptive Mode (Defaulted from broki config)");
          break;
      }

      switch (destination) {
        case "spatial":
          try {
            CiderAudioRenderer.audioNodes.llpw.at(-1).connect(CiderAudioRenderer.audioNodes.spatialNode);
            console.debug("[Cider][Audio] llpw_n1 -> Spatial");
          } catch (e) {}
          break;
        case "n6":
          try {
            CiderAudioRenderer.audioNodes.llpw.at(-1).connect(CiderAudioRenderer.audioNodes.atmosphereRealizer2);
            console.debug("[Cider][Audio] llpw_n1 -> atmosphereRealizer2");
          } catch (e) {}
          break;
        case "n5":
          try {
            CiderAudioRenderer.audioNodes.llpw.at(-1).connect(CiderAudioRenderer.audioNodes.atmosphereRealizer1);
            console.debug("[Cider][Audio] llpw_n1 -> atmosphereRealizer1");
          } catch (e) {}
          break;
        case "n4":
          try {
            CiderAudioRenderer.audioNodes.llpw.at(-1).connect(CiderAudioRenderer.audioNodes.vibrantbassNode[0]);
            console.debug("[Cider][Audio] llpw_n1 -> vibrantbassNode");
          } catch (e) {}
          break;
        case "n3":
          try {
            CiderAudioRenderer.audioNodes.llpw.at(-1).connect(CiderAudioRenderer.audioNodes.audioBands[0]);
            console.debug("[Cider][Audio] llpw_n1 -> audioBands");
          } catch (e) {}
          break;
        case "n2":
          try {
            CiderAudioRenderer.audioNodes.llpw.at(-1).connect(CiderAudioRenderer.audioNodes.opportunisticCorrection);
            console.debug("[Cider][Audio] llpw_n1 -> opportunisticCorrection");
          } catch (e) {}
          break;
        case "n1":
          try {
            CiderAudioRenderer.audioNodes.llpw.at(-1).connect(CiderAudioRenderer.audioNodes.llpw[0]);
            console.debug("[Cider][Audio] llpw_n1 -> llpw");
          } catch (e) {}
          break;
        case "n0":
          try {
            CiderAudioRenderer.audioNodes.llpw.at(-1).connect(CiderAudioRenderer.context.destination);
            console.debug("[Cider][Audio] llpw_n1 -> destination");
          } catch (e) {}
          break;
      }
    }
  },
  vibrantbass_n4: function (status, destination) {
    if (status === true) {
      let VIBRANTBASSBANDS = app.cfg.audio.maikiwiAudio.vibrantBass.frequencies;
      let VIBRANTBASSGAIN = app.cfg.audio.maikiwiAudio.vibrantBass.gain;
      let VIBRANTBASSQ = app.cfg.audio.maikiwiAudio.vibrantBass.Q;
      CiderAudioRenderer.audioNodes.vibrantbassNode = [];

      for (let i = 0; i < VIBRANTBASSBANDS.length; i++) {
        CiderAudioRenderer.audioNodes.vibrantbassNode[i] = CiderAudioRenderer.context.createBiquadFilter();
        CiderAudioRenderer.audioNodes.vibrantbassNode[i].type = "peaking"; // 'peaking';
        CiderAudioRenderer.audioNodes.vibrantbassNode[i].frequency.value = VIBRANTBASSBANDS[i];
        CiderAudioRenderer.audioNodes.vibrantbassNode[i].Q.value = VIBRANTBASSQ[i];
        CiderAudioRenderer.audioNodes.vibrantbassNode[i].gain.value = VIBRANTBASSGAIN[i] * (app.cfg.audio.equalizer.vibrantBass / 10);
      }

      for (let i = 1; i < VIBRANTBASSBANDS.length; i++) {
        CiderAudioRenderer.audioNodes.vibrantbassNode[i - 1].connect(CiderAudioRenderer.audioNodes.vibrantbassNode[i]);
      }

      switch (destination) {
        case "spatial":
          try {
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).connect(CiderAudioRenderer.audioNodes.spatialNode);
            console.debug("[Cider][Audio] vibrantbass_n4 -> Spatial");
          } catch (e) {}
          break;

        case "n6":
          try {
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).connect(CiderAudioRenderer.audioNodes.atmosphereRealizer2);
            console.debug("[Cider][Audio] vibrantbass_n4 -> atmosphereRealizer2");
          } catch (e) {}
          break;
        case "n5":
          try {
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).connect(CiderAudioRenderer.audioNodes.atmosphereRealizer1);
            console.debug("[Cider][Audio] vibrantbass_n4 -> atmosphereRealizer1");
          } catch (e) {}
          break;
        case "n4":
          try {
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).connect(CiderAudioRenderer.audioNodes.vibrantbassNode[0]);
            console.debug("[Cider][Audio] vibrantbass_n4 -> vibrantbassNode");
          } catch (e) {}
          break;
        case "n3":
          try {
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).connect(CiderAudioRenderer.audioNodes.audioBands[0]);
            console.debug("[Cider][Audio] vibrantbass_n4 -> audioBands");
          } catch (e) {}
          break;
        case "n2":
          try {
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).connect(CiderAudioRenderer.audioNodes.opportunisticCorrection);
            console.debug("[Cider][Audio] vibrantbass_n4 -> opportunisticCorrection");
          } catch (e) {}
          break;
        case "n1":
          try {
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).connect(CiderAudioRenderer.audioNodes.llpw[0]);
            console.debug("[Cider][Audio] vibrantbass_n4 -> llpw");
          } catch (e) {}
          break;
        case "n0":
          try {
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).connect(CiderAudioRenderer.context.destination);
            console.debug("[Cider][Audio] vibrantbass_n4 -> destination");
          } catch (e) {}
          break;
      }
    }
  },
  hierarchical_optimizer: function () {
    CiderAudioRenderer.intelliGainComp_n0_0(); // Calculate headroom for upcoming convolver

    // Render and return convolved buffer
    let optimizerProfile = CiderAudioRenderer.optimizerProfile.find(function (profile) {
      return profile.id === "dirac32_96"; // Hard code for now
    });

    return fetch(optimizerProfile.file)
      .then(async (response) => await response.arrayBuffer())
      .then((arrayBuffer) => CiderAudioRenderer.context.decodeAudioData(arrayBuffer))
      .then((decodedBuffer) => {
        const source = new AudioBufferSourceNode(CiderAudioRenderer.context, {
          buffer: decodedBuffer,
        });

        source.connect(CiderAudioRenderer.audioNodes.intelliGainComp);

        switch (lastNode) {
          case "spatial":
            CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.spatialNode);
            break;
          case "n6":
            CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer2);
            break;
          case "n5":
            CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer1);
            break;
          case "n4":
            CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.vibrantbassNode[0]);
            break;
          case "n3":
            CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.audioBands[0]);
            break;
          case "n2":
            CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.opportunisticCorrection);
            break;
          case "n1":
            CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.llpw[0]);
            break;
        }

        switch (firstNode) {
          case "spatial":
            CiderAudioRenderer.audioNodes.spatialNode.disconnect();
            CiderAudioRenderer.audioNodes.spatialNode.connect(renderer.destination);
            break;
          case "n6":
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.disconnect();
            CiderAudioRenderer.audioNodes.atmosphereRealizer2.connect(renderer.destination);
            break;
          case "n5":
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.disconnect();
            CiderAudioRenderer.audioNodes.atmosphereRealizer1.connect(renderer.destination);
            break;
          case "n4":
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).disconnect();
            CiderAudioRenderer.audioNodes.vibrantbassNode.at(-1).connect(renderer.destination);
            break;
          case "n3":
            CiderAudioRenderer.audioNodes.audioBands.at(-1).disconnect();
            CiderAudioRenderer.audioNodes.audioBands.at(-1).connect(renderer.destination);
            break;
          case "n2":
            CiderAudioRenderer.audioNodes.opportunisticCorrection.disconnect();
            CiderAudioRenderer.audioNodes.opportunisticCorrection.connect(renderer.destination);
            break;
          case "n1":
            CiderAudioRenderer.audioNodes.llpw.at(-1).disconnect();
            CiderAudioRenderer.audioNodes.llpw.at(-1).connect(renderer.destination);
            break;
        }

        source.start();

        return CiderAudioRenderer.context.startRendering().then(function (res) {
          return res;
        });
      });
  },
  hierarchical_unloading: function () {
    try {
      CiderAudioRenderer.audioNodes.spatialNode.disconnect();
      CiderAudioRenderer.audioNodes.spatialNode = null;
    } catch (e) {}
    try {
      CiderAudioRenderer.audioNodes.gainNode.disconnect();
    } catch (e) {}
    try {
      CiderAudioRenderer.audioNodes.atmosphereRealizer2.disconnect();
      CiderAudioRenderer.audioNodes.atmosphereRealizer2 = null;
    } catch (e) {}
    try {
      CiderAudioRenderer.audioNodes.atmosphereRealizer1.disconnect();
      CiderAudioRenderer.audioNodes.atmosphereRealizer1 = null;
    } catch (e) {}
    try {
      for (var i of CiderAudioRenderer.audioNodes.llpw) {
        i.disconnect();
      }
      CiderAudioRenderer.audioNodes.llpw = null;
    } catch (e) {}
    try {
      for (var i of CiderAudioRenderer.audioNodes.vibrantbassNode) {
        i.disconnect();
      }
      CiderAudioRenderer.audioNodes.vibrantbassNode = null;
    } catch (e) {}
    try {
      for (var i of CiderAudioRenderer.audioNodes.audioBands) {
        i.disconnect();
      }
      CiderAudioRenderer.audioNodes.vibrantbassNode = null;
    } catch (e) {}
    try {
      CiderAudioRenderer.audioNodes.opportunisticCorrection.disconnect();
      CiderAudioRenderer.audioNodes.opportunisticCorrection = null;
    } catch (e) {}
    console.debug("[Cider][Audio] Finished hierarchical unloading");
  },
  hierarchical_loading: async function () {
    if (app.cfg.audio.maikiwiAudio.staticOptimizer.lock === true) {
      return;
    } // Do nothing if locked by optimizer.

    const configMap = new Map([
      ["spatial", app.cfg.audio.maikiwiAudio.spatial === true],
      ["n6", app.cfg.audio.maikiwiAudio.atmosphereRealizer2 === true],
      ["n5", app.cfg.audio.maikiwiAudio.atmosphereRealizer1 === true],
      ["n4", app.cfg.audio.equalizer.vibrantBass != 0],
      ["n3", Math.max(...app.cfg.audio.equalizer.gain) != 0],
      ["n2", app.cfg.audio.maikiwiAudio.opportunisticCorrection_state !== "OFF"],
      ["n1", app.cfg.audio.maikiwiAudio.ciderPPE === true],
    ]);

    CiderAudioRenderer.hierarchical_unloading();
    let lastNode = "n0";
    let index = 0;
    let firstNode = "n0";
    for (let [tier, value] of configMap.entries()) {
      if (value === true) {
        if (index === 0) {
          firstNode = tier;
        }
        switch (tier) {
          case "spatial":
            CiderAudioRenderer.spatial_ninf();
            lastNode = "spatial";
            break;
          case "n6":
            app.cfg.audio.normalization = true;
            CiderAudioRenderer.atmosphereRealizer2_n6(true, lastNode);
            lastNode = "n6";
            break;
          case "n5":
            app.cfg.audio.normalization = true;
            CiderAudioRenderer.atmosphereRealizer1_n5(true, lastNode);
            lastNode = "n5";
            break;
          case "n4":
            CiderAudioRenderer.vibrantbass_n4(true, lastNode);
            lastNode = "n4";
            break;
          case "n3":
            CiderAudioRenderer.equalizer(true, lastNode);
            lastNode = "n3";
            break;
          case "n2":
            CiderAudioRenderer.opportunisticCorrection_n2(true, lastNode);
            lastNode = "n2";
            break;
          case "n1":
            app.cfg.audio.normalization = true;
            CiderAudioRenderer.llpw_n1(true, lastNode);
            lastNode = "n1";
            break;
        }
      }
    }

    app.cfg.audio.maikiwiAudio.lastNode = lastNode;
    app.cfg.audio.maikiwiAudio.firstNode = firstNode; // Sync last node & first

    switch (lastNode) {
      case "spatial":
        CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.spatialNode);
        console.debug("[Cider][Audio] gainNode -> Spatial");
        break;
      case "n6":
        CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer2);
        console.debug("[Cider][Audio] gainNode -> atmosphereRealizer2");
        break;
      case "n5":
        CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.atmosphereRealizer1);
        console.debug("[Cider][Audio] gainNode -> atmosphereRealizer1");
        break;
      case "n4":
        CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.vibrantbassNode[0]);
        console.debug("[Cider][Audio] gainNode -> vibrantbass");
        break;
      case "n3":
        CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.audioBands[0]);
        console.debug("[Cider][Audio] gainNode -> audioBands");

        break;
      case "n2":
        try {
          CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.opportunisticCorrection);
          console.debug("[Cider][Audio] gainNode -> opportunisticCorrection");
        } catch (e) {}
        break;
      case "n1":
        CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.audioNodes.llpw[0]);
        console.debug("[Cider][Audio] gainNode -> llpw");
        break;
      case "n0":
        CiderAudioRenderer.audioNodes.gainNode.connect(CiderAudioRenderer.context.destination);
        console.debug("[Cider][Audio] gainNode -> destination");
        break;
    }

    console.debug("[Cider][Audio]\n" + [...configMap.entries()] + "\n lastNode: " + lastNode);

    CiderAudioRenderer.intelliGainComp_n0_0();
    console.debug("[Cider][Audio] Finished hierarchical loading");
  },

  equalizer: function (status, destination) {
    // n3_1
    if (status === true) {
      let BANDS = app.cfg.audio.equalizer.frequencies;
      let GAIN = app.cfg.audio.equalizer.gain;
      let Q = app.cfg.audio.equalizer.Q;

      CiderAudioRenderer.audioNodes.audioBands = [];
      for (let i = 0; i < BANDS.length; i++) {
        CiderAudioRenderer.audioNodes.audioBands[i] = CiderAudioRenderer.context.createBiquadFilter();
        CiderAudioRenderer.audioNodes.audioBands[i].type = "peaking"; // 'peaking';
        CiderAudioRenderer.audioNodes.audioBands[i].frequency.value = BANDS[i];
        CiderAudioRenderer.audioNodes.audioBands[i].Q.value = Q[i];
        CiderAudioRenderer.audioNodes.audioBands[i].gain.value = GAIN[i] * app.cfg.audio.equalizer.mix;
      }

      for (let i = 1; i < BANDS.length; i++) {
        CiderAudioRenderer.audioNodes.audioBands[i - 1].connect(CiderAudioRenderer.audioNodes.audioBands[i]);
      }

      switch (destination) {
        case "spatial":
          CiderAudioRenderer.audioNodes.audioBands.at(-1).connect(CiderAudioRenderer.audioNodes.spatialNode);
          console.debug("[Cider][Audio] Equalizer -> Spatial");
          break;
        case "n6":
          try {
            CiderAudioRenderer.audioNodes.audioBands.at(-1).connect(CiderAudioRenderer.audioNodes.atmosphereRealizer2);
            console.debug("[Cider][Audio] Equalizer -> atmosphereRealizer2");
          } catch (e) {}
          break;
        case "n5":
          try {
            CiderAudioRenderer.audioNodes.audioBands.at(-1).connect(CiderAudioRenderer.audioNodes.atmosphereRealizer1);
            console.debug("[Cider][Audio] Equalizer -> atmosphereRealizer1");
          } catch (e) {}
          break;
        case "n4":
          try {
            CiderAudioRenderer.audioNodes.audioBands.at(-1).connect(CiderAudioRenderer.audioNodes.vibrantbassNode[0]);
            console.debug("[Cider][Audio] Equalizer -> vibrantbassNode");
          } catch (e) {}
          break;
        case "n3":
          try {
            CiderAudioRenderer.audioNodes.audioBands.at(-1).connect(CiderAudioRenderer.audioNodes.audioBands[0]);
            console.debug("[Cider][Audio] Equalizer -> audioBands");
          } catch (e) {}
          break;
        case "n2":
          try {
            CiderAudioRenderer.audioNodes.audioBands.at(-1).connect(CiderAudioRenderer.audioNodes.opportunisticCorrection);
            console.debug("[Cider][Audio] Equalizer -> opportunisticCorrection");
          } catch (e) {}
          break;
        case "n1":
          try {
            CiderAudioRenderer.audioNodes.audioBands.at(-1).connect(CiderAudioRenderer.audioNodes.llpw[0]);
            console.debug("[Cider][Audio] Equalizer -> llpw");
          } catch (e) {}
          break;
        case "n0":
          try {
            CiderAudioRenderer.audioNodes.audioBands.at(-1).connect(CiderAudioRenderer.context.destination);
            console.debug("[Cider][Audio] Equalizer -> destination");
          } catch (e) {}
          break;
      }
    }
  },
};
export { CiderAudioRenderer };
