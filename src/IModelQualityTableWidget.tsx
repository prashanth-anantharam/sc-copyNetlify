/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useMemo } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Table } from "@itwin/itwinui-react";
import IModelQualityApi from "./IModelQualityApi";

const IModelQualityTableWidget = () => {
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
      Header: "IModel Metadata",
      columns: [
        {
          id: "schemaCount",
          Header: "Schema Count",
          accessor: "schemaCount",
        },
        {
          id: "classCount",
          Header: "Class Count",
          accessor: "classCount",
        },
        {
          id: "propertyCount",
          Header: "Property Count",
          accessor: "propertyCount",
        },
        {
          id: "connectorCount",
          Header: "Connector Count",
          accessor: "connectorCount",
        },
        {
          id: "facilityCount",
          Header: "Facility Count",
          accessor: "facilityCount",
        }
      ],
    },
    {   
    Header: "Class Info",
      columns: [
        {
          id: "modelCount",
          Header: "Model Count",
          accessor: "modelCount",
        }
      ]
    }
  ], []);

  const data = useMemo(() => {
    const rows: any[] = [];

    if (!imodelQualityData || !imodelQualityData.iModelMetadata || !imodelQualityData.classInfo) {
      return rows;
    }

    const row: Record<string, any> = {};

    columnDefinition[0].columns.forEach((column) => {
      let cellValue: string = "";
      cellValue = imodelQualityData.iModelMetadata[column.id]?imodelQualityData.iModelMetadata[column.id].toString(): "";
      row[column.id] = cellValue;
    });

    columnDefinition[1].columns.forEach((column) => {
      let cellValue: string = "";
      cellValue = imodelQualityData.classInfo[column.id]?imodelQualityData.classInfo[column.id].toString(): "";
      row[column.id] = cellValue;
    });

    rows.push(row);

    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imodelQualityData]);

  return (
    <Table
      data={data}
      columns={columnDefinition}
      //onRowClick={onRowClick}
      isLoading={!imodelQualityData}
      emptyTableContent={"No data"}
      density="extra-condensed"
      style={{ height: "100%", width: "auto" }} />
  );
};

export class IModelQualityTableWidgetProvider implements UiItemsProvider {
  public readonly id: string = "IModelQualityTableWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Bottom && _section === StagePanelSection.Start) {
      widgets.push(
        {
          id: "IModelQualityTableWidget",
          label: "QualityReport",
          defaultState: WidgetState.Open,
          getWidgetContent: () => <IModelQualityTableWidget />,
        }
      );
    }
    return widgets;
  }
}
