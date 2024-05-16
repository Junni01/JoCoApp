import { createContext, useState } from "react";
import { GlobalEffects } from "./Types";

export interface GlobalEffectsContextType {
  globalEffects: GlobalEffects;
  setGlobalEffects: (globalEffects: GlobalEffects) => void;
}

export const GlobalEffectsContext = createContext<GlobalEffectsContextType>({
  globalEffects: {
    TreasureReform: false,
    SepoyRecruitment: false,
    GovernorGeneral: false,
    RegionsLost: 0,
  },
  setGlobalEffects: () => {},
});

export const GlobalEffectsProvider = (props: { children: React.ReactNode }) => {
  const [globalEffects, setGlobalEffects] = useState<GlobalEffects>({
    TreasureReform: true,
    SepoyRecruitment: false,
    GovernorGeneral: false,
    RegionsLost: 0,
  });

  return (
    <GlobalEffectsContext.Provider value={{ globalEffects, setGlobalEffects }}>
      {props.children}
    </GlobalEffectsContext.Provider>
  );
};
