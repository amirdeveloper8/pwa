// 2nd step
const dbPromise = idb.open("post-store", 1, (db) => {
  if (!db.objectStoreNames.contains("posts")) {
    db.createObjectStore("posts", { keyPath: "id" });
  }
});

// 2nd step
const writeData = (st, data) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(st, "readwrite");
    const store = tx.objectStore(st);
    store.put(data);
    return tx.complete;
  });
};

// 3rd step
const readAllData = (st) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(st, "readonly");
    const store = tx.objectStore(st);
    return store.getAll();
  });
};

// 4th step
const clearAllData = (st) => {
  return dbPromise.then((db) => {
    const tx = db.transaction(st, "readwrite");
    const store = tx.objectStore(st);
    store.clear();
    return tx.complete;
  });
};

// 5th step
const deleteSingleItem = (st, id) => {
  dbPromise
    .then((db) => {
      const tx = db.transaction(st, "readwrite");
      const store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .then(() => {
      console.log("Item deleted!");
    });
};
