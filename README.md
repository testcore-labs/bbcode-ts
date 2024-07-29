# bbcode-ts
bbcode parser written in Typescript.

## how to install
run `bun add github:testcore-labs/bbcode-ts` to add via bun\
OR\
run `npm install bbcode-ts` to install via npm

## how to use
first you have to import bbcode, then init a new `bbcode` class
```ts
import bbcode from "bbcode-ts";

const bbcode_ = newbbcode("[", "]"); // custom brackets

// there are currently 3 built in tags: b (bold), i (italic, and c (color)
console.log(bbcode_.parse("[b]im bold[/b]");
console.log(bbcode_.parse("[i]im italic[/i]");
console.log(bbcode_.parse("[c color="#0000ff"]im blue[/c]");

// this is how you add a custom tag
bbcode_.custom_tag("rainbow", "makes text look like a rainbow", (txt: string) => {
  const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
  
  const color_text = txt.split('').map((letter, index) => {
    const color = colors[index % colors.length];
    return `<span style="color: ${color};">${letter}</span>`;
  }).join('');
  
  return color_text;
});

console.log(bbcode_.parse("[rainbow]textttt[/rainbow]"));
```
