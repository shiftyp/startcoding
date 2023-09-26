export interface Core {
  log: (...messages: any[]) => void,
  callback: (cb: () => void) => void
}