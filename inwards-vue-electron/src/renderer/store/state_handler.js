import db from '../datastore';

const stateStore = {
  debug: true,
  keys: {
    selectedCatchments: 'selectedCatchments',
    selectedWMAs: 'selectedWMAs',
    dateStart: 'dateStart',
    dateEnd: 'dateEnd'
  },
  state: {},
  print (message) {
    if (this.debug) {
      console.log(message);
    }
  },
  setState (key, newValue) {
    const self = this;
    this.print(`Set state ${key} to ${newValue}`);
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
    if (this.state.hasOwnProperty(key)) {
      callback(this.state[key]);
    } else {
      db.find({ type: 'user_states' }, function (err, docs) {
        // docs is an array containing documents Mars, Earth, Jupiter
        // If no document is found, docs is equal to []
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
    }
  }
};

export default stateStore;
