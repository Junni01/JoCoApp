import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Region, RegionStatus } from "./Types";
import SettingsIcon from "@mui/icons-material/Settings";
import { useContext, useState } from "react";
import { GlobalEffectsContext } from "./GlobalEffectsContext";

type RegionCardProps = {
  region: Region;
  handleDeployButtonClick: (region: Region) => void;
};

export const RegionCard = (props: RegionCardProps) => {
  const renderRegionStatus = () => {
    switch (props.region.status) {
      case RegionStatus.Sovereign:
        return "Independent";
      case RegionStatus.Dominated:
        return "Dominated";
      case RegionStatus.EmpireCapital:
        return "Empire Capital";
      case RegionStatus.CompanyControlled:
        return "Company Controlled";
      default:
        return "Unknown";
    }
  };

  const [showModifyRegionDialog, setShowModifyRegionDialog] =
    useState<boolean>(false);

  const handleModifyRegionClick = () => {
    setShowModifyRegionDialog(true);
  };

  const handleModifyRegionClose = () => {
    setShowModifyRegionDialog(false);
  };

  return (
    <>
      <Card
        key={props.region.id}
        sx={{ m: 2, width: "350px", height: "250px" }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">{props.region.id}</Typography>
            <IconButton
              onClick={() => {
                handleModifyRegionClick();
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Box>

          <Typography>
            <b>Status:</b> {renderRegionStatus()}
          </Typography>
          {(props.region.status === RegionStatus.Sovereign ||
            props.region.status === RegionStatus.EmpireCapital) && (
            <Typography>
              <b>Leader:</b> {props.region.leader ?? ""}
            </Typography>
          )}

          {props.region.status === RegionStatus.CompanyControlled && (
            <>
              <Typography>
                <b>Controlling Presidency:</b>
              </Typography>
              <Typography>{props.region.controllingPresidency}</Typography>
            </>
          )}
          {props.region.status === RegionStatus.Dominated && (
            <>
              <Typography>
                <b>Dominating Empire:</b>
              </Typography>
              <Typography>{props.region.dominator}</Typography>
            </>
          )}

          {props.region.status !== RegionStatus.CompanyControlled && (
            <Typography>
              <b>Tower Level:</b> {props.region.towerLevel}
            </Typography>
          )}

          <Typography>
            <b>Loot:</b>{" "}
            {props.region.lootAvailable ? props.region.lootAmount : "Collected"}
          </Typography>

          {props.region.unrest > 0 && (
            <Typography>
              <b>Unrest:</b> {props.region.unrest > 0 ? props.region.unrest : 0}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ marginTop: "auto" }}>
          <Button
            color="success"
            variant="contained"
            size="small"
            onClick={() => props.handleDeployButtonClick(props.region)}
          >
            Deploy
          </Button>
        </CardActions>
      </Card>
      {showModifyRegionDialog && (
        <ModifyRegionDialog
          region={props.region}
          onClose={handleModifyRegionClose}
        />
      )}
    </>
  );
};

export const ModifyRegionDialog = (props: {
  region: Region;
  onClose: () => void;
}) => {
  const globalEffects = useContext(GlobalEffectsContext);
  const { regions, setRegions } = globalEffects;

  const handleModifyRegionSave = () => {
    const newRegionArray = regions.filter((r) => r.id !== props.region.id);
    setRegions([...newRegionArray, modifiedRegion]);
    props.onClose();
  };

  const [modifiedRegion, setModifiedRegion] = useState<Region>(props.region);

  if (!modifiedRegion) {
    return null;
  }

  const handleUnrestChange = (value: number) => {
    if (modifiedRegion.unrest === 0 && value < 0) {
      return;
    }

    const unrest = modifiedRegion.unrest + value;
    setModifiedRegion({
      ...modifiedRegion,
      unrest: unrest,
    });
  };

  const isUnrestModifierAvailable = () => {
    if (props.region?.status === RegionStatus.CompanyControlled) {
      return true;
    }

    return false;
  };

  return (
    <Dialog open={true}>
      <DialogTitle>Modify {props.region?.id}</DialogTitle>
      <DialogContent>
        <Typography>
          {isUnrestModifierAvailable()
            ? "Modify Region unrest"
            : "Region is not company controlled and can't have unrest"}
        </Typography>
        <Button
          disabled={!isUnrestModifierAvailable()}
          onClick={() => {
            handleUnrestChange(1);
          }}
        >
          Increase unrest
        </Button>
        <Typography>Unrest: {modifiedRegion.unrest}</Typography>
        <Button
          disabled={!isUnrestModifierAvailable()}
          onClick={() => {
            handleUnrestChange(-1);
          }}
        >
          Decrease unrest
        </Button>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleModifyRegionSave();
          }}
        >
          Save
        </Button>
        <Button onClick={props.onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
