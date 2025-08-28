client.on('ready', async () => {
  console.clear();
  console.log(`${client.user.tag} - rich presence started!`);

  const r = new Discord.RichPresence()
    .setApplicationId('1265825059692609587')
    .setType('PLAYING')
    .setURL('https://www.twitch.tv/apparentlyjack_rl') 
    .setState('Hey Nitro is here')
    .setName('quaaxz')
    .setDetails(`Nitro is now`)
    .setStartTimestamp(Date.now())
    .setAssetsLargeImage('https://media.discordapp.net/attachments/1041035673118965772/1270521845841657907/image_2.webp')
    .setAssetsLargeText('Nitro') 
    .setAssetsSmallImage('https://media.discordapp.net/attachments/1041035673118965772/1270522062095781990/checked.png')
    .setAssetsSmallText('Small Text') 
    .addButton('Google', 'https://google.com');

  client.user.setActivity(r);
  client.user.setPresence({ status: "dnd" }); 
});

// هنا تحط التوكن مباشرة
client.login("MTIyMDc1NzYwODM0NDg1MDU0Mg.GJ5wk_.Bk5XyuHv7jBC2hm8wkyKteBTEI5lY5QnCbqv9k");
