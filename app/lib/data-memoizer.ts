import {type DataWrapper, DataWrapperOptions2} from './data-wrapper';

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
      this.#memoizedDataWrappers[memoKey] = this.#dataWrapper.newCalve({listId, year})
    }
    return this.#memoizedDataWrappers[memoKey];
  }
}
