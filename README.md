# OkaEvent_web

岡山のイベント情報を共有するアプリのバックエンドです。

FirebaseのHosting、Cloud functionsにデプロイするコードです。

## Cloud functions

### postEvent()

#### Request

Header

- Content-Type: application/json

body

    {
        "uid" : "your-user-id",
        "name" : "イベント名",
        "text" : "イベント説明文",
        "address" : "開催場所",
        "start_datetime" : "開始日時",
        "end_datetime" : "終了日時",
        "url" : "イベントページ（なくてもOK）",
    }

#### Response

success

- status: 200
- body: 'success'

fail

- status: 400
- body: error message
