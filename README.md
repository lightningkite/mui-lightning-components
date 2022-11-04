# MUI Lightning Components

MUI based React components to use in projects with a Lightning Server backend.

## Rest Data Table

A paginated table that fetches rows asynchronously from a REST endpoint. For information on how to use the columns prop, see [MUI-X Datagrid documentation](https://mui.com/x/react-data-grid/column-definition/).

```tsx
<RestDataTable
  restEndpoint={session.user}
  onRowClick={(user) => navigate(`/users/${user._id}`)}
  searchFields={["name", "email"]}
  columns={[
    { field: "name", headerName: "User Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "modifiedAt",
      headerName: "Last Modified",
      width: 120,
      type: "date",
      valueGetter: ({ value }) => new Date(value),
      valueFormatter: ({ value }) => value.toLocaleDateString(),
    },
  ]}
/>
```

## Rest Autocomplete

A component for selecting either one or multiple values from a REST endpoint. The component uses the [Autocomplete](https://mui.com/components/autocomplete/) component from MUI.

```tsx
<RestAutocompleteInput
  {...makeFormikAutocompleteProps(formik, "multipleUsers")}
  multiple
  label="Select multiple users"
  restEndpoint={session.user}
  getOptionLabel={(user) => `${user.name}`}
  searchProperties={["name"]}
/>
```

## Hover Help

A component for displaying help text on hover. The component uses the [Tooltip](https://mui.com/components/tooltips/) component from MUI.

```tsx
<HoverHelp description="Delete this user">
  <Button color="error">Delete</Button>
</HoverHelp>
```
