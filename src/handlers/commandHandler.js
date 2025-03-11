const { conversationHistory, banUser, unbanUser, setCustomPrompt, getCustomPrompt } = require('../services/aiService');

let botActive = true;

function handleCommands(message, userId) {
    if (message.startsWith('/prompt')) {
        const parts = message.split(' ');
        if (parts.length < 2) {
            return '❌ Uso correcto:\n/prompt <nuevo prompt>\nó\n/prompt <número> <nuevo prompt>\nEjemplo:\n/prompt Actúa como un experto\nó\n/prompt 1234567890 Actúa como un experto';
        }
        
        let targetNumber = userId;
        let promptIndex = 1;
        
        // Verificar si el segundo argumento es un número de teléfono
        if (/^\d+$/.test(parts[1])) {
            targetNumber = parts[1];
            promptIndex = 2;
            if (parts.length < 3) {
                return '❌ Debes especificar un prompt después del número de teléfono';
            }
        }
        
        const newPrompt = parts.slice(promptIndex).join(' ');
        setCustomPrompt(targetNumber, newPrompt);
        return `✅ Nuevo prompt configurado para ${targetNumber}:\n"${newPrompt}"`;
    }

    const [command, targetNumber] = message.toLowerCase().split(' ');
    
    switch (command) {
        case '/comandos':
            return `📝 *Comandos disponibles:*

/reset - Reinicia el historial de conversación
/reset [número] - Reinicia el historial para un número específico
/pause - Pausa el bot
/play - Reactiva el bot
/ban_on [número] - Banea a un usuario
/ban_off [número] - Desbanea a un usuario
/prompt [texto] - Configura un nuevo prompt
/prompt [número] [texto] - Configura un prompt para un número específico
/comandos - Muestra esta lista de comandos`;

        case '/reset':
            if (targetNumber) {
                conversationHistory.delete(targetNumber);
                return `🔄 Bot reiniciado para el número ${targetNumber}. Historial de conversación limpiado.`;
            }
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
