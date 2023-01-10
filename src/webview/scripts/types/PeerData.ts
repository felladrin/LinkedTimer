import { RpcMethod } from "../enumerations/RpcMethod";

export type PeerData<T = null> = {
  method: RpcMethod;
  parameters: T;
};
