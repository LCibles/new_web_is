const coffe = document.querySelector(".uno");
const menu_coffe = document.querySelector(".menu_coffe")
const oculta_all = document.querySelector(".ocul")



coffe.addEventListener("click", function () {
    oculta_all.hidden = true
    menu_coffe.hidden = false
    
})
