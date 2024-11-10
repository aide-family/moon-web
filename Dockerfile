# 使用官方Node.js镜像作为基础镜像
FROM node:18 AS webBuilder

# 设置工作目录
WORKDIR /usr/src/app

# 将前端应用程序代码复制到容器中
COPY . .

RUN rm -rf node_modules

# 设置npm源
RUN npm config set registry https://registry.npmmirror.com/

# 安装依赖
# RUN npm install
RUN yarn

# 编译前端应用程序
# RUN npm run build
RUN yarn build

# 基于nginx镜像构建最终镜像
FROM nginx:latest

# 将编译后的前端应用程序复制到nginx的默认目录下
COPY --from=webBuilder /usr/src/app/dist /usr/share/nginx/html
COPY --from=webBuilder /usr/src/app/default.conf /etc/nginx/conf.d/default.conf
COPY --from=webBuilder /usr/src/app/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]


