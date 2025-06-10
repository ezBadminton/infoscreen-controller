const helpDialog = document.querySelector("#help-dialog")
const helpButton = document.querySelector(".help-button")
const helpCloseButton = document.querySelector("#help-dialog button")

helpButton.addEventListener("click", () => {
    helpDialog.showModal();
});

helpCloseButton.addEventListener("click", () => {
    helpDialog.close();
});

helpDialog.addEventListener("click", (e) => {
    if(e.target.id === "help-dialog") {
        helpDialog.close();
    }
});