import xss from "xss";

class bbcode {
  opening: string;
  closing: string;
  tag_name_rgx: string;

  tags: Record<string, { desc: string, example: string, func: (txt: string, params: {[key: string]: string}) => string }>;
  allowed_tags: string[];


  constructor(opening = "[", closing = "]") {
    this.opening = opening;
    this.closing = closing;
    this.tag_name_rgx = `[\\w-]+`;
    this.tags = {
      "b": {
        desc: "makes text bold",
        example: "",
        func: (txt: string) => `<b>${txt}</b>`
      },
      "i": {
        desc: "makes text italic",
        example: "",
        func: (txt: string) => `<i>${txt}</i>`
      },
      "d": {
        desc: "makes text have a strike through it",
        example: "",
        func: (txt: string) => `<del>${txt}</del>`
      },
      "u": {
        desc: "makes text have an underline",
        example: "",
        func: (txt: string) => `<ins>${txt}</ins>`
      },
      "a": {
        desc: "makes a link",
        example: "",
        func: (txt: string, params) => {
          let url = params["url"] || "";
          return `<a href="${ url }">${txt}</a>`
        }
      },
      "img": {
        desc: "makes a link",
        example: "",
        func: (txt: string, params) => {
          let img = params["src"] || "";
          return `<img src="${ img }" alt="${txt}">`
        }
      },
      "c": {
        desc: "makes text colorful",
        example: "",
        func: (txt: string, params) => {
          let color = params["color"] || "";
          return `<span style="color: ${color};">${txt}</span>`;
        }
      }
    };
    this.allowed_tags = Object.keys(this.tags);
  }

  private tagify_example(example: string) {
    example.replaceAll("[", this.opening);
    example.replaceAll("]", this.closing);
    return example;
  }

  /**
  * adds a custom tag
  */
  custom_tag(name: string, desc: string, fn: (txt: string, params: {[key: string]: string}) => string, example: string) {
    if(this.tags[name]) {
      return new Error("name is already taken for custom tag");
    } else {
      this.tags[name] = {
        desc: desc,
        example: example,
        func: fn
      }
      return true;
    }
  }
  
  /**
  * gets all tags that are allowed from `this.allowed_tags` in `this.tags`
  */
  get_tags() {
    let sorted_tags: Record<string, { desc: string, example: string, func: (txt: string, params: {[key: string]: string}) => string }> = {};
    Object.entries(this.allowed_tags).forEach(([_tag_key, tag_value]) => {
      if(this.tags[tag_value]) {
        sorted_tags[tag_value] = this.tags[tag_value];
      }
    });

    Object.entries(sorted_tags).forEach(([tag_key, tag]) => {
      tag.example = this.tagify_example(tag.example);
    })
    return sorted_tags;
  }

  private get_regex() {
    const open_tag = `\\${this.opening}`;
    const close_tag = `\\${this.closing}`;
    const tag_name_rgx = `(${this.tag_name_rgx})`

    const params_rgx = `((?:\\s+\\w+(?:\\s*=\\s*(?:"[^"]*"|\\w+))?)*)\\s*`;
    const open_tag_rgx = `(${open_tag}${tag_name_rgx}${params_rgx}${close_tag})`;
    const content_rgx = `(.*?)`;
    const close_tag_rgx = `(${open_tag}\/${tag_name_rgx}${close_tag})`;

    return new RegExp(`${open_tag_rgx}${content_rgx}${close_tag_rgx}`, 'gs');
  }
  
  private parse_params(params_str: string) {
    const params: Record<string, string> = {};
    const param_rgx = /(\w+)\s*=\s*("[^"]*"|\w+)/g;
    let match;
    while((match = param_rgx.exec(params_str)) !== null) {
      params[match[1]] = xss(match[2].replace(/"/g, ''));
    }
    return params;
  }

  private parser(text: string) {
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

  /**
  * parses BBCode and returns a value (primarily HTML)
  */
  parse(text: string) {
    let parsed_text = this.parser(text);
    let result = text;
    
    parsed_text.forEach(({ full_match, tag_name, content, params }) => {
      const tag = this.tags[tag_name.toLowerCase()];
      if(tag && this.allowed_tags.indexOf(tag_name)) {
        const replacement = tag.func(xss(content), params);
        result = result.replace(full_match, replacement);
      }
    });

    return result;
  }
}

export default bbcode;