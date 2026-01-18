// Realizado por David Gallegos

// ---- CREACIÓN DEL MAPA Y OBTENCIÓN DEL CANVAS ----
const mapa = L.map("map").setView([0, 0], 2);
// Array con coordenadas guardadas
let ubicaciones = JSON.parse(localStorage.getItem("ubicaciones") || "[]"); 
// Array para guardar los marcadores de Leaflet
let marcadoresMapa = []; 

// Canvas donde se mostrarán las coordenadas
const lienzo = document.getElementById("lienzo"); 

const contexto = lienzo.getContext("2d"); 
const latencia = document.getElementById("lat"); 
const longitud = document.getElementById("lng"); 



// Mapa base de OpenStreetMap
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(mapa);

// ---- EVENTOS E INICIALIZACIONES----
// Usamos click para añadir un marcador, luego la propiedad mousemove para ver coordenadas en tiempo real
mapa.on('click', añadirMarcador);
mapa.on('mousemove', mostrarCoordenadas); 
actualizarMapa();
actualizarCanvas();

// --- FUNCIÓN PARA DIBUJAR EN EL CANVAS ---
function actualizarCanvas() {
    // Ajusta el tamaño del canvas al tamaño del contenedor
    lienzo.width = lienzo.offsetWidth;
    lienzo.height = lienzo.offsetHeight;

    // Resetea cualquier dibujo previo
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);

    if (ubicaciones.length === 0) return;

    const espacioEntreMarcadores = 30; // Espacio vertical entre cada marcador
    const margen = 20; // Margen desde la izquierda

    contexto.font = "20px system-ui";

    // Recogida de datos 
    ubicaciones.forEach((coord, index) => {
        const y = 30 + index * espacioEntreMarcadores; 
        contexto.fillText(
            `Marcador ${index + 1}: ${coord.lat.toFixed(3)}, ${coord.lng.toFixed(3)}`,
            margen,
            y
        );
    });
}


// --- FUNCIÓN DE ALMACENAMIENTO EN LOCALSTORAGE ---
function guardarUbicaciones() {
    // Guarda el array de ubicaciones en localStorage
    localStorage.setItem("ubicaciones", JSON.stringify(ubicaciones));

    //Actualizamos los marcadores en el mapa y la lista del Canvas
    actualizarMapa();
    actualizarCanvas();
}


// --- FUNCIÓN PARA ACTUALIZAR LOS MARCADORES EN EL MAPA ---
function actualizarMapa() {
    // Eliminamoss todos los marcadores actuales del mapa
    marcadoresMapa.forEach(marker => mapa.removeLayer(marker));
    marcadoresMapa = [];

    // Añade nuevamente los marcadores desde el array de ubicaciones, ya que hemos 'limpiado'
    ubicaciones.forEach((coord, index) => {
        const marker = L.marker([coord.lat, coord.lng])
            .addTo(mapa)
            .bindPopup(`Marcador ${index + 1}`);
        marcadoresMapa.push(marker);
    });
}


// ---- FUNCIÓN PARA MOSTRAR COORDENADAS DEL CURSOR ----
function mostrarCoordenadas(e) {
    latencia.innerText = e.latlng.lat.toFixed(3);
    longitud.innerText = e.latlng.lng.toFixed(3);
}


// ---- FUNCIÓN PARA AÑADIR UN NUEVO MARCADOR ----
function añadirMarcador(e) {
    ubicaciones.push({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
    });
    // Y luego la guardamos en localStorage
    guardarUbicaciones(); 
}