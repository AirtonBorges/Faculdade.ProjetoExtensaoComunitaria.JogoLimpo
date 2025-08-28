function dragOver(event: DragEvent) {
    event.preventDefault();
    if (event.target instanceof HTMLElement) {
        event.target.style.color = "blue";
    }
}

function stopDrop(event: DragEvent) {
    event.preventDefault();
    if (event.target instanceof HTMLElement) {
        event.target.style.color = "black";
    }
}

// function dropped(ev) {
//     ev.preventDefault();
//     var data = ev.dataTransfer.getData("Text");
//     //ev.target.appendChild(document.getElementById(data));
//     document.getElementById(data).style.display = "none";
//     ev.target.style.color = "green";
// }

function dragStart(event: DragEvent) {
    if (event.target instanceof HTMLElement) {
        event.dataTransfer?.setData("text/plain", event.target.id);
        event.target.style.color = "red";
    }
}

function dropped(event: DragEvent) {
    event.preventDefault();
    if (event.target instanceof HTMLElement) {
        const data = event.dataTransfer?.getData("text/plain");
        if (data) {
            const draggedElement = document.getElementById(data);
            if (draggedElement) {
                draggedElement.style.display = "none";
            }
        }
        event.target.style.color = "green";
    }
}
