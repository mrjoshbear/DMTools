import { toTitleCase } from './textUtils'

class Buckets {
  private pattern = /\[(\w|:)*\]/;
  private guardPattern = /[^A-Za-z0-9:_]/;
  private auditPattern = /\[(\w|:)*\]/g;
  private data: Map<string, string[]> = new Map();
  private used: Map<string, string[]> = new Map();

  private resetUsed(): void {
    this.used = new Map();
  }

  private randIntInRange(min: number, max: number): number {
    // Stryker disable next-line ArithmeticOperator
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private lookup(key: string): string[] {
    const list: string[] | undefined = this.data.get(key);
    if (!list) {
      throw new Error(`Buckets Error: No entry for key ${key}`);
    }
    return list;
  }

  private choose(list: string[]): string {
    return list[this.randIntInRange(0, list.length-1)];
  }

  private choose2(list: string[], joiner = ' and '): string {
    if (list.length < 2) {
      throw new Error('Buckets Error: cannot choose2 from a list with less than two options');
    }
    const first: string = this.choose(list);
    let second: string = first;
    while (first === second) {
      second = this.choose(list);
    }
    return `${first}${joiner}${second}`;
  }

  private chooseUnique(key: string): string {
    // Stryker disable next-line OptionalChaining
    if (this.used.get(key)?.length === this.data.get(key)?.length) {
      throw new Error(`Buckets Error: cannot choose more unique values than exist for key '${key}'`);
    }
    let val: string;
    do {
       val = this.choose(this.lookup(key));
    } while (this.used.get(key)?.includes(val))
    if (this.used.has(key)) {
      // Stryker disable next-line OptionalChaining
      this.used.get(key)?.push(val);
    } else {
      this.used.set(key, [val]);
    }
    return val;
  }

  private replacer(match: string): string {
    const key: string = match.substring(1,match.length-1);
    const parts = key.split(':');
    if (parts.length > 1) {
      switch (parts[0]) {
          case 'uc': return this.choose(this.lookup(parts[1])).toUpperCase();
          case 'lc': return this.choose(this.lookup(parts[1])).toLowerCase();
          case 'tc': return toTitleCase(this.choose(this.lookup(parts[1])));
          case 'two': return this.choose2(this.lookup(parts[1]), parts[2]);
          case 'uniq': return this.chooseUnique(parts[1]);
          default:
            throw new Error(`Buckets Error: unkown prefix symbol '${parts[0]}'`);
      }
    }
    return this.choose(this.lookup(key));
  }
  
  private process(item: string): string {
    const matches = item.match(this.pattern);
    if (matches && matches[0]) {
      return this.process(item.replace(this.pattern, this.replacer(matches[0])));
    } else {
      return item;
    }
  }

  public audit(): string[] {
    const out: string[] = [];
    this.data.forEach((value) => {
      value.forEach((str) => {
        str.match(this.auditPattern)?.forEach((match) => {
          if(!this.has(match.substring(1,match.length-1))) {
            out.push(match.substring(1,match.length-1));
          }
        })
      })
    });
    return out;
  }

  public load(key: string, list: string[]): void {
    if (this.guardPattern.test(key)) {
      throw new Error(`Buckets Error: can't load key '${key}'; keys are limited to A-Za-z0-9:_`);
    }
    if (!list.every(s => typeof s === 'string')) {
      // Stryker disable next-line StringLiteral
      throw new Error(`Buckets Error: attempted to load non-string data under key '${key}'`)
    }
    this.data.set(key, list);
  }

  public loadJSON(json: Record<string, unknown>): void {
    Object.entries(json).forEach(([key, value]) => {
      if (!Array.isArray(value) || !value.every(s => typeof s === 'string')) {
        throw new Error(`Buckets Error: attempted to load non-string JSON data under key '${key}'`)
      }
      this.load(key, value);
    });
  }

  public has(key: string): boolean {
    return this.data.has(key);
  }

  public keys(): string[] {
    return [...this.data.keys()];
  }

  public get(key: string): string {
    this.resetUsed();
    return this.process(this.choose(this.lookup(key)));
  }
}

export default Buckets;
