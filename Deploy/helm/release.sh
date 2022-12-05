ACR_NAME=$1
VERSION=$(cat ../src/portal/modules/webmodule/version.txt)-amd64
helm package --version $VERSION --app-version $VERSION voe
helm push voe-$VERSION.tgz oci://$ACR_NAME.azurecr.io/helm
if [ "$?" -ne 0 ]
then
    helm registry login $ACR_NAME.azurecr.io 
    helm push voe-$VERSION.tgz oci://$ACR_NAME.azurecr.io/helm
fi
