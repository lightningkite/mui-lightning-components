import { CheckboxProps, TextField, TextFieldProps } from "@mui/material";
import { DateTimePickerProps } from "@mui/x-date-pickers";
// import {RichTextEditorProps} from "components/Activity/ActivityEditor"
// import {HCPSelectProps} from "components/HCPSelect"
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

// export function makeFormikRichTextEditorProps<T extends FormikValues>(
//   formik: ReturnType<typeof useFormik<T>>,
//   field: keyof T
// ): Pick<
//   RichTextEditorProps,
//   "initialBody" | "onTextChange" | "error" | "helperText"
// > {
//   return {
//     initialBody: formik.values[field],
//     onTextChange: (newText) => formik.setFieldValue(field as string, newText),
//     error: formik.touched[field] && !!formik.errors[field],
//     helperText:
//       (formik.touched[field] && formik.errors[field]?.toString()) || undefined
//   }
// }

// export function makeFormikHCPUploadProps<T extends FormikValues>(
//   formik: ReturnType<typeof useFormik<T>>,
//   field: keyof T
// ): Pick<HCPUploadProps, "file" | "setFile" | "error" | "helperText"> {
//   return {
//     file: formik.values[field],
//     setFile: (file) => formik.setFieldValue(field as string, file),
//     error: formik.touched[field] && !!formik.errors[field],
//     helperText:
//       (formik.touched[field] && formik.errors[field]?.toString()) || undefined
//   }
// }

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
      const formattedValue = value === "" ? "" : Number(value).toString();
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

// export function makeFormikHCPSelectProps<T extends FormikValues>(
//   formik: ReturnType<typeof useFormik<T>>,
//   field: keyof T
// ): Omit<HCPSelectProps, "options"> {
//   return {
//     value: formik.values[field] as unknown as string,
//     onChange: (e) => formik.setFieldValue(field as string, e.target.value),
//     error: formik.touched[field] && !!formik.errors[field],
//     helperText:
//       formik.touched[field] && (formik.errors[field] as string | undefined)
//   }
// }

export function makeFormikDateTimePickerProps<T extends FormikValues>(
  formik: ReturnType<typeof useFormik<T>>,
  field: keyof T
): Pick<
  DateTimePickerProps<Date | null, unknown>,
  "value" | "onChange" | "renderInput"
> {
  return {
    value: formik.values[field] as unknown as Date | null,
    onChange: (value) => {
      formik.setFieldValue(
        field.toString(),
        (value as Dayjs | null)?.toDate() ?? null
      );
    },
    renderInput: (params) => (
      <TextField
        {...params}
        helperText={
          formik.touched[field] && formik.errors[field] && "Invalid date"
        }
        error={formik.touched[field] && !!formik.errors[field]}
        fullWidth
      />
    ),
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
