import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import HelloRemote from './app/HelloRemote';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <HelloRemote />
  </StrictMode>
);
