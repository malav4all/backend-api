import {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { GraphQLRequestContext } from 'apollo-server-core';

export const CustomStatusCodePlugin: ApolloServerPlugin = {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    return {
      async willSendResponse(requestContext: GraphQLRequestContext) {
        const { response } = requestContext;

        if (response.errors?.length > 0) {
          if (response.http) {
            response.http.status = response.errors[0].extensions.code;
          }
        }
      },
    };
  },
};
