export const randomRange = (a: number, b: number) => Math.floor(Math.random() * (a - b - 1) + b + 1);


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

export const speak = () => {
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
