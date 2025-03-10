const { GoogleGenerativeAI } = require("@google/generative-ai");
const CONFIG = require('../config/config');

const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
const conversationHistory = new Map();
const bannedUsers = new Set();
const customPrompts = new Map();

async function getAIResponse(userMessage, userId) {
    try {
        if (!conversationHistory.has(userId)) {
            conversationHistory.set(userId, []);
        }
        const userHistory = conversationHistory.get(userId);
        const currentPrompt = getCustomPrompt(userId);

        // Combinar el prompt del sistema con el mensaje del usuario
        const fullMessage = `${currentPrompt}\n\nUsuario: ${userMessage}`;

        const model = genAI.getGenerativeModel({ model: CONFIG.MODEL_NAME });
        
        const chat = model.startChat({
            history: userHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7
            }
        });

        const result = await chat.sendMessage(fullMessage);
        const response = await result.response;
        const aiResponse = response.text();

        // Guardar solo el mensaje original del usuario y la respuesta
        userHistory.push({ role: "user", content: userMessage });
        userHistory.push({ role: "assistant", content: aiResponse });

        if (userHistory.length > 20) {
            userHistory.splice(0, 2);
        }

        return aiResponse;
    } catch (error) {
        console.error(error);
        return "Lo siento, hubo un error al procesar tu mensaje.";
    }
}

function isBanned(userId) {
    return bannedUsers.has(userId);
}

function banUser(userId) {
    bannedUsers.add(userId);
}

function unbanUser(userId) {
    bannedUsers.delete(userId);
}

function setCustomPrompt(userId, prompt) {
    customPrompts.set(userId, prompt);
}

function getCustomPrompt(userId) {
    return customPrompts.get(userId) || CONFIG.SYSTEM_PROMPT;
}

module.exports = {
    getAIResponse,
    conversationHistory,
    isBanned,
    banUser,
    unbanUser,
    setCustomPrompt,
    getCustomPrompt,
    customPrompts
};
