## NanoMapEditor
### これは何？
自作ゲームのマップエディタ。png画像をグリッド上に配置して、json形式でexport/importするGUIツール。ゲームの開発自体は終わったけれども、今後なにかに流用するかもしれないので置いておく。ちなみに既知のバグ色々あるけど修正めんどいので放置してる。悪しからず。
### 必要なもの
 - VSCode <br/>
 各種タスクの実行に必須。
 - Node.js <br/>
 サーバサイドに使うJavascript環境だけど、クライアント用途で使ってる。
 - 各種パッケージ <br/>
 「npm install」で、package.jsonに記述してあるモジュールがインストールされる。
### 開発
 - cssの編集 <br/>
 VSCodeで「build-sass」タスクを実行。css/index.scss を上書き保存したら勝手にindex.cssを出力。
 - デバッグ実行 <br/>
 VSCodeで「run」タスクを実行。Devtron入れてるのでCtrl+Iでデバッグ表示できる。
 - リリース実行 <br/>
 electron-packager . nano-map-editor --platform=win32 --arch=x64 --electronVersion=8.2.2 <br/>
 このようにelectron-packagerを使えば配布用の実行ファイルを作れるが、色々ぶちこまれるせいで余裕で100MB超えてドン引きすること間違いなし。オススメしない。
