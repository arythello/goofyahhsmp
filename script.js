// Translations
const translations = {
    en: {
        home: "Home",
        docs: "Mods / Docs",
        discord: "Discord",
        subtitle: "Modded Minecraft Survival Multiplayer",
        ip: "IP: goofyahhsmp.lol",
        copied: "Copied to clipboard!",
        copied_btn: "COPIED!",
        status_title: "Server Status",
        checking: "Checking...",
        online: "ONLINE",
        offline: "OFFLINE",
        loading_motd: "Loading MOTD...",
        version: "Version",
        about_title: "What is Goofy Ahh SMP?",
        about_desc: "Experience a modded SMP like no other. We focus on community-driven survival gameplay mixed with just the right amount of chaos.",
        feat_1_title: "Exploration",
        feat_1_desc: "Discover new biomes, structures, and dimensions.",
        feat_2_title: "QoL Mods",
        feat_2_desc: "Enjoy a smoother experience with carefully selected quality of life improvements.",
        feat_3_title: "Community",
        feat_3_desc: "Join a fun, chaotic, and welcoming group of players.",
        docs_title: "Mod List & Documentation",
        docs_sub: "Explore the content of the SMP",
        search_placeholder: "Search mods by name or author...",
        loading_mods: "Loading mods...",
        footer: "&copy; 2024 Goofy Ahh SMP. Not affiliated with Mojang.",
        view_mod: "View on CurseForge &rarr;",
        no_mods: "No mods found matching your search.",
        server_offline_motd: "Server is currently offline.",
        click_details: "Click to view details."
    },
    fr: {
        home: "Accueil",
        docs: "Mods / Docs",
        discord: "Discord",
        subtitle: "Survie Multijoueur Minecraft Moddé",
        ip: "IP: goofyahhsmp.lol",
        copied: "Copié dans le presse-papier !",
        copied_btn: "COPIÉ !",
        status_title: "État du Serveur",
        checking: "Vérification...",
        online: "EN LIGNE",
        offline: "HORS LIGNE",
        loading_motd: "Chargement du MOTD...",
        version: "Version",
        about_title: "Qu'est-ce que Goofy Ahh SMP ?",
        about_desc: "Découvrez un SMP moddé unique. Nous privilégions la survie communautaire avec juste ce qu'il faut de chaos.",
        feat_1_title: "Exploration",
        feat_1_desc: "Découvrez de nouveaux biomes, structures et dimensions.",
        feat_2_title: "Mods QoL",
        feat_2_desc: "Profitez d'une expérience fluide avec des améliorations de qualité de vie.",
        feat_3_title: "Communauté",
        feat_3_desc: "Rejoignez un groupe de joueurs fun, chaotique et accueillant.",
        docs_title: "Liste des Mods & Documentation",
        docs_sub: "Explorez le contenu du SMP",
        search_placeholder: "Rechercher des mods par nom ou auteur...",
        loading_mods: "Chargement des mods...",
        footer: "&copy; 2024 Goofy Ahh SMP. Non affilié à Mojang.",
        view_mod: "Voir sur CurseForge &rarr;",
        no_mods: "Aucun mod trouvé.",
        server_offline_motd: "Le serveur est actuellement hors ligne.",
        click_details: "Cliquez pour voir les détails."
    }
};

let currentLang = localStorage.getItem('lang') || 'en';

// Server Status Elements
const statusInd = document.getElementById('status-ind');
const statusText = document.getElementById('status-text');
const playerCount = document.getElementById('player-count');
const playerMax = document.getElementById('player-max');
const serverVer = document.getElementById('server-ver');
const serverMotd = document.getElementById('server-motd');

// Join Button Elements
const joinBtn = document.getElementById('join-btn');
const copyMsg = document.getElementById('copy-msg');

// Mod List Elements
const modGrid = document.getElementById('mod-grid');
const modSearch = document.getElementById('mod-search');
const loadingMsg = document.getElementById('loading');

// Language Toggle
const langToggle = document.getElementById('lang-toggle');

let allMods = [];

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    if (langToggle) langToggle.innerText = lang === 'en' ? 'EN' : 'FR';

    // Update keys
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
        const key = el.getAttribute('data-lang-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Re-render mods if on docs page to update "View" link text
    if (modGrid && allMods.length > 0) {
        displayMods(allMods); // We might need to preserve search filter, but full re-render is fine
    }

    // Re-check status text if it was manually set (e.g. ONLINE/OFFLINE)
    // Actually checkStatus updates it dynamically, but if we just switched lang, we need to refresh the current status text
    if (statusText && statusText.classList.contains('text-set')) {
        // We rely on checkStatus running or storing state, but let's just re-run checkStatus to be safe or update simply
        // If status is Final (Online/Offline), update text
        if (statusInd.classList.contains('online')) {
            statusText.innerText = translations[lang].online;
        } else if (statusInd.classList.contains('offline')) {
            statusText.innerText = translations[lang].offline;
        }
    }
}

// --- Server Status ---
async function checkStatus() {
    if (!statusInd) return; // Only on pages with status section

    try {
        const response = await fetch('https://api.mcsrvstat.us/2/goofyahhsmp.lol');
        const data = await response.json();

        if (data.online) {
            statusInd.classList.add('online');
            statusInd.classList.remove('offline');
            statusText.innerText = translations[currentLang].online;
            statusText.style.color = "var(--primary)";
            statusText.classList.add('text-set');

            playerCount.innerText = data.players.online;
            playerMax.innerText = data.players.max;
            serverVer.innerText = data.version;

            // Clean MOTD (remove color codes if raw, but API returns html/clean)
            if (data.motd && data.motd.clean) {
                serverMotd.innerText = data.motd.clean.join('\n');
            }
        } else {
            setOffline();
        }
    } catch (e) {
        console.error("Status check failed", e);
        setOffline();
    }
}

function setOffline() {
    statusInd.classList.add('offline');
    statusInd.classList.remove('online');
    statusText.innerText = translations[currentLang].offline;
    statusText.style.color = "var(--danger)";
    statusText.classList.add('text-set');
    playerCount.innerText = "-";
    playerMax.innerText = "-";
    serverMotd.innerText = translations[currentLang].server_offline_motd;
}

// --- Join Button ---
if (joinBtn) {
    joinBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('goofyahhsmp.lol').then(() => {
            copyMsg.style.opacity = '1';
            const originalText = joinBtn.innerHTML; // Contains span
            joinBtn.innerText = translations[currentLang].copied_btn;

            setTimeout(() => {
                copyMsg.style.opacity = '0';
                // Restore original structure with lang span
                joinBtn.innerHTML = `<span data-lang-key="ip">${translations[currentLang].ip}</span>`;
            }, 2000);
        });
    });
}

// --- Mod List ---
async function renderMods() {
    if (!modGrid) return; // Only on docs page

    try {
        const response = await fetch('mods.json');
        allMods = await response.json();

        // Hide loading
        if (loadingMsg) loadingMsg.style.display = 'none';

        displayMods(allMods);

        // Setup search
        modSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allMods.filter(mod =>
                mod.name.toLowerCase().includes(query) ||
                mod.author.toLowerCase().includes(query)
            );
            displayMods(filtered);
        });

    } catch (e) {
        console.error("Failed to load mods", e);
        if (loadingMsg) loadingMsg.innerText = "Failed to load mod list.";
    }
}

function displayMods(mods) {
    modGrid.innerHTML = '';

    if (mods.length === 0) {
        modGrid.innerHTML = `<p style="text-align:center; width:100%;">${translations[currentLang].no_mods}</p>`;
        return;
    }

    mods.forEach(mod => {
        const card = document.createElement('div');
        card.className = 'mod-card';

        // Filter out generic descriptions or missing ones
        let description = mod.desc;
        if (!description || description === "A cool addition to the game.") {
            // Use styled localized text for generic placeholder
            description = `<span style="opacity: 0.6; font-style: italic;">${translations[currentLang].click_details}</span>`;
        }

        card.innerHTML = `
            <div class="mod-title">${mod.name}</div>
            <div class="mod-author">by ${mod.author}</div>
            <div class="mod-desc">${description}</div>
            <a href="${mod.url}" target="_blank" class="mod-link">${translations[currentLang].view_mod}</a>
        `;
        modGrid.appendChild(card);
    });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    // Set initial language
    updateLanguage(currentLang);

    // Event Listener for Toggle
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'fr' : 'en';
            updateLanguage(newLang);
        });
    }

    checkStatus();
});
