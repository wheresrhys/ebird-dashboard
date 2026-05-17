import {type DataWrapper, DataWrapperOptions2} from './data-wrapper';
let counts = 0;

export class DataMemoizer {
  #dataWrapper: DataWrapper
  #memoizedDataWrappers: Record<string, DataWrapper> = {}
  constructor (dataWrapper: DataWrapper) {
    this.#dataWrapper = dataWrapper;
  }

  getChildDataWrapper({
    listId,
    year
  }: DataWrapperOptions2) {
    const memoKey = `${listId ?? 'no-list'}:${year ? String(year) : 'no-year'}`;
    if (!this.#memoizedDataWrappers[memoKey]) {
      counts++;
      this.#memoizedDataWrappers[memoKey] = this.#dataWrapper.newCalve({listId, year})
    }
    console.log(counts)
    return this.#memoizedDataWrappers[memoKey];
  }
}
