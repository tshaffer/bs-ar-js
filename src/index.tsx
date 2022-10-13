import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { autorunReducer } from './model';
import { Autorun } from './component';
import { AutorunState } from './type';

import { bsDmReducer } from '@brightsign/bsdatamodel';
import { baCmReducer } from '@brightsign/ba-context-model';

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
  ));

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
