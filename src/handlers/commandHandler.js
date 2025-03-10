const { conversationHistory, banUser, unbanUser, setCustomPrompt, getCustomPrompt } = require('../services/aiService');

let botActive = true;

function handleCommands(message, userId) {
    if (message.startsWith('/prompt')) {
        const parts = message.split(' ');
        if (parts.length < 3) {
            return '❌ Uso correcto: /prompt <número> <nuevo prompt>';
        }
        const targetNumber = parts[1];
        const newPrompt = parts.slice(2).join(' ');
        setCustomPrompt(targetNumber, newPrompt);
        return `✅ Nuevo prompt configurado para ${targetNumber}:\n"${newPrompt}"`;
    }

    const [command, targetNumber] = message.toLowerCase().split(' ');
    
    switch (command) {
        case '/reset':
            conversationHistory.delete(userId);
            return '🔄 Bot reiniciado. Historial de conversación limpiado.';
        case '/pause':
            botActive = false;
            return '⏸️ Bot pausado. Usa /play para reactivar.';
        case '/play':
            botActive = true;
            return '▶️ Bot reactivado. ¡Continuemos la conversación!';
        case '/ban_on':
            if (!targetNumber) return '❌ Debes especificar un número. Ejemplo: /ban_on 1234567890';
            banUser(targetNumber);
            return `🚫 Usuario ${targetNumber} ha sido baneado.`;
        case '/ban_off':
            if (!targetNumber) return '❌ Debes especificar un número. Ejemplo: /ban_off 1234567890';
            unbanUser(targetNumber);
            return `✅ Usuario ${targetNumber} ha sido desbaneado.`;
        default:
            return null;
    }
}

module.exports = {
    handleCommands,
    getBotActive: () => botActive
};
