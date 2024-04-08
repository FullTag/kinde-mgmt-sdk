/* tslint:disable */
/* eslint-disable */
/**
 * Kinde Management API
 * Provides endpoints to manage your Kinde Businesses
 *
 * The version of the OpenAPI document: 1
 * Contact: support@kinde.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  TokenErrorResponse,
  TokenIntrospect,
  UserProfile,
  UserProfileV2,
} from '../models/index';
import {
    TokenErrorResponseFromJSON,
    TokenErrorResponseToJSON,
    TokenIntrospectFromJSON,
    TokenIntrospectToJSON,
    UserProfileFromJSON,
    UserProfileToJSON,
    UserProfileV2FromJSON,
    UserProfileV2ToJSON,
} from '../models/index';

export interface TokenIntrospectionRequest {
    token?: string;
    tokenType?: string;
}

export interface TokenRevocationRequest {
    token?: string;
    clientId?: string;
    clientSecret?: string;
}

/**
 * 
 */
export class OAuthApi extends runtime.BaseAPI {

    /**
     * Contains the id, names and email of the currently logged in user. 
     * Get User Profile
     */
    async getUserRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserProfile>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/oauth2/user_profile`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserProfileFromJSON(jsonValue));
    }

    /**
     * Contains the id, names and email of the currently logged in user. 
     * Get User Profile
     */
    async getUser(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserProfile> {
        const response = await this.getUserRaw(initOverrides);
        return await response.value();
    }

    /**
     * Contains the id, names, profile picture URL and email of the currently logged in user. 
     * Returns the details of the currently logged in user
     */
    async getUserProfileV2Raw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserProfileV2>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/oauth2/v2/user_profile`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserProfileV2FromJSON(jsonValue));
    }

    /**
     * Contains the id, names, profile picture URL and email of the currently logged in user. 
     * Returns the details of the currently logged in user
     */
    async getUserProfileV2(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserProfileV2> {
        const response = await this.getUserProfileV2Raw(initOverrides);
        return await response.value();
    }

    /**
     * Retrieve information about the provided token.
     * Get token details
     */
    async tokenIntrospectionRaw(requestParameters: TokenIntrospectionRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokenIntrospect>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const consumes: runtime.Consume[] = [
            { contentType: 'application/x-www-form-urlencoded' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters['token'] != null) {
            formParams.append('token', requestParameters['token'] as any);
        }

        if (requestParameters['tokenType'] != null) {
            formParams.append('token_type', requestParameters['tokenType'] as any);
        }

        const response = await this.request({
            path: `/oauth2/introspect`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TokenIntrospectFromJSON(jsonValue));
    }

    /**
     * Retrieve information about the provided token.
     * Get token details
     */
    async tokenIntrospection(requestParameters: TokenIntrospectionRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokenIntrospect> {
        const response = await this.tokenIntrospectionRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Revoke a previously issued token.
     * Revoke token
     */
    async tokenRevocationRaw(requestParameters: TokenRevocationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("kindeBearerAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const consumes: runtime.Consume[] = [
            { contentType: 'application/x-www-form-urlencoded' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters['token'] != null) {
            formParams.append('token', requestParameters['token'] as any);
        }

        if (requestParameters['clientId'] != null) {
            formParams.append('client_id', requestParameters['clientId'] as any);
        }

        if (requestParameters['clientSecret'] != null) {
            formParams.append('client_secret', requestParameters['clientSecret'] as any);
        }

        const response = await this.request({
            path: `/oauth2/revoke`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Revoke a previously issued token.
     * Revoke token
     */
    async tokenRevocation(requestParameters: TokenRevocationRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.tokenRevocationRaw(requestParameters, initOverrides);
    }

}