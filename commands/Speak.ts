import { Command,CommandContext } from "../deps.ts";
import { speak } from "../utils.ts";

export class Speak extends Command {
    name = "speak";
    
    execute(ctx: CommandContext): void {
        ctx.channel.send(speak());
        
    }
}