#!/bin/bash

# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

symphony_version=0.48.6                 #Symphony Helm Chart version
agent_version=0.48.4                    #Symphony Agent version
kanportal_version=0.47.4-dev.2-amd64    #Kanportal Helm Chart version
kanai_version=0.45.2                    #KanAI container version
symphony_cr=oci://ghcr.io/eclipse-symphony/helm/symphony #Symphony Helm Chart
symphony_ns=symphony-k8s-system         #Symphony namespace

current_step=0 
echo
echo -e "*******************"
echo -e "* Welcome to \033[0;36mKAN\033[0m! *"
echo -e "*******************"
echo 

BACKGROUND_PROGRESS_ID=0

start_progress_animation() {
    local prompt="$1"
    tput civis
    
    {
        while :; do
            for s in ⣾ ⣽ ⣻ ⢿ ⡿ ⣟ ⣯ ⣷; do
                echo -ne "  \r\033[0;94m${prompt}\033[0m \033[0;93m$s\033[0m"
                sleep 0.1
            done
        done
    } &

    BACKGROUND_PROGRESS_ID=$!
}

stop_progress_animation() {
    if [[ $BACKGROUND_PROGRESS_ID -ne 0 ]]; then
        kill $BACKGROUND_PROGRESS_ID > /dev/null 2>&1
        echo -ne "\r\033[K"
        tput cnorm
        BACKGROUND_PROGRESS_ID=0
    fi
}

display_error_message() {
    local message="$1"
    local red='\033[0;31m'
    local no_color='\033[0m'
    local exclamation='❗'
    echo -e "${red}${exclamation} ERROR: ${message}${no_color}"
}

while [ $current_step -lt 9 ]; do
    case $current_step in
    0 ) # azure user
        while true; do
            read -p "Use Azure services? (y/n): " -r; echo
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
                read -p "KAN will be installed on current kubeconfig context: (y/n) " -r; echo
                case $REPLY in
                [Yy]* )
                    create_aks_selection=2
                    create_storage_account_selection=3
                    create_blob_container_selection=4
                    create_custom_vision_selection=3
                    create_sp_selection=4
                    current_step=6
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
        echo "Would you like to use an existing AKS cluster or use the current kubeconfig?"
        echo -e "  \033[0;33m1)\033[0m Use an existing AKS cluster"
        echo -e "  \033[0;33m2)\033[0m Use current kubeconfig"

        while true; do
            read -p "Your choice: " -r; echo
            create_aks_selection=$REPLY
            case $create_aks_selection in
            1 )
                start_progress_animation "listing AKS clusters..."
                aks=$(az resource list --resource-type='Microsoft.ContainerService/ManagedClusters' --query='[].{name: name, rg: resourceGroup, id: id }')
                stop_progress_animation
                echo "Select an AKS cluster:"
                echo $aks | jq -r '.[] | "\(.rg)/\(.name)"' | awk '{$1="  \033[0;33m" ++b")\033[0m" FS $1}1'
                while true; do
                    read -p "Your choice: " -r; echo
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
                        echo "Would you like to create a new storage account or use an existing one?"
                        echo -e "  \033[0;33m1)\033[0m  Create a new one"
                        echo -e "  \033[0;33m2)\033[0m  Use an existing one"
                        echo -e "  \033[0;33m3)\033[0m  Skip"
                        echo -e "  \033[0;33m4)\033[0m  Back to previous step"
                        read -p "Your choice: " -r; echo
                        create_storage_account_selection=$REPLY
                        case $create_storage_account_selection in
                        1 )
                            while true; do
                                start_progress_animation "listing resource groups..."
                                rgs=$(az group list --query='[].{name: name }' | jq 'sort_by(.name)')
                                stop_progress_animation
                                echo "Select a resource group:"
                                echo $rgs | jq -r ".[].name" | awk '{$1="  \033[0;33m" ++b")\033[0m" FS $1}1'
                                while true; do
                                    read -p "Your choice: " -r; echo
                                    case $REPLY in
                                    [0-9]* )
                                        selected_rg_index=`expr $REPLY - 1`
                                        selected_storage_account_rg=$(echo $rgs | jq -r ".[$selected_rg_index].name")
                                        break
                                        ;;
                                    *) display_error_message "Please enter a number"
                                    esac
                                done

                                while true; do
                                    read -p "Storage account name: " -r; echo
                                    selected_storage_account_name=$REPLY
                                    result=$(az storage account check-name --name $selected_storage_account_name)
                                    if [ $(echo $result | jq -r .nameAvailable) == "true" ]; then
                                        break
                                    else
                                        echo $result | jq -r .message
                                    fi
                                done

                                read -p "Enter a location [$(az group show -g $selected_storage_account_rg --query="location" -o tsv)]:" -r; echo
                                selected_storage_account_location=${REPLY:-$(az group show -g $selected_storage_account_rg --query="location" -o tsv)}
                                echo $selected_storage_account_location
                                break
                            done
                            current_step=3
                            current_storage_step=3
                            create_blob_container_selection=1
                            selected_blob_container_name="kan"
                            break
                            ;;
                        2 )
                            start_progress_animation "listing storage accounts..."                            
                            storage_account=$(az storage account list --query='[].{name: name, rg: resourceGroup, id: id }' | jq 'sort_by(.id)')
                            stop_progress_animation
                            echo "Select a storage account:"                            
                            echo $storage_account | jq -r '.[] | "\(.rg)/\(.name)"' | awk '{$1="  \033[0;33m" ++b ")\033[0m" FS $1}1'
                            while true; do
                                read -p "Your choice: " -r; echo
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
                        *) display_error_message "Please enter a number"
                        esac
                    done
                ;;
                2 )
                    if [ $create_storage_account_selection == "1" ]; then
                        create_blob_container_selection=1
                        selected_blob_container_name="clips"
                    else
                        while true; do
                            echo "Would you like to create a new blob container or use an existing one?"
                            echo -e "\033[0;94mIn order to perform this operation, please make sure you have a Storage contributor role on your subscription\033[0m"
                            echo -e "  \033[0;33m1)\033[0m  Create a new one"
                            echo -e "  \033[0;33m2)\033[0m  Use an existing one"
                            echo -e "  \033[0;33m3)\033[0m  Back to previous step"
                            read -p "Your choice: " -r; echo
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
                                start_progress_animation "listing blob containers..."                            
                                blob_containers=$(az storage container list --account-name $selected_storage_account_name --auth-mode login --query='[].{name: name }' | jq 'sort_by(.name)')
                                stop_progress_animation
                                echo "Select a blob container:"                                
                                if [ $(echo $blob_containers | jq "length") == "0" ]; then
                                    echo "no container found"
                                    continue
                                fi
                                echo $blob_containers | jq -r '.[].name' | awk '{$1="  \033[0;33m" ++b ")\033[0m" FS $1}1'
                                while true; do
                                    read -p "Your choice: " -r; echo
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
                            * ) display_error_message "Please enter a number"
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
            echo "Would you like to create a new Azure Custom Vision service or use an existing one?"
            echo  -e "  \033[0;33m1)\033[0m  Create a new one"
            echo  -e "  \033[0;33m2)\033[0m  Use an existing one"
            echo  -e "  \033[0;33m3)\033[0m  Skip"
            echo  -e "  \033[0;33m4)\033[0m  Back to previous step"
            read -p "Your choice: " -r; echo
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
                    *) display_error_message "Please enter a number"
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
                    display_error_message "This name is already taken"
                fi
            ;;
            2 )
                while true; do
                    start_progress_animation "listing all Cognitive Services..."                            
                    cognitiveservices=$(az cognitiveservices list --only-show-errors --query="[?kind == 'CustomVision.Training'].{id: id, name: name, rg: resourceGroup }" | jq 'sort_by(.id)' )
                    stop_progress_animation                    
                    echo "Select a Cognitive Service:"
                    echo $cognitiveservices | jq -r '.[] | "\(.rg)/\(.name)"' | awk '{$1="  \033[0;33m" ++b")\033[0m" FS $1}1'
                    read -p "Your choice: " -r; echo
                    case $REPLY in
                    [0-9]* )
                        selected_custom_vision_index=`expr $REPLY - 1`
                        selected_custom_vision_name=$(echo $cognitiveservices | jq -r ".[$selected_custom_vision_index].name")
                        selected_custom_vision_rg=$(echo $cognitiveservices | jq -r ".[$selected_custom_vision_index].rg")
                        break
                    ;;
                    *) display_error_message "Please enter a number"
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
                display_error_message "Please enter a number"
            esac
        done

    ;;
    4 ) # --- service principal ---
        while true; do
            echo "Would you like to create a new service principal or use an existing one?"
            echo  -e "  \033[0;33m1)\033[0m Create a new one"
            echo  -e "  \033[0;33m2)\033[0m Use an existing one"
            echo  -e "  \033[0;33m3)\033[0m Use an existing one by entering name"
            echo  -e "  \033[0;33m4)\033[0m Skip"
			echo  -e "  \033[0;33m5)\033[0m Back to previous step"
            read -p "Your choice: " -r; echo
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
                    *) display_error_message "Please enter a number"
                    esac
                done
                current_step=`expr $current_step + 1`
                break
            ;;
            3 )
                read -p "Please type your service principal name: "
                selected_sp_name=$REPLY
                if [ $(az ad app list --filter "displayname eq '$selected_sp_name'" | jq -r "length") -gt 0 ]; then
                    current_step=`expr $current_step + 1`
				    break
                else
                    display_error_message "Service principal $selected_sp_name not exists"
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
                display_error_message "please enter a number"
            esac
        done

    ;;
    5 ) while true; do
            read -p "Use a custom role? (y/n): " -r; echo
            case $REPLY in
                [Yy]* )
                    role_assignment=1
                    break
                ;;
                [Nn]* )
                    role_assignment=0
                    break
                ;;
                *)
            esac
        done
        current_step=`expr $current_step + 1` 
    ;;
    6 )
        while true; do
            echo "Choose Symphony agent image:"
            echo -e "\033[0;94mWe need to use a Symphony agent to capture camera thumbnails, which requires the use of ffmpeg. However, the default Symphony agent Docker image does not include ffmpeg.\033[0m"            
            echo -e "  \033[0;33m1)\033[0m Use the default agent without camera thumbnail feature."
            echo -e "  \033[0;33m2)\033[0m Use a community-contributed image from hbai/symphony-agent:$agent_version that supports the thumbnail feature."
            read -p "Your choice:" -r; echo
            case $REPLY in
                1 )
                    agent_image=ghcr.io/eclipse-symphony/symphony-agent
                    break
                ;;
                2 )
                    agent_image=hbai/symphony-agent
                    break
                ;;
                *)                
            esac
        done
        current_step=`expr $current_step + 1`        
    ;;
    7 )      
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
    8 )
        # # --- confirm ---
        echo "Your selections:"
        if [ $create_aks_selection == "1" ]; then
            echo -e "  \033[0;94mAKS:\033[0m\t\t\t$(echo $selected_aks | jq -r '. | "\(.rg)/\(.name)"')"
        else
            echo -e "  \033[0;94mAKS:\033[0m\t\t\t\tUse current kubeconfig"
        fi

        if [ $create_sp_selection == 4 ]; then
            echo -e "  \033[0;94mService principal:\033[0m\t\tskip"
        else
            echo -e "  \033[0;94mService principal:\033[0m\t\t$selected_sp_name"
        fi

        if [ $create_storage_account_selection == 3 ]; then
            echo -e "  \033[0;94mStorage account:\033[0m\t\tskip"
            echo -e "  \033[0;94mStorage account location:\033[0m\tskip"
            echo -e "  \033[0;94mBlob container:\033[0m\t\tskip"
        else
            echo -e "  \033[0;94mStorage account:\033[0m\t\t"$selected_storage_account_rg/$selected_storage_account_name
            echo -e "  \033[0;94mStorage account location:\033[0m\t"$selected_storage_account_location
            echo -e "  \033[0;94mBlob container:\033[0m\t\t"$selected_blob_container_name
        fi

        if [ $create_custom_vision_selection == 3 ]; then
            echo -e "  \033[0;94mCognitive services:\033[0m\t\tskip"
            echo -e "  \033[0;94mCognitive services location:\033[0m\tskip"
        else
            echo -e "  \033[0;94mCognitive services:\033[0m\t\t"$selected_custom_vision_rg/$selected_custom_vision_name
            echo -e "  \033[0;94mCognitive services location:\033[0m\t"$selected_custom_vision_location
        fi
        echo -e "  \033[0;94mEnable collect telemetry:\033[0m\t$enable_app_insight"
        read -p "Are you sure (y or n)? " -r; echo
        case $REPLY in
            [Yy]* )
                if [ $create_aks_selection == "1" ]; then
                    subscription=$(echo $selected_aks | jq ".id" | awk -F/ '{print $3}')
                    az account set --subscription=$subscription
                    az aks get-credentials --resource-group $selected_aks_rg --name $selected_aks_name
                else
                    echo -e "  \033[0;94mUsing current kubeconfig\033[0m"
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
                    echo -e "  \033[0;94mCreating service principal\033[0m"
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
                    echo -e "  \033[0;94mRetrieving credential\033[0m"
                    new_cred=$(az ad sp credential reset --id $app_id --append --display-name symphony --only-show-errors)
                    # echo $new_cred
                    sp_password=$(echo $new_cred | jq -r ".password")
                    sp_tenant=$(echo $new_cred | jq -r ".tenant")

                   if [ -z "$sp_password" ] || [ -z "$sp_tenant" ]; then
                        display_error_message "Failed to retrieve secret. Please enter the secret manually."

                        read -p "Please enter password for $selected_sp_name: " sp_password
                        read -p "Please enter tenant for $selected_sp_name: " sp_tenant
                    fi

                    subscriptionId=$(az account show --query "id" -o tsv)
                    if [ $role_assignment == 1 ]; then
                        echo "creating custom role"
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

                        echo -e "  \033[0;94mAssigning Kanportal contributor role to subscription\033[0m"
                        az role assignment create --role "kan contributor $subscriptionId" --assignee $app_id --scope /subscriptions/$(az account show --query "id" -o tsv)
                    else 
                        echo -e "  \033[0;94mAssigning reader role to subscription\033[0m"                        
                        az role assignment create --role "Reader" --assignee $app_id --scope /subscriptions/$(az account show --query "id" -o tsv)

                        echo -e "  \033[0;94mAssigning role Storage Account Contributor to storage account\033[0m"
                        az role assignment create --role "Storage Account Contributor" --assignee $app_id --scope $(az storage account show -g $selected_storage_account_rg -n $selected_storage_account_name | jq -r ".id")

                        echo -e "  \033[0;94mAssigning role Storage Blob Data Contributor to storage account\033[0m"
                        az role assignment create --role "Storage Blob Data Contributor" --assignee $app_id --scope $(az storage account show -g $selected_storage_account_rg -n $selected_storage_account_name | jq -r ".id")

                        echo -e "  \033[0;94mAssigning role IoT Hub Data Contributor to subscription\033[0m"
                        az role assignment create --role "IoT Hub Data Contributor" --assignee $app_id --scope /subscriptions/$(az account show --query "id" -o tsv)
                    
                        echo -e "  \033[0;94mAssigning contributor role to subscription\033[0m"
                        az role assignment create --role "Contributor" --assignee $app_id --scope /subscriptions/$(az account show --query "id" -o tsv)
                    fi
                fi

                echo -e "  \033[0;94mInstalling ingress\e[0m"
                helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx --namespace ingress-nginx --create-namespace

                echo -e "  \033[0;94mInstalling cert-manager\e[0m"
                kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.8.2/cert-manager.yaml
 
                echo -e "  \033[0;94mRemoving terminating CRDs\e[0m"
                kubectl get target --no-headers=true | awk '{print $1}' | xargs kubectl patch target.fabric.symphony -p '{"metadata":{"finalizers":null}}' --type=merge
                kubectl get instance --no-headers=true | awk '{print $1}' | xargs kubectl patch instance.solution.symphony -p '{"metadata":{"finalizers":null}}' --type=merge

                echo -e "  \033[0;94mInstalling Symphony\e[0m"
                if [ $create_custom_vision_selection == 3 ]; then
                    helm upgrade --install symphony $symphony_cr --set ENABLE_APP_INSIGHT=$enable_app_insight --namespace $symphony_ns --version $symphony_version --create-namespace --wait
                else
                    helm upgrade --install symphony $symphony_cr --set ENABLE_APP_INSIGHT=$enable_app_insight --set CUSTOM_VISION_KEY=$(az cognitiveservices account keys list -n $selected_custom_vision_name -g $selected_custom_vision_rg | jq -r ".key1") --namespace $symphony_ns --version $symphony_version --create-namespace --wait
                fi
 
                if [ $? != "0" ]; then
                    echo -e "\e[31mWe faced some issues while pull symphony from container registry. Please try the installer again a few minutes later\e[0m"
                fi
                echo -e "  \033[0;94mInstalling Portal\e[0m"

 
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

                # wait for ingress service ready
                while true; do
                    portalIp=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
                    if [[ $portalIp != "" ]]; then
                        break
                    fi
                    sleep 3                
                done

                # wait for SYMPHONY service ready
                # while true; do
                #    symphonyIp=$(kubectl get svc -n $symphony_ns symphony-service-ext -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
                #    if [[ $symphonyIp != "" ]]; then
                #        break
                #    fi
                #    sleep 3                
                #done

                symphonyIp="symphony-service"

                if [ "$symphony_ns" != "default" ]; then
                      symphonyIp="$symphonyIp.$symphony_ns"
                fi

                helm upgrade --install -n default kanportal oci://kanprod.azurecr.io/helm/kanportal --version $kanportal_version $values --set image.image=kanprod.azurecr.io/kanportal --set symphonyAgentImage=$agent_image --set symphonyAgentVersion=$agent_version --set kanaiVersion=$kanai_version --set kanportal.portalIp=$portalIp --set kanportal.symphonyIp=$symphonyIp

                if [ $? != "0" ]; then
                    echo -e "\e[31mWe faced some issues while pull Kanportal from container registry. Please try the installer again a few minutes later\e[0m"
                fi

                current_step=`expr $current_step + 1`
                break
            ;;
            * )
                current_step=`expr $current_step - 4`
        esac
    ;;
    * )
        echo "over $current_step"
        read -p "Your choice: " -r; echo
    esac
done
echo -e "  \033[0;32m🎉 Installation Completed!!\033[0m"
url=$(kubectl get svc -A | grep ingress-nginx-controller | grep LoadBalancer | awk {'print $5'})
echo -e "  \033[0;94mThe platform will be ready in few minutes at http://$url\e[0m"

