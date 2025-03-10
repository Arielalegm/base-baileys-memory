const CONFIG = require('../config/config');
const { searchOnGoogle } = require('./searchService');

const conversationHistory = new Map();
const bannedUsers = new Set();
const customPrompts = new Map(); // Nuevo Map para prompts personalizados

async function getAIResponse(userMessage, userId) {
    try {
        if (!conversationHistory.has(userId)) {
            conversationHistory.set(userId, []);
        }
        const userHistory = conversationHistory.get(userId);

        const currentPrompt = customPrompts.has(userId) 
            ? customPrompts.get(userId) 
            : CONFIG.SYSTEM_PROMPT;

        // Buscar información relevante
        const searchResults = await searchOnGoogle(userMessage);
        let contextInfo = '';
        
        if (searchResults) {
            contextInfo = 'Información actualizada encontrada:\n' +
                searchResults.map(result => 
                    `${result.title}: ${result.snippet}`
                ).join('\n');
        }

        const messages = [
            { role: "system", content: currentPrompt },
            { role: "system", content: contextInfo },
            ...userHistory,
            { role: "user", content: userMessage }
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
                "HTTP-Referer": CONFIG.SITE_URL,
                "X-Title": CONFIG.SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-chat:free",
                "messages": messages
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

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
