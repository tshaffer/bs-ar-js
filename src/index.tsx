import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import { appReducer } from './model';
import App from './components/app';

const store = createStore(
  appReducer,
  composeWithDevTools(applyMiddleware(thunk)),
);

const divStyle = {
  height: '1080px',
};

const container = document.getElementById('content');
const root = createRoot(container as HTMLElement);

root.render(
  <Provider store={store}>
    <div style={divStyle}>
      < App />
    </div>
  </Provider>,
);
