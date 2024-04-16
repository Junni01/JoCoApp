import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Region, RegionStatus } from "./Types";
import { useState } from "react";

type ModifyRegionDialogProps = {
  region: Region | undefined;
  onSave: (region: Region) => void;
  onCancel: () => void;
};

export const ModifyRegionDialog = (props: ModifyRegionDialogProps) => {
  if (!props.region) {
    console.error("Modified region is undefined");
    return;
  }

  const [modifiedRegion, setModifiedRegion] = useState<Region>(props.region);

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
      <DialogTitle>Modify {props.region.id}</DialogTitle>
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
            props.onSave(modifiedRegion);
          }}
        >
          Save
        </Button>
        <Button onClick={props.onCancel}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
