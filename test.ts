import bbcode from "./index";

const bbcode_ = new bbcode();
bbcode_.allowed_tags = [];
bbcode_.allowed_tags.push("b");
bbcode_.custom_tag("rainbow", "makes text look like a rainbow", (txt: string) => {
  const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
  
  const color_text = txt.split('').map((letter, index) => {
    const color = colors[index % colors.length];
    return `<span style="color: ${color};">${letter}</span>`;
  }).join('');
  
  return color_text;
}, "[rainbow]text[/rainbow]");
// [ and ] will get replaced if you call all tags from bbcode_.get_tags()
const text = "[b]im bold[/b] and [i]im italic[/i]\nalong with \n[c color=\"#fff\" ishouldntbe=parsed]colorful[/c] \n[rainbow]textttt[/rainbow]";
const res = bbcode_.parse(text);

console.log(res);
console.log(bbcode_.get_tags());
