const Spotify = require("spotify-api.js");
const client = new Spotify.Client({ token: { clientID: '56739bfb3c8243d8a3fa5bda03c9a683', clientSecret: '5472bc86c2f94b6085aa77c2bc15ad8d' } });

/**
 * Extracts the Spotify ID from a given URL.
 * @param {string} url - The Spotify URL.
 * @returns {string} - The extracted Spotify ID.
 */
const extractSpotifyId = (url) => {
    const regex = /(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(?:intl-[a-z]{2}\/)?(?:[a-z]+\/)?)([a-z]+)\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    if (match && match[2]) {
        return match[2];
    }
    throw new Error('Invalid Spotify URL');
};

/**
 * Fetches Spotify data based on the URL.
 * @param {string} url - The Spotify URL.
 * @returns {Promise<Object>} - The Spotify API result.
 */
const getSpotifyData = async (url) => {
    try {
        const id = extractSpotifyId(url);
        const type = url.includes('track') ? 'tracks' : url.includes('album') ? 'albums' : 'artists';
        // debugger;
        const data = await client[type].get(id);
        return data;
    } catch (error) {
        console.error('Error fetching Spotify data:', error);
        throw error;
    }
};

module.exports = { getSpotifyData };