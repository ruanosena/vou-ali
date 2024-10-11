export type OverlayGeometry = google.maps.Marker;

export interface DrawResult {
  type: google.maps.drawing.OverlayType;
  overlay: OverlayGeometry;
}

export interface Snapshot {
  position?: google.maps.LatLngLiteral;
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

export function isMarker(overlay: OverlayGeometry): overlay is google.maps.Marker {
  return (overlay as google.maps.Marker).getPosition !== undefined;
}
