import {
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { marchElephant } from "../../Helpers";
import { Region, EventCard, Elephant, RegionStatus } from "../../Types";

export const PeaceEvent = (props: {
  drawStackRegion: Region;
  regions: Region[];
  event: EventCard;
  elephant: Elephant;
}) => {
  const newElephantRegion = marchElephant(
    props.drawStackRegion,
    props.regions,
    props.event.symbol
  );

  if (props.elephant.TargetRegion !== undefined) {
    const peaceTargetRegion = props.regions.find(
      (r) => r.id === props.elephant.TargetRegion
    );
    return (
      <>
        <DialogTitle>
          Event: Peace between <b>{props.elephant.MainRegion}</b> and{" "}
          <b>{props.elephant.TargetRegion}</b>
        </DialogTitle>

        <DialogContent>
          <List>
            <ListItem>
              <Typography>
                Open all orders that are connected through the border between{" "}
                <b>{props.elephant.MainRegion}</b> and{" "}
                <b>{props.elephant.TargetRegion}</b>
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Add one tower level to <b>{props.elephant.MainRegion}</b>{" "}
                {peaceTargetRegion?.status ===
                RegionStatus.CompanyControlled ? (
                  ""
                ) : (
                  <>
                    and <b>{props.elephant.TargetRegion}</b>
                  </>
                )}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Place elephant on <b>{newElephantRegion?.MainRegion}</b>{" "}
                {!newElephantRegion?.TargetRegion ? (
                  ""
                ) : (
                  <>
                    and face it towards <b>{newElephantRegion.TargetRegion}</b>
                  </>
                )}
              </Typography>
            </ListItem>
          </List>
        </DialogContent>
      </>
    );
  } else {
    return (
      <>
        <DialogTitle>
          Event: Peace in <b>{props.elephant.MainRegion}</b>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Open all orders and remove unrest in{" "}
            <b>{props.elephant.MainRegion}</b>
          </Typography>
          <Typography>
            Place elephant on <b>{newElephantRegion?.MainRegion}</b>{" "}
            {!newElephantRegion?.TargetRegion ? (
              ""
            ) : (
              <>
                and face it towards <b>{newElephantRegion.TargetRegion}</b>
              </>
            )}
          </Typography>
        </DialogContent>
      </>
    );
  }
};
