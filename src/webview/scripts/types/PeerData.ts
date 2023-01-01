import { RpcMethod } from "../enumerations/RpcMethod";

export type PeerData<T = void> = {
  method: RpcMethod;
  parameters: T;
};
