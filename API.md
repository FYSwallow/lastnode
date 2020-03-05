### 1、管理员登录

#### 请求URL：
```
localhost:3000/admin/login
```

#### 示例：


#### 请求方式：
```
POST
```

#### 参数类型：query

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|
|user_name      |Y       |string   | 用户名 |
|password      |Y       |string  | 密码 |


#### 返回示例：

```javascript

{
  status: 1,
  success: '登录成功'
}
```


### 2、管理员注册

#### 请求URL：
```
localhost:3000/admin/register
```

#### 示例：


#### 请求方式：
```
POST
```

#### 参数类型：query

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|
|user_name      |Y       |string   | 用户名 |
|password      |Y       |string  | 密码 |
|status |N        |      number| 权限|

#### 返回示例：

```javascript

{
  status: 1,
  message: '注册管理员成功',
}
```