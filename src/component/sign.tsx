import * as React from 'react';
import { connect } from 'react-redux';

import { DmState } from '@brightsign/bsdatamodel';

import {
  DmcZone,
  dmGetZoneById,
  dmGetZonesForSign,
} from '@brightsign/bsdatamodel';
import MediaZone from './mediaZone';
import { autorunStateFromState, Dimensions } from '../type';
import { calculateAspectRatioFit } from '../utility';
import { getScreenDimensions } from '../selector';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export interface SignProps {
  bsdm: DmState;
  screenDimensions: Dimensions;
}

// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

const SignComponent = (props: any) => {

  const renderMediaZone = (zone: DmcZone): object => {

    const scaledDimensions = calculateAspectRatioFit(
      zone.absolutePosition.width,
      zone.absolutePosition.height,
      props.screenDimensions.width,
      props.screenDimensions.height,
    );

    return (
      <div
        key={zone.id}
        style={{
          position: 'absolute',
          left: zone.absolutePosition.x,
          top: zone.absolutePosition.y,
          width: scaledDimensions.width,
          height: scaledDimensions.height,
        }}
      >
        <MediaZone
          key={zone.id}
          bsdm={props.bsdm}
          zone={zone}
          zoneWidth={Number(zone.absolutePosition.width)}
          zoneHeight={Number(zone.absolutePosition.height)}
          screenDimensions={props.screenDimensions}
        />
      </div>
    );
  };

  const renderZone = (zoneId: string): object | null => {

    const zone: DmcZone = dmGetZoneById(props.bsdm, { id: zoneId }) as DmcZone;

    switch (zone.type) {
      case 'VideoOrImages': {
        return renderMediaZone(zone);
      }
      default: {
        debugger;
      }
    }

    return null;
  };

  const zoneIds: string[] = dmGetZonesForSign(props.bsdm);
  const renderedZones: any[] = zoneIds.map((zoneId) =>
    renderZone(zoneId),
  );
  return (
    <div>
      {renderedZones}
    </div>
  );
};


// -----------------------------------------------------------------------
// Container
// -----------------------------------------------------------------------

const mapStateToProps = (state: any): Partial<SignProps> => {
  state = autorunStateFromState(state);
  return {
    bsdm: state.bsdm,
    screenDimensions: getScreenDimensions(state),
  };
};

export default connect(mapStateToProps)(SignComponent);
