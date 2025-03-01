require('dotenv').config(); // Load .env variables

const { Client } = require('discord.js-selfbot-v13');
const client = new Client({
    checkUpdate: false
});

const OWNER_ID = process.env.OWNER_ID;
const AUTO_REACT_IDS = (process.env.AUTO_REACT_IDS || '').split(',').filter(id => id);

// GIF Link for the status
const gifStatus = "https://tenor.com/view/hacker-gif-19246062";

client.on('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);

    try {
        client.user.setActivity("By mamouni_1xp", {
            type: "LISTENING",
            url: gifStatus
        });
        console.log(`✅ Status`);
    } catch (error) {
        console.error("❌ Error setting status:", error);
    }
});


// list dyal repley li yla xi 7ed ktebhom lbot kayjaweb 3lihom
const autoReplies = {
    "mamouni1xp": "chokran 3la lmov 😍",
};

// Store user-emoji pairs
const userEmojis = new Map();
const defaultEmoji = "<:Logo_team_spirit:1201067260089991178>";

client.on('messageCreate', async (message) => {
    if (message.author.id === client.user.id) return;

    // hada kaydir sp rea 3la ids li rat7et fIDs
    if (message.author.id === OWNER_ID || AUTO_REACT_IDS.includes(message.author.id)) {
        await message.react('🫦');
    }

    // Auto-reply based on specific keywords
    for (const [trigger, reply] of Object.entries(autoReplies)) {
        if (message.content.toLowerCase().includes(trigger)) {
            await message.reply(reply);
        }
    }

    // Auto-react to specific users
    if (userEmojis.has(message.author.id)) {
        await message.react(userEmojis.get(message.author.id));
    }

 

client.on('messageCreate', async (message) => {
    if (message.content === '!3aweni') {
        const helpText = `
        **📜 قائمة الأوامر:**
        
        **🎭 الأوتو رياكشن**
        \`!zidd @user [emoji]\` - إضافة مستخدم إلى قائمة التفاعل التلقائي مع إيموجي مخصص.
        \`!kherej @user\` - إزالة مستخدم من قائمة التفاعل التلقائي.
        \`!lista\` - عرض قائمة المستخدمين مع الإيموجيات المخصصة.

        **💬 الردود التلقائية**
        \`!jaweb [النص]\` - تغيير رد البوت عند ذكر صاحب البوت.
        \`!mon/of\` - تشغيل/إيقاف رد البوت عند ذكر صاحب البوت.

        **🤖 وظائف أخرى**
        - يقوم البوت بالتفاعل تلقائيًا مع رسائل أشخاص محددين بإيموجي 🫦.
        - يرد البوت على كلمات محددة مثل "mamouni1xp".
        - إذا تم ذكر البوت، فسيقوم بالرد بـ "3endek ratakel ma3endekx maratakelx".
        
        **👑 المالك فقط:** بعض الأوامر تعمل فقط لصاحب البوت.
        `;
        await message.channel.send(helpText);
    }
});

// Commands for managing user-emoji list
client.on('messageCreate', async (message) => {
    if (message.author.id !== OWNER_ID) return;

    if (message.content.startsWith('!zidd')) {
        const user = message.mentions.users.first();
        const customEmoji = message.content.split(' ')[2] || defaultEmoji;

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
            const userList = Array.from(userEmojis.entries())
                .map(([userId, emoji]) => `<@${userId}> → ${emoji}`);
            await message.channel.send(`✅ قائمة المستخدمين وايموجياتهم:\n` + userList.join("\n"));
        }
    }
});

// Custom responses & owner mention handling
let ownerTagResponse = "hawa sidi baki jay l3endek";
let ownerMentionEnabled = true;

client.on('messageCreate', async (message) => {
    if (message.author.id === client.user.id) return;

    if (message.content.startsWith('!jaweb') && message.author.id === OWNER_ID) {
        const newResponse = message.content.slice('!jaweb'.length).trim();
        if (newResponse) {
            ownerTagResponse = newResponse;
            await message.reply(`✅ تم تغيير الرد إلى: ${newResponse}`);
        } else {
            await message.reply("⚠️ الرجاء كتابة الرد الجديد. مثال: !jaweb مشغول حاليا");
        }
    }

    if (message.content === '!mon/of' && message.author.id === OWNER_ID) {
        ownerMentionEnabled = !ownerMentionEnabled;
        await message.reply(`✅ Owner mention responses are now ${ownerMentionEnabled ? 'enabled' : 'disabled'}`);
    }

   

    // Handle owner mention
    if (message.mentions.has(OWNER_ID) && ownerMentionEnabled) {
        await message.reply(ownerTagResponse);
    }
});

// Log in using the token from .env
client.login(process.env.DISCORD_TOKEN);
