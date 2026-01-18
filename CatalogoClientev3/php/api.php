<?php
header('Content-Type: application/json');

// CONFIGURACIÓN DE CONEXIÓN
$host = "fdb1032.awardspace.net"; 
$user = "4717043_david";
$pass = "50630251Y";
$db   = "4717043_david";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Error de conexión: " . $conn->connect_error]);
    exit;
}

// LEER JSON ENTRANTE
$input = json_decode(file_get_contents("php://input"), true);
$action = $input['action'] ?? null;

if (!$action) {
    echo json_encode(["success" => false, "error" => "No se especificó acción"]);
    exit;
}

// --- ACCIÓN GUARDAR ---
if ($action === "guardar") {
    $p = $input['producto'];
    $id = $conn->real_escape_string($p['id']);
    $nombre = $conn->real_escape_string($p['nombre']);
    $descripcion = $conn->real_escape_string($p['descripcion']);
    $precio = $conn->real_escape_string($p['precio']);
    $imagen = $conn->real_escape_string($p['imagen']);

    // Comprobar ID duplicado
    $check = $conn->query("SELECT id FROM productos WHERE id='$id'");
    if ($check->num_rows > 0) {
        echo json_encode(["success" => false, "error" => "ID duplicado"]);
        exit;
    }

    // Insertar
    $sql = "INSERT INTO productos (id, nombre, descripcion, precio, imagen) VALUES ('$id', '$nombre', '$descripcion', '$precio', '$imagen')";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Producto guardado"]);
    } else {
        echo json_encode(["success" => false, "error" => "Error al guardar: " . $conn->error]);
    }
    exit;
}

// --- ACCIÓN BORRAR ---
if ($action === "borrar") {
    $id = $conn->real_escape_string($input['id']);
    $check = $conn->query("SELECT id FROM productos WHERE id='$id'");
    if ($check->num_rows === 0) {
        echo json_encode(["success" => false, "error" => "El producto no existe"]);
        exit;
    }

    if ($conn->query("DELETE FROM productos WHERE id='$id'") === TRUE) {
        echo json_encode(["success" => true, "message" => "Producto eliminado"]);
    } else {
        echo json_encode(["success" => false, "error" => "Error al borrar: " . $conn->error]);
    }
    exit;
}

echo json_encode(["success" => false, "error" => "Acción no reconocida"]);
?>
