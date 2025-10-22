const readline = require('readline');

// ===================================================================================
// 1. CONFIGURACIÓN INICIAL Y DATOS BASE
// ===================================================================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Base de datos de ejemplo (Hardcoded Data)
const estudiantes = [
    { id: 1, nombre: "Ana García", grado: 9, librosPrestados: 0, multas: 0.00, activo: true },
    { id: 2, nombre: "Carlos Ruiz", grado: 7, librosPrestados: 3, multas: 15.00, activo: true },
    { id: 3, nombre: "María López", grado: 9, librosPrestados: 0, multas: 0.00, activo: true },
    { id: 4, nombre: "José Martínez", grado: 8, librosPrestados: 1, multas: 50.00, activo: false }
];

const libros = [
    { codigo: "L001", titulo: "Cien años de soledad", disponible: true, categoria: "ficcion" },
    { codigo: "L002", titulo: "El principito", disponible: false, categoria: "ficcion" },
    { codigo: "L003", titulo: "Química básica", disponible: true, categoria: "academico" },
    { codigo: "L004", titulo: "Historia de El Salvador", disponible: true, categoria: "academico" },
    { codigo: "L005", titulo: "Don Quijote", disponible: true, categoria: "ficcion" }
];

let prestamos = [
    { 
        id: 1, 
        estudianteId: 2, 
        libroCodigo: "L002", 
        fechaPrestamo: new Date(2025, 9, 3), // Oct 3, 2025
        fechaLimite: new Date(2025, 9, 10), // Oct 10, 2025
        devuelto: false, 
        fechaDevolucion: null 
    }
    // Nota: El estudiante con ID 2 ya tiene 3 libros prestados según el JSON de estudiantes
];

let nextPrestamoId = prestamos.length > 0 ? prestamos[prestamos.length - 1].id + 1 : 1;

// ===================================================================================
// 2. REGLAS DE NEGOCIO Y UTILIDADES DE DATOS
// ===================================================================================

/**
 * Define el límite de libros que un estudiante puede tomar prestado según su grado.
 * @param {number} grado - El grado del estudiante.
 * @returns {number} El límite máximo de libros.
 */
function obtenerLimiteLibros(grado) {
    if (grado >= 8 && grado <= 9) {
        return 2;
    } else if (grado === 7) {
        return 3;
    } else if (grado === 6) {
        return 4;
    } else {
        return 0; // Otros grados o no especificado
    }
}

/**
 * Busca un estudiante por ID.
 * @param {string | number} id - El ID del estudiante.
 * @returns {object | null} El objeto estudiante o null si no se encuentra.
 */
function buscarEstudiante(id) {
    return estudiantes.find(e => e.id === parseInt(id));
}

/**
 * Busca un libro por código.
 * @param {string} codigo - El código del libro.
 * @returns {object | null} El objeto libro o null si no se encuentra.
 */
function buscarLibro(codigo) {
    const codigoMayus = codigo.toUpperCase();
    return libros.find(l => l.codigo === codigoMayus);
}

// ===================================================================================
// 3. FUNCIONES AUXILIARES (I/O)
// ===================================================================================

/** Limpia la consola. */
function limpiarPantalla() {
    process.stdout.write('\u001b[2J\u001b[0;0H'); // Secuencia ANSI para limpiar
}

/**
 * Pausa la ejecución hasta que el usuario presione ENTER.
 * @returns {Promise<void>}
 */
function pausar() {
    return new Promise(resolve => {
        rl.question('\nPresione ENTER para continuar...', () => {
            resolve();
        });
    });
}

/**
 * Muestra un encabezado formateado.
 * @param {string} titulo - El título a mostrar.
 */
function mostrarEncabezado(titulo) {
    const separador = "═".repeat(50);
    console.log('\n' + separador);
    console.log(` ${titulo}`);
    console.log(separador + '\n');
}

/**
 * Realiza una pregunta al usuario y devuelve la respuesta.
 * @param {string} texto - El texto de la pregunta.
 * @returns {Promise<string>} La respuesta del usuario.
 */
function pregunta(texto) {
    return new Promise(resolve => {
        rl.question(`➤ ${texto}: `, (respuesta) => {
            resolve(respuesta.trim());
        });
    });
}

/**
 * Convierte un objeto Date a formato 'D/M/AAAA'.
 * @param {Date} date - Objeto Date.
 * @returns {string} Fecha formateada.
 */
function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// ===================================================================================
// 4. FUNCIONES PRINCIPALES DEL MENÚ
// ===================================================================================

/**
 * Opción [1]: Muestra el listado tabular de estudiantes.
 */
async function verEstudiantes() {
    limpiarPantalla();
    mostrarEncabezado("LISTA DE ESTUDIANTES");

    // Definición de columnas y anchos (para alineación)
    const cols = { id: 4, nombre: 25, grado: 8, libros: 6, multas: 8, estado: 8 };

    // Cabecera de la tabla
    console.log(
        'ID'.padEnd(cols.id) + 
        '| ' + 'Nombre'.padEnd(cols.nombre) + 
        '| ' + 'Grado'.padEnd(cols.grado) + 
        '| ' + 'Libros'.padEnd(cols.libros) + 
        '| ' + 'Multas'.padEnd(cols.multas) + 
        '| ' + 'Estado'
    );
    console.log('-'.repeat(cols.id + 2 + cols.nombre + 2 + cols.grado + 2 + cols.libros + 2 + cols.multas + 2 + cols.estado));

    // Filas de datos
    estudiantes.forEach(e => {
        const multasStr = `$${e.multas.toFixed(2)}`;
        const estadoStr = e.activo ? 'Activo' : 'Inactivo';
        
        console.log(
            String(e.id).padEnd(cols.id) + 
            '| ' + e.nombre.padEnd(cols.nombre) + 
            '| ' + (`${e.grado}°`).padEnd(cols.grado) + 
            '| ' + String(e.librosPrestados).padEnd(cols.libros) + 
            '| ' + multasStr.padEnd(cols.multas) + 
            '| ' + estadoStr
        );
    });

    await pausar();
}

/**
 * Opción [2]: Muestra todo el catálogo de libros.
 */
async function verCatalogoDeLibros() {
    limpiarPantalla();
    mostrarEncabezado("CATÁLOGO DE LIBROS");

    const cols = { codigo: 8, titulo: 40, categoria: 15, estado: 12 };

    console.log(
        'Código'.padEnd(cols.codigo) + 
        '| ' + 'Título'.padEnd(cols.titulo) + 
        '| ' + 'Categoría'.padEnd(cols.categoria) + 
        '| ' + 'Estado'
    );
    console.log('-'.repeat(cols.codigo + 2 + cols.titulo + 2 + cols.categoria + 2 + cols.estado));

    libros.forEach(l => {
        const estadoStr = l.disponible ? 'Disponible' : 'Prestado';
        console.log(
            l.codigo.padEnd(cols.codigo) + 
            '| ' + l.titulo.padEnd(cols.titulo) + 
            '| ' + l.categoria.padEnd(cols.categoria) + 
            '| ' + estadoStr
        );
    });

    await pausar();
}

/**
 * Opción [3]: Muestra solo los libros disponibles.
 */
async function verLibrosDisponibles() {
    limpiarPantalla();
    mostrarEncabezado("LIBROS DISPONIBLES");

    const disponibles = libros.filter(l => l.disponible);
    
    if (disponibles.length === 0) {
        console.log("No hay libros disponibles en este momento.");
    } else {
        disponibles.forEach(l => {
            console.log(`${l.codigo}: ${l.titulo} (Categoría: ${l.categoria})`);
        });
        console.log('\nTotal de libros disponibles: ' + disponibles.length);
    }

    await pausar();
}

/**
 * Opción [4]: Revisa el estado de un estudiante.
 */
async function revisarEstadoEstudiante() {
    limpiarPantalla();
    mostrarEncabezado("REVISAR ESTADO DE ESTUDIANTE");

    const idStr = await pregunta("Ingrese el ID del estudiante (o 0 para cancelar)");
    const id = parseInt(idStr);

    if (id === 0) return;

    const estudiante = buscarEstudiante(id);

    if (!estudiante) {
        console.log('\nError: Estudiante con ID ' + id + ' no encontrado.');
        await pausar();
        return;
    }

    const limite = obtenerLimiteLibros(estudiante.grado);
    const cupoDisponible = limite - estudiante.librosPrestados;
    
    // Validaciones
    let puedeSolicitar = true;
    let motivo = "SÍ puede solicitar préstamo.";

    if (!estudiante.activo) {
        puedeSolicitar = false;
        motivo = "NO puede solicitar préstamo. Motivo: Cuenta Inactiva.";
    } else if (estudiante.multas > 0) {
        puedeSolicitar = false;
        motivo = "NO puede solicitar préstamo. Motivo: Tiene multas pendientes.";
    } else if (cupoDisponible <= 0) {
        puedeSolicitar = false;
        motivo = "NO puede solicitar préstamo. Motivo: Ha alcanzado el límite de libros.";
    }

    // Información General
    console.log("\nINFORMACIÓN DEL ESTUDIANTE");
    console.log('ID: ' + estudiante.id);
    console.log('Nombre: ' + estudiante.nombre);
    console.log('Grado: ' + estudiante.grado + '°');
    console.log('Estado de cuenta: ' + (estudiante.activo ? 'Activo' : 'Inactivo'));

    // Información de Préstamos
    console.log("\nINFORMACIÓN DE PRÉSTAMOS");
    console.log('Límite de libros por grado: ' + limite);
    console.log('Libros prestados: ' + estudiante.librosPrestados + ' de ' + limite);
    console.log('Capacidad disponible: ' + cupoDisponible + ' libro(s)');
    
    // Información Financiera
    console.log("\nINFORMACIÓN FINANCIERA");
    console.log('Multas: $' + estudiante.multas.toFixed(2));
    console.log('Estado: ' + (estudiante.multas > 0 ? 'CON MULTA' : 'AL DÍA'));

    // Estado de Solicitud
    console.log("\nESTADO DE SOLICITUD:");
    console.log(motivo);

    // Préstamos activos
    const prestamosActivos = prestamos.filter(p => p.estudianteId === id && !p.devuelto);
    console.log("\nPRÉSTAMOS ACTIVOS:");
    
    if (prestamosActivos.length === 0) {
        console.log("No tiene préstamos activos.");
    } else {
        prestamosActivos.forEach(p => {
            const libro = buscarLibro(p.libroCodigo);
            console.log('- ID #' + p.id + ': ' + (libro ? libro.titulo : p.libroCodigo));
            console.log(`  Prestado: ${formatDate(p.fechaPrestamo)} | Vence: ${formatDate(p.fechaLimite)}`);
        });
    }

    await pausar();
}

/**
 * Opción [5]: Revisa el estado de un libro.
 */
async function revisarEstadoLibro() {
    limpiarPantalla();
    mostrarEncabezado("REVISAR ESTADO DE LIBRO");

    const codigo = await pregunta("Ingrese el código del libro (o 0 para cancelar)");

    if (codigo === '0') return;

    const libro = buscarLibro(codigo);

    if (!libro) {
        console.log('\nError: Libro con código ' + codigo + ' no encontrado.');
        await pausar();
        return;
    }

    console.log("\nINFORMACIÓN DEL LIBRO");
    console.log('Código: ' + libro.codigo);
    console.log('Título: ' + libro.titulo);
    console.log('Categoría: ' + libro.categoria);
    console.log('Estado: ' + (libro.disponible ? 'DISPONIBLE' : 'PRESTADO'));

    if (!libro.disponible) {
        // Buscar el préstamo activo de este libro
        const prestamoActivo = prestamos.find(p => p.libroCodigo === libro.codigo && !p.devuelto);
        if (prestamoActivo) {
            const estudiante = buscarEstudiante(prestamoActivo.estudianteId);
            console.log('\nINFORMACIÓN DEL PRÉSTAMO');
            console.log('Prestado a: ' + estudiante.nombre + ' (ID: ' + estudiante.id + ')');
            console.log('Fecha límite de devolución: ' + formatDate(prestamoActivo.fechaLimite));
        }
    }

    await pausar();
}

/**
 * Opción [6]: Realiza un nuevo préstamo.
 */
async function realizarPrestamo() {
    limpiarPantalla();
    mostrarEncabezado("REALIZAR PRÉSTAMO");

    // 1. Seleccionar Estudiante
    console.log("ESTUDIANTES REGISTRADOS:");
    estudiantes.forEach(e => {
        console.log('ID ' + e.id + ': ' + e.nombre + ' - ' + e.grado + '° grado - ' + (e.activo ? 'Activo' : 'Inactivo'));
    });
    const idStr = await pregunta("Ingrese el ID del estudiante (o 0 para cancelar)");
    const estudianteId = parseInt(idStr);

    if (estudianteId === 0) return;

    const estudiante = buscarEstudiante(estudianteId);

    if (!estudiante) {
        console.log("\nError: Estudiante no encontrado.");
        await pausar();
        return;
    }
    console.log('Estudiante encontrado: ' + estudiante.nombre);

    // 2. Seleccionar Libro
    const librosDisponibles = libros.filter(l => l.disponible);
    if (librosDisponibles.length === 0) {
        console.log("\nError: No hay libros disponibles para préstamo.");
        await pausar();
        return;
    }

    console.log("\nLIBROS DISPONIBLES:");
    librosDisponibles.forEach(l => {
        console.log(`${l.codigo}: ${l.titulo} [${l.categoria}]`);
    });
    const codigo = await pregunta("Ingrese el código del libro (o 0 para cancelar)");

    if (codigo === '0') return;

    const libro = buscarLibro(codigo);

    if (!libro || !libro.disponible) {
        console.log("\nError: Libro no encontrado o no está disponible.");
        await pausar();
        return;
    }
    console.log('Libro encontrado: ' + libro.titulo);

    // 3. Validar Reglas de Préstamo
    console.log("\nVALIDANDO PRÉSTAMO...");
    const limite = obtenerLimiteLibros(estudiante.grado);
    const cupoDisponible = limite - estudiante.librosPrestados;

    let validacionOk = true;

    if (!estudiante.activo) {
        console.log("✗ Estudiante tiene cuenta INACTIVA.");
        validacionOk = false;
    } else {
        console.log("✓ Estudiante tiene cuenta activa.");
    }

    if (estudiante.multas > 0) {
        console.log('✗ Estudiante tiene multas pendientes: $' + estudiante.multas.toFixed(2) + '.');
        validacionOk = false;
    } else {
        console.log("✓ Estudiante no tiene multas pendientes.");
    }

    if (cupoDisponible <= 0) {
        console.log('✗ Estudiante ha alcanzado el límite de libros (' + limite + ').');
        validacionOk = false;
    } else {
        console.log('✓ Estudiante puede llevar más libros (' + estudiante.librosPrestados + '/' + limite + ').');
    }

    if (!libro.disponible) {
        console.log("✗ Libro no está disponible (ESTO NO DEBERÍA OCURRIR).");
        validacionOk = false;
    } else {
        console.log("✓ Libro está disponible.");
    }

    if (!validacionOk) {
        console.log("\nPRÉSTAMO CANCELADO. El estudiante o libro no cumplen las condiciones.");
        await pausar();
        return;
    }

    // 4. Confirmar y Registrar
    const confirmar = await pregunta("¿Confirmar préstamo? (S/N)");
    if (confirmar.toUpperCase() !== 'S') {
        console.log("\nPréstamo cancelado por el usuario.");
        await pausar();
        return;
    }

    // Calcular fechas
    const fechaPrestamo = new Date();
    const fechaLimite = new Date(fechaPrestamo);
    fechaLimite.setDate(fechaPrestamo.getDate() + 7);

    // Nuevo préstamo
    const nuevoPrestamo = {
        id: nextPrestamoId++,
        estudianteId: estudiante.id,
        libroCodigo: libro.codigo,
        fechaPrestamo: fechaPrestamo,
        fechaLimite: fechaLimite,
        devuelto: false,
        fechaDevolucion: null
    };

    prestamos.push(nuevoPrestamo);

    // Actualizar estados
    estudiante.librosPrestados += 1;
    libro.disponible = false;

    // Resumen
    console.log("\nPRÉSTAMO REALIZADO EXITOSAMENTE");
    console.log("\nPRÉSTAMO REALIZADO EXITOSAMENTE");
    console.log('ID Préstamo: #' + nuevoPrestamo.id);
    console.log('Estudiante: ' + estudiante.nombre);
    console.log('Libro: ' + libro.titulo);
    console.log('Fecha de préstamo: ' + formatDate(fechaPrestamo));
    console.log('Fecha límite de devolución: ' + formatDate(fechaLimite));
    console.log('Libros actuales del estudiante: ' + estudiante.librosPrestados + '/' + limite);
    console.log("\nIMPORTANTE: Devolver el libro antes de la fecha límite para evitar multas de $2.00 por día de retraso.");

    await pausar();
}

/**
 * Opción [7]: Procesa la devolución de un libro.
 */
async function devolverLibro() {
    limpiarPantalla();
    mostrarEncabezado("DEVOLVER LIBRO");

    const prestamosActivos = prestamos.filter(p => !p.devuelto);

    if (prestamosActivos.length === 0) {
        console.log("No hay préstamos activos pendientes de devolución.");
        await pausar();
        return;
    }

    // Listar préstamos activos
    console.log("PRÉSTAMOS ACTIVOS:");
    prestamosActivos.forEach(p => {
        const estudiante = buscarEstudiante(p.estudianteId);
        const libro = buscarLibro(p.libroCodigo);
        console.log('ID: ' + p.id + ' | ' + estudiante.nombre + ' | ' + (libro ? libro.titulo : p.libroCodigo));
        console.log(`  Prestado: ${formatDate(p.fechaPrestamo)} | Vence: ${formatDate(p.fechaLimite)}`);
        console.log('---');
    });

    const idStr = await pregunta("Ingrese el ID del préstamo a devolver (o 0 para cancelar)");
    const prestamoId = parseInt(idStr);

    if (prestamoId === 0) return;

    const prestamo = prestamosActivos.find(p => p.id === prestamoId);

    if (!prestamo) {
        console.log('\nError: Préstamo activo con ID ' + prestamoId + ' no encontrado.');
        await pausar();
        return;
    }

    const estudiante = buscarEstudiante(prestamo.estudianteId);
    const libro = buscarLibro(prestamo.libroCodigo);
    const fechaDevolucion = new Date();
    const fechaLimite = prestamo.fechaLimite;

    // Calcular días de retraso
    // Convertir fechas a medianoche para una comparación precisa de días
    const limiteDia = new Date(fechaLimite.getFullYear(), fechaLimite.getMonth(), fechaLimite.getDate());
    const devolucionDia = new Date(fechaDevolucion.getFullYear(), fechaDevolucion.getMonth(), fechaDevolucion.getDate());

    const diffTime = devolucionDia - limiteDia;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Diferencia en días

    let diasRetraso = 0;
    if (diffDays > 0) {
        diasRetraso = diffDays;
    }

    const multaPorDia = 2.00;
    const multaTotal = diasRetraso * multaPorDia;

    // Mostrar resumen de devolución
    console.log("\nINFORMACIÓN DE LA DEVOLUCIÓN");
    console.log('Estudiante: ' + estudiante.nombre);
    console.log('Libro: ' + libro.titulo);
    console.log('Fecha límite: ' + formatDate(fechaLimite));
    console.log('Fecha de devolución (HOY): ' + formatDate(fechaDevolucion));
    
    if (diasRetraso > 0) {
        console.log('Días de retraso: ' + diasRetraso + ' día(s)');
        console.log('Multa a aplicar: $' + multaTotal.toFixed(2) + ' ($' + multaPorDia.toFixed(2) + ' por día)');
    } else {
        console.log("Devolución procesada A TIEMPO.");
    }

    const confirmar = await pregunta("¿Confirmar devolución? (S/N)");
    if (confirmar.toUpperCase() !== 'S') {
        console.log("\nDevolución cancelada por el usuario.");
        await pausar();
        return;
    }

    // 4. Actualizar estados
    prestamo.devuelto = true;
    prestamo.fechaDevolucion = fechaDevolucion;

    libro.disponible = true;

    estudiante.librosPrestados -= 1;
    estudiante.multas += multaTotal;
    
    if (estudiante.multas > 0) {
        // En un sistema real, un estudiante con multa > 0 debe volverse 'inactivo' para nuevos préstamos
        // Aunque el requerimiento dice "Estudiantes Inactivos o con multas >$0 no pueden solicitar nuevos préstamos", 
        // no dice que la multa los ponga Inactivos. Solo se actualiza la multa.
    }
    
    if (multaTotal > 0) {
        console.log('\nDEVOLUCIÓN PROCESADA CON MULTA');
        console.log('Multa de $' + multaTotal.toFixed(2) + ' aplicada al estudiante.');
        console.log('Saldo de multas del estudiante: $' + estudiante.multas.toFixed(2) + '.');
    } else {
        console.log('\nDEVOLUCIÓN PROCESADA A TIEMPO. No se generaron multas.');
    }
    
    await pausar();
}

/**
 * Opción [8]: Muestra el historial completo de préstamos.
 */
async function verHistorialDePrestamos() {
    limpiarPantalla();
    mostrarEncabezado("HISTORIAL DE PRÉSTAMOS");

    console.log('\nTotal de préstamos registrados: ' + prestamos.length + '\n');

    if (prestamos.length === 0) {
        console.log("No hay préstamos registrados.");
    } else {
        prestamos.forEach(p => {
            const estudiante = buscarEstudiante(p.estudianteId);
            const libro = buscarLibro(p.libroCodigo);
            const estadoStr = p.devuelto ? 'Devuelto' : 'Pendiente';

            console.log('Préstamo #' + p.id);
            console.log(`  Estudiante: ${estudiante.nombre} (ID: ${estudiante.id})`);
            console.log(`  Libro: ${libro.titulo} (${libro.codigo})`);
            console.log(`  Fecha de préstamo: ${formatDate(p.fechaPrestamo)}`);
            console.log(`  Fecha límite: ${formatDate(p.fechaLimite)}`);
            if (p.devuelto) {
                console.log(`  Fecha de devolución: ${formatDate(p.fechaDevolucion)}`);
            }
            console.log(`  Estado: ${estadoStr}`);
            console.log('---');
        });
    }

    await pausar();
}

// ===================================================================================
// 5. FLUJO PRINCIPAL Y MENÚ
// ===================================================================================

/** Muestra el menú y maneja la navegación. */
async function menuPrincipal() {
    let salir = false;

    while (!salir) {
        limpiarPantalla();
        const titulo = "📚 SISTEMA DE GESTIÓN DE BIBLIOTECA";
        console.log("\n" + "=".repeat(titulo.length + 4));
        console.log(` ${titulo} `);
        console.log("=".repeat(titulo.length + 4) + "\n");
        console.log("[1] Ver estudiantes");
        console.log("[2] Ver catálogo de libros");
        console.log("[3] Ver libros disponibles");
        console.log("[4] Revisar estado de estudiante");
        console.log("[5] Revisar estado de libro");
        console.log("[6] Realizar préstamo");
        console.log("[7] Devolver libro");
        console.log("[8] Ver historial de préstamos");
        console.log("[0] Salir del sistema");

        const opcion = await pregunta("Seleccione una opción");

        switch (opcion) {
            case '1':
                await verEstudiantes();
                break;
            case '2':
                await verCatalogoDeLibros();
                break;
            case '3':
                await verLibrosDisponibles();
                break;
            case '4':
                await revisarEstadoEstudiante();
                break;
            case '5':
                await revisarEstadoLibro();
                break;
            case '6':
                await realizarPrestamo();
                break;
            case '7':
                await devolverLibro();
                break;
            case '8':
                await verHistorialDePrestamos();
                break;
            case '0':
                salir = true;
                break;
            default:
                console.log('\nOpción inválida: ' + opcion + '. Intente de nuevo.');
                await pausar();
                break;
        }
    }

    console.log("\nGracias por usar el Sistema de Gestión de Biblioteca. ¡Adiós!");
    rl.close();
}

/** Inicia la aplicación de consola. */
async function iniciar() {
    limpiarPantalla();
    console.log("=========================================");
    console.log(" SISTEMA DE GESTIÓN DE BIBLIOTECA ESCOLAR");
    console.log(" Versión 1.0");
    console.log("=========================================");
    await pausar();
    await menuPrincipal();
}

iniciar();