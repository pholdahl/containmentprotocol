// variabler
let isTypewriting = false;
let cardsChosen = [], cardsChosenIds = [];
let correctMatches = 0, incorrectMatches = 0, typingTimeout;
let highscore = 0, numPanelButtons = 4;
let greenLightArray = [], redLightArray = [];
let isLooping = false;

const audioTracks = ["sound/memoryType.m4a", "sound/memoryType2.m4a", "sound/memoryStatic.m4a", "sound/memoryStatic2.m4a", "sound/beep.m4a"];
const cardArray = [];

// Symboler laget av html entiteter
const symbolsRobotHTML = {
    1: '&#8486;', 2: '&#8487;', 3: '&#8506;', 4: '&#8523;', 5: '&#9728;', 6: '&#9732;',
    7: '&#9733;', 8: '&#9734;', 9: '&#9736;', 10: '&#9737;', 11: '&#9740;', 12: '&#9745;',
    13: '&#9750;', 14: '&#9751;', 15: '&#9751;', 16: '&#9761;', 17: '&#9762;', 18: '&#9763;',
    19: '&#9764;', 20: '&#9767;', 21: '&#9775;', 22: '&#9784;', 23: '&#9788;', 24: '&#9789;',
    25: '&#9790;', 26: '&#9795;', 27: '&#9796;', 28: '&#9797;', 29: '&#9798;', 30: '&#9799;',
    31: '&#9812;', 32: '&#9813;', 33: '&#9814;', 34: '&#9815;', 35: '&#9816;', 36: '&#9817;',
    37: '&#9818;', 38: '&#9819;', 39: '&#9820;', 40: '&#9821;', 41: '&#9822;', 42: '&#9823;',
    43: '&#9824;', 44: '&#9825;', 45: '&#9826;', 46: '&#9827;', 47: '&#9828;', 48: '&#9829;',
    49: '&#9830;', 50: '&#9831;', 51: '&#9854;', 52: '&#9862;', 53: '&#9863;', 54: '&#9864;',
    55: '&#9865;', 56: '&#9877;', 57: '&#9879;', 58: '&#9881;', 59: '&#9882;', 60: '&#9883;',
    61: '&#9884;', 62: '&#9954;', 63: '&#9991;', 64: '&#10005;', 65: '&#10006;', 66: '&#10009;',
    67: '&#10010;', 68: '&#10011;', 69: '&#10012;', 70: '&#10070;',
};

// Fargepallett
const colorPallette = {
    1: '#61cf5a', 2: '#63ad58', 3: '#50864c', 4: '#3e6a3d', 5: '#3b4b33',
};

// HTML elementer
const gameElement = document.getElementById('game');
const grid = document.getElementById('grid');
const result = document.getElementById('result');
const instructions = document.getElementById('instructions');
const overlay = document.getElementById('overlay');
const audio1 = document.getElementById('audio1');
const audio2 = document.getElementById('audio2');
audio1.volume = 0.5;
audio2.volue = 0.5;
const audio3 = document.getElementById('audio3');
const startButton = document.getElementById('start-button');
const instructButton = document.getElementById('instruct-button');
const nextLevelButton = document.createElement('button');
const reloadButton = document.createElement('button');
const faultyPanelContainer = document.createElement("div");
const successPanelContainer = document.createElement("div");
const soundButtons = document.getElementsByClassName('sound-button');
const uiButtonsSection = document.getElementById('ui-buttons');

// Mutefunksjon
const muteSound = function () {
    if(audio1.muted) {
        audio1.muted = false;
        audio2.muted = false;
        audio3.muted = false;
        for (let i = 0; i < soundButtons.length; i++) {
            soundButtons[i].classList.remove("sound-off");
        }
    } else {
        audio1.muted = true;
        audio2.muted = true;
        audio3.muted = true;
        for (let i = 0; i < soundButtons.length; i++) {
            soundButtons[i].classList.add("sound-off");
        }
    }
}

// Instruksjoner
const instructionsText = `
Urgent Transmission:

Welcome, Operator. 
The reactor is reaching critical levels, and only 
you can prevent a catastrophic meltdown. The 
control panel before you is your only means of 
containment.

The control buttons on this aging board are 
linked to vital systems, but their lights flicker 
only briefly as the power wanes. You'll have just 
a split second to glimpse the symbols they bear 
before the lights go out.

Your task is to find the matching button pairs on
all the control panels. Each correct match will
light up a green light, turning off a faulty
system, but a wrong match will cause a red light
to turn on, indicating how many chances you have
before the reactor overloads.

The facility is counting on you.
`;

// Game Over tekst
const gameOverText = `
Critical Failure:

The reactor has gone into meltdown.
The facility is lost, and the world is in peril.

Game Over.

`;

// Hent instruksjoner
const getInstructions = () => {
    instructButton.classList.add('hidden');
    startButton.classList.remove('hidden');
    soundButtons[0].classList.remove('hidden');
    playAudioIntro();
    isTypewriting = true;
    typeInstructions(instructionsText, instructions, 50, stopAudioLoop);
    overlay.append(soundOffButton);
};

instructButton.addEventListener('click', getInstructions);

const typeInstructions = (text, element, delay = 50, onComplete) => {
    let index = 0;
    const type = () => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index++);
            typingTimeout = setTimeout(type, delay);
        } else if (onComplete) onComplete();
    };
    type();
};

// Spill over knapp
const gameOver = () => {
    overlay.querySelectorAll("button").forEach(button => button.remove());
    instructions.innerHTML = `${gameOverText}`;
    instructions.innerHTML += `<strong>Your Score: ${highscore}<strong>`
    reloadButton.textContent = "Reload";
    reloadButton.classList.add("ui-button");
    reloadButton.onclick = () => window.location.href = "/index.html";
    overlay.append(reloadButton);
    instructions.style.textAlign = "left";
    instructions.style.margin = "0 auto";
    overlay.style.display = 'block';
    stopAudioLoop();
};

// Lydfunksjoner
const audioLooper = (audio1, audio2, overlapTime) => {
    isLooping = true;
    audio1.play();
    const loopAudio = (audio, nextAudio) => {
        audio.addEventListener('timeupdate', function handler() {
            if (isLooping && audio.currentTime >= audio.duration - overlapTime) {
                nextAudio.play();
            }
        });
    };
    loopAudio(audio1, audio2);
    loopAudio(audio2, audio1);
};

const playAudioStatic = () => {
    audio1.src = audioTracks[2];
    audio2.src = audioTracks[3];
    audioLooper(audio1, audio2, 0.50);
};

const playAudioIntro = () => {
    audio1.src = audioTracks[0];
    audio2.src = audioTracks[1];
    audio1.volume = 0.5;
    audio2.volume = 0.5;
    audioLooper(audio1, audio2, 0.55);
};

const playAudioBeep = () => {
    audio3.src = audioTracks[4];
    audio3.volume = 0.1;
    audio3.play();
}

const volumeSpike = () => {
    const originalVolume = 0.5;
    const spikeVolume = 1;
    const spikeDuration = 200;

    audio1.volume = spikeVolume;
    audio2.volume = spikeVolume;

    setTimeout(() => {
        audio1.volume = originalVolume;
        audio2.volume = originalVolume;
    }, spikeDuration);
};

const stopAudioLoop = () => {
    isLooping = false;
    [audio1, audio2].forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
};

// Start funksjon
const startGame = () => {
    clearTimeout(typingTimeout);
    overlay.style.display = 'none';
    stopAudioLoop();
    emptyGrid();
    correctMatches = 0;
    greenLightArray = [];
    redLightArray = [];
    const numUniqueFaces = numPanelButtons / 2;
    const doubleList = doubleCardArray(createRandomFaceList(numUniqueFaces), numUniqueFaces);
    createBoard(doubleList);
    playAudioStatic();
    createPanels(numUniqueFaces);
    result.innerHTML = ` ${highscore}`;
};

// Lager tilfeldige bakgrunnsfarger på kortene basert på fargepallett
const randomColor = () => {
    const color1 = colorPallette[Math.floor(Math.random() * Object.keys(colorPallette).length) + 1];
    const color2 = colorPallette[Math.floor(Math.random() * Object.keys(colorPallette).length) + 1];
    return `linear-gradient(${Math.floor(Math.random() * 360)}deg, ${color1}, ${color2})`;
};

// Tømmer spillbrettet
const emptyGrid = () => {
    [faultyPanelContainer, successPanelContainer, grid].forEach(container => container.innerHTML = '');
    result.innerHTML = "";
};

// Funksjoner for å lage tilfeldige symboler på kortene
const createRandomFaceList = num => {
    const faceList = [], usedIndices = new Set();
    while (faceList.length < num) {
        const randomIndex = Math.floor(Math.random() * 69) + 1;
        if (!usedIndices.has(randomIndex)) {
            faceList.push({ key: randomIndex, symbol: symbolsRobotHTML[randomIndex] });
            usedIndices.add(randomIndex);
        }
    }
    return faceList;
};

// Funksjon for å doble kortene, fordi vi leter etter par
const doubleCardArray = (list, numUnique) => {
    list.forEach((item, i) => cardArray[i] = { id: i, face: item });
    for (let i = numUnique; i < numUnique * 2; i++) {
        cardArray[i] = { id: i - numUnique, face: list[i - numUnique] };
    }
    return cardArray.sort(() => 0.5 - Math.random());
};

// Funksjon for å lage lyspanelene
const createPanels = num => {
    for (let i = 0; i < num; i++) {
        const redLight = document.createElement("div");
        const greenLight = document.createElement("div");
        redLight.classList.add("light", "light-off");
        greenLight.classList.add("light", "light-off");
        faultyPanelContainer.append(redLight);
        successPanelContainer.append(greenLight);
        greenLightArray.push(greenLight);
        redLightArray.push(redLight);
    }
    faultyPanelContainer.classList.add("outer-size", "panel");
    successPanelContainer.classList.add("outer-size", "panel");
    gameElement.prepend(faultyPanelContainer);
    gameElement.append(successPanelContainer);
    nextLevelButton.textContent = "Next";
    nextLevelButton.classList.add("hidden", "ui-button");
    nextLevelButton.onclick = nextLevel;
    result.parentElement.append(nextLevelButton);
    uiButtonsSection.parentElement.append(nextLevelButton);
    incorrectLights();
};

// Funksjon for å lage kortene når spiller starter
const createBoard = list => {
    list.forEach((cardData, i) => {
        const card = document.createElement("button");
        card.innerHTML = cardData.face.symbol;
        card.setAttribute("data-id", i);
        card.classList.add("card", "fontBright", "brighten");
        card.style.background = randomColor();
        card.style.transform = `rotate(${Math.floor(Math.random() * 4) - 2}deg)`;
        card.style.marginLeft = `${Math.floor(Math.random() * 2) - 1}px`;
        card.style.marginTop = `${Math.floor(Math.random() * 2) - 1}px`;
        grid.append(card);
    });

    setTimeout(() => {
        const cards = document.querySelectorAll(".card");
        const flickerTimes = [100, 50, 150, 200, 50, 70, 100, 50, 250, 100];
        flickerTimes.forEach((time, index) => {
            setTimeout(() => {
                cards.forEach(card => {
                    card.classList.toggle("brighten", index % 2 !== 0);
                    card.classList.toggle("darken", index % 2 === 0);
                });
            }, time);
        });

        setTimeout(() => {
            cards.forEach(card => {
                card.innerHTML = '<div class="darkCircle"></div>';
                card.classList.remove("brighten", "darken");
                card.classList.add("darken");
                card.addEventListener("click", flipCard);
            });
        }, 900);
    }, 2000);
};

// Funksjon for å sjekke om kortene matcher
const checkMatch = () => {
    const cards = document.querySelectorAll(".card");
    const [card1, card2] = [cards[cardsChosenIds[0]], cards[cardsChosenIds[1]]];
    cardsChosen[0] === cardsChosen[1] ? handleCorrectMatch(card1, card2) : handleIncorrectMatch(card1, card2, cards);
};

// Funksjone for å håndtere riktige valg
const handleCorrectMatch = (card1, card2) => {
    [card1, card2].forEach(card => {
        card.classList.remove("fontBright", "brighten");
        card.classList.add("fontDark", "darkest");
        card.removeEventListener("click", flipCard);
        playAudioBeep();
    });
    greenLightArray[correctMatches++].classList.replace("light-off", "green");
    highscore += 10;
    result.innerHTML = `${highscore}`;
    if (correctMatches === numPanelButtons / 2) nextLevelButton.classList.remove("hidden");
    resetChoices();
};

// Funksjon for å håndtere feil valg
const handleIncorrectMatch = (card1, card2, cards) => {
    const flickerTimes = [100, 50, 150, 200, 50, 70, 100, 50, 250, 100];
    flickerTimes.forEach((time, index) => {
        setTimeout(() => {
            [card1, card2].forEach(card => {
                card.classList.toggle("brighten", index % 2 !== 0);
                card.classList.toggle("darken", index % 2 === 0);
            });
        }, time);
    });
    setTimeout(() => {
        [card1, card2].forEach(card => {
            card.classList.add("darken");
            card.innerHTML = '<div class="darkCircle"></div>';
        });
    }, 400);

    volumeSpike();

    redLightArray[incorrectMatches++].classList.replace("light-off", "red");
    if (incorrectMatches === numPanelButtons / 2) {
        gameOver();
        result.innerHTML = `Game Over!`;
        cards.forEach(card => card.removeEventListener("click", flipCard));
    }
    resetChoices();
};

// Funksjon for å nullstille valgene
const resetChoices = () => {
    cardsChosen = [];
    cardsChosenIds = [];
};

// Funksjon for å snu kortene som velges
const flipCard = function () {
    cardsChosen.push(cardArray[this.getAttribute("data-id")].id);
    cardsChosenIds.push(this.getAttribute("data-id"));
    this.innerHTML = cardArray[this.getAttribute("data-id")].face.symbol;
    this.classList.replace("darken", "brighten");
    if (cardsChosen.length === 2) setTimeout(checkMatch, 500);
};

// Funksjon for å vise feil lys
const incorrectLights = () => {
    for (let i = 0; i < incorrectMatches; i++) {
        redLightArray[i].classList.replace("light-off", "red");
    }
};

// Funksjon for å starte neste nivå
const nextLevel = () => {
    [redLightArray, greenLightArray] = [[], []];
    correctMatches = 0;
    numPanelButtons += 2;
    if (incorrectMatches > 0) incorrectMatches--;
    startGame();
};