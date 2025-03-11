module.exports = {
    name: 'programar',
    description: 'Programa un mensaje para enviar más tarde',
    execute: async (client, message, args) => {
        if (args.length < 4) {
            return message.reply(`*Uso correcto:*
.programar dd/mm/yyyy HH:MM número mensaje
            
*Ejemplo:*
.programar 25/12/2023 08:30 5491112345678 ¡Feliz Navidad!`);
        }

        const date = args[0];
        const time = args[1];
        const to = args[2];
        const messageText = args.slice(3).join(' ');

        try {
            const result = client.timeService.scheduleMessage({
                time,
                date,
                message: messageText,
                to,
                from: message.from
            });

            if (result.error) {
                return message.reply(result.error);
            }

            message.reply(`✅ Mensaje programado con éxito para ${date} ${time}`);
        } catch (error) {
            message.reply('❌ Error al programar el mensaje. Verifica el formato de fecha y hora');
        }
    }
};
