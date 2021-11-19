(function () {
    const lineClicked = function (self, id) {
        return function () {
            const detail = {"time": self.rangeLrc[id].startTime};
            const e = new CustomEvent(self.clickEventName, {
                'detail': detail,
                "bubbles": true
            });
            const elem = document.getElementById(self.lineidPrefix + id);
            elem.dispatchEvent(e);
        };
    };
    const setHtml = function (self) {
        let i;
        self.currentLine = 0;

        const container = document.getElementById(self.divID);
        if(!container) {
            return;
        }
        container.innerHTML = "";
        const ul = document.createElement("ul");
        container.appendChild(ul);
        for (i = 0; i < self.totalLines; i++) {
            const li = document.createElement("li");
            if (self.rangeLrc[i].line === 'lrcInstrumental'){
                li.innerHTML = `<div class="lyricWaiting"><div></div><div></div><div></div></div>`;
            } else {
            li.innerHTML = self.rangeLrc[i].line;
            if (!li.innerHTML) {
                li.innerHTML = "&nbsp;"
            }}
            li.setAttribute("id", self.lineidPrefix + i);
            if (self.clickable) {
                li.onclick = lineClicked(self, i);
                li.style.cursor = 'pointer';
            }
            ul.appendChild(li);
        }

        /* hide the later ones*/
        for (i = self.totalLines; i < self.totalLines; i++) {
            document.getElementById(self.lineidPrefix + i).style.display = "block";
        }
    };
    const moveToLine = function (self, line) {
        const startShow = line - self.showLines;
        const endShow = line + self.showLines;
        for (let i = 0; i < self.totalLines; i++) {
            const li = document.getElementById(self.lineidPrefix + i);
            if (i >= startShow && i <= endShow) {
                try{
                li.style.display = "block";}
                catch(e){}
            } else {
                li.style.display = "block";
            }
            if (i === line) {
                li.classList.add(self.currentcss);
                if(this.focus == 'start'){
                 li.scrollIntoView({behavior: 'smooth', block: 'start'});    
                }else{
                li.scrollIntoView({behavior: 'smooth', block: 'center'})};
                try{
                if (li.innerText == '&nbsp;'){
                    document.querySelector(`#MVLyricsBox`).style.display = 'none';
                } else if (MusicKit.getInstance().nowPlayingItem["type"] === "musicVideo"){
                    document.querySelector(`#MVLyricsBox`).style.display = 'block';
                }
                var u  = '';
                if (li.getElementsByClassName('lyrics-translation').length > 0 ){
                try{ 
                    if(!li.innerText.includes('Instrumental. / Lyrics not found.')){ 
                    u  = li.getElementsByClassName('lyrics-translation')[0].innerText;    
                    document.querySelector(`#MVLyricsBox`).childNodes[1].innerHTML= li.getElementsByClassName('lyrics-translation')[0].innerText;
                    document.querySelector(`#MVLyricsBox`).childNodes[0].innerHTML= (li.innerText).replace(u,'');}
                } catch(e){}
                } else {
                    if(!li.innerText.includes('Instrumental. / Lyrics not found.')){
                    document.querySelector(`#MVLyricsBox`).childNodes[0].innerHTML= li.innerText;  
                    document.querySelector(`#MVLyricsBox`).childNodes[1].innerHTML= ''; }
                }

                
               
                } catch(e){console.log('mverr',e);}
            } else {
                try{
                li.classList.remove(self.currentcss);
                } catch(e){}
            }
        }
    };
    /* The constructor can be empty or passed in the lrc string*/
    const Lyricer = function (options) {
        this.divID = "lyricer"; /* the default html container id */
        this.currentcss = "lyricer-current-line"; /* this css for the line current playing*/
        this.lineidPrefix = "lyricer-line"; /* the id prefix for each line*/
        this.showLines = 8; /*lines showing before and after;*/
        this.clickable = true;
        this.clickEventName = "lyricerclick";
        this.focus = 'center';
        if (options) {
            for (const prop in options) {
                if (typeof this[prop] != "undefined" && options.hasOwnProperty(prop)) {
                    this[prop] = options[prop];
                }
            }
        }
    };
    Lyricer.prototype.setFocus = function(focus2){
        this.focus = focus2;
    };

    Lyricer.prototype.setLrc = function (rawLrc) {
        let i;
        this.tags = {};
        this.lrc = [];
        this.rangeLrc = [];

        const tagRegex = /\[([a-z]+):(.*)].*/;
        const lrcAllRegex = /(\[[0-9.:\[\]]*])+(.*)/;
        const timeRegex = /\[([0-9]+):([0-9.]+)]/;
        const rawLrcArray = rawLrc.split(/[\r\n]/);
        for (i = 0; i < rawLrcArray.length; i++) {
            /* handle tags first*/
            const tag = tagRegex.exec(rawLrcArray[i]);
            if (tag && tag[0]) {
                this.tags[tag[1]] = tag[2];
                continue;
            }
            /* handle lrc*/
            const lrc = lrcAllRegex.exec(rawLrcArray[i]);
            if (lrc && lrc[0]) {
                const times = lrc[1].replace(/]\[/g, "],[").split(",");
                for (let j = 0; j < times.length; j++) {
                    const time = timeRegex.exec(times[j]);
                    if (time && time[0]) {
                        this.lrc.push({"startTime": parseInt(time[1], 10) * 60 + parseFloat(time[2]), "line": lrc[2]});
                    }
                }
            }
        }

        /*sort lrc array*/
        this.lrc.sort(function (a, b) {
            return a.startTime - b.startTime;
        });

        /* crate the range lrc array*/
        /* dummy lines*/
        /* for (var i = 0; i < rawLrcArray.length; i++) {
        /* 	this.rangeLrc.push( { "startTime": -1, "endTime": 0, "line": "&nbsp;" } );
        /* };
        /* real data*/
        let startTime = 0;
        let line = "";
        for (i = 0; i < this.lrc.length; i++) {
            endTime = parseFloat(this.lrc[i].startTime);
            if (startTime == 10 && line == 'lrcInstrumental') startTime=0; 
            if (!this.rangeLrc.includes({"startTime": startTime, "endTime": endTime, "line": line})){               
            this.rangeLrc.push({"startTime": startTime, "endTime": endTime, "line": line});} else {console.log('blocked');}
            startTime = endTime;
            line = this.lrc[i].line;
        }
        this.rangeLrc.push({"startTime": startTime, "endTime": 999.99, "line": line});
        /* dummy lines
        /* for (var i = 0; i < this.showLines; i++) {
        /* 	this.rangeLrc.push( { "startTime": -1, "endTime": 0, "line": "&nbsp;" } );
        /* };*/
        this.totalLines = this.rangeLrc.length;
        console.log(this.rangeLrc);

        /* set html and move to start*/
        setHtml(this);
        this.move(0);
        if(typeof _lyrics !== "undefined") {
            _lyrics.setLyrics(this.rangeLrc);
        }
    };

    Lyricer.prototype.move = function (time) {
        for (let i = 0; i < this.totalLines; i++) {
            if (time >= this.rangeLrc[i].startTime && time < this.rangeLrc[i].endTime) {
                if (this.currentLine !== i) {
                    this.currentLine = i;
                    moveToLine(this, this.currentLine);
                }
                return;
            }
        }
    };

    Lyricer.prototype.setMXMTranslation = function (translation_list) {
        const container = document.getElementById(this.divID);
        const lines = container.getElementsByTagName('li');
        for (var line of lines){
            for (var trans_line of translation_list){
                if (line.textContent == " "+trans_line["translation"]["matched_line"]){
                    const trans = document.createElement("div");
                    trans.className = "lyrics-translation";
                    trans.textContent = trans_line["translation"]["description"];
                    line.appendChild(trans);
                    break;
                }
            }
        }
        
    };

    window.Lyricer = Lyricer; /*exposed to global*/

})();
