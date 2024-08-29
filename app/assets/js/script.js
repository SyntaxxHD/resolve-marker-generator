const Store = require('electron-store')
const store = new Store()
const fillBar = document.getElementById('fill')
const displayTens = document.getElementById('tens') // Zeit die im Dokument angezeigt wird
const displaySeconds = document.getElementById('seconds')
const displayMinutes = document.getElementById('minutes')

let fileName = 'undefined'
let output
let count = 0
let markercode = ''
let i = 0
let position
let qs = window.location.href
let selectedFramerate
let maxFramerate
let lengthError = false
let loaded = false

let minutes = 0o1
let seconds = 0o0
let tens = 0o0
let frames = 0o0 // Das EDL-Format benötigt auch die aktuellen Frames
let framesHigher
let displayFrames = 0o0
let displayFramesHigher = 0o0
let Interval
let version

// Dies soll verhindern, dass man die HTML Datei in den Programmdateien öffnen kann.
qs = qs.slice(qs.indexOf('?') + 1)
try {
  if (process.versions.electron) {
    version = process.versions.electron
  }
} catch (error) {}

if (qs !== version) {
  window.location.href = 'about:blank'
}

// Passt die Fenstergröße an die Bildschrimgröße an
window.onload = resizeWindow
function resizeWindow() {
  const screenWidth = screen.height
  const zoomValue = 1080 / screenWidth
  const zoomPercentage = 100 / zoomValue
  document.getElementById('body').style.zoom = zoomPercentage + '%'
}

// style der waveform beim Laden der Audio. Mehr Infos über die wavesurfer Libary gibt es hier: https://wavesurfer-js.org
const wavesurfer = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#ff4049',
  progressColor: '#8a7f7f',
  barWidth: 2,
  barHeight: 1,
  barRadius: 2,
  barGap: 3,
  cursorWidth: 0,
})

// Generiert ein Blob Objekt aus der hochgeladenen Datei und fügt sie in <audio> ein
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('input').addEventListener('change', function (e) {
    const sound = document.getElementById('sound')
    sound.src = URL.createObjectURL(this.files[0])
    sound.onend = function () {
      URL.revokeObjectURL(this.src)
    }
    wavesurfer.load(sound.src)
    loadFilename(e)
  })
})

function loadFilename(e) {
  const songName = document.getElementById('song-name')
  const errorMessage2 = document.getElementById('error-message-2')
  wavesurfer.on('ready', function () {
    if (wavesurfer.getDuration() < 3600) {
      fileName = e.target.files[0].name // Dateiname wird aus der hochgeladenen Datei geholt
      fileName = fileName.slice(0, fileName.lastIndexOf('.')) // Entfernt die Dateiendung
      songName.innerHTML = fileName // Fügt den Dateiname in Seite ein
      errorMessage2.innerHTML = '⠀'
      loaded = true
      lengthError = false
    } else {
      songName.innerHTML = '⠀'
      errorMessage2.innerHTML = window.langSupportedLength
      lengthError = true
    }
  })
}

// Startet den Timer
function startInterval() {
  clearInterval(Interval)
  Interval = setInterval(startTimer, 10)
  if (minutes > 0) {
    displayMinutes.innerHTML = '0' + minutes
  }
}

// Stoppt und resettet den Timer
function stopInterval() {
  clearInterval(Interval)
  tens = '00'
  seconds = '00'
  minutes = '00'
  frames = '00'
  displayTens.innerHTML = tens
  displaySeconds.innerHTML = seconds
  displayMinutes.innerHTML = minutes
  displayFrames = frames
}

// Starte oder pausiert den Song und ändert das Icon
function playOrPauseSong() {
  const waveformdiv = document.getElementById('waveform')
  if (loaded === true) {
    if (wavesurfer.isPlaying() === false) {
      if (document.getElementById('sound').src === '' || lengthError === true) {
        document.getElementById('error-message-2').innerHTML = window.langSelectAudio
        return
      }
      wavesurfer.play() // Start the song
      document.querySelector('#play img').src = 'assets/img/stop-icon.svg'

      const newCurrentTime = wavesurfer.getCurrentTime()
      minutes = Math.floor(newCurrentTime / 60)
      seconds = Math.floor(newCurrentTime) - minutes * 60
      startInterval()
      waveformdiv.style.zIndex = -1
    } else {
      wavesurfer.stop()
      document.querySelector('#play img').src = 'assets/img/record-icon.svg'
      stopInterval()
      fillBar.style.width = '0'
      waveformdiv.style.zIndex = '0'
    }
  }
}

wavesurfer.on('audioprocess', function () {
  position = wavesurfer.getCurrentTime() / wavesurfer.getDuration() // Ändert die Songpositions-Kreis

  fillBar.style.width = position * 100 + '%'
  wavesurfer.on('finish', function () {
    stopInterval()
    document.querySelector('#play img').src = 'assets/img/record-icon.svg'
    document.getElementById('waveform').style.zIndex = 0
  })
})

// Timer Funktion
function startTimer() {
  tens++

  if (tens < 9) {
    displayTens.innerHTML = '0' + tens
  }

  if (tens > 9) {
    displayTens.innerHTML = tens
  }

  if (tens > 99) {
    seconds++
    displaySeconds.innerHTML = '0' + seconds
    tens = 0
    displayTens.innerHTML = '0' + 0
  }

  if (seconds > 9) {
    displaySeconds.innerHTML = seconds
  }

  if (seconds > 59) {
    minutes++
    displayMinutes.innerHTML = '0' + minutes
    seconds = 0
    displaySeconds.innerHTML = '0' + 0
  }

  if (minutes > 9) {
    displaySeconds.innerHTML = seconds
  }
}

// Beim betätigen der Taste "1" wird ein blauer Marker gesetzt
document.addEventListener('keypress', function (event) {
  if (event.key == '1') {
    // Tastatur Knopf "1"
    setMarker('blue')
  } else if (event.key == '2') {
    // Tastatur Knopf "2"
    setMarker('red')
  } else if (event.key == '3') {
    // Tastatur Knopf "3"
    setMarker('green')
  }
})

function setMarker(color) {
  const markers = document.getElementById('markers')
  frames = parseInt(tens / selectedFramerate, 10)
  framesHigher = frames + 1 // Das EDL-Format benötigt den aktuellen Frame und den aktuellen Frame um eine Zahl erhöht
  displayFrames = frames
  displayFramesHigher = framesHigher

  if (frames < 10) {
    displayFrames = '0' + frames
  }
  if (framesHigher < 10) {
    displayFramesHigher = '0' + framesHigher
  }

  if (framesHigher > maxFramerate) {
    displayFramesHigher = '00'
  }

  const offset = position * 100 + '%' // Postion für das Marker Icon wird berechnet
  const innerHTML = markers.innerHTML

  if (document.getElementById('sound').src == '') {
    document.getElementById('error-message-2').innerHTML = window.langSelectAudio // Gibt eine Fehlermeldung aus wenn noch kein Song ausgewählt wurde
    return
  }

  i++
  let i0 = i
  if (i0 < 10) {
    i0 = '00' + i0
  } else if (i0 < 100) {
    i0 = '0' + i0
  }

  if (color == 'blue') {
    markers.innerHTML = innerHTML + '<img src="assets/img/marker-blue.svg" class="marker" style="left: ' + offset + '">' // Setzt einen blauen Marker an die aktuelle Song Position

    // Der aktuelle Marker wird mit Zeit Code in die Variable eingefügt
    markercode = markercode + i0 + '  001      V     C        01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + '\n |C:ResolveColorBlue |M:Marker ' + i + ' |D:1\n\n'
  } else if (color == 'red') {
    markers.innerHTML = innerHTML + '<img src="assets/img/marker-red.svg" class="marker" style="left: ' + offset + '">'

    markercode = markercode + i0 + '  001      V     C        01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + '\n |C:ResolveColorRed |M:Marker ' + i + ' |D:1\n\n'
  } else if (color == 'green') {
    markers.innerHTML = innerHTML + '<img src="assets/img/marker-green.svg" class="marker" style="left: ' + offset + '">'

    markercode = markercode + i0 + '  001      V     C        01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFrames + ' 01:' + displayMinutes.innerHTML + ':' + displaySeconds.innerHTML + ':' + displayFramesHigher + '\n |C:ResolveColorGreen |M:Marker ' + i + ' |D:1\n\n'
  }
}

// Führt Generierung aus
document.getElementById('download-btn').addEventListener('click', function () {
  document.getElementById('logo-icon').style.display = 'none'
  document.getElementById('loading-icon').style.display = 'inline-flex'
  document.getElementById('error-message').innerHTML = ''

  if (count == 0) {
    count = 1
    const elem = document.getElementById('progress-text')
    const id = setInterval(frame, i)
    let progress = 1

    // Fügt einen virtuellen Ladescreen ein
    function frame() {
      if (progress >= 100) {
        clearInterval(id)
        count = 0
        elem.innerHTML = progress + '% ' + window.langGenerated
        generateEDL()
      } else {
        progress++
        elem.innerHTML = window.langGenerating + progress + '%'
      }
    }
  }
})

// Generiert die EDL Datei
function generateEDL() {
  const errorMessage = document.getElementById('error-message')
  const loadingIcon = document.getElementById('loading-icon')
  const logoIcon = document.getElementById('logo-icon')
  const progressText = document.getElementById('progress-text')
  const downloadIcon = document.getElementById('download-icon')
  const downloadBox = document.getElementById('download-box')
  if (document.getElementById('markers').innerHTML == '') {
    errorMessage.innerHTML = ''
    errorMessage.innerHTML = window.langSetMarker
    loadingIcon.style.display = 'none'
    logoIcon.style.display = 'inline-flex'
    progressText.innerHTML = ''
    return
  }
  output = 'TITLE: ' + fileName + '\nFCM: NON-DROP FRAME\n\n' + markercode // Marker und weiter Code für das EDL-Format wird zusammen geführt

  loadingIcon.style.display = 'none'
  downloadIcon.style.display = 'inline-flex'
  downloadBox.innerHTML = '<button class="btn download-btn" onclick="downloadEDL()">' + window.langDownload + '</button>' // Generierungs Knopf wird auf Download geändert
}

document.getElementById('download-icon').addEventListener('click', function () {
  downloadEDL()
})

// Nutzt die Libary FileSaver.js und ermöglicht das Speichern der EDL-Datei
function downloadEDL() {
  const blob = new Blob([output], {
    type: 'text/plain;charset=utf-8',
  })

  if (fileName == 'undefined') {
    fileName = 'Markers'
  }
  saveAs(blob, fileName + '.edl')
}

// Lädt die Seite neu beim betätigen des runden Pfeil Knopfes-
document.getElementById('reload').addEventListener('click', function () {
  location.reload()
})

// Funktionen für das Öffnen und Schließen von den Popups
const helpModal = document.getElementById('help-modal')
const helpModalBtn = document.getElementById('help')
const helpCloseBtn = document.querySelector('.close')
const settingsModal = document.getElementById('settings-modal')
const settingsModalBtn = document.getElementById('settings')
const settingsCloseBtn = document.getElementById('close2')

helpModalBtn.addEventListener('click', openHelpModal)
helpCloseBtn.addEventListener('click', closeHelpModal)
window.addEventListener('click', outsideClickHelp)
settingsModalBtn.addEventListener('click', openSettingsModal)
settingsCloseBtn.addEventListener('click', closeSettingsModal)
window.addEventListener('click', outsideClickSettings)

function openHelpModal() {
  helpModal.style.display = 'block'
}

function closeHelpModal() {
  helpModal.style.display = 'none'
}

function outsideClickHelp(e) {
  if (e.target == helpModal) {
    helpModal.style.display = 'none'
  }
}

function openSettingsModal() {
  settingsModal.style.display = 'block'
}

function closeSettingsModal() {
  settingsModal.style.display = 'none'
}

function outsideClickSettings(e) {
  if (e.target == settingsModal) {
    settingsModal.style.display = 'none'
  }
}

checkTheme()
detectLanguage()
checkFPS()
checkLength()

// Ändert das Theme bzw. die CSS-Datei und speichert es in Local Storage wenn der Schalter umgelegt wird
document.getElementById('theme-slider').addEventListener('click', function () {
  const stylesheet = document.getElementById('stylesheet')
  if (document.getElementById('theme-slider').checked) {
    store.set('theme', 'light')
    stylesheet.setAttribute('href', 'assets/css/style-light.css')
  } else {
    store.set('theme', 'dark')
    stylesheet.setAttribute('href', 'assets/css/style-dark.css')
  }
})

// Überprüft beim Start welches Theme gespeichert ist und wendet es an
function checkTheme() {
  const theme = store.get('theme')
  const stylesheet = document.getElementById('stylesheet')
  const themeSlider = document.getElementById('theme-slider')
  if (theme == 'light') {
    stylesheet.setAttribute('href', 'assets/css/style-light.css')
    themeSlider.checked = true
  } else {
    stylesheet.setAttribute('href', 'assets/css/style-dark.css')
    themeSlider.checked = false
  }
}

// Überprüft beim Start welche Sprache gespeichert ist und wendet es an
function detectLanguage() {
  if (store.has('visit')) {
    let visit = store.get('visit')
    parseInt(visit)
    visit++
    store.set('visit', visit)
    const lang = store.get('lang')
    if (lang == 'de-DE') {
      setGerman()
    } else {
      setEnglish()
    }
  } else {
    // Wenn noch keine Sprache gespeichert ist, wird die Browser Sprache verwendet
    store.set('visit', 0)
    store.set('length', 800)
    document.getElementById('length-number').value = 800
    const userLang = navigator.language || navigator.userLanguage // Erkennt auf welche Sprache der Browser eingestellt ist
    if (userLang == 'de-DE') {
      store.set('lang', 'de-DE')
      setGerman()
    } else {
      store.set('lang', 'en-US')
      setEnglish()
    }
  }
}

// Ändert und speichert die Sprache wenn eine im Dropdown-Menü ausgewählt wird
document.getElementById('language').addEventListener('change', logValue, false)
function logValue() {
  switch (this.value) {
    case '1':
      store.set('lang', 'de-DE')
      setGerman()
      break
    case '2':
      store.set('lang', 'en-US')
      setEnglish()
      break
  }
}

// Ändert und speicher die Framerate die für das EDL-Format ausgewählt wird.
document.getElementById('framerate').addEventListener('change', logFPS, false)
function logFPS() {
  switch (this.value) {
    case '1':
      store.set('fps', '0')
      document.getElementById('25').selected = 'selected'
      openWarningModal()
      break
    case '2':
      store.set('fps', '1')
      document.getElementById('50').selected = 'selected'
      openWarningModal()
      break
  }
}

// Erkennt und ändert die Framerate beim Start
function checkFPS() {
  const fps = store.get('fps')
  if (fps == '0') {
    document.getElementById('25').selected = 'selected'
    selectedFramerate = 4
    maxFramerate = 24
  } else {
    document.getElementById('50').selected = 'selected'
    selectedFramerate = 2
    maxFramerate = 49
  }
}

// Ändert und speichert die Playbar Länge bei der Eingabe in das Textfeld
document.getElementById('length-number').addEventListener('change', function () {
  const lengthNumber = document.getElementById('length-number')
  store.set('length', document.getElementById('length-number').value)
  if (lengthNumber.value < 50) {
    // Wenn der Wert unter 50 ist wird er auf 50 gesetzt
    store.set('length', 50)
  } else if (lengthNumber.value > 1500) {
    store.set('length', 1500)
  }
  openWarningModal()
})

// Ändert und speichert die Playbar Länge wenn der + Knopf gedrückt wird
document.getElementById('add').addEventListener('click', function () {
  store.set('length', document.getElementById('length-number').value)
  openWarningModal()
})

// Ändert und speichert die Playbar Länge wenn der - Knopf gedrückt wird
document.getElementById('sub').addEventListener('click', function () {
  store.set('length', document.getElementById('length-number').value)
  openWarningModal()
})

// Erkennt und ändert die Playbar Länge beim Start
function checkLength() {
  if (store.has('length') == true) {
    const length = store.get('length')
    document.getElementById('length-number').value = length
    document.getElementById('seek-bar').style.width = document.getElementById('length-number').value + 'px'
    document.getElementById('markers').style.width = document.getElementById('length-number').value + 'px'
    document.getElementById('seek-bar').style.minWidth = document.getElementById('length-number').value + 'px'
    document.getElementById('waveform').style.width = document.getElementById('length-number').value + 'px'
  }
}

function openWarningModal() {
  document.getElementById('warning-box').style.display = 'block'
}

document.getElementById('warning-reload').addEventListener('click', function () {
  location.reload()
})