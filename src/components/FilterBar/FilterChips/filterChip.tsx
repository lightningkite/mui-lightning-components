import { FC } from "react";
import { FilterChipProps } from "../filterUtils";
import {
  createMultiSelectFilterChip,
  createSingleSelectFilterChip,
  SelectFilterChipProps,
} from "./multiselectFilter";
import {
  AsyncMultiSelectFilterChip,
  createAsyncMultiSelectFilterChip,
} from "./asyncMultiSelectFilterChip";

export const buildFilterChip = {
  multiSelect: createMultiSelectFilterChip,
  singleSelect: createSingleSelectFilterChip,
  asyncMultiSelect: createAsyncMultiSelectFilterChip,
};
