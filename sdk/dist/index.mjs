// src/runtime.ts
var BASE_PATH = "https://app.kinde.com".replace(/\/+$/, "");
var Configuration = class {
  constructor(configuration = {}) {
    this.configuration = configuration;
  }
  set config(configuration) {
    this.configuration = configuration;
  }
  get basePath() {
    return this.configuration.basePath != null ? this.configuration.basePath : BASE_PATH;
  }
  get fetchApi() {
    return this.configuration.fetchApi;
  }
  get middleware() {
    return this.configuration.middleware || [];
  }
  get queryParamsStringify() {
    return this.configuration.queryParamsStringify || querystring;
  }
  get username() {
    return this.configuration.username;
  }
  get password() {
    return this.configuration.password;
  }
  get apiKey() {
    const apiKey = this.configuration.apiKey;
    if (apiKey) {
      return typeof apiKey === "function" ? apiKey : () => apiKey;
    }
    return void 0;
  }
  get accessToken() {
    const accessToken = this.configuration.accessToken;
    if (accessToken) {
      return typeof accessToken === "function" ? accessToken : async () => accessToken;
    }
    return void 0;
  }
  get headers() {
    return this.configuration.headers;
  }
  get credentials() {
    return this.configuration.credentials;
  }
};
var DefaultConfig = new Configuration();
var BaseAPI = class _BaseAPI {
  constructor(configuration = DefaultConfig) {
    this.configuration = configuration;
    this.middleware = configuration.middleware;
  }
  static jsonRegex = new RegExp("^(:?application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(:?;.*)?$", "i");
  middleware;
  withMiddleware(...middlewares) {
    const next = this.clone();
    next.middleware = next.middleware.concat(...middlewares);
    return next;
  }
  withPreMiddleware(...preMiddlewares) {
    const middlewares = preMiddlewares.map((pre) => ({ pre }));
    return this.withMiddleware(...middlewares);
  }
  withPostMiddleware(...postMiddlewares) {
    const middlewares = postMiddlewares.map((post) => ({ post }));
    return this.withMiddleware(...middlewares);
  }
  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  isJsonMime(mime) {
    if (!mime) {
      return false;
    }
    return _BaseAPI.jsonRegex.test(mime);
  }
  async request(context, initOverrides) {
    const { url, init } = await this.createFetchParams(context, initOverrides);
    const response = await this.fetchApi(url, init);
    if (response && (response.status >= 200 && response.status < 300)) {
      return response;
    }
    throw new ResponseError(response, "Response returned an error code");
  }
  async createFetchParams(context, initOverrides) {
    let url = this.configuration.basePath + context.path;
    if (context.query !== void 0 && Object.keys(context.query).length !== 0) {
      url += "?" + this.configuration.queryParamsStringify(context.query);
    }
    const headers = Object.assign({}, this.configuration.headers, context.headers);
    Object.keys(headers).forEach((key) => headers[key] === void 0 ? delete headers[key] : {});
    const initOverrideFn = typeof initOverrides === "function" ? initOverrides : async () => initOverrides;
    const initParams = {
      method: context.method,
      headers,
      body: context.body,
      credentials: this.configuration.credentials
    };
    const overriddenInit = {
      ...initParams,
      ...await initOverrideFn({
        init: initParams,
        context
      })
    };
    let body;
    if (isFormData(overriddenInit.body) || overriddenInit.body instanceof URLSearchParams || isBlob(overriddenInit.body)) {
      body = overriddenInit.body;
    } else if (this.isJsonMime(headers["Content-Type"])) {
      body = JSON.stringify(overriddenInit.body);
    } else {
      body = overriddenInit.body;
    }
    const init = {
      ...overriddenInit,
      body
    };
    return { url, init };
  }
  fetchApi = async (url, init) => {
    let fetchParams = { url, init };
    for (const middleware of this.middleware) {
      if (middleware.pre) {
        fetchParams = await middleware.pre({
          fetch: this.fetchApi,
          ...fetchParams
        }) || fetchParams;
      }
    }
    let response = void 0;
    try {
      response = await (this.configuration.fetchApi || fetch)(fetchParams.url, fetchParams.init);
    } catch (e) {
      for (const middleware of this.middleware) {
        if (middleware.onError) {
          response = await middleware.onError({
            fetch: this.fetchApi,
            url: fetchParams.url,
            init: fetchParams.init,
            error: e,
            response: response ? response.clone() : void 0
          }) || response;
        }
      }
      if (response === void 0) {
        if (e instanceof Error) {
          throw new FetchError(e, "The request failed and the interceptors did not return an alternative response");
        } else {
          throw e;
        }
      }
    }
    for (const middleware of this.middleware) {
      if (middleware.post) {
        response = await middleware.post({
          fetch: this.fetchApi,
          url: fetchParams.url,
          init: fetchParams.init,
          response: response.clone()
        }) || response;
      }
    }
    return response;
  };
  /**
   * Create a shallow clone of `this` by constructing a new instance
   * and then shallow cloning data members.
   */
  clone() {
    const constructor = this.constructor;
    const next = new constructor(this.configuration);
    next.middleware = this.middleware.slice();
    return next;
  }
};
function isBlob(value) {
  return typeof Blob !== "undefined" && value instanceof Blob;
}
function isFormData(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}
var ResponseError = class extends Error {
  constructor(response, msg) {
    super(msg);
    this.response = response;
  }
  name = "ResponseError";
};
var FetchError = class extends Error {
  constructor(cause, msg) {
    super(msg);
    this.cause = cause;
  }
  name = "FetchError";
};
var RequiredError = class extends Error {
  constructor(field, msg) {
    super(msg);
    this.field = field;
  }
  name = "RequiredError";
};
var COLLECTION_FORMATS = {
  csv: ",",
  ssv: " ",
  tsv: "	",
  pipes: "|"
};
function querystring(params, prefix = "") {
  return Object.keys(params).map((key) => querystringSingleKey(key, params[key], prefix)).filter((part) => part.length > 0).join("&");
}
function querystringSingleKey(key, value, keyPrefix = "") {
  const fullKey = keyPrefix + (keyPrefix.length ? `[${key}]` : key);
  if (value instanceof Array) {
    const multiValue = value.map((singleValue) => encodeURIComponent(String(singleValue))).join(`&${encodeURIComponent(fullKey)}=`);
    return `${encodeURIComponent(fullKey)}=${multiValue}`;
  }
  if (value instanceof Set) {
    const valueAsArray = Array.from(value);
    return querystringSingleKey(key, valueAsArray, keyPrefix);
  }
  if (value instanceof Date) {
    return `${encodeURIComponent(fullKey)}=${encodeURIComponent(value.toISOString())}`;
  }
  if (value instanceof Object) {
    return querystring(value, fullKey);
  }
  return `${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`;
}
function mapValues(data, fn) {
  return Object.keys(data).reduce(
    (acc, key) => ({ ...acc, [key]: fn(data[key]) }),
    {}
  );
}
function canConsumeForm(consumes) {
  for (const consume of consumes) {
    if ("multipart/form-data" === consume.contentType) {
      return true;
    }
  }
  return false;
}
var JSONApiResponse = class {
  constructor(raw, transformer = (jsonValue) => jsonValue) {
    this.raw = raw;
    this.transformer = transformer;
  }
  async value() {
    return this.transformer(await this.raw.json());
  }
};
var VoidApiResponse = class {
  constructor(raw) {
    this.raw = raw;
  }
  async value() {
    return void 0;
  }
};
var BlobApiResponse = class {
  constructor(raw) {
    this.raw = raw;
  }
  async value() {
    return await this.raw.blob();
  }
};
var TextApiResponse = class {
  constructor(raw) {
    this.raw = raw;
  }
  async value() {
    return await this.raw.text();
  }
};

// src/models/AddAPIsRequest.ts
function instanceOfAddAPIsRequest(value) {
  if (!("name" in value) || value["name"] === void 0)
    return false;
  if (!("audience" in value) || value["audience"] === void 0)
    return false;
  return true;
}
function AddAPIsRequestFromJSON(json) {
  return AddAPIsRequestFromJSONTyped(json, false);
}
function AddAPIsRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"],
    "audience": json["audience"]
  };
}
function AddAPIsRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "audience": value["audience"]
  };
}

// src/models/AddOrganizationUsersRequestUsersInner.ts
function instanceOfAddOrganizationUsersRequestUsersInner(value) {
  return true;
}
function AddOrganizationUsersRequestUsersInnerFromJSON(json) {
  return AddOrganizationUsersRequestUsersInnerFromJSONTyped(json, false);
}
function AddOrganizationUsersRequestUsersInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "roles": json["roles"] == null ? void 0 : json["roles"],
    "permissions": json["permissions"] == null ? void 0 : json["permissions"]
  };
}
function AddOrganizationUsersRequestUsersInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "roles": value["roles"],
    "permissions": value["permissions"]
  };
}

// src/models/AddOrganizationUsersRequest.ts
function instanceOfAddOrganizationUsersRequest(value) {
  return true;
}
function AddOrganizationUsersRequestFromJSON(json) {
  return AddOrganizationUsersRequestFromJSONTyped(json, false);
}
function AddOrganizationUsersRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "users": json["users"] == null ? void 0 : json["users"].map(AddOrganizationUsersRequestUsersInnerFromJSON)
  };
}
function AddOrganizationUsersRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "users": value["users"] == null ? void 0 : value["users"].map(AddOrganizationUsersRequestUsersInnerToJSON)
  };
}

// src/models/AddOrganizationUsersResponse.ts
function instanceOfAddOrganizationUsersResponse(value) {
  return true;
}
function AddOrganizationUsersResponseFromJSON(json) {
  return AddOrganizationUsersResponseFromJSONTyped(json, false);
}
function AddOrganizationUsersResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "usersAdded": json["users_added"] == null ? void 0 : json["users_added"]
  };
}
function AddOrganizationUsersResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "users_added": value["usersAdded"]
  };
}

// src/models/ApiResult.ts
function instanceOfApiResult(value) {
  return true;
}
function ApiResultFromJSON(json) {
  return ApiResultFromJSONTyped(json, false);
}
function ApiResultFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "result": json["result"] == null ? void 0 : json["result"]
  };
}
function ApiResultToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "result": value["result"]
  };
}

// src/models/Applications.ts
function instanceOfApplications(value) {
  return true;
}
function ApplicationsFromJSON(json) {
  return ApplicationsFromJSONTyped(json, false);
}
function ApplicationsFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "name": json["name"] == null ? void 0 : json["name"],
    "type": json["type"] == null ? void 0 : json["type"]
  };
}
function ApplicationsToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "name": value["name"],
    "type": value["type"]
  };
}

// src/models/AuthorizeAppApiResponse.ts
function instanceOfAuthorizeAppApiResponse(value) {
  return true;
}
function AuthorizeAppApiResponseFromJSON(json) {
  return AuthorizeAppApiResponseFromJSONTyped(json, false);
}
function AuthorizeAppApiResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"],
    "applicationsDisconnected": json["applications_disconnected"] == null ? void 0 : json["applications_disconnected"],
    "applicationsConnected": json["applications_connected"] == null ? void 0 : json["applications_connected"]
  };
}
function AuthorizeAppApiResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"],
    "applications_disconnected": value["applicationsDisconnected"],
    "applications_connected": value["applicationsConnected"]
  };
}

// src/models/Category.ts
function instanceOfCategory(value) {
  return true;
}
function CategoryFromJSON(json) {
  return CategoryFromJSONTyped(json, false);
}
function CategoryFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "name": json["name"] == null ? void 0 : json["name"]
  };
}
function CategoryToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "name": value["name"]
  };
}

// src/models/ConnectedAppsAccessToken.ts
function instanceOfConnectedAppsAccessToken(value) {
  return true;
}
function ConnectedAppsAccessTokenFromJSON(json) {
  return ConnectedAppsAccessTokenFromJSONTyped(json, false);
}
function ConnectedAppsAccessTokenFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "accessToken": json["access_token"] == null ? void 0 : json["access_token"],
    "accessTokenExpiry": json["access_token_expiry"] == null ? void 0 : json["access_token_expiry"]
  };
}
function ConnectedAppsAccessTokenToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "access_token": value["accessToken"],
    "access_token_expiry": value["accessTokenExpiry"]
  };
}

// src/models/ConnectedAppsAuthUrl.ts
function instanceOfConnectedAppsAuthUrl(value) {
  return true;
}
function ConnectedAppsAuthUrlFromJSON(json) {
  return ConnectedAppsAuthUrlFromJSONTyped(json, false);
}
function ConnectedAppsAuthUrlFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "url": json["url"] == null ? void 0 : json["url"],
    "sessionId": json["session_id"] == null ? void 0 : json["session_id"]
  };
}
function ConnectedAppsAuthUrlToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "url": value["url"],
    "session_id": value["sessionId"]
  };
}

// src/models/Connection.ts
function instanceOfConnection(value) {
  return true;
}
function ConnectionFromJSON(json) {
  return ConnectionFromJSONTyped(json, false);
}
function ConnectionFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "name": json["name"] == null ? void 0 : json["name"],
    "displayName": json["display_name"] == null ? void 0 : json["display_name"],
    "strategy": json["strategy"] == null ? void 0 : json["strategy"]
  };
}
function ConnectionToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "name": value["name"],
    "display_name": value["displayName"],
    "strategy": value["strategy"]
  };
}

// src/models/CreateApisResponseApi.ts
function instanceOfCreateApisResponseApi(value) {
  return true;
}
function CreateApisResponseApiFromJSON(json) {
  return CreateApisResponseApiFromJSONTyped(json, false);
}
function CreateApisResponseApiFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"]
  };
}
function CreateApisResponseApiToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"]
  };
}

// src/models/CreateApisResponse.ts
function instanceOfCreateApisResponse(value) {
  return true;
}
function CreateApisResponseFromJSON(json) {
  return CreateApisResponseFromJSONTyped(json, false);
}
function CreateApisResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"],
    "api": json["api"] == null ? void 0 : CreateApisResponseApiFromJSON(json["api"])
  };
}
function CreateApisResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"],
    "api": CreateApisResponseApiToJSON(value["api"])
  };
}

// src/models/CreateApplicationRequest.ts
var CreateApplicationRequestTypeEnum = {
  Reg: "reg",
  Spa: "spa",
  M2m: "m2m"
};
function instanceOfCreateApplicationRequest(value) {
  return true;
}
function CreateApplicationRequestFromJSON(json) {
  return CreateApplicationRequestFromJSONTyped(json, false);
}
function CreateApplicationRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"] == null ? void 0 : json["name"],
    "type": json["type"] == null ? void 0 : json["type"]
  };
}
function CreateApplicationRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "type": value["type"]
  };
}

// src/models/CreateApplicationResponseApplication.ts
function instanceOfCreateApplicationResponseApplication(value) {
  return true;
}
function CreateApplicationResponseApplicationFromJSON(json) {
  return CreateApplicationResponseApplicationFromJSONTyped(json, false);
}
function CreateApplicationResponseApplicationFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "clientId": json["client_id"] == null ? void 0 : json["client_id"],
    "clientSecret": json["client_secret"] == null ? void 0 : json["client_secret"]
  };
}
function CreateApplicationResponseApplicationToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "client_id": value["clientId"],
    "client_secret": value["clientSecret"]
  };
}

// src/models/CreateApplicationResponse.ts
function instanceOfCreateApplicationResponse(value) {
  return true;
}
function CreateApplicationResponseFromJSON(json) {
  return CreateApplicationResponseFromJSONTyped(json, false);
}
function CreateApplicationResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "application": json["application"] == null ? void 0 : CreateApplicationResponseApplicationFromJSON(json["application"])
  };
}
function CreateApplicationResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "application": CreateApplicationResponseApplicationToJSON(value["application"])
  };
}

// src/models/CreateCategoryRequest.ts
var CreateCategoryRequestContextEnum = {
  Org: "org",
  Usr: "usr"
};
function instanceOfCreateCategoryRequest(value) {
  if (!("name" in value) || value["name"] === void 0)
    return false;
  if (!("context" in value) || value["context"] === void 0)
    return false;
  return true;
}
function CreateCategoryRequestFromJSON(json) {
  return CreateCategoryRequestFromJSONTyped(json, false);
}
function CreateCategoryRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"],
    "context": json["context"]
  };
}
function CreateCategoryRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "context": value["context"]
  };
}

// src/models/CreateCategoryResponseCategory.ts
function instanceOfCreateCategoryResponseCategory(value) {
  return true;
}
function CreateCategoryResponseCategoryFromJSON(json) {
  return CreateCategoryResponseCategoryFromJSONTyped(json, false);
}
function CreateCategoryResponseCategoryFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"]
  };
}
function CreateCategoryResponseCategoryToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"]
  };
}

// src/models/CreateCategoryResponse.ts
function instanceOfCreateCategoryResponse(value) {
  return true;
}
function CreateCategoryResponseFromJSON(json) {
  return CreateCategoryResponseFromJSONTyped(json, false);
}
function CreateCategoryResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"],
    "category": json["category"] == null ? void 0 : CreateCategoryResponseCategoryFromJSON(json["category"])
  };
}
function CreateCategoryResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"],
    "category": CreateCategoryResponseCategoryToJSON(value["category"])
  };
}

// src/models/CreateConnectionRequest.ts
var CreateConnectionRequestStrategyEnum = {
  Oauth2apple: "oauth2:apple",
  Oauth2azureAd: "oauth2:azure_ad",
  Oauth2bitbucket: "oauth2:bitbucket",
  Oauth2discord: "oauth2:discord",
  Oauth2facebook: "oauth2:facebook",
  Oauth2github: "oauth2:github",
  Oauth2gitlab: "oauth2:gitlab",
  Oauth2google: "oauth2:google",
  Oauth2linkedin: "oauth2:linkedin",
  Oauth2microsoft: "oauth2:microsoft",
  Oauth2patreon: "oauth2:patreon",
  Oauth2slack: "oauth2:slack",
  Oauth2stripe: "oauth2:stripe",
  Oauth2twitch: "oauth2:twitch",
  Oauth2twitter: "oauth2:twitter",
  Oauth2xero: "oauth2:xero",
  Samlcustom: "saml:custom",
  WsfedazureAd: "wsfed:azure_ad"
};
function instanceOfCreateConnectionRequest(value) {
  if (!("name" in value) || value["name"] === void 0)
    return false;
  if (!("displayName" in value) || value["displayName"] === void 0)
    return false;
  if (!("strategy" in value) || value["strategy"] === void 0)
    return false;
  return true;
}
function CreateConnectionRequestFromJSON(json) {
  return CreateConnectionRequestFromJSONTyped(json, false);
}
function CreateConnectionRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"],
    "displayName": json["display_name"],
    "strategy": json["strategy"],
    "enabledApplications": json["enabled_applications"] == null ? void 0 : json["enabled_applications"],
    "options": json["options"] == null ? void 0 : json["options"]
  };
}
function CreateConnectionRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "display_name": value["displayName"],
    "strategy": value["strategy"],
    "enabled_applications": value["enabledApplications"],
    "options": value["options"]
  };
}

// src/models/CreateConnectionResponseConnection.ts
function instanceOfCreateConnectionResponseConnection(value) {
  return true;
}
function CreateConnectionResponseConnectionFromJSON(json) {
  return CreateConnectionResponseConnectionFromJSONTyped(json, false);
}
function CreateConnectionResponseConnectionFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"]
  };
}
function CreateConnectionResponseConnectionToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"]
  };
}

// src/models/CreateConnectionResponse.ts
function instanceOfCreateConnectionResponse(value) {
  return true;
}
function CreateConnectionResponseFromJSON(json) {
  return CreateConnectionResponseFromJSONTyped(json, false);
}
function CreateConnectionResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"],
    "connection": json["connection"] == null ? void 0 : CreateConnectionResponseConnectionFromJSON(json["connection"])
  };
}
function CreateConnectionResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"],
    "connection": CreateConnectionResponseConnectionToJSON(value["connection"])
  };
}

// src/models/CreateFeatureFlagRequest.ts
var CreateFeatureFlagRequestTypeEnum = {
  Str: "str",
  Int: "int",
  Bool: "bool"
};
var CreateFeatureFlagRequestAllowOverrideLevelEnum = {
  Env: "env",
  Org: "org",
  Usr: "usr"
};
function instanceOfCreateFeatureFlagRequest(value) {
  if (!("name" in value) || value["name"] === void 0)
    return false;
  if (!("key" in value) || value["key"] === void 0)
    return false;
  if (!("type" in value) || value["type"] === void 0)
    return false;
  if (!("defaultValue" in value) || value["defaultValue"] === void 0)
    return false;
  return true;
}
function CreateFeatureFlagRequestFromJSON(json) {
  return CreateFeatureFlagRequestFromJSONTyped(json, false);
}
function CreateFeatureFlagRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"],
    "description": json["description"] == null ? void 0 : json["description"],
    "key": json["key"],
    "type": json["type"],
    "allowOverrideLevel": json["allow_override_level"] == null ? void 0 : json["allow_override_level"],
    "defaultValue": json["default_value"]
  };
}
function CreateFeatureFlagRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "description": value["description"],
    "key": value["key"],
    "type": value["type"],
    "allow_override_level": value["allowOverrideLevel"],
    "default_value": value["defaultValue"]
  };
}

// src/models/CreateIdentityResponseIdentity.ts
function instanceOfCreateIdentityResponseIdentity(value) {
  return true;
}
function CreateIdentityResponseIdentityFromJSON(json) {
  return CreateIdentityResponseIdentityFromJSONTyped(json, false);
}
function CreateIdentityResponseIdentityFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"]
  };
}
function CreateIdentityResponseIdentityToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"]
  };
}

// src/models/CreateIdentityResponse.ts
function instanceOfCreateIdentityResponse(value) {
  return true;
}
function CreateIdentityResponseFromJSON(json) {
  return CreateIdentityResponseFromJSONTyped(json, false);
}
function CreateIdentityResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"],
    "identity": json["identity"] == null ? void 0 : CreateIdentityResponseIdentityFromJSON(json["identity"])
  };
}
function CreateIdentityResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"],
    "identity": CreateIdentityResponseIdentityToJSON(value["identity"])
  };
}

// src/models/CreateOrganizationRequest.ts
var CreateOrganizationRequestFeatureFlagsEnum = {
  Str: "str",
  Int: "int",
  Bool: "bool"
};
function instanceOfCreateOrganizationRequest(value) {
  if (!("name" in value) || value["name"] === void 0)
    return false;
  return true;
}
function CreateOrganizationRequestFromJSON(json) {
  return CreateOrganizationRequestFromJSONTyped(json, false);
}
function CreateOrganizationRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"],
    "featureFlags": json["feature_flags"] == null ? void 0 : json["feature_flags"],
    "externalId": json["external_id"] == null ? void 0 : json["external_id"],
    "backgroundColor": json["background_color"] == null ? void 0 : json["background_color"],
    "buttonColor": json["button_color"] == null ? void 0 : json["button_color"],
    "buttonTextColor": json["button_text_color"] == null ? void 0 : json["button_text_color"],
    "linkColor": json["link_color"] == null ? void 0 : json["link_color"],
    "backgroundColorDark": json["background_color_dark"] == null ? void 0 : json["background_color_dark"],
    "buttonColorDark": json["button_color_dark"] == null ? void 0 : json["button_color_dark"],
    "buttonTextColorDark": json["button_text_color_dark"] == null ? void 0 : json["button_text_color_dark"],
    "linkColorDark": json["link_color_dark"] == null ? void 0 : json["link_color_dark"],
    "themeCode": json["theme_code"] == null ? void 0 : json["theme_code"],
    "handle": json["handle"] == null ? void 0 : json["handle"],
    "isAllowRegistrations": json["is_allow_registrations"] == null ? void 0 : json["is_allow_registrations"]
  };
}
function CreateOrganizationRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "feature_flags": value["featureFlags"],
    "external_id": value["externalId"],
    "background_color": value["backgroundColor"],
    "button_color": value["buttonColor"],
    "button_text_color": value["buttonTextColor"],
    "link_color": value["linkColor"],
    "background_color_dark": value["backgroundColorDark"],
    "button_color_dark": value["buttonColorDark"],
    "button_text_color_dark": value["buttonTextColorDark"],
    "link_color_dark": value["linkColorDark"],
    "theme_code": value["themeCode"],
    "handle": value["handle"],
    "is_allow_registrations": value["isAllowRegistrations"]
  };
}

// src/models/CreateOrganizationResponseOrganization.ts
function instanceOfCreateOrganizationResponseOrganization(value) {
  return true;
}
function CreateOrganizationResponseOrganizationFromJSON(json) {
  return CreateOrganizationResponseOrganizationFromJSONTyped(json, false);
}
function CreateOrganizationResponseOrganizationFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"]
  };
}
function CreateOrganizationResponseOrganizationToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"]
  };
}

// src/models/CreateOrganizationResponse.ts
function instanceOfCreateOrganizationResponse(value) {
  return true;
}
function CreateOrganizationResponseFromJSON(json) {
  return CreateOrganizationResponseFromJSONTyped(json, false);
}
function CreateOrganizationResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"],
    "organization": json["organization"] == null ? void 0 : CreateOrganizationResponseOrganizationFromJSON(json["organization"])
  };
}
function CreateOrganizationResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"],
    "organization": CreateOrganizationResponseOrganizationToJSON(value["organization"])
  };
}

// src/models/CreateOrganizationUserPermissionRequest.ts
function instanceOfCreateOrganizationUserPermissionRequest(value) {
  return true;
}
function CreateOrganizationUserPermissionRequestFromJSON(json) {
  return CreateOrganizationUserPermissionRequestFromJSONTyped(json, false);
}
function CreateOrganizationUserPermissionRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "permissionId": json["permission_id"] == null ? void 0 : json["permission_id"]
  };
}
function CreateOrganizationUserPermissionRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "permission_id": value["permissionId"]
  };
}

// src/models/CreateOrganizationUserRoleRequest.ts
function instanceOfCreateOrganizationUserRoleRequest(value) {
  return true;
}
function CreateOrganizationUserRoleRequestFromJSON(json) {
  return CreateOrganizationUserRoleRequestFromJSONTyped(json, false);
}
function CreateOrganizationUserRoleRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "roleId": json["role_id"] == null ? void 0 : json["role_id"]
  };
}
function CreateOrganizationUserRoleRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "role_id": value["roleId"]
  };
}

// src/models/CreatePermissionRequest.ts
function instanceOfCreatePermissionRequest(value) {
  return true;
}
function CreatePermissionRequestFromJSON(json) {
  return CreatePermissionRequestFromJSONTyped(json, false);
}
function CreatePermissionRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"] == null ? void 0 : json["name"],
    "description": json["description"] == null ? void 0 : json["description"],
    "key": json["key"] == null ? void 0 : json["key"]
  };
}
function CreatePermissionRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "description": value["description"],
    "key": value["key"]
  };
}

// src/models/CreatePropertyRequest.ts
var CreatePropertyRequestTypeEnum = {
  SingleLineText: "single_line_text",
  MultiLineText: "multi_line_text"
};
var CreatePropertyRequestContextEnum = {
  Org: "org",
  Usr: "usr"
};
function instanceOfCreatePropertyRequest(value) {
  if (!("name" in value) || value["name"] === void 0)
    return false;
  if (!("key" in value) || value["key"] === void 0)
    return false;
  if (!("type" in value) || value["type"] === void 0)
    return false;
  if (!("context" in value) || value["context"] === void 0)
    return false;
  if (!("isPrivate" in value) || value["isPrivate"] === void 0)
    return false;
  if (!("categoryId" in value) || value["categoryId"] === void 0)
    return false;
  return true;
}
function CreatePropertyRequestFromJSON(json) {
  return CreatePropertyRequestFromJSONTyped(json, false);
}
function CreatePropertyRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"],
    "description": json["description"] == null ? void 0 : json["description"],
    "key": json["key"],
    "type": json["type"],
    "context": json["context"],
    "isPrivate": json["is_private"],
    "categoryId": json["category_id"]
  };
}
function CreatePropertyRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "description": value["description"],
    "key": value["key"],
    "type": value["type"],
    "context": value["context"],
    "is_private": value["isPrivate"],
    "category_id": value["categoryId"]
  };
}

// src/models/CreatePropertyResponseProperty.ts
function instanceOfCreatePropertyResponseProperty(value) {
  return true;
}
function CreatePropertyResponsePropertyFromJSON(json) {
  return CreatePropertyResponsePropertyFromJSONTyped(json, false);
}
function CreatePropertyResponsePropertyFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"]
  };
}
function CreatePropertyResponsePropertyToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"]
  };
}

// src/models/CreatePropertyResponse.ts
function instanceOfCreatePropertyResponse(value) {
  return true;
}
function CreatePropertyResponseFromJSON(json) {
  return CreatePropertyResponseFromJSONTyped(json, false);
}
function CreatePropertyResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"],
    "property": json["property"] == null ? void 0 : CreatePropertyResponsePropertyFromJSON(json["property"])
  };
}
function CreatePropertyResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"],
    "property": CreatePropertyResponsePropertyToJSON(value["property"])
  };
}

// src/models/CreateRoleRequest.ts
function instanceOfCreateRoleRequest(value) {
  return true;
}
function CreateRoleRequestFromJSON(json) {
  return CreateRoleRequestFromJSONTyped(json, false);
}
function CreateRoleRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"] == null ? void 0 : json["name"],
    "description": json["description"] == null ? void 0 : json["description"],
    "key": json["key"] == null ? void 0 : json["key"],
    "isDefaultRole": json["is_default_role"] == null ? void 0 : json["is_default_role"]
  };
}
function CreateRoleRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "description": value["description"],
    "key": value["key"],
    "is_default_role": value["isDefaultRole"]
  };
}

// src/models/CreateSubscriberSuccessResponseSubscriber.ts
function instanceOfCreateSubscriberSuccessResponseSubscriber(value) {
  return true;
}
function CreateSubscriberSuccessResponseSubscriberFromJSON(json) {
  return CreateSubscriberSuccessResponseSubscriberFromJSONTyped(json, false);
}
function CreateSubscriberSuccessResponseSubscriberFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "subscriberId": json["subscriber_id"] == null ? void 0 : json["subscriber_id"]
  };
}
function CreateSubscriberSuccessResponseSubscriberToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "subscriber_id": value["subscriberId"]
  };
}

// src/models/CreateSubscriberSuccessResponse.ts
function instanceOfCreateSubscriberSuccessResponse(value) {
  return true;
}
function CreateSubscriberSuccessResponseFromJSON(json) {
  return CreateSubscriberSuccessResponseFromJSONTyped(json, false);
}
function CreateSubscriberSuccessResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "subscriber": json["subscriber"] == null ? void 0 : CreateSubscriberSuccessResponseSubscriberFromJSON(json["subscriber"])
  };
}
function CreateSubscriberSuccessResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "subscriber": CreateSubscriberSuccessResponseSubscriberToJSON(value["subscriber"])
  };
}

// src/models/CreateUserIdentityRequest.ts
var CreateUserIdentityRequestTypeEnum = {
  Email: "email",
  Username: "username",
  Phone: "phone",
  Enterprise: "enterprise"
};
function instanceOfCreateUserIdentityRequest(value) {
  return true;
}
function CreateUserIdentityRequestFromJSON(json) {
  return CreateUserIdentityRequestFromJSONTyped(json, false);
}
function CreateUserIdentityRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "value": json["value"] == null ? void 0 : json["value"],
    "type": json["type"] == null ? void 0 : json["type"],
    "phoneCountryId": json["phone_country_id"] == null ? void 0 : json["phone_country_id"]
  };
}
function CreateUserIdentityRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "value": value["value"],
    "type": value["type"],
    "phone_country_id": value["phoneCountryId"]
  };
}

// src/models/CreateUserRequestIdentitiesInnerDetails.ts
function instanceOfCreateUserRequestIdentitiesInnerDetails(value) {
  return true;
}
function CreateUserRequestIdentitiesInnerDetailsFromJSON(json) {
  return CreateUserRequestIdentitiesInnerDetailsFromJSONTyped(json, false);
}
function CreateUserRequestIdentitiesInnerDetailsFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "email": json["email"] == null ? void 0 : json["email"],
    "phone": json["phone"] == null ? void 0 : json["phone"],
    "username": json["username"] == null ? void 0 : json["username"]
  };
}
function CreateUserRequestIdentitiesInnerDetailsToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "email": value["email"],
    "phone": value["phone"],
    "username": value["username"]
  };
}

// src/models/CreateUserRequestIdentitiesInner.ts
var CreateUserRequestIdentitiesInnerTypeEnum = {
  Email: "email",
  Phone: "phone",
  Username: "username"
};
function instanceOfCreateUserRequestIdentitiesInner(value) {
  return true;
}
function CreateUserRequestIdentitiesInnerFromJSON(json) {
  return CreateUserRequestIdentitiesInnerFromJSONTyped(json, false);
}
function CreateUserRequestIdentitiesInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "type": json["type"] == null ? void 0 : json["type"],
    "details": json["details"] == null ? void 0 : CreateUserRequestIdentitiesInnerDetailsFromJSON(json["details"])
  };
}
function CreateUserRequestIdentitiesInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "type": value["type"],
    "details": CreateUserRequestIdentitiesInnerDetailsToJSON(value["details"])
  };
}

// src/models/CreateUserRequestProfile.ts
function instanceOfCreateUserRequestProfile(value) {
  return true;
}
function CreateUserRequestProfileFromJSON(json) {
  return CreateUserRequestProfileFromJSONTyped(json, false);
}
function CreateUserRequestProfileFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "givenName": json["given_name"] == null ? void 0 : json["given_name"],
    "familyName": json["family_name"] == null ? void 0 : json["family_name"]
  };
}
function CreateUserRequestProfileToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "given_name": value["givenName"],
    "family_name": value["familyName"]
  };
}

// src/models/CreateUserRequest.ts
function instanceOfCreateUserRequest(value) {
  return true;
}
function CreateUserRequestFromJSON(json) {
  return CreateUserRequestFromJSONTyped(json, false);
}
function CreateUserRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "profile": json["profile"] == null ? void 0 : CreateUserRequestProfileFromJSON(json["profile"]),
    "organizationCode": json["organization_code"] == null ? void 0 : json["organization_code"],
    "identities": json["identities"] == null ? void 0 : json["identities"].map(CreateUserRequestIdentitiesInnerFromJSON)
  };
}
function CreateUserRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "profile": CreateUserRequestProfileToJSON(value["profile"]),
    "organization_code": value["organizationCode"],
    "identities": value["identities"] == null ? void 0 : value["identities"].map(CreateUserRequestIdentitiesInnerToJSON)
  };
}

// src/models/UserIdentityResult.ts
function instanceOfUserIdentityResult(value) {
  return true;
}
function UserIdentityResultFromJSON(json) {
  return UserIdentityResultFromJSONTyped(json, false);
}
function UserIdentityResultFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "created": json["created"] == null ? void 0 : json["created"]
  };
}
function UserIdentityResultToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "created": value["created"]
  };
}

// src/models/UserIdentity.ts
function instanceOfUserIdentity(value) {
  return true;
}
function UserIdentityFromJSON(json) {
  return UserIdentityFromJSONTyped(json, false);
}
function UserIdentityFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "type": json["type"] == null ? void 0 : json["type"],
    "result": json["result"] == null ? void 0 : UserIdentityResultFromJSON(json["result"])
  };
}
function UserIdentityToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "type": value["type"],
    "result": UserIdentityResultToJSON(value["result"])
  };
}

// src/models/CreateUserResponse.ts
function instanceOfCreateUserResponse(value) {
  return true;
}
function CreateUserResponseFromJSON(json) {
  return CreateUserResponseFromJSONTyped(json, false);
}
function CreateUserResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "created": json["created"] == null ? void 0 : json["created"],
    "identities": json["identities"] == null ? void 0 : json["identities"].map(UserIdentityFromJSON)
  };
}
function CreateUserResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "created": value["created"],
    "identities": value["identities"] == null ? void 0 : value["identities"].map(UserIdentityToJSON)
  };
}

// src/models/CreateWebHookRequest.ts
function instanceOfCreateWebHookRequest(value) {
  if (!("endpoint" in value) || value["endpoint"] === void 0)
    return false;
  if (!("eventTypes" in value) || value["eventTypes"] === void 0)
    return false;
  if (!("name" in value) || value["name"] === void 0)
    return false;
  return true;
}
function CreateWebHookRequestFromJSON(json) {
  return CreateWebHookRequestFromJSONTyped(json, false);
}
function CreateWebHookRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "endpoint": json["endpoint"],
    "eventTypes": json["event_types"],
    "name": json["name"],
    "description": json["description"] == null ? void 0 : json["description"]
  };
}
function CreateWebHookRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "endpoint": value["endpoint"],
    "event_types": value["eventTypes"],
    "name": value["name"],
    "description": value["description"]
  };
}

// src/models/CreateWebhookResponseWebhook.ts
function instanceOfCreateWebhookResponseWebhook(value) {
  return true;
}
function CreateWebhookResponseWebhookFromJSON(json) {
  return CreateWebhookResponseWebhookFromJSONTyped(json, false);
}
function CreateWebhookResponseWebhookFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "endpoint": json["endpoint"] == null ? void 0 : json["endpoint"]
  };
}
function CreateWebhookResponseWebhookToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "endpoint": value["endpoint"]
  };
}

// src/models/CreateWebhookResponse.ts
function instanceOfCreateWebhookResponse(value) {
  return true;
}
function CreateWebhookResponseFromJSON(json) {
  return CreateWebhookResponseFromJSONTyped(json, false);
}
function CreateWebhookResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "webhook": json["webhook"] == null ? void 0 : CreateWebhookResponseWebhookFromJSON(json["webhook"])
  };
}
function CreateWebhookResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "webhook": CreateWebhookResponseWebhookToJSON(value["webhook"])
  };
}

// src/models/DeleteApiResponse.ts
function instanceOfDeleteApiResponse(value) {
  return true;
}
function DeleteApiResponseFromJSON(json) {
  return DeleteApiResponseFromJSONTyped(json, false);
}
function DeleteApiResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"]
  };
}
function DeleteApiResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"]
  };
}

// src/models/DeleteWebhookResponse.ts
function instanceOfDeleteWebhookResponse(value) {
  return true;
}
function DeleteWebhookResponseFromJSON(json) {
  return DeleteWebhookResponseFromJSONTyped(json, false);
}
function DeleteWebhookResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"]
  };
}
function DeleteWebhookResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"]
  };
}

// src/models/ModelError.ts
function instanceOfModelError(value) {
  return true;
}
function ModelErrorFromJSON(json) {
  return ModelErrorFromJSONTyped(json, false);
}
function ModelErrorFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"]
  };
}
function ModelErrorToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"]
  };
}

// src/models/ErrorResponse.ts
function instanceOfErrorResponse(value) {
  return true;
}
function ErrorResponseFromJSON(json) {
  return ErrorResponseFromJSONTyped(json, false);
}
function ErrorResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "errors": json["errors"] == null ? void 0 : json["errors"].map(ModelErrorFromJSON)
  };
}
function ErrorResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "errors": value["errors"] == null ? void 0 : value["errors"].map(ModelErrorToJSON)
  };
}

// src/models/EventType.ts
function instanceOfEventType(value) {
  return true;
}
function EventTypeFromJSON(json) {
  return EventTypeFromJSONTyped(json, false);
}
function EventTypeFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "code": json["code"] == null ? void 0 : json["code"],
    "name": json["name"] == null ? void 0 : json["name"],
    "origin": json["origin"] == null ? void 0 : json["origin"],
    "schema": json["schema"] == null ? void 0 : json["schema"]
  };
}
function EventTypeToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "code": value["code"],
    "name": value["name"],
    "origin": value["origin"],
    "schema": value["schema"]
  };
}

// src/models/GetApiResponseApiApplicationsInner.ts
var GetApiResponseApiApplicationsInnerTypeEnum = {
  MachineToMachineM2M: "Machine to machine (M2M)",
  BackEndWeb: "Back-end web",
  FrontEndAndMobile: "Front-end and mobile"
};
function instanceOfGetApiResponseApiApplicationsInner(value) {
  return true;
}
function GetApiResponseApiApplicationsInnerFromJSON(json) {
  return GetApiResponseApiApplicationsInnerFromJSONTyped(json, false);
}
function GetApiResponseApiApplicationsInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "name": json["name"] == null ? void 0 : json["name"],
    "type": json["type"] == null ? void 0 : json["type"],
    "isActive": json["is_active"] == null ? void 0 : json["is_active"]
  };
}
function GetApiResponseApiApplicationsInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "name": value["name"],
    "type": value["type"],
    "is_active": value["isActive"]
  };
}

// src/models/GetApiResponseApi.ts
function instanceOfGetApiResponseApi(value) {
  return true;
}
function GetApiResponseApiFromJSON(json) {
  return GetApiResponseApiFromJSONTyped(json, false);
}
function GetApiResponseApiFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "name": json["name"] == null ? void 0 : json["name"],
    "audience": json["audience"] == null ? void 0 : json["audience"],
    "isManagementApi": json["is_management_api"] == null ? void 0 : json["is_management_api"],
    "applications": json["applications"] == null ? void 0 : json["applications"].map(GetApiResponseApiApplicationsInnerFromJSON)
  };
}
function GetApiResponseApiToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "name": value["name"],
    "audience": value["audience"],
    "is_management_api": value["isManagementApi"],
    "applications": value["applications"] == null ? void 0 : value["applications"].map(GetApiResponseApiApplicationsInnerToJSON)
  };
}

// src/models/GetApiResponse.ts
function instanceOfGetApiResponse(value) {
  return true;
}
function GetApiResponseFromJSON(json) {
  return GetApiResponseFromJSONTyped(json, false);
}
function GetApiResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "api": json["api"] == null ? void 0 : GetApiResponseApiFromJSON(json["api"])
  };
}
function GetApiResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "api": GetApiResponseApiToJSON(value["api"])
  };
}

// src/models/GetApisResponseApisInner.ts
function instanceOfGetApisResponseApisInner(value) {
  return true;
}
function GetApisResponseApisInnerFromJSON(json) {
  return GetApisResponseApisInnerFromJSONTyped(json, false);
}
function GetApisResponseApisInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "name": json["name"] == null ? void 0 : json["name"],
    "audience": json["audience"] == null ? void 0 : json["audience"],
    "isManagementApi": json["is_management_api"] == null ? void 0 : json["is_management_api"]
  };
}
function GetApisResponseApisInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "name": value["name"],
    "audience": value["audience"],
    "is_management_api": value["isManagementApi"]
  };
}

// src/models/GetApisResponse.ts
function instanceOfGetApisResponse(value) {
  return true;
}
function GetApisResponseFromJSON(json) {
  return GetApisResponseFromJSONTyped(json, false);
}
function GetApisResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"],
    "apis": json["apis"] == null ? void 0 : json["apis"].map(GetApisResponseApisInnerFromJSON)
  };
}
function GetApisResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "next_token": value["nextToken"],
    "apis": value["apis"] == null ? void 0 : value["apis"].map(GetApisResponseApisInnerToJSON)
  };
}

// src/models/GetApplicationResponseApplication.ts
function instanceOfGetApplicationResponseApplication(value) {
  return true;
}
function GetApplicationResponseApplicationFromJSON(json) {
  return GetApplicationResponseApplicationFromJSONTyped(json, false);
}
function GetApplicationResponseApplicationFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "name": json["name"] == null ? void 0 : json["name"],
    "type": json["type"] == null ? void 0 : json["type"],
    "clientId": json["client_id"] == null ? void 0 : json["client_id"],
    "clientSecret": json["client_secret"] == null ? void 0 : json["client_secret"],
    "loginUri": json["login_uri"] == null ? void 0 : json["login_uri"],
    "homepageUri": json["homepage_uri"] == null ? void 0 : json["homepage_uri"]
  };
}
function GetApplicationResponseApplicationToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "name": value["name"],
    "type": value["type"],
    "client_id": value["clientId"],
    "client_secret": value["clientSecret"],
    "login_uri": value["loginUri"],
    "homepage_uri": value["homepageUri"]
  };
}

// src/models/GetApplicationResponse.ts
function instanceOfGetApplicationResponse(value) {
  return true;
}
function GetApplicationResponseFromJSON(json) {
  return GetApplicationResponseFromJSONTyped(json, false);
}
function GetApplicationResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "application": json["application"] == null ? void 0 : GetApplicationResponseApplicationFromJSON(json["application"])
  };
}
function GetApplicationResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "application": GetApplicationResponseApplicationToJSON(value["application"])
  };
}

// src/models/GetApplicationsResponse.ts
function instanceOfGetApplicationsResponse(value) {
  return true;
}
function GetApplicationsResponseFromJSON(json) {
  return GetApplicationsResponseFromJSONTyped(json, false);
}
function GetApplicationsResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "applications": json["applications"] == null ? void 0 : json["applications"].map(ApplicationsFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function GetApplicationsResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "applications": value["applications"] == null ? void 0 : value["applications"].map(ApplicationsToJSON),
    "next_token": value["nextToken"]
  };
}

// src/models/GetCategoriesResponse.ts
function instanceOfGetCategoriesResponse(value) {
  return true;
}
function GetCategoriesResponseFromJSON(json) {
  return GetCategoriesResponseFromJSONTyped(json, false);
}
function GetCategoriesResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "categories": json["categories"] == null ? void 0 : json["categories"].map(CategoryFromJSON),
    "hasMore": json["has_more"] == null ? void 0 : json["has_more"]
  };
}
function GetCategoriesResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "categories": value["categories"] == null ? void 0 : value["categories"].map(CategoryToJSON),
    "has_more": value["hasMore"]
  };
}

// src/models/GetConnectionsResponse.ts
function instanceOfGetConnectionsResponse(value) {
  return true;
}
function GetConnectionsResponseFromJSON(json) {
  return GetConnectionsResponseFromJSONTyped(json, false);
}
function GetConnectionsResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "connections": json["connections"] == null ? void 0 : json["connections"].map(ConnectionFromJSON),
    "hasMore": json["has_more"] == null ? void 0 : json["has_more"]
  };
}
function GetConnectionsResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "connections": value["connections"] == null ? void 0 : value["connections"].map(ConnectionToJSON),
    "has_more": value["hasMore"]
  };
}

// src/models/GetOrganizationFeatureFlagsResponseFeatureFlagsValue.ts
var GetOrganizationFeatureFlagsResponseFeatureFlagsValueTypeEnum = {
  Str: "str",
  Int: "int",
  Bool: "bool"
};
function instanceOfGetOrganizationFeatureFlagsResponseFeatureFlagsValue(value) {
  return true;
}
function GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSON(json) {
  return GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSONTyped(json, false);
}
function GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "type": json["type"] == null ? void 0 : json["type"],
    "value": json["value"] == null ? void 0 : json["value"]
  };
}
function GetOrganizationFeatureFlagsResponseFeatureFlagsValueToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "type": value["type"],
    "value": value["value"]
  };
}

// src/models/GetEnvironmentFeatureFlagsResponse.ts
function instanceOfGetEnvironmentFeatureFlagsResponse(value) {
  return true;
}
function GetEnvironmentFeatureFlagsResponseFromJSON(json) {
  return GetEnvironmentFeatureFlagsResponseFromJSONTyped(json, false);
}
function GetEnvironmentFeatureFlagsResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "featureFlags": json["feature_flags"] == null ? void 0 : mapValues(json["feature_flags"], GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function GetEnvironmentFeatureFlagsResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "feature_flags": value["featureFlags"] == null ? void 0 : mapValues(value["featureFlags"], GetOrganizationFeatureFlagsResponseFeatureFlagsValueToJSON),
    "next_token": value["nextToken"]
  };
}

// src/models/GetEventResponseEvent.ts
function instanceOfGetEventResponseEvent(value) {
  return true;
}
function GetEventResponseEventFromJSON(json) {
  return GetEventResponseEventFromJSONTyped(json, false);
}
function GetEventResponseEventFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "type": json["type"] == null ? void 0 : json["type"],
    "source": json["source"] == null ? void 0 : json["source"],
    "eventId": json["event_id"] == null ? void 0 : json["event_id"],
    "timestamp": json["timestamp"] == null ? void 0 : json["timestamp"],
    "data": json["data"] == null ? void 0 : json["data"]
  };
}
function GetEventResponseEventToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "type": value["type"],
    "source": value["source"],
    "event_id": value["eventId"],
    "timestamp": value["timestamp"],
    "data": value["data"]
  };
}

// src/models/GetEventResponse.ts
function instanceOfGetEventResponse(value) {
  return true;
}
function GetEventResponseFromJSON(json) {
  return GetEventResponseFromJSONTyped(json, false);
}
function GetEventResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "event": json["event"] == null ? void 0 : GetEventResponseEventFromJSON(json["event"])
  };
}
function GetEventResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "event": GetEventResponseEventToJSON(value["event"])
  };
}

// src/models/GetEventTypesResponse.ts
function instanceOfGetEventTypesResponse(value) {
  return true;
}
function GetEventTypesResponseFromJSON(json) {
  return GetEventTypesResponseFromJSONTyped(json, false);
}
function GetEventTypesResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "eventTypes": json["event_types"] == null ? void 0 : json["event_types"].map(EventTypeFromJSON)
  };
}
function GetEventTypesResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "event_types": value["eventTypes"] == null ? void 0 : value["eventTypes"].map(EventTypeToJSON)
  };
}

// src/models/Identity.ts
function instanceOfIdentity(value) {
  return true;
}
function IdentityFromJSON(json) {
  return IdentityFromJSONTyped(json, false);
}
function IdentityFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "type": json["type"] == null ? void 0 : json["type"],
    "isConfirmed": json["is_confirmed"] == null ? void 0 : json["is_confirmed"],
    "createdOn": json["created_on"] == null ? void 0 : json["created_on"],
    "lastLoginOn": json["last_login_on"] == null ? void 0 : json["last_login_on"],
    "totalLogins": json["total_logins"] == null ? void 0 : json["total_logins"],
    "name": json["name"] == null ? void 0 : json["name"]
  };
}
function IdentityToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "type": value["type"],
    "is_confirmed": value["isConfirmed"],
    "created_on": value["createdOn"],
    "last_login_on": value["lastLoginOn"],
    "total_logins": value["totalLogins"],
    "name": value["name"]
  };
}

// src/models/GetIdentitiesResponse.ts
function instanceOfGetIdentitiesResponse(value) {
  return true;
}
function GetIdentitiesResponseFromJSON(json) {
  return GetIdentitiesResponseFromJSONTyped(json, false);
}
function GetIdentitiesResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "properties": json["properties"] == null ? void 0 : json["properties"].map(IdentityFromJSON),
    "hasMore": json["has_more"] == null ? void 0 : json["has_more"]
  };
}
function GetIdentitiesResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "properties": value["properties"] == null ? void 0 : value["properties"].map(IdentityToJSON),
    "has_more": value["hasMore"]
  };
}

// src/models/GetOrganizationFeatureFlagsResponse.ts
function instanceOfGetOrganizationFeatureFlagsResponse(value) {
  return true;
}
function GetOrganizationFeatureFlagsResponseFromJSON(json) {
  return GetOrganizationFeatureFlagsResponseFromJSONTyped(json, false);
}
function GetOrganizationFeatureFlagsResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "featureFlags": json["feature_flags"] == null ? void 0 : mapValues(json["feature_flags"], GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSON)
  };
}
function GetOrganizationFeatureFlagsResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "feature_flags": value["featureFlags"] == null ? void 0 : mapValues(value["featureFlags"], GetOrganizationFeatureFlagsResponseFeatureFlagsValueToJSON)
  };
}

// src/models/OrganizationUser.ts
function instanceOfOrganizationUser(value) {
  return true;
}
function OrganizationUserFromJSON(json) {
  return OrganizationUserFromJSONTyped(json, false);
}
function OrganizationUserFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "email": json["email"] == null ? void 0 : json["email"],
    "fullName": json["full_name"] == null ? void 0 : json["full_name"],
    "lastName": json["last_name"] == null ? void 0 : json["last_name"],
    "firstName": json["first_name"] == null ? void 0 : json["first_name"],
    "picture": json["picture"] == null ? void 0 : json["picture"],
    "roles": json["roles"] == null ? void 0 : json["roles"]
  };
}
function OrganizationUserToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "email": value["email"],
    "full_name": value["fullName"],
    "last_name": value["lastName"],
    "first_name": value["firstName"],
    "picture": value["picture"],
    "roles": value["roles"]
  };
}

// src/models/GetOrganizationUsersResponse.ts
function instanceOfGetOrganizationUsersResponse(value) {
  return true;
}
function GetOrganizationUsersResponseFromJSON(json) {
  return GetOrganizationUsersResponseFromJSONTyped(json, false);
}
function GetOrganizationUsersResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "organizationUsers": json["organization_users"] == null ? void 0 : json["organization_users"].map(OrganizationUserFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function GetOrganizationUsersResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "organization_users": value["organizationUsers"] == null ? void 0 : value["organizationUsers"].map(OrganizationUserToJSON),
    "next_token": value["nextToken"]
  };
}

// src/models/Organization.ts
function instanceOfOrganization(value) {
  return true;
}
function OrganizationFromJSON(json) {
  return OrganizationFromJSONTyped(json, false);
}
function OrganizationFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "name": json["name"] == null ? void 0 : json["name"],
    "isDefault": json["is_default"] == null ? void 0 : json["is_default"],
    "externalId": json["external_id"] == null ? void 0 : json["external_id"],
    "logo": json["logo"] == null ? void 0 : json["logo"],
    "linkColor": json["link_color"] == null ? void 0 : json["link_color"],
    "buttonColor": json["button_color"] == null ? void 0 : json["button_color"],
    "backgroundColor": json["background_color"] == null ? void 0 : json["background_color"],
    "buttonTextColor": json["button_text_color"] == null ? void 0 : json["button_text_color"],
    "isAllowRegistrations": json["is_allow_registrations"] == null ? void 0 : json["is_allow_registrations"]
  };
}
function OrganizationToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "name": value["name"],
    "is_default": value["isDefault"],
    "external_id": value["externalId"],
    "logo": value["logo"],
    "link_color": value["linkColor"],
    "button_color": value["buttonColor"],
    "background_color": value["backgroundColor"],
    "button_text_color": value["buttonTextColor"],
    "is_allow_registrations": value["isAllowRegistrations"]
  };
}

// src/models/GetOrganizationsResponse.ts
function instanceOfGetOrganizationsResponse(value) {
  return true;
}
function GetOrganizationsResponseFromJSON(json) {
  return GetOrganizationsResponseFromJSONTyped(json, false);
}
function GetOrganizationsResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "organizations": json["organizations"] == null ? void 0 : json["organizations"].map(OrganizationFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function GetOrganizationsResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "organizations": value["organizations"] == null ? void 0 : value["organizations"].map(OrganizationToJSON),
    "next_token": value["nextToken"]
  };
}

// src/models/OrganizationUserPermissionRolesInner.ts
function instanceOfOrganizationUserPermissionRolesInner(value) {
  return true;
}
function OrganizationUserPermissionRolesInnerFromJSON(json) {
  return OrganizationUserPermissionRolesInnerFromJSONTyped(json, false);
}
function OrganizationUserPermissionRolesInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "key": json["key"] == null ? void 0 : json["key"]
  };
}
function OrganizationUserPermissionRolesInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "key": value["key"]
  };
}

// src/models/OrganizationUserPermission.ts
function instanceOfOrganizationUserPermission(value) {
  return true;
}
function OrganizationUserPermissionFromJSON(json) {
  return OrganizationUserPermissionFromJSONTyped(json, false);
}
function OrganizationUserPermissionFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "key": json["key"] == null ? void 0 : json["key"],
    "name": json["name"] == null ? void 0 : json["name"],
    "description": json["description"] == null ? void 0 : json["description"],
    "roles": json["roles"] == null ? void 0 : json["roles"].map(OrganizationUserPermissionRolesInnerFromJSON)
  };
}
function OrganizationUserPermissionToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "key": value["key"],
    "name": value["name"],
    "description": value["description"],
    "roles": value["roles"] == null ? void 0 : value["roles"].map(OrganizationUserPermissionRolesInnerToJSON)
  };
}

// src/models/GetOrganizationsUserPermissionsResponse.ts
function instanceOfGetOrganizationsUserPermissionsResponse(value) {
  return true;
}
function GetOrganizationsUserPermissionsResponseFromJSON(json) {
  return GetOrganizationsUserPermissionsResponseFromJSONTyped(json, false);
}
function GetOrganizationsUserPermissionsResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "permissions": json["permissions"] == null ? void 0 : json["permissions"].map(OrganizationUserPermissionFromJSON)
  };
}
function GetOrganizationsUserPermissionsResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "permissions": value["permissions"] == null ? void 0 : value["permissions"].map(OrganizationUserPermissionToJSON)
  };
}

// src/models/OrganizationUserRole.ts
function instanceOfOrganizationUserRole(value) {
  return true;
}
function OrganizationUserRoleFromJSON(json) {
  return OrganizationUserRoleFromJSONTyped(json, false);
}
function OrganizationUserRoleFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "key": json["key"] == null ? void 0 : json["key"],
    "name": json["name"] == null ? void 0 : json["name"]
  };
}
function OrganizationUserRoleToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "key": value["key"],
    "name": value["name"]
  };
}

// src/models/GetOrganizationsUserRolesResponse.ts
function instanceOfGetOrganizationsUserRolesResponse(value) {
  return true;
}
function GetOrganizationsUserRolesResponseFromJSON(json) {
  return GetOrganizationsUserRolesResponseFromJSONTyped(json, false);
}
function GetOrganizationsUserRolesResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "roles": json["roles"] == null ? void 0 : json["roles"].map(OrganizationUserRoleFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function GetOrganizationsUserRolesResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "roles": value["roles"] == null ? void 0 : value["roles"].map(OrganizationUserRoleToJSON),
    "next_token": value["nextToken"]
  };
}

// src/models/Permissions.ts
function instanceOfPermissions(value) {
  return true;
}
function PermissionsFromJSON(json) {
  return PermissionsFromJSONTyped(json, false);
}
function PermissionsFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "key": json["key"] == null ? void 0 : json["key"],
    "name": json["name"] == null ? void 0 : json["name"],
    "description": json["description"] == null ? void 0 : json["description"]
  };
}
function PermissionsToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "key": value["key"],
    "name": value["name"],
    "description": value["description"]
  };
}

// src/models/GetPermissionsResponse.ts
function instanceOfGetPermissionsResponse(value) {
  return true;
}
function GetPermissionsResponseFromJSON(json) {
  return GetPermissionsResponseFromJSONTyped(json, false);
}
function GetPermissionsResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "permissions": json["permissions"] == null ? void 0 : json["permissions"].map(PermissionsFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function GetPermissionsResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "permissions": value["permissions"] == null ? void 0 : value["permissions"].map(PermissionsToJSON),
    "next_token": value["nextToken"]
  };
}

// src/models/Property.ts
function instanceOfProperty(value) {
  return true;
}
function PropertyFromJSON(json) {
  return PropertyFromJSONTyped(json, false);
}
function PropertyFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "key": json["key"] == null ? void 0 : json["key"],
    "name": json["name"] == null ? void 0 : json["name"],
    "isPrivate": json["is_private"] == null ? void 0 : json["is_private"],
    "description": json["description"] == null ? void 0 : json["description"],
    "isKindeProperty": json["is_kinde_property"] == null ? void 0 : json["is_kinde_property"]
  };
}
function PropertyToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "key": value["key"],
    "name": value["name"],
    "is_private": value["isPrivate"],
    "description": value["description"],
    "is_kinde_property": value["isKindeProperty"]
  };
}

// src/models/GetPropertiesResponse.ts
function instanceOfGetPropertiesResponse(value) {
  return true;
}
function GetPropertiesResponseFromJSON(json) {
  return GetPropertiesResponseFromJSONTyped(json, false);
}
function GetPropertiesResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "properties": json["properties"] == null ? void 0 : json["properties"].map(PropertyFromJSON),
    "hasMore": json["has_more"] == null ? void 0 : json["has_more"]
  };
}
function GetPropertiesResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "properties": value["properties"] == null ? void 0 : value["properties"].map(PropertyToJSON),
    "has_more": value["hasMore"]
  };
}

// src/models/PropertyValue.ts
function instanceOfPropertyValue(value) {
  return true;
}
function PropertyValueFromJSON(json) {
  return PropertyValueFromJSONTyped(json, false);
}
function PropertyValueFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "name": json["name"] == null ? void 0 : json["name"],
    "description": json["description"] == null ? void 0 : json["description"],
    "key": json["key"] == null ? void 0 : json["key"],
    "value": json["value"] == null ? void 0 : json["value"]
  };
}
function PropertyValueToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "name": value["name"],
    "description": value["description"],
    "key": value["key"],
    "value": value["value"]
  };
}

// src/models/GetPropertyValuesResponse.ts
function instanceOfGetPropertyValuesResponse(value) {
  return true;
}
function GetPropertyValuesResponseFromJSON(json) {
  return GetPropertyValuesResponseFromJSONTyped(json, false);
}
function GetPropertyValuesResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "properties": json["properties"] == null ? void 0 : json["properties"].map(PropertyValueFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function GetPropertyValuesResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "properties": value["properties"] == null ? void 0 : value["properties"].map(PropertyValueToJSON),
    "next_token": value["nextToken"]
  };
}

// src/models/RedirectCallbackUrls.ts
function instanceOfRedirectCallbackUrls(value) {
  return true;
}
function RedirectCallbackUrlsFromJSON(json) {
  return RedirectCallbackUrlsFromJSONTyped(json, false);
}
function RedirectCallbackUrlsFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "redirectUrls": json["redirect_urls"] == null ? void 0 : json["redirect_urls"]
  };
}
function RedirectCallbackUrlsToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "redirect_urls": value["redirectUrls"]
  };
}

// src/models/GetRedirectCallbackUrlsResponse.ts
function instanceOfGetRedirectCallbackUrlsResponse(value) {
  return true;
}
function GetRedirectCallbackUrlsResponseFromJSON(json) {
  return GetRedirectCallbackUrlsResponseFromJSONTyped(json, false);
}
function GetRedirectCallbackUrlsResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "redirectUrls": json["redirect_urls"] == null ? void 0 : json["redirect_urls"].map(RedirectCallbackUrlsFromJSON)
  };
}
function GetRedirectCallbackUrlsResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "redirect_urls": value["redirectUrls"] == null ? void 0 : value["redirectUrls"].map(RedirectCallbackUrlsToJSON)
  };
}

// src/models/Roles.ts
function instanceOfRoles(value) {
  return true;
}
function RolesFromJSON(json) {
  return RolesFromJSONTyped(json, false);
}
function RolesFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "key": json["key"] == null ? void 0 : json["key"],
    "name": json["name"] == null ? void 0 : json["name"],
    "description": json["description"] == null ? void 0 : json["description"]
  };
}
function RolesToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "key": value["key"],
    "name": value["name"],
    "description": value["description"]
  };
}

// src/models/GetRolesResponse.ts
function instanceOfGetRolesResponse(value) {
  return true;
}
function GetRolesResponseFromJSON(json) {
  return GetRolesResponseFromJSONTyped(json, false);
}
function GetRolesResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "roles": json["roles"] == null ? void 0 : json["roles"].map(RolesFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function GetRolesResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "roles": value["roles"] == null ? void 0 : value["roles"].map(RolesToJSON),
    "next_token": value["nextToken"]
  };
}

// src/models/Subscriber.ts
function instanceOfSubscriber(value) {
  return true;
}
function SubscriberFromJSON(json) {
  return SubscriberFromJSONTyped(json, false);
}
function SubscriberFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "preferredEmail": json["preferred_email"] == null ? void 0 : json["preferred_email"],
    "firstName": json["first_name"] == null ? void 0 : json["first_name"],
    "lastName": json["last_name"] == null ? void 0 : json["last_name"]
  };
}
function SubscriberToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "preferred_email": value["preferredEmail"],
    "first_name": value["firstName"],
    "last_name": value["lastName"]
  };
}

// src/models/GetSubscriberResponse.ts
function instanceOfGetSubscriberResponse(value) {
  return true;
}
function GetSubscriberResponseFromJSON(json) {
  return GetSubscriberResponseFromJSONTyped(json, false);
}
function GetSubscriberResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "subscribers": json["subscribers"] == null ? void 0 : json["subscribers"].map(SubscriberFromJSON)
  };
}
function GetSubscriberResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "subscribers": value["subscribers"] == null ? void 0 : value["subscribers"].map(SubscriberToJSON)
  };
}

// src/models/SubscribersSubscriber.ts
function instanceOfSubscribersSubscriber(value) {
  return true;
}
function SubscribersSubscriberFromJSON(json) {
  return SubscribersSubscriberFromJSONTyped(json, false);
}
function SubscribersSubscriberFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "email": json["email"] == null ? void 0 : json["email"],
    "fullName": json["full_name"] == null ? void 0 : json["full_name"],
    "firstName": json["first_name"] == null ? void 0 : json["first_name"],
    "lastName": json["last_name"] == null ? void 0 : json["last_name"]
  };
}
function SubscribersSubscriberToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "email": value["email"],
    "full_name": value["fullName"],
    "first_name": value["firstName"],
    "last_name": value["lastName"]
  };
}

// src/models/GetSubscribersResponse.ts
function instanceOfGetSubscribersResponse(value) {
  return true;
}
function GetSubscribersResponseFromJSON(json) {
  return GetSubscribersResponseFromJSONTyped(json, false);
}
function GetSubscribersResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "subscribers": json["subscribers"] == null ? void 0 : json["subscribers"].map(SubscribersSubscriberFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function GetSubscribersResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "subscribers": value["subscribers"] == null ? void 0 : value["subscribers"].map(SubscribersSubscriberToJSON),
    "next_token": value["nextToken"]
  };
}

// src/models/Webhook.ts
function instanceOfWebhook(value) {
  return true;
}
function WebhookFromJSON(json) {
  return WebhookFromJSONTyped(json, false);
}
function WebhookFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "name": json["name"] == null ? void 0 : json["name"],
    "endpoint": json["endpoint"] == null ? void 0 : json["endpoint"],
    "description": json["description"] == null ? void 0 : json["description"],
    "eventTypes": json["event_types"] == null ? void 0 : json["event_types"],
    "createdOn": json["created_on"] == null ? void 0 : json["created_on"]
  };
}
function WebhookToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "name": value["name"],
    "endpoint": value["endpoint"],
    "description": value["description"],
    "event_types": value["eventTypes"],
    "created_on": value["createdOn"]
  };
}

// src/models/GetWebhooksResponse.ts
function instanceOfGetWebhooksResponse(value) {
  return true;
}
function GetWebhooksResponseFromJSON(json) {
  return GetWebhooksResponseFromJSONTyped(json, false);
}
function GetWebhooksResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "webhooks": json["webhooks"] == null ? void 0 : json["webhooks"].map(WebhookFromJSON)
  };
}
function GetWebhooksResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "webhooks": value["webhooks"] == null ? void 0 : value["webhooks"].map(WebhookToJSON)
  };
}

// src/models/LogoutRedirectUrls.ts
function instanceOfLogoutRedirectUrls(value) {
  return true;
}
function LogoutRedirectUrlsFromJSON(json) {
  return LogoutRedirectUrlsFromJSONTyped(json, false);
}
function LogoutRedirectUrlsFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "redirectUrls": json["redirect_urls"] == null ? void 0 : json["redirect_urls"]
  };
}
function LogoutRedirectUrlsToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "redirect_urls": value["redirectUrls"]
  };
}

// src/models/OrganizationUserRolePermissionsPermissions.ts
function instanceOfOrganizationUserRolePermissionsPermissions(value) {
  return true;
}
function OrganizationUserRolePermissionsPermissionsFromJSON(json) {
  return OrganizationUserRolePermissionsPermissionsFromJSONTyped(json, false);
}
function OrganizationUserRolePermissionsPermissionsFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "key": json["key"] == null ? void 0 : json["key"]
  };
}
function OrganizationUserRolePermissionsPermissionsToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "key": value["key"]
  };
}

// src/models/OrganizationUserRolePermissions.ts
function instanceOfOrganizationUserRolePermissions(value) {
  return true;
}
function OrganizationUserRolePermissionsFromJSON(json) {
  return OrganizationUserRolePermissionsFromJSONTyped(json, false);
}
function OrganizationUserRolePermissionsFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "role": json["role"] == null ? void 0 : json["role"],
    "permissions": json["permissions"] == null ? void 0 : OrganizationUserRolePermissionsPermissionsFromJSON(json["permissions"])
  };
}
function OrganizationUserRolePermissionsToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "role": value["role"],
    "permissions": OrganizationUserRolePermissionsPermissionsToJSON(value["permissions"])
  };
}

// src/models/ReplaceLogoutRedirectURLsRequest.ts
function instanceOfReplaceLogoutRedirectURLsRequest(value) {
  return true;
}
function ReplaceLogoutRedirectURLsRequestFromJSON(json) {
  return ReplaceLogoutRedirectURLsRequestFromJSONTyped(json, false);
}
function ReplaceLogoutRedirectURLsRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "urls": json["urls"] == null ? void 0 : json["urls"]
  };
}
function ReplaceLogoutRedirectURLsRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "urls": value["urls"]
  };
}

// src/models/ReplaceRedirectCallbackURLsRequest.ts
function instanceOfReplaceRedirectCallbackURLsRequest(value) {
  return true;
}
function ReplaceRedirectCallbackURLsRequestFromJSON(json) {
  return ReplaceRedirectCallbackURLsRequestFromJSONTyped(json, false);
}
function ReplaceRedirectCallbackURLsRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "urls": json["urls"] == null ? void 0 : json["urls"]
  };
}
function ReplaceRedirectCallbackURLsRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "urls": value["urls"]
  };
}

// src/models/Role.ts
function instanceOfRole(value) {
  return true;
}
function RoleFromJSON(json) {
  return RoleFromJSONTyped(json, false);
}
function RoleFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "key": json["key"] == null ? void 0 : json["key"],
    "name": json["name"] == null ? void 0 : json["name"],
    "description": json["description"] == null ? void 0 : json["description"]
  };
}
function RoleToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "key": value["key"],
    "name": value["name"],
    "description": value["description"]
  };
}

// src/models/RolesPermissionResponseInner.ts
function instanceOfRolesPermissionResponseInner(value) {
  return true;
}
function RolesPermissionResponseInnerFromJSON(json) {
  return RolesPermissionResponseInnerFromJSONTyped(json, false);
}
function RolesPermissionResponseInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "key": json["key"] == null ? void 0 : json["key"],
    "name": json["name"] == null ? void 0 : json["name"],
    "description": json["description"] == null ? void 0 : json["description"]
  };
}
function RolesPermissionResponseInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "key": value["key"],
    "name": value["name"],
    "description": value["description"]
  };
}

// src/models/SetUserPasswordRequest.ts
var SetUserPasswordRequestHashingMethodEnum = {
  Bcrypt: "bcrypt",
  Crypt: "crypt",
  Md5: "md5",
  Wordpress: "wordpress"
};
var SetUserPasswordRequestSaltPositionEnum = {
  Prefix: "prefix",
  Suffix: "suffix"
};
function instanceOfSetUserPasswordRequest(value) {
  if (!("hashedPassword" in value) || value["hashedPassword"] === void 0)
    return false;
  return true;
}
function SetUserPasswordRequestFromJSON(json) {
  return SetUserPasswordRequestFromJSONTyped(json, false);
}
function SetUserPasswordRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "hashedPassword": json["hashed_password"],
    "hashingMethod": json["hashing_method"] == null ? void 0 : json["hashing_method"],
    "salt": json["salt"] == null ? void 0 : json["salt"],
    "saltPosition": json["salt_position"] == null ? void 0 : json["salt_position"],
    "isTemporaryPassword": json["is_temporary_password"] == null ? void 0 : json["is_temporary_password"]
  };
}
function SetUserPasswordRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "hashed_password": value["hashedPassword"],
    "hashing_method": value["hashingMethod"],
    "salt": value["salt"],
    "salt_position": value["saltPosition"],
    "is_temporary_password": value["isTemporaryPassword"]
  };
}

// src/models/SuccessResponse.ts
function instanceOfSuccessResponse(value) {
  return true;
}
function SuccessResponseFromJSON(json) {
  return SuccessResponseFromJSONTyped(json, false);
}
function SuccessResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"]
  };
}
function SuccessResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"]
  };
}

// src/models/TokenErrorResponse.ts
function instanceOfTokenErrorResponse(value) {
  return true;
}
function TokenErrorResponseFromJSON(json) {
  return TokenErrorResponseFromJSONTyped(json, false);
}
function TokenErrorResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "error": json["error"] == null ? void 0 : json["error"],
    "errorDescription": json["error_description"] == null ? void 0 : json["error_description"]
  };
}
function TokenErrorResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "error": value["error"],
    "error_description": value["errorDescription"]
  };
}

// src/models/TokenIntrospect.ts
function instanceOfTokenIntrospect(value) {
  return true;
}
function TokenIntrospectFromJSON(json) {
  return TokenIntrospectFromJSONTyped(json, false);
}
function TokenIntrospectFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "active": json["active"] == null ? void 0 : json["active"],
    "aud": json["aud"] == null ? void 0 : json["aud"],
    "clientId": json["client_id"] == null ? void 0 : json["client_id"],
    "exp": json["exp"] == null ? void 0 : json["exp"],
    "iat": json["iat"] == null ? void 0 : json["iat"]
  };
}
function TokenIntrospectToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "active": value["active"],
    "aud": value["aud"],
    "client_id": value["clientId"],
    "exp": value["exp"],
    "iat": value["iat"]
  };
}

// src/models/UpdateAPIApplicationsRequestApplicationsInner.ts
function instanceOfUpdateAPIApplicationsRequestApplicationsInner(value) {
  if (!("id" in value) || value["id"] === void 0)
    return false;
  return true;
}
function UpdateAPIApplicationsRequestApplicationsInnerFromJSON(json) {
  return UpdateAPIApplicationsRequestApplicationsInnerFromJSONTyped(json, false);
}
function UpdateAPIApplicationsRequestApplicationsInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"],
    "operation": json["operation"] == null ? void 0 : json["operation"]
  };
}
function UpdateAPIApplicationsRequestApplicationsInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "operation": value["operation"]
  };
}

// src/models/UpdateAPIApplicationsRequest.ts
function instanceOfUpdateAPIApplicationsRequest(value) {
  if (!("applications" in value) || value["applications"] === void 0)
    return false;
  return true;
}
function UpdateAPIApplicationsRequestFromJSON(json) {
  return UpdateAPIApplicationsRequestFromJSONTyped(json, false);
}
function UpdateAPIApplicationsRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "applications": json["applications"].map(UpdateAPIApplicationsRequestApplicationsInnerFromJSON)
  };
}
function UpdateAPIApplicationsRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "applications": value["applications"].map(UpdateAPIApplicationsRequestApplicationsInnerToJSON)
  };
}

// src/models/UpdateApplicationRequest.ts
function instanceOfUpdateApplicationRequest(value) {
  return true;
}
function UpdateApplicationRequestFromJSON(json) {
  return UpdateApplicationRequestFromJSONTyped(json, false);
}
function UpdateApplicationRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"] == null ? void 0 : json["name"],
    "languageKey": json["language_key"] == null ? void 0 : json["language_key"],
    "logoutUris": json["logout_uris"] == null ? void 0 : json["logout_uris"],
    "redirectUris": json["redirect_uris"] == null ? void 0 : json["redirect_uris"],
    "loginUri": json["login_uri"] == null ? void 0 : json["login_uri"],
    "homepageUri": json["homepage_uri"] == null ? void 0 : json["homepage_uri"]
  };
}
function UpdateApplicationRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "language_key": value["languageKey"],
    "logout_uris": value["logoutUris"],
    "redirect_uris": value["redirectUris"],
    "login_uri": value["loginUri"],
    "homepage_uri": value["homepageUri"]
  };
}

// src/models/UpdateCategoryRequest.ts
function instanceOfUpdateCategoryRequest(value) {
  return true;
}
function UpdateCategoryRequestFromJSON(json) {
  return UpdateCategoryRequestFromJSONTyped(json, false);
}
function UpdateCategoryRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"] == null ? void 0 : json["name"]
  };
}
function UpdateCategoryRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"]
  };
}

// src/models/UpdateConnectionRequest.ts
function instanceOfUpdateConnectionRequest(value) {
  return true;
}
function UpdateConnectionRequestFromJSON(json) {
  return UpdateConnectionRequestFromJSONTyped(json, false);
}
function UpdateConnectionRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"] == null ? void 0 : json["name"],
    "displayName": json["display_name"] == null ? void 0 : json["display_name"],
    "enabledApplications": json["enabled_applications"] == null ? void 0 : json["enabled_applications"],
    "options": json["options"] == null ? void 0 : json["options"]
  };
}
function UpdateConnectionRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "display_name": value["displayName"],
    "enabled_applications": value["enabledApplications"],
    "options": value["options"]
  };
}

// src/models/UpdateEnvironementFeatureFlagOverrideRequest.ts
function instanceOfUpdateEnvironementFeatureFlagOverrideRequest(value) {
  if (!("value" in value) || value["value"] === void 0)
    return false;
  return true;
}
function UpdateEnvironementFeatureFlagOverrideRequestFromJSON(json) {
  return UpdateEnvironementFeatureFlagOverrideRequestFromJSONTyped(json, false);
}
function UpdateEnvironementFeatureFlagOverrideRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "value": json["value"]
  };
}
function UpdateEnvironementFeatureFlagOverrideRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "value": value["value"]
  };
}

// src/models/UpdateIdentityRequest.ts
function instanceOfUpdateIdentityRequest(value) {
  return true;
}
function UpdateIdentityRequestFromJSON(json) {
  return UpdateIdentityRequestFromJSONTyped(json, false);
}
function UpdateIdentityRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "isPrimary": json["is_primary"] == null ? void 0 : json["is_primary"]
  };
}
function UpdateIdentityRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "is_primary": value["isPrimary"]
  };
}

// src/models/UpdateOrganizationPropertiesRequest.ts
function instanceOfUpdateOrganizationPropertiesRequest(value) {
  if (!("properties" in value) || value["properties"] === void 0)
    return false;
  return true;
}
function UpdateOrganizationPropertiesRequestFromJSON(json) {
  return UpdateOrganizationPropertiesRequestFromJSONTyped(json, false);
}
function UpdateOrganizationPropertiesRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "properties": json["properties"]
  };
}
function UpdateOrganizationPropertiesRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "properties": value["properties"]
  };
}

// src/models/UpdateOrganizationRequest.ts
function instanceOfUpdateOrganizationRequest(value) {
  return true;
}
function UpdateOrganizationRequestFromJSON(json) {
  return UpdateOrganizationRequestFromJSONTyped(json, false);
}
function UpdateOrganizationRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"] == null ? void 0 : json["name"],
    "externalId": json["external_id"] == null ? void 0 : json["external_id"],
    "backgroundColor": json["background_color"] == null ? void 0 : json["background_color"],
    "buttonColor": json["button_color"] == null ? void 0 : json["button_color"],
    "buttonTextColor": json["button_text_color"] == null ? void 0 : json["button_text_color"],
    "linkColor": json["link_color"] == null ? void 0 : json["link_color"],
    "backgroundColorDark": json["background_color_dark"] == null ? void 0 : json["background_color_dark"],
    "buttonColorDark": json["button_color_dark"] == null ? void 0 : json["button_color_dark"],
    "buttonTextColorDark": json["button_text_color_dark"] == null ? void 0 : json["button_text_color_dark"],
    "linkColorDark": json["link_color_dark"] == null ? void 0 : json["link_color_dark"],
    "themeCode": json["theme_code"] == null ? void 0 : json["theme_code"],
    "handle": json["handle"] == null ? void 0 : json["handle"],
    "isAllowRegistrations": json["is_allow_registrations"] == null ? void 0 : json["is_allow_registrations"]
  };
}
function UpdateOrganizationRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "external_id": value["externalId"],
    "background_color": value["backgroundColor"],
    "button_color": value["buttonColor"],
    "button_text_color": value["buttonTextColor"],
    "link_color": value["linkColor"],
    "background_color_dark": value["backgroundColorDark"],
    "button_color_dark": value["buttonColorDark"],
    "button_text_color_dark": value["buttonTextColorDark"],
    "link_color_dark": value["linkColorDark"],
    "theme_code": value["themeCode"],
    "handle": value["handle"],
    "is_allow_registrations": value["isAllowRegistrations"]
  };
}

// src/models/UpdateOrganizationUsersRequestUsersInner.ts
function instanceOfUpdateOrganizationUsersRequestUsersInner(value) {
  return true;
}
function UpdateOrganizationUsersRequestUsersInnerFromJSON(json) {
  return UpdateOrganizationUsersRequestUsersInnerFromJSONTyped(json, false);
}
function UpdateOrganizationUsersRequestUsersInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "operation": json["operation"] == null ? void 0 : json["operation"],
    "roles": json["roles"] == null ? void 0 : json["roles"],
    "permissions": json["permissions"] == null ? void 0 : json["permissions"]
  };
}
function UpdateOrganizationUsersRequestUsersInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "operation": value["operation"],
    "roles": value["roles"],
    "permissions": value["permissions"]
  };
}

// src/models/UpdateOrganizationUsersRequest.ts
function instanceOfUpdateOrganizationUsersRequest(value) {
  return true;
}
function UpdateOrganizationUsersRequestFromJSON(json) {
  return UpdateOrganizationUsersRequestFromJSONTyped(json, false);
}
function UpdateOrganizationUsersRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "users": json["users"] == null ? void 0 : json["users"].map(UpdateOrganizationUsersRequestUsersInnerFromJSON)
  };
}
function UpdateOrganizationUsersRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "users": value["users"] == null ? void 0 : value["users"].map(UpdateOrganizationUsersRequestUsersInnerToJSON)
  };
}

// src/models/UpdateOrganizationUsersResponse.ts
function instanceOfUpdateOrganizationUsersResponse(value) {
  return true;
}
function UpdateOrganizationUsersResponseFromJSON(json) {
  return UpdateOrganizationUsersResponseFromJSONTyped(json, false);
}
function UpdateOrganizationUsersResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "usersAdded": json["users_added"] == null ? void 0 : json["users_added"],
    "usersUpdated": json["users_updated"] == null ? void 0 : json["users_updated"],
    "usersRemoved": json["users_removed"] == null ? void 0 : json["users_removed"]
  };
}
function UpdateOrganizationUsersResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "users_added": value["usersAdded"],
    "users_updated": value["usersUpdated"],
    "users_removed": value["usersRemoved"]
  };
}

// src/models/UpdatePropertyRequest.ts
function instanceOfUpdatePropertyRequest(value) {
  if (!("name" in value) || value["name"] === void 0)
    return false;
  if (!("isPrivate" in value) || value["isPrivate"] === void 0)
    return false;
  if (!("categoryId" in value) || value["categoryId"] === void 0)
    return false;
  return true;
}
function UpdatePropertyRequestFromJSON(json) {
  return UpdatePropertyRequestFromJSONTyped(json, false);
}
function UpdatePropertyRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"],
    "description": json["description"] == null ? void 0 : json["description"],
    "isPrivate": json["is_private"],
    "categoryId": json["category_id"]
  };
}
function UpdatePropertyRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "description": value["description"],
    "is_private": value["isPrivate"],
    "category_id": value["categoryId"]
  };
}

// src/models/UpdateRolePermissionsRequestPermissionsInner.ts
function instanceOfUpdateRolePermissionsRequestPermissionsInner(value) {
  return true;
}
function UpdateRolePermissionsRequestPermissionsInnerFromJSON(json) {
  return UpdateRolePermissionsRequestPermissionsInnerFromJSONTyped(json, false);
}
function UpdateRolePermissionsRequestPermissionsInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "operation": json["operation"] == null ? void 0 : json["operation"]
  };
}
function UpdateRolePermissionsRequestPermissionsInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "operation": value["operation"]
  };
}

// src/models/UpdateRolePermissionsRequest.ts
function instanceOfUpdateRolePermissionsRequest(value) {
  return true;
}
function UpdateRolePermissionsRequestFromJSON(json) {
  return UpdateRolePermissionsRequestFromJSONTyped(json, false);
}
function UpdateRolePermissionsRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "permissions": json["permissions"] == null ? void 0 : json["permissions"].map(UpdateRolePermissionsRequestPermissionsInnerFromJSON)
  };
}
function UpdateRolePermissionsRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "permissions": value["permissions"] == null ? void 0 : value["permissions"].map(UpdateRolePermissionsRequestPermissionsInnerToJSON)
  };
}

// src/models/UpdateRolePermissionsResponse.ts
function instanceOfUpdateRolePermissionsResponse(value) {
  return true;
}
function UpdateRolePermissionsResponseFromJSON(json) {
  return UpdateRolePermissionsResponseFromJSONTyped(json, false);
}
function UpdateRolePermissionsResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "permissionsAdded": json["permissions_added"] == null ? void 0 : json["permissions_added"],
    "permissionsRemoved": json["permissions_removed"] == null ? void 0 : json["permissions_removed"]
  };
}
function UpdateRolePermissionsResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "permissions_added": value["permissionsAdded"],
    "permissions_removed": value["permissionsRemoved"]
  };
}

// src/models/UpdateRolesRequest.ts
function instanceOfUpdateRolesRequest(value) {
  if (!("name" in value) || value["name"] === void 0)
    return false;
  if (!("key" in value) || value["key"] === void 0)
    return false;
  return true;
}
function UpdateRolesRequestFromJSON(json) {
  return UpdateRolesRequestFromJSONTyped(json, false);
}
function UpdateRolesRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "name": json["name"],
    "description": json["description"] == null ? void 0 : json["description"],
    "key": json["key"],
    "isDefaultRole": json["is_default_role"] == null ? void 0 : json["is_default_role"]
  };
}
function UpdateRolesRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "name": value["name"],
    "description": value["description"],
    "key": value["key"],
    "is_default_role": value["isDefaultRole"]
  };
}

// src/models/UpdateUserRequest.ts
function instanceOfUpdateUserRequest(value) {
  return true;
}
function UpdateUserRequestFromJSON(json) {
  return UpdateUserRequestFromJSONTyped(json, false);
}
function UpdateUserRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "givenName": json["given_name"] == null ? void 0 : json["given_name"],
    "familyName": json["family_name"] == null ? void 0 : json["family_name"],
    "isSuspended": json["is_suspended"] == null ? void 0 : json["is_suspended"],
    "isPasswordResetRequested": json["is_password_reset_requested"] == null ? void 0 : json["is_password_reset_requested"]
  };
}
function UpdateUserRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "given_name": value["givenName"],
    "family_name": value["familyName"],
    "is_suspended": value["isSuspended"],
    "is_password_reset_requested": value["isPasswordResetRequested"]
  };
}

// src/models/UpdateUserResponse.ts
function instanceOfUpdateUserResponse(value) {
  return true;
}
function UpdateUserResponseFromJSON(json) {
  return UpdateUserResponseFromJSONTyped(json, false);
}
function UpdateUserResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "givenName": json["given_name"] == null ? void 0 : json["given_name"],
    "familyName": json["family_name"] == null ? void 0 : json["family_name"],
    "email": json["email"] == null ? void 0 : json["email"],
    "isSuspended": json["is_suspended"] == null ? void 0 : json["is_suspended"],
    "isPasswordResetRequested": json["is_password_reset_requested"] == null ? void 0 : json["is_password_reset_requested"],
    "picture": json["picture"] == null ? void 0 : json["picture"]
  };
}
function UpdateUserResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "given_name": value["givenName"],
    "family_name": value["familyName"],
    "email": value["email"],
    "is_suspended": value["isSuspended"],
    "is_password_reset_requested": value["isPasswordResetRequested"],
    "picture": value["picture"]
  };
}

// src/models/UpdateWebHookRequest.ts
function instanceOfUpdateWebHookRequest(value) {
  return true;
}
function UpdateWebHookRequestFromJSON(json) {
  return UpdateWebHookRequestFromJSONTyped(json, false);
}
function UpdateWebHookRequestFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "eventTypes": json["event_types"] == null ? void 0 : json["event_types"],
    "name": json["name"] == null ? void 0 : json["name"],
    "description": json["description"] == null ? void 0 : json["description"]
  };
}
function UpdateWebHookRequestToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "event_types": value["eventTypes"],
    "name": value["name"],
    "description": value["description"]
  };
}

// src/models/UpdateWebhookResponseWebhook.ts
function instanceOfUpdateWebhookResponseWebhook(value) {
  return true;
}
function UpdateWebhookResponseWebhookFromJSON(json) {
  return UpdateWebhookResponseWebhookFromJSONTyped(json, false);
}
function UpdateWebhookResponseWebhookFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"]
  };
}
function UpdateWebhookResponseWebhookToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"]
  };
}

// src/models/UpdateWebhookResponse.ts
function instanceOfUpdateWebhookResponse(value) {
  return true;
}
function UpdateWebhookResponseFromJSON(json) {
  return UpdateWebhookResponseFromJSONTyped(json, false);
}
function UpdateWebhookResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "message": json["message"] == null ? void 0 : json["message"],
    "code": json["code"] == null ? void 0 : json["code"],
    "webhook": json["webhook"] == null ? void 0 : UpdateWebhookResponseWebhookFromJSON(json["webhook"])
  };
}
function UpdateWebhookResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "message": value["message"],
    "code": value["code"],
    "webhook": UpdateWebhookResponseWebhookToJSON(value["webhook"])
  };
}

// src/models/UserIdentitiesInner.ts
function instanceOfUserIdentitiesInner(value) {
  return true;
}
function UserIdentitiesInnerFromJSON(json) {
  return UserIdentitiesInnerFromJSONTyped(json, false);
}
function UserIdentitiesInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "type": json["type"] == null ? void 0 : json["type"],
    "identity": json["identity"] == null ? void 0 : json["identity"]
  };
}
function UserIdentitiesInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "type": value["type"],
    "identity": value["identity"]
  };
}

// src/models/User.ts
function instanceOfUser(value) {
  return true;
}
function UserFromJSON(json) {
  return UserFromJSONTyped(json, false);
}
function UserFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "providedId": json["provided_id"] == null ? void 0 : json["provided_id"],
    "preferredEmail": json["preferred_email"] == null ? void 0 : json["preferred_email"],
    "username": json["username"] == null ? void 0 : json["username"],
    "lastName": json["last_name"] == null ? void 0 : json["last_name"],
    "firstName": json["first_name"] == null ? void 0 : json["first_name"],
    "isSuspended": json["is_suspended"] == null ? void 0 : json["is_suspended"],
    "picture": json["picture"] == null ? void 0 : json["picture"],
    "totalSignIns": json["total_sign_ins"] == null ? void 0 : json["total_sign_ins"],
    "failedSignIns": json["failed_sign_ins"] == null ? void 0 : json["failed_sign_ins"],
    "lastSignedIn": json["last_signed_in"] == null ? void 0 : json["last_signed_in"],
    "createdOn": json["created_on"] == null ? void 0 : json["created_on"],
    "organizations": json["organizations"] == null ? void 0 : json["organizations"],
    "identities": json["identities"] == null ? void 0 : json["identities"].map(UserIdentitiesInnerFromJSON)
  };
}
function UserToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "provided_id": value["providedId"],
    "preferred_email": value["preferredEmail"],
    "username": value["username"],
    "last_name": value["lastName"],
    "first_name": value["firstName"],
    "is_suspended": value["isSuspended"],
    "picture": value["picture"],
    "total_sign_ins": value["totalSignIns"],
    "failed_sign_ins": value["failedSignIns"],
    "last_signed_in": value["lastSignedIn"],
    "created_on": value["createdOn"],
    "organizations": value["organizations"],
    "identities": value["identities"] == null ? void 0 : value["identities"].map(UserIdentitiesInnerToJSON)
  };
}

// src/models/UserProfile.ts
function instanceOfUserProfile(value) {
  return true;
}
function UserProfileFromJSON(json) {
  return UserProfileFromJSONTyped(json, false);
}
function UserProfileFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "preferredEmail": json["preferred_email"] == null ? void 0 : json["preferred_email"],
    "username": json["username"] == null ? void 0 : json["username"],
    "providedId": json["provided_id"] == null ? void 0 : json["provided_id"],
    "lastName": json["last_name"] == null ? void 0 : json["last_name"],
    "firstName": json["first_name"] == null ? void 0 : json["first_name"],
    "picture": json["picture"] == null ? void 0 : json["picture"]
  };
}
function UserProfileToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "preferred_email": value["preferredEmail"],
    "username": value["username"],
    "provided_id": value["providedId"],
    "last_name": value["lastName"],
    "first_name": value["firstName"],
    "picture": value["picture"]
  };
}

// src/models/UserProfileV2.ts
function instanceOfUserProfileV2(value) {
  return true;
}
function UserProfileV2FromJSON(json) {
  return UserProfileV2FromJSONTyped(json, false);
}
function UserProfileV2FromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "sub": json["sub"] == null ? void 0 : json["sub"],
    "providedId": json["provided_id"] == null ? void 0 : json["provided_id"],
    "name": json["name"] == null ? void 0 : json["name"],
    "givenName": json["given_name"] == null ? void 0 : json["given_name"],
    "familyName": json["family_name"] == null ? void 0 : json["family_name"],
    "updatedAt": json["updated_at"] == null ? void 0 : json["updated_at"],
    "email": json["email"] == null ? void 0 : json["email"],
    "picture": json["picture"] == null ? void 0 : json["picture"]
  };
}
function UserProfileV2ToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "sub": value["sub"],
    "provided_id": value["providedId"],
    "name": value["name"],
    "given_name": value["givenName"],
    "family_name": value["familyName"],
    "updated_at": value["updatedAt"],
    "email": value["email"],
    "picture": value["picture"]
  };
}

// src/models/UsersResponseUsersInner.ts
function instanceOfUsersResponseUsersInner(value) {
  return true;
}
function UsersResponseUsersInnerFromJSON(json) {
  return UsersResponseUsersInnerFromJSONTyped(json, false);
}
function UsersResponseUsersInnerFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "id": json["id"] == null ? void 0 : json["id"],
    "providedId": json["provided_id"] == null ? void 0 : json["provided_id"],
    "email": json["email"] == null ? void 0 : json["email"],
    "username": json["username"] == null ? void 0 : json["username"],
    "lastName": json["last_name"] == null ? void 0 : json["last_name"],
    "firstName": json["first_name"] == null ? void 0 : json["first_name"],
    "isSuspended": json["is_suspended"] == null ? void 0 : json["is_suspended"],
    "picture": json["picture"] == null ? void 0 : json["picture"],
    "totalSignIns": json["total_sign_ins"] == null ? void 0 : json["total_sign_ins"],
    "failedSignIns": json["failed_sign_ins"] == null ? void 0 : json["failed_sign_ins"],
    "lastSignedIn": json["last_signed_in"] == null ? void 0 : json["last_signed_in"],
    "createdOn": json["created_on"] == null ? void 0 : json["created_on"],
    "organizations": json["organizations"] == null ? void 0 : json["organizations"],
    "identities": json["identities"] == null ? void 0 : json["identities"].map(UserIdentitiesInnerFromJSON)
  };
}
function UsersResponseUsersInnerToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "id": value["id"],
    "provided_id": value["providedId"],
    "email": value["email"],
    "username": value["username"],
    "last_name": value["lastName"],
    "first_name": value["firstName"],
    "is_suspended": value["isSuspended"],
    "picture": value["picture"],
    "total_sign_ins": value["totalSignIns"],
    "failed_sign_ins": value["failedSignIns"],
    "last_signed_in": value["lastSignedIn"],
    "created_on": value["createdOn"],
    "organizations": value["organizations"],
    "identities": value["identities"] == null ? void 0 : value["identities"].map(UserIdentitiesInnerToJSON)
  };
}

// src/models/UsersResponse.ts
function instanceOfUsersResponse(value) {
  return true;
}
function UsersResponseFromJSON(json) {
  return UsersResponseFromJSONTyped(json, false);
}
function UsersResponseFromJSONTyped(json, ignoreDiscriminator) {
  if (json == null) {
    return json;
  }
  return {
    "code": json["code"] == null ? void 0 : json["code"],
    "message": json["message"] == null ? void 0 : json["message"],
    "users": json["users"] == null ? void 0 : json["users"].map(UsersResponseUsersInnerFromJSON),
    "nextToken": json["next_token"] == null ? void 0 : json["next_token"]
  };
}
function UsersResponseToJSON(value) {
  if (value == null) {
    return value;
  }
  return {
    "code": value["code"],
    "message": value["message"],
    "users": value["users"] == null ? void 0 : value["users"].map(UsersResponseUsersInnerToJSON),
    "next_token": value["nextToken"]
  };
}

// src/apis/APIsApi.ts
var APIsApi = class extends BaseAPI {
  /**
   * Register a new API. For more information read [Register and manage APIs](https://docs.kinde.com/developer-tools/your-apis/register-manage-apis/).
   * Create API
   */
  async addAPIsRaw(requestParameters, initOverrides) {
    if (requestParameters["addAPIsRequest"] == null) {
      throw new RequiredError(
        "addAPIsRequest",
        'Required parameter "addAPIsRequest" was null or undefined when calling addAPIs().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:apis"]);
    }
    const response = await this.request({
      path: `/api/v1/apis`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: AddAPIsRequestToJSON(requestParameters["addAPIsRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateApisResponseFromJSON(jsonValue));
  }
  /**
   * Register a new API. For more information read [Register and manage APIs](https://docs.kinde.com/developer-tools/your-apis/register-manage-apis/).
   * Create API
   */
  async addAPIs(requestParameters, initOverrides) {
    const response = await this.addAPIsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete an API you previously created.
   * Delete API
   */
  async deleteAPIRaw(requestParameters, initOverrides) {
    if (requestParameters["apiId"] == null) {
      throw new RequiredError(
        "apiId",
        'Required parameter "apiId" was null or undefined when calling deleteAPI().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:apis"]);
    }
    const response = await this.request({
      path: `/api/v1/apis/{api_id}`.replace(`{${"api_id"}}`, encodeURIComponent(String(requestParameters["apiId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => DeleteApiResponseFromJSON(jsonValue));
  }
  /**
   * Delete an API you previously created.
   * Delete API
   */
  async deleteAPI(requestParameters, initOverrides) {
    const response = await this.deleteAPIRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Retrieve API details by ID.
   * Get API
   */
  async getAPIRaw(requestParameters, initOverrides) {
    if (requestParameters["apiId"] == null) {
      throw new RequiredError(
        "apiId",
        'Required parameter "apiId" was null or undefined when calling getAPI().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:apis"]);
    }
    const response = await this.request({
      path: `/api/v1/apis/{api_id}`.replace(`{${"api_id"}}`, encodeURIComponent(String(requestParameters["apiId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetApiResponseFromJSON(jsonValue));
  }
  /**
   * Retrieve API details by ID.
   * Get API
   */
  async getAPI(requestParameters, initOverrides) {
    const response = await this.getAPIRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Returns a list of your APIs. The APIs are returned sorted by name.
   * Get APIs
   */
  async getAPIsRaw(initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:apis"]);
    }
    const response = await this.request({
      path: `/api/v1/apis`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetApisResponseFromJSON(jsonValue));
  }
  /**
   * Returns a list of your APIs. The APIs are returned sorted by name.
   * Get APIs
   */
  async getAPIs(initOverrides) {
    const response = await this.getAPIsRaw(initOverrides);
    return await response.value();
  }
  /**
   * Authorize applications to be allowed to request access tokens for an API
   * Authorize API applications
   */
  async updateAPIApplicationsRaw(requestParameters, initOverrides) {
    if (requestParameters["apiId"] == null) {
      throw new RequiredError(
        "apiId",
        'Required parameter "apiId" was null or undefined when calling updateAPIApplications().'
      );
    }
    if (requestParameters["updateAPIApplicationsRequest"] == null) {
      throw new RequiredError(
        "updateAPIApplicationsRequest",
        'Required parameter "updateAPIApplicationsRequest" was null or undefined when calling updateAPIApplications().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:apis"]);
    }
    const response = await this.request({
      path: `/api/v1/apis/{api_id}/applications`.replace(`{${"api_id"}}`, encodeURIComponent(String(requestParameters["apiId"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateAPIApplicationsRequestToJSON(requestParameters["updateAPIApplicationsRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => AuthorizeAppApiResponseFromJSON(jsonValue));
  }
  /**
   * Authorize applications to be allowed to request access tokens for an API
   * Authorize API applications
   */
  async updateAPIApplications(requestParameters, initOverrides) {
    const response = await this.updateAPIApplicationsRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/ApplicationsApi.ts
var ApplicationsApi = class extends BaseAPI {
  /**
   * Create a new client.
   * Create Application
   */
  async createApplicationRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:applications"]);
    }
    const response = await this.request({
      path: `/api/v1/applications`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateApplicationRequestToJSON(requestParameters["createApplicationRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateApplicationResponseFromJSON(jsonValue));
  }
  /**
   * Create a new client.
   * Create Application
   */
  async createApplication(requestParameters = {}, initOverrides) {
    const response = await this.createApplicationRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete a client / application.
   * Delete application
   */
  async deleteApplicationRaw(requestParameters, initOverrides) {
    if (requestParameters["applicationId"] == null) {
      throw new RequiredError(
        "applicationId",
        'Required parameter "applicationId" was null or undefined when calling deleteApplication().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:applications"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{application_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters["applicationId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete a client / application.
   * Delete application
   */
  async deleteApplication(requestParameters, initOverrides) {
    const response = await this.deleteApplicationRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Enable an auth connection for an application.
   * Enable connection
   */
  async enableConnectionRaw(requestParameters, initOverrides) {
    if (requestParameters["applicationId"] == null) {
      throw new RequiredError(
        "applicationId",
        'Required parameter "applicationId" was null or undefined when calling enableConnection().'
      );
    }
    if (requestParameters["connectionId"] == null) {
      throw new RequiredError(
        "connectionId",
        'Required parameter "connectionId" was null or undefined when calling enableConnection().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:application_connections"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{application_id}/connections/{connection_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters["applicationId"]))).replace(`{${"connection_id"}}`, encodeURIComponent(String(requestParameters["connectionId"]))),
      method: "POST",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new VoidApiResponse(response);
  }
  /**
   * Enable an auth connection for an application.
   * Enable connection
   */
  async enableConnection(requestParameters, initOverrides) {
    await this.enableConnectionRaw(requestParameters, initOverrides);
  }
  /**
   * Gets an application given the application\'s ID.
   * Get application
   */
  async getApplicationRaw(requestParameters, initOverrides) {
    if (requestParameters["applicationId"] == null) {
      throw new RequiredError(
        "applicationId",
        'Required parameter "applicationId" was null or undefined when calling getApplication().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:applications"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{application_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters["applicationId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetApplicationResponseFromJSON(jsonValue));
  }
  /**
   * Gets an application given the application\'s ID.
   * Get application
   */
  async getApplication(requestParameters, initOverrides) {
    const response = await this.getApplicationRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Gets all connections for an application.
   * Get connections
   */
  async getApplicationConnectionsRaw(requestParameters, initOverrides) {
    if (requestParameters["applicationId"] == null) {
      throw new RequiredError(
        "applicationId",
        'Required parameter "applicationId" was null or undefined when calling getApplicationConnections().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:application_connections"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{application_id}/connections`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters["applicationId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetConnectionsResponseFromJSON(jsonValue));
  }
  /**
   * Gets all connections for an application.
   * Get connections
   */
  async getApplicationConnections(requestParameters, initOverrides) {
    const response = await this.getApplicationConnectionsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Get a list of applications / clients.
   * Get applications
   */
  async getApplicationsRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["sort"] != null) {
      queryParameters["sort"] = requestParameters["sort"];
    }
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["nextToken"] != null) {
      queryParameters["next_token"] = requestParameters["nextToken"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:applications"]);
    }
    const response = await this.request({
      path: `/api/v1/applications`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetApplicationsResponseFromJSON(jsonValue));
  }
  /**
   * Get a list of applications / clients.
   * Get applications
   */
  async getApplications(requestParameters = {}, initOverrides) {
    const response = await this.getApplicationsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Turn off an auth connection for an application
   * Remove connection
   */
  async removeConnectionRaw(requestParameters, initOverrides) {
    if (requestParameters["applicationId"] == null) {
      throw new RequiredError(
        "applicationId",
        'Required parameter "applicationId" was null or undefined when calling removeConnection().'
      );
    }
    if (requestParameters["connectionId"] == null) {
      throw new RequiredError(
        "connectionId",
        'Required parameter "connectionId" was null or undefined when calling removeConnection().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:application_connections"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{application_id}/connections/{connection_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters["applicationId"]))).replace(`{${"connection_id"}}`, encodeURIComponent(String(requestParameters["connectionId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Turn off an auth connection for an application
   * Remove connection
   */
  async removeConnection(requestParameters, initOverrides) {
    const response = await this.removeConnectionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Updates a client\'s settings. For more information, read [Applications in Kinde](https://docs.kinde.com/build/applications/about-applications)
   * Update Application
   */
  async updateApplicationRaw(requestParameters, initOverrides) {
    if (requestParameters["applicationId"] == null) {
      throw new RequiredError(
        "applicationId",
        'Required parameter "applicationId" was null or undefined when calling updateApplication().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:applications"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{application_id}`.replace(`{${"application_id"}}`, encodeURIComponent(String(requestParameters["applicationId"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateApplicationRequestToJSON(requestParameters["updateApplicationRequest"])
    }, initOverrides);
    return new VoidApiResponse(response);
  }
  /**
   * Updates a client\'s settings. For more information, read [Applications in Kinde](https://docs.kinde.com/build/applications/about-applications)
   * Update Application
   */
  async updateApplication(requestParameters, initOverrides) {
    await this.updateApplicationRaw(requestParameters, initOverrides);
  }
};
var GetApplicationsSortEnum = {
  Asc: "name_asc",
  Desc: "name_desc"
};

// src/apis/BusinessApi.ts
var BusinessApi = class extends BaseAPI {
  /**
   * Get your business details.
   * List business details
   */
  async getBusinessRaw(requestParameters, initOverrides) {
    if (requestParameters["code"] == null) {
      throw new RequiredError(
        "code",
        'Required parameter "code" was null or undefined when calling getBusiness().'
      );
    }
    if (requestParameters["name"] == null) {
      throw new RequiredError(
        "name",
        'Required parameter "name" was null or undefined when calling getBusiness().'
      );
    }
    if (requestParameters["email"] == null) {
      throw new RequiredError(
        "email",
        'Required parameter "email" was null or undefined when calling getBusiness().'
      );
    }
    const queryParameters = {};
    if (requestParameters["code"] != null) {
      queryParameters["code"] = requestParameters["code"];
    }
    if (requestParameters["name"] != null) {
      queryParameters["name"] = requestParameters["name"];
    }
    if (requestParameters["email"] != null) {
      queryParameters["email"] = requestParameters["email"];
    }
    if (requestParameters["phone"] != null) {
      queryParameters["phone"] = requestParameters["phone"];
    }
    if (requestParameters["industry"] != null) {
      queryParameters["industry"] = requestParameters["industry"];
    }
    if (requestParameters["timezone"] != null) {
      queryParameters["timezone"] = requestParameters["timezone"];
    }
    if (requestParameters["privacyUrl"] != null) {
      queryParameters["privacy_url"] = requestParameters["privacyUrl"];
    }
    if (requestParameters["termsUrl"] != null) {
      queryParameters["terms_url"] = requestParameters["termsUrl"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", []);
    }
    const response = await this.request({
      path: `/api/v1/business`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Get your business details.
   * List business details
   */
  async getBusiness(requestParameters, initOverrides) {
    const response = await this.getBusinessRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update business details.
   * Update business details
   */
  async updateBusinessRaw(requestParameters, initOverrides) {
    if (requestParameters["businessName"] == null) {
      throw new RequiredError(
        "businessName",
        'Required parameter "businessName" was null or undefined when calling updateBusiness().'
      );
    }
    if (requestParameters["primaryEmail"] == null) {
      throw new RequiredError(
        "primaryEmail",
        'Required parameter "primaryEmail" was null or undefined when calling updateBusiness().'
      );
    }
    const queryParameters = {};
    if (requestParameters["businessName"] != null) {
      queryParameters["business_name"] = requestParameters["businessName"];
    }
    if (requestParameters["primaryEmail"] != null) {
      queryParameters["primary_email"] = requestParameters["primaryEmail"];
    }
    if (requestParameters["primaryPhone"] != null) {
      queryParameters["primary_phone"] = requestParameters["primaryPhone"];
    }
    if (requestParameters["industryKey"] != null) {
      queryParameters["industry_key"] = requestParameters["industryKey"];
    }
    if (requestParameters["timezoneId"] != null) {
      queryParameters["timezone_id"] = requestParameters["timezoneId"];
    }
    if (requestParameters["privacyUrl"] != null) {
      queryParameters["privacy_url"] = requestParameters["privacyUrl"];
    }
    if (requestParameters["termsUrl"] != null) {
      queryParameters["terms_url"] = requestParameters["termsUrl"];
    }
    if (requestParameters["isShowKindeBranding"] != null) {
      queryParameters["is_show_kinde_branding"] = requestParameters["isShowKindeBranding"];
    }
    if (requestParameters["isClickWrap"] != null) {
      queryParameters["is_click_wrap"] = requestParameters["isClickWrap"];
    }
    if (requestParameters["partnerCode"] != null) {
      queryParameters["partner_code"] = requestParameters["partnerCode"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:businesses"]);
    }
    const response = await this.request({
      path: `/api/v1/business`,
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update business details.
   * Update business details
   */
  async updateBusiness(requestParameters, initOverrides) {
    const response = await this.updateBusinessRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/CallbacksApi.ts
var CallbacksApi = class extends BaseAPI {
  /**
   * Add additional logout redirect URLs. 
   * Add Logout Redirect URLs
   */
  async addLogoutRedirectURLsRaw(requestParameters, initOverrides) {
    if (requestParameters["appId"] == null) {
      throw new RequiredError(
        "appId",
        'Required parameter "appId" was null or undefined when calling addLogoutRedirectURLs().'
      );
    }
    if (requestParameters["replaceLogoutRedirectURLsRequest"] == null) {
      throw new RequiredError(
        "replaceLogoutRedirectURLsRequest",
        'Required parameter "replaceLogoutRedirectURLsRequest" was null or undefined when calling addLogoutRedirectURLs().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:application_logout_uris"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{app_id}/auth_logout_urls`.replace(`{${"app_id"}}`, encodeURIComponent(String(requestParameters["appId"]))),
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: ReplaceLogoutRedirectURLsRequestToJSON(requestParameters["replaceLogoutRedirectURLsRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Add additional logout redirect URLs. 
   * Add Logout Redirect URLs
   */
  async addLogoutRedirectURLs(requestParameters, initOverrides) {
    const response = await this.addLogoutRedirectURLsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Add additional redirect callback URLs. 
   * Add Redirect Callback URLs
   */
  async addRedirectCallbackURLsRaw(requestParameters, initOverrides) {
    if (requestParameters["appId"] == null) {
      throw new RequiredError(
        "appId",
        'Required parameter "appId" was null or undefined when calling addRedirectCallbackURLs().'
      );
    }
    if (requestParameters["replaceRedirectCallbackURLsRequest"] == null) {
      throw new RequiredError(
        "replaceRedirectCallbackURLsRequest",
        'Required parameter "replaceRedirectCallbackURLsRequest" was null or undefined when calling addRedirectCallbackURLs().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:application_redirect_uris"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{app_id}/auth_redirect_urls`.replace(`{${"app_id"}}`, encodeURIComponent(String(requestParameters["appId"]))),
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: ReplaceRedirectCallbackURLsRequestToJSON(requestParameters["replaceRedirectCallbackURLsRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Add additional redirect callback URLs. 
   * Add Redirect Callback URLs
   */
  async addRedirectCallbackURLs(requestParameters, initOverrides) {
    const response = await this.addRedirectCallbackURLsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete callback URLs. 
   * Delete Callback URLs
   */
  async deleteCallbackURLsRaw(requestParameters, initOverrides) {
    if (requestParameters["appId"] == null) {
      throw new RequiredError(
        "appId",
        'Required parameter "appId" was null or undefined when calling deleteCallbackURLs().'
      );
    }
    if (requestParameters["urls"] == null) {
      throw new RequiredError(
        "urls",
        'Required parameter "urls" was null or undefined when calling deleteCallbackURLs().'
      );
    }
    const queryParameters = {};
    if (requestParameters["urls"] != null) {
      queryParameters["urls"] = requestParameters["urls"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:application_redirect_uris"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{app_id}/auth_redirect_urls`.replace(`{${"app_id"}}`, encodeURIComponent(String(requestParameters["appId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete callback URLs. 
   * Delete Callback URLs
   */
  async deleteCallbackURLs(requestParameters, initOverrides) {
    const response = await this.deleteCallbackURLsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete logout URLs. 
   * Delete Logout URLs
   */
  async deleteLogoutURLsRaw(requestParameters, initOverrides) {
    if (requestParameters["appId"] == null) {
      throw new RequiredError(
        "appId",
        'Required parameter "appId" was null or undefined when calling deleteLogoutURLs().'
      );
    }
    if (requestParameters["urls"] == null) {
      throw new RequiredError(
        "urls",
        'Required parameter "urls" was null or undefined when calling deleteLogoutURLs().'
      );
    }
    const queryParameters = {};
    if (requestParameters["urls"] != null) {
      queryParameters["urls"] = requestParameters["urls"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:application_logout_uris"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{app_id}/auth_logout_urls`.replace(`{${"app_id"}}`, encodeURIComponent(String(requestParameters["appId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete logout URLs. 
   * Delete Logout URLs
   */
  async deleteLogoutURLs(requestParameters, initOverrides) {
    const response = await this.deleteLogoutURLsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Returns an application\'s redirect callback URLs. 
   * List Callback URLs
   */
  async getCallbackURLsRaw(requestParameters, initOverrides) {
    if (requestParameters["appId"] == null) {
      throw new RequiredError(
        "appId",
        'Required parameter "appId" was null or undefined when calling getCallbackURLs().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:applications_redirect_uris"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{app_id}/auth_redirect_urls`.replace(`{${"app_id"}}`, encodeURIComponent(String(requestParameters["appId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => RedirectCallbackUrlsFromJSON(jsonValue));
  }
  /**
   * Returns an application\'s redirect callback URLs. 
   * List Callback URLs
   */
  async getCallbackURLs(requestParameters, initOverrides) {
    const response = await this.getCallbackURLsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Returns an application\'s logout redirect URLs. 
   * List Logout URLs
   */
  async getLogoutURLsRaw(requestParameters, initOverrides) {
    if (requestParameters["appId"] == null) {
      throw new RequiredError(
        "appId",
        'Required parameter "appId" was null or undefined when calling getLogoutURLs().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:application_logout_uris"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{app_id}/auth_logout_urls`.replace(`{${"app_id"}}`, encodeURIComponent(String(requestParameters["appId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => LogoutRedirectUrlsFromJSON(jsonValue));
  }
  /**
   * Returns an application\'s logout redirect URLs. 
   * List Logout URLs
   */
  async getLogoutURLs(requestParameters, initOverrides) {
    const response = await this.getLogoutURLsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Replace all logout redirect URLs. 
   * Replace Logout Redirect URLs
   */
  async replaceLogoutRedirectURLsRaw(requestParameters, initOverrides) {
    if (requestParameters["appId"] == null) {
      throw new RequiredError(
        "appId",
        'Required parameter "appId" was null or undefined when calling replaceLogoutRedirectURLs().'
      );
    }
    if (requestParameters["replaceLogoutRedirectURLsRequest"] == null) {
      throw new RequiredError(
        "replaceLogoutRedirectURLsRequest",
        'Required parameter "replaceLogoutRedirectURLsRequest" was null or undefined when calling replaceLogoutRedirectURLs().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:application_logout_uris"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{app_id}/auth_logout_urls`.replace(`{${"app_id"}}`, encodeURIComponent(String(requestParameters["appId"]))),
      method: "PUT",
      headers: headerParameters,
      query: queryParameters,
      body: ReplaceLogoutRedirectURLsRequestToJSON(requestParameters["replaceLogoutRedirectURLsRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Replace all logout redirect URLs. 
   * Replace Logout Redirect URLs
   */
  async replaceLogoutRedirectURLs(requestParameters, initOverrides) {
    const response = await this.replaceLogoutRedirectURLsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Replace all redirect callback URLs. 
   * Replace Redirect Callback URLs
   */
  async replaceRedirectCallbackURLsRaw(requestParameters, initOverrides) {
    if (requestParameters["appId"] == null) {
      throw new RequiredError(
        "appId",
        'Required parameter "appId" was null or undefined when calling replaceRedirectCallbackURLs().'
      );
    }
    if (requestParameters["replaceRedirectCallbackURLsRequest"] == null) {
      throw new RequiredError(
        "replaceRedirectCallbackURLsRequest",
        'Required parameter "replaceRedirectCallbackURLsRequest" was null or undefined when calling replaceRedirectCallbackURLs().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:application_redirect_uris"]);
    }
    const response = await this.request({
      path: `/api/v1/applications/{app_id}/auth_redirect_urls`.replace(`{${"app_id"}}`, encodeURIComponent(String(requestParameters["appId"]))),
      method: "PUT",
      headers: headerParameters,
      query: queryParameters,
      body: ReplaceRedirectCallbackURLsRequestToJSON(requestParameters["replaceRedirectCallbackURLsRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Replace all redirect callback URLs. 
   * Replace Redirect Callback URLs
   */
  async replaceRedirectCallbackURLs(requestParameters, initOverrides) {
    const response = await this.replaceRedirectCallbackURLsRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/ConnectedAppsApi.ts
var ConnectedAppsApi = class extends BaseAPI {
  /**
   * Get a URL that authenticates and authorizes a user to a third-party connected app.
   * Get Connected App URL
   */
  async getConnectedAppAuthUrlRaw(requestParameters, initOverrides) {
    if (requestParameters["keyCodeRef"] == null) {
      throw new RequiredError(
        "keyCodeRef",
        'Required parameter "keyCodeRef" was null or undefined when calling getConnectedAppAuthUrl().'
      );
    }
    const queryParameters = {};
    if (requestParameters["keyCodeRef"] != null) {
      queryParameters["key_code_ref"] = requestParameters["keyCodeRef"];
    }
    if (requestParameters["userId"] != null) {
      queryParameters["user_id"] = requestParameters["userId"];
    }
    if (requestParameters["orgCode"] != null) {
      queryParameters["org_code"] = requestParameters["orgCode"];
    }
    if (requestParameters["overrideCallbackUrl"] != null) {
      queryParameters["override_callback_url"] = requestParameters["overrideCallbackUrl"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:connected_apps"]);
    }
    const response = await this.request({
      path: `/api/v1/connected_apps/auth_url`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => ConnectedAppsAuthUrlFromJSON(jsonValue));
  }
  /**
   * Get a URL that authenticates and authorizes a user to a third-party connected app.
   * Get Connected App URL
   */
  async getConnectedAppAuthUrl(requestParameters, initOverrides) {
    const response = await this.getConnectedAppAuthUrlRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Get an access token that can be used to call the third-party provider linked to the connected app.
   * Get Connected App Token
   */
  async getConnectedAppTokenRaw(requestParameters, initOverrides) {
    if (requestParameters["sessionId"] == null) {
      throw new RequiredError(
        "sessionId",
        'Required parameter "sessionId" was null or undefined when calling getConnectedAppToken().'
      );
    }
    const queryParameters = {};
    if (requestParameters["sessionId"] != null) {
      queryParameters["session_id"] = requestParameters["sessionId"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:connected_apps"]);
    }
    const response = await this.request({
      path: `/api/v1/connected_apps/token`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => ConnectedAppsAccessTokenFromJSON(jsonValue));
  }
  /**
   * Get an access token that can be used to call the third-party provider linked to the connected app.
   * Get Connected App Token
   */
  async getConnectedAppToken(requestParameters, initOverrides) {
    const response = await this.getConnectedAppTokenRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Revoke the tokens linked to the connected app session.
   * Revoke Connected App Token
   */
  async revokeConnectedAppTokenRaw(requestParameters, initOverrides) {
    if (requestParameters["sessionId"] == null) {
      throw new RequiredError(
        "sessionId",
        'Required parameter "sessionId" was null or undefined when calling revokeConnectedAppToken().'
      );
    }
    const queryParameters = {};
    if (requestParameters["sessionId"] != null) {
      queryParameters["session_id"] = requestParameters["sessionId"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:connected_apps"]);
    }
    const response = await this.request({
      path: `/api/v1/connected_apps/revoke`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Revoke the tokens linked to the connected app session.
   * Revoke Connected App Token
   */
  async revokeConnectedAppToken(requestParameters, initOverrides) {
    const response = await this.revokeConnectedAppTokenRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/ConnectionsApi.ts
var ConnectionsApi = class extends BaseAPI {
  /**
   * Create Connection.
   * Create Connection
   */
  async createConnectionRaw(requestParameters, initOverrides) {
    if (requestParameters["createConnectionRequest"] == null) {
      throw new RequiredError(
        "createConnectionRequest",
        'Required parameter "createConnectionRequest" was null or undefined when calling createConnection().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:connections"]);
    }
    const response = await this.request({
      path: `/api/v1/connections`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateConnectionRequestToJSON(requestParameters["createConnectionRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateConnectionResponseFromJSON(jsonValue));
  }
  /**
   * Create Connection.
   * Create Connection
   */
  async createConnection(requestParameters, initOverrides) {
    const response = await this.createConnectionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete connection. 
   * Delete Connection
   */
  async deleteConnectionRaw(requestParameters, initOverrides) {
    if (requestParameters["connectionId"] == null) {
      throw new RequiredError(
        "connectionId",
        'Required parameter "connectionId" was null or undefined when calling deleteConnection().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:connections"]);
    }
    const response = await this.request({
      path: `/api/v1/connections/{connection_id}`.replace(`{${"connection_id"}}`, encodeURIComponent(String(requestParameters["connectionId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete connection. 
   * Delete Connection
   */
  async deleteConnection(requestParameters, initOverrides) {
    const response = await this.deleteConnectionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Get Connection.
   * Get Connection
   */
  async getConnectionRaw(requestParameters, initOverrides) {
    if (requestParameters["connectionId"] == null) {
      throw new RequiredError(
        "connectionId",
        'Required parameter "connectionId" was null or undefined when calling getConnection().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:connections"]);
    }
    const response = await this.request({
      path: `/api/v1/connections/{connection_id}`.replace(`{${"connection_id"}}`, encodeURIComponent(String(requestParameters["connectionId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => ConnectionFromJSON(jsonValue));
  }
  /**
   * Get Connection.
   * Get Connection
   */
  async getConnection(requestParameters, initOverrides) {
    const response = await this.getConnectionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Returns a list of Connections 
   * List Connections
   */
  async getConnectionsRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["startingAfter"] != null) {
      queryParameters["starting_after"] = requestParameters["startingAfter"];
    }
    if (requestParameters["endingBefore"] != null) {
      queryParameters["ending_before"] = requestParameters["endingBefore"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:connections"]);
    }
    const response = await this.request({
      path: `/api/v1/connections`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetConnectionsResponseFromJSON(jsonValue));
  }
  /**
   * Returns a list of Connections 
   * List Connections
   */
  async getConnections(requestParameters = {}, initOverrides) {
    const response = await this.getConnectionsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update Connection.
   * Update Connection
   */
  async updateConnectionRaw(requestParameters, initOverrides) {
    if (requestParameters["connectionId"] == null) {
      throw new RequiredError(
        "connectionId",
        'Required parameter "connectionId" was null or undefined when calling updateConnection().'
      );
    }
    if (requestParameters["updateConnectionRequest"] == null) {
      throw new RequiredError(
        "updateConnectionRequest",
        'Required parameter "updateConnectionRequest" was null or undefined when calling updateConnection().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:connections"]);
    }
    const response = await this.request({
      path: `/api/v1/connections/{connection_id}`.replace(`{${"connection_id"}}`, encodeURIComponent(String(requestParameters["connectionId"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateConnectionRequestToJSON(requestParameters["updateConnectionRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update Connection.
   * Update Connection
   */
  async updateConnection(requestParameters, initOverrides) {
    const response = await this.updateConnectionRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/EnvironmentsApi.ts
var EnvironmentsApi = class extends BaseAPI {
  /**
   * Delete environment feature flag override.
   * Delete Environment Feature Flag Override
   */
  async deleteEnvironementFeatureFlagOverrideRaw(requestParameters, initOverrides) {
    if (requestParameters["featureFlagKey"] == null) {
      throw new RequiredError(
        "featureFlagKey",
        'Required parameter "featureFlagKey" was null or undefined when calling deleteEnvironementFeatureFlagOverride().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:environment_feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/environment/feature_flags/{feature_flag_key}`.replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters["featureFlagKey"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete environment feature flag override.
   * Delete Environment Feature Flag Override
   */
  async deleteEnvironementFeatureFlagOverride(requestParameters, initOverrides) {
    const response = await this.deleteEnvironementFeatureFlagOverrideRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete all environment feature flag overrides.
   * Delete Environment Feature Flag Overrides
   */
  async deleteEnvironementFeatureFlagOverridesRaw(initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:environment_feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/environment/feature_flags`,
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete all environment feature flag overrides.
   * Delete Environment Feature Flag Overrides
   */
  async deleteEnvironementFeatureFlagOverrides(initOverrides) {
    const response = await this.deleteEnvironementFeatureFlagOverridesRaw(initOverrides);
    return await response.value();
  }
  /**
   * Get environment feature flags.
   * List Environment Feature Flags
   */
  async getEnvironementFeatureFlagsRaw(initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:environment_feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/environment/feature_flags`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetEnvironmentFeatureFlagsResponseFromJSON(jsonValue));
  }
  /**
   * Get environment feature flags.
   * List Environment Feature Flags
   */
  async getEnvironementFeatureFlags(initOverrides) {
    const response = await this.getEnvironementFeatureFlagsRaw(initOverrides);
    return await response.value();
  }
  /**
   * Update environment feature flag override.
   * Update Environment Feature Flag Override
   */
  async updateEnvironementFeatureFlagOverrideRaw(requestParameters, initOverrides) {
    if (requestParameters["featureFlagKey"] == null) {
      throw new RequiredError(
        "featureFlagKey",
        'Required parameter "featureFlagKey" was null or undefined when calling updateEnvironementFeatureFlagOverride().'
      );
    }
    if (requestParameters["updateEnvironementFeatureFlagOverrideRequest"] == null) {
      throw new RequiredError(
        "updateEnvironementFeatureFlagOverrideRequest",
        'Required parameter "updateEnvironementFeatureFlagOverrideRequest" was null or undefined when calling updateEnvironementFeatureFlagOverride().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:environment_feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/environment/feature_flags/{feature_flag_key}`.replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters["featureFlagKey"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateEnvironementFeatureFlagOverrideRequestToJSON(requestParameters["updateEnvironementFeatureFlagOverrideRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update environment feature flag override.
   * Update Environment Feature Flag Override
   */
  async updateEnvironementFeatureFlagOverride(requestParameters, initOverrides) {
    const response = await this.updateEnvironementFeatureFlagOverrideRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/FeatureFlagsApi.ts
var FeatureFlagsApi = class extends BaseAPI {
  /**
   * Create feature flag.
   * Create Feature Flag
   */
  async createFeatureFlagRaw(requestParameters, initOverrides) {
    if (requestParameters["createFeatureFlagRequest"] == null) {
      throw new RequiredError(
        "createFeatureFlagRequest",
        'Required parameter "createFeatureFlagRequest" was null or undefined when calling createFeatureFlag().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/feature_flags`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateFeatureFlagRequestToJSON(requestParameters["createFeatureFlagRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Create feature flag.
   * Create Feature Flag
   */
  async createFeatureFlag(requestParameters, initOverrides) {
    const response = await this.createFeatureFlagRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete feature flag
   * Delete Feature Flag
   */
  async deleteFeatureFlagRaw(requestParameters, initOverrides) {
    if (requestParameters["featureFlagKey"] == null) {
      throw new RequiredError(
        "featureFlagKey",
        'Required parameter "featureFlagKey" was null or undefined when calling deleteFeatureFlag().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/feature_flags/{feature_flag_key}`.replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters["featureFlagKey"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete feature flag
   * Delete Feature Flag
   */
  async deleteFeatureFlag(requestParameters, initOverrides) {
    const response = await this.deleteFeatureFlagRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update feature flag.
   * Replace Feature Flag
   */
  async updateFeatureFlagRaw(requestParameters, initOverrides) {
    if (requestParameters["featureFlagKey"] == null) {
      throw new RequiredError(
        "featureFlagKey",
        'Required parameter "featureFlagKey" was null or undefined when calling updateFeatureFlag().'
      );
    }
    if (requestParameters["name"] == null) {
      throw new RequiredError(
        "name",
        'Required parameter "name" was null or undefined when calling updateFeatureFlag().'
      );
    }
    if (requestParameters["description"] == null) {
      throw new RequiredError(
        "description",
        'Required parameter "description" was null or undefined when calling updateFeatureFlag().'
      );
    }
    if (requestParameters["type"] == null) {
      throw new RequiredError(
        "type",
        'Required parameter "type" was null or undefined when calling updateFeatureFlag().'
      );
    }
    if (requestParameters["allowOverrideLevel"] == null) {
      throw new RequiredError(
        "allowOverrideLevel",
        'Required parameter "allowOverrideLevel" was null or undefined when calling updateFeatureFlag().'
      );
    }
    if (requestParameters["defaultValue"] == null) {
      throw new RequiredError(
        "defaultValue",
        'Required parameter "defaultValue" was null or undefined when calling updateFeatureFlag().'
      );
    }
    const queryParameters = {};
    if (requestParameters["name"] != null) {
      queryParameters["name"] = requestParameters["name"];
    }
    if (requestParameters["description"] != null) {
      queryParameters["description"] = requestParameters["description"];
    }
    if (requestParameters["type"] != null) {
      queryParameters["type"] = requestParameters["type"];
    }
    if (requestParameters["allowOverrideLevel"] != null) {
      queryParameters["allow_override_level"] = requestParameters["allowOverrideLevel"];
    }
    if (requestParameters["defaultValue"] != null) {
      queryParameters["default_value"] = requestParameters["defaultValue"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/feature_flags/{feature_flag_key}`.replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters["featureFlagKey"]))),
      method: "PUT",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update feature flag.
   * Replace Feature Flag
   */
  async updateFeatureFlag(requestParameters, initOverrides) {
    const response = await this.updateFeatureFlagRaw(requestParameters, initOverrides);
    return await response.value();
  }
};
var UpdateFeatureFlagTypeEnum = {
  Str: "str",
  Int: "int",
  Bool: "bool"
};
var UpdateFeatureFlagAllowOverrideLevelEnum = {
  Env: "env",
  Org: "org"
};

// src/apis/IdentitiesApi.ts
var IdentitiesApi = class extends BaseAPI {
  /**
   * Delete identity by ID.
   * Delete identity
   */
  async deleteIdentityRaw(requestParameters, initOverrides) {
    if (requestParameters["identityId"] == null) {
      throw new RequiredError(
        "identityId",
        'Required parameter "identityId" was null or undefined when calling deleteIdentity().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:identities"]);
    }
    const response = await this.request({
      path: `/api/v1/identities/{identity_id}`.replace(`{${"identity_id"}}`, encodeURIComponent(String(requestParameters["identityId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete identity by ID.
   * Delete identity
   */
  async deleteIdentity(requestParameters, initOverrides) {
    const response = await this.deleteIdentityRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Returns an identity by ID 
   * Get identity
   */
  async getIdentityRaw(requestParameters, initOverrides) {
    if (requestParameters["identityId"] == null) {
      throw new RequiredError(
        "identityId",
        'Required parameter "identityId" was null or undefined when calling getIdentity().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:identities"]);
    }
    const response = await this.request({
      path: `/api/v1/identities/{identity_id}`.replace(`{${"identity_id"}}`, encodeURIComponent(String(requestParameters["identityId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => IdentityFromJSON(jsonValue));
  }
  /**
   * Returns an identity by ID 
   * Get identity
   */
  async getIdentity(requestParameters, initOverrides) {
    const response = await this.getIdentityRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update identity by ID.
   * Update identity
   */
  async updateIdentityRaw(requestParameters, initOverrides) {
    if (requestParameters["identityId"] == null) {
      throw new RequiredError(
        "identityId",
        'Required parameter "identityId" was null or undefined when calling updateIdentity().'
      );
    }
    if (requestParameters["updateIdentityRequest"] == null) {
      throw new RequiredError(
        "updateIdentityRequest",
        'Required parameter "updateIdentityRequest" was null or undefined when calling updateIdentity().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:identities"]);
    }
    const response = await this.request({
      path: `/api/v1/identities/{identity_id}`.replace(`{${"identity_id"}}`, encodeURIComponent(String(requestParameters["identityId"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateIdentityRequestToJSON(requestParameters["updateIdentityRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update identity by ID.
   * Update identity
   */
  async updateIdentity(requestParameters, initOverrides) {
    const response = await this.updateIdentityRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/IndustriesApi.ts
var IndustriesApi = class extends BaseAPI {
  /**
   * Get a list of industries and associated industry keys.
   * List industries and industry keys.
   */
  async getIndustriesRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["industryKey"] != null) {
      queryParameters["industry_key"] = requestParameters["industryKey"];
    }
    if (requestParameters["name"] != null) {
      queryParameters["name"] = requestParameters["name"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:industries"]);
    }
    const response = await this.request({
      path: `/api/v1/industries`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Get a list of industries and associated industry keys.
   * List industries and industry keys.
   */
  async getIndustries(requestParameters = {}, initOverrides) {
    const response = await this.getIndustriesRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/OAuthApi.ts
var OAuthApi = class extends BaseAPI {
  /**
   * Contains the id, names and email of the currently logged in user. 
   * Get User Profile
   */
  async getUserRaw(initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("kindeBearerAuth", []);
      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    const response = await this.request({
      path: `/oauth2/user_profile`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => UserProfileFromJSON(jsonValue));
  }
  /**
   * Contains the id, names and email of the currently logged in user. 
   * Get User Profile
   */
  async getUser(initOverrides) {
    const response = await this.getUserRaw(initOverrides);
    return await response.value();
  }
  /**
   * Contains the id, names, profile picture URL and email of the currently logged in user. 
   * Returns the details of the currently logged in user
   */
  async getUserProfileV2Raw(initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("kindeBearerAuth", []);
      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    const response = await this.request({
      path: `/oauth2/v2/user_profile`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => UserProfileV2FromJSON(jsonValue));
  }
  /**
   * Contains the id, names, profile picture URL and email of the currently logged in user. 
   * Returns the details of the currently logged in user
   */
  async getUserProfileV2(initOverrides) {
    const response = await this.getUserProfileV2Raw(initOverrides);
    return await response.value();
  }
  /**
   * Retrieve information about the provided token.
   * Get token details
   */
  async tokenIntrospectionRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("kindeBearerAuth", []);
      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    const consumes = [
      { contentType: "application/x-www-form-urlencoded" }
    ];
    const canConsumeForm2 = canConsumeForm(consumes);
    let formParams;
    let useForm = false;
    if (useForm) {
      formParams = new FormData();
    } else {
      formParams = new URLSearchParams();
    }
    if (requestParameters["token"] != null) {
      formParams.append("token", requestParameters["token"]);
    }
    if (requestParameters["tokenType"] != null) {
      formParams.append("token_type", requestParameters["tokenType"]);
    }
    const response = await this.request({
      path: `/oauth2/introspect`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: formParams
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => TokenIntrospectFromJSON(jsonValue));
  }
  /**
   * Retrieve information about the provided token.
   * Get token details
   */
  async tokenIntrospection(requestParameters = {}, initOverrides) {
    const response = await this.tokenIntrospectionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Revoke a previously issued token.
   * Revoke token
   */
  async tokenRevocationRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("kindeBearerAuth", []);
      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    const consumes = [
      { contentType: "application/x-www-form-urlencoded" }
    ];
    const canConsumeForm2 = canConsumeForm(consumes);
    let formParams;
    let useForm = false;
    if (useForm) {
      formParams = new FormData();
    } else {
      formParams = new URLSearchParams();
    }
    if (requestParameters["token"] != null) {
      formParams.append("token", requestParameters["token"]);
    }
    if (requestParameters["clientId"] != null) {
      formParams.append("client_id", requestParameters["clientId"]);
    }
    if (requestParameters["clientSecret"] != null) {
      formParams.append("client_secret", requestParameters["clientSecret"]);
    }
    const response = await this.request({
      path: `/oauth2/revoke`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: formParams
    }, initOverrides);
    return new VoidApiResponse(response);
  }
  /**
   * Revoke a previously issued token.
   * Revoke token
   */
  async tokenRevocation(requestParameters = {}, initOverrides) {
    await this.tokenRevocationRaw(requestParameters, initOverrides);
  }
};

// src/apis/OrganizationsApi.ts
var OrganizationsApi = class extends BaseAPI {
  /**
   * Add existing users to an organization.
   * Add Organization Users
   */
  async addOrganizationUsersRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling addOrganizationUsers().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:organization_users"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: AddOrganizationUsersRequestToJSON(requestParameters["addOrganizationUsersRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => AddOrganizationUsersResponseFromJSON(jsonValue));
  }
  /**
   * Add existing users to an organization.
   * Add Organization Users
   */
  async addOrganizationUsers(requestParameters, initOverrides) {
    const response = await this.addOrganizationUsersRaw(requestParameters, initOverrides);
    switch (response.raw.status) {
      case 200:
        return await response.value();
      case 204:
        return null;
      default:
        return await response.value();
    }
  }
  /**
   * Create an organization.
   * Create Organization
   */
  async createOrganizationRaw(requestParameters, initOverrides) {
    if (requestParameters["createOrganizationRequest"] == null) {
      throw new RequiredError(
        "createOrganizationRequest",
        'Required parameter "createOrganizationRequest" was null or undefined when calling createOrganization().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:organizations"]);
    }
    const response = await this.request({
      path: `/api/v1/organization`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateOrganizationRequestToJSON(requestParameters["createOrganizationRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateOrganizationResponseFromJSON(jsonValue));
  }
  /**
   * Create an organization.
   * Create Organization
   */
  async createOrganization(requestParameters, initOverrides) {
    const response = await this.createOrganizationRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Add permission to an organization user.
   * Add Organization User Permission
   */
  async createOrganizationUserPermissionRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling createOrganizationUserPermission().'
      );
    }
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling createOrganizationUserPermission().'
      );
    }
    if (requestParameters["createOrganizationUserPermissionRequest"] == null) {
      throw new RequiredError(
        "createOrganizationUserPermissionRequest",
        'Required parameter "createOrganizationUserPermissionRequest" was null or undefined when calling createOrganizationUserPermission().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:organization_user_permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users/{user_id}/permissions`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateOrganizationUserPermissionRequestToJSON(requestParameters["createOrganizationUserPermissionRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Add permission to an organization user.
   * Add Organization User Permission
   */
  async createOrganizationUserPermission(requestParameters, initOverrides) {
    const response = await this.createOrganizationUserPermissionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Add role to an organization user.
   * Add Organization User Role
   */
  async createOrganizationUserRoleRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling createOrganizationUserRole().'
      );
    }
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling createOrganizationUserRole().'
      );
    }
    if (requestParameters["createOrganizationUserRoleRequest"] == null) {
      throw new RequiredError(
        "createOrganizationUserRoleRequest",
        'Required parameter "createOrganizationUserRoleRequest" was null or undefined when calling createOrganizationUserRole().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:organization_user_roles"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users/{user_id}/roles`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateOrganizationUserRoleRequestToJSON(requestParameters["createOrganizationUserRoleRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Add role to an organization user.
   * Add Organization User Role
   */
  async createOrganizationUserRole(requestParameters, initOverrides) {
    const response = await this.createOrganizationUserRoleRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete an organization.
   * Delete Organization
   */
  async deleteOrganizationRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling deleteOrganization().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:organizations"]);
    }
    const response = await this.request({
      path: `/api/v1/organization/{org_code}`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new VoidApiResponse(response);
  }
  /**
   * Delete an organization.
   * Delete Organization
   */
  async deleteOrganization(requestParameters, initOverrides) {
    await this.deleteOrganizationRaw(requestParameters, initOverrides);
  }
  /**
   * Delete organization feature flag override.
   * Delete Organization Feature Flag Override
   */
  async deleteOrganizationFeatureFlagOverrideRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling deleteOrganizationFeatureFlagOverride().'
      );
    }
    if (requestParameters["featureFlagKey"] == null) {
      throw new RequiredError(
        "featureFlagKey",
        'Required parameter "featureFlagKey" was null or undefined when calling deleteOrganizationFeatureFlagOverride().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:organization_feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/feature_flags/{feature_flag_key}`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters["featureFlagKey"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete organization feature flag override.
   * Delete Organization Feature Flag Override
   */
  async deleteOrganizationFeatureFlagOverride(requestParameters, initOverrides) {
    const response = await this.deleteOrganizationFeatureFlagOverrideRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete all organization feature flag overrides.
   * Delete Organization Feature Flag Overrides
   */
  async deleteOrganizationFeatureFlagOverridesRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling deleteOrganizationFeatureFlagOverrides().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:organization_feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/feature_flags`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete all organization feature flag overrides.
   * Delete Organization Feature Flag Overrides
   */
  async deleteOrganizationFeatureFlagOverrides(requestParameters, initOverrides) {
    const response = await this.deleteOrganizationFeatureFlagOverridesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete organization handle 
   * Delete organization handle
   */
  async deleteOrganizationHandleRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling deleteOrganizationHandle().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:organization_handles"]);
    }
    const response = await this.request({
      path: `/api/v1/organization/{org_code}/handle`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete organization handle 
   * Delete organization handle
   */
  async deleteOrganizationHandle(requestParameters, initOverrides) {
    const response = await this.deleteOrganizationHandleRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete permission for an organization user.
   * Delete Organization User Permission
   */
  async deleteOrganizationUserPermissionRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling deleteOrganizationUserPermission().'
      );
    }
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling deleteOrganizationUserPermission().'
      );
    }
    if (requestParameters["permissionId"] == null) {
      throw new RequiredError(
        "permissionId",
        'Required parameter "permissionId" was null or undefined when calling deleteOrganizationUserPermission().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:organization_user_permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users/{user_id}/permissions/{permission_id}`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))).replace(`{${"permission_id"}}`, encodeURIComponent(String(requestParameters["permissionId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete permission for an organization user.
   * Delete Organization User Permission
   */
  async deleteOrganizationUserPermission(requestParameters, initOverrides) {
    const response = await this.deleteOrganizationUserPermissionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete role for an organization user.
   * Delete Organization User Role
   */
  async deleteOrganizationUserRoleRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling deleteOrganizationUserRole().'
      );
    }
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling deleteOrganizationUserRole().'
      );
    }
    if (requestParameters["roleId"] == null) {
      throw new RequiredError(
        "roleId",
        'Required parameter "roleId" was null or undefined when calling deleteOrganizationUserRole().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:organization_user_roles"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users/{user_id}/roles/{role_id}`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))).replace(`{${"role_id"}}`, encodeURIComponent(String(requestParameters["roleId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete role for an organization user.
   * Delete Organization User Role
   */
  async deleteOrganizationUserRole(requestParameters, initOverrides) {
    const response = await this.deleteOrganizationUserRoleRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Gets an organization given the organization\'s code. 
   * Get Organization
   */
  async getOrganizationRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["code"] != null) {
      queryParameters["code"] = requestParameters["code"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:organizations"]);
    }
    const response = await this.request({
      path: `/api/v1/organization`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => OrganizationFromJSON(jsonValue));
  }
  /**
   * Gets an organization given the organization\'s code. 
   * Get Organization
   */
  async getOrganization(requestParameters = {}, initOverrides) {
    const response = await this.getOrganizationRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Get all organization feature flags.
   * List Organization Feature Flags
   */
  async getOrganizationFeatureFlagsRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling getOrganizationFeatureFlags().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:organization_feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/feature_flags`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetOrganizationFeatureFlagsResponseFromJSON(jsonValue));
  }
  /**
   * Get all organization feature flags.
   * List Organization Feature Flags
   */
  async getOrganizationFeatureFlags(requestParameters, initOverrides) {
    const response = await this.getOrganizationFeatureFlagsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Gets properties for an organization by org code. 
   * Get Organization Property Values
   */
  async getOrganizationPropertyValuesRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling getOrganizationPropertyValues().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:organization_properties"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/properties`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetPropertyValuesResponseFromJSON(jsonValue));
  }
  /**
   * Gets properties for an organization by org code. 
   * Get Organization Property Values
   */
  async getOrganizationPropertyValues(requestParameters, initOverrides) {
    const response = await this.getOrganizationPropertyValuesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Get permissions for an organization user.
   * List Organization User Permissions
   */
  async getOrganizationUserPermissionsRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling getOrganizationUserPermissions().'
      );
    }
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling getOrganizationUserPermissions().'
      );
    }
    const queryParameters = {};
    if (requestParameters["expand"] != null) {
      queryParameters["expand"] = requestParameters["expand"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:organization_user_permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users/{user_id}/permissions`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetOrganizationsUserPermissionsResponseFromJSON(jsonValue));
  }
  /**
   * Get permissions for an organization user.
   * List Organization User Permissions
   */
  async getOrganizationUserPermissions(requestParameters, initOverrides) {
    const response = await this.getOrganizationUserPermissionsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Get roles for an organization user.
   * List Organization User Roles
   */
  async getOrganizationUserRolesRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling getOrganizationUserRoles().'
      );
    }
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling getOrganizationUserRoles().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:organization_user_roles"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users/{user_id}/roles`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetOrganizationsUserRolesResponseFromJSON(jsonValue));
  }
  /**
   * Get roles for an organization user.
   * List Organization User Roles
   */
  async getOrganizationUserRoles(requestParameters, initOverrides) {
    const response = await this.getOrganizationUserRolesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Get users in an organization.
   * List Organization Users
   */
  async getOrganizationUsersRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling getOrganizationUsers().'
      );
    }
    const queryParameters = {};
    if (requestParameters["sort"] != null) {
      queryParameters["sort"] = requestParameters["sort"];
    }
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["nextToken"] != null) {
      queryParameters["next_token"] = requestParameters["nextToken"];
    }
    if (requestParameters["permissions"] != null) {
      queryParameters["permissions"] = requestParameters["permissions"];
    }
    if (requestParameters["roles"] != null) {
      queryParameters["roles"] = requestParameters["roles"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:organization_users"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetOrganizationUsersResponseFromJSON(jsonValue));
  }
  /**
   * Get users in an organization.
   * List Organization Users
   */
  async getOrganizationUsers(requestParameters, initOverrides) {
    const response = await this.getOrganizationUsersRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Get a list of organizations. 
   * List Organizations
   */
  async getOrganizationsRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["sort"] != null) {
      queryParameters["sort"] = requestParameters["sort"];
    }
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["nextToken"] != null) {
      queryParameters["next_token"] = requestParameters["nextToken"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:organizations"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetOrganizationsResponseFromJSON(jsonValue));
  }
  /**
   * Get a list of organizations. 
   * List Organizations
   */
  async getOrganizations(requestParameters = {}, initOverrides) {
    const response = await this.getOrganizationsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Remove user from an organization.
   * Remove Organization User
   */
  async removeOrganizationUserRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling removeOrganizationUser().'
      );
    }
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling removeOrganizationUser().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:organization_users"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users/{user_id}`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Remove user from an organization.
   * Remove Organization User
   */
  async removeOrganizationUser(requestParameters, initOverrides) {
    const response = await this.removeOrganizationUserRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update an organization.
   * Update Organization
   */
  async updateOrganizationRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling updateOrganization().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:organizations"]);
    }
    const response = await this.request({
      path: `/api/v1/organization/{org_code}`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateOrganizationRequestToJSON(requestParameters["updateOrganizationRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update an organization.
   * Update Organization
   */
  async updateOrganization(requestParameters, initOverrides) {
    const response = await this.updateOrganizationRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update organization feature flag override.
   * Update Organization Feature Flag Override
   */
  async updateOrganizationFeatureFlagOverrideRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling updateOrganizationFeatureFlagOverride().'
      );
    }
    if (requestParameters["featureFlagKey"] == null) {
      throw new RequiredError(
        "featureFlagKey",
        'Required parameter "featureFlagKey" was null or undefined when calling updateOrganizationFeatureFlagOverride().'
      );
    }
    if (requestParameters["value"] == null) {
      throw new RequiredError(
        "value",
        'Required parameter "value" was null or undefined when calling updateOrganizationFeatureFlagOverride().'
      );
    }
    const queryParameters = {};
    if (requestParameters["value"] != null) {
      queryParameters["value"] = requestParameters["value"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:organization_feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/feature_flags/{feature_flag_key}`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters["featureFlagKey"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update organization feature flag override.
   * Update Organization Feature Flag Override
   */
  async updateOrganizationFeatureFlagOverride(requestParameters, initOverrides) {
    const response = await this.updateOrganizationFeatureFlagOverrideRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update organization property values.
   * Update Organization Property values
   */
  async updateOrganizationPropertiesRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling updateOrganizationProperties().'
      );
    }
    if (requestParameters["updateOrganizationPropertiesRequest"] == null) {
      throw new RequiredError(
        "updateOrganizationPropertiesRequest",
        'Required parameter "updateOrganizationPropertiesRequest" was null or undefined when calling updateOrganizationProperties().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:organization_properties"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/properties`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateOrganizationPropertiesRequestToJSON(requestParameters["updateOrganizationPropertiesRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update organization property values.
   * Update Organization Property values
   */
  async updateOrganizationProperties(requestParameters, initOverrides) {
    const response = await this.updateOrganizationPropertiesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update organization property value.
   * Update Organization Property value
   */
  async updateOrganizationPropertyRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling updateOrganizationProperty().'
      );
    }
    if (requestParameters["propertyKey"] == null) {
      throw new RequiredError(
        "propertyKey",
        'Required parameter "propertyKey" was null or undefined when calling updateOrganizationProperty().'
      );
    }
    if (requestParameters["value"] == null) {
      throw new RequiredError(
        "value",
        'Required parameter "value" was null or undefined when calling updateOrganizationProperty().'
      );
    }
    const queryParameters = {};
    if (requestParameters["value"] != null) {
      queryParameters["value"] = requestParameters["value"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:organization_properties"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/properties/{property_key}`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))).replace(`{${"property_key"}}`, encodeURIComponent(String(requestParameters["propertyKey"]))),
      method: "PUT",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update organization property value.
   * Update Organization Property value
   */
  async updateOrganizationProperty(requestParameters, initOverrides) {
    const response = await this.updateOrganizationPropertyRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update users that belong to an organization.
   * Update Organization Users
   */
  async updateOrganizationUsersRaw(requestParameters, initOverrides) {
    if (requestParameters["orgCode"] == null) {
      throw new RequiredError(
        "orgCode",
        'Required parameter "orgCode" was null or undefined when calling updateOrganizationUsers().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:organization_users"]);
    }
    const response = await this.request({
      path: `/api/v1/organizations/{org_code}/users`.replace(`{${"org_code"}}`, encodeURIComponent(String(requestParameters["orgCode"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateOrganizationUsersRequestToJSON(requestParameters["updateOrganizationUsersRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => UpdateOrganizationUsersResponseFromJSON(jsonValue));
  }
  /**
   * Update users that belong to an organization.
   * Update Organization Users
   */
  async updateOrganizationUsers(requestParameters, initOverrides) {
    const response = await this.updateOrganizationUsersRaw(requestParameters, initOverrides);
    return await response.value();
  }
};
var GetOrganizationUsersSortEnum = {
  NameAsc: "name_asc",
  NameDesc: "name_desc",
  EmailAsc: "email_asc",
  EmailDesc: "email_desc",
  IdAsc: "id_asc",
  IdDesc: "id_desc"
};
var GetOrganizationsSortEnum = {
  NameAsc: "name_asc",
  NameDesc: "name_desc",
  EmailAsc: "email_asc",
  EmailDesc: "email_desc"
};

// src/apis/PermissionsApi.ts
var PermissionsApi = class extends BaseAPI {
  /**
   * Create a new permission.
   * Create Permission
   */
  async createPermissionRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/permissions`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreatePermissionRequestToJSON(requestParameters["createPermissionRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Create a new permission.
   * Create Permission
   */
  async createPermission(requestParameters = {}, initOverrides) {
    const response = await this.createPermissionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete permission
   * Delete Permission
   */
  async deletePermissionRaw(requestParameters, initOverrides) {
    if (requestParameters["permissionId"] == null) {
      throw new RequiredError(
        "permissionId",
        'Required parameter "permissionId" was null or undefined when calling deletePermission().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/permissions/{permission_id}`.replace(`{${"permission_id"}}`, encodeURIComponent(String(requestParameters["permissionId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete permission
   * Delete Permission
   */
  async deletePermission(requestParameters, initOverrides) {
    const response = await this.deletePermissionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * The returned list can be sorted by permission name or permission ID in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
   * List Permissions
   */
  async getPermissionsRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["sort"] != null) {
      queryParameters["sort"] = requestParameters["sort"];
    }
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["nextToken"] != null) {
      queryParameters["next_token"] = requestParameters["nextToken"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/permissions`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetPermissionsResponseFromJSON(jsonValue));
  }
  /**
   * The returned list can be sorted by permission name or permission ID in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
   * List Permissions
   */
  async getPermissions(requestParameters = {}, initOverrides) {
    const response = await this.getPermissionsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update permission
   * Update Permission
   */
  async updatePermissionsRaw(requestParameters, initOverrides) {
    if (requestParameters["permissionId"] == null) {
      throw new RequiredError(
        "permissionId",
        'Required parameter "permissionId" was null or undefined when calling updatePermissions().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/permissions/{permission_id}`.replace(`{${"permission_id"}}`, encodeURIComponent(String(requestParameters["permissionId"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: CreatePermissionRequestToJSON(requestParameters["createPermissionRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update permission
   * Update Permission
   */
  async updatePermissions(requestParameters, initOverrides) {
    const response = await this.updatePermissionsRaw(requestParameters, initOverrides);
    return await response.value();
  }
};
var GetPermissionsSortEnum = {
  NameAsc: "name_asc",
  NameDesc: "name_desc",
  IdAsc: "id_asc",
  IdDesc: "id_desc"
};

// src/apis/PropertiesApi.ts
var PropertiesApi = class extends BaseAPI {
  /**
   * Create property.
   * Create Property
   */
  async createPropertyRaw(requestParameters, initOverrides) {
    if (requestParameters["createPropertyRequest"] == null) {
      throw new RequiredError(
        "createPropertyRequest",
        'Required parameter "createPropertyRequest" was null or undefined when calling createProperty().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:properties"]);
    }
    const response = await this.request({
      path: `/api/v1/properties`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreatePropertyRequestToJSON(requestParameters["createPropertyRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreatePropertyResponseFromJSON(jsonValue));
  }
  /**
   * Create property.
   * Create Property
   */
  async createProperty(requestParameters, initOverrides) {
    const response = await this.createPropertyRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete property.
   * Delete Property
   */
  async deletePropertyRaw(requestParameters, initOverrides) {
    if (requestParameters["propertyId"] == null) {
      throw new RequiredError(
        "propertyId",
        'Required parameter "propertyId" was null or undefined when calling deleteProperty().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:properties"]);
    }
    const response = await this.request({
      path: `/api/v1/properties/{property_id}`.replace(`{${"property_id"}}`, encodeURIComponent(String(requestParameters["propertyId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete property.
   * Delete Property
   */
  async deleteProperty(requestParameters, initOverrides) {
    const response = await this.deletePropertyRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Returns a list of properties 
   * List properties
   */
  async getPropertiesRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["startingAfter"] != null) {
      queryParameters["starting_after"] = requestParameters["startingAfter"];
    }
    if (requestParameters["endingBefore"] != null) {
      queryParameters["ending_before"] = requestParameters["endingBefore"];
    }
    if (requestParameters["context"] != null) {
      queryParameters["context"] = requestParameters["context"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:properties"]);
    }
    const response = await this.request({
      path: `/api/v1/properties`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetPropertiesResponseFromJSON(jsonValue));
  }
  /**
   * Returns a list of properties 
   * List properties
   */
  async getProperties(requestParameters = {}, initOverrides) {
    const response = await this.getPropertiesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update property.
   * Update Property
   */
  async updatePropertyRaw(requestParameters, initOverrides) {
    if (requestParameters["propertyId"] == null) {
      throw new RequiredError(
        "propertyId",
        'Required parameter "propertyId" was null or undefined when calling updateProperty().'
      );
    }
    if (requestParameters["updatePropertyRequest"] == null) {
      throw new RequiredError(
        "updatePropertyRequest",
        'Required parameter "updatePropertyRequest" was null or undefined when calling updateProperty().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:properties"]);
    }
    const response = await this.request({
      path: `/api/v1/properties/{property_id}`.replace(`{${"property_id"}}`, encodeURIComponent(String(requestParameters["propertyId"]))),
      method: "PUT",
      headers: headerParameters,
      query: queryParameters,
      body: UpdatePropertyRequestToJSON(requestParameters["updatePropertyRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update property.
   * Update Property
   */
  async updateProperty(requestParameters, initOverrides) {
    const response = await this.updatePropertyRaw(requestParameters, initOverrides);
    return await response.value();
  }
};
var GetPropertiesContextEnum = {
  Usr: "usr",
  Org: "org"
};

// src/apis/PropertyCategoriesApi.ts
var PropertyCategoriesApi = class extends BaseAPI {
  /**
   * Create category.
   * Create Category
   */
  async createCategoryRaw(requestParameters, initOverrides) {
    if (requestParameters["createCategoryRequest"] == null) {
      throw new RequiredError(
        "createCategoryRequest",
        'Required parameter "createCategoryRequest" was null or undefined when calling createCategory().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:property_categories"]);
    }
    const response = await this.request({
      path: `/api/v1/property_categories`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateCategoryRequestToJSON(requestParameters["createCategoryRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateCategoryResponseFromJSON(jsonValue));
  }
  /**
   * Create category.
   * Create Category
   */
  async createCategory(requestParameters, initOverrides) {
    const response = await this.createCategoryRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Returns a list of categories. 
   * List categories
   */
  async getCategoriesRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["startingAfter"] != null) {
      queryParameters["starting_after"] = requestParameters["startingAfter"];
    }
    if (requestParameters["endingBefore"] != null) {
      queryParameters["ending_before"] = requestParameters["endingBefore"];
    }
    if (requestParameters["context"] != null) {
      queryParameters["context"] = requestParameters["context"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:property_categories"]);
    }
    const response = await this.request({
      path: `/api/v1/property_categories`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetCategoriesResponseFromJSON(jsonValue));
  }
  /**
   * Returns a list of categories. 
   * List categories
   */
  async getCategories(requestParameters = {}, initOverrides) {
    const response = await this.getCategoriesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update category.
   * Update Category
   */
  async updateCategoryRaw(requestParameters, initOverrides) {
    if (requestParameters["categoryId"] == null) {
      throw new RequiredError(
        "categoryId",
        'Required parameter "categoryId" was null or undefined when calling updateCategory().'
      );
    }
    if (requestParameters["updateCategoryRequest"] == null) {
      throw new RequiredError(
        "updateCategoryRequest",
        'Required parameter "updateCategoryRequest" was null or undefined when calling updateCategory().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:property_categories"]);
    }
    const response = await this.request({
      path: `/api/v1/property_categories/{category_id}`.replace(`{${"category_id"}}`, encodeURIComponent(String(requestParameters["categoryId"]))),
      method: "PUT",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateCategoryRequestToJSON(requestParameters["updateCategoryRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update category.
   * Update Category
   */
  async updateCategory(requestParameters, initOverrides) {
    const response = await this.updateCategoryRaw(requestParameters, initOverrides);
    return await response.value();
  }
};
var GetCategoriesContextEnum = {
  Usr: "usr",
  Org: "org"
};

// src/apis/RolesApi.ts
var RolesApi = class extends BaseAPI {
  /**
   * Create role.
   * Create Role
   */
  async createRoleRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:roles"]);
    }
    const response = await this.request({
      path: `/api/v1/roles`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateRoleRequestToJSON(requestParameters["createRoleRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Create role.
   * Create Role
   */
  async createRole(requestParameters = {}, initOverrides) {
    const response = await this.createRoleRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete role
   * Delete Role
   */
  async deleteRoleRaw(requestParameters, initOverrides) {
    if (requestParameters["roleId"] == null) {
      throw new RequiredError(
        "roleId",
        'Required parameter "roleId" was null or undefined when calling deleteRole().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:roles"]);
    }
    const response = await this.request({
      path: `/api/v1/roles/{role_id}`.replace(`{${"role_id"}}`, encodeURIComponent(String(requestParameters["roleId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete role
   * Delete Role
   */
  async deleteRole(requestParameters, initOverrides) {
    const response = await this.deleteRoleRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Get permissions for a role.
   * Get Role Permissions
   */
  async getRolePermissionRaw(requestParameters, initOverrides) {
    if (requestParameters["roleId"] == null) {
      throw new RequiredError(
        "roleId",
        'Required parameter "roleId" was null or undefined when calling getRolePermission().'
      );
    }
    const queryParameters = {};
    if (requestParameters["sort"] != null) {
      queryParameters["sort"] = requestParameters["sort"];
    }
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["nextToken"] != null) {
      queryParameters["next_token"] = requestParameters["nextToken"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:role_permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/roles/{role_id}/permissions`.replace(`{${"role_id"}}`, encodeURIComponent(String(requestParameters["roleId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => jsonValue.map(RolesPermissionResponseInnerFromJSON));
  }
  /**
   * Get permissions for a role.
   * Get Role Permissions
   */
  async getRolePermission(requestParameters, initOverrides) {
    const response = await this.getRolePermissionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * The returned list can be sorted by role name or role ID in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
   * List Roles
   */
  async getRolesRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["sort"] != null) {
      queryParameters["sort"] = requestParameters["sort"];
    }
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["nextToken"] != null) {
      queryParameters["next_token"] = requestParameters["nextToken"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:roles"]);
    }
    const response = await this.request({
      path: `/api/v1/roles`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetRolesResponseFromJSON(jsonValue));
  }
  /**
   * The returned list can be sorted by role name or role ID in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
   * List Roles
   */
  async getRoles(requestParameters = {}, initOverrides) {
    const response = await this.getRolesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Remove a permission from a role.
   * Remove Role Permission
   */
  async removeRolePermissionRaw(requestParameters, initOverrides) {
    if (requestParameters["roleId"] == null) {
      throw new RequiredError(
        "roleId",
        'Required parameter "roleId" was null or undefined when calling removeRolePermission().'
      );
    }
    if (requestParameters["permissionId"] == null) {
      throw new RequiredError(
        "permissionId",
        'Required parameter "permissionId" was null or undefined when calling removeRolePermission().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:role_permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/roles/{role_id}/permissions/{permission_id}`.replace(`{${"role_id"}}`, encodeURIComponent(String(requestParameters["roleId"]))).replace(`{${"permission_id"}}`, encodeURIComponent(String(requestParameters["permissionId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Remove a permission from a role.
   * Remove Role Permission
   */
  async removeRolePermission(requestParameters, initOverrides) {
    const response = await this.removeRolePermissionRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update role permissions. 
   * Update Role Permissions
   */
  async updateRolePermissionsRaw(requestParameters, initOverrides) {
    if (requestParameters["roleId"] == null) {
      throw new RequiredError(
        "roleId",
        'Required parameter "roleId" was null or undefined when calling updateRolePermissions().'
      );
    }
    if (requestParameters["updateRolePermissionsRequest"] == null) {
      throw new RequiredError(
        "updateRolePermissionsRequest",
        'Required parameter "updateRolePermissionsRequest" was null or undefined when calling updateRolePermissions().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:role_permissions"]);
    }
    const response = await this.request({
      path: `/api/v1/roles/{role_id}/permissions`.replace(`{${"role_id"}}`, encodeURIComponent(String(requestParameters["roleId"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateRolePermissionsRequestToJSON(requestParameters["updateRolePermissionsRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => UpdateRolePermissionsResponseFromJSON(jsonValue));
  }
  /**
   * Update role permissions. 
   * Update Role Permissions
   */
  async updateRolePermissions(requestParameters, initOverrides) {
    const response = await this.updateRolePermissionsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update a role
   * Update Role
   */
  async updateRolesRaw(requestParameters, initOverrides) {
    if (requestParameters["roleId"] == null) {
      throw new RequiredError(
        "roleId",
        'Required parameter "roleId" was null or undefined when calling updateRoles().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:roles"]);
    }
    const response = await this.request({
      path: `/api/v1/roles/{role_id}`.replace(`{${"role_id"}}`, encodeURIComponent(String(requestParameters["roleId"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateRolesRequestToJSON(requestParameters["updateRolesRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update a role
   * Update Role
   */
  async updateRoles(requestParameters, initOverrides) {
    const response = await this.updateRolesRaw(requestParameters, initOverrides);
    return await response.value();
  }
};
var GetRolePermissionSortEnum = {
  NameAsc: "name_asc",
  NameDesc: "name_desc",
  IdAsc: "id_asc",
  IdDesc: "id_desc"
};
var GetRolesSortEnum = {
  NameAsc: "name_asc",
  NameDesc: "name_desc",
  IdAsc: "id_asc",
  IdDesc: "id_desc"
};

// src/apis/SubscribersApi.ts
var SubscribersApi = class extends BaseAPI {
  /**
   * Create subscriber.
   * Create Subscriber
   */
  async createSubscriberRaw(requestParameters, initOverrides) {
    if (requestParameters["firstName"] == null) {
      throw new RequiredError(
        "firstName",
        'Required parameter "firstName" was null or undefined when calling createSubscriber().'
      );
    }
    if (requestParameters["lastName"] == null) {
      throw new RequiredError(
        "lastName",
        'Required parameter "lastName" was null or undefined when calling createSubscriber().'
      );
    }
    if (requestParameters["email"] == null) {
      throw new RequiredError(
        "email",
        'Required parameter "email" was null or undefined when calling createSubscriber().'
      );
    }
    const queryParameters = {};
    if (requestParameters["firstName"] != null) {
      queryParameters["first_name"] = requestParameters["firstName"];
    }
    if (requestParameters["lastName"] != null) {
      queryParameters["last_name"] = requestParameters["lastName"];
    }
    if (requestParameters["email"] != null) {
      queryParameters["email"] = requestParameters["email"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:subscribers"]);
    }
    const response = await this.request({
      path: `/api/v1/subscribers`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateSubscriberSuccessResponseFromJSON(jsonValue));
  }
  /**
   * Create subscriber.
   * Create Subscriber
   */
  async createSubscriber(requestParameters, initOverrides) {
    const response = await this.createSubscriberRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Retrieve a subscriber record. 
   * Get Subscriber
   */
  async getSubscriberRaw(requestParameters, initOverrides) {
    if (requestParameters["subscriberId"] == null) {
      throw new RequiredError(
        "subscriberId",
        'Required parameter "subscriberId" was null or undefined when calling getSubscriber().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:subscribers"]);
    }
    const response = await this.request({
      path: `/api/v1/subscribers/{subscriber_id}`.replace(`{${"subscriber_id"}}`, encodeURIComponent(String(requestParameters["subscriberId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetSubscriberResponseFromJSON(jsonValue));
  }
  /**
   * Retrieve a subscriber record. 
   * Get Subscriber
   */
  async getSubscriber(requestParameters, initOverrides) {
    const response = await this.getSubscriberRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * The returned list can be sorted by full name or email address in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
   * List Subscribers
   */
  async getSubscribersRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["sort"] != null) {
      queryParameters["sort"] = requestParameters["sort"];
    }
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["nextToken"] != null) {
      queryParameters["next_token"] = requestParameters["nextToken"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:subscribers"]);
    }
    const response = await this.request({
      path: `/api/v1/subscribers`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetSubscribersResponseFromJSON(jsonValue));
  }
  /**
   * The returned list can be sorted by full name or email address in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
   * List Subscribers
   */
  async getSubscribers(requestParameters = {}, initOverrides) {
    const response = await this.getSubscribersRaw(requestParameters, initOverrides);
    return await response.value();
  }
};
var GetSubscribersSortEnum = {
  NameAsc: "name_asc",
  NameDesc: "name_desc",
  EmailAsc: "email_asc",
  EmailDesc: "email_desc"
};

// src/apis/TimezonesApi.ts
var TimezonesApi = class extends BaseAPI {
  /**
   * Get a list of timezones and associated timezone keys.
   * List timezones and timezone IDs.
   */
  async getTimezonesRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["timezoneKey"] != null) {
      queryParameters["timezone_key"] = requestParameters["timezoneKey"];
    }
    if (requestParameters["name"] != null) {
      queryParameters["name"] = requestParameters["name"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:timezones"]);
    }
    const response = await this.request({
      path: `/api/v1/timezones`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Get a list of timezones and associated timezone keys.
   * List timezones and timezone IDs.
   */
  async getTimezones(requestParameters = {}, initOverrides) {
    const response = await this.getTimezonesRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/UsersApi.ts
var UsersApi = class extends BaseAPI {
  /**
   * Creates a user record and optionally zero or more identities for the user. An example identity could be the email address of the user. 
   * Create User
   */
  async createUserRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:users"]);
    }
    const response = await this.request({
      path: `/api/v1/user`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateUserRequestToJSON(requestParameters["createUserRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateUserResponseFromJSON(jsonValue));
  }
  /**
   * Creates a user record and optionally zero or more identities for the user. An example identity could be the email address of the user. 
   * Create User
   */
  async createUser(requestParameters = {}, initOverrides) {
    const response = await this.createUserRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Creates an identity for a user. 
   * Create identity
   */
  async createUserIdentityRaw(requestParameters, initOverrides) {
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling createUserIdentity().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:user_identities"]);
    }
    const response = await this.request({
      path: `/api/v1/users/{user_id}/identities`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateUserIdentityRequestToJSON(requestParameters["createUserIdentityRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateIdentityResponseFromJSON(jsonValue));
  }
  /**
   * Creates an identity for a user. 
   * Create identity
   */
  async createUserIdentity(requestParameters, initOverrides) {
    const response = await this.createUserIdentityRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete a user record. 
   * Delete User
   */
  async deleteUserRaw(requestParameters, initOverrides) {
    if (requestParameters["id"] == null) {
      throw new RequiredError(
        "id",
        'Required parameter "id" was null or undefined when calling deleteUser().'
      );
    }
    const queryParameters = {};
    if (requestParameters["id"] != null) {
      queryParameters["id"] = requestParameters["id"];
    }
    if (requestParameters["isDeleteProfile"] != null) {
      queryParameters["is_delete_profile"] = requestParameters["isDeleteProfile"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:users"]);
    }
    const response = await this.request({
      path: `/api/v1/user`,
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Delete a user record. 
   * Delete User
   */
  async deleteUser(requestParameters, initOverrides) {
    const response = await this.deleteUserRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Retrieve a user record. 
   * Get User
   */
  async getUserDataRaw(requestParameters, initOverrides) {
    if (requestParameters["id"] == null) {
      throw new RequiredError(
        "id",
        'Required parameter "id" was null or undefined when calling getUserData().'
      );
    }
    const queryParameters = {};
    if (requestParameters["id"] != null) {
      queryParameters["id"] = requestParameters["id"];
    }
    if (requestParameters["expand"] != null) {
      queryParameters["expand"] = requestParameters["expand"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:users"]);
    }
    const response = await this.request({
      path: `/api/v1/user`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
  }
  /**
   * Retrieve a user record. 
   * Get User
   */
  async getUserData(requestParameters, initOverrides) {
    const response = await this.getUserDataRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Gets a list of identities for an user by ID. 
   * Get identities
   */
  async getUserIdentitiesRaw(requestParameters, initOverrides) {
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling getUserIdentities().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:user_identities"]);
    }
    const response = await this.request({
      path: `/api/v1/users/{user_id}/identities`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetIdentitiesResponseFromJSON(jsonValue));
  }
  /**
   * Gets a list of identities for an user by ID. 
   * Get identities
   */
  async getUserIdentities(requestParameters, initOverrides) {
    const response = await this.getUserIdentitiesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Gets properties for an user by ID. 
   * Get property values
   */
  async getUserPropertyValuesRaw(requestParameters, initOverrides) {
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling getUserPropertyValues().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:user_properties"]);
    }
    const response = await this.request({
      path: `/api/v1/users/{user_id}/properties`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetPropertyValuesResponseFromJSON(jsonValue));
  }
  /**
   * Gets properties for an user by ID. 
   * Get property values
   */
  async getUserPropertyValues(requestParameters, initOverrides) {
    const response = await this.getUserPropertyValuesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * The returned list can be sorted by full name or email address in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
   * List Users
   */
  async getUsersRaw(requestParameters, initOverrides) {
    const queryParameters = {};
    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }
    if (requestParameters["userId"] != null) {
      queryParameters["user_id"] = requestParameters["userId"];
    }
    if (requestParameters["nextToken"] != null) {
      queryParameters["next_token"] = requestParameters["nextToken"];
    }
    if (requestParameters["email"] != null) {
      queryParameters["email"] = requestParameters["email"];
    }
    if (requestParameters["username"] != null) {
      queryParameters["username"] = requestParameters["username"];
    }
    if (requestParameters["expand"] != null) {
      queryParameters["expand"] = requestParameters["expand"];
    }
    if (requestParameters["hasOrganization"] != null) {
      queryParameters["has_organization"] = requestParameters["hasOrganization"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:users"]);
    }
    const response = await this.request({
      path: `/api/v1/users`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => UsersResponseFromJSON(jsonValue));
  }
  /**
   * The returned list can be sorted by full name or email address in ascending or descending order. The number of records to return at a time can also be controlled using the `page_size` query string parameter. 
   * List Users
   */
  async getUsers(requestParameters = {}, initOverrides) {
    const response = await this.getUsersRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Refreshes the user\'s claims and invalidates the current cache. 
   * Refresh User Claims and Invalidate Cache
   */
  async refreshUserClaimsRaw(requestParameters, initOverrides) {
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling refreshUserClaims().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:user_refresh_claims"]);
    }
    const response = await this.request({
      path: `/api/v1/users/{user_id}/refresh_claims`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "POST",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Refreshes the user\'s claims and invalidates the current cache. 
   * Refresh User Claims and Invalidate Cache
   */
  async refreshUserClaims(requestParameters, initOverrides) {
    const response = await this.refreshUserClaimsRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Set user password.
   * Set User password
   */
  async setUserPasswordRaw(requestParameters, initOverrides) {
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling setUserPassword().'
      );
    }
    if (requestParameters["setUserPasswordRequest"] == null) {
      throw new RequiredError(
        "setUserPasswordRequest",
        'Required parameter "setUserPasswordRequest" was null or undefined when calling setUserPassword().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:user_passwords"]);
    }
    const response = await this.request({
      path: `/api/v1/users/{user_id}/password`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "PUT",
      headers: headerParameters,
      query: queryParameters,
      body: SetUserPasswordRequestToJSON(requestParameters["setUserPasswordRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Set user password.
   * Set User password
   */
  async setUserPassword(requestParameters, initOverrides) {
    const response = await this.setUserPasswordRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update a user record. 
   * Update User
   */
  async updateUserRaw(requestParameters, initOverrides) {
    if (requestParameters["id"] == null) {
      throw new RequiredError(
        "id",
        'Required parameter "id" was null or undefined when calling updateUser().'
      );
    }
    if (requestParameters["updateUserRequest"] == null) {
      throw new RequiredError(
        "updateUserRequest",
        'Required parameter "updateUserRequest" was null or undefined when calling updateUser().'
      );
    }
    const queryParameters = {};
    if (requestParameters["id"] != null) {
      queryParameters["id"] = requestParameters["id"];
    }
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:users"]);
    }
    const response = await this.request({
      path: `/api/v1/user`,
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateUserRequestToJSON(requestParameters["updateUserRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => UpdateUserResponseFromJSON(jsonValue));
  }
  /**
   * Update a user record. 
   * Update User
   */
  async updateUser(requestParameters, initOverrides) {
    const response = await this.updateUserRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update user feature flag override.
   * Update User Feature Flag Override
   */
  async updateUserFeatureFlagOverrideRaw(requestParameters, initOverrides) {
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling updateUserFeatureFlagOverride().'
      );
    }
    if (requestParameters["featureFlagKey"] == null) {
      throw new RequiredError(
        "featureFlagKey",
        'Required parameter "featureFlagKey" was null or undefined when calling updateUserFeatureFlagOverride().'
      );
    }
    if (requestParameters["value"] == null) {
      throw new RequiredError(
        "value",
        'Required parameter "value" was null or undefined when calling updateUserFeatureFlagOverride().'
      );
    }
    const queryParameters = {};
    if (requestParameters["value"] != null) {
      queryParameters["value"] = requestParameters["value"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:user_feature_flags"]);
    }
    const response = await this.request({
      path: `/api/v1/users/{user_id}/feature_flags/{feature_flag_key}`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))).replace(`{${"feature_flag_key"}}`, encodeURIComponent(String(requestParameters["featureFlagKey"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update user feature flag override.
   * Update User Feature Flag Override
   */
  async updateUserFeatureFlagOverride(requestParameters, initOverrides) {
    const response = await this.updateUserFeatureFlagOverrideRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update property values.
   * Update Property values
   */
  async updateUserPropertiesRaw(requestParameters, initOverrides) {
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling updateUserProperties().'
      );
    }
    if (requestParameters["updateOrganizationPropertiesRequest"] == null) {
      throw new RequiredError(
        "updateOrganizationPropertiesRequest",
        'Required parameter "updateOrganizationPropertiesRequest" was null or undefined when calling updateUserProperties().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:user_properties"]);
    }
    const response = await this.request({
      path: `/api/v1/users/{user_id}/properties`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))),
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateOrganizationPropertiesRequestToJSON(requestParameters["updateOrganizationPropertiesRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update property values.
   * Update Property values
   */
  async updateUserProperties(requestParameters, initOverrides) {
    const response = await this.updateUserPropertiesRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Update property value.
   * Update Property value
   */
  async updateUserPropertyRaw(requestParameters, initOverrides) {
    if (requestParameters["userId"] == null) {
      throw new RequiredError(
        "userId",
        'Required parameter "userId" was null or undefined when calling updateUserProperty().'
      );
    }
    if (requestParameters["propertyKey"] == null) {
      throw new RequiredError(
        "propertyKey",
        'Required parameter "propertyKey" was null or undefined when calling updateUserProperty().'
      );
    }
    if (requestParameters["value"] == null) {
      throw new RequiredError(
        "value",
        'Required parameter "value" was null or undefined when calling updateUserProperty().'
      );
    }
    const queryParameters = {};
    if (requestParameters["value"] != null) {
      queryParameters["value"] = requestParameters["value"];
    }
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:user_properties"]);
    }
    const response = await this.request({
      path: `/api/v1/users/{user_id}/properties/{property_key}`.replace(`{${"user_id"}}`, encodeURIComponent(String(requestParameters["userId"]))).replace(`{${"property_key"}}`, encodeURIComponent(String(requestParameters["propertyKey"]))),
      method: "PUT",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => SuccessResponseFromJSON(jsonValue));
  }
  /**
   * Update property value.
   * Update Property value
   */
  async updateUserProperty(requestParameters, initOverrides) {
    const response = await this.updateUserPropertyRaw(requestParameters, initOverrides);
    return await response.value();
  }
};

// src/apis/WebhooksApi.ts
var WebhooksApi = class extends BaseAPI {
  /**
   * Create a webhook 
   * Create a Webhook
   */
  async createWebHookRaw(requestParameters, initOverrides) {
    if (requestParameters["createWebHookRequest"] == null) {
      throw new RequiredError(
        "createWebHookRequest",
        'Required parameter "createWebHookRequest" was null or undefined when calling createWebHook().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["create:webhooks"]);
    }
    const response = await this.request({
      path: `/api/v1/webhooks`,
      method: "POST",
      headers: headerParameters,
      query: queryParameters,
      body: CreateWebHookRequestToJSON(requestParameters["createWebHookRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => CreateWebhookResponseFromJSON(jsonValue));
  }
  /**
   * Create a webhook 
   * Create a Webhook
   */
  async createWebHook(requestParameters, initOverrides) {
    const response = await this.createWebHookRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Delete webhook 
   * Delete Webhook
   */
  async deleteWebHookRaw(requestParameters, initOverrides) {
    if (requestParameters["webhookId"] == null) {
      throw new RequiredError(
        "webhookId",
        'Required parameter "webhookId" was null or undefined when calling deleteWebHook().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["delete:webhooks"]);
    }
    const response = await this.request({
      path: `/api/v1/webhooks/{webhook_id}`.replace(`{${"webhook_id"}}`, encodeURIComponent(String(requestParameters["webhookId"]))),
      method: "DELETE",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => DeleteWebhookResponseFromJSON(jsonValue));
  }
  /**
   * Delete webhook 
   * Delete Webhook
   */
  async deleteWebHook(requestParameters, initOverrides) {
    const response = await this.deleteWebHookRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Returns an event 
   * Get Event
   */
  async getEventRaw(requestParameters, initOverrides) {
    if (requestParameters["eventId"] == null) {
      throw new RequiredError(
        "eventId",
        'Required parameter "eventId" was null or undefined when calling getEvent().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:events"]);
    }
    const response = await this.request({
      path: `/api/v1/events/{event_id}`.replace(`{${"event_id"}}`, encodeURIComponent(String(requestParameters["eventId"]))),
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetEventResponseFromJSON(jsonValue));
  }
  /**
   * Returns an event 
   * Get Event
   */
  async getEvent(requestParameters, initOverrides) {
    const response = await this.getEventRaw(requestParameters, initOverrides);
    return await response.value();
  }
  /**
   * Returns a list event type definitions 
   * List Event Types
   */
  async getEventTypesRaw(initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:event_types"]);
    }
    const response = await this.request({
      path: `/api/v1/event_types`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetEventTypesResponseFromJSON(jsonValue));
  }
  /**
   * Returns a list event type definitions 
   * List Event Types
   */
  async getEventTypes(initOverrides) {
    const response = await this.getEventTypesRaw(initOverrides);
    return await response.value();
  }
  /**
   * List webhooks 
   * List Webhooks
   */
  async getWebHooksRaw(initOverrides) {
    const queryParameters = {};
    const headerParameters = {};
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["read:webhooks"]);
    }
    const response = await this.request({
      path: `/api/v1/webhooks`,
      method: "GET",
      headers: headerParameters,
      query: queryParameters
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => GetWebhooksResponseFromJSON(jsonValue));
  }
  /**
   * List webhooks 
   * List Webhooks
   */
  async getWebHooks(initOverrides) {
    const response = await this.getWebHooksRaw(initOverrides);
    return await response.value();
  }
  /**
   * Update a webhook 
   * Update a Webhook
   */
  async updateWebHookRaw(requestParameters, initOverrides) {
    if (requestParameters["updateWebHookRequest"] == null) {
      throw new RequiredError(
        "updateWebHookRequest",
        'Required parameter "updateWebHookRequest" was null or undefined when calling updateWebHook().'
      );
    }
    const queryParameters = {};
    const headerParameters = {};
    headerParameters["Content-Type"] = "application/json";
    if (this.configuration && this.configuration.accessToken) {
      headerParameters["Authorization"] = await this.configuration.accessToken("ManagementAPI", ["update:webhooks"]);
    }
    const response = await this.request({
      path: `/api/v1/webhooks`,
      method: "PATCH",
      headers: headerParameters,
      query: queryParameters,
      body: UpdateWebHookRequestToJSON(requestParameters["updateWebHookRequest"])
    }, initOverrides);
    return new JSONApiResponse(response, (jsonValue) => UpdateWebhookResponseFromJSON(jsonValue));
  }
  /**
   * Update a webhook 
   * Update a Webhook
   */
  async updateWebHook(requestParameters, initOverrides) {
    const response = await this.updateWebHookRaw(requestParameters, initOverrides);
    return await response.value();
  }
};
export {
  APIsApi,
  AddAPIsRequestFromJSON,
  AddAPIsRequestFromJSONTyped,
  AddAPIsRequestToJSON,
  AddOrganizationUsersRequestFromJSON,
  AddOrganizationUsersRequestFromJSONTyped,
  AddOrganizationUsersRequestToJSON,
  AddOrganizationUsersRequestUsersInnerFromJSON,
  AddOrganizationUsersRequestUsersInnerFromJSONTyped,
  AddOrganizationUsersRequestUsersInnerToJSON,
  AddOrganizationUsersResponseFromJSON,
  AddOrganizationUsersResponseFromJSONTyped,
  AddOrganizationUsersResponseToJSON,
  ApiResultFromJSON,
  ApiResultFromJSONTyped,
  ApiResultToJSON,
  ApplicationsApi,
  ApplicationsFromJSON,
  ApplicationsFromJSONTyped,
  ApplicationsToJSON,
  AuthorizeAppApiResponseFromJSON,
  AuthorizeAppApiResponseFromJSONTyped,
  AuthorizeAppApiResponseToJSON,
  BASE_PATH,
  BaseAPI,
  BlobApiResponse,
  BusinessApi,
  COLLECTION_FORMATS,
  CallbacksApi,
  CategoryFromJSON,
  CategoryFromJSONTyped,
  CategoryToJSON,
  Configuration,
  ConnectedAppsAccessTokenFromJSON,
  ConnectedAppsAccessTokenFromJSONTyped,
  ConnectedAppsAccessTokenToJSON,
  ConnectedAppsApi,
  ConnectedAppsAuthUrlFromJSON,
  ConnectedAppsAuthUrlFromJSONTyped,
  ConnectedAppsAuthUrlToJSON,
  ConnectionFromJSON,
  ConnectionFromJSONTyped,
  ConnectionToJSON,
  ConnectionsApi,
  CreateApisResponseApiFromJSON,
  CreateApisResponseApiFromJSONTyped,
  CreateApisResponseApiToJSON,
  CreateApisResponseFromJSON,
  CreateApisResponseFromJSONTyped,
  CreateApisResponseToJSON,
  CreateApplicationRequestFromJSON,
  CreateApplicationRequestFromJSONTyped,
  CreateApplicationRequestToJSON,
  CreateApplicationRequestTypeEnum,
  CreateApplicationResponseApplicationFromJSON,
  CreateApplicationResponseApplicationFromJSONTyped,
  CreateApplicationResponseApplicationToJSON,
  CreateApplicationResponseFromJSON,
  CreateApplicationResponseFromJSONTyped,
  CreateApplicationResponseToJSON,
  CreateCategoryRequestContextEnum,
  CreateCategoryRequestFromJSON,
  CreateCategoryRequestFromJSONTyped,
  CreateCategoryRequestToJSON,
  CreateCategoryResponseCategoryFromJSON,
  CreateCategoryResponseCategoryFromJSONTyped,
  CreateCategoryResponseCategoryToJSON,
  CreateCategoryResponseFromJSON,
  CreateCategoryResponseFromJSONTyped,
  CreateCategoryResponseToJSON,
  CreateConnectionRequestFromJSON,
  CreateConnectionRequestFromJSONTyped,
  CreateConnectionRequestStrategyEnum,
  CreateConnectionRequestToJSON,
  CreateConnectionResponseConnectionFromJSON,
  CreateConnectionResponseConnectionFromJSONTyped,
  CreateConnectionResponseConnectionToJSON,
  CreateConnectionResponseFromJSON,
  CreateConnectionResponseFromJSONTyped,
  CreateConnectionResponseToJSON,
  CreateFeatureFlagRequestAllowOverrideLevelEnum,
  CreateFeatureFlagRequestFromJSON,
  CreateFeatureFlagRequestFromJSONTyped,
  CreateFeatureFlagRequestToJSON,
  CreateFeatureFlagRequestTypeEnum,
  CreateIdentityResponseFromJSON,
  CreateIdentityResponseFromJSONTyped,
  CreateIdentityResponseIdentityFromJSON,
  CreateIdentityResponseIdentityFromJSONTyped,
  CreateIdentityResponseIdentityToJSON,
  CreateIdentityResponseToJSON,
  CreateOrganizationRequestFeatureFlagsEnum,
  CreateOrganizationRequestFromJSON,
  CreateOrganizationRequestFromJSONTyped,
  CreateOrganizationRequestToJSON,
  CreateOrganizationResponseFromJSON,
  CreateOrganizationResponseFromJSONTyped,
  CreateOrganizationResponseOrganizationFromJSON,
  CreateOrganizationResponseOrganizationFromJSONTyped,
  CreateOrganizationResponseOrganizationToJSON,
  CreateOrganizationResponseToJSON,
  CreateOrganizationUserPermissionRequestFromJSON,
  CreateOrganizationUserPermissionRequestFromJSONTyped,
  CreateOrganizationUserPermissionRequestToJSON,
  CreateOrganizationUserRoleRequestFromJSON,
  CreateOrganizationUserRoleRequestFromJSONTyped,
  CreateOrganizationUserRoleRequestToJSON,
  CreatePermissionRequestFromJSON,
  CreatePermissionRequestFromJSONTyped,
  CreatePermissionRequestToJSON,
  CreatePropertyRequestContextEnum,
  CreatePropertyRequestFromJSON,
  CreatePropertyRequestFromJSONTyped,
  CreatePropertyRequestToJSON,
  CreatePropertyRequestTypeEnum,
  CreatePropertyResponseFromJSON,
  CreatePropertyResponseFromJSONTyped,
  CreatePropertyResponsePropertyFromJSON,
  CreatePropertyResponsePropertyFromJSONTyped,
  CreatePropertyResponsePropertyToJSON,
  CreatePropertyResponseToJSON,
  CreateRoleRequestFromJSON,
  CreateRoleRequestFromJSONTyped,
  CreateRoleRequestToJSON,
  CreateSubscriberSuccessResponseFromJSON,
  CreateSubscriberSuccessResponseFromJSONTyped,
  CreateSubscriberSuccessResponseSubscriberFromJSON,
  CreateSubscriberSuccessResponseSubscriberFromJSONTyped,
  CreateSubscriberSuccessResponseSubscriberToJSON,
  CreateSubscriberSuccessResponseToJSON,
  CreateUserIdentityRequestFromJSON,
  CreateUserIdentityRequestFromJSONTyped,
  CreateUserIdentityRequestToJSON,
  CreateUserIdentityRequestTypeEnum,
  CreateUserRequestFromJSON,
  CreateUserRequestFromJSONTyped,
  CreateUserRequestIdentitiesInnerDetailsFromJSON,
  CreateUserRequestIdentitiesInnerDetailsFromJSONTyped,
  CreateUserRequestIdentitiesInnerDetailsToJSON,
  CreateUserRequestIdentitiesInnerFromJSON,
  CreateUserRequestIdentitiesInnerFromJSONTyped,
  CreateUserRequestIdentitiesInnerToJSON,
  CreateUserRequestIdentitiesInnerTypeEnum,
  CreateUserRequestProfileFromJSON,
  CreateUserRequestProfileFromJSONTyped,
  CreateUserRequestProfileToJSON,
  CreateUserRequestToJSON,
  CreateUserResponseFromJSON,
  CreateUserResponseFromJSONTyped,
  CreateUserResponseToJSON,
  CreateWebHookRequestFromJSON,
  CreateWebHookRequestFromJSONTyped,
  CreateWebHookRequestToJSON,
  CreateWebhookResponseFromJSON,
  CreateWebhookResponseFromJSONTyped,
  CreateWebhookResponseToJSON,
  CreateWebhookResponseWebhookFromJSON,
  CreateWebhookResponseWebhookFromJSONTyped,
  CreateWebhookResponseWebhookToJSON,
  DefaultConfig,
  DeleteApiResponseFromJSON,
  DeleteApiResponseFromJSONTyped,
  DeleteApiResponseToJSON,
  DeleteWebhookResponseFromJSON,
  DeleteWebhookResponseFromJSONTyped,
  DeleteWebhookResponseToJSON,
  EnvironmentsApi,
  ErrorResponseFromJSON,
  ErrorResponseFromJSONTyped,
  ErrorResponseToJSON,
  EventTypeFromJSON,
  EventTypeFromJSONTyped,
  EventTypeToJSON,
  FeatureFlagsApi,
  FetchError,
  GetApiResponseApiApplicationsInnerFromJSON,
  GetApiResponseApiApplicationsInnerFromJSONTyped,
  GetApiResponseApiApplicationsInnerToJSON,
  GetApiResponseApiApplicationsInnerTypeEnum,
  GetApiResponseApiFromJSON,
  GetApiResponseApiFromJSONTyped,
  GetApiResponseApiToJSON,
  GetApiResponseFromJSON,
  GetApiResponseFromJSONTyped,
  GetApiResponseToJSON,
  GetApisResponseApisInnerFromJSON,
  GetApisResponseApisInnerFromJSONTyped,
  GetApisResponseApisInnerToJSON,
  GetApisResponseFromJSON,
  GetApisResponseFromJSONTyped,
  GetApisResponseToJSON,
  GetApplicationResponseApplicationFromJSON,
  GetApplicationResponseApplicationFromJSONTyped,
  GetApplicationResponseApplicationToJSON,
  GetApplicationResponseFromJSON,
  GetApplicationResponseFromJSONTyped,
  GetApplicationResponseToJSON,
  GetApplicationsResponseFromJSON,
  GetApplicationsResponseFromJSONTyped,
  GetApplicationsResponseToJSON,
  GetApplicationsSortEnum,
  GetCategoriesContextEnum,
  GetCategoriesResponseFromJSON,
  GetCategoriesResponseFromJSONTyped,
  GetCategoriesResponseToJSON,
  GetConnectionsResponseFromJSON,
  GetConnectionsResponseFromJSONTyped,
  GetConnectionsResponseToJSON,
  GetEnvironmentFeatureFlagsResponseFromJSON,
  GetEnvironmentFeatureFlagsResponseFromJSONTyped,
  GetEnvironmentFeatureFlagsResponseToJSON,
  GetEventResponseEventFromJSON,
  GetEventResponseEventFromJSONTyped,
  GetEventResponseEventToJSON,
  GetEventResponseFromJSON,
  GetEventResponseFromJSONTyped,
  GetEventResponseToJSON,
  GetEventTypesResponseFromJSON,
  GetEventTypesResponseFromJSONTyped,
  GetEventTypesResponseToJSON,
  GetIdentitiesResponseFromJSON,
  GetIdentitiesResponseFromJSONTyped,
  GetIdentitiesResponseToJSON,
  GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSON,
  GetOrganizationFeatureFlagsResponseFeatureFlagsValueFromJSONTyped,
  GetOrganizationFeatureFlagsResponseFeatureFlagsValueToJSON,
  GetOrganizationFeatureFlagsResponseFeatureFlagsValueTypeEnum,
  GetOrganizationFeatureFlagsResponseFromJSON,
  GetOrganizationFeatureFlagsResponseFromJSONTyped,
  GetOrganizationFeatureFlagsResponseToJSON,
  GetOrganizationUsersResponseFromJSON,
  GetOrganizationUsersResponseFromJSONTyped,
  GetOrganizationUsersResponseToJSON,
  GetOrganizationUsersSortEnum,
  GetOrganizationsResponseFromJSON,
  GetOrganizationsResponseFromJSONTyped,
  GetOrganizationsResponseToJSON,
  GetOrganizationsSortEnum,
  GetOrganizationsUserPermissionsResponseFromJSON,
  GetOrganizationsUserPermissionsResponseFromJSONTyped,
  GetOrganizationsUserPermissionsResponseToJSON,
  GetOrganizationsUserRolesResponseFromJSON,
  GetOrganizationsUserRolesResponseFromJSONTyped,
  GetOrganizationsUserRolesResponseToJSON,
  GetPermissionsResponseFromJSON,
  GetPermissionsResponseFromJSONTyped,
  GetPermissionsResponseToJSON,
  GetPermissionsSortEnum,
  GetPropertiesContextEnum,
  GetPropertiesResponseFromJSON,
  GetPropertiesResponseFromJSONTyped,
  GetPropertiesResponseToJSON,
  GetPropertyValuesResponseFromJSON,
  GetPropertyValuesResponseFromJSONTyped,
  GetPropertyValuesResponseToJSON,
  GetRedirectCallbackUrlsResponseFromJSON,
  GetRedirectCallbackUrlsResponseFromJSONTyped,
  GetRedirectCallbackUrlsResponseToJSON,
  GetRolePermissionSortEnum,
  GetRolesResponseFromJSON,
  GetRolesResponseFromJSONTyped,
  GetRolesResponseToJSON,
  GetRolesSortEnum,
  GetSubscriberResponseFromJSON,
  GetSubscriberResponseFromJSONTyped,
  GetSubscriberResponseToJSON,
  GetSubscribersResponseFromJSON,
  GetSubscribersResponseFromJSONTyped,
  GetSubscribersResponseToJSON,
  GetSubscribersSortEnum,
  GetWebhooksResponseFromJSON,
  GetWebhooksResponseFromJSONTyped,
  GetWebhooksResponseToJSON,
  IdentitiesApi,
  IdentityFromJSON,
  IdentityFromJSONTyped,
  IdentityToJSON,
  IndustriesApi,
  JSONApiResponse,
  LogoutRedirectUrlsFromJSON,
  LogoutRedirectUrlsFromJSONTyped,
  LogoutRedirectUrlsToJSON,
  ModelErrorFromJSON,
  ModelErrorFromJSONTyped,
  ModelErrorToJSON,
  OAuthApi,
  OrganizationFromJSON,
  OrganizationFromJSONTyped,
  OrganizationToJSON,
  OrganizationUserFromJSON,
  OrganizationUserFromJSONTyped,
  OrganizationUserPermissionFromJSON,
  OrganizationUserPermissionFromJSONTyped,
  OrganizationUserPermissionRolesInnerFromJSON,
  OrganizationUserPermissionRolesInnerFromJSONTyped,
  OrganizationUserPermissionRolesInnerToJSON,
  OrganizationUserPermissionToJSON,
  OrganizationUserRoleFromJSON,
  OrganizationUserRoleFromJSONTyped,
  OrganizationUserRolePermissionsFromJSON,
  OrganizationUserRolePermissionsFromJSONTyped,
  OrganizationUserRolePermissionsPermissionsFromJSON,
  OrganizationUserRolePermissionsPermissionsFromJSONTyped,
  OrganizationUserRolePermissionsPermissionsToJSON,
  OrganizationUserRolePermissionsToJSON,
  OrganizationUserRoleToJSON,
  OrganizationUserToJSON,
  OrganizationsApi,
  PermissionsApi,
  PermissionsFromJSON,
  PermissionsFromJSONTyped,
  PermissionsToJSON,
  PropertiesApi,
  PropertyCategoriesApi,
  PropertyFromJSON,
  PropertyFromJSONTyped,
  PropertyToJSON,
  PropertyValueFromJSON,
  PropertyValueFromJSONTyped,
  PropertyValueToJSON,
  RedirectCallbackUrlsFromJSON,
  RedirectCallbackUrlsFromJSONTyped,
  RedirectCallbackUrlsToJSON,
  ReplaceLogoutRedirectURLsRequestFromJSON,
  ReplaceLogoutRedirectURLsRequestFromJSONTyped,
  ReplaceLogoutRedirectURLsRequestToJSON,
  ReplaceRedirectCallbackURLsRequestFromJSON,
  ReplaceRedirectCallbackURLsRequestFromJSONTyped,
  ReplaceRedirectCallbackURLsRequestToJSON,
  RequiredError,
  ResponseError,
  RoleFromJSON,
  RoleFromJSONTyped,
  RoleToJSON,
  RolesApi,
  RolesFromJSON,
  RolesFromJSONTyped,
  RolesPermissionResponseInnerFromJSON,
  RolesPermissionResponseInnerFromJSONTyped,
  RolesPermissionResponseInnerToJSON,
  RolesToJSON,
  SetUserPasswordRequestFromJSON,
  SetUserPasswordRequestFromJSONTyped,
  SetUserPasswordRequestHashingMethodEnum,
  SetUserPasswordRequestSaltPositionEnum,
  SetUserPasswordRequestToJSON,
  SubscriberFromJSON,
  SubscriberFromJSONTyped,
  SubscriberToJSON,
  SubscribersApi,
  SubscribersSubscriberFromJSON,
  SubscribersSubscriberFromJSONTyped,
  SubscribersSubscriberToJSON,
  SuccessResponseFromJSON,
  SuccessResponseFromJSONTyped,
  SuccessResponseToJSON,
  TextApiResponse,
  TimezonesApi,
  TokenErrorResponseFromJSON,
  TokenErrorResponseFromJSONTyped,
  TokenErrorResponseToJSON,
  TokenIntrospectFromJSON,
  TokenIntrospectFromJSONTyped,
  TokenIntrospectToJSON,
  UpdateAPIApplicationsRequestApplicationsInnerFromJSON,
  UpdateAPIApplicationsRequestApplicationsInnerFromJSONTyped,
  UpdateAPIApplicationsRequestApplicationsInnerToJSON,
  UpdateAPIApplicationsRequestFromJSON,
  UpdateAPIApplicationsRequestFromJSONTyped,
  UpdateAPIApplicationsRequestToJSON,
  UpdateApplicationRequestFromJSON,
  UpdateApplicationRequestFromJSONTyped,
  UpdateApplicationRequestToJSON,
  UpdateCategoryRequestFromJSON,
  UpdateCategoryRequestFromJSONTyped,
  UpdateCategoryRequestToJSON,
  UpdateConnectionRequestFromJSON,
  UpdateConnectionRequestFromJSONTyped,
  UpdateConnectionRequestToJSON,
  UpdateEnvironementFeatureFlagOverrideRequestFromJSON,
  UpdateEnvironementFeatureFlagOverrideRequestFromJSONTyped,
  UpdateEnvironementFeatureFlagOverrideRequestToJSON,
  UpdateFeatureFlagAllowOverrideLevelEnum,
  UpdateFeatureFlagTypeEnum,
  UpdateIdentityRequestFromJSON,
  UpdateIdentityRequestFromJSONTyped,
  UpdateIdentityRequestToJSON,
  UpdateOrganizationPropertiesRequestFromJSON,
  UpdateOrganizationPropertiesRequestFromJSONTyped,
  UpdateOrganizationPropertiesRequestToJSON,
  UpdateOrganizationRequestFromJSON,
  UpdateOrganizationRequestFromJSONTyped,
  UpdateOrganizationRequestToJSON,
  UpdateOrganizationUsersRequestFromJSON,
  UpdateOrganizationUsersRequestFromJSONTyped,
  UpdateOrganizationUsersRequestToJSON,
  UpdateOrganizationUsersRequestUsersInnerFromJSON,
  UpdateOrganizationUsersRequestUsersInnerFromJSONTyped,
  UpdateOrganizationUsersRequestUsersInnerToJSON,
  UpdateOrganizationUsersResponseFromJSON,
  UpdateOrganizationUsersResponseFromJSONTyped,
  UpdateOrganizationUsersResponseToJSON,
  UpdatePropertyRequestFromJSON,
  UpdatePropertyRequestFromJSONTyped,
  UpdatePropertyRequestToJSON,
  UpdateRolePermissionsRequestFromJSON,
  UpdateRolePermissionsRequestFromJSONTyped,
  UpdateRolePermissionsRequestPermissionsInnerFromJSON,
  UpdateRolePermissionsRequestPermissionsInnerFromJSONTyped,
  UpdateRolePermissionsRequestPermissionsInnerToJSON,
  UpdateRolePermissionsRequestToJSON,
  UpdateRolePermissionsResponseFromJSON,
  UpdateRolePermissionsResponseFromJSONTyped,
  UpdateRolePermissionsResponseToJSON,
  UpdateRolesRequestFromJSON,
  UpdateRolesRequestFromJSONTyped,
  UpdateRolesRequestToJSON,
  UpdateUserRequestFromJSON,
  UpdateUserRequestFromJSONTyped,
  UpdateUserRequestToJSON,
  UpdateUserResponseFromJSON,
  UpdateUserResponseFromJSONTyped,
  UpdateUserResponseToJSON,
  UpdateWebHookRequestFromJSON,
  UpdateWebHookRequestFromJSONTyped,
  UpdateWebHookRequestToJSON,
  UpdateWebhookResponseFromJSON,
  UpdateWebhookResponseFromJSONTyped,
  UpdateWebhookResponseToJSON,
  UpdateWebhookResponseWebhookFromJSON,
  UpdateWebhookResponseWebhookFromJSONTyped,
  UpdateWebhookResponseWebhookToJSON,
  UserFromJSON,
  UserFromJSONTyped,
  UserIdentitiesInnerFromJSON,
  UserIdentitiesInnerFromJSONTyped,
  UserIdentitiesInnerToJSON,
  UserIdentityFromJSON,
  UserIdentityFromJSONTyped,
  UserIdentityResultFromJSON,
  UserIdentityResultFromJSONTyped,
  UserIdentityResultToJSON,
  UserIdentityToJSON,
  UserProfileFromJSON,
  UserProfileFromJSONTyped,
  UserProfileToJSON,
  UserProfileV2FromJSON,
  UserProfileV2FromJSONTyped,
  UserProfileV2ToJSON,
  UserToJSON,
  UsersApi,
  UsersResponseFromJSON,
  UsersResponseFromJSONTyped,
  UsersResponseToJSON,
  UsersResponseUsersInnerFromJSON,
  UsersResponseUsersInnerFromJSONTyped,
  UsersResponseUsersInnerToJSON,
  VoidApiResponse,
  WebhookFromJSON,
  WebhookFromJSONTyped,
  WebhookToJSON,
  WebhooksApi,
  canConsumeForm,
  instanceOfAddAPIsRequest,
  instanceOfAddOrganizationUsersRequest,
  instanceOfAddOrganizationUsersRequestUsersInner,
  instanceOfAddOrganizationUsersResponse,
  instanceOfApiResult,
  instanceOfApplications,
  instanceOfAuthorizeAppApiResponse,
  instanceOfCategory,
  instanceOfConnectedAppsAccessToken,
  instanceOfConnectedAppsAuthUrl,
  instanceOfConnection,
  instanceOfCreateApisResponse,
  instanceOfCreateApisResponseApi,
  instanceOfCreateApplicationRequest,
  instanceOfCreateApplicationResponse,
  instanceOfCreateApplicationResponseApplication,
  instanceOfCreateCategoryRequest,
  instanceOfCreateCategoryResponse,
  instanceOfCreateCategoryResponseCategory,
  instanceOfCreateConnectionRequest,
  instanceOfCreateConnectionResponse,
  instanceOfCreateConnectionResponseConnection,
  instanceOfCreateFeatureFlagRequest,
  instanceOfCreateIdentityResponse,
  instanceOfCreateIdentityResponseIdentity,
  instanceOfCreateOrganizationRequest,
  instanceOfCreateOrganizationResponse,
  instanceOfCreateOrganizationResponseOrganization,
  instanceOfCreateOrganizationUserPermissionRequest,
  instanceOfCreateOrganizationUserRoleRequest,
  instanceOfCreatePermissionRequest,
  instanceOfCreatePropertyRequest,
  instanceOfCreatePropertyResponse,
  instanceOfCreatePropertyResponseProperty,
  instanceOfCreateRoleRequest,
  instanceOfCreateSubscriberSuccessResponse,
  instanceOfCreateSubscriberSuccessResponseSubscriber,
  instanceOfCreateUserIdentityRequest,
  instanceOfCreateUserRequest,
  instanceOfCreateUserRequestIdentitiesInner,
  instanceOfCreateUserRequestIdentitiesInnerDetails,
  instanceOfCreateUserRequestProfile,
  instanceOfCreateUserResponse,
  instanceOfCreateWebHookRequest,
  instanceOfCreateWebhookResponse,
  instanceOfCreateWebhookResponseWebhook,
  instanceOfDeleteApiResponse,
  instanceOfDeleteWebhookResponse,
  instanceOfErrorResponse,
  instanceOfEventType,
  instanceOfGetApiResponse,
  instanceOfGetApiResponseApi,
  instanceOfGetApiResponseApiApplicationsInner,
  instanceOfGetApisResponse,
  instanceOfGetApisResponseApisInner,
  instanceOfGetApplicationResponse,
  instanceOfGetApplicationResponseApplication,
  instanceOfGetApplicationsResponse,
  instanceOfGetCategoriesResponse,
  instanceOfGetConnectionsResponse,
  instanceOfGetEnvironmentFeatureFlagsResponse,
  instanceOfGetEventResponse,
  instanceOfGetEventResponseEvent,
  instanceOfGetEventTypesResponse,
  instanceOfGetIdentitiesResponse,
  instanceOfGetOrganizationFeatureFlagsResponse,
  instanceOfGetOrganizationFeatureFlagsResponseFeatureFlagsValue,
  instanceOfGetOrganizationUsersResponse,
  instanceOfGetOrganizationsResponse,
  instanceOfGetOrganizationsUserPermissionsResponse,
  instanceOfGetOrganizationsUserRolesResponse,
  instanceOfGetPermissionsResponse,
  instanceOfGetPropertiesResponse,
  instanceOfGetPropertyValuesResponse,
  instanceOfGetRedirectCallbackUrlsResponse,
  instanceOfGetRolesResponse,
  instanceOfGetSubscriberResponse,
  instanceOfGetSubscribersResponse,
  instanceOfGetWebhooksResponse,
  instanceOfIdentity,
  instanceOfLogoutRedirectUrls,
  instanceOfModelError,
  instanceOfOrganization,
  instanceOfOrganizationUser,
  instanceOfOrganizationUserPermission,
  instanceOfOrganizationUserPermissionRolesInner,
  instanceOfOrganizationUserRole,
  instanceOfOrganizationUserRolePermissions,
  instanceOfOrganizationUserRolePermissionsPermissions,
  instanceOfPermissions,
  instanceOfProperty,
  instanceOfPropertyValue,
  instanceOfRedirectCallbackUrls,
  instanceOfReplaceLogoutRedirectURLsRequest,
  instanceOfReplaceRedirectCallbackURLsRequest,
  instanceOfRole,
  instanceOfRoles,
  instanceOfRolesPermissionResponseInner,
  instanceOfSetUserPasswordRequest,
  instanceOfSubscriber,
  instanceOfSubscribersSubscriber,
  instanceOfSuccessResponse,
  instanceOfTokenErrorResponse,
  instanceOfTokenIntrospect,
  instanceOfUpdateAPIApplicationsRequest,
  instanceOfUpdateAPIApplicationsRequestApplicationsInner,
  instanceOfUpdateApplicationRequest,
  instanceOfUpdateCategoryRequest,
  instanceOfUpdateConnectionRequest,
  instanceOfUpdateEnvironementFeatureFlagOverrideRequest,
  instanceOfUpdateIdentityRequest,
  instanceOfUpdateOrganizationPropertiesRequest,
  instanceOfUpdateOrganizationRequest,
  instanceOfUpdateOrganizationUsersRequest,
  instanceOfUpdateOrganizationUsersRequestUsersInner,
  instanceOfUpdateOrganizationUsersResponse,
  instanceOfUpdatePropertyRequest,
  instanceOfUpdateRolePermissionsRequest,
  instanceOfUpdateRolePermissionsRequestPermissionsInner,
  instanceOfUpdateRolePermissionsResponse,
  instanceOfUpdateRolesRequest,
  instanceOfUpdateUserRequest,
  instanceOfUpdateUserResponse,
  instanceOfUpdateWebHookRequest,
  instanceOfUpdateWebhookResponse,
  instanceOfUpdateWebhookResponseWebhook,
  instanceOfUser,
  instanceOfUserIdentitiesInner,
  instanceOfUserIdentity,
  instanceOfUserIdentityResult,
  instanceOfUserProfile,
  instanceOfUserProfileV2,
  instanceOfUsersResponse,
  instanceOfUsersResponseUsersInner,
  instanceOfWebhook,
  mapValues,
  querystring
};
//# sourceMappingURL=index.mjs.map