中興大學資工系教室借用表 v3.0
===
###### tags: `github README.md`

<p align="center">
<img src="https://i.imgur.com/hRdt4iV.png" alt="image-20201027164029288" width="200" />
</p>

![](https://i.imgur.com/iYh042f.png)


本系統僅限中興大學資工系系辦工讀生使用

## Feature
* 更好的視覺化管理課表
* 方便新增課表
* 用 docker 使系統在佈署時更方便
* 每學期結束時自動更新新的課表

## 使用方法
### 啟動系統
* docker：
    * 進入課表系統資料夾
    ```
    cd NCHUCse-curriculum
    ```
    * 起動 docker 服務
    ```
    docker-compose up --build
    ```
    * 課表系統就會開在 [http://localhost/](http://localhost/)

### 新增課表
* 在要新增的教室下
* 對著要新增課表開始時間按兩下滑鼠左鍵
* 左側會出現新增課表面板
* 依序輸入：
    * 借用目的
    * 時間
    * 借用類別
        > 借用類別一共有三類：
        > 
        > 網頁課表 -> 從學校網頁上爬來的課表
        > 
        > 固定課表 -> 借用一整個學期之課表
        > 
        > 臨時課表 -> 特別幾天需要借用之課表
    * 借用單位
* 按下「儲存」後即成功新增課表
### 刪除課表
* 按下右上角「刪除課表」按鈕
* 依照「課表類型」以及「課表ID」依序輸入
    * 在表格中單點對應課表，裡面可以找到「ID」欄位
* 按下「刪除課表」後會跳出一個視窗，確認資料刪除無誤
    * 如果確定刪除，按下「刪除課表」
    * 如果不刪除，按下網頁其餘空白處就可以

### 新學期固定流程
* 不管暑假、寒假，大約在 8 月底、2 月底時，學校就會排好下一個學期的課表了
* 要記得在開學之前按照以下的步驟處理
    * **設定開學時間**
    * **爬學校課表資料並更新**
    * **同步更新至資工系網頁課表**

### 設定開學時間
* 課表系統預設一個學期為 18 週，因此除了臨時借用之外其它的課表都會預設重覆 18 次
* 因此在每學期初時需要設定開學日期
    * 按下「設定開學時間」
    * 去學校行事曆找到這一個學年的「暑假、寒假」開學時間
    * 依序以：學年度、上學期開學時間、下學期開學時間，輸入至對應框框裡

### 爬學校課表資料並更新
* 這個課表系統有寫一個爬蟲去 https://onepiece.nchu.edu.tw/cofsys/plsql/crseqry_home 找課表資料
* 這個爬蟲所爬下來的課表就對應到這個系統中的「網頁課表」
    * 按下「重新網頁資料」
    * 按下「重新爬學校課表資料並更新」
    * 等到下面出現綠色的成功就完成了

### 同步更新至資工系網頁課表
* 你知道系上有個課表系統嗎？在這裡 http://www.cs.nchu.edu.tw/class/status.php 。陳姐會要求每學期初手動更新一下
* 這裡提供一個全自動的方法，可以把「網頁課表」以及「固定借用」自動填到系上課表系統上
    * 按下「重新網頁資料」
    * 按下「同步更新至資工系網頁課表」
    * 等到下面出現綠色的成功就完成了，可以去網站檢查一下

### 其它
* 右上新增「週」「月」切換功能，在暑假口試週更實用
* 每個課表都可單獨點擊
    * 裡面存著各種課表更詳細的資訊
    * ID 為課表在資料庫中的 private key
    * 新增時間是會了要看是哪一個工讀生新增的，找戰犯用

## 維護
### 進入 database
* 如果要進入 database 修改資料
* 首先先找出 mysql 的 container id
```
docker container ls
```
* 接著進入 mysql container
```
docker exec -it <container_id> /bin/bash
```
* 進入 mysql
* 密碼為系統管理員密碼
```
mysql -uroot -p
```
* mysql 操作
```
use curriculum;
select * from website_curriculum;
...
```
## 備份 & 復原
### 備份
```
設定排程
crontab -e
```
```
每天早上 00:00 備份
00 00 * * * ${HOME}/NCHUCse-curriculum/backup/mysql-docker-backup.sh
```

每天的 00:00 凌晨會自動備份一次，檔案格式為：`backup-西元年-月-日.sql`。例如：`backup-2022-03-12.sql`。而檔案會放在 backup 資料夾裡面

### 復原

如果今天課表有問題，或是網站打不開，可以把檔案復原至前幾天的資料

登入課表 server 主機，進入課表資料夾，進入 backup 資料夾

```
cd ~/Desktop/NCHUCse-curriculum/backup
```

執行「指定日期檔案」復原指令

```
./mysql-docker-restore.sh 西元年 月 日

例如：
./mysql-docker-restore.sh 2022 03 12
```
注意：
* 年月日彼此間用一個空白格分開
* 如果月或是日不滿兩位數的話，前面補 0

如果出現類似下列錯誤訓息，代表沒有這一天的備份檔案，換一天的試試看

```
cat: .../backup-2022-03-12.sql: No such file or directory
```