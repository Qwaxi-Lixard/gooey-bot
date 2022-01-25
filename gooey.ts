import { Speak } from "./commands/Speak.ts";
import { When } from "./commands/when.ts";
import {
  CommandClient,
  GatewayIntents,
  Global} from './deps.ts'

import { speak } from "./utils.ts";


const gooey = new CommandClient({ prefix: "hey gooey "});


gooey.on('ready', () => {
    console.log(`Logged in as ${gooey.user?.tag}!`);
});


gooey.on('messageCreate', (msg) => {
    // Ignore messages from myself
    if (msg.author.id === gooey.user?.id) 
        return

    if (msg.content.toLowerCase() === "hey gooey"){
        msg.channel.send(speak());
    }    

    for (const [_, trigger] of Global.watchedChannels) {
        console.log(trigger);
        if (msg.channelID === trigger.channel && msg.content.match(trigger.regex)){
            trigger.callback(msg, trigger);
        }
    }

    console.log(Global.watchedChannels);
    console.log(`echo: ${msg.content}`);
    console.log(`echo: ${msg.channelID}`)
})


gooey.commands.add(When);
gooey.commands.add(Speak);

gooey.connect(Deno.env.get('BOT_TOKEN'), [
    GatewayIntents.DIRECT_MESSAGES,
    GatewayIntents.GUILDS,
    GatewayIntents.GUILD_MESSAGES
]);