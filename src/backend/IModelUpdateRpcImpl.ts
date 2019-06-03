import { RpcManager } from "@bentley/imodeljs-common";
import { IModelToken } from "@bentley/imodeljs-common/lib/IModel";
import { AccessToken, AuthorizedClientRequestContext } from "@bentley/imodeljs-clients";
import { IModelUpdateRpcInterface } from "../common/IModelUpdateRpcInterface";
import { IModelDb } from "@bentley/imodeljs-backend";
import * as fs from "fs";
import * as parse from "csv-parse";

// tslint:disable:no-string-literal

export class IModelUpdateRpcImpl extends IModelUpdateRpcInterface {
  public static register() { RpcManager.registerImpl(IModelUpdateRpcInterface, IModelUpdateRpcImpl); }

  public async updateDepthData(iModelToken: IModelToken, accessToken: AccessToken, pushChanges: boolean): Promise<string> {

    const iModelDb = IModelDb.find(iModelToken);
    const actx = new AuthorizedClientRequestContext(accessToken);

    fs.writeFileSync("assets/ledger.txt", "-------------LEDGER-------------\n\n");

    // extract an array of dictionaries from CSV file with columns "className", "bentleyId" and "jsonProperties"
    fs.readFile("assets/data.txt", "utf8", (_err, data) => {
      parse(data, {delimiter: ",", columns: ["className", "bentleyId", "jsonProperties"]}, async (_Err: any, output: any) => {
        for (const property of output) {
          this.updateJsonProperties(iModelDb, property.className, property.bentleyId, property.jsonProperties);
        }
        // push changes from local briefcase to iModelHub
        if (pushChanges) {
          await iModelDb.pushChanges(actx, () => "jsonProperties Update");
          fs.appendFileSync("assets/ledger.txt", "-------------PUSHED-------------\n\n");
        }
      });
    });
    return "success";
  }

  private async updateJsonProperties(iModelDb: IModelDb, className: string, bentleyId: string, jsonProperties: string) {

    // get ECInstance Id of element with given Bentley_ID_
    const query = `SELECT ECInstanceId as id FROM XfmFeaturePropertyECProviderSchema.${className} WHERE Bentley_ID_ = '${bentleyId}'`;
    const element: any = await this.wrapQuery(iModelDb, query);
    if (element.length > 0) {
      // get data of element with given ECInstance Id
      const elementData = iModelDb.elements.getElement(element[0].id);
      fs.appendFileSync("assets/ledger.txt", "\n InstanceId: " + elementData.id + " | bentleyId: " + bentleyId + " | value before: " + JSON.stringify(elementData.jsonProperties));
      // update json properties
      elementData.setJsonProperty("depthData", jsonProperties);
      elementData.update();
      fs.appendFileSync("assets/ledger.txt", " | value after: " + JSON.stringify(elementData.jsonProperties));
      // saved changes to local copy of iModel (briefcase)
      await iModelDb.saveChanges();
    }
  }

  private async wrapQuery(imodel: IModelDb, query: string) {
    return new Promise((resolve, reject) => {
      imodel.queryPage(query)
        .then((value) => resolve(value))
        .catch((error: any) => reject(error));
    });
  }
}
