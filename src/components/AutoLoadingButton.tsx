import { useState } from "react";
import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import {
  ListItemButton,
  ListItemIcon,
  CircularProgress,
  ListItemText,
} from "@mui/material";

interface AutoLoadingButtonProps
  extends Omit<LoadingButtonProps, "onClick" | "loading"> {
  onClick: () => Promise<any>;
}

export function AutoLoadingButton({
  onClick,
  ...rest
}: AutoLoadingButtonProps) {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    onClick().finally(() => setLoading(false));
  }

  return <LoadingButton {...rest} onClick={handleClick} loading={loading} />;
}

export const AutoLoadingListItemButton = ({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => Promise<any>;
  icon: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error("Error in button click:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ListItemButton onClick={handleClick} disabled={loading}>
      {icon && (
        <ListItemIcon>
          {loading ? <CircularProgress size={20} /> : icon}
        </ListItemIcon>
      )}
      <ListItemText>{label}</ListItemText>
    </ListItemButton>
  );
};
