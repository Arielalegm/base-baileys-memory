module.exports = {
    name: 'comandos',
    description: 'Muestra todos los comandos disponibles',
    execute: async (client, message) => {
        let commandList = '*📝 Lista de Comandos Disponibles:*\n\n';
        
        // Obtener todos los comandos registrados
        const commands = Array.from(client.commands.values());
        
        commands.forEach(cmd => {
            commandList += `⚡ *.${cmd.name}*\n`;
            commandList += `└ ${cmd.description}\n\n`;
        });
        
        commandList += '\n_Usa cualquiera de estos comandos con el prefijo "."_';
        
        await message.reply(commandList);
    }
};
