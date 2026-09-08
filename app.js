const targetDateInput = document.getElementById("targetDate");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");

const setup = document.getElementById("setup");
const countdown = document.getElementById("countdown");

const dateText = document.getElementById("dateText");
const daysElement = document.getElementById("days");

const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

const message = document.getElementById("message");

const STORAGE_KEY = "cuenta_atras";

let timer = null;


// ------------------------------------
// INICIAR CUENTA ATRÁS
// ------------------------------------

startButton.addEventListener("click", () => {

    const targetDate = targetDateInput.value;

    if (!targetDate) {
        alert("Selecciona una fecha primero.");
        return;
    }

    const target = new Date(`${targetDate}T00:00:00`);
    const now = new Date();

    if (target <= now) {
        alert("La fecha debe ser posterior a hoy.");
        return;
    }

    const startTime = Date.now();

    const data = {
        targetDate: targetDate,
        startTime: startTime
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    showCountdown();

    updateCountdown();
});


// ------------------------------------
// MOSTRAR CUENTA ATRÁS
// ------------------------------------

function showCountdown() {

    setup.classList.add("hidden");
    countdown.classList.remove("hidden");

    const data = getSavedData();

    if (!data) {
        return;
    }

    const date = new Date(`${data.targetDate}T00:00:00`);

    dateText.textContent = date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// ------------------------------------
// ACTUALIZAR TEMPORIZADOR
// ------------------------------------

function updateCountdown() {

    const data = getSavedData();

    if (!data) {
        return;
    }

    const target = new Date(`${data.targetDate}T00:00:00`);
    const now = Date.now();

    const elapsed = now - data.startTime;

    const totalDays = Math.floor(
        (target.getTime() - data.startTime) / 86400000
    );

    let completedDays = Math.floor(elapsed / 86400000);

    let remainingDays = totalDays - completedDays;

    if (remainingDays < 0) {
        remainingDays = 0;
    }

    daysElement.textContent = remainingDays;


    // Tiempo hasta el próximo descenso de día

    const millisecondsInDay = 86400000;

    let remainingMilliseconds =
        millisecondsInDay - (elapsed % millisecondsInDay);

    if (remainingMilliseconds === millisecondsInDay) {
        remainingMilliseconds = 0;
    }

    let hours = Math.floor(
        remainingMilliseconds / 3600000
    );

    let minutes = Math.floor(
        (remainingMilliseconds % 3600000) / 60000
    );

    let seconds = Math.floor(
        (remainingMilliseconds % 60000) / 1000
    );


    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");


    // Cuando llega la fecha

    if (now >= target.getTime()) {

        daysElement.textContent = "0";

        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        message.textContent = "🎉 ¡Ha llegado el día!";

        return;
    }

    message.textContent =
        "El contador baja 1 día cada 24 horas.";
}


// ------------------------------------
// CAMBIAR FECHA
// ------------------------------------

resetButton.addEventListener("click", () => {

    clearInterval(timer);

    localStorage.removeItem(STORAGE_KEY);

    countdown.classList.add("hidden");
    setup.classList.remove("hidden");

    targetDateInput.value = "";

    message.textContent = "";
});


// ------------------------------------
// RECUPERAR DATOS
// ------------------------------------

function getSavedData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return null;
    }

    try {
        return JSON.parse(saved);
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}


// ------------------------------------
// AL ABRIR LA APP
// ------------------------------------

function loadSavedCountdown() {

    const data = getSavedData();

    if (!data) {
        return;
    }

    targetDateInput.value = data.targetDate;

    showCountdown();

    updateCountdown();

    timer = setInterval(updateCountdown, 1000);
}


// ------------------------------------
// INICIAR
// ------------------------------------

loadSavedCountdown();


// ------------------------------------
// SERVICE WORKER
// ------------------------------------

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("./sw.js")
            .catch(error => {
                console.log(
                    "Service Worker no disponible:",
                    error
                );
            });

    });

}
