import { List, ListItem, Typography } from "@mui/material";
import { Region, RegionStatus } from "./Types";
import {
  doesLossOfRegionCauseEmpireShatter,
  getEmpireDominatedRegionIds,
} from "./Helpers";

type DeployResultProps = {
  targetRegion: Region;
  regions: Region[];
  deploySuccessful: boolean;
};

export const DeployResult = (props: DeployResultProps) => {
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
            <b>Check for Losses:</b> Each player must roll a die for each of
            their officers that were exhausted in this action. For each 6
            rolled, they must return one of their officers to their supply{" "}
          </ListItem>
          {props.targetRegion.status === RegionStatus.CompanyControlled ? (
            <ListItem>
              <b>Divide Loot:</b> Gather cash from the bank equal to the number
              of Officers + 1 (that were used in this deploy action, and
              survived) and distribute it among the Commander and surviving
              Officers.
            </ListItem>
          ) : (
            <ListItem>
              <b>Divide Loot:</b> Distribute {loot} £ among those those that{" "}
              <b>participated and survived</b> the Deploy action (Commander,
              Officers, Regiments, Local Alliances). If the loot is less than
              the number of survived officers + 1, increase it by the difference
              from the bank.
            </ListItem>
          )}
          {props.targetRegion.status !== RegionStatus.CompanyControlled &&
            props.targetRegion.towerLevel > 0 && (
              <ListItem>
                <b>Take Trophies:</b> Commander of the Army receives{" "}
                {props.targetRegion.towerLevel === 1
                  ? "1 Trophy token"
                  : `${props.targetRegion.towerLevel} Trophy tokens`}
              </ListItem>
            )}
          <ListItem>
            <b>Impose Order:</b> Open all orders{" "}
            {props.targetRegion.status === RegionStatus.CompanyControlled &&
              "and remove any unrest"}{" "}
            in the region
          </ListItem>

          {props.targetRegion.status !== RegionStatus.CompanyControlled && (
            <>
              {props.targetRegion.status === RegionStatus.Dominated && (
                <>
                  <ListItem>
                    <b>Remove Empire flags:</b> Remove{" "}
                    {props.targetRegion.dominator}'s empire flag from{" "}
                    {props.targetRegion.id}
                  </ListItem>
                  {doesLossOfRegionCauseEmpireShatter(
                    props.targetRegion,
                    props.regions
                  ) && (
                    <ListItem>
                      <b>Empire Decline:</b> {props.targetRegion.dominator}{" "}
                      Empire has no dominated regions. Remove Large empire flag
                      from {props.targetRegion.dominator}
                    </ListItem>
                  )}
                </>
              )}
              {props.targetRegion.status === RegionStatus.EmpireCapital && (
                <>
                  <ListItem>
                    <b>Shattered Empire:</b> Remove large flag from{" "}
                    {props.targetRegion.id} and then remove{" "}
                    {props.targetRegion.id}'s empire small flags from{" "}
                    {getEmpireDominatedRegionIds(
                      props.targetRegion.id,
                      props.regions
                    ).join(", ")}
                  </ListItem>
                </>
              )}
              <ListItem>
                <b>Form Governorship:</b> Move the{" "}
                {props.targetRegion.lootAvailable ? "loot" : "control"} token to
                the space above the President's box. This region is now
                associated with this President. Place the matching Governor card
                from the stack of unused offices and place it in the Vacant
                Offices Box. This Region is now Company-controlled.
              </ListItem>
            </>
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
            <b>Check for Losses:</b> Each player must roll a die for each of
            their officers that were exhausted in this action. For each 6
            rolled, they must return one of their officers to their supply{" "}
          </ListItem>
          <ListItem>
            <b>Catastrophic Failure:</b> If the deploy action is a catastrophic
            failure, first return half (rounding up) of your trophies to the
            supply and return the Commander to your supply.
          </ListItem>
        </List>
      </>
    );
  }
};
