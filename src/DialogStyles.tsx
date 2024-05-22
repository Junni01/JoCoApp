import { Dialog } from "@mui/material";
export const EventDialog = (props: { children: React.ReactNode }) => {
  return (
    <Dialog open={true} fullWidth maxWidth={"md"}>
      {props.children}
    </Dialog>
  );
};
