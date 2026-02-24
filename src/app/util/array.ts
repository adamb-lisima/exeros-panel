const ArrayUtil = {
  groupBy: <T, Q>(array: T[], predicate: (value: T, index: number, array: T[]) => Q) => {
    return array.reduce((map, value, index, array) => {
      const key = predicate(value, index, array);
      const mapValue = map.get(key);
      if (mapValue) {
        mapValue.push(value);
      } else {
        map.set(key, [value]);
      }
      return map;
    }, new Map<Q, T[]>());
  }
};

export default ArrayUtil;
