import { FormControl, FormHelperText, FormLabel, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import React,{InputHTMLAttributes} from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

const InputField: React.FC<InputFieldProps> = ({label,size: _,...props}) =>{
  const [field,{error}] = useField(props);
    return(
      <FormControl isInvalid={!!error}>
        <FormLabel htmlFor={field.name}>{label}</FormLabel>
        <Input {...field} {...props} id={field.name} />
        {error ? <FormHelperText>{error}</FormHelperText> : null }
      </FormControl>
    );
}

export default InputField;