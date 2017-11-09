import React from "react";
import { Icon, IconClasses } from "@blueprintjs/core";

export default {
  updateKeys: ["sequenceDataHistory", "undo"],
  itemProps: ({ sequenceDataHistory = {}, undo }) => {
    const { past = [] } = sequenceDataHistory;
    return {
      Icon: <Icon iconName={IconClasses.UNDO} />,
      disabled: !past.length,
      onIconClick: undo,
      tooltip: "Undo"
    };
  }
};