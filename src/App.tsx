import {
  Button,
  Dialog,
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
        <IndiaMap scenario={scenario} initialEventDeck={shuffledEventDeck} />
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
            <Button
              onClick={() => {
                setSetupDialogOpen(false);
              }}
            >
              Start Game
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default App;
