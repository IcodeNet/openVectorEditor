import React from "react";
import { DataTable } from "teselagen-react-components";
import { Button } from "@blueprintjs/core";

export default class GuideTool extends React.Component {

  onRowSelect = ([record]) => {
    if (!record) return;
    const { dispatch, editorName } = this.props;
    dispatch({
      type: "SELECTION_LAYER_UPDATE",
      payload: record,
      meta: {
        editorName
      }
    });
  };

  render() {
    // const { activeRegion = {} } = this.props.guideToolProps || {};
    const {guides} = this.props.guideTool || {}
    const entitiesToUse = Object.values(guides)
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DataTable
            noRouter
            noFullscreenButton
            onRowSelect={this.onRowSelect}
            maxHeight={400}
            compact
            isInfinite
            formName={"guideTable"}
            schema={schema}
            entities={entitiesToUse}
          />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            style={{ marginRight: 15 }}
            // onClick={() => {this.exportGuidesToCsv}}
          >
            Export
          </Button>
          <Button
            style={{ marginRight: 15 }}
            // onClick={() => {this.saveGuideSet}}
          >
            Save as Guide Set
          </Button>
        </div>
      </div>
    );
  }
}

const schema = {
  fields: [
    { path: "start", displayName: "Position", type: "string" },
    { path: "forward", displayName: "Strand", type: "boolean", render: (val) => val ? "+" : "-" },
    { width: 200, path: "sequence", displayName: "Sequence", type: "string" },
    { path: "pamSite", displayName: "PAM", type: "string" },
    { path: "onTargetScore", displayName: "On-Target Score", type: "number" },
    { path: "offTargetScore", displayName: "Off-Target Score", type: "number" }
  ]
};
