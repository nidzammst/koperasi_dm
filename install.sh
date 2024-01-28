apt-get update && apt-get upgrade
cd ~/
git clone https://github.com/nvm-sh/nvm.git .nvm
cd ~/.nvm
. ./nvm.sh
nvm install node
cd /cloudclusters/demo
rm -r *
git clone https://github.com/nidzammst/koperasi_dm/
mv koperasi_dm/* .
rm -rf koperasi_dm
