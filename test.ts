import bbcode from "./index";

const bbcode_ = new bbcode();
bbcode_.custom_tag("rainbow", "makes text look like a rainbow", (txt: string) => {
  const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
  
  const color_text = txt.split('').map((letter, index) => {
    const color = colors[index % colors.length];
    return `<span style="color: ${color};">${letter}</span>`;
  }).join('');
  
  return color_text;
});
const text = "[b]im bold[/b] and [i]im italic[/i] along with [c color=\"#fff\" ishouldntbe=parsed]colorful[/c] [rainbow]textttt[/rainbow]";
const res = await bbcode_.parse(text);

console.log(res);
