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
const spinnerContainer = document.querySelector('.spinner-container');

// Get Modal elements
const winnerModal = document.getElementById('winnerModal');
const modalWinnerName = document.getElementById('modalWinnerName');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeModalBtnFooter = document.getElementById('closeModalBtnFooter');
const removeWinnerBtn = document.getElementById('removeWinnerBtn');

// --- THÊM MỚI: Nút Theme ---
const themeToggleBtn = document.getElementById('themeToggleBtn');

let lastWinner = null;
let participants = [];
const colors = ['#d9534f', '#f0ad4e', '#5cb85c', '#428bca'];
let currentRotation = 0; 
let spinning = false; 

function resizeCanvas() {
    const size = spinnerContainer.clientWidth;
    canvas.width = size;
    canvas.height = size;
    drawWheel();
}

// --- CẬP NHẬT: hàm drawWheel() ---
/**
 * Vẽ vòng quay lên canvas
 * Cập nhật để vẽ màu dựa trên light/dark mode
 */
// --- THAY THẾ TOÀN BỘ HÀM NÀY ---

function drawWheel() {
    const numSegments = participants.length;
    
    const isLightMode = document.body.classList.contains('light-mode');
    
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (width / 2) - 2;
    
    const scale = width / 500; 
    const centerCircleRadius = 40 * scale;
    const textRadius = 160 * scale;
    
    // --- CẬP NHẬT FONT SIZE ---
    // Thay đổi cỡ chữ "Quay" ở đây nếu muốn
    const fontSize = Math.max(10, 22 * scale); // Giảm một chút để vừa chữ "Quay"
    // --- KẾT THÚC CẬP NHẬT ---

    ctx.clearRect(0, 0, width, height);
    
    // --- VỊ TRÍ 1: VẼ KHI VÒNG QUAY TRỐNG ---
    if (numSegments === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isLightMode ? '#ddd' : '#444'; 
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, centerCircleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = isLightMode ? '#ccc' : '#fff'; 
        ctx.fill();

        // --- THÊM MỚI: Vẽ chữ "Quay" ---
        ctx.fillStyle = '#333'; // Màu chữ
        ctx.font = `bold ${fontSize}px Poppins`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Spin', centerX, centerY);
        // --- KẾT THÚC THÊM MỚI ---
        return;
    }

    const sliceAngle = (2 * Math.PI) / numSegments;

    for (let i = 0; i < numSegments; i++) {
        const participant = participants[i];
        const startAngle = i * sliceAngle;
        const endAngle = (i + 1) * sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = participant.color;
        ctx.fill();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (participant.color === '#f0ad4e' || participant.color === '#5cb85c') {
            ctx.fillStyle = '#000';
        } else {
            ctx.fillStyle = '#FFF';
        }
        
        // --- CẬP NHẬT: Dùng cỡ chữ riêng cho tên
        const nameFontSize = Math.max(10, 30 * scale);
        ctx.font = `bold ${nameFontSize}px Poppins`;
        // --- KẾT THÚC CẬP NHẬT ---
        
        let name = participant.name;
        if (name.length > 13) { 
            name = name.substring(0, 12) + '...';
        }
        ctx.fillText(name, textRadius, 0);
        ctx.restore();
    }
    
    // --- VỊ TRÍ 2: VẼ KHI CÓ NGƯỜI CHƠI ---
    // Vẽ vòng tròn trung tâm
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerCircleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isLightMode ? '#ccc' : '#fff';
    ctx.fill();

    // --- THÊM MỚI: Vẽ chữ "Quay" ---
    ctx.fillStyle = '#333'; // Màu chữ
    ctx.font = `bold ${fontSize}px Poppins`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Quay', centerX, centerY);
    // --- KẾT THÚC THÊM MỚI ---
}

// ... (Các hàm updateParticipantList, handleAddParticipant, showModal, hideModal, handleSpin giữ nguyên) ...
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
function showModal(winner) {
    lastWinner = winner;
    modalWinnerName.textContent = winner.name;
    winnerModal.classList.add('show');
}
function hideModal() {
    winnerModal.classList.remove('show');
}
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
        launchFirework(window.innerWidth / 2, window.innerHeight / 2, winner.color);
        setTimeout(() => launchFirework(random(0, window.innerWidth), random(0, window.innerHeight * 0.5), winner.color), 300);
        setTimeout(() => launchFirework(random(0, window.innerWidth), random(0, window.innerHeight * 0.5), winner.color), 600);
        
        showModal(winner);
        spinning = false;
        
        const finalAngleInRads = (finalRotation * Math.PI / 180);
        currentRotation = finalAngleInRads % (2 * Math.PI); 
        canvas.style.transition = 'none';
        canvas.style.transform = `rotate(${currentRotation}rad)`;
        
        setTimeout(() => {
            canvas.style.transition = 'transform 6s cubic-bezier(0.1, 0.7, 0.1, 1)';
        }, 50);

    }, 6100); 
}

// --- Event Listeners (cũ) ---
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
window.addEventListener('resize', resizeCanvas);


// --- THÊM MỚI: Logic xử lý Theme ---
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleBtn.textContent = '🌙'; // Icon mặt trăng
    } else {
        document.body.classList.remove('light-mode');
        themeToggleBtn.textContent = '☀️'; // Icon mặt trời
    }
    // Vẽ lại vòng quay để cập nhật màu canvas (rất quan trọng)
    drawWheel(); 
}

themeToggleBtn.addEventListener('click', () => {
    // Chuyển đổi class
    const isLight = document.body.classList.toggle('light-mode');
    // Lưu lựa chọn
    const newTheme = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    // Cập nhật icon
    applyTheme(newTheme);
});

// --- CẬP NHẬT: Khởi tạo ban đầu ---
// Load theme đã lưu (nếu có)
const savedTheme = localStorage.getItem('theme') || 'dark'; // Mặc định là theme tối
applyTheme(savedTheme);

// Khởi tạo kích thước canvas (giữ nguyên)
resizeCanvas();