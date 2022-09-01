// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack, Label, Text, Link } from '@fluentui/react';
import { useHistory } from 'react-router-dom';

import { Url } from '../constant';

const flowList = [
  {
    img: '/icons/home/computeDevice.png',
    title: 'Add compute device',
    describe: 'Connect your own device to power your solution',
    linkText: 'Add >',
    link: Url.COMPUTE_DEVICE,
    style: { width: '88px', height: '96px' },
  },
  {
    img: '/icons/home/camera.png',
    title: 'Connect video feed',
    describe: 'Add and configure your choice of camera streams',
    linkText: 'Connect >',
    link: Url.CAMERAS,
    style: { width: '99px', height: '65px' },
  },
  {
    img: '/icons/home/model.png',
    title: 'Add a model (optional)',
    describe: 'Use models to detect and classify objects in your streams',
    linkText: 'Add >',
    link: Url.MODELS,
    style: { width: '109px', height: '90px' },
  },
  {
    img: '/icons/home/aiSkill.png',
    title: 'Build an AI skill',
    describe: 'Transform your unstructured streams into structured insights',
    linkText: 'Build >',
    link: Url.AI_SKILL,
    style: { width: '100px', height: '100px' },
  },
  {
    img: '/icons/home/deployment.png',
    title: 'Deploy!',
    describe: 'Connect your AI skills to your compute devices and cameras',
    linkText: 'Deploy >',
    link: Url.DEPLOYMENT,
    style: { width: '95px', height: '100px' },
  },
];

const HomePage = () => {
  const history = useHistory();

  return (
    <Stack styles={{ root: { padding: '75px 45px 0' } }}>
      <Stack styles={{ root: { textAlign: 'center' } }}>
        <Label styles={{ root: { fontSize: '28px' } }}>Utilize the Power of Edge AI</Label>
        <Text>A low-code, no-code experience to easily build, deploy, and manage Edge AI solutions.</Text>
      </Stack>
      <Stack horizontal horizontalAlign="space-around" styles={{ root: { flexWrap: 'wrap' } }}>
        {flowList.map((flow, id) => (
          <Stack
            key={id}
            styles={{
              root: { border: '1px solid #EDEBE9', width: '245px', height: '292px', marginTop: '50px' },
            }}
          >
            <Stack
              styles={{
                root: {
                  height: '170px',
                  backgroundColor: '#F2F2F2',
                },
              }}
              horizontalAlign="center"
              verticalAlign="center"
            >
              <img style={flow.style} src={flow.img} alt="flow" />
            </Stack>
            <Stack styles={{ root: { padding: '15px' } }}>
              <Label>{flow.title}</Label>
              <Text>{flow.describe}</Text>
              <Link
                styles={{ root: { fontSize: '12px', paddingTop: '12px' } }}
                onClick={() => history.push(flow.link)}
              >
                {flow.linkText}
              </Link>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

export default HomePage;
