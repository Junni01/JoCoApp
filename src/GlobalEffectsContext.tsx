import { createContext, useState } from "react";
import {
  Elephant,
  EventCard,
  EventType,
  GlobalEffects,
  Region,
  RegionName,
} from "./Types";
import { madras } from "./Data";
import { marchElephant } from "./Helpers";

export interface GlobalEffectsContextType {
  globalEffects: GlobalEffects;
  setGlobalEffects: (globalEffects: GlobalEffects) => void;
  regions: Region[];
  setRegions: (regions: Region[]) => void;
  elephant: Elephant;
  setElephant: (elephant: Elephant) => void;
  eventDeck: EventCard[];
  setEventDeck: (eventDeck: EventCard[]) => void;
  eventDiscardPile: EventCard[];
  setEventDiscardPile: (eventDiscardPile: EventCard[]) => void;
  drawStackRegion: Region;
  activeEvent?: EventCard;
  setActiveEvent: (event: EventCard | undefined) => void;
  executeElephantsMarch: (imperialAmbitions: boolean) => void;
  drawEvent: () => void;
  discardEvent: () => void;
  eventTotal: number;
  setEventTotal: (eventTotal: number) => void;
  leaders: string[];
  setAvailableLeaders: (leaders: string[]) => void;
}

export const GlobalEffectsContext = createContext<GlobalEffectsContextType>({
  globalEffects: {
    TreasureReform: false,
    SepoyRecruitment: false,
    GovernorGeneral: false,
    RegionsLost: 0,
  },
  setGlobalEffects: () => {},
  regions: [],
  setRegions: () => {},
  elephant: {
    MainRegion: RegionName.Madras,
    TargetRegion: RegionName.Madras,
  },
  setElephant: () => {},
  eventDeck: [],
  setEventDeck: () => {},
  eventDiscardPile: [],
  setEventDiscardPile: () => {},
  drawStackRegion: madras,
  activeEvent: undefined,
  setActiveEvent: () => {},
  executeElephantsMarch: () => {},
  drawEvent: () => {},
  discardEvent: () => {},
  eventTotal: 0,
  setEventTotal: () => {},
  leaders: [],
  setAvailableLeaders: () => {},
});

export const GlobalEffectsProvider = (props: { children: React.ReactNode }) => {
  const [globalEffects, setGlobalEffects] = useState<GlobalEffects>({
    TreasureReform: false,
    SepoyRecruitment: false,
    GovernorGeneral: false,
    RegionsLost: 0,
  });

  const executeElephantsMarch = (imperialAmbitions: boolean) => {
    if (!activeEvent) {
      console.error("Active event is null");
      return;
    }

    const elephantMainRegion = regions.find(
      (r) => r.id === elephant.MainRegion
    );

    if (!elephantMainRegion) {
      console.error("Elephant main region missing");
      return;
    }

    let newElephant: Elephant | undefined;

    if (imperialAmbitions) {
      console.log("Elephant: Imperial Ambitions");
      newElephant = marchElephant(
        elephantMainRegion,
        regions,
        activeEvent.symbol
      );
    } else {
      console.log("Elephant: No Imperial Ambitions");
      newElephant = marchElephant(drawStackRegion, regions, activeEvent.symbol);
    }

    if (!newElephant) {
      console.error("Elephant march failed");
      return;
    }
    setElephant(newElephant);
  };

  const drawEvent = () => {
    if (eventDeck.length === 0) {
      console.error("Event Draw pile is empty! This should not happen");
      return;
    }

    if (eventDeck.length === 1 && eventDeck[0].type !== EventType.Shuffle) {
      console.error(
        "Event Draw pile has only on card and it is not shuffle, This should not happen!"
      );
      return;
    }

    const event = eventDeck.pop();

    if (!event) {
      console.error("drawEvent: Event deck is empty, it should not be");
      return;
    }

    setEventDeck([...eventDeck]);
    setActiveEvent(event);
  };

  const discardEvent = () => {
    if (!activeEvent) {
      console.error("active event is undefined");
      return;
    }
    const discards = [...eventDiscardPile];
    discards.push(activeEvent);
    setEventDiscardPile([...discards]);
    setActiveEvent(undefined);
  };

  const [regions, setRegions] = useState<Region[]>([]);
  const [elephant, setElephant] = useState<Elephant>({
    MainRegion: RegionName.Madras,
    TargetRegion: RegionName.Madras,
  });

  const [eventDeck, setEventDeck] = useState<EventCard[]>([]);
  const [eventDiscardPile, setEventDiscardPile] = useState<EventCard[]>([]);
  const [eventTotal, setEventTotal] = useState<number>(0);
  const [availableLeaders, setAvailableLeaders] = useState<string[]>([]);

  const [activeEvent, setActiveEvent] = useState<EventCard | undefined>(
    undefined
  );

  const drawStackRegion =
    regions.find((r) => r.id === eventDeck[eventDeck.length - 1].Region) ??
    regions[0];

  return (
    <GlobalEffectsContext.Provider
      value={{
        globalEffects,
        setGlobalEffects,
        regions,
        setRegions,
        eventDeck,
        setEventDeck,
        elephant,
        setElephant,
        eventDiscardPile,
        setEventDiscardPile,
        drawStackRegion,
        activeEvent,
        setActiveEvent,
        executeElephantsMarch,
        drawEvent,
        discardEvent,
        eventTotal,
        setEventTotal,
        leaders: availableLeaders,
        setAvailableLeaders: setAvailableLeaders,
      }}
    >
      {props.children}
    </GlobalEffectsContext.Provider>
  );
};
