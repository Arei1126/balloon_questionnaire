`use strict`
data = {
    "result": [0,0,0]
}


window.addEventListener("load", async ()=>{
    const Signal = document.createElement("div");

    Signal.addEventListener("choiced", (ev) => {
        print(ev.detail);
        alert(ev.detail);
    });


    const choices = document.querySelectorAll(".choice");
    for (const choice of choices){
        choice.addEventListener("pointerup", ()=>{
            const ev = new CustomEvent("choiced", {
                detail: choice.id 
            });
        })
    }
});
