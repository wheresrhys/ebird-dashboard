const counts = {
  get: 0,
  set: 0
}

export class SimpleCache<StoredObjectType, OptionsType> {
  #cache: Record<string, StoredObjectType> = {};
  #keyGenerator: (options:OptionsType) => string;
  constructor(keyGenerator: (options: OptionsType)=> string) {
    this.#keyGenerator = keyGenerator
  }

  hasItem(options: OptionsType): boolean {
    return this.#keyGenerator(options) in this.#cache;
  }

  getItem(options: OptionsType): StoredObjectType {
    counts.get++;
    console.log('get', counts.get, 'set', counts.set)
    return this.#cache[this.#keyGenerator(options)]
  }

  setItem(options: OptionsType, dataWrapper: StoredObjectType): void {
    console.log('set', this.#keyGenerator(options))
    counts.set++;
    this.#cache[this.#keyGenerator(options)] = dataWrapper;
  }
}
