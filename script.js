// ----- L'horloge (format 30/10/2026 8:23 PM) -----

function updateTime() {
    var now = new Date();
    var day = String(now.getDate()).padStart(2, "0");
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var hours = now.getHours();
    var minutes = String(now.getMinutes()).padStart(2, "0");
    var ampm = "AM";
    if (hours >= 12) {
        ampm = "PM";
    }
    hours = hours % 12;
    if (hours == 0) {
        hours = 12;
    }
    document.getElementById("timeElement").textContent =
        day + "/" + month + "/" + now.getFullYear() + " " + hours + ":" + minutes + " " + ampm;
}

updateTime();
setInterval(updateTime, 1000);


// ----- Déplacer les fenêtres (code du guide / W3 School) -----

function dragElement(element) {
    var initialX = 0;
    var initialY = 0;
    var currentX = 0;
    var currentY = 0;

    document.getElementById(element.id + "header").onmousedown = startDragging;

    function startDragging(e) {
        e.preventDefault();
        initialX = e.clientX;
        initialY = e.clientY;
        document.onmouseup = stopDragging;
        document.onmousemove = moveElement;
    }

    function moveElement(e) {
        e.preventDefault();
        currentX = initialX - e.clientX;
        currentY = initialY - e.clientY;
        initialX = e.clientX;
        initialY = e.clientY;
        element.style.top = (element.offsetTop - currentY) + "px";
        element.style.left = (element.offsetLeft - currentX) + "px";
    }

    function stopDragging() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


// ----- Ouvrir, fermer, mettre devant -----

var biggestIndex = 1;
var bottomBar = document.querySelector("#bottom");

function openWindow(element) {
    element.style.display = "block";
    bringToFront(element);
}

function closeWindow(element) {
    element.style.display = "none";
}

function bringToFront(element) {
    biggestIndex++;
    element.style.zIndex = biggestIndex;
    bottomBar.style.zIndex = biggestIndex + 1;
}


// ----- Les icônes -----

var selectedIcon = undefined;

function selectIcon(element) {
    if (selectedIcon != undefined) {
        selectedIcon.classList.remove("selected");
    }
    element.classList.add("selected");
    selectedIcon = element;
}


// ----- Tout préparer pour une fenêtre en une ligne -----

function initializeWindow(name) {
    var screen = document.querySelector("#" + name);
    var closeButton = document.querySelector("#" + name + "close");
    var icon = document.querySelector("#" + name + "Icon");

    dragElement(screen);
    closeButton.addEventListener("click", function() { closeWindow(screen); });
    screen.addEventListener("mousedown", function() { bringToFront(screen); });

    icon.addEventListener("click", function() { selectIcon(icon); });
    icon.addEventListener("dblclick", function() { openWindow(screen); });
}

initializeWindow("welcome");
initializeWindow("notes");
initializeWindow("pong");

document.querySelector("#welcomeopen").addEventListener("click", function() {
    openWindow(document.querySelector("#welcome"));
});


// ----- App Notes (sauvegardées dans le navigateur) -----

var notes = [
    { title: "Hello", date: "30/10/2026", text: "My first note hehe, you can write here and it stays saved !" }
];

// Certaines previews bloquent la sauvegarde, alors on essaie sans tout casser
try {
    var savedNotes = localStorage.getItem("polarNotes");
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    }
} catch (error) {
    console.log("Notes can't be saved here");
}

function saveNotes() {
    try {
        localStorage.setItem("polarNotes", JSON.stringify(notes));
    } catch (error) {
        console.log("Notes can't be saved here");
    }
}

var openNote = 0;
var sidebar = document.querySelector("#sidebar");
var noteTitle = document.querySelector("#notetitle");
var noteText = document.querySelector("#notetext");

function showSidebar() {
    sidebar.innerHTML = "";
    for (let i = 0; i < notes.length; i++) {
        var item = document.createElement("div");
        item.className = "noteitem";
        if (i == openNote) {
            item.classList.add("noteopen");
        }
        item.innerHTML = "<p>" + notes[i].title + "</p><p style='font-size: 11px;'>" + notes[i].date + "</p>";
        item.addEventListener("click", function() { showNote(i); });
        sidebar.appendChild(item);
    }
}

function showNote(index) {
    openNote = index;
    noteTitle.value = notes[index].title;
    noteText.value = notes[index].text;
    showSidebar();
}

noteTitle.addEventListener("input", function() {
    notes[openNote].title = noteTitle.value;
    saveNotes();
    showSidebar();
});

noteText.addEventListener("input", function() {
    notes[openNote].text = noteText.value;
    saveNotes();
});

document.querySelector("#newnote").addEventListener("click", function() {
    notes.push({ title: "New note", date: new Date().toLocaleDateString(), text: "" });
    saveNotes();
    showNote(notes.length - 1);
});

document.querySelector("#deletenote").addEventListener("click", function() {
    if (notes.length == 1) {
        return;
    }
    notes.splice(openNote, 1);
    saveNotes();
    showNote(0);
});

showNote(0);


// ----- App Pong -----

var canvas = document.querySelector("#pongcanvas");
var ctx = canvas.getContext("2d");

var paddleHeight = 50;
var leftY = 105;
var rightY = 105;
var ballX = 200;
var ballY = 130;
var speedX = 3;
var speedY = 2;
var leftScore = 0;
var rightScore = 0;
var playerMode = false;

// La souris contrôle la raquette de gauche en mode 1 Player
canvas.addEventListener("mousemove", function(e) {
    if (playerMode) {
        var rect = canvas.getBoundingClientRect();
        leftY = e.clientY - rect.top - paddleHeight / 2;
    }
});

document.querySelector("#pongauto").addEventListener("click", function() {
    playerMode = false;
    resetScore();
});

document.querySelector("#pongplayer").addEventListener("click", function() {
    playerMode = true;
    resetScore();
});

function resetScore() {
    leftScore = 0;
    rightScore = 0;
    resetBall();
}

function resetBall() {
    ballX = 200;
    ballY = 130;
    speedX = -speedX;
    document.querySelector("#pongscore").textContent = leftScore + " - " + rightScore;
}

// L'ordi suit la balle, un peu lentement pour qu'il rate parfois
function moveComputer(paddleY) {
    var center = paddleY + paddleHeight / 2;
    if (center < ballY - 10) {
        paddleY = paddleY + 2.5;
    }
    if (center > ballY + 10) {
        paddleY = paddleY - 2.5;
    }
    return paddleY;
}

function updatePong() {
    // Les raquettes
    if (!playerMode) {
        leftY = moveComputer(leftY);
    }
    rightY = moveComputer(rightY);
    leftY = Math.max(0, Math.min(canvas.height - paddleHeight, leftY));
    rightY = Math.max(0, Math.min(canvas.height - paddleHeight, rightY));

    // La balle
    ballX = ballX + speedX;
    ballY = ballY + speedY;

    // Rebond en haut et en bas
    if (ballY < 5 || ballY > canvas.height - 5) {
        speedY = -speedY;
    }

    // Rebond sur la raquette de gauche
    if (ballX < 20 && ballY > leftY && ballY < leftY + paddleHeight && speedX < 0) {
        speedX = -speedX;
        speedY = (ballY - (leftY + paddleHeight / 2)) / 8;
    }

    // Rebond sur la raquette de droite
    if (ballX > canvas.width - 20 && ballY > rightY && ballY < rightY + paddleHeight && speedX > 0) {
        speedX = -speedX;
        speedY = (ballY - (rightY + paddleHeight / 2)) / 8;
    }

    // Un point est marqué
    if (ballX < 0) {
        rightScore++;
        resetBall();
    }
    if (ballX > canvas.width) {
        leftScore++;
        resetBall();
    }

    // Le dessin
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "gray";
    for (var y = 0; y < canvas.height; y = y + 16) {
        ctx.fillRect(canvas.width / 2 - 1, y, 2, 8);
    }

    ctx.fillStyle = "white";
    ctx.fillRect(10, leftY, 6, paddleHeight);
    ctx.fillRect(canvas.width - 16, rightY, 6, paddleHeight);

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(updatePong);
}

updatePong();