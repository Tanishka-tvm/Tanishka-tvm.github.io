// Initialize Speech Recognition and Speech Synthesis
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;

const textarea = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('messages');

// Speech-to-Text Button
const speechBtn = document.createElement('button');
speechBtn.innerHTML = "🎤";
speechBtn.classList.add('speech-btn');
document.querySelector('.input-container').appendChild(speechBtn);

// TTS Toggle Button
const ttsToggleBtn = document.createElement('button');
ttsToggleBtn.innerHTML = "🔊ON";
ttsToggleBtn.classList.add('tts-btn');
document.querySelector('.input-container').appendChild(ttsToggleBtn);

let isTTSActive = true; // TTS enabled by default

// Toggle TTS Functionality
ttsToggleBtn.addEventListener('click', () => {
    isTTSActive = !isTTSActive;
    ttsToggleBtn.textContent = isTTSActive ? "🔊ON" : "🔇OFF";
});

// Speech Recognition Trigger
speechBtn.addEventListener('click', () => recognition.start());

// Auto-grow Textarea
textarea.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// Handle Enter Key for Sending Message
textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendBtn.click();
    }
});

// Handle Send Button Click
sendBtn.addEventListener('click', sendMessage);

// Speech Recognition Result
recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    textarea.value = transcript;
    sendMessage();
});

// Send Message Function
function sendMessage() {
    const message = textarea.value.trim();
    if (message) {
        // Add User Message
        addMessage("You", message, "public/user-profile-icon.jpg", true);

        // Clear Input
        textarea.value = '';
        textarea.style.height = 'auto';

        // Call Gemini API or Simulate Bot Response
        getBotResponse(message);
    }
}

// Add Message to Chat
function addMessage(senderName, message, iconSrc, isSender) {
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.classList.add('chat-bubble-wrapper', isSender ? 'sender' : 'receiver');

    const icon = document.createElement('img');
    icon.src = iconSrc;
    icon.alt = `${senderName} Icon`;
    icon.classList.add('chat-icon');

    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble');
    bubble.textContent = message;

    if (isSender) {
        bubbleWrapper.appendChild(bubble);
        bubbleWrapper.appendChild(icon); // User icon on the right
    } else {
        bubbleWrapper.appendChild(icon); // Bot icon on the left
        bubbleWrapper.appendChild(bubble);
    }

    messagesDiv.appendChild(bubbleWrapper);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Generate API Request Based on Character's Personality
function getCharacterPrompt(userMessage, character) {
    let prompt = `The user says: "${userMessage}". Respond in the style of ${character}.\n`;

    // Define responses based on character personality
    if (character === 'Tom') {
        prompt += "Respond clever, annoyed, sophisticated yet charming but kind too like you are talking to a kid, in small sentences, use less expressions.";
    } else if (character === 'Jerry') {
        prompt += "Respond mischievously and cheekily but kind and helpful, in small sentences, use less expressions.";
    } else if (character === 'ToJe') {
        prompt += "Respond friendly and helpful.";
    }

    return prompt;
}

// Implement a bad word filter
function filterBadWords(message) {
    const badWords = ['badword1', 'badword2']; // Add more bad words to the list
    let filteredMessage = message;
    badWords.forEach(word => {
        filteredMessage = filteredMessage.replace(new RegExp(`\\b${word}\\b`, 'gi'), '****');
    });
    return filteredMessage;
}

// Fetch Bot Response from Gemini API
async function getBotResponse(userMessage) {
    try {
        // Apply bad word filter before sending the message
        const filteredMessage = filterBadWords(userMessage);

        // Get selected character from localStorage or use default 'ToJe'
        const character = localStorage.getItem('selectedCharacter') || 'ToJe';

        // Create prompt based on character
        const prompt = getCharacterPrompt(filteredMessage, character);

        // Call the Gemini API (or your AI API) with the prompt
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAMji-C9j5IvWhOjW-oQe7hivt4YIK3qyw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
            }),
        });

        const data = await response.json();
        const botMessage = data.candidates[0].content.parts[0].text.trim();

        // Add Bot Response to the Chat
        addMessage("Bot", botMessage, "public/toje-bg.jpg", false);

        // Text-to-Speech for Bot Response
        if (isTTSActive) {
            textToSpeech(botMessage);
        }
    } catch (error) {
        console.error('Error with API call:', error);
        const errorMessage = "Sorry, I couldn't understand that. Please try again.";
        addMessage("Bot", errorMessage, "public/toje-bg.jpg", false);
    }
}

// Text-to-Speech Function
function textToSpeech(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = 'en-US';
    window.speechSynthesis.speak(speech);
}

// Open the character selection modal
function openCharacterSelection() {
    document.getElementById('characterModal').style.display = 'block';
}

// Close the character selection modal
function closeCharacterSelection() {
    document.getElementById('characterModal').style.display = 'none';
}

// Handle character selection
function selectCharacter(character) {
    // Store selected character in localStorage for future use
    localStorage.setItem('selectedCharacter', character);

    // Update background and chatbot name based on character selection
    switch (character) {
        case 'Tom':
            window.location.href = 'tom.html'; // Redirect to Tom's page
            break;
        case 'Jerry':
            window.location.href = 'jerry.html'; // Redirect to Jerry's page
            break;
        case 'ToJe':
            window.location.href = 'index.html'; // Redirect to Hello ToJe page
            break;
        default:
            break;
    }

    // Close modal after selection
    closeCharacterSelection();
}

window.onclick = function(event) {
    const modal = document.getElementById('characterModal');
    if (event.target === modal) {
        closeCharacterSelection();
    }
};
