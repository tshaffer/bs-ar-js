import { AutorunAction } from './baseAction';
import { PlaybackState } from '../type';

export const SET_VIDEO_ELEMENT_REF = 'SET_VIDEO_ELEMENT_REF';

export type SetPlaybackAction = AutorunAction<PlaybackState>;

export const setVideoElementRef = (
  videoElementRef: HTMLVideoElement | null,
): SetPlaybackAction => {
  return {
    type: SET_VIDEO_ELEMENT_REF,
    payload: {
      videoElementRef,
    }
  };
};

export const playbackDefaults: PlaybackState = {
  videoElementRef: null,
};
Object.freeze(playbackDefaults);

export const playbackReducer = (
  state: PlaybackState = playbackDefaults,
  { type, payload }: (
    SetPlaybackAction
  ),
): PlaybackState => {
  switch (type) {
    case SET_VIDEO_ELEMENT_REF:
      // eslint-disable-next-line no-case-declarations
      const newState: PlaybackState = {
        videoElementRef: payload.videoElementRef
      };
      return newState;
    default:
      return state;
  }
};
