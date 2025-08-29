## Installation and Setup

### Using the Lightning Kite React Starter

If you are using the [Lightning Kite React Starter](https://github.com/lightningkite/lk-react-starter), you can skip this section. MUI Lightning Components is already installed and configured.

### Adding to an Existing Project

```bash
npm install @lightningkite/mui-lightning-components
```

MUI Lightning Components has the following peer dependencies; ensure they are also installed:

- @emotion/react
- @emotion/styled
- @lightningkite/lightning-server-simplified
- @mui/material
- @mui/x-data-grid
- @mui/x-date-pickers
- dayjs
- formik
- react
- react-dom

MUI-X components require a localization provider be set up.

```tsx
// App.tsx
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// ...

return (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    // ... your app here
  </LocalizationProvider>
);
```
