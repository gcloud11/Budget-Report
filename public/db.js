let db;
//creating a new db request
const request = indexedDB.open("budgettrack", 1);

// creating an object store and sets autoIncrement to true
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
// checking if app is online before rendering from the db
  if (navigator.onLine) {
    checkDB();
  }
};

//checking for errors
request.onerror = function(event) {
  console.log("Error " + event.target.errorCode);
};

function saveRecord(record) {
    // creating a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");
  // accessing your pending object store
  const store = transaction.objectStore("pending");
  // adding a record to your store with add method
  store.add(record);
}


function checkDB() {
    // opening a transaction to pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // accessing pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    console.log(getAll.result)
    if (getAll.result.length > 0) {
        console.log(getAll.result)
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
        .then(() => {
       
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);