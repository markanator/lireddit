import { usePostDetailsQuery } from "../generated/graphql";
import { useGetPostId } from "./useGetPostId";

export const useGetPostFromUrl = () => {
  const intId = useGetPostId();

  return usePostDetailsQuery({
    variables: {
      id: intId,
    },
  });
};
