// Ändert alles auf Deutsch
function setGerman() {
  if (document.getElementById('de')) {
    document.getElementById('de').selected = 'selected'
  }
  langDownload = 'Herunterladen'
  langGenerating = 'Generiert... '
  langGenerated = 'generiert'
  langSetMarker = 'Setze mindestens einen Marker'
  langSelectAudio = 'Wähle zuerst eine Audio aus'
  langSupportedLength = 'Es werden nur Audio Dateien mit einer Länge von bis zu einer Stunde unterstützt'
  langInvalidLicense = 'Der Lizenzschlüssel ist ungültig. Bitte überprüfe, ob Tippfehler vorliegen.'
  langNoInternet = 'Sie sind nicht mit dem Internet verbunden. Bitte stellen Sie eine Internetverbindung her, um die Lizenz zu aktivieren.'
  langNoServerConnection = 'Verbindung zum Server kann nicht hergestellt werden. Wenn dieser Fehler länger auftritt, versuchen Sie, die Software zu aktualisieren.'
  langInUse = 'Ein anderes Gerät benutzt das Programm gerade. Bitte schließen sie es, da nur ein Programm gleichzeigt die Lizenz nutzen kann.'
  langUpdateAvailable = 'Ein neues Update ist verfügbar. Es wird herunterladen...'
  langUpdateDone = 'Update heruntergeladen. Es wird beim Neustart installiert. Jetzt neustarten?'

  document.getElementById('upload-audio').innerHTML = 'Audio hochladen'
  document.getElementById('download-btn').innerHTML = 'Generieren'
  document.getElementById('lang-settings').innerHTML = 'Einstellungen'
  document.getElementById('lang-theme').innerHTML = 'Theme'
  document.getElementById('lang-language').innerHTML = 'Sprache'
  document.getElementById('lang-framerate').innerHTML = 'Framerate'
  document.getElementById('lang-playbar').innerHTML = 'Playbar Länge'
  document.getElementById('help-title').innerHTML = 'EDL Datei in Davinci Resolve importieren'
  document.getElementById('help-h1').innerHTML = '<strong>Marker können mit den Tasten "1", "2" und "3", für blauer, roter und grüner Marker, gesetzt werden.</strong>'
  document.getElementById('help-l1').innerHTML = '<strong>1. </strong>Mache die exakte Audio oder Video Datei, mit der du die Marker aufgenommen hast, in den Media Pool.'
  document.getElementById('help-l2').innerHTML = '<strong>2. </strong>WICHTIG: Setzte die Timeline frame rate auf die Framerate die du in den Einstellungen ausgewählt hast (Die standart Framerate ist 50).'
  document.getElementById('help-l3').innerHTML = '<strong>3. </strong>Im Media Pool, mache rechtsklick auf "Timeline 1", wähle Timelines > Import > Timeline Markers from EDL. Wähle dann die .edl Datei die du vorhin erstellt hast. Es kann eine kleine Zeit dauern bis alle Marker geladen sind.'
  document.getElementById('langWarning').innerHTML = 'Achtung! Das Programm muss neugeladen werden um diese Einstellung anzuwenden'
  document.getElementById('warning-reload').innerHTML = 'Jetzt neuladen'
}
