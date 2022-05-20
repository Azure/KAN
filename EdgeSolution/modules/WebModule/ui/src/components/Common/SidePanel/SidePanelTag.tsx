import React, { useState, useCallback } from 'react';
import { TextField, Stack, PrimaryButton, DefaultButton, Text } from '@fluentui/react';

import { Tag, getErrorMessage } from '../TagPage';
import { theme } from '../../../constant';

import TagLabel from '../TagLabel';

interface Props {
  tagList: { name: string; value: string }[];
  isEdit: boolean;
  onDelete: (id: number) => void;
  onTagListChange: (tag: { name: string; value: string }[]) => void;
}

const SidePanelTag = (props: Props) => {
  const { tagList, isEdit, onTagListChange, onDelete } = props;

  const [localTag, setLocalTag] = useState<Tag>({ name: '', value: '', errorMessage: null });

  const onTagAdd = useCallback(() => {
    onTagListChange([...tagList, { name: localTag.name, value: localTag.value }]);
    setLocalTag({ name: '', value: '', errorMessage: null });
  }, [tagList, localTag, onTagListChange]);

  return (
    <Stack>
      <Text styles={{ root: { color: theme.palette.neutralSecondaryAlt, paddingBottom: '5px' } }}>Tags</Text>
      {isEdit ? (
        <Stack tokens={{ childrenGap: 10 }}>
          <Stack>
            <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="start">
              <TextField
                value={localTag.name}
                placeholder="Enter name"
                onChange={(_: any, newValue: string) =>
                  setLocalTag((prev) => ({
                    ...prev,
                    name: newValue,
                    errorMessage: getErrorMessage(
                      { ...prev, name: newValue },
                      tagList.map((tag) => tag.name),
                    ),
                  }))
                }
                errorMessage={localTag.errorMessage}
              />
              <Text styles={{ root: { fontSize: '16px', fontWeight: 600 } }}>:</Text>
              <TextField
                value={localTag.value}
                placeholder="Enter value"
                onChange={(_: any, newValue: string) =>
                  setLocalTag((prev) => ({
                    ...prev,
                    value: newValue,
                    errorMessage: getErrorMessage(
                      { ...prev, value: newValue },
                      tagList.map((tag) => tag.name),
                    ),
                  }))
                }
              />
            </Stack>
            <Stack horizontal tokens={{ childrenGap: 8 }}>
              {tagList.length > 0 &&
                tagList.map((tag, idx) => (
                  <TagLabel
                    key={idx}
                    id={idx}
                    text={`${tag.name} : ${tag.value}`}
                    onDelete={(idx) => onDelete(idx)}
                    root={{ marginTop: '8px' }}
                  />
                ))}
            </Stack>
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton onClick={onTagAdd} disabled={!!localTag.errorMessage}>
              Add
            </PrimaryButton>
            <DefaultButton onClick={() => setLocalTag({ name: '', value: '', errorMessage: null })}>
              Cancel
            </DefaultButton>
          </Stack>
        </Stack>
      ) : (
        <Stack styles={{ root: { color: theme.palette.black } }}>
          {tagList.length > 0 && tagList.map((tag) => <Text>{`${tag.name} : ${tag.value}`}</Text>)}
        </Stack>
      )}
    </Stack>
  );
};

export default SidePanelTag;
