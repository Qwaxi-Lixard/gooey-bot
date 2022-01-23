import {
  event,
  CommandClient,
  command,
  CommandContext,
  GatewayIntents,
  Message
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


class Gooey extends CommandClient {
    constructor() {
        super({
            prefix: ["hey gooey ", "hey gooey, "],
            caseSensitive: false
        });
    }

    @event()
    ready(): void {
        console.log(`Logged in as ${this.user?.tag}!`);
    }

    @event()
    messageCreate(msg: Message): void {
        if (msg.author.id !== this.user?.id) {
            if (msg.content.toLowerCase().startsWith("hey gooey")){
                msg.channel.send(speak());
            }
        }
    }
    
    @command()
    speak(ctx: CommandContext): void {
        ctx.channel.send(speak());
    }
}


new Gooey().connect(Deno.env.get('BOT_TOKEN'), [
    GatewayIntents.DIRECT_MESSAGES,
    GatewayIntents.GUILDS,
    GatewayIntents.GUILD_MESSAGES
]);