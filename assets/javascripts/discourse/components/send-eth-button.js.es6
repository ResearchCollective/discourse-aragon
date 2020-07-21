import showModal from "discourse/lib/show-modal";
import computed from "ember-addons/ember-computed-decorators";

const SERVER_URL="http://localhost:3001/";
export function fetchWithOptions(endpoint, web3, aragonConnectOptions){
  fetch(SERVER_URL + endpoint, aragonConnectOptions)
    .then(result=>result.json())
    .then(data=> {
      console.log("JSON:", data);
      const txn = data["transactions"][0];
      const args = {from: txn.from, to:txn.to,value:"0x00", data:txn.data };
      web3.eth.sendTransaction(args, (e, txID) => {
        // this.afterProcess(e, txID);
        if (e){
          console.log("error",e);
            showModal("show-err", {error: e});
            // // if (this.get("close")) this.sendAction("close");
            // if (this.get("close")) this.close();
        }
      });
    })
    .catch( e => {
      console.log("error",e);

      showModal("show-err", {error: e});
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

    submitProposal(){
      const timestamp = this.get("model").created_at
      const url = this.get("model").url;
      console.log("timestamp:",timestamp );
      console.log("url:", url);
      console.log("model:",this.get("model"));
      window.withWeb3().then( ()=> {
          const aragonConnectOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              {
                vote:"yes",
                timestamp:timestamp,
                url:url,
                userAddress:web3.eth.defaultAccount,
              })
          };

          fetchWithOptions("submitNewAragonProposal", web3, aragonConnectOptions, this.get("model"));
    });
    },

    voteYes(){
      console.log("model:",this.get("model"));
      window.withWeb3().then( ()=> {
        const aragonConnectOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              vote:"yes",
              timestamp:this.get("model").created_at,
              userAddress:web3.eth.defaultAccount,
            })
        };

        fetchWithOptions("getVoteTransaction",web3, aragonConnectOptions, this.get("model"));
      });
      },

    voteNo(){
      console.log("model:",this.get("model"));
      window.withWeb3().then( ()=> {

        const aragonConnectOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              vote:"no",
              timestamp:this.get("model").created_at,
              userAddress:web3.eth.defaultAccount,
            })
        };
        fetchWithOptions("getVoteTransaction",web3, aragonConnectOptions, this.get("model"));
      });
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
