// Opens new database, name and version number
// Inside .open, must call function that creates a table
// Arguments are name of the table, and primary key
// Use this promise whenever you access the database
// createObjectStore must be called if table does not exist yet
let dbPromise = idb.open('database-name', 1, db => {
  if (!db.objectStoreNames.contains(table-name)) {
    db.createObjectStore('table-name', {keyPath: 'id'});
  }
});


function writeData(store, data) {
  return dbPromise
    .then(db => {
      // transaction takes 2 arguments, which table we want to access
      // and what kind of transaction it is, readwrite or read only
      let tx = db.transaction(store, 'readwrite');
      let store = tx.objectStore(store);
      store.put(data);
      // return transaction.complete, not a method just a property
      return tx.complete;
    });
}


function readAllData(store) {
  return dbPromise
    .then(db => {
      let tx = db.transaction(store, 'readonly');
      let store = tx.objectStore(store);
      return store.getAll();
    });
}


function clearAllData(store) {
  return dbPromise
    .then(db => {
      let tx = db.transaction(store, 'readwrite');
      let store = tx.objectStore(store);
      store.clear();
      // tx.complete on every write operation
      return tx.complete;
    });
}


function deleteItemFromData(store, id) {
  return dbPromise
    .then(db => {
      let tx = db.transaction(store, 'readwrite');
      let store = tx.objectStore(store);
      store.delete(id);
      // tx.complete on every write operation
      return tx.complete;
    })
      .then(() => console.log('Item deleted'));
}

