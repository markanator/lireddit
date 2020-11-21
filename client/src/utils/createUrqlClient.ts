import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
} from "../generated/graphql";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { pipe, tap } from "wonka";
// locals
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("Not Authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey); // returns an array of queries
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName); // filter what we dont want
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isInCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    ); // will return an array of posts:id

    // if posts are not in cache setPartials ✔
    info.partial = !isInCache; // will return bool

    let results: string[] = [];
    let hasMore: boolean = true;
    // combining fresh posts with cache
    fieldInfos.forEach((info) => {
      // will iterate through and read data from cache
      const key = cache.resolveFieldByKey(entityKey, info.fieldKey) as string; // cache key
      const data = cache.resolve(key, "posts") as string[]; // cache array data
      const _hasMore = cache.resolve(key, "hasMore"); // cached bool for more content

      if (!_hasMore) {
        // no more? set to FALSE!
        hasMore = _hasMore as boolean;
      }

      // pagination from first...n page => one long cached content array
      results.push(...data);
    });

    return {
      __typename: "PaginatedPosts", // manual else other
      hasMore,
      posts: results,
    };
  };
};

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:7777/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  // cache stuff
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        },
      },
      updates: {
        Mutation: {
          logout: (_result, _, cache, __) => {
            betterUpdateQuery<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            );
          },
          login: (_result, _, cache, __) => {
            // cache.updateQuery({ query: MeDocument }, (data) => {});
            betterUpdateQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                // result func
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          register: (_result, _, cache, __) => {
            // cache.updateQuery({ query: MeDocument }, (data) => {});
            betterUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});
