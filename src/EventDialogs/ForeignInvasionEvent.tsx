import { useContext, useState } from "react";
import { Elephant, Region, RegionName, RegionStatus, SeaZone } from "../Types";
import {
  Button,
  Dialog,
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
} from "../Helpers";
import { EventDialog } from "../DialogStyles";

type ForeignInvasionEventProps = {
  regions: Region[];
  setRegions: (regions: Region[]) => void;
  elephant: Elephant;
  setElephant: (elephant: Elephant) => void;
  drawStackRegion: Region;
  onOk: () => void;
};

export const ForeignInvasionEvent = (props: ForeignInvasionEventProps) => {
  enum ForeignInvasionPage {
    InvasionRegions,
    InvasionResolve,
    InvasionResults,
  }

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
        return [props.drawStackRegion.id];
      default:
        console.error("Invalid SeaZone");
        return [];
    }
  };

  const [foreignInvasionRegions, setForeignInvasionRegions] = useState<
    Region[]
  >(
    rollForeignInvasion().map(
      (regionId) => props.regions.find((r) => r.id === regionId)!
    ) as Region[]
  );
  const [foreignInvasionPage, setForeignInvasionPage] =
    useState<ForeignInvasionPage>(ForeignInvasionPage.InvasionRegions);

  const renderDialogContent = () => {
    switch (foreignInvasionPage) {
      case ForeignInvasionPage.InvasionRegions:
        return (
          <ForeignInvasionRegions
            affectedRegions={foreignInvasionRegions}
            handleConfirm={() =>
              setForeignInvasionPage(ForeignInvasionPage.InvasionResolve)
            }
            handleCancel={props.onOk}
          />
        );
      case ForeignInvasionPage.InvasionResolve:
        return (
          <ForeignInvasionResolve
            affectedRegions={foreignInvasionRegions}
            regions={props.regions}
            handleConfirm={props.onOk}
          />
        );
        break;
      case ForeignInvasionPage.InvasionResults:
        return <div></div>;
    }
  };

  return (
    <EventDialog>
      <DialogTitle>Foreign Invasion</DialogTitle>
      {renderDialogContent()}
    </EventDialog>
  );
};

const ForeignInvasionRegions = (props: {
  affectedRegions: Region[];
  handleConfirm: () => void;
  handleCancel: () => void;
}) => {
  console.log("ForeignInvasionRegions", props.affectedRegions);
  return (
    <>
      <DialogContent>
        <Typography>
          The following regions are affected by the foreign invasion:
        </Typography>
        <ul>
          {props.affectedRegions.map((region) => (
            <li key={region.id}>{region.id}</li>
          ))}
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleConfirm}>Confirm</Button>
        <Button onClick={props.handleCancel}>Cancel</Button>
      </DialogActions>
    </>
  );
};

export const ForeignInvasionResolve = (props: {
  affectedRegions: Region[];
  regions: Region[];
  handleConfirm: () => void;
}) => {
  const [invadedRegionIndex, setInvadedRegionIndex] = useState(0);

  const handleInvasionResolution = (
    invasionDefeated: boolean,
    invasionStrength: number
  ) => {
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
        affectedRegion={props.affectedRegions[invadedRegionIndex]}
        handleConfirm={handleInvasionResolution}
      />
    );
  } else {
    return (
      <ForeignInvasionAgainstIndia
        affectedRegion={props.affectedRegions[invadedRegionIndex]}
        regions={props.regions}
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
          <Button
            onClick={() =>
              props.handleConfirm(invasionDefeated, invasionStrength)
            }
          >
            Confirm
          </Button>
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
      case RegionStatus.CompanyControlled:
        console.error("Invalid status");
        return 0;
      case RegionStatus.Dominated:
        return (
          calculateEmpireStrength(props.affectedRegion.id, props.regions) ?? 0
        );
      case RegionStatus.Sovereign:
        return props.affectedRegion.towerLevel;
      case RegionStatus.EmpireCapital:
        return (
          calculateEmpireStrength(props.affectedRegion.id, props.regions) ?? 0
        );
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
