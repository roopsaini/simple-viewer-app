/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { RpcInterfaceDefinition, IModelReadRpcInterface, IModelTileRpcInterface, SnapshotIModelRpcInterface, IModelWriteRpcInterface } from "@bentley/imodeljs-common";
import { PresentationRpcInterface } from "@bentley/presentation-common";
import { IModelUpdateRpcInterface } from "./IModelUpdateRpcInterface";

/**
 * Returns a list of RPCs supported by this application
 */
export default function getSupportedRpcs(): RpcInterfaceDefinition[] {
  return [
    IModelReadRpcInterface,
    IModelWriteRpcInterface,
    IModelTileRpcInterface,
    IModelUpdateRpcInterface,
    PresentationRpcInterface,
    SnapshotIModelRpcInterface,
  ];
}
