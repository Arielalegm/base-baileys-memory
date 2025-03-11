const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const { getAIResponse, isBanned } = require('./src/services/aiService')
const { handleCommands, getBotActive } = require('./src/handlers/commandHandler')
const TimeService = require('./src/services/timeService');

const flowCatchAll = addKeyword([])
    .addAction(async (ctx, { flowDynamic }) => {
        console.log({
            remitente: ctx.from,
            nombreRemitente: ctx.pushName || 'No disponible',
            tipo: ctx.type,
            mensaje: ctx.body,
            timestamp: new Date().toLocaleString()
        });

        // Verificar si el usuario está baneado
        if (isBanned(ctx.from)) {
            return;
        }

        const commandResponse = handleCommands(ctx.body, ctx.from);
        if (commandResponse) {
            await flowDynamic(commandResponse);
            return;
        }

        if (!getBotActive()) {
            return;
        }

        const respuesta = await getAIResponse(ctx.body, ctx.from);
        await flowDynamic(respuesta);
    })

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowCatchAll])
    const adapterProvider = createProvider(BaileysProvider)

    const client = createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
    client.timeService = new TimeService(client);
}

main()
