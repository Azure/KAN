import {
  createSlice,
  nanoid,
  createEntityAdapter,
  ThunkAction,
  Action,
  PayloadAction,
  // current,
} from '@reduxjs/toolkit';
import * as R from 'ramda';

import { schema, normalize } from 'normalizr';

import { State } from 'RootStateType';
import { Annotation, AnnotationState, Image } from './type';
import { OpenFrom, openLabelingPage } from './labelingPageSlice';
import { deleteImage, changeImage } from './actions';
import { createWrappedAsync } from './shared/createWrappedAsync';
import rootRquest from './rootRquest';

// Type definition
type ImageFromServer = {
  id: number;
  image: string;
  labels: string;
  is_relabel: boolean;
  confidence: number;
  uploaded: boolean;
  customvision_id: string;
  remote_url: string;
  part: number;
  project: number;
  timestamp: string;
  camera: string;
  manual_checked: boolean;
  part_ids: string;
};

type ImageFromServerWithSerializedLabels = Omit<ImageFromServer, 'labels'> & { labels: Annotation[] };

type RemoveImageLabel = {
  selectedImageId: number;
  annotationIndex: string;
};

export type CaptureImagePayload = {
  streamId: string;
  imageIds: number[];
  shouldOpenLabelingPage: boolean;
  projectId: number;
};

// Normalization
const normalizeImageShape = (response: ImageFromServerWithSerializedLabels) => {
  return {
    id: response.id,
    image: response.image,
    part: response.part,
    labels: response.labels,
    isRelabel: response.is_relabel,
    confidence: response.confidence,
    hasRelabeled: false,
    timestamp: response.timestamp,
    camera: response.camera,
    uploaded: response.uploaded,
    manualChecked: response.manual_checked,
    project: response.project,
    part_ids: JSON.parse(response.part_ids),
  };
};

const normalizeImagesAndLabelByNormalizr = (data: ImageFromServerWithSerializedLabels[]) => {
  const labels = new schema.Entity<Annotation>('labels', undefined, {
    processStrategy: (value, parent): Annotation => {
      const { id, ...label } = value;
      const { part, ...restLabel } = label;
      return {
        id,
        image: parent.id,
        label: restLabel,
        annotationState: AnnotationState.Finish,
        part: part || null,
      };
    },
  });

  const images = new schema.Entity(
    'images',
    { labels: [labels] },
    {
      processStrategy: normalizeImageShape,
    },
  );

  return normalize(data, [images]) as any as {
    entities: {
      images: Record<string, Image>;
      labels: Record<string, Annotation>;
    };
    result: number[];
  };
};

const serializeLabels = R.map<ImageFromServer, ImageFromServerWithSerializedLabels>((e) => ({
  ...e,
  // labels: (JSON.parse(e.labels) || []).map((l) => ({ ...l, id: nanoid() })),
  labels: (JSON.parse(e.labels) || []).map((l) => ({ ...l, id: nanoid() })),
}));

const normalizeImages = R.compose(normalizeImagesAndLabelByNormalizr, serializeLabels);

// Async Thunk Actions
export const getImages = createWrappedAsync<
  ReturnType<typeof normalizeImages>['entities'],
  { freezeRelabelImgs: boolean; selectedProject?: number },
  // TODO Use the type State will cause annotationSlice/addOriginEntitiesReducer encounter own annotation referencing
  // issue. Should define the type State manually instead of getting it from return type.
  { state: any }
>('images/get', async ({ freezeRelabelImgs, selectedProject }, { getState }) => {
  if (freezeRelabelImgs) {
    /**
     * Call keep_alive can freeze the relabel images
     * Prevent from getting stale images, we should call the keep_alive before get images.
     */
    const nonDemoProjectId = getState().trainingProject.nonDemo[0];
    await rootRquest.post(`/api/projects/${nonDemoProjectId}/relabel_keep_alive/`);
  }

  let url = '/api/images';
  if (selectedProject) {
    url += `?project=${selectedProject}`;
  }

  const response = await rootRquest.get(url);
  return normalizeImages(response.data).entities;
});

export const postImages = createWrappedAsync('image/post', async (newImage: FormData) => {
  const response = await rootRquest.post('/api/images/', newImage);
  return normalizeImages([response.data]).entities;
});

export const captureImage = createWrappedAsync<any, CaptureImagePayload>(
  'image/capture',
  async ({ streamId, imageIds, shouldOpenLabelingPage, projectId }, { dispatch }) => {
    const response = await rootRquest.get(`/api/streams/${streamId}/capture?project=${projectId}`);
    const capturedImage = response.data.image;

    if (shouldOpenLabelingPage)
      dispatch(
        openLabelingPage({
          imageIds: [...imageIds, capturedImage.id],
          selectedImageId: capturedImage.id,
          openFrom: OpenFrom.AfterCapture,
        }),
      );

    return normalizeImages([response.data.image]).entities;
  },
);

export const saveLabelImageAnnotation = createWrappedAsync<any, undefined, { state: State }>(
  'image/saveAnno',
  async (_, { getState }) => {
    const imageId = getState().labelingPage.selectedImageId;
    const annoEntities = getState().annotations.entities;
    const labels = Object.values(annoEntities).filter((e: Annotation) => e.image === imageId);

    const imgPart = getState().labelImages.entities[imageId].part;

    const manualChecked = labels.length > 0;

    await rootRquest.patch(`/api/images/${imageId}/`, {
      labels: JSON.stringify(labels.map((e: Annotation) => ({ ...e.label, part: e.part }))),
      manual_checked: manualChecked,
      part: imgPart,
    });
    return { imageId, manualChecked, labels: labels.map((label) => label.id) };
  },
);

export const saveClassificationImageTag = createWrappedAsync<any, undefined, { state: State }>(
  'image/saveClassification',
  async (_, { getState }) => {
    const { selectedImageId } = getState().labelingPage;
    const annoEntities = getState().annotations.entities;
    const labels = Object.values(annoEntities).filter((e: Annotation) => e.image === selectedImageId);

    await rootRquest.patch(`/api/images/${selectedImageId}/`, {
      labels: JSON.stringify(labels.map((e: Annotation) => ({ ...e.label, part: e.part }))),
      manual_checked: true,
    });

    return { id: selectedImageId, manualChecked: true, labels: labels.map((label) => label.id) };
  },
);

const imageAdapter = createEntityAdapter<Image>();

const slice = createSlice({
  name: 'images',
  initialState: imageAdapter.getInitialState(),
  reducers: {
    changeImgPart: imageAdapter.updateOne,
    removeImgLabels: (state, action: PayloadAction<RemoveImageLabel>) => {
      const { selectedImageId, annotationIndex } = action.payload;
      const newLabels = state.entities[selectedImageId].labels.filter((label) => label !== annotationIndex);
      imageAdapter.upsertOne(state, { ...state.entities[selectedImageId], labels: newLabels });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getImages.fulfilled, (state, action) => {
        imageAdapter.setAll(state, action.payload.images || {});
      })
      .addCase(captureImage.fulfilled, (state, action) => {
        imageAdapter.upsertMany(state, action.payload.images);
      })
      .addCase(saveLabelImageAnnotation.fulfilled, (state, action) => {
        imageAdapter.updateOne(state, {
          id: action.payload.imageId,
          changes: { manualChecked: action.payload.manualChecked, labels: action.payload.labels },
        });
      })
      .addCase(saveClassificationImageTag.fulfilled, (state, action) => {
        imageAdapter.updateOne(state, {
          id: action.payload.id,
          changes: { manualChecked: action.payload.manualChecked, labels: action.payload.labels },
        });
      })
      .addCase(deleteImage.fulfilled, imageAdapter.removeOne)
      .addCase(postImages.fulfilled, (state, action) => {
        imageAdapter.upsertMany(state, action.payload.images);
      })
      .addCase(changeImage, (state, action) => imageAdapter.updateOne(state, action.payload.changePart));
  },
});

const { reducer } = slice;
export default reducer;

export const { changeImgPart, removeImgLabels } = slice.actions;
export const thunkChangeImgPart =
  (newPartId: number): ThunkAction<void, State, unknown, Action<string>> =>
  (dispatch, getState) => {
    const { selectedImageId } = getState().labelingPage;
    dispatch(changeImgPart({ id: selectedImageId, changes: { part: newPartId } }));
  };

export const {
  selectAll: selectAllImages,
  selectEntities: selectImageEntities,
  selectById: selectImageById,
} = imageAdapter.getSelectors<State>((state) => state.labelImages);
