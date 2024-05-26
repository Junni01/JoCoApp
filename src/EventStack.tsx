import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useContext, useState } from "react";
import { GlobalEffectsContext } from "./GlobalEffectsContext";

export const EventStack = () => {
  const { drawEvent, drawStackRegion, eventTotal, setEventTotal } =
    useContext(GlobalEffectsContext);

  const [eventsDrawn, setEventsDrawn] = useState(0);

  const drawEventCard = () => {
    setEventsDrawn(eventsDrawn + 1);
    setEventTotal(eventTotal - 1);
    drawEvent();
  };

  const resetEventsDrawn = () => {
    setEventsDrawn(0);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant={"h5"}>Event Stack</Typography>
        <Typography>{drawStackRegion.id}</Typography>

        <Button onClick={drawEventCard}>Draw Event</Button>

        <Box display={"flex"}>
          <Typography>Events Drawn: {eventsDrawn}</Typography>
          <IconButton onClick={resetEventsDrawn}>
            <RestartAltIcon />
          </IconButton>
          <Typography>Events to Resolve: {eventTotal}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
