const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ====================================
// إعدادات المالك
// ضع هنا ID بتاعك
const ownerID = '1220757608344850542';
// ====================================

const balances = new Map();
const blacklist = new Set();

function formatVolt(amount) {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M';
    if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'k';
    return amount.toString();
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const prefix = 'v';
    const blackPrefix = '!';

    // ====================================
    // أمر البلاك ليست !Vblack للمالك فقط
    if (content.toLowerCase().startsWith(`${blackPrefix}vblack`) && message.author.id === ownerID) {
        const target = message.mentions.users.first();
        if (!target) return message.reply('حدد شخص');
        blacklist.add(target.id);
        return message.channel.send(`⚠️ ${target} تم إضافته للقائمة السوداء`);
    }

    if (!content.startsWith(prefix)) return;
    if (blacklist.has(message.author.id)) return;

    const args = content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift()?.toLowerCase();
    const target = message.mentions.users.first();

    // ====================================
    // عرض رصيد شخص آخر
    if (target && !args[0]) {
        const bal = balances.get(target.id) || 0;
        return message.channel.send(`${target} رصيده: \`\`${formatVolt(bal)} volt\`\``);
    }

    // عرض رصيدك الخاص
    if (!command) {
        const bal = balances.get(message.author.id) || 0;
        return message.channel.send(`${message.author}, رصيدك: \`\`${formatVolt(bal)} volt\`\``);
    }

    // ====================================
    // إضافة أو خصم فلوس (مالك البوت فقط)
    if ((command === 'add' || command === 'remove') && message.author.id === ownerID) {
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[1]);
        if (!targetUser || !amount || amount <= 0) return message.reply('حدد شخص صحيح والمبلغ');

        const current = balances.get(targetUser.id) || 0;

        if (command === 'add') {
            balances.set(targetUser.id, current + amount);
            return message.channel.send(`✅ تم إضافة \`\`${formatVolt(amount)} volt\`\` لـ ${targetUser}`);
        } else if (command === 'remove') {
            const newBal = Math.max(current - amount, 0);
            balances.set(targetUser.id, newBal);
            return message.channel.send(`⚠️ تم خصم \`\`${formatVolt(amount)} volt\`\` من ${targetUser}`);
        }
    }

    // ====================================
    // تحويل فلوس
    if (target && args[0] && !['add', 'remove'].includes(command)) {
        const amount = parseInt(args[0]);
        if (!amount || amount <= 0) return message.reply('حدد مبلغ صحيح للتحويل');

        // شرط الحساب أكبر من شهر
        const created = message.author.createdAt;
        if (Date.now() - created.getTime() < 30 * 24 * 60 * 60 * 1000)
            return message.reply('حسابك لازم يكون أكتر من شهر عشان تحول');

        const senderBal = balances.get(message.author.id) || 0;
        if (senderBal < amount) return message.reply('رصيدك مش كفاية');

        const confirmMsg = await message.channel.send(
            `${message.author}, هل انت متأكد انك عايز تحوّل \`\`${formatVolt(amount)} volt\`\` لـ ${target}? اكتب "نعم" للتأكيد`
        );

        const filter = m => m.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', m => {
            if (m.content.toLowerCase() === 'نعم') {
                const targetBal = balances.get(target.id) || 0;
                balances.set(message.author.id, senderBal - amount);
                balances.set(target.id, targetBal + amount);
                message.channel.send(`✅ تم تحويل \`\`${formatVolt(amount)} volt\`\` لـ ${target}`);
            } else {
                message.channel.send('❌ تم إلغاء التحويل');
            }
        });
    }
});

// ضع التوكن هنا لتشغيل البوت
client.login('MTMwMTU1MTkyODkzMjgyNzE4MA.GLIyg9.NmNhHgBGc-xpsiM0oq_2g-OkbUiEU9CsCnU7oY');
