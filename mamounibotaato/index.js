require('dotenv').config(); // Load .env variables

const { Client } = require('discord.js-selfbot-v13');
const client = new Client({ checkUpdate: false });

const OWNER_ID = process.env.OWNER_ID;
const AUTO_REACT_IDS = (process.env.AUTO_REACT_IDS || '').split(',').filter(id => id);
const gifStatus = "https://tenor.com/view/hacker-gif-19246062";

// Store user-emoji pairs
const userEmojis = new Map();
const defaultEmoji = "<:Logo_team_spirit:1201067260089991178>";

const autoReplies = {
    "mamouni1xp": "chokran 3la lmov 😍",
};

// Owner mention response
let ownerTagResponse = "hawa sidi baki jay l3endek";
let ownerMentionEnabled = true;

// Prevent duplicate message events
client.removeAllListeners('messageCreate');

// Bot Ready Event
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    try {
        client.user.setActivity("By mamouni_1xp", { 
            type: "STREAMING", 
            url: "https://www.twitch.tv/mamouni_1xp" 
        });
        console.log(`✅ Status set to Streaming`);
    } catch (error) {
        console.error("❌ Error setting status:", error);
    }
});

// Unified Message Event
client.on('messageCreate', async (message) => {
    if (message.author.id === client.user.id) return;

    if (message.author.id === OWNER_ID || AUTO_REACT_IDS.includes(message.author.id)) {
        try {
            await message.react('🫦');
        } catch (err) {
            console.error("❌ Error reacting to message:", err);
        }
    }

    for (const [trigger, reply] of Object.entries(autoReplies)) {
        if (message.content.toLowerCase().includes(trigger)) {
            try {
                await message.reply(reply);
                break;
            } catch (err) {
                console.error("❌ Error replying:", err);
            }
        }
    }

    if (userEmojis.has(message.author.id)) {
        try {
            await message.react(userEmojis.get(message.author.id));
        } catch (err) {
            console.error("❌ Error reacting with custom emoji:", err);
        }
    }

    if (message.mentions.has(OWNER_ID) && ownerMentionEnabled) {
        try {
            await message.reply(ownerTagResponse);
        } catch (err) {
            console.error("❌ Error replying to mention:", err);
        }
    }
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("❌ Login failed:", err);
    process.exit(1);
});
