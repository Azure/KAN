# Release Kan Portal Helm chart to Azure Container Registry

_(last edit: 4/24/2023)_

Follow these steps to package and push KAN Portal Helm chart:

## 1. Update versions

Edit the ```Deploy/helm/kanportal/chart.yaml``` file and the ```Deploy/helm/kanportal/values.yaml``` file to update all the version numbers to desired values.

## 2. Run build script
We provide a ```release.sh``` script that packages Kan Portal Helm chart and pushes it to a container registry. To run the script:

```bash
bash release.sh <Azure Container Registry name> # for example: bash release.sh kanprod.azurecr.io
```

The script will create a Helm chart package named ```kanportal-<version>-amd64.tgz``` and upload it to ```oci://<Azure Container Registry name>.azurecr.io/helm```. The version is read from the ```.../.../src/portal/modules/webmodules/version.txt``` file.

