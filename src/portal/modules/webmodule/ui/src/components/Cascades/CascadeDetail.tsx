// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Node, Edge } from 'react-flow-renderer';
import { CommandBar, ICommandBarItemProps, Stack, Label, IconButton } from '@fluentui/react';
import html2canvas from 'html2canvas';

import { TrainingProject } from '../../store/types';
import { Url, theme } from '../../constant';
import { Cascade, updateCascade } from '../../store/cascadeSlice';
import { getCascadePayload, isDuplicateNodeName, isDiscreteFlow, isNotExportNode } from './utils';
import { CascadeError } from './types';

import Flow from './Flow/Flow';
import NameModal from './NameModal';
import ErrorModal from './ErrorModal';

interface Props {
  cascadeList: Cascade[];
  modelList: TrainingProject[];
  defaultCommandBarItems: ICommandBarItemProps[];
}

const CascadeDetail = (props: Props) => {
  const { cascadeList, modelList, defaultCommandBarItems } = props;

  const { id } = useParams<{ id: string }>();
  const [cascadeName, setCascadeName] = useState('');
  const [elements, setElements] = useState<(Node | Edge)[]>([]);
  const [isPopup, setIsPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cascadeError, setCascadeError] = useState<CascadeError>('');

  const flowElementRef = useRef(null);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (cascadeList.length === 0) return;

    const selectedCascade = cascadeList.find((cascade) => cascade.id === parseInt(id, 10));
    setCascadeName(selectedCascade.name);
    setElements(JSON.parse(selectedCascade.raw_data));
  }, [id, cascadeList, setElements, setCascadeName]);

  const onSaveEditCascade = useCallback(async () => {
    if (isNotExportNode(elements, modelList)) {
      setCascadeError('atLeastOneExport');
      return;
    }

    if (isDiscreteFlow(elements, modelList)) {
      setCascadeError('discreteFlow');
      return;
    }

    if (isDuplicateNodeName(elements)) {
      setCascadeError('nameDuplication');
      return;
    }

    setIsLoading(true);

    const blob = await html2canvas(flowElementRef.current, {
      backgroundColor: theme.palette.neutralLight,
    });
    const dataURL = blob.toDataURL();

    await dispatch(
      updateCascade({
        id: parseInt(id, 10),
        data: {
          ...getCascadePayload(elements, cascadeName, modelList),
          screenshot: dataURL,
        },
      }),
    );

    setIsLoading(false);

    history.push(Url.CASCADES);
  }, [dispatch, elements, cascadeName, modelList, id, history]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'addBtn',
      text: 'Save',
      iconProps: {
        iconName: 'Save',
      },
      onClick: () => {
        onSaveEditCascade();
      },
      disabled: isLoading,
    },
    ...defaultCommandBarItems,
  ];

  return (
    <>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
        <Label styles={{ root: { fontSize: '18px', lineHeight: '24px', paddingLeft: '24px' } }}>
          {cascadeName}
        </Label>
        <IconButton
          iconProps={{ iconName: 'Edit' }}
          onClick={() => setIsPopup(true)}
          styles={{ icon: { fontSize: '12px', color: '#323130' } }}
        />
      </Stack>
      <CommandBar styles={{ root: { marginTop: '24px' } }} items={commandBarItems} />
      <Flow
        elements={elements}
        setElements={setElements}
        modelList={modelList}
        flowElementRef={flowElementRef}
      />
      {isPopup && (
        <NameModal
          onClose={() => setIsPopup(false)}
          cascadeName={cascadeName}
          onSave={(name) => setCascadeName(name)}
          existingCascadeNameList={cascadeList.map((cascade) => cascade.name)}
        />
      )}
      {cascadeError !== '' && <ErrorModal cascadeError={cascadeError} onClose={() => setCascadeError('')} />}
    </>
  );
};

export default CascadeDetail;
