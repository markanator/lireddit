import { withUrqlClient } from "next-urql";
// locals
import Navbar from "../components/Navbar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar />
      <div>Hello world!</div>
      <br />
      {!data ? (
        <div className="">Loading...</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </>
  );
};

// supports ssr
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
