//connection variablen bruges til at 
//forbinde til MQTT serveren 
let connection 
//info er en tekst variabel til at vise info på skærmen
let info = "String som bruges til at vise info på skærmen"
//sensorData indeholder de data vi får fra M5'eren
let sensorData = 20

let playing = false;

//state holder styr på hvad draw loopet gør eller ikke gør 
let state = 'Menu'
//direction skifter når man trækker vejret - vi starter  med at puste ud
let direction = false
const circleMax = 500
let circleSize = circleMax

let tempo = 0
let lastTempo = 0
let breatheTimer 


// Replace 'YOUR_API_KEY' with your actual YouTube API key
const API_KEY = 'AIzaSyBp8JnigfJcKvJ0JZ7et2TZgCvZhI_NqTU';
// Replace 'YOUR_PLAYLIST_ID' with the ID of your YouTube playlist
const PLAYLIST_ARRAY = ['PLefKpFQ8Pvy5aCLAGHD8Zmzsdljos-t2l', 'PLOZkbKh1b_sV4YgDUn3iy2Kv0iv7rgK1f', 'PLStcmtV-qrdB46-ZWMFHExwSoGXbKa1At', 'PLQbtOi0dASPyqh-TToMvsZXNm5dh_UvUJ'];
let PlaylistID;

// Youtube API
  
    // Load the YouTube IFrame Player API asynchronously
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;

    // Function called when the YouTube API is loaded
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
            height: '160',
            width: '250',
            playerVars: {
                'autoplay': 1,
                'controls': 0,
                'showinfo': 0,
                'rel': 0,
                'modestbranding': 1
            },
            events: {
                'onReady': onPlayerReady
            }
        });
    }

    // Function called when the player is ready to play videos
    function onPlayerReady(event) {
        console.log('Player Ready')
    }
  

  // Function to play a random video from the playlist
  function playRandomVideo(PLAYLIST_ID) {
    fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const videos = data.items;
            const randomIndex = Math.floor(Math.random() * videos.length);
            const videoId = videos[randomIndex].snippet.resourceId.videoId;
            const startTime = Math.floor(Math.random() * player.getDuration());
                player.loadVideoById(videoId, startTime);
        })
        .catch(error => console.error('Error fetching videos:', error));
}


// Load lyd og Video
function preload() {
  // Lyd
  soundFormats('mp3');
  sRainForest = loadSound('Sounds/Rainforest.mp3');
  sBeach = loadSound('Sounds/Beach.mp3');
  sUndervand = loadSound('Sounds/Underwater.mp3');
  sIld = loadSound('Sounds/Fireplace.mp3');
  sNull = loadSound('Sounds/Silence.mp3');
  currentlyPlaying = sNull;
  
  // Video
  BE_Loop = createVideo(['Video/BreathingLoop.mp4']);
  BE_Loop.size(windowWidth, windowHeight)
  BE_Loop.hide()

  BuffGuss = createVideo(['Video/BuffGuss.mp4']);
  BuffGuss.size(windowWidth, windowHeight)
  BuffGuss.hide()
  
}

let soundButton, breatheButton

function setup() {
  createCanvas(windowWidth, windowHeight)
  //lav en div til infoteksten
  infoDiv = createDiv(info)
  //sæt den nederst på canvas
  infoDiv.position(20,40)
  Hide('Player-Container')
  
  
  //Opret forbindelse til MQTT serveren (den der står i USA)
  connection = mqtt.connect("wss://mqtt.nextservices.dk")
  //Når serveren kommer tilbage til os og siger KLAR
  connection.on("connect", (m) => {
    //vis i inforteksten at der er forbindelse 
    infoDiv.html("Er nu forbundet til Next's MQTT server")    
  })

  //vi abonnerer på et emne
  connection.subscribe('MR-Lyd')
  // Kode for Hver gang vi får en besked på emnet ms = besked
  connection.on("message", (topic, ms) => {
    infoDiv.html("Modtager data: " + ms + " - på emne: " + topic) 
    
    //skift lyd
    switch(ms.toString()) {
      case "Regnskov":
        if(state != 'Secret'){transition(currentlyPlaying, 300000, sRainForest)}else{
          PlaylistID = PLAYLIST_ARRAY[0]
          playRandomVideo(PlaylistID)
          transition(currentlyPlaying, 300000, sNull)
        }
        break;
        
      case "Strand":
        if(state != 'Secret'){transition(currentlyPlaying, 300000, sBeach);}else{
          PlaylistID = PLAYLIST_ARRAY[1]
          playRandomVideo(PlaylistID)
          transition(currentlyPlaying, 300000, sNull)
        }
        break;
        
      case "UnderVand":
        if(state != 'Secret'){transition(currentlyPlaying, 300000, sUndervand);}else{
          PlaylistID = PLAYLIST_ARRAY[2]
          playRandomVideo(PlaylistID)
          transition(currentlyPlaying, 300000, sNull)
        }
        
        break;
        
      case "Ild":
        if(state != 'Secret'){transition(currentlyPlaying, 300000, sIld);}else{
          PlaylistID = PLAYLIST_ARRAY[3]
          playRandomVideo(PlaylistID)
          transition(currentlyPlaying, 300000, sNull)
        }
        
        break;

      case "Off":
        transition(currentlyPlaying, 300000, sNull);
        break;
        
      default:
        console.log("Typo in MQTT message-" + ms.toString());
        break;
        
    }
});


// Button Functionalaty
select('#soundButton').mousePressed(sound);
select('#breatheButton').mousePressed(breathe);
select('#tempoButton').mousePressed(setTempo);
select('#Play').mousePressed(function() {
  playRandomVideo(PlaylistID)
});

BE_Loop.mousePressed(function() {
  BE_Loop.hide()
  BE_Loop.pause()
});

select('main').mousePressed(function() {
  if(state != "Secret"){
    if(state != "prepareBreathing"){
      if(state != "Menu"){
        state = 'Menu';
        Show("menu");
      }
    }
  }
});

select('main').doubleClicked(function() {
  if(state == "Menu"){
    console.log("FAGGOT")
    state = "Secret";
    Hide("menu");
    Show("Player-Container")
    BuffGuss.show()
    BuffGuss.play()
    Timetoplay = setInterval(() => {
      BuffGuss.stop()
      BuffGuss.hide()
      clearInterval(Timetoplay)
    }, 6000);
  }else{
    if(state == "Secret"){
      console.log("Normal mode")
    state = "Menu";
    player.pauseVideo();
    Show('menu');
    Hide('Player-Container')
    }
  }
  console.log(state)
});
}

function sound(){
  Show("explainer")
  state = 'sound'
  // Loop video
  BE_Loop.show()
  BE_Loop.loop();
}

function breathe(){
  //sæt state så loopet ikke fortsætter 
  state = 'prepareBreathing'
  //Skjul knapper
  Hide('menu')
  transition(currentlyPlaying, 300000, sNull);

  //clear timer og variabler hvis der var et tempo i gang  
  if(breatheTimer){
    //ånd ind fra 0 
    direction = true 
    clearInterval(breatheTimer)
    console.log('timer cancelled')
    lastTempo = 0
    tempo = 0
    direction = false
    circleSize = circleMax
    //reset knap tekst
    select('#tempoButton').html('Breathe In')
  } 
  //Vis forklaring 
  background(0)
  select('#explainer').addClass('show')
}

function setTempo(){
  //hvis lastTempo er 0, er det første gang der trykkes på knappen 
  if(lastTempo == 0){
    //knapteksten vendes
    select('#tempoButton').html('Breathe Out')
    //lastTempo indstilles 
    lastTempo = millis()
    console.log('Indstiller last tempo:  ', lastTempo)
  }else{
    //tempo indstilles
    tempo = round(millis() - lastTempo)
    //state skifter til breathe
    statedelay = setInterval(function () {
      state = 'breathe'
      clearInterval(statedelay)
    }, 1);
    
    select('#explainer').removeClass('show')
    //start timeren som kalder funktionen changeDirection, hvert "tempo" millisekund
    breatheTimer = setInterval(changeDirection, tempo)
    console.log('Timer i gang med tempo: ', tempo)
    }
}

function changeDirection(){
  //hvis direction er true, sæt den til false, hvis den er false, sæt den til true etc
  direction = !direction
}



function draw() {

  if(state=='sound'){
    //gør evt noget
  }
  if(state=='breathe'){
    //RGBA - den sidste parameter er Alpha (0, 255)
    background(0,0,0, 2)
    fill('white')
    if(direction){
      circleSize += 1
    }else{
      circleSize -= 1
    }
    //sørg for at cirkel ikke kan blive mindre end eller større end... 
    //circleSize = constrain(circleSize, 250, 500)
    console.log(circleSize)
    //fjern fyld i cirklen
    noFill()
    //stroke er cirklens omkreds med næsten helt hvid 
    stroke(255, 255, 255, 200)
    //omkredsens tykkelse
    strokeWeight(12)
    breatheCircle = ellipse(width/2, height/2, circleSize, circleSize)  
    if(frameCount % 60 == 0){
      //draw Stars
      for(i=0; i < 10; i++){
        noStroke()
        fill(255, 255, 255, random(255))
        ellipse(random(width), random(height), random(6))
      }
    }
  
  } else{clear()}


  if(state == 'Secret') {

  }

}

function transition(sound, duration, newSound) {
  if(currentVolume = 1){
    // Get the current volume of the sound
  let currentVolume = 1;

  let NewSoundVolume = 0;
  let NewSoundPlaying = false;

  // Calculate the fade step based on duration
  let fadeStep = currentVolume / (duration / 1000);
  console.log("Fadestep " + fadeStep);

  // Set an interval to gradually decrease the volume
  let FadeOut = setInterval(() => {
    currentVolume -= fadeStep;
    console.log(currentVolume);

    // Check if volume reaches 0, then stop the sound and clear interval
    if (currentVolume <= 0.5 && !NewSoundPlaying) {
      newSound.loop();
      newSound.setVolume(0);
      NewSoundPlaying = true;

      let FadeIn = setInterval(() => {
        NewSoundVolume += fadeStep;
        newSound.setVolume(NewSoundVolume);
        if (NewSoundVolume >= 1) {clearInterval(FadeIn);}
      });
    }

    if (currentVolume <= 0) {
        sound.stop();
        currentlyPlaying = newSound;
        clearInterval(FadeOut);
    }

    sound.setVolume(currentVolume);
    
  }, 10);
  } else {transition(sound, duration, newSound);}
  
  
}
