const Discord = require('discord.js');
require('dotenv').config();
const config = require('./config.js');

function msleep(n) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}

const client = new Discord.Client();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

const slowmode = async (message, time, channels) => {
	const channelObjs = [];
	for (const element of channels) {
		channelObjs.push(
			await client.guilds.cache
				.get(config.guildID)
				.channels.cache.get(element.substring(2, element.length - 1))
		);
	}

	await message.channel.send(
		channelObjs.length +
      ' channels will be given a ' +
      time +
      ' second slowmode.\nA confirmation message will be sent upon completion.'
	);
	channelObjs.map(async c => {
		c.setRateLimitPerUser(time)
		// .then(() => console.log(c.name + " now has slowmode."))
			.catch(error => {
				return message.channel.send('Error.\n' + error);
			});
		msleep(500);
		console.log(c.name + ' done.');
	});
	return message.channel.send(
		'<@' +
      message.author +
      '> Channels now have a ' +
      time +
      ' second slowmode.'
	);
};

client.on('message', async message => {
	const contents = message.content.split(' ');
	const cmd = contents[1];
	const args = contents.slice(2);
	if (contents[0] === config.prefix) {
		if (cmd === 'slowmode') {
			if (!message.member.hasPermission('ADMINISTRATOR')) {
				return message.channel.send(
					'You need to be an administrator to do that silly!'
				);
			}

			if (args[0] >= 0 && args[0] <= 21600) {
				return slowmode(message, args[0], args.slice(1));
			}

			return message.channel.send(
				'Argument needs to be a positive integer under 21600 (6 hours).'
			);
		}

		if (cmd === 'updateChannelStats') {
			if (message.channel.id != config.botChannelID) {
				return message.channel.send('You can\'t do that here bud. 😳');
			}

			updateChannelStats(message.member);
			return message.channel.send('Operation complete.');
		}
		/* Else if (cmd=="welcome"){
      const embed = {
        "title": "Welcome to Beyond The Five!",
       // "description": "test",
        "color": 2899536,
        "footer": {
          "icon_url": "https://beyondthefive.com/logo.png",
          "text": "We look forward to learning with you!"
        },
        "thumbnail": {
          "url": "https://beyondthefive.com/logo.png"
        },
        "author": {
          "name": "Beyond The Five",
          "url": "https://beyondthefive.com",
          "icon_url": "https://beyondthefive.com/logo.png"
        },
        "fields": [
          {
            "name": "About Us",
            "value": "Beyond The Five is a non-profit organization dedicated towards helping students from around the world pursue higher level education through **over 150 free, online, self-paced courses** ranging from AP, SAT/ACT to college-level courses.\nhttps://beyondthefive.com/courses"
          },
          {
            "name": "Registration",
            "value": "Registration for the 2020-21 school year is now open!\nhttps://beyondthefive.com/register"
          },
          {
            "name": "Verification",
            "value": "By reacting to this message with :white_check_mark:, you agree to all of the <#695982250952622141>"
          }
        ]
      };
      msg.channel.send({ embed });
    } */
	}
});

const updateChannelStats = member => {
	const count = member.guild.members.cache.filter(member => !member.user.bot)
		.size;
	member.guild.channels.cache
		.get(config.statsChannelID)
		.setName(count + ' Members')
		.then(console.log('Statistics channel updated: ' + count));
};

client.on('guildMemberAdd', async member => {
	await member.guild.channels.cache
		.get(config.joinLogID)
		.send(
			'Hi <@' +
        member.id +
        '>, welcome to Beyond The Five!\nPlease read <#715254355778994267> in order to get verified.'
		)
		.then(member.roles.add([config.eventNotify, config.courseNotify]));
	return updateChannelStats(member);
});

client.login(process.env.token);
