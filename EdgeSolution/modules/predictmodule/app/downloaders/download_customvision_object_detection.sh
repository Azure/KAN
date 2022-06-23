URL=$1
FOLDER=$2


UUID=`pythonw -c "import uuid; print(uuid.uuid1())"`
MODEL_ZIP_FILE=model-$UUID.zip

wget $URL -O /tmp/$MODEL_ZIP_FILE
unzip /tmp/$MODEL_ZIP_FILE -d $FOLDER

