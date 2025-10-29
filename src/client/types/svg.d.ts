// src/types/svg.d.ts
declare module '*.svg' {
    import * as React from 'react';
    // Named export used by MUI examples
    export const ReactComponent: React.FunctionComponent<
      React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    // Also allow default import as URL if you ever use <img src={...} />
    const src: string;
    export default src;
  }
  