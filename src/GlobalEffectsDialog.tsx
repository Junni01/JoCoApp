import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { GlobalEffectsContext } from "./GlobalEffectsContext";

type GlobalEffectsDialogProps = {
  onClose: () => void;
};

export const GlobalEffectsDialog = (props: GlobalEffectsDialogProps) => {
  const globalEffectsContext = useContext(GlobalEffectsContext);

  const handleForeignInvasion = () => {
    globalEffectsContext.setGlobalEffects({
      ...globalEffectsContext.globalEffects,
      TreasureReform: !globalEffectsContext.globalEffects.TreasureReform,
      SepoyRecruitment: !globalEffectsContext.globalEffects.TreasureReform,
      GovernorGeneral: !globalEffectsContext.globalEffects.TreasureReform,
    });
  };

  return (
    <Dialog fullWidth maxWidth={"md"} open={true}>
      <DialogTitle>Global Effects</DialogTitle>
      <DialogContent>
        <Typography>Law in effect</Typography>
        <FormGroup>
          <FormControlLabel
            checked={globalEffectsContext.globalEffects.TreasureReform}
            control={
              <Checkbox
                onChange={(e) => {
                  globalEffectsContext.setGlobalEffects({
                    ...globalEffectsContext.globalEffects,
                    TreasureReform: e.target.checked,
                  });
                }}
              />
            }
            label="Treasure Reform (All loot is now added to the Company balance)"
          />
          <FormControlLabel
            checked={globalEffectsContext.globalEffects.SepoyRecruitment}
            control={
              <Checkbox
                onChange={(e) =>
                  globalEffectsContext.setGlobalEffects({
                    ...globalEffectsContext.globalEffects,
                    SepoyRecruitment: e.target.checked,
                  })
                }
              />
            }
            label="Sepoy Recruitment (In Attack against the Company, each unrest is worth +1 strength)"
          />
          <FormControlLabel
            checked={globalEffectsContext.globalEffects.GovernorGeneral}
            control={
              <Checkbox
                onChange={(e) => {
                  globalEffectsContext.setGlobalEffects({
                    ...globalEffectsContext.globalEffects,
                    GovernorGeneral: e.target.checked,
                  });
                }}
              />
            }
            label="Governor General (Governors not in effect)"
          />
        </FormGroup>

        <Typography>Special Event</Typography>
        <Button onClick={handleForeignInvasion}>
          War against France Failed (Resolve Foreign Invasion In home Regions)
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
