const toLocaleString = require('formatResult').toLocaleString;
const scriptName = "settlement";

const keywords = {
  start: "정산시작",
  finish: "정산종료",
  restart: "정산재개",
  reset: "정산초기화"
};
const dataByRoom = {};

/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {

  if(msg === keywords.start) {
    dataByRoom[room] = {
      inProgress: true,
      settlementData: {}
    };
    replier.reply("정산을 시작합니다.");
    return;
  }

  if(msg === keywords.restart) {
    dataByRoom[room].inProgress = true;
    replier.reply("정산을 재개합니다.");
    return;
  }

  if(msg === keywords.reset) {
    resetSettlement(room);
    replier.reply("데이터를 초기화합니다.");
    return;
  }

  if(msg == keywords.finish) {
    const settlement = calculateSettlement(room);
    const settlementMsg = generateSettlementMsg(settlement);
    dataByRoom[room].inProgress = false;
    replier.reply(settlementMsg);
    return;
  }

  const roomData = getOrCreate(dataByRoom, room, "object");
  if(!roomData.inProgress) return;

  const spendings = getOrCreate(roomData.settlementData, sender, "array");
  const parsed = parseMsg(msg);
  if(isNaN(parsed.amount)) return;
  spendings.push({ shop: parsed.shop, amount: parsed.amount });
  log(dataByRoom);
}

function resetSettlement(room) {
  dataByRoom[room].settlementData = {};
}

function calculateSettlement(room) {
  const roomData = getOrCreate(dataByRoom, room, "object");
  const names = Object.keys(roomData.settlementData);
  const totalsByName = calculateTotalsByName(roomData.settlementData, names);
  const roomTotal = calculateRoomTotal(totalsByName);
  const perCapita = Math.round(roomTotal / names.length);
  const settlement = { 
    roomTotal: roomTotal,
    perCapita: perCapita,
    names: names 
  };
  for(var i = 0; i < names.length; i++) {
    var name = names[i];
    var spending = totalsByName[name];
    settlement[name] = {
      spending: spending,
      amountToSettle: perCapita - spending
    };
  }
  log(settlement);
  return settlement;
}

function log(obj) {
  Api.replyRoom('신준수', JSON.stringify(obj));``
}

function calculateTotalsByName(settlementData, names) {
  const totalsByName = {};
  for(var i = 0; i < names.length; i++) {
    var name = names[i];
    spendings = getOrCreate(settlementData, name, "array");
    var personalTotal = sumSpendings(spendings);
    totalsByName[name] = personalTotal;
  }
  return totalsByName;
}

function calculateRoomTotal(totalsByName) {
  var roomTotal = 0;
  const names = Object.keys(totalsByName);
  for(var i = 0; i < names.length; i++) {
    var name = names[i];
    roomTotal += totalsByName[name];
  }
  return roomTotal;
}

function calcultePerCapita(totalsByName) {
  var roomTotal = 0;
  const names = Object.keys(totalsByName);
  for(var i = 0; i < names.length; i++) {
    var name = names[i];
    roomTotal += totalsByName[name];
  }
  return Math.round(roomTotal / names.length); 
}

function sumSpendings(arr) {
  var sum = 0;
  for(var i = 0; i < arr.length; i++) {
    sum += arr[i].amount;
  }
  return sum;
}

function generateSettlementMsg(settlement) {
  var msg = '';
  msg += ('총금액: ' + toLocaleString(settlement.roomTotal) + " (인당 " + toLocaleString(settlement.perCapita) + '원)\n');
  for(var i = 0; i < settlement.names.length; i++) {
    var name = settlement.names[i];
    var person = settlement[name];
    msg += (name + ": ");
    msg += (toLocaleString(person.spending) + "원 지출 / ");
    var giveReceiveText = person.amountToSettle > 0 ? "주기" : "받기";
    msg += (toLocaleString(Math.abs(person.amountToSettle)) + "원 " + giveReceiveText);
    msg += "\n";
  }
  return msg;
}

function getOrCreate(obj, key, type) {
  const value = obj[key];

  if(value !== undefined) return value;

  if(type === "object") {
    obj[key] = {};
  }

  if(type === "array") {
    obj[key] = [];
  }

  return obj[key];
}

function parseMsg(msg) {
  const amount = parseInt(msg.replace(",", "").replace("원", ""));
  return {
    amount: amount
  };
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}