document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los elementos del DOM
    const startBtn = document.getElementById('start-btn');
    const gameContainer = document.getElementById('game-container');
    const startContainer = document.getElementById('start-container');
    const triviaContainer = document.getElementById('trivia-container');
    const resultContainer = document.getElementById('result-container');
    const resultDiv = document.getElementById('result');
    const restartBtn = document.getElementById('restart-btn');
    const timerDiv = document.getElementById('timer'); // Asegúrate de que este elemento exista
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');

    let questions = []; // Array para almacenar las preguntas
    let currentQuestionIndex = 0; // Índice de la pregunta actual
    let score = 0; // Puntuación del jugador
    let timer; // Variable para el temporizador

    // Cargar sonidos
    const correctSound = new Audio('sounds/correct.mp3');
    const incorrectSound = new Audio('sounds/incorrect.mp3');
    const timerSound = new Audio('sounds/timer.mp3'); // Añadir el sonido del temporizador

    // Pre-cargar sonidos
    correctSound.load();
    incorrectSound.load();
    timerSound.load();

    // Función para mezclar el array de preguntas
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Función para seleccionar 4 respuestas aleatorias, incluyendo siempre la correcta
    function getRandomAnswers(answers, correctAnswer) {
        const shuffledAnswers = shuffle([...answers.filter(answer => answer !== correctAnswer)]);
        const selectedAnswers = shuffledAnswers.slice(0, 3); // Seleccionar 3 respuestas aleatorias
        selectedAnswers.push(correctAnswer); // Añadir la respuesta correcta
        return shuffle(selectedAnswers); // Mezclar las respuestas seleccionadas
    }

    // Cargar las preguntas desde un archivo JSON
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = shuffle(data); // Mezclar las preguntas
        })
        .catch(error => console.error('Error al cargar las preguntas:', error));

    // Evento para iniciar el juego
    startBtn.addEventListener('click', () => {
        startContainer.style.display = 'none';
        gameContainer.style.display = 'block';
        displayQuestion();
    });

    // Evento para reiniciar el juego
    restartBtn.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        startContainer.style.display = 'block';
        currentQuestionIndex = 0;
        score = 0;
    });

    // Función para mostrar una pregunta
    function displayQuestion() {
        triviaContainer.innerHTML = '';
        const question = questions[currentQuestionIndex];
        const randomAnswers = getRandomAnswers(question.answers, question.correct); // Obtener 4 respuestas aleatorias, incluyendo la correcta
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('mb-4');
        questionDiv.innerHTML = `
            <h5>${question.question}</h5>
            ${randomAnswers.map((answer, i) => `
                <div class="option-box" data-answer="${answer}">
                    ${answer}
                </div>
            `).join('')}
        `;
        triviaContainer.appendChild(questionDiv);

        // Añadir eventos de clic a las opciones
        const options = questionDiv.querySelectorAll('.option-box');
        options.forEach(option => {
            option.addEventListener('click', (event) => {
                checkAnswer(event.target);
                disableOptions(); // Deshabilitar opciones después de seleccionar una respuesta
            });
        });

        startTimer();
        updateProgressBar(); // Actualizar la barra de progreso
    }

    // Función para deshabilitar las opciones
    function disableOptions() {
        const options = document.querySelectorAll('.option-box');
        options.forEach(option => {
            option.style.pointerEvents = 'none'; // Deshabilitar clics en las opciones
        });
    }

    // Función para iniciar el temporizador
    function startTimer() {
        let timeLeft = 15;
        timerDiv.innerText = timeLeft; // Mostrar solo el número
        timerSound.play(); // Reproducir el sonido del temporizador una vez al inicio
        timer = setInterval(() => {
            timeLeft--;
            timerDiv.innerText = timeLeft; // Mostrar solo el número

            if (timeLeft <= 0) {
                clearInterval(timer);
                timerSound.pause(); // Detener el sonido del temporizador
                timerSound.currentTime = 0; // Reiniciar el sonido del temporizador
                markAsIncorrect(); // Marcar la pregunta como incorrecta
            }
        }, 1000);
    }

    // Función para marcar la pregunta como incorrecta cuando el tiempo se termina
    function markAsIncorrect() {
        incorrectSound.currentTime = 0; // Reiniciar el sonido incorrecto
        incorrectSound.play(); // Reproducir sonido incorrecto
        showExplanation(); // Mostrar la explicación
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
            } else {
                endGame();
            }
        }, 3000); // Aumentar el tiempo de espera para leer la explicación
    }

    // Función para verificar la respuesta seleccionada
    function checkAnswer(selectedOption) {
        clearInterval(timer);
        timerSound.pause(); // Detener el sonido del temporizador
        timerSound.currentTime = 0; // Reiniciar el sonido del temporizador

        const correctAnswer = questions[currentQuestionIndex].correct;
        if (selectedOption.dataset.answer === correctAnswer) {
            score++;
            selectedOption.classList.add('bg-success');
            correctSound.currentTime = 0; // Reiniciar el sonido correcto
            correctSound.play(); // Reproducir sonido correcto
        } else {
            selectedOption.classList.add('bg-danger');
            incorrectSound.currentTime = 0; // Reiniciar el sonido incorrecto
            incorrectSound.play(); // Reproducir sonido incorrecto
        }

        showExplanation(); // Mostrar la explicación

        // Esperar un segundo y pasar a la siguiente pregunta
        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
            } else {
                endGame();
            }
        }, 3000); // Aumentar el tiempo de espera para leer la explicación
    }

    // Función para mostrar la explicación de la respuesta correcta
    function showExplanation() {
        const explanation = questions[currentQuestionIndex].explanation;
        const explanationDiv = document.createElement('div');
        explanationDiv.classList.add('mt-3');
        explanationDiv.innerText = explanation;
        explanationDiv.classList.add('explanation');
        triviaContainer.appendChild(explanationDiv);
    }

    // Función para actualizar la barra de progreso
    function updateProgressBar() {
        const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
        progress.style.width = `${progressPercentage}%`;
        progress.setAttribute('aria-valuenow', progressPercentage);
    }

    // Función para finalizar el juego y mostrar la puntuación
    function endGame() {
        // Detener todos los sonidos
        correctSound.pause();
        correctSound.currentTime = 0;
        incorrectSound.pause();
        incorrectSound.currentTime = 0;
        timerSound.pause();
        timerSound.currentTime = 0;

        gameContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultDiv.innerText = `Tu puntuación es: ${score} de ${questions.length}`;
    }
});