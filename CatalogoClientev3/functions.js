import API from "./api.js";

// ----- CLASE PRODUCTO --------
class Producto {

    constructor(id,name,description,price,file){

        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.file = file;
    }
}

// ---- VISUALIZAR FORMULARIO -------
const btn_addProduct = document.querySelector(".btn-addProduct");

btn_addProduct.addEventListener("click", () =>{

    const form_addProduct = document.querySelector(".form-addProduct");
    form_addProduct.classList.toggle("hidden");
});


//------ VALIDACIÓN DE DATOS -------
const catalogo = document.querySelector("#catalogo");
const send_product = document.querySelector("#send-product")
let catalogoLista = [];

send_product.addEventListener("click", (e)=> {

    e.preventDefault();
    validarDatos();
})

function validarDatos() {
    const idInput = document.querySelector("#id-product");
    const id = idInput.value.trim();
    const nameInput = document.querySelector("#name-product");
    const name = nameInput.value.trim();
    const descriptionInput = document.querySelector("#description-product");
    const description = descriptionInput.value.trim();
    const priceInput = document.querySelector("#price-product");
    const price = priceInput.value.trim();
    const fileInput = document.querySelector("#file-product");
    const file = fileInput.files[0];

    let valido = true;

    if (id === "") {
        mostrarError(idInput);
        valido = false;
    }

    if (name === "") {
        mostrarError(nameInput);
        valido = false;
    }

    if (description === "") {
        mostrarError(descriptionInput);
        valido = false;
    }

    if (isNaN(price) || Number(price) <= 0) {
        mostrarError(priceInput);
        valido = false;
    }

    if (!file) {
        mostrarError(fileInput);
        valido = false;
    }

    if(valido){
        const producto = new Producto(id,name,description,price,file);

        send_product.disabled = true;
        const originalText = send_product.textContent;
        send_product.textContent = "Guardando...";

        // Validamos la imagen primero
        API.validarImagen(file)  
        .then(() => API.guardarProducto(producto))
        .then(() => {
            catalogoLista.push(producto);
            visualizarProducto(producto);
            actualizarContador();
            limpiarInput();
            alert("Producto guardado correctamente");
        })
        .catch((err) => {
            alert(err); 
        })
        .finally(() => {
            send_product.disabled = false;
            send_product.textContent = originalText;
        });
    }   

}



function mostrarError(input) {
    const label = input.parentElement;

    label.style.color = "";
    label.style.color = "red";
    setTimeout(() => {
        label.style.color = "";
    }, 1000);
}

function limpiarInput(){
    document.querySelector("#id-product").value = "";
    document.querySelector("#name-product").value = "";
    document.querySelector("#description-product").value = "";
    document.querySelector("#price-product").value = "";
    document.querySelector("#file-product").value = "";
}



// ------- VISUALIZAR ---------
const menuConfirmacion = document.querySelector("#custom-context-menu");
const btnConfirmar = document.querySelector("#confirm-delete");
const btnCancelar = document.querySelector("#cancel-delete");

let productoParaBorrar = null; 
let cardParaBorrar = null;

function visualizarProducto(producto) {

    const catalogo = document.querySelector("#catalogo");

    // Crear tarjeta
    const card = document.createElement("div");
    card.classList.add("product-card");

    // Crear imagen SIN 
    const img = document.createElement("img");
    img.classList.add("product-img");
    img.src = URL.createObjectURL(producto.file);

    // Nombre (solo en hover)
    const nombre = document.createElement("div");
    nombre.classList.add("product-name-hover");
    nombre.textContent = producto.name;


    const info = document.createElement("div");
    info.classList.add("product-info");
    info.classList.add("hidden");

    info.innerHTML = `
        <p><b>ID:</b> ${producto.id}</p>
        <p><b>Nombre:</b> ${producto.name}</p>
        <p><b>Precio:</b> ${producto.price}€</p>
        <p><b>Descripción:</b> ${producto.description}</p>
    `;

    img.addEventListener("click", () => {
        info.classList.toggle("hidden");
    });


    card.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        
        // Guardamos las referencias de lo que queremos borrar
        productoParaBorrar = producto;
        cardParaBorrar = card;
        menuConfirmacion.classList.remove("hidden");
    });

    // Montado
    card.appendChild(img);
    card.appendChild(nombre);
    card.appendChild(info);
    catalogo.appendChild(card);
}


btnCancelar.addEventListener("click", () => {
    menuConfirmacion.classList.add("hidden");
    productoParaBorrar = null;
    cardParaBorrar = null;
});

btnConfirmar.addEventListener("click", async () => {
    if (productoParaBorrar && cardParaBorrar) {
        menuConfirmacion.classList.add("hidden"); // Ocultamos el menú
        cardParaBorrar.style.opacity = "0.5"; 

        try {
            await API.borrarProducto(productoParaBorrar.id); 
            cardParaBorrar.remove();

            // Eliminar del array local
            const index = catalogoLista.indexOf(productoParaBorrar);
            if (index > -1) {
                catalogoLista.splice(index, 1);
            }
            actualizarContador();
            alert("Producto eliminado");

        } catch (err) {
            cardParaBorrar.style.opacity = "1";
            alert("Error al borrar: " + err);
        } finally {
            productoParaBorrar = null;
            cardParaBorrar = null;
        }
    }
});


const contador = document.querySelector("#contador");

function actualizarContador() {
    contador.textContent = catalogoLista.length;
}