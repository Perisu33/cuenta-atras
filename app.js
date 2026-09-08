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
// CONVERTIR UNA FECHA A MEDIANOCHE LOCAL
// ------------------------------------

function getLocalMidnight(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
}


// ------------------------------------
// OBTENER LA FECHA DE HOY
// ------------------------------------

function getTodayMidnight() {

    const now = new Date();

    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
}


// ------------------------------------
// CALCULAR DÍAS RESTANTES
// ------------------------------------

function calculateDaysRemaining(targetDateString) {

    const today = getTodayMidnight();
    const target = getLocalMidnight(targetDateString);

    const difference = target.getTime() - today.getTime();

    return Math.max(
        0,
        Math.round(difference / 86400000)
    );
}


// ------------------------------------
// TIEMPO HASTA EL PRÓXIMO DÍA
// ------------------------------------

function getTimeUntilNextDay() {

    const now = new Date();

    const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0
    );

    return tomorrow.getTime() - now.getTime();
}


// ------------------------------------
// INICIAR CUENTA ATRÁS
// ------------------------------------

startButton.addEventListener("click", () => {

    const targetDate = targetDateInput.value;

    if (!targetDate) {
        alert("Selecciona una fecha primero.");
        return;
    }

    const today = getTodayMidnight();
    const target = getLocalMidnight(targetDate);

    if (target <= today) {
        alert("Selecciona una fecha posterior a hoy.");
        return;
    }

    const data = {
        targetDate: targetDate
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    showCountdown();

    startTimer();
});


// ------------------------------------
// MOSTRAR CUENTA ATRÁS
// ------------------------------------

function showCountdown() {

    const data = getSavedData();

    if (!data) {
        return;
    }

    setup.classList.add("hidden");
    countdown.classList.remove("hidden");

    const date = getLocalMidnight(data.targetDate);

    dateText.textContent = date.toLocaleDateString(
        "es-ES",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


// ------------------------------------
// ACTUALIZAR TODO
// ------------------------------------

function updateCountdown() {

    const data = getSavedData();

    if (!data) {
        return;
    }

    const target = getLocalMidnight(data.targetDate);
    const today = getTodayMidnight();

    const daysRemaining = calculateDaysRemaining(
        data.targetDate
    );

    daysElement.textContent = daysRemaining;


    // --------------------------------
    // SI HA LLEGADO EL DÍA
    // --------------------------------

    if (today >= target) {

        daysElement.textContent = "0";

        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        message.textContent =
            "🎉 ¡Ha llegado el día!";

        clearInterval(timer);

        return;
    }


    // --------------------------------
    // TIEMPO HASTA EL PRÓXIMO CAMBIO
    // --------------------------------

    const remaining = getTimeUntilNextDay();

    const hours = Math.floor(
        remaining / 3600000
    );

    const minutes = Math.floor(
        (remaining % 3600000) / 60000
    );

    const seconds = Math.floor(
        (remaining % 60000) / 1000
    );


    hoursElement.textContent =
        String(hours).padStart(2, "0");

    minutesElement.textContent =
        String(minutes).padStart(2, "0");

    secondsElement.textContent =
        String(seconds).padStart(2, "0");


    message.textContent =
        "El contador baja 1 día cada medianoche.";
}


// ------------------------------------
// INICIAR TEMPORIZADOR
// ------------------------------------

function startTimer() {

    clearInterval(timer);

    updateCountdown();

    timer = setInterval(() => {

        updateCountdown();

    }, 1000);
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
// RECUPERAR DATOS GUARDADOS
// ------------------------------------

function getSavedData() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return null;
    }

    try {

        return JSON.parse(saved);

    } catch (error) {

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

    targetDateInput.value =
        data.targetDate;

    showCountdown();

    startTimer();
}


// ------------------------------------
// INICIAR AL CARGAR
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
