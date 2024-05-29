import { useContext } from "react";
import { GlobalEffectsContext } from "./GlobalEffectsContext";
import { marchElephant } from "./Helpers";

export const ElephantsMarch = (props: { imperialAmbitions: boolean }) => {
  const globalEffects = useContext(GlobalEffectsContext);
  const { elephant, activeEvent, regions, drawStackRegion } = globalEffects;

  if (!activeEvent) {
    console.error("No active event");
    return;
  }

  if (props.imperialAmbitions) {
    const elephantMainRegion = regions.find(
      (r) => r.id === elephant.MainRegion
    );

    if (!elephantMainRegion) {
      console.error("Elephant main region missing");
      return;
    }

    const newElephant = marchElephant(
      elephantMainRegion,
      regions,
      activeEvent.symbol
    );

    if (newElephant?.TargetRegion === elephantMainRegion.id) {
      return (
        <>
          <b>March Elephant:</b> {elephantMainRegion.id} has imperial ambitions
          but no regions to conquer. Move elephant to {newElephant.MainRegion}{" "}
          and face it towards {newElephant.TargetRegion}
        </>
      );
    }
    {
      return (
        <>
          <b>March Elephant:</b> Imperial Ambitions, move elephant to{" "}
          {newElephant?.MainRegion} and face it towards{" "}
          {newElephant?.TargetRegion}
        </>
      );
    }
  } else {
    const newElephant = marchElephant(
      drawStackRegion,
      regions,
      activeEvent.symbol
    );

    if (newElephant?.TargetRegion === undefined) {
      return (
        <>
          <b>Elephant Marches:</b> Move elephant in the middle of{" "}
          {newElephant?.MainRegion}{" "}
        </>
      );
    } else {
      return (
        <>
          <b>Elephant Marches:</b> Move elephant to {newElephant?.MainRegion}{" "}
          and face it towards {newElephant.TargetRegion}{" "}
        </>
      );
    }
  }
};
