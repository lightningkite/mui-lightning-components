import { Box, SxProps, Theme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import React, { FC, useEffect, useState } from "react";

export interface HoverHelpProps {
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: React.ReactElement<any, any>;
  /**
   * Wrap the children in a Box component to enable compatibility with custom components
   * @default false
   */
  enableWrapper?: boolean;
  /** Sx props passed to the wrapper component if enabled */
  sx?: SxProps<Theme>;
}

export const HoverHelp: FC<HoverHelpProps> = (props) => {
  const { description, children, enableWrapper = false, sx } = props;
  const [open, setOpen] = useState(false);

  const handleClick = () => setOpen(false);

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <Tooltip
      title={description}
      enterDelay={750}
      open={open}
      onClose={() => setOpen(false)}
      onClick={() => setOpen(false)}
      onMouseEnter={() => setOpen(true)}
      placement="bottom-start"
    >
      {enableWrapper ? <Box sx={sx}>{children}</Box> : children}
    </Tooltip>
  );
};
