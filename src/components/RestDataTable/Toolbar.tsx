import { ArrowDropDown, Cancel, Close, Search } from "@mui/icons-material";
import {
  Stack,
  Button,
  Menu,
  MenuItem,
  styled,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  GridRowSelectionModel,
  GridToolbarProps,
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  Toolbar,
  QuickFilterTrigger,
  ToolbarButton,
} from "@mui/x-data-grid";
import { FC, ReactElement, useState } from "react";

export interface DataTableSelectAction {
  label: string;
  action: (itemIds: string[]) => void | Promise<unknown>;
  icon?: ReactElement;
}
export type ToolbarProps = {
  searchHeaderNames: string[];
  selectActions?: DataTableSelectAction[];
  selectionModel: GridRowSelectionModel;
};

const RestDataTableToolbar: FC<GridToolbarProps & ToolbarProps> = (props) => {
  const { searchHeaderNames, selectActions, selectionModel } = props;

  const [actionsMenuAnchor, setActionsMenuAnchor] =
    useState<null | HTMLElement>(null);

  return (
    <Toolbar>
      {!!selectionModel.ids.size && !!selectActions?.length && (
        <Button
          onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
          endIcon={<ArrowDropDown />}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Actions
        </Button>
      )}

      {searchHeaderNames.length > 0 && (
        <QuickFilter>
          <QuickFilterTrigger
            render={(triggerProps, state) => (
              <Tooltip title="Search" enterDelay={0}>
                <StyledToolbarButton
                  {...triggerProps}
                  ownerState={{ expanded: state.expanded }}
                  color="default"
                  aria-disabled={state.expanded}
                >
                  <Search fontSize="small" />
                </StyledToolbarButton>
              </Tooltip>
            )}
          />
          <QuickFilterControl
            render={({ ref, ...controlProps }, state) => (
              <StyledTextField
                {...controlProps}
                ownerState={{ expanded: state.expanded }}
                inputRef={ref}
                aria-label="Search"
                placeholder="Search..."
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: state.value ? (
                      <InputAdornment position="end">
                        <QuickFilterClear
                          edge="end"
                          size="small"
                          aria-label="Clear search"
                          material={{ sx: { marginRight: -0.75 } }}
                        >
                          <Cancel fontSize="small" />
                        </QuickFilterClear>
                      </InputAdornment>
                    ) : null,
                    ...controlProps.slotProps?.input,
                  },
                  ...controlProps.slotProps,
                }}
              />
            )}
          />
        </QuickFilter>
      )}

      <Menu
        id="basic-menu"
        anchorEl={actionsMenuAnchor}
        open={!!actionsMenuAnchor}
        onClose={() => setActionsMenuAnchor(null)}
      >
        {selectActions?.map((action) => (
          <MenuItem
            key={action.label}
            onClick={() => {
              action.action([...selectionModel.ids] as string[]);
              setActionsMenuAnchor(null);
            }}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </Toolbar>
  );
};

type OwnerState = {
  expanded: boolean;
};

const StyledToolbarButton = styled(ToolbarButton)<{ ownerState: OwnerState }>(
  ({ theme, ownerState }) => ({
    gridArea: "1 / 1",
    width: "min-content",
    height: "min-content",
    zIndex: 1,
    opacity: ownerState.expanded ? 0 : 1,
    pointerEvents: ownerState.expanded ? "none" : "auto",
    transition: theme.transitions.create(["opacity"]),
  })
);

const StyledTextField = styled(TextField)<{
  ownerState: OwnerState;
}>(({ theme, ownerState }) => ({
  gridArea: "1 / 1",
  overflowX: "clip",
  width: ownerState.expanded ? 260 : "var(--trigger-width)",
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(["width", "opacity"]),
}));

export default RestDataTableToolbar;
