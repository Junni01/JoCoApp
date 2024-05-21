import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { IndiaMap } from "./IndiaMap";
import { Scenario } from "./Types";
import { useState } from "react";
import { getInitialEventDeck } from "./Data";
import { shuffleEventPile } from "./Helpers";
import { GlobalEffectsProvider } from "./GlobalEffectsContext";

function App() {
  const [SetupDialogOpen, setSetupDialogOpen] = useState(true);

  const [scenario, setScenario] = useState<Scenario>(Scenario.SeventeenTen);

  const initialEventDeck = getInitialEventDeck();
  const shuffledEventDeck = shuffleEventPile(initialEventDeck);

  const handleSetScenario = (scenario: Scenario) => {
    setScenario(scenario);
  };

  return (
    <>
      {!SetupDialogOpen && (
        <GlobalEffectsProvider>
          <IndiaMap scenario={scenario} initialEventDeck={shuffledEventDeck} />
        </GlobalEffectsProvider>
      )}
      {SetupDialogOpen && (
        <Dialog open={true}>
          <DialogContent>
            <FormControl>
              <FormLabel>Select Scenario: </FormLabel>
              <RadioGroup
                onChange={(e) => {
                  handleSetScenario(e.target.value as Scenario);
                }}
                value={scenario}
              >
                <FormControlLabel
                  value={Scenario.SeventeenTen}
                  control={<Radio />}
                  label={"1710"}
                />
                <FormControlLabel
                  value={Scenario.SeventeenFiftyEight}
                  control={<Radio />}
                  label={"1758"}
                />
                <FormControlLabel
                  value={Scenario.EighteenThirteen}
                  control={<Radio />}
                  label={"1813"}
                />
              </RadioGroup>
            </FormControl>
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => {
                  setSetupDialogOpen(false);
                }}
              >
                Start Game
              </Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default App;
