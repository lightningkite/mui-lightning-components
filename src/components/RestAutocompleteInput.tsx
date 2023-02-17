import {
  Condition,
  HasId,
  SessionRestEndpoint,
} from "@lightningkite/lightning-server-simplified";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import React, { ReactElement, useEffect, useState } from "react";
import { useThrottle } from "utils/hooks";
import { makeSearchConditions } from "utils/miscHelpers";

export type RestAutocompleteValue<T, Multiple> = Multiple extends
  | undefined
  | false
  ? T | null
  : T[];

export interface RestAutocompleteInputProps<
  T extends HasId,
  Multiple extends boolean | undefined
> {
  /** The model rest endpoint to fetch options from */
  restEndpoint: Pick<SessionRestEndpoint<T>, "query">;
  /** True to allow the user to select multiple options */
  multiple?: Multiple;
  /** Additional conditions to filter the values when requested from the endpoint */
  additionalQueryConditions?: Condition<T>[];
  /** Function to return the label (displayed option) for an item */
  getOptionLabel: (option: T) => string;
  /** Given an item, return true if it should be disabled */
  getOptionDisabled?: (option: T) => boolean;
  /** Non-nullable properties to search */
  searchProperties: (keyof T)[];
  /** Nullable properties to search */
  nullableSearchProperties?: (keyof T)[];
  /** Field label */
  label?: string;
  /** The currently selected item(s) */
  value: RestAutocompleteValue<T, Multiple>;
  /** Called when the selected item(s) change */
  onChange: (value: RestAutocompleteValue<T, Multiple>) => void;
  /** True if the field is invalid */
  error?: boolean;
  /** Field helper text */
  helperText?: string;
  /** True to force showing the field in a loading state */
  loading?: boolean;
  /** True to disable the field */
  disabled?: boolean;
  /** When any dependencies change, options will be re-fetched from the endpoint */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: any[];
}

/**
 * A wrapper around the MUI Autocomplete component that allows for selecting
 * one or multiple items from a server endpoint. Values are fetched asynchronously
 * as the user types.
 */
export function RestAutocompleteInput<
  T extends HasId,
  Multiple extends boolean | undefined = undefined
>(props: RestAutocompleteInputProps<T, Multiple>): ReactElement {
  const {
    restEndpoint,
    multiple = undefined,
    getOptionLabel,
    getOptionDisabled,
    label,
    searchProperties,
    nullableSearchProperties,
    value,
    onChange,
    error,
    helperText,
    additionalQueryConditions,
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
    const conditions = [...(additionalQueryConditions ?? [])];

    if (multiple || !value || inputText !== getOptionLabel(value as T)) {
      conditions.push(
        ...makeSearchConditions(
          throttledInputText.split(" "),
          searchProperties,
          nullableSearchProperties
        )
      );
    }

    if (multiple && Array.isArray(value)) {
      const alreadySelected = value.map((v) => v._id);
      conditions.push({ _id: { NotInside: alreadySelected } });
    }

    restEndpoint
      .query({
        condition: conditions.length ? { And: conditions } : { Always: true },
        limit: 10,
      })
      .then(setOptions)
      .finally(() => setFetching(false));
  }, [
    throttledInputText,
    restEndpoint,
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
      isOptionEqualToValue={(option, value) => option._id === value._id}
      getOptionLabel={getOptionLabel}
      getOptionDisabled={getOptionDisabled}
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
          error={error}
          helperText={helperText}
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}
