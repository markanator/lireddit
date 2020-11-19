import React from 'react'
import {Formik,Form} from 'formik'
import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';

interface registerProps {

}

const register: React.FC<registerProps> = ({}) =>{
    return(
      <Wrapper>
          <Formik
            initialValues={{ username: "" }}
            onSubmit={(values) => {
              console.log({values});
            }}
            >
            {({values,handleChange}) => (
              <Form >
                <FormControl>
                  <FormLabel htmlFor="name">First name</FormLabel>
                  <Input value={values.username} onChange={handleChange} name="username" placeholder="name" />
                  {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */}
                </FormControl>
              </Form>
            )}
          </Formik>
        </Wrapper>
    )
}

export default register;