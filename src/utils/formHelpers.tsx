import { CheckboxProps, TextFieldProps } from "@mui/material";
import { DatePickerProps, DateTimePickerProps } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { FormikValues, useFormik } from "formik";
import React from "react";

export function makeFormikTextFieldProps<T extends FormikValues>(
  formik: ReturnType<typeof useFormik<T>>,
  field: keyof T
): TextFieldProps {
  return {
    name: field.toString(),
    value: formik.values[field],
    onChange: formik.handleChange,
    error: formik.touched[field] && !!formik.errors[field],
    helperText: formik.touched[field] && (formik.errors[field] as string),
  };
}

export function makeFormikNumericTextFieldProps<T extends FormikValues>(
  formik: ReturnType<typeof useFormik<T>>,
  field: keyof T
): TextFieldProps {
  return {
    name: field.toString(),
    value: formik.values[field],
    onChange: (e) => {
      const value = e.target.value;
      if (isNaN(+value)) return;
      const formattedValue = value === "" ? "" : value;
      formik.setFieldValue(field as string, formattedValue);
    },
    error: formik.touched[field] && !!formik.errors[field],
    helperText: formik.touched[field] && (formik.errors[field] as string),
    type: "number",
  };
}

export function makeFormikCheckboxProps<T extends FormikValues>(
  formik: ReturnType<typeof useFormik<T>>,
  field: keyof T
): CheckboxProps {
  return {
    name: field.toString(),
    checked: !!formik.values[field],
    onChange: (event) => {
      formik.setFieldValue(field as string, event.target.checked);
    },
  };
}

export function makeFormikAutocompleteProps<
  T extends FormikValues,
  K extends keyof T,
  V
>(formik: ReturnType<typeof useFormik<T>>, field: K) {
  return {
    value: formik.values[field],
    onChange: (value: V | null) =>
      formik.setFieldValue(field.toString(), value),
    error: !!formik.errors[field] && !!formik.touched[field],
    helperText:
      formik.touched[field] && (formik.errors[field] as string | undefined),
  };
}

export function makeFormikDateTimePickerProps<T extends FormikValues>(
  formik: ReturnType<typeof useFormik<T>>,
  field: keyof T
): Pick<DateTimePickerProps<Dayjs>, "value" | "onChange" | "slotProps"> {
  return {
    value: formik.values[field] as unknown as Dayjs | null,
    onChange: (value) => {
      formik.setFieldValue(field.toString(), value);
    },
    slotProps: {
      textField: {
        helperText:
          formik.touched[field] && formik.errors[field] && "Invalid date",
        error: formik.touched[field] && !!formik.errors[field],
        fullWidth: true,
      },
    },
  };
}

export function makeFormikDatePickerProps<T extends FormikValues>(
  formik: ReturnType<typeof useFormik<T>>,
  field: keyof T
): Pick<DatePickerProps<Dayjs>, "value" | "onChange" | "slotProps"> {
  return {
    value: formik.values[field] as unknown as Dayjs | null,
    onChange: (value) => {
      formik.setFieldValue(field.toString(), value);
    },
    slotProps: {
      textField: {
        helperText:
          formik.touched[field] && formik.errors[field] && "Invalid date",
        error: formik.touched[field] && !!formik.errors[field],
        fullWidth: true,
      },
    },
  };
}

export function dateOrNull(
  date: Date | null | undefined | string
): Date | null {
  return date && !isNaN(new Date(date).valueOf()) ? new Date(date) : null;
}

export function dateStringOrNull(
  date: Date | null | undefined | string
): string | null {
  return dateOrNull(date)?.toISOString().split("T")[0] ?? null;
}
