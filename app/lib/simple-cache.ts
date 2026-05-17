export class SimpleCache<StoredObjectType, OptionsType> {
  #cache: Record<string, StoredObjectType> = {};
  #keyGenerator: (options:OptionsType) => string;
  constructor(keyGenerator: (options: OptionsType)=> string) {
    this.#keyGenerator = keyGenerator
  }

  getItem(options: OptionsType): StoredObjectType {
    return this.#cache[this.#keyGenerator(options)]
  }

  setItem(options: OptionsType, dataWrapper: StoredObjectType): void {
    this.#cache[this.#keyGenerator(options)] = dataWrapper;
  }
}
