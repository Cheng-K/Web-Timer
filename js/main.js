// Refactor some code

class Timer {
  #hours;
  #minutes;
  #seconds;
  #totalSeconds;

  #countdownID;

  constructor(hour = 0, minutes = 0, seconds = 0) {
    this.#hours = hour;
    this.#minutes = minutes;
    this.#seconds = seconds;
    this.#totalSeconds = (this.#hours * 60 + this.#minutes) * 60 + this.#totalSeconds;

  }

  getTotalSeconds() {
    return this.#totalSeconds;
  }


  getHours() {
    return this.#hours;
  }

  getMinutes() {
    return this.#minutes;
  }

  getSeconds() {
    return this.#seconds;
  }

  setTimer(hour, minutes, seconds) {
    this.#hours = hour;
    this.#minutes = minutes;
    this.#seconds = seconds;
    this.#totalSeconds = (this.#hours * 60 + this.#minutes) * 60 + this.#seconds;
    this.update();
  }

  update() {
    output.updateTimer(this.#hours, this.#minutes, this.#seconds);
  }

  decrement() {
    if (this.getSeconds() > 0) {
      this.#seconds -= 1;
    } else if (this.getMinutes() > 0) {
      this.#minutes -= 1;
      this.#seconds = 59;
    } else if (this.getHours() > 0) {
      this.#hours -= 1;
      this.#minutes = 59;
      this.#seconds = 59;
    }
    this.update();
    if (this.getHours() === 0 && this.getMinutes() === 0 && this.getSeconds() === 0) {
      output.stopTimerCallbackFunction();
      setTimeout(function () {
        output.sendAlert("Time's up!")
      }, 10);
    }
  }

  startTimer() {
    this.#countdownID = setInterval(this.decrement.bind(this), 1000);
  }

  stopTimer() {
    clearInterval(this.#countdownID);
  }

}

class OutputManager {
  #tasksList;

  #mainTitle;
  #setTimerButton;
  #startStopTimerButton;
  #inputWindowCloseButton;
  #dropDownContentButton;
  #dropDownContent;

  #workingTitle;
  #progressStatus;
  #progressIntervalID;

  startTimerCallbackFunction
  stopTimerCallbackFunction

  constructor() {
    this.#tasksList = [];
    this.#mainTitle = document.querySelector("title");
    this.#setTimerButton = document.querySelector("#setTimer");
    this.#inputWindowCloseButton = document.querySelector(".InputModal .Close");
    this.#startStopTimerButton = document.querySelector("#startTimer");
    this.#workingTitle = document.querySelector(".WorkingProgress .WorkTitle");
    this.#progressStatus = document.querySelector(".ProgressStatus");
    this.#dropDownContentButton = document.querySelector(".MoreButton");
    this.#dropDownContent = document.querySelector(".DropDownContent");

    // Reload back the previous task
    let storage = window.localStorage;
    for (let i = 0; i < storage.length; i++) {
      let title = storage.key(i);
      let content = storage.getItem(title).split(" ");
      this.addTask();
      this.#tasksList[i].updateSelf(title, parseInt(content[0]), parseInt(content[1]), parseInt(content[2]), parseInt(content[3]));
    }

    // Callback functions initialization

    this.startTimerCallbackFunction = function () {
      // Make sure all tasks are closed
      for (let index = 0; index < this.#tasksList.length; index++) {
        if (this.#tasksList[index].isExpanded()) {
          this.#tasksList[index].minimize();
        }
      }
      this.resetProgressStatus();
      timer.startTimer();
      this.#progressIntervalID = setInterval(this.setProgressStatus.bind(this), 1000);
      this.#startStopTimerButton.removeEventListener("click", this.startTimerCallbackFunction);
      this.#startStopTimerButton.innerHTML = "Stop";
      this.#startStopTimerButton.addEventListener("click", this.stopTimerCallbackFunction);
    }.bind(this);

    this.stopTimerCallbackFunction = function () {
      timer.stopTimer();
      setTimeout(function () {
        clearInterval(this.#progressIntervalID)
      }.bind(this), 10);
      this.#startStopTimerButton.removeEventListener("click", this.stopTimerCallbackFunction);
      this.#startStopTimerButton.innerHTML = "Start";
      this.#startStopTimerButton.addEventListener("click", this.startTimerCallbackFunction);
    }.bind(this);

    this.#startStopTimerButton.addEventListener("click", this.startTimerCallbackFunction);

    this.#setTimerButton.addEventListener("click", function () {
      let inputWindow = document.querySelector(".InputModal");
      let hoursField = document.querySelector(".InputModal #hours");
      let minutesField = document.querySelector(".InputModal #minutes");
      let secondsField = document.querySelector(".InputModal #seconds");
      inputWindow.style.display = "block";
      hoursField.value = timer.getHours();
      minutesField.value = timer.getMinutes();
      secondsField.value = timer.getSeconds();
    });

    this.#inputWindowCloseButton.addEventListener("click", function () {
      document.querySelector(".InputModal").style.display = "none";
      let hoursField = document.querySelector(".InputModal #hours");
      let minutesField = document.querySelector(".InputModal #minutes");
      let secondsField = document.querySelector(".InputModal #seconds");
      timer.setTimer(parseInt(hoursField.value), parseInt(minutesField.value), parseInt(secondsField.value));
    });


    this.#dropDownContentButton.addEventListener("click", function () {
      this.changeDropDownContentVisibility()
    }.bind(this));


    document.querySelector(".AddTask").addEventListener("click", function (ev) {
      ev.stopPropagation();
      output.addTask();
    });

  }

  updateTimer(hour, minutes, seconds) {
    let timerHeading = document.querySelector(".TimerHeading");
    timerHeading.innerHTML = hour + ":" + minutes + ":" + seconds;
    this.#mainTitle.innerHTML = hour + ":" + minutes + ":" + seconds + " - " + this.#workingTitle.innerHTML;

  }

  sendAlert(message = "Time's up!") {
    this.playSoundEffect("resources/alarm-effect.mp3");
    setTimeout(() => alert(message), 10);
  }

  playSoundEffect(musicFile) {
    let audio = new Audio(musicFile);
    audio.play();
  }

  addTask() {
    // make sure all task are closed
    for (let index = 0; index < this.#tasksList.length; index++) {
      if (this.#tasksList[index].isExpanded()) {
        this.#tasksList[index].minimize();
      }
    }

    let container = document.querySelector(".TaskSection");

    let newTask = new Task();
    container.appendChild(newTask.getDiv());

    this.#tasksList.push(newTask);

  }

  setProgressStatus() {
    let currentSeconds = (((timer.getHours() * 60) + timer.getMinutes()) * 60 + timer.getSeconds());
    let value = Math.floor(((timer.getTotalSeconds() - currentSeconds) / timer.getTotalSeconds()) * 100);
    console.log(value);
    this.#progressStatus.style.width = value + "%";
  }

  resetProgressStatus() {
    this.#progressStatus.style.width = "0%";
  }

  changeDropDownContentVisibility() {
    if (this.#dropDownContent.classList.contains("Show"))
      this.#dropDownContent.classList.remove("Show");
    else
      this.#dropDownContent.classList.add("Show");
  }

  deleteAllTask() {
    for (let index = 0; index < this.#tasksList.length; index++) {
      this.#tasksList[index].delete();
    }
    this.#tasksList = [];
  }

  checkAllTask() {
    for (let index = 0; index < this.#tasksList.length; index++) {
      this.#tasksList[index].done();
    }
  }

  uncheckAllTask() {
    for (let index = 0; index < this.#tasksList.length; index++) {
      this.#tasksList[index].undone();
    }
  }

  getTasksList() {
    return this.#tasksList;
  }

  setWorkingTitle(title) {
    this.#workingTitle.innerHTML = title;
  }

}


/* This class is responsible for all contents inside a task */
class Task {
  #task;
  #title;
  #inputTitle;
  #hourLabel;
  #minuteLabel;
  #secondLabel;
  #inputHour;
  #inputMinute;
  #inputSecond;
  #buttonGroup;
  #minMaxButton;
  #minimizeIcon;
  #maximizeIcon;
  #deleteButton;
  #deleteIcon;
  #statusIndicator;
  #finishedIcon;
  #unfinishedIcon;

  #hourLabelLineBreaker
  #minuteLabelLineBreaker

  #expanded;
  #selected;

  #minimizeCallbackFunction;
  #maximizeCallbackFunction;
  #taskDoneCallbackFunction;
  #taskUndoneCallbackFunction;

  constructor() {
    this.#task = document.createElement("div");
    this.#title = document.createElement("h1");
    let newLine = document.createElement("br");
    this.#hourLabelLineBreaker = newLine.cloneNode(true);
    this.#minuteLabelLineBreaker = newLine.cloneNode(true);
    this.#inputTitle = document.createElement("input");
    this.#hourLabel = document.createElement("h4")
    this.#inputHour = document.createElement("input");
    this.#minuteLabel = document.createElement("h4")
    this.#inputMinute = document.createElement("input");
    this.#secondLabel = document.createElement("h4")
    this.#inputSecond = document.createElement("input");

    this.#buttonGroup = document.createElement("div");
    this.#minMaxButton = document.createElement("button");
    this.#minimizeIcon = document.createElement("img");
    this.#minimizeIcon.src = "resources/shrink.png";
    this.#maximizeIcon = document.createElement("img");
    this.#maximizeIcon.src = "resources/expand.png";
    this.#minMaxButton.append(this.#minimizeIcon);


    this.#statusIndicator = document.createElement("div");
    this.#finishedIcon = document.createElement("img");
    this.#unfinishedIcon = document.createElement("img");
    this.#finishedIcon.src = "resources/finished.png";
    this.#unfinishedIcon.src = "resources/unfinished.png";
    this.#statusIndicator.appendChild(this.#unfinishedIcon);

    this.#deleteButton = document.createElement("button");
    this.#deleteIcon = document.createElement("img");
    this.#deleteIcon.src = "resources/delete.png";
    this.#deleteButton.append(this.#deleteIcon);


    this.#buttonGroup.append(this.#minMaxButton, this.#deleteButton);
    this.#buttonGroup.classList.add("clearfix", "ButtonGroup");


    this.#task.className = "Task";
    this.#title.className = "Title";
    this.#inputTitle.className = "TitleInput";
    this.#hourLabel.className = "TimeLabel";
    this.#minuteLabel.className = "TimeLabel";
    this.#secondLabel.className = "TimeLabel";
    this.#statusIndicator.classList.add("clearfix", "TickStatus");

    this.#inputTitle.placeholder = "What are you up to ? ";

    this.#inputTitle.type = "text";
    this.#inputHour.type = "number";
    this.#inputMinute.type = "number";
    this.#inputSecond.type = "number";

    this.#inputHour.value = "0";
    this.#inputMinute.value = "0";
    this.#inputSecond.value = "0";

    this.#inputHour.min = 0;
    this.#inputMinute.min = 0;
    this.#inputSecond.min = 0;

    this.#hourLabel.innerHTML = "Hours : ";
    this.#minuteLabel.innerHTML = "Minutes : ";
    this.#secondLabel.innerHTML = "Seconds : ";


    this.#expanded = true;

    // Callback functions initialization
    this.#minimizeCallbackFunction = function (ev) {
      ev.stopPropagation();
      this.minimize();
    }.bind(this);

    this.#maximizeCallbackFunction = function (ev) {
      ev.stopPropagation();
      this.maximize();
    }.bind(this);

    this.#taskDoneCallbackFunction = function (ev) {
      ev.stopPropagation();
      this.done();
    }.bind(this);

    this.#taskUndoneCallbackFunction = function (ev) {
      ev.stopPropagation();
      this.undone();
    }.bind(this);

    this.#statusIndicator.addEventListener("click", this.#taskDoneCallbackFunction);
    this.#statusIndicator.style.display = "none";


    this.#task.append(this.#statusIndicator, this.#title, this.#inputTitle, this.#buttonGroup, newLine,
      this.#hourLabel, this.#inputHour, this.#hourLabelLineBreaker,
      this.#minuteLabel, this.#inputMinute, this.#minuteLabelLineBreaker, this.#secondLabel, this.#inputSecond);

    this.#deleteButton.addEventListener("click", function (ev) {
      ev.stopPropagation();
      this.delete();
    }.bind(this));

    this.#minMaxButton.addEventListener("click", this.#minimizeCallbackFunction);

  }

  minimize() {
    this.setExpanded(false);
    if (this.#inputTitle.value === "") {
      this.delete();
    } else {
      this.#title.innerHTML = this.#inputTitle.value;
      this.#inputTitle.style.visibility = "hidden";
      this.#inputTitle.style.width = "0%";

      this.#hourLabel.innerHTML = this.#inputHour.value + " Hours ";
      this.#minuteLabel.innerHTML = this.#inputMinute.value + " Minutes";
      this.#secondLabel.innerHTML = this.#inputSecond.value + " Seconds";

      this.#hourLabel.classList.add("TimeLabelMinimized");
      this.#minuteLabel.classList.add("TimeLabelMinimized");
      this.#secondLabel.classList.add("TimeLabelMinimized");

      this.#inputHour.style.display = "none";
      this.#inputMinute.style.display = "none";
      this.#inputSecond.style.display = "none";

      this.#hourLabelLineBreaker.className = "HideLineBreak";
      this.#minuteLabelLineBreaker.className = "HideLineBreak";

      this.#minMaxButton.replaceChild(this.#maximizeIcon, this.#minimizeIcon);
      this.#minMaxButton.removeEventListener("click", this.#minimizeCallbackFunction);
      this.#minMaxButton.addEventListener("click", this.#maximizeCallbackFunction);

      this.#statusIndicator.style.display = "inline-block";

      this.#task.addEventListener("click", this.select.bind(this));
      this.saveToStorage();
    }

  }

  maximize() {
    this.setExpanded(true);
    this.#title.innerHTML = "";
    this.#inputTitle.style.visibility = "";
    this.#inputTitle.style.width = "70%";
    this.#hourLabel.innerHTML = "Hour : ";

    this.#minuteLabel.innerHTML = "Minute: ";
    this.#secondLabel.innerHTML = "Second: ";
    this.#inputHour.style.display = "";


    this.#hourLabel.classList.remove("TimeLabelMinimized");
    this.#minuteLabel.classList.remove("TimeLabelMinimized");
    this.#secondLabel.classList.remove("TimeLabelMinimized");

    this.#inputMinute.style.display = "";
    this.#inputSecond.style.display = "";

    this.#hourLabelLineBreaker.className = "";
    this.#minuteLabelLineBreaker.className = "";

    this.#minMaxButton.replaceChild(this.#minimizeIcon, this.#maximizeIcon);
    this.#minMaxButton.removeEventListener("click", this.#maximizeCallbackFunction);
    this.#minMaxButton.addEventListener("click", this.#minimizeCallbackFunction);

    this.#statusIndicator.style.display = "none";
  }

  delete() {
    this.#task.remove();
    this.removeFromStorage();
  }

  select() {
    // Deselect other tasks
    for (let i = 0; i < output.getTasksList().length; i++) {
      if (output.getTasksList()[i].isSelected()) {
        output.getTasksList()[i].deselect();
        break;
      }
    }
    this.#selected = true;
    this.#task.classList.add("TaskSelected");
    let hour = parseInt(this.#inputHour.value);
    let minute = parseInt(this.#inputMinute.value);
    let second = parseInt(this.#inputSecond.value);
    output.setWorkingTitle(this.#title.innerHTML);
    timer.setTimer(hour, minute, second);
  }

  deselect() {
    this.#selected = false;
    this.#task.classList.remove("TaskSelected");
  }

  done() {
    this.#title.classList.add("TextStrikethrough");
    this.#hourLabel.classList.add("TextStrikethrough");
    this.#minuteLabel.classList.add("TextStrikethrough");
    this.#secondLabel.classList.add("TextStrikethrough");
    this.#statusIndicator.replaceChild(this.#finishedIcon, this.#unfinishedIcon);
    this.#statusIndicator.removeEventListener("click", this.#taskDoneCallbackFunction);
    this.#statusIndicator.addEventListener("click", this.#taskUndoneCallbackFunction);
    this.saveToStorage();

  }

  undone() {
    this.#title.classList.remove("TextStrikethrough");
    this.#hourLabel.classList.remove("TextStrikethrough");
    this.#minuteLabel.classList.remove("TextStrikethrough");
    this.#secondLabel.classList.remove("TextStrikethrough");
    this.#statusIndicator.replaceChild(this.#unfinishedIcon, this.#finishedIcon);
    this.#statusIndicator.removeEventListener("click", this.#taskUndoneCallbackFunction);
    this.#statusIndicator.addEventListener("click", this.#taskDoneCallbackFunction);
    this.saveToStorage();
  }

  saveToStorage() {
    let storage = window.localStorage;
    let finished = 0;
    if (this.#title.classList.contains("TextStrikethrough"))
      finished = 1;
    storage.setItem(this.#title.innerHTML, this.#inputHour.value + " " + this.#inputMinute.value + " " + this.#inputSecond.value + " " + finished);
  }

  removeFromStorage() {
    window.localStorage.removeItem(this.#title.innerHTML);
  }

  // Used to reload the tasks based on data stored in session storage
  updateSelf(title, hour, minutes, seconds, tick) {
    this.#inputTitle.value = title;
    this.#inputHour.value = hour;
    this.#inputMinute.value = minutes;
    this.#inputSecond.value = seconds;

    if (tick === 1) {
      this.done();
    }
    this.minimize();
  }

  getDiv() {
    return this.#task;
  }

  setExpanded(value) {
    this.#expanded = value;
  }

  isExpanded() {
    return this.#expanded;
  }

  isSelected() {
    return this.#selected;
  }

}

let timer = new Timer(0, 0, 0);
let output = new OutputManager();



