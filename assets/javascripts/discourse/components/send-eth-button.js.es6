import showModal from "discourse/lib/show-modal";
import computed from "ember-addons/ember-computed-decorators";

const SERVER_URL="http://localhost:3001/";
export function callWeb3(txn){
  console.log("transaction!",txn);
  const args = {from: txn.from, to:txn.to,value:"0x00", data:txn.data };
  web3.eth.sendTransaction(args, (e, txID) => {
    // this.afterProcess(e, txID);
    if (e){
      console.log("error",e);
      showModal("show-err", {error: e});
      // if (this.get("close")) this.close();
    }
  });
}

export function fetchTransactionsWithOptions(endpoint, web3, aragonConnectOptions){
  fetch(SERVER_URL + endpoint, aragonConnectOptions)
    .then(result=>result.json())
    .then(data=> {
      console.log("JSON:", data);
      if (data["forwardingFeePretransaction"]){
        callWeb3(data["forwardingFeePretransaction"])
      }
      for (const txn of data["transactions"]){
        callWeb3(txn)
      }
    })
    .catch( e => {
      console.log("error",e);

      showModal("show-err", {error: e});
    });
}
export function vote(preference, model){
  window.withWeb3().then( ()=> {

    const aragonConnectOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          vote:preference,
          url:model.url,
          timestamp:model.created_at,
          userAddress:web3.eth.defaultAccount,
        })
    };
    fetchTransactionsWithOptions("getVoteTransaction",web3, aragonConnectOptions, model);
  });
}

export function submitProposal(endpoint, model){
  window.withWeb3().then( ()=> {
    const aragonConnectOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          timestamp:model.created_at,
          url:model.url,
          userAddress:web3.eth.defaultAccount,
        })
    };
    fetchTransactionsWithOptions(endpoint, web3, aragonConnectOptions, model);
  });
}

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

    submitNewVoteProposal(){
      submitProposal("submitNewAragonVote", this.get("model"));
    },

    submitNewTokenRequestProposal(){
      submitProposal("submitNewAragonTokenRequest", this.get("model"));
    },

    voteYes(){
      console.log("model:",this.get("model"));
      vote("yes",this.get("model"))
      },

    voteNo(){
      console.log("model:",this.get("model"));
      vote("yes",this.get("model"))
      },




    // showSendEthModal() {
    //   if (this.get("disabled")) return;
    //   window.withWeb3().then( ()=> {
    //     showModal("send-eth", {model: this.get("model")});
    //
    //     // if (this.get("close")) this.sendAction("close");
    //     if (this.get("close")) this.close();
    //   });
    // }
  }
});
