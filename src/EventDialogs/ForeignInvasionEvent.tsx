import { useContext, useState } from "react";
import {
  Region,
  RegionName,
  RegionStatus,
  RegionSymbol,
  SeaZone,
} from "../Types";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { StormDie } from "../Data";
import { GlobalEffectsContext } from "../GlobalEffectsContext";
import {
  calculateEmpireStrength,
  doesLossOfRegionCauseEmpireShatter,
  getEmpireDominatedRegionIds,
  marchElephant,
} from "../Helpers";
import { EventDialog } from "../DialogStyles";

export const ForeignInvasionEvent = () => {
  enum ForeignInvasionPage {
    InvasionRegions,
    InvasionResolve,
    InvasionResults,
  }

  const globalEffectsContext = useContext(GlobalEffectsContext);

  const { regions, drawStackRegion, discardEvent } = globalEffectsContext;

  const rollForeignInvasion = () => {
    const stormDieResult = StormDie[Math.floor(Math.random() * 6)];

    switch (stormDieResult.Sea) {
      case SeaZone.EastSea:
        return [RegionName.Bengal];
      case SeaZone.WestSea:
        return [RegionName.Bombay];
      case SeaZone.SouthSea:
        return [RegionName.Madras];
      case SeaZone.All:
        return [RegionName.Bengal, RegionName.Bombay, RegionName.Madras];
      case SeaZone.None:
        return [drawStackRegion.id];
      default:
        console.error("Invalid SeaZone");
        return [];
    }
  };

  const [foreignInvasionRegions] = useState<Region[]>(
    rollForeignInvasion().map(
      (regionId) => regions.find((r) => r.id === regionId)!
    ) as Region[]
  );
  const [foreignInvasionPage, setForeignInvasionPage] =
    useState<ForeignInvasionPage>(ForeignInvasionPage.InvasionRegions);

  const renderDialogContent = () => {
    switch (foreignInvasionPage) {
      case ForeignInvasionPage.InvasionRegions:
        return (
          <>
            <DialogContent>
              <Typography>
                The following regions are affected by the foreign invasion:
              </Typography>
              <ul>
                {foreignInvasionRegions.map((region) => (
                  <li key={region.id}>{region.id}</li>
                ))}
              </ul>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() =>
                  setForeignInvasionPage(ForeignInvasionPage.InvasionResolve)
                }
              >
                Next
              </Button>
            </DialogActions>
          </>
        );
      case ForeignInvasionPage.InvasionResolve:
        return (
          <ForeignInvasionResolve
            affectedRegions={foreignInvasionRegions}
            handleConfirm={() => {
              setForeignInvasionPage(ForeignInvasionPage.InvasionResults);
            }}
          />
        );
      case ForeignInvasionPage.InvasionResults:
        return (
          <>
            <DialogContent>
              <Typography>Foreign Invasions resolved</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleConfirmEvent}>Ok</Button>
            </DialogActions>
          </>
        );
    }
  };

  const handleConfirmEvent = () => {
    discardEvent();
  };

  return (
    <EventDialog>
      <DialogTitle>Foreign Invasion</DialogTitle>
      {renderDialogContent()}
    </EventDialog>
  );
};

export const ForeignInvasionResolve = (props: {
  affectedRegions: Region[];
  handleConfirm: () => void;
}) => {
  const [invadedRegionIndex, setInvadedRegionIndex] = useState(0);
  const activeRegion = props.affectedRegions[invadedRegionIndex];

  const globalEffectsContext = useContext(GlobalEffectsContext);
  const { regions, elephant, drawStackRegion, setElephant, setRegions } =
    globalEffectsContext;

  const handleInvasionAgainstCompany = (
    invasionSuccessful: boolean,
    invasionStrength: number
  ) => {
    if (invasionSuccessful) {
      {
        activeRegion.status = RegionStatus.Sovereign;
        activeRegion.controllingPresidency = undefined;
        activeRegion.towerLevel = Math.floor(invasionStrength / 2);
        activeRegion.unrest = 0;

        const newRegionArray = regions.filter((r) => r.id !== activeRegion.id);
        setRegions([...newRegionArray, activeRegion]);
      }

      if (elephant.MainRegion === activeRegion.id) {
        const newElephant = marchElephant(
          drawStackRegion,
          regions,
          RegionSymbol.Circle
        );

        if (newElephant !== undefined) {
          setElephant(newElephant);
        } else {
          console.error("Invalid Elephant March");
        }
      }
    }
  };

  const handleInvasionAgainstIndia = (
    invasionSuccessful: boolean,
    invasionStrength: number
  ) => {
    if (invasionSuccessful) {
      if (activeRegion.status === RegionStatus.EmpireCapital) {
        const dominatedRegions = regions.filter(
          (r) => r.dominator === activeRegion.id
        );

        dominatedRegions.forEach((r) => {
          r.status = RegionStatus.Sovereign;
          r.dominator = undefined;
        });

        const newRegions = regions.filter(
          (r) => !dominatedRegions.includes(r) && r.id !== activeRegion.id
        );

        activeRegion.status = RegionStatus.Sovereign;
        activeRegion.towerLevel = Math.floor(invasionStrength / 2);
        setRegions([...newRegions, ...dominatedRegions, activeRegion]);
      } else if (activeRegion.status === RegionStatus.Dominated) {
        const dominator = regions.find((r) => r.id === activeRegion.dominator);
        if (doesLossOfRegionCauseEmpireShatter(activeRegion, regions)) {
          dominator!.status = RegionStatus.Sovereign;
        }
        activeRegion.status = RegionStatus.Sovereign;
        activeRegion.dominator = undefined;
        activeRegion.towerLevel = Math.floor(invasionStrength / 2);
        const newRegions = regions.filter(
          (r) => r.id !== activeRegion.id && r.id !== activeRegion.dominator
        );
        setRegions([...newRegions, activeRegion, dominator!]);
      } else {
        const newRegions = regions.filter((r) => r.id !== activeRegion.id);
        activeRegion.status = RegionStatus.Sovereign;
        activeRegion.towerLevel = Math.floor(invasionStrength / 2);
        setRegions([...newRegions, activeRegion]);
      }
    }
  };

  const handleInvasionResolution = (
    invasionDefeated: boolean,
    invasionStrength: number
  ) => {
    if (
      props.affectedRegions[invadedRegionIndex].status ===
      RegionStatus.CompanyControlled
    ) {
      handleInvasionAgainstCompany(invasionDefeated, invasionStrength);
    } else {
      handleInvasionAgainstIndia(invasionDefeated, invasionStrength);
    }

    setInvadedRegionIndex(invadedRegionIndex + 1);
    if (invadedRegionIndex >= props.affectedRegions.length - 1) {
      console.log("All invasions resolved");
      props.handleConfirm();
    }
  };

  if (
    props.affectedRegions[invadedRegionIndex].status ===
    RegionStatus.CompanyControlled
  ) {
    return (
      <ForeignInvasionAgainstCompany
        affectedRegion={activeRegion}
        handleConfirm={handleInvasionResolution}
      />
    );
  } else {
    return (
      <ForeignInvasionAgainstIndia
        affectedRegion={activeRegion}
        regions={regions}
        handleConfirm={handleInvasionResolution}
      />
    );
  }
};

const ForeignInvasionAgainstCompany = (props: {
  affectedRegion: Region;
  handleConfirm: (invasionDefeated: boolean, invasionStrength: number) => void;
}) => {
  const [invasionDefeated, setInvasionDefeated] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const globalEffectsContext = useContext(GlobalEffectsContext);

  const invasionStrength = Math.floor(Math.random() * 6) + 1;
  const unrestStrength = globalEffectsContext.globalEffects.SepoyRecruitment
    ? props.affectedRegion.unrest * 2
    : props.affectedRegion.unrest;

  const handleInvasionResolution = (invasionDefeated: boolean) => {
    setInvasionDefeated(invasionDefeated);
    setShowResults(true);
  };

  const handleConfirmResults = () => {
    setShowResults(false);
    props.handleConfirm(invasionDefeated, invasionStrength);
  };

  if (showResults) {
    return (
      <>
        <DialogContent>
          {invasionDefeated ? (
            <>
              <Typography>Foreign Invasion against Company defeated</Typography>
              <List>
                <ListItem>
                  <b>Restore Order:</b> Remove all unrest from{" "}
                  {props.affectedRegion.id}
                </ListItem>
                <ListItem>
                  <b>Receive Merits:</b> Commander of{" "}
                  {props.affectedRegion.controllingPresidency} Army receives 1
                  Trophy token
                </ListItem>
              </List>
            </>
          ) : (
            <>
              <Typography>
                Foreign Invasion against Company succeeded
              </Typography>
              <List>
                <ListItem>
                  <b>Tarnish the Commander's Name:</b> Commander or the army of{" "}
                  {props.affectedRegion.controllingPresidency} returns half
                  (rounding up) of trophies their family owns to the supply.
                  Return the Commander to it's supply
                </ListItem>
                <ListItem>
                  <b>Officer Rout:</b> Roll a die for every officer in{" "}
                  {props.affectedRegion.controllingPresidency} Army and remove
                  it if the roll is a 6
                </ListItem>
                {globalEffectsContext.globalEffects.GovernorGeneral ? (
                  <ListItem>
                    <b>Restore Local Authority:</b> Place a dome back in the
                    region and add {Math.floor(invasionStrength / 2)} tower
                    level(s) to it.
                  </ListItem>
                ) : (
                  <>
                    <ListItem>
                      <b>Governor Elimination:</b> If this region has a
                      Governor, return it to the unused offices stack and return
                      the officeholder's family member to that player's supply.{" "}
                    </ListItem>
                    <ListItem>
                      <b>Restore Local Authority:</b> Remove the governor
                      overlay, any Company ship, and any unrest in the region,
                      and Place a dome back in the region and add{" "}
                      {Math.floor(invasionStrength / 2)} tower level(s) to it.
                    </ListItem>
                  </>
                )}
                <ListItem>
                  <b>Close Orders:</b> Close every open order in the region. If
                  all are already closed, resolve a Cascade.
                </ListItem>
                <ListItem>
                  <b>Company Humiliation:</b> Lower the Company's Standing by
                  one to the left for each region lost this turn. (lower
                  standing by{" "}
                  {1 + globalEffectsContext.globalEffects.RegionsLost})
                </ListItem>
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmResults()}>Confirm</Button>
        </DialogActions>
      </>
    );
  } else {
    return (
      <>
        <DialogContent>
          <Typography>
            Foreign Invasion against Company controlled region
          </Typography>
          <Typography>
            Invasion strength is {invasionStrength + unrestStrength}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleInvasionResolution(true)}>
            Foreign Invasion Defeated
          </Button>
          <Button onClick={() => handleInvasionResolution(false)}>
            Foreign Invasion Succeeded
          </Button>
        </DialogActions>
      </>
    );
  }
};

const ForeignInvasionAgainstIndia = (props: {
  affectedRegion: Region;
  regions: Region[];
  handleConfirm: (invasionDefeated: boolean, invasionStrength: number) => void;
}) => {
  const invasionStrength = Math.floor(Math.random() * 6) + 1;

  const getDefenseStrength = () => {
    switch (props.affectedRegion.status) {
      case RegionStatus.Dominated:
      case RegionStatus.EmpireCapital:
        return (
          calculateEmpireStrength(props.affectedRegion.id, props.regions) ?? 0
        );
      case RegionStatus.Sovereign:
        return props.affectedRegion.towerLevel;
      default:
        console.error("Invalid status");
        return 0;
    }
  };

  const defenderStrength = getDefenseStrength();

  const foreignInvasionSuccessful = invasionStrength > defenderStrength;

  return (
    <>
      <DialogContent>
        <Typography>
          Foreign Invasion against {props.affectedRegion.id} with strength{" "}
          {invasionStrength}
        </Typography>
        {foreignInvasionSuccessful ? (
          <>
            <Typography>Foreign Invasion successful</Typography>
            <List>
              {props.affectedRegion.status === RegionStatus.EmpireCapital && (
                <>
                  <ListItem>
                    <b>Empire Shatters:</b> Remove large flag from{" "}
                    {props.affectedRegion.id}{" "}
                  </ListItem>
                  <ListItem>
                    remove empire's small flags from{" "}
                    {getEmpireDominatedRegionIds(
                      props.affectedRegion.id,
                      props.regions
                    ).join(", ")}{" "}
                  </ListItem>
                </>
              )}
              {props.affectedRegion.status === RegionStatus.Dominated && (
                <>
                  <ListItem>
                    <b>Remove Flags:</b> Remove dominating empires small flag
                    from {props.affectedRegion.id}{" "}
                  </ListItem>
                  {doesLossOfRegionCauseEmpireShatter(
                    props.affectedRegion,
                    props.regions
                  ) && (
                    <ListItem>
                      <b>Empire Decline:</b> remove large flag from{" "}
                      {props.affectedRegion.dominator}
                    </ListItem>
                  )}
                </>
              )}

              <ListItem>
                Set regions tower level to :{Math.floor(invasionStrength / 2)}
              </ListItem>
            </List>
          </>
        ) : (
          <Typography>Foreign Invasion failed</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => props.handleConfirm(true, invasionStrength)}>
          Confirm
        </Button>
      </DialogActions>
    </>
  );
};
