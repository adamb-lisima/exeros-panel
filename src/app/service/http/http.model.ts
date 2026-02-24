export interface HttpResponse<Data, Meta = any> {
  data: Data;
  meta: Meta;
}

export type HttpRequestHeaders = { [_: string]: string | string[] };
