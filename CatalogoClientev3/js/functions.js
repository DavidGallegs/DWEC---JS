// functions.js
const btnAddProduct = document.querySelector('.btn-addProduct');
const formAddProduct = document.querySelector('.form-addProduct');
const catalogo = document.getElementById('catalogo');
const contador = document.getElementById('contador');

const inputId = document.getElementById('id-product');
const inputName = document.getElementById('name-product');
const inputDescription = document.getElementById('description-product');
const inputPrice = document.getElementById('price-product');
const inputImage = document.getElementById('image-product');
const btnSend = document.getElementById('send-product');

const contextMenu = document.getElementById('custom-context-menu');
let cardToDelete = null;

// Mostrar/Ocultar formulario
btnAddProduct.addEventListener('click', () => {
    formAddProduct.classList.toggle('hidden');
});

// --- VALIDACIÓN ASÍNCRONA DE IMAGEN ---
function validarImagen(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject("Debes seleccionar un archivo de imagen");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => resolve(reader.result); // Devuelve base64
            img.onerror = () => reject("La imagen no se puede cargar");
            img.src = reader.result;
        };
        reader.onerror = () => reject("Error leyendo la imagen");
        reader.readAsDataURL(file);
    });
}

// --- VALIDACIÓN SÍNCRONA ---
function validarFormulario(id, name, description, price) {
    if (!id || !name || !description || !price) {
        alert("Todos los campos son obligatorios");
        return false;
    }
    if (isNaN(price)) {
        alert("El precio debe ser un número");
        return false;
    }
    return true;
}

// --- FUNCION GUARDAR PRODUCTO ---
async function guardarProducto(e) {
    e.preventDefault();

    const id = inputId.value.trim();
    const name = inputName.value.trim();
    const description = inputDescription.value.trim();
    const price = inputPrice.value.trim();
    const file = inputImage.files[0];

    if (!validarFormulario(id, name, description, price)) return;

    // Deshabilitar botón y mostrar feedback
    btnSend.disabled = true;
    btnSend.value = "Guardando...";

    try {
        const imagenData = await validarImagen(file);

        const producto = { id, nombre: name, descripcion: description, precio: price, imagen: imagenData };

        const response = await fetch("../php/api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "guardar", producto })
        });

        const result = await response.json();

        if (result.success) {
            agregarCard(producto);
            formAddProduct.reset();
            alert(result.message);
        } else {
            alert(result.error);
        }
    } catch (err) {
        alert(err);
    } finally {
        btnSend.disabled = false;
        btnSend.value = "Enviar Producto";
    }
}

// --- CREAR CARD EN DOM ---
function agregarCard(producto) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.dataset.id = producto.id;

    card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="product-name-hover">${producto.nombre}</div>
        <div class="product-info">
            <p>ID: ${producto.id}</p>
            <p>${producto.descripcion}</p>
            <p>Precio: $${producto.precio}</p>
        </div>
    `;

    // Borrado click derecho
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        cardToDelete = card;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.classList.remove('hidden');
    });

    catalogo.appendChild(card);
    actualizarContador();
}

// --- ACTUALIZAR CONTADOR ---
function actualizarContador() {
    contador.textContent = catalogo.children.length;
}

// --- BORRADO CON CONTEXT MENU ---
document.getElementById('confirm-delete').addEventListener('click', async () => {
    if (!cardToDelete) return;

    cardToDelete.style.opacity = '0.5';

    const id = cardToDelete.dataset.id;

    try {
        const response = await fetch(`../php/api.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "borrar", id })
        });
        const result = await response.json();

        if (result.success) {
            cardToDelete.remove();
            actualizarContador();
        } else {
            alert(result.error);
            cardToDelete.style.opacity = '1';
        }
    } catch (err) {
        alert("Error de conexión al borrar");
        cardToDelete.style.opacity = '1';
    } finally {
        contextMenu.classList.add('hidden');
        cardToDelete = null;
    }
});

document.getElementById('cancel-delete').addEventListener('click', () => {
    contextMenu.classList.add('hidden');
    cardToDelete = null;
});

// --- EVENTO SUBMIT ---
formAddProduct.addEventListener('submit', guardarProducto);
