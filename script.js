// Las secciones existen en el mismo documento: JavaScript cambia su visibilidad.
const menuInicio = document.querySelector(".ocul");
const menuCafes = document.querySelector(".menu_coffe");
const cabeceraPrincipal = document.querySelector(".cabecera-principal");
const botonCafes = document.querySelector(".uno");
const botonVolver = document.querySelector(".volver");

function mostrarVista(vista) {
    const mostrarCafes = vista === "cafes";

    // 'hidden' controla si cada pantalla participa en la distribución Flexbox.
    menuInicio.hidden = mostrarCafes;
    menuCafes.hidden = !mostrarCafes;
    cabeceraPrincipal.hidden = mostrarCafes;

    // El atributo data-vista permite asignar un ambiente de color a cada pantalla.
    document.body.dataset.vista = mostrarCafes ? "cafes" : "inicio";
}

// Se pasa la función como callback: se ejecuta al hacer clic.
botonCafes.addEventListener("click", function () {
    mostrarVista("cafes");
});

botonVolver.addEventListener("click", function () {
    mostrarVista("inicio");
});
