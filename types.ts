import { Message } from "./deps.ts";

export type GooeyAction 
    = "reply" 
    | "remove" 
    | "give"
    ;
export type GooeyTrigger 
    = 
    { regex: RegExp
    , action: GooeyAction
    , arg: string
    , channel: string
    , callback: (msg: Message, trigger: GooeyTrigger) => void
    };
export type GooeyWatchChannel = Map<string, GooeyTrigger>;