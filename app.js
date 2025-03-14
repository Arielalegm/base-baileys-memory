const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const { getAIResponse, isBanned } = require('./src/services/aiService')
const { handleCommands, getBotActive } = require('./src/handlers/commandHandler')
const TimeService = require('./src/services/timeService');

const flowSaludo = addKeyword(['hola', 'Hola'])
    .addAnswer(`¡Hola! 👋 Soy tu nuevo asistente de IA en WhatsApp. 😊 Puedo ayudarte con:
*   Responder preguntas generales.
*   Traducir texto.
*   Generar ideas.
*   Resumir textos.
*   Proporcionar información.
*   Ayudar a redactar.
*   Ofrecer consejos.
*   Convertir unidades.
*   Crear historias.

Guárdame en tus contactos, nunca se sabe cuando pueda sacarte de un apuro😎!!!
*Importante:* No estoy conectado a internet. 😅

*Comandos útiles:*
*   /reset: Borra mi memoria y comienza un nuevo chat. 🧠
*   /prompt: Modifica mi comportamiento (¡experimenta!). 🤖

¡Anímate a usarme y compártelo con tus amigos! 🚀 ¡Espero ser de gran ayuda! 😉
¿Necesitas un bot más personalizado?  Contacta con Ariel al +5358688185. 🤖✨`)

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
    const adapterFlow = createFlow([flowSaludo, flowCatchAll])
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
