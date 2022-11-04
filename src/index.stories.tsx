import React, { PropsWithChildren } from "react";
import { Meta, Story } from "@storybook/react";
import { makeFormikAutocompleteProps, RestAutocompleteInput } from "./index";

const meta: Meta<PropsWithChildren<{}>> = {
  title: "Rest Autocomplete Input",
  component: RestAutocompleteInput,
  argTypes: {
    children: {
      description: "Content or elements to be rendered inside the Component",
      control: {
        type: "text",
      },
    },
  },
};

const Template: Story<PropsWithChildren<{}>> = (args) => (
  <RestAutocompleteInput
    {...makeFormikAutocompleteProps(formik, "multipleUsers")}
    multiple
    label="Select multiple users"
    apiEndpoint={session.user}
    getOptionLabel={(user) => `${user.name}`}
    searchProperties={["name"]}
  />
);

const Basic = Template.bind({});
Basic.args = {
  children: "Component",
};

export default meta;
export { Basic };
