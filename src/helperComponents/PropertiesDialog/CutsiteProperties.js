import React from "react";
import {
  CmdCheckbox,
  DataTable,
  withSelectedEntities
} from "teselagen-react-components";
import { map } from "lodash";
import EnzymeViewer from "../../EnzymeViewer";
import enzymeList from "../../redux/utils/defaultEnzymeList.json";
import CutsiteFilter from "../../CutsiteFilter";
import { Button } from "@blueprintjs/core";
import { connectToEditor } from "../../withEditorProps";
import { compose } from "recompose";
import selectors from "../../selectors";
import commands from "../../commands";

// import { Button } from "@blueprintjs/core";
// import { getRangeLength, convertRangeTo1Based } from "ve-range-utils";

class CutsiteProperties extends React.Component {
  constructor(props) {
    super(props);
    this.commands = commands(this);
  }
  onRowSelect = ([record]) => {
    if (!record) return;
    const { dispatch, editorName } = this.props;
    dispatch({
      type: "CARET_POSITION_UPDATE",
      payload: record.topSnipPosition,
      meta: {
        editorName
      }
    });
  };
  SubComponent = row => {
    // const { selectionLayerUpdate } = this.props;
    const { name, cutsiteGroup } = row.original;
    const entities = cutsiteGroup.map(
      ({
        restrictionEnzyme: { forwardRegex, reverseRegex } = {},
        forward,
        topSnipBeforeBottom,
        topSnipPosition,
        bottomSnipPosition
      }) => {
        return {
          topSnipPosition,
          position: topSnipBeforeBottom
            ? topSnipPosition + " - " + bottomSnipPosition
            : bottomSnipPosition + " - " + topSnipPosition,
          strand:
            forwardRegex === reverseRegex
              ? "Palindromic"
              : forward
              ? "1"
              : "-1forward"
        };
      }
    );
    const enzyme = enzymeList[name.toLowerCase()];
    // return <div>yooo</div>
    return (
      <div>
        <div
          style={{
            margin: 10,
            display: "flex",
            justifyContent: "space-around"
          }}
        >
          {enzyme && (
            <EnzymeViewer
              {...{
                sequence: enzyme.site,
                reverseSnipPosition: enzyme.bottomSnipOffset,
                forwardSnipPosition: enzyme.topSnipOffset
              }}
            />
          )}
          <div style={{ width: 300 }}>
            <h3>Cuts At: </h3>
            <DataTable
              //defaults={{order: ["numberOfCuts"]}}

              maxHeight={300}
              onRowSelect={this.onRowSelect}
              formName="cutLocations"
              isSingleSelect
              compact
              noRouter
              noHeader
              isSimple
              noFullscreenButton
              isInfinite
              withSearch={false}
              withFilter={false}
              schema={this.subComponentSchemna}
              entities={entities}
            />
          </div>
        </div>
      </div>
    );
  };

  subComponentSchemna = {
    fields: [
      { path: "position", type: "string" },
      { path: "strand", type: "string" }
    ]
  };

  schema = {
    fields: [
      { path: "name", type: "string" },
      { path: "numberOfCuts", type: "number" }
    ]
  };

  onChangeHook = () => {
    this.props.annotationVisibilityShow("cutsites");
  };
  render() {
    const {
      editorName,
      createNewDigest,
      filteredCutsites: allCutsites
    } = this.props;

    const { cutsitesByName } = allCutsites;

    const cutsitesToUse = map(cutsitesByName, (cutsiteGroup, name) => {
      return {
        cutsiteGroup,
        id: name,
        name,
        numberOfCuts: cutsiteGroup.length
        // size: getRangeLength(cutsiteGroup, sequenceData.sequence.length)
      };
    });
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            marginBottom: 10,
            paddingTop: 10,
            display: "flex",
            alignItems: "center"
          }}
        >
          <CmdCheckbox prefix="Show " cmd={this.commands.toggleCutsites} />
          <Button
            style={{ marginLeft: 10, cursor: "auto" }}
            disabled
            minimal
            icon="filter"
          />
          <CutsiteFilter
            style={{ flexGrow: 2 }}
            editorName={editorName}
            onChangeHook={this.onChangeHook}
          />

          <Button
            style={{ marginLeft: 15, flexGrow: -1 }}
            onClick={() => {
              createNewDigest();
            }}
          >
            Virtual Digest
          </Button>
        </div>
        <DataTable
          compact
          noSelect
          noHeader
          noFooter
          withExpandAndCollapseAllButton
          noFullscreenButton
          noPadding
          defaults={{ order: ["numberOfCuts"] }}
          maxHeight={400}
          formName="cutsiteProperties"
          noRouter
          withSearch={false}
          SubComponent={this.SubComponent}
          isInfinite
          schema={this.schema}
          entities={cutsitesToUse}
        />
      </div>
    );
  }
}

export default compose(
  connectToEditor(editorState => {
    const cutsites = selectors.filteredCutsitesSelector(editorState);
    return {
      annotationVisibility: editorState.annotationVisibility || {},
      filteredCutsites: cutsites,
      cutsites: cutsites.cutsitesArray
    };
  }),
  withSelectedEntities("cutsiteProperties")
)(CutsiteProperties);
