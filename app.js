const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const OPENROUTER_API_KEY = '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'
const SITE_URL = 'TU_URL_AQUI'
const SITE_NAME = 'TU_NOMBRE_AQUI'

// Configuración del sistema prompt
const SYSTEM_PROMPT = `solo puedes hablar de perros, habla solo sobre los perros.
1. las respuestas deben ser cortas, breves y concisas.`;

// Mantener un historial de conversación por usuario
const conversationHistory = new Map();

async function getAIResponse(userMessage, userId) {
    try {
        console.log(`\n=== Nuevo Mensaje ===`);
        console.log(`De: ${userId}`);
        console.log(`Mensaje: ${userMessage}`);
        console.log(`Hora: ${new Date().toLocaleString()}`);
        console.log(`==================\n`);

        // Obtener o inicializar el historial del usuario
        if (!conversationHistory.has(userId)) {
            conversationHistory.set(userId, []);
        }
        const userHistory = conversationHistory.get(userId);

        // Construir mensajes con historial y system prompt
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...userHistory,
            { role: "user", content: userMessage }
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-chat:free",
                "messages": messages
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Actualizar historial
        userHistory.push({ role: "user", content: userMessage });
        userHistory.push({ role: "assistant", content: aiResponse });

        // Mantener solo los últimos 10 mensajes para evitar exceder límites
        if (userHistory.length > 20) {
            userHistory.splice(0, 2);
        }

        return aiResponse;
    } catch (error) {
        console.error(error);
        return "Lo siento, hubo un error al procesar tu mensaje.";
    }
}



// Flujo que captura cualquier mensaje
const flowCatchAll = addKeyword([])
    .addAction(async (ctx, { flowDynamic }) => {
        // Mostrar información detallada del contexto
        console.log({
            remitente: ctx.from,
            nombreRemitente: ctx.pushName || 'No disponible',
            tipo: ctx.type,
            mensaje: ctx.body,
            timestamp: new Date().toLocaleString()
        });

        const respuesta = await getAIResponse(ctx.body, ctx.from);
        await flowDynamic(respuesta);
    })

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowCatchAll])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
