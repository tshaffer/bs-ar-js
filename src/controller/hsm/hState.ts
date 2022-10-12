import {
  HStateSpecification,
  // HStateType,
  // MediaHState,
  // MediaHStateParamsData,
  MediaHStateData
} from '../../type';
import { addHState } from '../../model';
import { newAutorunId } from '../../utility';
import {
  AutorunDispatch,
  AutorunStringThunkAction,
} from '../../model';

export const createHState = (
  hStateSpecification: HStateSpecification,
  data: MediaHStateData | null = null,
): AutorunStringThunkAction => {
  return ((dispatch: AutorunDispatch) => {
    const id: string = newAutorunId();
    dispatch(addHState(id, hStateSpecification, data));
    return id;
  });
};

export const createHStateSpecification = (
  type: string,
  hsmId: string,
  superStateId: string,
  name: string,
): HStateSpecification => {
  const hStateSpecification = {
    type,
    hsmId,
    superStateId,
    name
  };
  return hStateSpecification;
};

// export const createStateDataForStateType = (
//   stateType: HStateType,
//   mediaHState: MediaHState,
// ): MediaHStateParamsData | null => {
//   switch (stateType) {
//     case HStateType.Mrss: {
//       const mediaStateData: MediaHStateParamsData = {
//         dataFeedId: mediaHState.data.mediaStateData!.dataFeedId as string,
//         currentFeedId: null,
//         pendingFeedId: null,
//         displayIndex: 0,
//         firstItemDisplayed: false,
//         waitForContentTimer: null,
//       };
//       return mediaStateData;
//     }
//     default: {
//       break;
//     }
//   }

//   return null;
// };
