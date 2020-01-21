## Admin后台接口

### 1、管理员登录

#### 请求url
```
https://elm.cangdu.org/admin/login
```

#### 示例:

#### 请求方式:
```
POST
```

#### 参数类型: query

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

### 2、管理员退出登录

#### 请求URL：
```
https://elm.cangdu.org/admin/singout
```

#### 示例：


#### 请求方式：
```
GET
```

#### 参数类型：

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|



#### 返回示例：

```javascript

{
  status: 1,
  success: '退出成功'
}
```
### 3、管理员列表

#### 请求URL：
```
https://elm.cangdu.org/admin/all
```

#### 示例：
[https://elm.cangdu.org/admin/all?offset=0&limit=20](https://elm.cangdu.org/admin/all?offset=0&limit=20)

#### 请求方式：
```
GET
```

#### 参数类型：query

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|
|limit      |Y       |int | 获取数据数量，默认 20 |
|offset      |Y       |int | 跳过数据条数 默认 0 |



#### 返回示例：

```javascript

{
  status: 1,
  data: [
    {
      user_name: "s",
      id: 14,
      create_time: "2017-05-29 21:23",
      status: 1,
      city: "北京",
      __v: 0,
      avatar: "default.jpg",
      admin: "管理员"
    },
  ]
}
```

### 4、获取当前详细定位

#### 请求URL:  
```
https://elm.cangdu.org/v1/exactaddress
```

#### 示例：
 [https://elm.cangdu.org/v1/exactaddress](https://elm.cangdu.org/v1/exactaddress)

#### 请求方式: 
```
GET
```

#### 参数类型：query

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|

#### 返回示例：

```javascript
{
    "latitude": 31.11325,
    "longitude": 121.38206,
    "address": "上海市闵行区沪闵路6258号"
}
```


### 5、获取用户列表

#### 请求URL：
```
https://elm.cangdu.org/users/all
```

#### 示例：
[https://elm.cangdu.org/users/all?offset=0&limit=20](https://elm.cangdu.org/v1/users/list?offset=0&limit=20)

#### 请求方式：
```
GET
```

#### 参数类型：query

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|
|limit      |Y       |int | 获取数据数量，默认 20 |
|offset      |Y       |int | 跳过数据条数 默认 0 |


#### 返回示例：

```javascript
[
  {
    username: "ddfdsf",
    user_id: 2,
    id: 2,
    city: "北京",
    registe_time: "2017-05-29 21:46",
    column_desc: {
      gift_mall_desc: "0元好物在这里",
      game_link: "https://gamecenter.faas.ele.me",
      game_is_show: 1,
      game_image_hash: "05f108ca4e0c543488799f0c7c708cb1jpeg",
      game_desc: "玩游戏领红包"
    },
    point: 0,
    mobile: "",
    is_mobile_valid: true,
    is_email_valid: false,
    is_active: 1,
    gift_amount: 3,
    email: "",
    delivery_card_expire_days: 0,
    current_invoice_id: 0,
    current_address_id: 0,
    brand_member_new: 0,
    balance: 0,
    avatar: "default.jpg",
    __v: 0
  },
  ...
]
```

### 6、添加食品种类

#### 请求URL：
```
https://elm.cangdu.org/shopping/addcategory
```

#### 示例：


#### 请求方式：
```
POST
```

#### 参数类型：query

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|
|name      |Y       |string   | 种类 |
|description      |Y       |string   | 描述 |
|restaurant_id      |Y       |int   | 餐馆id |

#### 返回示例：

```javascript
{
  status: 1,
  sussess: '添加食品种类成功',
}
```

### 7、添加食品






## 前台接口

### 1、获取所有用户列表

### 2、用户登录

#### 请求URL：
```
https://elm.cangdu.org/users/login
```

#### 示例：


#### 请求方式：
```
POST
```

#### 参数类型：

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|
|username      |Y       |string   | 用户名 |
|password      |Y       |string  | 密码 |
|captcha_code      |Y       |string   | 验证码 |



#### 返回示例：

```javascript

{
  username: "1",
  user_id: 2,
  id: 2,
  point: 0,
  mobile: "",
  is_mobile_valid: true,
  is_email_valid: false,
  is_active: 1,
  gift_amount: 3,
  email: "",
  delivery_card_expire_days: 0,
  current_invoice_id: 0,
  current_address_id: 0,
  brand_member_new: 0,
  balance: 0,
  avatar: "/img/default/default.jpg",
  __v: 0
}
```

### 3、退出

### 4、获取验证码

#### 请求URL：
```
https://elm.cangdu.org/users/captchas
```

#### 示例：


#### 请求方式：
```
POST
```

#### 参数类型：

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|


#### 返回示例：

```javascript

{
  status: 1,
  code: base64
}
```




### 5、获取商铺列表

#### 请求URL：
```
https://elm.cangdu.org/shopping/restaurants
```

#### 示例：
[https://elm.cangdu.org/shopping/restaurants?latitude=31.22967&longitude=121.4762](https://elm.cangdu.org/shopping/restaurants?latitude=31.22967&longitude=121.4762)

#### 请求方式：
```
GET
```

#### 参数类型：query

|参数|是否必选|类型|说明|
|:-----|:-------:|:-----|:-----|
|latitude      |Y       |string  |纬度|
|longitude      |Y       |string  |经度|
|offset      |N       |int |跳过多少条数据，默认0|
|limit      |N      |int |请求数据的数量，默认20|
|restaurant_category_id      |N      |int |餐馆分类id|
|order_by      |N       |int |排序方式id： 1：起送价、2：配送速度、3:评分、4: 智能排序(默认)、5:距离最近、6:销量最高|
|delivery_mode      |N      |array |配送方式id|
|support_ids      |N      |array |餐馆支持特权的id|
|restaurant_category_ids      |N      |array |餐馆分类id|


#### 返回示例：

```javascript
[
  {
    name: "肯德基",
    address: "上海市宝山区淞宝路155弄18号星月国际商务广场1层",
    id: 1,
    latitude: 31.38098,
    longitude: 121.50146,
    location: [
      121.50146,
      31.38098
    ],
    phone: "1232313124324",
    category: "快餐便当/简餐",
    supports: [
      {
        description: "已加入“外卖保”计划，食品安全有保障",
        icon_color: "999999",
        icon_name: "保",
        id: 7,
        name: "外卖保",
        _id: "591bec73c2bbc84a6328a1e5"
      },
      {
        description: "准时必达，超时秒赔",
        icon_color: "57A9FF",
        icon_name: "准",
        id: 9,
        name: "准时达",
        _id: "591bec73c2bbc84a6328a1e4"
      },
      {
        description: "该商家支持开发票，请在下单时填写好发票抬头",
        icon_color: "999999",
        icon_name: "票",
        id: 4,
        name: "开发票",
        _id: "591bec73c2bbc84a6328a1e3"
      }
    ],
    status: 0,
    recent_order_num: 615,
    rating_count: 389,
    rating: 1.6,
    promotion_info: "他依然有人有人有人有人有人",
    piecewise_agent_fee: {
      tips: "配送费约¥5"
    },
    opening_hours: [
      "8:30/20:30"
    ],
    license: {
      catering_service_license_image: "",
      business_license_image: ""
    },
    is_new: true,
    is_premium: true,
    image_path: "/img/shop/15c1513a00615.jpg",
    identification: {
      registered_number: "",
      registered_address: "",
      operation_period: "",
      licenses_scope: "",
      licenses_number: "",
      licenses_date: "",
      legal_person: "",
      identificate_date: null,
      identificate_agency: "",
      company_name: ""
    },
    float_minimum_order_amount: 20,
    float_delivery_fee: 5,
    distance: "19.5公里",
    order_lead_time: "40分钟",
    description: "好吃的",
    delivery_mode: {
      color: "57A9FF",
      id: 1,
      is_solid: true,
      text: "蜂鸟专送"
    },
    activities: [
      {
        icon_name: "减",
        name: "满减优惠",
        description: "满30减5，满60减8",
        icon_color: "f07373",
        id: 1,
        _id: "591bec73c2bbc84a6328a1e7"
      },
      {
        icon_name: "特",
        name: "优惠大酬宾",
        description: "是对冯绍峰的上市房地产",
        icon_color: "EDC123",
        id: 2,
        _id: "591bec73c2bbc84a6328a1e6"
      }
    ],
  }
  ... 共20条数据
]
```



