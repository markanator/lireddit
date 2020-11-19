import React from 'react'
import { Box } from '@chakra-ui/react';

interface WrapperProps {

}

const Wrapper: React.FC<WrapperProps> = ({children}) =>{
    return(
      <Box>
        {children}
      </Box>
    );
}

export default Wrapper;