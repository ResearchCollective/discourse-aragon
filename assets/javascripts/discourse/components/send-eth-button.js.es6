import showModal from "discourse/lib/show-modal";
import computed from "ember-addons/ember-computed-decorators";

export default Ember.Component.extend({
  tagName: "span",

  @computed("model.can_do_eth_transaction")
  disabled(canDoTransaction) {
    // return ( !canDoTransaction || (typeof window.web3 == "undefined") || !window.web3.eth.defaultAccount );
    // Don't check for a defaultAccount, MetaMask connection may not have been accepted yet
    // Check for window.ethereum, since window.web3 is being depricated
    // return ( !canDoTransaction || ((typeof window.ethereum == "undefined") && (typeof window.web3 == "undefined")) );
    // canDoTransaction is probably supposed to be referencing the result of can_do_eth_transaction? from plugin.rb
    // Do not disable the Send ETH button (even if addresses are undefined) unless no web3 library found
    return ( (typeof window.ethereum == "undefined") && (typeof window.web3 == "undefined") );
  },

  actions: {

    voteYes(){
      window.withWeb3().then( ()=> {
        const aragonConnectOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              vote:"yes",
              userAddress:this.get("senderAddress"),
            })
        };

        fetch("http://localhost:3001/getVoteTransaction", aragonConnectOptions)
          .then(result=>result.json())
          .then(data=> {
              console.log("JSON:", data);
              const txn = data["transactions"][0];
              const args = {from: txn.from, to:txn.to,value:"0x00", data:txn.data }
              web3.eth.sendTransaction(args, (e, txID) => this.afterProcess(e, txID));
            }
          )}
      );    },

    voteNo(){
      window.withWeb3().then( ()=> {

        const aragonConnectOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              vote:"no",
              userAddress:this.get("senderAddress"),
            })
        };

        fetch("http://localhost:3001/getVoteTransaction", aragonConnectOptions)
          .then(result=>result.json())
          .then(data=> {
              console.log("JSON:", data);
              const txn = data["transactions"][0];
              const args = {from: txn.from, to:txn.to,value:"0x00", data:txn.data }
              web3.eth.sendTransaction(args, (e, txID) => this.afterProcess(e, txID));
            }
          )}
      );
      },

    showSendEthModal() {
      if (this.get("disabled")) return;
      window.withWeb3().then( ()=> {
        showModal("send-eth", {model: this.get("model")});

        // if (this.get("close")) this.sendAction("close");
        if (this.get("close")) this.close();
      });
    }
  }
});
