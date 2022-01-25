import { Command,CommandContext,Global, Message } from "../deps.ts";
import { GooeyAction, GooeyTrigger } from "../types.ts";

const callback = (msg: Message, trigger: GooeyTrigger) => {
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

export class When extends Command {
    name = "when";
    async execute(ctx: CommandContext) {
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
        Global.watchedChannels.set(`${regex_str}:${channel_id}:${action}`, {
            regex: regex,
            action: action as GooeyAction,
            arg: argument,
            channel: channel_id,
            callback: callback
        });
    }
}