#!/bin/bash
kan_version=0.41.44
agent_version=0.41.44
kanportal_version=0.41.47-amd64
kanai_version=0.41.47
current_step=0
while [ $current_step -lt 8 ]; do
    case $current_step in
    0 ) # azure user
        while true; do
            read -p "azure user?(y/n): " -r; echo
            case $REPLY in
            [Yy]* )
                az account show -o none
                if [ $? != "0" ]; then
                    echo "not login"
                    exit 1
                else
                    current_step=1
                    break
                fi
            ;;
            [Nn]* )
                read -p "kan will install on current kubeconfig: (y/n) " -r; echo
                case $REPLY in
                [Yy]* )
                    create_aks_selection=2
                    create_storage_account_selection=3
                    create_blob_container_selection=4
                    create_custom_vision_selection=3
                    create_sp_selection=4
                    current_step=5
                    break
                ;;
                *)
                    echo "stop installing"
                    exit 1
                esac
            esac
        done
    ;;
    1 ) # --- aks ---
        echo "Would you like to use a exists aks, or use current kubeconfig?"
        echo "1) use an existing one"
        echo "2) use current kubeconfig"
        while true; do
            read -p "Your answer: " -r; echo
            create_aks_selection=$REPLY
            case $create_aks_selection in
            1 )
                aks=$(az resource list --resource-type='Microsoft.ContainerService/ManagedClusters' --query='[].{name: name, rg: resourceGroup, id: id }')
                echo $aks | jq -r '.[] | "\(.rg)/\(.name)"' | awk '{$1=++b")" FS $1}1'
                while true; do
                    read -p "Select a azure kubernetes: " -r; echo
                    case $REPLY in
                    [1-9]* )
                        selected_aks_index=`expr $REPLY - 1`
                        selected_aks=$(echo $aks | jq ".[$selected_aks_index]")
                        selected_aks_name=$(echo $selected_aks | jq -r ".name")
                        selected_aks_rg=$(echo $selected_aks | jq -r ".rg")
 
                        break
                    ;;
                    *) echo "Please enter a number"
                    esac
                done
                break
                ;;
            2 )
                break
                ;;
            *) echo "Please enter a number"
            esac
        done
        current_step=`expr $current_step + 1`
 
    ;;
    2 ) # --- storage account ---
        current_storage_step=1
        while [ $current_storage_step -lt 3 ]; do
            case $current_storage_step in
                1 )
                    while true; do
                        echo "Would you like to create a new storage account, or use an existing one?"
                        echo "1) create a new one"
                        echo "2) use an existing one"
                        echo "3) skip"
                        echo "4) back to previous step"
                        read -p "Your answer: " -r; echo
                        create_storage_account_selection=$REPLY
                        case $create_storage_account_selection in
                        1 )
                            while true; do
                                rgs=$(az group list --query='[].{name: name }' | jq 'sort_by(.name)')
                                echo $rgs | jq -r ".[].name" | awk '{$1=++b")" FS $1}1'
                                while true; do
                                    read -p "select a resource group: " -r; echo
                                    case $REPLY in
                                    [0-9]* )
                                        selected_rg_index=`expr $REPLY - 1`
                                        selected_storage_account_rg=$(echo $rgs | jq -r ".[$selected_rg_index].name")
                                        break
                                        ;;
                                    *) echo "Please enter a number"
                                    esac
                                done

                                while true; do
                                    read -p "storage account name: " -r; echo
                                    selected_storage_account_name=$REPLY
                                    result=$(az storage account check-name --name $selected_storage_account_name)
                                    if [ $(echo $result | jq -r .nameAvailable) == "true" ]; then
                                        break
                                    else
                                        echo $result | jq -r .message
                                    fi
                                done

                                read -p "enter a location [$(az group show -g $selected_storage_account_rg --query="location" -o tsv)]:" -r; echo
                                selected_storage_account_location=${REPLY:-$(az group show -g $selected_storage_account_rg --query="location" -o tsv)}
                                echo $selected_storage_account_location
                                break
                            done
                            current_step=3
                            current_storage_step=3
                            create_blob_container_selection=1
                            selected_blob_container_name="perceptoos"
                            break
                            ;;
                        2 )
                            storage_account=$(az storage account list --query='[].{name: name, rg: resourceGroup, id: id }' | jq 'sort_by(.id)')
                            echo $storage_account | jq -r '.[] | "\(.rg)/\(.name)"' | awk '{$1=++b")" FS $1}1'
                            while true; do
                                read -p "Select a storage account: " -r; echo
                                case $REPLY in
                                [1-9]* )
                                    selected_storage_account_index=`expr $REPLY - 1`
                                    selected_storage_account=$(echo $storage_account | jq ".[$selected_storage_account_index]")
                                    selected_storage_account_name=$(echo $selected_storage_account | jq -r ".name")
                                    selected_storage_account_rg=$(echo $selected_storage_account | jq -r ".rg")
                                    break
                                ;;
                                *) echo "Please enter a number"
                                esac
                            done
                            current_storage_step=2
                            break
                            ;;
                        3 )
                            current_storage_step=3
                            create_blob_container_selection=4
                            current_step=`expr $current_step + 1`
                            break
                            ;;
                        4 )
                            current_storage_step=3
                            current_step=`expr $current_step - 1`
                            break
                            ;;
                        *) echo "Please enter a number"
                        esac
                    done
                ;;
                2 )
                    if [ $create_storage_account_selection == "1" ]; then
                        create_blob_container_selection=1
                        selected_blob_container_name="perceptOSS"
                    else
                        while true; do
                            echo "Would you like to create a new blob container, or use an existing one?"
                            echo "In order to perform this operation please make sure you have a Storage contributor role on your subscription"
                            echo "1) create a new one"
                            echo "2) use an existing one"
                            echo "3) back to previous step"
                            read -p "Your answer: " -r; echo
                            create_blob_container_selection=$REPLY
                            case $create_blob_container_selection in
                            1 )
                                read -p "name: " -r; echo
                                selected_blob_container_name=$REPLY
                                if [ $(az storage container exists --auth-mode login --account-name $selected_storage_account_name -n $selected_blob_container_name | jq -r ".exists") == "true" ]; then
                                    echo "blob container exists"
                                else
                                    current_step=`expr $current_step + 1`
                                    break
                                fi
                            ;;
                            2 ) # --- blob container ---
                                blob_containers=$(az storage container list --account-name $selected_storage_account_name --auth-mode login --query='[].{name: name }' | jq 'sort_by(.name)')
                                if [ $(echo $blob_containers | jq "length") == "0" ]; then
                                    echo "no container found"
                                    continue
                                fi
                                echo $blob_containers | jq -r '.[].name' | awk '{$1=++b")" FS $1}1'
                                while true; do
                                    read -p "Select a blob container: " -r; echo
                                    case $REPLY in
                                    [1-9]* )
                                        selected_blob_container_index=`expr $REPLY - 1`
                                        selected_blob_container_name=$(echo $blob_containers | jq -r ".[$selected_blob_container_index].name")
                                        break
                                    ;;
                                    *) echo "Please enter a number"
                                    esac
                                done
                                current_step=`expr $current_step + 1`
                                break
                            ;;
                            3 )
                                current_storage_step=1
                                break
                            ;;
                            * ) echo "Please enter a number"
                            esac
                        done
                    fi
                    break
                ;;
            esac
        done
 
    ;;
    3 ) # --- custom vision ---
        while true; do
            echo "Would you like to create a new cognitive services, or use an existing one?"
            echo "1) create a new one"
            echo "2) use an existing one"
            echo "3) skip"
            echo "4) back to previous step"
            read -p "Your answer: " -r; echo
            create_custom_vision_selection=$REPLY
            case $create_custom_vision_selection in
            1 )
                # select rg
                rgs=$(az group list --query='[].{name: name, location: location }' | jq 'sort_by(.name)')
                echo $rgs | jq -r ".[].name" | awk '{$1=++b")" FS $1}1'
                while true; do
                    read -p "select a resource group: " -r; echo
                    case $REPLY in
                    [0-9]* )
                        selected_rg_index=`expr $REPLY - 1`
                        selected_custom_vision_rg=$(echo $rgs | jq -r ".[$selected_rg_index].name")
                        selected_custom_vision_location=$(echo $rgs | jq -r ".[$selected_rg_index].location")
                        break
                        ;;
                    *) echo "Please enter a number"
                    esac
                done
 
                read -p "Enter a name: " -r; echo
                selected_custom_vision_name=$REPLY
 
                # need check name
                if [ $(az cognitiveservices account list -g $selected_custom_vision_rg | jq "[.[] | select (.name == \"$selected_custom_vision_name\")] | length") -eq 0 ]; then
 
                    read -p "enter a location [$(az group show -g $selected_custom_vision_rg --query="location" -o tsv)]:" -r; echo
                    selected_custom_vision_location=${REPLY:-$(az group show -g $selected_custom_vision_rg --query="location" -o tsv)}
                    echo $selected_custom_visiont_location

                    current_step=`expr $current_step + 1`
                    break
                else
                    echo "This name is already taken"
                fi

 
            ;;
            2 )
                while true; do
                    echo "listing all cognitive services"
                    cognitiveservices=$(az cognitiveservices list --only-show-errors --query="[?kind == 'CustomVision.Training'].{id: id, name: name, rg: resourceGroup }" | jq 'sort_by(.id)' )
                    echo $cognitiveservices | jq -r '.[] | "\(.rg)/\(.name)"' | awk '{$1=++b")" FS $1}1'
                    read -p "Select a cognitive services: " -r; echo
                    case $REPLY in
                    [0-9]* )
                        selected_custom_vision_index=`expr $REPLY - 1`
                        selected_custom_vision_name=$(echo $cognitiveservices | jq -r ".[$selected_custom_vision_index].name")
                        selected_custom_vision_rg=$(echo $cognitiveservices | jq -r ".[$selected_custom_vision_index].rg")
                        break
                    ;;
                    *) echo "Please enter a number"
                    esac
                done
                current_step=`expr $current_step + 1`
                break
            ;;
            3 )
                current_step=`expr $current_step + 1`
                break
            ;;
            4 )
                current_step=`expr $current_step - 1`
                break
            ;;
            * )
                echo "Please enter a number"
            esac
        done

    ;;
    4 ) # --- service principal ---
        while true; do
            echo "Would you like to create a new service principal, or use an existing one?"
            echo "1) create a new one"
            echo "2) use an existing one"
            echo "3) use an existing one by entering name"
            echo "4) skip"
			echo "5) back to previous step"
            read -p "Your answer: " -r; echo
            create_sp_selection=$REPLY
            case $create_sp_selection in
            1 )
                while true; do
                    read -p "name: " -r; echo
                    if [ $(az ad app list --filter "displayname eq '$REPLY'" | jq length) -gt 0 ]; then
                        echo "service principal with displayName '$REPLY' already exists"
                        continue
                    fi
                    selected_sp_name=$REPLY
                    break
                done
                current_step=`expr $current_step + 1`
                break
            ;;
            2 )
                echo "listing all service principal"
                service_principal=$(az ad app list --all --query='[].{id: id, name: displayName }' | jq 'sort_by(.name)' )
                echo $service_principal | jq -r ".[].name" | awk '{$1=++b")" FS $1}1'
                while true; do
                    read -p "Select a service prinvipal: " -r; echo
                    case $REPLY in
                    [0-9]* )
                        selected_sp_index=`expr $REPLY - 1`
                        selected_sp_name=$(echo $service_principal | jq -r ".[$selected_sp_index].name")
                        break
                    ;;
                    *) echo "Please enter a number"
                    esac
                done
                current_step=`expr $current_step + 1`
                break
            ;;
            3 )
                read -p "please type your service principal name: "
                selected_sp_name=$REPLY
                if [ $(az ad app list --filter "displayname eq '$selected_sp_name'" | jq -r "length") -gt 0 ]; then
                    current_step=`expr $current_step + 1`
				    break
                else
                    echo "Service principal $selected_sp_name not exists"
                fi
            ;;
            4 )
                current_step=`expr $current_step + 1`
                break
            ;;
            5 )
                current_step=`expr $current_step - 1`
                break
            ;;
            * )
                echo "please enter a number"
            esac
        done

    ;;
    5 )
        while true; do
            echo "We need to use a KAN agent to capture camera thumbnails, which requires the use of ffmpeg. However, the default KAN agent Docker image does not include ffmpeg. Please choose:"
            echo "1) Use the default agent without camera thumbnail feature."
            echo "2) Use a community-contributed image from hbai/kan-agent:$agent_version that supports the thumbnail feature."
            read -p "Your Answer:" -r; echo
            case $REPLY in
                1 )
                    agent_image=kanprod.azurecr.io/kan-agent
                    break
                ;;
                2 )
                    agent_image=hbai/kan-agent
                    break
                ;;
                *)                
            esac
        done
        current_step=`expr $current_step + 1`        
    ;;
    6 )      
        read -p "May we collect anonymous usage data to help improve the app's performance and user experience (to turn it off, run this installer again)? (y/n)" -r; echo
        case $REPLY in
            [y]* )
                enable_app_insight=true
            ;;
            *)
                enable_app_insight=false
        esac
 
        current_step=`expr $current_step + 1`
    ;;
    7 )
        # # --- confirm ---
        echo "your selections:"
        if [ $create_aks_selection == "1" ]; then
            echo -e "aks:\t\t\t$(echo $selected_aks | jq -r '. | "\(.rg)/\(.name)"')"
        else
            echo -e "aks:\t\t\t\tUse current kubeconfig"
        fi

        if [ $create_sp_selection == 4 ]; then
            echo -e "service_principal:\t\tskip"
        else
            echo -e "service_principal:\t\t$selected_sp_name"
        fi

        if [ $create_storage_account_selection == 3 ]; then
            echo -e "storage account:\t\tskip"
            echo -e "storage account location:\tskip"
            echo -e "blob container:\t\t\tskip"
        else
            echo -e "storage account:\t\t"$selected_storage_account_rg/$selected_storage_account_name
            echo -e "storage account location:\t"$selected_storage_account_location
            echo -e "blob container:\t\t\t"$selected_blob_container_name
        fi

        if [ $create_custom_vision_selection == 3 ]; then
            echo -e "cognitive services:\t\tskip"
            echo -e "cognitive services location:\tskip"
        else
            echo -e "cognitive services:\t\t"$selected_custom_vision_rg/$selected_custom_vision_name
            echo -e "cognitive services location:\t"$selected_custom_vision_location
        fi
        echo -e "enable collect telemetry:\t$enable_app_insight"
        read -p "Are you sure (y or n)? " -r; echo
        case $REPLY in
            [Yy]* )
                if [ $create_aks_selection == "1" ]; then
                    subscription=$(echo $selected_aks | jq ".id" | awk -F/ '{print $3}')
                    az account set --subscription=$subscription
                    az aks get-credentials --resource-group $selected_aks_rg --name $selected_aks_name
                else
                    echo "use current kubeconfig"
                fi

                if [ $create_storage_account_selection == "1" ]; then
                    az storage account create --resource-group $selected_storage_account_rg --name $selected_storage_account_name --location $selected_storage_account_location
                fi

                if [ $create_storage_account_selection != "3" ]; then
                    storage_account_subscription=$(az storage account show -g $selected_storage_account_rg -n $selected_storage_account_name | jq -r .id | awk -F/ '{print $3}')
                fi

                if [ -n $create_blob_container_selection ] && [ $create_blob_container_selection == "1" ]; then
                    creation_result=$(az storage container create --account-name $selected_storage_account_name -n $selected_blob_container_name --auth-mode login | jq -r ".created" )
                    if [ $creation_result == "true" ]; then
                        echo -e "blob container create \e[32msuccessfully\e[0m"
                    else
                        echo -e "blob container create \e[31mfail\e[0m (possible in soft delete)"
                    fi
                fi

                if [ $create_custom_vision_selection == "1" ]; then
                    echo "creating custom vision"
                    az cognitiveservices account create -n $selected_custom_vision_name -g $selected_custom_vision_rg --kind CustomVision.Training --sku S0 -l $selected_custom_vision_location
                fi

 
                if [ $create_sp_selection == "1" ]; then
                    echo "creating service principal"
                    # az ad app create --display-name $selected_sp_name
                    # app_id=$(az ad app create --only-show-errors --display-name $selected_sp_name | jq -r ".appId")
                    while true; do
                        app_id=$(az ad sp create-for-rbac --only-show-errors --name $selected_sp_name | jq -r ".appId")
                        if [ -z "${app_id}" ]; then
                            echo "retrying..."
                            sleep 1
                        else
                            break
                        fi
                    done
 
                    echo $app_id
                elif [ $create_sp_selection != "4" ]; then
                    selected_service_principal=$(az ad app list --filter "displayname eq '$selected_sp_name'")
                    app_id=$(echo $selected_service_principal | jq -r ".[0].appId")
                fi
 
                if [ $create_sp_selection != "4" ]; then
                    echo "creating credential"
                    new_cred=$(az ad sp credential reset --id $app_id --append --display-name kan --only-show-errors)
                    echo $new_cred
                    sp_password=$(echo $new_cred | jq -r ".password")
                    sp_tenant=$(echo $new_cred | jq -r ".tenant")

                    echo "creating custom role"
 
 
                  subscriptionId=$(az account show --query "id" -o tsv)

                    if [ $(az role definition list --custom-role-only true --name "kan contributor $subscriptionId" | jq ". | length") -lt 1 ];
                    then
                        az role definition create --role-definition "{
                            \"Name\": \"kan contributor $subscriptionId\",
                            \"Description\": \"kan contributor $subscriptionId\",
                            \"Actions\": [
                                \"Microsoft.Devices/IotHubs/IotHubKeys/listkeys/action\",
                                \"Microsoft.Devices/iotHubs/listkeys/Action\"
                            ],
                            \"AssignableScopes\": [\"/subscriptions/$subscriptionId\"]
                        }"
                    echo "Waiting for custom role to be created..."
                    sleep 120
                    else
                        az role definition update --role-definition "{
                            \"Name\": \"kan contributor $subscriptionId\",
                            \"Description\": \"kan contributor $subscriptionId\",
                            \"Actions\": [
                                \"Microsoft.Devices/IotHubs/IotHubKeys/listkeys/action\",
                                \"Microsoft.Devices/iotHubs/listkeys/Action\"
                            ],
                            \"AssignableScopes\": [\"/subscriptions/$subscriptionId\"]
                        }"
                    fi
 

                    sleep 5

                    echo "assigning KANportal contributor role to subscription"
                    az role assignment create --role "kan contributor $subscriptionId" --assignee $app_id --scope /subscriptions/$(az account show --query "id" -o tsv)

                    echo "assigning reader role to subscription"
                    az role assignment create --role "Reader" --assignee $app_id --scope /subscriptions/$(az account show --query "id" -o tsv)

                    echo "assigning role Storage Account Contributor to storage account"
                    az role assignment create --role "Storage Account Contributor" --assignee $app_id --scope $(az storage account show -g $selected_storage_account_rg -n $selected_storage_account_name | jq -r ".id")

                    echo "assigning role Storage Blob Data Contributor to storage account"
                    az role assignment create --role "Storage Blob Data Contributor" --assignee $app_id --scope $(az storage account show -g $selected_storage_account_rg -n $selected_storage_account_name | jq -r ".id")

                    echo "assigning role IoT Hub Data Contributor to subscription"
                    az role assignment create --role "IoT Hub Data Contributor" --assignee $app_id --scope /subscriptions/$(az account show --query "id" -o tsv)
                fi

                echo -e "\e[32mInstalling ingress\e[0m"
                helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx --namespace ingress-nginx --create-namespace

                echo -e "\e[32mInstalling cert-manager\e[0m"
                kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.8.2/cert-manager.yaml
 
                echo -e "\e[32mRemoving terminating CRDs\e[0m"
                kubectl get target --no-headers=true | awk '{print $1}' | xargs kubectl patch target.fabric.kan -p '{"metadata":{"finalizers":null}}' --type=merge
                kubectl get instance --no-headers=true | awk '{print $1}' | xargs kubectl patch instance.solution.kan -p '{"metadata":{"finalizers":null}}' --type=merge

                echo -e "\e[32mInstalling kan\e[0m"
                if [ $create_custom_vision_selection == 3 ]; then
                    helm upgrade -n default --install kan oci://kanprod.azurecr.io/helm/kan --set ENABLE_APP_INSIGHT=$enable_app_insight --version $kan_version --wait
                else
                    helm upgrade -n default --install kan oci://kanprod.azurecr.io/helm/kan --set ENABLE_APP_INSIGHT=$enable_app_insight --set CUSTOM_VISION_KEY=$(az cognitiveservices account keys list -n $selected_custom_vision_name -g $selected_custom_vision_rg | jq -r ".key1") --version $kan_version --wait
                fi
 
                if [ $? != "0" ]; then
                    echo -e "\e[31mWe faced some issues while pull kan from container registry. Please try the installer again a few minutes later\e[0m"
                fi
                echo -e "\e[32mInstalling Portal\e[0m"

 
                values=""
                if [ $create_storage_account_selection != 3 ]; then
                    values="$values --set storage.storageResourceGroup=$selected_storage_account_rg --set storage.storageAccount=$selected_storage_account_name --set storage.storageContainer=$selected_blob_container_name --set storage.subscriptionId=$storage_account_subscription"
                fi
                if [ $create_custom_vision_selection != 3 ]; then
                    values="$values --set customvision.endpoint=$(az cognitiveservices account show -n $selected_custom_vision_name -g $selected_custom_vision_rg | jq -r .properties.endpoint) --set customvision.trainingKey=$(az cognitiveservices account keys list -n $selected_custom_vision_name -g $selected_custom_vision_rg | jq -r .key1)"
                fi
                if [ $create_sp_selection != 4 ]; then
                    values="$values --set servicePrincipal.tenantId=$sp_tenant --set servicePrincipal.clientId=$app_id --set servicePrincipal.clientSecret=$sp_password"
                fi

                helm upgrade -n default --install kanportal oci://kanprod.azurecr.io/helm/kanportal --version $kanportal_version $values --set image.image=kanprod.azurecr.io/kanportal --set kanAgentImage=$agent_image --set kanAgentVersion=$agent_version --set kanaiVersion=$kanai_version

                if [ $? != "0" ]; then
                    echo -e "\e[31mWe faced some issues while pull KANportal from container registry. Please try the installer again a few minutes later\e[0m"
                fi

                current_step=`expr $current_step + 1`
                break
            ;;
            * )
                current_step=`expr $current_step - 3`
        esac
    ;;
    * )
        echo "over $current_step"
        read -p "Your answer: " -r; echo
    esac
done
echo "Installation Completed"
url=$(kubectl get svc -A | grep ingress-nginx-controller | grep LoadBalancer | awk {'print $5'})
echo "The platform will be ready in few minutes at http://$url"

