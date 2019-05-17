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

  private static _fromKeyword = "string-to-find";
  private static _toKeyword = "string-to-replace";

  public async sanitizeIModel(iModelToken: IModelToken, accessToken: AccessToken, pushChanges: boolean): Promise<string> {

    const iModelDb = IModelDb.find(iModelToken);
    const actx = new AuthorizedClientRequestContext(accessToken);

    fs.writeFileSync("assets/ledger.txt", "-------------LEDGER-------------\n\n");

    fs.readFile("assets/swizzle.txt", "utf8", (_err, data) => {
      parse(data, {delimiter: ",", columns: ["class", "property"]}, async (_Err: any, output: any) => {
        for (const property of output) {
          const propertyName = this.lowerFirstChar(property.property);
          (property.class as string).includes("Aspect") ? await this.sanitizeElementAspect(iModelDb, property.class, propertyName)
            : await this.sanitizeElement(iModelDb, property.class, propertyName);
        }
        if (pushChanges) {
          await iModelDb.pushChanges(actx, () => "ECSql changes");
          fs.appendFileSync("assets/ledger.txt", "-------------PUSHED-------------\n\n");
        }
      });
    });
    return "success";
  }

  private async sanitizeElement(iModelDb: IModelDb, className: string, propertyName: string) {

    fs.appendFileSync("assets/ledger.txt", "\n\nPROPERTY: " + className + ": " + propertyName + "\n");

    const query = `SELECT ECInstanceId as id FROM ${className} WHERE ${propertyName} LIKE '%${IModelUpdateRpcImpl._fromKeyword}%'`;
    let elementIds: any = await this.wrapQuery(iModelDb, query);
    do {
        elementIds = await this.wrapQuery(iModelDb, query);
        elementIds.forEach( (element: any) => {
          const elementData = iModelDb.elements.getElement(element.id);
          let value: string = elementData[`${propertyName}`]!;
          fs.appendFileSync("assets/ledger.txt", "\n InstanceId: " + elementData.id + " | value before: " + value);
          value = value.replace(new RegExp(IModelUpdateRpcImpl._fromKeyword, "gi"), IModelUpdateRpcImpl._toKeyword);
          elementData[`${propertyName}`] = value;
          elementData.update();
          fs.appendFileSync("assets/ledger.txt", " | value after: " + value);
        });
        await iModelDb.saveChanges();
    } while (elementIds.length > 0);

    await iModelDb.saveChanges();
  }

  private async sanitizeElementAspect(iModelDb: IModelDb, className: string, propertyName: string): Promise<string> {

    fs.appendFileSync("assets/ledger.txt", "\n\nPROPERTY: " + className + ": " + propertyName + "\n");

    const query = `SELECT Element.Id as id FROM ${className} WHERE ${propertyName} LIKE '%${IModelUpdateRpcImpl._fromKeyword}%'`;
    let elementIds: any = await this.wrapQuery(iModelDb, query);

    do {
      elementIds = await this.wrapQuery(iModelDb, query);
      elementIds.forEach( (element: any) => {
        const elementAspect = iModelDb.elements.getAspects(element.id, className);
        const aspectProps = elementAspect.values().next().value;
        let value: string = aspectProps[`${propertyName}`]!;
        fs.appendFileSync("assets/ledger.txt", "\n InstanceId: " + aspectProps.id + " | value before: " + value);
        value = value.replace(new RegExp(IModelUpdateRpcImpl._fromKeyword, "gi"), IModelUpdateRpcImpl._toKeyword);
        aspectProps[`${propertyName}`] = value;
        iModelDb.elements.updateAspect(aspectProps);
        fs.appendFileSync("assets/ledger.txt", " | value after: " + value);
      });
    } while (elementIds.length > 0);

    await iModelDb.saveChanges();

    return "";
  }

  private lowerFirstChar(name: string): string { return name[0].toLowerCase() + name.substring(1); }

  private async wrapQuery(imodel: IModelDb, query: string) {
    return new Promise((resolve, reject) => {
      imodel.queryPage(query)
        .then((value) => resolve(value))
        .catch((error: any) => reject(error));
    });
  }
}
