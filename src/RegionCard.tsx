import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";
import { Region, RegionStatus } from "./Types";

type RegionCardProps = {
  region: Region;
  handleDeployButtonClick: (region: Region | undefined) => void;
  handleModifyRegionClick: (region: Region | undefined) => void;
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

  return (
    <Card key={props.region.id} sx={{ width: "320px", height: "250px" }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">{props.region.id}</Typography>
          <Button
            variant="contained"
            onClick={() => {
              props.handleModifyRegionClick(props.region);
            }}
          >
            Modify
          </Button>
        </Box>

        <Typography>
          <b>Status:</b> {renderRegionStatus()}
        </Typography>

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
      <CardActions sx={{ alignContent: "end" }}>
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
  );
};
