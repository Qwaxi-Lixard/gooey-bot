import { GooeyTrigger } from './deps.ts';

export const Global = {
    watchedChannels: new Map<string, GooeyTrigger>(),
    triggers: new Map<string, GooeyTrigger>()
};
