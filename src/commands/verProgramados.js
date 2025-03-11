module.exports = {
    name: 'programados',
    description: 'Muestra tus mensajes programados',
    execute: async (client, message) => {
        const messages = client.timeService.getScheduledMessages(message.from);
        
        if (messages.length === 0) {
            return message.reply('No tienes mensajes programados');
        }

        let response = '*Tus mensajes programados:*\n\n';
        messages.forEach((msg, index) => {
            response += `${index + 1}. 📅 ${msg.date} ⏰ ${msg.time}\n`;
            response += `   📞 Para: ${msg.to}\n`;
            response += `   💬 Mensaje: ${msg.message}\n`;
            response += `   🔑 ID: ${msg.jobId}\n\n`;
        });

        message.reply(response);
    }
};
