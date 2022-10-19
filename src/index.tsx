import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { autorunReducer, updateRuntimeEnvironment } from './model';
import { Autorun } from './component';
import { AutorunState, RuntimeEnvironment } from './type';

import { bsDmReducer } from '@brightsign/bsdatamodel';
import { baCmReducer } from '@brightsign/ba-context-model';

import { inferRuntimeEnvironment } from './controller';

const reducers = combineReducers<AutorunState>({
  bacdm: baCmReducer,
  bsdm: bsDmReducer,
  bsPlayer: autorunReducer,
});

const store = createStore(
  reducers,
  composeWithDevTools(
    applyMiddleware(
      thunk,
    ),
  )
);

inferRuntimeEnvironment()
  .then((runtimeEnvironment: RuntimeEnvironment) => {
    console.log('inferRuntimeEnvironment returned: ', runtimeEnvironment);

    if (runtimeEnvironment === RuntimeEnvironment.BrightSign) {
      const bp900_gpio = new BSControlPort('TouchBoard-0-GPIO');
      bp900_gpio.oncontroldown = (e: any) => {
        processControlEvent(e);
      };
    }

    store.dispatch(updateRuntimeEnvironment(runtimeEnvironment));
    renderAutorun();

  });

const processControlEvent = (e: any) => {
  console.log('### oncontrolevent ' + e.code);
};

const renderAutorun = () => {
  
  const divStyle = {
    height: '1080px',
  };

  const container = document.getElementById('content');
  const root = createRoot(container as HTMLElement);

  root.render(
    <Provider store={store}>
      <div style={divStyle}>
        < Autorun />
      </div>
    </Provider>,
  );

};