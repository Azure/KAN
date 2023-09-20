# KAN Portal Installation Script

This installer, ```kan-installer.sh```, provides one-liner experience for a new user to bootstrap KAN Portal onto their own environment. To serve this script from your own public branch, you should make sure all version numbers at the beginning of the script are updated to appropriate version numbers you want to support:

```bash
symphony_version=0.41.44             # SYMPHONY API Helm Chart version
agent_version=0.41.44           # SYMPHONY Agent version
kanportal_version=0.41.46-amd64 # KAN Portal version
kanai_version=0.41.46           # KAN AI container version
```