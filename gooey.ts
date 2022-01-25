import {
  event,
  CommandClient,
  command,
  CommandContext,
  GatewayIntents,
  Message,
  PermissionFlags
} from './deps.ts'

/*
Plan:
    - Gooey will respond to "hey gooey, [command]". It is not case sensitve
    - Gooey will handle the varify yourself channel by reading messages and applying the regex:
            (?:1[89]|[2-9][0-9]{1,2})
      When a match is made, Gooey will remove the [restricted] role from the user

    - Gooey will handle role boards using the following format:
        Hey Gooey, role menu
        Menu Name
        :emoji_a: @Role A
        :emoji_b: @Role B
        :emoji_c: @Role C
        ...
*/


const wordSets: { [index: string]: string[] } = {
    "long": ["goop", "gaup", "geep"],
    "short": ["gip", "gep", "gahp"],
    "open": ["aup", "oop", "eep", "aup"],
    "blip": ["a", "e", "i"],
}

const bits = [
    ["short"],
    ["long"],
    ["long", "open"],
    ["short", "open"],
    ["blip", "long"],
    ["blip", "short"],
]


const randomRange = (a: number, b: number) => Math.floor(Math.random() * (a - b - 1) + b + 1);


const speak = () => {
    const length = randomRange(3, 7);
    const sentence: string[] = [];
    const gibberish: string[] = [];

    for (let i = 0; i < length; i++) {
        for (const bit of bits[randomRange(0, bits.length - 1)]) {
            sentence.push(bit);
        }
    }

    for (const bit of sentence) {
        const words = wordSets[bit]
        gibberish.push(words[randomRange(0, words.length - 1)]);
    }

    if (Math.random() > 0.75){
        gibberish[gibberish.length - 1] += ["~", "!", "?"][randomRange(0, 3)];
    }

    return gibberish.join(" ");
}

type WatchedChannel = { 
    channel: string,
    regex: string
};

type GooeyAction = "reply" | "remove" | "give"
type GooeyTrigger = { regex: RegExp, action: GooeyAction, arg: string, channel: string }

class Gooey extends CommandClient {
    static watchedChannels: Map<string,GooeyTrigger> = new Map();


    constructor() {
        super({
            prefix: ["hey gooey "],
            caseSensitive: false,
        });
    }


    @event()
    ready(): void {
        console.log(`Logged in as ${this.user?.tag}!`);
        Gooey.watchedChannels = new Map();
    }


    @event()
    messageCreate(msg: Message): void {
        // Ignore messages from myself
        if (msg.author.id === this.user?.id) 
            return


        if (msg.content.toLowerCase() === "hey gooey"){
            msg.channel.send(speak());
        }    

        for (const [_, trigger] of Gooey.watchedChannels) {
            console.log(trigger);
            if (msg.channelID === trigger.channel && msg.content.match(trigger.regex)){
                switch (trigger.action) {
                    case "give":
                        msg.member?.roles.add(trigger.arg);
                        msg.reply("Goop goop!")
                        break;

                    case "remove":
                        msg.member?.roles.remove(trigger.arg);
                        msg.reply("Gloop gloop~ *absorbs your role*")
                        break;
                    
                    case "reply":
                        msg.reply(trigger.arg);
                        break;
                }
            }
        }

        console.log(Gooey.watchedChannels);
        console.log(`echo: ${msg.content}`);
        console.log(`echo: ${msg.channelID}`)
    }
    

    @command({name: "speak"})
    Speak(ctx: CommandContext): void {
        ctx.channel.send(speak());
    }


    /*
        Formate:
            Hey gooey, when [regex] in [channel] reply [message]
            Hey gooey, when [regex] in [channel] [remove|give] [role]
    */
    @command({name: "when", userPermissions: ["ADMINISTRATOR"]})
    async when(ctx: CommandContext): Promise<void> {
        const message = ctx.message.content;
        const result = message.match(/[HEYGOheygo ,]* when (.+) in \<\#([0-9]+)\> (remove|reply|give) (.+)/);

        if (result === null) {
           ctx.channel.send("Gooey? (Request isn't in correct formate...)")
            return;
        }
        
        const regex_str = result[1];
        const channel_id = result[2];
        const action = result[3];
        let argument = result[4];

        let regex: RegExp|null = null;
        try {
            regex = new RegExp(`^${regex_str}$`);
        } catch (_) {
            ctx.channel.send("Gooey? (This regex is broken...)");
            return;
        }

        const guild = ctx.guild;
        if (!await guild?.channels.get(channel_id)) {
            ctx.channel.send(`Gooey? (I can't find any channel with ${channel_id}...)`);
            return;
        }

        if (action === "give" || action === "remove") {
            argument = argument.match(/<@&([0-9]+)>/)![1];
            
            if (!await guild?.roles.get(argument)) {
                ctx.channel.send(`Gooey? (I can't find any role with ${argument}...)`);
                return;
            }
        } 
        

        await ctx.channel.send("Gooey!");
        Gooey.watchedChannels.set(`${regex_str}:${channel_id}:${action}`, {
            regex: regex,
            action: action as GooeyAction,
            arg: argument,
            channel: channel_id
        });
    }

    /*
        Forms:
            hey gooey what is your todo list?
    */
    @command({name: "what"})
    async what(ctx: CommandContext): Promise<void> {

    }

    @command({name: "stop"})
    async stop(ctx: CommandContext): Promise<void> {

    }

}


new Gooey().connect(Deno.env.get('BOT_TOKEN'), [
    GatewayIntents.DIRECT_MESSAGES,
    GatewayIntents.GUILDS,
    GatewayIntents.GUILD_MESSAGES
]);