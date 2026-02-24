export const ParamsUtil = {
  addHashQueryParam(url: string, key: string, value: string) {
    const existing = url.lastIndexOf('?') > url.lastIndexOf('#') ? url.substring(url.lastIndexOf('?') + 1) : '';
    const query = new URLSearchParams(existing);
    query.set(key, value);
    return `${url.replace(`?${existing}`, '')}?${query.toString()}`;
  }
};
