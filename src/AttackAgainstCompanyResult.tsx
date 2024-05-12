import { List, ListItem, Typography } from "@mui/material";
import { Presidency, Region, RegionStatus } from "./Types";

type AttackAgainstCompanyResultProps = {
  attackSuccessful: boolean;
  regionName: string;
  controllingPresidency: Presidency | undefined;
  isInvasion: boolean;
  invadingRegion: Region | undefined;
};

export const AttackAgainstCompanyResult = (
  props: AttackAgainstCompanyResultProps
) => {
  if (props.attackSuccessful) {
    return (
      <>
        {props.isInvasion ? (
          <Typography variant="h6">
            {props.invadingRegion?.id} successfully invades company controlled{" "}
            {props.regionName}
          </Typography>
        ) : (
          <Typography variant="h6">
            {props.regionName} successfully rebels against the Company
          </Typography>
        )}
        <List>
          <ListItem>
            <b>Tarnish the Commander's Name:</b> Commander or the army of{" "}
            {props.controllingPresidency} returns half (rounding up) of trophies
            their family owns to the supply. Return the Commander to it's supply
          </ListItem>
          <ListItem>
            <b>Officer Rout:</b> Roll a die for every officer in{" "}
            {props.controllingPresidency} Army and remove it if the rol is a 6
          </ListItem>
          <ListItem>
            <b>Governor Elimination:</b> If this region has a Governor, return
            it to the unused offices stack and return the officeholder's family
            member to that player's supply.{" "}
          </ListItem>
          <ListItem>
            <b>Restore Local Authority:</b> Remove the governor overlay, any
            Company ship, and any unrest in the region, and place a dome back in
            the region with one tower level.
          </ListItem>
          {props.isInvasion &&
            props.invadingRegion &&
            props.invadingRegion.status === RegionStatus.Sovereign && (
              <ListItem>
                <b>Create New Empire: </b> Place large flag with start on{" "}
                {props.invadingRegion.id}
              </ListItem>
            )}
          {props.isInvasion && (
            <ListItem>
              <b>Expand Empire: </b> Place {props.invadingRegion?.id ?? ""}{" "}
              empire's small flag on the region
            </ListItem>
          )}
          <ListItem>
            <b>Close Orders:</b> Close every open order in the region. If all
            are already closed, resolve a Cascade.
          </ListItem>
          <ListItem>
            <b>Company Humiliation:</b> Lower the Company's Standing by one to
            the left for each region lost this turn.
          </ListItem>
        </List>
      </>
    );
  } else {
    return (
      <>
        {props.isInvasion ? (
          <Typography variant="h6">
            {props.invadingRegion?.id} invasion to {props.regionName}{" "}
            successfully defeated by the Company
          </Typography>
        ) : (
          <Typography variant="h6">
            Rebellion in {props.regionName} successfully suppressed by the
            company
          </Typography>
        )}
        <List>
          <ListItem>
            <b>Restore Order:</b> Remove all unrest from {props.regionName}
          </ListItem>
          <ListItem>
            <b>Receive Merits:</b> Commander of {props.controllingPresidency}{" "}
            Army receives 1 Trophy token
          </ListItem>
          {props.isInvasion &&
            props.invadingRegion &&
            props.invadingRegion.towerLevel > 0 && (
              <ListItem>
                <b>Weaken Attacker:</b> Remove 1 tower level from{" "}
                {props.invadingRegion.id}
              </ListItem>
            )}
        </List>
      </>
    );
  }
};
