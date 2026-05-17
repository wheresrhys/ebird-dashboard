import {type DataWrapper, DataWrapperOptions2} from './data-wrapper';
let counts = 0;

function getMemoKey({
  listId,
  year
}: DataWrapperOptions2) {
  return `${listId ?? 'no-list'}:${year ? String(year) : 'no-year'}`
}

export class DataMemoizer {
  #memoizedDataWrappers: Record<string, DataWrapper> = {}
  constructor () {  }

  getMemoizedDataWrapper(options: DataWrapperOptions2) {
    return this.#memoizedDataWrappers[getMemoKey(options)]
  }

  setMemoizedDataWrapper(options: DataWrapperOptions2, dataWrapper: DataWrapper) {
    this.#memoizedDataWrappers[getMemoKey(options)] = dataWrapper;
  }
}
