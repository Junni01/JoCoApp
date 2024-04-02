import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region, RegionStatus } from "./Types";

type DeploySuccessfulDialogProps = {
  region: Region;
  regions: Region[];
  onOk: () => void;
};

export const DeploySuccessfulDialog = (props: DeploySuccessfulDialogProps) => {
  let loot = 0;

  if (props.region.lootAvailable) {
    loot += props.region.lootAmount;
  }
  loot += props.region.towerLevel;

  if (props.region.status === RegionStatus.CompanyControlled) {
    <Dialog open={true}>
      <DialogTitle>Deployment Successful to {props.region.id}</DialogTitle>
      <DialogContent>
        <Typography>
          Gained Loot: 1£ for commander and 1£ for every officer taking part in
          the deploy action
        </Typography>
        {props.region.unrest > 0}{" "}
        {<Typography>Remove all unrest in the region</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </Dialog>;
  } else if (props.region.status === RegionStatus.EmpireCapital) {
    const dominatedRegions = props.regions.filter(
      (r) => r.dominator === props.region.id
    );

    return (
      <Dialog open={true}>
        <DialogTitle>Deployment Successful to {props.region.id}</DialogTitle>
        <DialogContent>
          <Typography>Remove Capital flag from {props.region.id}.</Typography>
          <Typography>
            Remove small flags from: {dominatedRegions.join(",")}
          </Typography>
          <Typography>
            Replace region tower with Governor overlay associated with the
            presidency making the deploy action. Remove loot marker.
          </Typography>
          <Typography>
            Gain Loot: divide {loot}£ among commander, participating officers,
            troops and local alliances.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onOk}>Ok</Button>
        </DialogActions>
      </Dialog>
    );
  } else if (props.region.status === RegionStatus.Dominated) {
    <Dialog open={true}>
      <DialogTitle>Deployment Successful to {props.region.id}</DialogTitle>
      <DialogContent>
        <Typography>
          Replace region tower with Governor overlay associated with the
          presidency making the deploy action
        </Typography>
        <Typography>
          Gain Loot: divide {loot}£ among commander, participating officers,
          troops and local alliances.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </Dialog>;
  } else if (props.region.status === RegionStatus.Sovereign) {
    <Dialog open={true}>
      <DialogTitle>Deployment Successful to {props.region.id}</DialogTitle>
      <DialogContent>
        <Typography>
          Replace region tower with Governor overlay associated with the
          presidency making the deploy action
        </Typography>
        <Typography>
          Gain Loot: divide {loot}£ among commander, participating officers,
          troops and local alliances.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </Dialog>;
  }

  return (
    <Dialog open={true}>
      <DialogTitle>Deployment Successful</DialogTitle>
      <DialogContent>
        <Typography></Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};
