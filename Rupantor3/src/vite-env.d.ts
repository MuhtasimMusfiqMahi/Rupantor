/// <reference types="vite/client" />

// This module declaration tells TypeScript that importing image files returns a string (URL)
// This is necessary because we are using a custom alias 'figma:asset' for the logo image.
declare module '*.png' {
  const src: string;
  export default src;
}

// Re-defining the custom asset path to be correctly typed as a string
declare module 'figma:asset/30413506c2fe0151b8e7a901d4930f79e5e6f227.png' {
  const src: string;
  export default src;
}
