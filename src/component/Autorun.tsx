import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import { DmState } from '@brightsign/bsdatamodel';
import {
  initPresentation,
} from '../controller/appController';
import {
  HsmMap,
  AutorunState,
  autorunStateFromState,
} from '../type';
import { getHsmMap } from '../selector';
import Sign from './sign';
import {
  AutorunVoidThunkAction,
} from '../model';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export interface AutorunProps {
  bsdm: DmState;
  hsmMap: HsmMap;
  onInitPresentation: () => AutorunVoidThunkAction;
}

// -----------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

const Autorun = (props: any) => {

  React.useEffect(() => {
    props.onInitPresentation();
  }, []);

  let initializationComplete = true;

  if (props.bsdm.zones.allZones.length === 0 ||
    Object.keys(props.hsmMap).length === 0) {
    initializationComplete = false;
  }

  for (const hsmId in props.hsmMap) {
    if (Object.prototype.hasOwnProperty.call(props.hsmMap, hsmId)) {
      const hsm = props.hsmMap[hsmId];
      if (!hsm.initialized) {
        initializationComplete = false;
      }
    }
  }

  if (initializationComplete) {
    return (
      <Sign />
    );
  } else {
    return (
      <div>
        Waiting for the presentation to be loaded...
      </div>
    );
  }
};

// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

function mapStateToProps(state: AutorunState): Partial<AutorunProps> {

  const autorunState: AutorunState = autorunStateFromState(state);

  return {
    bsdm: state.bsdm,
    hsmMap: getHsmMap(autorunState),
  };
}

const mapDispatchToProps = (dispatch: Dispatch<any>): any => {
  return bindActionCreators({
    onInitPresentation: initPresentation,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Autorun);
