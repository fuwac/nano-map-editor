const { BrowserWindow, dialog } = require('electron').remote;

// palette information class
let PaletteInfo = function(id, path, args){
  this.id = id;
  this.path = path;
  this.args = args;
}

let vm = new Vue({
  el: "#container",
  data :{
      maxWidth : 40,
      maxHeight : 30,
      listObjects : [],
      listPalette : [],
      selectedObj : null,
      isMouseDown : false,
      inputArgs : "",
      hoverText : "",
      trophy : {
        gold : 0,
        silver:0,
        bronze:0,
      },
      tipStyle : {
        position : "absolute",
        top : "0px",
        left: "0px",
        visibility : "hidden",
      },
      editFilePath : ""
  },
  methods : {
    infoHover(event, obj){
      this.tipStyle.top = (event.clientY+10)+"px";
      this.tipStyle.left = (event.clientX+10)+"px";
      if(obj.id=="Void"){
        this.hoverText = "";
      } else {
        this.hoverText = obj.id;
        if(obj.args != ""){
          this.hoverText += ":"+obj.args;
        }
      }
    },
    setMouseDown(isMouseDown){
      this.isMouseDown = isMouseDown;
    },
    objset : function(obj){
      if(this.isMouseDown){
        obj.id = this.selectedObj.id;
        obj.path = this.selectedObj.path;
        obj.args = this.inputArgs;
      }
    },
    objsel : function(obj){
      this.inputArgs = ""
      this.selectedObj = obj;
    },
    genExportData : function(){
      let objData = function(id, x, y, args){
        this.id = id;
        this.x = x;
        this.y = y;
        this.args = args;
      };
      let listObjData = [];

      for(let y = 0; y < this.maxHeight; y++){
        for(let x = 0; x < this.maxWidth; x++){
          let objInfo = this.listObjects[y][x];
          if(objInfo.id != "Void"){
            listObjData.push(new objData(objInfo.id, x, y, objInfo.args));
          }
        }
      }

      // for JsonUtility (Unity)
      return {
          "Items" : listObjData,
          "Settings" : {
            "gold" : this.trophy.gold,
            "silver": this.trophy.silver,
            "bronze": this.trophy.bronze,
          }
      };
    },
    objClear : function(){
      this.setVoidPalette();
      for(let y = 0; y < this.maxHeight; y++){
        for(let x = 0; x < this.maxWidth; x++){
          let obj = this.listObjects[y][x];
          obj.id  = this.selectedObj.id;
          obj.path = this.selectedObj.path;
          obj.args = "";
        }
      }
      this.trophy.silver = 0;
      this.trophy.gold = 0;
      this.trophy.blonze = 0;
      this.inputArgs = "";
    },
    objDecode : function(listObjects){
      // clear
      this.objClear();
      // set objects
      for(obj of listObjects.Items){
        // find object from palette
        let pallet = this.listPalette.filter(x => x.id === obj.id);
        if(pallet.length == 0) continue;
        let target = this.listObjects[obj.y][obj.x];
        target.id = pallet[0].id;
        target.path = pallet[0].path;
        target.args = obj.args;
      }

      // load trophy
      this.trophy.gold = listObjects.Settings.gold;
      this.trophy.silver = listObjects.Settings.silver;
      this.trophy.bronze = listObjects.Settings.bronze;
    },
    allClear : function(){
      const win = BrowserWindow.getFocusedWindow();

      const options = {
        type: 'question',
        buttons: ['OK', 'Cancel'],
        defaultId: 2,
        title: 'Confirm',
        message: 'Do you want to all clear?',
        detail: '',
      };

      let result = dialog.showMessageBoxSync(win, options);
      if(result == 0){
        this.setTitle(win, "");
        this.objClear();
      }
    },
    setTitle : function(win, path){
      this.editFilePath = path;
      win.setTitle("NanoMapEditor : "+this.editFilePath);
    },
    loadFile : function(){
      const win = BrowserWindow.getFocusedWindow();
      let fs = require("fs");
      let loadPath = dialog.showOpenDialogSync(
        win,
        {
            properties: ['openFile'],
            filters: [
                {
                    name: 'Documents',
                    extensions: ['json']
                }
            ]
      });
      
      fs.readFile(loadPath[0], (err, data)=>{
        if(err) console.log(`error!::${err}`);
        this.objDecode(JSON.parse(data));
      });

      this.setTitle(win, loadPath[0])
    },
    overWriteFile : function(){
      if(this.editFilePath != ""){
        let fs = require("fs");
        let data = this.genExportData();
        fs.writeFile(this.editFilePath, JSON.stringify(data), (err)=>{
          if(err) console.log(`error!::${err}`);
        });
      }
    },
    saveFile : function(){
      const win = BrowserWindow.getFocusedWindow();
      let fs = require("fs");
      let savePath = dialog.showSaveDialogSync(
        win,
        {
            properties: ['openFile'],
            filters: [
                {
                    name: 'Documents',
                    extensions: ['json']
                }
            ]
      });

      let data = this.genExportData();
      fs.writeFile(savePath, JSON.stringify(data), (err)=>{
        if(err) console.log(`error!::${err}`);
      });
      this.setTitle(win, savePath);
    },
    setVoidPalette : function(){
      let voidObj = this.listPalette.filter(x => x.id === "Void")
      this.selectedObj = voidObj[0];
    }
  },
  mounted : function(){
    // search img directory (fileonly)
    var fs = require('fs');
    let imgDir = "img/";
    let dirents = fs.readdirSync(imgDir, { withFileTypes: true });
    let files = dirents.filter(dirent => dirent.isFile())

    // set palette
    for(file of files){
      this.listPalette.push(new PaletteInfo(file.name.slice(0,-4), imgDir+file.name));
    }

    // default => void
    this.setVoidPalette();

    // stage area
    for(let i = 0; i < this.maxHeight; i++){
      let listLineObjects = [];
      for(let j = 0; j < this.maxWidth; j++){
          listLineObjects.push(new PaletteInfo(this.selectedObj.id, this.selectedObj.path));
      }
      this.listObjects.push(listLineObjects);
    }

  }
})

// 上書きセーブ
var localShortcut = require("electron-localshortcut");
localShortcut.register(BrowserWindow.getFocusedWindow(), 'Ctrl+S', function() {
  vm.overWriteFile();
});