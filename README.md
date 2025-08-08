# MUI Lightning Components

[![npm latest package](https://img.shields.io/npm/v/@lightningkite/mui-lightning-components/latest.svg)](https://www.npmjs.com/package/@lightningkite/mui-lightning-components)  

MUI based React components to use in projects with a Lightning Server backend.

## Rest Data Table

A paginated table that fetches rows asynchronously from a REST endpoint. For information on how to use the columns prop, see [MUI-X Datagrid documentation](https://mui.com/x/react-data-grid/column-definition/).

```tsx
<RestDataTable
  getRows={getRowsFromEndpoint({
    endpoint: api.user,
    condition: {And: filter}
  })}
  onRowClick={(user) => navigate(`/users/${user._id}`)}
  searchFields={["name", "email"]}
  dependencies={[refreshTrigger, filter]}
  columns={[
    {field: "name", headerName: "User Name", flex: 1},
    {field: "email", headerName: "Email", flex: 1}
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
  itemGetter={getOptionsFromQuery({
    getOptions: api.user.query,
    searchFields: ["name", "email"]
  })}
  getOptionLabel={(user) => user.name}
  getOptionId={(user) => user._id}
/>
```
