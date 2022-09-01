export const getModleZooDisplayName = (name: string) => {
  switch (name) {
    case 'age-gender-recognition-retail-0013':
      return 'Age and Gender Recognition';
    case 'emotions-recognition-retail-0003':
      return 'Emotion Recognition';
    case 'face-detection-retail-0004':
      return 'Face Detection';
    case 'pedestrian-and-vehicle-detector-adas-0001':
      return 'Pedestrian and Vehicle Detection';
    case 'person-detection-retail-0013':
      return 'Person Detection';
    case 'vehicle-attributes-recognition-barrier-0039':
      return 'Vehicle Attributes Recognition';
    default:
      return name;
  }
};
