# Changelog

这个项目的所有显著变化都将被记录在这个文件中。

## [0.6.5] - 2018-07-20

### 修改

- 紧急修复当更新菜单多语言时，sql 错误。

## [0.6.4] - 2018-07-19

### 新增

- 菜单初始化添加可选参数，通过`-a or --attrs` 或者添加环境变量`UP_ATTRS` 在初始化时指定更新菜单`sort` 和`parent_id` 字段。
- 菜单初始化添加可选参数，通过`-d or --delete` 或者添加环境变量`ENABLE_DELETE` 在初始化时指定删除菜单，对应要删除的菜单或目录需要添加`delete: true`。

### 修改

- 修改菜单初始化数据库中`getopt` 为`argparse`，用户现在可以通过`python choerodon-front-boot/structure/sql.py -h` 来获取帮助信息。

## [0.6.3] - 2018-07-06

### 修改

- 升级组件库choerodon-ui@0.3.3、 mobx@5.0.3、 mobx-react@5.2.3。
- 当没有在组织分配角色而在组织下的项目分配角色，且该组织下被分配了角色的项目都停用后，该组织不可见。
- css 样式打包时加哈希值。
- 登出调用oauth/logout接口。

### 修复

- 修复关闭head没有清空搜索条件的问题。
- 修复切换组织/项目时，菜单没有自动刷新的问题。
- 修复停用项目后没有清空被停项目的选中状的问题。

## [0.6.2] - 2018-06-29

### 新增

- 增加文件服务配置属性fileServer
- 增加注入环境变量配置属性enterPoints函数

### 修改

- 完善部分多语言文案。
- 菜单栏重构

### 修复

- 修复Action控件图标不为黑色的问题
- 修复head的图标与文字不对齐且hover颜色不为3f51b5的问题

## [0.6.1] - 2018-06-08

### 新增

- boot 组件化，迁移至npmjs。
- 新增端口配置，默认9090。
- 新增403页面，Page组件增加service属性，功能同Permission，无权限时显示403页面。

### 修改

- 部分组件样式调整。

### 修复

- 修复Permission和Action组件有时无法正常工作的问题。

### 移除

- 清理冗余组件和代码。
- 废弃webpack alias组件，组件依赖使用npm库的方式。

