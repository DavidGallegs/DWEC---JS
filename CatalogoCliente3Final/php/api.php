<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Permite peticiones externas si es necesario

// 1. Configuración de la Base de Datos
$host = "fdb1032.awardspace.net"; 
$db_name = "4717043_catalogov3";
$username = "4717043_catalogov3";
$password = "H?]h.+h**2leBUds";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["success" => false, "error" => "Error de conexión: " . $e->getMessage()]);
    exit;
}

// 2. Manejo de Acciones
$action = $_GET['action'] ?? '';

// --- ACCIÓN: GUARDAR ---
if ($action === 'guardar') {
    // Recibir datos JSON del fetch
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id']) || !isset($data['name']) || !isset($data['precio'])) {
        echo json_encode(["success" => false, "error" => "Datos incompletos"]);
        exit;
    }

    try {
        // Validación asíncrona: ID Duplicado 
        $checkStmt = $conn->prepare("SELECT id FROM productos WHERE id = ?");
        $checkStmt->execute([$data['id']]);
        
        if ($checkStmt->rowCount() > 0) {
            echo json_encode(["success" => false, "error" => "Error: El ID ya está registrado en la base de datos"]); 
        } else {
            // Insertar producto
            $stmt = $conn->prepare("INSERT INTO productos (id, name, description, precio, imagen) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['id'], $data['name'], $data['desc'], $data['precio'], $data['imagen']]);
            echo json_encode(["success" => true, "message" => "Producto guardado con éxito"]); 
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error SQL: " . $e->getMessage()]);
    }
}

// --- ACCIÓN: BORRAR ---
elseif ($action === 'borrar') { // [cite: 70]
    $id = $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "error" => "Falta el ID"]);
        exit;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM productos WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Producto borrado con éxito"]);
        } else {
            echo json_encode(["success" => false, "error" => "Producto no encontrado"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "error" => "Error al borrar: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Acción no válida"]);
}
?>