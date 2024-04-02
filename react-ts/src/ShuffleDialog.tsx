import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type ShuffleDialogProps = {
  onOk: () => void;
};

export const ShuffleDialog = (props: ShuffleDialogProps) => {
  return (
    <Dialog open={true}>
      <DialogTitle>Event Shuffle</DialogTitle>
      <DialogContent>
        <Typography>Shuffling Discards on top of event deck</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};
