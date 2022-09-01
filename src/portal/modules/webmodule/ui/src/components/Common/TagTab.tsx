// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, Text, TextField, IconButton } from '@fluentui/react';
import { isEmpty } from 'ramda';

export type Tag = {
  name: string;
  value: string;
  errorMessage: string;
};

interface Props {
  tagList: Tag[];
  onTagChange: (idx: number, newTag: Tag) => void;
  onTagDelete: (idx: number) => void;
}

export const getErrorMessage = (tag: Tag, compareNameList: string[]): string => {
  if (tag.name === '') return 'Tags name are case-insensitive.';
  if (compareNameList.includes(tag.name)) return 'The tag name is already used.';
  if (tag.value === '') return 'Value cannot be blank.';
  return '';
};

export const getFilteredTagList = (tagList: Tag[]) =>
  tagList.filter((tag) => !isEmpty(tag.name) || !isEmpty(tag.value));

const TagTab = (props: Props) => {
  const { tagList, onTagChange, onTagDelete } = props;

  return (
    <Stack styles={{ root: { paddingTop: '40px' } }}>
      <Stack styles={{ root: { marginBottom: '30px' } }}>
        <Label>Tags</Label>
        <Text>
          Tags are name/value pairs that enable you to categorize resources and view consolidated billing by
          applying the same tag to multiple resources and resource groups.
        </Text>
      </Stack>
      <Stack>
        <Stack styles={{ root: { marginBottom: '10px' } }} horizontal>
          <Label styles={{ root: { width: '227px' } }}>Name</Label>
          <Label>Value</Label>
        </Stack>
        <Stack tokens={{ childrenGap: 15 }}>
          {tagList.map((tag, idx) => (
            <Stack key={idx} horizontal tokens={{ childrenGap: 10 }} verticalAlign="start">
              <TextField
                styles={{ root: { width: '200px' } }}
                value={tag.name}
                onChange={(_, newValue: string) => onTagChange(idx, { ...tag, name: newValue })}
                errorMessage={tag.errorMessage}
              />
              <Text styles={{ root: { marginTop: '3px' } }}>:</Text>
              <TextField
                styles={{ root: { width: '200px' } }}
                value={tag.value}
                onChange={(_, newValue: string) => onTagChange(idx, { ...tag, value: newValue })}
              />
              {tagList.length - 1 !== idx && (
                <IconButton
                  iconProps={{ iconName: 'Delete' }}
                  onClick={() => tagList.length - 1 !== idx && onTagDelete(idx)}
                />
              )}
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default TagTab;
