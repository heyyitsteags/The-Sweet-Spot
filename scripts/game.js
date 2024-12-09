const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Customer Order and Player Selection
let currentRequest = {};
let playerSelection = { base: null, frosting: null, sprinkles: null };
let score = 0;
let feedbackMessage = ''; // Stores feedback message
let timer = 30; // 30 seconds timer
let timerInterval;

// Button Positions (for interaction detection)
const buttons = [];

// Preload Images
const assets = {
    bases: {
        vanilla: new Image(),
        chocolate: new Image(),
        strawberry: new Image(),
    },
    frostings: {
        chocolate: new Image(),
        vanilla: new Image(),
        strawberry: new Image(),
    },
    sprinkles: {
        rainbow: new Image(),
        chocolate: new Image(),
        none: new Image(),
    },
};

// Set image sources
assets.bases.vanilla.src = './assets/images/vanilla_cake.png';
assets.bases.chocolate.src = './assets/images/chocolate_cake.png';
assets.bases.strawberry.src = './assets/images/strawberry_cake.png';

assets.frostings.chocolate.src = './assets/images/chocolate_frosting.png';
assets.frostings.vanilla.src = './assets/images/vanilla_frosting.png';
assets.frostings.strawberry.src = './assets/images/strawberry_frosting.png';

assets.sprinkles.rainbow.src = './assets/images/rainbow_sprinkles.png';
assets.sprinkles.chocolate.src = './assets/images/chocolate_sprinkles.png';
assets.sprinkles.none.src = './assets/images/no_sprinkles.png';

// Randomize a new customer request
function randomizeRequest() {
    currentRequest = {
        base: Object.keys(assets.bases)[Math.floor(Math.random() * 3)],
        frosting: Object.keys(assets.frostings)[Math.floor(Math.random() * 3)],
        sprinkles: Object.keys(assets.sprinkles)[Math.floor(Math.random() * 3)],
    };
}

// Draw the canvas (customer request, player selection, and buttons)
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the player's cake selection (on the right side of the canvas)
    const cakeX = 400;
    const cakeY = 150;
    const cakeWidth = 300;
    const cakeHeight = 300;

    if (playerSelection.base) {
        ctx.drawImage(assets.bases[playerSelection.base], cakeX, cakeY, cakeWidth, cakeHeight);  // Display cake base
    }
    if (playerSelection.frosting) {
        ctx.drawImage(assets.frostings[playerSelection.frosting], cakeX, cakeY, cakeWidth, cakeHeight);  // Display frosting on top of cake
    }
    if (playerSelection.sprinkles && playerSelection.sprinkles !== 'none') {
        ctx.drawImage(assets.sprinkles[playerSelection.sprinkles], cakeX + 80, cakeY + 80, 140, 140);  // Adjusted sprinkles size and position
    }

    // Draw customer order text
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Customer Order:', 50, 50);
    ctx.fillText(`Base: ${capitalize(currentRequest.base)}`, 50, 80);
    ctx.fillText(`Frosting: ${capitalize(currentRequest.frosting)}`, 50, 110);
    ctx.fillText(`Sprinkles: ${capitalize(currentRequest.sprinkles)}`, 50, 140);

    // Draw player selection text
    ctx.fillText('Your Selection:', 400, 50);
    ctx.fillText(`Base: ${capitalize(playerSelection.base) || 'None'}`, 400, 80);
    ctx.fillText(`Frosting: ${capitalize(playerSelection.frosting) || 'None'}`, 400, 110);
    ctx.fillText(`Sprinkles: ${capitalize(playerSelection.sprinkles) || 'None'}`, 400, 140);

    // Draw score
    ctx.fillText(`Score: ${score}`, 50, 200);

    // Draw feedback message with dynamic color
    if (feedbackMessage) {
        ctx.fillStyle = feedbackMessage.includes('Congratulations') ? 'green' : 'red';
        ctx.font = '24px Arial';
        ctx.fillText(feedbackMessage, 50, 250);
    }

    // Draw timer
    ctx.fillText(`Time Left: ${timer} seconds`, 50, 220);

    // Draw buttons (on top of the cake)
    buttons.forEach((button) => {
        if (button.imageOrText instanceof Image) {
            // Draw the image for the button
            ctx.drawImage(button.imageOrText, button.x, button.y, button.width, button.height);
        } else {
            // Draw the text for the button (e.g., Submit button)
            ctx.fillStyle = 'lightblue';
            ctx.fillRect(button.x, button.y, button.width, button.height);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(button.x, button.y, button.width, button.height);
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.fillText(button.imageOrText, button.x + 10, button.y + 25);
        }
    });
}

// Helper function to capitalize words
function capitalize(word) {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Add a button (image or text)
function addButton(imageOrText, x, y, width, height, callback) {
    buttons.push({ imageOrText, x, y, width, height, callback });
}

// Handle Canvas Clicks
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    buttons.forEach((button) => {
        if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
        ) {
            button.callback();
        }
    });
});

// Submit Order
function submitOrder() {
    if (
        playerSelection.base === currentRequest.base &&
        playerSelection.frosting === currentRequest.frosting &&
        playerSelection.sprinkles === currentRequest.sprinkles
    ) {
        feedbackMessage = 'Congratulations! +10 Points!';
        score += 10;
        clearInterval(timerInterval); // Stop the timer once the order is correct
    } else {
        feedbackMessage = 'Try Again!';
    }

    // Clear the message after 2 seconds
    setTimeout(() => {
        feedbackMessage = ''; // Clear the message
        drawCanvas();
    }, 2000);

    randomizeRequest();
    playerSelection = { base: null, frosting: null, sprinkles: null };
    drawCanvas();
    resetTimer();
    startTimer();
}

// Start the timer countdown
function startTimer() {
    timerInterval = setInterval(() => {
        if (timer > 0 && !feedbackMessage) {  // Only decrement the timer if there's no feedback message
            timer--;
            drawCanvas();
        }
        if (timer === 0) {
            feedbackMessage = 'Time’s Up! Try Again!';
            clearInterval(timerInterval); // Stop the timer when it reaches zero
        }
    }, 1000);
}

// Reset the timer
function resetTimer() {
    timer = 30; // Reset to 30 seconds
}

// Initialize Buttons
function setupButtons() {
    buttons.length = 0;

    // Buttons for Bases
    Object.keys(assets.bases).forEach((base, index) => {
        addButton(
            assets.bases[base],
            50 + index * 100,
            300,
            80,
            80,
            () => {
                playerSelection.base = base;
                drawCanvas();
            }
        );
    });

    // Buttons for Frostings
    Object.keys(assets.frostings).forEach((frosting, index) => {
        addButton(
            assets.frostings[frosting],
            50 + index * 100,
            400,
            80,
            80,
            () => {
                playerSelection.frosting = frosting;
                drawCanvas();
            }
        );
    });

    // Buttons for Sprinkles
    Object.keys(assets.sprinkles).forEach((sprinkle, index) => {
        addButton(
            assets.sprinkles[sprinkle],
            50 + index * 100,
            500,
            80,
            80,
            () => {
                playerSelection.sprinkles = sprinkle;
                drawCanvas();
            }
        );
    });

    // Submit button
    addButton('Submit', 500, 600, 100, 50, submitOrder);
}

// Initialize Game
function initGame() {
    canvas.width = 800;
    canvas.height = 700;
    randomizeRequest();
    setupButtons();
    resetTimer();
    startTimer();
    drawCanvas();
}

// Start Game
initGame();
