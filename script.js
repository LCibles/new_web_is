// Las secciones existen en el mismo documento: JavaScript cambia su visibilidad.
const menuInicio = document.querySelector(".ocul");
const menuCafes = document.querySelector(".menu_coffe");
const cabeceraPrincipal = document.querySelector(".cabecera-principal");
const botonCafes = document.querySelector(".uno");
const botonVolver = document.querySelector(".volver");

// La tarjeta conserva sus medidas; quien se desplaza es el contenedor exterior.
const carruselCafes = document.querySelector(".carrusel-cafes");
const tarjetasCafes = Array.from(carruselCafes.querySelectorAll(".cuadro"));
const botonAnterior = document.querySelector(".cafe-anterior");
const botonSiguiente = document.querySelector(".cafe-siguiente");
const indicadorCafes = document.querySelector(".cafe-indicador");
let indiceCafe = 0;

function actualizarIndicador() {
    indicadorCafes.textContent = `${String(indiceCafe + 1).padStart(2, "0")} / ${String(tarjetasCafes.length).padStart(2, "0")}`;
    botonAnterior.disabled = indiceCafe === 0;
    botonSiguiente.disabled = indiceCafe === tarjetasCafes.length - 1;
}

function irACafe(nuevoIndice, animar = true) {
    indiceCafe = Math.max(0, Math.min(tarjetasCafes.length - 1, nuevoIndice));
    carruselCafes.scrollTo({
        left: indiceCafe * carruselCafes.clientWidth,
        behavior: animar ? "smooth" : "instant"
    });
    actualizarIndicador();
}

// El desplazamiento nativo responde al dedo; scroll-snap ajusta cada tarjeta.
// scrollend actualiza la posición después del gesto sin interferir con las flechas.
carruselCafes.addEventListener("scrollend", function () {
    if (!carruselCafes.clientWidth) return;
    const indiceVisible = Math.round(carruselCafes.scrollLeft / carruselCafes.clientWidth);
    if (indiceVisible !== indiceCafe) {
        indiceCafe = Math.max(0, Math.min(tarjetasCafes.length - 1, indiceVisible));
        actualizarIndicador();
    }
});

botonAnterior.addEventListener("click", function () {
    irACafe(indiceCafe - 1);
});

botonSiguiente.addEventListener("click", function () {
    irACafe(indiceCafe + 1);
});

carruselCafes.addEventListener("keydown", function (evento) {
    if (evento.key === "ArrowRight" || evento.key === "ArrowLeft") {
        evento.preventDefault();
        irACafe(indiceCafe + (evento.key === "ArrowRight" ? 1 : -1));
    }
});

// Permite arrastrar con el ratón, además del gesto táctil nativo.
let inicioArrastre = null;
carruselCafes.addEventListener("pointerdown", function (evento) {
    if (evento.pointerType !== "mouse" || evento.button !== 0) return;
    inicioArrastre = { x: evento.clientX, scroll: carruselCafes.scrollLeft };
    carruselCafes.classList.add("arrastrando");
    carruselCafes.setPointerCapture(evento.pointerId);
});

carruselCafes.addEventListener("pointermove", function (evento) {
    if (!inicioArrastre) return;
    carruselCafes.scrollLeft = inicioArrastre.scroll + inicioArrastre.x - evento.clientX;
});

function terminarArrastre() {
    inicioArrastre = null;
    carruselCafes.classList.remove("arrastrando");
}

carruselCafes.addEventListener("pointerup", terminarArrastre);
carruselCafes.addEventListener("pointercancel", terminarArrastre);
carruselCafes.addEventListener("lostpointercapture", terminarArrastre);

function mostrarVista(vista) {
    const mostrarCafes = vista === "cafes";

    // 'hidden' determina qué sección está visible.
    menuInicio.hidden = mostrarCafes;
    menuCafes.hidden = !mostrarCafes;
    cabeceraPrincipal.hidden = mostrarCafes;

    // Cada pantalla conserva su propio fondo.
    document.body.dataset.vista = mostrarCafes ? "cafes" : "inicio";

    // Entrar de nuevo en Cafés muestra el primer producto.
    if (mostrarCafes) irACafe(0, false);
}

botonCafes.addEventListener("click", function () {
    mostrarVista("cafes");
});

botonVolver.addEventListener("click", function () {
    mostrarVista("inicio");
});
