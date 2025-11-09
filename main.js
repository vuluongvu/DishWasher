// --- START OF FIREWORKS CODE ---
const fireworksCanvas = document.getElementById('fireworksCanvas');
const f_ctx = fireworksCanvas.getContext('2d');
let particles = [];

fireworksCanvas.width = window.innerWidth;
fireworksCanvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
});

function random(min, max) {
    return Math.random() * (max - min) + min;
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = random(2, 4);
        this.alpha = 1;
        this.friction = 0.96;
        this.gravity = 0.3;
        this.angle = random(0, Math.PI * 2);
        this.speed = random(5, 15);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
    }
    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.02;
    }
    draw() {
        f_ctx.globalAlpha = this.alpha;
        f_ctx.beginPath();
        f_ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        f_ctx.fillStyle = this.color;
        f_ctx.fill();
        f_ctx.globalAlpha = 1;
    }
}

function animateFireworks() {
    f_ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
    f_ctx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        particles[i].update();
        if (particles[i].alpha <= 0) {
            particles.splice(i, 1);
        }
    }
    if (particles.length > 0) {
        requestAnimationFrame(animateFireworks);
    } else {
        f_ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    }
}

function launchFirework(x, y, color) {
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, color));
    }
    if (particles.length === particleCount) {
        animateFireworks();
    }
}
// --- END OF FIREWORKS CODE ---


// --- START OF WHEEL CODE ---
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const addButton = document.getElementById('addButton');
const participantList = document.getElementById('participantList');

// Get Modal elements
const winnerModal = document.getElementById('winnerModal');
const modalWinnerName = document.getElementById('modalWinnerName');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalBtnFooter = document.getElementById('closeModalBtnFooter');
const removeWinnerBtn = document.getElementById('removeWinnerBtn');

let lastWinner = null; // To keep track of who to remove
let participants = [];
const colors = ['#d9534f', '#f0ad4e', '#5cb85c', '#428bca']; // R, Y, G, B
let currentRotation = 0; 
let spinning = false; 

/**
 * Draws the spinning wheel on the canvas
 */
function drawWheel() {
    const numSegments = participants.length;
    if (numSegments === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(250, 250, 248, 0, 2 * Math.PI);
        ctx.fillStyle = '#444';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(250, 250, 40, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();
        return;
    }

    const sliceAngle = (2 * Math.PI) / numSegments;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSegments; i++) {
        const participant = participants[i];
        const startAngle = i * sliceAngle;
        const endAngle = (i + 1) * sliceAngle;

        ctx.beginPath();
        ctx.moveTo(250, 250); 
        ctx.arc(250, 250, 248, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = participant.color;
        ctx.fill();

        ctx.save();
        ctx.translate(250, 250); 
        ctx.rotate(startAngle + sliceAngle / 2); 
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle';
        
        if (participant.color === '#f0ad4e' || participant.color === '#5cb85c') {
            ctx.fillStyle = '#000'; // Black text for Yellow/Green
        } else {
            ctx.fillStyle = '#FFF'; // White text for Red/Blue
        }
        
        ctx.font = 'bold 24px Poppins'; 
        
        let name = participant.name;
        if (name.length > 13) { 
            name = name.substring(0, 12) + '...';
        }
        ctx.fillText(name, 160, 0); 
        ctx.restore(); 
    }
    
    ctx.beginPath();
    ctx.arc(250, 250, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

/**
 * Updates the HTML participant list
 */
function updateParticipantList() {
    participantList.innerHTML = ''; 
    participants.forEach((participant, index) => {
        const li = document.createElement('li');
        if (!participant.canWin) {
            li.classList.add('cant-win');
        }
        const nameSpan = document.createElement('span');
        nameSpan.textContent = participant.name;
        li.appendChild(nameSpan);

        const controlsDiv = document.createElement('div');
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Toggle';
        toggleButton.classList.add('toggle-btn');
        toggleButton.onclick = () => {
            participants[index].canWin = !participants[index].canWin;
            updateParticipantList(); 
        };
        controlsDiv.appendChild(toggleButton);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-btn');
        removeButton.onclick = () => {
            participants.splice(index, 1);
            participants.forEach((p, i) => {
                p.color = colors[i % colors.length];
            });
            drawWheel();
            updateParticipantList();
        };
        controlsDiv.appendChild(removeButton);
        li.appendChild(controlsDiv);
        participantList.appendChild(li);
    });
}

/**
 * Handles adding a new participant
 */
function handleAddParticipant() {
    const name = nameInput.value.trim();
    if (name) {
        participants.push({
            name: name,
            color: colors[participants.length % colors.length],
            canWin: true 
        });
        nameInput.value = ''; 
        drawWheel(); 
        updateParticipantList(); 
    }
}

/**
 * Shows the winner modal
 */
function showModal(winner) {
    lastWinner = winner;
    modalWinnerName.textContent = winner.name;
    winnerModal.classList.add('show');
}

/**
 * Hides the winner modal
 */
function hideModal() {
    winnerModal.classList.remove('show');
}

/**
 * Handles the "spin" logic
 */
function handleSpin() {
    if (spinning || participants.length < 2) return;
    
    spinning = true;
    const eligibleWinners = participants.filter(p => p.canWin);
    let selectedList = eligibleWinners.length > 0 ? eligibleWinners : participants;
    const winner = selectedList[Math.floor(Math.random() * selectedList.length)];
    const winnerIndex = participants.indexOf(winner);
    
    const numSegments = participants.length;
    const sliceAngle = 360 / numSegments;
    const sliceMiddle = sliceAngle / 2;
    const targetAngle = 360 - (winnerIndex * sliceAngle + sliceMiddle);
    const randomOffset = (Math.random() * (sliceAngle * 0.8)) - (sliceAngle * 0.4); 
    const totalSpins = 360 * 5; 
    const finalRotation = totalSpins + targetAngle + randomOffset;

    canvas.style.transform = `rotate(${finalRotation}deg)`;
    
    setTimeout(() => {
        // --- Launch Fireworks ---
        launchFirework(window.innerWidth / 2, window.innerHeight / 2, winner.color);
        setTimeout(() => launchFirework(random(0, window.innerWidth), random(0, window.innerHeight * 0.5), winner.color), 300);
        setTimeout(() => launchFirework(random(0, window.innerWidth), random(0, window.innerHeight * 0.5), winner.color), 600);
        
        // --- Show Winner Modal ---
        showModal(winner);

        spinning = false;
        
        // Reset wheel
        const finalAngleInRads = (finalRotation * Math.PI / 180);
        currentRotation = finalAngleInRads % (2 * Math.PI); 
        canvas.style.transition = 'none';
        canvas.style.transform = `rotate(${currentRotation}rad)`;
        
        setTimeout(() => {
            canvas.style.transition = 'transform 6s cubic-bezier(0.1, 0.7, 0.1, 1)';
        }, 50);

    }, 6100); 
}

// --- Event Listeners ---
addButton.addEventListener('click', handleAddParticipant);
nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleAddParticipant();
    }
});

canvas.addEventListener('click', handleSpin);
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        handleSpin();
    }
});

// --- Modal Event Listeners ---
closeModalBtn.addEventListener('click', hideModal);
closeModalBtnFooter.addEventListener('click', hideModal);

removeWinnerBtn.addEventListener('click', () => {
    if (lastWinner) {
        const winnerIndex = participants.indexOf(lastWinner);
        if (winnerIndex > -1) {
            participants.splice(winnerIndex, 1);
            participants.forEach((p, i) => {
                p.color = colors[i % colors.length];
            });
            drawWheel();
            updateParticipantList();
        }
    }
    hideModal();
});

// --- Initial Draw ---
drawWheel();