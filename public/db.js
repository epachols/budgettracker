let db;
//new db request for the budget db
const request = indexedDB.open("budget", 1);
//
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    //see if app is online before reading
    if (navigator.onLine) {
        checkDatabase();
    }
}

request.onerror = function(event) {
    console.log("Oh no!" + event.target.errorCode);
};

function saveRecord(record) {
    //make a new transaction from pending
    const transaction = db.transaction(["pending"], "readwrite");
    //accessing object store
    const store = transaction.objectStore("pending");
    //add record to your store with add method
    store.add(record);
}

function checkDatabase() {
    //transaction
    const transaction = db.transaction(["pending"], "readwrite");
    //access store
    const store = transaction.objectStore("pending");
    //get all records from store set to getAll
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length >0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(()=> {
                //if successful, open transaction
                const transaction = db.transaction(["pending"], "readwrite");

                //access pending storage
                const store = transaction.objectStore("pending");

                //clear all since we just posted to online
                store.clear();
            })
        }
    }
}

//listen for app coming back online

window.addEventListener("online", checkDatabase);