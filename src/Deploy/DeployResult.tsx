import { List, ListItem, Typography } from "@mui/material";
import { Elephant, Region, RegionStatus } from "../Types";
import {
  doesLossOfRegionCauseEmpireShatter,
  getEmpireDominatedRegionIds,
} from "../Helpers";
import { GlobalEffectsContext } from "../GlobalEffectsContext";
import { useContext } from "react";

type DeployResultProps = {
  targetRegion: Region | undefined;
  regions: Region[];
  deploySuccessful: boolean;
  elephant: Elephant;
};

export const DeployResult = (props: DeployResultProps) => {
  if (!props.targetRegion) {
    console.error("Invalid target region");
    return <Typography>Invalid target region</Typography>;
  }

  const globalEffectsContext = useContext(GlobalEffectsContext);

  let elephantRedirect: boolean = false;

  if (
    props.elephant.MainRegion === props.targetRegion?.id &&
    props.elephant.TargetRegion !== undefined
  ) {
    elephantRedirect = true;
  }

  let loot = 0;
  if (props.targetRegion.lootAvailable) {
    loot += props.targetRegion.lootAmount;
  }
  loot += props.targetRegion.towerLevel;

  if (props.deploySuccessful) {
    return (
      <>
        <Typography>Deploy action successful</Typography>
        <List>
          <ListItem>
            <Typography>
              <b>Check for Losses:</b> Each player must roll a die for each of
              their officers that were exhausted in this action. For each 6
              rolled, they must return one of their officers to their supply{" "}
            </Typography>
          </ListItem>
          {props.targetRegion.status === RegionStatus.CompanyControlled ? (
            <ListItem>
              <Typography>
                <b>Divide Loot:</b> Gather cash from the bank equal to the
                number of Officers + 1 (that were used in this deploy action,
                and survived) and{" "}
                {globalEffectsContext.globalEffects.TreasureReform
                  ? "add it to Company Balance"
                  : "distribute it among the Commander and surviving Officers."}
              </Typography>
            </ListItem>
          ) : (
            <ListItem>
              {globalEffectsContext.globalEffects.TreasureReform ? (
                <Typography>
                  <b>Divide Loot:</b> Add {loot} £ to the Company Balance. If
                  the loot is less than the number of survived officers + 1,
                  increase it by the difference from the bank.
                </Typography>
              ) : (
                <Typography>
                  <b>Divide Loot:</b> Distribute {loot} £ among those those that{" "}
                  <b>participated and survived</b> the Deploy action (Commander,
                  Officers, Regiments, Local Alliances). If the loot is less
                  than the number of survived officers + 1, increase it by the
                  difference from the bank.
                </Typography>
              )}
            </ListItem>
          )}
          {props.targetRegion.status !== RegionStatus.CompanyControlled &&
            props.targetRegion.towerLevel > 0 && (
              <ListItem>
                <Typography>
                  <b>Take Trophies:</b> Commander of the Army receives{" "}
                  {props.targetRegion.towerLevel === 1
                    ? "1 Trophy token"
                    : `${props.targetRegion.towerLevel} Trophy tokens`}
                </Typography>
              </ListItem>
            )}
          <ListItem>
            <Typography>
              <b>Impose Order:</b> Open all orders{" "}
              {props.targetRegion.status === RegionStatus.CompanyControlled &&
                "and remove any unrest"}{" "}
              in the region
            </Typography>
          </ListItem>

          {props.targetRegion.status !== RegionStatus.CompanyControlled && (
            <>
              {props.targetRegion.status === RegionStatus.Dominated && (
                <>
                  <ListItem>
                    <Typography>
                      <b>Remove Empire flags:</b> Remove{" "}
                      {props.targetRegion.dominator}'s empire flag from{" "}
                      {props.targetRegion.id}
                    </Typography>
                  </ListItem>
                  {doesLossOfRegionCauseEmpireShatter(
                    props.targetRegion,
                    props.regions
                  ) && (
                    <ListItem>
                      <Typography>
                        <b>Empire Decline:</b> {props.targetRegion.dominator}{" "}
                        Empire has no dominated regions. Remove Large empire
                        flag from {props.targetRegion.dominator}
                      </Typography>
                    </ListItem>
                  )}
                </>
              )}
              {props.targetRegion.status === RegionStatus.EmpireCapital && (
                <>
                  <ListItem>
                    <Typography>
                      <b>Shattered Empire:</b> Remove large flag from{" "}
                      {props.targetRegion.id} and then remove{" "}
                      {props.targetRegion.id}'s empire small flags from{" "}
                      {getEmpireDominatedRegionIds(
                        props.targetRegion.id,
                        props.regions
                      ).join(", ")}
                    </Typography>
                  </ListItem>
                </>
              )}
              {globalEffectsContext.globalEffects.GovernorGeneral ? (
                <ListItem>
                  <Typography>
                    <b>Instate Company Control:</b>Remove dome from region. Move
                    the {props.targetRegion.lootAvailable ? "loot" : "control"}{" "}
                    token to the space above to the presidency's box. This
                    Region is now Company-controlled.
                  </Typography>
                </ListItem>
              ) : (
                <ListItem>
                  <Typography>
                    <b>Form Governorship:</b>Remove dome from region, replace it
                    with the governor overlay. Move the{" "}
                    {props.targetRegion.lootAvailable ? "loot" : "control"}{" "}
                    token to the space above the President's box. This region is
                    now associated with this President. Place the matching
                    Governor card from the stack of unused offices and place it
                    in the Vacant Offices Box. This Region is now
                    Company-controlled.
                  </Typography>
                </ListItem>
              )}
            </>
          )}
          {props.targetRegion.status !== RegionStatus.CompanyControlled &&
            elephantRedirect && (
              <ListItem>
                <Typography>
                  <b>Elephant Redirect:</b> Place the elephant in the middle of{" "}
                  {props.targetRegion.id}
                </Typography>
              </ListItem>
            )}
        </List>
      </>
    );
  } else {
    return (
      <>
        <Typography>Deploy action failed</Typography>
        <List>
          <ListItem>
            <Typography>
              <b>Check for Losses:</b> Each player must roll a die for each of
              their officers that were exhausted in this action. For each 6
              rolled, they must return one of their officers to their supply{" "}
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              <b>Catastrophic Failure:</b> If the deploy action is a
              catastrophic failure, first return half (rounding up) of your
              trophies to the supply and return the Commander to your supply.
            </Typography>
          </ListItem>
        </List>
      </>
    );
  }
};
