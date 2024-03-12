# KAN Portal Installation Script

This installer, ```kan-installer.sh```, provides one-liner experience for a new user to bootstrap KAN Portal onto their own environment. To serve this script from your own public branch, you should make sure all version numbers at the beginning of the script are updated to appropriate version numbers you want to support:

```bash
symphony_version=0.48.6                 #Symphony Helm Chart version
agent_version=0.48.4                    #Symphony Agent version
kanportal_version=0.47.4-dev.2-amd64    #Kanportal Helm Chart version
kanai_version=0.45.2                    #KanAI container version
symphony_cr=oci://ghcr.io/eclipse-symphony/helm/symphony #Symphony Helm Chart
symphony_ns=symphony-k8s-system         #Symphony namespace
```