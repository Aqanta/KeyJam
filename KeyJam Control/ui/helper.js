function openModal(modal){
    document.getElementById(`${modal}Modal`).classList.add("is-active");
}
function closeModal(modal){
    document.getElementById(`${modal}Modal`).classList.remove("is-active");
}

function getKeyTagClass(type){
    switch ( type ){
        case "modifier":
            return "is-warning";
        case "non-printing":
            return "is-primary"
        case "control":
            return "is-info"
        case "printing":
            return "is-success"
    }
}