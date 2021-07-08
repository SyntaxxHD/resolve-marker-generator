const Store = require('electron-store');
const store = new Store();
var fileName = "undefined";
var fillBar = document.getElementById("fill");
var currentSong = 0;
var output;
var count = 0;
var markercode = "";
var i = 0;
var position;
var qs = window.location.href;
var selectedFramerate;
var maxFramerate;
var lengthError = false;
var loaded = false;
var newCurrentTime = 0;

var minutes = 01;
var seconds = 00;
var tens = 00; 
var frames = 00; //Das EDL-Format benötigt auch die aktuellen Frames
var framesHigher;
var displayTens = document.getElementById("tens"); //Zeit die im Dokument angezeigt wird
var displaySeconds = document.getElementById("seconds");
var displayMinutes = document.getElementById("minutes");
var displayFrames = 00;
var displayFramesHigher = 00;
var buttonStart = document.getElementById('button-start');
var buttonStop = document.getElementById('button-stop');
var buttonReset = document.getElementById('button-reset');
var Interval;
var version;

//Seite kann nur mit index.html?startFromElectron. Dies soll verhindern man die HTML Datei in den Programmdateien öffnen kann.
qs = qs.substr(qs.indexOf("?") + 1);
try {
  if(process.versions.electron) {
    version = process.versions.electron;
  }
} catch (error) {}

if (qs == version) {}
else {
  window.location.href="about:blank";
}

//Passt die Fenstergröße an die Bildschrimgröße an
window.onload = resizeWindow();
function resizeWindow() {
    var screenWidth = screen.height;
    var zoomValue = 1080 / screenWidth;
    var zoomPercentage = 100 / zoomValue;
    document.getElementById('body').style.zoom = zoomPercentage + '%';
}

//style der waveform beim Laden der Audio. Mehr Infos über die wavesurfer Libary gibt es hier: https://wavesurfer-js.org
var wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#ff4049',
  progressColor: '#8a7f7f',
  barWidth: 2,
  barHeight: 1,
  barRadius: 2,
  barGap: 3,
  cursorWidth: 0
});

//Generiert ein Blob Objekt aus der hochgeladenen Datei und fügt sie in <audio> ein
$(document).ready(function () {
  $('#input').change(function (e) {
    var sound = document.getElementById('sound');
    sound.src = URL.createObjectURL(this.files[0]);
    sound.onend = function (e) {
    URL.revokeObjectURL(this.src);
    };
    wavesurfer.load(sound.src);
    loadFilename(e);
  });
});

function loadFilename(e) {
  var songName = document.getElementById("song-name");
  var errorMessage2 = document.getElementById("error-message-2");
  wavesurfer.on('ready', function () {
    if (wavesurfer.getDuration() < 3600) {
      fileName = e.target.files[0].name; //Dateiname wird aus der hochgeladenen Datei geholt
      fileName = fileName.substr(0, fileName.lastIndexOf(".")); //Entfernt die Dateiendung
      songName.innerHTML = fileName; //Fügt den Dateiname in Seite ein
      errorMessage2.innerHTML = '⠀';
      loaded = true;
      lengthError = false;
    } else {
      songName.innerHTML = '⠀';
      errorMessage2.innerHTML = langSupportedLength;
      lengthError = true;
    }
  });
}

//Starte oder pausiert den Song und ändert das Icon
function playOrPauseSong() {
  var waveformdiv = document.getElementById('waveform');
  if(loaded == true) {
    if (wavesurfer.isPlaying() == false) {
      if (document.getElementById('sound').src == '' || lengthError == true) {
        document.getElementById("error-message-2").innerHTML = langSelectAudio;
        return;
      }
      wavesurfer.play(); //Startet den Song
      $("#play img").attr("src", "assets/img/stop-icon.svg");

      var newCurrentTime = wavesurfer.getCurrentTime();
      console.log(Math.floor(newCurrentTime / 60));
      console.log(Math.floor(newCurrentTime) - minutes * 60);
      minutes = Math.floor(newCurrentTime / 60);
      seconds = Math.floor(newCurrentTime) - minutes * 60;
      startInterval();
      waveformdiv.style.zIndex = -1;
    } else {
      wavesurfer.stop();
      $("#play img").attr("src", "assets/img/record-icon.svg");
      stopInteval();
      fillBar.style.width = 0;
      waveformdiv.style.zIndex = 0;
    }
  }
}

wavesurfer.on('audioprocess', function () {

  position = wavesurfer.getCurrentTime() / wavesurfer.getDuration(); //Ändert die Songpositions-Kreis
  
  fillBar.style.width = position * 100 + '%';
  wavesurfer.on('finish', function() {
    stopInteval();
    $("#play img").attr("src", "assets/img/record-icon.svg");
    document.getElementById('waveform').style.zIndex = 0;
  })
});


//Startet den Timer
function startInterval() {
  clearInterval(Interval);
  Interval = setInterval(startTimer, 10);
  if (minutes > 0) {
    displayMinutes.innerHTML = "0" + minutes;
  }
}

//Stoppt und resettet den Timer
function stopInteval() {
  clearInterval(Interval);
  tens = "00";
  seconds = "00";
  minutes = "00";
  frames = "00";
  displayTens.innerHTML = tens;
  displaySeconds.innerHTML = seconds;
  displayMinutes.innerHTML = minutes;
  displayFrames = frames;
}

//Timer Funktion
function startTimer() {
  tens++;

  if (tens < 9) {
    displayTens.innerHTML = "0" + tens;
  }

  if (tens > 9) {
    displayTens.innerHTML = tens;
  }

  if (tens > 99) {
    seconds++;
    displaySeconds.innerHTML = "0" + seconds;
    tens = 0;
    displayTens.innerHTML = "0" + 0;
  }
  
  if (seconds > 9) {
    displaySeconds.innerHTML = seconds;
  }

  if (seconds > 59) {
    minutes++;
    displayMinutes.innerHTML = "0" + minutes;
    seconds = 0;
    displaySeconds.innerHTML = "0" + 0;
  }

  if (minutes > 9) {
    displaySeconds.innerHTML = seconds;
  }

}

//Beim betätigen der Taste "1" wird ein blauer Marker gesetzt
document.addEventListener("keypress", function (event) {
  if (event.keyCode == 49) { //Tastatur Knopf "1"
    setMarker("blue");
  }
  else if(event.keyCode == 50) { //Tastatur Knopf "2"
    setMarker("red");
  }
  else if(event.keyCode == 51) { //Tastatur Knopf "3"
    setMarker("green");
  }
});

function setMarker(color) {
  var markers = document.getElementById("markers");
  frames = parseInt(tens/selectedFramerate, 10);
  framesHigher = frames + 1; //Das EDL-Format benötigt den aktuellen Frame und den aktuellen Frame um eine Zahl erhöht
  displayFrames = frames;
  displayFramesHigher = framesHigher;

  if (frames < 10) {
    displayFrames = "0" + frames;
  }
  if (framesHigher < 10) {
    displayFramesHigher = "0" + framesHigher;
  }
  
  if (framesHigher > maxFramerate) {
    displayFramesHigher = "00";
  }
    
    
    offset = position * 100 + '%'; //Postion für das Marker Icon wird berechnet
    var innerHTML = markers.innerHTML;

  if (document.getElementById('sound').src == '') {
    document.getElementById("error-message-2").innerHTML = langSelectAudio; //Gibt eine Fehlermeldung aus wenn noch kein Song ausgewählt wurde
    return;
  }

  i++;
  var i0 = i;
  if (i0 < 10) {
    i0 = "00" + i0;
  } else if (i0 < 100) {
    i0 = "0" + i0;
  }
    
  if (color == "blue") {
    markers.innerHTML = innerHTML + '<img src="assets/img/marker-blue.svg" class="marker" style="left: ' + offset + '">'; //Setzt einen blauen Marker an die aktuelle Song Position
    
    //Der aktuelle Marker wird mit Zeit Code in die Variable eingefügt
    markercode = markercode + i0 + '  001      V     C        01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + '\n |C:ResolveColorBlue |M:Marker ' + i + ' |D:1\n\n';
  }
  else if (color == "red") {
    markers.innerHTML = innerHTML + '<img src="assets/img/marker-red.svg" class="marker" style="left: ' + offset + '">'; 
    
    markercode = markercode + i0 + '  001      V     C        01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + '\n |C:ResolveColorRed |M:Marker ' + i + ' |D:1\n\n';
  }
  else if (color == "green") {
    markers.innerHTML = innerHTML + '<img src="assets/img/marker-green.svg" class="marker" style="left: ' + offset + '">';
    
    markercode = markercode + i0 + '  001      V     C        01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + '\n |C:ResolveColorGreen |M:Marker ' + i + ' |D:1\n\n';
  }
}


//Führt Generierung aus
document.getElementById("download-btn").addEventListener("click", function () {
  document.getElementById("logo-icon").style.display = "none";
  document.getElementById("loading-icon").style.display = "inline-flex";
  document.getElementById("error-message").innerHTML = "";

  if (count == 0) {
    count = 1;
    var elem = document.getElementById("progress-text");
    var progress = 1;
    var id = setInterval(frame, i);

    //Fügt einen virtuellen Ladescreen ein
    function frame() {
      if (progress >= 100) {
        clearInterval(id);
        count = 0;
        elem.innerHTML = progress + '% ' + langGenerated;
        generateEDL();
      } else {
        progress++;
        elem.innerHTML = langGenerating + progress + '%';
      }
    }
  }
});

//Generiert die EDL Datei
function generateEDL() {
  var errorMessage = document.getElementById("error-message");
  var loadingIcon = document.getElementById("loading-icon");
  var logoIcon = document.getElementById("logo-icon");
  var progressText = document.getElementById("progress-text");
  var downloadIcon = document.getElementById("download-icon");
  var downloadBox = document.getElementById("download-box");
  if (document.getElementById("markers").innerHTML == '') {
    errorMessage.innerHTML = "";
    errorMessage.innerHTML = langSetMarker;
    loadingIcon.style.display = "none";
    logoIcon.style.display = "inline-flex";
    progressText.innerHTML = "";
    return;
  }
  output = 'TITLE: ' + fileName + '\nFCM: NON-DROP FRAME\n\n' + markercode; //Marker und weiter Code für das EDL-Format wird zusammen geführt

  loadingIcon.style.display = "none";
  downloadIcon.style.display = "inline-flex";
  downloadBox.innerHTML = '<button class="btn download-btn" onclick="downloadEDL()">'+langDownload+'</button>' //Generierungs Knopf wird auf Download geändert
}

document.getElementById("download-icon").addEventListener("click", function () {
  downloadEDL();
})

//Nutzt die Libary FileSaver.js und ermöglicht das Speichern der EDL-Datei
function downloadEDL() {
  var blob = new Blob([output], {
    type: "text/plain;charset=utf-8"
  });

  if (fileName == 'undefined') {
    fileName = "Markers";
  } else {}
  saveAs(blob, fileName + ".edl");
}

//Lädt die Seite neu beim betätigen des runden Pfeil Knopfes
document.getElementById("reload").addEventListener("click", function () {
  location.reload();
})

//Funktionen für das Öffnen und Schließen von den Popups
var helpModal = document.getElementById('help-modal');
var helpModalBtn = document.getElementById('help');
var helpCloseBtn = document.querySelector('.close');
var settingsModal = document.getElementById('settings-modal');
var settingsModalBtn = document.getElementById('settings');
var settingsCloseBtn = document.getElementById('close2');

helpModalBtn.addEventListener('click', openHelpModal);
helpCloseBtn.addEventListener('click', closeHelpModal);
window.addEventListener('click', outsideClickHelp);
settingsModalBtn.addEventListener('click', openSettingsModal);
settingsCloseBtn.addEventListener('click', closeSettingsModal);
window.addEventListener('click', outsideClickSettings);

function openHelpModal() {
  helpModal.style.display = 'block';
}

function closeHelpModal() {
  helpModal.style.display = 'none';
}

function outsideClickHelp(e) {
  if (e.target == helpModal) {
    helpModal.style.display = 'none';
  }
}

function openSettingsModal() {
  settingsModal.style.display = 'block';
}

function closeSettingsModal() {
  settingsModal.style.display = 'none';
}

function outsideClickSettings(e) {
  if (e.target == settingsModal) {
    settingsModal.style.display = 'none';
  }
}

checkTheme();
detectLanguage();
checkFPS();
checkLength();

//Ändert das Theme bzw. die CSS-Datei und speichert es in Local Storage wenn der Schalter umgelegt wird
document.getElementById("theme-slider").addEventListener("click", function () {
  var stylesheet = document.getElementById("stylesheet");
  if (document.getElementById('theme-slider').checked) {
    store.set('theme', 'light');
    stylesheet.setAttribute('href', 'assets/css/style-light.css');
  } else {
    store.set('theme', 'dark');
    stylesheet.setAttribute('href', 'assets/css/style-dark.css');
  }
});

//Überprüft beim Start welches Theme gespeichert ist und wendet es an
function checkTheme() {
  var theme = store.get('theme');
  var stylesheet = document.getElementById("stylesheet");
  var themeSlider = document.getElementById("theme-slider");
  if (theme == "light") {
    stylesheet.setAttribute('href', 'assets/css/style-light.css');
    themeSlider.checked = true;
  } else {
    stylesheet.setAttribute('href', 'assets/css/style-dark.css');
    themeSlider.checked = false;
  }
}

//Überprüft beim Start welche Sprache gespeichert ist und wendet es an
function detectLanguage() {
  var visit;
  if (store.has('visit')) {
    visit = store.get('visit');
    parseInt(visit);
    visit++;
    store.set('visit', visit);
    var lang = store.get('lang');
    if (lang == 'de-DE') {
      setGerman();
    } else {
      setEnglish();
    }
  } else { //Wenn noch keine Sprache gespeichert ist, wird die Browser Sprache verwendet
    store.set('visit', 0);
    store.set('length', 800);
    document.getElementById('length-number').value = 800;
    var userLang = navigator.language || navigator.userLanguage; //Erkennt auf welche Sprache der Browser eingestellt ist
    if (userLang == 'de-DE') {
      store.set('lang', 'de-DE');
      setGerman();
    } else {
      store.set('lang', 'en-US');
      setEnglish();
    }
  }

  var userLang = navigator.language || navigator.userLanguage;
}

//Ändert und speichert die Sprache wenn eine im Dropdown-Menü ausgewählt wird
document.getElementById('language').addEventListener('change', logValue, false);
function logValue() {
  switch (this.value) {
    case '1':
      store.set('lang', 'de-DE');
      setGerman();
      break;
    case '2':
      store.set('lang', 'en-US');
      setEnglish();
      break;
  }
}

//Ändert und speicher die Framerate die für das EDL-Format ausgewählt wird.
document.getElementById('framerate').addEventListener('change', logFPS, false);
function logFPS() {
  switch (this.value) {
    case '1':
      store.set('fps', '0');
      document.getElementById("25").selected = 'selected';
      openWarningModal();
      break;
    case '2':
      store.set('fps', '1');
      document.getElementById("50").selected = 'selected';
      openWarningModal();
      break;
  }
}

//Erkennt und ändert die Framerate beim Start
function checkFPS() {
  var fps = store.get('fps');
  if (fps == "1") {
    document.getElementById("50").selected = 'selected';
    selectedFramerate = 2;
    maxFramerate = 49;
  } else if (fps == "0") {
    document.getElementById("25").selected = 'selected';
    selectedFramerate = 4;
    maxFramerate = 24;
  } else {
    document.getElementById("50").selected = 'selected';
    selectedFramerate = 2;
    maxFramerate = 49;
  }
};

//Ändert und speichert die Playbar Länge bei der Eingabe in das Textfeld
document.getElementById('length-number').addEventListener('change', function () {
  var lengthNumber = document.getElementById('length-number');
  store.set('length', document.getElementById('length-number').value);
  if(lengthNumber.value < 50) { //Wenn der Wert unter 50 ist wird er auf 50 gesetzt
    store.set('length', 50);
  }
  else if(lengthNumber.value > 1500) {
    store.set('length', 1500);
  }
  openWarningModal();
});

//Ändert und speichert die Playbar Länge wenn der + Knopf gedrückt wird
document.getElementById('add').addEventListener('click', function () {
  store.set('length', document.getElementById('length-number').value);
  openWarningModal();
});

//Ändert und speichert die Playbar Länge wenn der - Knopf gedrückt wird
document.getElementById('sub').addEventListener('click', function () {
  store.set('length', document.getElementById('length-number').value);
  openWarningModal();
});

//Erkennt und ändert die Playbar Länge beim Start
function checkLength() {
  if(store.has('length') == true) {
    var length = store.get('length');
    document.getElementById('length-number').value = length;
    document.getElementById('seek-bar').style.width = document.getElementById('length-number').value + "px";
    document.getElementById('markers').style.width = document.getElementById('length-number').value + "px";
    document.getElementById('seek-bar').style.minWidth = document.getElementById('length-number').value + "px";
    document.getElementById('waveform').style.width = document.getElementById('length-number').value + "px";
  }
}

function openWarningModal() {
  document.getElementById('warning-box').style.display = 'block';
}

document.getElementById('warning-reload').addEventListener('click', function () {
  location.reload();
});

//Ändert die Größe der Programms wenn die Bildschirmbreite unter 1400px ist
window.onload = zoom;
function zoom() {
  if (screen.width <= 1400) {
    document.getElementById('body').style.zoom = '0.8';
  }
}