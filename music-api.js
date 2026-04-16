// ========== MUSIC THUMBNAILS (iTunes Search API - Free, No Auth, CORS OK) ==========

async function fetchAlbumArt(title, artist) {
    try {
        const query = encodeURIComponent(`${title} ${artist}`);
        const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=1`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            // Replace 100x100 with 300x300 for better quality
            return data.results[0].artworkUrl100.replace('100x100', '300x300');
        }
    } catch (e) {
        console.warn(`iTunes fetch failed for "${title}" - ${artist}:`, e.message);
    }
    return null;
}

async function loadMusicThumbnails() {
    const items = document.querySelectorAll('#masonry-gallery .masonry-item');

    for (const item of items) {
        const titleEl = item.querySelector('.mc-title');
        const artistEl = item.querySelector('.mc-artist');
        const imageEl = item.querySelector('.masonry-image');

        if (!titleEl || !artistEl || !imageEl) continue;

        const title = titleEl.textContent.trim();
        const artist = artistEl.textContent.trim();

        const coverUrl = await fetchAlbumArt(title, artist);
        if (coverUrl) {
            imageEl.style.backgroundImage = `url('${coverUrl}')`;
            imageEl.style.backgroundSize = 'cover';
            imageEl.style.backgroundPosition = 'center';
            // Hide text labels once real art loads
            titleEl.style.display = 'none';
            artistEl.style.display = 'none';
        }
    }
}
