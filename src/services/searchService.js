const CONFIG = require('../config/config');

async function searchOnGoogle(query) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${CONFIG.GOOGLE_API_KEY}&cx=${CONFIG.GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=${CONFIG.MAX_SEARCH_RESULTS}`
        );

        const data = await response.json();
        
        if (!data.items) return null;

        return data.items.map(item => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link
        }));
    } catch (error) {
        console.error('Error en búsqueda:', error);
        return null;
    }
}

module.exports = { searchOnGoogle };
