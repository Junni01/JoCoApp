import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Elephant, Region, RegionName, RegionStatus } from "./Types";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";

type ElephantCardProps = {
  elephant: Elephant;
  setElephant: (elephant: Elephant) => void;
  regions: Region[];
};

export const ElephantCard = (props: ElephantCardProps) => {
  if (!props.elephant) {
    console.error("ElephantCard: Elephant is undefined");
    return <Card>Elephant is undefined</Card>;
  }

  const [elephantModifyDialogOpen, setElephantModifyDialogOpen] =
    useState<boolean>(false);

  const handleElephantDialogSave = (elephant: Elephant) => {
    props.setElephant(elephant);
    setElephantModifyDialogOpen(false);
  };

  return (
    <>
      <Card sx={{ width: "300px" }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Elephant</Typography>
            <IconButton
              onClick={() => {
                setElephantModifyDialogOpen(true);
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
          {props.elephant.TargetRegion ? (
            <Typography>
              {props.elephant.MainRegion}
              {" -> "}
              {props.elephant.TargetRegion}
            </Typography>
          ) : (
            <Typography>{props.elephant.MainRegion}</Typography>
          )}
        </CardContent>
      </Card>
      {elephantModifyDialogOpen && (
        <ModifyElephantDialog
          elephant={props.elephant}
          regions={props.regions}
          open={elephantModifyDialogOpen}
          onClose={() => setElephantModifyDialogOpen(false)}
          onConfirm={handleElephantDialogSave}
        />
      )}
    </>
  );
};

type ModifyElephantDialogProps = {
  elephant: Elephant;
  regions: Region[];
  open: boolean;
  onClose: () => void;
  onConfirm: (elephant: Elephant) => void;
};

const ModifyElephantDialog = (props: ModifyElephantDialogProps) => {
  const [modifiedElephant, setModifiedElephant] = useState<Elephant>(
    props.elephant
  );

  const mainRegion = props.regions.find(
    (r) => r.id === modifiedElephant.MainRegion
  );
  const targetRegion = props.regions.find(
    (r) => r.id === modifiedElephant.TargetRegion
  );

  const IsValidPlacement = () => {
    if (
      mainRegion?.status === RegionStatus.CompanyControlled &&
      targetRegion !== undefined
    ) {
      return false;
    }

    if (
      targetRegion?.status !== RegionStatus.CompanyControlled &&
      targetRegion === undefined
    ) {
      return false;
    }

    if (
      targetRegion?.status === RegionStatus.Dominated &&
      mainRegion?.id === targetRegion?.dominator
    ) {
      return false;
    }

    if (
      mainRegion?.status === RegionStatus.Dominated &&
      targetRegion?.id !== mainRegion?.dominator
    ) {
      return false;
    }

    return true;
  };

  const handleChangeMainRegion = (region: string) => {
    setModifiedElephant({
      MainRegion: region as RegionName,
      TargetRegion: undefined,
    });
  };

  const handleChangeTargetRegion = (region: string | undefined) => {
    setModifiedElephant({
      MainRegion: modifiedElephant.MainRegion,
      TargetRegion: region as RegionName,
    });
  };

  const renderElephantWarningText = () => {
    console.log(mainRegion);
    console.log(targetRegion);

    if (mainRegion?.status === RegionStatus.CompanyControlled) {
      if (targetRegion !== undefined) {
        return (
          <Typography>
            Company Controlled regions can't have a target region, elephant is
            always placed in the middle
          </Typography>
        );
      } else {
        return;
      }
    } else {
      if (targetRegion === undefined) {
        return (
          <Typography>
            If a region is not company controlled, elephant must have a target
            region
          </Typography>
        );
      } else {
        if (
          targetRegion?.status === RegionStatus.Dominated &&
          mainRegion?.id === targetRegion?.dominator
        ) {
          return (
            <Typography>
              {targetRegion.id} is dominated by {mainRegion?.id}. Empire Capital
              cannot target a region it already dominates
            </Typography>
          );
        } else if (
          mainRegion?.status === RegionStatus.Dominated &&
          targetRegion?.id !== mainRegion?.dominator
        ) {
          return (
            <Typography>
              {mainRegion?.id} is dominated by {targetRegion?.id}. Dominated
              regions can only target their dominating empire capital
            </Typography>
          );
        } else {
          return;
        }
      }
    }
  };

  return (
    <Dialog open={true} fullWidth maxWidth={"sm"}>
      <DialogContent>
        <Typography>Redirect Elephant</Typography>
        <Box display="flex" justifyContent="space-between">
          <FormControl>
            <InputLabel>Main Region</InputLabel>
            <Select
              sx={{ minWidth: "200px" }}
              value={modifiedElephant.MainRegion}
              label="Main Region"
              onChange={(e) => {
                handleChangeMainRegion(e.target.value);
              }}
            >
              {props.regions.map((region) => {
                return (
                  <MenuItem key={region.id} value={region.id}>
                    {region.id}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl>
            <InputLabel>Target Region</InputLabel>
            <Select
              sx={{ minWidth: "200px" }}
              value={modifiedElephant.TargetRegion ?? ""}
              label="target region"
              onChange={(e) => {
                handleChangeTargetRegion(e.target.value);
              }}
            >
              <MenuItem key="notarget" value={undefined}>
                No Target
              </MenuItem>
              {props.regions
                .filter((r) => r.id !== modifiedElephant.MainRegion)
                .map((region) => {
                  return (
                    <MenuItem key={region.id} value={region.id}>
                      {region.id}
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        </Box>
        <Box>{renderElephantWarningText()}</Box>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={!IsValidPlacement()}
          onClick={() => props.onConfirm(modifiedElephant)}
        >
          Save
        </Button>
        <Button onClick={() => props.onClose()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
