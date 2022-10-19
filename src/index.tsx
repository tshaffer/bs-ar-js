import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { autorunReducer } from './model';
import { Autorun } from './component';
import { AutorunState, RuntimeEnvironment } from './type';

import { bsDmReducer } from '@brightsign/bsdatamodel';
import { baCmReducer } from '@brightsign/ba-context-model';

import { determineRuntimeEnvironment } from './controller';

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

determineRuntimeEnvironment()
  .then((runtimeEnvironment: RuntimeEnvironment) => {
    console.log('determineRuntimeEnvironment returned: ', runtimeEnvironment);

    if (runtimeEnvironment === RuntimeEnvironment.BrightSign) {

      const bsMessage = new BSMessagePort();
      console.log('bsMessage');
      console.log(bsMessage);

      const bp900_gpio = new BSControlPort('TouchBoard-0-GPIO');
      console.log('bp900_gpio');
      console.log(bp900_gpio);

      bp900_gpio.oncontroldown = (e: any) => {
        console.log('### oncontrolevent ' + e.code);
      };

      bsMessage.onbsmessage = (msg: any) => {

        console.log('onbsmessage invoked');
        console.log(msg);
        console.log(msg.data);
        for (const key in msg.data) {
          if (Object.prototype.hasOwnProperty.call(msg.data, key)) {
            const value = msg.data[key];
            console.log('key');
            console.log(key);
            console.log('value');
            console.log(value);
          }
        }
      };
    }

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

  });


// const divStyle = {
//   height: '1080px',
// };

// const container = document.getElementById('content');
// const root = createRoot(container as HTMLElement);

// root.render(
//   <Provider store={store}>
//     <div style={divStyle}>
//       < Autorun />
//     </div>
//   </Provider>,
// );
