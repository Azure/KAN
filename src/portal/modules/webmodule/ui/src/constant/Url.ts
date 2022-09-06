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
  CAMERAS_CREATION = '/cameras/create/:step',
  CAMERAS_CREATION_BASICS = '/cameras/create/basics',
  CAMERAS_CREATION_TAG = '/cameras/create/tag',
  CAMERAS_CREATION_PREVIEW = '/cameras/create/preview',
  CAMERAS_EDIT = '/cameras/edit/:id/:step',
  CAMERAS_EDIT_BASICS = '/cameras/edit/:id/basics',
  CAMERAS_EDIT_TAG = '/cameras/edit/:id/tag',
  CAMERAS_EDIT_PREVIEW = '/cameras/edit/:id/preview',
  CAMERAS_LIVE_FEED = '/cameras/detail/:id',

  CAMERAS_DETAIL = '/cameras/detail',

  MODELS = '/models',
  MODELS_CUSTOM_VISION_DETAIL = '/models/detail/:id',
  MODELS_BROWSE_ZOO = '/models/modelZoo',
  MODELS_CREATION = '/models/create/:key',
  MODELS_CREATION_BASIC = '/models/create/basics',
  MODELS_CREATION_TAG = '/models/create/tag',
  MODELS_CREATION_PREVIEW = '/models/create/preview',

  MODELS_OBJECTS = '/models/detail/objects',

  CASCADES = '/cascades',
  CASCADES_DETAIL = '/cascades/:id',
  CASCADES_CREATE = '/cascades/create',

  DEPLOYMENT = '/deployment',
  DEPLOYMENT_CREATION = '/deployment/create/:step',
  DEPLOYMENT_CREATION_BASIC = '/deployment/create/basics',
  DEPLOYMENT_CREATION_CONFIGURE = '/deployment/create/configure',
  DEPLOYMENT_CREATION_TAG = '/deployment/create/tag',
  DEPLOYMENT_CREATION_PREVIEW = '/deployment/create/preview',
  DEPLOYMENT_EDIT = '/deployment/edit/:id/:step',
  DEPLOYMENT_EDIT_BASIC = '/deployment/edit/:id/basics',
  DEPLOYMENT_EDIT_CONFIGURE = '/deployment/edit/:id/configure',
  DEPLOYMENT_EDIT_TAG = '/deployment/edit/:id/tag',
  DEPLOYMENT_EDIT_PREVIEW = '/deployment/edit/:id/preview',
  DEPLOYMENT_DETAIL = '/deployment/detail/:id',
  DEPLOYMENT_DETAIL_SKILL = '/deployment/detail/:deployment/:skill',

  AZURE_LOGIN = '/azureLogin',

  COMPUTE_DEVICE = '/computeDevice',
  COMPUTE_DEVICE_CREATION = '/computeDevice/create/:step',
  COMPUTE_DEVICE_CREATION_BASIC = '/computeDevice/create/basics',
  COMPUTE_DEVICE_CREATION_TAG = '/computeDevice/create/tag',
  COMPUTE_DEVICE_CREATION_PREVIEW = '/computeDevice/create/preview',
  COMPUTE_DEVICE_EDIT = '/computeDevice/edit/:id/:step',
  COMPUTE_DEVICE_EDIT_BASIC = '/computeDevice/edit/:id/basics',
  COMPUTE_DEVICE_EDIT_TAG = '/computeDevice/edit/:id/tag',
  COMPUTE_DEVICE_EDIT_PREVIEW = '/computeDevice/edit/:id/preview',

  AI_SKILL = '/aiSkill',
  AI_SKILL_CREATION = '/aiSkill/create/:step',
  AI_SKILL_CREATION_BASIC = '/aiSkill/create/basics',
  AI_SKILL_CREATION_CASCADE = '/aiSkill/create/cascade',
  AI_SKILL_CREATION_TAG = '/aiSkill/create/tag',
  AI_SKILL_CREATION_PREVIEW = '/aiSkill/create/preview',
  AI_SKILL_EDIT = '/aiSkill/edit/:id/:step',
  AI_SKILL_EDIT_BASIC = '/aiSkill/edit/:id/basics',
  AI_SKILL_EDIT_CASCADE = '/aiSkill/edit/:id/cascade',
  AI_SKILL_EDIT_TAG = '/aiSkill/edit/:id/tag',
  AI_SKILL_EDIT_PREVIEW = '/aiSkill/edit/:id/preview',
}

export default Url;
