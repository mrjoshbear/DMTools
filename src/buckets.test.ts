import Buckets from './buckets';

describe('Tests for Buckets.js', () => {

  it('throws an error when a key is not present', () => {
    // arrange
    const key = 'key';
    const buckets = new Buckets();
    // act & assert
    expect(() => {
      buckets.get(key);
    }).toThrow(`Buckets Error: No entry for key ${key}`);
  });

  it('throws an error when loading a bad key', () => {
    // arrange 
    const key = 'w*';
    const buckets = new Buckets();
    // act & assert
    expect(() => {
      buckets.load(key, []);
    }).toThrow(`Buckets Error: can't load key '${key}'; keys are limited to A-Za-z0-9:_`);
  });

  it('throws an error when loading a value that is not a string', () => {
    //arrange
    const key = 'key';
    const value = [1];
    const buckets = new Buckets();
    // act & assert
    expect(() => {
      buckets.load(key, value as any);
    }).toThrow(expect.any(Error));
  });

  it('throws an error when an unknown function prefix is encountered', () => {
    // arrange
    const key = 'key';
    const list = ['[bad:string]'];
    const buckets = new Buckets();
    buckets.load(key, list);
    // act & assert
    expect(() => {
      buckets.get(key);
    }).toThrow('Buckets Error: unkown prefix symbol \'bad\'');
  })

  it('loads and displays for a single string under a single key', () => {
    // arrange
    const list = ['string1'];
    const key = 'key';
    const buckets = new Buckets();
    buckets.load(key, list);
    // act
    const actual = buckets.get(key);
    // assert
    expect(actual).toEqual(list[0]);
  });

  it('loads two strings into a list and returns either of them', () => {
    //arrange
    const list = ['string1', 'string2'];
    const key = 'key';
    const buckets = new Buckets();
    buckets.load(key, list);
    // act
    const actual = buckets.get(key);
    // assert
    expect(list).toContain(actual);
  });

  it('loads two lists and displays a single string from each', () => {
    // arrange
    const key1 = 'key1';
    const list1 = ['string1'];
    const key2 = 'key2';
    const list2 = ['string2'];
    const buckets = new Buckets();
    buckets.load(key1, list1);
    buckets.load(key2, list2);
    // act
    const actual1 = buckets.get(key1);
    const actual2 = buckets.get(key2);
    // assert
    expect(actual1).toEqual('string1');
    expect(actual2).toEqual('string2');
  });

  it('loads a list with a reference and eventually terminates the recursion', () => {
    // arrange
    const key = 'key1';
    const list = ['[key1]', 'end'];
    const buckets = new Buckets();
    buckets.load(key, list);
    // act
    const actual = buckets.get(key);
    // assert
    expect(actual).toContain('end');
  });

  it('loads two lists with a reference from one to the other', () => {
    // arrange
    const key1 = 'key1';
    const list1 = ['[key2]'];
    const key2 = 'key2';
    const list2 = ['string2'];
    const buckets = new Buckets();
    buckets.load(key1, list1);
    buckets.load(key2, list2);
    // act
    const actual1 = buckets.get(key2);
    const actual2 = buckets.get(key1);
    // assert
    expect(actual1).toEqual('string2');
    expect(actual2).toEqual('string2');
  });

  it('processes a command to make strings uppercase', () => {
    // arrange
    const key1 = 'key1';
    const list1= ['[uc:key2]'];
    const key2 = 'key2';
    const list2 = ['string2'];
    const buckets = new Buckets();
    buckets.load(key1, list1);
    buckets.load(key2, list2);
    // act
    const actual = buckets.get(key1);
    // assert
    expect(actual).toEqual('STRING2');
  });

  it('processes a command to make strings lowercase', () => {
    // arrange
    const key1 = 'key1';
    const list1 = ['[lc:key2]'];
    const key2 = 'key2';
    const list2 = ['STRING2'];
    const buckets = new Buckets();
    buckets.load(key1, list1);
    buckets.load(key2, list2);
    // act
    const actual = buckets.get(key1);
    // assert
    expect(actual).toEqual('string2');
  });

  it('processes a command to make strings titlecase', () => {
    // arrange
    const key1 = 'key1';
    const list1 = ['[tc:key2]'];
    const key2 = 'key2';
    const list2 = ['one two'];
    const buckets = new Buckets();
    buckets.load(key1, list1);
    buckets.load(key2, list2);
    // act
    const actual = buckets.get(key1);
    // assert
    expect(actual).toEqual('One Two');
  });

  it('get both items when choosing two from a list of two items', () => {
    // arrange
    const key1 = 'key1';
    const list1 = ['[two:key2]'];
    const key2 = 'key2';
    const list2 = ['one', 'two'];
    const buckets = new Buckets();
    buckets.load(key1, list1);
    buckets.load(key2, list2);
    // act
    const actual = buckets.get(key1);
    // assert
    expect(actual).toContain('one');
    expect(actual).toContain('and');
    expect(actual).toContain('two');
  });

  it('throws an error when trying to get two items from a list of one', () => {
    // arrange
    const key1 = 'key1';
    const list1 = ['[two:key2]'];
    const key2 = 'key2';
    const list2 = ['one'];
    const buckets = new Buckets();
    buckets.load(key1, list1);
    buckets.load(key2, list2);
    // act and assert
    expect(() => {
      buckets.get(key1);
    }).toThrow('Buckets Error: cannot choose2 from a list with less than two options');
  });

  it('choooses unique entries from a list', () => {
    // arrange
    const key1 = 'key1';
    const value1 = ['a', 'b', 'c'];
    const key2 = 'key2';
    const value2 = ['[uniq:key1][uniq:key1][uniq:key1]'];
    const buckets = new Buckets();
    buckets.load(key1, value1);
    buckets.load(key2, value2);
    // act
    const actual = buckets.get(key2);
    // assert
    expect(actual.indexOf('a')).toBeGreaterThan(-1);
    expect(actual.indexOf('b')).toBeGreaterThan(-1);
    expect(actual.indexOf('c')).toBeGreaterThan(-1);
  });

  it('choooses unique entries from a list on separate runs', () => {
    // arrange
    const key1 = 'key1';
    const value1 = ['a', 'b', 'c'];
    const key2 = 'key2';
    const value2 = ['[uniq:key1][uniq:key1][uniq:key1]'];
    const buckets = new Buckets();
    buckets.load(key1, value1);
    buckets.load(key2, value2);
    // act
    const actual1 = buckets.get(key2);
    const actual2 = buckets.get(key2);
    // assert
    expect(actual1.indexOf('a')).toBeGreaterThan(-1);
    expect(actual1.indexOf('b')).toBeGreaterThan(-1);
    expect(actual1.indexOf('c')).toBeGreaterThan(-1);
    expect(actual2.indexOf('a')).toBeGreaterThan(-1);
    expect(actual2.indexOf('b')).toBeGreaterThan(-1);
    expect(actual2.indexOf('c')).toBeGreaterThan(-1);
  });

  it('throws an error when trying to choose more unique entries than are in a list', () => {
    // arrange
    const key1 = 'key1';
    const value1 = ['a'];
    const key2 = 'key2';
    const value2 = ['[uniq:key1][uniq:key1]'];
    const buckets = new Buckets();
    buckets.load(key1, value1);
    buckets.load(key2, value2);
    // act & assert
    expect(() => {
      buckets.get(key2);
    }).toThrow(`Buckets Error: cannot choose more unique values than exist for key '${key1}'`)
  });

  it('delivers a clean audit when empty', () => {
    // arrange
    const buckets = new Buckets();
    // act
    const actual = buckets.audit();
    // assert
    expect(actual).toEqual([]);
  });

  it('delivers a clean audit when no keys are missing', () => {
    // arrange
    const key1 = 'key1';
    const list1 = ['[key2]'];
    const key2 = 'key2';
    const list2 = ['string2'];
    const buckets = new Buckets();
    buckets.load(key1, list1);
    buckets.load(key2, list2);
    // act
    const actual = buckets.audit();
    // assert
    expect(actual).toEqual([]);
  });

  it('audits for missing keys used in values', () => {
    // arrange
    const key1 = 'key1';
    const list = ['[key2]'];
    const buckets = new Buckets();
    buckets.load(key1, list);
    // act
    const actual = buckets.audit();
    // assert
    expect(actual).toEqual(['key2']);
  });

  it('loads JSON', () => {
    // arrange 
    const json = {
      "key": ["value"]
    }
    const buckets = new Buckets();
    buckets.loadJSON(json);
    // act
    const actual = buckets.get('key');
    // assert
    expect(actual).toEqual('value');
  });

  it('throws an error when loading bad JSON keys', () => {
    // arrange
    const json = {
      "key*": ['value']
    }
    const buckets = new Buckets();
    // act & assert
    expect(() => {
      buckets.loadJSON(json);
    }).toThrow(`Buckets Error: can't load key 'key*'; keys are limited to A-Za-z0-9:_`);
  });

  it('throws an error when loading non-string JSON values', () => {
    // arrange
    const json = {
      "key": [123]
    }
    const buckets = new Buckets();
    // act & assert
    expect(() => {
      buckets.loadJSON(json);
    }).toThrow(`Buckets Error: attempted to load non-string JSON data under key 'key'`);
  });

  it('throws an error when loading non-array JSON values', () => {
    // arrange
    const json = {
      "key": 'value'
    }
    const buckets = new Buckets();
    // act & assert
    expect(() => {
      buckets.loadJSON(json);
    }).toThrow(`Buckets Error: attempted to load non-string JSON data under key 'key'`);
  });

  it('returns keys that are loaded', () => {
    // arrange
    const key = 'key';
    const value = ['value'];
    const buckets = new Buckets();
    buckets.load(key, value);
    // act
    const actual = buckets.keys();
    // assert
    expect(actual).toEqual([key]);
  });

});
