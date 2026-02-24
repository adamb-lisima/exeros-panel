export interface RouteData {
  hideTopBar?: boolean;
  hideNavBar?: boolean;
  removeContainerMargin?: boolean;
  layout?: LayoutType;
}

export type LayoutType = 'default' | 'split';

export interface RouteQueryParams {
  mode?: 'screenshot';
}
