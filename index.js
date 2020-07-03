const fs = require('fs'); 
const { prefix, token, commands, channel } = require('./config.json');

const Discord = require('discord.js');
const client = new Discord.Client(); 

const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const players = new Map(); 

client.once('ready', () => {
	console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
  	client.user.setActivity(`a new game of Secret Hitler bot! Serving ${client.guilds.cache.size} servers.`);
});

client.on('message', async message => {
	const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
	if (!prefixRegex.test(message.content) || message.author.bot) return;
	
	const [, matchedPrefix] = message.content.match(prefixRegex);
	const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if (!commands.includes(command)) return;	

	if (command === 'newgame') {
		players.set('totalplayers', parseInt(args[0], 10));
		players.set('liberal', []);
		players.set('fascist', []);
		players.set('hitler', []);

		client.channels.cache.find(TextChannel => TextChannel.name === channel).send('A new game has begun and all party data has been cleared! DM @SecretHitlerBot your party membership using `!setparty <your party>`. DO NOT send it publicly.');
	}

	if (command === 'setparty') {
		if (message.channel.type === 'text') {
			return message.reply(`This is private information. You need to DM this instead of sending in a channel.`); 
		}

		if (!players.has(args[0])) {
			return message.author.send(`"${args[0]}" does match the three options of "liberal", "fascist" or "hitler". Please try again.`);
		}
		
		let m = players.get(args[0]); 
		m.push(message.author);
		players.set(args[0], m);	
		players.set('playersready', players.get('liberal').length + players.get('fascist').length + players.get('hitler').length);
		client.channels.cache.find(TextChannel => TextChannel.name === channel).send(`<@${message.author.id}> has set their party. ${players.get('playersready')}/${players.get('totalplayers')} have set their party.`);

		if (players.get('playersready') === players.get('totalplayers')) {
			if(!players.get('hitler').length) {
				return client.channels.cache.find(TextChannel => TextChannel.name === channel).send('No one said they were Hitler.');
			}			

			const fascists = players.get('fascist').map(a => a.username); 
						
			for (const player of players.get('fascist')) {
				client.users.cache.get(player.id).send(`These are your fellow dirty fascists: ${fascists.toString()}. Hitler is ${players.get('hitler').username}.`);
			}	

		}
	}	
});

client.login(token);
