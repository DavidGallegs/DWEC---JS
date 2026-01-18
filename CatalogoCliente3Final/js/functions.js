// --- API: Creamos una clase API ---
class API {
    constructor() {
        this.productos = new Map();
    }

    validarImagen(url) {
        return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject("La imagen no se puede cargar");
        img.src = url;
        });
    }

    guardarEnMemoria(producto) {
        this.productos.set(producto.id, producto);
    }

    borrarEnMemoria(id) {
        this.productos.delete(id);
    }
}


// --- FORMULARIO: Mostrar y ocultar formulario ----
const btn = document.getElementById("btn-toggle");
const form = document.getElementById("form");

btn.addEventListener("click", () => {
    if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "block";
        btn.innerText = "Ocultar formulario";
    } else {
        form.style.display = "none";
        btn.innerText = "Mostrar formulario";
    }
});


// --- FUNCIÓN VALIDAR FORMULARIO ---
async function validarFormulario(event) {

    event.preventDefault();


    let input = document.getElementById("IDProd");
    let errorSpan = document.getElementById("errorID");
    let valueID = input.value.trim();

    //Reinicio de errores
    ["IDProd", "producto", "precio", "seleccionarImagen"].forEach((id) => {
        document.getElementById(id).classList.remove("error-input");
    });
    ["errorID", "errorProd", "errorPrecio", "errorImg"].forEach((id) => {
        document.getElementById(id).innerHTML = "";
    });

    //Comprobación de que se ha puesto un ID
    if (!valueID) {
        input.classList.add("error-input");
        errorSpan.innerHTML = "Por favor introduzca un ID";
        return false;
    }

    // Comprobacuón de nombre producto
    input = document.getElementById("producto");
    errorSpan = document.getElementById("errorProd");
    let valueProd = input.value.trim();
    if (!valueProd) {
        input.classList.add("error-input");
        errorSpan.innerHTML = "Por favor introduzca el nombre del producto. <br>";
        return false;
    }

    // Comprobación de precio
    input = document.getElementById("precio");
    errorSpan = document.getElementById("errorPrecio");
    let valuePrecio = Number(input.value);
    if (valuePrecio < 0) {
        input.classList.add("error-input");
        errorSpan.innerHTML = "Por favor introduzca un precio válido. <br>";
        return false;
    }
    let inputImg = document.getElementById("seleccionarImagen");
    errorSpan = document.getElementById("errorImg");

    //Comprobación para que haya una imagen
    if (inputImg.files.length == 0) {
        inputImg.classList.add("error-input");
        errorSpan.innerHTML = "Por favor introduzca una imagen. <br>";
        return false;
    }

    //Descripción no precisa de comprobación
    input = document.getElementById("descripcion");
    let valueDesc = input.value.trim();
    const producto = {
        id: valueID,
        valueProd,
        valueDesc,
        valuePrecio,
        inputImg: inputImg.files[0].name,
    };

    //Creo una constante que apunte al elemento botón
    const btnForm = document.getElementById("button");
    //Desactivamos el boton
    btnForm.setAttribute("disabled", "disabled");


    btnForm.innerText = "Guardando...";
    const img = inputImg.files[0];
    //Recojo el url de la imagen
    const url = URL.createObjectURL(img);
    //Paso la url al método

    try {
        await api.validarImagen(url);
        const response = await fetch("../php/api.php?action=guardar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
        });

        const data = await response.json();

        if (data.success) {
        // ÉXITO
        api.guardarEnMemoria(producto);
        hacerTabla(producto.id, document.getElementById("seleccionarImagen"));
        document.getElementById("form").reset();
        document.getElementById("exito").innerText = "Producto añadido";
        } else {
        if (data.error && data.error.includes("ID")) {
            const inputID = document.getElementById("IDProd");
            const errorID = document.getElementById("errorID");
            inputID.classList.add("error-input");
            errorID.innerHTML = data.error;
        } else {
            alert("Error del servidor: " + data.error);
        }
        return false;
        }
    } catch (err) {
        alert("Error de conexión con el servidor");
        console.error(err);
    } finally {
        btnForm.removeAttribute("disabled");
        btnForm.innerText = "Añadir producto";
    }
    return true;
}

// Creamos la tabla del grid
function hacerTabla(valueID, inputImg) {
    let tabla = document.getElementById("grid");
    //Si no hay nada, se crea la tabla
    if (tabla.innerHTML.trim() === "") {
        tabla.style.display = "grid";
        tabla.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 1fr))";
        tabla.style.gap = "10px";
        tabla.style.margin = "20px";
    }

    //Recojo la imagen, creo una url con la dirección de la imagen y creo una celda donde estará esa imagen
    const archivo = inputImg.files[0];
    const url = URL.createObjectURL(archivo);
    const celda = document.createElement("div");
    celda.className = `${valueID}`;
    celda.innerHTML = `
                <img width="200" height="200" id="${valueID}" src="${url}" alt="imagen del producto"  style="border: 2px solid #333; border-radius: 6px; padding: 10px;">
            `;
    tabla.appendChild(celda);
}

// --- LISTENERS ---
//Función para que si se hoverea sobre una imagen, aparece el nombre
document.addEventListener("mouseover", function (ev) {
    if (ev.target.tagName === "IMG") {
        nombreImagen(ev);
    }
});

//Cuando se quite el ratón, se elimina el nombre
document.addEventListener("mouseout", function (ev) {
    if (ev.target.tagName === "IMG") {
        eliminarNombreImagen(ev);
    }
});

//Si hago click derecho sobre una imagen, esto hará que se muestren los valores
document.addEventListener("click", function (ev) {
    if (ev.target.tagName === "IMG") {
        mostrarValores(ev);
    }
});

//Si hago click izquierdo, prevengo el contextmenu y hago que el producto se elimine
document.addEventListener("contextmenu", async (ev) => {
    if (ev.target.tagName !== "IMG") return;
    ev.preventDefault();

    const card = ev.target.parentElement;
    const id = ev.target.id;
    card.style.opacity = "0.5";

    try {
        const res = await fetch(`../php/api.php?action=borrar&id=${id}`);
        const data = await res.json();
        if (!data.success) throw data.error;
        api.borrarEnMemoria(id);
        card.remove();
    } catch {
        card.style.opacity = "1";
        alert("Error al borrar");
    }
});


// --- FUNCIÓN PARA MOSTRAR EL NOMBRE DEL PRODUCTO ----
function nombreImagen(ev) {
    const id = ev.target.id;
    //Esto sirve para que no se repita el nombre
    if (ev.target.parentElement.querySelector(".nombreProd")) return;
    const nombre = document.createElement("div");
    nombre.className = "nombreProd";
    const prod = api.productos.get(id);
    nombre.innerText = prod.valueProd;
    ev.target.parentElement.appendChild(nombre);
}

// FUNCIÓN PARA ELIMINAR EL NOMBRE DEL PRODUCTO ---
function eliminarNombreImagen(ev) {
    const element = document.getElementsByClassName("nombreProd");
    if (element.length > 0) {
        element[0].remove();
    }
    document.getElementById("exito").innerText = "";
}

//--- FUNCIÓN DE MOSTRAR VALORES ----
function mostrarValores(ev) {
    const id = ev.target.id;
    const prod = api.productos.get(id);
    //Si ya los he mostrado, no se repite
    if (ev.target.parentElement.querySelector(".infoProd")) return;
    const nombre = document.createElement("div");
    nombre.className = "infoProd";
    nombre.innerHTML = `
            ID: ${prod.id} <br>
            Nombre: ${prod.valueProd} <br>
            Descripción: ${prod.valueDesc} <br>
            Precio: ${prod.valuePrecio}
        `;
    ev.target.parentElement.appendChild(nombre);
}

// --- FUNCIÓN PARA ELIMINAR PRODUCTOS ---
function eliminarProducto(ev) {
    const id = ev.target.id;
    const element = document.getElementsByClassName(`${id}`);
    element[0].remove();
}