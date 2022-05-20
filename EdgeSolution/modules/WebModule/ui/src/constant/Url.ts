enum Url {
  ROOT = '/',

  HOME = '/home',
  HOME_GET_STARTED = '/home/getStarted',
  HOME_CUSTOMIZE = '/home/customize',

  IMAGES = '/images',
  IMAGES_DETAIL = '/images/:id',

  PARTS = '/parts',
  PARTS_DETAIL = '/parts/detail',

  CAMERAS = '/cameras',
  CAMERAS2 = '/cameras2',
  CAMERAS2_CREATION = '/cameras2/create/:key',
  CAMERAS2_CREATION_BASICS = '/cameras2/create/basics',
  CAMERAS2_CREATION_TAG = '/cameras2/create/tag',
  CAMERAS2_CREATION_PREVIEW = '/cameras2/create/preview',
  CAMERAS2_LIVE_FEED = '/cameras2/detail/:id',

  CAMERAS_DETAIL = '/cameras/detail',

  MODELS = '/models',
  MODELS_CV_MODEL = '/models/:id/:key',
  MODELS_CV_DETAIL_BASICS = '/models/:id/basics',
  MODELS_CV_DETAIL_TRAINING_IMAGES = '/models/:id/trainingImages',

  MODELS_OBJECTS = '/models/detail/objects',

  CASCADES = '/cascades',
  CASCADES_DETAIL = '/cascades/:id',
  CASCADES_CREATE = '/cascades/create',

  DEPLOYMENT = '/deployment',
  DEPLOYMENT2 = '/deployment2',
  DEPLOYMENT2_CREATION = '/deployment2/create/:key',
  DEPLOYMENT2_CREATION_BASIC = '/deployment2/create/basics',
  DEPLOYMENT2_CREATION_CONFIGURE = '/deployment2/create/configure',
  DEPLOYMENT2_CREATION_TAG = '/deployment2/create/tag',
  DEPLOYMENT2_CREATION_PREVIEW = '/deployment2/create/preview',

  AZURE_LOGIN = '/azureLogin',

  COMPUTE_DEVICE = '/computeDevice',
  COMPUTE_DEVICE_CREATION = '/computeDevice/create/:key',
  COMPUTE_DEVICE_CREATION_BASIC = '/computeDevice/create/basics',
  COMPUTE_DEVICE_CREATION_TAG = '/computeDevice/create/tag',
  COMPUTE_DEVICE_CREATION_PREVIEW = '/computeDevice/create/preview',
}

export default Url;
