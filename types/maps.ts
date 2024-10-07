export type OverlayGeometry = google.maps.Rectangle | google.maps.Circle;

export interface DrawResult {
  type: google.maps.drawing.OverlayType;
  overlay: OverlayGeometry;
}

export interface Snapshot {
  radius?: number;
  center?: google.maps.LatLngLiteral;
  bounds?: google.maps.LatLngBoundsLiteral;
}

export interface Overlay {
  type: google.maps.drawing.OverlayType;
  geometry: OverlayGeometry;
  snapshot: Snapshot;
}

export interface State {
  past: Array<Array<Overlay>>;
  now: Array<Overlay>;
  future: Array<Array<Overlay>>;
}

export enum DrawingActionKind {
  SET_OVERLAY = "SET_OVERLAY",
  UPDATE_OVERLAYS = "UPDATE_OVERLAYS",
  UNDO = "UNDO",
  REDO = "REDO",
}

export interface ActionWithTypeOnly {
  type: Exclude<DrawingActionKind, DrawingActionKind.SET_OVERLAY>;
}

export interface SetOverlayAction {
  type: DrawingActionKind.SET_OVERLAY;
  payload: DrawResult;
}

export type Action = ActionWithTypeOnly | SetOverlayAction;

export function isCircle(overlay: OverlayGeometry): overlay is google.maps.Circle {
  return (overlay as google.maps.Circle).getCenter !== undefined;
}

export function isRectangle(overlay: OverlayGeometry): overlay is google.maps.Rectangle {
  return (overlay as google.maps.Rectangle).getBounds !== undefined;
}

export interface Circulo {
  radius: number;
  center: google.maps.LatLngLiteral;
}

export interface Retangulo {
  bounds: google.maps.LatLngBoundsLiteral;
}

export function isCirculo(area: Snapshot): area is Circulo {
  return area.radius != undefined && area.center != undefined;
}

export function isRetangulo(area: Snapshot): area is Retangulo {
  return area.bounds != undefined;
}
