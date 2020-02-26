# 本机操作 shell脚本
cd /d/self/psyDashBoard/dash/
npm run build
# scp -i C:/Users/gaojianli/.ssh/id_rsa -r /d/self/psyDashBoard/dash/dist/* root@47.75.180.129:/software/dashboard/
# scp -i C:/Users/gaojianli/.ssh/id_rsa -r /d/self/psyDashBoard/dash/dist/icons/* root@47.75.180.129:/software/dashboard/icons/
rm -rf ../distRepository/*
cp -r ./dist/* ../distRepository/

# 本机操作 windows脚本
cd \
d:
cd d:\self\psyDashBoard\distRepository\
git add .
git commit -am "feat: new version"
git push origin master

# 虚拟机操作
cd /software/dashboard
git pull origin master