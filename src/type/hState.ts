export class HStateType {
  static Top = 'Top';
  static Player = 'Player';
  static Playing = 'Playing';
  static Waiting = 'Waiting';
  static Image = 'Image';
  static Video = 'Video';
}
Object.freeze(HStateType);

export interface HState {
  id: string;
  type: HStateType;
  hsmId: string;
  superStateId: string;
  name: string;
}

export interface MediaHState extends HState {
  data: MediaHStateData;
}

export interface MediaHStateData {
  mediaStateId: string;
  mediaStateData?: MediaHStateParamsData | null;
}

export type MediaHStateParamsData = MediaHStateCustomData;

export type MediaHStateCustomData = ImageStateData | VideoStateData;

export interface ImageStateData {
  timeoutId?: number;
}

export interface VideoStateData {
  timeoutId?: number;
}

export interface HStateSpecification {
  type: HStateType;
  hsmId: string;
  superStateId: string;
  name: string;
}

export interface HSMStateData {
  nextStateId: string | null;
}
