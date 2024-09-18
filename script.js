// Crear un ahorcado con JS, aplicar arrays, clases y APIs. El front debe solicitar respuesta de una palabra (fetch o Axios) y a partir de ahí se ejecuta el juego. 

class Ahorcado {
    constructor(palabra) {
        this.palabra = palabra;
        this.palabraAdivinada = Array(palabra.length).fill('_');
        this.letrasIncorrectas = [];
        this.errores = 0;
        this.maxErrores = 6;
    }

    adivinarLetra(letra) {
        let esCorrecta = false;
        for (let i = 0; i < this.palabra.length; i++) {
            if (this.palabra[i] === letra) {
                this.palabraAdivinada[i] = letra;
                esCorrecta = true;
            }
        }
        if (!esCorrecta) {
            if (!this.letrasIncorrectas.includes(letra)) {
                this.letrasIncorrectas.push(letra);
                this.errores++;
            }
        }
        return esCorrecta;
    }

    juegoTerminado() {
        return this.errores >= this.maxErrores || this.palabraAdivinada.join('') === this.palabra;
    }

    adivino() {
        return this.palabraAdivinada.join('') === this.palabra;
    }
}

let juego;
const mostrarPalabra = document.getElementById('display-palabra');
const mostrarMensaje = document.getElementById('mensaje');
const estadoAhorcado = document.getElementById('errores');
const letrasIncorrectasMostrar = document.getElementById('letrasIncorrectas');
const botonAdivinar = document.getElementById('boton');
const entradaLetra = document.getElementById('inputLetras');

// Obtener una palabra aleatoria de la API
async function obtenerPalabraAleatoria() {
    const respuesta = await fetch('https://clientes.api.greenborn.com.ar/public-random-word');
    const data = await respuesta.json();
    return data[0].toLowerCase(); 
}

// Función que actualiza la pantalla tras algún error y cuenta las letras incorrectas 
function actualizarPantalla() {
    mostrarPalabra.textContent = juego.palabraAdivinada.join(' ');
    estadoAhorcado.textContent = `Errores (6 max): ${juego.errores}`;
    letrasIncorrectasMostrar.textContent = `Letras incorrectas: ${juego.letrasIncorrectas.join(', ')}`;
}

// Función para verificar si la letra ingresada es correcta o incorrecta 
function gestionarAdivinanza() {
    const letra = entradaLetra.value.toLowerCase();
    entradaLetra.value = '';

    if (!letra || letra.length !== 1 || !/^[a-z]$/.test(letra)) {
        mostrarMensaje.textContent = 'Por favor, ingresa una letra válida';
        return;
    }

    if (juego.letrasIncorrectas.includes(letra) || juego.palabraAdivinada.includes(letra)) {
        mostrarMensaje.textContent = 'Ya has adivinado esa letra';
        return;
    }

    const esCorrecta = juego.adivinarLetra(letra);
    actualizarPantalla();
    
    if (juego.adivino()) { // En caso de adivinar, muestra un mensaje al usuario de que ganó 
        mostrarMensaje.textContent = '¡Felicidades! Has ganado';
        botonAdivinar.disabled = true;
    } else if (juego.juegoTerminado()) {
        mostrarMensaje.textContent = `Perdiste. La palabra era: ${juego.palabra}`; // En caso de perder, muestra un mensaje de que el usuario perdió 
        botonAdivinar.disabled = true;
    } else {
        mostrarMensaje.textContent = esCorrecta ? '¡Adivinaste una letra!' : 'Letra incorrecta'; // Muestra un mensaje al adivinar una letra o al equivocarse  
    }
}

// Función para iniciar el juego 
async function inicializarJuego() {
    const palabra = await obtenerPalabraAleatoria();
    juego = new Ahorcado(palabra);
    actualizarPantalla();
    mostrarMensaje.textContent = '';
    botonAdivinar.disabled = false;
}

botonAdivinar.addEventListener('click', gestionarAdivinanza);
entradaLetra.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        gestionarAdivinanza();
    }
});

// Función para cargar las puntuaciones desde la base de datos
async function cargarPuntuaciones() {
    const respuesta = await fetch('api/scores');
    const puntuaciones = await respuesta.json();
    const tabla = document.getElementById('highScoresList').getElementsByTagName('tbody')[0];
    tabla.innerHTML = ''; // Limpiar tabla antes de añadir nuevas filas
    puntuaciones.forEach(score => {
        let fila = tabla.insertRow();
        fila.insertCell(0).textContent = score.nombre;
        fila.insertCell(1).textContent = score.puntos;
        fila.insertCell(2).textContent = score.tiempo;
        fila.insertCell(3).textContent = score.fecha;
    });
}

// Función para guardar una puntuación
async function guardarPuntuacion(nombre, puntos, tiempo) {
    const fecha = new Date().toISOString().slice(0, 10); // Fecha actual en formato YYYY-MM-DD
    await fetch('api/scores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({nombre, puntos, tiempo, fecha})
    });
    cargarPuntuaciones(); // Actualiza la lista de puntuaciones
}

document.getElementById('guardarScore').addEventListener('click', () => {
    guardarPuntuacion('NombreDelJugador', 100, 30); 
});

inicializarJuego();
cargarPuntuaciones();
