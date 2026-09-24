// Class strings the Plan and Item tabs' pieces share. They were copied into each tab's file, and the
// split into smaller files would have copied them again.

/** A native <select> or <input> sized and ringed like the rest of the app. */
export const selectCls =
  'h-9 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring';

// Bare <button>s don't get the Button component's ring (button.tsx), so they fall back to the browser
// default — visible, but inconsistent with the rest of the app. This gives them the same one.
export const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm';
