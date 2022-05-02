# Zoom_Clone

NodeJs, WebSocket, WevRTC을 이용해서 Zoom Clone Project를 진행합니다.

## 프로젝트 구조

세 파일을 확인할 수 있습니다.
- app.js : client source code
- server.js : server source code
- home.pug : home view

프로젝트 구조는 다음과 같이 요약합니다

- `http` 프로토콜과 `ws` 프로토콜 모두 다루기 위해 express 서버 위에 WebSocket 서버를 올립니다.
- http서버가 다루는 url경로는 하나 존재합니다.
    - `/` : 홈 화면. 채팅방 입장 입력창과 화상채팅 비디오 화면을 보여주는 view를 받습니다.
- PeerToPeer 채팅이 이뤄지도록 `WebRTC`를 사용합니다.
- 클라이언트와 서버 간의 이벤트가 발생할 때마다 핸들링 할 수 있도록 `SocketIO` 프레임워크를 사용합니다.
    - `join_room` : 채팅방에 입장했을 때 발생하는 이벤트. 
    - `welcome` : guest가 채팅방에 입장했을 때 발생하는 이벤트
        - host는 해당 게스트와의 화상통화를 위해, WebRTC peer Connection Offer를 생성하여 서버로 보낸다.
        - 즉, 내 브라우저와 상대 peer 브라우저가 사용가능한 코덱, 해상도에 대한 정보를 교환한다.
        - 서버는 받은 offer 객체를 guest에게 보낸다.
    - `offer` : guest가 host로부터 offer를 받았을 때, 발생하는 이벤트
        - host로부터 offer를 받고 나서, guest는 offer에 대한 answer라는 연결객체를 생성해서 다시 서버로 보낸다.
        - 서버에서는 해당 answer를 다시 host에게 전달한다.
    - `ice` : 네트워크 정보 교환을 위해 발생시키는 이벤트
        - 처음, Connection을 생성할 때, ice candidate data를 확보한 후, socket을 통해 서버로 보낸다.
        - 서버가 중간 매개자가 되어 쌍방으로 ice candidate 정보 즉, 네트워크 정보를 교환한다.  
