const EthereumTx = require('ethereumjs-tx').Transaction;

document.getElementById("generateHex").disabled = true;
document.getElementById("broadcastTx").disabled = true;

// json editor
const container = document.getElementById("jsoneditor");
const options = {
  mode: 'code',
  ace: ace,
  onChangeText: function (jsonString) {
    document.getElementById("generateHex").disabled = !(jsonString && jsonString.length > 0);
    document.getElementById("transactionHex").value = null;
  },
  mainMenuBar: false
};
const editor = new JSONEditor(container, options);

document.getElementById("generateHex").addEventListener("click", function () {
  const jsonTx = editor.get();
  if (!jsonTx){
    return alert("Json Tx is empty");
  }

  // check all fields have hex values
  function getHexValue(value) {
    if (typeof value !== "string") {
      value = value.toString();
    }

    if (value.startsWith("0x")) {
      return value;
    }

    return "0x" + parseInt(value, 16).toString(16);
  }

  let key;
  for (key in jsonTx) {
    jsonTx[key] = getHexValue(jsonTx[key]);
  }

  document.getElementById("transactionHex").value = "0x" + new EthereumTx(jsonTx, {chain: 1}).serialize().toString("hex");
  document.getElementById("broadcastTx").disabled = false;
});


document.getElementById("transactionHex").oninput = function () {
  const value = document.getElementById("transactionHex").value;
  document.getElementById("broadcastTx").disabled = !(value && value.length > 0);
};

document.getElementById("transactionHex").onchange = function () {
  const value = document.getElementById("transactionHex").value;
  document.getElementById("broadcastTx").disabled = !(value && value.length > 0);
};

document.getElementById("broadcastTx").addEventListener("click", function () {
  const value = document.getElementById("transactionHex").value;
  if (!value) {
    return alert("Transaction hex is empty");
  }

  document.getElementById("status").innerText = "broadcasting...";
  fetch("https://mainnet.infura.io/v3/de1510e9f83540b28e068df9ad59e754", {
    method: "POST",
    body: JSON.stringify({
      "id": 0,
      "jsonrpc": "2.0",
      "method": "eth_sendRawTransaction",
      "params": [value]
    })
  })
    .then((resp) => resp.json())
    .then(result => {
      document.getElementById("status").innerText = null;
      console.log(result);
      alert("Check console for response");
    })
    .catch(error => {
      document.getElementById("status").innerText = null;
      console.error(error);
      alert("Error: Check console");
    });
});
