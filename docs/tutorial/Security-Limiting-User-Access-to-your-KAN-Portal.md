# Security: Limiting User Access to your KAN Portal  

Once your KAN portal has been set up, it is accessible to anyone via the IP. In other words, it is open to users for whom access may not be intended. This can be a security and compliance loophole. To prevent unwanted users from accessing your portal, use one of the following approaches to limit access: 

1. Limit portal access from Azure portal to certain IPs (if using Azure Kubernetes Service (AKS)) 

2. Limit external access using ingress rules 

3. Limit external access altogether and use port-forwarding to access the portal on the spot locally 

4. Create basic login/Pass authentication using ingress basic http authentication 

5. Set up Azure API Management (APIM) and configure ingress to be only accessible via this APIM 



## Limit portal access from Azure portal to certain IPs 

   Note: This option is available only if you are using AKS. 

1. When you’ve finished installing the KAN-controller, you can find the IP address of the portal by running the following command in your Azure Cloud CLI command line: 

  ```azurecli-interactive
    kubectl get svc -A 
  ```

  Use the first LoadBalancer IP address.

2. Once you have the LoadBalancer IP address, open the resource group associated with your AKS cluster (not the AKS cluster itself). 
3. In a separate tab, open the network security (NSG) resource. 
4. For each line that references the LoadBalancer IP address: 
   * Select the inbound security rule. 
   * Change the source IP address range to the network you want to allow access to the portal. For example, your home or corporate IP address space in classless inter-    domain routing (CIDR) notation. 

 

## Limit External Access Using Ingress Rules 

Modify ingress resource “webmodule” that was automatically created during installation on your Kubernetes cluster with: [Using nginx-ingress controller to restrict access by IP](https://nam06.safelinks.protection.outlook.com/?url=https%3A%2F%2Fmedium.com%2F%40maninder.bindra%2Fusing-nginx-ingress-controller-to-restrict-access-by-ip-ip-whitelisting-for-a-service-deployed-to-bd5c86dc66d6&data=05%7C01%7Csmohanselvan%40microsoft.com%7C02ac0660e0d9411ad65e08dac281338e%7C72f988bf86f141af91ab2d7cd011db47%7C1%7C0%7C638036157433315152%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C3000%7C%7C%7C&sdata=LUZLi4W7sf1Y2Gs2iCkNOs3wwEa0VN15s2NJQpiJCPo%3D&reserved=0) (ip whitelisting) for a service deployed to a Kubernetes (AKS) cluster . Make sure to apply your changes after modifying the YAML file. 



## Limit External Access Altogether & Use Port Forwarding 

1. Delete the ingress object “webmodule” created during installation: 

  ```azurecli-interactive
  kubectl delete ingress webmodule 
  ```

2. Use Kubernetes port-forwarding to access the portal on the spot locally using the following command:  

  ```azurecli-interactive
  kubectl port-forward --address localhost service/webmodule <you-desired-port>:8000" 
  ```
  This allows you to view the portal using: 
   ```azurecli-interactive
   localhost:<you-desired-port>
   ```
   Note: Run this command on the system you would like to access the portal with. For example, if you want to use your computer to view the portal, you need to run        the command on your computer. 

  With port-forwarding, admin access to the portal does not need to be granted to everyone. Instead, you can create a configuration file with restricted access. The     following steps show you how to provide permission to update the config map (“mycm”) in a specific namespace (“myns”) to create a kubeconfig with restricted access. 

  1. Create the namespace if it doesn’t already exist. For this example, call the namespace myns. 

  ```azurecli-interactive
  kubectl create ns myns 
  ```

  2. Create a service account in the myns namespace. For this example, call the service account cm-user. This command will also create a secret token. 
  ```azurecli-interactive
  kubectl create sa cm-user -n myns 
  ```

  3. Use the following to get cm-user secrets. You need the token and ca.crt from the cm-user token. Make sure to Base64 decode the value of the token. 

  ```azurecli-interactive
  kubectl get sa cm-user -n myns 
  kubectl get secrets -n myns 
  ```


  4. Next, create a user using the decoded token: 

  ```azurecli-interactive
  kubectl config set-credentials cm-user --token=<decoded token value> 
  ```

  5. Next, generate a kubeconfig file kubeconfig-cm: 

  ```azurecli-interactive
  apiVersion: v1 

  kind: Config 

  clusters: 

  - cluster: 

      certificate-authority-data: <ca.crt value from cm-user-token-kv5j5 secret> 

      server: <kubernetes server> 

    name: <cluster> 

  contexts: 

  - context: 

      cluster:<cluster> 

      namespace: myns 

      user: cm-user 

    name: cm-user 

  current-context: cm-user  

  users: 

  - name: cm-user 

    user: 

      token: <decoded token> 

  ```

  6. Next, create a role and rolebinding for service account cm-user: 



  ```azurecli-interactive 

  apiVersion: rbac.authorization.k8s.io/v1 

  kind: Role 

  metadata: 

    namespace: myns 

    name: cm-user-role 

  rules: 

  - apiGroups: [""] 

    resources: ["configmaps"] 

    verbs: ["update", "get", "list"] 

  --- 

  apiVersion: rbac.authorization.k8s.io/v1 

  kind: RoleBinding 

  metadata: 

    name: cm-user-rb 

    namespace: myns 

  roleRef: 

    apiGroup: rbac.authorization.k8s.io 

    kind: Role 

    name: cm-user-role 

  subjects: 

  - namespace: myns 

    kind: ServiceAccount 

    name: cm-user 
  ---
  ```

  You can now use this kubeconfig file to update your configmap mycm. 


  Refer to the following docs for more information: 

  * [Use Port Forwarding to Access Applications in a Cluster](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)  

  * [Create kubeconfig with restricted permission - Stack Overflow](https://stackoverflow.com/questions/62301039/create-kubeconfig-with-restricted-permission)  

  * [Configure Access to Multiple Clusters](https://kubernetes.io/docs/tasks/access-application-cluster/configure-access-multiple-clusters/) 

  * [Organizing Cluster Access Using kubeconfig Files](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)  


   
## Create Basic Login/Pass Authentication Using Ingress Basic Http Authentication 

For more information on how to add a basic-authentication secret to the ingress automatically created in your K8s environment called "webmodule", visit Basic Authentication.  

1. Create htpasswd file 
```azurecli-interactive 
htpasswd -c auth foo 
```

2. Convert htpasswd into a secret 
```azurecli-interactive 
kubectl create secret generic basic-auth --from-file=auth 
```

3. Examine secret 
```azurecli-interactive 
kubectl get secret basic-auth -o yaml 
```

4. Modify your ingress and tie to the basic-auth secret then use kubectl to apply the changes 

  Use curl to confirm authorization is required by the ingress 
  ```azurecli-interactive 
  curl -v http://10.2.29.4/ -H 'Host: foo.bar.com' 
  ```
  
  Use curl with the correct credentials to connect to the ingress 
  ```azurecli-interactive 
  curl -v http://10.2.29.4/ -H 'Host: foo.bar.com' -u 'foo:bar' 
  ```
 

   
## Set Up and Manage Authentication with Azure API Management (APIM) 

Install an API Management gateway and add your KAN endpoint as a backend target. APIM is integrated with other Azure services such as Azure Active Directory (AAD). The use of AAD as an identity provider will now be enabled for user sign in on the developer portal. 

1. [Create an Azure API Management Instance: Quickstart - Create an Azure API Management instance](https://learn.microsoft.com/en-us/azure/api-management/vscode-create-service-instance) 

2. [Import and publish an API in the Azure API Management instance: Tutorial - Import and publish your first API in Azure API Management](https://learn.microsoft.com/en-us/azure/api-management/import-and-publish) 

3. Authentication and managing user accounts 
   * [How to manage user accounts in Azure API Management](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-create-or-invite-developers) 
   * [Authorize access to API Management developer portal by using Azure AD - Azure API Management](https://learn.microsoft.com/en-us/azure/api-management/api-management-howto-aad?WT.mc_id=Portal-fx) 

For more information on authentication and authorization with Azure API Management, visit: [Authentication and authorization - Overview - Azure API Management](https://learn.microsoft.com/en-us/azure/api-management/authentication-authorization-overview). 

   
   
## Deciding between access options 

1. For a quick and simple option, try one of the following: 
  a. Limit portal access directly from the Azure portal to certain IPs (AKS only) 
  b. Limit external access using ingress rules 
2. Use port forwarding if you want to allow multiple members to access the portal without providing admin access to everyone 
3. Use Basic Authentication with NGINX Ingress Controller if you want to a user to create their own user/password and tie it to the ingress which controls access to the portal 
4. Set up Azure API Management (APIM) if you want the most thorough security. You can use Azure Active Directory with this option. This is the most time-consuming option to set up and there is some cost associated with it 

 

 
