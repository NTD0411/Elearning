declare module 'aos' {
  interface AosOptions {
    offset?: number;
    duration?: number;
    easing?: string;
    delay?: number;
    anchor?: string;
    placement?: string;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: string;
  }

  function init(options?: AosOptions): void;
  function refresh(hard?: boolean): void;
  function refreshHard(): void;

  export { init, refresh, refreshHard };
  export default { init, refresh, refreshHard };
}