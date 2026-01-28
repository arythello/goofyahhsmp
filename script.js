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

let allMods = [];

// --- Server Status ---
async function checkStatus() {
    if (!statusInd) return; // Only on pages with status section

    try {
        const response = await fetch('https://api.mcsrvstat.us/2/goofyahhsmp.lol');
        const data = await response.json();

        if (data.online) {
            statusInd.classList.add('online');
            statusInd.classList.remove('offline');
            statusText.innerText = "ONLINE";
            statusText.style.color = "var(--primary)";

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
    statusText.innerText = "OFFLINE";
    statusText.style.color = "var(--danger)";
    playerCount.innerText = "-";
    playerMax.innerText = "-";
    serverMotd.innerText = "Server is currently offline.";
}

// --- Join Button ---
if (joinBtn) {
    joinBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('goofyahhsmp.lol').then(() => {
            copyMsg.style.opacity = '1';
            joinBtn.innerText = "COPIED!";
            setTimeout(() => {
                copyMsg.style.opacity = '0';
                joinBtn.innerText = "IP: goofyahhsmp.lol";
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
        modGrid.innerHTML = '<p style="text-align:center; width:100%;">No mods found matching your search.</p>';
        return;
    }

    mods.forEach(mod => {
        const card = document.createElement('div');
        card.className = 'mod-card';

        // Create shortened description if missing or generic
        const description = mod.desc || "Click to view details.";

        card.innerHTML = `
            <div class="mod-title">${mod.name}</div>
            <div class="mod-author">by ${mod.author}</div>
            <div class="mod-desc">${description}</div>
            <a href="${mod.url}" target="_blank" class="mod-link">View on CurseForge &rarr;</a>
        `;
        modGrid.appendChild(card);
    });
}

// Run status check on load
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
});
