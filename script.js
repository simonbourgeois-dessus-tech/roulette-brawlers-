const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spin-btn");
const winnerDisplay = document.getElementById("winner-display");

const brawlerSelect = document.getElementById("brawler-select");
const addBtn = document.getElementById("add-btn");
const addAllBtn = document.getElementById("add-all-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const clearBtn = document.getElementById("clear-btn");
const brawlerListHTML = document.getElementById("brawler-list");

// --- BASE DE DONNÉES EN FRANÇAIS (103 BRAWLERS) ---
const ALL_BRAWLERS = {
    "Ultra Legendary": [
        "Kaze", "Sirius"
    ],
    "Legendary": [
        "Ambre", "Chester", "Cordelius", "Corbac", "Draco", "Émeri", 
        "Kenji", "Kit", "Leon", "Meg", "Pierce", "Spike", "Surge"
    ],
    "Mythique": [
        "Alli", "Buster", "Byron", "Buzz", "Charlie", "Chuck", "Clancy", "Colonel Médor", 
        "D'Jinn", "Damian", "Doug", "Eve", "Fang", "Finx", "Gigi", "Glowy", 
        "Gray", "Jae-Yong", "Janet", "Juju", "Lily", "Lou", "Lumi", "Max", 
        "Melodie", "Mico", "Mina", "Moe", "Mortis", "Mr. P", "Najia", "Ollie", 
        "Otis", "R-T", "Squeak", "Starr Nova", "Tara", "Wally", "Willow", "Ziggy"
    ],
    "Épique": [
        "Angelo", "Ash", "Bea", "Belle", "Berry", "Billie", 
        "Bo", "Bolt", "Bonnie", "Colette", "Edgar", "Eliz@", 
        "Frank", "Gaël", "Griff", "Grom", "Hank", "Larry & Lawrie", 
        "Lola", "Mandy", "Maisie", "Meeple", "Nani", "Pam", 
        "Pearl", "Polly", "Sam", "Shade", "Stu", "Trunk"
    ],
    "Super Rare": [
        "A.R.K.A.D.", "Carl", "Darryl", "Dynamike", "Gus", 
        "Jacky", "Jessie", "Penny", "Ricochet", "Tick"
    ],
    "Rare": [
        "Bartaba", "Brock", "Bull", "Colt", "El Costo", 
        "Nita", "Poco", "Rosa"
    ],
    "Starting Brawler": [
        "Shelly"
    ]
};

// Correspondance graphique exacte des raretés
const rarityColors = {
    "Ultra Legendary": "#ff6b00",
    "Legendary": "#f1c40f",
    "Mythique": "#ff4757",
    "Épique": "#a55eea",
    "Super Rare": "#54a0ff",
    "Rare": "#2ed573",
    "Starting Brawler": "#00d2d3"
};

// Liste initiale de la roue au chargement
let items = [
    { name: "Shelly", rarity: "Starting Brawler" },
    { name: "Kaze", rarity: "Ultra Legendary" },
    { name: "Sirius", rarity: "Ultra Legendary" },
    { name: "Spike", rarity: "Legendary" },
    { name: "Mortis", rarity: "Mythique" },
    { name: "Edgar", rarity: "Épique" }
];

let currentAngle = 0;
let isSpinning = false;
let lastWinningIndex = null; // Mémoire du dernier gagnant

// --- GÉNÉRATION DYNAMIQUE DU MENU ---
function initSelectMenu() {
    brawlerSelect.innerHTML = "";
    
    for (const [rarity, brawlers] of Object.entries(ALL_BRAWLERS)) {
        const optgroup = document.createElement("optgroup");
        
        let emoji = "🟢";
        if(rarity === "Super Rare") emoji = "🔵";
        if(rarity === "Épique") emoji = "🟣";
        if(rarity === "Mythique") emoji = "🔮";
        if(rarity === "Legendary") emoji = "✨";
        if(rarity === "Ultra Legendary") emoji = "👑";
        if(rarity === "Starting Brawler") emoji = "⚪";
        
        optgroup.label = `${emoji} ${rarity}`;
        optgroup.className = `rare-${rarity.toLowerCase().replace(/ /g, "-").replace(/é/g, "e")}`;

        brawlers.sort().forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            option.dataset.rarity = rarity;
            optgroup.appendChild(option);
        });

        brawlerSelect.appendChild(optgroup);
    }
}

// --- RENDU VISUEL DE LA ROUE ---
function drawWheel() {
    const radius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const numSegments = items.length;

    if (numSegments === 0) {
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#222";
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Roue vide. Ajoute des brawlers !", radius, radius);
        return;
    }

    const segmentAngle = (2 * Math.PI) / numSegments;

    for (let i = 0; i < numSegments; i++) {
        const angle = currentAngle + i * segmentAngle;
        
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, angle, angle + segmentAngle);
        ctx.closePath();
        
        ctx.fillStyle = rarityColors[items[i].rarity] || "#fff";
        ctx.fill();
        
        ctx.strokeStyle = "#161625";
        ctx.lineWidth = numSegments > 50 ? 0.6 : 2;
        ctx.stroke();

        if (numSegments <= 40) {
            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(angle + segmentAngle / 2);
            ctx.fillStyle = "#000000";
            const fontSize = numSegments > 20 ? "11px" : "14px";
            ctx.font = `bold ${fontSize} Arial`;
            ctx.textAlign = "right";
            ctx.fillText(items[i].name, radius - 20, 5); 
            ctx.restore();
        }
    }
    
    if (numSegments > 40) {
        ctx.beginPath();
        ctx.arc(radius, radius, 42, 0, 2 * Math.PI);
        ctx.fillStyle = "#161625";
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${numSegments} Brawlers`, radius, radius + 4);
    }
}

// --- RENDU DE LA LISTE DE DROITE ---
function updateInterface() {
    drawWheel();
    brawlerListHTML.innerHTML = "";

    items.forEach((brawler, index) => {
        const li = document.createElement("li");
        li.style.borderLeftColor = rarityColors[brawler.rarity];
        
        let rarityClass = `tag-${brawler.rarity.toLowerCase().replace(/ /g, "-").replace(/é/g, "e")}`;

        li.innerHTML = `
            <span class="brawler-name ${rarityClass}">${brawler.name} <small style="color:#aaa; font-size:10px;">(${brawler.rarity})</small></span>
            <button class="delete-btn" onclick="deleteBrawler(${index})">X</button>
        `;
        brawlerListHTML.appendChild(li);
    });
}

// --- ACTIONS GLOBALES ---
function addBrawler() {
    if (isSpinning) return;
    const selectedOption = brawlerSelect.options[brawlerSelect.selectedIndex];
    if(!selectedOption) return;

    const name = selectedOption.value;
    const rarity = selectedOption.dataset.rarity;

    if (items.some(item => item.name === name)) {
        alert(`${name} est déjà sur la roue !`);
        return;
    }

    items.push({ name: name, rarity: rarity });
    updateInterface();
}

function addAllBrawlers() {
    if (isSpinning) return;
    items = [];
    for (const [rarity, brawlers] of Object.entries(ALL_BRAWLERS)) {
        brawlers.forEach(name => {
            items.push({ name: name, rarity: rarity });
        });
    }
    shuffleWheel(); // Mélange automatique pour casser l'organisation par blocs
}

function shuffleWheel() {
    if (isSpinning || items.length < 2) return;

    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }

    const btn = document.getElementById("remove-winner-btn");
    if (btn) btn.remove();

    updateInterface();
}

function clearAll() {
    if (isSpinning) return;
    items = [];
    const btn = document.getElementById("remove-winner-btn");
    if (btn) btn.remove();
    updateInterface();
}

window.deleteBrawler = function(index) {
    if (isSpinning) return;
    items.splice(index, 1);
    const btn = document.getElementById("remove-winner-btn");
    if (btn) btn.remove();
    updateInterface();
};

function removeLastWinner() {
    if (isSpinning || lastWinningIndex === null) return;

    if (lastWinningIndex >= 0 && lastWinningIndex < items.length) {
        const removedName = items[lastWinningIndex].name;
        items.splice(lastWinningIndex, 1);
        
        winnerDisplay.textContent = `${removedName} a été exclu.`;
        
        const btn = document.getElementById("remove-winner-btn");
        if (btn) btn.remove();

        lastWinningIndex = null;
        updateInterface();
    }
}

// --- CALCUL DE ROTATION ET ANIMATION (SPIN) ---
function spin() {
    if (isSpinning) return;
    if (items.length < 2) {
        winnerDisplay.textContent = "Il faut au moins 2 Brawlers !";
        return;
    }

    isSpinning = true;
    winnerDisplay.textContent = "Le tirage est en cours...";

    const oldBtn = document.getElementById("remove-winner-btn");
    if (oldBtn) oldBtn.remove();

    const spinTurns = 6 + Math.random() * 5; 
    const targetAngleChange = spinTurns * 2 * Math.PI;
    
    let startTime = null;
    const duration = 4500; 

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        
        const progress = Math.min(timeElapsed / duration, 1);
        const easeOutProgress = 1 - Math.pow(1 - progress, 4); 

        const angleValue = easeOutProgress * targetAngleChange;
        currentAngle = angleValue % (2 * Math.PI);

        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            determineWinner();
        }
    }
    requestAnimationFrame(animate);
}

function determineWinner() {
    const numSegments = items.length;
    const segmentAngle = (2 * Math.PI) / numSegments;
    const centerOfArrow = 3 * Math.PI / 2;
    
    let winningIndex = Math.floor((centerOfArrow - currentAngle + 2 * Math.PI) % (2 * Math.PI) / segmentAngle);
    winningIndex = (winningIndex + numSegments) % numSegments;

    const winner = items[winningIndex];
    lastWinningIndex = winningIndex;

    winnerDisplay.textContent = `🎰 Résultat : ${winner.name} (${winner.rarity}) !`;

    const removeBtn = document.createElement("button");
    removeBtn.id = "remove-winner-btn";
    removeBtn.className = "remove-winner-btn";
    removeBtn.textContent = `Retirer ${winner.name} de la roue`;
    removeBtn.addEventListener("click", removeLastWinner);
    
    document.getElementById("winner-box").appendChild(removeBtn);
}

// Écouteurs d'événements
addBtn.addEventListener("click", addBrawler);
addAllBtn.addEventListener("click", addAllBrawlers);
shuffleBtn.addEventListener("click", shuffleWheel);
clearBtn.addEventListener("click", clearAll);
spinBtn.addEventListener("click", spin);

// Chargement initial
initSelectMenu();
updateInterface();