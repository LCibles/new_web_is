// 1. Pantallas: el contenido sigue estando en un único documento HTML.
const menuInicio = document.querySelector(".ocul");
const menuCafes = document.querySelector(".menu_coffe");
const cabeceraPrincipal = document.querySelector(".cabecera-principal");
const botonCafes = document.querySelector(".uno");
const botonVolver = document.querySelector(".volver");

// 2. Carrusel circular: dos copias permiten unir el último y el primer producto.
const carruselCafes = document.querySelector(".carrusel-cafes");
const pistaCafes = document.querySelector(".pista-cafes");
const tarjetasOriginales = Array.from(pistaCafes.querySelectorAll(".cuadro"));
const botonAnterior = document.querySelector(".cafe-anterior");
const botonSiguiente = document.querySelector(".cafe-siguiente");
const indicadorCafes = document.querySelector(".cafe-indicador");
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

const clonAnterior = tarjetasOriginales[tarjetasOriginales.length - 1].cloneNode(true);
const clonSiguiente = tarjetasOriginales[0].cloneNode(true);
for (const clon of [clonAnterior, clonSiguiente]) {
    clon.setAttribute("aria-hidden", "true");
    clon.inert = true;
}
pistaCafes.prepend(clonAnterior);
pistaCafes.append(clonSiguiente);
const todasLasTarjetas = Array.from(pistaCafes.querySelectorAll(".cuadro"));

let posicionVisual = 1; // 0 = copia de la última; 1 = primer producto real.
let enMovimiento = false;
let arrastre = null;

function indiceReal() {
    return (posicionVisual - 1 + tarjetasOriginales.length) % tarjetasOriginales.length;
}

function distanciaTarjeta() {
    const estilo = getComputedStyle(pistaCafes);
    return tarjetasOriginales[0].getBoundingClientRect().width + parseFloat(estilo.columnGap || estilo.gap);
}

function desplazamientoCentrado() {
    const anchoTarjeta = tarjetasOriginales[0].getBoundingClientRect().width;
    return (carruselCafes.clientWidth - anchoTarjeta) / 2 - posicionVisual * distanciaTarjeta();
}

function dibujarCarrusel(desplazamientoExtra = 0) {
    if (!carruselCafes.clientWidth) return;
    pistaCafes.style.transform = "translate3d(" + (desplazamientoCentrado() + desplazamientoExtra) + "px, 0, 0)";
}

function actualizarEstado() {
    const real = indiceReal();
    todasLasTarjetas.forEach((tarjeta, indice) => {
        tarjeta.classList.toggle("es-activo", indice === posicionVisual);
    });
    indicadorCafes.textContent = String(real + 1).padStart(2, "0") + " / " + String(tarjetasOriginales.length).padStart(2, "0");
    // Ambas flechas siguen disponibles incluso en el primer y último producto.
}

function saltarSinAnimacion(posicion) {
    pistaCafes.classList.add("sin-transicion");
    posicionVisual = posicion;
    actualizarEstado();
    dibujarCarrusel();
    // Recolocamos instantáneamente la copia como su tarjeta original.
    void pistaCafes.offsetWidth;
    requestAnimationFrame(() => pistaCafes.classList.remove("sin-transicion"));
}

function finalizarMovimiento() {
    if (posicionVisual === 0) {
        saltarSinAnimacion(tarjetasOriginales.length);
    } else if (posicionVisual === tarjetasOriginales.length + 1) {
        saltarSinAnimacion(1);
    }
    enMovimiento = false;
}

function moverCarrusel(direccion) {
    if (enMovimiento || arrastre) return;
    enMovimiento = true;
    posicionVisual += direccion;
    actualizarEstado();
    dibujarCarrusel();
    if (reducirMovimiento.matches) finalizarMovimiento();
}

pistaCafes.addEventListener("transitionend", (evento) => {
    if (evento.target !== pistaCafes || evento.propertyName !== "transform") return;
    if (enMovimiento) finalizarMovimiento();
});

botonAnterior.addEventListener("click", () => moverCarrusel(-1));
botonSiguiente.addEventListener("click", () => moverCarrusel(1));

carruselCafes.addEventListener("keydown", (evento) => {
    if (evento.key === "ArrowRight" || evento.key === "ArrowLeft") {
        evento.preventDefault();
        moverCarrusel(evento.key === "ArrowRight" ? 1 : -1);
    }
});

// 3. El arrastre con ratón o dedo mueve la pista antes de encajar la tarjeta.
carruselCafes.addEventListener("pointerdown", (evento) => {
    if (enMovimiento || (evento.pointerType === "mouse" && evento.button !== 0)) return;
    arrastre = { id: evento.pointerId, x: evento.clientX, y: evento.clientY, delta: 0, activo: false };
    if (evento.pointerType === "mouse") carruselCafes.setPointerCapture(evento.pointerId);
});

carruselCafes.addEventListener("pointermove", (evento) => {
    if (!arrastre || evento.pointerId !== arrastre.id) return;
    const dx = evento.clientX - arrastre.x;
    if (!arrastre.activo && Math.abs(dx) < 7) return;
    if (!arrastre.activo && Math.abs(dx) < Math.abs(evento.clientY - arrastre.y)) return;
    arrastre.activo = true;
    arrastre.delta = dx;
    carruselCafes.classList.add("arrastrando");
    pistaCafes.classList.add("sin-transicion");
    dibujarCarrusel(dx);
});

function terminarArrastre(evento, cancelado = false) {
    if (!arrastre || evento.pointerId !== arrastre.id) return;
    const delta = arrastre.delta;
    const activo = arrastre.activo;
    arrastre = null;
    carruselCafes.classList.remove("arrastrando");
    // La transición continúa desde el punto donde se soltó el dedo.
    void pistaCafes.offsetWidth;
    pistaCafes.classList.remove("sin-transicion");
    if (!cancelado && activo && Math.abs(delta) > 42) {
        moverCarrusel(delta < 0 ? 1 : -1);
    } else {
        dibujarCarrusel();
    }
}

carruselCafes.addEventListener("pointerup", (evento) => terminarArrastre(evento));
carruselCafes.addEventListener("pointercancel", (evento) => terminarArrastre(evento, true));
carruselCafes.addEventListener("lostpointercapture", (evento) => terminarArrastre(evento, true));

// Al cambiar el tamaño de ventana, centramos de nuevo la tarjeta actual.
const observador = new ResizeObserver(() => {
    if (!carruselCafes.clientWidth || arrastre) return;
    if (enMovimiento) finalizarMovimiento();
    saltarSinAnimacion(posicionVisual);
});
observador.observe(carruselCafes);

function mostrarVista(vista) {
    const mostrarCafes = vista === "cafes";
    menuInicio.hidden = mostrarCafes;
    menuCafes.hidden = !mostrarCafes;
    cabeceraPrincipal.hidden = mostrarCafes;
    document.body.dataset.vista = mostrarCafes ? "cafes" : "inicio";
    if (mostrarCafes) {
        enMovimiento = false;
        arrastre = null;
        saltarSinAnimacion(1);
    }
}

botonCafes.addEventListener("click", () => mostrarVista("cafes"));
botonVolver.addEventListener("click", () => mostrarVista("inicio"));
