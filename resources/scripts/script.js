`use strict`
const DEMO_ADD_MANY = 10;
const ANSWER_STATUS_VOTED = "あなたは回答済み";
const ANSWER_STATUS_UNVOTED = "あなたは未回答";

class server {	// phpによるバックエンドの代替
	constructor(){
		this.data = {
			"result": [0,0,0]
		};
	}

	vote(choice){
		if(0 <= choice <= 2){
			this.data.result[choice] += 1;
		}
	}

	readAll(){
		return this.data["result"]
	}

	clearAll(){
		this.data["result"] = [0,0,0]
	}

}


const Data = {	// グローバル変数
	"answered": false,
	"result": [0,0,0]
}


function getRandomInt(min, max) {
    // 最小値と最大値を整数に変換
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function num(str) {	
	// foo-bar-123 から123を返す
	const parts = str.split('-');
	const lastPart = parts[parts.length - 1];
	const number = Number(lastPart);
	if (!isNaN(number)) {
		return number;
	} else {
		return null;
	}
}

window.addEventListener("load", async ()=>{	

	// 必要なDOM要素
	const control_add = document.querySelector("#control-add");
	const control_reset = document.querySelector("#control-reset");
	const control_addmany = document.querySelector("#control-addmany");

	const instruction_0 = document.querySelector("#instruction-0")
	const instruction_1 = document.querySelector("#instruction-1")
	const answer_status = document.querySelector("#answer-status")

	const results = document.querySelectorAll(".result");

	const choices = document.querySelectorAll(".choice");
	
	const Server = new server()	// バックエンドの代わり
	
	const Signal = document.createElement("div");	// 様々なイベントを仲介する

	Signal.addEventListener("choiced", (ev) => {	
		// 回答操作を受けた
		console.log(ev.detail);
		if(!Data["answered"]){
			Server.vote(ev.detail);
			answer_status.innerText = ANSWER_STATUS_VOTED;
			Data.answered = true;
		}
	});

	Signal.addEventListener("restAll",()=>{
		// 画面上の風船をリセットする処理もひつよう
		Server.clearAll();
		Data.answered = false;
		answer_status.innerText = ANSWER_STATUS_UNVOTED;
		Data.result = [0,0,0]
		for (const result of results){
			const counter = result.querySelector(".result-counter");
			counter.innerText = 0;
		};
	});

	Signal.addEventListener("add",()=>{
		// 一人がもう一度回答することができるようにする処理
		// なにか、画面上の風船をリセットする処理もひつよう
		Data.answered = false;
		answer_status.innerText = ANSWER_STATUS_UNVOTED;
	});
	
	Signal.addEventListener("addMany",()=>{
		// デモ用に回答をたくさん追加する処理
		for (let i = 0; i < DEMO_ADD_MANY; i++){
			Server.vote(getRandomInt(0, 2));
		}
	});

	Signal.addEventListener("voteAdded", (ev)=>{
		// 画面更新用
		// 回答を追加する処理
		const counter = results[ev.detail.choice].querySelector(".result-counter");
		counter.innerText = Number(counter.innerText) + Number(ev.detail.diff);
	});



	for (const choice of choices){
		choice.addEventListener("pointerup", ()=>{
			const ev = new CustomEvent("choiced", {
				detail: num(choice.id) 
			});
			Signal.dispatchEvent(ev);
		});
	};

	control_reset.addEventListener("pointerup", ()=>{
		const ev = new CustomEvent("restAll", {});
		Signal.dispatchEvent(ev);
	});

	control_add.addEventListener("pointerup", ()=>{
		const ev = new CustomEvent("add", {});
		Signal.dispatchEvent(ev);
	});

	control_addmany.addEventListener("pointerup", ()=>{
		const ev = new CustomEvent("addMany", {});
		Signal.dispatchEvent(ev);
	});

	async function update(){
		const serverData = Server.readAll();
		for (let i = 0; i < Data.result.length; i++){
			if(Data.result[i] == serverData[i]){
				continue;
			}
			else {
				const diff = serverData[i] - Data.result[i]

					const ev = new CustomEvent("voteAdded", {
						detail: {
							"choice": i,
							"diff": diff
						}
					});
					Signal.dispatchEvent(ev);
				Data.result[i] = serverData[i]
			}
			
		}

		window.requestAnimationFrame(update)
	}

	await update()

});
