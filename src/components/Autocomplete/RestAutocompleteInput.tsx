import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { DependencyList, ReactElement, useEffect, useState } from "react";
import { useThrottle } from "utils/useThrottle";

export type RestAutocompleteValue<T, Multiple> = Multiple extends
  | undefined
  | false
  ? T | null
  : T[];

export interface RestAutocompleteInputProps<
  T,
  Multiple extends boolean | undefined
> {
  /** The model rest endpoint to fetch options from */
  itemGetter: (searchText: string) => Promise<T[]>;
  /** True to allow the user to select multiple options */
  multiple?: Multiple;
  /** Function to return the label (displayed option) for an item */
  getOptionLabel: (option: T) => string;
  getOptionId: (option: T) => string;
  /** Given an item, return true if it should be disabled */
  getOptionDisabled?: (option: T) => boolean;
  /** Field label */
  label?: string;
  /** Field placeholder */
  placeholder?: string;
  /** The currently selected item(s) */
  value: RestAutocompleteValue<T, Multiple>;
  /** Called when the selected item(s) change */
  onChange: (value: RestAutocompleteValue<T, Multiple>) => void;
  /** Field helper text */
  helperText?: string;
  /** True to force showing the field in a loading state */
  loading?: boolean;
  /** True to disable the field */
  disabled?: boolean;
  /** When any dependencies change, options will be re-fetched from the endpoint */
  dependencies?: DependencyList;
}

/**
 * A wrapper around the MUI Autocomplete component that allows for selecting
 * one or multiple items from a server endpoint. Values are fetched asynchronously
 * as the user types.
 */
export function RestAutocompleteInput<
  T,
  Multiple extends boolean | undefined = undefined
>(props: RestAutocompleteInputProps<T, Multiple>): ReactElement {
  const {
    itemGetter,
    multiple = undefined,
    getOptionLabel,
    getOptionId,
    getOptionDisabled,
    label,
    placeholder = "Type to search...",
    value,
    onChange,
    helperText,
    disabled,
    dependencies = [],
  } = props;

  const [inputText, setInputText] = useState("");
  const throttledInputText = useThrottle(inputText, 500);

  const [fetching, setFetching] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly T[]>([]);

  const loading = fetching || inputText !== throttledInputText || props.loading;

  useEffect(() => {
    setFetching(true);
    itemGetter(throttledInputText)
      .then(setOptions)
      .finally(() => setFetching(false));
  }, [
    throttledInputText,
    itemGetter,
    ...dependencies,
    ...(Array.isArray(value) ? [value.length] : []),
  ]);

  return (
    <Autocomplete
      multiple={multiple}
      disabled={disabled}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) =>
        getOptionId(option) === getOptionId(value)
      }
      getOptionLabel={getOptionLabel}
      getOptionDisabled={getOptionDisabled}
      getOptionKey={getOptionId}
      filterOptions={(x) => x}
      options={options}
      loading={loading}
      value={value}
      onChange={(_e, value) =>
        onChange(value as RestAutocompleteValue<T, Multiple>)
      }
      inputValue={inputText}
      onInputChange={(_e, value) => setInputText(value)}
      renderInput={(params) => (
        <TextField
          helperText={helperText}
          {...params}
          label={label}
          placeholder={placeholder}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
