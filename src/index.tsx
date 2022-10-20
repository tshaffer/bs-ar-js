import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { autorunReducer, updateRuntimeEnvironment } from './model';
import { Autorun } from './component';
import { AutorunState, RuntimeEnvironment } from './type';

import { bsDmReducer } from '@brightsign/bsdatamodel';
import { baCmReducer } from '@brightsign/ba-context-model';

import {
  inferRuntimeEnvironment,
  keydownEventHandler,
} from './controller';
import { isNil } from 'lodash';

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

const container = document.getElementById('content');
const root: Root = createRoot(container as HTMLElement);

inferRuntimeEnvironment()
  .then((runtimeEnvironment: RuntimeEnvironment) => {
    console.log('inferRuntimeEnvironment returned: ', runtimeEnvironment);

    if (runtimeEnvironment === RuntimeEnvironment.BrightSign) {
      const bp900_gpio = new BSControlPort('TouchBoard-0-GPIO');
      bp900_gpio.oncontroldown = (e: any) => {
        processControlEvent(e);
        return;
      };
    }

    document.addEventListener('click', function (evnt) {
      if (isNil(evnt)) {
        console.log('null click event received');
      } else {
        console.log('click event: ', (evnt as any).target);
      }
      return;
    });

    document.addEventListener('keydown', function (evnt: KeyboardEvent) {
      if (isNil(evnt)) {
        console.log('null keydown event received');
      } else {
        /*
          https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
          https://felixgerschau.com/react-typescript-onkeydown-event-type/

          interface KeyboardEvent<T = Element> extends SyntheticEvent<T, NativeKeyboardEvent> {
            altKey: boolean;
            ** @deprecated *
            charCode: number;
            ctrlKey: boolean;
            getModifierState(key: string): boolean;
            key: string;
            ** @deprecated **
            keyCode: number;
            locale: string;
            location: number;
            metaKey: boolean;
            repeat: boolean;
            shiftKey: boolean;
            ** @deprecated **
              which: number;
          }
        */
        console.log('keydown event: ', evnt);
        const keyName: string = evnt.key;
        store.dispatch(keydownEventHandler(keyName));
      }
      return;
    });

    console.log('invoke updateRuntimeEnvironment');

    store.dispatch(updateRuntimeEnvironment(runtimeEnvironment));
    renderAutorun(root);

  });

const processControlEvent = (e: any) => {
  console.log('### oncontrolevent ' + e.code);
};

const renderAutorun = (root: Root) => {

  const divStyle = {
    height: '1080px',
  };

  root.render(
    <Provider store={store}>
      <div style={divStyle}>
        < Autorun />
      </div>
    </Provider>,
  );

};