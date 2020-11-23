import { withUrqlClient } from "next-urql";
import React from "react";
import { createUrqlClient } from "../../../utils/createUrqlClient";

//interface editPostProps {
//
//}

const editPost: React.FC<{}> = ({}) => {
  return <div className="">EDITING POST</div>;
};

export default withUrqlClient(createUrqlClient)(editPost);
