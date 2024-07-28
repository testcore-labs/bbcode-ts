import xss from "xss";

class bbcode {
  opening: string;
  closing: string;
  tag_name_rgx: string;

  tags: Record<string, { desc: string, func: (txt: string, params: {[key: string]: string}) => string }>;


  constructor(opening = "[", closing = "]") {
    this.opening = opening;
    this.closing = closing;
    this.tag_name_rgx = `[\\w-]+`;
    this.tags = {
      "b": {
        desc: "makes text bold",
        func: (txt: string) => `<b>${txt}</b>`
      },
      "i": {
        desc: "makes text italic",
        func: (txt: string) => `<i>${txt}</i>`
      },
      "c": {
        desc: "makes text colorful",
        func: (txt: string, params) => {
          let color = params["color"] || "";
          return `<span style="color: ${color};">${txt}</span>`;
        }
      }
    };
  }

  custom_tag(name: string, desc: string, fn: (txt: string, params: {[key: string]: string}) => string) {
    if(this.tags[name]) {
      return new Error("name is already taken for custom tag");
    } else {
      this.tags[name] = {
        desc: desc,
        func: fn
      }
      return true;
    }
  }

  get_regex() {
    const open_tag = `\\${this.opening}`;
    const close_tag = `\\${this.closing}`;
    const tag_name_rgx = `(${this.tag_name_rgx})`

    const params_rgx = `((?:\\s+\\w+(?:\\s*=\\s*(?:"[^"]*"|\\w+))?)*)\\s*`;
    const open_tag_rgx = `(${open_tag}${tag_name_rgx}${params_rgx}${close_tag})`;
    const content_rgx = `(.*?)`;
    const close_tag_rgx = `(${open_tag}\/${tag_name_rgx}${close_tag})`;

    return new RegExp(`${open_tag_rgx}${content_rgx}${close_tag_rgx}`, 'gs');
  }
  
  parse_params(params_str: string) {
    const params: Record<string, string> = {};
    const param_rgx = /(\w+)\s*=\s*("[^"]*"|\w+)/g;
    let match;
    while((match = param_rgx.exec(params_str)) !== null) {
      params[match[1]] = xss(match[2].replace(/"/g, ''));
    }
    return params;
  }

  parser(text: string) {
    const regex = this.get_regex();
    let match;
    const results = [];
    while((match = regex.exec(text)) !== null) {
      const params = this.parse_params(match[3]);
      if(match[2].toLowerCase() === match[6].toLowerCase()) {
        results.push({
          full_match: match[0],
          opening_tag_raw: match[1],
          opening_tag: match[2],
          params: params,
          content: match[4],
          closing_tag_raw: match[5],
          closing_tag: match[6],
          tag_name: match[2]
        });
      }
    }
    return results;
  }

  parse(text: string, allowed_tags = ["b", "i"]) {
    let parsed_text = this.parser(text);
    let result = text;
    
    parsed_text.forEach(({ full_match, tag_name, content, params }) => {
      const tag = this.tags[tag_name.toLowerCase()];
      if(tag && allowed_tags.indexOf(tag_name)) {
        const replacement = tag.func(xss(content), params);
        result = result.replace(full_match, replacement);
      }
    });

    return result;
  }
}

export default bbcode;