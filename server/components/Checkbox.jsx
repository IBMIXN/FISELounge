import {
  FormControl,
  FormLabel,
  Checkbox as ChakraCheckbox,
} from "@chakra-ui/core";

const Checkbox = ({ field, type, label, checked }) => (
  <FormControl my="1rem">
    <FormLabel htmlFor="isCloudEnabled" name={field.name}>
      {label}
      <ChakraCheckbox
        ml="1rem"
        size="lg"
        {...field}
        type={type}
        checked={checked}
        defaultIsChecked={checked}
      />
    </FormLabel>
  </FormControl>
);

export default Checkbox;
