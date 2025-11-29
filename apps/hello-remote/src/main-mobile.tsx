// Mobile entry point for hello-remote
// This is used when building with Re.Pack for mobile compatibility
// The component is exported for Module Federation, but we don't render it here
// The mobile shell will load and render it

import HelloRemote from './app/HelloRemote';

// Export the component for Module Federation
export { HelloRemote };
export default HelloRemote;

