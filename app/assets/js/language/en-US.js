var langDownload = 'Download';
var langGenerating = 'Generating... ';
var langGenerated = 'generated';
var langSetMarker = 'Set at least one marker';
var langSelectAudio = 'Select an audio first';
var langSupportedLength = 'Only audio files with a length of up to one hour are supported';

//Ändert alles auf Englisch
function setEnglish() {
  document.getElementById('en').selected = 'selected';
  langDownload = 'Download';
  langGenerating = 'Generating... ';
  langGenerated = 'generated';
  langSetMarker = 'Set at least one marker';
  langSelectAudio = 'Select an audio first';
  langSupportedLength = 'Only audio files with a length of up to one hour are supported'
  document.getElementById("upload-audio").innerHTML = "Upload Audio";
  document.getElementById("download-btn").innerHTML = "Generate";
  document.getElementById("lang-settings").innerHTML = "Settings";
  document.getElementById("lang-theme").innerHTML = "Theme";
  document.getElementById("lang-language").innerHTML = "Language";
  document.getElementById("lang-framerate").innerHTML = "Framerate";
  document.getElementById("lang-playbar").innerHTML = "Playbar Length";
  document.getElementById("help-title").innerHTML = "Importing the .edl file into Davinci Resolve";
  document.getElementById("help-h1").innerHTML = '<strong>Markers can be placed with the keyboard buttons "1", "2" and "3 for blue, red and green marker.</strong>';
  document.getElementById("help-l1").innerHTML = "<strong>1. </strong>Put the exact Audio or Video, with which you recorded the markers, into the Media Pool.";
  document.getElementById("help-l2").innerHTML = "<strong>2. </strong>IMPORTANT: Set the Timeline frame rate to the frame rate you selected in the settings (The standart is 50).</p>";
  document.getElementById("help-l3").innerHTML = '<strong>3. </strong>In the Media Pool, right click on "Timeline 1", select Timelines > Import > Timeline Markers from EDL. Then select the .edl file you previously created. It will take a short time until all markers are loaded.';
  document.getElementById("langWarning").innerHTML = "Warning! The program must be reloaded in order to use this setting";
  document.getElementById("warning-reload").innerHTML = "Reload now";
}