/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeEvent } from "@itwin/core-bentley";
import { EmphasizeElements, IModelApp } from "@itwin/core-frontend";
import { jsonData } from "./IModelQualityJsonData";

export default class IModelQualityApi {

  public static onIModelQualityDataChanged = new BeEvent<any>();

  private static _imodelQualityData: { [id: string]: any } = {};
  
  public static async getAndsetIModelQualityData(projectId: string): Promise<void> {
    const imodelQualityData = await IModelQualityApi.getIModelQualityData(projectId);
    IModelQualityApi.onIModelQualityDataChanged.raiseEvent(imodelQualityData);
  }

  public static async getIModelQualityData(projectId: string): Promise<any> {

    if (IModelQualityApi._imodelQualityData[projectId] === undefined) {
      IModelQualityApi._imodelQualityData[projectId] = jsonData;
    }

    return IModelQualityApi._imodelQualityData[projectId];
  }

  public static resetDisplay() {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const provider = EmphasizeElements.getOrCreate(vp);
    provider.clearEmphasizedElements(vp);
    provider.clearOverriddenElements(vp);
  }
}
