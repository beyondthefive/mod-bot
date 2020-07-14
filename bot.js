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
		/* Else if (cmd === "uw") {
      if (message.channel.id != config.botChannelID) {
        return message.channel.send("You can't do that here bud. 😳");
      }
      const e = {
        title: "Welcome to Beyond The Five!",
        color: 2899536,
        footer: {
          icon_url: "https://beyondthefive.org/logo.png",
          text: "We look forward to learning with you!",
        },
        thumbnail: {
          url: "https://beyondthefive.org/logo.png",
        },
        author: {
          name: "Beyond The Five",
          url: "https://beyondthefive.org",
          icon_url: "https://beyondthefive.org/logo.png",
        },
        fields: [
          {
            name: "About Us",
            value:
              "Beyond The Five is a non-profit organization dedicated towards helping students from around the world pursue higher level education through **over 150 free, online, self-paced courses** ranging from AP, SAT/ACT to college-level courses.\nhttps://beyondthefive.org/courses",
          },
          {
            name: "Registration",
            value:
              "Registration for the 2020-21 school year is now open!\nhttps://beyondthefive.org/register",
          },
          {
            name: "Verification",
            value:
              "By reacting to this message with :white_check_mark:, you agree to all of the <#695982250952622141>",
          },
        ],
      };

      const m = await message.guild.channels.cache
        .get("715254355778994267")
		.messages.fetch("715704063010013214");
		 console.log(m.embeds[0].fields[0] = "Test")
		 return m.edit(new Discord.MessageEmbed(e));

    } */
		/* else if (cmd=="rules"){
      const embed = {
        "title": "Beyond The Five Community Guidelines & Rules",

        "color": 2899536,

        "author": {
          "name": "Beyond The Five",
          "url": "https://beyondthefive.org",
          "icon_url": "https://beyondthefive.org/logo.png"
        },
        "fields": [
          {
            "name": "Rule 1",
            "value": "Respect all of your other students, teachers, and staff members."
          },
          {
            "name": "Rule 2",
            "value": "The sharing of illegal and copyrighted content is forbidden."
          },{
            "name": "Rule 3",
            "value": "Do not talk about anything that others may find offensive or uncomfortable. The sharing of inappropriate or NSFW content is strictly forbidden. Controversial topics, including current evolving situations and politics, can be discussed as long as it’s civil."
          },{
            "name": "Rule 4",
            "value": "Keep topics in their respective channels."
          },{
            "name": "Rule 5",
            "value": "Advertising, links, and all other types of promotion must be approved by the Management Team and/or Administrator."
          },{
            "name": "Rule 6",
            "value": "All decisions made by staff are final. You may appeal and question a decision by contacting an Administrator."
          },{
            "name": "Rule 7",
            "value": "Abide by Discord’s Terms of Service: https://discord.com/new/terms"
		  },
		  {
            "name": "Questions?",
            "value": "If you have any questions about these rules, please ask in <#695982619917025300>."
          },
        ]
      };
      await message.channel.send({ embed });
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
