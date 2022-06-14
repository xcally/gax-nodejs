import * as apiCallable from '../src/apiCallable';
import * as gax from '../src/gax';
export declare function fail(argument: any, metadata: any, options: any, callback: any): void;
export declare function createApiCall(func: any, opts?: any): apiCallable.APICall;
export declare function createRetryOptions(backoffSettingsOrInitialRetryDelayMillis: number | gax.BackoffSettings, retryDelayMultiplier?: number, maxRetryDelayMillis?: number, initialRpcTimeoutMillis?: number, rpcTimeoutMultiplier?: number, maxRpcTimeoutMillis?: number, totalTimeoutMillis?: number): gax.RetryOptions;
