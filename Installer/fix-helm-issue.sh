if [ ! -d linux-amd64 ]
then
  # to download helm, you only need to do it once
  wget https://get.helm.sh/helm-v3.9.3-linux-amd64.tar.gz
  tar zxvf helm-v3.9.3-linux-amd64.tar.gz
fi

# to set the new helm in path, you need to do this when ever a new cloud shell terminal is launched
export PATH=$HOME/linux-amd64:$PATH
