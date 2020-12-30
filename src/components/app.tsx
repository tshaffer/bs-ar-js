import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from '@material-ui/core';

import { makePizza } from '../controller';

import { AppModelState } from '../type';

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

/** @internal */
/** @private */
export interface AppProps {
  onMakePizza: () => any;
}


// -----------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------

const App = (props: AppProps) => {

  React.useEffect(props.onMakePizza, []);

  return <Button color="primary">Hello World</Button>;

  // return (
  //   <div>pizza</div>
  // );

};

function mapStateToProps(state: AppModelState, ownProps: any): Partial<AppProps> {
  return {
  };
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    onMakePizza: makePizza,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
