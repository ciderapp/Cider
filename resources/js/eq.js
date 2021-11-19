var EAOverride = true;
var AErecorderNode;
var GCOverride = true;
var outputID = -1;
var EAoutputID = -1;
var queueExclusive = false;
var queueChromecast = false;
var selectedGC ;
var MVsource;
var windowAudioNode;
const workerOptions = {
  OggOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OggOpusEncoder.wasm',
  WebMOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/WebMOpusEncoder.wasm'
};
var recorder;

window.MediaRecorder = OpusMediaRecorder;

var audioWorklet =  `class RecorderWorkletProcessor extends AudioWorkletProcessor {
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
      this._bufferSize = 32768;
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
  
  registerProcessor('recorder-worklet', RecorderWorkletProcessor);`;
var GCstream;
var searchInt;
var AMEx = {
    context: new AudioContext(),
    result: {},
    filter: [],
    EQRanges: [{
        f: 32,
        type: 'lowshelf'
    }, {
        f: 64,
        type: 'peaking'
    }, {
        f: 125,
        type: 'peaking'
    }, {
        f: 250,
        type: 'peaking'
    }, {
        f: 500,
        type: 'peaking'
    }, {
        f: 1000,
        type: 'peaking'
    }, {
        f: 2000,
        type: 'peaking'
    }, {
        f: 4000,
        type: 'peaking'
    }, {
        f: 8000,
        type: 'peaking'
    }, {
        f: 16000,
        type: 'highshelf'
    }]
};
var bassFilter;
var trebleFilter;

var AudioOutputs = {
    fInit: false,
    eqReady: false,
    activeCasts: [],
    castUI() {
        AMJavaScript.getRequest("ameres://html/cast_device.html", (content) => {
            var vm = new Vue({
                data: {
                    devices: {
                        cast: [],
                        airplay: []
                    },
                    scanning: false,
                    activeCasts: AudioOutputs.activeCasts
                },
                methods: {
                    scan() {
                        let self = this;
                        this.scanning = true;
                        AudioOutputs.getGCDevices();
                        setTimeout(()=>{
                            self.devices.cast = ipcRenderer.sendSync("getKnownCastDevices");
                            self.scanning = false;
                        }, 2000);
                        console.log(this.devices);
                        vm.$forceUpdate();
                    },
                    setCast(device) {
                        console.log(`requesting: ${device}`);
                        AudioOutputs.playGC(device);
                    },
                    stopCasting() {
                        AudioOutputs.stopGC();
                        this.activeCasts = AudioOutputs.activeCasts;
                        vm.$forceUpdate();
                    },
                    close() {
                        modal.close();
                    }
                }
            });
            var modal = new AMEModal({
                content: content,
                CloseButton: false,
                Style: {
                    maxWidth: "600px"
                },
                OnCreate() {
                    vm.$mount("#castdevices-vue");
                    vm.scan();                                  
                },
                OnClose() {
                    _vues.destroy(vm);
                }
            });
        })
    },
    init: function (cb = function () {}) {
        AudioOutputs.fInit = true;
         searchInt = setInterval(function () {
            if (document.getElementById("apple-music-player")) {
                AudioOutputs.eqReady = true;
                document.getElementById("apple-music-player").crossOrigin = "anonymous";
                AudioOutputs.amplifyMedia(document.getElementById("apple-music-player"), 0);
                var context = AMEx.context;
                var source = AMEx.result.source;
                bassFilter = context.createBiquadFilter();
                bassFilter.type = "lowshelf";
                bassFilter.frequency.value = 200;
                bassFilter.gain.value = 0;

                trebleFilter = context.createBiquadFilter();
                trebleFilter.type = "highshelf";
                trebleFilter.frequency.value = 2000;
                trebleFilter.gain.value = 0;

                source.connect(bassFilter);
                bassFilter.connect(trebleFilter);
                trebleFilter.connect(context.destination);
                console.log("Attached EQ");
             
                if (queueExclusive){
                  console.log('we good');
                  AudioOutputs.startExclusiveAudio(outputID); }  
          
                cb();
                clearInterval(searchInt);
            }
        }, 1000);
        waitFor(()=>{return queueChromecast &&
          ((document.getElementById("apple-music-player") != null&& 
           document.getElementById("apple-music-player").readyState == 4) || (
           document.querySelector('apple-music-video-player') &&
           document.querySelector('apple-music-video-player').shadowRoot  && 
           document.querySelector('apple-music-video-player').shadowRoot.querySelector('amp-video-player-internal') &&
           document.querySelector('apple-music-video-player').shadowRoot.querySelector('amp-video-player-internal').shadowRoot && 
           document.querySelector('apple-music-video-player').shadowRoot.querySelector('amp-video-player-internal').shadowRoot.querySelector('amp-video-player') &&
           document.querySelector('apple-music-video-player').shadowRoot.querySelector('amp-video-player-internal').shadowRoot.querySelector('amp-video-player').shadowRoot && 
           document.querySelector('apple-music-video-player').shadowRoot.querySelector('amp-video-player-internal').shadowRoot.querySelector('amp-video-player').shadowRoot.getElementById('apple-music-video-player') && 
           document.querySelector('apple-music-video-player').shadowRoot.querySelector('amp-video-player-internal').shadowRoot.querySelector('amp-video-player').shadowRoot.getElementById('apple-music-video-player').readyState == 4))  ;},() => AudioOutputs.playGC(selectedGC))
        
    },
    amplifyMedia: function (mediaElem, multiplier) {
        AMEx.context = new(window.AudioContext || window.webkitAudioContext),
        AMEx.result = {
            context: AMEx.context,
            source: AMEx.context.createMediaElementSource(mediaElem),
            gain: AMEx.context.createGain(),
            media: mediaElem,
            amplify: function (multiplier) {
                AMEx.result.gain.gain.value = multiplier;
            },
            getAmpLevel: function () {
                return AMEx.result.gain.gain.value;
            }
        };
        AMEx.result.source.connect(AMEx.result.gain);
        AMEx.result.gain.connect(AMEx.context.destination);
        AMEx.result.amplify(multiplier);
        return AMEx.result;
    },
    popup_generic: function ({
        title = "",
        content = document.createElement("div"),
        closefn = function () {},
        transparentBg = false,
        windowStyle = {},
        backdropStyle = {}
    }) {
        let backdrop = document.createElement("div");
        backdrop.style.width = "100%";
        backdrop.style.height = "100%";
        backdrop.style.position = "fixed";
        backdrop.style.top = 0;
        backdrop.style.left = 0;
        if (!transparentBg) {
            backdrop.style.background = "rgba(0,0,0,0.5)";
        } else {
            backdrop.style.background = "rgba(0,0,0,0.0)";
        };
        backdrop.style.zIndex = 10000;
        backdrop.style.display = "flex";
        backdrop.style.alignItems = "center";
        backdrop.style.justifyContent = "center";
        let win = document.createElement("div");
        win.style.width = "300px";
        win.style.background = "var(--modalBGColor)";
        win.style.zIndex = 10000;
        win.style.padding = "16px";
        win.style.borderRadius = "10px";
        Object.assign(backdrop.style, backdropStyle);
        Object.assign(win.style, windowStyle);
        let closeBtn = document.createElement("button");
        closeBtn.style.background = "var(--primaryColor)";
        closeBtn.style.borderRadius = "4px";
        closeBtn.style.padding = "8px 0px 8px 0px";
        closeBtn.style.width = "100%";
        closeBtn.style.fontWeight = "bold";
        closeBtn.style.margin = "12px 0px 0px 0px";
        closeBtn.innerHTML = "Close";
        closeBtn.id = "eq-close";
        closeBtn.addEventListener("click", function () {
            backdrop.remove();
            closefn();
        });
        let titleText = document.createElement("div");
        titleText.innerHTML = (title);
        titleText.style.fontWeight = "bold";


        win.appendChild(titleText);
        win.appendChild(content);
        win.appendChild(closeBtn);

        backdrop.appendChild(win);
        document.body.appendChild(backdrop);
    },
    ShowEQ: function () {
        if (!AudioOutputs.eqReady) {
            alert("Audio is not ready, Play a song to use this function.");
        };
        let backdrop = document.createElement("div");
        backdrop.style.width = "100%";
        backdrop.style.height = "100%";
        backdrop.style.position = "fixed";
        backdrop.style.top = 0;
        backdrop.style.left = 0;
        backdrop.style.background = "rgba(0,0,0,0.5)";
        backdrop.style.zIndex = 9999;
        backdrop.style.display = "flex";
        backdrop.style.alignItems = "center";
        backdrop.style.justifyContent = "center";
        backdrop.style.backdropFilter = "blur(12px) saturate(180%)";

        let win = document.createElement("div");
        win.style.width = "300px";
        win.style.background = "var(--modalBGColor)";
        win.style.zIndex = 10000;
        win.style.padding = "16px";
        win.style.borderRadius = "10px";


        let closeBtn = document.createElement("button");
        closeBtn.style.background = "var(--primaryColor)";
        closeBtn.style.borderRadius = "4px";
        closeBtn.style.padding = "8px 0px 8px 0px";
        closeBtn.style.width = "100%";
        closeBtn.style.fontWeight = "bold";
        closeBtn.style.margin = "12px 0px 0px 0px";

        closeBtn.innerHTML = "Close";
        closeBtn.addEventListener("click", function () {
            backdrop.remove()
        });

        let titleText = document.createElement("div");
        let bassText = document.createElement("div");
        let trebleText = document.createElement("div");
        let gainText = document.createElement("div");
        titleText.id = 'eq-menu';
        titleText.innerHTML = (`Equalizer`);
        titleText.style.fontWeight = "bold";
        bassText.innerHTML = (`Bass (${bassFilter.gain.value})`);
        trebleText.innerHTML = (`Treble (${trebleFilter.gain.value})`);
        gainText.innerHTML = (`Gain (${AMEx.result.gain.gain.value})`);


        let bassAdjust = document.createElement("input");
        bassAdjust.style.width = "100%";
        bassAdjust.type = "range";
        bassAdjust.min = -10;
        bassAdjust.max = 10;
        bassAdjust.value = bassFilter.gain.value;
        bassAdjust.addEventListener("input", function () {
            bassFilter.gain.value = this.value;
            bassText.innerHTML = `Bass (${bassFilter.gain.value})`;
        });

        let trebleAdjust = document.createElement("input");
        trebleAdjust.style.width = "100%";
        trebleAdjust.min = -10;
        trebleAdjust.max = 10;
        trebleAdjust.type = "range";
        trebleAdjust.value = trebleFilter.gain.value;
        trebleAdjust.addEventListener("input", function () {
            trebleFilter.gain.value = this.value;
            trebleText.innerHTML = `Treble (${trebleFilter.gain.value})`;
        });

        let gainAdjust = document.createElement("input");
        gainAdjust.style.width = "100%";
        gainAdjust.min = -1;
        gainAdjust.max = 1;
        gainAdjust.type = "range";
        gainAdjust.value = AMEx.result.gain.gain.value;
        gainAdjust.addEventListener("input", function () {
            AMEx.result.gain.gain.value = this.value;
            gainText.innerHTML = `Gain (${AMEx.result.gain.gain.value})`;
        });

        let bassLabel = document.createElement("label");
        let trebleLabel = document.createElement("label");
        let gainLabel = document.createElement("label");

        bassLabel.appendChild(bassText);
        trebleLabel.appendChild(trebleText);
        gainLabel.appendChild(gainText);

        bassLabel.appendChild(bassAdjust);
        bassLabel.appendChild(document.createElement("br"));
        trebleLabel.appendChild(trebleAdjust);
        trebleLabel.appendChild(document.createElement("br"));
        gainLabel.appendChild(gainAdjust);

        win.appendChild(titleText);
        win.appendChild(bassLabel);
        win.appendChild(trebleLabel);
        win.appendChild(gainLabel);
        win.appendChild(closeBtn);

        backdrop.appendChild(win);
        document.body.appendChild(backdrop);
    },
    getAudioDevices: function(){
        ipcRenderer.send('getAudioDevices','');
    },
    startExclusiveAudio: async function(id){
    
        if(AMEx.result.source != null || MVsource != null){
        if(EAoutputID!= id){  
        EAoutputID = id;
        EAOverride = false;
        ipcRenderer.send('muteAudio',true);
        ipcRenderer.send('enableExclusiveAudio',id);
        windowAudioNode = AMEx.context.createGain();
        try{
          AMEx.result.source.connect(windowAudioNode);}
        catch(e){}
    
        var options = {
          mimeType : 'audio/wav'
        };
        var destnode = AMEx.context.createMediaStreamDestination();
        windowAudioNode.connect(destnode);
        if(!recorder){
        recorder = new MediaRecorder(destnode.stream,options,workerOptions); 
        recorder.start(1);
  
        recorder.ondataavailable = function(e) {
          e.data.arrayBuffer().then(buffer => {
              if(!GCOverride)  {ipcRenderer.send('writeWAV',buffer,preferences.audio.castingBitDepth);}
              if(!EAOverride)  {ipcRenderer.send('writePCM',buffer);}
            }
        );                   
        }}
          
      } else {console.log('device already in exclusive mode');}
    } else {
         outputID = id;
         queueExclusive = true;
    }
    },
     stopExclusiveAudio: function(){
      try{
        recorder.stop();
        recorder = null;
      } catch(e){}
        EAOverride = true;
        EAoutputID = -1;
        outputID = -1;
        queueExclusive = false;
        ipcRenderer.send('muteAudio',false);
        ipcRenderer.send('disableExclusiveAudio','');
        
    },
    getGCDevices: function(){
        ipcRenderer.send('getChromeCastDevices','');
    },
    playGC : async function(device){
      console.log('wot');
    AudioOutputs.activeCasts.push(device);
      GCOverride = false;
    if(AMEx.result.source != null || MVsource != null ){
      queueChromecast = false; 
      const musicType = (MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem["type"] ?? '' : '';
      const trackName = ((MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem.title ?? '' : '');
      const artistName = ((MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem.artistName ?? '' : '');
      const albumName = ((MusicKit.getInstance().nowPlayingItem != null) ? MusicKit.getInstance().nowPlayingItem.albumName ?? '' : '');
      ipcRenderer.send('performGCCast',device, "Apple Music Electron","Playing ...","3.0.0 beta",'');
      windowAudioNode = AMEx.context.createGain();
      try{
        AMEx.result.source.connect(windowAudioNode);}
      catch(e){}
  
      var options = {
        mimeType : 'audio/wav'
      };
      var destnode = AMEx.context.createMediaStreamDestination();
      windowAudioNode.connect(destnode);
      if(!recorder){
      recorder = new MediaRecorder(destnode.stream,options,workerOptions); 
      recorder.start(1);

      recorder.ondataavailable = function(e) {
        e.data.arrayBuffer().then(buffer => {
            if(!GCOverride)  {
              ipcRenderer.send('writeWAV',buffer,preferences.audio.castingBitDepth);
            }
            if(!EAOverride)  {ipcRenderer.send('writePCM',buffer);}
          }
      );                   
      }}

      } else {queueChromecast = true; selectedGC = device}
             
     
    },
    stopGC : function(){
       queueChromecast = false;
       try{
         recorder.stop();
         recorder = null;
       } catch(e){}
       GCOverride = true;
       this.activeCasts = [];
       ipcRenderer.send('stopGCast','');
    } 
};



document.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
            case "2":
                if (document.getElementById('eq-menu')){
                    document.getElementById('eq-menu').parentNode.getElementsByTagName('button')[0].click();  
                }
                else{AudioOutputs.ShowEQ();}
                break;
            case "3":
                (EAOverride) ? (EAOverride = false) : (EAOverride = true);
                break;    
        }
    }
});

function waitFor(condition, callback) {
  if(condition() == null || !condition() ) {
      window.setTimeout(waitFor.bind(null, condition, callback), 1000); 
  } else {
      callback();
  }
}

function setIntervalX(callback, delay, repetitions) {
  var x = 0;
  var intervalID = window.setInterval(function () {

     callback();

     if (++x === repetitions) {
         window.clearInterval(intervalID);
     }
  }, delay);
}

AudioOutputs.init()