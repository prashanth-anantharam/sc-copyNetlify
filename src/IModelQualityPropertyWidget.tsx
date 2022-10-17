/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useCallback, useEffect, useMemo } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table } from "@itwin/itwinui-react";
import IModelQualityApi from "./IModelQualityApi";
import { jsonData } from "./IModelQualityJsonData";

const IModelQualityPropertyWidget = () => {
  const iModelConnection = useActiveIModelConnection();
  const [imodelQualityData, setIModelQualityData] = React.useState<any>();

  useEffect(() => {
    const removeListener = IModelQualityApi.onIModelQualityDataChanged.addListener((value: any) => {
      setIModelQualityData(value);
    });

    if (iModelConnection) {
      IModelQualityApi.getAndsetIModelQualityData(iModelConnection.iTwinId!)
        .catch((error) => {
          console.error(error);
        });
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  const columnDefinition = useMemo(() => [
    {
      Header: "Table",
      columns: [
        {
          id: "propertyNames",
          Header: "Property Name",
          accessor: "propertyNames",
        }
      ],
    }
  ], []);

  const data = useMemo(() => {
    const rows: any[] = [];

    if (!imodelQualityData || !imodelQualityData.propertyAttributes) {
      return rows;
    }

    for (const rowData of imodelQualityData.propertyAttributes.propertyNames) {
      const row: Record<string, any> = {};

      columnDefinition[0].columns.forEach((column) => {
        let cellValue: string = rowData? rowData.toString(): "";
        row[column.id] = cellValue;
      });

      rows.push(row);
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imodelQualityData]);

  const onRowClick = useCallback((_, row) => {
    // IModelQualityApi.visualizeClash(row.original.elementAId, row.original.elementBId);
  }, []);

  return (
    <Table
      data={data}
      columns={columnDefinition}
      isLoading={!imodelQualityData}
      onRowClick={onRowClick}
      emptyTableContent={"No data"}
      density="extra-condensed"
      style={{ height: "100%", width: "auto" }} />
  );
};

export class IModelQualityPropertyWidgetProvider implements UiItemsProvider {
  public readonly id: string = "IModelQualityPropertyWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "IModelQualityPropertyWidget",
          label: `Properties (${jsonData.propertyAttributes.propertyNames.length})`,
          defaultState: WidgetState.Open,
          getWidgetContent: () => <IModelQualityPropertyWidget />,
        }
      );
    }
    return widgets;
  }
}
