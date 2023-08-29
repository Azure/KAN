# SYMPHONY Portal Installation Script

This installer, ```symphony-installer.sh```, provides one-liner experience for a new user to bootstrap SYMPHONY Portal onto their own environment. To serve this script from your own public branch, you should make sure all version numbers at the beginning of the script are updated to appropriate version numbers you want to support:

```bash
symphony_version=0.41.44             # SYMPHONY API Helm Chart version
agent_version=0.41.44           # SYMPHONY Agent version
symphonyportal_version=0.41.46-amd64 # SYMPHONY Portal version
symphonyai_version=0.41.46           # SYMPHONY AI container version
```