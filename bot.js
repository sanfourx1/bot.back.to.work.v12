require('dotenv').config(); // Load .env variables
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { Client } = require('discord.js-selfbot-v13');
const client = new Client({
    checkUpdate: false,
    intents: ["GUILDS", "GUILD_MESSAGES", "MESSAGE_CONTENT"]
});

const OWNER_ID = process.env.OWNER_ID;
const AUTO_REACT_IDS = (process.env.AUTO_REACT_IDS || '').split(',').map(id => id.trim()).filter(Boolean);
client.on('messageCreate', async (message) => {
    if (message.author.id === client.user.id) return; // Ignore bot's own messages

    // Help Command
    if (message.content === '!3aweni') {
        const helpMessage = `
        **📜 قائمة الأوامر:**  
        - \`!zidd @user emoji\` → إضافة ايموجي لشخص معين  
        - \`!kherej @user\` → إزالة شخص من قائمة التفاعل التلقائي  
        - \`!lista\` → عرض قائمة الأشخاص و ايموجياتهم  
        - \`!ajivc [channel_id]\` → إدخال البوت لغرفة صوتية  
        - \`!9ewedvc\` → إخراج البوت من الغرفة الصوتية  
        - \`!3aweni\` → عرض هذه القائمة  
        `;
        await message.channel.send(helpMessage);
    }

    // Rest of your existing commands...
});


// Store user-emoji pairs
const userEmojis = new Map();
const defaultEmoji = "<:Logo_team_spirit:1201067260089991178>";

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

// List of automatic replies
const autoReplies = {
    "mamouni1xp": "# chokran 3la lmov 😍",
};

client.on('messageCreate', async (message) => {
    if (message.author.id === client.user.id) return; // Ignore bot's own messages

    // Auto-react to specified IDs
    if (message.author.id === OWNER_ID || AUTO_REACT_IDS.includes(message.author.id)) {
        try {
            await message.react('🫦');
        } catch (error) {
            console.error(`❌ Failed to react in ${message.guild?.name || 'DMs'}:`, error);
        }
    }

    // Auto-reply based on specific keywords
    for (const [trigger, reply] of Object.entries(autoReplies)) {
        if (message.content.toLowerCase().includes(trigger)) {
            await message.reply(reply);
        }
    }

    // Auto-react to specific users
    if (userEmojis.has(message.author.id)) {
        try {
            await message.react(userEmojis.get(message.author.id));
        } catch (error) {
            console.error(`❌ Failed to react to ${message.author.tag}:`, error);
        }
    }

    // Commands for managing user-emoji list
    if (message.author.id === OWNER_ID) {
        if (message.content.startsWith('!zidd')) {
            const user = message.mentions.users.first();
            const customEmoji = message.content.split(' ')[2] || '😎'; // Default emoji

            if (user) {
                userEmojis.set(user.id, customEmoji);
                await message.channel.send(`✅ تمت إضافة ${user.tag} مع الايموجي ${customEmoji}`);
            } else {
                await message.channel.send("⚠️ لم يتم تحديد المستخدم.");
            }
        }

        if (message.content.startsWith('!kherej')) {
            const user = message.mentions.users.first();
            if (user && userEmojis.has(user.id)) {
                userEmojis.delete(user.id);
                await message.channel.send(`❌ تمت إزالة ${user.tag} من قائمة التفاعل التلقائي.`);
            } else {
                await message.channel.send("⚠️ هذا المستخدم غير موجود في القائمة.");
            }
        }

        if (message.content.startsWith('!lista')) {
            if (userEmojis.size === 0) {
                await message.channel.send("⚠️ لا يوجد مستخدمون في قائمة التفاعل التلقائي.");
            } else {
                const userList = [...userEmojis.entries()]
                    .map(([userId, emoji]) => `<@${userId}> → ${emoji}`)
                    .join("\n");
                await message.channel.send(`✅ قائمة المستخدمين وايموجياتهم:\n${userList}`);
            }
        }
    }

    // Command to make the bot join a VC channel (e.g., !ajivc [channel_id])
    if (message.content.startsWith('!ajivc')) {
        if (message.author.id === OWNER_ID) {
            const args = message.content.split(' ')[1]; // Get the channel ID
            if (args) {
                const channel = message.guild.channels.cache.get(args);
                if (channel && channel.type === 2) { // Check if it's a voice channel
                    try {
                        joinVoiceChannel({
                            channelId: channel.id,
                            guildId: message.guild.id,
                            adapterCreator: message.guild.voiceAdapterCreator,
                        });
                        await message.reply(`✅ Bot has joined the voice channel: ${channel.name}`);
                    } catch (error) {
                        console.error('Error joining VC:', error);
                        await message.reply('❌ Failed to join the voice channel.');
                    }
                } else {
                    await message.reply('⚠️ Invalid voice channel ID.');
                }
            } else {
                await message.reply('⚠️ Please provide a valid voice channel ID.');
            }
        }
    }

    // Command to make the bot leave the VC channel (e.g., !9ewedvc)
    if (message.content === '!9ewedvc') {
        if (message.author.id === OWNER_ID) {
            const connection = getVoiceConnection(message.guild.id);
            if (connection) {
                connection.destroy(); // Disconnect the bot from the voice channel
                await message.reply('✅ Bot has left the voice channel.');
            } else {
                await message.reply('⚠️ Bot is not connected to any voice channel.');
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("❌ Login failed:", err);
    process.exit(1);
});
