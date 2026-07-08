let active = false;
export const setKittyProtocolActive = (value: boolean): void => {
  active = value;
};
export const isKittyProtocolActive = (): boolean => active;
