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

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface CreateWebhookResponseWebhook
 */
export interface CreateWebhookResponseWebhook {
    /**
     * 
     * @type {string}
     * @memberof CreateWebhookResponseWebhook
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateWebhookResponseWebhook
     */
    endpoint?: string;
}

/**
 * Check if a given object implements the CreateWebhookResponseWebhook interface.
 */
export function instanceOfCreateWebhookResponseWebhook(value: object): value is CreateWebhookResponseWebhook {
    return true;
}

export function CreateWebhookResponseWebhookFromJSON(json: any): CreateWebhookResponseWebhook {
    return CreateWebhookResponseWebhookFromJSONTyped(json, false);
}

export function CreateWebhookResponseWebhookFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateWebhookResponseWebhook {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'endpoint': json['endpoint'] == null ? undefined : json['endpoint'],
    };
}

  export function CreateWebhookResponseWebhookToJSON(json: any): CreateWebhookResponseWebhook {
      return CreateWebhookResponseWebhookToJSONTyped(json, false);
  }

  export function CreateWebhookResponseWebhookToJSONTyped(value?: CreateWebhookResponseWebhook | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'endpoint': value['endpoint'],
    };
}

