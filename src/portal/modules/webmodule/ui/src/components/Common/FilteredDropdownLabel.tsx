// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useCallback, useEffect } from 'react';
import { Stack, TeachingBubble, DirectionalHint, Checkbox } from '@fluentui/react';

import { theme } from '../../constant';

interface Props {
  lablelTitle: string;
  currentOptionList: [string, number[] | string[]][];
  onContentChange: (selectedContentIds: number[]) => void;
  selectedObjectNameList: string[];
  onContentCancel: () => void;
}

const FilteredDropdownLabel = (props: Props) => {
  const { currentOptionList, lablelTitle, onContentChange, selectedObjectNameList, onContentCancel } = props;

  const [isClick, setClick] = useState<boolean>(false);
  const [localObjectName, setLocalObjectName] = useState<string[]>([]);

  const bubbleID = `bubbleFilter${lablelTitle.replace(' ', '')}`;

  useEffect(() => {
    if (currentOptionList.length === 0) return;

    setLocalObjectName(currentOptionList.map(([objectName]) => objectName));
  }, [currentOptionList]);

  const onApplyClick = useCallback(() => {
    const selectedTargetIds = currentOptionList.reduce((acc, [target, ids]) => {
      if (localObjectName.find((fieldName) => fieldName === target)) return [...acc, ...ids];
      return acc;
    }, []);
    onContentChange(
      selectedTargetIds.length === 0
        ? currentOptionList.reduce((acc, [_, ids]) => [...acc, ...ids], [])
        : selectedTargetIds,
    );

    setClick(false);
  }, [currentOptionList, localObjectName, onContentChange]);

  const onCancelClick = useCallback(() => {
    onContentCancel();
    setClick(false);
  }, [onContentCancel]);

  return (
    <Stack onClick={() => setClick(true)}>
      <span
        id={bubbleID}
        style={{
          fontSize: '13px',
          backgroundColor: 'rgba(0, 120, 212, 0.1)',
          padding: '4px 10px',
          borderRadius: '16px',
        }}
      >
        {`${lablelTitle} == `}
        {selectedObjectNameList.length === 0 && 'All'}
        {selectedObjectNameList.length !== 0 && selectedObjectNameList.join(', ')}
      </span>
      {isClick && (
        <TeachingBubble
          target={`#${bubbleID}`}
          hasCondensedHeadline={true}
          primaryButtonProps={{
            children: 'Cancel',
            onClick: onCancelClick,
          }}
          secondaryButtonProps={{
            children: 'Apply',
            onClick: onApplyClick,
          }}
          onDismiss={() => setClick(false)}
          headline={lablelTitle}
          calloutProps={{
            directionalHint: DirectionalHint.bottomCenter,
            calloutWidth: 290,
            calloutMaxWidth: 290,
          }}
          styles={{
            bodyContent: { padding: '16px' },
            headline: { color: theme.palette.black, fontWeight: 600, fontSize: '18px', lineHeight: '24px' },
            content: { backgroundColor: theme.palette.white, color: theme.palette.black },
          }}
        >
          <Stack tokens={{ childrenGap: 10 }}>
            <Checkbox
              label="All"
              onChange={(_, checked) => {
                setLocalObjectName(checked ? currentOptionList.map(([target]) => target) : []);
              }}
              checked={currentOptionList.length === localObjectName.length}
              defaultIndeterminate
              indeterminate={false}
            />
            {currentOptionList.map(([targetName], id) => (
              <Checkbox
                key={id}
                defaultIndeterminate
                indeterminate={false}
                label={targetName}
                onChange={(_, checked) => {
                  if (checked) {
                    setLocalObjectName((prev) => [...prev, targetName]);
                  } else {
                    setLocalObjectName((prev) => prev.filter((name) => name !== targetName));
                  }
                }}
                checked={!!localObjectName.find((target) => target === targetName)}
              />
            ))}
          </Stack>
        </TeachingBubble>
      )}
    </Stack>
  );
};

export default FilteredDropdownLabel;
