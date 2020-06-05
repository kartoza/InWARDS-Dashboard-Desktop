import db from '../datastore';

const stateStore = {
  debug: true,
  keys: {
    selectedCatchments: 'selectedCatchments',
    selectedWMAs: 'selectedWMAs',
    selectedCharts: 'selectedCharts',
    dateStart: 'dateStart',
    dateEnd: 'dateEnd',
    selectedStations: 'selectedStations',
    loginStatus: 'loginStatus',
    databaseStatus: 'databaseStatus'
  },
  state: {},
  print (message) {
    if (this.debug) {
      console.log(message);
    }
  },
  setState (key, newValue) {
    const self = this;
    this.print(`Set state ${key} to ${JSON.stringify(newValue)}`);
    this.state[key] = newValue;
    db.update({ type: 'user_states' }, {
      $set: self.state
    }, {
      upsert: true
    });
  },
  getState (key, callback) {
    const self = this;
    this.print(`Get state for ${key}`);
    console.log(JSON.stringify(this.state));
    if (this.state.hasOwnProperty(key)) {
      callback(this.state[key]);
    } else {
      db.find({ type: 'user_states' }, function (err, docs) {
        if (err) {
          self.print(err);
          return false;
        }
        if (docs.length === 0) {
          callback(null);
        }
        self.state = JSON.parse(JSON.stringify(docs[0]).replace(/'/g, ''));
        callback(self.state[key]);
      });
    }
  },
  clearState (key) {
    if (this.state.hasOwnProperty(key)) {
      this.print(`Clear state for ${key}`);
      this.state[key] = null;
      this.setState(key, null);
    }
  }
};

export default stateStore;
