class API {

    //Privatización
    static #db = [];

    static probabilidad(num) {
        return Math.random() * 100 < num;
    }

    // ---GUARDAR PRODUCTO ---
    static guardarProducto(producto) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {

                const existe = API.#db.some(productos => productos.id === producto.id);

                if (existe) {
                    reject("Error: El ID ya existe");
                } else {
                    API.#db.push(producto);
                    resolve("Producto guardado");
                }
            }, 2000);
        });
    }

    // ---- 2. BORRAR PRODUCTO ----
    static borrarProducto(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {


                const errorAleatorio = API.probabilidad(10);
                if (errorAleatorio) {
                    reject("Error del servidor al borrar");
                    return;
                }

                // Buscar índice del producto
                const index = API.#db.findIndex(producto => producto.id === id);

                if (index === -1) {
                    reject("Error: Producto no encontrado");
                } else {
                    API.#db.splice(index, 1);
                    resolve("Producto borrado");
                }
            }, 1500);

        });
    }

    // --- VALIDAD IMAGEN ---
    static validarImagen(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => resolve();
            img.onerror = () => reject("Error: la imagen no se puede cargar");
        });
    }

}

export default API;