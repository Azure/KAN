# Build and deploy KAN from source

## Rebuild the portal container

Follow instructions [here](../../src/portal/README.md)

## Rebuild Helm chart

```bash
# under Deploy/helm. The following script uses kanprod.azurecr.io as an example.
export VERSION=<version>
helm package --version $VERSION --app-version $VERSION kanportal
helm push kanportal-$VERSION.tgz oci://kanprod.azurecr.io/helm
```


## To use kan-installer.sh locally

1. Update `kan-installer.sh` 
    * Change `kanportal_version` to the desired version
    * Change `symphony_version` to the desired version
2. Run the script `./kan-installer.sh`

## Appendix 

If you are using a private container registry, you need to authenticate to the registry before pushing the image
```bash
# the following script uses kanprod.azurecr.io as an example. Update repo name to your own repo name
az login
TOKEN=$(az acr login --name kanprod --expose-token --output tsv --query accessToken)
docker login kanprod.azurecr.io --username 00000000-0000-0000-0000-000000000000 --password $TOKEN
docker push kanprod.azurecr.io/kanportal:<version tag>
```

Authentication for uploading Helm chart:
```
export HELM_EXPERIMENTAL_OCI=1
USER_NAME="00000000-0000-0000-0000-000000000000"
PASSWORD=$(az acr login --name kanprod --expose-token --output tsv --query accessToken)
helm registry login kanprod.azurecr.io --username $USER_NAME --password $PASSWORD
```