# 下载 http://cdn.dujuncheng.com/nana-notebook-0.0.2.dmg

可以配合小程序复习
![](http://cdn.dujuncheng.com/%E5%B0%8F%E7%A8%8B%E5%BA%8F%E7%A0%81.png)

# 不忘笔记

不忘笔记不仅仅是一个华丽的笔记软件，更是个人的知识管理系统

大脑是用来思考的，提醒的功能应该交给工具。

在毕业之后，我每天都在学习大量的知识，然而新学习的知识，都会以成倍的加速度遗忘，以至于每次去看之前整理的笔记，脑海中竟然没有一点印象。

我试用了市面上所有的笔记软件——印象笔记、为知笔记、蚂蚁笔记、typora、mweb、 markText……，也尝试了app store 中所有日程提醒工具——滴答日程、onmifocus、things。发现真正符合自身需求的工具很少，我才明白，我需要的不是一个普通的笔记本，也不是一个简单的todoList，而是**个人知识管理系统**。

- 应该足够的聪明，知晓您的知识结构，会根据艾宾浩斯记忆曲线在我遗忘某一知识点时，**提醒你进行复习**
- 可以**分析我的笔记之间隐藏的关系网**，当我在笔记中敲出 “*node中event_loop*” 时，会提醒我曾经有整理过该知识点，从而让我方便的与大脑中旧的知识体系相整合
- 相当于**柳比耶夫工作法**中的记录本，可以忠诚的记录，每天、每周、每月我用于吸收新知识的时间，最近一个阶段是否疏于提升自己。而不是当写总结时，发现自己这段时间仿佛什么都没有干
- 可以方便的**捕捉我脑海中那一闪而过的灵感**
- 可以万无一失的备份你的笔记

任何一款软件都是开发者为了解决某一个问题的尝试，`不忘笔记`就是这种尝试的一种解决方案。

# 技术架构

整体架构采用 node + electron 进行开发，尝试用javascript开发全部功能。

- 后端采用 Koa + mysql + redis
- 前端采用 electron + vue



#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit & end-to-end tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

```

# 版本迭代

不忘笔记 正式立项于 2018年9月16日，

# 0.0.1版本

1. 实现简易的mac版本的桌面客户端
2. 实现对本地文件的内容的监听
3. 实现后端数据库的存储
4. 实现桌面客户端根据艾宾浩斯记忆曲线进行通知。
5. 购买阿里云和域名（dujuncheng.com）, 并且部署到阿里云




## 0.0.2 版本

1. 加入eslint 代码规范，灵活的控制某一项的开关，并且git commit强制检测代码
2. 实现pc端的网页版（只能是预览，不能监听本地文件的变化【待研究】）
3. 桌面客户端
4. 断网情况下，本地缓存，和后端的数据同步
5. 右侧 content-container 支持 markDown 语法渲染
6. 软件启动后，需要检测所有的文本内容是否和数据库中的相符

至此，不忘笔记的雏形如下：
![](https://ws2.sinaimg.cn/large/006tNbRwgy1fvco93xxzjj31js0wqgr2.jpg)


但是此时我发现，我不仅仅需要一款提醒的工具，我还需要一个优雅的markdown的编写工具，于是，我又重新设计了不忘笔记的功能, 如下图所示：

![](https://ws1.sinaimg.cn/large/006tNc79ly1fz0q7gq6bbj31pi0u0mxq.jpg)

 

# 更新日志

- 2018-12-20
自己设计了一张设计稿，换了新的ui界面，更加清爽自然
![](https://ws3.sinaimg.cn/large/006tNc79ly1fz0qh1i1e8j31020jkgmw.jpg)

- 2019-1-9 
深夜突然意识到保存和更新笔记写的有点问题，于是重新设计了一下逻辑，保证了在断网情况下的高可用性
![](https://ws4.sinaimg.cn/large/006tNc79ly1fz0q8nws39j31hc0u0n1k.jpg)

- 2020-1-12
[fix] 更新了muya 框架的版本，修复了偶现的bug

