import API from "./api.js";

// CLASE PRODUCTO: Los datos recogidos de los imputs
// serviran para crear un Objeto de tipo Producto 
class Producto {

    constructor(id,name,description,price,file){

        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.file = file;
    }
}

// MOSTRAR/OCULTAR FORMULARIO: Botón que se encarga de mostrar
// o ocultar el formulario según se haga click.
const btn_addProduct = document.querySelector(".btn-addProduct");
const form_addProduct = document.querySelector(".form-addProduct");

btn_addProduct.addEventListener("click", () =>{

    form_addProduct.classList.toggle("hidden");

    if (form_addProduct.classList.contains("hidden")){
        btn_addProduct.textContent = "Haz click para añadir producto";
    }
    else{
        btn_addProduct.textContent= "Cerrar formulario";
    }
});


//VALIDACIÓN Y CREACIÓN DE PRODCUTO: Se reciben todos los datos
// se valora si son correcto no (mostrar mensaje de error)
// Tras eso se espera y se crea el producto internamente.

const send_product = document.querySelector("#input-addProduct")
let catalogoLista = [];

send_product.addEventListener("click", (e)=> {

    //Evitamos que se recarge la página tras hacer click
    e.preventDefault(); 
    validarDatos();
})

function validarDatos() {
    //Recogida del elemento input y del valor del input
    const idInput = document.querySelector("#id-product");
    const id = idInput.value.trim();
    const nameInput = document.querySelector("#name-product");
    const name = nameInput.value.trim();
    const descriptionInput = document.querySelector("#description-product");
    const description = descriptionInput.value.trim();
    const priceInput = document.querySelector("#price-product");
    const price = Number(priceInput.value.trim());
    const fileInput = document.querySelector("#file-product");
    const file = fileInput.files[0];

    //Valor que servirá para corroborar que los datos son correctos
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

    if (isNaN(price) || price <= 0) {
        mostrarError(priceInput);
        valido = false;
    }

    if (!file) {
        mostrarError(fileInput);
        valido = false;
    }

    if(valido){
        const producto = new Producto(id,name,description,price,file);

        //Fragemento que se encarga visualmente de informar
        //al usuario que se esta procesando su solicitud
        send_product.disabled = true; 
        const originalText = send_product.textContent;
        send_product.textContent = "Guardando...";

        // 
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
    //Forma de limpiar todos los inputs del formulario
    document.querySelector(".form-addProduct").reset();
}

// ------- VISUALIZAR ---------
const menuConfirmacion = document.querySelector(".custom-context-menu");
const btnConfirmar = document.querySelector(".confirm-delete");
const btnCancelar = document.querySelector(".cancel-delete");
const contador = document.querySelector("#contador");

let productoParaBorrar = null; 
let cardParaBorrar = null;

function visualizarProducto(producto) {

    const catalogo = document.querySelector(".grid-catalogo");

    // Crear tarjeta
    const card = document.createElement("div");
    card.classList.add("product-card");

    // Crear imagen SIN 
    const img = document.createElement("img");
    img.classList.add("product-img");

    const url = URL.createObjectURL(producto.file);
    img.src = url;

    img.onload = () => {
        URL.revokeObjectURL(url);
    };

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




function actualizarContador() {
    contador.textContent = catalogoLista.length;
}