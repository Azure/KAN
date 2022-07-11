#URL=$1
#FOLDER=$2


#UUID=`python -c "import uuid; print(uuid.uuid1())"`
#MODEL_ZIP_FILE=model-$UUID.zip
#
#wget $URL -O /tmp/$MODEL_ZIP_FILE
#unzip /tmp/$MODEL_ZIP_FILE -d $FOLDER

NAME=$1
FOLDER=$2
PRECISIONS=FP32

DOWNLOADER=`dirname "$0"`/openvino_model_zoo_tool/tools/model_tools/downloader.py

UUID=`python -c "import uuid; print(uuid.uuid1())"`
TMP_MODEL_FOLDER=/tmp/model-$UUID

mkdir -p $TMP_MODEL_FOLDER
python $DOWNLOADER  --name $NAME --precisions $PRECISIONS -o $TMP_MODEL_FOLDER

mkdir -p $FOLDER
cp $TMP_MODEL_FOLDER/intel/$NAME/$PRECISIONS/* $FOLDER


