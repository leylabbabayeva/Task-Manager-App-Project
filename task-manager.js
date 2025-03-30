import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js"; 
import { getDatabase, ref, push, remove, onValue, get, update } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

const firebaseConfig = {
    databaseURL : "https://task-manager-32593-default-rtdb.europe-west1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const referenceInDB = ref(database, "leads");

let myTasks = [];
const inputEl = document.getElementById("input-el");
const createTaskBtn = document.getElementById("create-task-btn");
const ulEl = document.getElementById("ul-el");
const deleteAllBtn = document.getElementById("delete-all-btn");

function render(tasks) {
    ulEl.innerHTML = ""; // Clear existing list

    // Sort: unchecked tasks first
    tasks.sort((a, b) => a.checked - b.checked);

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.checked ? "checked" : ""} data-id="${task.id}">
            <span class="${task.checked ? "completed" : ""}">${task.text}</span>
        `;
        ulEl.appendChild(li);
    }

    // Add event listeners for checkboxes
    document.querySelectorAll(".task-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", function() {
            toggleTaskStatus(this.dataset.id);
        });
    });
}

function toggleTaskStatus(taskId) {
    const taskRef = ref(database, `leads/${taskId}`);
    get(taskRef).then(snapshot => {
        if (snapshot.exists()) {
            const task = snapshot.val();
            task.checked = !task.checked;  // Toggle the checked state
            update(taskRef, task);  // Update the task in Firebase
        }
    });
}

deleteAllBtn.addEventListener("dblclick", function() {
    remove(referenceInDB);  // Remove all tasks from Firebase
    ulEl.innerHTML = "";    // Clear the task list in the UI
});

onValue(referenceInDB, function(snapshot) {
    const snapshotDoesExist = snapshot.exists();
    if (snapshotDoesExist) {
        const snapshotValues = snapshot.val();
        const tasks = Object.keys(snapshotValues).map(key => ({
            id: key,
            ...snapshotValues[key]
        }));
        render(tasks);
    }
});

createTaskBtn.addEventListener("click", function() {
    const newTask = {
        text: inputEl.value,
        checked: false // Initially, the task is not checked
    };
    push(referenceInDB, newTask);  // Push the new task object to Firebase
    inputEl.value = "";  // Clear the input field after adding the task
});
