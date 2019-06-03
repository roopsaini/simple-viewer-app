/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2017 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/
import { RpcInterface, RpcManager, IModelToken } from "@bentley/imodeljs-common";
import { AccessToken } from "@bentley/imodeljs-clients";

export abstract class IModelUpdateRpcInterface extends RpcInterface {

  public static version = "1.0.0";
  public static types = () => [IModelToken, AccessToken];

  public static getClient(): IModelUpdateRpcInterface { return RpcManager.getClientForInterface(this); }
  // pass _pushChanges as true for commiting changes to iModelHub.
  public async updateDepthData (_iModelToken: IModelToken, _accessToken: AccessToken, _pushChanges: boolean): Promise<string> { return this.forward.apply(this, arguments as any) as any; }
}
