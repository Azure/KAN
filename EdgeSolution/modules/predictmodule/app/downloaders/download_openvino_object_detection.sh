NAME=$1
FOLDER=$2
PRECISIONS=FP32

DOWNLOADER=`dirname "$0"`/openvino_model_zoo_tool/tools/model_tools/downloader.py

UUID=`python3 -c "import uuid; print(uuid.uuid1())"`
TMP_MODEL_FOLDER=/tmp/model-$UUID

mkdir -p $TMP_MODEL_FOLDER
python3 $DOWNLOADER  --name $NAME --precisions $PRECISIONS -o $TMP_MODEL_FOLDER

mkdir -p $FOLDER
cp $TMP_MODEL_FOLDER/intel/$NAME/$PRECISIONS/* $FOLDER


